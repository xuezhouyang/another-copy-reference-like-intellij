# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VS Code extension that replicates IntelliJ IDEA's "Copy Reference" functionality for Java and Kotlin files. The extension allows developers to copy fully qualified reference paths (e.g., `com.example.MyClass#methodName`) using keyboard shortcuts or context menus.

## Architecture

The extension follows a simple, single-file architecture (`src/extension.ts`) with these key components:

1. **Extension Activation**: Registers the `copyReference` command with VS Code
2. **Symbol Resolution**: Uses VS Code's built-in symbol provider API to parse document structure
3. **Package Extraction**: Uses regex to extract package declarations from file content
4. **Clipboard Integration**: Writes formatted references to the system clipboard

The extension leverages VS Code's language servers instead of implementing custom parsing, ensuring compatibility with language server updates.

## Development Commands

```bash
# Install dependencies
npm install

# Build the extension
npm run compile

# Development mode with file watching
npm run watch

# Run linter
npm run lint

# Package as .vsix file for distribution
npm run package

# Publish to VS Code marketplace
npm run publish
```

## Testing

Currently, there are no test files in the repository. To run tests when added:
```bash
npm test
```

## Extension Configuration

- **Extension ID**: `another-copy-reference-like-intellij`
- **Activation Events**: Triggered for Java/Kotlin files and the copyReference command
- **Main Entry**: `out/extension.js` (compiled from TypeScript)
- **Keyboard Shortcuts**:
  - Windows/Linux: `Alt+Shift+C`
  - Mac: `Cmd+Shift+C`

## Internationalization

The extension supports 12 languages with localization files in the root directory:
- `package.nls.json` (English - base)
- `package.nls.{lang}.json` (11 additional languages)

All user-facing strings use the `vscode.l10n.t()` API for translation.

## Key Implementation Details

1. **Symbol Finding**: The `findSymbolsAtPosition()` function recursively searches the document symbol tree to find classes and methods at the cursor position

2. **Package Name Extraction**: Uses the regex pattern `/package\s+([\w.]+)/` to extract package declarations from Java/Kotlin files

3. **Reference Format**:
   - Class reference: `package.name.ClassName`
   - Method reference: `package.name.ClassName#methodName`
   - Supports nested classes with proper qualification

4. **Error Handling**: Shows localized error messages when unable to determine reference paths

## Build Output

TypeScript files compile to:
- `out/extension.js` - Main extension code
- `out/extension.js.map` - Source maps for debugging

## Dependencies

The extension has zero production dependencies, using only VS Code's built-in APIs. Development dependencies include TypeScript, ESLint, and the VS Code extension packaging tool.

## Active Technologies
- TypeScript 5.0+ + VS Code Extension API 1.74+, vscode-languageserver-protocol, clipboard API (001-multi-language-reference)
- N/A (no persistent storage required) (001-multi-language-reference)

## Recent Changes
- 001-multi-language-reference: Added TypeScript 5.0+ + VS Code Extension API 1.74+, vscode-languageserver-protocol, clipboard API
