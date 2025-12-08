import * as vscode from 'vscode';
import { TelemetryReporter } from './telemetry';

/**
 * Feedback type enumeration
 */
export enum FeedbackType {
    BUG = 'bug',
    FEATURE = 'feature',
    IMPROVEMENT = 'improvement',
    GENERAL = 'general'
}

/**
 * Feedback data structure
 */
export interface FeedbackData {
    type: FeedbackType;
    message: string;
    rating?: number;
    context?: {
        languageId?: string;
        handlerId?: string;
        extensionVersion?: string;
        vscodeVersion?: string;
        platform?: string;
    };
    timestamp: string;
}

/**
 * User feedback collection utility
 */
export class FeedbackCollector {
    private static instance: FeedbackCollector;
    private telemetry: TelemetryReporter;
    private readonly feedbackUrl = 'https://github.com/xuezhouyang/another-copy-reference-like-intellij/issues';
    private readonly emailAddress = 'xuezhouyang@gmail.com';

    private constructor() {
        this.telemetry = TelemetryReporter.getInstance();
    }

    /**
     * Get singleton instance
     */
    static getInstance(): FeedbackCollector {
        if (!FeedbackCollector.instance) {
            FeedbackCollector.instance = new FeedbackCollector();
        }
        return FeedbackCollector.instance;
    }

    /**
     * Show feedback prompt
     */
    async promptForFeedback(context?: any): Promise<void> {
        const options = [
            '👍 Working Great',
            '🐛 Report Bug',
            '💡 Suggest Feature',
            '📧 Contact Developer',
            '⭐ Rate Extension'
        ];

        const selection = await vscode.window.showQuickPick(options, {
            placeHolder: 'How is your experience with Copy Reference?',
            ignoreFocusOut: true
        });

        if (!selection) {
            return;
        }

        switch (selection) {
            case '👍 Working Great':
                await this.handlePositiveFeedback();
                break;
            case '🐛 Report Bug':
                await this.reportBug(context);
                break;
            case '💡 Suggest Feature':
                await this.suggestFeature();
                break;
            case '📧 Contact Developer':
                await this.contactDeveloper();
                break;
            case '⭐ Rate Extension':
                await this.rateExtension();
                break;
        }
    }

    /**
     * Handle positive feedback
     */
    private async handlePositiveFeedback(): Promise<void> {
        // Track positive feedback
        this.telemetry.trackEvent('feedback_positive');

        const response = await vscode.window.showInformationMessage(
            'Thank you! Would you like to rate the extension on the marketplace?',
            'Yes, Rate Now',
            'Maybe Later'
        );

        if (response === 'Yes, Rate Now') {
            await this.rateExtension();
        }
    }

