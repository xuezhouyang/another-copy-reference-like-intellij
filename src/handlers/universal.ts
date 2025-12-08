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
                    // Try to build a symbol-based reference first
                    const symbols = await this.getDocumentSymbols(document);

                    if (symbols && symbols.length > 0) {
                        const { symbol, parents } = this.findSymbolAtPosition(symbols, position);
                        const symbolReference = this.buildSymbolReference(document, position, parents, symbol);

                        if (symbolReference) {
                            return symbolReference;
                        }
                    }

                    // Fall back to position-based reference
                    return this.buildFallbackReference(document, position);
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
        // Try to format using the resolved symbol context first
        const reference = this.buildSymbolReference(
            context.document,
            context.position,
            context.parentSymbols,
            context.symbol
        );

        if (reference) {
            return reference;
        }

        // Fallback to position-based reference
        return this.buildFallbackReference(context.document, context.position);
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

    /**
     * Build a symbol-based reference if possible
     */
    private buildSymbolReference(
        document: vscode.TextDocument,
        position: vscode.Position,
        parents: vscode.DocumentSymbol[],
        symbol?: vscode.DocumentSymbol
    ): ReferenceFormat | null {
        const symbolPath = this.buildSymbolPath(parents, symbol);

        if (symbolPath.length === 0) {
            return null;
        }

        const modulePath = this.getModulePath(document, parents);

        return new ReferenceFormat(
            modulePath,
            'standard',
            symbolPath,
            '#',
            undefined,
            undefined,
            modulePath
        );
    }

    /**
     * Build symbol path while filtering out package/module entries
     */
    private buildSymbolPath(
        parents: vscode.DocumentSymbol[],
        symbol?: vscode.DocumentSymbol
    ): string[] {
        const packageIndex = parents.findIndex(parent =>
            parent.kind === vscode.SymbolKind.Package ||
            parent.kind === vscode.SymbolKind.Namespace ||
            parent.kind === vscode.SymbolKind.Module
        );

        const pathParts = parents.map(parent => parent.name);

        if (symbol) {
            pathParts.push(symbol.name);
        }

        // Remove package/module entries from symbol path (they are represented in modulePath)
        if (packageIndex >= 0) {
            return pathParts.slice(packageIndex + 1);
        }

        return pathParts;
    }

    /**
     * Determine module path for symbol-based references
     */
    private getModulePath(document: vscode.TextDocument, parents: vscode.DocumentSymbol[]): string {
        const packageSymbol = parents.find(parent =>
            parent.kind === vscode.SymbolKind.Package ||
            parent.kind === vscode.SymbolKind.Namespace ||
            parent.kind === vscode.SymbolKind.Module
        );

        if (packageSymbol) {
            return packageSymbol.name;
        }

        // Use file path without extension when no package information is available
        const relativePath = this.getFilePath(document);
        return relativePath.replace(/\.[^.]+$/, '');
    }

    /**
     * Create a fallback reference using line and column information
     */
    private buildFallbackReference(
        document: vscode.TextDocument,
        position: vscode.Position
    ): ReferenceFormat {
        const filePath = this.getFilePath(document);
        const line = position.line + 1;
        const column = position.character + 1;

        return new ReferenceFormat(
            filePath,
            'fallback',
            undefined,  // No symbol path for fallback
            ':',        // Use colon separator for fallback
            line,
            column
        );
    }
}