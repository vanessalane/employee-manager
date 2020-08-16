const inquirer = require('inquirer');
const prompt = require('./prompt');
const utils = require('./utils');

viewAllEmployees = (connection, orderByArg='employee.last_name') => {
    if (orderByArg === 'manager') {
        orderByArg = 'manager.last_name';
    }
    console.log(orderByArg);

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

    connection.query(sql, function(err, res) {
            if (err) {
                console.log(`Couldn't load the employees. Error: ${err.sqlMessage}.`)
                connection.end();
                return false;
            } else {
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
                console.table(resToDisplay);
            }
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
            if (err && err.errno === 1062) {
                console.log("\nThat employee already exists! Let's try again.\n")
                addNewEmployee(connection);
            } else if (err) {
                console.log(`Couldn't load the employees. Error: ${err.sqlMessage}.`)
            } else {
                console.log(`\nEmployee added!`);
                showMenu(connection);
            }
        }
    )
};

updateEmployeeRole = (connection, newEmployee) => {

    // define the args to be passed into the query
    let queryArgs = [
        {role_id: newEmployee.role_id},
        {id: newEmployee.employee_id}
    ];
    if (newEmployee.manager_id) {
        queryArgs[0].manager_id = newEmployee.manager_id;
    }

    // query
    connection.query(
        `UPDATE employee SET ? WHERE ?`,
        queryArgs,  // object with keys first_name, last_name, role_id, manager_id
        function(err, res) {
            if (err) {
                console.log(`Couldn't load the employees. Error: ${err.sqlMessage}.`)
                connection.end();
                return false;
            }

            console.log(`\nEmployee updated!`);
            showMenu(connection);
        }
    )
}

addNewEmployee = (connection) => {
    console.log("\nOK, let's add an employee.\n")
    return inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: "What's the new employee's first name?",
            validate: (firstNameInput) => validateRequired(firstNameInput)
        },{
            type: 'input',
            name: 'last_name',
            message: "What's the new employee's last name?",
            validate: (lastNameInput) => validateRequired(lastNameInput)
        }
    ]).then((newEmployee) => {
        
        // get the options for the departments
        connection.query(
            `SELECT
                id AS 'department_id',
                name AS 'department'
            FROM department
            ORDER BY department`,
            function(deptErr, deptRes) {
                if (deptErr) {
                    console.log(`Couldn't load the departments. Error: ${deptErr.sqlMessage}.`)
                    connection.end();
                    return false;
                }

                // surface the options to the user
                const departmentChoices = deptRes.map((row) => toTitleCase(row.department));
                inquirer.prompt({
                    type: 'list',
                    name: 'department',
                    message: "What's the new employee's department?",
                    choices: departmentChoices,
                    validate: (input) => validateRequiredResponse(input)
                }).then((answer) => {

                    // get the id for the provided department to help us surface the roles available
                    const departmentChoice = answer.department;
                    const departmentChoiceIndex = departmentChoices.indexOf(departmentChoice);
                    const departmentId = deptRes[departmentChoiceIndex].department_id;

                    // get the options for the roles
                    connection.query(
                        `SELECT
                            id as role_id,
                            title
                        FROM role
                        WHERE ?`, 
                        { department_id: departmentId },
                        function(roleErr, roleRes) {
                            if (roleErr) {
                                console.log(`Couldn't load the roles. Error: ${roleErr.sqlMessage}.`)
                                connection.end();
                                return false;
                            }

                            // surface the options to the user
                            const roleChoices = roleRes.map((row) => row.title)
                            inquirer.prompt({
                                type: 'list',
                                name: 'title',
                                message: "What's the new employee's role?",
                                choices: roleChoices,
                                validate: (input) => validateRequired(input)
                            }).then((answer) => {

                                // get the id for the provided role.
                                const roleChoice = answer.title;
                                const roleChoiceIndex = roleChoices.indexOf(roleChoice);
                                const roleId = roleRes[roleChoiceIndex].role_id;
                                newEmployee.role_id = roleId;

                                // prompt for a manager
                                connection.query(
                                    `SELECT
                                        employee.id as 'manager_id',
                                        role.title,
                                        CONCAT(employee.first_name, ' ', employee.last_name) AS 'manager_name'
                                    FROM employee
                                    LEFT JOIN role ON role.id = employee.role_id
                                    ORDER BY employee.last_name`,
                                    function(managerErr, managerRes) {
                                        if (managerErr) {
                                            console.log(`Couldn't load the employees. Error: ${managerErr.sqlMessage}.`)
                                            connection.end();
                                            return false;
                                        }

                                        // surface the options to the user
                                        const managerChoices = managerRes.map((row) => `${row.manager_name} - ${row.title}`);
                                        inquirer.prompt({
                                            type: 'list',
                                            name: 'manager',
                                            message: "Who's the new employee's manager?",
                                            choices: managerChoices,
                                            validate: (input) => validateRequiredResponse(input)
                                        }).then((answer) => {

                                            // get the id for the selected manager if one was chosen
                                            if (answer.manager != 'None') {
                                                const managerChoice = answer.manager
                                                const managerChoiceIndex = managerChoices.indexOf(managerChoice);
                                                const manager_id = managerRes[managerChoiceIndex].manager_id;
                                                newEmployee.manager_id = manager_id;
                                            }
                                            insertNewEmployee(connection, newEmployee)
                                        });
                                    }
                                );
                            });
                        }
                    );
                });
            }
        )
    });
};

