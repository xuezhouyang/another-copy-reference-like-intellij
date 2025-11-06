import * as vscode from 'vscode';
import * as path from 'path';
import { BaseLanguageHandler } from './base';
import { ReferenceFormat, SymbolContext } from '../types';
import { ReferenceFormatter } from '../utils/formatting';
import { measureAsync } from '../utils/performance';

/**
 * Universal fallback handler for any file type
 * Generates references in the format: filepath:line:column
 */
export class UniversalHandler extends BaseLanguageHandler {
    constructor() {
        super('*', ['*'], 0, false);
    }

    /**
     * Check if this handler can handle the document
     * As a fallback handler, it can handle any document
     */
    canHandle(_document: vscode.TextDocument): boolean {
        return true;
    }

    /**
     * Extract reference in universal format
     */
    async extractReference(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<ReferenceFormat | null> {
        return measureAsync(
            'UniversalHandler.extractReference',
            async () => {
                try {
                    // Get relative file path
                    const filePath = this.getFilePath(document);

                    // Get position information
                    const line = position.line + 1; // Convert to 1-based
                    const column = position.character + 1; // Convert to 1-based

                    // Create fallback format reference
                    return new ReferenceFormat(
                        filePath,
                        'fallback',
                        undefined,  // No symbol path for fallback
                        ':',        // Use colon separator for fallback
                        line,
                        column
                    );
                } catch (error) {
                    console.error('Failed to extract universal reference:', error);
                    return null;
                }
            },
            { languageId: document.languageId }
        );
    }

    /**
     * Resolve symbol at position (minimal implementation for fallback)
     */
    async resolveSymbol(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<SymbolContext | null> {
        return measureAsync(
            'UniversalHandler.resolveSymbol',
            async () => {
                try {
                    // For universal handler, we don't use symbols
                    // Return a basic SymbolContext
                    return new SymbolContext(
                        document,
                        position,
                        document.languageId,
                        undefined,  // No symbol
                        [],        // No parents
                        undefined  // No framework
                    );
                } catch (error) {
                    console.error('Failed to resolve symbol:', error);
                    return null;
                }
            },
            { languageId: document.languageId }
        );
    }

    /**
     * Format reference (required by base class)
     */
    protected formatReference(context: SymbolContext): ReferenceFormat | null {
        // Universal handler uses position-based format, not symbol-based
        // Create a fallback format reference
        const filePath = this.getFilePath(context.document);
        const line = context.position.line + 1;
        const column = context.position.character + 1;

        return new ReferenceFormat(
            filePath,
            'fallback',
            undefined,  // No symbol path
            ':',        // Use colon separator
            line,
            column
        );
    }

    /**
     * Get file path for the document
     */
    private getFilePath(document: vscode.TextDocument): string {
        // Check if file is unsaved
        if (ReferenceFormatter.isUnsavedFile(document)) {
            return ReferenceFormatter.getUnsavedFileName(document);
        }

        // Get relative path from workspace
        const relativePath = ReferenceFormatter.getRelativePath(document.uri);

        // Return relative path or just filename if not in workspace
        return relativePath || path.basename(document.uri.fsPath);
    }

    /**
     * Override base class to skip symbol-based extraction
     */
    protected async extractFromSymbol(
        document: vscode.TextDocument,
        position: vscode.Position,
        _symbolContext: SymbolContext
    ): Promise<ReferenceFormat | null> {
        // Universal handler doesn't use symbols, just position
        return this.extractReference(document, position);
    }
}