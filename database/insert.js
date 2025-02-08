
 function insert_adocao(arquivo, nome, idade, especie, porte, caracteristicas, tutor ,contato) {
  const insert =  `INSERT INTO adocao (
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
                            $(arquivo), 
                            $(nome), 
                            $(idade), 
                            $(especie), 
                            $(porte),
                            $(caracteristicas), 
                            $(tutor), 
                            $(contato)
                              ))`;
                             return ("Inserindo dados", insert);
                             };

 module.exports = {
  insert_adocao: insert_adocao
 }