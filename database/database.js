const sql = require('sqlite3');
const db = new sql.Database("banco.db", sqlite3.OPEN_READWRITE);

const criarTabela = () => {
    console.log("Criando tabela para Cadastro de PET...");
    db.run("CREATE TABLE IF NOT EXIXSTS pet" )

};
