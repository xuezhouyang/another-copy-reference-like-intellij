import * as vscode from 'vscode';
import { CacheEntry } from '../types';
import { TelemetryReporter, TelemetryEvents } from './telemetry';

/**
 * Eviction strategies for cache management
 */
export enum EvictionStrategy {
    LRU = 'lru',        // Least Recently Used
    LFU = 'lfu',        // Least Frequently Used
    FIFO = 'fifo',      // First In First Out
    ADAPTIVE = 'adaptive' // Adaptive strategy based on usage patterns
}

/**
 * Cache statistics for monitoring
 */
interface CacheStatistics {
    hits: number;
    misses: number;
    evictions: number;
    currentSize: number;
    maxSize: number;
    averageAge: number;
    hitRate: number;
}

/**
 * Enhanced cache entry with more metadata
 */
class EnhancedCacheEntry extends CacheEntry {
    public lastAccessTime: Date;
    public createdTime: Date;
    public sizeInBytes: number;
    public priority: number;

    constructor(
        documentUri: string,
        documentVersion: number,
        symbols: vscode.DocumentSymbol[]
    ) {
        super(documentUri, documentVersion, symbols);
        this.lastAccessTime = new Date();
        this.createdTime = new Date();
        this.sizeInBytes = this.estimateSize(symbols);
        this.priority = 1;
    }

    touch(): void {
        super.touch();
        this.lastAccessTime = new Date();
    }

    /**
     * Calculate priority score for adaptive eviction
     */
    calculatePriority(): number {
        const age = Date.now() - this.createdTime.getTime();
        const recency = Date.now() - this.lastAccessTime.getTime();
        const frequency = this.accessCount;

        // Weighted scoring: frequency > recency > age
        const frequencyWeight = 0.5;
        const recencyWeight = 0.3;
        const ageWeight = 0.2;

        // Normalize values (inverse for recency and age, as lower is better)
        const frequencyScore = frequency;
        const recencyScore = 1 / (1 + recency / 1000); // In seconds
        const ageScore = 1 / (1 + age / 1000);

        this.priority =
            frequencyScore * frequencyWeight +
            recencyScore * recencyWeight +
            ageScore * ageWeight;

        return this.priority;
    }

    /**
     * Estimate memory size of symbols
     */
    private estimateSize(symbols: vscode.DocumentSymbol[]): number {
        // Rough estimation: 100 bytes per symbol
        return symbols.length * 100;
    }
}

/**
 * Advanced cache manager with optimized eviction strategies
 */
export class CacheManager {
    private static instance: CacheManager;
    private cache = new Map<string, EnhancedCacheEntry>();
    private statistics: CacheStatistics;
    private maxCacheSize: number = 50;
    private maxMemorySize: number = 10 * 1024 * 1024; // 10MB in bytes
    private currentMemoryUsage = 0;
    private cacheTimeout: number = 300000; // 5 minutes
    private evictionStrategy: EvictionStrategy = EvictionStrategy.ADAPTIVE;
    private cleanupInterval?: NodeJS.Timeout;
    private telemetry: TelemetryReporter;

