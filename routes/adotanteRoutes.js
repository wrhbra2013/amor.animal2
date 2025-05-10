// routes/adocaoRoutes.js
const express = require('express');
const { executeAllQueries } = require('../database/queries');
// Correctly import the specific insert function if needed, or use db.run
const { insert_adotante } = require('../database/insert'); // Example
const { db } = require('../database/database');
const fs = require('fs');
const path = require('path');
const { isAdmin } = require('../middleware/auth');
// Import the specific upload instance for adocao
const { uploadAdotante } = require('../utils/multerConfig'); // <-- Import specific instance

const router = express.Router();
// const key = 'adocao'; // Key mi

router.get('/', (req, res) =>{
    executeAllQueries()
  .then((results) =>{
  const{sql_adotante}=results;
  res.render('adotante', { model: sql_adotante
  });   
  })
  .catch((error) => {
  res.render('error', { error: error });      
  });
});

router.get('/form', (req, res) => res.render('form_adotante'));



router.post('/form', (req, res)=>{
    const form3 ={
        quiz1: req.body.q1,
        quiz2: req.body.q2,
        quiz3: req.body.q3,
        tutor: req.body.tutor,
        contato: req.body.contato,
        whats: req.body.whatsapp,
        cep:  req.body.cep,
        endereco:  req.body.endereco,
        numero: req.body.numero,
        complemento: req.body.complemento,
        bairro:  req.body.bairro,
        cidade:  req.body.cidade,
        estado:  req.body.estado  
        };  
        insert_adotante( form3.quiz1, form3.quiz2, form3.quiz3, form3.tutor, form3.contato, form3.whats, form3.cep, form3.endereco, form3.numero, form3.complemento, form3.bairro, form3.cidade, form3.estado);
        res.redirect('/home');
   
   });
    

   router.post('/delete/adotante/:id', isAdmin, (req, res) => {
       const id = req.params.id;
       const sql = `DELETE FROM adotante WHERE id =  ?`;
       db.run(sql, id, (error) => {
       if (error) res.render('error', { error: error })
       console.log('DELETADO com sucesso!!!' )
       res.redirect('/home')
       });
   });

module.exports = router;



module.exports = router;