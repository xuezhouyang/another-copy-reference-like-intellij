# Data Model: Multi-Language Copy Reference

**Date**: 2025-11-05
**Branch**: 001-multi-language-reference
**Phase**: 1 - Design

## Entity Definitions

### 1. Language Handler

**Purpose**: Represents the logic for processing a specific language or file type.

**Attributes**:
- `languageId`: string - VS Code language identifier (e.g., "javascript", "python")
- `fileExtensions`: string[] - Supported file extensions (e.g., [".js", ".jsx"])
- `priority`: number - Handler priority when multiple handlers match (0-100)
- `supportsFrameworks`: boolean - Whether handler can detect framework-specific patterns

**Methods**:
- `canHandle(document: TextDocument): boolean` - Check if handler supports the document
- `extractReference(document: TextDocument, position: Position): Promise<ReferenceFormat | null>` - Extract reference at position
- `resolveSymbol(document: TextDocument, position: Position): Promise<SymbolContext | null>` - Resolve symbol at cursor

**Relationships**:
- Implements `ILanguageHandler` interface
- Uses `ReferenceFormat` for output
- Creates `SymbolContext` during resolution

**Validation Rules**:
- `languageId` must be a valid VS Code language identifier
- `priority` must be between 0 and 100
- At least one file extension must be specified

### 2. Reference Format

**Purpose**: Defines how references are structured for each language.

**Attributes**:
- `filePath`: string - Absolute or relative path to file
- `modulePath`: string - Language-specific module/package path (optional)
- `symbolPath`: string[] - Hierarchical path to symbol (e.g., ["ClassName", "methodName"])
- `separator`: string - Character(s) separating path components (e.g., "#", ".", "::")
- `lineNumber`: number - Line number (for fallback references)
- `columnNumber`: number - Column number (for fallback references)
- `formatType`: "standard" | "fallback" - Type of reference format

**Methods**:
- `toString(): string` - Generate the formatted reference string
- `validate(): boolean` - Check if format is valid

**Relationships**:
- Created by `LanguageHandler`
- Used by `ClipboardEntry`

**Validation Rules**:
- `filePath` must not be empty
- If `formatType` is "fallback", `lineNumber` must be >= 1
- `separator` must be non-empty
- `symbolPath` elements must not contain the separator character

### 3. Symbol Context

**Purpose**: Contains information about the current cursor position and surrounding symbols.

**Attributes**:
- `document`: TextDocument - The document being analyzed
- `position`: Position - Cursor position (line, column)
- `symbol`: DocumentSymbol | null - Symbol at cursor position
- `parentSymbols`: DocumentSymbol[] - Parent symbol hierarchy
- `languageId`: string - Document language identifier
- `frameworkType`: string | null - Detected framework (e.g., "react", "flutter")

**Methods**:
- `getFullSymbolPath(): string[]` - Get complete symbol hierarchy
- `isInsideSymbol(): boolean` - Check if cursor is within a symbol
- `getContainingClass(): DocumentSymbol | null` - Find containing class/component
- `getContainingMethod(): DocumentSymbol | null` - Find containing method/function

**Relationships**:
- Created by `LanguageHandler`
- Uses VS Code `DocumentSymbol` type
- Input to `ReferenceFormat` creation

**Validation Rules**:
- `position` must be within document bounds
- `parentSymbols` must be ordered from outermost to innermost
- `frameworkType` must be null or a recognized framework identifier

### 4. Clipboard Entry

**Purpose**: The formatted reference string ready for clipboard.

**Attributes**:
- `content`: string - The formatted reference string
- `timestamp`: Date - When the reference was created
- `source`: SourceInfo - Information about the source file
- `languageHandler`: string - Name of handler that generated the reference
- `success`: boolean - Whether reference was successfully copied

**Methods**:
- `copyToClipboard(): Promise<boolean>` - Write content to system clipboard
- `validate(): boolean` - Verify content is valid

**Relationships**:
- Created from `ReferenceFormat`
- Uses VS Code clipboard API

**Validation Rules**:
- `content` must not be empty
- `content` length must not exceed 32KB (clipboard limitation)
- `timestamp` must not be in the future

### 5. Handler Configuration

**Purpose**: Configuration for language-specific handlers.

**Attributes**:
- `enabled`: boolean - Whether handler is active
- `customPatterns`: PatternConfig[] - User-defined patterns (optional)
- `referenceTemplate`: string - Custom reference format template (optional)
- `useBuiltInSymbols`: boolean - Whether to use VS Code's symbol provider
- `frameworkDetection`: boolean - Whether to detect framework-specific patterns

**Methods**:
- `merge(defaults: HandlerConfiguration): HandlerConfiguration` - Merge with defaults
- `validate(): string[]` - Validate configuration, return errors

