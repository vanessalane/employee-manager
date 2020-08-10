viewAllEmployees = (connection) => {
    connection.query(
        `SELECT 
            employee.first_name,
            employee.last_name,
            department.name as 'department',
            role.title,
            role.salary,
            CONCAT(manager.first_name, ' ', manager.last_name) AS 'manager'
         FROM employee
         LEFT JOIN role
            INNER JOIN department
                ON department.id = department_id
            ON role.id = role_id
         LEFT JOIN employee manager
            ON manager.id = employee.manager_id`,
        function(err, res) {
            console.log("Reading employees...");
            if (err) throw err;
            console.table(res);
        }
    );
};

addNewEmployee = (connection, newEmployee) => {
    connection.query(
        `INSERT INTO employee SET ?`,
        newEmployee,  // object with keys first_name, last_name, role_id, manager_id
        function(err, res) {
            if (err) throw err;
            console.log(`${res.affectedRows}; Employee added!\n`);
            viewAllEmployees(connection);
        }
    );
};

updateEmployeeRole = (connection, employeeId, roleId) => {
    connection.query(
        `UPDATE employee SET ? WHERE ?`,
        [{role_id: roleId}, {id: employeeId}],
        function(err, res) {
            if (err) throw err;
            console.log(`${res.affectedRows}; Employee role updated!\n`);
            viewAllEmployees(connection);
        }
    );
};

module.exports = {addNewEmployee, updateEmployeeRole, viewAllEmployees};