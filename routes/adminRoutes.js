 // Importa o Express
 const express = require('express');
 // Importa a função para inserir login e o middleware de autenticação
 const { insert_login } = require('../database/insert.js');
 const { isAdmin } = require('../middleware/auth.js');
 
 // Cria uma instância do Router
 const router = express.Router();
 
 // Rota para exibir o formulário de criação de administrador (protegida)
 router.get('/form', isAdmin, (req, res) => {
     res.render('form_admin', { error: null, success: null }); // Passa variáveis para mensagens
 });
 
 // Rota para processar o formulário de criação de administrador (protegida)
 router.post('/form', isAdmin, async (req, res) => {
     const { usuario, senha, confirmar } = req.body;
     
     // Verifica se as senhas coincidem
     if (senha !== confirmar) {
         return res.status(400).render('form_admin', {
             error: 'As senhas não coincidem.',
             success: null
         });
     }
     
 
     // Validação básica dos campos
     if (!usuario || !senha) {
         return res.status(400).render('form_admin', { 
             error: 'Usuário e senha são obrigatórios.',
             success: null
         });
     }
 
     try {
         // É crucial que a função insert_login realize o hashing da senha antes de salvar.
         // Se insert_login não for assíncrona, remova o 'await'.
         await insert_login(usuario, senha); 
         console.log(`Novo administrador criado: ${usuario}`);
         
         // Redireciona para a página de login ou para uma página de sucesso
         // Considerar adicionar uma mensagem de sucesso na página de login ou em form_admin
         res.render('login'); 
 
     } catch (error) {
         console.error('Erro ao criar novo administrador:', error);
         res.status(500).render('form_admin', {
             error: 'Erro ao criar administrador. Tente novamente.',
             success: null
         });
     }
 });
 
 module.exports = router;
 