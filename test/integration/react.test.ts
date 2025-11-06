import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { JavaScriptHandler } from '../../src/handlers/javascript';
import { TestWorkspace } from '../helpers/workspace';

suite('React Integration Tests for JavaScriptHandler', () => {
    let handler: JavaScriptHandler;
    let workspace: TestWorkspace;

    suiteSetup(async () => {
        workspace = new TestWorkspace();
        await workspace.setup();
        handler = new JavaScriptHandler();
    });

    suiteTeardown(async () => {
        await workspace.cleanup();
    });

    test('should extract references from React component file', async () => {
        const componentPath = path.join(workspace.rootPath, 'components', 'TodoApp.jsx');
        const content = `import React, { useState, useEffect } from 'react';
import TodoList from './TodoList';
import TodoForm from './TodoForm';
import { useTodos } from '../hooks/useTodos';

const TodoApp = () => {
    const { todos, addTodo, removeTodo, toggleTodo } = useTodos();
    const [filter, setFilter] = useState('all');

    const filteredTodos = todos.filter(todo => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
    });

    return (
        <div className="todo-app">
            <h1>Todo Application</h1>
            <TodoForm onSubmit={addTodo} />
            <div className="filters">
                <button onClick={() => setFilter('all')}>All</button>
                <button onClick={() => setFilter('active')}>Active</button>
                <button onClick={() => setFilter('completed')}>Completed</button>
            </div>
            <TodoList
                todos={filteredTodos}
                onToggle={toggleTodo}
                onRemove={removeTodo}
            />
        </div>
    );
};

export default TodoApp;`;

        const uri = vscode.Uri.file(componentPath);
        await workspace.createDirectory(path.dirname(componentPath));
        await workspace.writeFile(componentPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test component reference
        const componentPos = new vscode.Position(5, 10);
        const componentRef = await handler.extractReference(document, componentPos);
        assert.notStrictEqual(componentRef, null);
        if (componentRef) {
            assert.strictEqual(componentRef.toString(), 'components/TodoApp#TodoApp');
            assert.strictEqual(componentRef.frameworkType, 'react');
        }

        // Test hook usage reference
        const hookPos = new vscode.Position(6, 30);
        const hookRef = await handler.extractReference(document, hookPos);
        assert.notStrictEqual(hookRef, null);
        if (hookRef) {
            assert.ok(hookRef.toString().includes('TodoApp'));
        }
    });

    test('should handle complex React component hierarchy', async () => {
        const appPath = path.join(workspace.rootPath, 'src', 'App.jsx');
        const content = `import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';

class App extends Component {
    state = {
        isLoading: true,
        user: null
    };

    async componentDidMount() {
        try {
            const user = await this.fetchUser();
            this.setState({ user, isLoading: false });
        } catch (error) {
            this.setState({ isLoading: false });
        }
    }

    fetchUser = async () => {
        const response = await fetch('/api/user');
        return response.json();
    };

    render() {
        const { isLoading, user } = this.state;

        if (isLoading) {
            return <div>Loading...</div>;
        }

        return (
            <Provider store={store}>
                <Router>
                    <div className="app">
                        <Header user={user} />
                        <main>
                            <Switch>
                                <Route exact path="/" component={HomePage} />
                                <Route path="/about" component={AboutPage} />
                            </Switch>
                        </main>
                        <Footer />
                    </div>
                </Router>
            </Provider>
        );
    }
}

export default App;`;

        const uri = vscode.Uri.file(appPath);
        await workspace.createDirectory(path.dirname(appPath));
        await workspace.writeFile(appPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test class component reference
        const classPos = new vscode.Position(11, 10);
        const classRef = await handler.extractReference(document, classPos);
        assert.notStrictEqual(classRef, null);
        if (classRef) {
            assert.strictEqual(classRef.toString(), 'src/App#App');
            assert.strictEqual(classRef.frameworkType, 'react');
        }

        // Test lifecycle method reference
        const lifecyclePos = new vscode.Position(17, 20);
        const lifecycleRef = await handler.extractReference(document, lifecyclePos);
        assert.notStrictEqual(lifecycleRef, null);
        if (lifecycleRef) {
            assert.strictEqual(lifecycleRef.toString(), 'src/App#App.componentDidMount');
        }

        // Test class method reference
        const methodPos = new vscode.Position(25, 10);
        const methodRef = await handler.extractReference(document, methodPos);
        assert.notStrictEqual(methodRef, null);
        if (methodRef) {
            assert.strictEqual(methodRef.toString(), 'src/App#App.fetchUser');
        }
    });

    test('should handle React hooks file', async () => {
        const hooksPath = path.join(workspace.rootPath, 'hooks', 'useAuth.js');
        const content = `import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

export const useUser = () => {
    const { user } = useAuth();
    return user;
};

export function useLogin() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { login } = useAuth();

    const handleLogin = useCallback(async (credentials) => {
        setIsLoading(true);
        setError(null);

        try {
            await login(credentials);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [login]);

    return { handleLogin, isLoading, error };
}

export const useLogout = () => {
    const { logout } = useAuth();

    const handleLogout = useCallback(async () => {
        await logout();
        window.location.href = '/login';
    }, [logout]);

    return handleLogout;
};`;

        const uri = vscode.Uri.file(hooksPath);
        await workspace.createDirectory(path.dirname(hooksPath));
        await workspace.writeFile(hooksPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test custom hook reference
        const hookPos = new vscode.Position(3, 20);
        const hookRef = await handler.extractReference(document, hookPos);
        assert.notStrictEqual(hookRef, null);
        if (hookRef) {
            assert.strictEqual(hookRef.toString(), 'hooks/useAuth#useAuth');
            assert.strictEqual(hookRef.frameworkType, 'react');
        }

        // Test exported hook reference
        const exportedHookPos = new vscode.Position(13, 15);
        const exportedHookRef = await handler.extractReference(document, exportedHookPos);
        assert.notStrictEqual(exportedHookRef, null);
        if (exportedHookRef) {
            assert.strictEqual(exportedHookRef.toString(), 'hooks/useAuth#useUser');
        }
    });

    test('should handle Higher-Order Component patterns', async () => {
        const hocPath = path.join(workspace.rootPath, 'hoc', 'withAuth.jsx');
        const content = `import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

const withAuth = (requiredRole = null) => (WrappedComponent) => {
    class WithAuthComponent extends Component {
        render() {
            const { isAuthenticated, user } = this.props;

            if (!isAuthenticated) {
                return <Redirect to="/login" />;
            }

            if (requiredRole && user.role !== requiredRole) {
                return <div>Access Denied</div>;
            }

            return <WrappedComponent {...this.props} />;
        }
    }

    WithAuthComponent.displayName = \`withAuth(\${WrappedComponent.displayName || WrappedComponent.name})\`;

    return connect(state => ({
        isAuthenticated: state.auth.isAuthenticated,
        user: state.auth.user
    }))(WithAuthComponent);
};

export default withAuth;

// Usage examples
export const withAdminAuth = withAuth('admin');
export const withUserAuth = withAuth('user');`;

        const uri = vscode.Uri.file(hocPath);
        await workspace.createDirectory(path.dirname(hocPath));
        await workspace.writeFile(hocPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test HOC reference
        const hocPos = new vscode.Position(4, 10);
        const hocRef = await handler.extractReference(document, hocPos);
        assert.notStrictEqual(hocRef, null);
        if (hocRef) {
            assert.strictEqual(hocRef.toString(), 'hoc/withAuth#withAuth');
            assert.strictEqual(hocRef.frameworkType, 'react');
        }

        // Test inner component reference
        const innerPos = new vscode.Position(5, 15);
        const innerRef = await handler.extractReference(document, innerPos);
        assert.notStrictEqual(innerRef, null);
        if (innerRef) {
            assert.ok(innerRef.toString().includes('WithAuthComponent'));
        }
    });

    test('should handle React Context API', async () => {
        const contextPath = path.join(workspace.rootPath, 'contexts', 'ThemeContext.jsx');
        const content = `import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.documentElement.className = theme;
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const value = {
        theme,
        toggleTheme,
        setTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;`;

        const uri = vscode.Uri.file(contextPath);
        await workspace.createDirectory(path.dirname(contextPath));
        await workspace.writeFile(contextPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test context reference
        const contextPos = new vscode.Position(2, 10);
        const contextRef = await handler.extractReference(document, contextPos);
        assert.notStrictEqual(contextRef, null);
        if (contextRef) {
            assert.strictEqual(contextRef.toString(), 'contexts/ThemeContext#ThemeContext');
        }

        // Test provider reference
        const providerPos = new vscode.Position(13, 15);
        const providerRef = await handler.extractReference(document, providerPos);
        assert.notStrictEqual(providerRef, null);
        if (providerRef) {
            assert.strictEqual(providerRef.toString(), 'contexts/ThemeContext#ThemeProvider');
            assert.strictEqual(providerRef.frameworkType, 'react');
        }

        // Test hook reference
        const hookPos = new vscode.Position(5, 15);
        const hookRef = await handler.extractReference(document, hookPos);
        assert.notStrictEqual(hookRef, null);
        if (hookRef) {
            assert.strictEqual(hookRef.toString(), 'contexts/ThemeContext#useTheme');
        }
    });

    test('should handle React component with TypeScript', async () => {
        const tsComponentPath = path.join(workspace.rootPath, 'components', 'Button.tsx');
        const content = `import React, { FC, ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    icon?: ReactNode;
}

const Button: FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'medium',
    loading = false,
    icon,
    disabled,
    ...props
}) => {
    const classNames = [
        'btn',
        \`btn-\${variant}\`,
        \`btn-\${size}\`,
        loading && 'btn-loading',
        disabled && 'btn-disabled'
    ].filter(Boolean).join(' ');

    return (
        <button
            className={classNames}
            disabled={disabled || loading}
            {...props}
        >
            {icon && <span className="btn-icon">{icon}</span>}
            {children}
        </button>
    );
};

Button.displayName = 'Button';

export default Button;
export type { ButtonProps };`;

        const uri = vscode.Uri.file(tsComponentPath);
        await workspace.createDirectory(path.dirname(tsComponentPath));
        await workspace.writeFile(tsComponentPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test TypeScript component reference
        const componentPos = new vscode.Position(9, 10);
        const componentRef = await handler.extractReference(document, componentPos);
        assert.notStrictEqual(componentRef, null);
        if (componentRef) {
            assert.strictEqual(componentRef.toString(), 'components/Button#Button');
            assert.strictEqual(componentRef.frameworkType, 'react');
        }

        // Test interface reference
        const interfacePos = new vscode.Position(2, 15);
        const interfaceRef = await handler.extractReference(document, interfacePos);
        assert.notStrictEqual(interfaceRef, null);
        if (interfaceRef) {
            assert.strictEqual(interfaceRef.toString(), 'components/Button#ButtonProps');
        }
    });
});