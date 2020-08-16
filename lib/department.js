const cTable = require('console.table');
const inquirer = require('inquirer');
const utils = require('./utils');
const { validateRequired } = require('./utils');


getAllDepartments = (connection) => {
    return new Promise(function(resolve, reject) {
        connection.query(
            `SELECT
                department.id as 'department_id',
                name as 'department',
                (SELECT CONCAT('$ ', FORMAT(SUM(role.salary),0)) as payroll
                 FROM role
                 WHERE role.department_id = department.id) as 'budget'
            FROM department
            LEFT JOIN role ON department_id = role.department_id
            GROUP BY department`,
            function(err, res) {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            }
        );
    });
};


insertNewDepartment = (connection, departmentName) => {
    departmentName = toTitleCase(departmentName);
    connection.query(
        `INSERT INTO department SET ?`,
        { name: departmentName },  // should be an object with department_name
        function(err, res) {
            if (!err) {
                console.log(`\nAdded the new department!`);
                showMenu(connection);
                return true;
            }

            // if the error is likely related to the user's input, send them back to the main menu.
            if (err && err.errno === 1062) {
                console.log("\nThat department already exists! Let's try again.")
                showMenu(connection);
            }  // otherwise, end the connection becuase it's probably a bigger problem.
            else {
                console.log(`Couldn't insert the new department. Error ${err.sqlMessage}`);
                connection.end();
            }
            return false;
        }
    )
};


addDepartment = (connection) => {
    return inquirer.prompt(
        {
            type: 'input',
            name: 'department',
            message: "What's the name of the new department?",
            validate: (input) => validateRequired(input)
        }
    ).then((answer) => insertNewDepartment(connection, answer.department));
}


deleteDepartment = (connection) => {
    const prompt = "Which department would you like to delete?";
    promptForDepartment(connection, prompt).then((departmentId) => {
        deleteById(connection, 'department', departmentId);
    });
};


promptForDepartment = (connection, promptMessage) => {
    return new Promise(
        function(resolve, reject) {
            getAllDepartments(connection).then((res) => {

                // prompt user to choose a department from the department table
                const departmentChoices = res.map((row) => row.department);
                return inquirer.prompt({
                    type: 'list',
                    name: 'department',
                    message: promptMessage,
                    choices: departmentChoices,
                    validate: (input) => validateRequiredResponse(input)
            }).then((answer) => {

                // figure out the department ID
                const departmentChoice = answer.department;
                const departmentChoiceIndex = departmentChoices.indexOf(departmentChoice);
                const departmentId = res[departmentChoiceIndex].department_id;

                // Return the department ID if possible
                if (!departmentId) {
                    const err = `Could not find department ID for department = ${departmentChoice}.`
                    return reject(err);
                }
                resolve(departmentId);
            });
        });
    });
};


viewAllDepartments = (connection) => {
    getAllDepartments(connection).then((res) => {

        // reformat the query results
        const displayRes = res.map((row) => {
            return {
                Department: row.department,
                Budget: row.budget
            }
        });

        // surface the departments
        console.table(displayRes);
    }).then(() => showMenu(connection));
}


module.exports = {
    viewAllDepartments,
    getAllDepartments,
    deleteDepartment,
    promptForDepartment
};