import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.copyReference', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage(vscode.l10n.t('extension.copyReference.noEditor'));
            return;
        }

        const reference = await generateReference(editor);
        if (reference) {
            await vscode.env.clipboard.writeText(reference);
            vscode.window.showInformationMessage(vscode.l10n.t('extension.copyReference.copied'));
        } else {
            vscode.window.showInformationMessage(vscode.l10n.t('extension.copyReference.failed'));
        }
    });

    context.subscriptions.push(disposable);
}

async function generateReference(editor: vscode.TextEditor): Promise<string | undefined> {
    const document = editor.document;
    const position = editor.selection.active;
    
    // 获取所有符号
    const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        'vscode.executeDocumentSymbolProvider',
        document.uri
    );

    if (!symbols) {
        return undefined;
    }

    // 获取包名
    const packageName = await getPackageName(document.uri);
    if (!packageName) {
        return undefined;
    }

    // 查找当前位置的符号和其父符号
    const { classSymbol, methodSymbol } = findSymbolsAtPosition(symbols, position);
    
    if (!classSymbol) {
        return undefined;
    }

    // 如果找到方法符号，返回 "包名.类名#方法名" 格式
    if (methodSymbol) {
        return `${packageName}.${classSymbol.name}#${methodSymbol.name}`;
    }

    // 否则只返回 "包名.类名" 格式
    return `${packageName}.${classSymbol.name}`;
}

interface SymbolResult {
    classSymbol?: vscode.DocumentSymbol;
    methodSymbol?: vscode.DocumentSymbol;
}

function findSymbolsAtPosition(
    symbols: vscode.DocumentSymbol[],
    position: vscode.Position,
    parentSymbol?: vscode.DocumentSymbol
): SymbolResult {
    for (const symbol of symbols) {
        if (symbol.range.contains(position)) {
            // 如果是类
            if (symbol.kind === vscode.SymbolKind.Class || 
                symbol.kind === vscode.SymbolKind.Interface) {
                // 检查是否有子方法包含该位置
                for (const child of symbol.children) {
                    if (child.kind === vscode.SymbolKind.Method && 
                        child.range.contains(position)) {
                        return {
                            classSymbol: symbol,
                            methodSymbol: child
                        };
                    }
                }
                return { classSymbol: symbol };
            }
            
            // 如果是方法且有父符号
            if (symbol.kind === vscode.SymbolKind.Method && parentSymbol) {
                return {
                    classSymbol: parentSymbol,
                    methodSymbol: symbol
                };
            }

            // 递归检查子符号
            if (symbol.children.length > 0) {
                const result = findSymbolsAtPosition(symbol.children, position, symbol);
                if (result.classSymbol || result.methodSymbol) {
                    return result;
                }
            }
        }
    }
    return {};
}

async function getPackageName(uri: vscode.Uri): Promise<string | undefined> {
    try {
        const content = await fs.promises.readFile(uri.fsPath, 'utf-8');
        const lines = content.split('\n');
        
        // 查找 package 语句
        for (const line of lines) {
            const packageMatch = line.match(/package\s+([\w.]+)/);
            if (packageMatch) {
                return packageMatch[1].trim();
            }
        }
    } catch (error) {
        console.error('Error reading file:', error);
    }
    return undefined;
}

export function deactivate() {} 