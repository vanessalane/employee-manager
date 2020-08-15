const inquirer = require('inquirer');
const prompt = require('./prompt');

viewAllDepartments = (connection) => {
    connection.query(
        `SELECT
            id AS 'department_id',
            name AS 'department'
        FROM department`,
        function(err, res) {
            if (err) {
                console.log(`Sorry, I couldn't load the roles. Error: ${err.sqlMessage}.`)
            } else {
                console.table(res);
            }
            showMenu(connection);
        }
    );
};

promptForDepartment = (connection, callbacks=[], priorResponses={}) => {
    // get the options for the departments
    connection.query(
        `SELECT
            id AS 'department_id',
            name AS 'department'
        FROM department`,
        function(err, res) {
            if (err) throw err;

            // surface the options to the user
            const departmentChoices = res.map((res) => res.department)
            inquirer.prompt({
                type: 'list',
                name: 'department',
                message: 'Department:',
                choices: departmentChoices,
                validate: (input) => validateRequiredResponse(input)
            }).then((answer) => {
                // if no callbacks, there's nothing to do with this response
                if (callbacks.length === 0) {
                    connection.end();
                }

                // get the id for the provided department. Schema prevents duplicate department names
                const departmentId = res.filter((queryRow) => queryRow.department === answer.department);
                priorResponses.department_id = departmentId[0].department_id;

                // execute the next callback
                const firstCallback = callbacks.shift();
                firstCallback(connection, callbacks, priorResponses);
            });
        }
    );
};

module.exports = {promptForDepartment, viewAllDepartments};