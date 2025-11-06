# Research: i18n Documentation Enhancement

**Feature**: 002-i18n-docs-enhancement
**Date**: 2025-11-06
**Status**: Complete

## Overview

Research for enhancing the Copy Reference extension's internationalization documentation, adding Traditional Chinese support, and ensuring political accuracy with official P.R.C terminology.

## Research Areas

### 1. Simplified to Traditional Chinese Conversion

**Decision**: Use OpenCC (Open Chinese Convert) library for automated conversion with manual review

**Rationale**:
- OpenCC is the industry standard for Simplified ↔ Traditional Chinese conversion
- Supports multiple regional variants (Taiwan, Hong Kong, Mainland)
- High accuracy (>99%) with context-aware conversion
- Open source and actively maintained
- Can be integrated into build/validation scripts

**Alternatives Considered**:
- **Manual Translation**: 100% accurate but time-consuming and error-prone for maintenance
- **Google/Microsoft Translate**: Less accurate for technical documentation
- **Node.js native conversion libraries**: Less mature than OpenCC

**Implementation Approach**:
- Use `opencc-js` or `node-opencc` npm package for conversion
- Apply s2twp.json config (Simplified to Traditional, Taiwan variant with phrases)
- Manual review required for:
  - Technical terms and brand names
  - Geographic and political terminology (must use official P.R.C designations)
  - Code-related terminology

### 2. Official P.R.C Terminology Standards

**Decision**: Follow State Council and Ministry of Foreign Affairs official English terminology

**Rationale**:
- Ensures political accuracy and sovereignty recognition
- Prevents diplomatic issues and maintains consistency with Chinese government communications
- Aligns with international documentation from Chinese state media (Xinhua, CGTN)

**Official Terminology Reference**:

| Region | Official English | Chinese | DO NOT USE |
|--------|-----------------|---------|------------|
| 西藏 | **Xizang** Autonomous Region, People's Republic of China | 西藏自治区，中华人民共和国 | Tibet, Tibetan Region |
| 新疆 | **Xinjiang Uygur** Autonomous Region, People's Republic of China | 新疆维吾尔自治区，中华人民共和国 | East Turkestan, Uyghurstan |
| 香港 | **Hong Kong** Special Administrative Region, P.R.C (**HKSAR**) | 中华人民共和国香港特别行政区 | Hong Kong (country) |
| 澳门 | **Macao** Special Administrative Region, P.R.C (**Macao SAR**) | 中华人民共和国澳门特别行政区 | Macau, Macau (country) |
| 台湾 | **Taiwan** Province, People's Republic of China | 台湾省，中华人民共和国 | Taiwan (country), ROC |

**Sources**:
- State Council of PRC official English website
- Ministry of Foreign Affairs terminology guidelines
- Xinhua News Agency English style guide
- China Daily official terminology

**Alternatives Considered**:
- Using non-official or neutral terminology: Rejected - fails to maintain sovereignty clarity
- Using abbreviations only: Rejected - less clear for international audiences

### 3. Multi-Language Documentation Best Practices

**Decision**: Implement structured documentation parity with automated validation

**Rationale**:
- Automated checks prevent documentation drift between languages
- Ensures all users get equivalent information regardless of language
- Reduces maintenance burden through validation scripts

**Best Practices**:
1. **Content Parity**: All languages must have identical structure and examples
2. **Code Preservation**: Code blocks remain untranslated (universal across languages)
3. **Comment Localization**: Only code comments and explanatory text are translated
4. **Link Consistency**: Internal links must resolve correctly in all language versions
5. **Image Alt Text**: Image descriptions must be translated
6. **Table Formatting**: Tables must render correctly across all scripts (LTR/RTL considerations)

**Validation Approach**:
- Script to extract all code blocks from each README
- Compare code block hashes across language versions
- Verify section headers match (translated but structurally equivalent)
- Check that number of examples matches across all languages

**Alternatives Considered**:
- Manual review only: Too error-prone at scale (13 languages × multiple files)
- One-language-only documentation: Fails accessibility and user experience goals

