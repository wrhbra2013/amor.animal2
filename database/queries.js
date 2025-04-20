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
/* 2 */const query_adocao= `SELECT COUNT(*) FROM adocao;` 
/* 3 */const query_adotante = `SELECT COUNT(*) FROM adotante;`
/* 4 */const query_adotado = `SELECT COUNT(*) FROM adotado;`
/* tag castracao */
/* 5 */const query_castracao = `SELECT COUNT(*) FROM castracao;`
/* tag procura_se */
/* 6 */const query_procura_se = `SELECT COUNT(*) FROM procura_se;`
/* tag parceria */
/* 7 */const query_parceria = `SELECT * FROM parceria;`

async function executeAllQueries() {
    const queries = [
        { name: 'home', query: sqlHome },
        { name: 'adocao', query: query_adocao },
        { name: 'adotante', query: query_adotante },
        { name: 'adotado', query: query_adotado },
        { name: 'castracao', query: query_castracao },
        { name: 'procura_se', query: query_procura_se },
        { name: 'parceria', query: query_parceria },
        
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
        console.log('Results:', results);
    })
    .catch(error => {
        console.error('Error executing queries:', error);
    }); 
    
    module.exports = {
       executeAllQueries             
    };
