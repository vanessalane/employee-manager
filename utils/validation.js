validateNumber = (input) => {
    if (!input | isNaN(input)) {
        return 'Input must be a number.';
    }
    else {
        return true;
    }
}

validateRequired = (input) => {
    const value = input.trim();
    if (!value) {
        return 'Please provide a response.'
    } else {
        return true;
    }
}

module.exports = {validateRequired, validateNumber};