import * as vscode from 'vscode';
import { BaseLanguageHandler } from './base';
import { ReferenceFormat, SymbolContext } from '../types';
import { ReferenceFormatter } from '../utils/formatting';
import { SymbolResolver } from '../utils/symbols';
import { measureAsync } from '../utils/performance';

/**
 * Handler for Markdown files
 * Generates references with GitHub-compatible anchor links
 */
export class MarkdownHandler extends BaseLanguageHandler {
    constructor() {
        super(
            'markdown',
            ['.md', '.markdown', '.mdown', '.mkd'],
            60,  // Medium priority
            false  // No framework support
        );
    }

    /**
     * Check if this handler can handle the document
     */
    canHandle(document: vscode.TextDocument): boolean {
        if (document.languageId === 'markdown') {
            return true;
        }

        // Also check by file extension
        const fileName = document.fileName.toLowerCase();
        return this.fileExtensions.some(ext => fileName.endsWith(ext));
    }

    /**
     * Extract reference for Markdown
     */
    async extractReference(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<ReferenceFormat | null> {
        return measureAsync(
            'MarkdownHandler.extractReference',
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
                            '#',
                            position.line + 1,
                            position.character + 1,
                            filePath
                        );
                    }

                    // Find the heading at or before the current position
                    const heading = this.findHeadingAtPosition(symbols, position);

                    if (!heading) {
                        // No heading found, return file-only reference
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

                    // Generate GitHub-compatible anchor from heading name
                    const anchor = this.generateGitHubAnchor(heading.name, symbols);

                    // Format the reference
                    return new ReferenceFormat(
                        filePath,
                        'standard',
                        [anchor],
                        '#', // Markdown uses # for anchors
                        undefined,
                        undefined,
                        filePath
                    );
                } catch (error) {
                    console.error('Failed to extract Markdown reference:', error);
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
            'MarkdownHandler.resolveSymbol',
            async () => {
                try {
                    const symbols = await SymbolResolver.getDocumentSymbols(document);

                    if (!symbols) {
                        return null;
                    }

                    const heading = this.findHeadingAtPosition(symbols, position);

                    if (!heading) {
                        return null;
                    }

                    // Find parent headings if any
                    const parents = this.findParentHeadings(symbols, heading);

                    return new SymbolContext(
                        document,
                        position,
                        document.languageId,
                        heading,
                        parents,
                        undefined  // No specific framework
                    );
                } catch (error) {
                    console.error('Failed to resolve Markdown symbol:', error);
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

        // Generate GitHub-compatible anchor
        const anchor = this.generateGitHubAnchor(context.symbol.name, []);

        return new ReferenceFormat(
            filePath,
            'standard',
            [anchor],
            '#',
            undefined,
            undefined,
            filePath
        );
    }

    /**
     * Find the heading at or before the given position
     */
    private findHeadingAtPosition(
        symbols: vscode.DocumentSymbol[],
        position: vscode.Position
    ): vscode.DocumentSymbol | null {
        let bestHeading: vscode.DocumentSymbol | null = null;
        let bestLine = -1;

        const searchSymbols = (syms: vscode.DocumentSymbol[]) => {
            for (const symbol of syms) {
                // In Markdown, headings are typically marked as String or other symbol kinds
                if (this.isHeadingSymbol(symbol)) {
                    const symbolLine = symbol.range.start.line;
                    // Find the heading at or before the position
                    if (symbolLine <= position.line && symbolLine > bestLine) {
                        bestHeading = symbol;
                        bestLine = symbolLine;
                    }
                }

                // Search nested symbols
                if (symbol.children && symbol.children.length > 0) {
                    searchSymbols(symbol.children);
                }
            }
        };

        searchSymbols(symbols);
        return bestHeading;
    }

    /**
     * Check if a symbol represents a markdown heading
     */
    private isHeadingSymbol(symbol: vscode.DocumentSymbol): boolean {
        // VS Code typically marks headings as String symbols in Markdown
        // Some extensions might use other kinds
        return symbol.kind === vscode.SymbolKind.String ||
               symbol.kind === vscode.SymbolKind.Constant ||
               symbol.kind === vscode.SymbolKind.Module ||
               symbol.kind === vscode.SymbolKind.Namespace;
    }

    /**
     * Find parent headings for a given heading
     */
    private findParentHeadings(
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
                    const newParents = [...currentParents];
                    if (this.isHeadingSymbol(symbol)) {
                        newParents.push(symbol);
                    }
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
     * Generate a GitHub-compatible anchor from heading text
     */
    private generateGitHubAnchor(
        headingText: string,
        allSymbols: vscode.DocumentSymbol[]
    ): string {
        // Remove emoji (basic implementation)
        let anchor = headingText.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim();

        // Convert to lowercase
        anchor = anchor.toLowerCase();

        // Replace spaces and special characters with hyphens
        anchor = anchor.replace(/[^\w\u4e00-\u9fa5]+/g, '-');

        // Remove leading and trailing hyphens
        anchor = anchor.replace(/^-+|-+$/g, '');

        // Handle duplicates by checking all symbols
        if (allSymbols.length > 0) {
            const anchorCounts = new Map<string, number>();

            // Count all anchors
            const countAnchors = (syms: vscode.DocumentSymbol[]) => {
                for (const sym of syms) {
                    if (this.isHeadingSymbol(sym)) {
                        const symAnchor = this.generateGitHubAnchor(sym.name, []);
                        const count = anchorCounts.get(symAnchor) || 0;
                        anchorCounts.set(symAnchor, count + 1);
                    }
                    if (sym.children) {
                        countAnchors(sym.children);
                    }
                }
            };

            countAnchors(allSymbols);

            // If there are duplicates, add a number suffix
            const count = anchorCounts.get(anchor) || 0;
            if (count > 1) {
                // Find which occurrence this is
                let occurrenceIndex = 0;
                const findOccurrence = (syms: vscode.DocumentSymbol[]): boolean => {
                    for (const sym of syms) {
                        if (this.isHeadingSymbol(sym)) {
                            const symAnchor = this.generateGitHubAnchor(sym.name, []);
                            if (symAnchor === anchor) {
                                if (sym.name === headingText) {
                                    return true;
                                }
                                occurrenceIndex++;
                            }
                        }
                        if (sym.children && findOccurrence(sym.children)) {
                            return true;
                        }
                    }
                    return false;
                };

                findOccurrence(allSymbols);

                if (occurrenceIndex > 0) {
                    anchor = `${anchor}-${occurrenceIndex}`;
                }
            }
        }

        return anchor;
    }
}