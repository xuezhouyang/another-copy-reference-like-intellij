/**
 * Reference format types
 */
export enum ReferenceFormatType {
    /** Fully qualified reference: com.example.Class#method */
    QUALIFIED = 'qualified',

    /** With line number: com.example.Class#method:42 */
    WITH_LINE = 'withLine',

    /** File path with line: src/main/Class.java:42 */
    FILE_PATH = 'filePath',

    /** Markdown link: [Class#method](src/main/Class.java#L42) */
    MARKDOWN = 'markdown',

    /** Javadoc style: {@link Class#method()} */
    JAVADOC = 'javadoc',

    /** Stack trace style: at Class.method(Class.java:42) */
    STACK_TRACE = 'stackTrace',

    /** Custom user-defined format */
    CUSTOM = 'custom'
}

/**
 * Format template variables
 */
export interface FormatVariables {
    /** Package or module name */
    package?: string;

    /** Class or type name */
    class?: string;

    /** Method or function name */
    method?: string;

    /** Field or property name */
    field?: string;

    /** File path (relative to workspace) */
    file?: string;

    /** File name only */
    fileName?: string;

    /** Line number (1-based) */
    line?: number;

    /** Column number (1-based) */
    column?: number;

    /** Full qualified reference */
    fullReference?: string;

    /** Symbol path array */
    symbolPath?: string[];

    /** Separator (# or .) */
    separator?: string;

    /** Language ID */
    languageId?: string;

    /** Workspace name */
    workspace?: string;
}

/**
 * Format provider interface
 */
export interface IFormatProvider {
    /**
     * Format type identifier
     */
    readonly type: ReferenceFormatType;

    /**
     * Display name for UI
     */
    readonly displayName: string;

    /**
     * Format description
     */
    readonly description: string;

    /**
     * Example output
     */
    readonly example: string;

    /**
     * Format the reference using provided variables
     */
    format(variables: FormatVariables): string;

    /**
     * Check if this format is applicable for the given language
     */
    supportsLanguage(languageId: string): boolean;
}

/**
 * Format configuration
 */
export interface FormatConfiguration {
    /** Default format type */
    defaultFormat: ReferenceFormatType;

    /** Show format picker on copy */
    showFormatPicker: boolean;

    /** Remember last used format */
    rememberLastFormat: boolean;

    /** Language-specific default formats */
    languageFormats?: Record<string, ReferenceFormatType>;

    /** Custom format templates */
    customFormats?: Record<string, string>;

    /** Include line numbers by default */
    includeLineNumber: boolean;

    /** Include file path by default */
    includeFilePath: boolean;
}

/**
 * Format selection result
 */
export interface FormatSelection {
    /** Selected format type */
    format: ReferenceFormatType;

    /** Custom format name (if applicable) */
    customName?: string;

    /** Whether to remember this choice */
    remember: boolean;
}
