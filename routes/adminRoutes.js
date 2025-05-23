// Importa o Express
const express = require('express');
const body = require('body-parser');
const path = require('path');
const {insert_login} = require('../database/insert.js');
const { isAdmin } = require('../middleware/auth.js');

const app = express();

// Cria uma instância do Router
const router = express.Router();


router.post('/form', isAdmin, (req, res) => {
    const form = {
        usuario: req.body.usuario,
        senha: req.body.senha,
            
    }
    insert_login(form.usuario, form.senha);
    console.log(form);
    
    res.render('home' ,{message: 'Usuário criado com sucesso!' })   

});

router.get('/form', isAdmin, (req, res) => {
    res.render('form_admin')
    
    }
)

module.exports = router;