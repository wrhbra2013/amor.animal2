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

function insert_castracao(nome, contato, arquivo, idade, especie, porte, observacoes){
  const insert = `INSERT INTO castracao(
   ticket,
   origem,
  nome,
  contato,
  arquivo, 
  idade,
  especie,
  porte,
  observacoes            
  ) 
   VALUES (  ABS(RANDOM()) % 10000, strftime('%d/%m/%Y'), ?, ?, ?, ?, ?, ?, ?
  );`
  const values = [ `${nome}`,`${contato}`,`${arquivo}`, `${idade}`, `${especie}`,`${porte}`,`${observacoes}`];  
  
  db.run( insert,  values,  error => {
    if (error)  return console.log(error)   
      console.log("Dados de castração INSERIDO.")
    });
};


module.exports = {
  insert_adocao: insert_adocao,
  insert_castracao: insert_castracao
}