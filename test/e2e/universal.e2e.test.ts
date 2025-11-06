import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { ClipboardManager } from '../../src/utils/clipboard';

/**
 * End-to-end tests for UniversalHandler functionality
 * These tests run in a real VS Code environment
 */
suite('UniversalHandler E2E Test Suite', () => {
    const testWorkspace = vscode.workspace.workspaceFolders?.[0]?.uri;

    suiteSetup(async () => {
        // Ensure extension is activated
        const extension = vscode.extensions.getExtension('another-copy-reference-like-intellij');
        if (extension && !extension.isActive) {
            await extension.activate();
        }
    });

    teardown(async () => {
        // Close all editors after each test
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    });

    test('should copy reference for text file', async () => {
        const content = 'Hello World\nThis is a test file\nLine 3';
        const fileName = 'test.txt';

        // Create and open a document
        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'plaintext'
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Position cursor on "World" in first line
        editor.selection = new vscode.Selection(
            new vscode.Position(0, 6),
            new vscode.Position(0, 6)
        );

        // Execute copy reference command
        await vscode.commands.executeCommand('extension.copyReference');

        // Wait a bit for clipboard operation
        await new Promise(resolve => setTimeout(resolve, 100));

        // Read from clipboard
        const clipboardText = await vscode.env.clipboard.readText();

        // Should be in format: filepath:line:column
        assert.ok(clipboardText.includes(':1:7'), `Expected :1:7 in clipboard, got: ${clipboardText}`);
    });

    test('should copy reference for unsupported file type', async () => {
        const content = 'CUSTOM_LANG_START\ndata = 123\nCUSTOM_LANG_END';

        // Create document with unknown language
        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'plaintext' // Simulating unknown type
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Position cursor on "data"
        editor.selection = new vscode.Selection(
            new vscode.Position(1, 0),
            new vscode.Position(1, 0)
        );

        // Execute copy reference command
        await vscode.commands.executeCommand('extension.copyReference');

        // Wait for clipboard
        await new Promise(resolve => setTimeout(resolve, 100));

        const clipboardText = await vscode.env.clipboard.readText();

        // Should contain line and column
        assert.ok(clipboardText.includes(':2:1'), `Expected :2:1 in clipboard, got: ${clipboardText}`);
    });

    test('should handle cursor at end of file', async () => {
        const content = 'Line 1\nLine 2\nLast line';

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'plaintext'
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Position cursor at end of last line
        const lastLine = doc.lineCount - 1;
        const lastChar = doc.lineAt(lastLine).text.length;
        editor.selection = new vscode.Selection(
            new vscode.Position(lastLine, lastChar),
            new vscode.Position(lastLine, lastChar)
        );

        await vscode.commands.executeCommand('extension.copyReference');

        await new Promise(resolve => setTimeout(resolve, 100));

        const clipboardText = await vscode.env.clipboard.readText();

        // Should show correct line and column
        assert.ok(
            clipboardText.includes(`:${lastLine + 1}:${lastChar + 1}`),
            `Expected :${lastLine + 1}:${lastChar + 1} in clipboard, got: ${clipboardText}`
        );
    });

    test('should handle empty file', async () => {
        const doc = await vscode.workspace.openTextDocument({
            content: '',
            language: 'plaintext'
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Cursor at start of empty file
        editor.selection = new vscode.Selection(
            new vscode.Position(0, 0),
            new vscode.Position(0, 0)
        );

        await vscode.commands.executeCommand('extension.copyReference');

        await new Promise(resolve => setTimeout(resolve, 100));

        const clipboardText = await vscode.env.clipboard.readText();

        // Should show 1:1 for empty file
        assert.ok(clipboardText.includes(':1:1'), `Expected :1:1 in clipboard, got: ${clipboardText}`);
    });

    test('should handle multi-line selection', async () => {
        const content = 'Line 1\nLine 2\nLine 3\nLine 4';

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'plaintext'
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Select from line 2 to line 3
        editor.selection = new vscode.Selection(
            new vscode.Position(1, 0),
            new vscode.Position(2, 5)
        );

        await vscode.commands.executeCommand('extension.copyReference');

        await new Promise(resolve => setTimeout(resolve, 100));

        const clipboardText = await vscode.env.clipboard.readText();

        // Should use cursor position (active position of selection)
        // VS Code's active position is at the end of selection
        assert.ok(
            clipboardText.includes(':3:6'),
            `Expected :3:6 in clipboard, got: ${clipboardText}`
        );
    });

    test('should work with files having long paths', async () => {
        const content = 'test content';

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'plaintext'
        });

        const editor = await vscode.window.showTextDocument(doc);

        editor.selection = new vscode.Selection(
            new vscode.Position(0, 0),
            new vscode.Position(0, 0)
        );

        await vscode.commands.executeCommand('extension.copyReference');

        await new Promise(resolve => setTimeout(resolve, 100));

        const clipboardText = await vscode.env.clipboard.readText();

        // Should contain position information regardless of path length
        assert.ok(clipboardText.includes(':1:1'), `Expected :1:1 in clipboard, got: ${clipboardText}`);
    });

    test('should handle special characters in content', async () => {
        const content = '特殊字符\n🎉 emoji\n<html></html>\n{}[]()';

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'plaintext'
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Position on emoji line
        editor.selection = new vscode.Selection(
            new vscode.Position(1, 2),
            new vscode.Position(1, 2)
        );

        await vscode.commands.executeCommand('extension.copyReference');

        await new Promise(resolve => setTimeout(resolve, 100));

        const clipboardText = await vscode.env.clipboard.readText();

        // Should handle special characters correctly
        assert.ok(clipboardText.includes(':2:3'), `Expected :2:3 in clipboard, got: ${clipboardText}`);
    });

    test('should show information message on successful copy', async () => {
        const content = 'test';

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'plaintext'
        });

        const editor = await vscode.window.showTextDocument(doc);

        editor.selection = new vscode.Selection(
            new vscode.Position(0, 0),
            new vscode.Position(0, 0)
        );

        // Spy on window.showInformationMessage
        let messageShown = false;
        const originalShow = vscode.window.showInformationMessage;
        vscode.window.showInformationMessage = (message: string) => {
            messageShown = true;
            return originalShow(message);
        };

        try {
            await vscode.commands.executeCommand('extension.copyReference');

            await new Promise(resolve => setTimeout(resolve, 100));

            assert.ok(messageShown, 'Information message should be shown');
        } finally {
            // Restore original function
            vscode.window.showInformationMessage = originalShow;
        }
    });
});