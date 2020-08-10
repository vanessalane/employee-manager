const showMenu = require('./prompts');

viewAllDepartments = (connection) => {
    connection.query(
        `SELECT
            id AS 'department_id',
            name AS 'department'
        FROM department`,
        function(err, res) {
            console.log("\nReading departments...\n");
            if (err) throw err;
            console.table(res);
            showMenu(connection);
        }
    );
};

addNewDepartment = (connection, newDepartmentName) => {
    connection.query(
        `INSERT INTO department SET ?`,
        {name: newDepartmentName},
        function(err, res) {
            if (err) throw err;
            console.log(`\n${res.affectedRows}; Department added!\n`);
            showMenu(connection);
        }
    );
};

module.exports = {addNewDepartment, viewAllDepartments};