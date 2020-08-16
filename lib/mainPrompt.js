const inquirer = require('inquirer');

const employeePrompts = require('./employee/prompts');
const employee = require('./employee/index');
const departmentPrompts = require('./department/prompts');
const department = require('./department/index');
const rolePrompts = require('./role/prompts');
const role = require('./role/index');

showMenu = (connection) => {
    console.log('\n')
    return inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View All Departments',
            'View All Employees by Department',
            'View All Employees by Last Name',
            'View All Employees by Manager',
            'View All Roles',
            'Add an Employee',
            'Add a Role',
            'Delete a Department',
            'Delete an Employee',
            'Delete a Role',
            "Update an Employee's Manager",
            "Update an Employee's Role",
            'Exit'
        ]
    }).then(responses => {
        switch(responses.action) {
            case 'View All Departments':
                viewAllDepartments(connection);  // displays department budget based on roles table
                break;
            case 'View All Employees by Department':
                viewAllEmployees(connection, orderByArg='department');
                break;
            case 'View All Employees by Last Name':
                viewAllEmployees(connection);
                break;
            case 'View All Employees by Manager':
                viewAllEmployees(connection, orderByArg='manager');
                break;
            case 'View All Roles':
                viewAllRoles(connection);
                break;
            case 'Add an Employee':
                addEmployeePrompt(connection);
                break;
            case 'Add a Role':
                addRolePrompt(connection);
                break;
            case "Update an Employee's Manager":
                updateManagerPrompt(connection);
                break;
            case "Update an Employee's Role":
                updateRolePrompt(connection);
                break;
            case 'Delete a Department':
                deleteDepartmentPrompt(connection);
                break;
            case 'Delete an Employee':
                deleteEmployeePrompt(connection);
                break;
            case 'Delete a Role':
                deleteRolePrompt(connection);
                break;
            case 'Exit':
                console.log('Goodbye!');
                connection.end();
                break;
        };
    });
};

module.exports = showMenu;