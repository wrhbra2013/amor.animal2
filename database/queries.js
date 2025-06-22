 // /home/wander/amor.animal2/database/queries.js
 const {db} = require('./database');
 
//  /**
//   * Executes a given SQL query using the connection pool.
//   * @param {string} query - The SQL query string.
//   * @param {Array<any>} [params=[]] - An optional array of parameters for prepared statements.
//   * @returns {Promise<Array<object>>} - A promise that resolves to an array of rows.
//   * @throws {Error} - Throws an error if the query execution fails or the pool is unavailable.
//   */
 async function executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                console.error(`Error executing query: "${query}" with params: ${JSON.stringify(params)}`, err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}
 
 /*
   Definições das Queries SQL
   Nota: Usar `SELECT *` pode ser conveniente, mas para produção e clareza,
   é geralmente melhor listar explicitamente as colunas que você precisa.
   No entanto, manterei `SELECT *` conforme o arquivo original fornecido,
   assumindo que a intenção é obter todas as colunas mais a formatada.
 */
 
 // As funções de formatação de data precisam ser tratadas no nível da aplicação ou usar funções SQLite como strftime.
 // Para simplificar e manter a compatibilidade com as colunas existentes, vamos apenas selecionar *
 // e formatar a data no backend se necessário.
 
 /* tag home */
 const home = `SELECT * FROM home;`;
 /* tag adoção*/
 const adocao = `SELECT * FROM adocao;`;
 const adocaoCount = `SELECT COUNT(*) AS count FROM adocao;`;
 
 /* tag adotante */
 const adotante = `SELECT * FROM adotante;`;
 const adotanteCount = `SELECT COUNT(*) AS count FROM adotante;`;
 
 /* tag adotado */
 const adotado = `SELECT * FROM adotado;`;
 const adotadoCount = `SELECT COUNT(*) AS count FROM adotado;`;
 
 /* tag castracao */
 const castracao = `SELECT * FROM castracao;`;
 const castracaoCount = `SELECT COUNT(*) AS count FROM castracao;`;
 
 /* tag procura_se */
 const procura_se = `SELECT * FROM procura_se;`;
 const procura_seCount = `SELECT COUNT(*) AS count FROM procura_se;`;
 
 /* tag parceria */
 const parceria = `SELECT * FROM parceria;`;
 const parceriaCount = `SELECT COUNT(*) AS count FROM parceria;`;
 
// tag doação
const voluntario = `SELECT * FROM voluntario;`;
const voluntarioCount = `SELECT COUNT(*) AS count FROM voluntario;`;

const coleta = 'SELECT  * FROM coleta;';
const coletaCount = `SELECT COUNT(*) AS count FROM coleta;`;
 
 /**
  * Executes all predefined queries and collects their results.
  * Intended for an overview or initial data check.
  //   * A promise that resolves to an object where keys are query names
  *                              and values are either the query results or an error object.
  */
 async function executeAllQueries() {
     // Renomeado 'queries' para 'queryTasks' para evitar conflito com o objeto 'queries' exportado.
     const queryTasks = [
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
         { name: 'parceriaCount', query: parceriaCount },
         { name: 'voluntario', query: voluntario },
         { name: 'voluntarioCount', query: voluntarioCount },
         { name: 'coleta', query: coleta },
         { name: 'coletaCount', query: coletaCount }

     ];
     const results = {};
     // Use Promise.all to execute queries concurrently
   // /home/wander/amor.animal2/database/queries.js
   // ...
       await Promise.all(queryTasks.map(async (task) => {
           try {
               const data = await executeQuery(task.query);
               results[task.name] = data;
           } catch (error) {
               console.error(`Erro ao executar a query '${task.name}':`, error.message);
               // results.task.name = { error: error.message }; // Linha original com erro
               results[task.name] = { error: error.message }; // Correção
           }
       }));
   // ...
   
 
     // Retorna um objeto com os resultados nomeados
     
     return results;
 }
 
 /*
  * Executes all predefined queries and collects their results.
  * Intended for an overview or initial data check.
  * @returns {Promise<object>} - A promise that resolves to an object where keys are query names
  *                              and values are either the query results or an error object
     
 */
 module.exports = {
     executeQuery,
     executeAllQueries,
     queries: { // Exportando as strings de query brutas, caso sejam necessárias em outro lugar
         home,
         adocao,
         adocaoCount,
         adotante,
         adotanteCount,
         adotado,
         adotadoCount,
         castracao,
         castracaoCount,
         procura_se,
         procura_seCount,
         parceria,
         parceriaCount,
         voluntario,
         voluntarioCount, 
         coleta, 
         coletaCount
     }
 };
 