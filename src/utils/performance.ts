/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics = new Map<string, PerformanceMetric[]>();
    private readonly maxMetricsPerKey = 100;
    private readonly performanceThreshold = 100; // milliseconds

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    /**
     * Get singleton instance
     */
    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    /**
     * Start timing an operation
     */
    startTimer(operationName: string): Timer {
        return new Timer(operationName, this);
    }

    /**
     * Record a performance metric
     */
    recordMetric(metric: PerformanceMetric): void {
        const key = metric.operation;

        if (!this.metrics.has(key)) {
            this.metrics.set(key, []);
        }

        const metrics = this.metrics.get(key)!;
        metrics.push(metric);

        // Keep only the most recent metrics
        if (metrics.length > this.maxMetricsPerKey) {
            metrics.shift();
        }

        // Log slow operations
        if (metric.duration > this.performanceThreshold) {
            console.warn(`Slow operation detected: ${metric.operation} took ${metric.duration}ms`, {
                metadata: metric.metadata
            });
        }
    }

    /**
     * Get average duration for an operation
     */
    getAverageDuration(operation: string): number | null {
        const metrics = this.metrics.get(operation);
        if (!metrics || metrics.length === 0) {
            return null;
        }

        const sum = metrics.reduce((acc, m) => acc + m.duration, 0);
        return sum / metrics.length;
    }

    /**
     * Get percentile duration for an operation
     */
    getPercentileDuration(operation: string, percentile: number): number | null {
        const metrics = this.metrics.get(operation);
        if (!metrics || metrics.length === 0) {
            return null;
        }

        const sorted = [...metrics].sort((a, b) => a.duration - b.duration);
        const index = Math.floor((percentile / 100) * sorted.length);
        return sorted[Math.min(index, sorted.length - 1)].duration;
    }

    /**
     * Get performance statistics for an operation
     */
    getStatistics(operation: string): PerformanceStatistics | null {
        const metrics = this.metrics.get(operation);
        if (!metrics || metrics.length === 0) {
            return null;
        }

        const durations = metrics.map(m => m.duration);
        const sorted = [...durations].sort((a, b) => a - b);

        return {
            operation,
            count: metrics.length,
            average: durations.reduce((a, b) => a + b, 0) / durations.length,
            median: sorted[Math.floor(sorted.length / 2)],
            min: sorted[0],
            max: sorted[sorted.length - 1],
            p95: sorted[Math.floor(0.95 * sorted.length)],
            p99: sorted[Math.floor(0.99 * sorted.length)]
        };
    }

    /**
     * Get all performance statistics
     */
    getAllStatistics(): PerformanceStatistics[] {
        const stats: PerformanceStatistics[] = [];

        for (const operation of this.metrics.keys()) {
            const stat = this.getStatistics(operation);
            if (stat) {
                stats.push(stat);
            }
        }

        return stats.sort((a, b) => b.average - a.average);
    }

    /**
     * Clear metrics for an operation
     */
    clearMetrics(operation?: string): void {
        if (operation) {
            this.metrics.delete(operation);
        } else {
            this.metrics.clear();
        }
    }

    /**
     * Export metrics to JSON
     */
    exportMetrics(): string {
        const data: { [key: string]: PerformanceStatistics } = {};

        for (const operation of this.metrics.keys()) {
            const stats = this.getStatistics(operation);
            if (stats) {
                data[operation] = stats;
            }
        }

        return JSON.stringify(data, null, 2);
    }

    /**
     * Log performance summary to console
     */
    logSummary(): void {
        const stats = this.getAllStatistics();

        if (stats.length === 0) {
            console.log('No performance metrics collected');
            return;
        }

        console.log('=== Performance Summary ===');
        for (const stat of stats) {
            console.log(`${stat.operation}:`);
            console.log(`  Count: ${stat.count}`);
            console.log(`  Average: ${stat.average.toFixed(2)}ms`);
            console.log(`  Median: ${stat.median.toFixed(2)}ms`);
            console.log(`  P95: ${stat.p95.toFixed(2)}ms`);
            console.log(`  P99: ${stat.p99.toFixed(2)}ms`);
            console.log(`  Min/Max: ${stat.min.toFixed(2)}ms / ${stat.max.toFixed(2)}ms`);
        }
        console.log('========================');
    }
}

/**
 * Timer class for measuring operation duration
 */
export class Timer {
    private startTime: number;
    private metadata: Record<string, any> = {};

    constructor(
        private operation: string,
        private monitor: PerformanceMonitor
    ) {
        this.startTime = Date.now();
    }

    /**
     * Add metadata to the timer
     */
    addMetadata(key: string, value: any): Timer {
        this.metadata[key] = value;
        return this;
    }

    /**
     * Stop the timer and record the metric
     */
    stop(): number {
        const duration = Date.now() - this.startTime;

        this.monitor.recordMetric({
            operation: this.operation,
            duration,
            timestamp: new Date(),
            metadata: this.metadata
        });

        return duration;
    }
}

/**
 * Performance metric interface
 */
export interface PerformanceMetric {
    operation: string;
    duration: number;
    timestamp: Date;
    metadata?: Record<string, any>;
}

/**
 * Performance statistics interface
 */
export interface PerformanceStatistics {
    operation: string;
    count: number;
    average: number;
    median: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
}

/**
 * Decorator for measuring method performance
 */
export function measurePerformance(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const monitor = PerformanceMonitor.getInstance();

    descriptor.value = async function (...args: any[]) {
        const timer = monitor.startTimer(`${target.constructor.name}.${propertyKey}`);

        try {
            const result = await originalMethod.apply(this, args);
            timer.stop();
            return result;
        } catch (error) {
            timer.addMetadata('error', true).stop();
            throw error;
        }
    };

    return descriptor;
}

/**
 * Measure async function performance
 */
export async function measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
): Promise<T> {
    const monitor = PerformanceMonitor.getInstance();
    const timer = monitor.startTimer(operation);

    if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
            timer.addMetadata(key, value);
        });
    }

    try {
        const result = await fn();
        timer.stop();
        return result;
    } catch (error) {
        timer.addMetadata('error', true).stop();
        throw error;
    }
}

/**
 * Measure sync function performance
 */
export function measureSync<T>(
    operation: string,
    fn: () => T,
    metadata?: Record<string, any>
): T {
    const monitor = PerformanceMonitor.getInstance();
    const timer = monitor.startTimer(operation);

    if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
            timer.addMetadata(key, value);
        });
    }

    try {
        const result = fn();
        timer.stop();
        return result;
    } catch (error) {
        timer.addMetadata('error', true).stop();
        throw error;
    }
}