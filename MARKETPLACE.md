# VS Code Marketplace Assets

## Extension Metadata

**Name**: Copy Reference (Multi-Language)
**Publisher**: xuezhouyang
**Category**: Other
**Tags**: copy, reference, intellij, java, kotlin, javascript, typescript, python, markdown, yaml, html, react, productivity

## Icon
- **File**: `images/icon.png`
- **Size**: 128x128 or 256x256 recommended
- **Status**: ✅ Exists

## Gallery Banner
```json
{
  "color": "#2196F3",
  "theme": "dark"
}
```

## Screenshots Required

### 1. Main Feature Demo (screenshot1.gif or .png)
**Title**: "Copy Reference in Action"
**Description**: Shows the extension being used across multiple file types
**Steps to capture**:
1. Open a JavaScript file with a class
2. Place cursor on method name
3. Press keyboard shortcut (Alt+Shift+C / Cmd+Shift+C)
4. Show notification with copied reference
5. Paste the reference to demonstrate format

### 2. Multi-Language Support (screenshot2.png)
**Title**: "Support for 8+ Languages"
**Description**: Grid showing reference formats for different languages:
- JavaScript: `module/path#ClassName.methodName`
- Python: `module.path.ClassName.method_name`
- Markdown: `docs/README.md#section-heading`
- HTML: `index.html#element-id`
- YAML: `config.yml#server.host.port`
- React: Component and hook detection

### 3. Configuration Options (screenshot3.png)
**Title**: "Extensive Configuration"
**Description**: VS Code Settings UI showing extension configuration:
- Cache settings (strategy, size, TTL)
- Handler enable/disable toggles
- Framework detection options
- Telemetry settings

### 4. Feedback System (screenshot4.png)
**Title**: "Built-in Feedback Collection"
**Description**: Show the feedback command palette with options:
- Report bug
- Suggest feature
- Rate extension
- Contact developer

### 5. Universal Fallback (screenshot5.png)
**Title**: "Works with Any File"
**Description**: Demonstrate fallback format for unsupported file types
- Show `.txt`, `.log`, or custom file
- Display `filepath:line:column` format

## Marketplace Description

### Short Description (max 200 chars)
"IntelliJ IDEA-style Copy Reference for VS Code. Supports JavaScript, TypeScript, Python, Markdown, HTML, YAML with React framework detection. Universal fallback ensures it works with any file."

### Full Description Template

```markdown
# Copy Reference - Multi-Language Support

Brings IntelliJ IDEA's powerful Copy Reference feature to VS Code with support for 8+ languages and frameworks.

## ✨ Features

- **🌍 Multi-Language Support**: JavaScript, TypeScript, Python, Markdown, HTML, XML, YAML, and more
- **⚛️ Framework Detection**: Automatically detects React components and hooks
- **🎯 Universal Fallback**: Works with ANY file type using `filepath:line:column` format
- **⚡ Lightning Fast**: Sub-100ms response time with intelligent caching
- **🌐 Internationalization**: Available in 12 languages
- **📊 Advanced Features**: Telemetry, feedback collection, performance benchmarks

## 📋 Supported Languages

| Language | Reference Format | Example |
|----------|-----------------|---------|
| JavaScript/TypeScript | Module path with symbols | `utils/helpers#StringHelper.format` |
| Python | Dot notation | `app.models.User.get_name` |
| Markdown | GitHub-style anchors | `README.md#installation` |
| HTML/XML | Element IDs | `index.html#header-nav` |
| YAML | Dot-path notation | `config.yml#database.host` |
| React | Component-aware | `components/Button#ButtonComponent` |
| Any other | Universal fallback | `file.ext:10:25` |

## ⌨️ Usage

1. Place your cursor on any symbol (class, method, function, heading, etc.)
2. Press:
   - **Windows/Linux**: `Alt+Shift+C`
   - **macOS**: `Cmd+Shift+C`
3. The reference is copied to your clipboard!

## ⚙️ Configuration

Extensive configuration options available in VS Code Settings:

- **Cache Management**: Choose between LRU, LFU, FIFO, or Adaptive eviction strategies
- **Performance Tuning**: Adjust cache size and TTL
- **Language Handlers**: Enable/disable specific language support
- **Framework Detection**: Toggle React/framework detection
- **Telemetry**: Opt-in usage analytics

## 🚀 Performance

- **Response Time**: < 100ms for 95% of operations
- **Memory Usage**: < 50MB even with large codebases
- **File Support**: Handles files up to 10,000 lines
- **Smart Caching**: Adaptive caching with multiple eviction strategies

## 🤝 Feedback

We value your feedback! Use the command palette:
- `Copy Reference: Provide Feedback` - Report bugs or suggest features
- Built-in GitHub integration for issue creation
- Direct email support available

## 📈 What's New in v1.0.0

- Added support for 8+ languages beyond Java/Kotlin
- React framework detection with component/hook awareness
- Advanced caching with 4 eviction strategies
- Comprehensive telemetry and feedback systems
- 12 language translations
- Performance benchmarking tools

## 🔄 Migration from Java/Kotlin Version

If you're upgrading from the original Java/Kotlin-only version:
1. All your existing shortcuts and commands remain the same
2. Java/Kotlin support is preserved and enhanced
3. New languages are automatically available
4. Check Settings for new configuration options

## 📝 License

MIT

## 🙏 Acknowledgments

Inspired by JetBrains IntelliJ IDEA's Copy Reference feature.
```

## Categories & Tags

**Categories**:
- Other
- Programming Languages
- Snippets

**Tags** (max 5 for marketplace):
1. copy-reference
2. intellij
3. productivity
4. multi-language
5. developer-tools

## VS Code Marketplace Badge

```markdown
[![VS Code Marketplace](https://img.shields.io/vscode-marketplace/v/xuezhouyang.another-copy-reference-like-intellij.svg)](https://marketplace.visualstudio.com/items?itemName=xuezhouyang.another-copy-reference-like-intellij)
[![Downloads](https://img.shields.io/vscode-marketplace/d/xuezhouyang.another-copy-reference-like-intellij.svg)](https://marketplace.visualstudio.com/items?itemName=xuezhouyang.another-copy-reference-like-intellij)
[![Rating](https://img.shields.io/vscode-marketplace/r/xuezhouyang.another-copy-reference-like-intellij.svg)](https://marketplace.visualstudio.com/items?itemName=xuezhouyang.another-copy-reference-like-intellij)
```

## Publishing Checklist

- [x] Icon exists (images/icon.png)
- [ ] Screenshots captured (5 recommended)
- [x] Short description written
- [x] Full description prepared
- [x] Categories selected
- [x] Tags defined
- [x] Gallery banner configured
- [ ] CHANGELOG.md updated for release
- [ ] Version bumped in package.json
- [ ] README.md updated with badges