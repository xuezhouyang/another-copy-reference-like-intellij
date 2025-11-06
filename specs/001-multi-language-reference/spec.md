# Feature Specification: Multi-Language Copy Reference

**Feature Branch**: `001-multi-language-reference`
**Created**: 2025-11-05
**Status**: Draft
**Input**: User description: "需要支持Markdown / Js / ts / python / html / yml/xml / react / flutter  的 Copy Reference 功能 / 因为这些有些是语言  有些是框架但框架又有自己的个性化后缀 所以我就都写了  你结合之前项目 实现下, 还需要兜底的 的 Copy Reference 功能 ， 及如果能在编辑器打开 就能用 Copy Reference，只是不如我们特殊兼容的好用罢了"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Universal Fallback Reference (Priority: P1)

As a developer working with any file type, I want to copy a basic reference to my current cursor position so that I can share code locations with my team, even when the file type isn't specifically supported.

**Why this priority**: This ensures the extension always provides value for any file that can be opened in the editor, making it immediately useful for all developers regardless of their technology stack.

**Independent Test**: Can be fully tested by opening any text file, invoking Copy Reference at any position, and verifying clipboard contains a filepath:line:column reference.

**Acceptance Scenarios**:

1. **Given** a user has any file open in the editor, **When** they invoke Copy Reference at line 42, column 15, **Then** the clipboard contains "path/to/file.ext:42:15"
2. **Given** a user is editing an unsupported file type, **When** they use the keyboard shortcut for Copy Reference, **Then** they receive a basic file location reference without errors
3. **Given** a file with no specific language support, **When** Copy Reference is invoked, **Then** the operation completes successfully within 100ms

---

### User Story 2 - JavaScript/TypeScript Reference (Priority: P2)

As a JavaScript or TypeScript developer, I want to copy references to functions, classes, and variables so that I can quickly share specific code elements with my team during code reviews and discussions.

**Why this priority**: JavaScript and TypeScript are the most commonly used languages in modern web development, providing immediate value to the largest user base.

**Independent Test**: Can be tested by opening any .js, .ts, .jsx, or .tsx file, positioning cursor on a symbol, and verifying the clipboard contains the appropriate module path with symbol name.

**Acceptance Scenarios**:

1. **Given** a JavaScript file with an exported function, **When** the user invokes Copy Reference on the function name, **Then** the clipboard contains "src/utils/helpers.js#formatDate"
2. **Given** a TypeScript class definition, **When** Copy Reference is used on a method, **Then** the clipboard contains "src/models/User.ts#User.validate"
3. **Given** a nested function or class, **When** Copy Reference is invoked, **Then** the full nested path is captured correctly

---

### User Story 3 - Python Reference (Priority: P2)

As a Python developer, I want to copy references to modules, classes, and functions using Python's import path conventions so that I can maintain consistency with Python documentation standards.

**Why this priority**: Python is widely used in data science, automation, and backend development, representing a significant user segment.

**Independent Test**: Can be tested by opening any .py file, navigating to various symbols, and verifying clipboard contains Python-style module paths.

**Acceptance Scenarios**:

1. **Given** a Python module with a class, **When** Copy Reference is invoked on a method, **Then** the clipboard contains "app.models.user#User.get_by_email"
2. **Given** a standalone Python function, **When** Copy Reference is used, **Then** the clipboard contains the full module path to the function
3. **Given** a Python file in a package structure, **When** Copy Reference is invoked, **Then** the package hierarchy is correctly reflected

---

### User Story 4 - Markdown Reference (Priority: P3)

As a documentation writer or developer, I want to copy references to specific sections in Markdown files so that I can create accurate cross-references in documentation.

**Why this priority**: While important for documentation, this is less frequently used than code references.

**Independent Test**: Can be tested by opening any .md file, positioning cursor on headings, and verifying clipboard contains file path with heading anchor.

**Acceptance Scenarios**:

1. **Given** a Markdown file with headings, **When** Copy Reference is invoked on a heading, **Then** the clipboard contains "docs/API.md#authentication"
2. **Given** nested headings in Markdown, **When** Copy Reference is used, **Then** the anchor reflects the specific heading level correctly
3. **Given** a heading with special characters, **When** Copy Reference is invoked, **Then** the anchor is properly formatted for URL compatibility

---

### User Story 5 - HTML/XML Reference (Priority: P3)

As a web developer or configuration manager, I want to copy references to specific elements in HTML and XML files so that I can quickly locate UI components or configuration sections.

**Why this priority**: Useful for frontend developers and DevOps engineers but less frequently needed than programming language references.

**Independent Test**: Can be tested by opening HTML/XML files, selecting elements with IDs or specific paths, and verifying appropriate references are copied.

**Acceptance Scenarios**:

1. **Given** an HTML element with an ID, **When** Copy Reference is invoked, **Then** the clipboard contains "templates/index.html#login-form"
2. **Given** an XML configuration file, **When** Copy Reference is used on a nested element, **Then** an XPath-like reference is generated
3. **Given** an element without an ID, **When** Copy Reference is invoked, **Then** a path based on element hierarchy is created

---

### User Story 6 - YAML Configuration Reference (Priority: P3)

