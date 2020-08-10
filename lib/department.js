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

module.exports = viewAllDepartments;