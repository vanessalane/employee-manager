const inquirer = require('inquirer');

const department = require('./department');
const employee = require('./employee');
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
                viewAllDepartments(connection);
                // viewAllDepartments(connection);
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
                addEmployee(connection);
                break;
            case 'Add a Role':
                addRole(connection);
                break;
            case "Update an Employee's Manager":
                updateManagerPrompt(connection);
                break;
            case "Update an Employee's Role":
                updateRole(connection);
                break;
            case 'Delete a Department':
                deleteDepartment(connection);
                break;
            case 'Delete an Employee':
                deleteEmployee(connection);
                break;
            case 'Delete a Role':
                deleteRole(connection);
                break;
            case 'Exit':
                console.log('Goodbye!');
                connection.end();
                break;
        };
    });
};

module.exports = showMenu;