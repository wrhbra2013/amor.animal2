  // /home/wander/amor.animal2/routes/homeRoutes.js
  const express = require('express');
  // Assuming executeAllQueries is replaced or adapted to fetch specific data needed
  const { executeAllQueries } = require('../database/queries');
  const { db } = require('../database/database'); // Make sure db is correctly imported
  const fs = require('fs');
  const path = require('path');
  const { isAdmin } = require('../middleware/auth');
  const { uploadHome } = require('../utils/multerConfig');
 
  const router = express.Router();
 
  // Helper function to fetch data (to avoid duplication if you have / and /home)
 router.get('/', (req, res)=>{
executeAllQueries()
.then((results) => {
const { home, adocao, adotante, adotado, castracao, sql_castracao, procura_se, parceria, doacao } = results;
res.render('home', { model1: home, model2: adocao, model3: adotante, model4: adotado, model5: castracao, 
model6: sql_castracao, model7: procura_se, model8: parceria });    
})
.catch((error) => {
res.render('error', { error: error });
});  
 })
      
 router.get('/home', (req, res)=>{
    executeAllQueries()
    .then((results) => {
    const { home, adocao, adotante, adotado, castracao, sql_castracao, procura_se, parceria, doacao } = results;
    res.render('home', { model1: home, model2: adocao, model3: adotante, model4: adotado, model5: castracao, 
    model6: sql_castracao, model7: procura_se, model8: parceria });    
    })
    .catch((error) => {
    res.render('error', { error: error });
    });  
     })
          

 
  // Route for '/home' (Consider redirecting /home to / or removing it)
  
 
  // POST /upload route remains largely the same, ensure db.run uses correct table/columns
  router.post('/form_home', isAdmin, uploadHome.single('image'), async (req, res) => { // Added async
         let dest = req.file.destination;
        let temp = req.file.filename;
        let final = req.file.originalname;
        
        fs.rename(dest + temp, dest + final, error => {
        if (error) return res.render('error', { error: error });
        console.log('Arquivo ENVIADO.');
        });
        console.log(dest, temp, final)
        form10 ={
        arquivo: final,
        titulo: req.body.titulo,
        mensagem: req.body.mensagem
        }
        insert_home(form10.arquivo, form10.titulo, form10.mensagem)
        res.redirect('/home')
        });
    
        module.exports = router;