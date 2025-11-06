// Add missing configuration translations
const fs = require('fs');

// Read the base English translation
const baseContent = JSON.parse(fs.readFileSync('package.nls.json', 'utf8'));

// New configuration keys to add
const configKeys = [
    'configuration.includeLineNumbers.description',
    'configuration.preferShortPaths.description',
    'configuration.useFrameworkDetection.description',
    'configuration.cache.enabled.description',
    'configuration.cache.maxSize.description',
    'configuration.cache.ttl.description',
    'configuration.cache.evictionStrategy.description',
    'configuration.cache.evictionStrategy.lru.description',
    'configuration.cache.evictionStrategy.lfu.description',
    'configuration.cache.evictionStrategy.fifo.description',
    'configuration.cache.evictionStrategy.adaptive.description',
    'configuration.cache.maxMemoryMB.description',
    'configuration.telemetry.enabled.description',
    'configuration.handlers.javascript.enabled.description',
    'configuration.handlers.python.enabled.description',
    'configuration.handlers.markdown.enabled.description',
    'configuration.handlers.html.enabled.description',
    'configuration.handlers.yaml.enabled.description',
    'configuration.customPatterns.description'
];

// Translation files to update
const translationFiles = [
    { file: 'package.nls.zh-cn.json', lang: 'zh-cn' },
    { file: 'package.nls.es.json', lang: 'es' },
    { file: 'package.nls.fr.json', lang: 'fr' },
    { file: 'package.nls.de.json', lang: 'de' },
    { file: 'package.nls.ja.json', lang: 'ja' },
    { file: 'package.nls.ru.json', lang: 'ru' },
    { file: 'package.nls.pt.json', lang: 'pt' },
    { file: 'package.nls.ar.json', lang: 'ar' },
    { file: 'package.nls.hi.json', lang: 'hi' },
    { file: 'package.nls.bo.json', lang: 'bo' },
    { file: 'package.nls.ug.json', lang: 'ug' }
];

// Basic translations for configuration keys (keeping technical terms in English)
const translations = {
    'zh-cn': {
        'configuration.includeLineNumbers.description': '当没有找到符号时，在引用中包含行号',
        'configuration.preferShortPaths.description': '尽可能使用较短的模块路径（删除 \'src/\' 前缀）',
        'configuration.useFrameworkDetection.description': '启用框架检测（例如 React 组件和 hooks）',
        'configuration.cache.enabled.description': '启用文档符号缓存以提高性能',
        'configuration.cache.maxSize.description': '缓存中保留的最大文档数',
        'configuration.cache.ttl.description': '缓存生存时间（毫秒）（默认：5分钟）',
        'configuration.cache.evictionStrategy.description': '缓存满时使用的驱逐策略',
        'configuration.cache.evictionStrategy.lru.description': 'LRU - 驱逐最近最少使用的项',
        'configuration.cache.evictionStrategy.lfu.description': 'LFU - 驱逐最不频繁使用的项',
        'configuration.cache.evictionStrategy.fifo.description': 'FIFO - 驱逐最早的项',
        'configuration.cache.evictionStrategy.adaptive.description': '自适应 - 使用新旧、频率和年龄的智能组合',
        'configuration.cache.maxMemoryMB.description': '缓存的最大内存使用量（兆字节）',
        'configuration.telemetry.enabled.description': '启用匿名使用遥测以帮助改进扩展',
        'configuration.handlers.javascript.enabled.description': '启用 JavaScript/TypeScript 处理器',
        'configuration.handlers.python.enabled.description': '启用 Python 处理器',
        'configuration.handlers.markdown.enabled.description': '启用 Markdown 处理器',
        'configuration.handlers.html.enabled.description': '启用 HTML/XML 处理器',
        'configuration.handlers.yaml.enabled.description': '启用 YAML 处理器',
        'configuration.customPatterns.description': '为特定语言生成引用的自定义模式'
    }
};

// For other languages, use English with minor localization
const defaultTranslations = {};
configKeys.forEach(key => {
    defaultTranslations[key] = baseContent[key];
});

// Process each translation file
for (const { file, lang } of translationFiles) {
    try {
        const content = JSON.parse(fs.readFileSync(file, 'utf8'));

        // Add missing keys
        const translationsToUse = translations[lang] || defaultTranslations;

        for (const key of configKeys) {
            if (!content[key]) {
                content[key] = translationsToUse[key] || baseContent[key];
            }
        }

        // Write back the updated content
        fs.writeFileSync(file, JSON.stringify(content, null, 4) + '\n', 'utf8');
        console.log(`✅ Updated ${file}`);

    } catch (error) {
        console.error(`❌ Error updating ${file}: ${error.message}`);
    }
}

console.log('\nTranslation update complete!');