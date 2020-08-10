const showMenu = require('./prompts');

viewAllRoles = (connection) => {
    connection.query(
        `SELECT
            role.id AS 'role_id',
            title,
            salary,
            department.name AS department
         FROM role
         LEFT JOIN department ON department.id = department_id`,
        function(err, res) {
            console.log("\nReading roles...\n");
            if (err) throw err;
            console.table(res);
            showMenu(connection);
        }
    );
};

addNewRole = (connection, newRole) => {
    connection.query(
        `INSERT INTO role SET ?`,
        newRole,  // should be an object with keys title, salary, and department_id
        function(err, res) {
            if (err) throw err;
            console.log(`\n${res.affectedRows}; Role updated!\n`);
            showMenu(connection);
        }
    );
};

module.exports = {addNewRole, viewAllRoles};