const inquirer = require('inquirer');
const employee = require('./employee');
const department = require('./department');
const role = require('./role');

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
            "Update an Employee's Manager",
            "Update an Employee's Role",
            'Exit'
        ]
    }).then(responses => {
        switch(responses.action) {
            case 'View All Departments':
                viewAllDepartments(connection);
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
                addNewEmployee(connection);
                break;
            case 'Add a Role':
                addNewRole(connection);
                break;
            case "Update an Employee's Manager":
                updateEmployeeManager(connection);
                break;
            case "Update an Employee's Role":
                updateEmployeeRole(connection);
                break;
            case 'Exit':
                console.log('Goodbye!');
                connection.end();
                break;
        };
    });
};

module.exports = showMenu;