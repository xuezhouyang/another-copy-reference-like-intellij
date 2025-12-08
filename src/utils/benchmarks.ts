import * as vscode from 'vscode';
import * as path from 'path';
import { performance } from 'perf_hooks';
import { ILanguageHandler } from '../types';
import { CacheManager } from './cache';
import { TelemetryReporter } from './telemetry';

/**
 * Benchmark result structure
 */
export interface BenchmarkResult {
    name: string;
    iterations: number;
    totalTime: number;
    averageTime: number;
    minTime: number;
    maxTime: number;
    standardDeviation: number;
    opsPerSecond: number;
}

/**
 * Performance benchmarking utility
 */
export class BenchmarkRunner {
    private results: BenchmarkResult[] = [];
    private telemetry = TelemetryReporter.getInstance();

    /**
     * Run a benchmark test
     */
    async runBenchmark(
        name: string,
        fn: () => Promise<void>,
        iterations = 100,
        warmup = 10
    ): Promise<BenchmarkResult> {
        console.log(`Running benchmark: ${name}`);

        // Warm up
        for (let i = 0; i < warmup; i++) {
            await fn();
        }

        // Run benchmark
        const times: number[] = [];
        const startTotal = performance.now();

        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            await fn();
            const end = performance.now();
            times.push(end - start);
        }

        const endTotal = performance.now();
        const totalTime = endTotal - startTotal;

        // Calculate statistics
        const result = this.calculateStatistics(name, times, totalTime, iterations);
        this.results.push(result);

        // Track benchmark in telemetry
        this.telemetry.trackPerformance(`benchmark_${name}`, result.averageTime);

        return result;
    }

    /**
     * Calculate statistics from benchmark times
     */
    private calculateStatistics(
        name: string,
        times: number[],
        totalTime: number,
        iterations: number
    ): BenchmarkResult {
        const sum = times.reduce((a, b) => a + b, 0);
        const average = sum / iterations;
        const min = Math.min(...times);
        const max = Math.max(...times);

        // Calculate standard deviation
        const squaredDiffs = times.map(t => Math.pow(t - average, 2));
        const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / iterations;
        const standardDeviation = Math.sqrt(avgSquaredDiff);

        const opsPerSecond = 1000 / average;

        return {
            name,
            iterations,
            totalTime,
            averageTime: average,
            minTime: min,
            maxTime: max,
            standardDeviation,
            opsPerSecond
        };
    }

    /**
     * Generate benchmark report
     */
    generateReport(): string {
        let report = '=== Performance Benchmark Report ===\n\n';

        for (const result of this.results) {
            report += `Benchmark: ${result.name}\n`;
            report += `  Iterations: ${result.iterations}\n`;
            report += `  Total Time: ${result.totalTime.toFixed(2)}ms\n`;
            report += `  Average Time: ${result.averageTime.toFixed(3)}ms\n`;
            report += `  Min Time: ${result.minTime.toFixed(3)}ms\n`;
            report += `  Max Time: ${result.maxTime.toFixed(3)}ms\n`;
            report += `  Std Deviation: ${result.standardDeviation.toFixed(3)}ms\n`;
            report += `  Ops/Second: ${result.opsPerSecond.toFixed(1)}\n\n`;
        }

        return report;
    }

    /**
     * Export results as JSON
     */
    exportResults(): string {
        return JSON.stringify(this.results, null, 2);
    }

    /**
     * Clear results
     */
    clearResults(): void {
        this.results = [];
    }
}

/**
 * Language handler benchmark suite
 */
export class HandlerBenchmarks {
    private runner = new BenchmarkRunner();

    /**
     * Run all handler benchmarks
     */
    async runAll(handlers: ILanguageHandler[]): Promise<void> {
        console.log('Starting handler benchmarks...\n');

        for (const handler of handlers) {
            await this.benchmarkHandler(handler);
        }

        const report = this.runner.generateReport();
        console.log(report);

        // Save results to output channel
        const outputChannel = vscode.window.createOutputChannel('Copy Reference Benchmarks');
        outputChannel.appendLine(report);
        outputChannel.show();
    }

