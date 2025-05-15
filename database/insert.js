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

function insert_adotante(q1, q2, q3,  nome, contato,whatsapp, cep, endereco, numero, complemento, bairro, cidade, estado, idPet){
  const insert = `INSERT INTO adotante (
    origem, 
    q1, 
    q2, 
    q3, 
    qTotal, 
    nome, 
    contato, 
    whatsapp, 
    cep, 
    endereco, 
    numero, 
    complemento, 
    bairro, 
    cidade, 
    estado, 
    idPet
  ) VALUES (strftime('%d/%m/%Y'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

  // Certifique-se que q1, q2, q3, numero, idPet são números.
  // Se vierem de um formulário web, podem ser strings e precisarão de parseInt().
  const qTotal = parseInt(q1) + parseInt(q2) + parseInt(q3);

  // Passe os valores com seus tipos corretos (números como números)
  const values = [
    parseInt(q1), parseInt(q2), parseInt(q3), qTotal,
    nome, contato, whatsapp, cep, endereco, parseInt(numero), complemento,
    bairro, cidade, estado, parseInt(idPet) // Garanta que idPet seja um número
  ];

  const sql = db.run( insert,  values,  function(error) { // Use function() para ter acesso a this.lastID
    if (error) {
      console.error("Erro ao inserir adotante:", error.message); // Log mais detalhado
      return;
    }
    console.log(`Dados de interessados INSERIDO com ID: ${this.lastID} para Pet ID: ${idPet}`);
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



function insert_castracao(nome, contato, whatsapp,arquivo, idade, especie, porte, clinica, agenda){
  const insert = `INSERT INTO castracao(
  origem,
  ticket,
  nome,
  contato,
  whatsapp,
  arquivo,
  idade,
  especie,
  porte,
  clinica,
  agenda 
)VALUES (strftime('%d/%m/%Y'), ABS(RANDOM()) % 10000, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
  const values = [ `${nome}`,`${contato}`, `${whatsapp}`,`${arquivo}`, `${idade}`, `${especie}`,`${porte}`,`${clinica}`, `${agenda}`];

  const sql = db.run( insert,  values,  error => {
    if (error)  return console.log(error)
      console.log("Dados de castração INSERIDO.")
    });
  return sql;
};

function insert_procura_se(arquivo, nomePet, idadePet, especie, porte, caracteristicas, local, tutor, contato, whatsapp){
  const insert = `INSERT INTO procura_se (
   origem,
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
  origem,
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


function insert_home(arquivo, titulo,mensagem, link)
{
  const insert = `INSERT INTO home (
  origem,
  arquivo,
  titulo,
  mensagem,
  link
   ) VALUES (strftime('%d/%m/%Y'), ?, ?, ?, ?);`
  const values = [ `${arquivo}` ,`${titulo}`, `${mensagem}`, `${link}`
      ];

  const sql = db.run( insert,  values,  error => {
    if (error)  return console.log(error)
      console.log("Dados da Primeira Pagina INSERIDO.")
    });
 return sql;
}

function insert_login(usuario, senha) {
  const insert = `INSERT INTO login (
    origem,
    usuario,
    senha,
    isAdmin
) VALUES (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'), ?, ?, ?);`;
  const values = [`${usuario}`, `${senha}`,  true];

  const sql = db.run(insert, values, function(error) {
      if (error) {
          console.error("Erro ao inserir usuário:", error.message);
          return;
      }
      console.log(`Usuário "${usuario}" inserido com ID: ${this.lastID}`);
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
  insert_home: insert_home,
  insert_login: insert_login
  }
 
