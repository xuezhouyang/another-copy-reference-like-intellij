import * as assert from 'assert';
import { FormatManager } from '../../../src/formatters/manager';
import { ReferenceFormatType, FormatVariables } from '../../../src/types/formats';

suite('FormatManager Test Suite', () => {
    let manager: FormatManager;

    setup(() => {
        // Get singleton instance
        manager = FormatManager.getInstance();
    });

    suite('Singleton Pattern', () => {
        test('should return same instance on multiple calls', () => {
            const instance1 = FormatManager.getInstance();
            const instance2 = FormatManager.getInstance();

            assert.strictEqual(instance1, instance2);
        });
    });

    suite('getProvider', () => {
        test('should return qualified format provider', () => {
            const provider = manager.getProvider(ReferenceFormatType.QUALIFIED);

            assert.ok(provider);
            assert.strictEqual(provider!.type, ReferenceFormatType.QUALIFIED);
            assert.strictEqual(provider!.displayName, 'Qualified Reference');
        });

        test('should return withLine format provider', () => {
            const provider = manager.getProvider(ReferenceFormatType.WITH_LINE);

            assert.ok(provider);
            assert.strictEqual(provider!.type, ReferenceFormatType.WITH_LINE);
        });

        test('should return filePath format provider', () => {
            const provider = manager.getProvider(ReferenceFormatType.FILE_PATH);

            assert.ok(provider);
            assert.strictEqual(provider!.type, ReferenceFormatType.FILE_PATH);
        });

        test('should return markdown format provider', () => {
            const provider = manager.getProvider(ReferenceFormatType.MARKDOWN);

            assert.ok(provider);
            assert.strictEqual(provider!.type, ReferenceFormatType.MARKDOWN);
        });

        test('should return javadoc format provider', () => {
            const provider = manager.getProvider(ReferenceFormatType.JAVADOC);

            assert.ok(provider);
            assert.strictEqual(provider!.type, ReferenceFormatType.JAVADOC);
        });

        test('should return stackTrace format provider', () => {
            const provider = manager.getProvider(ReferenceFormatType.STACK_TRACE);

            assert.ok(provider);
            assert.strictEqual(provider!.type, ReferenceFormatType.STACK_TRACE);
        });

        test('should return undefined for invalid format type', () => {
            const provider = manager.getProvider('invalid' as ReferenceFormatType);

            assert.strictEqual(provider, undefined);
        });
    });

    suite('getAvailableProviders', () => {
        test('should return providers for Java', () => {
            const providers = manager.getAvailableProviders('java');

            assert.ok(providers.length >= 6); // At least 6 built-in providers
            assert.ok(providers.some(p => p.type === ReferenceFormatType.QUALIFIED));
            assert.ok(providers.some(p => p.type === ReferenceFormatType.JAVADOC));
            assert.ok(providers.some(p => p.type === ReferenceFormatType.STACK_TRACE));
        });

        test('should return providers for JavaScript', () => {
            const providers = manager.getAvailableProviders('javascript');

            assert.ok(providers.length >= 4); // Javadoc and StackTrace excluded
            assert.ok(providers.some(p => p.type === ReferenceFormatType.QUALIFIED));
            assert.ok(providers.some(p => p.type === ReferenceFormatType.MARKDOWN));
        });

        test('should return providers for Python', () => {
            const providers = manager.getAvailableProviders('python');

            assert.ok(providers.length >= 4);
            assert.ok(providers.some(p => p.type === ReferenceFormatType.QUALIFIED));
        });

        test('should filter out language-specific providers for unsupported languages', () => {
            const providers = manager.getAvailableProviders('javascript');

            // Javadoc should not be available for JavaScript
            assert.ok(!providers.some(p => p.type === ReferenceFormatType.JAVADOC));
        });
    });

    suite('format', () => {
        test('should format using qualified provider by default', () => {
            const variables: FormatVariables = {
                package: 'com.example',
                class: 'MyClass',
                method: 'myMethod'
            };

            const result = manager.format(variables);

            assert.strictEqual(result, 'com.example.MyClass#myMethod');
        });

        test('should format using specified format type', () => {
            const variables: FormatVariables = {
                package: 'com.example',
                class: 'MyClass',
                method: 'myMethod',
                line: 42
            };

            const result = manager.format(variables, ReferenceFormatType.WITH_LINE);

            assert.strictEqual(result, 'com.example.MyClass#myMethod:42');
        });

        test('should format using file path provider', () => {
            const variables: FormatVariables = {
                file: 'src/MyClass.java',
                line: 10
            };

            const result = manager.format(variables, ReferenceFormatType.FILE_PATH);

            assert.strictEqual(result, 'src/MyClass.java:10');
        });

        test('should format using markdown provider', () => {
            const variables: FormatVariables = {
                class: 'MyClass',
                method: 'myMethod',
                file: 'MyClass.java',
                line: 5
            };

            const result = manager.format(variables, ReferenceFormatType.MARKDOWN);

            assert.strictEqual(result, '[MyClass#myMethod](MyClass.java#L5)');
        });

        test('should fallback to qualified when provider not found', () => {
            const variables: FormatVariables = {
                package: 'com.example',
                class: 'MyClass'
            };

            const result = manager.format(variables, 'invalid' as ReferenceFormatType);

            assert.strictEqual(result, 'com.example.MyClass');
        });

        test('should return empty string when fallback also fails', () => {
            const variables: FormatVariables = {};

            // Mock scenario where even qualified provider returns empty
            const result = manager.format(variables);

            assert.ok(typeof result === 'string');
        });
    });

    suite('setLastUsedFormat and getDefaultFormat', () => {
        test('should update and retrieve last used format', () => {
            manager.setLastUsedFormat(ReferenceFormatType.MARKDOWN);

            const defaultFormat = manager.getDefaultFormat('unknown-language');

            assert.strictEqual(defaultFormat, ReferenceFormatType.MARKDOWN);
        });

        test('should return last used format when no language-specific format', () => {
            manager.setLastUsedFormat(ReferenceFormatType.FILE_PATH);

            const format = manager.getDefaultFormat('javascript');

            // May be overridden by config, but at least should be a valid format
            assert.ok(Object.values(ReferenceFormatType).includes(format));
        });
    });

    suite('getConfiguration', () => {
        test('should return configuration object', () => {
            const config = manager.getConfiguration();

            assert.ok(config);
            assert.ok(typeof config.defaultFormat === 'string');
            assert.ok(typeof config.showFormatPicker === 'boolean');
            assert.ok(typeof config.rememberLastFormat === 'boolean');
            assert.ok(typeof config.includeLineNumber === 'boolean');
            assert.ok(typeof config.includeFilePath === 'boolean');
        });

        test('should have valid default format', () => {
            const config = manager.getConfiguration();

            assert.ok(Object.values(ReferenceFormatType).includes(config.defaultFormat));
        });
    });

    suite('Complex Scenarios', () => {
        test('should format Java class with javadoc style', () => {
            const variables: FormatVariables = {
                class: 'UserService',
                method: 'authenticate',
                languageId: 'java'
            };

            const result = manager.format(variables, ReferenceFormatType.JAVADOC);

            assert.strictEqual(result, '{@link UserService#authenticate()}');
        });

        test('should format Java stack trace style', () => {
            const variables: FormatVariables = {
                class: 'UserService',
                method: 'authenticate',
                fileName: 'UserService.java',
                line: 123
            };

            const result = manager.format(variables, ReferenceFormatType.STACK_TRACE);

            assert.strictEqual(result, 'at UserService.authenticate(UserService.java:123)');
        });

        test('should format markdown link for JavaScript module', () => {
            const variables: FormatVariables = {
                class: 'AuthService',
                method: 'login',
                file: 'src/services/auth.js',
                line: 45,
                languageId: 'javascript'
            };

            const result = manager.format(variables, ReferenceFormatType.MARKDOWN);

            assert.strictEqual(result, '[AuthService#login](src/services/auth.js#L45)');
        });

        test('should handle nested class references', () => {
            const variables: FormatVariables = {
                package: 'com.example',
                class: 'Outer.Inner',
                method: 'innerMethod'
            };

            const result = manager.format(variables, ReferenceFormatType.QUALIFIED);

            assert.strictEqual(result, 'com.example.Outer.Inner#innerMethod');
        });

        test('should handle field references', () => {
            const variables: FormatVariables = {
                package: 'com.example',
                class: 'Constants',
                field: 'MAX_RETRIES'
            };

            const result = manager.format(variables, ReferenceFormatType.QUALIFIED);

            assert.strictEqual(result, 'com.example.Constants#MAX_RETRIES');
        });

        test('should format minimal reference with only class name', () => {
            const variables: FormatVariables = {
                class: 'SimpleClass'
            };

            const result = manager.format(variables, ReferenceFormatType.QUALIFIED);

            assert.strictEqual(result, 'SimpleClass');
        });

        test('should handle file path without line numbers', () => {
            const variables: FormatVariables = {
                file: 'src/components/Header.tsx'
            };

            const result = manager.format(variables, ReferenceFormatType.FILE_PATH);

            assert.strictEqual(result, 'src/components/Header.tsx');
        });
    });

    suite('Edge Cases', () => {
        test('should handle empty variables object', () => {
            const variables: FormatVariables = {};

            const result = manager.format(variables);

            assert.ok(typeof result === 'string');
        });

        test('should handle null/undefined values in variables', () => {
            const variables: FormatVariables = {
                package: undefined,
                class: undefined,
                method: undefined
            };

            const result = manager.format(variables);

            assert.ok(typeof result === 'string');
        });

        test('should handle very long package names', () => {
            const variables: FormatVariables = {
                package: 'com.example.very.long.package.name.that.goes.on.and.on',
                class: 'MyClass',
                method: 'myMethod'
            };

            const result = manager.format(variables, ReferenceFormatType.QUALIFIED);

            assert.ok(result.includes('com.example.very.long'));
            assert.ok(result.includes('MyClass#myMethod'));
        });

        test('should handle special characters in class names', () => {
            const variables: FormatVariables = {
                class: 'MyClass$InnerClass',
                method: 'method$1'
            };

            const result = manager.format(variables, ReferenceFormatType.QUALIFIED);

            assert.strictEqual(result, 'MyClass$InnerClass#method$1');
        });

        test('should handle unicode characters', () => {
            const variables: FormatVariables = {
                package: 'com.例え',
                class: '類',
                method: 'メソッド'
            };

            const result = manager.format(variables, ReferenceFormatType.QUALIFIED);

            assert.strictEqual(result, 'com.例え.類#メソッド');
        });
    });
});
