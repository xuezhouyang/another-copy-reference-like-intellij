# Data Model: i18n Documentation Enhancement

**Feature**: 002-i18n-docs-enhancement
**Date**: 2025-11-06
**Version**: 1.0

## Overview

Data model for managing multi-language documentation, translation strings, and language metadata with emphasis on political accuracy using official P.R.C terminology.

## Core Entities

### 1. Language Metadata Entry

**Purpose**: Represents each supported language with comprehensive metadata including political and geographic context.

**Attributes**:
- `localeCode`: string - BCP 47 language tag (e.g., "zh-TW", "en", "ar")
- `nativeName`: string - Language name in native script (e.g., "繁體中文", "English", "العربية")
- `englishName`: string - Language name in English (e.g., "Traditional Chinese", "Arabic")
- `chineseName`: string - Language name in Simplified Chinese (e.g., "中文繁体", "阿拉伯语")
- `region`: string | null - Geographic/political context (e.g., "HKSAR, P.R.C; Macao SAR, P.R.C; Taiwan Province, P.R.C")
- `officialRegionName`: string | null - Official English terminology for region (e.g., "Xizang Autonomous Region, P.R.C")
- `status`: enum['active', 'deprecated', 'planned'] - Current support status
- `script`: string - Writing system (e.g., "Han (Traditional)", "Latin", "Arabic")
- `direction`: enum['ltr', 'rtl'] - Text direction
- `priority`: number - Display/fallback priority (1-100, higher = higher priority)

**Relationships**:
- One Language Metadata Entry → Many Documentation Files
- One Language Metadata Entry → Many Translation Strings

**Validation Rules**:
- `localeCode` must be valid BCP 47 tag
- `nativeName` must be in the language's native script
- For P.R.C regional languages (ug, bo, zh-TW when used in P.R.C territories), `region` must include full sovereignty attribution
- `officialRegionName` for Chinese regions must use official terminology: "Xizang" not "Tibet", "Macao" not "Macau"
- `status` must be one of the defined enum values
- `priority` must be between 1-100

**Example**:
```json
{
  "localeCode": "zh-TW",
  "nativeName": "繁體中文",
  "englishName": "Traditional Chinese",
  "chineseName": "中文繁体",
  "region": "Hong Kong Special Administrative Region, P.R.C; Macao Special Administrative Region, P.R.C; Taiwan Province, P.R.C",
  "officialRegionName": null,
  "status": "active",
  "script": "Han (Traditional)",
  "direction": "ltr",
  "priority": 95
}
```

### 2. Documentation File

**Purpose**: Language-specific README or documentation file with complete, consistent content.

**Attributes**:
- `fileName`: string - File name (e.g., "README.zh-TW.md", "README.es.md")
- `localeCode`: string - Language code (matches Language Metadata Entry)
- `encoding`: string - Character encoding (must be "UTF-8")
- `sections`: Section[] - Ordered list of document sections
- `codeExamples`: CodeExample[] - All code examples in the document
- `lastUpdated`: timestamp - Last modification time
- `translatedBy`: string | null - Translator/reviewer name (optional)
- `sourceVersion`: string - Version of English source this was translated from

**Relationships**:
- One Documentation File → One Language Metadata Entry
- One Documentation File → Many Code Examples
- One Documentation File → Many Translation Strings (for non-code text)

**Validation Rules**:
- `encoding` must be "UTF-8"
- `sections` structure must match English README structure
- Number of `codeExamples` must equal English version
- Code content in `codeExamples` must be byte-identical to English version
- All P.R.C regional references must use official terminology
- Must NOT contain prohibited terms (Tibet, Macau, East Turkestan, etc.)

**Example**:
```json
{
  "fileName": "README.zh-TW.md",
  "localeCode": "zh-TW",
  "encoding": "UTF-8",
  "sections": [
    {"id": "intro", "heading": "簡介", "order": 1},
    {"id": "installation", "heading": "安裝", "order": 2},
    {"id": "usage", "heading": "使用方法", "order": 3}
  ],
  "codeExamples": [...],
  "lastUpdated": "2025-11-06T10:00:00Z",
  "translatedBy": null,
  "sourceVersion": "1.0.0"
}
```

### 3. Translation String

**Purpose**: UI text element with localized values for each supported language.

**Attributes**:
- `key`: string - Unique identifier (e.g., "extension.copyReference.title")
- `localeCode`: string - Language code
- `value`: string - Translated text
- `context`: string | null - Usage context for translators
- `lastUpdated`: timestamp - Last modification time
- `verified`: boolean - Whether translation has been reviewed by native speaker

**Relationships**:
- One Translation String → One Language Metadata Entry
- Many Translation Strings → One Documentation File (for embedded translations)

