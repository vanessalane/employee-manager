const cTable = require('console.table');
const inquirer = require('inquirer');
const utils = require("./utils");

/* DB FACING LOGIC */
getAllDepartments = (connection) => {
    return new Promise(function(resolve, reject) {
        // define the query to run
        const query = `SELECT
                            department.id as 'department_id',
                            name as 'department',
                            (SELECT SUM(role.salary) 
                             FROM role
                             WHERE role.department_id = department.id) as 'budget'
                        FROM department
                        LEFT JOIN role ON department_id = role.department_id
                        GROUP BY department`;
        // run the query and handle the response
        connection.query(query, function(err, res) {
            if (err) {
                return reject(err);
            }
            resolve(res);
        });
    });
};

/* CLIENT FACING LOGIC */
viewAllDepartments = (connection) => {
    // get the departments that can be chosen
    getAllDepartments(connection)
        .then((res) => {
            // format the departments to surface to the client
            const displayRes = res.map((row) => { 
                const formattedBudget = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(row.budget);
                return {
                    Department: row.department,
                    Budget: formattedBudget
                } })
            // surface the response
            console.table(displayRes);
        }).then(() => showMenu(connection));
}

deleteDepartment = (connection) => {
    // get the departments that can be chosen
    getAllDepartments(connection)
        .then((res) => {
            // format the options for the inquirer prompt
            const departmentChoices = res.map((row) => toTitleCase(row.department));
            // prompt the user to choose a department
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
                const departmentId = res[departmentChoiceIndex].department_id;
                // delete the department
                deleteById(connection, 'department', departmentId);
        }).then(() => showMenu(connection));
    });
};

module.exports = {viewAllDepartments, getAllDepartments, deleteDepartment};