updateEmployeeRolePrompt = (connection) => {
    console.log("\nOK, let's update an employee's role.\n")

    // get the options for employees
    connection.query(
        `SELECT 
            employee.id AS 'employee_id',
            CONCAT(employee.first_name, ' ', employee.last_name) AS 'employee',
            role.title as 'role'
        FROM employee
        LEFT JOIN role ON role.id = role_id
        ORDER BY employee.last_name`,
        function(employeeErr, employeeRes) {
            if (employeeErr) {
                console.log(`Couldn't load the employees. Error: ${employeeErr.sqlMessage}.`)
                connection.end();
                return false;
            }

            // surface the options to the user
            const employeeChoices = employeeRes.map((row) => `${row.employee} - ${row.role}`)
            inquirer.prompt({
                type: 'list',
                name: 'employee',
                message: "Please choose the employee you'd like to update:",
                choices: employeeChoices,
                validate: (input) => validateRequired(input)
            }).then((employeeUpdateInfo) => {
                
                // store the employee ID
                const employeeChoice = employeeUpdateInfo.employee;
                const employeeChoiceIndex = employeeChoices.indexOf(employeeChoice);
                const employeeId = employeeRes[employeeChoiceIndex].employee_id;
                employeeUpdateInfo.employee_id = employeeId;

                // get the options for the departments
                connection.query(
                    `SELECT
                        id AS 'department_id',
                        name AS 'department'
                    FROM department
                    ORDER BY name`,
                    function(deptErr, deptRes) {
                        if (deptErr) {
                            console.log(`Couldn't load the departments. Error: ${deptErr.sqlMessage}.`)
                            connection.end();
                            return false;
                        }

                        // surface the options to the user
                        const departmentChoices = deptRes.map((row) => row.department)
                        inquirer.prompt({
                            type: 'list',
                            name: 'department',
                            message: "What's the employee's new department?",
                            choices: departmentChoices,
                            validate: (input) => validateRequiredResponse(input)
                        }).then((answer) => {

                            // get the id for the provided department to help us surface the roles available
                            const departmentChoice = answer.department;
                            const departmentChoiceIndex = departmentChoices.indexOf(departmentChoice);
                            const departmentId = deptRes[departmentChoiceIndex].department_id;

                            // get the options for the roles
                            connection.query(
                                `SELECT
                                    id as role_id,
                                    title
                                FROM role
                                WHERE ?
                                ORDER BY title`, 
                                { department_id: departmentId },
                                function(roleErr, roleRes) {
                                    if (roleErr) {
                                        console.log(`Couldn't load the roles. Error: ${roleErr.sqlMessage}`)
                                        showMenu(connection);
                                        return;
                                    }

                                    // surface the options to the user
                                    const roleChoices = roleRes.map((row) => row.title)
                                    inquirer.prompt([{
                                        type: 'list',
                                        name: 'role',
                                        message: "What's the employee's new role?",
                                        choices: roleChoices,
                                        validate: (input) => validateRequired(input)
                                    }, {
                                        type: 'confirm',
                                        name: 'updateManager',
                                        message: "Do you want to update their manager?",
                                        validate: (input) => validateRequired(input)
                                    }]).then((answer) => {

                                        // get the id for the provided role. Schema prevents duplicate roles within the same department.
                                        const roleChoice = answer.role;
                                        const roleChoiceIndex = roleChoices.indexOf(roleChoice);
                                        const roleId = roleRes[roleChoiceIndex].role_id;
                                        employeeUpdateInfo.role_id = roleId;
                                        
                                        // if they want to update the manager, prompt them for the new manager.
                                        if (answer.updateManager) {
                                            // prompt for a manager
                                            connection.query(
                                                `SELECT
                                                    employee.id AS 'manager_id',
                                                    role.title,
                                                    CONCAT(employee.first_name, ' ', employee.last_name) AS 'manager_name'
                                                FROM employee
                                                LEFT JOIN role ON role.id = employee.role_id
                                                ORDER BY employee.last_name`,
                                                function(managerErr, managerRes) {
                                                    if (managerErr) {
                                                        console.log(`Couldn't load the employees. Error: ${managerErr.sqlMessage}.`)
                                                        connection.end();
                                                        return false;
                                                    }

                                                    // surface the options to the user
                                                    const managerChoices = managerRes.map((row) => `${row.manager_name} - ${row.title}`);
                                                    inquirer.prompt({
                                                        type: 'list',
                                                        name: 'manager',
                                                        message: "Who's the new employee's manager?",
                                                        choices: managerChoices,
                                                        validate: (input) => validateRequiredResponse(input)
                                                    }).then((answer) => {

                                                        // get the manager and update the role
                                                        const managerChoice = answer.manager
                                                        const managerChoiceIndex = managerChoices.indexOf(managerChoice);
                                                        const manager_id = managerRes[managerChoiceIndex].manager_id;
                                                        employeeUpdateInfo.manager_id = manager_id;

                                                        updateEmployeeRole(connection, employeeUpdateInfo);
                                                    });
                                                }
                                            );
                                        } else {
                                            updateEmployeeRole(connection, employeeUpdateInfo);
                                        }
                                    });
                                }
                            );
                        });
                    }
                )
            });
        }
    )
}

module.exports = {addNewEmployee, updateEmployeeRolePrompt, viewAllEmployees};