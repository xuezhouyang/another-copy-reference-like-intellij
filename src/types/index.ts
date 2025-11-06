import * as vscode from 'vscode';

/**
 * Language handler interface for processing different file types
 */
export interface ILanguageHandler {
    languageId: string;
    fileExtensions: string[];
    priority: number;
    supportsFrameworks: boolean;

    canHandle(document: vscode.TextDocument): boolean;
    extractReference(document: vscode.TextDocument, position: vscode.Position): Promise<ReferenceFormat | null>;
    resolveSymbol(document: vscode.TextDocument, position: vscode.Position): Promise<SymbolContext | null>;
}

/**
 * Reference format structure
 */
export class ReferenceFormat {
    constructor(
        public filePath: string,
        public formatType: 'standard' | 'fallback' = 'standard',
        public symbolPath?: string[],
        public separator: string = '#',
        public lineNumber?: number,
        public columnNumber?: number,
        public modulePath?: string,
        public frameworkType?: string
    ) {}

    toString(): string {
        if (this.formatType === 'fallback') {
            return `${this.filePath}:${this.lineNumber}:${this.columnNumber}`;
        }

        const basePath = this.modulePath || this.filePath;
        if (this.symbolPath && this.symbolPath.length > 0) {
            return `${basePath}${this.separator}${this.symbolPath.join('.')}`;
        }
        return basePath;
    }

    validate(): boolean {
        if (!this.filePath) return false;
        if (this.formatType === 'fallback' && (!this.lineNumber || this.lineNumber < 1)) return false;
        if (this.symbolPath) {
            return !this.symbolPath.some(part => part.includes(this.separator));
        }
        return true;
    }
}

/**
 * Symbol context information
 */
export class SymbolContext {
    constructor(
        public document: vscode.TextDocument,
        public position: vscode.Position,
        public languageId: string,
        public symbol?: vscode.DocumentSymbol,
        public parentSymbols: vscode.DocumentSymbol[] = [],
        public frameworkType?: string
    ) {}

    getFullSymbolPath(): string[] {
        const path: string[] = [];
        this.parentSymbols.forEach(parent => path.push(parent.name));
        if (this.symbol) {
            path.push(this.symbol.name);
        }
        return path;
    }

    isInsideSymbol(): boolean {
        return this.symbol !== undefined;
    }

    getContainingClass(): vscode.DocumentSymbol | undefined {
        return this.parentSymbols.find(s =>
            s.kind === vscode.SymbolKind.Class ||
            s.kind === vscode.SymbolKind.Interface
        );
    }

    getContainingMethod(): vscode.DocumentSymbol | undefined {
        if (this.symbol && (this.symbol.kind === vscode.SymbolKind.Method ||
                           this.symbol.kind === vscode.SymbolKind.Function)) {
            return this.symbol;
        }
        return this.parentSymbols.find(s =>
            s.kind === vscode.SymbolKind.Method ||
            s.kind === vscode.SymbolKind.Function
        );
    }
}

/**
 * Clipboard entry for reference copying
 */
export class ClipboardEntry {
    public timestamp: Date;

    constructor(
        public content: string,
        public success: boolean,
        public languageHandler?: string,
        public source?: {
            uri: string;
            languageId: string;
        }
    ) {
        this.timestamp = new Date();
    }

    async copyToClipboard(): Promise<boolean> {
        try {
            await vscode.env.clipboard.writeText(this.content);
            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    }

    validate(): boolean {
        return this.content.length > 0 && this.content.length <= 32768;
    }
}

/**
 * Handler configuration
 */
export interface HandlerConfiguration {
    enabled: boolean;
    customPatterns?: PatternConfig[];
    referenceTemplate?: string;
    useBuiltInSymbols: boolean;
    frameworkDetection: boolean;
}

/**
 * Pattern configuration for custom patterns
 */
export interface PatternConfig {
    pattern: string;
    symbolKind: vscode.SymbolKind;
    name?: string;
}

/**
 * Cache entry for symbol caching
 */
export class CacheEntry {
    public timestamp: Date;
    public accessCount: number = 0;

    constructor(
        public documentUri: string,
        public documentVersion: number,
        public symbols: vscode.DocumentSymbol[]
    ) {
        this.timestamp = new Date();
    }

    isValid(document: vscode.TextDocument): boolean {
        return document.uri.toString() === this.documentUri &&
               document.version === this.documentVersion;
    }

    touch(): void {
        this.accessCount++;
    }

    getAge(): number {
        return Date.now() - this.timestamp.getTime();
    }
}