import * as vscode from 'vscode';
import { ILanguageHandler } from './types';
import { ClipboardManager } from './utils/clipboard';
import { LocalizationManager } from './utils/localization';
import { CacheManager } from './utils/cache';
import { TelemetryReporter, TelemetryEvents } from './utils/telemetry';
import { registerBenchmarkCommand } from './utils/benchmarks';
import { registerFeedbackCommand } from './utils/feedback';
import { UniversalHandler } from './handlers/universal';
import { JavaScriptHandler } from './handlers/javascript';
import { PythonHandler } from './handlers/python';
import { MarkdownHandler } from './handlers/markdown';
import { HtmlHandler } from './handlers/html';
import { YamlHandler } from './handlers/yaml';
import { FlutterHandler } from './handlers/flutter';
import { JavaHandler } from './handlers/java';
import { FormatManager } from './formatters/manager';
import { FormatVariables } from './types/formats';

/**
 * Handler registry for managing language-specific handlers
 */
class HandlerRegistry {
    private handlers = new Map<string, ILanguageHandler>();
    private fallbackHandler: ILanguageHandler | null = null;

    /**
     * Register a language handler
     */
    register(handler: ILanguageHandler): void {
        // Register by language ID
        this.handlers.set(handler.languageId, handler);

        // Also register by file extensions
        handler.fileExtensions.forEach(ext => {
            const key = `ext:${ext}`;
            const existing = this.handlers.get(key);
            // Keep handler with higher priority
            if (!existing || handler.priority > existing.priority) {
                this.handlers.set(key, handler);
            }
        });
    }

    /**
     * Set the fallback handler for unsupported languages
     */
    setFallback(handler: ILanguageHandler): void {
        this.fallbackHandler = handler;
    }

    /**
     * Get the appropriate handler for a document
     */
    getHandler(document: vscode.TextDocument): ILanguageHandler | null {
        // Try to get handler by language ID first
        let handler = this.handlers.get(document.languageId);

        if (handler && handler.canHandle(document)) {
            return handler;
        }

        // Try by file extension
        const ext = document.fileName.split('.').pop();
        if (ext) {
            handler = this.handlers.get(`ext:${ext}`);
            if (handler && handler.canHandle(document)) {
                return handler;
            }
        }

        // Check all registered handlers in priority order
        const sortedHandlers = Array.from(this.handlers.values())
            .filter((h, i, arr) => arr.indexOf(h) === i) // Remove duplicates
            .sort((a, b) => b.priority - a.priority);

        for (const h of sortedHandlers) {
            if (h.canHandle(document)) {
                return h;
            }
        }

        // Return fallback handler if no specific handler found
        return this.fallbackHandler;
    }

    /**
     * Get all registered handlers
     */
    getAllHandlers(): ILanguageHandler[] {
        const uniqueHandlers = new Set(this.handlers.values());
        return Array.from(uniqueHandlers);
    }

    /**
     * Check if a language is supported
     */
    isLanguageSupported(languageId: string): boolean {
        return this.handlers.has(languageId) || this.fallbackHandler !== null;
    }

    /**
     * Clear all handlers (useful for testing)
     */
    clear(): void {
        this.handlers.clear();
        this.fallbackHandler = null;
    }
}

