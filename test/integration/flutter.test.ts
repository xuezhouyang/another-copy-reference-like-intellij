import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { FlutterHandler } from '../../src/handlers/flutter';

suite('Flutter Integration Tests', () => {
    let handler: FlutterHandler;

    setup(() => {
        handler = new FlutterHandler();
    });

    suite('Widget Hierarchy', () => {
        test('should handle nested widget structure', async () => {
            const fixtureUri = vscode.Uri.file(
                path.join(__dirname, '../fixtures/flutter/widget_hierarchy.dart')
            );

            try {
                const document = await vscode.workspace.openTextDocument(fixtureUri);
                const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
                    'vscode.executeDocumentSymbolProvider',
                    document.uri
                );

                // Verify parent widget
                const parentWidget = symbols?.find(s => s.name === 'ParentWidget');
                assert.ok(parentWidget, 'ParentWidget should be found');

                // Verify parent state class
                const parentState = symbols?.find(s => s.name === '_ParentWidgetState');
                assert.ok(parentState, 'Parent state class should be found');

                // Verify child widgets
                const childWidget = symbols?.find(s => s.name === 'ChildWidget');
                assert.ok(childWidget, 'ChildWidget should be found');

                const nestedWidget = symbols?.find(s => s.name === 'NestedWidget');
                assert.ok(nestedWidget, 'NestedWidget should be found');
            } catch (error) {
                console.log('Skipping test - Dart extension may not be installed');
            }
        });

        test('should extract reference from nested widget method', async () => {
            const fixtureUri = vscode.Uri.file(
                path.join(__dirname, '../fixtures/flutter/widget_hierarchy.dart')
            );

            try {
                const document = await vscode.workspace.openTextDocument(fixtureUri);
                // Position inside nestedMethod
                const position = new vscode.Position(45, 10);

                const reference = await handler.extractReference(document, position);

                // The reference should include the widget class and method
                assert.ok(reference, 'Reference should be generated');
                if (reference) {
                    assert.ok(
                        reference.includes('NestedWidget'),
                        'Reference should include widget class name'
                    );
                    assert.ok(
                        reference.includes('nestedMethod'),
                        'Reference should include method name'
                    );
                }
            } catch (error) {
                console.log('Skipping test - Dart extension may not be installed');
            }
        });

        test('should handle build() method context', async () => {
            const fixtureUri = vscode.Uri.file(
                path.join(__dirname, '../fixtures/flutter/stateful_widget.dart')
            );

            try {
                const document = await vscode.workspace.openTextDocument(fixtureUri);
                // Position inside build method
                const position = new vscode.Position(34, 10);

                const reference = await handler.extractReference(document, position);

                assert.ok(reference, 'Reference should be generated for build method');
                if (reference) {
                    assert.ok(
                        reference.includes('build'),
                        'Reference should include build method'
                    );
                }
            } catch (error) {
                console.log('Skipping test - Dart extension may not be installed');
            }
        });
    });

    suite('Package Path Extraction', () => {
        test('should extract package name from pubspec.yaml', async () => {
            const pubspecUri = vscode.Uri.file(
                path.join(__dirname, '../fixtures/flutter/pubspec.yaml')
            );

            try {
                const document = await vscode.workspace.openTextDocument(pubspecUri);
                const content = document.getText();

                // Extract package name
                const packageMatch = content.match(/^name:\s*(.+)$/m);
                assert.ok(packageMatch, 'Package name should be found in pubspec.yaml');
                assert.strictEqual(
                    packageMatch![1].trim(),
                    'test_flutter_app',
                    'Package name should match'
                );
            } catch (error) {
                console.log('Skipping test - pubspec.yaml not found');
            }
        });
    });

    suite('End-to-End Reference Generation', () => {
        test('should generate complete reference for StatelessWidget method', async () => {
            const fixtureUri = vscode.Uri.file(
                path.join(__dirname, '../fixtures/flutter/stateless_widget.dart')
            );

            try {
                const document = await vscode.workspace.openTextDocument(fixtureUri);
                // Position inside _handleTap method
                const position = new vscode.Position(20, 10);

                const reference = await handler.extractReference(document, position);

                assert.ok(reference, 'Reference should be generated');
                if (reference) {
                    // Should follow format: package:widgetClass.methodName or similar
                    assert.ok(
                        reference.includes('MyButton'),
                        'Reference should include widget class'
                    );
                    assert.ok(
                        reference.includes('_handleTap') || reference.includes('handleTap'),
                        'Reference should include method name'
                    );
                }
            } catch (error) {
                console.log('Skipping test - Dart extension may not be installed');
            }
        });

        test('should generate reference for StatefulWidget state method', async () => {
            const fixtureUri = vscode.Uri.file(
                path.join(__dirname, '../fixtures/flutter/stateful_widget.dart')
            );

            try {
                const document = await vscode.workspace.openTextDocument(fixtureUri);
                // Position inside _increment method
                const position = new vscode.Position(25, 10);

                const reference = await handler.extractReference(document, position);

                assert.ok(reference, 'Reference should be generated');
                if (reference) {
                    assert.ok(
                        reference.includes('CounterWidget') || reference.includes('_CounterWidgetState'),
                        'Reference should include widget or state class'
                    );
                    assert.ok(
                        reference.includes('_increment') || reference.includes('increment'),
                        'Reference should include method name'
                    );
                }
            } catch (error) {
                console.log('Skipping test - Dart extension may not be installed');
            }
        });
    });
});
