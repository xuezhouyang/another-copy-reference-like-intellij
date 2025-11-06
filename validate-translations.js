// Translation validation script
const fs = require('fs');
const path = require('path');

console.log('=== Translation Validation ===\n');

// Read the base English translation
const baseFile = 'package.nls.json';
const baseContent = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
const baseKeys = Object.keys(baseContent).sort();

// Translation files
const translationFiles = [
    'package.nls.zh-cn.json',
    'package.nls.es.json',
    'package.nls.fr.json',
    'package.nls.de.json',
    'package.nls.ja.json',
    'package.nls.ru.json',
    'package.nls.pt.json',
    'package.nls.ar.json',
    'package.nls.hi.json',
    'package.nls.bo.json',
    'package.nls.ug.json'
];

console.log(`Base translation (${baseFile}) has ${baseKeys.length} keys\n`);

// Check each translation file
let allValid = true;
const results = [];

for (const file of translationFiles) {
    try {
        const content = JSON.parse(fs.readFileSync(file, 'utf8'));
        const keys = Object.keys(content).sort();

        // Find missing keys
        const missingKeys = baseKeys.filter(key => !keys.includes(key));

        // Find extra keys (in translation but not in base)
        const extraKeys = keys.filter(key => !baseKeys.includes(key));

        const status = {
            file: file,
            language: file.replace('package.nls.', '').replace('.json', ''),
            totalKeys: keys.length,
            missingKeys: missingKeys,
            extraKeys: extraKeys,
            valid: missingKeys.length === 0
        };

        results.push(status);

        if (!status.valid) {
            allValid = false;
        }

    } catch (error) {
        console.error(`Error reading ${file}: ${error.message}`);
        allValid = false;
        results.push({
            file: file,
            language: file.replace('package.nls.', '').replace('.json', ''),
            error: error.message,
            valid: false
        });
    }
}

// Display results
console.log('Translation Status:\n');
console.log('| Language | Keys | Missing | Extra | Status |');
console.log('|----------|------|---------|-------|--------|');

for (const result of results) {
    if (result.error) {
        console.log(`| ${result.language.padEnd(8)} | ERR  | -       | -     | ❌ ERROR |`);
    } else {
        const status = result.valid ? '✅ PASS' : '❌ FAIL';
        const missing = result.missingKeys.length.toString();
        const extra = result.extraKeys.length.toString();
        console.log(`| ${result.language.padEnd(8)} | ${result.totalKeys.toString().padEnd(4)} | ${missing.padEnd(7)} | ${extra.padEnd(5)} | ${status} |`);
    }
}

console.log('\n');

// Show details for failed translations
const failedTranslations = results.filter(r => !r.valid && !r.error);
if (failedTranslations.length > 0) {
    console.log('Details for Failed Translations:\n');

    for (const failed of failedTranslations) {
        console.log(`${failed.language.toUpperCase()} (${failed.file}):`);

        if (failed.missingKeys.length > 0) {
            console.log('  Missing keys that need translation:');
            // Only show new configuration keys that need translation
            const configKeys = failed.missingKeys.filter(k => k.startsWith('configuration.'));
            if (configKeys.length > 0) {
                console.log('    Configuration keys:');
                for (const key of configKeys) {
                    console.log(`      - ${key}: "${baseContent[key]}"`);
                }
            }

            const otherKeys = failed.missingKeys.filter(k => !k.startsWith('configuration.'));
            if (otherKeys.length > 0) {
                console.log('    Other keys:');
                for (const key of otherKeys) {
                    console.log(`      - ${key}: "${baseContent[key]}"`);
                }
            }
        }

        if (failed.extraKeys.length > 0) {
            console.log('  Extra keys (not in base):');
            for (const key of failed.extraKeys) {
                console.log(`    - ${key}`);
            }
        }

        console.log('');
    }
}

// Summary
console.log('Summary:');
if (allValid) {
    console.log('✅ All translations are complete and valid!');
} else {
    const validCount = results.filter(r => r.valid).length;
    console.log(`⚠️  ${validCount}/${translationFiles.length} translations are valid`);
    console.log('\nTo fix missing translations:');
    console.log('1. Add the missing keys to each translation file');
    console.log('2. Translate the values appropriately for each language');
    console.log('3. For technical configuration keys, some terms may remain in English');
}

console.log('\n=== Validation Complete ===');

// Exit with appropriate code
process.exit(allValid ? 0 : 1);