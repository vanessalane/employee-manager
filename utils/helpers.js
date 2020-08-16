validateNumber = (input) => {
    if (!input) {
        return 'Please provide a response.'
    }

    if (isNaN(input)) {
        return 'Input must be a number.';
    }
    else {
        return true;
    }
}

validateRequired = (input) => {
    if (!input) {
        return 'Please provide a response.';
    }
    
    if (typeof input === "string" && !input.trim()) {
        return 'Please provide a valid response.'
    }

    return true;
}

toTitleCase = (input) => {
    if (!input) {
        return false;
    }

    let inputArray = input.split(' ');
    inputArray = inputArray.map((word) => word.slice(0,1).toUpperCase() + word.slice(1));
    return inputArray.join(" ");
}


module.exports = {validateRequired, validateNumber, toTitleCase};