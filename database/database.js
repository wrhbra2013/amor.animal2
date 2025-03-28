const sql = require('sqlite3').verbose();
const path = require("path");

//Nome do banco
const  db_name = 'espelho';
const path_name = path.join(`./database/${db_name}.db`);

const db = new sql.Database(path_name, error => {
    if (error)  return console.error(error.message)
       console.log("Base de Dados ATIVA.");
});

const fk = `PRAGMA foreign_keys = ON;`
const fk_db = db.get(fk, error =>{
    if (error)  return console.log(error)
        console.log('Foreign Keys ATIVA.')
})


module.exports = {
    //exportar modelos para rotas post
   db: db,
   fk_db: fk_db
   };

