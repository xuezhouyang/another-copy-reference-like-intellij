import * as assert from 'assert';
import { BaseFormatProvider } from '../../../src/formatters/base';
import { ReferenceFormatType, FormatVariables } from '../../../src/types/formats';

// Concrete implementation for testing
class TestFormatProvider extends BaseFormatProvider {
    constructor() {
        super(
            ReferenceFormatType.QUALIFIED,
            'Test Format',
            'Test description',
            'test.example'
        );
    }

    format(variables: FormatVariables): string {
        return `${variables.class}#${variables.method}`;
    }
}

suite('BaseFormatProvider Test Suite', () => {
    let provider: TestFormatProvider;

    setup(() => {
        provider = new TestFormatProvider();
    });

    suite('Constructor', () => {
        test('should initialize with correct properties', () => {
            assert.strictEqual(provider.type, ReferenceFormatType.QUALIFIED);
            assert.strictEqual(provider.displayName, 'Test Format');
            assert.strictEqual(provider.description, 'Test description');
            assert.strictEqual(provider.example, 'test.example');
        });
    });

    suite('supportsLanguage', () => {
        test('should support all languages by default', () => {
            assert.strictEqual(provider.supportsLanguage('java'), true);
            assert.strictEqual(provider.supportsLanguage('python'), true);
            assert.strictEqual(provider.supportsLanguage('javascript'), true);
            assert.strictEqual(provider.supportsLanguage('unknown'), true);
        });
    });

    suite('buildSymbolPath', () => {
        test('should build symbol path with default separator', () => {
            const variables: FormatVariables = {
                package: 'com.example',
                class: 'MyClass',
                method: 'myMethod'
            };

            const path = (provider as any).buildSymbolPath(variables);
            assert.strictEqual(path, 'com.example.MyClass.myMethod');
        });

        test('should build symbol path with custom separator', () => {
            const variables: FormatVariables = {
                package: 'com.example',
                class: 'MyClass',
                method: 'myMethod'
            };

            const path = (provider as any).buildSymbolPath(variables, '/');
            assert.strictEqual(path, 'com.example/MyClass/myMethod');
        });

        test('should handle missing package', () => {
            const variables: FormatVariables = {
                class: 'MyClass',
                method: 'myMethod'
            };

            const path = (provider as any).buildSymbolPath(variables);
            assert.strictEqual(path, 'MyClass.myMethod');
        });

        test('should handle field instead of method', () => {
            const variables: FormatVariables = {
                package: 'com.example',
                class: 'MyClass',
                field: 'myField'
            };

            const path = (provider as any).buildSymbolPath(variables);
            assert.strictEqual(path, 'com.example.MyClass.myField');
        });

        test('should prefer method over field', () => {
            const variables: FormatVariables = {
                class: 'MyClass',
                method: 'myMethod',
                field: 'myField'
            };

            const path = (provider as any).buildSymbolPath(variables);
            assert.strictEqual(path, 'MyClass.myMethod');
        });

        test('should handle only class', () => {
            const variables: FormatVariables = {
                class: 'MyClass'
            };

            const path = (provider as any).buildSymbolPath(variables);
            assert.strictEqual(path, 'MyClass');
        });

        test('should handle empty variables', () => {
            const variables: FormatVariables = {};

            const path = (provider as any).buildSymbolPath(variables);
            assert.strictEqual(path, '');
        });
    });

    suite('getDisplayFilePath', () => {
        test('should return file path when available', () => {
            const variables: FormatVariables = {
                file: 'src/main/java/MyClass.java',
                fileName: 'MyClass.java'
            };

            const filePath = (provider as any).getDisplayFilePath(variables);
            assert.strictEqual(filePath, 'src/main/java/MyClass.java');
        });

        test('should fallback to fileName when file not available', () => {
            const variables: FormatVariables = {
                fileName: 'MyClass.java'
            };

            const filePath = (provider as any).getDisplayFilePath(variables);
            assert.strictEqual(filePath, 'MyClass.java');
        });

        test('should return empty string when both missing', () => {
            const variables: FormatVariables = {};

            const filePath = (provider as any).getDisplayFilePath(variables);
            assert.strictEqual(filePath, '');
        });
    });

    suite('formatLineNumber', () => {
        test('should format line number with default colon prefix', () => {
            const formatted = (provider as any).formatLineNumber(42);
            assert.strictEqual(formatted, ':42');
        });

        test('should format line number with custom prefix', () => {
            const formatted = (provider as any).formatLineNumber(42, '#L');
            assert.strictEqual(formatted, '#L42');
        });

        test('should return empty string when line number is undefined', () => {
            const formatted = (provider as any).formatLineNumber(undefined);
            assert.strictEqual(formatted, '');
        });

        test('should handle line number 0', () => {
            const formatted = (provider as any).formatLineNumber(0);
            assert.strictEqual(formatted, ':0');
        });

        test('should handle large line numbers', () => {
            const formatted = (provider as any).formatLineNumber(99999);
            assert.strictEqual(formatted, ':99999');
        });
    });
});
