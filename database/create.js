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
    contato text,     
    origem datetime default current_date 
    );`

const sql = db.run(adocao,  error => {
    if (error)  console.log(error)
        console.log('Tabela: Adoção  ATIVA.');
});
return sql
};

adocao();

//Castração
function castracao () {
    const castracao = `CREATE TABLE IF NOT EXISTS castracao(
    ticket interger default (random())  PRIMARY KEY ,
    origem datetime default (date()),
    nome text,
    contato  text,
    arquivo blob,
    idade integer,
    especie text, 
    porte text,
    observacoes text
      );`
  const sql = db.run(castracao,   error => {
                if (error)   console.log(error)
                    console.log('Tabela: Castração ATIVA');
});
return sql
};
castracao()

module.exports ={
    adocao: adocao,
    castracao: castracao
}