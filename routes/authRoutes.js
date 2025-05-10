 // routes/authRoutes.js
 const express = require('express');
 const { db } = require('../database/database');
const router = express.Router();
const session = require('express-session');
const {isAdmin} = require('../middleware/auth');








 router.get('/login', (req, res) => {
     res.render('login');
 });
 
 router.get('/logout', (req, res) => {
     req.session.destroy((error) => {
         if (error) {
             console.error("Logout error:", error); // More specific error log
             // Consider a more user-friendly error message or redirect
         }
         res.render('login'); // Render login page after logout
         console.log('User logged out');
     });
 });
 
 router.post('/login', (req, res) => {
    const  credenciais = {
        usuario: req.body.usuario,
        senha: req.body.senha
    };
    const sql = `SELECT * FROM login WHERE usuario = ?`;
    db.get(sql, [credenciais.usuario], (error, row) => {
        if (error) {       
             console.error("Login query error:", error); // More specific error log
            return res.render('login', { error: 'Erro na consulta de login.' });
        }
        if (!row) {
            return res.render('login', { error: 'Usuário não encontrado.' });
        }
        if (credenciais.senha === row.senha) {
             req.session.user = { id: row.id, usuario: row.usuario, isAdmin: row.isAdmin === 1}; 
             req.session.user.isAdmin
            console.log('Login bem-sucedido para:', credenciais.usuario);       
            return res.redirect('/home');
        } else {
            return res.render('login', { error: 'Senha incorreta.' });
        }
    });    
 });
 
// ... outras importações

 module.exports = router;
 