    /**
     * Report a bug
     */
    private async reportBug(context?: any): Promise<void> {
        const bugDescription = await vscode.window.showInputBox({
            prompt: 'Please describe the bug',
            placeHolder: 'What went wrong?',
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value || value.trim().length < 10) {
                    return 'Please provide at least 10 characters';
                }
                return null;
            }
        });

        if (!bugDescription) {
            return;
        }

        const systemInfo = this.collectSystemInfo(context);
        const bugReport = this.formatBugReport(bugDescription, systemInfo);

        // Track bug report
        this.telemetry.trackEvent('feedback_bug', {
            hasContext: context ? 'true' : 'false'
        });

        // Show options for submitting the bug
        const action = await vscode.window.showQuickPick([
            'Open GitHub Issue',
            'Copy Bug Report to Clipboard',
            'Send via Email'
        ], {
            placeHolder: 'How would you like to submit this bug report?'
        });

        switch (action) {
            case 'Open GitHub Issue':
                await this.openGitHubIssue('bug', bugReport);
                break;
            case 'Copy Bug Report to Clipboard':
                await vscode.env.clipboard.writeText(bugReport);
                vscode.window.showInformationMessage('Bug report copied to clipboard');
                break;
            case 'Send via Email':
                await this.sendEmail('Bug Report', bugReport);
                break;
        }
    }

    /**
     * Suggest a feature
     */
    private async suggestFeature(): Promise<void> {
        const featureDescription = await vscode.window.showInputBox({
            prompt: 'Describe your feature idea',
            placeHolder: 'What feature would you like to see?',
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value || value.trim().length < 20) {
                    return 'Please provide at least 20 characters';
                }
                return null;
            }
        });

        if (!featureDescription) {
            return;
        }

        // Track feature suggestion
        this.telemetry.trackEvent('feedback_feature');

        const featureRequest = this.formatFeatureRequest(featureDescription);

        const action = await vscode.window.showQuickPick([
            'Open GitHub Issue',
            'Copy to Clipboard',
            'Send via Email'
        ], {
            placeHolder: 'How would you like to submit this feature request?'
        });

        switch (action) {
            case 'Open GitHub Issue':
                await this.openGitHubIssue('enhancement', featureRequest);
                break;
            case 'Copy to Clipboard':
                await vscode.env.clipboard.writeText(featureRequest);
                vscode.window.showInformationMessage('Feature request copied to clipboard');
                break;
            case 'Send via Email':
                await this.sendEmail('Feature Request', featureRequest);
                break;
        }
    }

    /**
     * Contact developer
     */
    private async contactDeveloper(): Promise<void> {
        const options = [
            'Open GitHub Repository',
            'Send Email',
            'Copy Email Address'
        ];

        const selection = await vscode.window.showQuickPick(options, {
            placeHolder: 'How would you like to contact the developer?'
        });

        switch (selection) {
            case 'Open GitHub Repository':
                vscode.env.openExternal(vscode.Uri.parse(this.feedbackUrl));
                break;
            case 'Send Email':
                await this.sendEmail('Copy Reference Feedback', '');
                break;
            case 'Copy Email Address':
                await vscode.env.clipboard.writeText(this.emailAddress);
                vscode.window.showInformationMessage(`Email address copied: ${this.emailAddress}`);
                break;
        }
    }

    /**
     * Rate extension
     */
    private async rateExtension(): Promise<void> {
        const marketplaceUrl = 'https://marketplace.visualstudio.com/items?itemName=xuezhouyang.another-copy-reference-like-intellij&ssr=false#review-details';
        vscode.env.openExternal(vscode.Uri.parse(marketplaceUrl));

        // Track rating action
        this.telemetry.trackEvent('feedback_rate');
    }

    /**
     * Collect system information
     */
    private collectSystemInfo(context?: any): Record<string, string> {
        const extension = vscode.extensions.getExtension('xuezhouyang.another-copy-reference-like-intellij');

        return {
            'Extension Version': extension?.packageJSON.version || 'Unknown',
            'VS Code Version': vscode.version,
            'Platform': process.platform,
            'Language': context?.languageId || 'N/A',
            'Handler': context?.handlerId || 'N/A',
            'Timestamp': new Date().toISOString()
        };
    }

    /**
     * Format bug report
     */
    private formatBugReport(description: string, systemInfo: Record<string, string>): string {
        let report = `## Bug Report\n\n`;
        report += `**Description:**\n${description}\n\n`;
        report += `**System Information:**\n`;

        for (const [key, value] of Object.entries(systemInfo)) {
            report += `- ${key}: ${value}\n`;
        }

        report += `\n**Steps to Reproduce:**\n`;
        report += `1. [First step]\n`;
        report += `2. [Second step]\n`;
        report += `3. [Third step]\n\n`;
        report += `**Expected Behavior:**\n[What should happen]\n\n`;
        report += `**Actual Behavior:**\n[What actually happens]\n`;

        return report;
    }

    /**
     * Format feature request
     */
    private formatFeatureRequest(description: string): string {
        let request = `## Feature Request\n\n`;
        request += `**Description:**\n${description}\n\n`;
        request += `**Use Case:**\n[Describe when/why this feature would be useful]\n\n`;
        request += `**Proposed Solution:**\n[How might this work?]\n\n`;
        request += `**Alternatives Considered:**\n[Any workarounds or alternatives?]\n`;

        return request;
    }

    /**
     * Open GitHub issue
     */
    private async openGitHubIssue(type: string, content: string): Promise<void> {
        const title = type === 'bug' ? 'Bug: ' : 'Feature Request: ';
        const encodedTitle = encodeURIComponent(title);
        const encodedBody = encodeURIComponent(content);
        const labels = type === 'bug' ? 'bug' : 'enhancement';

        const issueUrl = `${this.feedbackUrl}/new?title=${encodedTitle}&body=${encodedBody}&labels=${labels}`;
        vscode.env.openExternal(vscode.Uri.parse(issueUrl));
    }

    /**
     * Send email
     */
    private async sendEmail(subject: string, body: string): Promise<void> {
        const encodedSubject = encodeURIComponent(`[Copy Reference] ${subject}`);
        const encodedBody = encodeURIComponent(body);
        const mailtoUrl = `mailto:${this.emailAddress}?subject=${encodedSubject}&body=${encodedBody}`;

        vscode.env.openExternal(vscode.Uri.parse(mailtoUrl));
    }

    /**
     * Show rating reminder (can be called periodically)
     */
    async showRatingReminder(): Promise<void> {
        const response = await vscode.window.showInformationMessage(
            'Enjoying Copy Reference? Please consider rating it!',
            '⭐ Rate Now',
            'Later',
            "Don't Ask Again"
        );

        if (response === '⭐ Rate Now') {
            await this.rateExtension();
        } else if (response === "Don't Ask Again") {
            // Track user preference
            this.telemetry.trackEvent('feedback_rating_declined');
        }
    }

    /**
     * Collect anonymous usage feedback
     */
    async collectUsageFeedback(
        operation: string,
        success: boolean,
        details?: Record<string, any>
    ): Promise<void> {
        // Track usage feedback via telemetry
        this.telemetry.trackEvent('usage_feedback', {
            operation,
            success: success.toString(),
            extensionVersion: vscode.extensions.getExtension('xuezhouyang.another-copy-reference-like-intellij')?.packageJSON.version,
            vscodeVersion: vscode.version,
            platform: process.platform,
            ...details
        });
    }
}

/**
 * Register feedback command
 */
export function registerFeedbackCommand(context: vscode.ExtensionContext): void {
    const feedbackCommand = vscode.commands.registerCommand('extension.copyReference.feedback', async () => {
        const collector = FeedbackCollector.getInstance();
        await collector.promptForFeedback();
    });

    context.subscriptions.push(feedbackCommand);

    // Optional: Show rating reminder after certain usage
    const showReminderAfterUses = 50;
    const useCount = context.globalState.get<number>('copyReferenceUseCount', 0);

    if (useCount === showReminderAfterUses) {
        setTimeout(() => {
            FeedbackCollector.getInstance().showRatingReminder();
        }, 5000);
    }
}