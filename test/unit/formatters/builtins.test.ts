import * as assert from 'assert';
import {
    QualifiedFormatProvider,
    WithLineFormatProvider,
    FilePathFormatProvider,
    MarkdownFormatProvider,
    JavadocFormatProvider,
    StackTraceFormatProvider,
    CustomFormatProvider
} from '../../../src/formatters/builtins';
import { FormatVariables, ReferenceFormatType } from '../../../src/types/formats';

suite('Built-in Format Providers Test Suite', () => {

    suite('QualifiedFormatProvider', () => {
        let provider: QualifiedFormatProvider;

        setup(() => {
            provider = new QualifiedFormatProvider();
        });

        test('should have correct metadata', () => {
            assert.strictEqual(provider.type, ReferenceFormatType.QUALIFIED);
            assert.strictEqual(provider.displayName, 'Qualified Reference');
            assert.ok(provider.description.length > 0);
            assert.ok(provider.example.length > 0);
        });

        test('should format full qualified reference with method', () => {
            const variables: FormatVariables = {
                package: 'com.example',
                class: 'UserService',
                method: 'login'
            };

            const result = provider.format(variables);
            assert.strictEqual(result, 'com.example.UserService#login');
        });

        test('should format qualified reference with field', () => {
            const variables: FormatVariables = {
                package: 'com.example',
                class: 'Constants',
                field: 'MAX_SIZE'
            };

            const result = provider.format(variables);
            assert.strictEqual(result, 'com.example.Constants#MAX_SIZE');
        });

        test('should format class-only reference', () => {
            const variables: FormatVariables = {
                package: 'com.example',
                class: 'MyClass'
            };

            const result = provider.format(variables);
            assert.strictEqual(result, 'com.example.MyClass');
        });

        test('should handle missing package', () => {
            const variables: FormatVariables = {
                class: 'MyClass',
                method: 'myMethod'
            };

            const result = provider.format(variables);
            assert.strictEqual(result, 'MyClass#myMethod');
        });

        test('should prefer method over field', () => {
            const variables: FormatVariables = {
                class: 'MyClass',
                method: 'myMethod',
                field: 'myField'
            };

            const result = provider.format(variables);
            assert.strictEqual(result, 'MyClass#myMethod');
        });
    });

    suite('WithLineFormatProvider', () => {
        let provider: WithLineFormatProvider;

        setup(() => {
            provider = new WithLineFormatProvider();
        });

        test('should have correct metadata', () => {
            assert.strictEqual(provider.type, ReferenceFormatType.WITH_LINE);
            assert.strictEqual(provider.displayName, 'With Line Number');
        });

        test('should format reference with line number', () => {
            const variables: FormatVariables = {
                package: 'com.example',
                class: 'UserService',
                method: 'login',
                line: 42
            };

            const result = provider.format(variables);
            assert.strictEqual(result, 'com.example.UserService#login:42');
        });

        test('should format reference without line number', () => {
            const variables: FormatVariables = {
                package: 'com.example',
                class: 'UserService',
                method: 'login'
            };

            const result = provider.format(variables);
            assert.strictEqual(result, 'com.example.UserService#login');
        });

        test('should handle line number 0', () => {
            const variables: FormatVariables = {
                class: 'MyClass',
                line: 0
            };

            const result = provider.format(variables);
            assert.strictEqual(result, 'MyClass:0');
        });
    });

    suite('FilePathFormatProvider', () => {
        let provider: FilePathFormatProvider;

        setup(() => {
            provider = new FilePathFormatProvider();
        });

        test('should have correct metadata', () => {
            assert.strictEqual(provider.type, ReferenceFormatType.FILE_PATH);
            assert.strictEqual(provider.displayName, 'File Path');
        });

        test('should format file path with line number', () => {
            const variables: FormatVariables = {
                file: 'src/main/UserService.java',
                line: 42
            };

            const result = provider.format(variables);
            assert.strictEqual(result, 'src/main/UserService.java:42');
        });

        test('should format file path without line number', () => {
            const variables: FormatVariables = {
                file: 'src/main/UserService.java'
            };

            const result = provider.format(variables);
            assert.strictEqual(result, 'src/main/UserService.java');
        });

        test('should use fileName when file not available', () => {
            const variables: FormatVariables = {
                fileName: 'UserService.java',
                line: 10
            };

            const result = provider.format(variables);
            assert.strictEqual(result, 'UserService.java:10');
        });
    });

    suite('MarkdownFormatProvider', () => {
        let provider: MarkdownFormatProvider;

        setup(() => {
            provider = new MarkdownFormatProvider();
        });

        test('should have correct metadata', () => {
            assert.strictEqual(provider.type, ReferenceFormatType.MARKDOWN);
            assert.strictEqual(provider.displayName, 'Markdown Link');
        });

        test('should format markdown link with method', () => {
            const variables: FormatVariables = {
                class: 'UserService',
                method: 'login',
                file: 'src/main/UserService.java',
                line: 42
            };

            const result = provider.format(variables);
            assert.strictEqual(result, '[UserService#login](src/main/UserService.java#L42)');
        });

        test('should format markdown link with class only', () => {
            const variables: FormatVariables = {
                class: 'UserService',
                file: 'src/main/UserService.java'
            };

            const result = provider.format(variables);
            assert.strictEqual(result, '[UserService](src/main/UserService.java)');
        });

        test('should format markdown link with field', () => {
            const variables: FormatVariables = {
                class: 'Constants',
                field: 'MAX_SIZE',
                file: 'src/Constants.java',
                line: 10
            };

            const result = provider.format(variables);
            assert.strictEqual(result, '[Constants#MAX_SIZE](src/Constants.java#L10)');
        });

        test('should handle missing line number', () => {
            const variables: FormatVariables = {
                class: 'MyClass',
                method: 'myMethod',
                file: 'MyClass.java'
            };

            const result = provider.format(variables);
            assert.strictEqual(result, '[MyClass#myMethod](MyClass.java)');
        });

        test('should handle empty class name', () => {
            const variables: FormatVariables = {
                file: 'script.js',
                line: 5
            };

            const result = provider.format(variables);
            assert.strictEqual(result, '[](script.js#L5)');
        });
    });

    suite('JavadocFormatProvider', () => {
        let provider: JavadocFormatProvider;

        setup(() => {
            provider = new JavadocFormatProvider();
        });

        test('should have correct metadata', () => {
            assert.strictEqual(provider.type, ReferenceFormatType.JAVADOC);
            assert.strictEqual(provider.displayName, 'Javadoc Style');
        });

        test('should format javadoc link with method', () => {
            const variables: FormatVariables = {
                class: 'UserService',
                method: 'login'
            };

            const result = provider.format(variables);
            assert.strictEqual(result, '{@link UserService#login()}');
        });

        test('should format javadoc link with field', () => {
            const variables: FormatVariables = {
                class: 'Constants',
                field: 'MAX_SIZE'
            };

            const result = provider.format(variables);
            assert.strictEqual(result, '{@link Constants#MAX_SIZE}');
        });

        test('should format javadoc link for class only', () => {
            const variables: FormatVariables = {
                class: 'UserService'
            };

            const result = provider.format(variables);
            assert.strictEqual(result, '{@link UserService}');
        });

        test('should support Java language', () => {
            assert.strictEqual(provider.supportsLanguage('java'), true);
        });

        test('should support Kotlin language', () => {
            assert.strictEqual(provider.supportsLanguage('kotlin'), true);
        });

        test('should not support other languages', () => {
            assert.strictEqual(provider.supportsLanguage('javascript'), false);
            assert.strictEqual(provider.supportsLanguage('python'), false);
        });
    });

    suite('StackTraceFormatProvider', () => {
        let provider: StackTraceFormatProvider;

        setup(() => {
            provider = new StackTraceFormatProvider();
        });

        test('should have correct metadata', () => {
            assert.strictEqual(provider.type, ReferenceFormatType.STACK_TRACE);
            assert.strictEqual(provider.displayName, 'Stack Trace Style');
        });

        test('should format stack trace style reference', () => {
            const variables: FormatVariables = {
                class: 'UserService',
                method: 'login',
                fileName: 'UserService.java',
                line: 42
            };

            const result = provider.format(variables);
            assert.strictEqual(result, 'at UserService.login(UserService.java:42)');
        });

        test('should handle missing class name with default', () => {
            const variables: FormatVariables = {
                method: 'myMethod',
                fileName: 'Script.java',
                line: 10
            };

            const result = provider.format(variables);
            assert.strictEqual(result, 'at Unknown.myMethod(Script.java:10)');
        });

        test('should handle missing method name with default', () => {
            const variables: FormatVariables = {
                class: 'MyClass',
                fileName: 'MyClass.java',
                line: 5
            };

            const result = provider.format(variables);
            assert.strictEqual(result, 'at MyClass.unknown(MyClass.java:5)');
        });

        test('should handle missing file name with default', () => {
            const variables: FormatVariables = {
                class: 'MyClass',
                method: 'myMethod',
                line: 1
            };

            const result = provider.format(variables);
            assert.strictEqual(result, 'at MyClass.myMethod(Unknown.java:1)');
        });

        test('should handle missing line number with default', () => {
            const variables: FormatVariables = {
                class: 'MyClass',
                method: 'myMethod',
                fileName: 'MyClass.java'
            };

            const result = provider.format(variables);
            assert.strictEqual(result, 'at MyClass.myMethod(MyClass.java:0)');
        });

        test('should support Java language', () => {
            assert.strictEqual(provider.supportsLanguage('java'), true);
        });

        test('should support Kotlin language', () => {
            assert.strictEqual(provider.supportsLanguage('kotlin'), true);
        });

        test('should not support other languages', () => {
            assert.strictEqual(provider.supportsLanguage('javascript'), false);
        });
    });

    suite('CustomFormatProvider', () => {
        test('should format using template with all variables', () => {
            const template = '${package}.${class}::${method} @ ${file}:${line}';
            const provider = new CustomFormatProvider(template, 'Custom', 'Custom format');

            const variables: FormatVariables = {
                package: 'com.example',
                class: 'MyClass',
                method: 'myMethod',
                file: 'MyClass.java',
                line: 42
            };

            const result = provider.format(variables);
            assert.strictEqual(result, 'com.example.MyClass::myMethod @ MyClass.java:42');
        });

        test('should handle missing variables gracefully', () => {
            const template = '${package}.${class}#${method}:${line}';
            const provider = new CustomFormatProvider(template);

            const variables: FormatVariables = {
                class: 'MyClass',
                method: 'myMethod'
            };

            const result = provider.format(variables);
            assert.strictEqual(result, '.MyClass#myMethod:');
        });

        test('should replace all occurrences of a variable', () => {
            const template = '${class} - ${class} - ${class}';
            const provider = new CustomFormatProvider(template);

            const variables: FormatVariables = {
                class: 'MyClass'
            };

            const result = provider.format(variables);
            assert.strictEqual(result, 'MyClass - MyClass - MyClass');
        });

        test('should support all format variables', () => {
            const template = '${package}|${class}|${method}|${field}|${file}|${fileName}|${line}|${column}|${separator}|${languageId}|${workspace}';
            const provider = new CustomFormatProvider(template);

            const variables: FormatVariables = {
                package: 'pkg',
                class: 'Cls',
                method: 'mth',
                field: 'fld',
                file: 'f.java',
                fileName: 'f.java',
                line: 1,
                column: 2,
                separator: '#',
                languageId: 'java',
                workspace: 'ws'
            };

            const result = provider.format(variables);
            assert.strictEqual(result, 'pkg|Cls|mth|fld|f.java|f.java|1|2|#|java|ws');
        });

        test('should use default separator when not provided', () => {
            const template = 'sep=${separator}';
            const provider = new CustomFormatProvider(template);

            const variables: FormatVariables = {};

            const result = provider.format(variables);
            assert.strictEqual(result, 'sep=#');
        });

        test('should have correct metadata', () => {
            const provider = new CustomFormatProvider(
                'template',
                'My Custom Format',
                'Custom description'
            );

            assert.strictEqual(provider.type, ReferenceFormatType.CUSTOM);
            assert.strictEqual(provider.displayName, 'My Custom Format');
            assert.strictEqual(provider.description, 'Custom description');
        });

        test('should use default display name and description', () => {
            const provider = new CustomFormatProvider('template');

            assert.strictEqual(provider.displayName, 'Custom Format');
            assert.strictEqual(provider.description, 'User-defined format');
        });

        test('should handle template with special regex characters', () => {
            const template = '${class}(){}[].*+?^$|\\';
            const provider = new CustomFormatProvider(template);

            const variables: FormatVariables = {
                class: 'MyClass'
            };

            const result = provider.format(variables);
            assert.strictEqual(result, 'MyClass(){}[].*+?^$|\\');
        });
    });
});
