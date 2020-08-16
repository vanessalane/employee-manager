const cTable = require('console.table');
const mainPrompt = require('../mainPrompt');


deleteEmployee = (connection, employeeId) => {
    connection.query(
        `DELETE FROM employee WHERE id = ${employeeId}`,
        function(err, res) {
            if (err) {
                console.log(`Couldn't delete the employee. Error: ${err.sqlMessage}.`)
                connection.end();
                return false;
            }
            console.log(`\nEmployee deleted!`);
            showMenu(connection);
        }
    );
};

insertNewEmployee = (connection, newEmployee) => {
    
    // clean the data before adding it in
    newEmployee.first_name = toTitleCase(newEmployee.first_name);
    newEmployee.last_name = toTitleCase(newEmployee.last_name);

    // now add it
    connection.query(
        `INSERT INTO employee SET ?`,
        newEmployee,  // object with keys first_name, last_name, role_id, manager_id
        function(err, res) {

            // catch errors that are likely due to user input
            if (err && err.errno === 1062) {
                console.log("\nThat employee already exists! Let's try again.\n")
                showMenu(connection);
            } // catch errors that are not related to user input
            else if (err) {
                console.log(`Couldn't load the employees. Error: ${err.sqlMessage}.`)
                connection.end();
                return false;
            } // or send them back to the main menu
            else {
                console.log(`\nEmployee added!`);
                showMenu(connection);
            }
        }
    )
};

updateEmployee = (connection, employeeInfo) => {

    // define the arguments for the SQL query
    let whereArgs = {id: employeeInfo.employee_id};
    let setArgs = {};
    if (employeeInfo.manager_id) {
        setArgs.manager_id = employeeInfo.manager_id;
    }
    if (employeeInfo.role_id) {
        setArgs.role_id = employeeInfo.role_id;
    }

    // query to update the employee table
    connection.query(
        `UPDATE employee SET ? WHERE ?`,
        [setArgs, whereArgs],
        function(err, res) {
            if (err) {
                console.log(`Couldn't update the employee. Error: ${err.sqlMessage}.`)
                connection.end();
                return false;
            }

            // send them back to the main menu
            console.log(`\nEmployee updated!`);
            showMenu(connection);
        }
    )
}


module.exports = {deleteEmployee, updateEmployee};