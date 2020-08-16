const prompt = require('./prompt');
const role = require('./role');

viewAllDepartments = (connection) => {
    connection.query(
        `SELECT
            name as 'department',
            (SELECT
                SUM(role.salary)
            FROM
                role
            WHERE
                role.department_id = department.id) as 'budget'
        FROM department
        LEFT JOIN role ON department_id = role.department_id
        GROUP BY department`,
        function(err, res) {
            if (err) {
                console.log(`Couldn't load the roles. Error: ${err.sqlMessage}.`)
            } else {
                const displayRes = res.map((row) => { 
                    const formattedBudget = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(row.budget);
                    return {
                        Department: row.department,
                        Budget: formattedBudget
                    } })
                console.table(displayRes);
            }
            showMenu(connection);
        }
    );
};

    

module.exports = viewAllDepartments;