const inquirer = require('inquirer');
const employee = require('./employee');
const department = require('./department');
const role = require('./role');

showMenu = (connection) => {
    return inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View All Departments',
            'View All Employees',
            'View All Roles',
            'Add an Employee',
            'Add a Role',
            'Update an Employee Role',
            'Exit'
        ]
    }).then(responses => {
        switch(responses.action) {
            case 'View All Departments':
                viewAllDepartments(connection);  // done
                break;
            case 'View All Employees':
                viewAllEmployees(connection);  // done
                break;
            case 'View All Roles':
                viewAllRoles(connection);  // done
                break;
            case 'Add an Employee':
                addNewEmployee(connection);  // add manager selection
                break;
            case 'Add a Role':
                addNewRole(connection);  // done
                break;
            case 'Update an Employee Role':
                updateEmployeeRolePrompt(connection);
                break;
            case 'Exit':
                console.log('Goodbye!');
                connection.end();
                break;
        };
    });
};

module.exports = showMenu;