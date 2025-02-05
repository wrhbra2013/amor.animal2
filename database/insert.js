
 function insertPet(imagem, nome, idade, especie, caracteristicas, tutor ,contato) {
  return  `INSERT INTO cadastroPet (
                            imagem,  
                            nome, 
                            idade, 
                            especie, 
                            porte,
                            caracteristicas, 
                            tutor, 
                            contato) VALUES  (
                            imagem, 
                            nome, 
                            idade, 
                            especie, 
                            porte,
                            caracteristicas, 
                            tutor, 
                            contato
                             )`;
 };

 module.exports = {
  insertPet: insertPet
 }