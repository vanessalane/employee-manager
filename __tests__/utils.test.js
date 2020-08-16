const utils = require('../lib/utils');
const { validateNumber } = require('../lib/utils');

// validateRequired
test('validateRequired returns "Please provide a response." if no value is provided', () => {
    const nullResult = validateRequired(null);
    expect(nullResult).toBe('Please provide a response.');
})

test('validateRequired returns "Please provide a valid response." if a whitespace response is provided', () => {
    const nullResult = validateRequired('     ');
    expect(nullResult).toBe('Please provide a valid response.');
})

test('validateRequired returns true if a value is provided', () => {
    const value = 27;
    const result = validateRequired(value);
    expect(result).toBe(true);
})

// validateNumber
test('validateNumber returns "Please provide a response." if no value is provided', () => {
    const result = validateNumber(null);
    expect(result).toBe('Please provide a response.');
})

test('validateNumber returns "Input must be a number." if a non-number value is provided', () => {
    const stringResult = validateNumber('hello');
    const arrayResult = validateNumber([1,2,3]);
    const objectResult = validateNumber({'key' : 'value'});

    expect(stringResult).toBe('Input must be a number.');
    expect(arrayResult).toBe('Input must be a number.');
    expect(objectResult).toBe('Input must be a number.');
})

test('validateNumber returns true if a value is provided', () => {
    const value = 27;
    const result = validateNumber(value);
    expect(result).toBe(true);
})

// toTitleCase
test('toTitleCase returns a string in title case if there are no spaces', () => {
    const result = toTitleCase('hello');
    expect(result).toBe('Hello');
})

test('toTitleCase returns a string in title case if there are spaces', () => {
    const result = toTitleCase('hello i am vanessa');
    expect(result).toBe('Hello I Am Vanessa');
})

test('toTitleCase only changes the first letter', () => {
    const result = toTitleCase('mcDonalds');
    expect(result).toBe('McDonalds');
})

test('toTitleCase only changes the first letter', () => {
    const result = toTitleCase('mcDonalds');
    expect(result).toBe('McDonalds');
})

test('toTitleCase returns false if no input is provided', () => {
    const result = toTitleCase();
    expect(result).toBe(false);
})

// getIdFromChoice
test('getIdFromChoice should return the correct id number if choices were not reformatted', () => {
    const results = [{
        id: 1,
        name: 'test'
    },{
        id: 2,
        name: 'test2'
    },{
        id: 3,
        name: 'test3'
    }]
    const choices = ['test', 'test2', 'test3'];

    expect(getIdFromChoice(results, choices, 'test2')).toBe(2);
})
