const inquirer = require('inquirer');
const departmentPrompts = require('../department/departmentPrompts');
const roleOptions = require('./roleOptions');
const roleData = require('./roleData');


promptForRole = (connection, deptPrompt="Please choose a department:", rolePrompt="Please choose a role:") => {
    return new Promise(
        function(resolve, reject) {
            promptForDepartment(connection, deptPrompt).then((departmentId) => {
                getRolesByDepartment(connection, departmentId).then((res) => {

                    // if there are no roles in that department, tell the user they need to create the role first.
                    if (res.length === 0) {
                        console.log(`This department has no roles! You need to create one before adding an employee.`);
                        return resolve(false);
                    } 
                    else {
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
                    };  
                });
            });
        }
    );
}


module.exports = promptForRole;
