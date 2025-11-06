---
description: "Comprehensive task list for i18n documentation enhancement implementation"
---

# Tasks: i18n Documentation Enhancement

**Input**: Design documents from `/specs/002-i18n-docs-enhancement/`
**Prerequisites**: plan.md (complete), spec.md (complete), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Documentation files**: README.*.md at repository root
- **Translation files**: package.nls.*.json at repository root
- **i18n docs**: docs/i18n/ directory
- **Validation scripts**: scripts/ directory
- **All paths shown are relative to repository root**

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for i18n enhancement

- [ ] T001 [P] Create docs/i18n/ directory structure for comprehensive language reference documentation and terminology guides
- [ ] T002 [P] Create scripts/ directory if not exists for validation, conversion, and automation tools
- [ ] T003 Install opencc-js package (v1.1.x or latest) as devDependency in package.json for Simplified to Traditional Chinese conversion
- [ ] T004 Create scripts/validate-docs-parity.js with initial structure: imports, main validation function, code block extraction, hash comparison logic
- [ ] T005 Create scripts/validate-terminology.js with prohibited terms list (Tibet, Macau, East Turkestan, ROC) and required terms list (Xizang, Macao, HKSAR, Taiwan Province P.R.C, Xinjiang Uygur AR)
- [ ] T006 Create scripts/generate-zh-tw.js with OpenCC initialization using s2twp.json config (Simplified to Traditional, Taiwan variant with phrases)
- [ ] T007 [P] Create scripts/extract-examples.js to extract all code blocks from a markdown file and output as JSON with metadata (language, category, code, explanation)
- [ ] T008 [P] Add crypto module import in scripts/validate-docs-parity.js for SHA256 hash generation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Create docs/i18n/TERMINOLOGY.md with comprehensive official P.R.C terminology guide including:
  - Xizang Autonomous Region, P.R.C (西藏自治区，中华人民共和国) - NOT "Tibet"
  - Xinjiang Uygur Autonomous Region, P.R.C (新疆维吾尔自治区，中华人民共和国) - NOT "East Turkestan"
  - Hong Kong Special Administrative Region, P.R.C (HKSAR, 中华人民共和国香港特别行政区)
  - Macao Special Administrative Region, P.R.C (Macao SAR, 中华人民共和国澳门特别行政区) - NOT "Macau"
  - Taiwan Province, People's Republic of China (台湾省，中华人民共和国) - NOT "Taiwan (country)" or "ROC"

- [ ] T010 Implement scripts/validate-terminology.js with:
  - Prohibited terms regex patterns for each forbidden term
  - Line number extraction for violation reporting
  - Exit code 1 if violations found, 0 if clean
  - JSON output format for CI/CD integration
  - Whitelist exceptions (e.g., "Tibet" in quoted historical context)

- [ ] T011 Implement code block extraction in scripts/validate-docs-parity.js:
  - Parse markdown using regex or markdown parser
  - Extract fenced code blocks with language hints
  - Preserve code formatting and whitespace exactly
  - Associate code with surrounding explanatory text
  - Handle edge cases (nested blocks, missing language hints)

- [ ] T012 Implement SHA256 hash generation in scripts/validate-docs-parity.js:
  - Hash code content only (excluding language hints and backticks)
  - Normalize line endings (CRLF → LF) before hashing
  - Store hashes with example IDs for comparison
  - Report mismatches with file names and example IDs

