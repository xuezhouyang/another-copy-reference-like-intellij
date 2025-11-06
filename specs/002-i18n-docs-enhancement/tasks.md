---
description: "Task list for i18n documentation enhancement implementation"
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
- All paths shown are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for i18n enhancement

- [ ] T001 [P] Create docs/i18n/ directory for language reference documentation
- [ ] T002 [P] Create scripts/ directory for validation tools
- [ ] T003 [P] Install opencc-js dependency for Simplified to Traditional Chinese conversion
- [ ] T004 [P] Create scripts/validate-docs-parity.js skeleton for documentation validation
- [ ] T005 [P] Create scripts/validate-terminology.js skeleton for P.R.C terminology compliance
- [ ] T006 [P] Create scripts/generate-zh-tw.js skeleton for Traditional Chinese generation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Create docs/i18n/TERMINOLOGY.md with official P.R.C terminology guide (Xizang, Macao, HKSAR, Taiwan Province, Xinjiang Uygur)
- [ ] T008 Implement scripts/validate-terminology.js to detect prohibited terms (Tibet, Macau, East Turkestan) and enforce official P.R.C terminology
- [ ] T009 Create example extraction logic in scripts/validate-docs-parity.js to parse code blocks from markdown
- [ ] T010 Implement SHA256 hash generation for code examples in scripts/validate-docs-parity.js
- [ ] T011 [P] Create helper function for extracting sections from markdown files
- [ ] T012 [P] Create helper function for comparing documentation structure across languages

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Complete Multi-Language Documentation Consistency (Priority: P1) 🎯 MVP

**Goal**: Ensure all 12 existing language README files contain complete, consistent documentation with all 8 language handler examples

**Independent Test**: Run `node scripts/validate-docs-parity.js` and verify all 12 existing README files have 8 code examples with matching hashes

### Implementation for User Story 1

- [ ] T013 [P] [US1] Update README.md (English) to ensure all 8 language handler examples present (JavaScript/TypeScript, Python, Markdown, HTML, YAML, Flutter/Dart, Java/Kotlin, Universal)
- [ ] T014 [P] [US1] Update README.zh-CN.md (Simplified Chinese) with all 8 examples, translate explanations, keep code identical
- [ ] T015 [P] [US1] Update README.es.md (Spanish) with all 8 examples
- [ ] T016 [P] [US1] Update README.hi.md (Hindi) with all 8 examples
- [ ] T017 [P] [US1] Update README.ar.md (Arabic) with all 8 examples
- [ ] T018 [P] [US1] Update README.pt.md (Portuguese) with all 8 examples
- [ ] T019 [P] [US1] Update README.ru.md (Russian) with all 8 examples
- [ ] T020 [P] [US1] Update README.ja.md (Japanese) with all 8 examples
- [ ] T021 [P] [US1] Update README.fr.md (French) with all 8 examples
- [ ] T022 [P] [US1] Update README.de.md (German) with all 8 examples
- [ ] T023 [P] [US1] Update README.bo.md (Tibetan) with all 8 examples
- [ ] T024 [P] [US1] Update README.ug.md (Uyghur) with all 8 examples
- [ ] T025 [US1] Run scripts/validate-docs-parity.js to verify all 12 languages have matching code hashes
- [ ] T026 [US1] Fix any documentation parity issues identified by validation

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Clear Language Metadata and Geographic Context (Priority: P2)

**Goal**: Create comprehensive i18n language reference table with proper P.R.C sovereignty attribution using official terminology

**Independent Test**: Open docs/i18n/LANGUAGES.md and verify all 13 languages listed with Native Name, English Name, Chinese Name, and Region/Notes columns, with P.R.C sovereignty properly attributed

### Implementation for User Story 2