As a DevOps engineer or developer working with configurations, I want to copy references to specific configuration keys so that I can precisely communicate about configuration issues.

**Why this priority**: Configuration files are important but referenced less frequently than source code.

**Independent Test**: Can be tested by opening .yml or .yaml files, navigating to various keys, and verifying dot-notation paths are copied.

**Acceptance Scenarios**:

1. **Given** a YAML file with nested keys, **When** Copy Reference is invoked on a value, **Then** the clipboard contains "config/database.yml#production.database.host"
2. **Given** a YAML array element, **When** Copy Reference is used, **Then** the reference includes the array index
3. **Given** a complex nested YAML structure, **When** Copy Reference is invoked, **Then** the full path is accurately captured

---

### User Story 7 - React Component Reference (Priority: P4)

As a React developer, I want to copy references to components and hooks so that I can maintain React-specific conventions in my documentation and discussions.

**Why this priority**: Framework-specific enhancement that builds on top of JavaScript/TypeScript support.

**Independent Test**: Can be tested with .jsx and .tsx files containing React components, verifying component-aware references.

**Acceptance Scenarios**:

1. **Given** a React functional component, **When** Copy Reference is invoked, **Then** the clipboard contains "src/components/Button.jsx#Button"
2. **Given** a custom React hook, **When** Copy Reference is used, **Then** the reference follows hook naming conventions
3. **Given** nested component definitions, **When** Copy Reference is invoked, **Then** the component hierarchy is preserved

---

### User Story 8 - Flutter/Dart Reference (Priority: P4)

As a Flutter developer, I want to copy references to widgets and Dart classes following Flutter project conventions so that I can effectively communicate about mobile app code.

**Why this priority**: Specialized framework support for mobile developers using Flutter.

**Independent Test**: Can be tested with .dart files in Flutter projects, verifying Flutter-aware path structures.

**Acceptance Scenarios**:

1. **Given** a Flutter widget class, **When** Copy Reference is invoked, **Then** the clipboard contains "lib/widgets/custom_button.dart#CustomButton"
2. **Given** a StatefulWidget with state class, **When** Copy Reference is used on the state, **Then** the reference maintains the relationship
3. **Given** a Dart file in the lib folder structure, **When** Copy Reference is invoked, **Then** the path follows Flutter conventions

---

### Edge Cases

- What happens when the cursor is not on any identifiable symbol?
- How does the system handle files with no clear structure or symbols?
- What occurs when multiple symbols are at the same location?
- How are anonymous functions or lambda expressions handled?
- What happens with very long file paths or deeply nested structures?
- How does the system handle files that are not saved yet (untitled files)?
- What occurs when copying references from files with syntax errors?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide Copy Reference functionality for all file types that can be opened in the editor
- **FR-002**: System MUST support language-specific reference formats for JavaScript, TypeScript, Python, HTML, XML, YAML, and Markdown files
- **FR-003**: System MUST recognize framework-specific patterns for React (.jsx, .tsx) and Flutter (.dart) files
- **FR-004**: System MUST provide a universal fallback format (filepath:line:column) when no specific language support is available
- **FR-005**: Users MUST be able to invoke Copy Reference using a single keyboard shortcut across all supported file types
- **FR-006**: System MUST copy the reference to the system clipboard within 100 milliseconds of invocation
- **FR-007**: System MUST display a success notification after copying a reference
- **FR-008**: System MUST show informative error messages when reference generation fails
- **FR-009**: System MUST preserve existing clipboard content if reference generation fails
- **FR-010**: System MUST support references for nested symbols and hierarchical structures
- **FR-011**: References MUST be human-readable and follow conventions familiar to developers of each language
- **FR-012**: System MUST handle special characters in identifiers according to each language's rules
- **FR-013**: System MUST work with both saved and unsaved files (using appropriate placeholders for unsaved files)
- **FR-014**: System MUST support internationalized error and success messages
- **FR-015**: User feedback mechanism MUST be accessible for feature improvement suggestions

### Key Entities *(include if feature involves data)*

- **Language Handler**: Represents the logic for processing a specific language or file type, containing pattern matching rules and reference format templates
- **Reference Format**: Defines how references are structured for each language (separator characters, path conventions, symbol notation)
- **Symbol Context**: Contains information about the current cursor position including file path, line, column, and surrounding symbols
- **Clipboard Entry**: The formatted reference string ready to be copied to the system clipboard

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can invoke Copy Reference and receive a clipboard result within 100 milliseconds for 95% of attempts
- **SC-002**: The extension successfully generates references for 100% of supported file types without errors
- **SC-003**: 90% of users can successfully copy their first reference within 30 seconds of installing the extension
- **SC-004**: Language-specific references are correctly formatted according to conventions 99% of the time
- **SC-005**: The universal fallback mechanism activates successfully for 100% of unsupported file types
- **SC-006**: User satisfaction rating of 4.5 or higher out of 5 for the Copy Reference feature
- **SC-007**: Support requests related to Copy Reference functionality decrease by 70% compared to manual reference creation
- **SC-008**: The extension handles files with over 10,000 lines without performance degradation
- **SC-009**: Memory usage remains under 50MB even when processing large codebases
- **SC-010**: The feature works correctly across all major operating systems (Windows, macOS, Linux) with 99.9% reliability