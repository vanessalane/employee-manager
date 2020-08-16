const inquirer = require('inquirer');
const prompt = require('./prompt');
const employee = require('./employee');
const utils = require('./utils');

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

addNewRole = (connection) => {
    console.log("\nOK, let's add a new role.\n")

    // prompt for the role's title and salary
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
        }
    ]).then((newRole) => {

        // get the options for the departments
        connection.query(
            `SELECT
                id AS 'department_id',
                name AS 'department'
            FROM department
            ORDER BY department`,
            function(deptErr, deptRes) {
                if (deptErr) {
                    console.log(`Sorry, I couldn't load the roles. Error: ${deptErr.sqlMessage}.`);
                    connection.end();
                    return false;
                }

                // surface the options to the user
                const departmentChoices = deptRes.map((row) => row.department)
                inquirer.prompt({
                    type: 'list',
                    name: 'department',
                    message: "In which department should this role be created?",
                    choices: departmentChoices,
                    validate: (input) => validateRequiredResponse(input)
                }).then((answer) => {

                    // add the department ID to the new role
                    const departmentChoice = answer.department;
                    const departmentChoiceIndex = departmentChoices.indexOf(departmentChoice);
                    const departmentID = deptRes[departmentChoiceIndex].department_id;
                    newRole.department_id = departmentID;
                    insertNewRole(connection, newRole);
                });
            }
        )
    });
};

module.exports = {addNewRole, viewAllRoles};