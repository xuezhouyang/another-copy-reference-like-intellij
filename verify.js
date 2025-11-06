// Simple verification script for the Copy Reference extension
const fs = require('fs');
const path = require('path');

console.log('=== Copy Reference Extension Verification ===\n');

// Check compiled output exists
console.log('1. Checking compiled output...');
const outputFiles = [
    'out/extension.js',
    'out/handlers/javascript.js',
    'out/handlers/python.js',
    'out/handlers/markdown.js',
    'out/handlers/html.js',
    'out/handlers/yaml.js',
    'out/handlers/universal.js',
    'out/utils/telemetry.js',
    'out/utils/cache.js',
    'out/utils/benchmarks.js'
];

let allFilesExist = true;
for (const file of outputFiles) {
    if (fs.existsSync(file)) {
        console.log(`   ✓ ${file}`);
    } else {
        console.log(`   ✗ ${file} - MISSING`);
        allFilesExist = false;
    }
}

console.log('\n2. Checking package.json configuration...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Check new configuration settings
const requiredSettings = [
    'copyReference.includeLineNumbers',
    'copyReference.preferShortPaths',
    'copyReference.useFrameworkDetection',
    'copyReference.cache.enabled',
    'copyReference.cache.maxSize',
    'copyReference.cache.ttl',
    'copyReference.cache.evictionStrategy',
    'copyReference.cache.maxMemoryMB',
    'copyReference.telemetry.enabled'
];

const properties = packageJson.contributes.configuration.properties;
let allSettingsPresent = true;

for (const setting of requiredSettings) {
    if (properties[setting]) {
        console.log(`   ✓ ${setting}`);
    } else {
        console.log(`   ✗ ${setting} - MISSING`);
        allSettingsPresent = false;
    }
}

console.log('\n3. Checking localization strings...');
const nlsJson = JSON.parse(fs.readFileSync('package.nls.json', 'utf8'));
const requiredStrings = [
    'configuration.cache.evictionStrategy.description',
    'configuration.cache.maxMemoryMB.description',
    'configuration.telemetry.enabled.description'
];

let allStringsPresent = true;
for (const str of requiredStrings) {
    if (nlsJson[str]) {
        console.log(`   ✓ ${str}`);
    } else {
        console.log(`   ✗ ${str} - MISSING`);
        allStringsPresent = false;
    }
}

console.log('\n4. Checking new features integration...');

// Check telemetry integration
const extensionJs = fs.readFileSync('out/extension.js', 'utf8');
const hasTelemetry = extensionJs.includes('TelemetryReporter');
console.log(`   ${hasTelemetry ? '✓' : '✗'} Telemetry integration`);

// Check cache eviction strategies
const cacheJs = fs.readFileSync('out/utils/cache.js', 'utf8');
const hasEvictionStrategies = cacheJs.includes('EvictionStrategy');
console.log(`   ${hasEvictionStrategies ? '✓' : '✗'} Cache eviction strategies`);

// Check benchmarks
const hasBenchmarks = fs.existsSync('out/utils/benchmarks.js');
console.log(`   ${hasBenchmarks ? '✓' : '✗'} Performance benchmarks`);

console.log('\n5. Summary:');
const allPassed = allFilesExist && allSettingsPresent && allStringsPresent &&
                  hasTelemetry && hasEvictionStrategies && hasBenchmarks;

if (allPassed) {
    console.log('   ✅ All verification checks passed!');
    console.log('   The extension has been successfully enhanced with:');
    console.log('   - Telemetry for usage tracking');
    console.log('   - Configuration UI settings');
    console.log('   - Optimized cache eviction strategies');
    console.log('   - Performance benchmarking capabilities');
} else {
    console.log('   ⚠️  Some checks failed. Please review the output above.');
}

console.log('\n=== Verification Complete ===');