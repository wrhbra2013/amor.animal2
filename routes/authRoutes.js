 // routes/authRoutes.js
 const express = require('express');
 const { db } = require('../database/database'); // Importa a instância do banco SQLite
 const router = express.Router();
 
 // GET /login - Renderiza o formulário de login
 router.get('/login', (req, res) => {
     // Se o usuário já estiver logado (verificando req.session.user), redireciona para /home
     if (req.session.user) {
         return res.redirect('/home');
     }
     // Passa mensagens de erro ou sucesso (ex: após logout) via query params
     res.render('login', {
         error: req.query.error || null,
         message: req.query.message || null
     });
 });
 
 // GET /logout - Lida com o logout do usuário
 router.get('/logout', (req, res) => {
     req.session.destroy(err => {
         if (err) {
             console.error('Erro ao destruir a sessão:', err);
             // Em caso de erro no logout, renderiza uma página de erro ou redireciona
             return res.status(500).render('error', { // Supondo que você tenha um 'error.ejs'
                 error: 'Erro ao tentar fazer logout. Tente novamente.'
             });
         }
         console.log('Usuário deslogado com sucesso.');
         // Redireciona para a página de login com uma mensagem de sucesso
                                 
         res.render('logout');
     });
 });
 
 // POST /login - Processa a tentativa de login
 router.post('/login', async (req, res) => {
     const { usuario, senha } = req.body;
 
     if (!usuario || !senha) {
         return res.render('login', { error: 'Usuário e senha são obrigatórios.' });
     }
 
     try {
         // ATENÇÃO: Comparar senhas em texto plano é inseguro.
         // Considere usar hashing (ex: bcrypt) para senhas.
         const sql = `SELECT id, usuario, isAdmin FROM login WHERE usuario = ? AND senha = ? LIMIT 1;`;
 
         // db.all retorna um array de linhas. Esperamos 0 ou 1 linha devido ao LIMIT 1.
         const users = await new Promise((resolve, reject) => {
             db.all(sql, [usuario, senha], (err, rows) => {
                 if (err) {
                     return reject(err);
                 }
                 resolve(rows);
             });
         });
 
         const foundUser = users[0]; // Pega o primeiro usuário do array (ou undefined se o array estiver vazio)
 
         if (!foundUser) {
             // Usuário não encontrado ou senha incorreta
             return res.render('login', { error: 'Usuário ou senha inválidos.' });
         }
 
         // Verifica se os campos essenciais estão presentes no objeto retornado
         // (Embora a query deva garantir isso se um usuário for encontrado)
         if (typeof foundUser.id === 'undefined' ||
             typeof foundUser.usuario === 'undefined' ||
             typeof foundUser.isAdmin === 'undefined') {
             console.error('Erro de login: Formato de dados do usuário inesperado.', foundUser);
             return res.status(500).render('login', { error: 'Erro interno ao processar dados do usuário.' });
         }
 
         console.log('Login bem-sucedido para o usuário:', foundUser.usuario);
 
         // Armazena as informações do usuário na sessão.
         // É uma boa prática garantir que `isAdmin` seja um booleano.
         req.session.user = {
             id: foundUser.id,
             usuario: foundUser.usuario,
             isAdmin: Boolean(foundUser.isAdmin) // Converte 0/1 do SQLite para true/false
         };
          console.log('LOGIN - req.session.user definido:', JSON.stringify(req.session.user)); // LOG ADICIONAD0
         // Redireciona para a página inicial após o login bem-sucedido
        req.flash('success', 'Login bem-sucedido!' )
         return res.redirect('/home');
 
     } catch (error) {
    
         console.error("Erro no processo de login:", error);
         // Para o usuário, uma mensagem genérica é geralmente melhor em caso de erro de servidor.
         return res.status(500).render('login', { error: 'Ocorreu um erro durante o login. Tente novamente mais tarde.' });
     }
 });
 
 module.exports = router;
 