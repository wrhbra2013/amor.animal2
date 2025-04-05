const { db } = require('./database');


function insert_adocao(arquivo, nome, idade, especie, porte, caracteristicas, tutor, contato) {
  const insert = `INSERT INTO adocao (
  arquivo,
  nome,
  idade,
  especie,
  porte,
  caracteristicas,
  tutor,
  contato,
  origem
) VALUES  (?,?,?,?,?,?,?,?, strftime('%d/%m/%Y'));`
const values =  [ `${arquivo}`,` ${nome}`, `${idade}`,`${especie}`,` ${porte}`, `${caracteristicas}`, `${tutor}`, `${contato}`]

const  sql = db.run(insert, values,  error => {
      if (error)  return console.log(error)
        console.log("Dados de adoção INSERIDO.")
      });
 return sql;
};

function insert_adotante(nome, contato,q1, q2, q3){
  const insert = `INSERT INTO adotante (
  origem,
   nome,
   contato,
   q1,
   q2,
   q3,
   qTotal
   ) 
   VALUES (
   strftime('%d/%m/%Y'), ?, ?, ?, ?, ?,  (SELECT SUM(q1 + q2 + q3) FROM adotante)
    );`
   const values = [`${nome}`, `${contato}`, `${q1}`, `${q2}`, `${q3}`];
   const sql = db.run( insert,  values,  error => {
    if (error)  return console.log(error)
      console.log("Dados de  interessados INSERIDO.")
    });
  return sql;
};


function insert_adotado(arquivo, pet, tutor, historia){
  const insert = `INSERT INTO adotado (
   origem,
   arquivo,
   pet,
   tutor,
   historia
   ) 
   VALUES (strftime('%d/%m/%Y'), ?, ?, ?, ?
   );`
 const values = [`${arquivo}`, `${pet}`, `${tutor}`, `${historia}`];
 const sql = db.run( insert,  values,  error => {
  if (error)  return console.log(error)
    console.log("Dados de  adotados INSERIDO.")
  });
return sql;
};



function insert_castracao(nome, contato, arquivo, idade, especie, porte, observacoes){
  const insert = `INSERT INTO castracao(
  nome,
  contato,
  ticket,
   origem,
  arquivo,
  idade,
  especie,
  porte,
  observacoes
  )
   VALUES (  ?, ?, ABS(RANDOM()) % 10000, strftime('%d/%m/%Y'), ?, ?, ?, ?, ?
  );`
  const values = [ `${nome}`,`${contato}`,`${arquivo}`, `${idade}`, `${especie}`,`${porte}`,`${observacoes}`];

  const sql = db.run( insert,  values,  error => {
    if (error)  return console.log(error)
      console.log("Dados de castração INSERIDO.")
    });
  return sql;
};

function insert_procura_se(arquivo, nomePet, idadePet, especie, porte, caracteristicas, local, tutor, contato){
  const insert = `INSERT INTO procura_se (
   arquivo,
   nomePet,
   idadePet,
   especie.
   porte,
   caracteristicas,
   local,
   tutor,
   contato
  )
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`
  const values = [`${arquivo}`, `${nomePet}`, `${idadePet}`, `${especie}`, `${porte}`, `${caracteristicas}`,`${local}`, `${tutor}`,`${contato}` ];

  const sql = db.run( insert,  values,  error => {
    if (error)  return console.log(error)
      console.log("Dados de procura-se INSERIDO.")
    });
  return sql;
};

function insert_parceria(empresa, localidade, proposta, representante, telefone, whatsapp, email) {
  const insert = `INSERT INTO parceria (
  data,
  empresa,
  localidade,
  proposta,
  representante,
  telefone,
  whatsapp,
  email
   ) VALUES (strftime('%d/%m/%Y'), ?, ? , ?, ?, ?, ?, ?);`
  const values = [ `${empresa}`, `${localidade}`, `${proposta}`,`${representante}`, `${telefone}`, `${whatsapp}`, `${email}` ];

  const sql = db.run( insert,  values,  error => {
    if (error)  return console.log(error)
      console.log("Dados de parceria INSERIDO.")
    });
 return sql;
};

function insert_doacao( nome, localidade, contato, recurso, valor){
  const insert = ` INSERT INTO doacao (
  nome, 
  localidade,
  contato,
  recurso,
  valor
  );`
  const values = [`${nome}`, `${localidade}`, `${contato}`, `${recurso}`, `${valor}`]
  const sql = db.run( insert,  values,  error => {
    if (error)  return console.log(error)
      console.log("Dados de parceria INSERIDO.")
    });
 return sql;
};


module.exports = {
  insert_adocao: insert_adocao,
  insert_adotante: insert_adotante,
  insert_adotado:insert_adotado,
  insert_castracao: insert_castracao,
  insert_parceria: insert_parceria,
  insert_procura_se: insert_procura_se,
  insert_doacao: insert_doacao
}
 
