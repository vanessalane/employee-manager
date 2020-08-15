const inquirer = require('inquirer');
const showMenu = require('./prompts');
const {validateRequiredResponse, validateNumber} = require('../utils/validation');

viewAllRoles = (connection) => {
    connection.query(
        `SELECT
            role.id AS 'role_id',
            title,
            salary,
            department.name AS department
         FROM role
         LEFT JOIN department ON department.id = department_id`,
        function(err, res) {
            console.log("\nReading roles...\n");
            if (err) throw err;
            console.table(res);
            showMenu(connection);
        }
    );
};

insertNewRole = (connection, newRole) => {
    connection.query(
        `INSERT INTO role SET ?`,
        newRole,  // should be an object with keys title, salary, and department_id
        function(err, res) {
            if (err) throw err;
            console.log(`\nAdded the new role!\n`);
            showMenu(connection);
        }
    )
}

addNewRole = (connection) => {
    console.log("Ok, let's add a new role.")

    // prompt for inputs that aren't dependent on the db call
    return inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Title:',
            validate: (input) => validateRequiredResponse(input)
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Salary:',
            validate: (input) => validateNumber(input)
        }

    ]).then((newRole) => {

        // get the options for the departments
        connection.query(
            `SELECT
                id AS 'department_id',
                name AS 'department'
            FROM department`,
            function(err, res) {
                console.log("\nReading departments...\n");
                if (err) throw err;

                // surface the options to the user
                inquirer.prompt({
                    type: 'list',
                    name: 'department',
                    message: 'Department:',
                    choices: res.map((res) => res.department),
                    validate: (input) => validateRequiredResponse(input)
                }).then((answer) => {
                    
                    // get the id for the provided department. Schema prevents duplicate department names
                    const departmentId = res.filter((queryRow) => queryRow.department === answer.department);
                    newRole.department_id = departmentId[0].department_id;

                    // add the role to the employee_db's role table
                    insertNewRole(connection, newRole);
                })
            }
        );
    });
};

module.exports = {addNewRole, viewAllRoles};