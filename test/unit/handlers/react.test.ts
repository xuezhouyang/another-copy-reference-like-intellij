import * as assert from 'assert';
import * as vscode from 'vscode';
import { JavaScriptHandler } from '../../../src/handlers/javascript';
import { createMockDocument, createMockSymbol } from '../../helpers';

suite('React Enhancement Tests for JavaScriptHandler', () => {
    let handler: JavaScriptHandler;

    setup(() => {
        handler = new JavaScriptHandler();
    });

    suite('React Component Detection', () => {
        test('should detect functional components by uppercase naming', async () => {
            const content = `
import React from 'react';

const Button = ({ onClick, children }) => {
    return <button onClick={onClick}>{children}</button>;
};

const useCounter = () => {
    const [count, setCount] = React.useState(0);
    return { count, setCount };
};

function Card({ title, content }) {
    return (
        <div className="card">
            <h2>{title}</h2>
            <p>{content}</p>
        </div>
    );
}

export { Button, Card };`;

            const doc = createMockDocument('Button.jsx', 'javascriptreact', content);
            const buttonPos = new vscode.Position(3, 10); // Position on Button component

            const symbols = [
                createMockSymbol('Button', vscode.SymbolKind.Function,
                    new vscode.Range(3, 0, 5, 2)),
                createMockSymbol('useCounter', vscode.SymbolKind.Function,
                    new vscode.Range(7, 0, 10, 2)),
                createMockSymbol('Card', vscode.SymbolKind.Function,
                    new vscode.Range(12, 0, 19, 1))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, buttonPos);
            assert.notStrictEqual(reference, null);
            if (reference) {
                // Should detect as React component
                assert.strictEqual(reference.frameworkType, 'react');
                assert.deepStrictEqual(reference.symbolPath, ['Button']);
                assert.strictEqual(reference.toString(), 'Button#Button');
            }
        });

        test('should detect class components extending React.Component', async () => {
            const content = `
import React, { Component } from 'react';

class TodoList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: []
        };
    }

    addItem = (item) => {
        this.setState(prev => ({
            items: [...prev.items, item]
        }));
    }

    render() {
        return (
            <div>
                {this.state.items.map(item => (
                    <div key={item.id}>{item.text}</div>
                ))}
            </div>
        );
    }
}

export default TodoList;`;

            const doc = createMockDocument('TodoList.jsx', 'javascriptreact', content);
            const classPos = new vscode.Position(3, 10); // Position on class declaration

            const symbols = [
                createMockSymbol('TodoList', vscode.SymbolKind.Class,
                    new vscode.Range(3, 0, 25, 1), [
                        createMockSymbol('constructor', vscode.SymbolKind.Constructor,
                            new vscode.Range(4, 4, 9, 5)),
                        createMockSymbol('addItem', vscode.SymbolKind.Method,
                            new vscode.Range(11, 4, 15, 5)),
                        createMockSymbol('render', vscode.SymbolKind.Method,
                            new vscode.Range(17, 4, 24, 5))
                    ])
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, classPos);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.strictEqual(reference.frameworkType, 'react');
                assert.deepStrictEqual(reference.symbolPath, ['TodoList']);
            }
        });

        test('should detect custom hooks by use prefix', async () => {
            const content = `
import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            return initialValue;
        }
    });

    const setValue = useCallback((value) => {
        try {
            setStoredValue(value);
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(error);
        }
    }, [key]);

    return [storedValue, setValue];
}

export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
};`;

            const doc = createMockDocument('hooks.js', 'javascript', content);
            const hookPos = new vscode.Position(3, 20); // Position on useLocalStorage

            const symbols = [
                createMockSymbol('useLocalStorage', vscode.SymbolKind.Function,
                    new vscode.Range(3, 0, 22, 1)),
                createMockSymbol('useDebounce', vscode.SymbolKind.Function,
                    new vscode.Range(24, 0, 35, 2))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, hookPos);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.strictEqual(reference.frameworkType, 'react');
                assert.deepStrictEqual(reference.symbolPath, ['useLocalStorage']);
                // Custom hooks should be marked as hooks
                assert.strictEqual(reference.toString(), 'hooks#useLocalStorage');
            }
        });

        test('should handle Higher-Order Components (HOC)', async () => {
            const content = `
import React from 'react';

const withAuth = (WrappedComponent) => {
    return class extends React.Component {
        state = {
            isAuthenticated: false
        };

        componentDidMount() {
            // Check authentication
            this.checkAuth();
        }

        checkAuth = () => {
            // Authentication logic
        };

        render() {
            if (!this.state.isAuthenticated) {
                return <div>Please log in</div>;
            }
            return <WrappedComponent {...this.props} />;
        }
    };
};

const withLoading = (Component) => (props) => {
    if (props.isLoading) {
        return <div>Loading...</div>;
    }
    return <Component {...props} />;
};

export { withAuth, withLoading };`;

            const doc = createMockDocument('hoc.jsx', 'javascriptreact', content);
            const hocPos = new vscode.Position(3, 10); // Position on withAuth

            const symbols = [
                createMockSymbol('withAuth', vscode.SymbolKind.Function,
                    new vscode.Range(3, 0, 24, 2)),
                createMockSymbol('withLoading', vscode.SymbolKind.Function,
                    new vscode.Range(26, 0, 31, 2))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, hocPos);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.strictEqual(reference.frameworkType, 'react');
                // HOCs should be detected by 'with' prefix
                assert.deepStrictEqual(reference.symbolPath, ['withAuth']);
            }
        });

        test('should handle React.memo wrapped components', async () => {
            const content = `
import React, { memo } from 'react';

const ExpensiveComponent = ({ data }) => {
    console.log('Rendering ExpensiveComponent');
    return (
        <div>
            {data.map(item => (
                <div key={item.id}>{item.value}</div>
            ))}
        </div>
    );
};

const MemoizedComponent = memo(ExpensiveComponent);

const AnotherMemo = React.memo(function AnotherComponent({ title }) {
    return <h1>{title}</h1>;
});

export { MemoizedComponent, AnotherMemo };`;

            const doc = createMockDocument('MemoComponents.jsx', 'javascriptreact', content);
            const memoPos = new vscode.Position(14, 10); // Position on MemoizedComponent

            const symbols = [
                createMockSymbol('ExpensiveComponent', vscode.SymbolKind.Function,
                    new vscode.Range(3, 0, 12, 2)),
                createMockSymbol('MemoizedComponent', vscode.SymbolKind.Variable,
                    new vscode.Range(14, 0, 14, 50)),
                createMockSymbol('AnotherMemo', vscode.SymbolKind.Variable,
                    new vscode.Range(16, 0, 18, 3))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, memoPos);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.strictEqual(reference.frameworkType, 'react');
                assert.deepStrictEqual(reference.symbolPath, ['MemoizedComponent']);
            }
        });

        test('should handle React.forwardRef components', async () => {
            const content = `
import React, { forwardRef } from 'react';

const FancyButton = forwardRef((props, ref) => (
    <button ref={ref} className="fancy-button">
        {props.children}
    </button>
));

const Input = React.forwardRef(function CustomInput(props, ref) {
    return <input ref={ref} {...props} />;
});

export { FancyButton, Input };`;

            const doc = createMockDocument('ForwardRef.jsx', 'javascriptreact', content);
            const forwardRefPos = new vscode.Position(3, 10);

            const symbols = [
                createMockSymbol('FancyButton', vscode.SymbolKind.Variable,
                    new vscode.Range(3, 0, 7, 3)),
                createMockSymbol('Input', vscode.SymbolKind.Variable,
                    new vscode.Range(9, 0, 11, 3))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, forwardRefPos);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.strictEqual(reference.frameworkType, 'react');
                assert.deepStrictEqual(reference.symbolPath, ['FancyButton']);
            }
        });

        test('should detect components with prop types', async () => {
            const content = `
import React from 'react';
import PropTypes from 'prop-types';

function UserCard({ name, email, avatar }) {
    return (
        <div className="user-card">
            <img src={avatar} alt={name} />
            <h3>{name}</h3>
            <p>{email}</p>
        </div>
    );
}

UserCard.propTypes = {
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    avatar: PropTypes.string
};

UserCard.defaultProps = {
    avatar: '/default-avatar.png'
};

export default UserCard;`;

            const doc = createMockDocument('UserCard.jsx', 'javascriptreact', content);
            const componentPos = new vscode.Position(4, 10);

            const symbols = [
                createMockSymbol('UserCard', vscode.SymbolKind.Function,
                    new vscode.Range(4, 0, 12, 1))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, componentPos);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.strictEqual(reference.frameworkType, 'react');
                assert.deepStrictEqual(reference.symbolPath, ['UserCard']);
            }
        });

        test('should handle JSX fragments and elements', async () => {
            const content = `
import React, { Fragment } from 'react';

const List = ({ items }) => (
    <>
        <h2>Items</h2>
        {items.map(item => (
            <Fragment key={item.id}>
                <dt>{item.term}</dt>
                <dd>{item.definition}</dd>
            </Fragment>
        ))}
    </>
);

const Navigation = () => {
    return (
        <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
        </nav>
    );
};

export { List, Navigation };`;

            const doc = createMockDocument('Components.jsx', 'javascriptreact', content);
            const fragmentPos = new vscode.Position(3, 10);

            const symbols = [
                createMockSymbol('List', vscode.SymbolKind.Function,
                    new vscode.Range(3, 0, 13, 2)),
                createMockSymbol('Navigation', vscode.SymbolKind.Function,
                    new vscode.Range(15, 0, 23, 2))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, fragmentPos);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.strictEqual(reference.frameworkType, 'react');
                assert.deepStrictEqual(reference.symbolPath, ['List']);
            }
        });

        test('should handle context providers and consumers', async () => {
            const content = `
import React, { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = React.useState('light');

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export { ThemeProvider, useTheme, ThemeContext };`;

            const doc = createMockDocument('ThemeContext.jsx', 'javascriptreact', content);
            const providerPos = new vscode.Position(5, 10);

            const symbols = [
                createMockSymbol('ThemeContext', vscode.SymbolKind.Variable,
                    new vscode.Range(3, 0, 3, 45)),
                createMockSymbol('ThemeProvider', vscode.SymbolKind.Function,
                    new vscode.Range(5, 0, 13, 2)),
                createMockSymbol('useTheme', vscode.SymbolKind.Function,
                    new vscode.Range(15, 0, 21, 2))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, providerPos);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.strictEqual(reference.frameworkType, 'react');
                assert.deepStrictEqual(reference.symbolPath, ['ThemeProvider']);
            }
        });

        test('should handle lazy loaded components', async () => {
            const content = `
import React, { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./HeavyComponent'));

function App() {
    return (
        <div>
            <Suspense fallback={<div>Loading...</div>}>
                <LazyComponent />
            </Suspense>
        </div>
    );
}

export default App;`;

            const doc = createMockDocument('App.jsx', 'javascriptreact', content);
            const lazyPos = new vscode.Position(3, 10);

            const symbols = [
                createMockSymbol('LazyComponent', vscode.SymbolKind.Variable,
                    new vscode.Range(3, 0, 3, 60)),
                createMockSymbol('App', vscode.SymbolKind.Function,
                    new vscode.Range(5, 0, 13, 1))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, lazyPos);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.strictEqual(reference.frameworkType, 'react');
                assert.deepStrictEqual(reference.symbolPath, ['LazyComponent']);
            }
        });
    });

    suite('JSX-specific Symbol Resolution', () => {
        test('should resolve JSX element references', async () => {
            const content = `
import React from 'react';
import { Button } from './Button';
import Card from './Card';

function Dashboard() {
    return (
        <div className="dashboard">
            <Card title="Stats">
                <Button onClick={() => console.log('clicked')}>
                    Click me
                </Button>
            </Card>
        </div>
    );
}`;

            const doc = createMockDocument('Dashboard.jsx', 'javascriptreact', content);
            const jsxPos = new vscode.Position(9, 20); // Position on Button JSX

            const symbols = [
                createMockSymbol('Dashboard', vscode.SymbolKind.Function,
                    new vscode.Range(5, 0, 15, 1))
            ];
            handler['setCachedSymbols'](doc, symbols);

            const reference = await handler.extractReference(doc, jsxPos);
            assert.notStrictEqual(reference, null);
            if (reference) {
                assert.strictEqual(reference.frameworkType, 'react');
                // Should reference the Dashboard component containing the JSX
                assert.deepStrictEqual(reference.symbolPath, ['Dashboard']);
            }
        });
    });
});