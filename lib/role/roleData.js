const cTable = require('console.table');
const utils = require('../utils');


getAllRoles = (connection) => {
    return new Promise(function(resolve, reject) {
        connection.query(
            `SELECT
                role.id AS 'id',
                department.name AS department,
                title,
                CONCAT('$ ', FORMAT(role.salary, 0)) AS 'salary'
            FROM role
            LEFT JOIN department ON department.id = department_id
            ORDER BY title, department, salary`,
            function(err, res) {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            }
        );
    });
};

getRolesByDepartment = (connection, departmentId) => {
    return new Promise(function(resolve, reject) {
        connection.query(
            `SELECT
                id,
                title
            FROM role
            WHERE ?
            ORDER BY title`, 
            { department_id: departmentId },
            function(err, res) {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            }
        );
    });
};


insertNewRole = (connection, newRole) => {
    return new Promise(function(resolve, reject) {
        newRole.title = toTitleCase(newRole.title);
        connection.query(
            `INSERT INTO role SET ?`,
            newRole,  // should be an object with keys title, salary, and department_id
            function(err, res) {
                if (!err) {
                    console.log(`\nAdded the new role!`);
                    return resolve(res);
                }
                // if the error is likely related to the user's input, send them back to the main menu.
                if (err && err.errno === 1062) {
                    console.log("\nThat role already exists! Let's try again.")
                    return resolve(res);
                }  // otherwise, end the connection becuase it's probably a bigger problem.
                else {
                    console.log(`Couldn't insert the new role. Error ${err.sqlMessage}`);
                    return reject(err);
                }
            }
        );
    });
};


module.exports = {
    getAllRoles,
    insertNewRole
};