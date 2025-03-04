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
                              
    return db.run(insert, values,  error => {
      if (error)  return console.log(error)   
        console.log("Dados de adoção INSERIDO.")
      });
 
};




module.exports = {
  insert_adocao: insert_adocao
}