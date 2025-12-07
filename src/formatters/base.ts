import { IFormatProvider, ReferenceFormatType, FormatVariables } from '../types/formats';

/**
 * Base format provider with common functionality
 */
export abstract class BaseFormatProvider implements IFormatProvider {
    constructor(
        public readonly type: ReferenceFormatType,
        public readonly displayName: string,
        public readonly description: string,
        public readonly example: string
    ) {}

    /**
     * Format the reference - to be implemented by subclasses
     */
    abstract format(variables: FormatVariables): string;

    /**
     * Default: support all languages
     */
    supportsLanguage(_languageId: string): boolean {
        return true;
    }

    /**
     * Helper: build symbol path string
     */
    protected buildSymbolPath(variables: FormatVariables, separator: string = '.'): string {
        const parts: string[] = [];

        if (variables.package) {
            parts.push(variables.package);
        }

        if (variables.class) {
            parts.push(variables.class);
        }

        if (variables.method) {
            parts.push(variables.method);
        } else if (variables.field) {
            parts.push(variables.field);
        }

        return parts.join(separator);
    }

    /**
     * Helper: get file path for display
     */
    protected getDisplayFilePath(variables: FormatVariables): string {
        return variables.file || variables.fileName || '';
    }

    /**
     * Helper: format line number
     */
    protected formatLineNumber(line?: number, prefix: string = ':'): string {
        return line ? `${prefix}${line}` : '';
    }
}
