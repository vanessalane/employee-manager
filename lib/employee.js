const cTable = require('console.table');
const inquirer = require('inquirer');
const mainPrompt = require('./mainPrompt');
const { validateRequired } = require('../utils/helpers');


getAllEmployees = (connection, orderByArg='employee.last_name') => {
    return new Promise(function(resolve, reject) {
        const sql = `SELECT 
                        employee.id AS 'employee_id',
                        CONCAT(employee.first_name, ' ', employee.last_name) AS 'employee',
                        department.name as 'department',
                        role.title as 'role',
                        role.salary,
                        CONCAT(manager.first_name, ' ', manager.last_name) AS 'manager'
                    FROM employee
                    LEFT JOIN role ON role.id = role_id
                    LEFT JOIN department ON department.id = role.department_id
                    LEFT JOIN employee manager ON manager.id = employee.manager_id
                    ORDER BY ${orderByArg}`
        connection.query(sql, function(err, res) {
            if (err) {
                return reject(err);
            }
            resolve(res);
        });
    });
};


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


deleteEmployee = (connection) => {
    const prompt = "Which employee would you like to delete?"
    promptForEmployee(connection, prompt).then((employeeId) => {
        deleteById(connection, 'employee', employeeId);
    }).then(() => showMenu(connection));
}


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


updateManager = (connection) => {
    const employeePrompt = "Please choose the employee you'd like to update:";
    promptForEmployee(connection, employeePrompt).then((employeeId) => {
        let employeeInfo = { employee_id: employeeId };
        const managerPrompt = "Please choose the employee's manager:";
        promptForEmployee(connection, managerPrompt, true).then((managerId) => {
            employeeInfo.manager_id = managerId;
        }).then(() => updateEmployee(connection, employeeInfo));
    }).then(() => showMenu(connection));
}



viewAllEmployees = (connection, orderByArg='employee.last_name') => {

    // define how the results should be sorted
    if (orderByArg === 'manager') {
        orderByArg = 'manager.last_name';
    }

    // get and return the results
    getAllEmployees(connection, orderByArg).then((res) => {
        const resToDisplay = res.map((row) => {
            const formattedSalary = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(row.salary);
            return {
                Name: row.employee,
                Department: row.department,
                Role: row.title,
                Salary: formattedSalary,
                Manager: row.manager
            }
        });

        // surface the employees
        console.table(resToDisplay);
    }).then(() => showMenu(connection));
};


module.exports = {
    deleteEmployee,
    getAllEmployees,
    promptForEmployee,
    viewAllEmployees,
    updateEmployee,
    updateManager
};