const inquirer = require('inquirer');
const helpers = require('../utils/helpers');
const dbHelpers = require('../utils/db');
const department = require('./department');

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

getAllRoles = (connection) => {
    return new Promise(function(resolve, reject) {
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
                    return reject(err);
                }
                resolve(res);
            }
        );
    });
};

viewAllRoles = (connection) => {
    getAllRoles(connection).then((res) => {

        // reformat the role results
        const resToDisplay = res.map((row) => {
            const formattedSalary = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(row.salary);
            return {
                Department: row.department,
                Role: row.title,
                Salary: formattedSalary
            }
        });

        // surface the departments
        console.table(resToDisplay);
    }).then(() => showMenu(connection));
};


module.exports = {addRole, getAllRoles, viewAllRoles};
