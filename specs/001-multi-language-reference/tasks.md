---
description: "Task list for multi-language Copy Reference extension implementation"
---

# Tasks: Multi-Language Copy Reference

**Input**: Design documents from `/specs/001-multi-language-reference/`
**Prerequisites**: plan.md (complete), spec.md (complete), research.md, data-model.md, contracts/

**Tests**: Comprehensive test coverage included per /ultrathink directive

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Extension project**: `src/`, `test/` at repository root
- All paths shown are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Update package.json with new dependencies (Mocha test framework)
- [X] T002 Create src/handlers/ directory structure for language handlers
- [X] T003 [P] Create src/utils/ directory for utility modules
- [X] T004 [P] Create src/types/ directory for TypeScript type definitions
- [X] T005 [P] Create test/ directory structure with unit/, integration/, and fixtures/ subdirectories
- [X] T006 [P] Configure TypeScript compiler options in tsconfig.json for new module structure
- [X] T007 [P] Set up Mocha test configuration in .mocharc.json
- [X] T008 Update .vscodeignore to exclude test files from production bundle

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Create ILanguageHandler interface in src/handlers/base.ts
- [X] T010 [P] Create ReferenceFormat class in src/types/index.ts
- [X] T011 [P] Create SymbolContext class in src/types/index.ts
- [X] T012 [P] Create ClipboardEntry class in src/types/index.ts
- [X] T013 [P] Create HandlerConfiguration interface in src/types/index.ts
- [X] T014 [P] Create CacheEntry class in src/types/index.ts
- [X] T015 Implement BaseLanguageHandler abstract class in src/handlers/base.ts with caching logic
- [X] T016 [P] Implement clipboard utility wrapper in src/utils/clipboard.ts
- [X] T017 [P] Implement localization utility in src/utils/localization.ts
- [X] T018 [P] Implement symbol resolution utilities in src/utils/symbols.ts
- [X] T019 [P] Implement reference formatting utilities in src/utils/formatting.ts
- [X] T020 Create handler registry system in src/extension.ts for managing multiple handlers
- [X] T021 [P] Update all package.nls.*.json files with new error messages
- [X] T022 Implement cache manager singleton in src/utils/cache.ts
- [X] T023 Create performance monitoring utilities in src/utils/performance.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Universal Fallback Reference (Priority: P1) 🎯 MVP

**Goal**: Provide basic Copy Reference for ANY file type with filepath:line:column format

**Independent Test**: Open any unsupported file type, invoke Copy Reference, verify clipboard contains filepath:line:column

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T024 [P] [US1] Create unit test for UniversalHandler.canHandle() in test/handlers/universal.test.ts
- [X] T025 [P] [US1] Create unit test for UniversalHandler.extractReference() in test/handlers/universal.test.ts
- [X] T026 [P] [US1] Create integration test for fallback reference generation in test/e2e/universal.e2e.test.ts
- [X] T027 [P] [US1] Create test fixture files (test/helpers/mocks.ts)
- [X] T028 [P] [US1] Create performance test ensuring < 100ms response (included in tests)

### Implementation for User Story 1

- [X] T029 [US1] Create UniversalHandler class in src/handlers/universal.ts implementing ILanguageHandler
- [X] T030 [US1] Implement canHandle() method in src/handlers/universal.ts to always return true (lowest priority)
- [X] T031 [US1] Implement extractReference() method in src/handlers/universal.ts using line:column format
- [X] T032 [US1] Register UniversalHandler with priority 0 in src/extension.ts
- [X] T033 [US1] Update command handler in src/extension.ts to use handler registry
- [X] T034 [US1] Add error handling for unsaved files in src/handlers/universal.ts
- [X] T035 [US1] Implement clipboard operation with error handling in command handler
- [X] T036 [US1] Add success/error notifications using vscode.window messages

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - JavaScript/TypeScript Reference (Priority: P2)

**Goal**: Support JS/TS/JSX/TSX files with module path and symbol references

**Independent Test**: Open any .js/.ts file, position on function/class, verify clipboard contains path#symbol format

### Tests for User Story 2 ⚠️

- [X] T037 [P] [US2] Create unit test for JavaScriptHandler symbol detection in test/unit/handlers/javascript.test.ts
- [X] T038 [P] [US2] Create unit test for TypeScript class resolution in test/unit/handlers/javascript.test.ts
- [X] T039 [P] [US2] Create integration test for nested symbol paths in test/integration/javascript.test.ts
- [X] T040 [P] [US2] Create test fixtures for JS/TS files in test/fixtures/javascript/
- [X] T041 [P] [US2] Create test for JSX/TSX file handling in test/integration/javascript.test.ts

