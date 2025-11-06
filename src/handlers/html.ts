import * as vscode from 'vscode';
import { BaseLanguageHandler } from './base';
import { ReferenceFormat, SymbolContext } from '../types';
import { ReferenceFormatter } from '../utils/formatting';
import { SymbolResolver } from '../utils/symbols';
import { measureAsync } from '../utils/performance';

/**
 * Handler for HTML and XML files
 * Generates references using element IDs or XPath-like selectors
 */
export class HtmlHandler extends BaseLanguageHandler {
    constructor() {
        super(
            'html',
            ['.html', '.htm', '.xhtml', '.xml', '.svg'],
            50,  // Medium-low priority
            false  // No specific framework support
        );
    }

    /**
     * Check if this handler can handle the document
     */
    canHandle(document: vscode.TextDocument): boolean {
        const languageId = document.languageId;
        if (languageId === 'html' || languageId === 'xml' || languageId === 'xhtml') {
            return true;
        }

        // Also check by file extension
        const fileName = document.fileName.toLowerCase();
        return this.fileExtensions.some(ext => fileName.endsWith(ext));
    }

    /**
     * Extract reference for HTML/XML
     */
    async extractReference(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<ReferenceFormat | null> {
        return measureAsync(
            'HtmlHandler.extractReference',
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
                        // No symbols, try to extract from document text
                        const elementInfo = this.findElementAtPosition(document, position);

                        if (elementInfo) {
                            return new ReferenceFormat(
                                filePath,
                                'standard',
                                [elementInfo],
                                '#',
                                position.line + 1,
                                position.character + 1,
                                filePath
                            );
                        }

                        // No element found, return file-only reference
                        return new ReferenceFormat(
                            filePath,
                            'standard',
                            undefined,
                            '#',
                            position.line + 1,
                            position.character + 1,
                            filePath
                        );
                    }

                    // Find the element at or containing the position
                    const element = this.findElementSymbolAtPosition(symbols, position);

                    if (!element) {
                        // No element found, return file-only reference
                        return new ReferenceFormat(
                            filePath,
                            'standard',
                            undefined,
                            '#',
                            position.line + 1,
                            position.character + 1,
                            filePath
                        );
                    }

                    // Extract identifier from element
                    const identifier = this.extractElementIdentifier(element);

                    if (!identifier) {
                        // No identifier, generate XPath-like reference
                        const xpath = this.generateXPathReference(element, symbols);
                        return new ReferenceFormat(
                            filePath,
                            'standard',
                            [xpath],
                            '#',
                            undefined,
                            undefined,
                            filePath
                        );
                    }

                    // Format the reference
                    return new ReferenceFormat(
                        filePath,
                        'standard',
                        [identifier],
                        '#', // HTML/XML uses # for ID references
                        undefined,
                        undefined,
                        filePath
                    );
                } catch (error) {
                    console.error('Failed to extract HTML/XML reference:', error);
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
            'HtmlHandler.resolveSymbol',
            async () => {
                try {
                    const symbols = await SymbolResolver.getDocumentSymbols(document);

                    if (!symbols) {
                        return null;
                    }

                    const element = this.findElementSymbolAtPosition(symbols, position);

                    if (!element) {
                        return null;
                    }

                    // Find parent elements
                    const parents = this.findParentElements(symbols, element);

                    return new SymbolContext(
                        document,
                        position,
                        document.languageId,
                        element,
                        parents,
                        undefined  // No specific framework
                    );
                } catch (error) {
                    console.error('Failed to resolve HTML/XML symbol:', error);
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
                '#',
                context.position.line + 1,
                context.position.character + 1,
                filePath
            );
        }

        // Extract identifier from symbol
        const identifier = this.extractElementIdentifier(context.symbol);

        if (!identifier) {
            // Generate XPath-like reference
            const xpath = this.generateXPathReference(context.symbol, []);
            return new ReferenceFormat(
                filePath,
                'standard',
                [xpath],
                '#',
                undefined,
                undefined,
                filePath
            );
        }

        return new ReferenceFormat(
            filePath,
            'standard',
            [identifier],
            '#',
            undefined,
            undefined,
            filePath
        );
    }

    /**
     * Find element at position by parsing document text
     */
    private findElementAtPosition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): string | null {
        const line = document.lineAt(position.line).text;
        const offset = position.character;

        // Look for ID attribute
        const idMatch = line.match(/id\s*=\s*["']([^"']+)["']/);
        if (idMatch && idMatch.index !== undefined) {
            const idStart = idMatch.index;
            const idEnd = idStart + idMatch[0].length;
            if (offset >= idStart && offset <= idEnd) {
                return idMatch[1];
            }
        }

        // Look for name attribute (for forms)
        const nameMatch = line.match(/name\s*=\s*["']([^"']+)["']/);
        if (nameMatch && nameMatch.index !== undefined) {
            const nameStart = nameMatch.index;
            const nameEnd = nameStart + nameMatch[0].length;
            if (offset >= nameStart && offset <= nameEnd) {
                return nameMatch[1];
            }
        }

        // Look for data-id or data-component attribute
        const dataIdMatch = line.match(/data-(?:id|component)\s*=\s*["']([^"']+)["']/);
        if (dataIdMatch && dataIdMatch.index !== undefined) {
            const dataStart = dataIdMatch.index;
            const dataEnd = dataStart + dataIdMatch[0].length;
            if (offset >= dataStart && offset <= dataEnd) {
                return dataIdMatch[1];
            }
        }

        // Look for class attribute
        const classMatch = line.match(/class\s*=\s*["']([^"']+)["']/);
        if (classMatch && classMatch.index !== undefined) {
            const classStart = classMatch.index;
            const classEnd = classStart + classMatch[0].length;
            if (offset >= classStart && offset <= classEnd) {
                // Return first class with a dot prefix
                const classes = classMatch[1].split(/\s+/);
                if (classes.length > 0) {
                    return '.' + classes[0];
                }
            }
        }

        return null;
    }

