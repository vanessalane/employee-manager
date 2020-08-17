const utils = require('../utils');


getAllDepartments = (connection) => {
    return new Promise(function(resolve, reject) {
        connection.query(
            `SELECT
                department.id as 'department_id',
                name as 'department',
                (SELECT CONCAT('$ ', FORMAT(SUM(role.salary),0)) as payroll
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


insertDepartment = (connection, departmentName) => {
    return new Promise(function(resolve, reject) {
        departmentName = toTitleCase(departmentName);
        connection.query(
            `INSERT INTO department SET ?`,
            { name: departmentName },
            function(err, res) {
                if (!err) {
                    console.log(`\nAdded the new department!`);
                    return resolve(res);
                } 
                else if (err && err.errno === 1062) {
                    console.log("\nThat department already exists! Let's try again.")
                    return resolve(res);
                }
                else {
                    console.log(`Couldn't insert the new department. Error ${err.sqlMessage}`);
                    return reject(err);
                }
            }
        );
    });
};


module.exports = {
    getAllDepartments,
    insertDepartment
}