var mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'employee_db'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Welcome to the Employee Manager');
    // add logic for inquirer
});

viewAllDepartments = () => {
    console.log("Reading departments...");
    connection.query(
        `SELECT
            name AS 'department'
        FROM department`,
        function(err, res) {
            if (err) throw err;
            console.table(res);
            connection.end();
        }
    );
};

viewAllEmployees = () => {
    console.log("Reading employees...");
    connection.query(
        `SELECT 
            employee.first_name,
            employee.last_name,
            role.title,
            role.salary,
            CONCAT(manager.first_name, ' ', manager.last_name) AS 'manager'
         FROM employee
         LEFT JOIN role ON role.id = role_id
         LEFT JOIN employee manager ON manager.id = employee.manager_id`,
        function(err, res) {
            if (err) throw err;
            console.table(res);
            connection.end();
        }
    );
};

viewAllRoles = () => {
    console.log("Reading roles...");
    connection.query(
        `SELECT 
           title,
           salary,
           department.name AS department
         FROM role
         LEFT JOIN department ON department.id = department_id`,
        function(err, res) {
            if (err) throw err;
            console.table(res);
            connection.end();
        }
    );
};