    /**
     * Find the element symbol at or containing the given position
     */
    private findElementSymbolAtPosition(
        symbols: vscode.DocumentSymbol[],
        position: vscode.Position
    ): vscode.DocumentSymbol | null {
        let bestElement: vscode.DocumentSymbol | null = null;
        let bestRange: vscode.Range | null = null;

        const searchSymbols = (syms: vscode.DocumentSymbol[]) => {
            for (const symbol of syms) {
                // Check if position is within symbol's range
                if (symbol.range.contains(position)) {
                    // Check if this is a better match (smaller range)
                    if (!bestRange ||
                        (symbol.range.start.line >= bestRange.start.line &&
                         symbol.range.end.line <= bestRange.end.line)) {
                        bestElement = symbol;
                        bestRange = symbol.range;
                    }
                }

                // Search nested symbols
                if (symbol.children && symbol.children.length > 0) {
                    searchSymbols(symbol.children);
                }
            }
        };

        searchSymbols(symbols);
        return bestElement;
    }

    /**
     * Extract identifier from element symbol
     */
    private extractElementIdentifier(symbol: vscode.DocumentSymbol): string | null {
        const name = symbol.name;

        // Check for ID selector (e.g., "div#main-content" or "#header")
        const idMatch = name.match(/#([a-zA-Z0-9_-]+)/);
        if (idMatch) {
            return idMatch[1];
        }

        // Check for name attribute (e.g., "input[name='email']")
        const nameMatch = name.match(/\[name=['"]?([^'"\]]+)['"]?\]/);
        if (nameMatch) {
            return nameMatch[1];
        }

        // Check for data attributes (e.g., "div[data-component='carousel']")
        const dataMatch = name.match(/\[data-(?:id|component)=['"]?([^'"\]]+)['"]?\]/);
        if (dataMatch) {
            return dataMatch[1];
        }

        // Check for class selector (e.g., ".header" or "div.header")
        const classMatch = name.match(/\.([a-zA-Z0-9_-]+)/);
        if (classMatch) {
            return '.' + classMatch[1];
        }

        // For simple element names, check if it has special meaning
        if (name.match(/^[a-z]+$/i)) {
            // Don't return generic element names
            return null;
        }

        return null;
    }

    /**
     * Find parent elements for a given element
     */
    private findParentElements(
        symbols: vscode.DocumentSymbol[],
        target: vscode.DocumentSymbol
    ): vscode.DocumentSymbol[] {
        const parents: vscode.DocumentSymbol[] = [];

        const search = (syms: vscode.DocumentSymbol[], currentParents: vscode.DocumentSymbol[]): boolean => {
            for (const symbol of syms) {
                if (symbol === target) {
                    parents.push(...currentParents);
                    return true;
                }

                if (symbol.children && symbol.children.length > 0) {
                    const newParents = [...currentParents, symbol];
                    if (search(symbol.children, newParents)) {
                        return true;
                    }
                }
            }
            return false;
        };

        search(symbols, []);
        return parents;
    }

    /**
     * Generate XPath-like reference for element without ID
     */
    private generateXPathReference(
        element: vscode.DocumentSymbol,
        allSymbols: vscode.DocumentSymbol[]
    ): string {
        const name = element.name;

        // Extract element tag name
        const tagMatch = name.match(/^([a-z]+)/i);
        const tagName = tagMatch ? tagMatch[1] : 'element';

        // Try to extract any unique attribute
        const classMatch = name.match(/\.([a-zA-Z0-9_-]+)/);
        if (classMatch) {
            return `//${tagName}[@class='${classMatch[1]}']`;
        }

        // Check for other attributes
        const attrMatch = name.match(/\[([^=]+)=['"]?([^'"\]]+)['"]?\]/);
        if (attrMatch) {
            return `//${tagName}[@${attrMatch[1]}='${attrMatch[2]}']`;
        }

        // Generate positional XPath
        let position = 1;
        if (allSymbols.length > 0) {
            // Count siblings with the same tag name
            for (const sym of allSymbols) {
                if (sym === element) {
                    break;
                }
                const symTagMatch = sym.name.match(/^([a-z]+)/i);
                if (symTagMatch && symTagMatch[1] === tagName) {
                    position++;
                }
            }
        }

        return `//${tagName}[${position}]`;
    }
}