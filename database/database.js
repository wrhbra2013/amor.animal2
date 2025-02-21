const sql = require('sqlite3').verbose();
const path = require("path");
const db_name = path.join("./database/banco.db");

const db = new sql.Database(db_name, error => {
    if (error) {
        return console.error(error.message)
    }
    console.log("Base de Dados ATIVA.");
});

//Adoção
const adocao= `CREATE TABLE IF NOT EXISTS adocao  (
    id INTEGER PRIMARY KEY, 
    arquivo varchar,
    nome  varchar,
    idade integer, 
    especie varchar, 
    porte varchar, 
    caracteristicas varchar,  
    tutor varchar,  
    contato email,     
    origem DATETIME DEFAULT CURRENT_TIMESTAMP 
    );`

db.run(adocao, error => {
if (error) {
return console.error(error.message)
}
console.log("Tabela: Adoção  ATIVA.");
});

module.exports = {
    //exportar modelos para rotas post
    db:db,
   adocao: adocao
};