    /**
     * Benchmark a single handler
     */
    private async benchmarkHandler(handler: ILanguageHandler): Promise<void> {
        const testFile = await this.createTestFile(handler.languageId);
        if (!testFile) return;

        try {
            const document = await vscode.workspace.openTextDocument(testFile);
            const position = new vscode.Position(10, 10); // Middle of file

            // Benchmark reference extraction
            await this.runner.runBenchmark(
                `${handler.languageId}_extract_reference`,
                async () => {
                    await handler.extractReference(document, position);
                },
                100,
                10
            );

            // Benchmark symbol resolution
            await this.runner.runBenchmark(
                `${handler.languageId}_resolve_symbol`,
                async () => {
                    await handler.resolveSymbol(document, position);
                },
                100,
                10
            );

        } finally {
            // Clean up test file
            await vscode.workspace.fs.delete(testFile);
        }
    }

    /**
     * Create a test file for benchmarking
     */
    private async createTestFile(languageId: string): Promise<vscode.Uri | null> {
        const content = this.getTestContent(languageId);
        if (!content) return null;

        const extension = this.getFileExtension(languageId);
        const fileName = `benchmark_test_${Date.now()}${extension}`;
        const uri = vscode.Uri.file(path.join('/tmp', fileName));

        await vscode.workspace.fs.writeFile(uri, Buffer.from(content));
        return uri;
    }