// Global handler registry instance
const handlerRegistry = new HandlerRegistry();

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext) {
    // Initialize cache manager
    const cacheManager = CacheManager.getInstance();

    // Initialize telemetry reporter
    const telemetry = TelemetryReporter.getInstance();
    telemetry.initialize(context);
    telemetry.trackEvent(TelemetryEvents.FEATURE_USAGE, { feature: 'extension_activated' });

    // Register all language handlers
    registerHandlers();

    // Register the main copy reference command
    const copyReferenceCommand = vscode.commands.registerCommand('extension.copyReference', async () => {
        await handleCopyReference();
    });

    // Register copy reference with format picker command
    const copyReferenceWithFormatCommand = vscode.commands.registerCommand('extension.copyReferenceWithFormat', async () => {
        await handleCopyReferenceWithFormat();
    });

    // Register configuration change listener
    const configChangeListener = vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('copyReference')) {
            // Clear cache when configuration changes
            cacheManager.clearAll();
        }
    });

    // Register document change listener for cache invalidation
    const documentChangeListener = vscode.workspace.onDidChangeTextDocument(e => {
        // Clear cache for modified document
        cacheManager.clear(e.document.uri);
    });

    // Register document close listener
    const documentCloseListener = vscode.workspace.onDidCloseTextDocument(doc => {
        // Clear cache for closed document
        cacheManager.clear(doc.uri);
    });

    // Register benchmark command (only in development mode)
    if (context.extensionMode === vscode.ExtensionMode.Development) {
        registerBenchmarkCommand(context);
    }

    // Register feedback command
    registerFeedbackCommand(context);

    // Add all disposables to subscriptions
    context.subscriptions.push(
        copyReferenceCommand,
        copyReferenceWithFormatCommand,
        configChangeListener,
        documentChangeListener,
        documentCloseListener
    );

    // Log activation
    console.log('Copy Reference extension activated');
}

/**
 * Register all language handlers
 */
function registerHandlers(): void {
    // Clear any existing handlers
    handlerRegistry.clear();

    // Register language-specific handlers
    handlerRegistry.register(new JavaHandler());
    handlerRegistry.register(new JavaScriptHandler());
    handlerRegistry.register(new PythonHandler());
    handlerRegistry.register(new MarkdownHandler());
    handlerRegistry.register(new HtmlHandler());
    handlerRegistry.register(new YamlHandler());
    handlerRegistry.register(new FlutterHandler());

    // Register universal handler as fallback for any unsupported file type
    handlerRegistry.setFallback(new UniversalHandler());

    console.log('Registered JavaHandler, JavaScriptHandler, PythonHandler, MarkdownHandler, HtmlHandler, YamlHandler, FlutterHandler, and UniversalHandler as fallback');
}

/**
 * Handle the copy reference command
 */
async function handleCopyReference(): Promise<void> {
    const telemetry = TelemetryReporter.getInstance();
    const startTime = Date.now();
    const editor = vscode.window.activeTextEditor;

    // Check if editor is available
    if (!editor) {
        vscode.window.showInformationMessage(
            LocalizationManager.getMessage('extension.copyReference.noEditor')
        );
        telemetry.trackEvent(TelemetryEvents.COPY_REFERENCE, { result: 'no_editor' });
        return;
    }

    const document = editor.document;
    const position = editor.selection.active;

    // Get the appropriate handler
    const handler = handlerRegistry.getHandler(document);

    if (!handler) {
        vscode.window.showErrorMessage(
            LocalizationManager.getMessage('extension.copyReference.noHandler')
        );
        telemetry.trackEvent(TelemetryEvents.COPY_REFERENCE, {
            result: 'no_handler',
            languageId: document.languageId
        });
        return;
    }

    try {
        // Extract reference using the handler
        const reference = await handler.extractReference(document, position);

        if (!reference) {
            vscode.window.showInformationMessage(
                LocalizationManager.getMessage('extension.copyReference.failed')
            );
            telemetry.trackLanguageUsage(document.languageId, handler.languageId, false);
            return;
        }

        // Copy to clipboard
        const referenceText = reference.toString();
        const success = await ClipboardManager.writeText(referenceText);

        if (success) {
            // Show success message with reference preview
            const message = LocalizationManager.getMessage(
                'extension.copyReference.copied'
            );
            vscode.window.showInformationMessage(`${message}: ${referenceText}`);

            // Track successful operation
            const duration = Date.now() - startTime;
            telemetry.trackLanguageUsage(document.languageId, handler.languageId, true);
            telemetry.trackPerformance('copyReference', duration);

            // Track framework if detected
            if (reference.frameworkType) {
                telemetry.trackEvent(TelemetryEvents.FRAMEWORK_DETECTED, {
                    framework: reference.frameworkType,
                    languageId: document.languageId
                });
            }
        }

    } catch (error) {
        console.error('Error generating reference:', error);
        vscode.window.showErrorMessage(
            LocalizationManager.getMessage('extension.copyReference.failed')
        );
        telemetry.trackError(error as Error, 'copyReference');
    }
}

