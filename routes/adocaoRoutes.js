// routes/adocaoRoutes.js
const express = require('express');
const { executeAllQueries } = require('../database/queries');
// Correctly import the specific insert function if needed, or use db.run 
const { insert_adocao } = require('../database/insert'); // Example
const { db } = require('../database/database');
const fs = require('fs');
const path = require('path');
const { isAdmin } = require('../middleware/auth');
// Import the specific upload instance for adocao
const { uploadAdocao } = require('../utils/multerConfig'); // <-- Import specific instance

const router = express.Router();
// const key = 'adocao'; // Key might not be needed if using specific upload instance

// GET route to render the form
router.get('/',  (req, res) => {
    executeAllQueries()
    .then((results) =>{
      const{adocao}=results; // <--- Potential issue here
      res.render('adote', { model:adocao }); // <--- Line 129      
    })
    .catch((error) => {
      res.render('/adocao', { error: error });
    });
});

router.get('/form', (req, res) => res.render('form_adocao'));

// POST route to handle form submission
// Use the specific upload instance here
router.post('/form', uploadAdocao.single('arquivo'), (req, res) => {
 let destination = req.file.destination;
let temp_file = req.file.filename;
//Transformar arquivo em objeto  sequencial 
const contagem= fs.readdirSync(destination).length
// Numero aleatorio
//  let numero = Math.floor(Math.random() * 99999); 
let  final_file = contagem + path.extname(req.file.originalname);  
console.log('Final_file ->', final_file);
fs.rename(destination + temp_file, destination + final_file, error => {
if (error) return res.render('adocao', { error: error })
console.log('Arquivo ENVIADO.')
});
console.log('nome do arquivo', destination + final_file);
let forms = {
arquivo: final_file,
nome: req.body.nomePet,
idade: req.body.idadePet,
especie: req.body.especie,
porte: req.body.porte,
caracteristicas: req.body.caracteristicas,
responsavel: req.body.tutor,
contato: req.body.contato,
whatsapp: req.body.whatsapp
};
console.log(forms);
insert_adocao(forms.arquivo, forms.nome, forms.idade, forms.especie, forms.porte, forms.caracteristicas, forms.responsavel, forms.contato, forms.whatsapp);
res.redirect('/home');
});
  
router.post('/delete/adocao/:id/:arq', isAdmin, (req, res) => {
    const id = req.params.id;
    const arq = req.params.arq;
    const sql = `DELETE FROM adotado WHERE id =  ?`;
    db.run(sql, id, (error) => {
    if (error) res.render('error', { error: error })
    console.log('DELETADO com sucesso!!!' )
    res.redirect('/adocao')
    });
    const  caminho = `./static/uploads/adocao/${arq}`;
    fs.unlinkSync(caminho, error => {
    console.log(error)
    }) 
    });

 module.exports = router;
