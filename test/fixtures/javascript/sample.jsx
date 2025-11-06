// Sample JSX file for testing React components

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Functional component
const Button = ({ onClick, children, variant = 'primary' }) => {
    return (
        <button
            className={`btn btn-${variant}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

Button.propTypes = {
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary', 'danger'])
};

// Class component
class Counter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            count: props.initialCount || 0
        };
    }

    increment = () => {
        this.setState(prevState => ({
            count: prevState.count + 1
        }));
    }

    decrement = () => {
        this.setState(prevState => ({
            count: prevState.count - 1
        }));
    }

    render() {
        return (
            <div className="counter">
                <h2>Count: {this.state.count}</h2>
                <Button onClick={this.increment}>+</Button>
                <Button onClick={this.decrement}>-</Button>
            </div>
        );
    }
}

// Custom hook
const useTimer = (initialSeconds = 0) => {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let interval = null;

        if (isRunning) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        } else if (!isRunning && seconds !== 0) {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [isRunning, seconds]);

    const start = () => setIsRunning(true);
    const stop = () => setIsRunning(false);
    const reset = () => {
        setSeconds(0);
        setIsRunning(false);
    };

    return { seconds, isRunning, start, stop, reset };
};

// Higher-Order Component
const withLoading = (Component) => {
    return function WithLoadingComponent({ isLoading, ...props }) {
        if (isLoading) {
            return <div className="loading">Loading...</div>;
        }
        return <Component {...props} />;
    };
};

// Component using React.memo
const ExpensiveList = React.memo(({ items }) => {
    return (
        <ul>
            {items.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
    );
}, (prevProps, nextProps) => {
    return prevProps.items.length === nextProps.items.length;
});

// Component with React.forwardRef
const FancyInput = React.forwardRef((props, ref) => {
    return (
        <input
            ref={ref}
            className="fancy-input"
            {...props}
        />
    );
});

// Context
const ThemeContext = React.createContext('light');

const ThemedButton = () => {
    const theme = React.useContext(ThemeContext);

    return (
        <button className={`themed-button theme-${theme}`}>
            Themed Button
        </button>
    );
};

// Export statements
export { Button, Counter, useTimer, withLoading, ThemeContext };
export default ExpensiveList;