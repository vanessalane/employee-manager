const cTable = require('console.table');
const inquirer = require('inquirer');
const employeePrompts = require('./employeePrompts');
const mainPrompt = require('../menu');
const utils = require('../utils');


addEmployee = (connection) => {
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
            if (!roleId) {
                showMenu(connection);
            } else {
                newEmployee.role_id = roleId;
    
                // prompt the user for the employee's manager
                const managerPrompt = "Who's the new employee's manager?";
                promptForEmployee(connection, managerPrompt, true).then((managerId) => {
                    newEmployee.manager_id = managerId
                }).then(() => {
                    insertNewEmployee(connection, newEmployee).then(() => {
                        showMenu(connection);
                    });
                });
            }
        });
    });
};

deleteEmployee = (connection) => {
    const prompt = "Which employee would you like to delete?"
    promptForEmployee(connection, prompt).then((employeeId) => {
        deleteById(connection, 'employee', employeeId);
    }).then(() => showMenu(connection));
};

updateManager = (connection) => {
    const employeePrompt = "Please choose the employee you'd like to update:";
    promptForEmployee(connection, employeePrompt).then((employeeId) => {
        let employeeInfo = { employee_id: employeeId };

        // prompt the user to choose a manager from the list of all employees
        const managerPrompt = "Please choose the employee's manager:";
        promptForEmployee(connection, managerPrompt, true).then((managerId) => {
            employeeInfo.manager_id = managerId;
        }).then(() => {
            updateEmployee(connection, employeeInfo).then(() => {
                showMenu(connection);
            });
        });
    });
}


viewAllEmployees = (connection) => {
    getAllEmployees(connection).then((res) => {
        const resToDisplay = formatEmployeesToDisplay(res);
        console.table(resToDisplay);
    }).then(() => showMenu(connection));
};


viewEmployeesByDepartment = (connection) => {
    promptForDepartment(connection).then((departmentId) => {

        // handle cases where there are no departments found
        if (!departmentId) {
            console.log('No departments available!');
            return false;
        }

        // surface employees based on the department id
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

            // surface employees based on the last name
            getEmployeesByKwarg(connection, kwargs).then((res) => {
                const resToDisplay = formatEmployeesToDisplay(res);
                console.table(resToDisplay);
            }).then(() => showMenu(connection));
        });
}


viewEmployeesByManager = (connection) => {
    promptForManager(connection).then((managerId) => {

        // surface employees based on the manager id
        const kwargs = { "employee.manager_id" : managerId };
        getEmployeesByKwarg(connection, kwargs).then((res) => {
            const resToDisplay = formatEmployeesToDisplay(res);
            console.table(resToDisplay);
        }).then(() => showMenu(connection));
    });
}


module.exports = {
    addEmployee,
    deleteEmployee,
    updateManager,
    viewAllEmployees,
    viewEmployeesByDepartment,
    viewEmployeesByLastName,
    viewEmployeesByManager
};