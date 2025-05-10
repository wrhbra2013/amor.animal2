  // routes/parceriaRoutes.js
  const express = require('express');
  const { db } = require('../database/database'); // Adjust path
  const {executeAllQueries } = require('../database/queries');
  const { insert_parceria } = require('../database/insert'); // Adjust path
   const { isAdmin } = require('../middleware/auth'); // Assuming you moved isAdmin
  
 
  const router = express.Router();
  // const key = 'parceria'; // Key might not be needed
 
  // GET route to fetch all 'parceria' entries
  router.get('/',  (req, res) => {
    executeAllQueries()
    .then((results) =>{
    const{parceria}=results;
    res.render('parceria', { model:parceria
    });   
    })
    .catch((error) => {
    res.render('error', { error: error });      
    });
    });

  router.get('/form', (req, res) => res.render('form_parceria'));

  router.post('/form',  (req, res) => {
  form9 = {
    empresa: req.body.empresa,
    localidade: req.body.localidade,
    proposta: req.body.proposta,
    representante: req.body.representante,
    telefone: req.body.telefone,
    whatsapp: req.body.whatsapp,
    email: req.body.email
    };
    insert_parceria(form9.empresa, form9.localidade, form9.proposta, form9.representante, form9.telefone,  form9.whatsapp, form9.email)
    res.redirect('/home')
});

 
  // DELETE route to delete a 'parceria' entry (Using POST for forms)
  router.post('/delete/:id', isAdmin,  (req, res  ) => { // Use async/await
      const id = req.params.id;
      const sql = `DELETE FROM parceria WHERE id =  ?`;
      db.run(sql, id, (error) => {
          if (error) res.render('error', { error: error })
          console.log('DELETADO com sucesso!!!' )
          res.redirect('/home');
      });
  });
 
module.exports = router;
 
  