#!/usr/bin/env node
/**
 * Code Example Extractor
 *
 * Extracts all code blocks from a markdown file and outputs as JSON.
 * Useful for maintaining consistency across multilingual documentation.
 *
 * Usage: node scripts/extract-examples.js <markdown-file>
 * Output: JSON array of code examples
 */

const fs = require('fs');
const crypto = require('crypto');

/**
 * Extract code blocks with context
 */
function extractExamples(content) {
    const examples = [];
    const lines = content.split('\n');
    let currentExample = null;
    let inCodeBlock = false;
    let codeLines = [];
    let precedingText = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Detect code block start
        const codeBlockStart = line.match(/^```(\w+)?$/);
        if (codeBlockStart && !inCodeBlock) {
            inCodeBlock = true;
            const language = codeBlockStart[1] || 'plaintext';

            // Capture preceding explanatory text (last 5 non-empty lines before code block)
            const explanation = precedingText
                .filter(l => l.trim().length > 0)
                .slice(-5)
                .join('\n');

            currentExample = {
                language,
                explanation: explanation.trim(),
                startLine: i + 1
            };

            codeLines = [];
            continue;
        }

        // Detect code block end
        if (line.match(/^```$/) && inCodeBlock) {
            inCodeBlock = false;

            const code = codeLines.join('\n').trim();
            const hash = crypto.createHash('sha256')
                .update(code.replace(/\r\n/g, '\n'), 'utf8')
                .digest('hex');

            // Determine category based on language and content
            let category = 'Unknown';
            if (currentExample.language === 'javascript' || currentExample.language === 'typescript') {
                category = 'JavaScript/TypeScript';
                if (code.includes('React') || code.includes('jsx') || code.includes('useState')) {
                    category = 'JavaScript/TypeScript (React)';
                }
            } else if (currentExample.language === 'python') {
                category = 'Python';
            } else if (currentExample.language === 'dart') {
                category = 'Flutter/Dart';
            } else if (currentExample.language === 'java' || currentExample.language === 'kotlin') {
                category = 'Java/Kotlin';
            } else if (currentExample.language === 'markdown') {
                category = 'Markdown';
            } else if (currentExample.language === 'html' || currentExample.language === 'xml') {
                category = 'HTML/XML';
            } else if (currentExample.language === 'yaml' || currentExample.language === 'yml') {
                category = 'YAML';
            } else if (code.includes(':line:column')) {
                category = 'Universal Fallback';
            }

            examples.push({
                id: `example-${currentExample.language}-${examples.length + 1}`,
                language: currentExample.language,
                category,
                code,
                hash,
                explanation: currentExample.explanation,
                startLine: currentExample.startLine,
                endLine: i + 1
            });

            currentExample = null;
            codeLines = [];
            precedingText = [];
            continue;
        }

        // Accumulate code lines
        if (inCodeBlock) {
            codeLines.push(line);
        } else {
            // Track preceding text for context
            precedingText.push(line);
            if (precedingText.length > 10) {
                precedingText.shift();
            }
        }
    }

    return examples;
}

/**
 * Main function
 */
function main() {
    const files = process.argv.slice(2);

    if (files.length === 0) {
        console.error('Usage: node extract-examples.js <markdown-file>');
        process.exit(1);
    }

    const filePath = files[0];

    if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found: ${filePath}`);
        process.exit(1);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const examples = extractExamples(content);

    // Output as JSON
    console.log(JSON.stringify(examples, null, 2));

    // Stats to stderr
    console.error(`\nExtracted ${examples.length} code examples from ${filePath}`);
    const categories = {};
    examples.forEach(ex => {
        categories[ex.category] = (categories[ex.category] || 0) + 1;
    });
    console.error('Categories:');
    Object.entries(categories).forEach(([cat, count]) => {
        console.error(`  ${cat}: ${count}`);
    });
}

if (require.main === module) {
    main();
}

module.exports = { extractExamples };
