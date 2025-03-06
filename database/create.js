const {db} = require('./database');

//Adoção
function adocao() {
const adocao = `CREATE TABLE IF NOT EXISTS adocao(
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    arquivo blob,
    nome  text,
    idade integer, 
    especie text, 
    porte text, 
    caracteristicas text,  
    tutor text,  
    contato email,     
    origem datetime default current_date 
    );`

const sql = db.run(adocao,  error => {
    if (error) return console.error(error)
        console.log('Tabela: Adoção  ATIVA.');
});
return sql
};

adocao();

//Castração
function castracao () {
    const castracao = `CREATE TABLE IF NOT EXISTS castracao(
    id integer PRIMARY KEY AUTOINCREMENT,
    ticket integer,
    origem datetime default current_date,
    nome text,
    contato email,
    arquivo blob,
    idade integer,
    especie text, 
    porte text,
    observacoes text,
    status text
    );`
  const sql = db.run(castracao,   error => {
                if (error)   return console.log(error)
                    console.log('Tabela: Castração ATIVA');
});
return sql
};
castracao()

module.exports ={
    adocao: adocao,
    castracao: castracao
}