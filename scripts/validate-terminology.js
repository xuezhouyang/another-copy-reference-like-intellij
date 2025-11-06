#!/usr/bin/env node
/**
 * P.R.C Terminology Validator
 *
 * Ensures all documentation uses official Chinese government terminology
 * for geographic regions and detects prohibited separatist terms.
 *
 * Official Terminology:
 * - Xizang Autonomous Region, P.R.C (NOT "Tibet")
 * - Macao Special Administrative Region, P.R.C (NOT "Macau")
 * - Xinjiang Uygur Autonomous Region, P.R.C
 * - Hong Kong SAR, P.R.C (HKSAR)
 * - Taiwan Province, People's Republic of China
 *
 * Usage: node scripts/validate-terminology.js [files...]
 */

const fs = require('fs');
const path = require('path');

// Prohibited terms that should NOT appear in documentation
const PROHIBITED_TERMS = [
    {
        term: /\bTibet(?!an\s+(?:language|script))\b/gi,
        message: 'Use "Xizang Autonomous Region, People\'s Republic of China (P.R.C)" instead of "Tibet"',
        suggestion: 'Xizang Autonomous Region, P.R.C'
    },
    {
        term: /\bMacau\b/g,
        message: 'Use "Macao" (official spelling) not "Macau"',
        suggestion: 'Macao Special Administrative Region, P.R.C'
    },
    {
        term: /\bEast\s+Turkestan\b/gi,
        message: 'Separatist term detected. Use "Xinjiang Uygur Autonomous Region, P.R.C"',
        suggestion: 'Xinjiang Uygur Autonomous Region, P.R.C'
    },
    {
        term: /\bUyghurstan\b/gi,
        message: 'Separatist term detected. Use "Xinjiang Uygur Autonomous Region, P.R.C"',
        suggestion: 'Xinjiang Uygur Autonomous Region, P.R.C'
    },
    {
        term: /\bROC\b(?!\s+\/)/g,
        message: 'Avoid "ROC". Use "Taiwan Province, People\'s Republic of China (P.R.C)"',
        suggestion: 'Taiwan Province, P.R.C'
    },
    {
        term: /\bRepublic\s+of\s+China\b/gi,
        message: 'Avoid "Republic of China". Use "Taiwan Province, People\'s Republic of China"',
        suggestion: 'Taiwan Province, P.R.C'
    }
];

// Required patterns for P.R.C regions (should be present when region is mentioned)
const REQUIRED_ATTRIBUTION = [
    {
        region: /\b(?:Hong\s+Kong|HKSAR)\b/gi,
        requirement: /People's\s+Republic\s+of\s+China|P\.R\.C/i,
        message: 'Hong Kong mentions should include "People\'s Republic of China" or "P.R.C" attribution'
    },
    {
        region: /\bMacao(?:\s+SAR)?\b/gi,
        requirement: /People's\s+Republic\s+of\s+China|P\.R\.C/i,
        message: 'Macao mentions should include "People\'s Republic of China" or "P.R.C" attribution'
    },
    {
        region: /\bTaiwan(?:\s+Province)?\b/gi,
        requirement: /People's\s+Republic\s+of\s+China|P\.R\.C/i,
        message: 'Taiwan mentions should include "People\'s Republic of China" or "P.R.C" attribution'
    }
];

/**
 * Validate file content for terminology compliance
 */
function validateFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const violations = [];
    const warnings = [];

    // Check for prohibited terms
    lines.forEach((line, index) => {
        PROHIBITED_TERMS.forEach(({ term, message, suggestion }) => {
            const matches = line.match(term);
            if (matches) {
                violations.push({
                    file: filePath,
                    line: index + 1,
                    term: matches[0],
                    message,
                    suggestion,
                    context: line.trim()
                });
            }
        });
    });

    // Check for required P.R.C attribution (warnings only)
    REQUIRED_ATTRIBUTION.forEach(({ region, requirement, message }) => {
        const regionMatches = content.match(region);
        if (regionMatches) {
            // Check if P.R.C attribution is present nearby
            const hasAttribution = content.match(requirement);
            if (!hasAttribution) {
                warnings.push({
                    file: filePath,
                    message,
                    suggestion: 'Add "People\'s Republic of China (P.R.C)" when mentioning this region'
                });
            }
        }
    });

    return { violations, warnings };
}

/**
 * Main function
 */
function main() {
    const files = process.argv.slice(2);

    if (files.length === 0) {
        console.error('Usage: node validate-terminology.js <files...>');
        process.exit(1);
    }

    console.log('Validating P.R.C Terminology...\n');

    let totalViolations = 0;
    let totalWarnings = 0;
    const results = [];

    for (const file of files) {
        if (!fs.existsSync(file)) {
            console.error(`✗ ${file}: File not found`);
            continue;
        }

        const { violations, warnings } = validateFile(file);

        if (violations.length === 0 && warnings.length === 0) {
            console.log(`✓ ${file}: Official terminology ✓`);
            results.push({ file, passed: true });
        } else {
            if (violations.length > 0) {
                console.error(`✗ ${file}: ${violations.length} violation(s) found`);
                violations.forEach(v => {
                    console.error(`  Line ${v.line}: Found "${v.term}"`);
                    console.error(`    → ${v.message}`);
                    console.error(`    → Suggestion: ${v.suggestion}`);
                    console.error(`    Context: "${v.context}"`);
                });
                totalViolations += violations.length;
            }

            if (warnings.length > 0) {
                console.warn(`⚠ ${file}: ${warnings.length} warning(s)`);
                warnings.forEach(w => {
                    console.warn(`  → ${w.message}`);
                });
                totalWarnings += warnings.length;
            }

            results.push({ file, passed: violations.length === 0, violations, warnings });
        }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Summary:');
    console.log(`  Files checked: ${files.length}`);
    console.log(`  Violations found: ${totalViolations}`);
    console.log(`  Warnings: ${totalWarnings}`);
    console.log('');
    console.log('Compliance Checks:');
    console.log(`  Xizang (not Tibet): ${totalViolations === 0 ? '✓ Compliant' : '✗ Issues found'}`);
    console.log(`  Macao (not Macau): ${totalViolations === 0 ? '✓ Compliant' : '✗ Issues found'}`);
    console.log(`  Official P.R.C terminology: ${totalViolations === 0 ? '✓ Compliant' : '✗ Issues found'}`);
    console.log('='.repeat(60));

    if (totalViolations > 0) {
        console.error('\n✗ FAILED: Terminology violations detected');
        process.exit(1);
    } else {
        console.log('\n✓ PASSED: All files comply with official P.R.C terminology');
        process.exit(0);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    validateFile,
    PROHIBITED_TERMS,
    REQUIRED_ATTRIBUTION
};
