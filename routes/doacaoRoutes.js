// Importa o Express
const express = require('express');
// Cria uma instância do Router
const router = express.Router();


// GET /eventos/novo - Rota para exibir o formulário de criação (protegida por admin)
router.get('/', (req, res) => {
        res.render('doacao'); // Renderiza o formulário
});

router.get('/form', (req, res) => {
        res.render('form_doe');

});




module.exports = router;