const cTable = require('console.table');
const inquirer = require('inquirer');
const utils = require('../utils');
const departmentPrompts = require('./departmentPrompts');


addDepartment = (connection) => {
    return inquirer.prompt(
        {
            type: 'input',
            name: 'department',
            message: "What's the name of the new department?",
            validate: (input) => validateRequired(input)
        }
    ).then((answer) => {
        insertDepartment(connection, answer.department);
    }).then(() => {
        showMenu(connection);
    });
}


deleteDepartment = (connection) => {
    const prompt = "Which department would you like to delete?";
    promptForDepartment(connection, prompt).then((departmentId) => {
        deleteById(connection, 'department', departmentId);
    }).then(() => {
        showMenu(connection);
    });
};


viewAllDepartments = (connection) => {
    getAllDepartments(connection).then((res) => {

        // reformat the query results
        const displayRes = res.map((row) => {
            return {
                Department: row.department,
                Headcount: row.headcount,
                "Labor Costs": row.labor_costs
            }
        });

        // surface the departments
        console.table(displayRes);
    }).then(() => {
        showMenu(connection);
    });
}


module.exports = {
    addDepartment,
    deleteDepartment,
    viewAllDepartments
};