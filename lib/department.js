const prompt = require('./prompt');

viewAllDepartments = (connection) => {
    connection.query(
        `SELECT
            id AS 'department_id',
            name AS 'department'
        FROM department`,
        function(err, res) {
            if (err) {
                console.log(`Sorry, I couldn't load the roles. Error: ${err.sqlMessage}.`)
            } else {
                console.table(res);
            }
            showMenu(connection);
        }
    );
};

module.exports = viewAllDepartments;