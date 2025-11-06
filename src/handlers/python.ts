import * as vscode from 'vscode';
import * as path from 'path';
import { BaseLanguageHandler } from './base';
import { ReferenceFormat, SymbolContext } from '../types';
import { ReferenceFormatter } from '../utils/formatting';
import { SymbolResolver } from '../utils/symbols';
import { measureAsync } from '../utils/performance';

/**
 * Handler for Python files
 * Generates references in the format: module.path.Class.method
 */
export class PythonHandler extends BaseLanguageHandler {
    constructor() {
        super(
            'python',
            ['.py', '.pyw'],
            75,  // High priority, but lower than JavaScript
            false  // No specific framework support
        );
    }

    /**
     * Check if this handler can handle the document
     */
    canHandle(document: vscode.TextDocument): boolean {
        if (document.languageId === 'python') {
            return true;
        }

        // Also check by file extension
        const fileName = document.fileName.toLowerCase();
        return fileName.endsWith('.py') || fileName.endsWith('.pyw');
    }

    /**
     * Extract reference for Python
     */
    async extractReference(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<ReferenceFormat | null> {
        return measureAsync(
            'PythonHandler.extractReference',
            async () => {
                try {
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

                    // Get Python module path
                    const modulePath = this.getPythonModulePath(document);

                    if (!symbols || symbols.length === 0) {
                        // No symbols, return module-level reference
                        return new ReferenceFormat(
                            modulePath,
                            'standard',
                            undefined,
                            '.',
                            position.line + 1,
                            position.character + 1,
                            modulePath
                        );
                    }

                    // Find symbol at position
                    const { symbol, parents } = SymbolResolver.findSymbolAtPosition(
                        symbols,
                        position
                    );

                    if (!symbol && parents.length === 0) {
                        // No symbol found at position, return module reference
                        return new ReferenceFormat(
                            modulePath,
                            'standard',
                            undefined,
                            '.',
                            position.line + 1,
                            position.character + 1,
                            modulePath
                        );
                    }

                    // Build symbol path for Python (uses . separator)
                    const symbolPath = this.buildPythonSymbolPath(parents, symbol);

                    // Format the reference
                    return new ReferenceFormat(
                        modulePath,
                        'standard',
                        symbolPath,
                        '.', // Python uses dot separator
                        undefined,
                        undefined,
                        modulePath
                    );
                } catch (error) {
                    console.error('Failed to extract Python reference:', error);
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
            'PythonHandler.resolveSymbol',
            async () => {
                try {
                    const symbols = await SymbolResolver.getDocumentSymbols(document);

                    if (!symbols) {
                        return null;
                    }

                    const { symbol, parents } = SymbolResolver.findSymbolAtPosition(
                        symbols,
                        position
                    );

                    return new SymbolContext(
                        document,
                        position,
                        document.languageId,
                        symbol,
                        parents,
                        undefined  // No specific framework
                    );
                } catch (error) {
                    console.error('Failed to resolve Python symbol:', error);
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
        const modulePath = this.getPythonModulePath(context.document);
        const symbolPath = context.getFullSymbolPath();

        return new ReferenceFormat(
            modulePath,
            'standard',
            symbolPath,
            '.', // Python uses dot separator
            undefined,
            undefined,
            modulePath
        );
    }

    /**
     * Get Python module path from file path
     */
    private getPythonModulePath(document: vscode.TextDocument): string {
        const filePath = ReferenceFormatter.getRelativePath(document.uri);

        // Handle __init__.py specially - use parent directory name
        if (path.basename(filePath) === '__init__.py') {
            const parentDir = path.dirname(filePath);
            // Convert path separators to dots for Python module notation
            return parentDir.replace(/\//g, '.').replace(/\\/g, '.');
        }

        // Remove .py extension
        let modulePath = filePath.replace(/\.(py|pyw)$/i, '');

        // Convert path separators to dots for Python module notation
        modulePath = modulePath.replace(/\//g, '.').replace(/\\/g, '.');

        // Remove common Python source directories if present
        const sourceDirs = ['src', 'lib', 'app'];
        for (const dir of sourceDirs) {
            if (modulePath.startsWith(`${dir}.`)) {
                modulePath = modulePath.substring(dir.length + 1);
                break;
            }
        }

        return modulePath;
    }

    /**
     * Build Python-specific symbol path
     */
    private buildPythonSymbolPath(
        parents: vscode.DocumentSymbol[],
        currentSymbol?: vscode.DocumentSymbol
    ): string[] {
        const path: string[] = [];

        // Build path from parents
        for (const parent of parents) {
            // Include classes and nested classes
            if (parent.kind === vscode.SymbolKind.Class) {
                path.push(parent.name);
            }
            // For Python, we might also want to include modules/namespaces
            else if (parent.kind === vscode.SymbolKind.Module ||
                     parent.kind === vscode.SymbolKind.Namespace) {
                path.push(parent.name);
            }
        }

        // Add current symbol
        if (currentSymbol) {
            // Special handling for Python decorators and properties
            const symbolName = currentSymbol.name;

            // Check if it's a property (might have @property decorator)
            if (currentSymbol.kind === vscode.SymbolKind.Property) {
                // Keep the property name as-is
                path.push(symbolName);
            }
            // Check for special methods
            else if (symbolName.startsWith('__') && symbolName.endsWith('__')) {
                // Python magic methods
                path.push(symbolName);
            }
            else {
                // Regular methods and functions
                path.push(symbolName);
            }
        }

        return path;
    }

}