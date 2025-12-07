# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VS Code extension that replicates IntelliJ IDEA's "Copy Reference" functionality with support for multiple programming languages and output formats. The extension allows developers to copy reference paths in various formats (e.g., `com.example.MyClass#methodName`, `[Class#method](file.java#L42)`, etc.) using keyboard shortcuts or context menus.

## Architecture

The extension follows a modular, handler-based architecture with these key components:

### Core Modules

1. **Extension Activation** (`src/extension.ts`):
   - Registers two main commands: `copyReference` and `copyReferenceWithFormat`
   - Initializes handler registry and format manager

2. **Handler System** (`src/handlers/`):
   - `HandlerRegistry`: Routes files to appropriate language handlers
   - `BaseLanguageHandler`: Abstract base class for all handlers
   - Language-specific handlers: JavaHandler, JavaScriptHandler, PythonHandler, etc.
   - `UniversalHandler`: Fallback for unsupported file types

3. **Format System** (`src/formatters/`):
   - `FormatManager`: Singleton managing all format providers
   - `BaseFormatProvider`: Abstract base for format implementations
   - Built-in providers: Qualified, WithLine, FilePath, Markdown, Javadoc, StackTrace
   - `CustomFormatProvider`: User-defined template-based formats

4. **Type System** (`src/types/`):
   - `ReferenceFormat`: Core data structure for references
   - `FormatVariables`: Variables for format templates
   - `IFormatProvider`: Format provider interface

The extension leverages VS Code's language servers for symbol resolution, ensuring compatibility with language server updates.

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

The extension has comprehensive test coverage with three types of tests:

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

Test structure:
- `test/unit/handlers/` - Handler unit tests
- `test/unit/formatters/` - Format provider tests
- `test/integration/` - Integration tests
- `test/e2e/` - End-to-end tests
- `test/helpers/` - Test utilities and mocks

## Extension Configuration

- **Extension ID**: `another-copy-reference-like-intellij`
- **Activation Events**: Triggered for multiple languages and commands
- **Main Entry**: `dist/extension.js` (webpack bundled)
- **Keyboard Shortcuts**:
  - Copy Reference (default format):
    - Windows/Linux: `Alt+Shift+C`
    - Mac: `Cmd+Shift+C`
  - Copy Reference with Format Selection:
    - Windows/Linux: `Alt+Shift+F`
    - Mac: `Cmd+Shift+F`

## Internationalization

The extension supports 12 languages with localization files in the root directory:
- `package.nls.json` (English - base)
- `package.nls.{lang}.json` (11 additional languages)

All user-facing strings use the `vscode.l10n.t()` API for translation.

## Key Implementation Details

### Handler System

1. **Handler Registration**: Each language handler registers with the `HandlerRegistry` with a priority score
   - Higher priority handlers are tried first
   - Handlers can handle multiple file extensions
   - Example: JavaHandler (priority 80) for `.java`, `.kt`, `.kts`

2. **Symbol Resolution**: Uses VS Code's `vscode.executeDocumentSymbolProvider` to get document symbols
   - Recursively searches symbol tree to find symbols at cursor position
   - Handles nested classes, methods, fields, and other symbols

3. **Reference Extraction**: Each handler implements `extractReference()` to produce a `ReferenceFormat`:
   ```typescript
   interface ReferenceFormat {
     modulePath: string;      // e.g., "com.example"
     symbolPath: string[];    // e.g., ["MyClass", "myMethod"]
     filePath: string;
     line: number;
     column: number;
   }
   ```

### Format System

1. **Format Providers**: Each provider implements the `IFormatProvider` interface:
   - `format(variables: FormatVariables): string` - Convert variables to formatted string
   - `supportsLanguage(languageId: string): boolean` - Language compatibility check

2. **Format Variables**: Extracted from `ReferenceFormat`:
   - Package/module: `variables.package`
   - Class name: `variables.class`
   - Method/field: `variables.method` / `variables.field`
   - File path: `variables.file`, `variables.fileName`
   - Position: `variables.line`, `variables.column`

3. **Format Templates**: Custom formats use variable placeholders:
   - `${package}.${class}#${method}:${line}`
   - Supports all variables from `FormatVariables` interface

4. **Language-Specific Formats**: Some formats only apply to certain languages:
   - Javadoc (`{@link Class#method()}`) - Java/Kotlin only
   - Stack Trace (`at Class.method(File.java:42)`) - Java/Kotlin only

### Error Handling

- Localized error messages using `vscode.l10n.t()`
- Graceful fallback to UniversalHandler for unsupported files
- Fallback to Qualified format if specified format provider not found

## Build Output

The extension uses webpack for production builds:

Development build:
- `out/` - TypeScript compiled output
- `out/extension.js` - Main extension code
- `out/test/` - Compiled test files

Production build:
- `dist/extension.js` - Webpack bundled and minified (~70 KB)
- Tree-shaken and optimized for distribution
- Source maps included for debugging

VSIX package:
- `another-copy-reference-like-intellij-{version}.vsix` - Installable extension package (~97 KB)

## Dependencies

The extension has zero production dependencies, using only VS Code's built-in APIs.

Development dependencies:
- TypeScript 5.0+ (compilation)
- Webpack 5 (bundling)
- ESLint (linting)
- Mocha + NYC (testing and coverage)
- @vscode/vsce (packaging)

## Active Technologies
- TypeScript 5.0+ + VS Code Extension API 1.74+
- VS Code Language Server Protocol for symbol resolution
- Clipboard API for cross-platform clipboard access
- Webpack 5 for bundling and tree-shaking
- Mocha for unit and integration testing

## Recent Changes

### v1.2.0 (Current)
- Added multi-format reference system with 6 built-in formats
- Added format picker UI with QuickPick
- Added custom format template support
- New command: `copyReferenceWithFormat` (Alt+Shift+F)
- Comprehensive test suite for format providers
- Updated documentation and examples

### v1.0.1
- Fixed Java/Kotlin handler bug
- Added missing JavaHandler implementation

### v1.0.0
- Complete rewrite with handler-based architecture
- Multi-language support (Java, Kotlin, JavaScript, TypeScript, Python, etc.)
- Framework detection for React and Flutter
- Universal fallback handler
- Performance caching system
- Internationalization support (12 languages)
