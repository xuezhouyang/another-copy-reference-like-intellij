import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { MarkdownHandler } from '../../src/handlers/markdown';
import { TestWorkspace } from '../helpers/workspace';

suite('MarkdownHandler Integration Tests', () => {
    let handler: MarkdownHandler;
    let workspace: TestWorkspace;

    suiteSetup(async () => {
        workspace = new TestWorkspace();
        await workspace.setup();
        handler = new MarkdownHandler();
    });

    suiteTeardown(async () => {
        await workspace.cleanup();
    });

    test('should extract reference from README.md', async () => {
        const readmePath = path.join(workspace.rootPath, 'README.md');
        const content = `# Project Title

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

### Basic Example

\`\`\`javascript
const example = require('example');
example.run();
\`\`\`

### Advanced Features

- Feature 1
- Feature 2
- Feature 3

## API Documentation

### Methods

#### example.run(options)

Runs the example with given options.

## Contributing

Please read CONTRIBUTING.md for details.

## License

This project is licensed under the MIT License.`;

        const uri = vscode.Uri.file(readmePath);
        await workspace.writeFile(readmePath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test reference at main heading
        const mainHeadingPos = new vscode.Position(0, 5);
        const mainRef = await handler.extractReference(document, mainHeadingPos);
        assert.notStrictEqual(mainRef, null);
        if (mainRef) {
            assert.strictEqual(mainRef.toString(), 'README.md#project-title');
        }

        // Test reference at nested heading
        const nestedHeadingPos = new vscode.Position(10, 5);
        const nestedRef = await handler.extractReference(document, nestedHeadingPos);
        assert.notStrictEqual(nestedRef, null);
        if (nestedRef) {
            assert.strictEqual(nestedRef.toString(), 'README.md#basic-example');
        }

        // Test reference at method documentation
        const methodPos = new vscode.Position(26, 10);
        const methodRef = await handler.extractReference(document, methodPos);
        assert.notStrictEqual(methodRef, null);
        if (methodRef) {
            assert.strictEqual(methodRef.toString(), 'README.md#examplerunoptions');
        }
    });

    test('should handle documentation structure', async () => {
        const docPath = path.join(workspace.rootPath, 'docs', 'api.md');
        const content = `# API Reference

## Classes

### MyClass

The main class for the library.

#### Constructor

\`\`\`javascript
new MyClass(options)
\`\`\`

#### Methods

##### myClass.method1()

Does something important.

##### myClass.method2(param)

Does something else with a parameter.

## Interfaces

### MyInterface

Defines the structure for configuration.

\`\`\`typescript
interface MyInterface {
  prop1: string;
  prop2: number;
}
\`\`\`

## Type Aliases

### MyType

\`\`\`typescript
type MyType = string | number;
\`\`\``;

        const uri = vscode.Uri.file(docPath);
        await workspace.createDirectory(path.dirname(docPath));
        await workspace.writeFile(docPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test class reference
        const classPos = new vscode.Position(4, 5);
        const classRef = await handler.extractReference(document, classPos);
        assert.notStrictEqual(classRef, null);
        if (classRef) {
            assert.strictEqual(classRef.toString(), 'docs/api.md#myclass');
        }

        // Test method reference
        const methodPos = new vscode.Position(16, 10);
        const methodRef = await handler.extractReference(document, methodPos);
        assert.notStrictEqual(methodRef, null);
        if (methodRef) {
            assert.strictEqual(methodRef.toString(), 'docs/api.md#myclassmethod1');
        }

        // Test interface reference
        const interfacePos = new vscode.Position(24, 5);
        const interfaceRef = await handler.extractReference(document, interfacePos);
        assert.notStrictEqual(interfaceRef, null);
        if (interfaceRef) {
            assert.strictEqual(interfaceRef.toString(), 'docs/api.md#myinterface');
        }
    });

    test('should handle CHANGELOG.md structure', async () => {
        const changelogPath = path.join(workspace.rootPath, 'CHANGELOG.md');
        const content = `# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- New feature X
- Support for Y

### Changed
- Updated dependency Z

## [1.2.0] - 2024-01-15

### Added
- Feature A
- Feature B

### Fixed
- Bug fix for issue #123

## [1.1.0] - 2023-12-01

### Added
- Initial implementation

### Documentation
- Added comprehensive API docs`;

        const uri = vscode.Uri.file(changelogPath);
        await workspace.writeFile(changelogPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test version reference
        const versionPos = new vscode.Position(13, 5);
        const versionRef = await handler.extractReference(document, versionPos);
        assert.notStrictEqual(versionRef, null);
        if (versionRef) {
            assert.strictEqual(versionRef.toString(), 'CHANGELOG.md#120---2024-01-15');
        }

        // Test subsection reference
        const subsectionPos = new vscode.Position(15, 5);
        const subsectionRef = await handler.extractReference(document, subsectionPos);
        assert.notStrictEqual(subsectionRef, null);
        if (subsectionRef) {
            assert.strictEqual(subsectionRef.toString(), 'CHANGELOG.md#added');
        }
    });

    test('should handle guide documents with complex structure', async () => {
        const guidePath = path.join(workspace.rootPath, 'docs', 'guide', 'getting-started.md');
        const content = `---
title: Getting Started Guide
author: Documentation Team
date: 2024-01-01
---

# Getting Started

Welcome to our comprehensive guide!

## Prerequisites

Before you begin, ensure you have:

- Node.js (>= 14.0.0)
- npm or yarn
- Git

## Installation

### Using npm

\`\`\`bash
npm install @example/library
\`\`\`

### Using yarn

\`\`\`bash
yarn add @example/library
\`\`\`

## Configuration

### Basic Setup

Create a configuration file:

\`\`\`javascript
// config.js
module.exports = {
  apiKey: 'your-api-key',
  environment: 'production'
};
\`\`\`

### Advanced Options

#### Database Configuration

\`\`\`javascript
{
  database: {
    host: 'localhost',
    port: 5432
  }
}
\`\`\`

#### Logging Options

\`\`\`javascript
{
  logging: {
    level: 'info',
    format: 'json'
  }
}
\`\`\`

## First Steps

### Hello World Example

\`\`\`javascript
const lib = require('@example/library');

lib.sayHello('World');
\`\`\`

## Troubleshooting

### Common Issues

#### Issue: Module not found

Solution: Ensure the package is properly installed.

#### Issue: Configuration error

Solution: Verify your config file syntax.

## Next Steps

- Read the [API Documentation](../api.md)
- Check out [Examples](../examples/)
- Join our [Community](https://community.example.com)`;

        const uri = vscode.Uri.file(guidePath);
        await workspace.createDirectory(path.dirname(guidePath));
        await workspace.writeFile(guidePath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test nested configuration section
        const configPos = new vscode.Position(46, 10);
        const configRef = await handler.extractReference(document, configPos);
        assert.notStrictEqual(configRef, null);
        if (configRef) {
            assert.strictEqual(configRef.toString(), 'docs/guide/getting-started.md#database-configuration');
        }

        // Test troubleshooting section
        const troublePos = new vscode.Position(75, 10);
        const troubleRef = await handler.extractReference(document, troublePos);
        assert.notStrictEqual(troubleRef, null);
        if (troubleRef) {
            assert.strictEqual(troubleRef.toString(), 'docs/guide/getting-started.md#issue-module-not-found');
        }
    });

    test('should handle special markdown features', async () => {
        const specialPath = path.join(workspace.rootPath, 'special.md');
        const content = `# Features with Special Characters & Symbols

## Math: E = mc²

Some content about Einstein's equation.

## Code: \`console.log()\`

Inline code in heading.

## Emoji: 🚀 Rocket Launch

Content with emoji in heading.

## Chinese: 中文文档

Content in Chinese.

## Links: [External Link](https://example.com)

Content with link in heading.

## **Bold** and *Italic*

Formatted text in heading.

## Question: How does it work?

FAQ-style heading.

## Path: /usr/local/bin

File system path in heading.`;

        const uri = vscode.Uri.file(specialPath);
        await workspace.writeFile(specialPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test math symbols
        const mathPos = new vscode.Position(2, 5);
        const mathRef = await handler.extractReference(document, mathPos);
        assert.notStrictEqual(mathRef, null);
        if (mathRef) {
            assert.strictEqual(mathRef.toString(), 'special.md#math-e--mc');
        }

        // Test emoji
        const emojiPos = new vscode.Position(10, 5);
        const emojiRef = await handler.extractReference(document, emojiPos);
        assert.notStrictEqual(emojiRef, null);
        if (emojiRef) {
            assert.strictEqual(emojiRef.toString(), 'special.md#emoji--rocket-launch');
        }

        // Test question mark
        const questionPos = new vscode.Position(26, 5);
        const questionRef = await handler.extractReference(document, questionPos);
        assert.notStrictEqual(questionRef, null);
        if (questionRef) {
            assert.strictEqual(questionRef.toString(), 'special.md#question-how-does-it-work');
        }
    });

    test('should work with VS Code markdown preview', async () => {
        const previewPath = path.join(workspace.rootPath, 'preview-test.md');
        const content = `# Preview Test

## Section One

This is a test document for preview functionality.

### Subsection 1.1

Content for subsection.

## Section Two

More content here.

### Subsection 2.1

#### Deep Nesting

##### Very Deep

###### Maximum Depth

Content at maximum heading depth.`;

        const uri = vscode.Uri.file(previewPath);
        await workspace.writeFile(previewPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test different heading levels
        const levels = [
            { line: 0, expected: 'preview-test.md#preview-test' },
            { line: 2, expected: 'preview-test.md#section-one' },
            { line: 6, expected: 'preview-test.md#subsection-11' },
            { line: 14, expected: 'preview-test.md#deep-nesting' },
            { line: 16, expected: 'preview-test.md#very-deep' },
            { line: 18, expected: 'preview-test.md#maximum-depth' }
        ];

        for (const { line, expected } of levels) {
            const pos = new vscode.Position(line, 5);
            const ref = await handler.extractReference(document, pos);
            assert.notStrictEqual(ref, null, `Failed at line ${line}`);
            if (ref) {
                assert.strictEqual(ref.toString(), expected, `Mismatch at line ${line}`);
            }
        }
    });

    test('should handle performance with large documents', async () => {
        const largePath = path.join(workspace.rootPath, 'large.md');

        // Generate a large markdown document
        let content = '# Large Document\n\n';
        for (let i = 1; i <= 100; i++) {
            content += `## Section ${i}\n\n`;
            content += `This is content for section ${i}.\n\n`;
            for (let j = 1; j <= 5; j++) {
                content += `### Subsection ${i}.${j}\n\n`;
                content += `Content for subsection ${i}.${j}.\n\n`;
            }
        }

        const uri = vscode.Uri.file(largePath);
        await workspace.writeFile(largePath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test extraction performance
        const startTime = Date.now();

        // Extract references at multiple positions
        const positions = [
            new vscode.Position(10, 5),
            new vscode.Position(100, 5),
            new vscode.Position(500, 5),
            new vscode.Position(1000, 5)
        ];

        for (const pos of positions) {
            const ref = await handler.extractReference(document, pos);
            assert.notStrictEqual(ref, null);
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Should complete within reasonable time (< 1 second for all extractions)
        assert.ok(duration < 1000, `Extraction took too long: ${duration}ms`);
    });
});