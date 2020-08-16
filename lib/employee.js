const cTable = require('console.table');
const inquirer = require('inquirer');
const mainPrompt = require('./menu');
const utils = require('./utils');
const { promptForDepartment } = require('./department');


/* START CRUD FUNCTIONS */

getAllEmployees = (connection) => {
    return new Promise(function(resolve, reject) {
        connection.query(
            `SELECT
                employee.id AS 'employee_id',
                CONCAT(employee.first_name, ' ', employee.last_name) AS 'employee',
                department.name as 'department',
                role.title as 'role',
                CONCAT('$ ', FORMAT(role.salary, 0)) as 'salary',
                CONCAT(manager.first_name, ' ', manager.last_name) AS 'manager'
            FROM employee
            LEFT JOIN role ON role.id = role_id
            LEFT JOIN department ON department.id = role.department_id
            LEFT JOIN employee manager ON manager.id = employee.manager_id
            ORDER BY employee.last_name`,
            function(err, res) {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            }
        );
    });
};


getAllManagers = (connection) => {
    return new Promise(function(resolve, reject) {
        connection.query(
            `SELECT
                CONCAT(manager.first_name, ' ', manager.last_name, ' - ', role.title) AS 'manager',
                manager.id as 'manager_id'
            FROM employee
            LEFT JOIN employee manager ON manager.id = employee.manager_id
            LEFT JOIN role ON role.id = manager.role_id
            WHERE employee.manager_id IS NOT NULL
            GROUP BY manager_id
            ORDER BY manager.last_name`,
            function(err, res) {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            }
        );
    });
};


getEmployeesByKwarg = (connection, kwargs) => {
    return new Promise(function(resolve, reject) {
        connection.query(
            `SELECT
                employee.id AS 'employee_id',
                employee.last_name as 'last_name',
                CONCAT(employee.first_name, ' ', employee.last_name) AS 'employee',
                department.id as 'department_id',
                department.name as 'department',
                role.title as 'role',
                CONCAT('$ ', FORMAT(role.salary, 0)) as 'salary',
                CONCAT(manager.first_name, ' ', manager.last_name) AS 'manager'
            FROM employee
            LEFT JOIN role ON role.id = employee.role_id
            LEFT JOIN department ON department.id = role.department_id
            LEFT JOIN employee manager ON manager.id = employee.manager_id
            WHERE ?
            ORDER BY employee.last_name`,
            [kwargs],
            function(err, res) {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            }
        );
    });
}


insertNewEmployee = (connection, newEmployee) => {
    
    // clean the data before adding it in
    newEmployee.first_name = toTitleCase(newEmployee.first_name);
    newEmployee.last_name = toTitleCase(newEmployee.last_name);

    // now add it
    connection.query(
        `INSERT INTO employee SET ?`,
        newEmployee,  // object with keys first_name, last_name, role_id, manager_id
        function(err, res) {

            // catch errors that are likely due to user input
            if (err && err.errno === 1062) {
                console.log("\nThat employee already exists! Let's try again.\n")
                showMenu(connection);
            } // catch errors that are not related to user input
            else if (err) {
                console.log(`Couldn't load the employees. Error: ${err.sqlMessage}.`)
                connection.end();
                return false;
            } // or send them back to the main menu
            else {
                console.log(`\nEmployee added!`);
                showMenu(connection);
            }
        }
    )
};


updateEmployee = (connection, employeeInfo) => {

    // define the arguments for the SQL query
    let whereArgs = {id: employeeInfo.employee_id};
    let setArgs = {};
    if (employeeInfo.manager_id) {
        setArgs.manager_id = employeeInfo.manager_id;
    }
    if (employeeInfo.role_id) {
        setArgs.role_id = employeeInfo.role_id;
    }

    // query to update the employee table
    connection.query(
        `UPDATE employee SET ? WHERE ?`,
        [setArgs, whereArgs],
        function(err, res) {
            if (err) {
                console.log(`Couldn't update the employee. Error: ${err.sqlMessage}.`)
                connection.end();
                return false;
            }

            // send them back to the main menu
            console.log(`\nEmployee updated!`);
            showMenu(connection);
        }
    )
}


updateManager = (connection) => {
    const employeePrompt = "Please choose the employee you'd like to update:";
    promptForEmployee(connection, employeePrompt).then((employeeId) => {
        let employeeInfo = { employee_id: employeeId };
        const managerPrompt = "Please choose the employee's manager:";
        promptForEmployee(connection, managerPrompt, true).then((managerId) => {
            employeeInfo.manager_id = managerId;
        }).then(() => updateEmployee(connection, employeeInfo));
    });
}


deleteEmployee = (connection) => {
    const prompt = "Which employee would you like to delete?"
    promptForEmployee(connection, prompt).then((employeeId) => {
        deleteById(connection, 'employee', employeeId);
    });
}

