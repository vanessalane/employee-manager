viewAllRoles = (connection) => {
    connection.query(
        `SELECT 
           title,
           salary,
           department.name AS department
         FROM role
         LEFT JOIN department ON department.id = department_id`,
        function(err, res) {
            console.log("Reading roles...");
            if (err) throw err;
            console.table(res);
        }
    );
};

addNewRole = (connection, newRole) => {
    connection.query(
        `INSERT INTO role SET ?`,
        newRole,  // should be an object with keys title, salary, and department_id
        function(err, res) {
            if (err) throw err;
            console.log(`${res.affectedRows}; Added the role ${newRole.title}!`);
        }
    );
};

module.exports = {viewAllRoles, addNewRole};