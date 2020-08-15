var mysql = require('mysql2');
const prompt = require('./lib/prompt');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'employee_db'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Welcome to the Employee Manager!');
    showMenu(connection);
});