### Implementation for User Story 2

- [X] T042 [US2] Create JavaScriptHandler class in src/handlers/javascript.ts extending BaseLanguageHandler
- [X] T043 [US2] Implement canHandle() for JS/TS/JSX/TSX file detection in src/handlers/javascript.ts
- [X] T044 [US2] Implement symbol resolution using VS Code's executeDocumentSymbolProvider in src/handlers/javascript.ts
- [X] T045 [US2] Implement module path extraction from file path in src/handlers/javascript.ts
- [X] T046 [US2] Handle nested classes and methods in symbol path generation
- [X] T047 [US2] Register JavaScriptHandler with priority 80 in src/extension.ts
- [X] T048 [US2] Add special handling for arrow functions and function expressions (base implementation)
- [X] T049 [US2] Implement caching for parsed symbols in JavaScriptHandler

**Checkpoint**: JavaScript/TypeScript support complete and independently testable

---

## Phase 5: User Story 3 - Python Reference (Priority: P2)

**Goal**: Support Python files with module.Class#method reference format

**Independent Test**: Open .py file, position on class method, verify clipboard contains module path format

### Tests for User Story 3 ⚠️

- [X] T050 [P] [US3] Create unit test for PythonHandler class detection in test/unit/handlers/python.test.ts
- [X] T051 [P] [US3] Create unit test for Python module path resolution in test/unit/handlers/python.test.ts
- [X] T052 [P] [US3] Create integration test for package hierarchy in test/integration/python.test.ts
- [X] T053 [P] [US3] Create Python test fixtures in test/fixtures/python/
- [X] T054 [P] [US3] Create test for standalone function handling in test/unit/handlers/python.test.ts

### Implementation for User Story 3

- [X] T055 [US3] Create PythonHandler class in src/handlers/python.ts extending BaseLanguageHandler
- [X] T056 [US3] Implement canHandle() for .py file detection in src/handlers/python.ts
- [X] T057 [US3] Implement Python module path extraction using file structure
- [X] T058 [US3] Use VS Code Python language server for symbol resolution
- [X] T059 [US3] Handle __init__.py and package structures properly
- [X] T060 [US3] Register PythonHandler with priority 75 in src/extension.ts
- [X] T061 [US3] Add support for async functions and decorators (base implementation)
- [X] T062 [US3] Implement Python-specific reference format with . separator

**Checkpoint**: Python support complete and independently testable

---

## Phase 6: User Story 4 - Markdown Reference (Priority: P3)

**Goal**: Support Markdown files with heading anchor references

**Independent Test**: Open .md file, position on heading, verify clipboard contains path#anchor format

### Tests for User Story 4 ⚠️

- [x] T063 [P] [US4] Create unit test for MarkdownHandler heading detection in test/unit/handlers/markdown.test.ts
- [x] T064 [P] [US4] Create unit test for anchor generation in test/unit/handlers/markdown.test.ts
- [x] T065 [P] [US4] Create integration test for nested headings in test/integration/markdown.test.ts
- [x] T066 [P] [US4] Create Markdown test fixtures in test/fixtures/markdown/
- [x] T067 [P] [US4] Create test for special character handling in anchors

### Implementation for User Story 4

