const cTable = require('console.table');

deleteRole = (connection, roleId) => {

    // delete the role that has the provided ID
    connection.query(
        `DELETE FROM role WHERE id = ${roleId}`,
        function(err, res) {
            if (err) {
                console.log(`Couldn't delete the role. Error: ${err.sqlMessage}.`)
                connection.end();
                return false;
            }

            // send the user back to the main menu
            console.log(`\nRole deleted!`);
            showMenu(connection);
        }
    );
};

insertNewRole = (connection, newRole) => {
    
    // clean the data before adding it in
    newRole.title = toTitleCase(newRole.title);

    // now add it
    connection.query(
        `INSERT INTO role SET ?`,
        newRole,  // should be an object with keys title, salary, and department_id
        function(err, res) {

            // if the error is likely related to the user's input, send them back to the main menu.
            if (err && err.errno === 1062) {
                console.log("\nThat role already exists! Let's try again.")
                showMenu(connection);
            } else if (err && err.errno == 1264) {
                console.log(`Couldn't insert the new role because one of your values was out of range: ${err.sqlMessage}. Let's try again.`);
                showMenu(connection);
            }  // if the error isn't caught above, it's probably an error in the code or something weird. end the connection and let the user know.
            else if (err) {
                console.log(`Couldn't insert the new role. Error ${err.sqlMessage}`);
                connection.end();
                return false;
            }  // once you're done, send the user back to the main menu
            else {
                console.log(`\nAdded the new role!`);
                showMenu(connection);
            }
        }
    )
};

viewAllRoles = (connection) => {

    // query for all of the roles in the roles table
    connection.query(
        `SELECT
            role.id AS 'role_id',
            department.name AS department,
            title,
            salary
         FROM role
         LEFT JOIN department ON department.id = department_id
         ORDER BY department, title`,
        function(err, res) {
            if (err) {
                console.log(`Couldn't load the roles. Error: ${err.sqlMessage}.`)
                connection.end();
                return false;
            }

            // surface the results to the user
            const resToDisplay = res.map((row) => {
                const formattedSalary = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(row.salary);
                return {
                    Department: row.department,
                    Role: row.title,
                    Salary: formattedSalary
                }
            });
            console.table(resToDisplay);

            // send them back to the main menu
            showMenu(connection);
        }
    );
};

module.exports = {insertNewRole, viewAllRoles};