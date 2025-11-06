"""Sample Python file for testing various Python constructs"""

import os
import sys
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
from functools import wraps
import asyncio


# Simple function
def simple_function(arg1, arg2):
    """A simple function for testing"""
    return arg1 + arg2


# Function with type hints
def typed_function(name: str, age: int) -> Dict[str, Any]:
    """Function with type annotations"""
    return {"name": name, "age": age}


# Async function
async def async_function(url: str) -> str:
    """An async function"""
    await asyncio.sleep(0.1)
    return f"Data from {url}"


# Generator function
def generator_function(n: int):
    """A generator function"""
    for i in range(n):
        yield i * 2


# Lambda function
square = lambda x: x ** 2


# Decorator
def timer_decorator(func):
    """A decorator for timing functions"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        import time
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start} seconds")
        return result
    return wrapper


# Simple class
class SimpleClass:
    """A simple class for testing"""

    def __init__(self, value):
        self.value = value

    def get_value(self):
        return self.value

    def set_value(self, value):
        self.value = value


# Class with class and static methods
class AdvancedClass:
    """Class with various method types"""

    class_var = "shared"

    def __init__(self):
        self.instance_var = "instance"

    def regular_method(self):
        """A regular instance method"""
        return self.instance_var

    @classmethod
    def class_method(cls):
        """A class method"""
        return cls.class_var

    @staticmethod
    def static_method():
        """A static method"""
        return "static result"

    @property
    def computed_property(self):
        """A computed property"""
        return f"{self.instance_var}_computed"

    @computed_property.setter
    def computed_property(self, value):
        self.instance_var = value


# Dataclass
@dataclass
class Person:
    """A dataclass example"""
    name: str
    age: int
    email: Optional[str] = None

    def greet(self):
        return f"Hello, I'm {self.name}"


# Class with inheritance
class Animal:
    """Base class for animals"""

    def __init__(self, name: str):
        self.name = name

    def speak(self):
        raise NotImplementedError


class Dog(Animal):
    """Dog class inheriting from Animal"""

    def speak(self):
        return f"{self.name} says Woof!"

    def fetch(self, item: str):
        return f"{self.name} fetched {item}"


class Cat(Animal):
    """Cat class inheriting from Animal"""

    def speak(self):
        return f"{self.name} says Meow!"

    def scratch(self):
        return f"{self.name} scratched"


# Nested classes
class OuterClass:
    """Class with nested classes"""

    def __init__(self):
        self.outer_value = "outer"

    class MiddleClass:
        """Middle nested class"""

        def __init__(self):
            self.middle_value = "middle"

        class InnerClass:
            """Deeply nested class"""

            def __init__(self):
                self.inner_value = "inner"

            def inner_method(self):
                return self.inner_value

        def middle_method(self):
            return self.middle_value

    def outer_method(self):
        return self.outer_value


# Context manager
class MyContextManager:
    """A context manager example"""

    def __enter__(self):
        print("Entering context")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        print("Exiting context")
        return False

    def do_something(self):
        return "Done"


# Async context manager
class AsyncContextManager:
    """An async context manager"""

    async def __aenter__(self):
        await asyncio.sleep(0.01)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await asyncio.sleep(0.01)
        return False

    async def async_operation(self):
        return "Async done"


# Exception class
class CustomException(Exception):
    """A custom exception class"""

    def __init__(self, message: str, code: int):
        super().__init__(message)
        self.code = code


# Enum (Python 3.4+)
from enum import Enum, auto

class Color(Enum):
    """An enumeration example"""
    RED = auto()
    GREEN = auto()
    BLUE = auto()


# Protocol (Python 3.8+)
from typing import Protocol

class Drawable(Protocol):
    """A protocol example"""

    def draw(self) -> None:
        ...


# Generic class
from typing import TypeVar, Generic

T = TypeVar('T')

class Container(Generic[T]):
    """A generic container class"""

    def __init__(self, value: T):
        self.value: T = value

    def get(self) -> T:
        return self.value

    def set(self, value: T) -> None:
        self.value = value


# Module-level variables
MODULE_CONSTANT = 42
module_variable = "module level"


# Main entry point
def main():
    """Main entry point"""
    print("Running main")


if __name__ == "__main__":
    main()