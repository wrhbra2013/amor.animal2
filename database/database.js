const sql = require('sqlite3').verbose();
const path = require("path");
const db_name = path.join("./database/banco.db");

const db = new sql.Database(db_name, erro => {
    if (erro) {
        return console.error(erro.message)
    }
    console.log("Base de Dados ATIVA.");
});

//Adoção
const adocao= `CREATE TABLE IF NOT EXISTS adocao  (
    id INTEGER PRIMARY KEY, 
    arquivo varchar,
    nomePet  varchar,
    idadePet integer, 
    especie varchar, 
    porte varchar, 
    caracteristicas varchar,  
    tutor varchar,  
    contato email,     
    origem datetime default current_timestamp
    );`;

db.run(adocao, erro => {
if (erro) {
return console.error(erro.message)
}
console.log("Tabela: Adoção  PRONTA.");
});




module.exports = {
    //exportar modelos para rotas post
    db:db,
   adocao: adocao
};

