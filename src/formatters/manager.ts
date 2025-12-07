import * as vscode from 'vscode';
import {
    IFormatProvider,
    ReferenceFormatType,
    FormatVariables,
    FormatConfiguration,
    FormatSelection
} from '../types/formats';
import {
    QualifiedFormatProvider,
    WithLineFormatProvider,
    FilePathFormatProvider,
    MarkdownFormatProvider,
    JavadocFormatProvider,
    StackTraceFormatProvider,
    CustomFormatProvider
} from './builtins';

/**
 * Format Manager - manages all format providers and user preferences
 */
export class FormatManager {
    private static instance: FormatManager;
    private providers: Map<ReferenceFormatType, IFormatProvider> = new Map();
    private customProviders: Map<string, IFormatProvider> = new Map();
    private lastUsedFormat: ReferenceFormatType = ReferenceFormatType.QUALIFIED;
    private languageFormats: Map<string, ReferenceFormatType> = new Map();

    private constructor() {
        this.registerBuiltinFormats();
        this.loadConfiguration();
    }

    static getInstance(): FormatManager {
        if (!FormatManager.instance) {
            FormatManager.instance = new FormatManager();
        }
        return FormatManager.instance;
    }

    /**
     * Register built-in format providers
     */
    private registerBuiltinFormats(): void {
        const builtins: IFormatProvider[] = [
            new QualifiedFormatProvider(),
            new WithLineFormatProvider(),
            new FilePathFormatProvider(),
            new MarkdownFormatProvider(),
            new JavadocFormatProvider(),
            new StackTraceFormatProvider()
        ];

        for (const provider of builtins) {
            this.providers.set(provider.type, provider);
        }
    }

    /**
     * Load configuration from VS Code settings
     */
    private loadConfiguration(): void {
        const config = vscode.workspace.getConfiguration('copyReference');

        // Load default format
        const defaultFormat = config.get<string>('defaultFormat');
        if (defaultFormat && this.isValidFormatType(defaultFormat)) {
            this.lastUsedFormat = defaultFormat as ReferenceFormatType;
        }

        // Load language-specific formats
        const languageFormats = config.get<Record<string, string>>('languageFormats');
        if (languageFormats) {
            for (const [lang, format] of Object.entries(languageFormats)) {
                if (this.isValidFormatType(format)) {
                    this.languageFormats.set(lang, format as ReferenceFormatType);
                }
            }
        }

        // Load custom formats
        const customFormats = config.get<Record<string, string>>('customFormats');
        if (customFormats) {
            for (const [name, template] of Object.entries(customFormats)) {
                const provider = new CustomFormatProvider(
                    template,
                    name,
                    `Custom format: ${name}`
                );
                this.customProviders.set(name, provider);
            }
        }
    }

    /**
     * Validate format type
     */
    private isValidFormatType(type: string): boolean {
        return Object.values(ReferenceFormatType).includes(type as ReferenceFormatType);
    }

    /**
     * Get format provider by type
     */
    getProvider(type: ReferenceFormatType): IFormatProvider | undefined {
        return this.providers.get(type);
    }

    /**
     * Get custom format provider by name
     */
    getCustomProvider(name: string): IFormatProvider | undefined {
        return this.customProviders.get(name);
    }

    /**
     * Get all available providers for a language
     */
    getAvailableProviders(languageId: string): IFormatProvider[] {
        const providers: IFormatProvider[] = [];

        // Add built-in providers that support this language
        for (const provider of this.providers.values()) {
            if (provider.supportsLanguage(languageId)) {
                providers.push(provider);
            }
        }

        // Add custom providers
        for (const provider of this.customProviders.values()) {
            providers.push(provider);
        }

        return providers;
    }

    /**
     * Get default format for language
     */
    getDefaultFormat(languageId: string): ReferenceFormatType {
        return this.languageFormats.get(languageId) || this.lastUsedFormat;
    }

    /**
     * Set last used format
     */
    setLastUsedFormat(format: ReferenceFormatType): void {
        this.lastUsedFormat = format;
    }

    /**
     * Format reference using specified provider
     */
    format(variables: FormatVariables, formatType?: ReferenceFormatType): string {
        const type = formatType || this.getDefaultFormat(variables.languageId || '');
        const provider = this.getProvider(type);

        if (!provider) {
            // Fallback to qualified format
            const fallback = this.getProvider(ReferenceFormatType.QUALIFIED);
            return fallback?.format(variables) || '';
        }

        return provider.format(variables);
    }

    /**
     * Show format picker and get user selection
     */
    async showFormatPicker(languageId: string): Promise<FormatSelection | undefined> {
        const providers = this.getAvailableProviders(languageId);

        interface FormatQuickPickItem extends vscode.QuickPickItem {
            formatType: ReferenceFormatType;
            customName?: string;
        }

        const items: FormatQuickPickItem[] = providers.map(provider => ({
            label: provider.displayName,
            description: provider.description,
            detail: `Example: ${provider.example}`,
            formatType: provider.type,
            customName: provider.type === ReferenceFormatType.CUSTOM ? provider.displayName : undefined
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Choose reference format',
            matchOnDescription: true,
            matchOnDetail: true
        });

        if (!selected) {
            return undefined;
        }

        // Ask if user wants to remember this choice
        const config = vscode.workspace.getConfiguration('copyReference');
        const rememberLastFormat = config.get<boolean>('rememberLastFormat', true);

        return {
            format: selected.formatType,
            customName: selected.customName,
            remember: rememberLastFormat
        };
    }

    /**
     * Get configuration
     */
    getConfiguration(): FormatConfiguration {
        const config = vscode.workspace.getConfiguration('copyReference');

        return {
            defaultFormat: this.lastUsedFormat,
            showFormatPicker: config.get<boolean>('showFormatPicker', false),
            rememberLastFormat: config.get<boolean>('rememberLastFormat', true),
            languageFormats: config.get<Record<string, ReferenceFormatType>>('languageFormats'),
            customFormats: config.get<Record<string, string>>('customFormats'),
            includeLineNumber: config.get<boolean>('includeLineNumber', false),
            includeFilePath: config.get<boolean>('includeFilePath', false)
        };
    }
}
