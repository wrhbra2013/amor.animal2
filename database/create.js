 // /home/wander/amor.animal2/database/create.js
 const { getPool } = require('./database'); // Assumes database.js is in the same directory
 
 /**
  * Helper function to execute a DDL query.
  * @param {string} ddlQuery - The DDL query string.
  * @param {string} tableName - Name of the table for logging.
  */
 async function executeDDL(ddlQuery, tableName) {
     const pool = getPool();
     if (!pool) {
         throw new Error(`Pool não está disponível para criar/verificar tabela ${tableName}`);
     }
     let conn;
     try {
         conn = await pool.getConnection();
         await conn.query(ddlQuery);
         console.log(`Tabela: ${tableName} (MariaDB) verificada/criada com sucesso.`);
     } catch (error) {
         console.error(`Erro ao criar/verificar tabela ${tableName} (MariaDB):`, error.message);
         throw error; // Re-throw para que o chamador possa lidar com o erro
     } finally {
         if (conn) conn.release();
     }
 }
 
 // --- Table Creation Functions ---
 
 async function create_adocao() {
     const ddl = `CREATE TABLE IF NOT EXISTS adocao (
         id INT PRIMARY KEY AUTO_INCREMENT,
         arquivo VARCHAR(255), /* MODIFICADO DE BLOB PARA VARCHAR(255) */
         nome VARCHAR(255),
         idade INT,
         especie VARCHAR(100),
         porte VARCHAR(50),
         caracteristicas TEXT,
         tutor VARCHAR(255),
         contato VARCHAR(100),
         whatsapp VARCHAR(20),
         origem DATETIME DEFAULT CURRENT_TIMESTAMP
     );`;
     await executeDDL(ddl, 'adocao');
 }
 
 async function create_adotante() {
     const ddl = `CREATE TABLE IF NOT EXISTS adotante (
         id INT PRIMARY KEY AUTO_INCREMENT,
         origem DATETIME DEFAULT CURRENT_TIMESTAMP,
         q1 INT,
         q2 INT,
         q3 INT,
         qTotal INT,
         nome VARCHAR(255),
         contato VARCHAR(100),
         whatsapp VARCHAR(20),
         cep VARCHAR(10),
         endereco VARCHAR(255),
         numero VARCHAR(20), /* Pode incluir letras como '10A', 'S/N' */
         complemento VARCHAR(100),
         bairro VARCHAR(100),
         cidade VARCHAR(100),
         estado VARCHAR(50),
         idPet INT, /* Removido NOT NULL para permitir cadastro de adotante sem pet inicialmente, se necessário. Adicione se for obrigatório. */
         FOREIGN KEY (idPet) REFERENCES adocao (id) ON DELETE SET NULL ON UPDATE CASCADE /* Ajuste ON DELETE conforme a lógica de negócio */
     );`;
     await executeDDL(ddl, 'adotante');
 }
 
 async function create_adotado() {
     const ddl = `CREATE TABLE IF NOT EXISTS adotado (
         id INT PRIMARY KEY AUTO_INCREMENT,
         origem DATETIME DEFAULT CURRENT_TIMESTAMP,
         arquivo VARCHAR(255), /* MODIFICADO DE BLOB PARA VARCHAR(255) */
         pet VARCHAR(255),
         tutor VARCHAR(255),
         historia TEXT
     );`;
     await executeDDL(ddl, 'adotado');
 }
 
 async function create_castracao() {
     // MariaDB não suporta random() diretamente em DEFAULT para 'ticket'.
     // O ticket deve ser gerado pela aplicação ou um trigger.
     // Aqui, 'ticket' será um VARCHAR que pode ser UNIQUE se necessário.
     const ddl = `CREATE TABLE IF NOT EXISTS castracao (
         id INT PRIMARY KEY AUTO_INCREMENT,
         origem DATETIME DEFAULT CURRENT_TIMESTAMP,
         ticket VARCHAR(50) UNIQUE, 
         nome VARCHAR(255),
         contato VARCHAR(100),
         whatsapp VARCHAR(20),
         arquivo VARCHAR(255), /* MODIFICADO DE BLOB PARA VARCHAR(255) */
         idade INT,
         especie VARCHAR(100),
         porte VARCHAR(50),
         clinica VARCHAR(255),
         agenda VARCHAR(255) /* Considere DATETIME se for uma data/hora específica */
     );`;
     await executeDDL(ddl, 'castracao');
 }
 
 async function create_procura_se() {
     const ddl = `CREATE TABLE IF NOT EXISTS procura_se (
         id INT PRIMARY KEY AUTO_INCREMENT,
         origem DATETIME DEFAULT CURRENT_TIMESTAMP,
         arquivo VARCHAR(255), /* MODIFICADO DE BLOB PARA VARCHAR(255) */
         nomePet VARCHAR(255),
         idadePet VARCHAR(50), /* Pode ser "filhote", "2 anos", etc. */
         especie VARCHAR(100),
         porte VARCHAR(50),
         caracteristicas TEXT,
         local VARCHAR(255),
         tutor VARCHAR(255),
         contato VARCHAR(100),
         whatsapp VARCHAR(20)
     );`;
     await executeDDL(ddl, 'procura_se');
 }
 
 async function create_parceria() {
     const ddl = `CREATE TABLE IF NOT EXISTS parceria (
         id INT PRIMARY KEY AUTO_INCREMENT,
         origem DATETIME DEFAULT CURRENT_TIMESTAMP,
         empresa VARCHAR(255),
         localidade VARCHAR(255),
         proposta TEXT,
         representante VARCHAR(255),
         telefone VARCHAR(20),
         whatsapp VARCHAR(20),
         email VARCHAR(255)
     );`;
     await executeDDL(ddl, 'parceria');
 }
 
 async function create_home() {
     const ddl = `CREATE TABLE IF NOT EXISTS home (
         id INT PRIMARY KEY AUTO_INCREMENT,
         origem DATETIME DEFAULT CURRENT_TIMESTAMP,
         arquivo VARCHAR(255), /* MODIFICADO DE BLOB PARA VARCHAR(255) */
         titulo VARCHAR(255),
         mensagem TEXT,
         link VARCHAR(2083) /* Padrão para URLs */
     );`;
     await executeDDL(ddl, 'home');
 }

 async function create_login() {
    const ddl = `CREATE TABLE IF NOT EXISTS login (
        id INT PRIMARY KEY AUTO_INCREMENT,
        usuario VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        isAdmin BOOLEAN DEFAULT FALSE,
        origem DATETIME DEFAULT CURRENT_TIMESTAMP
    );`;
    await executeDDL(ddl, 'login');
}
 async function create_admin_user() {
    const pool = getPool();
    if (!pool) {
        console.error("Pool não está disponível para criar usuário admin.");
        return; // Or throw an error
    }
    let conn;
    try {
        conn = await pool.getConnection();
        // Check if admin user already exists
        const rows = await conn.execute('SELECT usuario FROM login WHERE usuario = ?', ['@admin']);
        if (rows && rows.length ===0) {
           
            const insertSQL = `INSERT INTO login (usuario, senha, isAdmin) VALUES (?, ?, ?);`;
            await conn.execute(insertSQL, ['@admin', '@admin', true]);
            // --- END TEMPORARY INSECURE INSERT ---

            console.log("Usuário padrão '@admin' criado com sucesso.");
        } else {
            console.log("Usuário padrão '@admin' já existe.");
        }
    } catch (error) {
        console.error("Erro ao criar usuário admin:", error.message);
        // Log the full error for more details
        // console.error(error);
        // Decide if this error should be fatal or just logged
    } finally {
        if (conn) conn.release();
    }
}


 
 /**
  * Função para inicializar todas as tabelas do banco de dados.
  * Chame esta função durante a inicialização da sua aplicação.
  */
 async function initializeDatabaseTables() {
        try {
         await create_adocao();
         await create_adotante(); // Depende de 'adocao' se a FK for restritiva na criação
         await create_adotado();
         await create_castracao();
         await create_procura_se();
         await create_parceria();
         await create_home();
         await create_login();
         await create_admin_user();
         console.log("Criação/verificação de todas as tabelas concluída com sucesso.");
     } catch (error) {
         console.error("Erro fatal durante a inicialização das tabelas:", error.message);
         // Em um ambiente de produção, você pode querer encerrar a aplicação se as tabelas
         // forem críticas para o funcionamento.
         // process.exit(1);
         throw error; // Propagar o erro para que a aplicação principal possa decidir como lidar
     }
 }
 
 module.exports = {
     create_home,
     create_adocao,
     create_adotante,
     create_adotado,
     create_castracao,
     create_procura_se,
     create_parceria,
     create_login,
     initializeDatabaseTables // Exporta a função orquestradora
 };
 
