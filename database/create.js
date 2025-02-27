const {db} = require('./database');


//Adoção
function adocao() {
const adocao= `CREATE TABLE IF NOT EXISTS adocao  (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    arquivo blob,
    nome  text,
    idade integer, 
    especie text, 
    porte text, 
    caracteristicas text,  
    tutor text,  
    contato email,     
    origem DATETIME DEFAULT CURRENT_TIMESTAMP 
    );`

db.run(adocao, error => {
if (error) {
return console.error(error.message)
}
console.log("Tabela: Adoção  ATIVA.");
});
}

//Instanciar
adocao();

module.exports ={
    adocao: adocao
}