const inquirer = require('inquirer');
const employee = require('./index');
const utils = require('../utils');

addEmployeePrompt = (connection) => {

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
        
        // get the options for the departments that can be chosen
        connection.query(
            `SELECT
                id AS 'department_id',
                name AS 'department'
            FROM department
            ORDER BY department`,
            function(deptErr, deptRes) {
                if (deptErr) {
                    console.log(`Couldn't load the departments. Error: ${deptErr.sqlMessage}.`)
                    connection.end();
                    return false;
                }

                // surface the options to the user
                const departmentChoices = deptRes.map((row) => toTitleCase(row.department));
                inquirer.prompt({
                    type: 'list',
                    name: 'department',
                    message: "What's the new employee's department?",
                    choices: departmentChoices,
                    validate: (input) => validateRequiredResponse(input)
                }).then((answer) => {

                    // get the id for the provided department to help us surface the roles available
                    const departmentChoice = answer.department;
                    const departmentChoiceIndex = departmentChoices.indexOf(departmentChoice);
                    const departmentId = deptRes[departmentChoiceIndex].department_id;

                    // get the options for the roles within the specified department
                    connection.query(
                        `SELECT
                            id as role_id,
                            title
                        FROM role
                        WHERE ?`, 
                        { department_id: departmentId },
                        function(roleErr, roleRes) {
                            if (roleErr) {
                                console.log(`Couldn't load the roles. Error: ${roleErr.sqlMessage}.`)
                                connection.end();
                                return false;
                            }

                            // surface the options to the user
                            const roleChoices = roleRes.map((row) => row.title)
                            inquirer.prompt({
                                type: 'list',
                                name: 'title',
                                message: "What's the new employee's role?",
                                choices: roleChoices,
                                validate: (input) => validateRequired(input)
                            }).then((answer) => {

                                // get the id for the provided role and store it
                                const roleChoice = answer.title;
                                const roleChoiceIndex = roleChoices.indexOf(roleChoice);
                                const roleId = roleRes[roleChoiceIndex].role_id;
                                newEmployee.role_id = roleId;

                                // query the DB for managers that can be chosen
                                connection.query(
                                    `SELECT
                                        employee.id as 'manager_id',
                                        role.title,
                                        CONCAT(employee.first_name, ' ', employee.last_name) AS 'manager_name'
                                    FROM employee
                                    LEFT JOIN role ON role.id = employee.role_id
                                    ORDER BY employee.last_name`,
                                    function(managerErr, managerRes) {
                                        if (managerErr) {
                                            console.log(`Couldn't load the employees. Error: ${managerErr.sqlMessage}.`)
                                            connection.end();
                                            return false;
                                        }

                                        // surface the options to the user
                                        const managerChoices = managerRes.map((row) => `${row.manager_name} - ${row.title}`);
                                        inquirer.prompt({
                                            type: 'list',
                                            name: 'manager',
                                            message: "Who's the new employee's manager?",
                                            choices: managerChoices,
                                            validate: (input) => validateRequiredResponse(input)
                                        }).then((answer) => {

                                            // get the id for the selected manager if one was chosen
                                            if (answer.manager != 'None') {
                                                const managerChoice = answer.manager
                                                const managerChoiceIndex = managerChoices.indexOf(managerChoice);
                                                const manager_id = managerRes[managerChoiceIndex].manager_id;
                                                newEmployee.manager_id = manager_id;
                                            }
                                            insertNewEmployee(connection, newEmployee)
                                        });
                                    }
                                );
                            });
                        }
                    );
                });
            }
        )
    });
};

deleteEmployeePrompt = (connection) => {

    // query the DB for employees that can be deleted
    connection.query(
        `SELECT 
            employee.id AS 'employee_id',
            CONCAT(employee.first_name, ' ', employee.last_name) AS 'employee',
            role.title as 'role'
        FROM employee
        LEFT JOIN role ON role.id = role_id
        ORDER BY employee.last_name`,
        function(employeeErr, employeeRes) {
            if (employeeErr) {
                console.log(`Couldn't load the employees. Error: ${employeeErr.sqlMessage}.`)
                connection.end();
                return false;
            }

            // surface the options to the user
            const employeeChoices = employeeRes.map((row) => `${row.employee} - ${row.role}`)
            inquirer.prompt({
                type: 'list',
                name: 'employee',
                message: "Please choose the employee you'd like to delete:",
                choices: employeeChoices,
                validate: (input) => validateRequired(input)
            }).then((newManagerInfo) => {
                
                // find the employee ID
                const employeeChoice = newManagerInfo.employee;
                const employeeChoiceIndex = employeeChoices.indexOf(employeeChoice);
                const employeeId = employeeRes[employeeChoiceIndex].employee_id;

                // delete the employee
                deleteEmployee(connection, employeeId);
            });
        }
    );
};

updateManagerPrompt = (connection, existingData) => {
 
    // query the DB for a list of the employees that can be updated
    connection.query(
        `SELECT 
            employee.id AS 'employee_id',
            CONCAT(employee.first_name, ' ', employee.last_name) AS 'employee',
            role.title as 'role'
        FROM employee
        LEFT JOIN role ON role.id = role_id
        ORDER BY employee.last_name`,
        function(employeeErr, employeeRes) {
            if (employeeErr) {
                console.log(`Couldn't load the employees. Error: ${employeeErr.sqlMessage}.`)
                connection.end();
                return false;
            }

            // surface the options to the user
            const employeeChoices = employeeRes.map((row) => `${row.employee} - ${row.role}`)
            inquirer.prompt({
                type: 'list',
                name: 'employee',
                message: "Please choose the employee you'd like to update:",
                choices: employeeChoices,
                validate: (input) => validateRequired(input)
            }).then((employeeInfo) => {
                
                // find and store the employee ID
                const employeeChoice = employeeInfo.employee;
                const employeeChoiceIndex = employeeChoices.indexOf(employeeChoice);
                const employeeId = employeeRes[employeeChoiceIndex].employee_id;
                employeeInfo.employee_id = employeeId;
                
                // query the DB for managers that can be chosen
                connection.query(
                    `SELECT
                        employee.id AS 'manager_id',
                        role.title,
                        CONCAT(employee.first_name, ' ', employee.last_name) AS 'manager_name'
                    FROM employee
                    LEFT JOIN role ON role.id = employee.role_id
                    ORDER BY employee.last_name`,
                    function(managerErr, managerRes) {
                        if (managerErr) {
                            console.log(`Couldn't load the employees. Error: ${managerErr.sqlMessage}.`)
                            connection.end();
                            return false;
                        }

                        // surface the options to the user
                        const managerChoices = managerRes.map((row) => `${row.manager_name} - ${row.title}`);
                        inquirer.prompt({
                            type: 'list',
                            name: 'manager',
                            message: "Who's the employee's manager?",
                            choices: managerChoices,
                            validate: (input) => validateRequiredResponse(input)
                        }).then((answer) => {

                            // get the manager and update the 
                            const managerChoice = answer.manager
                            const managerChoiceIndex = managerChoices.indexOf(managerChoice);
                            const manager_id = managerRes[managerChoiceIndex].manager_id;
                            employeeInfo.manager_id = manager_id;

                            // update the employee's manager
                            updateEmployee(connection, employeeInfo);
                        });
                    }
                );
            });
        }
    );   
};

module.exports = {addEmployeePrompt, updateManagerPrompt};