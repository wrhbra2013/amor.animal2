const sql = require('sqlite3').verbose();
const path = require("path");

//Nome do banco
const  db_name = 'espelho';
const path_name = path.join(`./database/${db_name}.db`);


const db = new sql.Database(path_name, error => {
    if (error) {
        return console.error(error.message)
    }
    console.log("Base de Dados ATIVA.");
});



module.exports = {
    //exportar modelos para rotas post
    db:db,
   };

