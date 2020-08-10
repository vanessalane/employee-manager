viewAllEmployees = (connection) => {
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
            console.log("Reading employees...");
            if (err) throw err;
            console.table(res);
        }
    );
};

module.exports = viewAllEmployees;