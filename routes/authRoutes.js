 // routes/authRoutes.js
 const express = require('express');
 const { db } = require('../database/database'); // Importa a instância do banco SQLite
const { isAdmin } = require('../middleware/auth');
 const router = express.Router();
 
 
 // GET /login - Render the login form
 router.get('/login', (req, res) => {
     if (req.session.loggedInUser) {
         return res.redirect('/home');
     }
     res.render('login', { error: req.query.error || null, message: req.query.message || null });
 });
 
 // GET /logout - Handle user logout
 router.get('/logout', (req, res) => {
     req.session.destroy(err => {
         if (err) {
             console.error('Erro ao destruir a sessão:', err);
             return res.status(500).render('login', { error: 'Erro ao tentar fazer logout.' });
         }
         console.log('Usuário deslogado.');
         res.render('logout');
     });
 });
 
 router.post('/login', async (req, res) => {
     const { usuario, senha } = req.body;
 
     // Validação de entrada básica
     if (!usuario || !senha) {
         return res.render('login', { error: 'Usuário e senha são obrigatórios.' });
     }
 
     try {
         const sql = `SELECT id, usuario, senha, isAdmin FROM login WHERE usuario = ? AND senha = ? LIMIT 1;`;

         const rows = await new Promise((resolve, reject) => {
             db.get(sql, [usuario, senha], (err, row) => {
                 if (err) return reject(err);
                 resolve(row ? [row] : []); // Retorna um array contendo o row ou um array vazio
             });
         });
 
         // Verifica se algum usuário foi encontrado com as credenciais fornecidas
         const foundUser = rows;
         console.log('Usuário encontrado:', foundUser)
         console.log('rows[usuario] =>', rows['usuario'])
         console.log('rows[senha] =>', rows['senha'])
         console.log('rows[isAdmin] =>', rows['isAdmin'])

         // Verificação de segurança: garante que o objeto do usuário e suas propriedades essenciais existem.
         if (!foundUser || foundUser.length === 0) {
             // Usuário não encontrado ou senha incorreta
             return res.render('login', { error: 'Usuário ou senha inválidos.' });
         }

         // Isso protege contra resultados inesperados da query ou alterações no schema.
         if (!foundUser || typeof foundUser.id === 'undefined' || typeof foundUser.usuario === 'undefined') {
             console.error('Login error: Formato de dados do usuário inesperado após a consulta.', foundUser);
             return res.status(500).render('login', { error: 'Erro ao processar dados do usuário.' });
         }
 
         // Armazena informações do usuário na sessão.
         // Não armazene informações sensíveis como a senha (mesmo que hasheada) na sessão.
        
              
         req.session.user = {
             id: foundUser.id,
             usuario: foundUser.usuario,
             isAdmin: foundUser.isAdmin
         };
         
         console.log(`Login bem-sucedido para o usuário: ${foundUser.usuario}`);
         return res.redirect('/home');
 
     } catch (error) {
         console.error("Erro no processo de login:", error); // Log detalhado do erro no servidor
         // Mensagem genérica para o cliente para não expor detalhes internos
         return res.status(500).render('login', { error: 'Usuario e ou Senha INCORRETOS.' });
     }
 });
 
 module.exports = router;
 