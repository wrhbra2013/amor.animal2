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

function insert_adotante(nome, contato, q1,q2, q3){
  const insert = `INSERT INTO adotante (
  origem,
   nome,
   contato,
   q1,
   q2,
   q3,
   qTotal) 
   VALUES (
   strftime('%d/%m/%Y'), ?, ?, ?, ?, ?, (SELECT SUM(adotante.q1 + adotahte.q2 + adotante.q3 AS 'qTotal'))
    );`
   const values = [`${nome}`, `${contato}`, `${q1}`, `${q2}`, `${q3}`];
   const sql = db.run( insert,  values,  error => {
    if (error)  return console.log(error)
      console.log("Dados de  interessados INSERIDO.")
    });
  return sql;
};

function insert_adotados(foto, pet,tutor,historia){
  const insert = `INSERT INTO adotado (
   origem,
   foto,
   nomePet,
   nomeTutor,
   historia) 
   VALUES (
   strftime('%d/%m/%Y'), ?, ?, ?, ?
   );`
 const values = [`${foto}`, `${pet}`, `${tutor}`, `${historia}`];
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



module.exports = {
  insert_adocao: insert_adocao,
  insert_castracao: insert_castracao,
  insert_adotante: insert_adotante
}
