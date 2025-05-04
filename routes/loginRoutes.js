//Importa o Express
const express = require('express');
// Cria uma instância do Router
const router = express.Router();


// GET /eventos/novo - Rota para exibir o formulário de criação (protegida por admin)
router.get('/login', (req, res) => {

    res.render('login'); // Renderiza o formulário
});

module.exports = router;