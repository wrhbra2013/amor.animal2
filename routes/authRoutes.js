// routes/authRoutes.js
const express = require('express');
const {db} = require('../database/database')
const router = express.Router();
const key = 'login';

router.get('/login', (req, res) => {
    const { usuario, senha } = req.body;
     const  query = `SELECT * FROM login WHERE email = '${usuario}' AND password = '${senha}'`;
     db.all(query, [], (error, result) => {
        if (error)  { res.render('./login')
            if (result.length > 0) { 
                 req.session[key] = true;
                req.session.user = result;
                res.render('./home')     
               }else{
                console.log('Login invalido.', error)

               }
            }
        })
    })
    



router.get('/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error)  {
            console.log(error)
         
        } else {
            res.render('./logout')
        }
    });
});

module.exports = router;

