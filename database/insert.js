const {db} = require('./database');
 
 
 async function executeInsert(sql, values, tableName) {
     return new Promise((resolve, reject) => { // Envolve em Promessa para async/await
         db.run(sql, values, function (err) {  // Usa 'function' para acessar 'this'
             if (err) {
                 console.error(`Erro ao inserir dados na tabela ${tableName}:`, err.message);
                 console.error('SQL:', sql);
                 console.error('Valores:', values);
                 reject(err);
             } else {
                 console.log(`Dados inseridos na tabela ${tableName} com ID: ${this.lastID}`);
                 resolve({ insertId: this.lastID }); // Adapta para a propriedade lastID do SQLite
             }
         });
     });
 }
 

 
 async function insert_adocao(arquivo, nome, idade, especie, porte, caracteristicas, tutor, contato, whatsapp) {
     const insertSQL = `INSERT INTO adocao (
         arquivo, nome, idade, especie, porte, caracteristicas, tutor, contato, whatsapp
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;
     // Assumindo que 'arquivo' é um Buffer ou null. 'idade' deve ser um número.
     const values = [
         arquivo, nome, parseInt(idade, 10), especie, porte,
         caracteristicas, tutor, contato, whatsapp
     ];
     return executeInsert(insertSQL, values, 'adocao');
 }
 
 async function insert_adotante(q1, q2, q3, nome, contato, whatsapp, cep, endereco, numero, complemento, bairro, cidade, estado, idPet) {
     const insertSQL = `INSERT INTO adotante (
         q1, q2, q3, qTotal, nome, contato, whatsapp, cep, endereco,
         numero, complemento, bairro, cidade, estado, idPet
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
 
     const numQ1 = parseInt(q1, 10);
     const numQ2 = parseInt(q2, 10);
     const numQ3 = parseInt(q3, 10);
     const qTotal = numQ1 + numQ2 + numQ3;
     const numIdPet = idPet ? parseInt(idPet, 10) : null; // idPet pode ser nulo
 
     const values = [
         numQ1, numQ2, numQ3, qTotal, nome, contato, whatsapp, cep, endereco,
         numero, // 'numero' pode ser string (ex: "10A")
         complemento, bairro, cidade, estado, numIdPet
     ];
     return executeInsert(insertSQL, values, 'adotante');
 }
 
 async function insert_adotado(arquivo, pet, tutor, historia) {
     const insertSQL = `INSERT INTO adotado (
         arquivo, pet, tutor, historia
     ) VALUES (?, ?, ?, ?);`;
     // Assumindo que 'arquivo' é um Buffer ou null.
     const values = [arquivo, pet, tutor, historia];
     return executeInsert(insertSQL, values, 'adotado');
 }
 
 async function insert_castracao(ticket, nome, contato, whatsapp, arquivo, idade, especie, porte, clinica, agenda) {
     const insertSQL = `INSERT INTO castracao (
         ticket, nome, contato, whatsapp, arquivo, idade, especie, porte, clinica, agenda
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
     // Assumindo que 'arquivo' é um Buffer ou null. 'idade' deve ser um número.
     // 'ticket' agora é um parâmetro, conforme definido em create.js
     const values = [
         ticket, nome, contato, whatsapp, arquivo, parseInt(idade, 10),
         especie, porte, clinica, agenda
     ];
     return executeInsert(insertSQL, values, 'castracao');
 }
 
 async function insert_procura_se(arquivo, nomePet, idadePet, especie, porte, caracteristicas, local, tutor, contato, whatsapp) {
     const insertSQL = `INSERT INTO procura_se (
         arquivo, nomePet, idadePet, especie, porte, caracteristicas,
         local, tutor, contato, whatsapp
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
     // Assumindo que 'arquivo' é um Buffer ou null.
     const values = [
         arquivo, nomePet, idadePet, especie, porte, caracteristicas,
         local, tutor, contato, whatsapp
     ];
     return executeInsert(insertSQL, values, 'procura_se');
 }
 
 async function insert_parceria(empresa, localidade, proposta, representante, telefone, whatsapp, email) {
     const insertSQL = `INSERT INTO parceria (
         empresa, localidade, proposta, representante, telefone, whatsapp, email
     ) VALUES (?, ?, ?, ?, ?, ?, ?);`;
     const values = [empresa, localidade, proposta, representante, telefone, whatsapp, email];
     return executeInsert(insertSQL, values, 'parceria');
 }
 
async function insert_voluntario(nome, localidade, telefone, whatsapp, disponibilidade, habilidade, mensagem)
 {
    const insertSQL = `INSERT INTO voluntario (
        nome, localidade, telefone, whatsapp, disponibilidade, habilidade, mensagem
    ) VALUES (?, ?, ?, ?, ?, ?, ?);`;
    const values = [nome, localidade, telefone, whatsapp, disponibilidade, habilidade, mensagem];
    return executeInsert(insertSQL, values, 'voluntario');
 }
 
 
 async function insert_home(arquivo, titulo, mensagem, link) {
     const insertSQL = `INSERT INTO home (
         arquivo, titulo, mensagem, link
     ) VALUES (?, ?, ?, ?);`;
     // Assumindo que 'arquivo' é um Buffer ou null.
     const values = [arquivo, titulo, mensagem, link];
     return executeInsert(insertSQL, values, 'home');
 }
 
 async function insert_login(usuario, senha, isAdmin = true) {
     // IMPORTANTE: A senha DEVE ser HASHED antes de ser inserida no banco de dados.
     // Use uma biblioteca como bcrypt: const hashedPassword = await bcrypt.hash(senha, saltRounds);
     // Este exemplo NÃO faz o hash por simplicidade, mas é CRÍTICO para segurança.
    
     const insertSQL = `INSERT INTO login (
         usuario, senha, isAdmin
     ) VALUES (?, ?, ?);`;
     const values = [usuario, senha /* Deveria ser hashedPassword */, isAdmin];
     return executeInsert(insertSQL, values, 'login');
 }
 
 module.exports = {
     insert_adocao,
     insert_adotante,
     insert_adotado,
     insert_castracao,
     insert_parceria,
     insert_procura_se,
     insert_voluntario,
     insert_home,
     insert_login
 };
 