 // /home/wander/amor.animal2/database/database.js
  const mariadb = require('mariadb');
 
 // Database configuration - consider using environment variables for sensitive data
 const dbConfig = {
     host: process.env.DB_HOST || '0.0.0.0',
     user: process.env.DB_USER || 'root',
     password: process.env.DB_PASSWORD || 'W@nd3r2405',
     port: process.env.DB_PORT || 3306, // Default MariaDB port     
     databaseName: process.env.DB_NAME || 'espelho', // The NAME of your database
     connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 5,
     // charset: 'utf8mb4' // Recommended for full Unicode support
 };
 
 let pool; // Variable to store the connection pool
 
 /**
  * Initializes the database (creates if it doesn't exist) and then the connection pool.
  * This function should be called once during your application's startup.
  */
 async function initializePool() {
     if (pool) {
         console.log("Pool de conexões já foi inicializado.");
         return pool;
     }
 
     // Step 1: Connect to MariaDB server to create the database if it doesn't exist
     let dbCreationConnection;
     try {
         dbCreationConnection = await mariadb.createConnection({
             host: dbConfig.host,
             user: dbConfig.user,
             password: dbConfig.password,
             // connectTimeout: 10000 // Optional: increase connection timeout for this step if needed
         });
       
 
         await dbCreationConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
         console.log(`Banco de dados '${dbConfig.databaseName}' verificado/criado com sucesso.`);
 
     } catch (err) {
         console.error(`Erro durante a criação/verificação do banco de dados '${dbConfig.databaseName}':`, err.message);
         // Log the full error for more details, especially connection errors
         // console.error(err);
         throw new Error(`Falha ao configurar o banco de dados: ${err.message}`);
     } finally {
         if (dbCreationConnection) {
             await dbCreationConnection.end();
           
         }
     }
 
     // Step 2: Create the connection pool for the application
     try {
         
         pool = mariadb.createPool({
             host: dbConfig.host,
             user: dbConfig.user,
             password: dbConfig.password,
             database: dbConfig.databaseName, // Connect to the specific database
             connectionLimit: dbConfig.connectionLimit,
             // connectTimeout: 10000 // Optional: set a connection timeout for pool connections
             // charset: dbConfig.charset
         });
 
         // Test the pool by acquiring a connection
         const conn = await pool.getConnection();
         
         await conn.release();
 
         
         return pool;
     } catch (err) {
         console.error(`Erro ao criar o pool de conexões para '${dbConfig.databaseName}':`, err.message);
         // Log the full error for more details
         // console.error(err);
         pool = null;
         throw new Error(`Falha ao criar o pool de conexões: ${err.message}`);
     }
 }
 
 /**
  * Returns the initialized connection pool.
  * Throws an error if the pool has not been initialized.
  */
 function getPool() {
       if (!pool) {
         throw new Error("Pool de conexões não inicializado. Chame initializePool() na inicialização do app.");
     }
     return pool;
 }
 
 module.exports = {
     initializePool, // Call this in index.js at startup
     getPool: getPool
 };
 




//Configurações para Google cloud
//  // /home/wander/amor.animal2/database/database.js
//  const mariadb = require('mariadb');
 
//  // Configuração do banco de dados para Google Cloud SQL (MariaDB)
//  // Estas variáveis devem ser definidas no seu ambiente Google Cloud
//  // (ex: app.yaml para App Engine, variáveis de ambiente para Cloud Run).
//  const dbConfig = {
//      user: process.env.DB_USER, // Ex: 'root' ou seu usuário específico do banco
//      password: process.env.DB_PASSWORD, // A senha para o DB_USER
//      databaseName: process.env.DB_NAME, // O nome do seu banco de dados no Cloud SQL
//      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 5,
 
//      // Para Google Cloud SQL, você tipicamente se conectará via:
//      // 1. Socket Unix (recomendado para App Engine Standard, Cloud Run com proxy sidecar)
//      //    O caminho do socket é geralmente no formato: /cloudsql/SEU_PROJECT_ID:SUA_REGIAO:SUA_INSTANCIA
//      socketPath: process.env.DB_SOCKET_PATH, // Ex: /cloudsql/meu-projeto:us-central1:minha-instancia
 
//      // 2. TCP (se usando o Cloud SQL Proxy encaminhando para uma porta TCP local,
//      //    ou conectando via IP público/privado - menos comum para apps em PaaS).
//      host: process.env.DB_HOST, // Ex: '127.0.0.1' se o proxy encaminha para TCP local, ou o IP da instância.
//      port: parseInt(process.env.DB_PORT, 10) || 3306, // Porta para conexão TCP.
     