- [x] T068 [US4] Create MarkdownHandler class in src/handlers/markdown.ts extending BaseLanguageHandler
- [x] T069 [US4] Implement canHandle() for .md file detection in src/handlers/markdown.ts
- [x] T070 [US4] Implement heading detection using regex patterns
- [x] T071 [US4] Generate GitHub-compatible anchor slugs from heading text
- [x] T072 [US4] Handle special characters and emoji in heading anchors
- [x] T073 [US4] Register MarkdownHandler with priority 70 in src/extension.ts
- [x] T074 [US4] Support both ATX (#) and Setext style headings
- [x] T075 [US4] Implement proper URL encoding for anchors

**Checkpoint**: Markdown support complete and independently testable

---

## Phase 7: User Story 5 - HTML/XML Reference (Priority: P3)

**Goal**: Support HTML/XML files with element ID references

**Independent Test**: Open HTML file, position on element with ID, verify clipboard contains path#id format

### Tests for User Story 5 ⚠️

- [x] T076 [P] [US5] Create unit test for HTMLHandler ID extraction in test/unit/handlers/html.test.ts
- [x] T077 [P] [US5] Create unit test for XML element handling in test/unit/handlers/html.test.ts
- [x] T078 [P] [US5] Create integration test for nested elements in test/integration/html.test.ts
- [x] T079 [P] [US5] Create HTML/XML test fixtures in test/fixtures/html/
- [x] T080 [P] [US5] Create test for elements without IDs using XPath

### Implementation for User Story 5

- [x] T081 [US5] Create HTMLHandler class in src/handlers/html.ts extending BaseLanguageHandler
- [x] T082 [US5] Implement canHandle() for .html/.xml detection in src/handlers/html.ts
- [x] T083 [US5] Extract element IDs using VS Code's HTML language server
- [x] T084 [US5] Generate XPath-like references for elements without IDs
- [x] T085 [US5] Handle data attributes as fallback identifiers
- [x] T086 [US5] Register HTMLHandler with priority 65 in src/extension.ts
- [x] T087 [US5] Support class-based references as secondary option
- [x] T088 [US5] Implement proper escaping for special characters in IDs

**Checkpoint**: HTML/XML support complete and independently testable

---

## Phase 8: User Story 6 - YAML Configuration Reference (Priority: P3)

**Goal**: Support YAML files with dot-notation key path references

**Independent Test**: Open .yml file, position on nested key, verify clipboard contains path#key.path format

### Tests for User Story 6 ⚠️

- [x] T089 [P] [US6] Create unit test for YAMLHandler key extraction in test/unit/handlers/yaml.test.ts
- [x] T090 [P] [US6] Create unit test for nested path generation in test/unit/handlers/yaml.test.ts
- [x] T091 [P] [US6] Create integration test for array indices in test/integration/yaml.test.ts
- [x] T092 [P] [US6] Create YAML test fixtures in test/fixtures/yaml/
- [x] T093 [P] [US6] Create test for multi-document YAML files

### Implementation for User Story 6

- [x] T094 [US6] Create YAMLHandler class in src/handlers/yaml.ts extending BaseLanguageHandler
- [x] T095 [US6] Implement canHandle() for .yml/.yaml detection in src/handlers/yaml.ts
- [x] T096 [US6] Parse YAML structure to extract key hierarchy
- [x] T097 [US6] Generate dot-notation paths for nested keys
- [x] T098 [US6] Handle array indices in path notation
- [x] T099 [US6] Register YAMLHandler with priority 60 in src/extension.ts
- [x] T100 [US6] Support anchors and aliases in YAML
- [x] T101 [US6] Implement comment-aware parsing

**Checkpoint**: YAML support complete and independently testable

---

## Phase 9: User Story 7 - React Component Reference (Priority: P4)

**Goal**: Enhance JS/TS handler to recognize React components and hooks

**Independent Test**: Open .jsx/.tsx file with React component, verify component-aware references

### Tests for User Story 7 ⚠️

- [x] T102 [P] [US7] Create unit test for React component detection in test/unit/handlers/react.test.ts
- [x] T103 [P] [US7] Create unit test for React hook recognition in test/unit/handlers/react.test.ts
- [x] T104 [P] [US7] Create integration test for nested components in test/integration/react.test.ts
- [x] T105 [P] [US7] Create React test fixtures in test/fixtures/react/
- [x] T106 [P] [US7] Create test for HOC (Higher-Order Component) handling

### Implementation for User Story 7

- [x] T107 [US7] Enhance JavaScriptHandler with React framework detection in src/handlers/javascript.ts
- [x] T108 [US7] Detect functional components by uppercase naming convention
- [x] T109 [US7] Detect class components extending React.Component
- [x] T110 [US7] Recognize custom hooks by 'use' prefix pattern
- [x] T111 [US7] Add component prop type detection for better context
- [x] T112 [US7] Handle JSX-specific symbol resolution
- [x] T113 [US7] Support React.memo and forwardRef wrapped components
- [x] T114 [US7] Update reference format to include component context

**Checkpoint**: React enhancement complete and independently testable

---

## Phase 10: User Story 8 - Flutter/Dart Reference (Priority: P4)

**Goal**: Support Flutter/Dart files with widget class references

**Independent Test**: Open .dart file with Flutter widget, verify Flutter-aware references

### Tests for User Story 8 ⚠️

- [X] T115 [P] [US8] Create unit test for Flutter widget detection in test/unit/handlers/flutter.test.ts
- [X] T116 [P] [US8] Create unit test for StatefulWidget handling in test/unit/handlers/flutter.test.ts
- [X] T117 [P] [US8] Create integration test for widget hierarchy in test/integration/flutter.test.ts
- [X] T118 [P] [US8] Create Flutter test fixtures in test/fixtures/flutter/
- [X] T119 [P] [US8] Create test for State class association

### Implementation for User Story 8

- [X] T120 [US8] Create FlutterHandler class in src/handlers/flutter.ts extending BaseLanguageHandler
- [X] T121 [US8] Implement canHandle() for .dart file detection in src/handlers/flutter.ts
- [X] T122 [US8] Detect StatelessWidget and StatefulWidget classes
- [X] T123 [US8] Extract package path from pubspec.yaml context
- [X] T124 [US8] Handle State class relationships properly
- [X] T125 [US8] Register FlutterHandler with priority 85 in src/extension.ts
- [X] T126 [US8] Support build() method context detection
- [X] T127 [US8] Generate Flutter-specific package: references

**Checkpoint**: Flutter support complete and independently testable

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T128 [P] Add telemetry for usage tracking in src/utils/telemetry.ts
- [x] T129 [P] Implement settings UI contribution in package.json
- [x] T130 [P] Create README.md with comprehensive documentation
- [x] T131 [P] Add CHANGELOG.md with version history
- [x] T132 Create end-to-end test suite in test/integration/e2e.test.ts
- [x] T133 Optimize cache eviction strategy in src/utils/cache.ts
- [x] T134 [P] Add performance benchmarks in test/performance/
- [x] T135 [P] Implement user feedback collection mechanism
- [x] T136 Validate all 12 language translations are complete
- [x] T137 [P] Create VS Code Marketplace assets (icon, screenshots)
- [x] T138 Run accessibility audit on all UI elements
- [x] T139 Security review of clipboard operations
- [x] T140 Bundle size optimization and tree shaking
- [x] T141 Create migration guide from old Java/Kotlin-only version
- [x] T142 Run quickstart.md validation with all examples

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 11)**: Depends on at least User Story 1 (MVP) being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Independent
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Independent
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - Independent
- **User Story 7 (P4)**: Depends on User Story 2 (enhances JavaScript handler)
- **User Story 8 (P4)**: Can start after Foundational (Phase 2) - Independent

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Handler class before method implementations
- Registration after implementation complete
- Integration tests after unit tests pass

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational type/utility tasks marked [P] can run in parallel
- Once Foundational phase completes, US1-6 and US8 can start in parallel
- US7 must wait for US2 completion
- All tests within a story marked [P] can run in parallel
- Polish tasks marked [P] can run in parallel after MVP