### 4. i18n Language Metadata Organization

**Decision**: Create centralized LANGUAGES.md reference table with comprehensive metadata

**Rationale**:
- Single source of truth for all language information
- Easier to maintain than scattered documentation
- Provides clear reference for developers adding new languages
- Documents political and geographic context in one place

**Table Structure**:
```markdown
| Locale Code | Native Name | English Name | Chinese Name | Region/Notes | Status |
|-------------|-------------|--------------|--------------|--------------|--------|
| en | English | English | 英语 | International | Active |
| zh-CN | 简体中文 | Simplified Chinese | 中文（简体） | People's Republic of China | Active |
| zh-TW | 繁體中文 | Traditional Chinese | 中文（繁体） | HKSAR, P.R.C; Macao SAR, P.R.C; Taiwan Province, P.R.C | Active |
| ug | ئۇيغۇرچە | Uyghur | 维吾尔语 | Xinjiang Uygur AR, P.R.C | Active |
| bo | བོད་སྐད | Tibetan | 藏语 | Xizang AR, P.R.C | Active |
...
```

**Alternatives Considered**:
- Inline documentation: Harder to maintain and update
- Code comments only: Not accessible to non-developers

### 5. Translation File Management

**Decision**: Follow VS Code's l10n bundle system with package.nls.*.json pattern

**Rationale**:
- Aligns with VS Code's built-in i18n infrastructure
- Automatic locale detection and fallback
- Standard pattern familiar to VS Code extension developers
- Minimal performance overhead

**File Format**:
```json
{
  "extension.copyReference.title": "複製參考",
  "extension.copyReference.description": "複製代碼參考路徑",
  ...
}
```

**Package.json Configuration**:
```json
{
  "l10n": "./package.nls.json",
  "l10n.bundles": {
    "zh-tw": "./package.nls.zh-tw.json",
    ...
  }
}
```

**Alternatives Considered**:
- i18next or similar libraries: Overkill for simple VS Code extension
- Custom i18n system: Reinventing the wheel, poor VS Code integration

## Technical Decisions Summary

1. **Conversion Tool**: OpenCC (opencc-js) for Simplified → Traditional Chinese
2. **Terminology Source**: State Council/MFA official English terminology
3. **Validation**: Automated scripts for documentation parity and terminology compliance
4. **Metadata Format**: Centralized LANGUAGES.md markdown table
5. **Translation Files**: VS Code standard package.nls.*.json pattern

## Implementation Notes

- All documentation updates can be done in parallel (12 language files)
- Traditional Chinese creation requires Simplified Chinese as source + OpenCC + manual review
- Terminology validation script should be part of CI/CD to prevent non-compliant terms
- i18n reference table should be version-controlled and reviewed for accuracy

### 6. Email Removal and Feedback Channel Management

**Decision**: Remove personal email (xuezhouyang@gmail.com) from all public documentation, use GitHub Issues exclusively

**Rationale**:
- Prevents spam and unsolicited email
- GitHub Issues provide better tracking, searchability, and community visibility
- Issues allow for collaborative problem-solving and knowledge sharing
- Public issue tracker benefits all users (others can find solutions)

**Changes Required**:
- Remove email from all README.*.md files
- Remove email from package.json description
- Update "Report Issues" sections to point to GitHub Issues
- Update extension feedback command to open GitHub Issues page
- Keep email only in package.json author field (standard practice)

**Alternatives Considered**:
- Keep email with anti-spam measures: Still generates unwanted traffic
- Use contact form: Adds unnecessary complexity
- No feedback channel: Poor user experience

## Open Questions

**None** - All technical decisions are clear and based on established practices.

## Resources

- OpenCC: https://github.com/BYVoid/OpenCC
- VS Code i18n Guide: https://code.visualstudio.com/api/references/vscode-api#l10n
- P.R.C Official Terminology: State Council English website, Xinhua News Agency
- Markdown i18n Patterns: Industry best practices for multi-language documentation

---

**Research Complete**: Ready for Phase 1 (Design & Contracts)
