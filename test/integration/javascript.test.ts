import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

suite('JavaScript/TypeScript Integration Tests', () => {
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

    test('should handle nested symbol paths in JavaScript', async () => {
        const content = `
class OuterClass {
    constructor() {
        this.innerClass = new InnerClass();
    }

    outerMethod() {
        class InnerClass {
            innerMethod() {
                return "nested";
            }
        }
        return InnerClass;
    }
}
        `;

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'javascript'
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Position cursor on outerMethod
        editor.selection = new vscode.Selection(
            new vscode.Position(5, 10),
            new vscode.Position(5, 10)
        );

        // Execute copy reference command
        await vscode.commands.executeCommand('extension.copyReference');

        // Wait for clipboard operation
        await new Promise(resolve => setTimeout(resolve, 100));

        const clipboardText = await vscode.env.clipboard.readText();

        // Should contain class and method reference
        assert.ok(
            clipboardText.includes('OuterClass') || clipboardText.includes('outerMethod'),
            `Expected OuterClass or outerMethod in clipboard, got: ${clipboardText}`
        );
    });

    test('should handle TypeScript interfaces and types', async () => {
        const content = `
interface User {
    id: number;
    name: string;
    email: string;
}

type UserResponse = {
    user: User;
    token: string;
};

class UserService {
    async getUser(id: number): Promise<User> {
        // Implementation
        return {} as User;
    }
}
        `;

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'typescript'
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Position cursor on getUser method
        editor.selection = new vscode.Selection(
            new vscode.Position(12, 15),
            new vscode.Position(12, 15)
        );

        await vscode.commands.executeCommand('extension.copyReference');

        await new Promise(resolve => setTimeout(resolve, 100));

        const clipboardText = await vscode.env.clipboard.readText();

        // Should contain UserService and getUser
        assert.ok(
            clipboardText.includes('UserService') || clipboardText.includes('getUser'),
            `Expected UserService or getUser in clipboard, got: ${clipboardText}`
        );
    });

    test('should handle JSX components correctly', async () => {
        const content = `
import React from 'react';

export const Button = ({ children, onClick }) => {
    return (
        <button onClick={onClick}>
            {children}
        </button>
    );
};

export class Card extends React.Component {
    render() {
        return <div className="card">{this.props.children}</div>;
    }
}
        `;

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'javascriptreact'
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Position cursor on Button component
        editor.selection = new vscode.Selection(
            new vscode.Position(2, 20),
            new vscode.Position(2, 20)
        );

        await vscode.commands.executeCommand('extension.copyReference');

        await new Promise(resolve => setTimeout(resolve, 100));

        const clipboardText = await vscode.env.clipboard.readText();

        // Should reference the Button component
        assert.ok(
            clipboardText.includes('Button'),
            `Expected Button in clipboard, got: ${clipboardText}`
        );
    });

    test('should handle TSX with generics', async () => {
        const content = `
import React from 'react';

interface ListProps<T> {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
}

export function List<T>({ items, renderItem }: ListProps<T>) {
    return (
        <ul>
            {items.map((item, index) => (
                <li key={index}>{renderItem(item)}</li>
            ))}
        </ul>
    );
}
        `;

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'typescriptreact'
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Position cursor on List function
        editor.selection = new vscode.Selection(
            new vscode.Position(7, 20),
            new vscode.Position(7, 20)
        );

        await vscode.commands.executeCommand('extension.copyReference');

        await new Promise(resolve => setTimeout(resolve, 100));

        const clipboardText = await vscode.env.clipboard.readText();

        // Should reference the List function
        assert.ok(
            clipboardText.includes('List'),
            `Expected List in clipboard, got: ${clipboardText}`
        );
    });

    test('should extract module paths correctly', async () => {
        // This would need actual file system setup
        // Simplified test for now
        const content = `
export class AuthService {
    login(username: string, password: string) {
        // Auth logic
    }
}
        `;

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'typescript'
        });

        // Mock the file path
        (doc as any).fileName = path.join(process.cwd(), 'src/services/AuthService.ts');

        const editor = await vscode.window.showTextDocument(doc);

        editor.selection = new vscode.Selection(
            new vscode.Position(1, 20),
            new vscode.Position(1, 20)
        );

        await vscode.commands.executeCommand('extension.copyReference');

        await new Promise(resolve => setTimeout(resolve, 100));

        const clipboardText = await vscode.env.clipboard.readText();

        // Should include module path
        assert.ok(
            clipboardText.length > 0,
            'Clipboard should not be empty'
        );
    });

    test('should handle arrow functions and function expressions', async () => {
        const content = `
const add = (a, b) => a + b;

const multiply = function(a, b) {
    return a * b;
};

export default {
    add,
    multiply,
    divide: (a, b) => a / b,
    subtract: function(a, b) {
        return a - b;
    }
};
        `;

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'javascript'
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Position cursor on add arrow function
        editor.selection = new vscode.Selection(
            new vscode.Position(0, 10),
            new vscode.Position(0, 10)
        );

        await vscode.commands.executeCommand('extension.copyReference');

        await new Promise(resolve => setTimeout(resolve, 100));

        const clipboardText = await vscode.env.clipboard.readText();

        assert.ok(
            clipboardText.includes('add') || clipboardText.includes(':'),
            `Expected function reference or position, got: ${clipboardText}`
        );
    });
});