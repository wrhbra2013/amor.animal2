const {db} = require('./database');

//Adoção
function create_adocao() {
const adocao = `CREATE TABLE IF NOT EXISTS adocao(
    id INTEGER PRIMARY KEY, 
    arquivo blob,
    nome  text,
    idade integer, 
    especie text, 
    porte text, 
    caracteristicas text,  
    tutor text,  
    contato text,     
    whatsapp text,
    origem datetime default (date())
    );`

const sql = db.run(adocao,  error => {
    if (error)  console.log(error)
        console.log('Tabela: Adoção  ATIVA.');
});
return sql
};

create_adocao();

function create_adotante() {
    const  adotante = `CREATE TABLE IF NOT EXISTS adotante (
    id integer PRIMARY KEY,
    origem datetime default (date()),
    q1 integer,
    q2 integer, 
    q3 integer,
    qTotal integer,
    nome text,
    contato text,
    whatsapp text,
    cep text,
    endereco text,
    numero integer,
    complemento text,
    bairro text,
    cidade text,
    estado text,    
    idPet integer,   
    FOREIGN KEY (idPet) REFERENCES adocao (id)
);`
const sql = db.run(adotante,   error => {
    if (error)   console.log(error)
        console.log('Tabela: Adotante ATIVA.');
});
    return  sql

};
create_adotante(); 

function create_adotado(){
    const adotado = ` CREATE TABLE IF NOT EXISTS adotado(
    id integer primary key,
    origem datetime default (date()),
    arquivo blob, 
    pet text,
    tutor text,
    historia text
    );`    
    const sql = db.run(adotado,    error => {
        if (error)   console.log(error)
            console.log('Tabela: Adotado ATIVA.');
    });
    return sql;
};
create_adotado()

//Castração
function create_castracao () {
    const castracao = `CREATE TABLE IF NOT EXISTS castracao(
    id integer PRIMARY KEY,
     origem datetime default (date()),
     ticket integer default (random()),
    nome text,
    contato  text,
    whatsapp text,   
    arquivo blob,
    idade integer,
    especie text, 
    porte text,
    clinica text,
    agenda text
   );`
  const sql = db.run(castracao,   error => {
                if (error)   console.log(error)
                    console.log('Tabela: Castração ATIVA.');
});
return sql
};
create_castracao();

//Procura_se
function create_procura_se(){
      const procurase = `CREATE TABLE IF NOT EXISTS procura_se (
        id INTEGER PRIMARY KEY,
         origem datetime default (date()),
         arquivo blob,
         nomePet text,
         idadePet integer,
         especie text,
         porte text,
         caracteristicas text,
         local text,
         tutor text,
         contato text,
         whatsapp text
        );`
    const sql = db.run(procurase,   error => {
        if (error)   console.log(error)
            console.log('Tabela: Procura-se ATIVA.');
});
    return sql;
};
create_procura_se();

//Parceria
function create_parceria(){
  const parceria =` CREATE TABLE IF NOT EXISTS parceria(
   id INTEGER PRIMARY KEY,
   origem datetime default (date()),
    empresa text,
    localidade text,
    proposta text,
    representante text,
    telefone text,
    whatsapp text,
    email text
     );`
    const sql = db.run(parceria,   error => {
        if (error)   console.log(error)
            console.log('Tabela: Parceria ATIVA.');
});
    return sql;
};
create_parceria();


function create_home(){
    const home = `CREATE TABLE IF NOT EXISTS home(
        id INTEGER PRIMARY KEY,
        origem datetime default (date()),
        arquivo blob, 
        titulo text,
        mensagem text
    );`
    const sql = db.run(home,   error => {   
        if (error)   console.log(error)
            console.log('Tabela: Home ATIVA.');     
    });
       return sql;
}
create_home();


module.exports ={
    create_adocao: create_adocao,
    create_adotante: create_adotante,
    create_adotado: create_adotado,
    create_castracao: create_castracao,
    create_procura_se: create_procura_se,
    create_parceria: create_parceria,
     create_home: create_home
    }