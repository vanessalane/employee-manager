validateNumber = (input) => {
    if (!input | isNaN(input)) {
        return 'Input must be a number.';
    }
    else {
        return true;
    }
}

validateRequiredResponse = (input) => {
    const value = input.trim();
    if (!value) {
        return 'Please provide a response.'
    } else {
        return true;
    }
}

module.exports = {validateRequiredResponse, validateNumber};