const inquirer = require('inquirer');
const prompt = require('./prompt');
const {validateRequiredResponse} = require('../utils/validation');
const { promptForDepartment } = require('./department');

viewAllEmployees = (connection) => {
    connection.query(
        `SELECT 
            employee.id AS 'employee_id',
            employee.first_name,
            employee.last_name,
            role.title,
            role.salary,
            CONCAT(manager.first_name, ' ', manager.last_name) AS 'manager'
         FROM employee
         LEFT JOIN role ON role.id = role_id
         LEFT JOIN employee manager ON manager.id = employee.manager_id`,
        function(err, res) {
            if (err) {
                console.log(`Sorry, I couldn't load the employees. Error: ${err.sqlMessage}.`)
            } else {
                console.table(res);
            }
            showMenu(connection);
        }
    );
};

insertNewEmployee = (connection, newEmployee) => {
    connection.query(
        `INSERT INTO employee SET ?`,
        newEmployee,  // object with keys first_name, last_name, role_id, manager_id
        function(err, res) {
            if (err) throw err;
            console.log(`\nEmployee added!\n`);
            showMenu(connection);
        }
    )
};

updateEmployeeRole = (connection, callbacks, employeeInfo) => {
    const roleId = employeeInfo.role_id;
    const employeeId = employeeInfo.employee_id;
    console.log(employeeInfo);

    connection.query(
        `UPDATE employee SET ? WHERE ?`,
        [{role_id: roleId}, {id: employeeId}],
        function(err, res) {
            if (err) throw err;
            if (callbacks.length === 0) {  // figure out how to avoid
                console.log(`\nEmployee role updated.\n`);
                showMenu(connection);
            }
        }
    );
};

addNewEmployee = (connection, callbacks=[promptForRole, showMenu], priorResponses={}) => {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'First Name:',
            validate: (firstNameInput) => validateRequired(firstNameInput)
        },{
            type: 'input',
            name: 'last_name',
            message: 'Last Name:',
            validate: (lastNameInput) => validateRequired(lastNameInput)
        }
    ]).then((newEmployee) => {
        promptForDepartment(connection, callbacks, newEmployee);
    }).then((newEmployee) => {
        insertNewEmployee(connection, newEmployee);
    });
};

chooseEmployee = (connection, callbacks=[], priorResponses={}) => {
    console.log(priorResponses);
    connection.query(
        `SELECT
            id,
            first_name,
            last_name
        FROM employee
        `,
        function(err, res) {
            if (err) {
                console.log(`Couldn't load the employees because ${err.sqlMessage}. Sorry!`)
                showMenu(connection);
            } else {
                // surface the options to the user
                const employeeChoices = res.map((res) => `${res.first_name} ${res.last_name}`)
                inquirer.prompt({
                    type: 'list',
                    name: 'employee',
                    message: 'Employee:',
                    choices: employeeChoices,
                    validate: (input) => validateRequired(input)
                }).then((answer) => {

                    // if no callbacks, there's nothing to do with this response
                    if (callbacks.length === 0) {
                        connection.end();
                    }

                    // get the id for the provided role. Schema prevents duplicate roles within the same department.
                    const employeeChoiceIndex = employeeChoices.indexOf(answer.employee);
                    const employee_id = res[employeeChoiceIndex].id;
                    priorResponses.employee_id = employee_id;

                    // execute the next callback
                    const firstCallback = callbacks.shift();
                    firstCallback(connection, callbacks, priorResponses);
                });
            }
        }
    )
}

module.exports = {addNewEmployee, chooseEmployee, updateEmployeeRole, viewAllEmployees};