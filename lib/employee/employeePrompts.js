const inquirer = require('inquirer');
const employee = require('./employeeData');

promptForEmployee = (connection, prompt, managerPrompt=false) => {
    return new Promise(
        function(resolve, reject) {
            getAllEmployees(connection).then((res) => {

                // prompt the user for the employee
                let employeeChoices = res.map((row) => `${row.employee} - ${row.role}`)
                if (managerPrompt) employeeChoices.push('None');  // add a "None" option because manager can be null
                inquirer.prompt({
                    type: 'list',
                    name: 'employee',
                    message: prompt,
                    choices: employeeChoices,
                    validate: (input) => validateRequired(input)
                }).then((answer) => {

                    // use the answer and managerPrompt bool to define the employee/updateManagerPromptmanager id
                    let employeeId;
                    if (managerPrompt && answer.employee === 'None') {
                        employeeId = null;
                    } else {
                        const choice = answer.employee;
                        const choiceIndex = employeeChoices.indexOf(choice);
                        employeeId = res[choiceIndex].employee_id;
                    }

                    // return the result
                    if (isNaN(employeeId) && employeeId != null) {
                        const err = `could not find an Id for employee = ${employeeChoice}`;
                        return reject(err);
                    }
                    resolve(employeeId);
                });
            });
        }
    )
}


promptForManager = (connection, prompt) => { 
    return new Promise(
        function(resolve, reject) {
            getAllManagers(connection).then((res) => {
                if (res.length === 0) {
                    return resolve(false);
                } else {
                    // prompt the user for an existing manager
                    let managerChoices = res.map((row) => `${row.manager}`)
                    inquirer.prompt({
                        type: 'list',
                        name: 'manager',
                        message: prompt,
                        choices: managerChoices,
                        validate: (input) => validateRequired(input)
                    }).then((answer) => {
    
                        // define the manager id
                        const choice = answer.manager;
                        const choiceIndex = managerChoices.indexOf(choice);
                        const managerId = res[choiceIndex].manager_id;
    
                        // return the result
                        if (!managerId) {
                            const err = `could not find an Id for manager = ${employeeChoice}`;
                            return reject(err);
                        }
                        resolve(managerId);
                    });
                }
            }
        );
    })
}

module.exports = {
    promptForEmployee,
    promptForManager
}