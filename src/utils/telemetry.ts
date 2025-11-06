import * as vscode from 'vscode';

/**
 * Telemetry reporter for tracking extension usage
 * Respects VS Code telemetry settings and user privacy
 */
export class TelemetryReporter {
    private static instance: TelemetryReporter;
    private isEnabled: boolean = false;
    private events: Map<string, number> = new Map();
    private sessionStart: Date;
    private context?: vscode.ExtensionContext;

    private constructor() {
        this.sessionStart = new Date();
        this.checkTelemetryEnabled();
    }

    /**
     * Get singleton instance
     */
    static getInstance(): TelemetryReporter {
        if (!TelemetryReporter.instance) {
            TelemetryReporter.instance = new TelemetryReporter();
        }
        return TelemetryReporter.instance;
    }

    /**
     * Initialize telemetry with extension context
     */
    initialize(context: vscode.ExtensionContext): void {
        this.context = context;

        // Listen for telemetry setting changes
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('telemetry')) {
                this.checkTelemetryEnabled();
            }
        });

        // Load persisted telemetry data
        this.loadPersistedData();
    }

    /**
     * Check if telemetry is enabled in VS Code settings
     */
    private checkTelemetryEnabled(): void {
        const config = vscode.workspace.getConfiguration('telemetry');
        const level = config.get<string>('telemetryLevel', 'off');
        this.isEnabled = level !== 'off';
    }

    /**
     * Track a telemetry event
     */
    trackEvent(
        eventName: string,
        properties?: Record<string, any>,
        measurements?: Record<string, number>
    ): void {
        if (!this.isEnabled) {
            return;
        }

        // Increment event counter
        const count = this.events.get(eventName) || 0;
        this.events.set(eventName, count + 1);

        // Log event details (in production, this would send to telemetry service)
        const eventData = {
            event: eventName,
            timestamp: new Date().toISOString(),
            properties: this.sanitizeProperties(properties),
            measurements: measurements || {}
        };

        // In development, log to console
        if (process.env.NODE_ENV === 'development') {
            console.log('[Telemetry]', eventData);
        }

        // Persist telemetry data
        this.persistData();
    }

    /**
     * Track language-specific usage
     */
    trackLanguageUsage(languageId: string, handlerId: string, success: boolean): void {
        this.trackEvent('copyReference', {
            languageId,
            handlerId,
            success: success.toString()
        });

        // Track language-specific metrics
        const languageKey = `language_${languageId}`;
        const count = this.events.get(languageKey) || 0;
        this.events.set(languageKey, count + 1);
    }

    /**
     * Track performance metrics
     */
    trackPerformance(operation: string, duration: number): void {
        this.trackEvent('performance', {
            operation
        }, {
            duration_ms: Math.round(duration)
        });
    }

    /**
     * Track errors
     */
    trackError(error: Error, context?: string): void {
        this.trackEvent('error', {
            message: error.message,
            context: context || 'unknown',
            stack: this.sanitizeStackTrace(error.stack)
        });
    }

    /**
     * Track feature usage
     */
    trackFeature(feature: string, metadata?: Record<string, any>): void {
        this.trackEvent('feature_usage', {
            feature,
            ...this.sanitizeProperties(metadata)
        });
    }

    /**
     * Get telemetry summary
     */
    getSummary(): TelemetrySummary {
        const sessionDuration = Date.now() - this.sessionStart.getTime();
        const totalEvents = Array.from(this.events.values()).reduce((sum, count) => sum + count, 0);

        return {
            sessionDuration,
            totalEvents,
            eventCounts: Object.fromEntries(this.events),
            isEnabled: this.isEnabled,
            sessionStart: this.sessionStart.toISOString()
        };
    }

    /**
     * Sanitize properties to remove sensitive data
     */
    private sanitizeProperties(properties?: Record<string, any>): Record<string, string> {
        if (!properties) {
            return {};
        }

        const sanitized: Record<string, string> = {};

        for (const [key, value] of Object.entries(properties)) {
            // Skip sensitive keys
            if (this.isSensitiveKey(key)) {
                continue;
            }

            // Convert value to string and truncate if too long
            let stringValue = String(value);
            if (stringValue.length > 200) {
                stringValue = stringValue.substring(0, 200) + '...';
            }

            // Remove file paths that might contain user info
            stringValue = this.sanitizeFilePath(stringValue);

            sanitized[key] = stringValue;
        }

        return sanitized;
    }

    /**
     * Sanitize stack traces to remove sensitive information
     */
    private sanitizeStackTrace(stack?: string): string {
        if (!stack) {
            return 'No stack trace available';
        }

        // Remove absolute file paths
        return stack.replace(/([A-Z]:)?[/\\]Users[/\\][^/\\\n]+/g, '/Users/***')
                   .replace(/([A-Z]:)?[/\\]home[/\\][^/\\\n]+/g, '/home/***');
    }

    /**
     * Sanitize file paths to remove user information
     */
    private sanitizeFilePath(path: string): string {
        return path.replace(/([A-Z]:)?[/\\]Users[/\\][^/\\\s]+/g, '/Users/***')
                   .replace(/([A-Z]:)?[/\\]home[/\\][^/\\\s]+/g, '/home/***')
                   .replace(/([A-Z]:)?\\\\Users\\\\[^/\\\s]+/g, '\\Users\\***');
    }

    /**
     * Check if a key might contain sensitive information
     */
    private isSensitiveKey(key: string): boolean {
        const sensitivePatterns = [
            /password/i,
            /token/i,
            /key/i,
            /secret/i,
            /credential/i,
            /auth/i,
            /private/i
        ];

        return sensitivePatterns.some(pattern => pattern.test(key));
    }

    /**
     * Persist telemetry data to extension global state
     */
    private persistData(): void {
        if (!this.context) {
            return;
        }

        const data = {
            events: Object.fromEntries(this.events),
            lastUpdate: new Date().toISOString()
        };

        this.context.globalState.update('telemetryData', data);
    }

    /**
     * Load persisted telemetry data
     */
    private loadPersistedData(): void {
        if (!this.context) {
            return;
        }

        const data = this.context.globalState.get<any>('telemetryData');
        if (data && data.events) {
            this.events = new Map(Object.entries(data.events));
        }
    }

    /**
     * Clear telemetry data
     */
    clearData(): void {
        this.events.clear();
        if (this.context) {
            this.context.globalState.update('telemetryData', undefined);
        }
    }

    /**
     * Export telemetry data for analysis
     */
    exportData(): string {
        const summary = this.getSummary();
        return JSON.stringify(summary, null, 2);
    }
}

/**
 * Telemetry summary structure
 */
export interface TelemetrySummary {
    sessionDuration: number;
    totalEvents: number;
    eventCounts: Record<string, number>;
    isEnabled: boolean;
    sessionStart: string;
}

/**
 * Telemetry event types
 */
export enum TelemetryEvents {
    COPY_REFERENCE = 'copyReference',
    PERFORMANCE = 'performance',
    ERROR = 'error',
    FEATURE_USAGE = 'feature_usage',
    LANGUAGE_USAGE = 'language_usage',
    FRAMEWORK_DETECTED = 'framework_detected',
    CACHE_HIT = 'cache_hit',
    CACHE_MISS = 'cache_miss'
}

/**
 * Helper function to track performance
 */
export async function trackPerformance<T>(
    operation: string,
    fn: () => Promise<T>
): Promise<T> {
    const startTime = Date.now();
    const reporter = TelemetryReporter.getInstance();

    try {
        const result = await fn();
        const duration = Date.now() - startTime;
        reporter.trackPerformance(operation, duration);
        return result;
    } catch (error) {
        const duration = Date.now() - startTime;
        reporter.trackPerformance(operation, duration);
        reporter.trackError(error as Error, operation);
        throw error;
    }
}