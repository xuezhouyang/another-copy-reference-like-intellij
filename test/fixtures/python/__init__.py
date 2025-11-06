"""Python package __init__ file for testing"""

from .sample import SimpleClass, simple_function

__all__ = ['SimpleClass', 'simple_function', 'package_function']

# Package-level function
def package_function():
    """A function defined in __init__.py"""
    return "Package initialized"

# Package-level class
class PackageClass:
    """A class defined in __init__.py"""

    def __init__(self):
        self.initialized = True

    def process(self):
        return "Processing in package"

# Package-level constant
PACKAGE_VERSION = "1.0.0"