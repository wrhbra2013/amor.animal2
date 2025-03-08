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
        console.log("Dados de adoção INSERIDO.")
      });
 return sql;
};

function insert_castracao(nome, contato, arquivo, idade, especie, porte, observacoes){
  const random = 'SELECT ABS(RANDOM() % 10000);'
  const sql2 = db.run(random);
  console.log(sql2)
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
  const values = [ `${sql2}`,`${nome}`,`${contato}`,`${arquivo}`, `${idade}`, `${especie}`,`${porte}`,`${observacoes}`];
  const  sql = db.run( insert, values,  error => {
    if (error)  return console.log(error)   
      console.log("Dados de castração INSERIDO.")
    });
return sql2, sql;
};


module.exports = {
  insert_adocao: insert_adocao,
  insert_castracao:insert_castracao
}