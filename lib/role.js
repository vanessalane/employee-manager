const inquirer = require('inquirer');
const prompt = require('./prompt');
const department = require('./department');
const employee = require('./employee');
const {validateRequired, validateNumber} = require('../utils/validation');

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

insertNewRole = (connection, newRole) => {
    connection.query(
        `INSERT INTO role SET ?`,
        newRole,  // should be an object with keys title, salary, and department_id
        function(err, res) {
            if (err.errno === 1062) {
                console.log("\nThat role already exists! Let's try again.\n")
            } else if (err) {
                throw err
            } else {
                console.log(`\nAdded the new role!\n`);
            }
            showMenu(connection);
        }
    )
}

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
        department.promptForDepartment(connection, newRole, insertNewRole)
    });
};

promptForRole = (connection, callbacks=[], priorResponses={}) => {
    console.log(priorResponses);
    connection.query(
        `SELECT
            id,
            title
        FROM role
        WHERE ?`, 
        { department_id: priorResponses.department_id},
        function(err, res) {
            if (err) {
                console.log(`Couldn't load the roles because ${err.sqlMessage}. Sorry!`)
                showMenu(connection);
            } else {
                // surface the options to the user
                const roleChoices = res.map((res) => res.title)
                inquirer.prompt({
                    type: 'list',
                    name: 'title',
                    message: 'Role:',
                    choices: roleChoices,
                    validate: (input) => validateRequired(input)
                }).then((answer) => {
                    // if no callbacks, there's nothing to do with this response
                    if (callbacks.length === 0) {
                        connection.end();
                    }

                    // get the id for the provided role. Schema prevents duplicate roles within the same department.
                    const roleId = res.filter((queryRow) => queryRow.title === answer.title);
                    priorResponses.role_id = roleId[0].id;
                    console.log(priorResponses);

                    // execute the next callback
                    const firstCallback = callbacks.shift();
                    firstCallback(connection, callbacks, priorResponses);
                });
            }
        }
    )
};

module.exports = {addNewRole, promptForRole, viewAllRoles};