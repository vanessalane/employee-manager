const utils = require('../utils');

getAllEmployees = (connection) => {
    return new Promise(function(resolve, reject) {
        connection.query(
            `SELECT
                employee.id AS 'employee_id',
                CONCAT(employee.first_name, ' ', employee.last_name) AS 'employee',
                department.name as 'department',
                role.title as 'role',
                CONCAT('$ ', FORMAT(role.salary, 0)) as 'salary',
                CONCAT(manager.first_name, ' ', manager.last_name) AS 'manager'
            FROM employee
            LEFT JOIN role ON role.id = role_id
            LEFT JOIN department ON department.id = role.department_id
            LEFT JOIN employee manager ON manager.id = employee.manager_id
            ORDER BY employee.last_name`,
            function(err, res) {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            }
        );
    });
};


getAllManagers = (connection) => {
    return new Promise(function(resolve, reject) {
        connection.query(
            `SELECT
                CONCAT(manager.first_name, ' ', manager.last_name, ' - ', role.title) AS 'manager',
                manager.id as 'manager_id'
            FROM employee
            INNER JOIN employee manager ON manager.id = employee.manager_id
            INNER JOIN role ON role.id = manager.role_id
            GROUP BY manager_id
            ORDER BY manager.last_name`,
            function(err, res) {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            }
        );
    });
};


getEmployeesByKwarg = (connection, kwargs) => {
    return new Promise(function(resolve, reject) {
        connection.query(
            `SELECT
                employee.id AS 'employee_id',
                employee.last_name as 'last_name',
                CONCAT(employee.first_name, ' ', employee.last_name) AS 'employee',
                department.id as 'department_id',
                department.name as 'department',
                role.title as 'role',
                CONCAT('$ ', FORMAT(role.salary, 0)) as 'salary',
                CONCAT(manager.first_name, ' ', manager.last_name) AS 'manager'
            FROM employee
            INNER JOIN role ON role.id = employee.role_id
            INNER JOIN department ON department.id = role.department_id
            LEFT JOIN employee manager ON manager.id = employee.manager_id
            WHERE ?
            ORDER BY employee.last_name`,
            [kwargs],
            function(err, res) {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            }
        );
    });
}


insertNewEmployee = (connection, newEmployee) => {
    return new Promise(
        function(resolve, reject) {
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
                        resolve(res);
                    } // catch errors that are not related to user input
                    else if (err) {
                        console.log(`Couldn't load the employees. Error: ${err.sqlMessage}.`)
                        return reject(err);
                    } // or send them back to the main menu
                    else {
                        console.log(`\nEmployee added!`);
                        resolve(res);
                    }
                }
            );
        }
    );
};


updateEmployee = (connection, employeeInfo) => {
    return new Promise(
        function(resolve, reject) {

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
                        return reject (err);
                    }

                    // send them back to the main menu
                    console.log(`\nEmployee updated!`);
                    resolve(res);
                }
            )
        }
    );
}