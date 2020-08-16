const inquirer = require('inquirer');
const role = require('./index');
const utils = require('../utils');

addRolePrompt = (connection) => {
    console.log("\nOK, let's add a new role.\n")

    // prompt for the role's title and salary
    return inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: "What's the title of this new role?",
            validate: (input) => validateRequired(input)
        },
        {
            type: 'input',
            name: 'salary',
            message: "What's the salary for this role?",
            validate: (input) => validateNumber(input)
        }
    ]).then((newRole) => {

        // get the options for the departments
        connection.query(
            `SELECT
                id AS 'department_id',
                name AS 'department'
            FROM department
            ORDER BY department`,
            function(deptErr, deptRes) {
                if (deptErr) {
                    console.log(`Sorry, I couldn't load the roles. Error: ${deptErr.sqlMessage}.`);
                    connection.end();
                    return false;
                }

                // surface the options to the user
                const departmentChoices = deptRes.map((row) => row.department)
                inquirer.prompt({
                    type: 'list',
                    name: 'department',
                    message: "In which department should this role be created?",
                    choices: departmentChoices,
                    validate: (input) => validateRequiredResponse(input)
                }).then((answer) => {

                    // add the department ID to the new role
                    const departmentChoice = answer.department;
                    const departmentChoiceIndex = departmentChoices.indexOf(departmentChoice);
                    const departmentID = deptRes[departmentChoiceIndex].department_id;
                    newRole.department_id = departmentID;
                    insertNewRole(connection, newRole);
                });
            }
        )
    });
};

deleteRolePrompt = (connection) => {
    connection.query(
        `SELECT
            id AS 'department_id',
            name AS 'department'
        FROM department
        ORDER BY name`,
        function(deptErr, deptRes) {
            if (deptErr) {
                console.log(`Couldn't load the departments. Error: ${deptErr.sqlMessage}.`)
                connection.end();
                return false;
            }

            // surface the options to the user
            const departmentChoices = deptRes.map((row) => row.department)
            inquirer.prompt({
                type: 'list',
                name: 'department',
                message: "In which department is the role you'd like to delete?",
                choices: departmentChoices,
                validate: (input) => validateRequiredResponse(input)
            }).then((answer) => {

                // get the id for the provided department to help us surface the roles available
                const departmentChoice = answer.department;
                const departmentChoiceIndex = departmentChoices.indexOf(departmentChoice);
                const departmentId = deptRes[departmentChoiceIndex].department_id;

                // get the options for the roles
                connection.query(
                    `SELECT
                        id as role_id,
                        title
                    FROM role
                    WHERE ?
                    ORDER BY title`, 
                    { department_id: departmentId },
                    function(roleErr, roleRes) {
                        if (roleErr) {
                            console.log(`Couldn't load the roles. Error: ${roleErr.sqlMessage}`)
                            showMenu(connection);
                            return;
                        }

                        // surface the options to the user
                        const roleChoices = roleRes.map((row) => row.title)
                        inquirer.prompt({
                            type: 'list',
                            name: 'role',
                            message: "Which role would you like to delete?",
                            choices: roleChoices,
                            validate: (input) => validateRequired(input)
                        }).then((answer) => {

                            // get the id for the provided role. Schema prevents duplicate roles within the same department.
                            const roleChoice = answer.role;
                            const roleChoiceIndex = roleChoices.indexOf(roleChoice);
                            const roleId = roleRes[roleChoiceIndex].role_id;

                            deleteRole(connection, roleId);
                        });
                    }
                );
            });
        }
    );
}

updateRolePrompt = (connection) => {
    console.log("\nOK, let's update an employee's role.\n")

    // get the options for employees
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
            }).then((employeeUpdateInfo) => {
                
                // store the employee ID
                const employeeChoice = employeeUpdateInfo.employee;
                const employeeChoiceIndex = employeeChoices.indexOf(employeeChoice);
                const employeeId = employeeRes[employeeChoiceIndex].employee_id;
                employeeUpdateInfo.employee_id = employeeId;

                // get the options for the departments
                connection.query(
                    `SELECT
                        id AS 'department_id',
                        name AS 'department'
                    FROM department
                    ORDER BY name`,
                    function(deptErr, deptRes) {
                        if (deptErr) {
                            console.log(`Couldn't load the departments. Error: ${deptErr.sqlMessage}.`)
                            connection.end();
                            return false;
                        }

                        // surface the options to the user
                        const departmentChoices = deptRes.map((row) => row.department)
                        inquirer.prompt({
                            type: 'list',
                            name: 'department',
                            message: "What's the employee's new department?",
                            choices: departmentChoices,
                            validate: (input) => validateRequiredResponse(input)
                        }).then((answer) => {

                            // get the id for the provided department to help us surface the roles available
                            const departmentChoice = answer.department;
                            const departmentChoiceIndex = departmentChoices.indexOf(departmentChoice);
                            const departmentId = deptRes[departmentChoiceIndex].department_id;

                            // get the options for the roles
                            connection.query(
                                `SELECT
                                    id as role_id,
                                    title
                                FROM role
                                WHERE ?
                                ORDER BY title`, 
                                { department_id: departmentId },
                                function(roleErr, roleRes) {
                                    if (roleErr) {
                                        console.log(`Couldn't load the roles. Error: ${roleErr.sqlMessage}`)
                                        showMenu(connection);
                                        return;
                                    }

                                    // surface the options to the user
                                    const roleChoices = roleRes.map((row) => row.title)
                                    inquirer.prompt({
                                        type: 'list',
                                        name: 'role',
                                        message: "What's the employee's new role?",
                                        choices: roleChoices,
                                        validate: (input) => validateRequired(input)
                                    }).then((answer) => {

                                        // get the id for the provided role. Schema prevents duplicate roles within the same department.
                                        const roleChoice = answer.role;
                                        const roleChoiceIndex = roleChoices.indexOf(roleChoice);
                                        const roleId = roleRes[roleChoiceIndex].role_id;
                                        employeeUpdateInfo.role_id = roleId;
                                        updateEmployee(connection, employeeUpdateInfo);
                                        inquirer.prompt({
                                            type: 'confirm',
                                            name: 'updateManager',
                                            message: "Do you want to update their manager?",
                                            validate: (input) => validateRequired(input)
                                        }).then((answer) => {
                                            // if they want to update the manager, prompt them for the new manager.
                                            if (answer.updateManager) {
                                                updateEmployeeManager(connection, employeeUpdateInfo);
                                            }
                                        })
                                    });
                                }
                            );
                        });
                    }
                )
            });
        }
    )
}



module.exports = {updateRolePrompt, addRolePrompt, deleteRolePrompt}