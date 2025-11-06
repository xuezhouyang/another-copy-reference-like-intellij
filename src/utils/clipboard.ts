import * as vscode from 'vscode';

/**
 * Clipboard utility wrapper for cross-platform clipboard operations
 */
export class ClipboardManager {
    /**
     * Write text to clipboard with error handling
     */
    static async writeText(text: string): Promise<boolean> {
        try {
            await vscode.env.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Clipboard write failed:', error);

            // Check for Linux-specific errors
            if (error instanceof Error) {
                if (error.message.includes('xsel') || error.message.includes('xclip')) {
                    vscode.window.showErrorMessage(
                        vscode.l10n.t('extension.copyReference.xselMissing')
                    );
                } else {
                    vscode.window.showErrorMessage(
                        vscode.l10n.t('extension.copyReference.clipboardError')
                    );
                }
            }

            return false;
        }
    }

    /**
     * Read text from clipboard
     */
    static async readText(): Promise<string> {
        try {
            return await vscode.env.clipboard.readText();
        } catch (error) {
            console.error('Clipboard read failed:', error);
            return '';
        }
    }

    /**
     * Show success notification
     */
    static showSuccess(): void {
        vscode.window.showInformationMessage(
            vscode.l10n.t('extension.copyReference.copied')
        );
    }

    /**
     * Show error notification
     */
    static showError(message?: string): void {
        vscode.window.showErrorMessage(
            message || vscode.l10n.t('extension.copyReference.failed')
        );
    }
}