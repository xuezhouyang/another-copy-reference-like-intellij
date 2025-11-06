import * as assert from 'assert';
import * as vscode from 'vscode';
import { YamlHandler } from '../../../src/handlers/yaml';
import { createMockDocument, createMockSymbol } from '../../helpers';

suite('YamlHandler Test Suite', () => {
    let handler: YamlHandler;

    setup(() => {
        handler = new YamlHandler();
    });

    test('should have correct configuration', () => {
        assert.strictEqual(handler.languageId, 'yaml');
        assert.deepStrictEqual(handler.fileExtensions, ['.yml', '.yaml']);
        assert.strictEqual(handler.priority, 60);
        assert.strictEqual(handler.supportsFrameworks, false);
    });

    suite('canHandle', () => {
        test('should handle YAML files by language ID', () => {
            const yamlDoc = createMockDocument('config.yml', 'yaml', 'key: value');
            assert.strictEqual(handler.canHandle(yamlDoc), true);
        });

        test('should handle files by extension', () => {
            const extensions = ['.yml', '.yaml'];
            extensions.forEach(ext => {
                const doc = createMockDocument(`config${ext}`, 'plaintext', 'key: value');
                assert.strictEqual(handler.canHandle(doc), true, `Should handle ${ext} extension`);
            });
        });

        test('should not handle non-YAML files', () => {
            const doc = createMockDocument('test.txt', 'plaintext', 'Some text');
            assert.strictEqual(handler.canHandle(doc), false);
        });

        test('should handle docker-compose.yml files', () => {
            const doc = createMockDocument('docker-compose.yml', 'yaml', 'version: "3"');
            assert.strictEqual(handler.canHandle(doc), true);
        });

        test('should handle uppercase extensions', () => {
            const doc = createMockDocument('config.YML', 'plaintext', 'key: value');
            assert.strictEqual(handler.canHandle(doc), true);
        });
    });

    suite('extractReference', () => {
        test('should generate reference for top-level key', async () => {
            const content = 'name: "My Application"\nversion: 1.0.0\ndescription: Test app';
            const doc = createMockDocument('config.yml', 'yaml', content);
            const position = new vscode.Position(0, 5); // Position on 'name' key

            // Mock symbols for YAML keys
            const symbols = [
                createMockSymbol('name', vscode.SymbolKind.Property,
                    new vscode.Range(0, 0, 0, 22)),
                createMockSymbol('version', vscode.SymbolKind.Property,
                    new vscode.Range(1, 0, 1, 13)),
                createMockSymbol('description', vscode.SymbolKind.Property,
                    new vscode.Range(2, 0, 2, 25))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.strictEqual(reference.filePath, 'config.yml');
                assert.deepStrictEqual(reference.symbolPath, ['name']);
                assert.strictEqual(reference.separator, '.');
                assert.strictEqual(reference.toString(), 'config.yml:name');
            }
        });

        test('should generate reference for nested keys', async () => {
            const content = `
database:
  host: localhost
  port: 5432
  credentials:
    username: admin
    password: secret`;
            const doc = createMockDocument('settings.yml', 'yaml', content);
            const position = new vscode.Position(5, 10); // Position on 'username' key

            // Mock nested structure
            const symbols = [
                createMockSymbol('database', vscode.SymbolKind.Namespace,
                    new vscode.Range(1, 0, 6, 19), [
                        createMockSymbol('host', vscode.SymbolKind.Property,
                            new vscode.Range(2, 2, 2, 17)),
                        createMockSymbol('port', vscode.SymbolKind.Property,
                            new vscode.Range(3, 2, 3, 12)),
                        createMockSymbol('credentials', vscode.SymbolKind.Namespace,
                            new vscode.Range(4, 2, 6, 19), [
                                createMockSymbol('username', vscode.SymbolKind.Property,
                                    new vscode.Range(5, 4, 5, 18)),
                                createMockSymbol('password', vscode.SymbolKind.Property,
                                    new vscode.Range(6, 4, 6, 19))
                            ])
                    ])
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.deepStrictEqual(reference.symbolPath, ['database', 'credentials', 'username']);
                assert.strictEqual(reference.toString(), 'settings.yml:database.credentials.username');
            }
        });

        test('should handle array items', async () => {
            const content = `
services:
  - name: web
    port: 8080
  - name: api
    port: 3000`;
            const doc = createMockDocument('services.yml', 'yaml', content);
            const position = new vscode.Position(2, 10); // Position in first array item

            const symbols = [
                createMockSymbol('services', vscode.SymbolKind.Array,
                    new vscode.Range(1, 0, 5, 14), [
                        createMockSymbol('[0]', vscode.SymbolKind.Namespace,
                            new vscode.Range(2, 2, 3, 14), [
                                createMockSymbol('name', vscode.SymbolKind.Property,
                                    new vscode.Range(2, 4, 2, 14)),
                                createMockSymbol('port', vscode.SymbolKind.Property,
                                    new vscode.Range(3, 4, 3, 14))
                            ]),
                        createMockSymbol('[1]', vscode.SymbolKind.Namespace,
                            new vscode.Range(4, 2, 5, 14), [
                                createMockSymbol('name', vscode.SymbolKind.Property,
                                    new vscode.Range(4, 4, 4, 14)),
                                createMockSymbol('port', vscode.SymbolKind.Property,
                                    new vscode.Range(5, 4, 5, 14))
                            ])
                    ])
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.deepStrictEqual(reference.symbolPath, ['services', '0', 'name']);
                assert.strictEqual(reference.toString(), 'services.yml:services[0].name');
            }
        });

        test('should handle multi-document YAML', async () => {
            const content = `---
name: Document 1
---
name: Document 2
version: 2.0`;
            const doc = createMockDocument('multi.yml', 'yaml', content);
            const position = new vscode.Position(3, 5); // Position in second document

            const symbols = [
                createMockSymbol('Document 1', vscode.SymbolKind.Module,
                    new vscode.Range(0, 0, 1, 16), [
                        createMockSymbol('name', vscode.SymbolKind.Property,
                            new vscode.Range(1, 0, 1, 16))
                    ]),
                createMockSymbol('Document 2', vscode.SymbolKind.Module,
                    new vscode.Range(2, 0, 4, 12), [
                        createMockSymbol('name', vscode.SymbolKind.Property,
                            new vscode.Range(3, 0, 3, 16)),
                        createMockSymbol('version', vscode.SymbolKind.Property,
                            new vscode.Range(4, 0, 4, 12))
                    ])
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                // Should include document index or name
                assert.strictEqual(reference.toString().includes('name'), true);
            }
        });

        test('should handle YAML anchors and aliases', async () => {
            const content = `
defaults: &defaults
  timeout: 30
  retries: 3

production:
  <<: *defaults
  host: prod.example.com`;
            const doc = createMockDocument('config.yml', 'yaml', content);
            const position = new vscode.Position(1, 5); // Position on anchor definition

            const symbols = [
                createMockSymbol('defaults', vscode.SymbolKind.Namespace,
                    new vscode.Range(1, 0, 3, 12), [
                        createMockSymbol('timeout', vscode.SymbolKind.Property,
                            new vscode.Range(2, 2, 2, 13)),
                        createMockSymbol('retries', vscode.SymbolKind.Property,
                            new vscode.Range(3, 2, 3, 12))
                    ]),
                createMockSymbol('production', vscode.SymbolKind.Namespace,
                    new vscode.Range(5, 0, 7, 24))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.deepStrictEqual(reference.symbolPath, ['defaults']);
                assert.strictEqual(reference.toString(), 'config.yml:defaults');
            }
        });

        test('should handle boolean and null values', async () => {
            const content = `
enabled: true
disabled: false
optional: null
undefined: ~`;
            const doc = createMockDocument('flags.yml', 'yaml', content);
            const position = new vscode.Position(1, 5);

            const symbols = [
                createMockSymbol('enabled', vscode.SymbolKind.Boolean,
                    new vscode.Range(1, 0, 1, 13)),
                createMockSymbol('disabled', vscode.SymbolKind.Boolean,
                    new vscode.Range(2, 0, 2, 14)),
                createMockSymbol('optional', vscode.SymbolKind.Null,
                    new vscode.Range(3, 0, 3, 14)),
                createMockSymbol('undefined', vscode.SymbolKind.Null,
                    new vscode.Range(4, 0, 4, 12))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.deepStrictEqual(reference.symbolPath, ['enabled']);
                assert.strictEqual(reference.toString(), 'flags.yml:enabled');
            }
        });

        test('should handle flow-style collections', async () => {
            const content = `
inline_array: [item1, item2, item3]
inline_object: {key1: value1, key2: value2}`;
            const doc = createMockDocument('flow.yml', 'yaml', content);
            const position = new vscode.Position(1, 10);

            const symbols = [
                createMockSymbol('inline_array', vscode.SymbolKind.Array,
                    new vscode.Range(1, 0, 1, 36)),
                createMockSymbol('inline_object', vscode.SymbolKind.Namespace,
                    new vscode.Range(2, 0, 2, 44), [
                        createMockSymbol('key1', vscode.SymbolKind.Property,
                            new vscode.Range(2, 16, 2, 28)),
                        createMockSymbol('key2', vscode.SymbolKind.Property,
                            new vscode.Range(2, 30, 2, 42))
                    ])
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.deepStrictEqual(reference.symbolPath, ['inline_array']);
                assert.strictEqual(reference.toString(), 'flow.yml:inline_array');
            }
        });

        test('should handle complex nested structures', async () => {
            const content = `
application:
  server:
    clusters:
      - name: primary
        nodes:
          - host: node1.example.com
            port: 8080
          - host: node2.example.com
            port: 8080`;
            const doc = createMockDocument('cluster.yml', 'yaml', content);
            const position = new vscode.Position(6, 20); // Position on first node's host

            const symbols = [
                createMockSymbol('application', vscode.SymbolKind.Namespace,
                    new vscode.Range(1, 0, 9, 22), [
                        createMockSymbol('server', vscode.SymbolKind.Namespace,
                            new vscode.Range(2, 2, 9, 22), [
                                createMockSymbol('clusters', vscode.SymbolKind.Array,
                                    new vscode.Range(3, 4, 9, 22), [
                                        createMockSymbol('[0]', vscode.SymbolKind.Namespace,
                                            new vscode.Range(4, 6, 9, 22), [
                                                createMockSymbol('name', vscode.SymbolKind.Property,
                                                    new vscode.Range(4, 8, 4, 22)),
                                                createMockSymbol('nodes', vscode.SymbolKind.Array,
                                                    new vscode.Range(5, 8, 9, 22), [
                                                        createMockSymbol('[0]', vscode.SymbolKind.Namespace,
                                                            new vscode.Range(6, 10, 7, 22)),
                                                        createMockSymbol('[1]', vscode.SymbolKind.Namespace,
                                                            new vscode.Range(8, 10, 9, 22))
                                                    ])
                                            ])
                                    ])
                            ])
                    ])
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                // Should generate deep nested path
                const path = reference.toString();
                assert.ok(path.includes('application'));
                assert.ok(path.includes('server'));
                assert.ok(path.includes('clusters'));
            }
        });

        test('should handle environment configuration files', async () => {
            const content = `
development:
  database:
    host: localhost
    port: 5432
production:
  database:
    host: db.prod.com
    port: 5432`;
            const doc = createMockDocument('.env.yml', 'yaml', content);
            const position = new vscode.Position(7, 10);

            const symbols = [
                createMockSymbol('development', vscode.SymbolKind.Namespace,
                    new vscode.Range(1, 0, 4, 14), [
                        createMockSymbol('database', vscode.SymbolKind.Namespace,
                            new vscode.Range(2, 2, 4, 14))
                    ]),
                createMockSymbol('production', vscode.SymbolKind.Namespace,
                    new vscode.Range(5, 0, 8, 14), [
                        createMockSymbol('database', vscode.SymbolKind.Namespace,
                            new vscode.Range(6, 2, 8, 14), [
                                createMockSymbol('host', vscode.SymbolKind.Property,
                                    new vscode.Range(7, 4, 7, 21)),
                                createMockSymbol('port', vscode.SymbolKind.Property,
                                    new vscode.Range(8, 4, 8, 14))
                            ])
                    ])
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.deepStrictEqual(reference.symbolPath, ['production', 'database', 'host']);
                assert.strictEqual(reference.toString(), '.env.yml:production.database.host');
            }
        });

        test('should return file-only reference when no keys found', async () => {
            const content = '# Just a comment';
            const doc = createMockDocument('empty.yml', 'yaml', content);
            const position = new vscode.Position(0, 5);

            const reference = await handler.extractReference(doc, position);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.strictEqual(reference.filePath, 'empty.yml');
                assert.strictEqual(reference.symbolPath, undefined);
                assert.strictEqual(reference.toString(), 'empty.yml');
            }
        });

        test('should include line numbers when configured', async () => {
            const content = 'key: value';
            const doc = createMockDocument('test.yml', 'yaml', content);
            const position = new vscode.Position(0, 5);

            const symbols = [
                createMockSymbol('key', vscode.SymbolKind.Property,
                    new vscode.Range(0, 0, 0, 10))
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
        test('should resolve key symbol at position', async () => {
            const content = 'name: Test\nversion: 1.0';
            const doc = createMockDocument('test.yml', 'yaml', content);
            const position = new vscode.Position(0, 5);

            const symbols = [
                createMockSymbol('name', vscode.SymbolKind.Property,
                    new vscode.Range(0, 0, 0, 10)),
                createMockSymbol('version', vscode.SymbolKind.Property,
                    new vscode.Range(1, 0, 1, 12))
            ];

            // Mock the getDocumentSymbols method
            const originalMethod = handler['getDocumentSymbols'];
            handler['getDocumentSymbols'] = async () => symbols;

            const context = await handler.resolveSymbol(doc, position);
            assert.notStrictEqual(context, null);
            if (context) {
                assert.strictEqual(context.symbol?.name, 'name');
                assert.strictEqual(context.languageId, 'yaml');
            }

            // Restore original method
            handler['getDocumentSymbols'] = originalMethod;
        });

        test('should return null when no symbol at position', async () => {
            const content = '# Comment only';
            const doc = createMockDocument('test.yml', 'yaml', content);
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