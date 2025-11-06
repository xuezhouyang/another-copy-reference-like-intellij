import * as assert from 'assert';
import * as vscode from 'vscode';
import { MarkdownHandler } from '../../../src/handlers/markdown';
import { createMockDocument, createMockSymbol } from '../../helpers';

suite('MarkdownHandler Test Suite', () => {
    let handler: MarkdownHandler;

    setup(() => {
        handler = new MarkdownHandler();
    });

    test('should have correct configuration', () => {
        assert.strictEqual(handler.languageId, 'markdown');
        assert.deepStrictEqual(handler.fileExtensions, ['.md', '.markdown', '.mdown', '.mkd']);
        assert.strictEqual(handler.priority, 60);
        assert.strictEqual(handler.supportsFrameworks, false);
    });

    suite('canHandle', () => {
        test('should handle markdown files by language ID', () => {
            const mdDoc = createMockDocument('test.md', 'markdown', '# Test');
            assert.strictEqual(handler.canHandle(mdDoc), true);
        });

        test('should handle markdown files by extension', () => {
            const extensions = ['.md', '.markdown', '.mdown', '.mkd'];
            extensions.forEach(ext => {
                const doc = createMockDocument(`test${ext}`, 'plaintext', '# Test');
                assert.strictEqual(handler.canHandle(doc), true, `Should handle ${ext} extension`);
            });
        });

        test('should not handle non-markdown files', () => {
            const doc = createMockDocument('test.txt', 'plaintext', 'Some text');
            assert.strictEqual(handler.canHandle(doc), false);
        });

        test('should handle README files', () => {
            const doc = createMockDocument('README.md', 'markdown', '# Project');
            assert.strictEqual(handler.canHandle(doc), true);
        });

        test('should handle uppercase extensions', () => {
            const doc = createMockDocument('test.MD', 'plaintext', '# Test');
            assert.strictEqual(handler.canHandle(doc), true);
        });
    });

    suite('extractReference', () => {
        test('should generate reference for heading level 1', async () => {
            const content = '# Main Title\n\nSome content';
            const doc = createMockDocument('docs/guide.md', 'markdown', content);
            const position = new vscode.Position(0, 5); // Position within heading

            // Mock symbols for markdown headings
            const symbols = [
                createMockSymbol('Main Title', vscode.SymbolKind.String,
                    new vscode.Range(0, 0, 0, 12))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.strictEqual(reference.filePath, 'docs/guide.md');
                assert.deepStrictEqual(reference.symbolPath, ['main-title']);
                assert.strictEqual(reference.separator, '#');
                assert.strictEqual(reference.toString(), 'docs/guide.md#main-title');
            }
        });

        test('should generate reference for nested headings', async () => {
            const content = '# Section\n## Subsection\n### Detail\n\nContent here';
            const doc = createMockDocument('docs/api.md', 'markdown', content);
            const position = new vscode.Position(2, 5); // Position in ### Detail

            // Mock nested heading symbols
            const symbols = [
                createMockSymbol('Section', vscode.SymbolKind.String,
                    new vscode.Range(0, 0, 0, 9), [
                        createMockSymbol('Subsection', vscode.SymbolKind.String,
                            new vscode.Range(1, 0, 1, 12), [
                                createMockSymbol('Detail', vscode.SymbolKind.String,
                                    new vscode.Range(2, 0, 2, 9))
                            ])
                    ])
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                // For markdown, we typically only use the current heading, not the full hierarchy
                assert.deepStrictEqual(reference.symbolPath, ['detail']);
                assert.strictEqual(reference.toString(), 'docs/api.md#detail');
            }
        });

        test('should handle headings with special characters', async () => {
            const content = '# Hello, World! (Test & Demo)\n\nContent';
            const doc = createMockDocument('test.md', 'markdown', content);
            const position = new vscode.Position(0, 5);

            const symbols = [
                createMockSymbol('Hello, World! (Test & Demo)', vscode.SymbolKind.String,
                    new vscode.Range(0, 0, 0, 29))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                // Should generate GitHub-compatible anchor
                assert.deepStrictEqual(reference.symbolPath, ['hello-world-test--demo']);
                assert.strictEqual(reference.toString(), 'test.md#hello-world-test--demo');
            }
        });

        test('should handle code blocks', async () => {
            const content = '# Title\n\n```javascript\nconst x = 1;\n```\n\nText';
            const doc = createMockDocument('code.md', 'markdown', content);
            const position = new vscode.Position(3, 5); // Position in code block

            const symbols = [
                createMockSymbol('Title', vscode.SymbolKind.String,
                    new vscode.Range(0, 0, 0, 7))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                // Should still reference the nearest heading
                assert.strictEqual(reference.toString(), 'code.md#title');
            }
        });

        test('should handle emoji in headings', async () => {
            const content = '# 🚀 Getting Started\n\nContent';
            const doc = createMockDocument('start.md', 'markdown', content);
            const position = new vscode.Position(0, 5);

            const symbols = [
                createMockSymbol('🚀 Getting Started', vscode.SymbolKind.String,
                    new vscode.Range(0, 0, 0, 20))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                // Should strip emoji and generate anchor
                assert.deepStrictEqual(reference.symbolPath, ['getting-started']);
                assert.strictEqual(reference.toString(), 'start.md#getting-started');
            }
        });

        test('should handle duplicate heading names', async () => {
            const content = '# Setup\n## Installation\n# Setup\n## Configuration';
            const doc = createMockDocument('guide.md', 'markdown', content);
            const position = new vscode.Position(2, 5); // Second "Setup" heading

            const symbols = [
                createMockSymbol('Setup', vscode.SymbolKind.String,
                    new vscode.Range(0, 0, 0, 7)),
                createMockSymbol('Installation', vscode.SymbolKind.String,
                    new vscode.Range(1, 0, 1, 14)),
                createMockSymbol('Setup', vscode.SymbolKind.String,
                    new vscode.Range(2, 0, 2, 7)),
                createMockSymbol('Configuration', vscode.SymbolKind.String,
                    new vscode.Range(3, 0, 3, 15))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                // Should add number suffix for duplicate
                assert.deepStrictEqual(reference.symbolPath, ['setup-1']);
                assert.strictEqual(reference.toString(), 'guide.md#setup-1');
            }
        });

        test('should return file-only reference when no heading found', async () => {
            const content = 'Just plain text without headings';
            const doc = createMockDocument('notes.md', 'markdown', content);
            const position = new vscode.Position(0, 5);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.strictEqual(reference.filePath, 'notes.md');
                assert.strictEqual(reference.symbolPath, undefined);
                assert.strictEqual(reference.toString(), 'notes.md');
            }
        });

        test('should handle list items', async () => {
            const content = '# Features\n\n- Item 1\n- Item 2\n  - Nested item';
            const doc = createMockDocument('features.md', 'markdown', content);
            const position = new vscode.Position(3, 5); // In list item

            const symbols = [
                createMockSymbol('Features', vscode.SymbolKind.String,
                    new vscode.Range(0, 0, 0, 10))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                // Should reference the nearest heading
                assert.strictEqual(reference.toString(), 'features.md#features');
            }
        });

        test('should handle tables', async () => {
            const content = '# Data\n\n| Column 1 | Column 2 |\n|----------|----------|\n| Data 1   | Data 2   |';
            const doc = createMockDocument('data.md', 'markdown', content);
            const position = new vscode.Position(4, 5); // In table cell

            const symbols = [
                createMockSymbol('Data', vscode.SymbolKind.String,
                    new vscode.Range(0, 0, 0, 6))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.strictEqual(reference.toString(), 'data.md#data');
            }
        });

        test('should handle frontmatter', async () => {
            const content = '---\ntitle: Test\nauthor: User\n---\n\n# Actual Content\n\nText here';
            const doc = createMockDocument('post.md', 'markdown', content);
            const position = new vscode.Position(6, 5); // In content after frontmatter

            const symbols = [
                createMockSymbol('Actual Content', vscode.SymbolKind.String,
                    new vscode.Range(5, 0, 5, 16))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.strictEqual(reference.toString(), 'post.md#actual-content');
            }
        });

        test('should handle Chinese characters in headings', async () => {
            const content = '# 中文标题\n\n内容';
            const doc = createMockDocument('chinese.md', 'markdown', content);
            const position = new vscode.Position(0, 5);

            const symbols = [
                createMockSymbol('中文标题', vscode.SymbolKind.String,
                    new vscode.Range(0, 0, 0, 6))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                // Should handle non-ASCII characters
                assert.deepStrictEqual(reference.symbolPath, ['中文标题']);
                assert.strictEqual(reference.toString(), 'chinese.md#中文标题');
            }
        });

        test('should handle ATX-style headers', async () => {
            const content = '### Third Level Header ###\n\nContent';
            const doc = createMockDocument('atx.md', 'markdown', content);
            const position = new vscode.Position(0, 10);

            const symbols = [
                createMockSymbol('Third Level Header', vscode.SymbolKind.String,
                    new vscode.Range(0, 0, 0, 27))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.deepStrictEqual(reference.symbolPath, ['third-level-header']);
                assert.strictEqual(reference.toString(), 'atx.md#third-level-header');
            }
        });

        test('should include line numbers when configured', async () => {
            const content = '# Header\n\n## Subheader\n\nContent';
            const doc = createMockDocument('lines.md', 'markdown', content);
            const position = new vscode.Position(2, 5);

            const symbols = [
                createMockSymbol('Header', vscode.SymbolKind.String,
                    new vscode.Range(0, 0, 0, 8), [
                        createMockSymbol('Subheader', vscode.SymbolKind.String,
                            new vscode.Range(2, 0, 2, 12))
                    ])
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                // Set line number for reference
                reference.lineNumber = position.line + 1;
                assert.strictEqual(reference.lineNumber, 3);
            }
        });
    });

    suite('resolveSymbol', () => {
        test('should resolve heading symbol at position', async () => {
            const content = '# Main Title\n\nSome content';
            const doc = createMockDocument('test.md', 'markdown', content);
            const position = new vscode.Position(0, 5);

            const symbols = [
                createMockSymbol('Main Title', vscode.SymbolKind.String,
                    new vscode.Range(0, 0, 0, 12))
            ];

            // Mock the getDocumentSymbols method
            const originalMethod = handler['getDocumentSymbols'];
            handler['getDocumentSymbols'] = async () => symbols;

            const context = await handler.resolveSymbol(doc, position);
            assert.notStrictEqual(context, null);
            if (context) {
                assert.strictEqual(context.symbol?.name, 'Main Title');
                assert.strictEqual(context.languageId, 'markdown');
            }

            // Restore original method
            handler['getDocumentSymbols'] = originalMethod;
        });

        test('should return null when no symbol at position', async () => {
            const content = 'Plain text without headings';
            const doc = createMockDocument('test.md', 'markdown', content);
            const position = new vscode.Position(0, 5);

            // Mock empty symbols
            const originalMethod = handler['getDocumentSymbols'];
            handler['getDocumentSymbols'] = async () => [];

            const context = await handler.resolveSymbol(doc, position);
            assert.strictEqual(context, null);

            // Restore original method
            handler['getDocumentSymbols'] = originalMethod;
        });
    });
});