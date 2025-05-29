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
         console.log(`Tentando conectar ao servidor MariaDB para verificar/criar o banco de dados '${dbConfig.databaseName}'...`);
         dbCreationConnection = await mariadb.createConnection({
             host: dbConfig.host,
             user: dbConfig.user,
             password: dbConfig.password,
             // connectTimeout: 10000 // Optional: increase connection timeout for this step if needed
         });
         console.log("Conectado ao servidor MariaDB com sucesso (para criação do BD).");
 
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
             console.log("Conexão para criação do banco de dados fechada.");
         }
     }
 
     // Step 2: Create the connection pool for the application
     try {
         console.log(`Criando pool de conexões para o banco de dados '${dbConfig.databaseName}'...`);
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
         console.log(`Pool de conexões para '${dbConfig.databaseName}' criado e conexão de teste bem-sucedida!`);
         await conn.release();
 
         console.log("Pool de conexões MariaDB inicializado com sucesso.");
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
 