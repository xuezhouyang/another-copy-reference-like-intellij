# Quick Start Guide: Multi-Language Copy Reference

## Overview

The Copy Reference extension for VS Code provides IntelliJ IDEA-style reference copying for multiple programming languages and frameworks. Copy fully qualified references to classes, methods, functions, and other symbols with a single keyboard shortcut.

## Installation

1. Install from VS Code Marketplace:
   ```
   ext install another-copy-reference-like-intellij
   ```

2. Or install from VSIX file:
   ```bash
   code --install-extension copy-reference-1.1.0.vsix
   ```

## Basic Usage

### Keyboard Shortcut

- **Windows/Linux**: `Alt+Shift+C`
- **macOS**: `Cmd+Shift+C`

### Steps

1. Open a supported file in VS Code
2. Place your cursor on a class, method, function, or symbol
3. Press the keyboard shortcut
4. The reference is copied to your clipboard

## Supported Languages

### Programming Languages

| Language | Reference Format | Example |
|----------|------------------|---------|
| Java | `package.Class#method` | `com.example.UserService#findById` |
| Kotlin | `package.Class#method` | `com.app.MainActivity#onCreate` |
| JavaScript | `path/file.js#symbol` | `src/utils/helpers.js#formatDate` |
| TypeScript | `path/file.ts#Class.method` | `src/models/User.ts#User.validate` |
| Python | `module.Class#method` | `app.models.user#User.get_by_email` |

### Markup & Configuration

| Language | Reference Format | Example |
|----------|------------------|---------|
| Markdown | `file.md#heading` | `docs/API.md#authentication` |
| HTML | `file.html#element-id` | `index.html#login-form` |
| XML | `file.xml#element-id` | `config.xml#database-config` |
| YAML | `file.yml#key.path` | `config.yml#server.port` |

### Frameworks

| Framework | File Types | Reference Format | Example |
|-----------|------------|------------------|---------|
| React | `.jsx`, `.tsx` | `path#Component.method` | `Button.jsx#Button.handleClick` |
| Flutter | `.dart` | `path#Widget.method` | `lib/widgets/button.dart#CustomButton.build` |

### Universal Fallback

For any unsupported file type, the extension provides a fallback format:
- Format: `file:line:column`
- Example: `config/unknown.conf:42:15`

## Examples by Language

### JavaScript/TypeScript

```javascript
// src/components/UserProfile.jsx
export const UserProfile = () => {
    const handleClick = () => {  // <- Copy Reference here
        // Result: src/components/UserProfile.jsx#UserProfile.handleClick
    };

    return <div onClick={handleClick}>Profile</div>;
};
```

### Python

```python
# app/models/user.py
class User:
    def get_by_email(self, email):  # <- Copy Reference here
        # Result: app.models.user#User.get_by_email
        pass
```

### Markdown

```markdown
# Authentication  <!-- Copy Reference here -->
<!-- Result: docs/API.md#authentication -->

## OAuth Setup
<!-- Result: docs/API.md#oauth-setup -->
```

### Flutter/Dart

```dart
// lib/widgets/custom_button.dart
class CustomButton extends StatelessWidget {
    @override
    Widget build(BuildContext context) {  // <- Copy Reference here
        // Result: lib/widgets/custom_button.dart#CustomButton.build
        return ElevatedButton(...);
    }
}
```

## Configuration

### VS Code Settings

Configure the extension in VS Code settings (`settings.json`):

```json
{
    "copyReference.enableNotifications": true,
    "copyReference.fallbackEnabled": true,
    "copyReference.performanceMode": "balanced",
    "copyReference.languageHandlers": {
        "python": {
            "enabled": true,
            "useBuiltInSymbols": true
        },
        "yaml": {
            "enabled": true,
            "customPatterns": [
                {
                    "pattern": "^([^:]+):",
                    "symbolKind": 6
                }
            ]
        }
    }
}
```

### Available Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `copyReference.enableNotifications` | boolean | true | Show success/error notifications |
| `copyReference.fallbackEnabled` | boolean | true | Enable universal fallback |
| `copyReference.performanceMode` | string | "balanced" | Cache strategy: aggressive, balanced, conservative |
| `copyReference.maxCacheSize` | number | 100 | Maximum cached documents |

## Troubleshooting

### Common Issues

#### 1. "Unable to determine reference path"
- **Cause**: Cursor not on a valid symbol
- **Solution**: Place cursor directly on class/method name

#### 2. Linux: "Clipboard requires 'xsel' or 'xclip'"
- **Cause**: Missing clipboard utilities on Linux
- **Solution**: Install xsel:
  ```bash
  sudo apt install xsel
  ```

#### 3. "No symbols found"
- **Cause**: File might not have been parsed yet
- **Solution**:
  - Save the file and try again
  - For Python files, edit and save to trigger parsing

#### 4. React components not recognized
- **Cause**: Component not following naming convention
- **Solution**: Ensure components start with uppercase letter

### Performance Tips

1. **Large Files**: The extension caches symbols for better performance
2. **First Use**: Initial symbol resolution might take a moment
3. **Remote Development**: Works in SSH, containers, and Codespaces

## Language-Specific Notes

### JavaScript/TypeScript
- Supports ES6 modules, CommonJS, and TypeScript
- React components must start with uppercase letters
- Hooks are recognized by `use` prefix

### Python
- Supports module paths and class hierarchies
- May need to save file for initial parsing
- Works with both function and class definitions

### Markdown
- Generates GitHub-compatible heading anchors
- Supports both ATX (`#`) and Setext style headings
- Special characters in headings are URL-encoded

### YAML
- Uses dot notation for nested keys
- Supports array indices
- Comments are ignored

### Flutter/Dart
- Recognizes StatelessWidget and StatefulWidget
- Follows Flutter project conventions
- Package paths derived from pubspec.yaml

## Feedback and Support

Found an issue or have a suggestion?

- **Email**: xuezhouyang@gmail.com
- **GitHub**: [Report an issue](https://github.com/your-repo/issues)

## Quick Command Reference

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Copy Reference | `Alt+Shift+C` | `Cmd+Shift+C` |
| Command Palette | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| Search: "Copy Reference" | Type in palette | Type in palette |

## Next Steps

1. Try copying references in different file types
2. Configure language-specific settings
3. Report any issues or suggestions
4. Share with your team!

---

**Version**: 1.1.0
**Last Updated**: 2025-11-05