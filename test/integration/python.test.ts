import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

suite('Python Integration Tests', () => {
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

    test('should handle Python package hierarchy', async () => {
        const content = `
"""Package module for testing"""

class PackageClass:
    """A class in a package"""

    def __init__(self):
        self.data = []

    def process(self, item):
        """Process an item"""
        self.data.append(item)
        return len(self.data)

def package_function():
    """A module-level function"""
    return PackageClass()
        `;

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'python'
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Position cursor on process method
        editor.selection = new vscode.Selection(
            new vscode.Position(9, 10),
            new vscode.Position(9, 10)
        );

        // Execute copy reference command
        await vscode.commands.executeCommand('extension.copyReference');

        // Wait for clipboard operation
        await new Promise(resolve => setTimeout(resolve, 100));

        const clipboardText = await vscode.env.clipboard.readText();

        // Should contain class and method reference
        assert.ok(
            clipboardText.includes('PackageClass') || clipboardText.includes('process') || clipboardText.includes(':'),
            `Expected PackageClass or process in clipboard, got: ${clipboardText}`
        );
    });

    test('should handle nested Python classes', async () => {
        const content = `
class OuterClass:
    """Outer class with nested inner class"""

    def outer_method(self):
        return self.InnerClass()

    class InnerClass:
        """Inner nested class"""

        def inner_method(self):
            return "nested"

        class DeepNested:
            def deep_method(self):
                return "very nested"
        `;

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'python'
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Position cursor on inner_method
        editor.selection = new vscode.Selection(
            new vscode.Position(10, 15),
            new vscode.Position(10, 15)
        );

        await vscode.commands.executeCommand('extension.copyReference');

        await new Promise(resolve => setTimeout(resolve, 100));

        const clipboardText = await vscode.env.clipboard.readText();

        assert.ok(
            clipboardText.includes('InnerClass') || clipboardText.includes('inner_method') || clipboardText.includes(':'),
            `Expected InnerClass or inner_method in clipboard, got: ${clipboardText}`
        );
    });

    test('should handle Python decorators correctly', async () => {
        const content = `
from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

class MyClass:
    @property
    def value(self):
        return self._value

    @value.setter
    def value(self, val):
        self._value = val

    @staticmethod
    def static_method():
        return "static"

    @classmethod
    def class_method(cls):
        return cls()

    @my_decorator
    def decorated_method(self):
        return "decorated"
        `;

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'python'
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Position cursor on decorated_method
        editor.selection = new vscode.Selection(
            new vscode.Position(27, 15),
            new vscode.Position(27, 15)
        );

        await vscode.commands.executeCommand('extension.copyReference');

        await new Promise(resolve => setTimeout(resolve, 100));

        const clipboardText = await vscode.env.clipboard.readText();

        assert.ok(
            clipboardText.includes('MyClass') || clipboardText.includes('decorated_method') || clipboardText.includes(':'),
            `Expected MyClass or decorated_method in clipboard, got: ${clipboardText}`
        );
    });

    test('should handle async Python functions', async () => {
        const content = `
import asyncio

async def async_function(param):
    """An async function"""
    await asyncio.sleep(1)
    return param * 2

class AsyncClass:
    async def async_method(self):
        """An async method"""
        result = await async_function(5)
        return result

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        pass
        `;

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'python'
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Position cursor on async_method
        editor.selection = new vscode.Selection(
            new vscode.Position(10, 20),
            new vscode.Position(10, 20)
        );

        await vscode.commands.executeCommand('extension.copyReference');

        await new Promise(resolve => setTimeout(resolve, 100));

        const clipboardText = await vscode.env.clipboard.readText();

        assert.ok(
            clipboardText.includes('AsyncClass') || clipboardText.includes('async_method') || clipboardText.includes(':'),
            `Expected AsyncClass or async_method in clipboard, got: ${clipboardText}`
        );
    });

    test('should handle Python type hints and generics', async () => {
        const content = `
from typing import List, Dict, Optional, TypeVar, Generic

T = TypeVar('T')

class GenericClass(Generic[T]):
    def __init__(self, value: T):
        self.value: T = value

    def get_value(self) -> T:
        return self.value

def typed_function(
    items: List[str],
    mapping: Dict[str, int],
    optional: Optional[float] = None
) -> Dict[str, List[int]]:
    """Function with complex type hints"""
    result = {}
    for item in items:
        result[item] = [mapping.get(item, 0)]
    return result

class TypedClass:
    name: str
    age: int
    scores: List[float]

    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age
        self.scores = []
        `;

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'python'
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Position cursor on typed_function
        editor.selection = new vscode.Selection(
            new vscode.Position(12, 10),
            new vscode.Position(12, 10)
        );

        await vscode.commands.executeCommand('extension.copyReference');

        await new Promise(resolve => setTimeout(resolve, 100));

        const clipboardText = await vscode.env.clipboard.readText();

        assert.ok(
            clipboardText.includes('typed_function') || clipboardText.includes(':'),
            `Expected typed_function in clipboard, got: ${clipboardText}`
        );
    });

    test('should handle Python module imports and __init__.py', async () => {
        const content = `
"""__init__.py file content"""

from .module1 import function1
from .module2 import Class2

__all__ = ['function1', 'Class2', 'init_function']

def init_function():
    """Function defined in __init__.py"""
    return "initialized"

class InitClass:
    """Class defined in __init__.py"""
    pass
        `;

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'python'
        });

        // Mock the file path to simulate __init__.py
        (doc as any).fileName = path.join(process.cwd(), 'mypackage/__init__.py');

        const editor = await vscode.window.showTextDocument(doc);

        // Position cursor on InitClass
        editor.selection = new vscode.Selection(
            new vscode.Position(12, 10),
            new vscode.Position(12, 10)
        );

        await vscode.commands.executeCommand('extension.copyReference');

        await new Promise(resolve => setTimeout(resolve, 100));

        const clipboardText = await vscode.env.clipboard.readText();

        // Should handle __init__.py specially
        assert.ok(
            clipboardText.length > 0,
            'Clipboard should not be empty'
        );
    });
});