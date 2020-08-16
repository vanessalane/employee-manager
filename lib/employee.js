const cTable = require('console.table');
const mainPrompt = require('./mainPrompt');


getAllEmployees = (connection, orderByArg) => {
    return new Promise(function(resolve, reject) {
        connection.query(
            `SELECT 
                employee.id AS 'employee_id',
                CONCAT(employee.first_name, ' ', employee.last_name) AS 'employee',
                department.name as 'department',
                role.title,
                role.salary,
                CONCAT(manager.first_name, ' ', manager.last_name) AS 'manager'
            FROM employee
            LEFT JOIN role ON role.id = role_id
            LEFT JOIN department ON department.id = role.department_id
            LEFT JOIN employee manager ON manager.id = employee.manager_id
            ORDER BY ${orderByArg}`,
            function(err, res) {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            }
        );
    });
};

viewAllEmployees = (connection, orderByArg='employee.last_name') => {

    // define how the results should be sorted
    if (orderByArg === 'manager') {
        orderByArg = 'manager.last_name';
    }

    getAllEmployees(connection, orderByArg).then((res) => {
        const resToDisplay = res.map((row) => {
            const formattedSalary = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(row.salary);
            return {
                Name: row.employee,
                Department: row.department,
                Role: row.title,
                Salary: formattedSalary,
                Manager: row.manager
            }
        });

        // surface the employees
        console.table(resToDisplay);
    }).then(() => showMenu(connection));
};

module.exports = {
    getAllEmployees,
    viewAllEmployees
};