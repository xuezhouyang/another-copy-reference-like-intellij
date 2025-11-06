<!-- Sync Impact Report
======================
Version Change: 0.0.0 → 1.1.0 (MINOR: new principles and sections added)

Added Principles (6 total):
  - I. Multi-Language Support (NEW)
  - II. Universal Reference Patterns (NEW)
  - III. Framework Awareness (NEW)
  - IV. Extensibility (NEW)
  - V. User Experience (NEW - includes feedback email)
  - VI. Universal Fallback (NEW)

Added Sections:
  - Language Support Standards (NEW)
  - Development Workflow (NEW)
  - User Feedback (NEW - xuezhouyang@gmail.com)

Modified Principles: None (all new)
Removed Sections: None

Templates Status:
  ✅ spec-template.md - No updates needed
  ✅ plan-template.md - Constitution Check already present
  ✅ tasks-template.md - No updates needed
  ✅ agent-file-template.md - No updates needed
  ✅ checklist-template.md - Not checked (no constitution-specific content)

Follow-up TODOs: None

Version Rationale:
- MINOR bump (1.1.0): Added new principles and governance sections
- Not MAJOR: No breaking changes or removals
- Not PATCH: Significant new content added

Implementation Note: This constitution transforms the existing Java/Kotlin-only
Copy Reference extension into a multi-language tool supporting Markdown, JS/TS,
Python, HTML, YML/XML, React, Flutter, with a universal fallback for any file.
-->

# Copy Reference Extension Constitution

## Core Principles

### I. Multi-Language Support
Every supported language and framework MUST have consistent Copy Reference functionality with language-specific adaptations. The extension MUST support at minimum: Markdown, JavaScript, TypeScript, Python, HTML, YML/XML, React, and Flutter. Each language implementation MUST respect that language's idioms and conventions while maintaining a consistent user experience across all languages.

**Rationale**: Developers work across multiple languages and frameworks. A truly useful Copy Reference tool must work seamlessly across the entire technology stack, not just for Java/Kotlin.

### II. Universal Reference Patterns
Each language MUST define its own reference format that makes sense for that language's ecosystem:
- **JavaScript/TypeScript/React**: Module path with export name (e.g., `src/components/Button.tsx#Button` or `src/utils/helpers.js#formatDate`)
- **Python**: Module path with class/function (e.g., `app.models.user#User.get_by_email`)
- **HTML/XML**: File path with element ID or XPath (e.g., `templates/index.html#login-form`)
- **YML**: File path with key path (e.g., `config/database.yml#production.database.host`)
- **Markdown**: File path with heading anchor (e.g., `docs/API.md#authentication`)
- **Flutter/Dart**: Package path with widget/class (e.g., `lib/widgets/custom_button.dart#CustomButton`)

**Rationale**: Each language has established conventions for referencing code locations. Forcing a Java-style reference on all languages would be unnatural and unhelpful.

### III. Framework Awareness
The extension MUST recognize framework-specific file extensions and patterns:
- React files (.jsx, .tsx) MUST be treated with React-specific symbol resolution
- Flutter files (.dart) MUST recognize widget hierarchies
- Vue files (.vue) MUST handle template/script/style blocks appropriately
- Framework-specific project structures MUST be respected (e.g., Next.js app router, Flutter lib structure)

**Rationale**: Modern development involves frameworks with their own conventions. The extension must be smart enough to handle these gracefully.

### IV. Extensibility
The architecture MUST support easy addition of new languages and frameworks without major refactoring:
- Language handlers MUST be modular and pluggable
- Configuration MUST allow users to define custom reference patterns
- The extension MUST provide hooks for language-specific parsing strategies
- Community contributions for new language support MUST be facilitated

**Rationale**: The programming landscape evolves rapidly. The extension must be designed to grow with new languages and frameworks.

### V. User Experience
The extension MUST provide a seamless, consistent experience across all supported languages:
- Single keyboard shortcut works for all languages (Alt+Shift+C / Cmd+Shift+C)
- Error messages MUST be clear and actionable
- The extension MUST gracefully handle edge cases (no symbols found, ambiguous references)
- Localization support MUST extend to all language-specific messages
- Feedback channel MUST be clearly communicated in appropriate contexts (xuezhouyang@gmail.com)
- All user-facing messages about feedback MUST be properly internationalized

**Rationale**: Users should not need to remember different commands or workflows for different file types. Clear feedback channels improve the extension through community input.

### VI. Universal Fallback
The extension MUST provide basic Copy Reference functionality for ANY file that can be opened in the VS Code editor, even without specific language support:
- Fallback reference format: `filepath:line:column` for cursor position
- Symbol-based fallback: Use VS Code's generic symbol provider when available
- Line-based reference: `filepath:line` when no symbol information exists
- The fallback MUST never fail - if a file is open, Copy Reference MUST produce something useful

**Rationale**: Users should never encounter a situation where Copy Reference doesn't work at all. Even a basic file:line reference is better than no reference. This ensures the extension is useful from day one for any language, with enhanced functionality for specifically supported languages.

## Language Support Standards

### Required Language Features
Each language implementation MUST support:
1. **Symbol Resolution**: Ability to identify the symbol at cursor position
2. **Context Extraction**: Determine the containing scope (class, module, namespace)
3. **Path Construction**: Build the appropriate reference string for that language
4. **Clipboard Integration**: Copy the reference in the expected format

### Language-Specific Adaptations
- **Markdown**: Support both ATX and Setext headings, generate GitHub-compatible anchors
- **JavaScript/TypeScript**: Handle ES6 modules, CommonJS, named/default exports
- **Python**: Support module paths, class methods, standalone functions
- **HTML/XML**: Support ID references, class selectors, data attributes
- **YML/YAML**: Support dot-notation paths, array indices
- **React**: Recognize components, hooks, JSX elements
- **Flutter**: Recognize widgets, state classes, build methods

### Testing Requirements
Each language MUST have:
- Unit tests for symbol resolution
- Integration tests for reference generation
- Edge case tests (empty files, malformed syntax)
- Cross-platform clipboard tests

## Development Workflow

### Adding New Language Support
1. Create language handler implementing the base interface
2. Add language-specific symbol resolution logic
3. Define reference format for the language
4. Write comprehensive tests
5. Update documentation with examples
6. Add localization strings if needed

### Code Review Requirements
- All language additions MUST include tests
- Performance impact MUST be measured
- Documentation MUST include usage examples
- Backward compatibility MUST be maintained

### Quality Gates
- Test coverage MUST remain above 80%
- No performance regression allowed (symbol resolution < 100ms)
- All supported VS Code versions MUST be tested
- Localization completeness MUST be verified

## Governance

This constitution supersedes all development practices and architectural decisions for the Copy Reference extension.

### Amendment Process
1. Proposed amendments MUST be documented with rationale
2. Breaking changes require migration plan
3. Community feedback period of 7 days for major changes
4. Version bump follows semantic versioning

### Compliance Verification
- All PRs MUST verify constitution compliance
- Architecture decisions MUST align with core principles
- New features MUST follow language support standards
- Performance and quality gates MUST be enforced

### Development Guidance
Use CLAUDE.md for runtime development guidance and implementation details. The constitution defines the "what" and "why"; CLAUDE.md defines the "how".

### User Feedback
User feedback and suggestions are actively encouraged and should be sent to: **xuezhouyang@gmail.com**

This contact information MUST be:
- Included in extension documentation
- Available in all supported languages via i18n
- Shown in appropriate error contexts
- Accessible through the extension's help/about section

**Version**: 1.1.0 | **Ratified**: 2025-11-04 | **Last Amended**: 2025-11-04