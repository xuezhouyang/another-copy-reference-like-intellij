import * as vscode from 'vscode';

/**
 * Symbol resolution utilities
 */
export class SymbolResolver {
    /**
     * Get symbols from VS Code language server
     */
    static async getDocumentSymbols(document: vscode.TextDocument): Promise<vscode.DocumentSymbol[] | undefined> {
        try {
            const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
                'vscode.executeDocumentSymbolProvider',
                document.uri
            );
            return symbols;
        } catch (error) {
            console.error('Failed to get document symbols:', error);
            return undefined;
        }
    }

    /**
     * Find symbol at position
     */
    static findSymbolAtPosition(
        symbols: vscode.DocumentSymbol[],
        position: vscode.Position
    ): { symbol?: vscode.DocumentSymbol; parents: vscode.DocumentSymbol[] } {
        return this.findSymbolRecursive(symbols, position, []);
    }

    /**
     * Recursively find symbol at position
     */
    private static findSymbolRecursive(
        symbols: vscode.DocumentSymbol[],
        position: vscode.Position,
        parents: vscode.DocumentSymbol[]
    ): { symbol?: vscode.DocumentSymbol; parents: vscode.DocumentSymbol[] } {
        for (const symbol of symbols) {
            if (symbol.range.contains(position)) {
                // Check children first for more specific match
                if (symbol.children && symbol.children.length > 0) {
                    const childResult = this.findSymbolRecursive(
                        symbol.children,
                        position,
                        [...parents, symbol]
                    );
                    if (childResult.symbol) {
                        return childResult;
                    }
                }

                // Return this symbol if position is within selection range
                if (symbol.selectionRange.contains(position)) {
                    return { symbol, parents };
                }
            }
        }

        return { symbol: undefined, parents };
    }

    /**
     * Check if symbol is a class
     */
    static isClass(symbol: vscode.DocumentSymbol): boolean {
        return symbol.kind === vscode.SymbolKind.Class ||
               symbol.kind === vscode.SymbolKind.Interface;
    }

    /**
     * Check if symbol is a method or function
     */
    static isMethod(symbol: vscode.DocumentSymbol): boolean {
        return symbol.kind === vscode.SymbolKind.Method ||
               symbol.kind === vscode.SymbolKind.Function ||
               symbol.kind === vscode.SymbolKind.Constructor;
    }

    /**
     * Check if symbol is a property or field
     */
    static isProperty(symbol: vscode.DocumentSymbol): boolean {
        return symbol.kind === vscode.SymbolKind.Property ||
               symbol.kind === vscode.SymbolKind.Field ||
               symbol.kind === vscode.SymbolKind.Variable;
    }

    /**
     * Get symbol kind name
     */
    static getSymbolKindName(kind: vscode.SymbolKind): string {
        const kindNames: { [key: number]: string } = {
            [vscode.SymbolKind.File]: 'File',
            [vscode.SymbolKind.Module]: 'Module',
            [vscode.SymbolKind.Namespace]: 'Namespace',
            [vscode.SymbolKind.Package]: 'Package',
            [vscode.SymbolKind.Class]: 'Class',
            [vscode.SymbolKind.Method]: 'Method',
            [vscode.SymbolKind.Property]: 'Property',
            [vscode.SymbolKind.Field]: 'Field',
            [vscode.SymbolKind.Constructor]: 'Constructor',
            [vscode.SymbolKind.Enum]: 'Enum',
            [vscode.SymbolKind.Interface]: 'Interface',
            [vscode.SymbolKind.Function]: 'Function',
            [vscode.SymbolKind.Variable]: 'Variable',
            [vscode.SymbolKind.Constant]: 'Constant',
            [vscode.SymbolKind.String]: 'String',
            [vscode.SymbolKind.Number]: 'Number',
            [vscode.SymbolKind.Boolean]: 'Boolean',
            [vscode.SymbolKind.Array]: 'Array',
            [vscode.SymbolKind.Object]: 'Object',
            [vscode.SymbolKind.Key]: 'Key',
            [vscode.SymbolKind.Null]: 'Null',
            [vscode.SymbolKind.EnumMember]: 'EnumMember',
            [vscode.SymbolKind.Struct]: 'Struct',
            [vscode.SymbolKind.Event]: 'Event',
            [vscode.SymbolKind.Operator]: 'Operator',
            [vscode.SymbolKind.TypeParameter]: 'TypeParameter'
        };

        return kindNames[kind] || 'Unknown';
    }

    /**
     * Build symbol path from parents and current symbol
     */
    static buildSymbolPath(
        parents: vscode.DocumentSymbol[],
        currentSymbol?: vscode.DocumentSymbol
    ): string[] {
        const path: string[] = [];

        for (const parent of parents) {
            path.push(parent.name);
        }

        if (currentSymbol) {
            path.push(currentSymbol.name);
        }

        return path;
    }
}