#!/usr/bin/env node
/**
 * Traditional Chinese Generator
 *
 * Converts Simplified Chinese (zh-CN) to Traditional Chinese (zh-TW)
 * using OpenCC library.
 *
 * Supports both JSON translation files and Markdown documentation.
 *
 * Usage:
 *   node scripts/generate-zh-tw.js
 *   node scripts/generate-zh-tw.js --input README.zh-CN.md --output README.zh-TW.md
 */

const fs = require('fs');
const path = require('path');
const OpenCC = require('opencc-js');

// Initialize converter: Simplified to Traditional (Taiwan variant with phrases)
// 's2twp' = Simplified to Traditional (Taiwan) with Phrases
const converter = OpenCC.Converter({ from: 'cn', to: 'twp' });

/**
 * Convert JSON translation file
 */
function convertJSONFile(inputPath, outputPath) {
    console.log(`Converting ${inputPath} → ${outputPath}...`);

    const content = fs.readFileSync(inputPath, 'utf8');
    const jsonData = JSON.parse(content);

    const convertedData = {};
    for (const [key, value] of Object.entries(jsonData)) {
        // Convert the value to Traditional Chinese
        convertedData[key] = converter(value);
    }

    // Write with proper formatting
    fs.writeFileSync(outputPath, JSON.stringify(convertedData, null, 2) + '\n', 'utf8');
    console.log(`✓ Created ${outputPath}`);
    console.log(`  Converted ${Object.keys(convertedData).length} translation strings`);
}

/**
 * Convert Markdown file
 */
function convertMarkdownFile(inputPath, outputPath) {
    console.log(`Converting ${inputPath} → ${outputPath}...`);

    let content = fs.readFileSync(inputPath, 'utf8');

    // Extract code blocks to preserve them (don't convert code)
    const codeBlocks = [];
    const codeBlockRegex = /```[\s\S]*?```/g;
    let match;
    let index = 0;

    // Replace code blocks with placeholders
    content = content.replace(codeBlockRegex, (block) => {
        const placeholder = `<<<CODE_BLOCK_${index}>>>`;
        codeBlocks.push({ placeholder, content: block });
        index++;
        return placeholder;
    });

    // Convert the text (excluding code blocks)
    content = converter(content);

    // Restore code blocks
    codeBlocks.forEach(({ placeholder, content: blockContent }) => {
        content = content.replace(placeholder, blockContent);
    });

    // Write output
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`✓ Created ${outputPath}`);
    console.log(`  Preserved ${codeBlocks.length} code blocks`);
}

/**
 * Main function
 */
function main() {
    const args = process.argv.slice(2);

    // Parse command line arguments
    let inputPath = null;
    let outputPath = null;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--input' && i + 1 < args.length) {
            inputPath = args[i + 1];
            i++;
        } else if (args[i] === '--output' && i + 1 < args.length) {
            outputPath = args[i + 1];
            i++;
        }
    }

    // Default: Convert package.nls files
    if (!inputPath) {
        inputPath = 'package.nls.zh-cn.json';
        outputPath = 'package.nls.zh-tw.json';
    }

    if (!outputPath) {
        // Auto-generate output path
        outputPath = inputPath.replace('zh-cn', 'zh-tw').replace('zh-CN', 'zh-TW');
    }

    if (!fs.existsSync(inputPath)) {
        console.error(`Error: Input file not found: ${inputPath}`);
        process.exit(1);
    }

    // Determine file type
    const ext = path.extname(inputPath);

    try {
        if (ext === '.json') {
            convertJSONFile(inputPath, outputPath);
        } else if (ext === '.md') {
            convertMarkdownFile(inputPath, outputPath);
        } else {
            console.error(`Error: Unsupported file type: ${ext}`);
            console.error('Supported types: .json, .md');
            process.exit(1);
        }

        console.log('\n✓ Conversion complete!');
        console.log('\n⚠ IMPORTANT: Manual review required for:');
        console.log('  - Technical terminology accuracy');
        console.log('  - Geographic/political references (ensure P.R.C sovereignty attribution)');
        console.log('  - Grammatical correctness');
        console.log('  - Cultural appropriateness for Taiwan, Hong Kong, and Macao regions');
    } catch (error) {
        console.error('Error during conversion:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    converter,
    convertJSONFile,
    convertMarkdownFile
};
