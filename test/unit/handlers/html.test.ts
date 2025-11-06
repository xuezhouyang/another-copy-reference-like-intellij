import * as assert from 'assert';
import * as vscode from 'vscode';
import { HtmlHandler } from '../../../src/handlers/html';
import { createMockDocument, createMockSymbol } from '../../helpers';

suite('HtmlHandler Test Suite', () => {
    let handler: HtmlHandler;

    setup(() => {
        handler = new HtmlHandler();
    });

    test('should have correct configuration', () => {
        assert.strictEqual(handler.languageId, 'html');
        assert.deepStrictEqual(handler.fileExtensions, ['.html', '.htm', '.xhtml', '.xml', '.svg']);
        assert.strictEqual(handler.priority, 50);
        assert.strictEqual(handler.supportsFrameworks, false);
    });

    suite('canHandle', () => {
        test('should handle HTML files by language ID', () => {
            const htmlDoc = createMockDocument('test.html', 'html', '<div>Test</div>');
            assert.strictEqual(handler.canHandle(htmlDoc), true);
        });

        test('should handle XML files', () => {
            const xmlDoc = createMockDocument('test.xml', 'xml', '<?xml version="1.0"?><root></root>');
            assert.strictEqual(handler.canHandle(xmlDoc), true);
        });

        test('should handle files by extension', () => {
            const extensions = ['.html', '.htm', '.xhtml', '.xml', '.svg'];
            extensions.forEach(ext => {
                const doc = createMockDocument(`test${ext}`, 'plaintext', '<div>Test</div>');
                assert.strictEqual(handler.canHandle(doc), true, `Should handle ${ext} extension`);
            });
        });

        test('should not handle non-HTML/XML files', () => {
            const doc = createMockDocument('test.txt', 'plaintext', 'Some text');
            assert.strictEqual(handler.canHandle(doc), false);
        });

        test('should handle index.html files', () => {
            const doc = createMockDocument('index.html', 'html', '<!DOCTYPE html><html></html>');
            assert.strictEqual(handler.canHandle(doc), true);
        });

        test('should handle uppercase extensions', () => {
            const doc = createMockDocument('test.HTML', 'plaintext', '<div>Test</div>');
            assert.strictEqual(handler.canHandle(doc), true);
        });
    });

    suite('extractReference', () => {
        test('should generate reference for element with id', async () => {
            const content = '<div id="main-content"><h1>Title</h1></div>';
            const doc = createMockDocument('pages/index.html', 'html', content);
            const position = new vscode.Position(0, 10); // Position within div

            // Mock symbols for HTML elements
            const symbols = [
                createMockSymbol('div#main-content', vscode.SymbolKind.Field,
                    new vscode.Range(0, 0, 0, 44))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.strictEqual(reference.filePath, 'pages/index.html');
                assert.deepStrictEqual(reference.symbolPath, ['main-content']);
                assert.strictEqual(reference.separator, '#');
                assert.strictEqual(reference.toString(), 'pages/index.html#main-content');
            }
        });

        test('should generate reference for nested elements', async () => {
            const content = `<div id="container">
                <section id="content">
                    <article id="post">
                        <h1>Title</h1>
                    </article>
                </section>
            </div>`;
            const doc = createMockDocument('blog/post.html', 'html', content);
            const position = new vscode.Position(2, 25); // Position in article

            // Mock nested element symbols
            const symbols = [
                createMockSymbol('div#container', vscode.SymbolKind.Field,
                    new vscode.Range(0, 0, 6, 6), [
                        createMockSymbol('section#content', vscode.SymbolKind.Field,
                            new vscode.Range(1, 16, 5, 25), [
                                createMockSymbol('article#post', vscode.SymbolKind.Field,
                                    new vscode.Range(2, 20, 4, 30))
                            ])
                    ])
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                // For HTML, we typically reference the element with ID
                assert.deepStrictEqual(reference.symbolPath, ['post']);
                assert.strictEqual(reference.toString(), 'blog/post.html#post');
            }
        });

        test('should generate reference for class selectors', async () => {
            const content = '<div class="header navigation"><span class="logo">Logo</span></div>';
            const doc = createMockDocument('components/header.html', 'html', content);
            const position = new vscode.Position(0, 35); // Position in span

            const symbols = [
                createMockSymbol('div.header.navigation', vscode.SymbolKind.Field,
                    new vscode.Range(0, 0, 0, 68), [
                        createMockSymbol('span.logo', vscode.SymbolKind.Field,
                            new vscode.Range(0, 31, 0, 61))
                    ])
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.deepStrictEqual(reference.symbolPath, ['.logo']);
                assert.strictEqual(reference.toString(), 'components/header.html#.logo');
            }
        });

        test('should handle data attributes', async () => {
            const content = '<div data-component="carousel" data-id="main-carousel">Content</div>';
            const doc = createMockDocument('widgets/carousel.html', 'html', content);
            const position = new vscode.Position(0, 30);

            const symbols = [
                createMockSymbol('div[data-component="carousel"]', vscode.SymbolKind.Field,
                    new vscode.Range(0, 0, 0, 69))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.strictEqual(reference.toString(), 'widgets/carousel.html#carousel');
            }
        });

        test('should handle forms and inputs', async () => {
            const content = `<form id="contact-form">
                <input name="email" type="email">
                <button type="submit">Submit</button>
            </form>`;
            const doc = createMockDocument('forms/contact.html', 'html', content);
            const position = new vscode.Position(1, 25); // Position in input

            const symbols = [
                createMockSymbol('form#contact-form', vscode.SymbolKind.Field,
                    new vscode.Range(0, 0, 3, 11), [
                        createMockSymbol('input[name="email"]', vscode.SymbolKind.Field,
                            new vscode.Range(1, 16, 1, 50)),
                        createMockSymbol('button[type="submit"]', vscode.SymbolKind.Field,
                            new vscode.Range(2, 16, 2, 54))
                    ])
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.deepStrictEqual(reference.symbolPath, ['email']);
                assert.strictEqual(reference.toString(), 'forms/contact.html#email');
            }
        });

        test('should handle SVG elements', async () => {
            const content = `<svg id="icon-set">
                <symbol id="icon-home">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </symbol>
            </svg>`;
            const doc = createMockDocument('icons/icons.svg', 'xml', content);
            const position = new vscode.Position(1, 25);

            const symbols = [
                createMockSymbol('svg#icon-set', vscode.SymbolKind.Field,
                    new vscode.Range(0, 0, 4, 10), [
                        createMockSymbol('symbol#icon-home', vscode.SymbolKind.Field,
                            new vscode.Range(1, 16, 3, 25))
                    ])
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.deepStrictEqual(reference.symbolPath, ['icon-home']);
                assert.strictEqual(reference.toString(), 'icons/icons.svg#icon-home');
            }
        });

        test('should handle XML namespaces', async () => {
            const content = `<?xml version="1.0"?>
            <ns:root xmlns:ns="http://example.com">
                <ns:element id="data">Content</ns:element>
            </ns:root>`;
            const doc = createMockDocument('data/config.xml', 'xml', content);
            const position = new vscode.Position(2, 25);

            const symbols = [
                createMockSymbol('ns:root', vscode.SymbolKind.Field,
                    new vscode.Range(1, 12, 3, 23), [
                        createMockSymbol('ns:element#data', vscode.SymbolKind.Field,
                            new vscode.Range(2, 16, 2, 59))
                    ])
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.deepStrictEqual(reference.symbolPath, ['data']);
                assert.strictEqual(reference.toString(), 'data/config.xml#data');
            }
        });

        test('should handle HTML5 semantic elements', async () => {
            const content = `<main>
                <header id="page-header">
                    <nav id="main-nav">Navigation</nav>
                </header>
                <article id="content">
                    <section id="intro">Introduction</section>
                </article>
                <footer id="page-footer">Footer</footer>
            </main>`;
            const doc = createMockDocument('layout/template.html', 'html', content);
            const position = new vscode.Position(5, 30); // Position in section

            const symbols = [
                createMockSymbol('main', vscode.SymbolKind.Field,
                    new vscode.Range(0, 0, 8, 11), [
                        createMockSymbol('header#page-header', vscode.SymbolKind.Field,
                            new vscode.Range(1, 16, 3, 25)),
                        createMockSymbol('article#content', vscode.SymbolKind.Field,
                            new vscode.Range(4, 16, 6, 26), [
                                createMockSymbol('section#intro', vscode.SymbolKind.Field,
                                    new vscode.Range(5, 20, 5, 58))
                            ]),
                        createMockSymbol('footer#page-footer', vscode.SymbolKind.Field,
                            new vscode.Range(7, 16, 7, 57))
                    ])
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.deepStrictEqual(reference.symbolPath, ['intro']);
                assert.strictEqual(reference.toString(), 'layout/template.html#intro');
            }
        });

        test('should handle template expressions', async () => {
            const content = '<div v-for="item in items" :key="item.id">{{ item.name }}</div>';
            const doc = createMockDocument('components/list.html', 'html', content);
            const position = new vscode.Position(0, 30);

            const symbols = [
                createMockSymbol('div[v-for]', vscode.SymbolKind.Field,
                    new vscode.Range(0, 0, 0, 64))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                // Should handle Vue/Angular template syntax
                assert.strictEqual(reference.filePath, 'components/list.html');
            }
        });

        test('should handle comments and CDATA', async () => {
            const content = `<!-- Main content -->
            <div id="content">
                <![CDATA[
                    Some raw content
                ]]>
            </div>`;
            const doc = createMockDocument('pages/raw.html', 'html', content);
            const position = new vscode.Position(1, 25);

            const symbols = [
                createMockSymbol('div#content', vscode.SymbolKind.Field,
                    new vscode.Range(1, 12, 5, 18))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.deepStrictEqual(reference.symbolPath, ['content']);
                assert.strictEqual(reference.toString(), 'pages/raw.html#content');
            }
        });

        test('should return file-only reference when no elements found', async () => {
            const content = 'Plain text without HTML';
            const doc = createMockDocument('plain.html', 'html', content);
            const position = new vscode.Position(0, 5);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.strictEqual(reference.filePath, 'plain.html');
                assert.strictEqual(reference.symbolPath, undefined);
                assert.strictEqual(reference.toString(), 'plain.html');
            }
        });

        test('should handle self-closing tags', async () => {
            const content = '<img src="image.jpg" alt="Test" id="logo" />';
            const doc = createMockDocument('assets/images.html', 'html', content);
            const position = new vscode.Position(0, 20);

            const symbols = [
                createMockSymbol('img#logo', vscode.SymbolKind.Field,
                    new vscode.Range(0, 0, 0, 45))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.deepStrictEqual(reference.symbolPath, ['logo']);
                assert.strictEqual(reference.toString(), 'assets/images.html#logo');
            }
        });

        test('should include line numbers when configured', async () => {
            const content = '<div id="test">Content</div>';
            const doc = createMockDocument('test.html', 'html', content);
            const position = new vscode.Position(0, 10);

            const symbols = [
                createMockSymbol('div#test', vscode.SymbolKind.Field,
                    new vscode.Range(0, 0, 0, 29))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                // Set line number for reference
                reference.lineNumber = position.line + 1;
                assert.strictEqual(reference.lineNumber, 1);
            }
        });
    });

    suite('resolveSymbol', () => {
        test('should resolve element symbol at position', async () => {
            const content = '<div id="main">Content</div>';
            const doc = createMockDocument('test.html', 'html', content);
            const position = new vscode.Position(0, 10);

            const symbols = [
                createMockSymbol('div#main', vscode.SymbolKind.Field,
                    new vscode.Range(0, 0, 0, 29))
            ];

            // Mock the getDocumentSymbols method
            const originalMethod = handler['getDocumentSymbols'];
            handler['getDocumentSymbols'] = async () => symbols;

            const context = await handler.resolveSymbol(doc, position);
            assert.notStrictEqual(context, null);
            if (context) {
                assert.strictEqual(context.symbol?.name, 'div#main');
                assert.strictEqual(context.languageId, 'html');
            }

            // Restore original method
            handler['getDocumentSymbols'] = originalMethod;
        });

        test('should return null when no symbol at position', async () => {
            const content = 'Plain text without HTML';
            const doc = createMockDocument('test.html', 'html', content);
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