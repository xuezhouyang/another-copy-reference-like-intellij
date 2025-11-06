# Migration Guide: Java/Kotlin to Multi-Language Copy Reference

## Overview

This guide helps users migrate from the original Java/Kotlin-only Copy Reference extension to the new multi-language version (v1.0.0).

## Quick Start

**Good news!** The new version is 100% backward compatible. Your existing workflows will continue to work without any changes.

### What's Preserved
- ✅ Same keyboard shortcuts (Alt+Shift+C / Cmd+Shift+C)
- ✅ Same command name ("Copy Reference")
- ✅ Java/Kotlin support enhanced, not replaced
- ✅ Same reference format for Java/Kotlin files
- ✅ All existing settings respected

### What's New
- 🌍 Support for 8+ additional languages
- ⚛️ React framework detection
- ⚡ Performance improvements with caching
- 🛠️ Extensive configuration options
- 📊 Telemetry and feedback systems

## Migration Steps

### 1. Update the Extension

#### Via VS Code
1. Open Extensions panel (Ctrl+Shift+X / Cmd+Shift+X)
2. Search for "Copy Reference"
3. Click "Update" if available
4. Reload VS Code

#### Via Command Line
```bash
code --install-extension xuezhouyang.another-copy-reference-like-intellij@latest
```

### 2. Review New Settings (Optional)

The extension works out-of-the-box, but you can customize behavior:

1. Open Settings (Ctrl+, / Cmd+,)
2. Search for "Copy Reference"
3. Review new options:
   - Cache settings
   - Language handler toggles
   - Framework detection
   - Telemetry preferences

### 3. Test Your Workflow

Try the extension with your existing Java/Kotlin files:

```java
// Test.java
package com.example;

public class Test {
    public void method() {
        // Place cursor here, press Alt+Shift+C
        // Result: com.example.Test#method
    }
}
```

## Comparison Table

| Feature | Old Version (0.0.1) | New Version (1.0.0) |
|---------|-------------------|-------------------|
| **Java Support** | ✅ Full | ✅ Enhanced |
| **Kotlin Support** | ✅ Full | ✅ Enhanced |
| **JavaScript/TypeScript** | ❌ | ✅ Full |
| **Python** | ❌ | ✅ Full |
| **Markdown** | ❌ | ✅ Full |
| **HTML/XML** | ❌ | ✅ Full |
| **YAML** | ❌ | ✅ Full |
| **React Detection** | ❌ | ✅ Automatic |
| **Universal Fallback** | ❌ | ✅ Any file |
| **Caching** | ❌ | ✅ 4 strategies |
| **Telemetry** | ❌ | ✅ Optional |
| **Feedback System** | ❌ | ✅ Built-in |
| **Languages** | 2 | 12 |
| **Performance** | Good | Excellent |

## New Features to Explore

### 1. Multi-Language Support

Now works with all your files:

```javascript
// JavaScript: components/Button.js#handleClick
// Python: models.user.User.get_name
// Markdown: README.md#installation
// HTML: index.html#header
// YAML: config.yml#database.host
```

### 2. Universal Fallback

Any unsupported file type gets basic reference:
```
custom.xyz:25:10  // filepath:line:column
```

### 3. React Framework Detection

Automatically recognizes React components and hooks:

```jsx
// Components/Button.jsx
const Button = () => { ... }  // Button component detected
const useAuth = () => { ... }  // Custom hook detected
```

### 4. Advanced Configuration

Fine-tune behavior in Settings:

- **Cache Strategy**: Choose LRU, LFU, FIFO, or Adaptive
- **Cache Size**: Control memory usage
- **Handler Toggle**: Enable/disable specific languages
- **Framework Detection**: Toggle React detection

### 5. Feedback Integration

Help improve the extension:
- Command Palette > "Copy Reference: Provide Feedback"
- Report bugs directly to GitHub
- Suggest new features

## Common Questions

### Q: Will my Java/Kotlin references change?
**A**: No, the format remains identical. Full backward compatibility.

### Q: Do I need to reconfigure shortcuts?
**A**: No, all shortcuts remain the same.

### Q: Can I disable new languages?
**A**: Yes, in Settings you can disable any language handler.

### Q: Is telemetry mandatory?
**A**: No, telemetry respects VS Code's telemetry settings and can be disabled.

### Q: Will it slow down my VS Code?
**A**: No, performance is actually improved with smart caching.

## Troubleshooting

### Issue: Extension not updating
**Solution**: Manually uninstall old version and install new:
```bash
code --uninstall-extension xuezhouyang.another-copy-reference-like-intellij
code --install-extension xuezhouyang.another-copy-reference-like-intellij
```

### Issue: Shortcuts not working
**Solution**: Check for conflicts in Keyboard Shortcuts:
1. Open Command Palette (F1)
2. Type "Preferences: Open Keyboard Shortcuts"
3. Search for "copyReference"
4. Resolve any conflicts

### Issue: Java/Kotlin references different
**Solution**: Ensure you have Java/Kotlin language support installed:
- Install "Language Support for Java(TM) by Red Hat"
- Install "Kotlin Language" extension

### Issue: Performance issues
**Solution**: Adjust cache settings:
1. Reduce cache size in Settings
2. Change eviction strategy to FIFO
3. Disable unused language handlers

## Rollback Option

If you need to rollback (not recommended):

1. Open Extensions panel
2. Click gear icon on Copy Reference
3. Select "Install Another Version..."
4. Choose 0.0.1

Note: You'll lose all new features and improvements.

## Support

### Getting Help
- **GitHub Issues**: [Report issues](https://github.com/xuezhouyang/another-copy-reference-like-intellij/issues)
- **Email**: xuezhouyang@gmail.com
- **Feedback Command**: "Copy Reference: Provide Feedback"

### Documentation
- [README](README.md) - Full documentation
- [CHANGELOG](CHANGELOG.md) - Version history
- [Quickstart](specs/001-multi-language-reference/quickstart.md) - Usage examples

## Summary

The migration from v0.0.1 to v1.0.0 is seamless:

1. ✅ **Zero breaking changes**
2. ✅ **Same shortcuts and commands**
3. ✅ **Enhanced Java/Kotlin support**
4. ✅ **8+ new languages added**
5. ✅ **Better performance**

Simply update and enjoy the new features while maintaining your existing workflow!

---

*Thank you for using Copy Reference!*