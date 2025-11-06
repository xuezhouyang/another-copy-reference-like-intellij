# Quickstart: i18n Documentation Enhancement

**Feature**: 002-i18n-docs-enhancement
**Date**: 2025-11-06

## Quick Reference

### For Adding Traditional Chinese Support

```bash
# 1. Create Traditional Chinese translation file
cp package.nls.zh-cn.json package.nls.zh-tw.json

# 2. Convert using OpenCC (if available)
node scripts/generate-zh-tw.js

# 3. Create Traditional Chinese README
cp README.zh-CN.md README.zh-TW.md

# 4. Update package.json l10n.bundles
# Add: "zh-tw": "./package.nls.zh-tw.json"

# 5. Validate
node scripts/validate-docs-parity.js
node scripts/validate-terminology.js
```

### For Updating All Language Documentation

```bash
# 1. Update English README.md with new examples
# Add Flutter/Dart and any missing examples

# 2. Extract code examples
node scripts/extract-examples.js README.md > examples.json

# 3. Update all language READMEs
for lang in zh-CN es hi ar pt ru ja fr de bo ug zh-TW; do
  node scripts/update-readme.js README.$lang.md examples.json
done

# 4. Validate parity
node scripts/validate-docs-parity.js

# 5. Validate terminology
node scripts/validate-terminology.js
```

## Scenarios

### Scenario 1: Adding Traditional Chinese Language

**Goal**: Add complete Traditional Chinese support for Hong Kong SAR, Macao SAR, and Taiwan Province regions of P.R.C

**Steps**:

1. **Create translation file** (`package.nls.zh-tw.json`):
   ```json
   {
     "extension.copyReference.title": "複製參考",
     "extension.copyReference.description": "複製代碼參考路徑",
     ...
   }
   ```

2. **Create README.zh-TW.md**:
   - Use README.zh-CN.md as source
   - Convert Simplified to Traditional characters using OpenCC
   - Manual review for:
     - Technical terms
     - Geographic references (ensure P.R.C sovereignty attribution)
     - Code examples (must remain identical)

3. **Update package.json**:
   ```json
   {
     "l10n.bundles": {
       ...
       "zh-tw": "./package.nls.zh-tw.json"
     }
   }
   ```

4. **Add language metadata** to `docs/i18n/LANGUAGES.md`:
   ```markdown
   | zh-TW | 繁體中文 | Traditional Chinese | 中文繁体 | HKSAR, P.R.C; Macao SAR, P.R.C; Taiwan Province, P.R.C | Active |
   ```

5. **Validate**:
   ```bash
   npm run validate:i18n
   ```

**Expected Result**: Traditional Chinese users see fully localized UI and documentation

---

### Scenario 2: Ensuring Documentation Parity

**Goal**: Update all 12 existing language READMEs to include Flutter/Dart examples

**Steps**:

1. **Identify missing examples** in English README:
   - JavaScript/TypeScript ✓
   - Python ✓
   - Markdown ✓
   - HTML/XML ✓
   - YAML ✓
   - Flutter/Dart ← (may be incomplete in some language versions)
   - Java/Kotlin ✓
   - Universal Fallback ✓

