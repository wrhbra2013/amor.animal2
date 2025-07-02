 // /home/wander/amor.animal2/routes/adminRoutes.js
 
 const express = require('express');
 const { insert_login } = require('../database/insert.js');
 const { isAdmin } = require('../middleware/auth.js');
 // É altamente recomendável usar bcrypt para senhas seguras.
 // const bcrypt = require('bcrypt'); 
 
 const router = express.Router();
 
 // Rota para EXIBIR o formulário de criação de administrador (protegida)
 // Adicionado o middleware 'isAdmin' de volta para segurança
 router.get('/form', isAdmin, (req, res) => {
     res.render('form_admin', {
         // Passa mensagens flash para o template
         error: req.flash('error'),
         success: req.flash('success')
     });
 });
 
 // Rota para PROCESSAR o formulário de criação de administrador (protegida)
 // Adicionado o middleware 'isAdmin' de volta para segurança
 router.post('/form', isAdmin, async (req, res) => {
     // CORREÇÃO: Atribui o corpo da requisição diretamente à variável 'form'
     const form = req.body;
 
     // Validação básica dos campos
     if (!form.usuario || !form.senha || !form.confirmar) {
         req.flash('error', 'Todos os campos são obrigatórios.');
         return res.redirect('/admin/form');
     }
     
     // Verifica se as senhas coincidem
     if (form.senha !== form.confirmar) {
         req.flash('error', 'As senhas não coincidem.');
         return res.redirect('/admin/form');
     }
 
     try {
         // IMPORTANTE: Sua função insert_login DEVE fazer o hash da senha antes de salvar!
         // Exemplo com bcrypt:
         // const salt = await bcrypt.genSalt(10);
         // const hashedPassword = await bcrypt.hash(form.senha, salt);
         // await insert_login(form.usuario, hashedPassword); 
         
         // Chamando sua função original (certifique-se que ela faz o hash)
         await insert_login(form.usuario, form.senha); 
         
         console.log(`Novo administrador criado: ${form.usuario}`);
         req.flash('success', 'Usuário administrador criado com sucesso!');
         
         // Redireciona para a home para que a página seja recarregada com os dados corretos
         res.redirect('/home'); 
 
     } catch (error) {
         console.error('Erro ao criar novo administrador:', error);
 
         // Tratamento de erro para usuário duplicado (específico do SQLite)
         if (error.message.includes('SQLITE_CONSTRAINT: UNIQUE constraint failed')) {
             req.flash('error', `O nome de usuário "${form.usuario}" já existe.`);
         } else {
             req.flash('error', 'Ocorreu um erro interno ao criar o administrador. Tente novamente.');
         }
         
         res.redirect('/admin/form');
     }
 });
 
 module.exports = router;
 