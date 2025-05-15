  // /home/wander/amor.animal2/routes/homeRoutes.js
  const express = require('express');
  // Assuming executeAllQueries is replaced or adapted to fetch specific data needed
  const { executeAllQueries } = require('../database/queries');
  const { db } = require('../database/database'); // Make sure db is correctly imported
  const fs = require('fs');
  const path = require('path');
  const { isAdmin } = require('../middleware/auth');
  const multer = require('multer');
  const { insert_home } = require('../database/insert');
  const { uploadHome } = require('../utils/multerConfig');
 
  const router = express.Router();

  // Middleware para verificar o consentimento de cookie
function checkCookieConsent(req, res, next) {
   // Verifica se o cookie 'cookie_consent' existe e tem o valor 'accepted'
   if (req.cookies && req.cookies.cookie_consent === 'accepted') {
       res.locals.showCookieBanner = false; // Não mostrar o banner
   } else {
       res.locals.showCookieBanner = true; // Mostrar o banner
   }
   next(); // Continua para a próxima função (a rota principal)
}
 
  // Helper function to fetch data (to avoid duplication if you have / and /home)
 router.get('/',  checkCookieConsent,(req, res)=>{
executeAllQueries()
.then((results) => {
const { home, adocao, adotante, adotado, castracao, sql_castracao, procura_se, parceria } = results;
res.render('home', { model1: home, model2: adocao, model3: adotante, model4: adotado, model5: castracao, 
model6: sql_castracao, model7: procura_se, model8: parceria });    
})
.catch((error) => {
res.render('error', { error: error });
});  
 })
      
 router.get('/home', checkCookieConsent,(req, res)=>{
    executeAllQueries()
    .then((results) => {
    const { home, adocao, adocaoCount, adotante, adotanteCount, adotado, adotadoCount, castracao, castracaoCount, procura_se, procura_seCount, parceria, parceriaCount } = results;
    res.render('home', { 
      model1: home, 
      model2: adocao, 
      model3: adocaoCount, 
      model4:adotante, 
      model5: adotanteCount,
      model6: adotado,
      model7:  adotadoCount,
      model8: castracao, 
      model9: castracaoCount, 
      model10: procura_se, 
      model11 : procura_seCount,
      model12: parceria,
      model13: parceriaCount
     });    
    })
    .catch((error) => {
    res.render('error', { error: error });
    });  
     })
          

 
  // Route for '/home' (Consider redirecting /home to / or removing it)
 router.get('/form',(req,res)=>{
  res.render('form_home')
 }
) 
 
  // POST /upload route remains largely the same, ensure db.run uses correct table/columns
router.post('/form', isAdmin, uploadHome.single('arquivo'),  (req, res) => { 
let dest = req.file.destination;
let temp = req.file.filename;
let final = req.file.originalname;
console.log(dest, temp, final)

fs.rename(dest + temp, dest + final, error => {
if (error) return res.render('error', { error: error });
console.log('Arquivo ENVIADO.');
});
console.log(dest, temp, final)
form10 ={
arquivo: final,
titulo: req.body.titulo,
mensagem: req.body.mensagem,
link: req.body.link
}
insert_home(form10.arquivo, form10.titulo, form10.mensagem, 
  form10.link)
res.redirect('/home')
});

router.post('/delete/home/:id/:arq', isAdmin, (req, res) => {
const id = req.params.id;
const arq = req.params.arq;
const sql = `DELETE FROM home WHERE id =  ?`;
db.run(sql, id, (error) => {
if (error) res.render('error', { error: error })
console.log('DELETADO com sucesso!!!' )
res.redirect('/home') 
})
const  caminho = `./static/uploads/home/${arq}`;
fs.unlinkSync(caminho, error => {
console.log(error)
}) 
});

module.exports = router;