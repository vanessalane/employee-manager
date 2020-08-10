var mysql = require('mysql2');
const viewAllEmployees = require('./lib/employee');
const {addNewDepartment, viewAllDepartments} = require('./lib/department');
const {viewAllRoles, addNewRole} = require('./lib/role');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'employee_db'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Welcome to the Employee Manager!');
    // inquirer logic
    connection.end();
});
