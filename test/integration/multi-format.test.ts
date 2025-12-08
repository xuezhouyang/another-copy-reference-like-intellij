import * as assert from 'assert';
import * as vscode from 'vscode';
import { FormatManager } from '../../src/formatters/manager';
import { ReferenceFormatType, FormatVariables } from '../../src/types/formats';
import { createMockDocument, createMockPosition } from '../helpers/mocks';

/**
 * User Story-based Integration Tests for Multi-Format Reference System
 *
 * These tests verify complete user workflows from end-to-end.
 */
suite('Multi-Format Integration Tests - User Stories', () => {

    suite('User Story 1: Java Developer Copying Method Reference', () => {
        /**
         * As a Java developer,
         * I want to copy a method reference in different formats,
         * So that I can use it in documentation, code reviews, or debugging.
         */

        const javaCode = `package com.example.service;

public class UserService {
    public void authenticate(String username, String password) {
        // Authentication logic
    }

    public User getUserById(Long id) {
        return userRepository.findById(id);
    }
}`;

        const formatManager = FormatManager.getInstance();

        test('Story 1.1: Copy method as qualified reference for internal docs', () => {
            // Given: Cursor on authenticate method at line 4
            const variables: FormatVariables = {
                package: 'com.example.service',
                class: 'UserService',
                method: 'authenticate',
                file: 'src/main/java/com/example/service/UserService.java',
                fileName: 'UserService.java',
                line: 4,
                languageId: 'java'
            };

            // When: User copies with default format
            const result = formatManager.format(variables, ReferenceFormatType.QUALIFIED);

            // Then: Should get qualified reference
            assert.strictEqual(result, 'com.example.service.UserService#authenticate');
        });

        test('Story 1.2: Copy method as Javadoc link for documentation', () => {
            // Given: Same cursor position
            const variables: FormatVariables = {
                package: 'com.example.service',
                class: 'UserService',
                method: 'authenticate',
                languageId: 'java'
            };

            // When: User selects Javadoc format
            const result = formatManager.format(variables, ReferenceFormatType.JAVADOC);

            // Then: Should get Javadoc {@link} tag
            assert.strictEqual(result, '{@link UserService#authenticate()}');
        });

        test('Story 1.3: Copy method with line number for code review', () => {
            // Given: Same cursor position with line number
            const variables: FormatVariables = {
                package: 'com.example.service',
                class: 'UserService',
                method: 'authenticate',
                line: 4
            };

            // When: User selects "With Line Number" format
            const result = formatManager.format(variables, ReferenceFormatType.WITH_LINE);

            // Then: Should include line number
            assert.strictEqual(result, 'com.example.service.UserService#authenticate:4');
        });

        test('Story 1.4: Copy as file path for navigation', () => {
            // Given: Cursor position with file information
            const variables: FormatVariables = {
                file: 'src/main/java/com/example/service/UserService.java',
                line: 4
            };

            // When: User selects file path format
            const result = formatManager.format(variables, ReferenceFormatType.FILE_PATH);

            // Then: Should get file path with line
            assert.strictEqual(result, 'src/main/java/com/example/service/UserService.java:4');
        });

        test('Story 1.5: Copy as stack trace for bug report', () => {
            // Given: Cursor on method for debugging
            const variables: FormatVariables = {
                class: 'UserService',
                method: 'authenticate',
                fileName: 'UserService.java',
                line: 4
            };

            // When: User selects stack trace format
            const result = formatManager.format(variables, ReferenceFormatType.STACK_TRACE);

            // Then: Should get stack trace format
            assert.strictEqual(result, 'at UserService.authenticate(UserService.java:4)');
        });

        test('Story 1.6: Copy as markdown for README', () => {
            // Given: Method reference for documentation
            const variables: FormatVariables = {
                class: 'UserService',
                method: 'authenticate',
                file: 'src/main/java/com/example/service/UserService.java',
                line: 4
            };

            // When: User selects markdown format
            const result = formatManager.format(variables, ReferenceFormatType.MARKDOWN);

            // Then: Should get clickable markdown link
            assert.strictEqual(
                result,
                '[UserService#authenticate](src/main/java/com/example/service/UserService.java#L4)'
            );
        });
    });

    suite('User Story 2: Frontend Developer Copying React Component Reference', () => {
        /**
         * As a frontend developer,
         * I want to copy React component references,
         * So that I can reference them in documentation and team wiki.
         */

        test('Story 2.1: Copy component as qualified reference', () => {
            // Given: Cursor on React component
            const variables: FormatVariables = {
                class: 'UserProfile',
                method: 'render',
                file: 'src/components/UserProfile.tsx',
                line: 15,
                languageId: 'typescriptreact'
            };

            // When: User copies with default format
            const result = formatManager.format(variables, ReferenceFormatType.QUALIFIED);

            // Then: Should get component reference
            assert.strictEqual(result, 'UserProfile#render');
        });

        test('Story 2.2: Copy component as markdown for wiki', () => {
            // Given: React component for documentation
            const variables: FormatVariables = {
                class: 'UserProfile',
                file: 'src/components/UserProfile.tsx',
                line: 10,
                languageId: 'typescriptreact'
            };

            // When: User selects markdown format
            const result = formatManager.format(variables, ReferenceFormatType.MARKDOWN);

            // Then: Should get markdown link
            assert.strictEqual(result, '[UserProfile](src/components/UserProfile.tsx#L10)');
        });

        test('Story 2.3: Copy component file path for import reference', () => {
            // Given: Component location
            const variables: FormatVariables = {
                file: 'src/components/shared/UserProfile.tsx',
                line: 1
            };

            // When: User copies as file path
            const result = formatManager.format(variables, ReferenceFormatType.FILE_PATH);

            // Then: Should get import path
            assert.strictEqual(result, 'src/components/shared/UserProfile.tsx:1');
        });
    });

    suite('User Story 3: Team Lead Setting Up Custom Format', () => {
        /**
         * As a team lead,
         * I want to define custom reference formats,
         * So that my team can use consistent formats in our ticketing system.
         */

        test('Story 3.1: Create JIRA-style reference format', () => {
            // Given: Custom format for JIRA tickets
            const variables: FormatVariables = {
                package: 'com.example',
                class: 'UserService',
                method: 'login',
                file: 'src/UserService.java',
                line: 42
            };

            // When: Format manager uses custom format (simulated)
            const formatManager = FormatManager.getInstance();
            const CustomFormatProvider = require('../../src/formatters/builtins').CustomFormatProvider;

            const jiraFormat = new CustomFormatProvider(
                '[[${file}#L${line}|${class}.${method}]]',
                'JIRA Format',
                'Custom format for JIRA tickets'
            );

            const result = jiraFormat.format(variables);

            // Then: Should match JIRA wiki syntax
            assert.strictEqual(result, '[[src/UserService.java#L42|UserService.login]]');
        });

        test('Story 3.2: Create Slack-style reference format', () => {
            // Given: Custom format for Slack messages
            const variables: FormatVariables = {
                class: 'PaymentService',
                method: 'processPayment',
                file: 'src/services/PaymentService.ts',
                line: 128
            };

            // When: Using Slack format template
            const CustomFormatProvider = require('../../src/formatters/builtins').CustomFormatProvider;
            const slackFormat = new CustomFormatProvider(
                '<${file}#L${line}|${class}.${method}>',
                'Slack Format'
            );

            const result = slackFormat.format(variables);

            // Then: Should match Slack link syntax
            assert.strictEqual(result, '<src/services/PaymentService.ts#L128|PaymentService.processPayment>');
        });

        test('Story 3.3: Create team convention format', () => {
            // Given: Team uses specific format convention
            const variables: FormatVariables = {
                package: 'com.acme.billing',
                class: 'InvoiceGenerator',
                method: 'generatePDF',
                line: 56
            };

            // When: Using custom team format
            const CustomFormatProvider = require('../../src/formatters/builtins').CustomFormatProvider;
            const teamFormat = new CustomFormatProvider(
                '[${package}] ${class}::${method} (Line ${line})',
                'Team Convention'
            );

            const result = teamFormat.format(variables);

            // Then: Should match team format
            assert.strictEqual(result, '[com.acme.billing] InvoiceGenerator::generatePDF (Line 56)');
        });
    });

    suite('User Story 4: Code Reviewer Working Across Languages', () => {
        /**
         * As a code reviewer,
         * I want to copy references from different language files,
         * So that I can provide precise feedback in PR comments.
         */

        test('Story 4.1: Review Java code with line numbers', () => {
            const variables: FormatVariables = {
                package: 'com.app.security',
                class: 'AuthenticationFilter',
                method: 'doFilter',
                line: 89,
                languageId: 'java'
            };

            const result = formatManager.format(variables, ReferenceFormatType.WITH_LINE);
            assert.strictEqual(result, 'com.app.security.AuthenticationFilter#doFilter:89');
        });

        test('Story 4.2: Review Python code with file path', () => {
            const variables: FormatVariables = {
                file: 'src/services/email_sender.py',
                line: 42,
                languageId: 'python'
            };

            const result = formatManager.format(variables, ReferenceFormatType.FILE_PATH);
            assert.strictEqual(result, 'src/services/email_sender.py:42');
        });

        test('Story 4.3: Review JavaScript code with markdown', () => {
            const variables: FormatVariables = {
                class: 'ApiClient',
                method: 'fetchData',
                file: 'src/utils/api-client.js',
                line: 15,
                languageId: 'javascript'
            };

            const result = formatManager.format(variables, ReferenceFormatType.MARKDOWN);
            assert.strictEqual(result, '[ApiClient#fetchData](src/utils/api-client.js#L15)');
        });

        test('Story 4.4: Review TypeScript with qualified reference', () => {
            const variables: FormatVariables = {
                class: 'DataTransformer',
                method: 'transform',
                languageId: 'typescript'
            };

            const result = formatManager.format(variables, ReferenceFormatType.QUALIFIED);
            assert.strictEqual(result, 'DataTransformer#transform');
        });
    });

    suite('User Story 5: Technical Writer Creating Documentation', () => {
        /**
         * As a technical writer,
         * I want to copy code references in documentation-friendly formats,
         * So that I can create accurate API documentation.
         */

        test('Story 5.1: Document public API method in Javadoc', () => {
            const variables: FormatVariables = {
                package: 'com.api.v1',
                class: 'UserController',
                method: 'createUser',
                languageId: 'java'
            };

            const result = formatManager.format(variables, ReferenceFormatType.JAVADOC);
            assert.strictEqual(result, '{@link UserController#createUser()}');
        });

        test('Story 5.2: Create markdown links for README', () => {
            const variables: FormatVariables = {
                class: 'Configuration',
                method: 'loadSettings',
                file: 'docs/api/Configuration.md',
                line: 23
            };

            const result = formatManager.format(variables, ReferenceFormatType.MARKDOWN);
            assert.strictEqual(result, '[Configuration#loadSettings](docs/api/Configuration.md#L23)');
        });

        test('Story 5.3: Reference utility functions', () => {
            const variables: FormatVariables = {
                package: 'utils',
                class: 'StringHelper',
                method: 'sanitize'
            };

            const result = formatManager.format(variables, ReferenceFormatType.QUALIFIED);
            assert.strictEqual(result, 'utils.StringHelper#sanitize');
        });
    });

    suite('User Story 6: Developer Switching Between Formats', () => {
        /**
         * As a developer working on multiple tasks,
         * I want to quickly switch between different reference formats,
         * So that I can adapt to different contexts (docs, debugging, reviews).
         */

        const sharedVariables: FormatVariables = {
            package: 'com.shop.cart',
            class: 'ShoppingCart',
            method: 'addItem',
            file: 'src/main/java/com/shop/cart/ShoppingCart.java',
            fileName: 'ShoppingCart.java',
            line: 67,
            column: 12,
            languageId: 'java'
        };

        test('Story 6.1: All formats work for same location', () => {
            const formats = [
                { type: ReferenceFormatType.QUALIFIED, expected: 'com.shop.cart.ShoppingCart#addItem' },
                { type: ReferenceFormatType.WITH_LINE, expected: 'com.shop.cart.ShoppingCart#addItem:67' },
                { type: ReferenceFormatType.FILE_PATH, expected: 'src/main/java/com/shop/cart/ShoppingCart.java:67' },
                { type: ReferenceFormatType.MARKDOWN, expected: '[ShoppingCart#addItem](src/main/java/com/shop/cart/ShoppingCart.java#L67)' },
                { type: ReferenceFormatType.JAVADOC, expected: '{@link ShoppingCart#addItem()}' },
                { type: ReferenceFormatType.STACK_TRACE, expected: 'at ShoppingCart.addItem(ShoppingCart.java:67)' }
            ];

            formats.forEach(({ type, expected }) => {
                const result = formatManager.format(sharedVariables, type);
                assert.strictEqual(result, expected, `Format ${type} should match expected output`);
            });
        });

        test('Story 6.2: Verify all formats return non-empty strings', () => {
            const allFormats = Object.values(ReferenceFormatType).filter(v => v !== ReferenceFormatType.CUSTOM);

            allFormats.forEach(formatType => {
                const result = formatManager.format(sharedVariables, formatType as ReferenceFormatType);
                assert.ok(result.length > 0, `Format ${formatType} should return non-empty string`);
            });
        });
    });

    suite('User Story 7: Handling Edge Cases and Error Scenarios', () => {
        /**
         * As a user working with incomplete or unusual code,
         * I want the extension to handle edge cases gracefully,
         * So that I always get some useful reference output.
         */

        test('Story 7.1: Copy reference with minimal information', () => {
            const variables: FormatVariables = {
                class: 'SimpleClass'
            };

            const result = formatManager.format(variables, ReferenceFormatType.QUALIFIED);
            assert.strictEqual(result, 'SimpleClass');
        });

        test('Story 7.2: Copy reference for anonymous inner class', () => {
            const variables: FormatVariables = {
                class: 'OuterClass$1',
                method: 'run',
                languageId: 'java'
            };

            const result = formatManager.format(variables, ReferenceFormatType.QUALIFIED);
            assert.strictEqual(result, 'OuterClass$1#run');
        });

        test('Story 7.3: Copy reference with special characters', () => {
            const variables: FormatVariables = {
                package: 'com.example.pkg_v2',
                class: 'Data$Wrapper',
                method: 'get$value'
            };

            const result = formatManager.format(variables, ReferenceFormatType.QUALIFIED);
            assert.strictEqual(result, 'com.example.pkg_v2.Data$Wrapper#get$value');
        });

        test('Story 7.4: Copy reference with very long package name', () => {
            const variables: FormatVariables = {
                package: 'com.enterprise.application.module.submodule.component.service.implementation',
                class: 'LongNamedService',
                method: 'process'
            };

            const result = formatManager.format(variables, ReferenceFormatType.QUALIFIED);
            assert.ok(result.includes('com.enterprise.application'));
            assert.ok(result.includes('LongNamedService#process'));
        });

        test('Story 7.5: Fallback to qualified when invalid format requested', () => {
            const variables: FormatVariables = {
                package: 'com.test',
                class: 'TestClass',
                method: 'testMethod'
            };

            const result = formatManager.format(variables, 'invalid-format' as ReferenceFormatType);
            // Should fallback to qualified format
            assert.strictEqual(result, 'com.test.TestClass#testMethod');
        });

        test('Story 7.6: Handle unicode characters in identifiers', () => {
            const variables: FormatVariables = {
                package: 'com.国际化',
                class: '用户服务',
                method: '获取用户'
            };

            const result = formatManager.format(variables, ReferenceFormatType.QUALIFIED);
            assert.strictEqual(result, 'com.国际化.用户服务#获取用户');
        });
    });

    suite('User Story 8: Language-Specific Format Availability', () => {
        /**
         * As a developer working with different languages,
         * I want to see only applicable formats for each language,
         * So that I don't see Java-specific formats for Python files.
         */

        test('Story 8.1: Java file shows all formats including Javadoc', () => {
            const providers = formatManager.getAvailableProviders('java');

            const hasJavadoc = providers.some(p => p.type === ReferenceFormatType.JAVADOC);
            const hasStackTrace = providers.some(p => p.type === ReferenceFormatType.STACK_TRACE);
            const hasQualified = providers.some(p => p.type === ReferenceFormatType.QUALIFIED);

            assert.strictEqual(hasJavadoc, true, 'Java should have Javadoc format');
            assert.strictEqual(hasStackTrace, true, 'Java should have Stack Trace format');
            assert.strictEqual(hasQualified, true, 'Java should have Qualified format');
        });

        test('Story 8.2: Python file does not show Java-specific formats', () => {
            const providers = formatManager.getAvailableProviders('python');

            const hasJavadoc = providers.some(p => p.type === ReferenceFormatType.JAVADOC);
            const hasStackTrace = providers.some(p => p.type === ReferenceFormatType.STACK_TRACE);
            const hasQualified = providers.some(p => p.type === ReferenceFormatType.QUALIFIED);

            assert.strictEqual(hasJavadoc, false, 'Python should not have Javadoc format');
            assert.strictEqual(hasStackTrace, false, 'Python should not have Stack Trace format');
            assert.strictEqual(hasQualified, true, 'Python should have Qualified format');
        });

        test('Story 8.3: Kotlin file shows Java-compatible formats', () => {
            const providers = formatManager.getAvailableProviders('kotlin');

            const hasJavadoc = providers.some(p => p.type === ReferenceFormatType.JAVADOC);
            const hasStackTrace = providers.some(p => p.type === ReferenceFormatType.STACK_TRACE);

            assert.strictEqual(hasJavadoc, true, 'Kotlin should have Javadoc format');
            assert.strictEqual(hasStackTrace, true, 'Kotlin should have Stack Trace format');
        });

        test('Story 8.4: All languages have common formats', () => {
            const languages = ['java', 'python', 'javascript', 'typescript', 'go'];

            languages.forEach(lang => {
                const providers = formatManager.getAvailableProviders(lang);

                const hasQualified = providers.some(p => p.type === ReferenceFormatType.QUALIFIED);
                const hasMarkdown = providers.some(p => p.type === ReferenceFormatType.MARKDOWN);
                const hasFilePath = providers.some(p => p.type === ReferenceFormatType.FILE_PATH);

                assert.strictEqual(hasQualified, true, `${lang} should have Qualified format`);
                assert.strictEqual(hasMarkdown, true, `${lang} should have Markdown format`);
                assert.strictEqual(hasFilePath, true, `${lang} should have File Path format`);
            });
        });
    });

    suite('User Story 9: Real-World Workflow Simulation', () => {
        /**
         * As a developer in a real workflow,
         * I want to copy references multiple times with different formats,
         * So that I can complete various tasks efficiently.
         */

        test('Story 9.1: Bug fixing workflow', () => {
            // Step 1: Find bug location
            const bugLocation: FormatVariables = {
                package: 'com.app.payment',
                class: 'PaymentProcessor',
                method: 'processRefund',
                file: 'src/main/java/com/app/payment/PaymentProcessor.java',
                fileName: 'PaymentProcessor.java',
                line: 234,
                languageId: 'java'
            };

            // Step 2: Copy as stack trace for bug report
            const bugReport = formatManager.format(bugLocation, ReferenceFormatType.STACK_TRACE);
            assert.strictEqual(bugReport, 'at PaymentProcessor.processRefund(PaymentProcessor.java:234)');

            // Step 3: Copy with line number for team discussion
            const discussion = formatManager.format(bugLocation, ReferenceFormatType.WITH_LINE);
            assert.strictEqual(discussion, 'com.app.payment.PaymentProcessor#processRefund:234');

            // Step 4: Copy as markdown for documentation update
            const docs = formatManager.format(bugLocation, ReferenceFormatType.MARKDOWN);
            assert.strictEqual(
                docs,
                '[PaymentProcessor#processRefund](src/main/java/com/app/payment/PaymentProcessor.java#L234)'
            );
        });

        test('Story 9.2: Code review workflow', () => {
            const reviewLocation: FormatVariables = {
                class: 'UserValidator',
                method: 'validateEmail',
                file: 'src/validators/UserValidator.ts',
                line: 45,
                languageId: 'typescript'
            };

            // Copy for PR comment with line number
            const prComment = formatManager.format(reviewLocation, ReferenceFormatType.WITH_LINE);
            assert.ok(prComment.includes(':45'));

            // Copy as markdown for review summary
            const summary = formatManager.format(reviewLocation, ReferenceFormatType.MARKDOWN);
            assert.ok(summary.includes('[UserValidator#validateEmail]'));
        });
    });
});
