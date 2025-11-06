// Sample TSX file for testing TypeScript React components

import React, { FC, useState, useCallback, useMemo } from 'react';

// Interface for props
interface ButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
}

// Functional component with TypeScript
const Button: FC<ButtonProps> = ({
    onClick,
    children,
    variant = 'primary',
    disabled = false
}) => {
    return (
        <button
            className={`btn btn-${variant}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

// Generic component
interface ListProps<T> {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
    return (
        <ul>
            {items.map((item) => (
                <li key={keyExtractor(item)}>{renderItem(item)}</li>
            ))}
        </ul>
    );
}

// Interface for state
interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
}

// Complex component with state management
const TodoList: FC = () => {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [inputText, setInputText] = useState('');

    const addTodo = useCallback(() => {
        if (inputText.trim()) {
            const newTodo: TodoItem = {
                id: Date.now().toString(),
                text: inputText,
                completed: false
            };
            setTodos(prev => [...prev, newTodo]);
            setInputText('');
        }
    }, [inputText]);

    const toggleTodo = useCallback((id: string) => {
        setTodos(prev =>
            prev.map(todo =>
                todo.id === id
                    ? { ...todo, completed: !todo.completed }
                    : todo
            )
        );
    }, []);

    const completedCount = useMemo(
        () => todos.filter(todo => todo.completed).length,
        [todos]
    );

    return (
        <div className="todo-list">
            <h2>Todo List ({completedCount}/{todos.length} completed)</h2>
            <div className="todo-input">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                />
                <Button onClick={addTodo}>Add</Button>
            </div>
            <List
                items={todos}
                keyExtractor={(todo) => todo.id}
                renderItem={(todo) => (
                    <label>
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleTodo(todo.id)}
                        />
                        <span
                            style={{
                                textDecoration: todo.completed ? 'line-through' : 'none'
                            }}
                        >
                            {todo.text}
                        </span>
                    </label>
                )}
            />
        </div>
    );
};

// Custom hook with TypeScript
interface UseCounterReturn {
    count: number;
    increment: () => void;
    decrement: () => void;
    reset: () => void;
}

const useCounter = (initialValue: number = 0): UseCounterReturn => {
    const [count, setCount] = useState(initialValue);

    const increment = useCallback(() => setCount(c => c + 1), []);
    const decrement = useCallback(() => setCount(c => c - 1), []);
    const reset = useCallback(() => setCount(initialValue), [initialValue]);

    return { count, increment, decrement, reset };
};

// HOC with TypeScript
interface WithLoadingProps {
    isLoading: boolean;
}

function withLoading<P extends object>(
    Component: React.ComponentType<P>
): React.FC<P & WithLoadingProps> {
    return ({ isLoading, ...props }) => {
        if (isLoading) {
            return <div className="loading">Loading...</div>;
        }
        return <Component {...(props as P)} />;
    };
}

// Context with TypeScript
interface Theme {
    primary: string;
    secondary: string;
    background: string;
}

const ThemeContext = React.createContext<Theme>({
    primary: '#007bff',
    secondary: '#6c757d',
    background: '#ffffff'
});

// Component using context
const ThemedCard: FC<{ title: string; content: string }> = ({ title, content }) => {
    const theme = React.useContext(ThemeContext);

    return (
        <div
            className="card"
            style={{ backgroundColor: theme.background }}
        >
            <h3 style={{ color: theme.primary }}>{title}</h3>
            <p style={{ color: theme.secondary }}>{content}</p>
        </div>
    );
};

// Export statements
export { Button, TodoList, List, useCounter, withLoading, ThemeContext, ThemedCard };
export default TodoList;