import * as path from 'path';
import * as vscode from 'vscode';

/**
 * Reference formatting utilities
 */
export class ReferenceFormatter {
    /**
     * Get relative path from workspace root
     */
    static getRelativePath(uri: vscode.Uri): string {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        if (workspaceFolder) {
            return path.relative(workspaceFolder.uri.fsPath, uri.fsPath)
                .replace(/\\/g, '/'); // Normalize to forward slashes
        }
        return path.basename(uri.fsPath);
    }

    /**
     * Get module path for JavaScript/TypeScript
     */
    static getModulePath(uri: vscode.Uri): string {
        const relativePath = this.getRelativePath(uri);
        // Remove file extension for module path
        return relativePath.replace(/\.(js|jsx|ts|tsx|mjs|cjs)$/i, '');
    }

    /**
     * Get Python module path
     */
    static getPythonModulePath(uri: vscode.Uri): string {
        const relativePath = this.getRelativePath(uri);
        // Convert path separators to dots and remove .py extension
        return relativePath
            .replace(/\.py$/i, '')
            .replace(/\//g, '.')
            .replace(/\\/g, '.');
    }

    /**
     * Generate GitHub-compatible anchor from heading text
     */
    static generateMarkdownAnchor(heading: string): string {
        return heading
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-')      // Replace spaces with hyphens
            .replace(/-+/g, '-')       // Replace multiple hyphens with single
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    }

    /**
     * Generate YAML key path
     */
    static generateYamlKeyPath(keys: string[]): string {
        return keys.join('.');
    }

    /**
     * Format Flutter/Dart package path
     */
    static getFlutterPackagePath(uri: vscode.Uri, packageName?: string): string {
        const relativePath = this.getRelativePath(uri);

        // Check if file is in lib/ directory
        if (relativePath.startsWith('lib/')) {
            const libPath = relativePath.substring(4); // Remove 'lib/' prefix
            if (packageName) {
                return `package:${packageName}/${libPath}`;
            }
        }

        return relativePath;
    }

    /**
     * Escape special characters in reference string
     */
    static escapeReference(ref: string): string {
        // Escape characters that might cause issues in various contexts
        return ref.replace(/[<>]/g, '');
    }

    /**
     * Format symbol path with separator
     */
    static formatSymbolPath(symbols: string[], separator = '.'): string {
        return symbols
            .filter(s => s && s.length > 0)
            .join(separator);
    }

    /**
     * Check if file is unsaved
     */
    static isUnsavedFile(document: vscode.TextDocument): boolean {
        return document.isUntitled || document.uri.scheme === 'untitled';
    }

    /**
     * Get file name for unsaved files
     */
    static getUnsavedFileName(document: vscode.TextDocument): string {
        if (document.isUntitled) {
            return vscode.l10n.t('extension.copyReference.unsavedFile') || 'Untitled';
        }
        return path.basename(document.uri.fsPath);
    }

    /**
     * Validate reference format
     */
    static isValidReference(reference: string): boolean {
        // Basic validation - not empty and reasonable length
        return reference.length > 0 && reference.length <= 500;
    }

    /**
     * Truncate long references
     */
    static truncateReference(reference: string, maxLength = 500): string {
        if (reference.length <= maxLength) {
            return reference;
        }

        // Try to truncate at a sensible boundary
        const truncated = reference.substring(0, maxLength - 3);
        const lastSeparator = Math.max(
            truncated.lastIndexOf('#'),
            truncated.lastIndexOf('.'),
            truncated.lastIndexOf('/')
        );

        if (lastSeparator > maxLength / 2) {
            return truncated.substring(0, lastSeparator) + '...';
        }

        return truncated + '...';
    }
}