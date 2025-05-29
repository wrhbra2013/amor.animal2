 // /home/wander/amor.animal2/database/queries.js
 const { getPool } = require('./database');
 
 /**
  * Executes a given SQL query using the connection pool.
  * @param {string} query - The SQL query string.
  * @param {Array<any>} [params=[]] - An optional array of parameters for prepared statements.
  * @returns {Promise<Array<object>>} - A promise that resolves to an array of rows.
  * @throws {Error} - Throws an error if the query execution fails or the pool is unavailable.
  */
 async function executeQuery(query, params = []) {
     const pool = getPool();
     if (!pool) {
         console.error("Database pool is not available in executeQuery.");
         throw new Error("Database pool is not available.");
     }
     try {
         // pool.execute handles connection acquisition and release for a single query
         const [rows] = await pool.execute(query, params);
         return rows;
     } catch (error) {
         console.error(`Error executing query: "${query}" with params: ${JSON.stringify(params)}`, error.message);
         // Para depuração mais detalhada, você pode descomentar o log abaixo:
         // console.error("Full error object:", error);
         throw error; // Re-throw the error to be handled by the caller
     }
 }
 
 /*
   Definições das Queries SQL
   Nota: Usar `SELECT *` pode ser conveniente, mas para produção e clareza,
   é geralmente melhor listar explicitamente as colunas que você precisa.
   No entanto, manterei `SELECT *` conforme o arquivo original fornecido,
   assumindo que a intenção é obter todas as colunas mais a formatada.
 */
 
 /* tag home */
 const home = `SELECT *, DATE_FORMAT(origem, '%d %m %Y %H:%i') AS origem_formatada FROM home;`;
 /* tag adoção*/
 const adocao = `SELECT *, DATE_FORMAT(origem, '%d %m %Y %H:%i') AS origem_formatada FROM adocao;`;
 const adocaoCount = `SELECT COUNT(*) AS count FROM adocao;`;
 
 /* tag adotante */
 const adotante = `SELECT *, DATE_FORMAT(origem, '%d %m %Y %H:%i') AS origem_formatada FROM adotante;`;
 const adotanteCount = `SELECT COUNT(*) AS count FROM adotante;`;
 
 /* tag adotado */
 const adotado = `SELECT *, DATE_FORMAT(origem, '%d %m %Y %H:%i') AS origem_formatada FROM adotado;`;
 const adotadoCount = `SELECT COUNT(*) AS count FROM adotado;`;
 
 /* tag castracao */
 const castracao = `SELECT *, DATE_FORMAT(origem, '%d %m %Y %H:%i') AS origem_formatada FROM castracao;`;
const castracaoCount = `SELECT COUNT(*) AS count FROM castracao;`;
 
 /* tag procura_se */
 const procura_se = `SELECT *, DATE_FORMAT(origem, '%d %m %Y %H:%i') AS origem_formatada FROM procura_se;`;
 const procura_seCount = `SELECT COUNT(*) AS count FROM procura_se;`;
 
 /* tag parceria */
 const parceria = `SELECT *, DATE_FORMAT(origem, '%d %m %Y %H:%i') AS origem_formatada FROM parceria;`;
 const parceriaCount = `SELECT COUNT(*) AS count FROM parceria;`;
 
 
 /**
  * Executes all predefined queries and collects their results.
  * Intended for an overview or initial data check.
  * @returns {Promise<object>} - A promise that resolves to an object where keys are query names
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
         { name: 'parceriaCount', query: parceriaCount }
     ];
 
     const results = {};
     // Use Promise.all to execute queries concurrently
     const promises = queryTasks.map(async (task) => {
         try {
             const data = await executeQuery(task.query);
             results[task.name] = data;
         } catch (error) {
             console.error(`Erro ao executar a query '${task.name}':`, error.message);
             results[task.name] = { error: error.message }; // Store error info
         }
     });
 
     // Wait for all promises to settle (either fulfill or reject)
     await Promise.all(promises);
 
     // Retorna um objeto com os resultados nomeados
     // return results; // Retorna o objeto com chaves nomeadas
 
     // Se a intenção é retornar um array de resultados, o código original estava incorreto.
     // O código original tentava retornar Object.values(results) mas o loop for...of
     // não esperava as promises.
     // Se a intenção é retornar um array, você precisaria coletar os resultados
     // de outra forma, talvez assim:
    //  const resultArray = await Promise.all(queryTasks.map(async (task) => {
    //      try {
    //          const data = await executeQuery(task.query);
    //          return { [task.name]: data }; // Retorna um objeto com a chave e o valor
    //      } catch (error) {
    //          console.error(`Erro ao executar a query '${task.name}':`, error.message);
    //          return { [task.name]: { error: error.message } };
    //      }
    //  }));
     // return resultArray.reduce((acc, curr) => ({ ...acc, ...curr }), {}); // Combina os objetos em um só
 
     // Mantendo a estrutura original de retorno de um objeto nomeado, que parece ser o que a rota /home espera.
     console.log('Results das queries',results)
     return results;
     
 }
 
 /*
  * Executes all predefined queries and collects their results.
  * Intended for an overview or initial data check.
  * @returns {Promise<object>} - A promise that resolves to an object where keys are query names
  *                              and values are either the query results or an error object
     
    
     }
       
     return Object.values(results);
     
 }
 
 // A seção comentada para execução automática no carregamento do módulo é mantida como estava (comentada).
 // É uma boa prática não ter efeitos colaterais significativos (como chamadas de DB)
 // apenas ao importar um módulo.
 /*
  if (process.env.NODE_ENV !== 'test') {
      executeAllQueries()
          .then(results => {
              let allOk = true;
              for (const key in results) {
                  if (results[key] && results[key].error) {
                      allOk = false;
                      console.error(`Erro na query de verificação '${key}': ${results[key].error}`);
                  }
              }
              if (allOk) {
                  console.log('Verificação inicial das queries: Todas as queries executadas (algumas podem ter retornado vazio, o que é normal).');
              } else {
                  console.warn('Verificação inicial das queries: Algumas queries falharam. Verifique os logs acima.');
              }
          })
          .catch(error => {
              console.error('Erro geral durante a execução de todas as queries de verificação:', error);
          });
  }
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
         parceriaCount
     }
 };
 