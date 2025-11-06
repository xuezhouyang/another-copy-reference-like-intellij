import * as vscode from 'vscode';
import { BaseLanguageHandler } from './base';
import { ReferenceFormat, SymbolContext } from '../types';
import { ReferenceFormatter } from '../utils/formatting';
import { SymbolResolver } from '../utils/symbols';
import { measureAsync } from '../utils/performance';

/**
 * Handler for YAML files
 * Generates references using dot notation for nested keys
 */
export class YamlHandler extends BaseLanguageHandler {
    constructor() {
        super(
            'yaml',
            ['.yml', '.yaml'],
            60,  // Medium priority
            false  // No specific framework support
        );
    }

    /**
     * Check if this handler can handle the document
     */
    canHandle(document: vscode.TextDocument): boolean {
        if (document.languageId === 'yaml') {
            return true;
        }

        // Also check by file extension
        const fileName = document.fileName.toLowerCase();
        return this.fileExtensions.some(ext => fileName.endsWith(ext));
    }

    /**
     * Extract reference for YAML
     */
    async extractReference(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<ReferenceFormat | null> {
        return measureAsync(
            'YamlHandler.extractReference',
            async () => {
                try {
                    // Get the relative file path
                    const filePath = ReferenceFormatter.getRelativePath(document.uri);

                    // Try to get cached symbols first
                    const cachedSymbols = this.getCachedSymbols(document);
                    let symbols = cachedSymbols;

                    if (!symbols) {
                        // Get symbols from VS Code language server
                        const fetchedSymbols = await SymbolResolver.getDocumentSymbols(document);
                        symbols = fetchedSymbols || null;

                        if (symbols) {
                            this.setCachedSymbols(document, symbols);
                        }
                    }

                    if (!symbols || symbols.length === 0) {
                        // No symbols, return file-only reference
                        return new ReferenceFormat(
                            filePath,
                            'standard',
                            undefined,
                            ':',
                            position.line + 1,
                            position.character + 1,
                            filePath
                        );
                    }

                    // Find the key at or containing the position
                    const { symbol, parents } = this.findKeyAtPosition(symbols, position);

                    if (!symbol && parents.length === 0) {
                        // No key found at position, return file reference
                        return new ReferenceFormat(
                            filePath,
                            'standard',
                            undefined,
                            ':',
                            position.line + 1,
                            position.character + 1,
                            filePath
                        );
                    }

                    // Build the key path
                    const keyPath = this.buildKeyPath(parents, symbol);

                    // Format the reference - YAML uses colon separator for file:path
                    // But dot notation for the path itself
                    return new ReferenceFormat(
                        filePath,
                        'standard',
                        keyPath,
                        '.',  // Use dot for path segments
                        undefined,
                        undefined,
                        filePath
                    );
                } catch (error) {
                    console.error('Failed to extract YAML reference:', error);
                    return null;
                }
            },
            { languageId: document.languageId }
        );
    }

    /**
     * Resolve symbol at position
     */
    async resolveSymbol(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<SymbolContext | null> {
        return measureAsync(
            'YamlHandler.resolveSymbol',
            async () => {
                try {
                    const symbols = await SymbolResolver.getDocumentSymbols(document);

                    if (!symbols) {
                        return null;
                    }

                    const { symbol, parents } = this.findKeyAtPosition(symbols, position);

                    if (!symbol && parents.length === 0) {
                        return null;
                    }

                    return new SymbolContext(
                        document,
                        position,
                        document.languageId,
                        symbol || parents[parents.length - 1],
                        parents,
                        undefined  // No specific framework
                    );
                } catch (error) {
                    console.error('Failed to resolve YAML symbol:', error);
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
        const filePath = ReferenceFormatter.getRelativePath(context.document.uri);

        if (!context.symbol) {
            // No symbol, return file-only reference
            return new ReferenceFormat(
                filePath,
                'standard',
                undefined,
                ':',
                context.position.line + 1,
                context.position.character + 1,
                filePath
            );
        }

        // Build key path from context
        const keyPath = this.buildKeyPath(context.parentSymbols, context.symbol);

        return new ReferenceFormat(
            filePath,
            'standard',
            keyPath,
            '.',
            undefined,
            undefined,
            filePath
        );
    }

    /**
     * Override toString to use colon separator between file and path
     */
    public toString(reference: ReferenceFormat): string {
        if (!reference.symbolPath || reference.symbolPath.length === 0) {
            return reference.filePath;
        }

        // Format array indices with brackets
        const formattedPath = reference.symbolPath.map(segment => {
            // Check if segment is a number (array index)
            if (/^\d+$/.test(segment)) {
                return `[${segment}]`;
            }
            return segment;
        }).reduce((acc, segment) => {
            // If segment starts with [, don't add dot
            if (segment.startsWith('[')) {
                return acc + segment;
            }
            return acc ? `${acc}.${segment}` : segment;
        }, '');

        // Use colon separator between file and path for YAML
        return `${reference.filePath}:${formattedPath}`;
    }

    /**
     * Find the key at or containing the given position
     */
    private findKeyAtPosition(
        symbols: vscode.DocumentSymbol[],
        position: vscode.Position
    ): { symbol: vscode.DocumentSymbol | undefined, parents: vscode.DocumentSymbol[] } {
        let bestSymbol: vscode.DocumentSymbol | undefined;
        let bestParents: vscode.DocumentSymbol[] = [];
        let bestRange: vscode.Range | null = null;

        const search = (syms: vscode.DocumentSymbol[], parents: vscode.DocumentSymbol[]) => {
            for (const symbol of syms) {
                // Check if position is within symbol's range
                if (symbol.range.contains(position)) {
                    // Check if this is a better match (smaller range)
                    if (!bestRange ||
                        (symbol.range.start.line >= bestRange.start.line &&
                         symbol.range.end.line <= bestRange.end.line)) {
                        bestSymbol = symbol;
                        bestParents = [...parents];
                        bestRange = symbol.range;
                    }

                    // Search nested symbols
                    if (symbol.children && symbol.children.length > 0) {
                        search(symbol.children, [...parents, symbol]);
                    }
                }
            }
        };

        search(symbols, []);
        return { symbol: bestSymbol, parents: bestParents };
    }

    /**
     * Build the key path from parents and current symbol
     */
    private buildKeyPath(
        parents: vscode.DocumentSymbol[],
        currentSymbol?: vscode.DocumentSymbol
    ): string[] {
        const path: string[] = [];

        // Add parent keys
        for (const parent of parents) {
            const key = this.extractKeyName(parent);
            if (key) {
                path.push(key);
            }
        }

        // Add current symbol key
        if (currentSymbol) {
            const key = this.extractKeyName(currentSymbol);
            if (key) {
                path.push(key);
            }
        }

        return path;
    }

    /**
     * Extract the key name from a symbol
     */
    private extractKeyName(symbol: vscode.DocumentSymbol): string {
        let name = symbol.name;

        // Handle array indices (e.g., "[0]", "[1]", etc.)
        const arrayMatch = name.match(/^\[(\d+)\]$/);
        if (arrayMatch) {
            return arrayMatch[1];
        }

        // Handle document markers (for multi-document YAML)
        if (name.startsWith('Document ')) {
            // Skip document markers in path
            return '';
        }

        // Remove any type annotations or decorations that VS Code might add
        // For example, some extensions add type info like "key: string"
        const colonIndex = name.indexOf(':');
        if (colonIndex > 0) {
            name = name.substring(0, colonIndex);
        }

        return name.trim();
    }
}