const cTable = require('console.table');

deleteDepartment = (connection, roleId) => {

    // query the DB to delete the department
    connection.query(
        `DELETE FROM department WHERE id = ${roleId}`,
        function(err, res) {
            if (err) {
                console.log(`Couldn't delete the department. Error: ${err.sqlMessage}.`)
                connection.end();
                return false;
            }

            // let the user know if it worked and send them back to the main menu
            console.log(`\nDepartment deleted!`);
            showMenu(connection);
        }
    );
};

viewAllDepartments = (connection) => {

    // query the DB to get the department and budget info
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

                // formaat the results
                const displayRes = res.map((row) => { 
                    const formattedBudget = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(row.budget);
                    return {
                        Department: row.department,
                        Budget: formattedBudget
                    } })

                // display them to the user
                console.table(displayRes);
            }

            // send them back to the main menu
            showMenu(connection);
        }
    );
};

module.exports = {deleteDepartment, viewAllDepartments};