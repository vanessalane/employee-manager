const prompt = require('./prompt');

viewAllDepartments = (connection) => {
    connection.query(
        `SELECT
            id AS 'department_id',
            name AS 'department'
        FROM department`,
        function(err, res) {
            if (err) {
                console.log(`Couldn't load the roles. Error: ${err.sqlMessage}.`)
            } else {
                const displayRes = res.map((row) => { return {Department: row.department} })
                console.table(displayRes);
            }
            showMenu(connection);
        }
    );
};

module.exports = viewAllDepartments;