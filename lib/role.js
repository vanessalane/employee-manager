const cTable = require('console.table');
const inquirer = require('inquirer');
const department = require('./department');
const employee = require('./employee');
const utils = require('./utils');


getAllRoles = (connection) => {
    return new Promise(function(resolve, reject) {
        connection.query(
            `SELECT
                role.id AS 'id',
                department.name AS department,
                title,
                salary
            FROM role
            LEFT JOIN department ON department.id = department_id
            ORDER BY title, department, salary`,
            function(err, res) {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            }
        );
    });
};

getRolesByDepartment = (connection, departmentId) => {
    return new Promise(function(resolve, reject) {
        connection.query(
            `SELECT
                id,
                title
            FROM role
            WHERE ?
            ORDER BY title`, 
            { department_id: departmentId },
            function(err, res) {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            }
        );
    });
};


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


addRole = (connection) => {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: "What's the title of this new role?",
            validate: (input) => validateRequired(input)
        },
        {
            type: 'input',
            name: 'salary',
            message: "What's the salary for this role?",
            validate: (input) => validateNumber(input)
    }]).then((newRole) => {
        // next prompt them for the department
        const prompt = "In which department should this role be created?";
        promptForDepartment(connection, prompt).then((departmentId) => {
            newRole.department_id = departmentId;
            insertNewRole(connection, newRole);
        });
    });
};


promptForRole = (connection, deptPrompt="Please choose a department:", rolePrompt="Please choose a role:") => {
    return new Promise(
        function(resolve, reject) {
            promptForDepartment(connection, deptPrompt).then((departmentId) => {
                getRolesByDepartment(connection, departmentId).then((res) => {
                    // prompt the user to choose a role
                    const roleChoices = res.map((row) => row.title)
                    inquirer.prompt({
                        type: 'list',
                        name: 'role',
                        message: rolePrompt,
                        choices: roleChoices,
                        validate: (input) => validateRequired(input)
                    }).then((answer) => {

                        // figure out the role id
                        const roleChoice = answer.role;
                        const roleChoiceIndex = roleChoices.indexOf(roleChoice);
                        const roleId = res[roleChoiceIndex].id;

                        // Return the role ID if possible
                        if (!roleId) {
                            const err = `Could not find an ID for role = ${roleChoice}.`
                            return reject(err);
                        }
                        resolve(roleId);
                    });
                });
            });
        }
    );
}


deleteRole = (connection) => {
    const deptPrompt = "In which department is the role you would like to delete?";
    const rolePrompt = "Which role would you like to delete?";

    promptForRole(connection, deptPrompt, rolePrompt).then((roleId) => {
        deleteById(connection, 'role', roleId);
    })
};


viewAllRoles = (connection) => {
    getAllRoles(connection).then((res) => {

        // reformat the role results
        const resToDisplay = res.map((row) => {
            const formattedSalary = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(row.salary);
            return {
                Role: row.title,
                Department: row.department,
                Salary: formattedSalary
            }
        });

        // surface the departments
        console.table(resToDisplay);
    }).then(() => showMenu(connection));
};


updateRole = (connection) => {
    promptForEmployee(connection).then((employeeId) => {
        let employeeInfo = { employee_id: employeeId };

        // prompt for the new role and department
        const deptPrompt = "What's the employee's new department?";
        const rolePrompt = "What's the employee's new role?";
        promptForRole(connection, deptPrompt, rolePrompt).then((roleId) => {
            employeeInfo.role_id = roleId;

            // update the employee's role
            updateEmployee(connection, employeeInfo);
        });
    });
};


module.exports = {
    addRole,
    deleteRole,
    getAllRoles,
    insertNewRole,
    promptForRole,
    updateRole,
    viewAllRoles
};
