
 function insertPet(arquivo, nome, idade, especie, porte, caracteristicas, tutor ,contato) {
  const insert =  `INSERT INTO cadastroPet (
                            id,
                            arquivo,  
                            nome, 
                            idade, 
                            especie, 
                            porte,
                            caracteristicas, 
                            tutor, 
                            contato,
                            origem ) VALUES  ( 
                            arquivo, 
                            nome, 
                            idade, 
                            especie, 
                            porte,
                            caracteristicas, 
                            tutor, 
                            contato
                              ))`;
                             return ("Inserindo dados", insert);
 };

 module.exports = {
  insertPet: insertPet
 }