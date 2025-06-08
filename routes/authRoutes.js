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
 
     if (!usuario || !senha) {
         return res.render('login', { error: 'Usuário e senha são obrigatórios.' });
     }
 
     try {
         const sql = `SELECT id, usuario, senha, isAdmin FROM login WHERE usuario = ? AND senha = ? LIMIT 1;`;
 
         // Correctly retrieve the list of users (should be 0 or 1 due to LIMIT 1)
         const userList = await new Promise((resolve, reject) => {
             db.all(sql, [usuario, senha], (err, resultRows) => { // resultRows is an array from db.all
                 if (err) return reject(err);
                 resolve(resultRows); // resultRows will be [{...}] if found, or [] if not
             });
         });
 
         // Get the actual user object, or undefined if not found
         const foundUser = userList[0]; 
 
         console.log('User object found:', foundUser); // This will be the user object or undefined
 
         // Corrected console logs (optional, for debugging)
         if (foundUser) {
             console.log('foundUser.usuario =>', foundUser.usuario);
             // console.log('foundUser.senha =>', foundUser.senha); // Avoid logging passwords
             console.log('foundUser.isAdmin =>', foundUser.isAdmin);
               // Store user information in the session
         }
          
         // Check if a user was found
         if (!foundUser) {
             return res.render('login', { error: 'Usuário ou senha inválidos.' });
         }
 
         // Verify the structure of the user object
         if (typeof foundUser.id === 'undefined' || typeof foundUser.usuario === 'undefined') {
             console.error('Login error: Unexpected user data format after query.', foundUser);
             return res.status(500).render('login', { error: 'Erro ao processar dados do usuário.' });
         }
        else{
            console.log('Login bem-sucedido para o usuário:', foundUser.usuario);
              // Store user information in the session
            req.session.user = {
             id: foundUser.id,
             usuario: foundUser.usuario,
             isAdmin: foundUser.isAdmin // SQLite stores BOOLEAN as 0 or 1
        }};
         
         // Set loggedInUser for other middleware/routes if needed
         req.session.loggedInUser = foundUser.usuario;        
         return res.redirect('/home');
        
     } catch (error) {
         console.error("Erro no processo de login:", error);
         return res.status(500).render('login', { error: 'Usuário e ou Senha INCORRETOS.' });
     }
 });

 
 
 module.exports = router;
 