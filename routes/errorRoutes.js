// Importa o Express
const express = require('express');
// Cria uma instância do Router
const router = express.Router();


// GET /eventos/novo - Rota para exibir o formulário de criação (protegida por admin)
router.get('/error', (req, res) => {

    res.render('error'); // Renderiza o formulário
});


module.exports = router;