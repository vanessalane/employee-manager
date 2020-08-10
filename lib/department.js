viewAllDepartments = (connection) => {
    connection.query(
        `SELECT
            name AS 'department'
        FROM department`,
        function(err, res) {
            console.log("Reading departments...");
            if (err) throw err;
            console.table(res);
        }
    );
};

addNewDepartment = (connection, newDepartmentName) => {
    connection.query(
        `INSERT INTO department SET ?`,
        {name: newDepartmentName},
        function(err, res) {
            if (err) throw err;
            console.log(`${res.affectedRows}; Department added!`);
            viewAllDepartments(connection);
        }
    );
};

module.exports = {addNewDepartment, viewAllDepartments};