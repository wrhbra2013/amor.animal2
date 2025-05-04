 // routes/castracaoRoutes.js
 const express = require('express');
 const { executeAllQueries } = require('../database/queries'); // Keep if used elsewhere, or remove if only GET / uses it
 const { insert_castracao } = require('../database/insert'); // Keep if used, but direct db.run is often clearer
 const { db } = require('../database/database'); // Adjust path if needed
 const fs = require('fs').promises; // Use promises for async file operations
 const path = require('path');
 const { isAdmin } = require('../middleware/auth'); // Adjust path if needed
 // Import the specific upload instance for castracao
 const { uploadCastracao } = require('../utils/multerConfig'); // <-- Corrected import
 
 const router = express.Router();
 // const key = 'castracao'; // No longer needed with specific upload instance
 
 // GET /castracao
 router.get('/castracao', (req, res ) =>{
    executeAllQueries()
    .then((results) =>{
    const{sql_castracao}=results;
    res.render('castracao', { model:sql_castracao
    });   
    })
    .catch((error) => {
    res.render('error', { error: error });      
    });
    });

 
 
 // GET /castracao/form
 router.get('/form', (req, res) => res.render('form_castracao'));
 
 // POST /castracao/form
 // Use the specific upload instance directly
 router.post('/form',  uploadCastracao.single('arquivo'), (req, res) => {// <-- Corrected usage
console.log(req.file)
let dest = req.file.destination;
let temp = req.file.filename
let final = req.file.originalname;

fs.rename(dest + temp, dest + final, error => {
if (error) return res.render('error', { error: error })
console.log('Arquivo ENVIADO.')
});
let form2 = {
nome: req.body.nome,
contato: req.body.contato,
whats: req.body.whatsapp,
arquivo: final,
idade: req.body.idade_pet,
especie: req.body.especie,
porte: req.body.porte,
clinica: req.body.clinica,
agenda: req.body.agenda
}
console.log(form2);
insert_castracao(form2.nome, form2.contato, form2.whats, form2.arquivo, form2.idade, form2.especie, form2.porte, form2.clinica, form2.agenda);    
res.redirect('/home')
});

 
 // DELETE /castracao/:ticket/:arq (Using POST for forms)
 router.post('/delete/:ticket/:arq', isAdmin,  (req, res) => { // Use async/await
const id = req.params.ticket;
const arq = req.params.arq;
const sql = `DELETE FROM castracao WHERE ticket =  ?;`;
db.run(sql, id, (error) => {
if (error) res.render('error', { error: error })
console.log('DELETADO com sucesso!!!' )
res.redirect('/castracao');
});
console.log(id, 'deletado')
const  caminho = `./static/uploads/castracao/${arq}`;
fs.unlinkSync(caminho, error => {
console.log(error)
});
});
 
module.exports = router;
 