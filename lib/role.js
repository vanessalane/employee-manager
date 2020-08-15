const inquirer = require('inquirer');
const prompt = require('./prompt');
const department = require('./department');
const employee = require('./employee');
const validation = require('../utils/validation');

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
            if (err) {
                console.log(`Sorry, I couldn't load the roles. Error: ${err.sqlMessage}.`)
            } else {
                console.table(res);
            }
            showMenu(connection);
        }
    );
};

addNewRole = (connection) => {
    console.log("Ok, let's add a new role.")

    // prompt for the role's title and salary
    return inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Title:',
            validate: (input) => validateRequired(input)
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
            function(departmentErr, departmentRes) {
                if (departmentErr) {
                    console.log(`Sorry, I couldn't load the roles. Error: ${departmentErr.sqlMessage}.`);
                }

                // surface the options to the user
                const departmentChoices = departmentRes.map((res) => res.department)
                inquirer.prompt({
                    type: 'list',
                    name: 'department',
                    message: 'Department:',
                    choices: departmentChoices,
                    validate: (input) => validateRequiredResponse(input)
                }).then((answer) => {

                    // add the department ID to the new role
                    const departmentId = departmentRes.filter((queryRow) => queryRow.department === answer.department);
                    newRole.department_id = departmentId[0].department_id;

                    // update the DB
                    connection.query(
                        `INSERT INTO role SET ?`,
                        newRole,  // should be an object with keys title, salary, and department_id
                        function(err, res) {
                            if (err && err.errno === 1062) {
                                console.log("\nThat role already exists! Let's try again.\n")
                                addNewRole(connection);
                            } else if (err) {
                                throw err
                            } else {
                                console.log(`\nAdded the new role!\n`);
                                showMenu(connection);
                            }
                        }
                    )
                });
            }
        )
    });
};

module.exports = {addNewRole, viewAllRoles};