//      // charset: 'utf8mb4' // Recomendado para suporte completo a Unicode
//  };
 
//  let pool; // Variável para armazenar o pool de conexões
 
//  /**
//   * Inicializa o banco de dados (cria se não existir) e então o pool de conexões.
//   * Esta função deve ser chamada uma vez durante a inicialização da sua aplicação.
//   */
//  async function initializePool() {
//      if (pool) {
//          console.log("Pool de conexões já foi inicializado.");
//          return pool;
//      }
 
//      // Configuração de conexão para criar o banco de dados (se não existir)
//      // Esta conexão não especifica um 'database' inicialmente.
//      const dbCreationConnectionOptions = {
//          user: dbConfig.user,
//          password: dbConfig.password,
//          // connectTimeout: 10000 // Opcional: tempo limite de conexão
//          // charset: dbConfig.charset
//      };
 
//      if (dbConfig.socketPath) {
//          dbCreationConnectionOptions.socketPath = dbConfig.socketPath;
//          console.log(`[DB] Tentando conexão para criação de DB via socket: ${dbConfig.socketPath}`);
//      } else if (dbConfig.host) {
//          dbCreationConnectionOptions.host = dbConfig.host;
//          dbCreationConnectionOptions.port = dbConfig.port;
//          console.log(`[DB] Tentando conexão para criação de DB via TCP: ${dbConfig.host}:${dbConfig.port}`);
//      } else {
//          console.error("[DB] Configuração de conexão de banco de dados incompleta: DB_SOCKET_PATH ou DB_HOST deve ser definido.");
//          throw new Error("Configuração de conexão de banco de dados incompleta. Defina DB_SOCKET_PATH (preferencial) ou DB_HOST.");
//      }
 
//      // Passo 1: Conectar ao servidor MariaDB para criar o banco de dados se ele não existir
//      let dbCreationConnection;
//      try {
//          dbCreationConnection = await mariadb.createConnection(dbCreationConnectionOptions);
//          await dbCreationConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
//          console.log(`[DB] Banco de dados '${dbConfig.databaseName}' verificado/criado com sucesso.`);
//      } catch (err) {
//          console.error(`[DB] Erro durante a criação/verificação do banco de dados '${dbConfig.databaseName}':`, err.message);
//          // console.error(err); // Para depuração, logue o erro completo
//          throw new Error(`Falha ao configurar o banco de dados: ${err.message}`);
//      } finally {
//          if (dbCreationConnection) {
//              await dbCreationConnection.end();
//          }
//      }
 
//      // Passo 2: Criar o pool de conexões para a aplicação, agora especificando o banco de dados
//      const poolOptions = {
//          user: dbConfig.user,
//          password: dbConfig.password,
//          database: dbConfig.databaseName, // Conectar ao banco de dados específico
//          connectionLimit: dbConfig.connectionLimit,
//          // charset: dbConfig.charset
//      };
 
//      if (dbConfig.socketPath) {
//          poolOptions.socketPath = dbConfig.socketPath;
//      } else if (dbConfig.host) { // Reutiliza a lógica de fallback para TCP
//          poolOptions.host = dbConfig.host;
//          poolOptions.port = dbConfig.port;
//      }
//      // Não precisa de 'else' aqui, pois a verificação crítica já foi feita acima.
 
//      try {
//          pool = mariadb.createPool(poolOptions);
 
//          // Testar o pool adquirindo uma conexão
//          const conn = await pool.getConnection();
//          console.log(`[DB] Pool de conexões para '${dbConfig.databaseName}' criado e testado com sucesso.`);
//          await conn.release();
//          return pool;
//      } catch (err) {
//          console.error(`[DB] Erro ao criar o pool de conexões para '${dbConfig.databaseName}':`, err.message);
//          // console.error(err); // Para depuração, logue o erro completo
//          pool = null; // Garante que o pool seja nulo em caso de falha
//          throw new Error(`Falha ao criar o pool de conexões: ${err.message}`);
//      }
//  }
 
//  /**
//   * Retorna o pool de conexões inicializado.
//   * Lança um erro se o pool não tiver sido inicializado.
//   */
//  function getPool() {
//      if (!pool) {
//          throw new Error("Pool de conexões não inicializado. Chame initializePool() na inicialização do app.");
//      }
//      return pool;
//  }
 
//  module.exports = {
//      initializePool, // Chame isso no index.js na inicialização
//      getPool
//  };
 
