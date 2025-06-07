// Importa o Express
const express = require('express');
// Cria uma instância do Router
const router = express.Router();



router.get('/policy', (req, res) => {

    res.render('policy'); // Renderiza o formulário
});

module.exports =  router;

