deleteById = (connection, table, id) => {
    connection.query(
        `DELETE FROM ${table} WHERE id = ${id}`,
        function(err, res) {
            if (err) {
                console.log(`Couldn't delete record where id=${id} from ${table}. Error: ${err.sqlMessage}.`)
                connection.end();
                return false;
            }

            // let the user know if it worked and send them back to the main menu
            console.log(`\nDeleted ${res.affectedRows} from ${table}.`);
            showMenu(connection);
        }
    );
};

module.exports = {deleteById};