/* END CRUD FUNCTIONS */
/* START PROMPT FUNCTIONS */

addEmployee = (connection) => {

    // prompt the user for the employee's first and last name
    return inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: "What's the new employee's first name?",
            validate: (firstNameInput) => validateRequired(firstNameInput)
        },{
            type: 'input',
            name: 'last_name',
            message: "What's the new employee's last name?",
            validate: (lastNameInput) => validateRequired(lastNameInput)
        }
    ]).then((newEmployee) => {

        // prompt the user for the employee's role
        const deptPrompt = "What's the new employee's department?";
        const rolePrompt = "What's the new employee's role?";
        promptForRole(connection, deptPrompt, rolePrompt).then((roleId) => {
            newEmployee.role_id = roleId;

            // prompt the user for the employee's manager
            const managerPrompt = "Who's the new employee's manager?";
            promptForEmployee(connection, managerPrompt, true).then((managerId) => {
                newEmployee.manager_id = managerId
            }).then(() => insertNewEmployee(connection, newEmployee));
        });
    });
};


promptForEmployee = (connection, prompt, managerPrompt=false) => {
    return new Promise(
        function(resolve, reject) {
            getAllEmployees(connection).then((res) => {

                // prompt the user for the employee
                let employeeChoices = res.map((row) => `${row.employee} - ${row.role}`)
                if (managerPrompt) employeeChoices.push('None');  // add a "None" option because manager can be null
                inquirer.prompt({
                    type: 'list',
                    name: 'employee',
                    message: prompt,
                    choices: employeeChoices,
                    validate: (input) => validateRequired(input)
                }).then((answer) => {

                    // use the answer and managerPrompt bool to define the employee/updateManagerPromptmanager id
                    let id;
                    if (managerPrompt && answer.employee === 'None') {
                        id = null;
                    } else {
                        const choice = answer.employee;
                        const choiceIndex = employeeChoices.indexOf(choice);
                        id = res[choiceIndex].employee_id;
                    }

                    if (isNaN(id) && id != null) {
                        const err = `could not find an Id for employee = ${employeeChoice}`;
                        return reject(err);
                    }
                    resolve(id);
                });
            });
        }
    )
}


promptForManager = (connection, prompt) => {
    return new Promise(
        function(resolve, reject) {
            getAllManagers(connection).then((res) => {
                // prompt the user for the employee
                let managerChoices = res.map((row) => `${row.manager}`)
                inquirer.prompt({
                    type: 'list',
                    name: 'manager',
                    message: prompt,
                    choices: managerChoices,
                    validate: (input) => validateRequired(input)
                }).then((answer) => {
                    const choice = answer.manager;
                    const choiceIndex = managerChoices.indexOf(choice);
                    const managerId = res[choiceIndex].manager_id;

                    if (!managerId) {
                        const err = `could not find an Id for manager = ${employeeChoice}`;
                        return reject(err);
                    }
                    resolve(managerId);
                });
            }
        );
    })
}

/* END PROMPT FUNCTIONS */
/* START VIEW FUNCTIONS */

viewAllEmployees = (connection) => {
    getAllEmployees(connection).then((res) => {
        const resToDisplay = formatEmployeesToDisplay(res);
        console.table(resToDisplay);
    }).then(() => showMenu(connection));
};


viewEmployeesByDepartment = (connection) => {
    promptForDepartment(connection).then((departmentId) => {
        const kwargs = { "department_id": departmentId };
        getEmployeesByKwarg(connection, kwargs).then((res) => {
            const resToDisplay = formatEmployeesToDisplay(res);
            console.table(resToDisplay);
        }).then(() => showMenu(connection));
    });
}


viewEmployeesByLastName = (connection) => {
    return inquirer.prompt(
        {
            type: 'input',
            name: 'lastName',
            message: "What's the employee's last name?",
            validate: (firstNameInput) => validateRequired(firstNameInput)
        }).then((answer) => {
            kwargs = { "employee.last_name": answer.lastName };
            getEmployeesByKwarg(connection, kwargs).then((res) => {
                const resToDisplay = formatEmployeesToDisplay(res);
                console.table(resToDisplay);
            }).then(() => showMenu(connection));
        });
}


viewEmployeesByManager = (connection) => {
    promptForManager(connection).then((managerId) => {
        const kwargs = { "employee.manager_id" : managerId };
        getEmployeesByKwarg(connection, kwargs).then((res) => {
            const resToDisplay = formatEmployeesToDisplay(res);
            console.table(resToDisplay);
        }).then(() => showMenu(connection));
    });
}

/* END VIEW FUNCTIONS */


module.exports = {
    deleteEmployee,
    getAllEmployees,
    promptForEmployee,
    viewAllEmployees,
    viewEmployeesByDepartment,
    updateEmployee,
    updateManager
};