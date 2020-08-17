const inquirer = require('inquirer');
// const department = require('./department');
const employeeOptions = require('./employee/employeeOptions');
const roleOptions = require('./role/roleOptions');
const departmentOptions = require('./department/departmentOptions');

showMenu = (connection) => {
    console.log('\n')
    return inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View All Departments',
            'View All Employees',
            'View All Employees by Department',
            'View All Employees by Last Name',
            'View All Employees by Manager',
            'View All Roles',
            'Add a Department',
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
                break;
            case 'View All Employees':
                viewAllEmployees(connection);
                break;
            case 'View All Employees by Department':
                viewEmployeesByDepartment(connection);
                break;
            case 'View All Employees by Last Name':
                viewEmployeesByLastName(connection);
                break;
            case 'View All Employees by Manager':
                viewEmployeesByManager(connection);
                break;
            case 'View All Roles':
                viewAllRoles(connection);
                break;
            case 'Add a Department':
                addDepartment(connection);
                break;
            case 'Add an Employee':
                addEmployee(connection);
                break;
            case 'Add a Role':
                addRole(connection);
                break;
            case "Update an Employee's Manager":
                updateManager(connection);
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