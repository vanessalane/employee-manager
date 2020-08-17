const inquirer = require('inquirer');
const departmentData = require('./departmentData');


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


module.exports = promptForDepartment;