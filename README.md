# Another Copy Reference Like IntelliJ

[English](#english) | [中文](#中文) | [Español](#español) | [हिन्दी](#हिन्दी) | [العربية](#العربية) | [Português](#português) | [Русский](#русский) | [日本語](#日本語) | [Français](#français) | [Deutsch](#deutsch) | [བོད་ཡིག](#བོད་ཡིག) | [ئۇيغۇرچە](#ئۇيغۇرچە)

## English

A VS Code extension that copies reference paths similar to IntelliJ IDEA's Copy Reference feature, now with support for multiple programming languages.

### Features

- **Universal Fallback**: Works with ANY file type using `filepath:line:column` format
- **Multi-Language Support**: Java, Kotlin, JavaScript, TypeScript, Python, Markdown, HTML, XML, YAML, React, Flutter/Dart
- **Intelligent Reference Format**: Language-specific reference formats for supported languages
- **Framework Detection**: Automatic detection for React and Flutter projects
- **Performance Optimized**: <100ms response time with built-in caching
- **Internationalization**: UI available in 12 languages

### Supported Programming Languages

| Language | Reference Format | Example |
|----------|-----------------|---------|
| Java/Kotlin | `package.Class#method` | `com.example.MyService#doWork` |
| JavaScript/TypeScript | `module/path.Class#method` | `services/auth.AuthService#login` |
| Python | `module.path.Class.method` | `app.services.DataProcessor.process` |
| Markdown | `file.md#heading` | `README.md#installation` |
| HTML/XML | `file.html#element-id` | `index.html#header` |
| YAML | `file.yml#key.path` | `config.yml#server.port` |
| React | `Component.tsx#ComponentName` | `Button.tsx#PrimaryButton` |
| Flutter/Dart | `package:app/file.dart#Class` | `package:myapp/widgets/button.dart#CustomButton` |
| **Any other file** | `filepath:line:column` | `src/data.txt:10:5` |

### UI Languages

- English, Chinese (Simplified), Spanish, Hindi, Arabic, Portuguese
- Russian, Japanese, French, German, Tibetan, Uyghur

### Usage

1. Place cursor anywhere in your code
2. Copy reference using either:
   - Keyboard shortcut:
     - Windows/Linux: `Alt+Shift+C`
     - Mac: `Cmd+Shift+C`
   - Or right-click menu and select "Copy Reference"

### Examples

#### Java/Kotlin
```java
package com.example.demo;

public class MyService {
    public void doSomething() {
        // Cursor here copies: com.example.demo.MyService#doSomething
    }
}
```

#### JavaScript/TypeScript
```typescript
// File: src/services/UserService.ts
export class UserService {
    async getUser(id: string) {
        // Cursor here copies: services/UserService#getUser
    }
}
```

#### Python
```python
# File: app/models/user.py
class UserModel:
    def save(self):
        # Cursor here copies: app.models.user.UserModel.save
        pass
```

#### Universal Fallback (Any File)
```text
// File: data/config.txt at line 10, column 5
Some configuration text
// Cursor here copies: data/config.txt:10:5
```

### Requirements

- VS Code version 1.74.0 or higher
- Language-specific features require appropriate language extensions

### Feedback

Found a bug or have a feature request? Please send feedback to: **xuezhouyang@gmail.com**

### Known Issues

- None at this time

### Release Notes

#### 1.0.0 (Upcoming)

- Added universal fallback support for ANY file type
- Multi-language support for JavaScript, TypeScript, Python, Markdown, HTML, XML, YAML
- Framework detection for React and Flutter
- Performance improvements with intelligent caching
- Enhanced error handling and user feedback

#### 0.0.1

- Initial release with Java/Kotlin support
- Basic reference copying functionality

## 中文

一个类似于 IntelliJ IDEA 的 Copy Reference 功能的 VS Code 扩展，现已支持多种编程语言。

### 功能

- **通用后备模式**：支持任何文件类型，使用 `文件路径:行:列` 格式
- **多编程语言支持**：Java、Kotlin、JavaScript、TypeScript、Python、Markdown、HTML、XML、YAML、React、Flutter/Dart
- **智能引用格式**：为支持的语言提供特定的引用格式
- **框架检测**：自动检测 React 和 Flutter 项目
- **性能优化**：响应时间小于100毫秒，内置缓存机制
- **国际化**：界面支持12种语言

### 支持的语言

- 英语
- 中文（简体）
- 西班牙语
- 印地语
- 阿拉伯语
- 葡萄牙语
- 俄语
- 日语
- 法语
- 德语
- 藏语
- 维吾尔语

### 使用方法

1. 将光标放在类名或方法名上
2. 使用以下方式之一复制引用：
   - 使用快捷键：
     - Windows/Linux: `Alt+Shift+C`
     - Mac: `Cmd+Shift+C`
   - 或右键菜单选择"复制引用路径"

### 示例

```java
// 在以下代码中：
package com.example.demo;

public class MyService {
    public void doSomething() {
        // ...
    }
}

// 光标在类名上时复制结果：
com.example.demo.MyService

// 光标在方法名上时复制结果：
com.example.demo.MyService#doSomething
```

### 要求

- VS Code 版本 1.60.0 或更高
- 文件中必须有正确的 package 声明

### 已知问题

- 暂无

### 更新日志

#### 0.0.1

- 初始版本
- 实现基本的复制引用功能
- 支持类名和方法名的复制 

## Español

Una extensión de VS Code que copia rutas de referencia similar a la función Copy Reference de IntelliJ IDEA.

### Características

- Copiar rutas de referencia completas para clases y métodos
- Soporte para archivos Java y Kotlin
- Formato: `paquete.NombreClase#nombreMétodo` o `paquete.NombreClase`
- Soporte para clases internas e interfaces
- Soporte multilingüe (12 idiomas)

### Uso

1. Coloque el cursor en el nombre de la clase o método
2. Copie la referencia usando:
   - Atajo de teclado:
     - Windows/Linux: `Alt+Shift+C`
     - Mac: `Cmd+Shift+C`
   - O menú contextual y seleccione "Copiar Referencia"

## हिन्दी

IntelliJ IDEA की Copy Reference सुविधा के समान संदर्भ पथ कॉपी करने वाला VS Code एक्सटेंशन।

### विशेषताएं

- क्लास और मेथड के लिए पूर्ण संदर्भ पथ कॉपी करें
- Java और Kotlin फ़ाइलों के लिए समर्थन
- प्रारूप: `पैकेज.क्लासनाम#मेथडनाम` या `पैकेज.क्लासनाम`
- इनर क्लास और इंटरफेस के लिए समर्थन
- बहुभाषी समर्थन (12 भाषाएं)

### उपयोग

1. कर्सर को क्लास या मेथड नाम पर रखें
2. संदर्भ कॉपी करने के लिए:
   - कीबोर्ड शॉर्टकट:
     - Windows/Linux: `Alt+Shift+C`
     - Mac: `Cmd+Shift+C`
   - या राइट-क्लिक मेनू से "संदर्भ कॉपी करें" चुनें

## العربية

امتداد VS Code ينسخ مسارات المراجع بشكل مشابه لميزة Copy Reference في IntelliJ IDEA.

### المميزات

- نسخ مسارات المراجع الكاملة للفئات والطرق
- دعم ملفات Java و Kotlin
- التنسيق: `الحزمة.اسمالفئة#اسمالطريقة` أو `الحزمة.اسمالفئة`
- دعم الفئات الداخلية والواجهات
- دعم متعدد اللغات (12 لغة)

### الاستخدام

1. ضع المؤشر على اسم الفئة أو الطريقة
2. انسخ المرجع باستخدام:
   - اختصار لوحة المفاتيح:
     - Windows/Linux: `Alt+Shift+C`
     - Mac: `Cmd+Shift+C`
   - أو قائمة النقر بزر الماوس الأيمن واختر "نسخ المرجع"

## Português

Uma extensão VS Code que copia caminhos de referência semelhante ao recurso Copy Reference do IntelliJ IDEA.

### Recursos

- Copiar caminhos de referência completos para classes e métodos
- Suporte para arquivos Java e Kotlin
- Formato: `pacote.NomeClasse#nomeMetodo` ou `pacote.NomeClasse`
- Suporte para classes internas e interfaces
- Suporte multilíngue (12 idiomas)

### Uso

1. Posicione o cursor no nome da classe ou método
2. Copie a referência usando:
   - Atalho de teclado:
     - Windows/Linux: `Alt+Shift+C`
     - Mac: `Cmd+Shift+C`
   - Ou menu de contexto e selecione "Copiar Referência"

## Русский

Расширение VS Code, которое копирует пути ссылок аналогично функции Copy Reference в IntelliJ IDEA.

### Возможности

- Копирование полных путей ссылок для классов и методов
- Поддержка файлов Java и Kotlin
- Формат: `пакет.ИмяКласса#имяМетода` или `пакет.ИмяКласса`
- Поддержка внутренних классов и интерфейсов
- Многоязычная поддержка (12 языков)

### Использование

1. Поместите курсор на имя класса или метода
2. Скопируйте ссылку используя:
   - Сочетание клавиш:
     - Windows/Linux: `Alt+Shift+C`
     - Mac: `Cmd+Shift+C`
   - Или контекстное меню и выберите "Копировать ссылку"

## 日本語

IntelliJ IDEAのCopy Reference機能と同様の参照パスをコピーするVS Code拡張機能。

### 機能

- クラスとメソッドの完全な参照パスをコピー
- JavaとKotlinファイルのサポート
- 形式: `パッケージ.クラス名#メソッド名` または `パッケージ.クラス名`
- 内部クラスとインターフェースのサポート
- 多言語サポート（12言語）

### 使用方法

1. クラス名またはメソッド名にカーソルを置く
2. 参照をコピーする方法:
   - キーボードショートカット:
     - Windows/Linux: `Alt+Shift+C`
     - Mac: `Cmd+Shift+C`
   - または右クリックメニューから「参照をコピー」を選択

## Français

Une extension VS Code qui copie les chemins de référence similaire à la fonctionnalité Copy Reference d'IntelliJ IDEA.

### Fonctionnalités

- Copie des chemins de référence complets pour les classes et méthodes
- Support des fichiers Java et Kotlin
- Format: `package.NomClasse#nomMethode` ou `package.NomClasse`
- Support des classes internes et interfaces
- Support multilingue (12 langues)

### Utilisation

1. Placez le curseur sur le nom de la classe ou de la méthode
2. Copiez la référence en utilisant:
   - Raccourci clavier:
     - Windows/Linux: `Alt+Shift+C`
     - Mac: `Cmd+Shift+C`
   - Ou menu contextuel et sélectionnez "Copier la Référence"

## Deutsch

Eine VS Code-Erweiterung, die Referenzpfade ähnlich der Copy Reference-Funktion von IntelliJ IDEA kopiert.

### Funktionen

- Kopieren vollständiger Referenzpfade für Klassen und Methoden
- Unterstützung für Java- und Kotlin-Dateien
- Format: `package.Klassenname#Methodenname` oder `package.Klassenname`
- Unterstützung für innere Klassen und Interfaces
- Mehrsprachige Unterstützung (12 Sprachen)

### Verwendung

1. Platzieren Sie den Cursor auf dem Klassen- oder Methodennamen
2. Kopieren Sie die Referenz mit:
   - Tastenkombination:
     - Windows/Linux: `Alt+Shift+C`
     - Mac: `Cmd+Shift+C`
   - Oder Kontextmenü und wählen Sie "Referenz kopieren"

## བོད་ཡིག

IntelliJ IDEA ཡི་ Copy Reference ལྟར་གྱི་ཁུངས་སྦྲེལ་ལམ་བུ་པར་བཤུ་བྱེད་པའི་ VS Code རྒྱ་སྐྱེད།

### ཁྱད་ཆོས།

- འཛིན་གྲྭ་དང་ཐབས་ཤེས་ཀྱི་ཆ་ཚང་བའི་ཁུངས་སྦྲེལ་ལམ་བུ་པར་བཤུ།
- Java དང་ Kotlin ཡིག་ཆར་རྒྱབ་སྐྱོར།
- རྣམ་བཞག: `ཐུམ་བུ.འཛིན་གྲྭ་མིང#ཐབས་ཤེས་མིང` ཡང་ན་ `ཐུམ་བུ.འཛིན་གྲྭ་མིང`
- ནང་འཛིན་གྲྭ་དང་མཚམས་ངོས་ལ་རྒྱབ་སྐྱོར།
- སྐད་རིགས་མང་པོར་རྒྱབ་སྐྱོར། (སྐད་རིགས་ ༡༢)

### བེད་སྤྱོད།

1. འོད་རྟགས་འཛིན་གྲྭའམ་ཐབས་ཤེས་མིང་ཐོག་ཏུ་འཇོག
2. ཁུངས་སྦྲེལ་པར་བཤུ་བྱེད་པར:
   - མྱུར་མཐེབ:
     - Windows/Linux: `Alt+Shift+C`
     - Mac: `Cmd+Shift+C`
   - ཡང་ན་གཡས་མཐེབ་འདེམས་ཐོ་ནས་"ཁུངས་སྦྲེལ་པར་བཤུ"འདེམས།

## ئۇيغۇرچە

IntelliJ IDEA نىڭ Copy Reference ئىقتىدارىغا ئوخشاش نەقىل مەنبە يولىنى كۆچۈرىدىغان VS Code كېڭەيتمىسى.

### ئىقتىدارلار

- سىنىپ ۋە مېتودلارنىڭ تولۇق نەقىل مەنبە يولىنى كۆچۈرۈش
- Java ۋە Kotlin ھۆججەتلىرىنى قوللاش
- فورماتى: `بوغچا.سىنىپئىسمى#مېتودئىسمى` ياكى `بوغچا.سىنىپئىسمى`
- ئىچكى سىنىپ ۋە ئارايۈزلەرنى قوللاش
- كۆپ تىل قوللىشى (12 تىل)

### ئىشلىتىش

1. نۇر بەلگىسىنى سىنىپ ياكى مېتود ئىسمىغا قويۇڭ
2. نەقىل مەنبەنى كۆچۈرۈش ئۇسۇلى:
   - تېزلەتمە كۇنۇپكا:
     - Windows/Linux: `Alt+Shift+C`
     - Mac: `Cmd+Shift+C`
   - ياكى ئوڭ كۇنۇپكا تىزىملىكىدىن "نەقىل مەنبەسىنى كۆچۈرۈش" نى تاللاڭ 