const {db} = require('./database');



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
                              ) VALUES  ( 
                              ?, ?, ?, ?, ?, ?, ?, ?)` {`${arquivo}`, `${nome}`,`${idade}`,`${especie}`, `${porte}`, `${caracteristicas}`, `${tutor}`, `${contato}`}
  db.run(insert,  error => {
    if (error) {
      return console.log(error.message)
    }
    console.log("Dados de adoção INSERIDO.")}
  )};

module.exports = {
  insert_adocao: insert_adocao
}