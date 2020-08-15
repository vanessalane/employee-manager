const inquirer = require('inquirer');
const prompt = require('./prompt');
const validation = require('../utils/validation');

viewAllEmployees = (connection) => {
    connection.query(
        `SELECT 
            employee.id AS 'employee_id',
            CONCAT(employee.first_name, ' ', employee.last_name) AS 'employee',
            role.title,
            role.salary,
            CONCAT(manager.first_name, ' ', manager.last_name) AS 'manager'
         FROM employee
         LEFT JOIN role ON role.id = role_id
         LEFT JOIN employee manager ON manager.id = employee.manager_id`,
        function(err, res) {
            if (err) {
                console.log(`Sorry, I couldn't load the employees. Error: ${err.sqlMessage}.`)
            } else {
                console.table(res);
            }
            showMenu(connection);
        }
    );
};

insertNewEmployee = (connection, newEmployee) => {
    connection.query(
        `INSERT INTO employee SET ?`,
        newEmployee,  // object with keys first_name, last_name, role_id, manager_id
        function(err, res) {
            if (err) throw err;
            console.log(`\nEmployee added!\n`);
            showMenu(connection);
        }
    )
};

updateEmployeeRole = (connection, newEmployee) => {
    connection.query(
        `UPDATE employee SET ? WHERE ?`,
        [{ role_id: newEmployee.role_id }, {id: newEmployee.id}],  // object with keys first_name, last_name, role_id, manager_id
        function(err, res) {
            if (err) throw err;
            console.log(`\nEmployee added!\n`);
            showMenu(connection);
        }
    )
}

addNewEmployee = (connection) => {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'First Name:',
            validate: (firstNameInput) => validateRequired(firstNameInput)
        },{
            type: 'input',
            name: 'last_name',
            message: 'Last Name:',
            validate: (lastNameInput) => validateRequired(lastNameInput)
        }
    ]).then((newEmployee) => {

        // get the options for the departments
        connection.query(
            `SELECT
                id AS 'department_id',
                name AS 'department'
            FROM department`,
            function(err, res) {
                if (err) throw err;

                // surface the options to the user
                const departmentChoices = res.map((res) => res.department)
                inquirer.prompt({
                    type: 'list',
                    name: 'department',
                    message: 'Department:',
                    choices: departmentChoices,
                    validate: (input) => validateRequiredResponse(input)
                }).then((answer) => {

                    // get the id for the provided department to help us surface the roles available
                    const departmentArray = res.filter((queryRow) => queryRow.department === answer.department);
                    const departmentId = departmentArray[0].department_id;

                    // get the options for the roles
                    connection.query(
                        `SELECT
                            id,
                            title
                        FROM role
                        WHERE ?`, 
                        { department_id: departmentId },
                        function(err, res) {
                            if (err) {
                                console.log(`Couldn't load the roles because ${err.sqlMessage}. Sorry!`)
                                showMenu(connection);
                                return;
                            }

                            // surface the options to the user
                            const roleChoices = res.map((res) => res.title)
                            inquirer.prompt({
                                type: 'list',
                                name: 'title',
                                message: 'Role:',
                                choices: roleChoices,
                                validate: (input) => validateRequired(input)
                            }).then((answer) => {

                                // get the id for the provided role.
                                const roleId = res.filter((queryRow) => queryRow.title === answer.title);
                                newEmployee.role_id = roleId[0].id;

                                // ADD LOGIC TO DEFINE THE MANAGER

                                insertNewEmployee(connection, newEmployee);
                            });
                        }
                    );
                });
            }
        )
    });
};

updateEmployeeRolePrompt = (connection) => {

    // get the options for employees
    connection.query(
        `SELECT 
            employee.id AS 'employee_id',
            CONCAT(employee.first_name, ' ', employee.last_name) AS 'employee',
            role.title as 'role'
        FROM employee
        LEFT JOIN role ON role.id = role_id`,
        function(err, res) {
            if (err) {
                console.log(`Couldn't load the employees because ${err.sqlMessage}. Sorry!`)
                showMenu(connection);
            } else {

                // surface the options to the user
                const employeeChoices = res.map((res) => `${res.employee} - ${res.role}`)
                inquirer.prompt({
                    type: 'list',
                    name: 'employee',
                    message: "Please choose the employee you'd like to update:",
                    choices: employeeChoices,
                    validate: (input) => validateRequired(input)
                }).then((employeeUpdateInfo) => {

                    // get the id for the selected employee
                    const employeeChoiceIndex = employeeChoices.indexOf(employeeUpdateInfo.employee);
                    const employee_id = res[employeeChoiceIndex].employee_id;
                    employeeUpdateInfo.id = employee_id;

                    // get the options for the departments
                    connection.query(
                        `SELECT
                            id AS 'department_id',
                            name AS 'department'
                        FROM department`,
                        function(err, res) {
                            if (err) throw err;

                            // surface the options to the user
                            const departmentChoices = res.map((res) => res.department)
                            inquirer.prompt({
                                type: 'list',
                                name: 'department',
                                message: 'Department:',
                                choices: departmentChoices,
                                validate: (input) => validateRequiredResponse(input)
                            }).then((answer) => {

                                // get the id for the provided department to help us surface the roles available
                                const departmentArray = res.filter((queryRow) => queryRow.department === answer.department);
                                const departmentId = departmentArray[0].department_id;

                                // get the options for the roles
                                connection.query(
                                    `SELECT
                                        id,
                                        title
                                    FROM role
                                    WHERE ?`, 
                                    { department_id: departmentId },
                                    function(err, res) {
                                        if (err) {
                                            console.log(`Couldn't load the roles because ${err.sqlMessage}. Sorry!`)
                                            showMenu(connection);
                                            return;
                                        }

                                        // surface the options to the user
                                        const roleChoices = res.map((res) => res.title)
                                        inquirer.prompt({
                                            type: 'list',
                                            name: 'title',
                                            message: 'Role:',
                                            choices: roleChoices,
                                            validate: (input) => validateRequired(input)
                                        }).then((answer) => {

                                            // get the id for the provided role. Schema prevents duplicate roles within the same department.
                                            const roleId = res.filter((queryRow) => queryRow.title === answer.title);
                                            employeeUpdateInfo.role_id = roleId[0].id;

                                            updateEmployeeRole(connection, employeeUpdateInfo);
                                        });
                                    }
                                );
                            });
                        }
                    )
                });
            }
        }
    )
}

module.exports = {addNewEmployee, updateEmployeeRolePrompt, viewAllEmployees};