    private constructor() {
        // Load configuration
        this.loadConfiguration();

        // Initialize statistics
        this.statistics = {
            hits: 0,
            misses: 0,
            evictions: 0,
            currentSize: 0,
            maxSize: this.maxCacheSize,
            averageAge: 0,
            hitRate: 0
        };

        // Initialize telemetry
        this.telemetry = TelemetryReporter.getInstance();

        // Set up cache cleanup interval
        this.startCleanupInterval();

        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('copyReference.cache')) {
                this.loadConfiguration();
                this.restartCleanupInterval();
            }
        });
    }

    /**
     * Load configuration from settings
     */
    private loadConfiguration(): void {
        const config = vscode.workspace.getConfiguration('copyReference.cache');
        this.maxCacheSize = config.get<number>('maxSize', 50);
        this.maxMemorySize = config.get<number>('maxMemoryMB', 10) * 1024 * 1024; // Convert to bytes
        this.cacheTimeout = config.get<number>('ttl', 300000); // 5 minutes default
        this.evictionStrategy = config.get<EvictionStrategy>('evictionStrategy', EvictionStrategy.ADAPTIVE);
    }

    /**
     * Start cleanup interval
     */
    private startCleanupInterval(): void {
        this.cleanupInterval = setInterval(() => {
            this.performMaintenance();
        }, 60 * 1000); // Run every minute
    }

    /**
     * Restart cleanup interval with new settings
     */
    private restartCleanupInterval(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.startCleanupInterval();
    }

    /**
     * Get singleton instance
     */
    static getInstance(): CacheManager {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }

    /**
     * Get cached symbols with statistics tracking
     */
    get(document: vscode.TextDocument): vscode.DocumentSymbol[] | null {
        const uri = document.uri.toString();
        const entry = this.cache.get(uri);

        if (entry && entry.isValid(document)) {
            entry.touch();
            this.statistics.hits++;
            this.telemetry.trackEvent(TelemetryEvents.CACHE_HIT, {
                languageId: document.languageId
            });
            this.updateStatistics();
            return entry.symbols;
        }

        this.statistics.misses++;
        this.telemetry.trackEvent(TelemetryEvents.CACHE_MISS, {
            languageId: document.languageId
        });
        this.updateStatistics();
        return null;
    }

    /**
     * Set cached symbols with eviction handling
     */
    set(document: vscode.TextDocument, symbols: vscode.DocumentSymbol[]): void {
        const uri = document.uri.toString();
        const newEntry = new EnhancedCacheEntry(
            uri,
            document.version,
            symbols
        );

        // Check if we need to evict entries
        if (this.shouldEvict(newEntry)) {
            this.evictEntries(newEntry.sizeInBytes);
        }

        // Update or add entry
        const oldEntry = this.cache.get(uri);
        if (oldEntry) {
            this.currentMemoryUsage -= oldEntry.sizeInBytes;
        }

        this.cache.set(uri, newEntry);
        this.currentMemoryUsage += newEntry.sizeInBytes;
        this.statistics.currentSize = this.cache.size;
    }

    /**
     * Check if eviction is needed
     */
    private shouldEvict(newEntry: EnhancedCacheEntry): boolean {
        return (this.cache.size >= this.maxCacheSize && !this.cache.has(newEntry.documentUri)) ||
               (this.currentMemoryUsage + newEntry.sizeInBytes > this.maxMemorySize);
    }

    /**
     * Evict entries based on selected strategy
     */
    private evictEntries(requiredSpace: number): void {
        let evictedSpace = 0;
        const entriesToEvict: string[] = [];

        switch (this.evictionStrategy) {
            case EvictionStrategy.LRU:
                entriesToEvict.push(...this.selectLRUEntries(requiredSpace));
                break;
            case EvictionStrategy.LFU:
                entriesToEvict.push(...this.selectLFUEntries(requiredSpace));
                break;
            case EvictionStrategy.FIFO:
                entriesToEvict.push(...this.selectFIFOEntries(requiredSpace));
                break;
            case EvictionStrategy.ADAPTIVE:
                entriesToEvict.push(...this.selectAdaptiveEntries(requiredSpace));
                break;
        }

        // Evict selected entries
        entriesToEvict.forEach(key => {
            const entry = this.cache.get(key);
            if (entry) {
                evictedSpace += entry.sizeInBytes;
                this.currentMemoryUsage -= entry.sizeInBytes;
                this.cache.delete(key);
                this.statistics.evictions++;
            }
        });

        this.telemetry.trackEvent('cache_eviction', {
            strategy: this.evictionStrategy,
            evictedCount: entriesToEvict.length,
            evictedBytes: evictedSpace
        });
    }

    /**
     * Select entries for LRU eviction
     */
    private selectLRUEntries(requiredSpace: number): string[] {
        const entries = Array.from(this.cache.entries())
            .sort((a, b) => a[1].lastAccessTime.getTime() - b[1].lastAccessTime.getTime());

        return this.selectEntriesToFreeSpace(entries, requiredSpace);
    }

    /**
     * Select entries for LFU eviction
     */
    private selectLFUEntries(requiredSpace: number): string[] {
        const entries = Array.from(this.cache.entries())
            .sort((a, b) => a[1].accessCount - b[1].accessCount);

        return this.selectEntriesToFreeSpace(entries, requiredSpace);
    }

    /**
     * Select entries for FIFO eviction
     */
    private selectFIFOEntries(requiredSpace: number): string[] {
        const entries = Array.from(this.cache.entries())
            .sort((a, b) => a[1].createdTime.getTime() - b[1].createdTime.getTime());

        return this.selectEntriesToFreeSpace(entries, requiredSpace);
    }

    /**
     * Select entries for adaptive eviction
     */
    private selectAdaptiveEntries(requiredSpace: number): string[] {
        // Calculate priority scores
        for (const entry of this.cache.values()) {
            entry.calculatePriority();
        }

        const entries = Array.from(this.cache.entries())
            .sort((a, b) => a[1].priority - b[1].priority);

        return this.selectEntriesToFreeSpace(entries, requiredSpace);
    }

    /**
     * Helper to select entries until enough space is freed
     */
    private selectEntriesToFreeSpace(
        sortedEntries: [string, EnhancedCacheEntry][],
        requiredSpace: number
    ): string[] {
        const toEvict: string[] = [];
        let freedSpace = 0;

        for (const [key, entry] of sortedEntries) {
            if (freedSpace >= requiredSpace && toEvict.length > 0) {
                break;
            }
            toEvict.push(key);
            freedSpace += entry.sizeInBytes;
        }

        return toEvict;
    }

    /**
     * Perform periodic maintenance
     */
    private performMaintenance(): void {
        this.cleanExpiredEntries();
        this.updateStatistics();

        // Log statistics periodically
        if (this.statistics.currentSize > 0) {
            this.telemetry.trackEvent('cache_statistics', {
                size: this.statistics.currentSize,
                hitRate: this.statistics.hitRate.toFixed(2),
                memoryUsageMB: (this.currentMemoryUsage / 1024 / 1024).toFixed(2)
            });
        }
    }

    /**
     * Clean expired entries
     */
    private cleanExpiredEntries(): void {
        const keysToDelete: string[] = [];

        for (const [key, entry] of this.cache.entries()) {
            if (entry.getAge() > this.cacheTimeout) {
                keysToDelete.push(key);
                this.currentMemoryUsage -= entry.sizeInBytes;
            }
        }

        keysToDelete.forEach(key => this.cache.delete(key));
        this.statistics.currentSize = this.cache.size;
    }

    /**
     * Update cache statistics
     */
    private updateStatistics(): void {
        const total = this.statistics.hits + this.statistics.misses;
        this.statistics.hitRate = total > 0 ? this.statistics.hits / total : 0;

        if (this.cache.size > 0) {
            const totalAge = Array.from(this.cache.values())
                .reduce((sum, entry) => sum + entry.getAge(), 0);
            this.statistics.averageAge = totalAge / this.cache.size;
        } else {
            this.statistics.averageAge = 0;
        }
    }

    /**
     * Clear cache for specific document
     */
    clear(uri: vscode.Uri): void {
        const key = uri.toString();
        const entry = this.cache.get(key);
        if (entry) {
            this.currentMemoryUsage -= entry.sizeInBytes;
            this.cache.delete(key);
            this.statistics.currentSize = this.cache.size;
        }
    }

    /**
     * Clear all cache
     */
    clearAll(): void {
        this.cache.clear();
        this.currentMemoryUsage = 0;
        this.statistics = {
            hits: 0,
            misses: 0,
            evictions: 0,
            currentSize: 0,
            maxSize: this.maxCacheSize,
            averageAge: 0,
            hitRate: 0
        };
    }

    /**
     * Get cache statistics
     */
    getStats(): CacheStatistics {
        this.updateStatistics();
        return { ...this.statistics };
    }

    /**
     * Get detailed cache information for debugging
     */
    getDetailedInfo(): {
        statistics: CacheStatistics;
        memoryUsage: { current: number; max: number; percentage: number };
        entries: Array<{
            uri: string;
            version: number;
            accessCount: number;
            age: number;
            size: number;
            priority: number;
        }>;
    } {
        const entries = Array.from(this.cache.entries()).map(([uri, entry]) => ({
            uri,
            version: entry.documentVersion,
            accessCount: entry.accessCount,
            age: entry.getAge(),
            size: entry.sizeInBytes,
            priority: entry.priority
        }));

        return {
            statistics: this.getStats(),
            memoryUsage: {
                current: this.currentMemoryUsage,
                max: this.maxMemorySize,
                percentage: (this.currentMemoryUsage / this.maxMemorySize) * 100
            },
            entries
        };
    }

    /**
     * Dispose of the cache manager
     */
    dispose(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.clearAll();
    }
}