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
            console.log(`Deleted ${res.affectedRows} ${table}(s) from the database`);
            showMenu(connection);
        }
    );
};


module.exports = {validateRequired, validateNumber, toTitleCase, deleteById};