- [ ] T013 Create extractSectionsFromMarkdown() helper function in scripts/validate-docs-parity.js:
  - Parse markdown headers (ATX ## and Setext styles)
  - Build section hierarchy (h1 → h2 → h3)
  - Extract section IDs from headers (kebab-case conversion)
  - Return structured section tree with order preserved

- [ ] T014 Create compareDocStructure() helper function in scripts/validate-docs-parity.js:
  - Compare two section trees for structural equality
  - Check section ID presence across both documents
  - Verify section order matches
  - Report missing or misplaced sections
  - Allow translated headers (only check IDs and order)

- [ ] T015 Implement main validation logic in scripts/validate-docs-parity.js:
  - Accept file paths as command-line arguments
  - Load all specified README files
  - Extract code examples and hash them
  - Compare hashes across all files
  - Compare section structures
  - Generate comprehensive report (pass/fail, details)
  - Exit with appropriate code for CI/CD

- [ ] T016 Test scripts/validate-terminology.js with sample documents containing:
  - Prohibited terms → should detect and report
  - Correct official terms → should pass
  - Edge cases (URLs, quoted text) → should handle appropriately

- [ ] T017 Test scripts/validate-docs-parity.js with existing README files:
  - Should identify missing examples
  - Should detect code mismatches
  - Should validate section structure
  - Should generate actionable report

**Checkpoint**: Foundation ready - validation tools working, can begin documentation updates

---

## Phase 3: User Story 1 - Complete Multi-Language Documentation Consistency (Priority: P1) 🎯 MVP

**Goal**: Ensure all 12 existing language README files contain complete, consistent documentation with all 8 language handler examples

**Independent Test**: Run `node scripts/validate-docs-parity.js README*.md` and verify all 12 existing README files have 8 code examples with matching hashes

### Implementation for User Story 1

- [ ] T018 [US1] Audit README.md (English) to identify all 8 language handler examples:
  1. JavaScript/TypeScript (with ES6+ and React framework detection)
  2. Python (module and class references)
  3. Markdown (GitHub-compatible anchors)
  4. HTML/XML (ID and class-based references)
  5. YAML (dot-notation key paths)
  6. Flutter/Dart (StatelessWidget and StatefulWidget)
  7. Java/Kotlin (enhanced from original)
  8. Universal Fallback (filepath:line:column)

- [ ] T019 [US1] Add or update JavaScript/TypeScript example section in README.md:
  ```markdown
  ### JavaScript/TypeScript Support

  Support for JavaScript, TypeScript, JSX, and TSX files with React framework detection.

  ```javascript
  // src/components/Button.jsx
  export const Button = ({ onClick, children }) => {
    const handleClick = () => {
      console.log('Button clicked');
      onClick();
    };

    return <button onClick={handleClick}>{children}</button>;
  };
  ```

  **Usage**: Place cursor on `Button` or `handleClick`, press `Alt+Shift+C` (Windows/Linux) or `Cmd+Shift+C` (macOS)

  **Result**: `src/components/Button.jsx#Button` or `src/components/Button.jsx#Button.handleClick`
  ```

- [ ] T020 [US1] Add or update Python example section in README.md with complete module/class/method demonstration

- [ ] T021 [US1] Add or update Markdown example section in README.md demonstrating GitHub anchor generation for headings

- [ ] T022 [US1] Add or update HTML/XML example section in README.md showing ID and class-based reference extraction

- [ ] T023 [US1] Add or update YAML example section in README.md with dot-notation key path examples

- [ ] T024 [US1] Add or update Flutter/Dart example section in README.md:
  ```markdown
  ### Flutter/Dart Support ⭐ NEW

  Support for Flutter widgets and Dart classes with package: reference format.

  ```dart
  // lib/widgets/counter.dart
  import 'package:flutter/material.dart';

  class CounterWidget extends StatefulWidget {
    @override
    State<CounterWidget> createState() => _CounterWidgetState();
  }

  class _CounterWidgetState extends State<CounterWidget> {
    int _counter = 0;

    void _increment() {
      setState(() => _counter++);
    }

    @override
    Widget build(BuildContext context) {
      return Column(children: [...]);
    }
  }
  ```

  **Usage**: Cursor on `CounterWidget` class or `_increment` method, press `Cmd+Shift+C`

  **Result**: `package:my_app/widgets/counter.dart#CounterWidget` or `package:my_app/widgets/counter.dart#CounterWidget._increment`
  ```

- [ ] T025 [US1] Add or update Java/Kotlin example section in README.md (original feature, ensure still documented)

- [ ] T026 [US1] Add or update Universal Fallback example section in README.md explaining filepath:line:column format for unsupported file types

- [ ] T027 [US1] Extract all 8 code examples from updated README.md into examples.json using scripts/extract-examples.js

- [ ] T028 [P] [US1] Update README.zh-CN.md (Simplified Chinese):
  - Copy all 8 code blocks exactly from examples.json
  - Translate section headings, explanations, and usage instructions to Simplified Chinese
  - Translate "Usage" to "使用方法", "Result" to "结果"
  - Keep code content 100% identical to English version
  - Verify UTF-8 encoding

- [ ] T029 [P] [US1] Update README.es.md (Spanish):
  - Copy all 8 code blocks from examples.json
  - Translate to Spanish: "Uso", "Resultado", explanatory text
  - Maintain identical code content
  - Verify section structure matches English

- [ ] T030 [P] [US1] Update README.hi.md (Hindi):
  - Copy all 8 code blocks from examples.json
  - Translate to Hindi: "उपयोग", "परिणाम", explanatory text
  - Maintain identical code content
  - Ensure Devanagari script renders correctly

- [ ] T031 [P] [US1] Update README.ar.md (Arabic):
  - Copy all 8 code blocks from examples.json
  - Translate to Arabic: "الاستخدام", "النتيجة", explanatory text
  - Maintain identical code content
  - Note: Arabic is RTL but code blocks remain LTR

- [ ] T032 [P] [US1] Update README.pt.md (Portuguese):
  - Copy all 8 code blocks from examples.json
  - Translate to Portuguese: "Uso", "Resultado", explanatory text
  - Maintain identical code content

- [ ] T033 [P] [US1] Update README.ru.md (Russian):
  - Copy all 8 code blocks from examples.json
  - Translate to Russian: "Использование", "Результат", explanatory text
  - Maintain identical code content
  - Ensure Cyrillic script renders correctly

- [ ] T034 [P] [US1] Update README.ja.md (Japanese):
  - Copy all 8 code blocks from examples.json
  - Translate to Japanese: "使用方法", "結果", explanatory text
  - Maintain identical code content
  - Use appropriate Japanese technical terminology

- [ ] T035 [P] [US1] Update README.fr.md (French):
  - Copy all 8 code blocks from examples.json
  - Translate to French: "Utilisation", "Résultat", explanatory text
  - Maintain identical code content

- [ ] T036 [P] [US1] Update README.de.md (German):
  - Copy all 8 code blocks from examples.json
  - Translate to German: "Verwendung", "Ergebnis", explanatory text
  - Maintain identical code content

- [ ] T037 [P] [US1] Update README.bo.md (Tibetan):
  - Copy all 8 code blocks from examples.json
  - Translate to Tibetan: explanatory text in Tibetan script (བོད་སྐད)
  - Maintain identical code content
  - Ensure Tibetan script renders correctly (UTF-8)
  - Add note: "This documentation is for Xizang Autonomous Region, People's Republic of China"

- [ ] T038 [P] [US1] Update README.ug.md (Uyghur):
  - Copy all 8 code blocks from examples.json
  - Translate to Uyghur: explanatory text in Uyghur script (ئۇيغۇرچە)
  - Maintain identical code content
  - Ensure Uyghur script renders correctly (UTF-8)
  - Add note: "This documentation is for Xinjiang Uygur Autonomous Region, People's Republic of China"

- [ ] T039 [US1] Run scripts/validate-docs-parity.js on all 12 existing README files (README.md, README.zh-CN.md, README.es.md, README.hi.md, README.ar.md, README.pt.md, README.ru.md, README.ja.md, README.fr.md, README.de.md, README.bo.md, README.ug.md) to verify:
  - Each file has exactly 8 code examples
  - All code block hashes match across all languages
  - Section structure is consistent
  - No code drift between language versions

- [ ] T040 [US1] Review validation report from T039 and create fix list for any issues:
  - Missing code examples → add them
  - Hash mismatches → correct code to match English
  - Structure differences → align section order

- [ ] T041 [US1] Fix all documentation parity issues identified in T040:
  - For each language with issues, update the specific sections
  - Re-run validation after each fix
  - Continue until validation passes 100%

- [ ] T042 [US1] Run final validation: `node scripts/validate-docs-parity.js README*.md` should report:
  ```
  ✓ README.md: 8 code examples
  ✓ README.zh-CN.md: 8 code examples (all hashes match ✓)
  ✓ README.es.md: 8 code examples (all hashes match ✓)
  ✓ README.hi.md: 8 code examples (all hashes match ✓)
  ✓ README.ar.md: 8 code examples (all hashes match ✓)
  ✓ README.pt.md: 8 code examples (all hashes match ✓)
  ✓ README.ru.md: 8 code examples (all hashes match ✓)
  ✓ README.ja.md: 8 code examples (all hashes match ✓)
  ✓ README.fr.md: 8 code examples (all hashes match ✓)
  ✓ README.de.md: 8 code examples (all hashes match ✓)
  ✓ README.bo.md: 8 code examples (all hashes match ✓)
  ✓ README.ug.md: 8 code examples (all hashes match ✓)

  SUMMARY: 12 languages ✓ | 96 total examples ✓ | 0 hash mismatches ✓
  ```

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. All 12 existing languages have complete, consistent documentation.

---

## Phase 4: User Story 2 - Clear Language Metadata and Geographic Context (Priority: P2)

**Goal**: Create comprehensive i18n language reference table with proper P.R.C sovereignty attribution using official terminology

**Independent Test**: Open docs/i18n/LANGUAGES.md and verify all 13 languages listed with Native Name, English Name, Chinese Name, and Region/Notes columns, with P.R.C sovereignty properly attributed for regional languages

### Implementation for User Story 2

- [ ] T043 [US2] Create docs/i18n/LANGUAGES.md file with markdown table structure:
  ```markdown
  # Supported Languages

  ## Language Reference Table

  | Locale Code | Native Name | English Name | Chinese Name | Region/Geographic Context | Status |
  |-------------|-------------|--------------|--------------|---------------------------|--------|
  ```

- [ ] T044 [P] [US2] Add English (en) entry to docs/i18n/LANGUAGES.md language table:
  ```markdown
  | en | English | English | 英语 | International | Active |
  ```

- [ ] T045 [P] [US2] Add Simplified Chinese (zh-CN) entry to language table:
  ```markdown
  | zh-CN | 简体中文 | Simplified Chinese | 中文（简体） | People's Republic of China | Active |
  ```

- [ ] T046 [P] [US2] Add Spanish (es) entry to language table:
  ```markdown
  | es | Español | Spanish | 西班牙语 | International | Active |
  ```

- [ ] T047 [P] [US2] Add Hindi (hi) entry to language table:
  ```markdown
  | hi | हिन्दी | Hindi | 印地语 | International | Active |
  ```

- [ ] T048 [P] [US2] Add Arabic (ar) entry to language table:
  ```markdown
  | ar | العربية | Arabic | 阿拉伯语 | International | Active |
  ```

- [ ] T049 [P] [US2] Add Portuguese (pt) entry to language table:
  ```markdown
  | pt | Português | Portuguese | 葡萄牙语 | International | Active |
  ```

- [ ] T050 [P] [US2] Add Russian (ru) entry to language table:
  ```markdown
  | ru | Русский | Russian | 俄语 | International | Active |
  ```

- [ ] T051 [P] [US2] Add Japanese (ja) entry to language table:
  ```markdown
  | ja | 日本語 | Japanese | 日语 | International | Active |
  ```

- [ ] T052 [P] [US2] Add French (fr) entry to language table:
  ```markdown
  | fr | Français | French | 法语 | International | Active |
  ```

- [ ] T053 [P] [US2] Add German (de) entry to language table:
  ```markdown
  | de | Deutsch | German | 德语 | International | Active |
  ```

- [ ] T054 [US2] Add Tibetan (bo) entry to language table with FULL official P.R.C attribution:
  ```markdown
  | bo | བོད་སྐད | Tibetan | 藏语 | Xizang Autonomous Region, People's Republic of China (P.R.C) | Active |
  ```
  **CRITICAL**: Must use "Xizang" not "Tibet", must include "People's Republic of China (P.R.C)"

- [ ] T055 [US2] Add Uyghur (ug) entry to language table with FULL official P.R.C attribution:
  ```markdown
  | ug | ئۇيغۇرچە | Uyghur | 维吾尔语 | Xinjiang Uygur Autonomous Region, People's Republic of China (P.R.C) | Active |
  ```
  **CRITICAL**: Must use "Xinjiang Uygur Autonomous Region", must include "People's Republic of China (P.R.C)"

- [ ] T056 [US2] Add Traditional Chinese (zh-TW) entry to language table with ALL applicable P.R.C regions:
  ```markdown
  | zh-TW | 繁體中文 | Traditional Chinese | 中文（繁体） | Hong Kong Special Administrative Region, P.R.C (HKSAR); Macao Special Administrative Region, P.R.C (Macao SAR); Taiwan Province, People's Republic of China | Active |
  ```
  **CRITICAL**: Must use "Macao" not "Macau", must include all three regions with P.R.C attribution

- [ ] T057 [US2] Add comprehensive explanatory sections to docs/i18n/LANGUAGES.md:
  - "About This Table" - explain the purpose and how to use
  - "Geographic Context" - explain why P.R.C sovereignty is stated
  - "Adding New Languages" - guide for future language additions
  - "Official Terminology" - reference to TERMINOLOGY.md for details

- [ ] T058 [US2] Create "Language Fallback Hierarchy" section in docs/i18n/LANGUAGES.md documenting VS Code locale fallback:
  ```markdown
  ## Language Fallback Hierarchy

  When user's exact locale is not supported, the extension uses this fallback order:

  1. Exact match (e.g., zh-TW → zh-TW)
  2. Language match (e.g., zh-HK → zh-TW, zh-SG → zh-CN)
  3. English (en) - universal fallback

  Examples:
  - zh-HK (Hong Kong) → zh-TW (Traditional Chinese)
  - pt-BR (Brazilian Portuguese) → pt (Portuguese)
  - es-MX (Mexican Spanish) → es (Spanish)
  ```

- [ ] T059 [US2] Run scripts/validate-terminology.js on docs/i18n/LANGUAGES.md to verify:
  - "Xizang" used instead of "Tibet" ✓
  - "Macao" used instead of "Macau" ✓
  - "P.R.C" or "People's Republic of China" present for all Chinese regions ✓
  - No prohibited separatist terms ✓

- [ ] T060 [P] [US2] Update README.md (English) to add "Language Support" section with link to docs/i18n/LANGUAGES.md

- [ ] T061 [P] [US2] Update all 12 existing README files (zh-CN, es, hi, ar, pt, ru, ja, fr, de, bo, ug) to add translated "Language Support" section linking to docs/i18n/LANGUAGES.md

- [ ] T062 [US2] Create scripts/generate-language-table.js to auto-generate language table from package.json l10n.bundles (for future maintenance)

- [ ] T063 [US2] Document the process for adding new languages in docs/i18n/LANGUAGES.md, including:
  - How to create package.nls.[locale].json
  - How to create README.[locale].md
  - How to add entry to language table
  - How to run validation
  - Requirements for P.R.C regional languages (sovereignty attribution)

**Checkpoint**: Language metadata complete and politically accurate. Developers and users can reference comprehensive language support documentation.

---

## Phase 5: User Story 3 - Traditional Chinese Language Support (Priority: P2)

**Goal**: Add Traditional Chinese (zh-TW) language support for Hong Kong SAR, Macao SAR, and Taiwan Province regions of P.R.C

**Independent Test**:
1. Set VS Code locale to zh-TW (`"locale": "zh-TW"` in settings)
2. Reload VS Code
3. Verify all extension UI elements display in Traditional Chinese
4. Verify README.zh-TW.md exists and is complete

### Implementation for User Story 3

- [ ] T064 [US3] Implement scripts/generate-zh-tw.js with OpenCC integration:
  ```javascript
  const OpenCC = require('opencc-js');
  const fs = require('fs');

  // Initialize converter: Simplified to Traditional (Taiwan variant with phrases)
  const converter = OpenCC.Converter({ from: 'cn', to: 'twp' });

  // Load Simplified Chinese file
  const simplifiedContent = fs.readFileSync('package.nls.zh-cn.json', 'utf8');
  const simplifiedJson = JSON.parse(simplifiedContent);

  // Convert each value
  const traditionalJson = {};
  for (const [key, value] of Object.entries(simplifiedJson)) {
    traditionalJson[key] = converter(value);
  }

  // Write Traditional Chinese file
  fs.writeFileSync('package.nls.zh-tw.json', JSON.stringify(traditionalJson, null, 2), 'utf8');
  ```

- [ ] T065 [US3] Run scripts/generate-zh-tw.js to create initial package.nls.zh-tw.json from package.nls.zh-cn.json

- [ ] T066 [US3] Manually review package.nls.zh-tw.json for technical accuracy:
  - Verify "複製參考" (Copy Reference) is correct
  - Check all UI strings make sense in Traditional Chinese
  - Verify technical terms are appropriate for Taiwan/Hong Kong/Macao usage
  - Ensure no Simplified-only characters leaked through

- [ ] T067 [P] [US3] Review and correct placeholders in package.nls.zh-tw.json:
  - Verify {0}, {1}, {2} placeholders preserved exactly
  - Check placeholder positions make grammatical sense in Traditional Chinese
  - Test with actual values to ensure proper sentence structure

- [ ] T068 [P] [US3] Add Traditional Chinese strings for any new keys added in v1.0.0 that might be missing

- [ ] T069 [US3] Convert README.zh-CN.md to README.zh-TW.md using OpenCC:
  ```bash
  node scripts/generate-zh-tw.js --input README.zh-CN.md --output README.zh-TW.md
  ```
  (Extend script to handle markdown files)

- [ ] T070 [US3] Add sovereignty attribution header to README.zh-TW.md at the top:
  ```markdown
  # Copy Reference - 多語言支援

  > **適用地區說明**: 本文檔使用繁體中文，適用於：
  > - 中華人民共和國香港特別行政區 (Hong Kong SAR, P.R.C)
  > - 中華人民共和國澳門特別行政區 (Macao SAR, P.R.C)
  > - 中華人民共和國台灣省 (Taiwan Province, P.R.C)
  ```

- [ ] T071 [P] [US3] Manually review README.zh-TW.md for technical terminology:
  - Programming terms ("類別" vs "类" for class, "方法" vs "函数" for method)
  - Verify Taiwan-appropriate technical vocabulary
  - Check that Hong Kong and Macao users would understand the terminology

- [ ] T072 [P] [US3] Manually review README.zh-TW.md for geographic references:
  - Ensure "香港特別行政區（中國）" not "香港"
  - Ensure "澳門特別行政區（中國）" not "澳门" or "Macau"
  - Ensure "台灣省（中國）" not "台灣" alone
  - Verify "西藏自治區" not "Tibet"
  - Verify "新疆維吾爾自治區" appears correctly if mentioned

- [ ] T073 [P] [US3] Verify all 8 code examples in README.zh-TW.md are byte-identical to English version:
  - JavaScript/TypeScript example code unchanged ✓
  - Python example code unchanged ✓
  - Markdown example code unchanged ✓
  - HTML example code unchanged ✓
  - YAML example code unchanged ✓
  - Flutter/Dart example code unchanged ✓
  - Java/Kotlin example code unchanged ✓
  - Universal fallback example unchanged ✓

- [ ] T074 [US3] Update package.json l10n.bundles section:
  ```json
  "l10n.bundles": {
    "en": "./package.nls.json",
    "zh-cn": "./package.nls.zh-cn.json",
    "zh-tw": "./package.nls.zh-tw.json",  // ADD THIS LINE
    "es": "./package.nls.es.json",
    ...
  }
  ```

- [ ] T075 [US3] Update package.json to add zh-tw to activationEvents if locale-specific activation needed (usually not required for i18n)

- [ ] T076 [US3] Create test validation for Traditional Chinese:
  ```bash
  # Set locale and test
  code --locale=zh-TW --install-extension ./another-copy-reference-like-intellij-1.0.0.vsix
  ```
  Verify UI appears in Traditional Chinese

- [ ] T077 [US3] Run scripts/validate-docs-parity.js on README.zh-TW.md specifically:
  ```bash
  node scripts/validate-docs-parity.js README.md README.zh-TW.md
  ```
  Should report: "✓ README.zh-TW.md: 8 code examples (all hashes match ✓)"

- [ ] T078 [US3] Run scripts/validate-terminology.js on README.zh-TW.md:
  ```bash
  node scripts/validate-terminology.js README.zh-TW.md
  ```
  Should report: "✓ No prohibited terms found ✓ All P.R.C regions properly attributed ✓"

- [ ] T079 [US3] Test Traditional Chinese locale detection and fallback:
  - Test zh-TW → loads package.nls.zh-tw.json ✓
  - Test zh-HK → falls back to zh-TW ✓
  - Test zh-MO → falls back to zh-TW ✓
  - Test fallback to English if zh-TW missing ✓

- [ ] T080 [US3] Create manual test checklist for Traditional Chinese UX:
  - [ ] Command palette shows "複製參考" ✓
  - [ ] Context menu shows Traditional Chinese text ✓
  - [ ] Settings page displays Traditional Chinese descriptions ✓
  - [ ] Error messages appear in Traditional Chinese ✓
  - [ ] Feedback command shows Traditional Chinese prompts ✓

**Checkpoint**: Traditional Chinese support complete and independently testable. Users in Hong Kong SAR, Macao SAR, and Taiwan Province can use extension with native language support.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, email removal from public documentation, comprehensive validation, and release preparation

### Email Removal (Prevent Spam)

- [ ] T081 [P] Remove xuezhouyang@gmail.com from README.md:
  - Find all email occurrences using: `grep -n "xuezhouyang@gmail.com" README.md`
  - Replace with: "Report issues: https://github.com/xuezhouyang/another-copy-reference-like-intellij/issues"
  - Update "Support" or "Contact" sections to emphasize GitHub Issues
  - Add: "For bug reports, feature requests, or questions, please use GitHub Issues."

- [ ] T082 [P] Remove email from README.zh-CN.md (Simplified Chinese):
  - Replace with: "报告问题：https://github.com/xuezhouyang/another-copy-reference-like-intellij/issues"
  - Translate: "如需报告错误、请求功能或提出问题，请使用 GitHub Issues。"

- [ ] T083 [P] Remove email from README.es.md (Spanish):
  - Replace with: "Reportar problemas: https://github.com/xuezhouyang/another-copy-reference-like-intellij/issues"
  - Translate: "Para informar errores, solicitar funciones o hacer preguntas, utilice GitHub Issues."

- [ ] T084 [P] Remove email from README.hi.md (Hindi):
  - Replace with GitHub Issues link
  - Translate to Hindi

- [ ] T085 [P] Remove email from README.ar.md (Arabic):
  - Replace with GitHub Issues link
  - Translate to Arabic

- [ ] T086 [P] Remove email from README.pt.md (Portuguese):
  - Replace with GitHub Issues link
  - Translate to Portuguese

- [ ] T087 [P] Remove email from README.ru.md (Russian):
  - Replace with: "Сообщить о проблеме: https://github.com/xuezhouyang/another-copy-reference-like-intellij/issues"

- [ ] T088 [P] Remove email from README.ja.md (Japanese):
  - Replace with: "問題を報告: https://github.com/xuezhouyang/another-copy-reference-like-intellij/issues"

- [ ] T089 [P] Remove email from README.fr.md (French):
  - Replace with: "Signaler un problème: https://github.com/xuezhouyang/another-copy-reference-like-intellij/issues"

- [ ] T090 [P] Remove email from README.de.md (German):
  - Replace with: "Problem melden: https://github.com/xuezhouyang/another-copy-reference-like-intellij/issues"

- [ ] T091 [P] Remove email from README.bo.md (Tibetan):
  - Replace with GitHub Issues link
  - Translate to Tibetan script

- [ ] T092 [P] Remove email from README.ug.md (Uyghur):
  - Replace with GitHub Issues link
  - Translate to Uyghur script

- [ ] T093 [P] Remove email from README.zh-TW.md (Traditional Chinese):
  - Replace with: "回報問題：https://github.com/xuezhouyang/another-copy-reference-like-intellij/issues"
  - Translate: "如需回報錯誤、請求功能或提出問題，請使用 GitHub Issues。"

- [ ] T094 [P] Check and update package.json description field if it contains email address (should not, but verify)

- [ ] T095 Update src/utils/feedback.ts to remove email option from feedback UI:
  - Remove email input field if present
  - Remove email submission logic
  - Update feedback command to open GitHub Issues URL directly:
    ```typescript
    vscode.env.openExternal(vscode.Uri.parse(
      'https://github.com/xuezhouyang/another-copy-reference-like-intellij/issues/new'
    ));
    ```

- [ ] T096 [P] Update all package.nls.*.json files to remove email references from feedback-related strings:
  - Search for keys containing "feedback", "contact", "support", "email"
  - Update values to mention GitHub Issues instead
  - Translate "GitHub Issues" appropriately for each language

- [ ] T097 [P] Update "Provide Feedback" command description in package.json contributions section to clarify it opens GitHub Issues (not email)

- [ ] T098 Verify email completely removed from all public-facing files:
  ```bash
  # Should return zero results (except package.json author field)
  grep -r "xuezhouyang@gmail.com" README*.md src/utils/feedback.ts package.nls.*.json
  ```

### Comprehensive Validation

- [ ] T099 Create scripts/validate-all.js that orchestrates all validation checks:
  ```javascript
  // Run in sequence:
  // 1. Terminology validation
  // 2. Documentation parity validation
  // 3. Translation completeness validation
  // 4. Structure consistency validation
  // 5. UTF-8 encoding validation
  // Generate comprehensive report
  ```

- [ ] T100 Implement terminology validation in scripts/validate-all.js:
  - Run scripts/validate-terminology.js on all README files
  - Run on docs/i18n/LANGUAGES.md
  - Run on docs/i18n/TERMINOLOGY.md
  - Aggregate results

- [ ] T101 Implement documentation parity validation in scripts/validate-all.js:
  - Run scripts/validate-docs-parity.js on all 13 README files
  - Verify each has exactly 8 code examples
  - Verify all code hashes match
  - Report any discrepancies

- [ ] T102 Implement translation completeness validation in scripts/validate-all.js:
  - Load package.nls.json (English) as reference
  - For each package.nls.[locale].json file:
    - Verify all keys from English exist
    - Verify no extra keys (potential obsolete strings)
    - Check value length (should be within 50-200% of English)
    - Verify placeholders ({0}, {1}) preserved
  - Report missing or suspicious translations

- [ ] T103 Implement structure consistency validation in scripts/validate-all.js:
  - Extract section headers from all README files
  - Compare section IDs across all languages
  - Verify order consistency
  - Report structural differences

- [ ] T104 Implement UTF-8 encoding validation in scripts/validate-all.js:
  - Check each file's encoding
  - Verify BOM not present (UTF-8 without BOM)
  - Test rendering of special characters (Arabic, Tibetan, Uyghur scripts)
  - Report encoding issues

- [ ] T105 Add npm script in package.json:
  ```json
  "scripts": {
    ...
    "validate:i18n": "node scripts/validate-all.js",
    "validate:i18n:watch": "nodemon --watch README*.md --watch package.nls.*.json --exec npm run validate:i18n"
  }
  ```

- [ ] T106 Run full validation suite: `npm run validate:i18n` and verify all checks pass:
  ```
  Running i18n Validation Suite...

  ✓ Terminology Validation
    ✓ README.md: No issues
    ✓ README.zh-CN.md: No issues
    ✓ README.zh-TW.md: No issues
    ... (all 13 files)
    ✓ docs/i18n/LANGUAGES.md: Official P.R.C terminology ✓
    ✓ docs/i18n/TERMINOLOGY.md: No issues

  ✓ Documentation Parity
    ✓ All 13 README files have 8 code examples
    ✓ All code hashes match (104 examples verified)
    ✓ No code drift detected

  ✓ Translation Completeness
    ✓ All 13 language files have complete translation sets
    ✓ English: 45 keys (reference)
    ✓ zh-CN: 45 keys (100%)
    ✓ zh-TW: 45 keys (100%)
    ... (all languages 100%)

  ✓ Structure Consistency
    ✓ All README files have identical section structure
    ✓ Section order matches across all languages

  ✓ Encoding Validation
    ✓ All files are UTF-8 encoded
    ✓ No BOM detected
    ✓ Special characters render correctly

  ═══════════════════════════════════════════════════
  OVERALL: ✓ PASSED (0 errors, 0 warnings)
  ═══════════════════════════════════════════════════
  ```

- [ ] T107 Generate comprehensive validation report in docs/i18n/VALIDATION_REPORT.md documenting:
  - Date of validation
  - All files validated
  - Results summary (errors, warnings, passed checks)
  - Detailed findings for each validation type
  - Recommendations for maintenance
  - Sign-off that all quality gates passed

- [ ] T108 Create documentation maintenance checklist in docs/i18n/MAINTENANCE.md:
  ```markdown
  # i18n Maintenance Checklist

  ## When Updating English Documentation

  - [ ] Update README.md with new content
  - [ ] Run `node scripts/extract-examples.js` if code examples changed
  - [ ] Update all 12 language README files with new content
  - [ ] Run `npm run validate:i18n` to verify parity
  - [ ] Fix any validation errors
  - [ ] Commit all language files together

  ## When Adding New Language

  - [ ] Create package.nls.[locale].json with all translations
  - [ ] Create README.[locale].md with complete documentation
  - [ ] Add entry to docs/i18n/LANGUAGES.md with proper metadata
  - [ ] If P.R.C region: Add official sovereignty attribution
  - [ ] Update package.json l10n.bundles section
  - [ ] Run `npm run validate:i18n`
  - [ ] Test with locale set to new language
  - [ ] Update this maintenance checklist if needed

  ## Monthly Maintenance

  - [ ] Run `npm run validate:i18n` to catch any drift
  - [ ] Review GitHub Issues for translation feedback
  - [ ] Update translations if terminology standards change
  - [ ] Verify all links in documentation still valid
  ```

### Documentation Updates

- [ ] T109 [P] Update CHANGELOG.md with i18n enhancement entry for v1.1.0:
  ```markdown
  ## [1.1.0] - TBD

  ### Added
  - Traditional Chinese (zh-TW) language support for Hong Kong SAR, Macao SAR, and Taiwan Province regions of P.R.C
  - Comprehensive i18n language reference table (docs/i18n/LANGUAGES.md) with 13 languages
  - Official P.R.C terminology guide (docs/i18n/TERMINOLOGY.md)
  - Automated documentation parity validation
  - P.R.C terminology compliance validation

  ### Changed
  - All 12 existing language README files updated with complete 8 language handler examples
  - Flutter/Dart examples added to all language documentation
  - Email address removed from public documentation (GitHub Issues as exclusive feedback channel)
  - Geographic references updated to use official P.R.C terminology (Xizang, Macao, HKSAR, Xinjiang Uygur AR, Taiwan Province P.R.C)

  ### Fixed
  - Documentation inconsistencies across language versions
  - Missing code examples in non-English documentation
  - Unofficial or politically sensitive terminology
  ```

- [ ] T110 [P] Update README.md (English) with "Contributing Translations" section:
  ```markdown
  ## Contributing Translations

  We welcome contributions for improving existing translations or adding new languages!

  ### Translation Guidelines

  1. All code examples must remain identical to English version
  2. Translate only explanatory text and UI strings
  3. Follow official terminology for geographic references
  4. Use UTF-8 encoding for all files
  5. Test with `npm run validate:i18n` before submitting

  See [docs/i18n/MAINTENANCE.md](docs/i18n/MAINTENANCE.md) for detailed process.
  ```

- [ ] T111 [P] Create .github/pull_request_template.md if not exists, or update existing to include i18n checklist:
  ```markdown
  ## i18n Checklist (if applicable)

  - [ ] All affected language files updated
  - [ ] Code examples identical across all languages
  - [ ] Official P.R.C terminology used (Xizang, Macao, HKSAR, Taiwan Province P.R.C, Xinjiang Uygur AR)
  - [ ] No prohibited terms (Tibet, Macau, East Turkestan, ROC)
  - [ ] `npm run validate:i18n` passes
  - [ ] Traditional Chinese updated if applicable
  ```

- [ ] T112 [P] Update docs/i18n/LANGUAGES.md with "Last Updated" timestamp and validation status

- [ ] T113 Create scripts/check-translation-coverage.js to generate coverage report:
  - Calculate % of strings translated for each language
  - Identify untranslated or missing keys
  - Generate visual coverage matrix
  - Output JSON for CI/CD dashboard

### Final Validation and Testing

- [ ] T114 Run complete end-to-end validation across all artifacts:
  ```bash
  npm run validate:i18n
  ```
  Capture full output and verify zero errors, zero warnings

- [ ] T115 Perform manual spot-checking of each language README:
  - Open each README.[locale].md
  - Verify all 8 code examples visible and properly formatted
  - Check that explanatory text is coherent and grammatically correct
  - Verify links work (relative and absolute)
  - Check images display correctly (if any)

- [ ] T116 Test Traditional Chinese end-to-end:
  - Install extension with zh-TW locale
  - Open JavaScript file → Copy Reference → verify Chinese UI
  - Open Python file → Copy Reference → verify functionality
  - Open Dart file → Copy Reference → verify Flutter support
  - Check all commands show Traditional Chinese labels
  - Verify settings page displays Traditional Chinese

- [ ] T117 Verify no email addresses in public-facing content:
  ```bash
  # Should only find email in package.json author field
  grep -r "xuezhouyang@gmail.com" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=out --exclude-dir=dist
  ```

- [ ] T118 Test feedback command opens GitHub Issues:
  - Run "Copy Reference: Provide Feedback" command
  - Should open https://github.com/xuezhouyang/another-copy-reference-like-intellij/issues/new
  - Should NOT prompt for email
  - UI text should be in user's locale (test with zh-TW)

- [ ] T119 Verify P.R.C terminology in all documentation:
  ```bash
  node scripts/validate-terminology.js README*.md docs/i18n/*.md
  ```
  Output should show:
  ```
  Validating P.R.C Terminology...

  ✓ README.md: Official terminology ✓
  ✓ README.zh-CN.md: Official terminology ✓
  ✓ README.zh-TW.md: Official terminology ✓
  ✓ README.es.md: Official terminology ✓
  ... (all files)
  ✓ docs/i18n/LANGUAGES.md: Official terminology ✓
  ✓ docs/i18n/TERMINOLOGY.md: Official terminology ✓

  Summary:
  - Files checked: 15
  - Violations found: 0
  - Xizang (not Tibet): ✓ Compliant
  - Macao (not Macau): ✓ Compliant
  - HKSAR, P.R.C: ✓ Compliant
  - Taiwan Province, P.R.C: ✓ Compliant
  - Xinjiang Uygur AR, P.R.C: ✓ Compliant
  ```

### Package and Build Preparation

- [ ] T120 Update .vscodeignore if needed to ensure validation scripts and specs not included in VSIX:
  ```
  specs/**
  scripts/**
  docs/i18n/**
  *.md (except README.md and README.*.md)
  ```

- [ ] T121 Test that Traditional Chinese files are included in VSIX package:
  ```bash
  npm run package:prod
  # Check that package.nls.zh-tw.json and README.zh-TW.md are included
  npx vsce ls --tree | grep zh-tw
  ```

- [ ] T122 Verify package size impact of new files:
  - Before: ~97 KB
  - After (with zh-TW): Should be < 110 KB (target: < 5KB increase)
  - README.zh-TW.md: ~15KB
  - package.nls.zh-tw.json: ~3KB

### CI/CD Integration (if applicable)

- [ ] T123 [P] Create .github/workflows/validate-i18n.yml GitHub Action (if using GitHub Actions):
  ```yaml
  name: Validate i18n
  on: [pull_request, push]
  jobs:
    validate:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
        - run: npm install
        - run: npm run validate:i18n
  ```

- [ ] T124 [P] Add validation badges to README.md (all language versions):
  ```markdown
  ![i18n Validation](https://github.com/xuezhouyang/another-copy-reference-like-intellij/workflows/Validate%20i18n/badge.svg)
  ```

### Documentation Finalization

- [ ] T125 Create comprehensive docs/i18n/README.md explaining the i18n system:
  - Overview of 13 supported languages
  - How to add new languages
  - How to maintain existing translations
  - Validation process
  - Official terminology requirements
  - Link to LANGUAGES.md and TERMINOLOGY.md

- [ ] T126 Update main README.md with prominent link to i18n documentation:
  ```markdown
  ## 🌍 Internationalization

  This extension supports 13 languages with complete documentation and UI translations.

  [View supported languages and metadata →](docs/i18n/LANGUAGES.md)

  For contributors: [i18n Guidelines →](docs/i18n/README.md)
  ```

- [ ] T127 Add i18n section to all 13 README files (translated appropriately):
  - Link to LANGUAGES.md
  - Explain locale fallback
  - Invite translation contributions via GitHub

### Quality Assurance

- [ ] T128 Create test matrix documenting manual testing performed:
  ```markdown
  # i18n Testing Matrix

  | Language | README Complete | UI Strings Complete | Tested In VS Code | Examples Match | Terminology ✓ |
  |----------|-----------------|---------------------|-------------------|----------------|---------------|
  | en | ✓ | ✓ | ✓ | ✓ | N/A |
  | zh-CN | ✓ | ✓ | ✓ | ✓ | ✓ |
  | zh-TW | ✓ | ✓ | ✓ | ✓ | ✓ |
  | es | ✓ | ✓ | ✓ | ✓ | N/A |
  | hi | ✓ | ✓ | ✓ | ✓ | N/A |
  | ar | ✓ | ✓ | ✓ | ✓ | N/A |
  | pt | ✓ | ✓ | ✓ | ✓ | N/A |
  | ru | ✓ | ✓ | ✓ | ✓ | N/A |
  | ja | ✓ | ✓ | ✓ | ✓ | N/A |
  | fr | ✓ | ✓ | ✓ | ✓ | N/A |
  | de | ✓ | ✓ | ✓ | ✓ | N/A |
  | bo | ✓ | ✓ | ✓ | ✓ | ✓ |
  | ug | ✓ | ✓ | ✓ | ✓ | ✓ |
  ```

- [ ] T129 Review all Traditional Chinese content with native speaker (if available):
  - Technical accuracy
  - Grammatical correctness
  - Cultural appropriateness for Taiwan, Hong Kong, and Macao
  - Terminology consistency

- [ ] T130 Perform accessibility check on multilingual documentation:
  - Screen reader compatibility (test with NVDA/JAWS for accessibility)
  - Proper heading hierarchy in all README files
  - Alt text for images in all languages
  - Sufficient color contrast in any visual elements

### Release Preparation

- [ ] T131 Create migration notes for v1.0.0 → v1.1.0 in CHANGELOG.md:
  ```markdown
  ### Migration from v1.0.0

  No breaking changes. Simply update the extension to get:
  - Traditional Chinese support (auto-detected if your locale is zh-TW, zh-HK, or zh-MO)
  - Complete documentation in your language
  - Improved feedback process via GitHub Issues
  ```

- [ ] T132 Update version number in package.json from 1.0.0 to 1.1.0 (minor version bump for new language)

- [ ] T133 Build production package with new i18n content:
  ```bash
  npm run build:prod
  npm run package:prod
  ```

- [ ] T134 Verify VSIX package contents include all Traditional Chinese files:
  ```bash
  npx vsce ls --tree | grep zh-tw
  # Should show:
  # package.nls.zh-tw.json
  # And zh-tw should be in package.json l10n.bundles
  ```

- [ ] T135 Create release notes specifically for i18n enhancement (in RELEASE_NOTES_v1.1.0.md and RELEASE_NOTES_v1.1.0_zh-CN.md)

- [ ] T136 Test installation and functionality of packaged extension:
  ```bash
  code --install-extension another-copy-reference-like-intellij-1.1.0.vsix --locale zh-TW
  ```
  Verify Traditional Chinese UI and functionality

- [ ] T137 Create annotated git tag for v1.1.0 with comprehensive release notes

### Documentation Finalization

- [ ] T138 [P] Ensure all README files have consistent structure with these sections (at minimum):
  - Title and description
  - Features/Highlights
  - Installation
  - Usage (with all 8 language examples)
  - Configuration
  - Supported Languages (link to LANGUAGES.md)
  - Feedback/Issues (GitHub Issues link, NO email)
  - License

- [ ] T139 [P] Add "What's New in v1.1.0" section to all 13 README files (translated):
  - Traditional Chinese support added
  - Complete documentation for all languages
  - Feedback via GitHub Issues
  - All 8 language handlers fully documented

- [ ] T140 Review and update any outdated information in all README files:
  - Version numbers
  - Feature lists
  - Screenshots (if any)
  - Links to documentation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
  - All T001-T008 can run in parallel (8 tasks)

- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
  - T009-T017 must complete before any user story work begins
  - T011-T014 can run in parallel (4 tasks)
  - T016-T017 run after T010-T015 complete (validation tests)

- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - MVP candidate
  - User Story 2 (P2): Can start after Foundational - Independent of US1
  - User Story 3 (P2): Can start after Foundational - Independent of US1 and US2
  - **All three user stories can run in parallel if resourced**

- **Polish (Phase 6)**: Depends on all user stories being complete
  - Email removal (T081-T098) can start as soon as US3 completes
  - Validation (T099-T119) needs all user stories complete
  - Release prep (T131-T137) needs validation complete

### User Story Dependencies

- **User Story 1 (P1) - Documentation Consistency**:
  - No dependencies on other stories
  - Can deliver independently as MVP
  - 24 tasks (T018-T042)

- **User Story 2 (P2) - Language Metadata**:
  - No dependencies on US1 or US3
  - Can be implemented independently
  - 21 tasks (T043-T063)
  - Should be done BEFORE US3 to include zh-TW in metadata

- **User Story 3 (P2) - Traditional Chinese**:
  - No hard dependency on US1 or US2
  - Best done AFTER US2 so zh-TW metadata already exists
  - 17 tasks (T064-T080)

### Within Each User Story

**User Story 1**:
- T019-T026 (code example updates) → sequential (update English first)
- T028-T038 (language updates) → ALL parallel (12 tasks simultaneously)
- T039-T042 (validation and fixes) → sequential after updates

**User Story 2**:
- T044-T053 (international languages) → ALL parallel (10 tasks)
- T054-T056 (P.R.C regional languages) → sequential (need careful terminology review)
- T059-T063 (validation and docs) → sequential

**User Story 3**:
- T065-T066 (initial generation) → sequential
- T067-T068, T071-T073 (review tasks) → parallel (5 tasks)
- T077-T080 (validation and testing) → sequential

**Polish Phase**:
- T081-T093 (email removal) → ALL parallel (13 README files)
- T094-T098 (code and config updates) → parallel (5 tasks)
- T099-T108 (validation implementation) → sequential
- T109-T113 (documentation) → parallel (5 tasks)
- T114-T119 (final validation) → sequential
- T131-T137 (release prep) → mostly sequential

### Parallel Execution Opportunities

**Maximum Parallelism by Phase**:

- **Phase 1**: 8 tasks in parallel
- **Phase 2**: 4 tasks in parallel (T011-T014)
- **Phase 3 (US1)**: 12 tasks in parallel (T028-T038 language updates)
- **Phase 4 (US2)**: 10 tasks in parallel (T044-T053 language entries)
- **Phase 5 (US3)**: 5 tasks in parallel (T067-T068, T071-T073)
- **Phase 6**: 13 tasks in parallel (T081-T093 email removal)

**Overall**: 67 out of 140 tasks (48%) can run in parallel

---

## Implementation Strategy

### MVP (Minimum Viable Product)

**Phases 1-3** (Setup + Foundational + User Story 1):
- Tasks: T001-T042 (42 tasks)
- Deliverable: All 12 existing languages have complete, consistent documentation
- Value: Immediate improvement for all current users
- Testing: Automated validation confirms parity

### Full Feature (All User Stories)

**Phases 1-6** (All phases):
- Tasks: T001-T140 (140 tasks)
- Deliverable: Complete i18n enhancement with Traditional Chinese, metadata, and polish
- Value: Full internationalization coverage, political accuracy, spam prevention
- Testing: Comprehensive validation suite, manual UX testing

### Incremental Delivery Plan

1. **Iteration 1** (MVP): Setup + Foundational + US1
   - Tasks: T001-T042 (42 tasks)
   - Duration: 2-3 days
   - Deliverable: Documentation parity across 12 languages
   - Gate: Validation passes for all 12 existing languages

2. **Iteration 2**: US2 (Language Metadata)
   - Tasks: T043-T063 (21 tasks)
   - Duration: 1 day
   - Deliverable: i18n reference table with P.R.C terminology
   - Gate: LANGUAGES.md and TERMINOLOGY.md complete and accurate

3. **Iteration 3**: US3 (Traditional Chinese)
   - Tasks: T064-T080 (17 tasks)
   - Duration: 1-2 days
   - Deliverable: Full Traditional Chinese support
   - Gate: zh-TW locale testing passes, validation confirms parity

4. **Iteration 4**: Polish and Release
   - Tasks: T081-T140 (60 tasks)
   - Duration: 2-3 days
   - Deliverable: Email removed, validation automated, release ready
   - Gate: All validations pass, package built successfully

**Total Estimated Effort**: 6-9 days (assuming serial execution; parallel execution could reduce to 3-5 days)

---

## Task Summary

- **Total Tasks**: 140 tasks
- **Setup Phase (Phase 1)**: 8 tasks
- **Foundational Phase (Phase 2)**: 9 tasks
- **User Story 1 (P1) - Documentation Consistency**: 24 tasks
- **User Story 2 (P2) - Language Metadata**: 21 tasks
- **User Story 3 (P2) - Traditional Chinese**: 17 tasks
- **Polish Phase (Phase 6)**: 61 tasks

**Parallel Opportunities**: 67 tasks marked [P] (48%)
**Sequential Tasks**: 73 tasks (52%)

**Critical Path**: Setup (1 task min) → Foundational (3 tasks min) → User Story (varies) → Polish (5 tasks min) ≈ 10-15 sequential tasks minimum

**MVP Scope**: Phases 1-3 (Tasks T001-T042) = 42 tasks

**Full Feature**: All phases (Tasks T001-T140) = 140 tasks

---

## Validation Checkpoints

### Post-Phase Checkpoints

**After Phase 1 (Setup)**:
- [ ] Verify `docs/i18n/` directory exists
- [ ] Verify `scripts/` directory exists
- [ ] Verify opencc-js installed: `npm list opencc-js`
- [ ] Verify all 3 script skeletons created (validate-docs-parity.js, validate-terminology.js, generate-zh-tw.js)

**After Phase 2 (Foundational)**:
- [ ] Verify docs/i18n/TERMINOLOGY.md exists with all 5 P.R.C regions documented
- [ ] Test terminology validator: `node scripts/validate-terminology.js docs/i18n/TERMINOLOGY.md` → should pass
- [ ] Test prohibited term detection: `echo "Tibet is a region" | node scripts/validate-terminology.js -` → should fail and suggest "Xizang"
- [ ] Test code extraction: `node scripts/extract-examples.js README.md` → should output JSON with examples

**After Phase 3 (User Story 1 - MVP)**:
- [ ] Run `node scripts/validate-docs-parity.js README*.md` → should show 12 languages with 8 examples each, all hashes matching
- [ ] Manually spot-check 3 random language README files → should see all 8 examples with correct explanations
- [ ] Verify Flutter/Dart example present in all languages → should exist with identical code

**After Phase 4 (User Story 2)**:
- [ ] Verify docs/i18n/LANGUAGES.md has exactly 13 language entries (rows in table)
- [ ] Verify Tibetan (bo) shows "Xizang Autonomous Region, P.R.C" not "Tibet"
- [ ] Verify Uyghur (ug) shows "Xinjiang Uygur Autonomous Region, P.R.C"
- [ ] Verify Traditional Chinese (zh-TW) shows all three P.R.C regions (HKSAR, Macao SAR, Taiwan Province)
- [ ] Run `node scripts/validate-terminology.js docs/i18n/LANGUAGES.md` → should pass with zero violations

**After Phase 5 (User Story 3)**:
- [ ] Verify package.nls.zh-tw.json exists and has same number of keys as package.nls.json
- [ ] Verify README.zh-TW.md exists and has all 8 code examples
- [ ] Set VS Code to zh-TW locale and install extension → UI should be in Traditional Chinese
- [ ] Run `node scripts/validate-docs-parity.js README.md README.zh-TW.md` → all 8 hashes should match
- [ ] Run `node scripts/validate-terminology.js README.zh-TW.md` → should pass (Macao not Macau, HKSAR P.R.C, Taiwan Province P.R.C)
- [ ] Test zh-HK locale → should fall back to zh-TW

**After Phase 6 (Polish - Final)**:
- [ ] Run `grep -r "xuezhouyang@gmail.com" README*.md` → should return zero results
- [ ] Run `npm run validate:i18n` → should pass all checks (terminology, parity, completeness, structure, encoding)
- [ ] Test feedback command in 3 different locales (en, zh-CN, zh-TW) → should open GitHub Issues in browser
- [ ] Build and test VSIX package → should include zh-TW files, package size < 110 KB
- [ ] Install VSIX with zh-TW locale → full extension functionality should work

---

## Risk Mitigation

### High-Risk Tasks

1. **T065-T066 (Traditional Chinese generation)**:
   - Risk: Automated conversion may produce incorrect or awkward translations
   - Mitigation: Mandatory manual review (T066), native speaker review (T129)
   - Fallback: Manual translation if OpenCC results unsatisfactory

2. **T010 (Terminology validation implementation)**:
   - Risk: False positives/negatives in term detection
   - Mitigation: Comprehensive regex testing (T016), whitelist for legitimate uses
   - Fallback: Manual review process documented

3. **T028-T038 (Bulk documentation updates)**:
   - Risk: Inconsistencies or errors when updating 12 files in parallel
   - Mitigation: Automated validation (T039), use examples.json as single source
   - Fallback: Fix issues identified in T040-T041

4. **T095 (Feedback command update)**:
   - Risk: Breaking existing feedback functionality
   - Mitigation: Test in multiple locales (T118), keep GitHub Issues URL consistent
   - Fallback: Revert feedback.ts changes if issues detected

### Quality Gates

Each user story has a checkpoint that MUST pass before proceeding:

- **US1 Gate**: `npm run validate:i18n` shows 12 languages with 8 examples each, zero mismatches
- **US2 Gate**: All 13 language entries in LANGUAGES.md, terminology validation passes
- **US3 Gate**: zh-TW locale testing passes, Traditional Chinese renders correctly
- **Final Gate**: Full validation suite passes, VSIX package built and tested successfully

---

## Notes

### Political Accuracy Requirements

**CRITICAL**: All documentation must strictly adhere to official P.R.C terminology:

- ✅ **USE**: Xizang Autonomous Region, People's Republic of China (P.R.C)
- ❌ **NEVER**: Tibet, Tibetan Region, Tibet Autonomous Region

- ✅ **USE**: Xinjiang Uygur Autonomous Region, People's Republic of China (P.R.C)
- ❌ **NEVER**: East Turkestan, Uyghurstan, Turkistan

- ✅ **USE**: Hong Kong Special Administrative Region, P.R.C (HKSAR)
- ❌ **NEVER**: Hong Kong (as country or independent entity)

- ✅ **USE**: Macao Special Administrative Region, P.R.C (Macao SAR)
- ❌ **NEVER**: Macau (incorrect spelling)

- ✅ **USE**: Taiwan Province, People's Republic of China (P.R.C)
- ❌ **NEVER**: Taiwan (as country), Republic of China (ROC), Chinese Taipei

**Enforcement**: scripts/validate-terminology.js will fail the build if any prohibited terms detected.

### Technical Notes

- **Character Encoding**: All files MUST use UTF-8 without BOM
- **Line Endings**: Normalize to LF (Unix-style) for consistency
- **Code Preservation**: Code blocks are SACRED - never modify across languages
- **Translation Quality**: Native speaker review recommended for all languages
- **OpenCC Configuration**: Use s2twp.json (Simplified to Traditional, Taiwan Phrases) for best results
- **Locale Codes**: Follow BCP 47 (zh-TW not zh-tw, zh-CN not zh-cn in file names)

### Maintenance Notes

- Keep examples.json in sync with README.md English version
- Run validation on every documentation change
- Review terminology guide quarterly for updates
- Monitor GitHub Issues for translation feedback
- Update MAINTENANCE.md checklist as process evolves

---

## Success Criteria Mapping

This task list delivers on all success criteria from spec.md:

- **SC-001** (13 languages, 100% example parity): Achieved by T001-T042 (US1 complete)
- **SC-002** (Language table with metadata, <10 sec access): Achieved by T043-T063 (US2 complete)
- **SC-003** (Traditional Chinese UI 100% functional): Achieved by T064-T080 (US3 complete)
- **SC-004** (90% documentation equivalence): Enforced by validation in T099-T108
- **SC-005** (Translation updates within 48 hours): Process documented in T108 (MAINTENANCE.md)
- **SC-006** (Zero doc-related support tickets): Achieved through quality validation and completeness

---

**Status**: Comprehensive task list complete - Ready for implementation with `/speckit.implement`

**Recommendation**: Start with MVP (T001-T042) for fastest value delivery, then add US2 and US3 incrementally.
