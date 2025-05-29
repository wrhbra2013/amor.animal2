// Importa o Express e o módulo 'node-fetch'
const express = require('express');
const fetch = require('node-fetch');
// Cria uma instância do Router
const router = express.Router();


// GET /cep - Rota para exibir o formulário de busca de CEP
router.get('cep/:numero', async (req, res) => {
    const cep = req.params.numero
    await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    
        .then(response => response.json())
        .then(data => {
            if (data.erro) {
                return res.status(404).json({ erro: 'CEP não encontrado' });
            }
            res.render('cep', {data});
        })
        .catch(error => {
            console.error('Erro ao buscar CEP:', error);
            res.status(500).json({ erro: 'Erro ao buscar CEP' });
        });
});

router.get('/cep', (req, res) => {
    res.render('cep')
});


module.exports = router;