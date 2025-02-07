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
const cadastroPet = `CREATE TABLE IF NOT EXISTS cadastroPet  (
    id INTEGER PRIMARY KEY, 
    arquivo text,
    nomePet  text,
    idadePet text, 
    especie text, 
    porte text, 
    caracteristicas text,  
    tutor text,  
    contato email,     
    origem datetime default current_timestamp
    );`;

db.run(cadastroPet, erro => {
if (erro) {
return console.error(erro.message)
}
console.log("Criando tabela para Cadastro de PET...");
});




module.exports = {
    //exportar modelos para rotas post
    db: db,
    cadastroPet: cadastroPet
};

