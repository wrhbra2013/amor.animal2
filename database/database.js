const sql = require('sqlite3');

const db = new sql.Database("banco.db", erro => {
    if (erro) {
        return console.error(erro.message)
    }
    console.log("Base de Dados ATIVA.");
});

//Adoção
const cadastroPet = `CREATE TABLE IF NOT EXISTS cadastroPet  (
    id INTEGER PRIMARY KEY, 
    imagem text,
    nome text, 
    idade integer, 
    especie text, 
    porte text, 
    caracteristicas text,  
    tutor text,  
    contato email);` ;

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