**Relationships**:
- Used by `LanguageHandler`
- Loaded from VS Code settings

**Validation Rules**:
- Pattern regex must be valid
- Template must contain valid placeholders
- At least one symbol source must be enabled

### 6. Cache Entry

**Purpose**: Cached symbol data for performance optimization.

**Attributes**:
- `documentUri`: string - URI of the cached document
- `documentVersion`: number - Document version when cached
- `symbols`: DocumentSymbol[] - Cached symbols
- `timestamp`: Date - When cache entry was created
- `accessCount`: number - Number of times accessed

**Methods**:
- `isValid(document: TextDocument): boolean` - Check if cache is still valid
- `touch(): void` - Update last access time
- `getAge(): number` - Get cache age in milliseconds

**Relationships**:
- Managed by `CacheManager`
- Used by `LanguageHandler`

**Validation Rules**:
- `documentVersion` must be >= 1
- `timestamp` must not be in the future
- Cache expires after 5 minutes of no access

## State Transitions

### Symbol Resolution State Machine

```
IDLE -> RESOLVING -> RESOLVED
  ↓         ↓           ↓
  └─────> ERROR <───────┘
```

**States**:
- `IDLE`: No active resolution
- `RESOLVING`: Actively parsing/analyzing document
- `RESOLVED`: Symbol found and reference generated
- `ERROR`: Resolution failed

**Transitions**:
- `IDLE -> RESOLVING`: User invokes Copy Reference
- `RESOLVING -> RESOLVED`: Symbol successfully found
- `RESOLVING -> ERROR`: Parse error, timeout, or cancellation
- `RESOLVED -> IDLE`: Reference copied to clipboard
- `ERROR -> IDLE`: Error displayed to user

### Cache Lifecycle

```
EMPTY -> POPULATED -> VALID -> INVALID -> EVICTED
                        ↑←─────────┘
```

**States**:
- `EMPTY`: No cache entry exists
- `POPULATED`: Cache entry created
- `VALID`: Cache matches document version
- `INVALID`: Document changed, cache stale
- `EVICTED`: Cache removed (memory pressure or timeout)

**Transitions**:
- `EMPTY -> POPULATED`: First symbol resolution
- `POPULATED -> VALID`: Cache hit with matching version
- `VALID -> INVALID`: Document edited
- `INVALID -> POPULATED`: Re-parse and update cache
- `VALID/INVALID -> EVICTED`: Timeout or memory limit

## Relationships Diagram

```
TextDocument
     |
     v
LanguageHandler <-- HandlerConfiguration
     |
     ├──> SymbolContext
     |         |
     |         v
     |    DocumentSymbol[]
     |
     ├──> CacheEntry
     |
     └──> ReferenceFormat
               |
               v
         ClipboardEntry
               |
               v
         System Clipboard
```

## Data Constraints

### Performance Constraints
- Symbol resolution must complete within 100ms
- Cache lookup must be O(1)
- Maximum cache size: 100 documents
- Maximum symbols per document: 10,000

### Size Constraints
- Maximum file size for parsing: 2MB
- Maximum reference string length: 500 characters
- Maximum symbol hierarchy depth: 10 levels
- Maximum cache memory usage: 20MB

### Validation Rules Summary
1. All language handlers must have unique language IDs
2. Reference formats must produce valid, parseable strings
3. Symbol contexts must have valid document positions
4. Cache entries must be invalidated on document change
5. Clipboard operations must handle platform-specific errors
6. All user-facing strings must have i18n keys

## Example Data Instances

### JavaScript/React Handler Example
```typescript
{
  languageHandler: {
    languageId: "javascriptreact",
    fileExtensions: [".jsx", ".tsx"],
    priority: 90,
    supportsFrameworks: true
  },
  symbolContext: {
    document: TextDocument,
    position: { line: 42, character: 15 },
    symbol: { name: "handleClick", kind: SymbolKind.Method },
    parentSymbols: [
      { name: "UserProfile", kind: SymbolKind.Class }
    ],
    frameworkType: "react"
  },
  referenceFormat: {
    filePath: "src/components/UserProfile.jsx",
    symbolPath: ["UserProfile", "handleClick"],
    separator: "#",
    formatType: "standard"
  },
  output: "src/components/UserProfile.jsx#UserProfile.handleClick"
}
```

### Fallback Handler Example
```typescript
{
  languageHandler: {
    languageId: "*",
    fileExtensions: ["*"],
    priority: 0,
    supportsFrameworks: false
  },
  referenceFormat: {
    filePath: "config/unknown.conf",
    lineNumber: 15,
    columnNumber: 8,
    separator: ":",
    formatType: "fallback"
  },
  output: "config/unknown.conf:15:8"
}
```