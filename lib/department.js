const cTable = require('console.table');
const inquirer = require('inquirer');
const helperFunctions = require('../utils/helpers');
const dbHelperfunctions = require('../utils/db');


getAllDepartments = (connection) => {
    return new Promise(function(resolve, reject) {
        connection.query(
            `SELECT
                department.id as 'department_id',
                name as 'department',
                (SELECT SUM(role.salary)
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


viewAllDepartments = (connection) => {
    getAllDepartments(connection).then((res) => {

        // reformat the query results
        const displayRes = res.map((row) => {
            const formattedBudget = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(row.budget);
            return {
                Department: row.department,
                Budget: formattedBudget
            }
        });

        // surface the departments
        console.table(displayRes);
    }).then(() => showMenu(connection));
}


deleteDepartment = (connection) => {
    const prompt = "Which department would you like to delete?";
    promptForDepartment(connection, prompt).then((departmentId) => {
        deleteById(connection, 'department', departmentId);
    }).then(() => showMenu(connection));
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

module.exports = {viewAllDepartments, getAllDepartments, deleteDepartment, promptForDepartment};