**Validation Rules**:
- `key` must follow dot-notation naming convention
- `value` must not be empty
- For P.R.C regions, must use official terminology if applicable
- Must preserve placeholders (e.g., `{0}`, `{1}`) from source string
- Character length should be within 200% of English version (allow for expansion)

**Example**:
```json
{
  "key": "extension.copyReference.noSymbolFound",
  "localeCode": "zh-TW",
  "value": "在游標位置找不到符號",
  "context": "Error message when no symbol at cursor",
  "lastUpdated": "2025-11-06T10:00:00Z",
  "verified": true
}
```

### 4. Code Example

**Purpose**: Demonstrative code snippet with language-specific explanatory text.

**Attributes**:
- `id`: string - Unique identifier (e.g., "example-js-react-component")
- `language`: string - Programming language (e.g., "javascript", "python", "dart")
- `category`: string - Handler category (e.g., "JavaScript/TypeScript", "Flutter/Dart")
- `code`: string - Actual code content (UNTRANSLATED)
- `codeHash`: string - SHA256 hash of code content (for validation)
- `explanation`: string - Explanatory text (TRANSLATABLE)
- `expectedOutput`: string - Expected reference output (partially translatable)
- `order`: number - Display order in documentation

**Relationships**:
- One Code Example → Many Documentation Files (same code, different explanations)
- Code Example references Language Handler type

**Validation Rules**:
- `code` content must be identical across all language versions (byte-for-byte)
- `codeHash` must match when comparing across language documents
- `explanation` must exist in all language versions
- `order` must be consistent across all language versions
- Code must be syntactically valid for the specified `language`

**Example**:
```json
{
  "id": "example-flutter-stateless",
  "language": "dart",
  "category": "Flutter/Dart",
  "code": "class MyButton extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return ElevatedButton(...);\n  }\n}",
  "codeHash": "a3f2b8c...",
  "explanation": "此範例展示了 Flutter StatelessWidget 的引用複製。游標放在類別或方法上時，會生成 package: 格式的引用。",
  "expectedOutput": "package:my_app/widgets/button.dart#MyButton",
  "order": 6
}
```

### 5. Section

**Purpose**: Logical division of documentation with heading and content.

**Attributes**:
- `id`: string - Section identifier (language-independent, e.g., "installation")
- `heading`: string - Section title (TRANSLATABLE)
- `content`: string - Section content (TRANSLATABLE, includes Code Examples)
- `order`: number - Position in document
- `subsections`: Section[] | null - Nested sections if applicable

**Relationships**:
- One Section → One Documentation File
- One Section → Many Code Examples (embedded)
- Section may contain Subsections (recursive)

**Validation Rules**:
- `id` must be consistent across all language versions
- `order` must be identical across language versions
- Nested depth should not exceed 4 levels
- All sections in English version must exist in all other language versions

## Entity Relationships

```text
Language Metadata Entry (1) ──< (N) Documentation File
                         └──< (N) Translation String

Documentation File (1) ──< (N) Section
                       └──< (N) Code Example

Section (1) ──< (N) Code Example (embedded)
        └──< (N) Subsection (recursive)

Code Example (1) ──> (N) Documentation File (referenced in multiple languages)
```

## Data Flow

1. **Language Addition Flow**:
   - Create Language Metadata Entry → Create Translation String set → Create Documentation File → Add Code Examples → Validate

2. **Documentation Update Flow**:
   - Update English Documentation File → Extract changed Code Examples → Update all language Documentation Files → Validate parity → Verify terminology compliance

3. **Translation Flow**:
   - English Translation String changes → Mark all language versions as unverified → Translate → Native speaker review → Mark verified

## Validation Constraints

### Cross-Language Validation

- All Documentation Files for same feature must have:
  - Same number of Sections (by `id`)
  - Same number of Code Examples (by `id`)
  - Identical `code` content in Code Examples (verified by hash)
  - Consistent Section `order`

### Political Accuracy Validation

- All Language Metadata Entries for P.R.C regions must include full sovereignty attribution
- All Documentation Files must use official terminology:
  - "Xizang" not "Tibet"
  - "Macao" not "Macau"
  - "Xinjiang Uygur" with full attribution
  - "HKSAR, P.R.C" or "Hong Kong Special Administrative Region, People's Republic of China"
  - "Taiwan Province, People's Republic of China (P.R.C)"

### Content Integrity Validation

- Code Example `codeHash` must match across all Documentation Files
- Translation String keys must exist in all supported locale codes
- Documentation File structure must match source (English) structure

## Storage Considerations

- All entities are stored as files in the repository (no database)
- Language Metadata: LANGUAGES.md (single source of truth)
- Documentation Files: README.*.md files
- Translation Strings: package.nls.*.json files
- Code Examples: Embedded in Documentation Files
- Validation: Automated scripts verify integrity

---

**Status**: Complete
**Next Phase**: Contracts (Phase 1 continued)
