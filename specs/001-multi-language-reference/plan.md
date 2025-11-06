# Implementation Plan: Multi-Language Copy Reference

**Branch**: `001-multi-language-reference` | **Date**: 2025-11-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-multi-language-reference/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Extend the existing VS Code Copy Reference extension to support multiple languages (Markdown, JavaScript, TypeScript, Python, HTML, XML, YAML) and frameworks (React, Flutter), with a universal fallback mechanism for any file type. The extension will provide language-specific reference formats while maintaining a single, consistent keyboard shortcut across all supported languages.

## Technical Context

**Language/Version**: TypeScript 5.0+
**Primary Dependencies**: VS Code Extension API 1.74+, vscode-languageserver-protocol, clipboard API
**Storage**: N/A (no persistent storage required)
**Testing**: Mocha test framework for VS Code extensions
**Target Platform**: VS Code 1.74+ on Windows, macOS, Linux
**Project Type**: VS Code Extension (single TypeScript project)
**Performance Goals**: Symbol resolution and reference generation < 100ms for 95% of operations
**Constraints**: Memory usage < 50MB, must work with files up to 10,000 lines without degradation
**Scale/Scope**: Support 8+ languages/frameworks, 12 localization languages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle Compliance

✅ **I. Multi-Language Support**: Plan includes support for all required languages (Markdown, JS/TS, Python, HTML, XML, YAML, React, Flutter)
✅ **II. Universal Reference Patterns**: Each language will have its own appropriate reference format
✅ **III. Framework Awareness**: React (.jsx, .tsx) and Flutter (.dart) patterns will be recognized
✅ **IV. Extensibility**: Modular language handler architecture with pluggable design
✅ **V. User Experience**: Single keyboard shortcut, clear error messages, i18n support
✅ **VI. Universal Fallback**: Fallback mechanism ensures Copy Reference always works

### Quality Gates

✅ **Test Coverage**: Will maintain > 80% test coverage
✅ **Performance**: Symbol resolution target < 100ms
✅ **VS Code Compatibility**: Will test with VS Code 1.74+
✅ **Localization**: Will verify all 12 language translations

**Gate Status**: PASSED - All constitution principles and quality gates are satisfied

## Project Structure

### Documentation (this feature)

```text
specs/001-multi-language-reference/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── extension.ts         # Main extension entry point (existing)
├── handlers/            # Language-specific handlers (new)
│   ├── base.ts         # Base handler interface
│   ├── javascript.ts   # JS/TS/React handler
│   ├── python.ts       # Python handler
│   ├── markdown.ts     # Markdown handler
│   ├── html.ts         # HTML/XML handler
│   ├── yaml.ts         # YAML handler
│   ├── flutter.ts      # Flutter/Dart handler
│   └── fallback.ts     # Universal fallback handler
├── utils/
│   ├── symbols.ts      # Symbol resolution utilities
│   ├── clipboard.ts    # Clipboard management
│   ├── formatting.ts   # Reference formatting
│   └── localization.ts # i18n utilities
└── types/
    └── index.ts        # Type definitions

test/
├── unit/
│   ├── handlers/       # Handler tests
│   └── utils/          # Utility tests
├── integration/        # End-to-end tests
└── fixtures/           # Test files for each language

package.nls.*.json       # Localization files (existing)
```

**Structure Decision**: Single TypeScript project structure chosen as this is a VS Code extension. The modular handler architecture in `src/handlers/` allows for the extensibility principle while keeping the codebase organized. Each language gets its own handler module implementing a common interface.

## Complexity Tracking

> No constitution violations to justify - all principles are satisfied within the standard architecture.

## Phase Completion Status

### Phase 0: Research & Clarification ✅
**Completed**: 2025-11-05
- All technical decisions finalized
- Language server integration strategy defined
- Performance optimization approach determined
- No remaining NEEDS CLARIFICATION items

**Artifacts Generated**:
- `research.md` - Comprehensive research findings and decisions

### Phase 1: Design & Contracts ✅
**Completed**: 2025-11-05
- Data model fully specified
- API contracts defined
- Quick start documentation created
- Agent context updated

**Artifacts Generated**:
- `data-model.md` - Entity definitions and relationships
- `contracts/copy-reference-api.yaml` - OpenAPI specification
- `quickstart.md` - User guide and examples
- Updated `CLAUDE.md` with new technologies

### Constitution Re-check (Post-Design) ✅

**All Principles Still Satisfied**:
- ✅ Multi-Language Support: Data model supports all required languages
- ✅ Universal Reference Patterns: ReferenceFormat entity enforces patterns
- ✅ Framework Awareness: SymbolContext includes frameworkType
- ✅ Extensibility: Modular handler architecture with configuration
- ✅ User Experience: API includes i18n support and error handling
- ✅ Universal Fallback: Fallback handler in architecture

**Quality Gates Maintained**:
- ✅ Performance: Caching strategy in CacheEntry entity
- ✅ Test coverage: Test structure defined in plan
- ✅ VS Code compatibility: API uses standard VS Code interfaces
- ✅ Localization: ErrorResponse includes localized messages

## Ready for Implementation

The implementation plan is complete and ready for the next phase:
- Run `/speckit.tasks` to generate the implementation task list
- All technical decisions are finalized
- No blocking issues or clarifications remain
- Constitution compliance verified at all checkpoints