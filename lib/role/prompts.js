const inquirer = require('inquirer');
const role = require('./index');
const utils = require('../../utils/db');
const department = require('../department');

addRolePrompt = (connection) => {
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
    }])
    .then((newRole) => {
        // next prompt them for the department
        const prompt = "In which department should this role be created?";
        promptForDepartment(connection, prompt)
        .then((departmentId) => {
            newRole.department_id = departmentId;
            insertNewRole(connection, newRole);
        });
    });
};

deleteRolePrompt = (connection) => {

    // get the options for the departments
    const deptPrompt = "In which department is the role you'd like to delete?";
    promptForDepartment(connection, deptPrompt)
        .then((departmentId) => {
            // query the DB for roles (within the specified department) that can be deleted
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

                        // get the id for the provided role
                        const roleChoice = answer.role;
                        const roleChoiceIndex = roleChoices.indexOf(roleChoice);
                        const roleId = roleRes[roleChoiceIndex].role_id;

                        // delete the role
                        deleteRole(connection, roleId);
                    });
                }
            );
        });
}

updateRolePrompt = (connection) => {

    // query the employee and role tables for info about the roles
    connection.query(
        `SELECT 
            employee.id AS 'employee_id',
            CONCAT(employee.first_name, ' ', employee.last_name, ' - ', role.title) AS 'employee'
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
            const employeeChoices = employeeRes.map((row) => row.employee)
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

                                        // update the employee's role
                                        updateEmployee(connection, employeeUpdateInfo);

                                        // since a change in role can result in a change in management, it's worth checking whether the user
                                        // wants to change the employee's role at this time.
                                        inquirer.prompt({
                                            type: 'confirm',
                                            name: 'updateManager',
                                            message: "Do you want to update their manager?",
                                            validate: (input) => validateRequired(input)
                                        }).then((answer) => {

                                            // if they want to update the manager, prompt them for the new manager.
                                            if (answer.updateManager) {
                                                updateEmployeeManager(connection, employeeUpdateInfo);
                                            }  // if not, send them back to the main menu.
                                            else {
                                                showMenu(connection);
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