import {db} from "/database/base.js";

const cadastroPet = `CREATE TABLE IF NOT EXISTS cadastroPet  (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    nome text, 
    idade integer, 
    especie text, porte text, 
    caracteristicas text,  
    tutor text,  
    contato email);` ;

db.run(cadastroPet, erro => {
if (erro) {
return console.error(erro.message)
}
console.log("Criando tabela para Cadastro de PET...");
});