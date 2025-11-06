import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { BaseLanguageHandler } from './base';
import { ReferenceFormat, SymbolContext } from '../types';

/**
 * Handler for Flutter/Dart files
 * Generates references in the format: package:package_name/path/widget.method
 *
 * Supports:
 * - StatelessWidget classes
 * - StatefulWidget classes and their State classes
 * - Widget methods and build() method detection
 * - Package path extraction from pubspec.yaml
 */
export class FlutterHandler extends BaseLanguageHandler {
    private packageNameCache: Map<string, string> = new Map();

    constructor() {
        super(
            'flutter',
            ['.dart'],
            85,  // Priority: slightly higher than JavaScript, framework-aware
            true  // Supports Flutter framework
        );
    }

    /**
     * Check if this handler can handle the document
     * Handles all .dart files
     */
    canHandle(document: vscode.TextDocument): boolean {
        if (document.languageId === 'dart') {
            return true;
        }

        // Also check by file extension
        return super.canHandle(document);
    }

    /**
     * Format reference for Flutter/Dart symbol context
     */
    protected formatReference(context: SymbolContext): ReferenceFormat | null {
        try {
            // Get package information (synchronous version)
            const packageInfo = this.getPackageInfoSync(context.document);
            const modulePath = this.getModulePath(context.document, packageInfo);

            if (!context.symbol) {
                // No symbol at position, return file-level reference
                return new ReferenceFormat(
                    modulePath,
                    'standard',
                    undefined,
                    '#',
                    context.position.line + 1,
                    context.position.character + 1,
                    modulePath
                );
            }

            // Build reference based on symbol hierarchy
            return this.buildFlutterReference(context, modulePath, packageInfo);

        } catch (error) {
            console.error('FlutterHandler.formatReference error:', error);
            return null;
        }
    }

    /**
     * Build Flutter-specific reference string
     */
    private buildFlutterReference(
        symbolContext: SymbolContext,
        modulePath: string,
        packageInfo: { name: string; path: string } | null
    ): ReferenceFormat {
        const parts: string[] = [];
        const symbol = symbolContext.symbol!;

        // Check if we're in a Flutter widget context
        const widgetClass = this.findWidgetClass(symbolContext);
        const stateClass = this.findStateClass(symbolContext);

        if (widgetClass) {
            // We're inside a widget class
            if (stateClass) {
                // Inside a State class - reference the StatefulWidget
                parts.push(widgetClass.name);

                // Add method if present and not build()
                if (symbol.kind === vscode.SymbolKind.Method && symbol.name !== 'build') {
                    parts.push(symbol.name);
                } else if (symbol.name === 'build') {
                    // For build() method, just reference the widget
                    parts.push('build');
                }
            } else {
                // Inside a widget class directly (StatelessWidget or StatefulWidget)
                parts.push(widgetClass.name);

                // Add method if it's not the class itself
                if (symbol.name !== widgetClass.name) {
                    parts.push(symbol.name);
                }
            }
        } else {
            // Not in a widget context, use standard symbol hierarchy
            const hierarchy = symbolContext.getFullSymbolPath();
            parts.push(...hierarchy);
        }

        // Build the reference string
        let referenceString: string;

        if (packageInfo) {
            // Use package: format
            const relativePath = this.getRelativePathFromLib(modulePath);
            referenceString = `package:${packageInfo.name}/${relativePath}`;
        } else {
            // Fallback to file path
            referenceString = modulePath;
        }

        // Add symbol hierarchy
        if (parts.length > 0) {
            referenceString += '#' + parts.join('.');
        }

        return new ReferenceFormat(
            referenceString,
            'standard',
            parts.length > 0 ? parts : undefined,
            '#',
            symbolContext.position.line + 1,
            symbolContext.position.character + 1,
            packageInfo ? `package:${packageInfo.name}/${this.getRelativePathFromLib(modulePath)}` : modulePath,
            widgetClass ? 'flutter' : undefined
        );
    }

    /**
     * Find the widget class in the symbol hierarchy
     * Returns the StatefulWidget class if in a State class, or the widget class itself
     */
    private findWidgetClass(symbolContext: SymbolContext): vscode.DocumentSymbol | null {
        const parents = symbolContext.parentSymbols || [];

        // Check if we're in a State class (starts with _ and ends with State)
        const currentClass = parents.find(s => s.kind === vscode.SymbolKind.Class);

        if (currentClass) {
            const isStateClass = currentClass.name.startsWith('_') && currentClass.name.endsWith('State');

            if (isStateClass) {
                // Extract widget name from State class name
                // e.g., _CounterWidgetState -> CounterWidget
                const widgetName = currentClass.name.slice(1).replace(/State$/, '');

                // Try to find the actual StatefulWidget class
                // For now, return a pseudo-symbol with the widget name
                return {
                    name: widgetName,
                    kind: vscode.SymbolKind.Class,
                    range: currentClass.range,
                    selectionRange: currentClass.selectionRange,
                    children: [],
                    detail: 'StatefulWidget'
                } as vscode.DocumentSymbol;
            }

            // Check if this class extends StatelessWidget or StatefulWidget
            const classDetail = currentClass.detail || '';
            if (classDetail.includes('StatelessWidget') || classDetail.includes('StatefulWidget')) {
                return currentClass;
            }
        }

        return null;
    }

    /**
     * Find the State class in the symbol hierarchy
     */
    private findStateClass(symbolContext: SymbolContext): vscode.DocumentSymbol | null {
        const parents = symbolContext.parentSymbols || [];
        return parents.find(s =>
            s.kind === vscode.SymbolKind.Class &&
            s.name.startsWith('_') &&
            s.name.endsWith('State')
        ) || null;
    }

    /**
     * Get package information from pubspec.yaml (synchronous)
     */
    private getPackageInfoSync(document: vscode.TextDocument): { name: string; path: string } | null {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);

        if (!workspaceFolder) {
            return null;
        }

        const workspacePath = workspaceFolder.uri.fsPath;

        // Check cache first
        if (this.packageNameCache.has(workspacePath)) {
            return {
                name: this.packageNameCache.get(workspacePath)!,
                path: workspacePath
            };
        }

        // Look for pubspec.yaml
        const pubspecPath = path.join(workspacePath, 'pubspec.yaml');

        try {
            if (fs.existsSync(pubspecPath)) {
                const content = fs.readFileSync(pubspecPath, 'utf8');
                const nameMatch = content.match(/^name:\s*(.+)$/m);

                if (nameMatch) {
                    const packageName = nameMatch[1].trim();
                    this.packageNameCache.set(workspacePath, packageName);
                    return {
                        name: packageName,
                        path: workspacePath
                    };
                }
            }
        } catch (error) {
            console.error('Error reading pubspec.yaml:', error);
        }

        return null;
    }

    /**
     * Get module path for Dart file
     */
    private getModulePath(document: vscode.TextDocument, _packageInfo: { name: string; path: string } | null): string {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);

        if (!workspaceFolder) {
            return path.basename(document.fileName);
        }

        const relativePath = path.relative(workspaceFolder.uri.fsPath, document.fileName);

        // Convert backslashes to forward slashes for consistency
        return relativePath.replace(/\\/g, '/');
    }

    /**
     * Get relative path from lib/ directory
     */
    private getRelativePathFromLib(modulePath: string): string {
        // If path starts with lib/, remove it
        if (modulePath.startsWith('lib/')) {
            return modulePath.substring(4);
        }

        return modulePath;
    }
}
