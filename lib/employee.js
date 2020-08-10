const showMenu = require('./prompts');

viewAllEmployees = (connection) => {
    connection.query(
        `SELECT 
            employee.id AS 'employee_id',
            employee.first_name,
            employee.last_name,
            role.title,
            role.salary,
            CONCAT(manager.first_name, ' ', manager.last_name) AS 'manager'
         FROM employee
         LEFT JOIN role ON role.id = role_id
         LEFT JOIN employee manager ON manager.id = employee.manager_id`,
        function(err, res) {
            console.log("\nReading employees...\n");
            if (err) throw err;
            console.table(res);
            showMenu(connection);
        }
    );
};

addNewEmployee = (connection, newEmployee) => {
    connection.query(
        `INSERT INTO employee SET ?`,
        newEmployee,  // object with keys first_name, last_name, role_id, manager_id
        function(err, res) {
            if (err) throw err;
            console.log(`\n${res.affectedRows}; Employee added!\n`);
            viewAllEmployees(connection);
            showMenu(connection);
        }
    );
};

updateEmployeeRole = (connection, employeeId, roleId) => {
    connection.query(
        `UPDATE employee SET ? WHERE ?`,
        [{role_id: roleId}, {id: employeeId}],
        function(err, res) {
            if (err) throw err;
            console.log(`\n${res.affectedRows}; Employee role updated!\n`);
            viewAllEmployees(connection);
            showMenu(connection);
        }
    );
};

module.exports = {addNewEmployee, updateEmployeeRole, viewAllEmployees};