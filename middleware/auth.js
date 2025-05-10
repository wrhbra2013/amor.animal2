const express = require('express');
const app = express();
const session = require('express-session');

app.use(session({
    secret: '@admin',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true } // Defina como true se estiver usando HTTPS
}));


// /home/wander/amor.animal2/middleware/auth.js
function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.isAdmin) {
        req.user = req.session.user;
        
        next();
    } else {
        res.render('./logar')   
    };

};

// middleware/auth.js
exports.isAdmin = (req, res, next) => {
  if (req.session && req.session.user) {
      // Supondo que você tenha um campo 'isAdmin' no objeto 'user' da sessão
      if (req.session.user.isAdmin) {
          return next(); // Usuário é admin, permite o acesso
      }
  }
  // Se não for admin ou não estiver logado, redireciona ou envia um erro
  res.status(403).send('Acesso negado. Requer privilégios de administrador.');
  // Ou:  res.redirect('/login');  // Redireciona para a página de login
};


module.exports = {
    isAdmin,
    
}