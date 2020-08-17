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


formatEmployeesToDisplay = (data) => {
    if (data.length === 0) {
        return '\nNo employees to display!'
    } else {
        return data.map((row) => {
            return {
                Name: row.employee,
                Department: row.department,
                Role: row.role,
                Salary: row.salary,
                Manager: row.manager
            }
        });
    }
}


deleteById = (connection, table, id) => {
    return connection.query(
        `DELETE FROM ${table} WHERE id = ${id}`,
        function(err, res) {
            if (err) {
                console.log(`Couldn't delete record where id=${id} from ${table}. Error: ${err.sqlMessage}.`)
                return false;
            }
            console.log(`Deleted ${res.affectedRows} ${table}(s) from the database`);
        });
    };


module.exports = {validateRequired, validateNumber, toTitleCase, formatEmployeesToDisplay, deleteById};