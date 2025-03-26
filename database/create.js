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

function adotante() {
    const  adotante = `CREATE TABLE IF NOT EXISTS adotante (
    id integer PRIMARY KEY,
    origem datetime default (date()),
    nome text,
    contato text,
    q1 integer,
    q2 integer,
    q3 integer,
    qTotal integer,
    nomePet text,
    idadePet integer,
    especiePet text,
    portePet text,    
    FOREIGN KEY (nomePet) REFERENCES adocao(nome),
    FOREIGN KEY (idadePet) REFERENCES adocao(idade),
    FOREIGN KEY (especiePet) REFERENCES adocao(especie),
    FOREIGN KEY (portePet) REFERENCES adocao(porte)
);`
const sql = db.run(adotante,   error => {
    if (error)   console.log(error)
        console.log('Tabela: Adotante ATIVA.');
});
    return  sql

};
adotante();

function adotado(){
    const adotado = ` CREATE TABLE IF NOT EXISTS adotados(
    id integer primary key,
    origem datetime default (date()),
    foto blob,  
    nomePet text,
    nomeTutor text,
    historia text
    );`
    const sql = db.run(adotado,   error => {
        if (error)   console.log(error)
            console.log('Tabela: Adotado ATIVA.');
    });
    return sql;
}
adotado()

//Castração
function castracao () {
    const castracao = `CREATE TABLE IF NOT EXISTS castracao(
    id integer PRIMARY KEY,
    nome text,
    contato  text,
    ticket integer default (random()) ,
    origem datetime default (date()),
    arquivo blob,
    idade integer,
    especie text, 
    porte text,
    observacoes text
   );`
  const sql = db.run(castracao,   error => {
                if (error)   console.log(error)
                    console.log('Tabela: Castração ATIVA.');
});
return sql
};
castracao()

function perfil_adot() {
    
}




module.exports ={
    adocao: adocao,
    adotante: adotante,
    adotado: adotado,
    castracao: castracao   
}