    /**
     * Get test content for language
     */
    private getTestContent(languageId: string): string | null {
        const contents: Record<string, string> = {
            javascript: `
                class TestClass {
                    constructor() {
                        this.prop = 'value';
                    }

                    method1() {
                        return this.prop;
                    }

                    method2(param) {
                        return param * 2;
                    }

                    static staticMethod() {
                        return 'static';
                    }
                }

                function globalFunction(a, b) {
                    return a + b;
                }

                const arrowFunction = (x) => x * x;

                export { TestClass, globalFunction };
            `,
            python: `
                class TestClass:
                    """Test class for benchmarking"""

                    def __init__(self):
                        self.prop = 'value'

                    def method1(self):
                        """Test method 1"""
                        return self.prop

                    def method2(self, param):
                        """Test method 2"""
                        return param * 2

                    @staticmethod
                    def static_method():
                        """Static method"""
                        return 'static'

                    @classmethod
                    def class_method(cls):
                        """Class method"""
                        return cls.__name__

                def global_function(a, b):
                    """Global function"""
                    return a + b

                lambda_func = lambda x: x * x
            `,
            markdown: `
                # Test Document

                ## Section 1

                This is a test paragraph with some content.

                ### Subsection 1.1

                - Item 1
                - Item 2
                - Item 3

                ## Section 2

                Another section with code:

                \`\`\`javascript
                const test = 'code';
                \`\`\`

                ### Subsection 2.1

                More content here.

                ## Section 3

                Final section with a table:

                | Column 1 | Column 2 |
                |----------|----------|
                | Value 1  | Value 2  |
            `,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <title>Test Document</title>
                </head>
                <body>
                    <header id="main-header">
                        <nav id="navigation">
                            <ul>
                                <li><a href="#section1">Section 1</a></li>
                                <li><a href="#section2">Section 2</a></li>
                            </ul>
                        </nav>
                    </header>

                    <main id="content">
                        <section id="section1" class="section">
                            <h1>Section 1</h1>
                            <p>Test content for section 1.</p>
                        </section>

                        <section id="section2" class="section">
                            <h2>Section 2</h2>
                            <div class="subsection">
                                <p>Test content for section 2.</p>
                            </div>
                        </section>
                    </main>

                    <footer id="main-footer">
                        <p>Footer content</p>
                    </footer>
                </body>
                </html>
            `,
            yaml: `
                # Test YAML configuration
                app:
                  name: Test Application
                  version: 1.0.0
                  features:
                    - feature1
                    - feature2
                    - feature3

                server:
                  host: localhost
                  port: 8080
                  ssl:
                    enabled: true
                    cert: /path/to/cert
                    key: /path/to/key

                database:
                  primary:
                    host: db.example.com
                    port: 5432
                    name: testdb
                    credentials:
                      user: admin
                      password: secret

                cache:
                  provider: redis
                  config:
                    host: cache.example.com
                    port: 6379
                    ttl: 3600
            `
        };

        return contents[languageId] || null;
    }

    /**
     * Get file extension for language
     */
    private getFileExtension(languageId: string): string {
        const extensions: Record<string, string> = {
            javascript: '.js',
            typescript: '.ts',
            javascriptreact: '.jsx',
            typescriptreact: '.tsx',
            python: '.py',
            markdown: '.md',
            html: '.html',
            xml: '.xml',
            yaml: '.yml'
        };

        return extensions[languageId] || '.txt';
    }
}

/**
 * Cache benchmark suite
 */
export class CacheBenchmarks {
    private runner = new BenchmarkRunner();
    private cache = CacheManager.getInstance();

    /**
     * Run all cache benchmarks
     */
    async runAll(): Promise<void> {
        console.log('Starting cache benchmarks...\n');

        await this.benchmarkCacheOperations();
        await this.benchmarkEvictionStrategies();

        const report = this.runner.generateReport();
        console.log(report);

        // Save results to output channel
        const outputChannel = vscode.window.createOutputChannel('Cache Benchmarks');
        outputChannel.appendLine(report);
        outputChannel.show();
    }

    /**
     * Benchmark basic cache operations
     */
    private async benchmarkCacheOperations(): Promise<void> {
        // Create test document
        const uri = vscode.Uri.file('/tmp/cache_test.js');
        const content = 'const test = "content";';
        await vscode.workspace.fs.writeFile(uri, Buffer.from(content));
        const document = await vscode.workspace.openTextDocument(uri);

        const testSymbols: vscode.DocumentSymbol[] = [
            new vscode.DocumentSymbol(
                'test',
                '',
                vscode.SymbolKind.Variable,
                new vscode.Range(0, 0, 0, 10),
                new vscode.Range(0, 0, 0, 10)
            )
        ];

        // Benchmark cache set
        await this.runner.runBenchmark(
            'cache_set',
            async () => {
                this.cache.set(document, testSymbols);
            },
            1000,
            100
        );

        // Benchmark cache get (hit)
        await this.runner.runBenchmark(
            'cache_get_hit',
            async () => {
                this.cache.get(document);
            },
            1000,
            100
        );

        // Benchmark cache get (miss)
        const missingUri = vscode.Uri.file('/tmp/missing.js');
        const missingDoc = await vscode.workspace.openTextDocument(missingUri);
        await this.runner.runBenchmark(
            'cache_get_miss',
            async () => {
                this.cache.get(missingDoc);
            },
            1000,
            100
        );

        // Clean up
        await vscode.workspace.fs.delete(uri);
        await vscode.workspace.fs.delete(missingUri);
    }

    /**
     * Benchmark eviction strategies
     */
    private async benchmarkEvictionStrategies(): Promise<void> {
        // This would test different eviction strategies
        // Implementation depends on making eviction strategy configurable at runtime
        console.log('Eviction strategy benchmarks would go here');
    }
}

/**
 * Run all performance benchmarks
 */
export async function runAllBenchmarks(handlers: ILanguageHandler[]): Promise<void> {
    const handlerBenchmarks = new HandlerBenchmarks();
    const cacheBenchmarks = new CacheBenchmarks();

    console.log('=== Running Performance Benchmarks ===\n');

    // Run handler benchmarks
    await handlerBenchmarks.runAll(handlers);

    // Run cache benchmarks
    await cacheBenchmarks.runAll();

    console.log('\n=== Benchmarks Complete ===');
}

/**
 * Command to run benchmarks
 */
export function registerBenchmarkCommand(context: vscode.ExtensionContext): void {
    const command = vscode.commands.registerCommand('extension.runBenchmarks', async () => {
        const answer = await vscode.window.showWarningMessage(
            'Running benchmarks will create temporary files and may impact performance. Continue?',
            'Yes',
            'No'
        );

        if (answer === 'Yes') {
            vscode.window.showInformationMessage('Running performance benchmarks...');
            // Import handler registry and run benchmarks
            const extension = await import('../extension');
            const handlers = extension.handlerRegistry.getAllHandlers();
            await runAllBenchmarks(handlers);
            vscode.window.showInformationMessage('Benchmarks complete. Check the output channel for results.');
        }
    });

    context.subscriptions.push(command);
}