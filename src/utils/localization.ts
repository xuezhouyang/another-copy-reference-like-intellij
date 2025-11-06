import * as vscode from 'vscode';

/**
 * Localization utility for multi-language support
 */
export class LocalizationManager {
    private static readonly DEFAULT_MESSAGES = {
        'extension.copyReference.title': 'Copy Reference',
        'extension.copyReference.description': 'Copy reference path like IntelliJ IDEA',
        'extension.copyReference.noEditor': 'Please open a file in editor',
        'extension.copyReference.copied': 'Reference path copied to clipboard',
        'extension.copyReference.failed': 'Unable to determine reference path',
        'extension.copyReference.clipboardError': 'Failed to copy to clipboard',
        'extension.copyReference.xselMissing': 'Clipboard requires xsel or xclip on Linux. Install via: sudo apt install xsel',
        'extension.copyReference.cursorPosition': 'Please place cursor on a class or method name',
        'extension.copyReference.noSymbols': 'No symbols found. Make sure the file has a valid structure.',
        'extension.copyReference.unsavedFile': 'Untitled',
        'extension.copyReference.parseError': 'Failed to parse document',
        'extension.copyReference.timeout': 'Operation timed out'
    };

    /**
     * Get localized message with fallback
     */
    static getMessage(key: string, ...args: any[]): string {
        // Try to get localized message
        try {
            return vscode.l10n.t(key, ...args);
        } catch {
            // Fallback to default message
            const defaultMessage = this.DEFAULT_MESSAGES[key as keyof typeof LocalizationManager.DEFAULT_MESSAGES];
            if (defaultMessage) {
                return this.formatMessage(defaultMessage, args);
            }
            return key;
        }
    }

    /**
     * Format message with arguments
     */
    private static formatMessage(template: string, args: any[]): string {
        if (!args || args.length === 0) {
            return template;
        }

        return template.replace(/\{(\d+)\}/g, (match, index) => {
            const argIndex = parseInt(index, 10);
            return argIndex < args.length ? String(args[argIndex]) : match;
        });
    }

    /**
     * Get all message keys
     */
    static getAllKeys(): string[] {
        return Object.keys(this.DEFAULT_MESSAGES);
    }

    /**
     * Check if a message key exists
     */
    static hasKey(key: string): boolean {
        return key in this.DEFAULT_MESSAGES;
    }
}