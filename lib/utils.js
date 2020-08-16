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

deleteById = (connection, table, id) => {
    connection.query(
        `DELETE FROM ${table} WHERE id = ${id}`,
        function(err, res) {
            if (err) {
                console.log(`Couldn't delete record where id=${id} from ${table}. Error: ${err.sqlMessage}.`)
                connection.end();
                return false;
            }

            // let the user know if it worked and send them back to the main menu
            console.log(`\nDeleted ${res.affectedRows} from ${table}.`);
            showMenu(connection);
        }
    );
};

module.exports = {deleteById, validateRequired, validateNumber, toTitleCase};