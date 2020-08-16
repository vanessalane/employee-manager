const cTable = require('console.table');

insertNewRole = (connection, newRole) => {
    newRole.title = toTitleCase(newRole.title);
    connection.query(
        `INSERT INTO role SET ?`,
        newRole,  // should be an object with keys title, salary, and department_id
        function(err, res) {
            if (!err) {
                console.log(`\nAdded the new role!`);
                showMenu(connection);
                return true;
            }

            // if the error is likely related to the user's input, send them back to the main menu.
            if (err && err.errno === 1062) {
                console.log("\nThat role already exists! Let's try again.")
                showMenu(connection);
            }  // otherwise, end the connection becuase it's probably a bigger problem.
            else {
                console.log(`Couldn't insert the new role. Error ${err.sqlMessage}`);
                connection.end();
            }
            return false;
        }
    )
};


module.exports = {insertNewRole};