/**
 * Handle copy reference with format picker
 */
async function handleCopyReferenceWithFormat(): Promise<void> {
    const telemetry = TelemetryReporter.getInstance();
    const startTime = Date.now();
    const editor = vscode.window.activeTextEditor;

    // Check if editor is available
    if (!editor) {
        vscode.window.showInformationMessage(
            LocalizationManager.getMessage('extension.copyReference.noEditor')
        );
        telemetry.trackEvent(TelemetryEvents.COPY_REFERENCE, { result: 'no_editor' });
        return;
    }

    const document = editor.document;
    const position = editor.selection.active;

    // Get the appropriate handler
    const handler = handlerRegistry.getHandler(document);

    if (!handler) {
        vscode.window.showErrorMessage(
            LocalizationManager.getMessage('extension.copyReference.noHandler')
        );
        telemetry.trackEvent(TelemetryEvents.COPY_REFERENCE, {
            result: 'no_handler',
            languageId: document.languageId
        });
        return;
    }

    try {
        // Extract reference using the handler
        const reference = await handler.extractReference(document, position);

        if (!reference) {
            vscode.window.showInformationMessage(
                LocalizationManager.getMessage('extension.copyReference.failed')
            );
            telemetry.trackLanguageUsage(document.languageId, handler.languageId, false);
            return;
        }

        // Show format picker
        const formatManager = FormatManager.getInstance();
        const selection = await formatManager.showFormatPicker(document.languageId);

        if (!selection) {
            // User cancelled
            return;
        }

        // Build format variables from reference
        const formatVars: FormatVariables = {
            package: reference.modulePath,
            class: reference.symbolPath?.[reference.symbolPath.length - 2],
            method: reference.symbolPath?.[reference.symbolPath.length - 1],
            file: reference.filePath,
            fileName: reference.filePath.split('/').pop(),
            line: reference.lineNumber,
            column: reference.columnNumber,
            fullReference: reference.toString(),
            symbolPath: reference.symbolPath,
            separator: reference.separator,
            languageId: document.languageId,
            workspace: vscode.workspace.name
        };

        // Format using selected format
        const formattedReference = formatManager.format(formatVars, selection.format);

        // Copy to clipboard
        const success = await ClipboardManager.writeText(formattedReference);

        if (success) {
            // Remember format if requested
            if (selection.remember) {
                formatManager.setLastUsedFormat(selection.format);
            }

            // Show success message
            const message = LocalizationManager.getMessage('extension.copyReference.copied');
            vscode.window.showInformationMessage(`${message}: ${formattedReference}`);

            // Track successful operation
            const duration = Date.now() - startTime;
            telemetry.trackLanguageUsage(document.languageId, handler.languageId, true);
            telemetry.trackPerformance('copyReferenceWithFormat', duration);
            telemetry.trackEvent(TelemetryEvents.FEATURE_USAGE, {
                feature: 'multi_format',
                format: selection.format
            });
        }

    } catch (error) {
        console.error('Error generating formatted reference:', error);
        vscode.window.showErrorMessage(
            LocalizationManager.getMessage('extension.copyReference.failed')
        );
        telemetry.trackError(error as Error, 'copyReferenceWithFormat');
    }
}

/**
 * Extension deactivation
 */
export function deactivate() {
    // Clear cache on deactivation
    const cacheManager = CacheManager.getInstance();
    cacheManager.clearAll();

    // Clear handler registry
    handlerRegistry.clear();

    console.log('Copy Reference extension deactivated');
}

/**
 * Export registry for testing
 */
export { handlerRegistry };