---

## Parallel Example: User Story 1 (Universal Fallback)

```bash
# Launch all tests for User Story 1 together:
Task: "Create unit test for FallbackHandler.canHandle() in test/unit/handlers/fallback.test.ts"
Task: "Create unit test for FallbackHandler.extractReference() in test/unit/handlers/fallback.test.ts"
Task: "Create integration test for fallback reference generation in test/integration/fallback.test.ts"
Task: "Create test fixture files for various unsupported types in test/fixtures/fallback/"
Task: "Create performance test ensuring < 100ms response in test/integration/performance.test.ts"

# After tests are written and failing, implement the handler
Task: "Create FallbackHandler class in src/handlers/fallback.ts"
# Then implement methods sequentially
```

---

## Parallel Example: Multiple User Stories

```bash
# After Foundational phase, launch multiple stories in parallel:

# Developer A - User Story 1 (Fallback)
Task: "Create unit test for FallbackHandler.canHandle()"
Task: "Create FallbackHandler class in src/handlers/fallback.ts"

# Developer B - User Story 2 (JavaScript)
Task: "Create unit test for JavaScriptHandler symbol detection"
Task: "Create JavaScriptHandler class in src/handlers/javascript.ts"

# Developer C - User Story 3 (Python)
Task: "Create unit test for PythonHandler class detection"
Task: "Create PythonHandler class in src/handlers/python.ts"

# All working in parallel on independent stories
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Universal Fallback)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready - Users can immediately use Copy Reference for ANY file

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 & 3 → Test independently → Deploy/Demo (Major languages)
4. Add User Story 4, 5, 6 → Test independently → Deploy/Demo (Config files)
5. Add User Story 7 & 8 → Test independently → Deploy/Demo (Frameworks)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Fallback) - MVP
   - Developer B: User Story 2 (JavaScript/TypeScript)
   - Developer C: User Story 3 (Python)
   - Developer D: User Story 4-6 (Markdown/HTML/YAML)
   - Developer E: User Story 8 (Flutter)
3. After US2 complete: Developer B continues with US7 (React)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests must fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total tasks: 142 (comprehensive coverage per /ultrathink)
- Estimated completion: 3-4 weeks with single developer, 1-2 weeks with team