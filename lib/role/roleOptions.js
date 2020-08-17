const cTable = require('console.table');
const inquirer = require('inquirer');
const employeePrompts = require('../employee/employeePrompts');
const rolePrompts = require('../role/rolePrompts');
const utils = require('../utils');


addRole = (connection) => {
    const prompt = "In which department should this role be created?";
    promptForDepartment(connection, prompt).then((departmentId) => {

        // next prompt them for the role title and salary
        let newRole = { department_id: departmentId};
        inquirer.prompt([
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
        }]).then((answer) => {

            // store the responses
            newRole.title = answer.title;
            newRole.salary = answer.salary;

            // add the role to the db
            insertNewRole(connection, newRole);
        }).then(() => showMenu(connection));
    });
};


deleteRole = (connection) => {
    const deptPrompt = "In which department is the role you would like to delete?";
    const rolePrompt = "Which role would you like to delete?";

    promptForRole(connection, deptPrompt, rolePrompt).then((roleId) => {
        deleteById(connection, 'role', roleId);
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
        }).then(() => showMenu(connection));
    });
};


viewAllRoles = (connection) => {
    getAllRoles(connection).then((res) => {

        // reformat the role results
        const resToDisplay = res.map((row) => {
            return {
                Role: row.title,
                Department: row.department,
                Salary: row.salary
            }
        });

        // surface the departments
        console.table(resToDisplay);
    }).then(() => showMenu(connection));
};

module.exports = {
    addRole,
    deleteRole,
    updateRole,
    viewAllRoles
};
