const inquirer = require('inquirer');
const utils = require("../utils");
const department = require("./index");

deleteDepartmentPrompt = (connection) => {
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
            message: "Which department would you like to delete?",
            choices: departmentChoices,
            validate: (input) => validateRequiredResponse(input)
        }).then((answer) => {

            // get the id for the provided department to help us surface the roles available
            const departmentChoice = answer.department;
            const departmentChoiceIndex = departmentChoices.indexOf(departmentChoice);
            const departmentId = deptRes[departmentChoiceIndex].department_id;

            deleteDepartment(connection, departmentId);
        });
    });
};

module.exports = deleteDepartmentPrompt;