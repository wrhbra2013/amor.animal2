// routes/adocaoRoutes.js
const express = require('express');
const { executeAllQueries } = require('../database/queries');
// Correctly import the specific insert function if needed, or use db.run
const { insert_adotado } = require('../database/insert'); // Example
const { db } = require('../database/database');
const fs = require('fs');
const path = require('path');
const { isAdmin } = require('../middleware/auth');
// Import the specific upload instance for adocao
const { uploadAdotado } = require('../utils/multerConfig'); // <-- Import specific instance

const router = express.Router();
// const key = 'adocao'; // Key might not be needed if using specific upload instance


router.get('/', (req, res) => {
    executeAllQueries()
   .then((results) =>{
   const{adotado}=results;
   res.render('adotado', { model2:adotado});   
   })
   .catch((error) => {
   res.render('error', { error: error });      
   });
   });

   router.get('/form', (req, res) => res.render('form_adotado'));

router.post('/form', uploadAdotado.single('arquivo'), (req, res) => {
    if (!req.file) {
        return res.render('error', { error: 'Nenhum arquivo foi enviado.' });
        }
        let dest = req.file.destination;
        let temp = req.file.filename;
        let final = req.file.originalname;
        
        fs.rename(dest + temp, dest + final, error => {
        if (error) return res.render('error', { error: error });
        console.log('Arquivo ENVIADO.');
        });
        console.log(dest, temp, final)
        const form5 = {
        foto: final,
        pet: req.body.nome_pet,
        tutor: req.body.nome_tutor,
        historia: req.body.historia
        };
        console.log(form5);
        insert_adotado(form5.foto, form5.pet, form5.tutor, form5.historia);
        res.redirect('/home');
        });
     
   router.post('/delete/adotado/:id/:arq', isAdmin, (req, res) => {
       const id = req.params.id;
       const arq = req.params.arq;
       const sql = `DELETE FROM adotado WHERE id =  ?`;
       db.run(sql, id, (error) => {
       if (error) res.render('error', { error: error })
       console.log('DELETADO com sucesso!!!' )
       res.redirect('/home')
       });
       const  caminho = `./static/uploads/adotado/${arq}`;
       fs.unlinkSync(caminho, error => {
       console.log(error)
       }) 
       });

module.exports = router;