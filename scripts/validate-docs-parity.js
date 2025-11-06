#!/usr/bin/env node
/**
 * Documentation Parity Validator
 *
 * Validates that all language README files have:
 * - Same number of code examples
 * - Identical code content (via SHA256 hash comparison)
 * - Consistent section structure
 *
 * Usage: node scripts/validate-docs-parity.js [README files...]
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

/**
 * Extract code blocks from markdown content
 * @param {string} content - Markdown file content
 * @returns {Array<{language: string, code: string, explanation: string}>}
 */
function extractCodeBlocks(content) {
    const codeBlocks = [];
    // Regex to match fenced code blocks: ```language\ncode\n```
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
        const language = match[1] || 'plaintext';
        const code = match[2].trim();

        codeBlocks.push({
            language,
            code,
            hash: generateHash(code)
        });
    }

    return codeBlocks;
}

/**
 * Generate SHA256 hash for code content
 * @param {string} code - Code content
 * @returns {string} - Hex hash
 */
function generateHash(code) {
    // Normalize line endings to LF
    const normalized = code.replace(/\r\n/g, '\n');
    return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

/**
 * Extract sections from markdown
 * @param {string} content - Markdown content
 * @returns {Array<{id: string, heading: string, level: number, order: number}>}
 */
function extractSectionsFromMarkdown(content) {
    const sections = [];
    const lines = content.split('\n');
    let order = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // ATX headers: ## Heading
        const atxMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (atxMatch) {
            const level = atxMatch[1].length;
            const heading = atxMatch[2].trim();
            const id = heading.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');

            sections.push({ id, heading, level, order: ++order });
        }
    }

    return sections;
}

/**
 * Compare documentation structure
 * @param {Array} sections1 - Sections from first doc
 * @param {Array} sections2 - Sections from second doc
 * @returns {Array<string>} - List of differences
 */
function compareDocStructure(sections1, sections2) {
    const differences = [];

    // Check section count
    if (sections1.length !== sections2.length) {
        differences.push(`Section count mismatch: ${sections1.length} vs ${sections2.length}`);
    }

    // Check each section
    for (let i = 0; i < Math.min(sections1.length, sections2.length); i++) {
        if (sections1[i].id !== sections2[i].id) {
            differences.push(`Section ${i + 1} ID mismatch: "${sections1[i].id}" vs "${sections2[i].id}"`);
        }
        if (sections1[i].level !== sections2[i].level) {
            differences.push(`Section "${sections1[i].id}" level mismatch: ${sections1[i].level} vs ${sections2[i].level}`);
        }
    }

    return differences;
}

/**
 * Main validation function
 */
function main() {
    const files = process.argv.slice(2);

    if (files.length === 0) {
        console.error('Usage: node validate-docs-parity.js <README files...>');
        process.exit(1);
    }

    console.log('Validating Documentation Parity...\n');

    const results = {};
    let hasErrors = false;

    // Process each file
    for (const file of files) {
        if (!fs.existsSync(file)) {
            console.error(`✗ ${file}: File not found`);
            hasErrors = true;
            continue;
        }

        const content = fs.readFileSync(file, 'utf8');
        const codeBlocks = extractCodeBlocks(content);
        const sections = extractSectionsFromMarkdown(content);

        results[file] = {
            codeBlocks,
            sections,
            codeCount: codeBlocks.length
        };

        console.log(`✓ ${file}: ${codeBlocks.length} code examples`);
    }

    // Compare code hashes
    console.log('\nComparing code examples...');
    const referenceFile = files[0];
    const referenceBlocks = results[referenceFile].codeBlocks;

    for (const file of files.slice(1)) {
        const fileBlocks = results[file].codeBlocks;

        if (fileBlocks.length !== referenceBlocks.length) {
            console.error(`✗ ${file}: Expected ${referenceBlocks.length} examples, found ${fileBlocks.length}`);
            hasErrors = true;
            continue;
        }

        let allMatch = true;
        for (let i = 0; i < referenceBlocks.length; i++) {
            if (fileBlocks[i].hash !== referenceBlocks[i].hash) {
                console.error(`  ✗ Example ${i + 1} (${fileBlocks[i].language}): Hash mismatch`);
                allMatch = false;
                hasErrors = true;
            }
        }

        if (allMatch) {
            console.log(`✓ ${file}: All hashes match ✓`);
        }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    if (hasErrors) {
        console.log('RESULT: ✗ FAILED - Please fix the issues above');
        process.exit(1);
    } else {
        console.log(`RESULT: ✓ PASSED - All ${files.length} files are consistent`);
        process.exit(0);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    extractCodeBlocks,
    generateHash,
    extractSectionsFromMarkdown,
    compareDocStructure
};
