const { pool } = require('./database');
 
 async function executeDDL(ddlQuery, tableName) {
  return new Promise((resolve, reject) => {    
       pool.query(ddlQuery, (err) => {
       
       if (err) {
         console.error(`Erro ao criar/verificar tabela ${tableName} (PostgreSQL):`, err.message);
         reject(err);
       } else {
        //  console.log(`Tabela: ${tableName} (PostgreSQL) verificada/criada com sucesso.`);
         resolve();
       }
     });
   });
 }
 
 // --- Table Creation Functions ---
 
 async function create_adocao() {
  const ddl = `CREATE TABLE IF NOT EXISTS adocao (
    id SERIAL PRIMARY KEY,
    arquivo VARCHAR(255),
    nome VARCHAR(255),
    idade INT,
    especie VARCHAR(100),
    porte VARCHAR(50),
    caracteristicas TEXT,
    tutor VARCHAR(255),
    contato VARCHAR(100),
    whatsapp VARCHAR(20),
    origem TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`;
  await executeDDL(ddl, 'adocao');
 }
 
 async function create_adotante() {
     const ddl = `CREATE TABLE IF NOT EXISTS adotante (
          id SERIAL PRIMARY KEY,
          origem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          q1 INT,
          q2 INT,
          q3 INT,
          qTotal INT,
          nome VARCHAR(255),
          contato VARCHAR(100),
          whatsapp VARCHAR(20),
          cep VARCHAR(10),
          endereco VARCHAR(255),
          numero VARCHAR(20),
          complemento VARCHAR(100),
          bairro VARCHAR(100),
          cidade VARCHAR(100),
          estado VARCHAR(50),
          idPet INT,
          FOREIGN KEY (idPet) REFERENCES adocao (id) ON DELETE SET NULL
     );`;
  await executeDDL(ddl, 'adotante');
 }
 
 async function create_adotado() {
     const ddl = `CREATE TABLE IF NOT EXISTS adotado (
          id SERIAL PRIMARY KEY,
          origem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          arquivo VARCHAR(255),
          pet VARCHAR(255),
          tutor VARCHAR(255),
          historia TEXT
      );`;
  await executeDDL(ddl, 'adotado');
 }
 
 async function create_castracao() {
      const ddl = `CREATE TABLE IF NOT EXISTS castracao (
          id SERIAL PRIMARY KEY,
          origem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ticket VARCHAR(50) UNIQUE NOT NULL,
          nome VARCHAR(255),
          contato VARCHAR(100),
          whatsapp VARCHAR(20),
          arquivo VARCHAR(255),
          idade INT,
          especie VARCHAR(100),
          porte VARCHAR(50),
          clinica VARCHAR(255),
          agenda VARCHAR(255)
      );`;
  await executeDDL(ddl, 'castracao');
 }
 
 async function create_procura_se() {
     const ddl = `CREATE TABLE IF NOT EXISTS procura_se (
          id SERIAL PRIMARY KEY,
          origem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          arquivo VARCHAR(255),
          nomePet VARCHAR(255),
          idadePet VARCHAR(50),
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
          id SERIAL PRIMARY KEY,
          origem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
 
async function create_voluntario() {
    const ddl = `CREATE TABLE IF NOT EXISTS voluntario (
        id SERIAL PRIMARY KEY,
        origem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        nome VARCHAR(255),
        localidade VARCHAR(255),
        telefone VARCHAR(20),
        whatsapp VARCHAR(20),
        disponibilidade TEXT,
        habilidade TEXT,
        mensagem TEXT
    );`;
    await executeDDL(ddl, 'voluntario');
 }
 
 async function create_coleta() {
     const ddl = `CREATE TABLE IF NOT EXISTS coleta (
         id SERIAL PRIMARY KEY,
         origem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         nome VARCHAR(255),
         telefone VARCHAR(20),
         whatsapp VARCHAR(20),
         item VARCHAR(255),
         quantidade VARCHAR(50),
         dia VARCHAR(10),
         hora TIME,
         cep VARCHAR(10),
         endereco VARCHAR(255),
         numero VARCHAR(20),
         complemento VARCHAR(100),
         bairro VARCHAR(100),
         cidade VARCHAR(100),
         estado VARCHAR(50),
         mensagem TEXT
     );`;
     await executeDDL(ddl, 'coleta');
     
 }
 

 async function create_home() {
     const ddl = `CREATE TABLE IF NOT EXISTS home (
          id SERIAL PRIMARY KEY,
          origem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          arquivo VARCHAR(255),
          titulo VARCHAR(255),
          mensagem TEXT,
          link VARCHAR(2083)
      );`;
  await executeDDL(ddl, 'home');
 }
 
 async function create_login() {
  const ddl = `CREATE TABLE IF NOT EXISTS login (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL, -- Lembre-se de usar HASH para senhas em produção
    isAdmin BOOLEAN DEFAULT FALSE,
    origem TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`;
  await executeDDL(ddl, 'login');
 }
 
 async function create_admin_user() {
  try {
    // Use 'pool' which is defined in this module's scope
    const result = await pool.query('SELECT usuario FROM login WHERE usuario = $1', ['@admin']);

    if (result.rows.length === 0) {
      // IMPORTANTE: A senha '@admin' aqui é insegura.
      // Em um sistema real, use hashing (ex: bcrypt) para armazenar senhas.
      // E permita que a senha do admin seja configurável ou gerada de forma segura.
      const insertSQL = `INSERT INTO login (usuario, senha, isAdmin) VALUES ($1, $2, $3)`;

      // pool.query returns a promise, no need to wrap it in another one.
      await pool.query(insertSQL, ['@admin', '@admin', true]);
      console.log("Usuário padrão '@admin' criado com sucesso.");
    } else {
      console.log("Usuário padrão '@admin' já existe.");
    }
  } catch (error) {
    console.error("Erro ao criar usuário admin (PostgreSQL):", error.message);
    throw error;
  }
 }
 
 /**
   * Função para inicializar todas as tabelas do banco de dados.
   * Chame esta função durante a inicialização da sua aplicação.
   */
 async function initializeDatabaseTables() {
     try {
      await create_adocao();
      await create_adotante();
      await create_adotado();
      await create_castracao();
      await create_procura_se();
      await create_parceria();
      await create_voluntario();
      await create_coleta();
      await create_home();
      await create_login();
      await create_admin_user(); // Deve ser chamado após create_login
    } catch (error) {
      console.error("Erro fatal durante a inicialização das tabelas (PostgreSQL):", error.message);
      throw error;
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
     // create_admin_user, // Geralmente não é exportado, mas chamado por initializeDatabaseTables
     initializeDatabaseTables
 };
 