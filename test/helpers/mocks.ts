import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Create a mock TextDocument for testing
 */
export function createMockDocument(
    fileName: string,
    languageId: string,
    content: string,
    isUntitled: boolean = false
): vscode.TextDocument {
    const lines = content.split('\n');

    // Create mock URI
    const mockUri: vscode.Uri = {
        scheme: isUntitled ? 'untitled' : 'file',
        authority: '',
        path: isUntitled ? fileName : path.resolve('/', fileName),
        query: '',
        fragment: '',
        fsPath: isUntitled ? fileName : path.resolve('/', fileName),
        with: function() { return this; },
        toString: function() { return this.fsPath; },
        toJSON: function() { return { scheme: this.scheme, path: this.path }; }
    };

    // Create mock document
    const mockDoc: vscode.TextDocument = {
        uri: mockUri,
        fileName: mockUri.fsPath,
        isUntitled,
        languageId,
        version: 1,
        isDirty: false,
        isClosed: false,
        eol: vscode.EndOfLine.LF,
        lineCount: lines.length,

        lineAt: (lineOrPosition: number | vscode.Position): vscode.TextLine => {
            const lineNumber = typeof lineOrPosition === 'number'
                ? lineOrPosition
                : lineOrPosition.line;

            const text = lines[lineNumber] || '';
            const range = createMockRange(lineNumber, 0, lineNumber, text.length);

            return {
                lineNumber,
                text,
                range,
                rangeIncludingLineBreak: range,
                firstNonWhitespaceCharacterIndex: text.search(/\S/),
                isEmptyOrWhitespace: text.trim().length === 0
            };
        },

        offsetAt: (position: vscode.Position): number => {
            let offset = 0;
            for (let i = 0; i < position.line && i < lines.length; i++) {
                offset += lines[i].length + 1; // +1 for newline
            }
            offset += position.character;
            return offset;
        },

        positionAt: (offset: number): vscode.Position => {
            let currentOffset = 0;
            for (let i = 0; i < lines.length; i++) {
                const lineLength = lines[i].length + 1;
                if (currentOffset + lineLength > offset) {
                    return createMockPosition(i, offset - currentOffset);
                }
                currentOffset += lineLength;
            }
            return createMockPosition(lines.length - 1, lines[lines.length - 1].length);
        },

        getText: (range?: vscode.Range): string => {
            if (!range) {
                return content;
            }

            if (range.start.line === range.end.line) {
                return lines[range.start.line].substring(
                    range.start.character,
                    range.end.character
                );
            }

            let text = lines[range.start.line].substring(range.start.character);
            for (let i = range.start.line + 1; i < range.end.line; i++) {
                text += '\n' + lines[i];
            }
            if (range.end.line < lines.length) {
                text += '\n' + lines[range.end.line].substring(0, range.end.character);
            }
            return text;
        },

        getWordRangeAtPosition: (position: vscode.Position, regex?: RegExp): vscode.Range | undefined => {
            const line = lines[position.line];
            if (!line) return undefined;

            const wordRegex = regex || /[a-zA-Z0-9_]+/g;
            let match;

            while ((match = wordRegex.exec(line)) !== null) {
                const start = match.index;
                const end = start + match[0].length;

                if (start <= position.character && position.character <= end) {
                    return createMockRange(position.line, start, position.line, end);
                }
            }

            return undefined;
        },

        validateRange: (range: vscode.Range): vscode.Range => {
            return range;
        },

        validatePosition: (position: vscode.Position): vscode.Position => {
            return position;
        },

        save: async (): Promise<boolean> => {
            return true;
        }
    };

    return mockDoc;
}

/**
 * Create a mock Position
 */
export function createMockPosition(line: number, character: number): vscode.Position {
    return new vscode.Position(line, character);
}

/**
 * Create a mock Range
 */
