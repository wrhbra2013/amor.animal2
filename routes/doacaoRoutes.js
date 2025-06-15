// Importa o Express
const express = require('express');
const { insert_voluntario } = require('../database/insert');
// Cria uma instância do Router
const router = express.Router();


// GET /eventos/novo - Rota para exibir o formulário de criação (protegida por admin)
router.get('/', (req, res) => {
        res.render('doacao'); // Renderiza o formulário
});

router.get('/form', (req, res) => {
        res.render('form_doe');

});

router.get('/voluntario/form', (req, res) => {
        res.render('form_voluntario');

});

router.post('/voluntario/form', (req, res) => {
        const form ={
                nome: req.body.nome,
                localidade: req.body.localidade,
                telefone: req.body.telefone,
                whatsapp: req.body.whatsapp,
                disponibilidade: req.body.disponibilidade,               
                habilidade:  req.body.habilidade,                
                mensagem: req.body.mensagem
        }
        insert_voluntario(
                form.nome,
                form.localidade,
                form.telefone,
                form.whatsapp,
                form.disponibilidade,
                form.habilidade,
                form.mensagem
        );
        req.flash('success', 'Voluntário cadastrado com sucesso!')
        res.redirect('/home');
        
})



module.exports = router;