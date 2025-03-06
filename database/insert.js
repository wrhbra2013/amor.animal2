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
                              contato
                              ) VALUES  (?,?,?,?,?,?,?,?);`
const values =  [ `${arquivo}`,` ${nome}`, `${idade}`,`${especie}`,` ${porte}`, `${caracteristicas}`, `${tutor}`, `${contato}`]
                              
const  sql = db.run(insert, values,  error => {
      if (error)  return console.log(error)   
        console.log("Dados de castração INSERIDO.")
      });
 return sql;
};

function insert_castracao(nome, contato, arquivo, idade, especie, porte, observacoes){
  const random = 'SELECT ABS(RANDOM() % 10000);'
  
  const insert = `INSERT INTO castracao (
  ticket,
  nome,
  contato,
  arquivo, 
  idade,
  especie,
  porte,
  observacoes            
  )VALUES ( ?, ?, ?, ?, ?, ?, ?, ?
  );`
  const values = [ `${random}`,`${nome}`,`${contato}`,`${arquivo}`, `${idade}`, `${especie}`,`${porte}`,`${observacoes}`];
  const  sql = db.run(random, insert, values,  error => {
    if (error)  return console.log(error)   
      console.log("Dados de castração INSERIDO.")
    });
return sql;
};


module.exports = {
  insert_adocao: insert_adocao,
  insert_castracao:insert_castracao
}