export function createMockRange(
    startLine: number,
    startChar: number,
    endLine: number,
    endChar: number
): vscode.Range {
    return new vscode.Range(
        createMockPosition(startLine, startChar),
        createMockPosition(endLine, endChar)
    );
}

/**
 * Create a mock Selection
 */
export function createMockSelection(
    anchorLine: number,
    anchorChar: number,
    activeLine: number,
    activeChar: number
): vscode.Selection {
    return new vscode.Selection(
        createMockPosition(anchorLine, anchorChar),
        createMockPosition(activeLine, activeChar)
    );
}

/**
 * Create a mock TextEditor
 */
export function createMockEditor(
    document: vscode.TextDocument,
    selections: vscode.Selection[] = []
): vscode.TextEditor {
    const selection = selections[0] || createMockSelection(0, 0, 0, 0);

    return {
        document,
        selection,
        selections: selections.length > 0 ? selections : [selection],
        visibleRanges: [createMockRange(0, 0, document.lineCount - 1, 0)],
        options: {
            tabSize: 4,
            insertSpaces: true,
            cursorStyle: vscode.TextEditorCursorStyle.Line,
            lineNumbers: vscode.TextEditorLineNumbersStyle.On
        },
        viewColumn: vscode.ViewColumn.One,

        edit: async (callback: (editBuilder: vscode.TextEditorEdit) => void): Promise<boolean> => {
            return true;
        },

        insertSnippet: async (): Promise<boolean> => {
            return true;
        },

        setDecorations: (): void => {},

        revealRange: (): void => {},

        show: (): void => {},

        hide: (): void => {}
    } as vscode.TextEditor;
}

/**
 * Create a mock WorkspaceFolder
 */
export function createMockWorkspaceFolder(name: string, uri: vscode.Uri): vscode.WorkspaceFolder {
    return {
        uri,
        name,
        index: 0
    };
}

/**
 * Create a mock DocumentSymbol
 */
export function createMockDocumentSymbol(
    name: string,
    detail: string,
    kind: vscode.SymbolKind,
    range: vscode.Range,
    selectionRange: vscode.Range,
    children: vscode.DocumentSymbol[] = []
): vscode.DocumentSymbol {
    return {
        name,
        detail,
        kind,
        range,
        selectionRange,
        children,
        tags: undefined
    };
}

/**
 * Create a mock Location
 */
export function createMockLocation(uri: vscode.Uri, range: vscode.Range): vscode.Location {
    return new vscode.Location(uri, range);
}

/**
 * Create a mock CancellationToken
 */
export function createMockCancellationToken(isCancelled: boolean = false): vscode.CancellationToken {
    return {
        isCancellationRequested: isCancelled,
        onCancellationRequested: (listener: any) => {
            return { dispose: () => {} };
        }
    };
}

/**
 * Mock VS Code workspace
 */
export class MockWorkspace {
    private folders: vscode.WorkspaceFolder[] = [];
    private configuration: Map<string, any> = new Map();

    addFolder(folder: vscode.WorkspaceFolder): void {
        this.folders.push(folder);
    }

    getWorkspaceFolder(uri: vscode.Uri): vscode.WorkspaceFolder | undefined {
        return this.folders.find(f => uri.fsPath.startsWith(f.uri.fsPath));
    }

    getConfiguration(section?: string): vscode.WorkspaceConfiguration {
        const config: vscode.WorkspaceConfiguration = {
            get: (key: string, defaultValue?: any) => {
                const fullKey = section ? `${section}.${key}` : key;
                return this.configuration.get(fullKey) ?? defaultValue;
            },
            has: (key: string) => {
                const fullKey = section ? `${section}.${key}` : key;
                return this.configuration.has(fullKey);
            },
            inspect: () => undefined,
            update: async () => {},
        } as vscode.WorkspaceConfiguration;

        return config;
    }

    setConfiguration(key: string, value: any): void {
        this.configuration.set(key, value);
    }
}