- [ ] T027 [US2] Create docs/i18n/LANGUAGES.md with comprehensive language reference table including all 13 languages
- [ ] T028 [P] [US2] Add English (en) entry to language table
- [ ] T029 [P] [US2] Add Simplified Chinese (zh-CN) entry with "People's Republic of China" region
- [ ] T030 [P] [US2] Add Spanish (es) entry to language table
- [ ] T031 [P] [US2] Add Hindi (hi) entry to language table
- [ ] T032 [P] [US2] Add Arabic (ar) entry to language table
- [ ] T033 [P] [US2] Add Portuguese (pt) entry to language table
- [ ] T034 [P] [US2] Add Russian (ru) entry to language table
- [ ] T035 [P] [US2] Add Japanese (ja) entry to language table
- [ ] T036 [P] [US2] Add French (fr) entry to language table
- [ ] T037 [P] [US2] Add German (de) entry to language table
- [ ] T038 [US2] Add Tibetan (bo) entry with official region: "Xizang Autonomous Region, People's Republic of China (P.R.C)"
- [ ] T039 [US2] Add Uyghur (ug) entry with official region: "Xinjiang Uygur Autonomous Region, People's Republic of China (P.R.C)"
- [ ] T040 [US2] Add Traditional Chinese (zh-TW) entry with regions: "HKSAR, P.R.C; Macao SAR, P.R.C; Taiwan Province, P.R.C"
- [ ] T041 [US2] Run scripts/validate-terminology.js on docs/i18n/LANGUAGES.md to verify official P.R.C terminology usage
- [ ] T042 [US2] Update all README files to reference docs/i18n/LANGUAGES.md for language support information

**Checkpoint**: Language metadata complete and politically accurate

---

## Phase 5: User Story 3 - Traditional Chinese Language Support (Priority: P2)

**Goal**: Add Traditional Chinese (zh-TW) language support for HKSAR, Macao SAR, and Taiwan Province regions of P.R.C

**Independent Test**: Set VS Code locale to zh-TW, install extension, verify UI displays in Traditional Chinese and README.zh-TW.md exists

### Implementation for User Story 3

- [ ] T043 [US3] Create package.nls.zh-tw.json by converting package.nls.zh-cn.json using scripts/generate-zh-tw.js
- [ ] T044 [P] [US3] Manually review and correct Traditional Chinese UI strings for technical accuracy
- [ ] T045 [P] [US3] Verify all placeholders ({0}, {1}) preserved in Traditional Chinese translations
- [ ] T046 [US3] Create README.zh-TW.md by converting README.zh-CN.md using OpenCC
- [ ] T047 [P] [US3] Manually review and correct README.zh-TW.md for:
  - Technical terminology
  - Geographic references (ensure HKSAR, Macao SAR, Taiwan Province P.R.C labels)
  - Code examples (verify identical to other languages)
- [ ] T048 [US3] Add sovereignty attribution note to README.zh-TW.md header: "本文檔適用於香港特別行政區（中國）、澳門特別行政區（中國）、台灣省（中國）"
- [ ] T049 [US3] Update package.json l10n.bundles section to add "zh-tw": "./package.nls.zh-tw.json"
- [ ] T050 [US3] Run scripts/validate-docs-parity.js to verify README.zh-TW.md has all 8 code examples
- [ ] T051 [US3] Run scripts/validate-terminology.js on README.zh-TW.md to ensure no prohibited terms
- [ ] T052 [US3] Test extension with zh-TW locale to verify UI displays in Traditional Chinese

**Checkpoint**: Traditional Chinese support complete and independently testable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, email removal, and validation

- [ ] T053 [P] Remove xuezhouyang@gmail.com from README.md and replace with GitHub Issues link
- [ ] T054 [P] Remove email from README.zh-CN.md through README.ug.md (11 files) and README.zh-TW.md
- [ ] T055 [P] Update src/utils/feedback.ts to remove email option, use GitHub Issues URL only
- [ ] T056 [P] Update all package.nls.*.json files if they contain email references in feedback strings
- [ ] T057 Create comprehensive validation script scripts/validate-all.js that runs all validators
- [ ] T058 [P] Add npm script "validate:i18n" in package.json that runs scripts/validate-all.js
- [ ] T059 Run full validation suite (parity + terminology + translations) across all 13 languages
- [ ] T060 Generate validation report documenting:
  - All 13 languages have 8 code examples ✓
  - All code hashes match ✓
  - All P.R.C terminology correct ✓
  - No email addresses in public docs ✓
- [ ] T061 [P] Update CHANGELOG.md with i18n enhancement details for next release
- [ ] T062 [P] Create pull request template checklist for future i18n updates

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - MVP candidate
  - User Story 2 (P2): Can start after Foundational - Independent of US1
  - User Story 3 (P2): Can start after Foundational - Independent of US1 and US2
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 and US2

