const { db } = require('./database');

function executeQuery(query) {
    return new Promise((resolve, reject) => {
        db.all(query, [], (error, rows) => {
            if (error) {
                reject(error);
            } else {
                resolve(rows);
            }
        });
    });
}
/* tag home */
/* 1 */const home = `SELECT * FROM home;`  
/* tag adoção*/
/* 2 */const adocao= `SELECT * FROM adocao;`  //Mostrar pets para adotar
 /* 3 */ const  adocaoCount = `SELECT COUNT (*) FROM adocao;`

/* 4 */     const adotante = `SELECT * FROM adotante;`
/* 5 */const adotanteCount = `SELECT COUNT (*) FROM adotante;` //Mostrar quantidade de adotantes

/* 6 */const adotado = `SELECT * FROM adotado;`
/* 7 */  const adotadoCount =  `SELECT COUNT (*) FROM adotado;`
/* tag castracao */
 /* 8 */        const castracao = `SELECT * FROM castracao;`//Leitura da castração
/* 9 */const castracaoCount = `SELECT COUNT(*) FROM castracao;`//Conatgem de castração
/* tag procura_se */
/* 10 */const procura_se = `SELECT * FROM procura_se;`
 /* 11 */    const  procura_seCount=  `SELECT  COUNT (*)  FROM procura_se;`
/* tag parceria */
/* 12 */const parceria = `SELECT * FROM parceria;`
  /* 13 */      const parceriaCount =  `SELECT  COUNT (*) FROM parceria;`






async function executeAllQueries() {
    const queries = [
        { name: 'home', query: home },
        { name: 'adocao', query: adocao },
        { name: 'adocaoCount', query: adocaoCount },
        { name: 'adotante', query: adotante },
        { name: 'adotanteCount', query: adotanteCount },        
        { name: 'adotado', query: adotado },
        { name: 'adotadoCount', query: adotadoCount },
        { name: 'castracao', query: castracao },
        { name: 'castracaoCount', query: castracaoCount },
        { name: 'procura_se', query: procura_se },
        { name: 'procura_seCount', query: procura_seCount },        
        { name: 'parceria', query: parceria },
        { name: 'parceriaCount', query: parceriaCount }       
        ];

    const results = {};
    for (const { name, query } of queries) {
        try {
            results[name] = await executeQuery(query);
        } catch (error) {
            results[name] = { error: error.message };
        }
    }

    return results;
}

// Execute all queries and log the results
executeAllQueries()
    .then(results => {
        results,
        console.log('Todas as TABELAS funcionando.. ')
    })
    .catch(error => {
        console.error('Erro nas  QUERIES das TABELAS SQL:', error);
    }); 
    
    module.exports = {
       executeAllQueries             
    };