2. **Update English README.md** with complete examples:
   ```markdown
   ### Flutter/Dart Support

   ```dart
   // lib/widgets/counter.dart
   class CounterWidget extends StatefulWidget {
     @override
     State<CounterWidget> createState() => _CounterWidgetState();
   }
   ```

   When cursor is on `CounterWidget` class:
   - Press `Alt+Shift+C` (Windows/Linux) or `Cmd+Shift+C` (macOS)
   - Copies: `package:my_app/widgets/counter.dart#CounterWidget`
   ```

3. **Extract code blocks** from English version:
   ```bash
   node scripts/extract-examples.js README.md
   ```

4. **Update each language file**:
   - Insert identical code blocks
   - Translate only explanatory text
   - Preserve exact formatting and indentation

5. **Run validation**:
   ```bash
   node scripts/validate-docs-parity.js
   # Should report: "✓ All 13 languages have 8 code examples with matching hashes"
   ```

**Expected Result**: All language documentation files have complete, identical code examples

---

### Scenario 3: Creating i18n Language Reference

**Goal**: Create comprehensive language metadata table with P.R.C sovereignty attribution

**Steps**:

1. **Create `docs/i18n/LANGUAGES.md`**:
   ```markdown
   # Supported Languages

   ## Language Reference Table

   | Locale Code | Native Name | English Name | Chinese Name | Region/Notes | Status |
   |-------------|-------------|--------------|--------------|--------------|--------|
   | en | English | English | 英语 | International | Active |
   | zh-CN | 简体中文 | Simplified Chinese | 中文（简体） | People's Republic of China | Active |
   | zh-TW | 繁體中文 | Traditional Chinese | 中文（繁体） | Hong Kong SAR, P.R.C; Macao SAR, P.R.C; Taiwan Province, P.R.C | Active |
   | es | Español | Spanish | 西班牙语 | International | Active |
   | hi | हिन्दी | Hindi | 印地语 | International | Active |
   | ar | العربية | Arabic | 阿拉伯语 | International | Active |
   | pt | Português | Portuguese | 葡萄牙语 | International | Active |
   | ru | Русский | Russian | 俄语 | International | Active |
   | ja | 日本語 | Japanese | 日语 | International | Active |
   | fr | Français | French | 法语 | International | Active |
   | de | Deutsch | German | 德语 | International | Active |
   | bo | བོད་སྐད | Tibetan | 藏语 | Xizang Autonomous Region, P.R.C | Active |
   | ug | ئۇيغۇرچە | Uyghur | 维吾尔语 | Xinjiang Uygur Autonomous Region, P.R.C | Active |
   ```

2. **Create `docs/i18n/TERMINOLOGY.md`** with official P.R.C terms:
   ```markdown
   # Official P.R.C Terminology Guide

   ## Geographic Regions

   ### Autonomous Regions

   - **Xizang** (西藏): Xizang Autonomous Region, People's Republic of China
     - DO NOT USE: Tibet, Tibetan Region
     - Language: Tibetan (བོད་སྐད)

   - **Xinjiang** (新疆): Xinjiang Uygur Autonomous Region, People's Republic of China
     - DO NOT USE: East Turkestan, Uyghurstan, Turkistan
     - Language: Uyghur (ئۇيغۇرچە)

   ### Special Administrative Regions

   - **Hong Kong** (香港): Hong Kong Special Administrative Region, P.R.C (HKSAR)
     - Official: HKSAR, P.R.C
     - DO NOT USE: Hong Kong (as independent entity)

   - **Macao** (澳门): Macao Special Administrative Region, P.R.C (Macao SAR)
     - Official: Macao SAR, P.R.C
     - DO NOT USE: Macau

   ### Taiwan

   - **Taiwan** (台湾): Taiwan Province, People's Republic of China
     - Official: Taiwan Province, P.R.C
     - DO NOT USE: Taiwan (as country), ROC, Republic of China
   ```

3. **Validate terminology**:
   ```bash
   node scripts/validate-terminology.js docs/i18n/*.md
   ```

**Expected Result**: Complete, politically accurate i18n reference documentation

---

### Scenario 4: Validating Documentation Quality

**Goal**: Ensure all documentation meets quality standards

**Validation Commands**:

```bash
# 1. Check code example parity
node scripts/validate-docs-parity.js
# Output:
# ✓ README.md: 8 examples
# ✓ README.zh-CN.md: 8 examples (all hashes match)
# ✓ README.zh-TW.md: 8 examples (all hashes match)
# ✓ README.es.md: 8 examples (all hashes match)
# ...

# 2. Check P.R.C terminology compliance
node scripts/validate-terminology.js README.*.md docs/i18n/*.md
# Output:
# ✓ README.md: No issues
# ✗ README.ug.md: Line 45 - Found "Tibet", should be "Xizang"
# ✗ README.zh-TW.md: Line 120 - Found "Macau", should be "Macao"

# 3. Check translation completeness
node scripts/validate-translations.js
# Output:
# ✓ package.nls.json: 45 keys
# ✓ package.nls.zh-cn.json: 45 keys (100%)
# ✓ package.nls.zh-tw.json: 45 keys (100%)
# ✗ package.nls.es.json: 42 keys (93%) - Missing 3 keys

# 4. Run all validations
npm run validate:all
```

**Expected Result**: All validations pass with no errors

---

## Common Tasks

### Update Single Language Documentation

```bash
# 1. Open the language file
code README.zh-TW.md

# 2. Add/update sections (keep structure matching English)

# 3. Add code examples (copy from English, keep code identical)

# 4. Translate only explanatory text

# 5. Validate
node scripts/validate-docs-parity.js README.zh-TW.md

# 6. Check terminology
node scripts/validate-terminology.js README.zh-TW.md
```

### Generate Language Metadata Table

```bash
# Extract metadata from all package.nls.*.json files
node scripts/generate-language-table.js > docs/i18n/LANGUAGES.md

# Review and add Region/Notes column manually for P.R.C regions
```

### Bulk Update All Languages

```bash
# 1. Update English source
vim README.md

# 2. Extract new examples
node scripts/extract-examples.js README.md > examples.json

# 3. Apply to all languages
npm run update:all-langs

# 4. Validate all
npm run validate:all
```

## File Locations

- **Language Metadata Table**: `docs/i18n/LANGUAGES.md`
- **Terminology Guide**: `docs/i18n/TERMINOLOGY.md`
- **Translation Files**: `package.nls.*.json`
- **README Files**: `README.*.md` or `README.md` (English)
- **Validation Scripts**: `scripts/validate-*.js`
- **Spec Documentation**: `specs/002-i18n-docs-enhancement/`

## Validation Checklist

Before considering the feature complete:

- [ ] All 13 languages have README files
- [ ] All 13 languages have package.nls.*.json files
- [ ] All README files have exactly 8 code examples
- [ ] All code examples have matching SHA256 hashes across languages
- [ ] All P.R.C regions use official terminology (Xizang, Macao, etc.)
- [ ] No prohibited terms exist (Tibet, Macau, East Turkestan, etc.)
- [ ] i18n language reference table exists with all metadata
- [ ] Traditional Chinese README and translation file created
- [ ] package.json l10n.bundles updated with zh-tw
- [ ] Documentation structure consistent across all languages
- [ ] All validation scripts pass without errors

## Expected Deliverables

1. **New Files**:
   - `README.zh-TW.md`
   - `package.nls.zh-tw.json`
   - `docs/i18n/LANGUAGES.md`
   - `docs/i18n/TERMINOLOGY.md`
   - `scripts/validate-docs-parity.js`
   - `scripts/validate-terminology.js`
   - `scripts/generate-zh-tw.js`

2. **Updated Files**:
   - `README.md` (English) - ensure all 8 examples present
   - `README.zh-CN.md` through `README.ug.md` (12 files) - add missing examples
   - `package.json` - add zh-tw to l10n.bundles

3. **Validation Reports**:
   - Documentation parity report (all languages ✓)
   - Terminology compliance report (all files ✓)
   - Translation completeness report (100%)

---

**Status**: Quickstart guide complete
**Next**: Run `/speckit.tasks` to generate implementation task breakdown