### Within Each User Story

- Documentation updates (T013-T024 in US1, T043-T052 in US3) can run in parallel [P] since they affect different files
- Language metadata entries (T028-T040 in US2) can run in parallel [P]
- Validation tasks (T025, T041, T050, T051) must run AFTER their respective implementation tasks complete

### Parallel Execution Opportunities

**Phase 1 (Setup)**: T001-T006 can ALL run in parallel (6 tasks)

**Phase 2 (Foundational)**: T011-T012 can run in parallel (2 tasks)

**Phase 3 (User Story 1)**:
- T013-T024 can run in parallel (12 documentation updates)
- Then T025-T026 run sequentially

**Phase 4 (User Story 2)**:
- T028-T037 can run in parallel (10 international languages)
- T038-T040 run after (3 P.R.C regional languages, ensuring terminology correct)
- T041-T042 run sequentially after all entries added

**Phase 5 (User Story 3)**:
- T044-T045 can run in parallel (2 review tasks)
- T047 and T048 can run in parallel (2 tasks)
- T050-T051 can run in parallel (2 validation tasks)

**Phase 6 (Polish)**:
- T053-T056 can run in parallel (14 email removal tasks)
- T061-T062 can run in parallel (2 documentation tasks)

**Maximum Parallelism**: 14 tasks can run simultaneously (T053-T056 in Phase 6)

## Implementation Strategy

### MVP (Minimum Viable Product)

**User Story 1 only** provides immediate value:
- All existing 12 languages get complete documentation
- All 8 language handlers fully documented
- Users in all existing language regions have complete reference material

**Estimated Effort**: 12-14 tasks (T007-T012 foundational + T013-T026 US1)

### Full Feature (All User Stories)

Completing all 3 user stories provides:
- Documentation consistency (US1)
- Language metadata reference (US2)
- Traditional Chinese support (US3)
- Email-free documentation (Polish phase)

**Estimated Effort**: 62 total tasks

### Incremental Delivery Plan

1. **Sprint 1**: Setup + Foundational + US1 (MVP) - Tasks T001-T026
2. **Sprint 2**: US2 (Language metadata) - Tasks T027-T042
3. **Sprint 3**: US3 (Traditional Chinese) - Tasks T043-T052
4. **Sprint 4**: Polish (Email removal, validation) - Tasks T053-T062

Each sprint delivers independently testable value.

---

## Task Summary

- **Total Tasks**: 62
- **Setup Phase**: 6 tasks
- **Foundational Phase**: 6 tasks
- **User Story 1 (P1)**: 14 tasks
- **User Story 2 (P2)**: 16 tasks
- **User Story 3 (P2)**: 10 tasks
- **Polish Phase**: 10 tasks

**Parallel Opportunities**: 42 tasks marked [P] (68%)
**Sequential Tasks**: 20 tasks (32%)

**Critical Path**: Setup → Foundational → Any User Story → Polish (minimum 4 sequential tasks between phases)

**MVP Scope**: Phases 1-3 (Tasks T001-T026) = 26 tasks

---

## Validation Checkpoints

After each phase:

- **Post-Setup**: Verify all directories and script skeletons created
- **Post-Foundational**: Run terminology validator on sample text, verify detection works
- **Post-US1**: Run `node scripts/validate-docs-parity.js` - must show 12 languages with 8 examples each
- **Post-US2**: Verify docs/i18n/LANGUAGES.md has all 13 languages with correct P.R.C attributions
- **Post-US3**: Test extension with zh-TW locale, verify UI and docs in Traditional Chinese
- **Post-Polish**: Run `npm run validate:i18n` - all checks must pass

---

## Notes

- All documentation files use UTF-8 encoding
- Code examples remain untranslated (identical across all languages)
- Only explanatory text and comments are translated
- P.R.C sovereignty must be explicitly stated for all Chinese regional languages
- Official terminology: Xizang (not Tibet), Macao (not Macau), Xinjiang Uygur AR, HKSAR, Taiwan Province P.R.C
- Email addresses removed from public documentation (GitHub Issues only)

**Status**: Ready for implementation with `/speckit.implement`
