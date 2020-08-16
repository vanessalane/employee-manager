const cTable = require('console.table');

deleteRole = (connection, roleId) => {
    connection.query(
        `DELETE FROM role WHERE id = ${roleId}`,
        function(err, res) {
            if (err) {
                console.log(`Couldn't delete the role. Error: ${err.sqlMessage}.`)
                connection.end();
                return false;
            }
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
            if (err && err.errno === 1062) {
                console.log("\nThat role already exists! Let's try again.")
                addNewRole(connection);
            } else if (err && err.errno == 1264) {
                console.log(`Couldn't insert the new role because one of your values was out of range: ${err.sqlMessage}. Let's try again.`);
                addNewRole(connection);
            } else if (err) {
                console.log(`Couldn't insert the new role. Error ${err.sqlMessage}`);
                connection.end();
                return false;
            } else {
                console.log(`\nAdded the new role!`);
                showMenu(connection);
            }
        }
    )
};

viewAllRoles = (connection) => {
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

            const resToDisplay = res.map((row) => {
                const formattedSalary = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(row.salary);
                return {
                    Department: row.department,
                    Role: row.title,
                    Salary: formattedSalary
                }
            });
            console.table(resToDisplay);
            showMenu(connection);
        }
    );
};

module.exports = {insertNewRole, viewAllRoles};