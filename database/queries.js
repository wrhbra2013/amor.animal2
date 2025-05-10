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
/* 1 */const sqlHome = `SELECT * FROM home;`  
/* tag adoção*/
/* 2 */const query_adocao= `SELECT * FROM adocao;`  //Mostrar pets para adotar
/* 3 */const query_adotante = `SELECT COUNT (*) FROM adotante;` //Mostrar quantidade de adotantes
/* 4 */const query_adotado = `SELECT * FROM adotado;`
/* tag castracao */
/* 5 */const query_castracao = `SELECT COUNT(*) FROM castracao;`//Conatgem de castração
/*6 */const sql_castracao = `SELECT * FROM castracao;`//Leitura da castração
/* tag procura_se */
/* 7 */const query_procura_se = `SELECT * FROM procura_se;`
/* tag parceria */
/* 8 */const query_parceria = `SELECT * FROM parceria;`
/* 9 */ const sql_adotante = `SELECT * FROM adotante;`




async function executeAllQueries() {
    const queries = [
        { name: 'home', query: sqlHome },
        { name: 'adocao', query: query_adocao },
        { name: 'adotante', query: query_adotante },
        { name: 'adotado', query: query_adotado },
        { name: 'castracao', query: query_castracao },
        { name: 'sql_castracao', query: sql_castracao },
        { name: 'procura_se', query: query_procura_se },
        { name: 'parceria', query: query_parceria },
        { name: 'sql_adotante', query: sql_adotante }
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
        console.error('Erro nas TABELAS SQL:', error);
    }); 
    
    module.exports = {
       executeAllQueries             
    };
