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

addNewRole = (connection) => {
    console.log("Ok, let's add a new role.")
    return inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Title:',
            validate: validateRequiredResponse(titleInput)
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Salary:',
            validate: validateNumber(salaryInput)
        }
    ]).then((newRole) => {
        newRole.department_id = 1;
        connection.query(
            `INSERT INTO role SET ?`,
            newRole,  // should be an object with keys title, salary, and department_id
            function(err, res) {
                if (err) throw err;
                console.log(`\nAdded the new role!\n`);
                showMenu(connection);
            }
        )}
    );
};

module.exports = {addNewRole, viewAllRoles};