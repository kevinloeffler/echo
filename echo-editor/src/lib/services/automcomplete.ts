import { snippetCompletion } from '@codemirror/autocomplete';


export function basicPythonCompletionSource(context: any) {
    const word = context.matchBefore(/\w*/);
    if (word.from === word.to && !context.explicit) return null;

    return {
        from: word.from,
        options: basicPythonCompletions,
        validFor: /^\w*$/,
    };
}


const basicPythonCompletions = [
    // Keywords
    { label: 'and', type: 'keyword', info: 'Logical AND operator' },
    { label: 'as', type: 'keyword', info: 'Alias for modules' },
    { label: 'assert', type: 'keyword', info: 'Assert statement for debugging' },
    { label: 'break', type: 'keyword', info: 'Exit a loop prematurely' },
    { label: 'class', type: 'keyword', info: 'Define a new class' },
    { label: 'continue', type: 'keyword', info: 'Skip the rest of the loop iteration' },
    { label: 'def', type: 'keyword', info: 'Define a new function' },
    { label: 'del', type: 'keyword', info: 'Delete an object' },
    { label: 'elif', type: 'keyword', info: 'Else if condition' },
    { label: 'else', type: 'keyword', info: 'Else condition' },
    { label: 'except', type: 'keyword', info: 'Catch exceptions' },
    { label: 'False', type: 'keyword', info: 'Boolean false value' },
    { label: 'finally', type: 'keyword', info: 'Execute code after try-except' },
    { label: 'for', type: 'keyword', info: 'For loop' },
    { label: 'from', type: 'keyword', info: 'Import specific parts of a module' },
    { label: 'global', type: 'keyword', info: 'Declare global variable' },
    { label: 'if', type: 'keyword', info: 'If condition' },
    { label: 'import', type: 'keyword', info: 'Import a module' },
    { label: 'in', type: 'keyword', info: 'Check membership in a collection' },
    { label: 'is', type: 'keyword', info: 'Test object identity' },
    { label: 'lambda', type: 'keyword', info: 'Create an anonymous function' },
    { label: 'None', type: 'keyword', info: 'Represents the absence of a value' },
    { label: 'nonlocal', type: 'keyword', info: 'Declare non-local variable' },
    { label: 'not', type: 'keyword', info: 'Logical NOT operator' },
    { label: 'or', type: 'keyword', info: 'Logical OR operator' },
    { label: 'pass', type: 'keyword', info: 'Null statement; do nothing' },
    { label: 'raise', type: 'keyword', info: 'Raise an exception' },
    { label: 'return', type: 'keyword', info: 'Return a value from a function' },
    { label: 'True', type: 'keyword', info: 'Boolean true value' },
    { label: 'try', type: 'keyword', info: 'Try block for exception handling' },
    { label: 'while', type: 'keyword', info: 'While loop' },
    { label: 'with', type: 'keyword', info: 'Context manager' },
    { label: 'yield', type: 'keyword', info: 'Yield expression for generators' },

    // Built-in Functions
    snippetCompletion('abs(${1})', {
        label: 'abs()',
        type: 'function',
        info: 'Return the absolute value of a number',
    }),
    snippetCompletion('all(${1})', {
        label: 'all()',
        type: 'function',
        info: 'Return True if all elements are true',
    }),
    snippetCompletion('any(${1})', {
        label: 'any()',
        type: 'function',
        info: 'Return True if any element is true',
    }),
    snippetCompletion('bin(${1})', {
        label: 'bin()',
        type: 'function',
        info: 'Convert an integer to a binary string',
    }),
    snippetCompletion('bool(${1})', {
        label: 'bool()',
        type: 'function',
        info: 'Convert a value to a Boolean',
    }),
    snippetCompletion('chr(${1})', {
        label: 'chr()',
        type: 'function',
        info: 'Return the string for a Unicode code point',
    }),
    snippetCompletion('dict(${1})', {
        label: 'dict()',
        type: 'function',
        info: 'Create a new dictionary',
    }),
    snippetCompletion('enumerate(${1})', {
        label: 'enumerate()',
        type: 'function',
        info: 'Return an enumerate object',
    }),
    snippetCompletion('float(${1})', {
        label: 'float()',
        type: 'function',
        info: 'Convert a value to a floating point number',
    }),
    snippetCompletion('help(${1})', {
        label: 'help()',
        type: 'function',
        info: 'Invoke the built-in help system',
    }),
    snippetCompletion('int(${1})', {
        label: 'int()',
        type: 'function',
        info: 'Convert a value to an integer',
    }),
    snippetCompletion('len(${1})', {
        label: 'len()',
        type: 'function',
        info: 'Return the length of an object',
    }),
    snippetCompletion('list(${1})', {
        label: 'list()',
        type: 'function',
        info: 'Create a new list',
    }),
    snippetCompletion('max(${1})', {
        label: 'max()',
        type: 'function',
        info: 'Return the largest item',
    }),
    snippetCompletion('min(${1})', {
        label: 'min()',
        type: 'function',
        info: 'Return the smallest item',
    }),
    snippetCompletion('open(${1})', {
        label: 'open()',
        type: 'function',
        info: 'Open a file and return a file object',
    }),
    snippetCompletion('print(${1})', {
        label: 'print(...)',
        type: 'function',
        info: 'Print to the console',
    }),
    snippetCompletion('range(${1})', {
        label: 'range()',
        type: 'function',
        info: 'Generate a sequence of numbers',
    }),
    snippetCompletion('round(${1})', {
        label: 'round()',
        type: 'function',
        info: 'Round a number to a given precision',
    }),
    snippetCompletion('set(${1})', {
        label: 'set()',
        type: 'function',
        info: 'Create a new set',
    }),
    snippetCompletion('str(${1})', {
        label: 'str()',
        type: 'function',
        info: 'Convert a value to a string',
    }),
    snippetCompletion('sum(${1})', {
        label: 'sum()',
        type: 'function',
        info: 'Sum the items of an iterable',
    }),
    snippetCompletion('tuple(${1})', {
        label: 'tuple()',
        type: 'function',
        info: 'Create a new tuple',
    }),
    snippetCompletion('type(${1})', {
        label: 'type()',
        type: 'function',
        info: 'Return the type of an object',
    }),
    snippetCompletion('zip(${1})', {
        label: 'zip()',
        type: 'function',
        info: 'Aggregate elements from iterables',
    }),

    // Common Data Types
    { label: 'int', type: 'type', info: 'Integer type' },
    { label: 'float', type: 'type', info: 'Floating point number type' },
    { label: 'str', type: 'type', info: 'String type' },
    { label: 'list', type: 'type', info: 'List type' },
    { label: 'tuple', type: 'type', info: 'Tuple type' },
    { label: 'dict', type: 'type', info: 'Dictionary type' },
    { label: 'set', type: 'type', info: 'Set type' },
    { label: 'bool', type: 'type', info: 'Boolean type' },
];
