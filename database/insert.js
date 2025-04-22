const { db } = require('./database');


function insert_adocao(arquivo, nome, idade, especie, porte, caracteristicas, tutor, contato, whatsapp) {
  const insert = `INSERT INTO adocao (
  arquivo,
  nome,
  idade,
  especie,
  porte,
  caracteristicas,
  tutor,
  contato,
  whatsapp,
  origem
) VALUES  (?,?,?,?,?,?,?,?, ?,strftime('%d/%m/%Y'));`
const values =  [ `${arquivo}`,` ${nome}`, `${idade}`,`${especie}`,` ${porte}`, `${caracteristicas}`, `${tutor}`, `${contato}`, `${whatsapp}`];
const  sql = db.run(insert, values,  error => {
      if (error)  return console.log(error)
        console.log("Dados de adoção INSERIDO.")
      });
 return sql;
};

function insert_adotante(nome, contato,whatsapp,q1, q2, q3){
  const insert = `INSERT INTO adotante (
  origem,
   nome,
   contato,
   whatsapp,
   q1,
   q2,
   q3,
   qTotal
   ) 
   VALUES (
   strftime('%d/%m/%Y'), ?, ?, ?, ?, ?, ?, ?
    );`
   const qTotal = parseInt(q1) + parseInt(q2) + parseInt(q3);
   const values = [`${nome}`, `${contato}`, `${whatsapp}`,`${q1}`, `${q2}`, `${q3}`, qTotal];
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



function insert_castracao(nome, contato, whatsapp,arquivo, idade, especie, porte, clinica, data){
  const insert = `INSERT INTO castracao(
  nome,
  contato,
  whatsapp,
  ticket,
  origem,
  arquivo,
  idade,
  especie,
  porte,
  clinica,
  data  
  )
   VALUES (  ?, ?, ?, ABS(RANDOM()) % 10000, strftime('%d/%m/%Y'), ?, ?, ?, ?, ?, ?
  );`
  const values = [ `${nome}`,`${contato}`, `${whatsapp}`,`${arquivo}`, `${idade}`, `${especie}`,`${porte}`,`${clinica}`, `${data}`];

  const sql = db.run( insert,  values,  error => {
    if (error)  return console.log(error)
      console.log("Dados de castração INSERIDO.")
    });
  return sql;
};

function insert_procura_se(arquivo, nomePet, idadePet, especie, porte, caracteristicas, local, tutor, contato, whatsapp){
  const insert = `INSERT INTO procura_se (
   data,
    arquivo,
    nomePet,
    idadePet,
    especie,   
    porte, 
    caracteristicas,
    local,
    tutor,
    contato,
    whatsapp
     )                
     VALUES (strftime('%d/%m/%Y'),?,?,?,?,?,?,?,?,?,?);`    
  const values = [`${arquivo}`, `${nomePet}`, `${idadePet}`, `${especie}`, `${porte}`, `${caracteristicas}`,`${local}`, `${tutor}`,`${contato}`, `${whatsapp}` ];

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


function insert_home(arquivo, titulo,mensagem)
{
  const insert = `INSERT INTO home (
  data,
  arquivo,
  titulo,
  mensagem
   ) VALUES (strftime('%d/%m/%Y'), ?, ?, ?);`
  const values = [ `${arquivo}` ,`${titulo}`, `${mensagem}` ];

  const sql = db.run( insert,  values,  error => {
    if (error)  return console.log(error)
      console.log("Dados da Primeira Pagina INSERIDO.")
    });
 return sql;
}
module.exports = {
  insert_adocao: insert_adocao,
  insert_adotante: insert_adotante,
  insert_adotado:insert_adotado,
  insert_castracao: insert_castracao,
  insert_parceria: insert_parceria,
  insert_procura_se: insert_procura_se,
  insert_home: insert_home
}
 
