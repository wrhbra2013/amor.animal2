 // routes/procuraRoutes.js
 const express = require('express');
 const { db } = require('../database/database'); // 
 // Adjust path
 const {executeAllQueries } = require('../database/queries');
 const { insert_procura_se } = require('../database/insert'); // Adjust path}
 const fs = require('fs');
 const path = require('path');
 const { isAdmin } = require('../middleware/auth'); // Assuming you moved isAdmin
 // Import the specific upload instance for procura_se
 const { uploadProcuraSe } = require('../utils/multerConfig'); // <-- Import specific instance
 
 const router = express.Router();
 // const key = 'procura_se'; // Key might not be needed
 
 // GET /procura-se (Assuming this is the base path mounted in index.js)
 router.get('/',  (req, res) => {
executeAllQueries()
.then((results) =>{
const{procura_se}=results;
res.render('procura_se', { model:procura_se
});   
})
.catch((error) => {
res.render('error', { error: error });      
});
});

 router.get('/form', (req, res) => res.render('form_procura_se'));

 // POST /procura-se
 // Use the specific upload instance here
 router.post('/form', uploadProcuraSe.single('arquivo'),
  (req,res) => {
 let destination = req.file.destination;
let temp_file = req.file.filename;
let final_file = req.file.originalname;
console.log('Destination ->',destination)
fs.rename(destination + temp_file, destination + final_file, error => {
if (error) return res.render('error', { error: error })
console.log('Arquivo ENVIADO.')
});
console.log('nome do arquivo', destination + final_file);
const form7 = {
arquivo: final_file,
nome: req.body.nomePet,
idade: req.body.idadePet,
especie: req.body.especie,
porte: req.body.porte,
caracteristicas: req.body.caracteristicas,
local: req.body.local,
tutor: req.body.tutor,
contato: req.body.contato, 
whats: req.body.whatsapp
};
insert_procura_se(form7.arquivo, form7.nome, form7.idade, form7.especie, form7.porte, form7.caracteristicas, form7.local, form7.tutor, form7.contato, form7.whats);
console.log(form7);
res.redirect('/home');
});
 
 // DELETE /procura-se/:id/:arq (Using POST for forms)
 router.post('/delete/:id/:arq', isAdmin,  (req, res) => { // Use async/await
 const id = req.params.id;
 const arq = req.params.arq;
 const sql = `DELETE FROM procura_se WHERE id =  ?`;
 db.run(sql, id, (error) => {
 if (error) res.render('error', { error: error })
 console.log('DELETADO com sucesso!!!' )
 res.redirect('/home');
 });
 const  caminho = `./static/uploads/procura_se/${arq}`;
 fs.unlinkSync(caminho, error => {
 console.log(error)
 });
 });
 
module.exports = router;

 