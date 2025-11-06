import * as vscode from 'vscode';
import { ILanguageHandler, ReferenceFormat, SymbolContext, CacheEntry } from '../types';

/**
 * Base language handler with common functionality
 */
export abstract class BaseLanguageHandler implements ILanguageHandler {
    protected cache = new Map<string, CacheEntry>();
    protected readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes
    protected readonly maxCacheSize = 100;

    constructor(
        public languageId: string,
        public fileExtensions: string[],
        public priority: number = 50,
        public supportsFrameworks: boolean = false
    ) {}

    /**
     * Check if this handler can process the document
     */
    canHandle(document: vscode.TextDocument): boolean {
        // Check by language ID
        if (document.languageId === this.languageId) {
            return true;
        }

        // Check by file extension
        const fileName = document.fileName.toLowerCase();
        return this.fileExtensions.some(ext => fileName.endsWith(ext));
    }

    /**
     * Extract reference from document at position
     */
    async extractReference(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<ReferenceFormat | null> {
        try {
            const symbolContext = await this.resolveSymbol(document, position);
            if (!symbolContext) {
                return null;
            }

            return this.formatReference(symbolContext);
        } catch (error) {
            console.error(`Error extracting reference: ${error}`);
            return null;
        }
    }

    /**
     * Resolve symbol at position with caching
     */
    async resolveSymbol(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<SymbolContext | null> {
        const symbols = await this.getDocumentSymbols(document);
        if (!symbols || symbols.length === 0) {
            return null;
        }

        const { symbol, parents } = this.findSymbolAtPosition(symbols, position);

        return new SymbolContext(
            document,
            position,
            document.languageId,
            symbol,
            parents,
            await this.detectFramework(document)
        );
    }

    /**
     * Get document symbols with caching
     */
    protected async getDocumentSymbols(document: vscode.TextDocument): Promise<vscode.DocumentSymbol[]> {
        const uri = document.uri.toString();
        const cached = this.cache.get(uri);

        // Return cached symbols if valid
        if (cached && cached.isValid(document)) {
            cached.touch();
            return cached.symbols;
        }

        // Try to get symbols from VS Code language server
        const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
            'vscode.executeDocumentSymbolProvider',
            document.uri
        );

        if (symbols && symbols.length > 0) {
            // Cache the symbols
            this.updateCache(uri, document.version, symbols);
            return symbols;
        }

        // Fallback to custom parsing if needed
        const customSymbols = await this.parseCustomSymbols(document);
        if (customSymbols.length > 0) {
            this.updateCache(uri, document.version, customSymbols);
        }

        return customSymbols;
    }

    /**
     * Update cache with new symbols
     */
    protected updateCache(uri: string, version: number, symbols: vscode.DocumentSymbol[]): void {
        // Clean up old entries if cache is too large
        if (this.cache.size >= this.maxCacheSize) {
            this.evictOldestEntry();
        }

        // Clean up expired entries
        this.cleanExpiredCache();

        // Add new entry
        this.cache.set(uri, new CacheEntry(uri, version, symbols));
    }

    /**
     * Evict oldest cache entry
     */
    protected evictOldestEntry(): void {
        let oldestKey: string | undefined;
        let oldestTime = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            const entryTime = entry.timestamp.getTime();
            if (entryTime < oldestTime) {
                oldestTime = entryTime;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }

    /**
     * Clean expired cache entries
     */
    protected cleanExpiredCache(): void {
        const keysToDelete: string[] = [];

        for (const [key, entry] of this.cache.entries()) {
            if (entry.getAge() > this.cacheTimeout) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.cache.delete(key));
    }

    /**
     * Find symbol at position
     */
    protected findSymbolAtPosition(
        symbols: vscode.DocumentSymbol[],
        position: vscode.Position,
        parents: vscode.DocumentSymbol[] = []
    ): { symbol?: vscode.DocumentSymbol; parents: vscode.DocumentSymbol[] } {
        for (const symbol of symbols) {
            if (symbol.range.contains(position)) {
                // Check children first for more specific match
                if (symbol.children && symbol.children.length > 0) {
                    const childResult = this.findSymbolAtPosition(
                        symbol.children,
                        position,
                        [...parents, symbol]
                    );
                    if (childResult.symbol) {
                        return childResult;
                    }
                }

                // Return this symbol if no child matches
                if (symbol.selectionRange.contains(position)) {
                    return { symbol, parents };
                }
            }
        }

        return { symbol: undefined, parents };
    }

    /**
     * Get cached symbols for a document
     */
    protected getCachedSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] | null {
        const cacheKey = document.uri.toString();
        const entry = this.cache.get(cacheKey);

        if (entry && entry.isValid(document)) {
            entry.touch();
            return entry.symbols;
        }

        return null;
    }

    /**
     * Set cached symbols for a document
     */
    protected setCachedSymbols(document: vscode.TextDocument, symbols: vscode.DocumentSymbol[]): void {
        const cacheKey = document.uri.toString();

        // Check cache size limit
        if (this.cache.size >= this.maxCacheSize && !this.cache.has(cacheKey)) {
            this.evictOldestEntry();
        }

        this.cache.set(cacheKey, new CacheEntry(
            document.uri.toString(),
            document.version,
            symbols
        ));
    }

    /**
     * Clear cache for this handler
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Dispose handler and clean up resources
     */
    dispose(): void {
        this.clearCache();
    }

    /**
     * Format reference - to be implemented by subclasses
     */
    protected abstract formatReference(context: SymbolContext): ReferenceFormat | null;

    /**
     * Parse custom symbols - to be implemented by subclasses if needed
     */
    protected async parseCustomSymbols(_document: vscode.TextDocument): Promise<vscode.DocumentSymbol[]> {
        // Default implementation returns empty array
        // Subclasses can override for custom parsing
        return [];
    }

    /**
     * Detect framework - to be implemented by subclasses if needed
     */
    protected async detectFramework(_document: vscode.TextDocument): Promise<string | undefined> {
        // Default implementation returns undefined
        // Subclasses can override for framework detection
        return undefined;
    }
}