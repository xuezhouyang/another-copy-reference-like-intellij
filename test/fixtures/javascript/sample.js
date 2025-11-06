// Sample JavaScript file for testing

// Simple function
function greet(name) {
    return `Hello, ${name}!`;
}

// Arrow function
const add = (a, b) => a + b;

// Function expression
const multiply = function(a, b) {
    return a * b;
};

// Class with methods
class Calculator {
    constructor() {
        this.result = 0;
    }

    add(value) {
        this.result += value;
        return this;
    }

    subtract(value) {
        this.result -= value;
        return this;
    }

    getResult() {
        return this.result;
    }

    // Static method
    static createWithValue(initialValue) {
        const calc = new Calculator();
        calc.result = initialValue;
        return calc;
    }
}

// Nested objects
const mathOperations = {
    basic: {
        add: (a, b) => a + b,
        subtract: (a, b) => a - b
    },
    advanced: {
        power: (base, exp) => Math.pow(base, exp),
        sqrt: (n) => Math.sqrt(n)
    }
};

// Async functions
async function fetchData(url) {
    const response = await fetch(url);
    return response.json();
}

// Generator function
function* numberGenerator() {
    let num = 0;
    while (true) {
        yield num++;
    }
}

// IIFE
(function() {
    console.log('Immediately invoked');
})();

// Export statements
export { greet, Calculator };
export default mathOperations;