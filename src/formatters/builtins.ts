import { BaseFormatProvider } from './base';
import { ReferenceFormatType, FormatVariables } from '../types/formats';

/**
 * Qualified format: com.example.Class#method
 */
export class QualifiedFormatProvider extends BaseFormatProvider {
    constructor() {
        super(
            ReferenceFormatType.QUALIFIED,
            'Qualified Reference',
            'Fully qualified reference with package/module name',
            'com.example.UserService#login'
        );
    }

    format(variables: FormatVariables): string {
        const parts: string[] = [];

        // Add package/module
        if (variables.package) {
            parts.push(variables.package);
        }

        // Add class
        if (variables.class) {
            parts.push(variables.class);
        }

        const basePath = parts.join('.');

        // Add method/field
        if (variables.method) {
            return `${basePath}#${variables.method}`;
        } else if (variables.field) {
            return `${basePath}#${variables.field}`;
        }

        return basePath;
    }
}

/**
 * With Line format: com.example.Class#method:42
 */
export class WithLineFormatProvider extends BaseFormatProvider {
    constructor() {
        super(
            ReferenceFormatType.WITH_LINE,
            'With Line Number',
            'Qualified reference with line number',
            'com.example.UserService#login:42'
        );
    }

    format(variables: FormatVariables): string {
        const qualified = new QualifiedFormatProvider().format(variables);
        return qualified + this.formatLineNumber(variables.line);
    }
}

/**
 * File Path format: src/main/Class.java:42
 */
export class FilePathFormatProvider extends BaseFormatProvider {
    constructor() {
        super(
            ReferenceFormatType.FILE_PATH,
            'File Path',
            'Relative file path with line number',
            'src/main/UserService.java:42'
        );
    }

    format(variables: FormatVariables): string {
        const filePath = this.getDisplayFilePath(variables);
        const lineNum = this.formatLineNumber(variables.line);
        return `${filePath}${lineNum}`;
    }
}

/**
 * Markdown format: [Class#method](src/main/Class.java#L42)
 */
export class MarkdownFormatProvider extends BaseFormatProvider {
    constructor() {
        super(
            ReferenceFormatType.MARKDOWN,
            'Markdown Link',
            'Markdown hyperlink format for documentation',
            '[UserService#login](src/main/UserService.java#L42)'
        );
    }

    format(variables: FormatVariables): string {
        // Display text: Class#method or just Class
        let displayText = variables.class || '';
        if (variables.method) {
            displayText += `#${variables.method}`;
        } else if (variables.field) {
            displayText += `#${variables.field}`;
        }

        // Link target: file path with line anchor
        const filePath = this.getDisplayFilePath(variables);
        const lineAnchor = variables.line ? `#L${variables.line}` : '';
        const linkTarget = `${filePath}${lineAnchor}`;

        return `[${displayText}](${linkTarget})`;
    }
}

/**
 * Javadoc format: {@link Class#method()}
 */
export class JavadocFormatProvider extends BaseFormatProvider {
    constructor() {
        super(
            ReferenceFormatType.JAVADOC,
            'Javadoc Style',
            'Javadoc @link tag format',
            '{@link UserService#login()}'
        );
    }

    format(variables: FormatVariables): string {
        let reference = variables.class || '';

        if (variables.method) {
            reference += `#${variables.method}()`;
        } else if (variables.field) {
            reference += `#${variables.field}`;
        }

        return `{@link ${reference}}`;
    }

    supportsLanguage(languageId: string): boolean {
        return languageId === 'java' || languageId === 'kotlin';
    }
}

/**
 * Stack Trace format: at Class.method(Class.java:42)
 */
export class StackTraceFormatProvider extends BaseFormatProvider {
    constructor() {
        super(
            ReferenceFormatType.STACK_TRACE,
            'Stack Trace Style',
            'Java stack trace format for error reporting',
            'at UserService.login(UserService.java:42)'
        );
    }

    format(variables: FormatVariables): string {
        const className = variables.class || 'Unknown';
        const methodName = variables.method || 'unknown';
        const fileName = variables.fileName || 'Unknown.java';
        const line = variables.line || 0;

        return `at ${className}.${methodName}(${fileName}:${line})`;
    }

    supportsLanguage(languageId: string): boolean {
        return languageId === 'java' || languageId === 'kotlin';
    }
}

/**
 * Custom format provider using template string
 */
export class CustomFormatProvider extends BaseFormatProvider {
    constructor(
        private template: string,
        displayName: string = 'Custom Format',
        description: string = 'User-defined format'
    ) {
        super(
            ReferenceFormatType.CUSTOM,
            displayName,
            description,
            template
        );
    }

    format(variables: FormatVariables): string {
        let result = this.template;

        // Replace template variables
        const replacements: Record<string, string> = {
            '${package}': variables.package || '',
            '${class}': variables.class || '',
            '${method}': variables.method || '',
            '${field}': variables.field || '',
            '${file}': variables.file || '',
            '${fileName}': variables.fileName || '',
            '${line}': variables.line?.toString() || '',
            '${column}': variables.column?.toString() || '',
            '${fullReference}': variables.fullReference || '',
            '${separator}': variables.separator || '#',
            '${languageId}': variables.languageId || '',
            '${workspace}': variables.workspace || ''
        };

        for (const [placeholder, value] of Object.entries(replacements)) {
            result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
        }

        return result;
    }
}
