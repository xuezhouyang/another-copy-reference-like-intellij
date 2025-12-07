import * as vscode from 'vscode';
import { BaseLanguageHandler } from './base';
import { ReferenceFormat, SymbolContext } from '../types';
import { SymbolResolver } from '../utils/symbols';
import { measureAsync } from '../utils/performance';

/**
 * Handler for Java and Kotlin files
 * Generates references in the format: package.name.ClassName#methodName
 */
export class JavaHandler extends BaseLanguageHandler {
    constructor() {
        super(
            'java',
            ['.java', '.kt', '.kts'],
            80,  // High priority for Java/Kotlin
            false  // No specific framework support
        );
    }

    /**
     * Check if this handler can handle the document
     */
    canHandle(document: vscode.TextDocument): boolean {
        if (document.languageId === 'java' || document.languageId === 'kotlin') {
            return true;
        }

        // Also check by file extension
        const fileName = document.fileName.toLowerCase();
        return fileName.endsWith('.java') ||
               fileName.endsWith('.kt') ||
               fileName.endsWith('.kts');
    }

    /**
     * Extract reference for Java/Kotlin
     */
    async extractReference(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<ReferenceFormat | null> {
        return measureAsync(
            'JavaHandler.extractReference',
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

                    // Get package name
                    const packageName = await this.getPackageName(document);

                    if (!packageName) {
                        console.warn('Could not determine package name for Java/Kotlin file');
                        return null;
                    }

                    if (!symbols || symbols.length === 0) {
                        // No symbols found, return package-level reference
                        return new ReferenceFormat(
                            packageName,
                            'standard',
                            undefined,
                            '.',
                            position.line + 1,
                            position.character + 1,
                            packageName
                        );
                    }

                    // Find symbol at position
                    const { symbol, parents } = SymbolResolver.findSymbolAtPosition(
                        symbols,
                        position
                    );

                    // Find the class symbol (either from parents or current symbol)
                    const classSymbol = this.findClassSymbol(parents, symbol);

                    if (!classSymbol) {
                        // No class found, return package-level reference
                        return new ReferenceFormat(
                            packageName,
                            'standard',
                            undefined,
                            '.',
                            position.line + 1,
                            position.character + 1,
                            packageName
                        );
                    }

                    // Build symbol path for Java/Kotlin
                    const symbolPath = this.buildJavaSymbolPath(
                        packageName,
                        classSymbol,
                        symbol,
                        parents
                    );

                    // Determine if we have a method reference
                    const hasMethod = symbol &&
                                     symbol !== classSymbol &&
                                     (symbol.kind === vscode.SymbolKind.Method ||
                                      symbol.kind === vscode.SymbolKind.Constructor ||
                                      symbol.kind === vscode.SymbolKind.Function);

                    // Format the reference with # separator for methods
                    return new ReferenceFormat(
                        packageName,
                        'standard',
                        symbolPath,
                        hasMethod ? '#' : '.', // Use # for methods, . for classes
                        undefined,
                        undefined,
                        packageName
                    );
                } catch (error) {
                    console.error('Failed to extract Java/Kotlin reference:', error);
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
            'JavaHandler.resolveSymbol',
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
                    console.error('Failed to resolve Java/Kotlin symbol:', error);
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
        const packageName = this.getPackageNameSync(context.document);

        if (!packageName) {
            return null;
        }

        const classSymbol = this.findClassSymbol(context.parentSymbols, context.symbol);
        const symbolPath = this.buildJavaSymbolPath(
            packageName,
            classSymbol,
            context.symbol,
            context.parentSymbols
        );

        const hasMethod = context.symbol &&
                         context.symbol !== classSymbol &&
                         (context.symbol.kind === vscode.SymbolKind.Method ||
                          context.symbol.kind === vscode.SymbolKind.Constructor ||
                          context.symbol.kind === vscode.SymbolKind.Function);

        return new ReferenceFormat(
            packageName,
            'standard',
            symbolPath,
            hasMethod ? '#' : '.', // Use # for methods, . for classes
            undefined,
            undefined,
            packageName
        );
    }

    /**
     * Extract package name from Java/Kotlin file
     */
    private async getPackageName(document: vscode.TextDocument): Promise<string | null> {
        try {
            const content = document.getText();
            const lines = content.split('\n');

            // Look for package statement
            for (const line of lines) {
                const packageMatch = line.match(/package\s+([\w.]+)/);
                if (packageMatch) {
                    return packageMatch[1].trim();
                }
            }
        } catch (error) {
            console.error('Error reading package name:', error);
        }
        return null;
    }

    /**
     * Synchronous version of getPackageName for use in formatReference
     */
    private getPackageNameSync(document: vscode.TextDocument): string | null {
        try {
            const content = document.getText();
            const lines = content.split('\n');

            // Look for package statement
            for (const line of lines) {
                const packageMatch = line.match(/package\s+([\w.]+)/);
                if (packageMatch) {
                    return packageMatch[1].trim();
                }
            }
        } catch (error) {
            console.error('Error reading package name:', error);
        }
        return null;
    }

    /**
     * Find the class symbol from parents or current symbol
     */
    private findClassSymbol(
        parents: vscode.DocumentSymbol[],
        currentSymbol?: vscode.DocumentSymbol
    ): vscode.DocumentSymbol | undefined {
        // Check if current symbol is a class
        if (currentSymbol && this.isClassLike(currentSymbol)) {
            return currentSymbol;
        }

        // Look for class in parents (from innermost to outermost)
        for (let i = parents.length - 1; i >= 0; i--) {
            if (this.isClassLike(parents[i])) {
                return parents[i];
            }
        }

        return undefined;
    }

    /**
     * Check if a symbol is class-like
     */
    private isClassLike(symbol: vscode.DocumentSymbol): boolean {
        return symbol.kind === vscode.SymbolKind.Class ||
               symbol.kind === vscode.SymbolKind.Interface ||
               symbol.kind === vscode.SymbolKind.Enum ||
               symbol.kind === vscode.SymbolKind.Struct;
    }

    /**
     * Build Java/Kotlin-specific symbol path
     */
    private buildJavaSymbolPath(
        packageName: string,
        classSymbol: vscode.DocumentSymbol | undefined,
        currentSymbol: vscode.DocumentSymbol | undefined,
        parents: vscode.DocumentSymbol[]
    ): string[] {
        const path: string[] = [];

        // Add package name components
        path.push(...packageName.split('.'));

        if (!classSymbol) {
            return path;
        }

        // Build nested class path
        const classIndex = parents.indexOf(classSymbol);
        const nestedClasses: vscode.DocumentSymbol[] = [];

        // Add the main class
        nestedClasses.push(classSymbol);

        // Add any nested classes between classSymbol and currentSymbol
        if (classIndex >= 0 && currentSymbol && currentSymbol !== classSymbol) {
            for (let i = classIndex + 1; i < parents.length; i++) {
                if (this.isClassLike(parents[i])) {
                    nestedClasses.push(parents[i]);
                }
            }
        }

        // Add nested class names to path
        for (const cls of nestedClasses) {
            path.push(cls.name);
        }

        // Add method/field name if it's not a class
        if (currentSymbol && currentSymbol !== classSymbol && !this.isClassLike(currentSymbol)) {
            // Only add method name if we're referencing a method
            if (currentSymbol.kind === vscode.SymbolKind.Method ||
                currentSymbol.kind === vscode.SymbolKind.Constructor ||
                currentSymbol.kind === vscode.SymbolKind.Function) {
                path.push(currentSymbol.name);
            }
        }

        return path;
    }
}
