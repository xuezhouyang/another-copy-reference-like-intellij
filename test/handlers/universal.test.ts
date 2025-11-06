import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { UniversalHandler } from '../../src/handlers/universal';
import { createMockDocument, createMockPosition, createMockRange } from '../helpers/mocks';

suite('UniversalHandler Test Suite', () => {
    let handler: UniversalHandler;

    setup(() => {
        handler = new UniversalHandler();
    });

    test('should handle any document', () => {
        const documents = [
            createMockDocument('test.txt', 'plaintext', 'Hello World'),
            createMockDocument('test.rs', 'rust', 'fn main() {}'),
            createMockDocument('test.go', 'go', 'package main'),
            createMockDocument('test.xyz', 'unknown', 'content'),
            createMockDocument('Untitled-1', 'plaintext', 'unsaved', true)
        ];

        documents.forEach(doc => {
            assert.strictEqual(
                handler.canHandle(doc),
                true,
                `Should handle ${doc.languageId} files`
            );
        });
    });

    test('should have lowest priority', () => {
        assert.strictEqual(handler.priority, 0);
    });

    test('should have wildcard language ID and extensions', () => {
        assert.strictEqual(handler.languageId, '*');
        assert.deepStrictEqual(handler.fileExtensions, ['*']);
    });

    test('should not support frameworks', () => {
        assert.strictEqual(handler.supportsFrameworks, false);
    });

    suite('extractReference', () => {
        test('should extract reference with file path and position', async () => {
            const content = 'function test() {\n  console.log("test");\n}';
            const doc = createMockDocument('src/test.js', 'javascript', content);
            const position = createMockPosition(1, 10); // Line 2, column 11

            const reference = await handler.extractReference(doc, position);

            assert.ok(reference);
            assert.strictEqual(reference.formatted, 'src/test.js:2:11');
            assert.strictEqual(reference.filePath, 'src/test.js');
            assert.strictEqual(reference.line, 2);
            assert.strictEqual(reference.column, 11);
            assert.strictEqual(reference.type, 'position');
        });

        test('should handle position at start of file', async () => {
            const content = 'First line\nSecond line';
            const doc = createMockDocument('test.txt', 'plaintext', content);
            const position = createMockPosition(0, 0);

            const reference = await handler.extractReference(doc, position);

            assert.ok(reference);
            assert.strictEqual(reference.formatted, 'test.txt:1:1');
            assert.strictEqual(reference.line, 1);
            assert.strictEqual(reference.column, 1);
        });

        test('should handle position at end of line', async () => {
            const content = 'Line one\nLine two\nLine three';
            const doc = createMockDocument('file.md', 'markdown', content);
            const position = createMockPosition(1, 8); // End of "Line two"

            const reference = await handler.extractReference(doc, position);

            assert.ok(reference);
            assert.strictEqual(reference.formatted, 'file.md:2:9');
            assert.strictEqual(reference.line, 2);
            assert.strictEqual(reference.column, 9);
        });

        test('should include word at position in metadata', async () => {
            const content = 'const variable = 42;';
            const doc = createMockDocument('test.js', 'javascript', content);
            const position = createMockPosition(0, 7); // Inside "variable"

            // Mock getWordRangeAtPosition
            doc.getWordRangeAtPosition = (pos: vscode.Position) => {
                if (pos.line === 0 && pos.character >= 6 && pos.character <= 13) {
                    return createMockRange(0, 6, 0, 14);
                }
                return undefined;
            };

            doc.getText = (range?: vscode.Range) => {
                if (range && range.start.character === 6 && range.end.character === 14) {
                    return 'variable';
                }
                return content;
            };

            const reference = await handler.extractReference(doc, position);

            assert.ok(reference);
            assert.strictEqual(reference.metadata?.word, 'variable');
        });

        test('should handle unsaved files', async () => {
            const content = 'Unsaved content';
            const doc = createMockDocument('Untitled-1', 'plaintext', content, true);
            const position = createMockPosition(0, 5);

            const reference = await handler.extractReference(doc, position);

            assert.ok(reference);
            assert.strictEqual(reference.formatted, 'Untitled:1:6');
            assert.strictEqual(reference.filePath, 'Untitled');
        });

        test('should include language ID in metadata', async () => {
            const content = '# Header\nContent';
            const doc = createMockDocument('doc.md', 'markdown', content);
            const position = createMockPosition(1, 0);

            const reference = await handler.extractReference(doc, position);

            assert.ok(reference);
            assert.strictEqual(reference.metadata?.languageId, 'markdown');
        });

        test('should handle deeply nested file paths', async () => {
            const content = 'code';
            const doc = createMockDocument(
                'src/components/ui/buttons/PrimaryButton.tsx',
                'typescriptreact',
                content
            );
            const position = createMockPosition(0, 2);

            const reference = await handler.extractReference(doc, position);

            assert.ok(reference);
            assert.strictEqual(
                reference.formatted,
                'src/components/ui/buttons/PrimaryButton.tsx:1:3'
            );
        });

        test('should handle files with special characters in name', async () => {
            const content = 'content';
            const doc = createMockDocument(
                'my-file.test.spec.js',
                'javascript',
                content
            );
            const position = createMockPosition(0, 0);

            const reference = await handler.extractReference(doc, position);

            assert.ok(reference);
            assert.strictEqual(reference.formatted, 'my-file.test.spec.js:1:1');
        });
    });

    suite('resolveSymbol', () => {
        test('should resolve word at position', async () => {
            const content = 'const myVariable = 123;';
            const doc = createMockDocument('test.js', 'javascript', content);
            const position = createMockPosition(0, 8); // Inside "myVariable"

            // Mock word range
            doc.getWordRangeAtPosition = (pos: vscode.Position) => {
                if (pos.line === 0 && pos.character >= 6 && pos.character <= 15) {
                    return createMockRange(0, 6, 0, 16);
                }
                return undefined;
            };

            doc.getText = (range?: vscode.Range) => {
                if (range && range.start.character === 6 && range.end.character === 16) {
                    return 'myVariable';
                }
                return content;
            };

            const symbol = await handler.resolveSymbol(doc, position);

            assert.ok(symbol);
            assert.strictEqual(symbol.name, 'myVariable');
            assert.strictEqual(symbol.type, 'unknown');
            assert.strictEqual(symbol.metadata?.lineNumber, 1);
            assert.strictEqual(symbol.metadata?.column, 9);
        });

        test('should return null when no word at position', async () => {
            const content = '    \n    '; // Only whitespace
            const doc = createMockDocument('test.txt', 'plaintext', content);
            const position = createMockPosition(0, 2);

            doc.getWordRangeAtPosition = () => undefined;

            const symbol = await handler.resolveSymbol(doc, position);

            assert.strictEqual(symbol, null);
        });

        test('should include line text in metadata', async () => {
            const content = 'function test() {\n  return 42;\n}';
            const doc = createMockDocument('test.js', 'javascript', content);
            const position = createMockPosition(1, 9); // On "42"

            doc.getWordRangeAtPosition = (pos: vscode.Position) => {
                if (pos.line === 1) {
                    return createMockRange(1, 9, 1, 11);
                }
                return undefined;
            };

            doc.getText = (range?: vscode.Range) => {
                if (range && range.start.line === 1) {
                    return '42';
                }
                return content;
            };

            const symbol = await handler.resolveSymbol(doc, position);

            assert.ok(symbol);
            assert.strictEqual(symbol.metadata?.lineText, '  return 42;');
        });

        test('should have empty parents array', async () => {
            const content = 'test content';
            const doc = createMockDocument('test.txt', 'plaintext', content);
            const position = createMockPosition(0, 0);

            doc.getWordRangeAtPosition = () => createMockRange(0, 0, 0, 4);
            doc.getText = (range?: vscode.Range) => {
                if (range) return 'test';
                return content;
            };

            const symbol = await handler.resolveSymbol(doc, position);

            assert.ok(symbol);
            assert.deepStrictEqual(symbol.parents, []);
        });
    });

    suite('error handling', () => {
        test('should handle errors in extractReference gracefully', async () => {
            const doc = createMockDocument('test.txt', 'plaintext', 'content');
            const position = createMockPosition(0, 0);

            // Force an error by making document methods throw
            doc.getWordRangeAtPosition = () => {
                throw new Error('Test error');
            };

            const reference = await handler.extractReference(doc, position);

            // Should still return a reference even if word extraction fails
            assert.ok(reference);
            assert.strictEqual(reference.formatted, 'test.txt:1:1');
        });

        test('should handle errors in resolveSymbol gracefully', async () => {
            const doc = createMockDocument('test.txt', 'plaintext', 'content');
            const position = createMockPosition(0, 0);

            // Force an error
            doc.getWordRangeAtPosition = () => {
                throw new Error('Test error');
            };

            const symbol = await handler.resolveSymbol(doc, position);

            assert.strictEqual(symbol, null);
        });
    });
});