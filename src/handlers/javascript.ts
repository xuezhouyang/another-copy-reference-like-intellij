import * as vscode from 'vscode';
import * as path from 'path';
import { BaseLanguageHandler } from './base';
import { ReferenceFormat, SymbolContext } from '../types';
import { ReferenceFormatter } from '../utils/formatting';
import { SymbolResolver } from '../utils/symbols';
import { measureAsync } from '../utils/performance';

/**
 * Handler for JavaScript, TypeScript, JSX, and TSX files
 * Generates references in the format: module/path.Class#method
 */
export class JavaScriptHandler extends BaseLanguageHandler {
    constructor() {
        super(
            'javascript',
            ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'],
            80,  // High priority
            true  // Supports frameworks (React)
        );
    }

    /**
     * Check if this handler can handle the document
     */
    canHandle(document: vscode.TextDocument): boolean {
        const supportedLanguages = [
            'javascript',
            'javascriptreact',
            'typescript',
            'typescriptreact'
        ];

        if (supportedLanguages.includes(document.languageId)) {
            return true;
        }

        // Also check by file extension
        return super.canHandle(document);
    }

    /**
     * Extract reference for JavaScript/TypeScript
     */
    async extractReference(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<ReferenceFormat | null> {
        return measureAsync(
            'JavaScriptHandler.extractReference',
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

                    // Get module path
                    const modulePath = this.getModulePath(document);

                    if (!symbols || symbols.length === 0) {
                        // No symbols, return module-level reference
                        return new ReferenceFormat(
                            modulePath,
                            'standard',
                            undefined,
                            '#',
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
                            '#',
                            position.line + 1,
                            position.character + 1,
                            modulePath
                        );
                    }

                    // Build symbol path
                    const symbolPath = SymbolResolver.buildSymbolPath(parents, symbol);

                    // Detect React framework
                    const frameworkType = this.detectReactFramework(document, symbol, parents);

                    // Format the reference
                    return new ReferenceFormat(
                        modulePath,
                        'standard',
                        symbolPath,
                        '#',
                        undefined,
                        undefined,
                        modulePath,
                        frameworkType
                    );
                } catch (error) {
                    console.error('Failed to extract JavaScript reference:', error);
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
            'JavaScriptHandler.resolveSymbol',
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

                    // Detect framework type
                    const frameworkType = this.detectReactFramework(document, symbol, parents);

                    return new SymbolContext(
                        document,
                        position,
                        document.languageId,
                        symbol,
                        parents,
                        frameworkType
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
        const modulePath = this.getModulePath(context.document);
        const symbolPath = context.getFullSymbolPath();

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
     * Get module path from file path
     */
    private getModulePath(document: vscode.TextDocument): string {
        const filePath = ReferenceFormatter.getRelativePath(document.uri);

        // Remove file extension
        let modulePath = filePath.replace(/\.(js|jsx|ts|tsx|mjs|cjs)$/i, '');

        // Handle index files - use parent directory name
        if (path.basename(modulePath) === 'index') {
            modulePath = path.dirname(modulePath);
        }

        // Remove 'src/' prefix if present
        if (modulePath.startsWith('src/')) {
            modulePath = modulePath.substring(4);
        }

        // Convert backslashes to forward slashes
        modulePath = modulePath.replace(/\\/g, '/');

        return modulePath;
    }


    /**
     * Detect framework (React detection for JS/TS)
     */
    protected async detectFramework(document: vscode.TextDocument): Promise<string | undefined> {
        // Check for React imports
        const text = document.getText();

        // Look for React imports
        if (/import\s+.*\s+from\s+['"]react['"]/.test(text) ||
            /require\s*\(\s*['"]react['"]\s*\)/.test(text)) {
            return 'react';
        }

        // Check file extension for React
        if (['javascriptreact', 'typescriptreact'].includes(document.languageId)) {
            return 'react';
        }

        // Check for JSX syntax
        if (/<[A-Z]\w*/.test(text) || /<\/\w+>/.test(text)) {
            return 'react';
        }

        // Check for Vue
        if (/import\s+.*\s+from\s+['"]vue['"]/.test(text) ||
            /require\s*\(\s*['"]vue['"]\s*\)/.test(text)) {
            return 'vue';
        }

        // Check for Angular
        if (/@Component\s*\(/.test(text) || /@Injectable\s*\(/.test(text)) {
            return 'angular';
        }

        return undefined;
    }

    /**
     * Enhanced React framework detection with component/hook recognition
     */
    private detectReactFramework(
        document: vscode.TextDocument,
        symbol?: vscode.DocumentSymbol,
        _parents?: vscode.DocumentSymbol[]
    ): string | undefined {
        const text = document.getText();

        // Quick check for React imports or JSX file extensions
        const isReactFile = /import\s+.*\s+from\s+['"]react['"]/.test(text) ||
                          /require\s*\(\s*['"]react['"]\s*\)/.test(text) ||
                          ['javascriptreact', 'typescriptreact'].includes(document.languageId) ||
                          document.fileName.endsWith('.jsx') ||
                          document.fileName.endsWith('.tsx');

        if (!isReactFile) {
            // Also check for JSX syntax as fallback
            if (/<[A-Z]\w*/.test(text) || /<\/\w+>/.test(text)) {
                return 'react';
            }
            return undefined;
        }

        // If we have a symbol, check if it's a React component or hook
        if (symbol) {
            const symbolName = symbol.name;

            // Check for functional components (uppercase first letter)
            if (/^[A-Z]/.test(symbolName) &&
                (symbol.kind === vscode.SymbolKind.Function ||
                 symbol.kind === vscode.SymbolKind.Variable ||
                 symbol.kind === vscode.SymbolKind.Constant)) {
                return 'react';
            }

            // Check for class components
            if (symbol.kind === vscode.SymbolKind.Class) {
                // Check if extends React.Component or Component
                const symbolRange = symbol.range;
                const symbolText = document.getText(symbolRange);
                if (/extends\s+(React\.)?Component/.test(symbolText) ||
                    /extends\s+(React\.)?PureComponent/.test(symbolText)) {
                    return 'react';
                }
            }

            // Check for custom hooks (use prefix)
            if (/^use[A-Z]/.test(symbolName) &&
                symbol.kind === vscode.SymbolKind.Function) {
                return 'react';
            }

            // Check for HOCs (with prefix)
            if (/^with[A-Z]/.test(symbolName) &&
                symbol.kind === vscode.SymbolKind.Function) {
                return 'react';
            }

            // Check for React Context (Provider/Consumer pattern)
            if (symbolName.endsWith('Provider') ||
                symbolName.endsWith('Consumer') ||
                symbolName.endsWith('Context')) {
                return 'react';
            }

            // Check for memo/forwardRef wrapped components
            const lineText = document.lineAt(symbol.range.start.line).text;
            if (/React\.memo\s*\(/.test(lineText) ||
                /React\.forwardRef\s*\(/.test(lineText) ||
                /memo\s*\(/.test(lineText) ||
                /forwardRef\s*\(/.test(lineText)) {
                return 'react';
            }
        }

        // If no specific React patterns found but file has React imports, still mark as React
        return isReactFile ? 'react' : undefined;
    }

}