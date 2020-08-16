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

viewAllEmployees = (connection, orderByArg='employee.last_name') => {

    // define how the results should be sorted
    if (orderByArg === 'manager') {
        orderByArg = 'manager.last_name';
    }
    console.log(orderByArg);

    // define the query to get employees' info
    const sql = `SELECT 
                    employee.id AS 'employee_id',
                    CONCAT(employee.first_name, ' ', employee.last_name) AS 'employee',
                    department.name as 'department',
                    role.title,
                    role.salary,
                    CONCAT(manager.first_name, ' ', manager.last_name) AS 'manager'
                FROM employee
                LEFT JOIN role ON role.id = role_id
                LEFT JOIN department ON department.id = role.department_id
                LEFT JOIN employee manager ON manager.id = employee.manager_id
                ORDER BY ${orderByArg}`;

    // query the DB
    connection.query(sql, function(err, res) {
            if (err) {
                console.log(`Couldn't load the employees. Error: ${err.sqlMessage}.`)
                connection.end();
                return false;
            } else {

                // format the results
                const resToDisplay = res.map((row) => {
                    const formattedSalary = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(row.salary);
                    return {
                        Name: row.employee,
                        Department: row.department,
                        Role: row.title,
                        Salary: formattedSalary,
                        Manager: row.manager
                    }
                });

                // surface the results
                console.table(resToDisplay);
            }
            
            // send the user back to the main menu
            showMenu(connection);
        }
    );
};

module.exports = {deleteEmployee, updateEmployee, viewAllEmployees};