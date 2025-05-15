 // Node Core Modules
 const path = require("path");
  
 // NPM Modules
 const express = require('express');
 const session = require('express-session');
 const bodyParser = require('body-parser');
 const cookieParser = require("cookie-parser");
 // Local Modules: Database
 const { db, fk_db } = require('./database/database.js');

 const {
    create_home,
    create_adocao,
    create_adotado,
    create_adotante,
    create_castracao,
    create_procura_se,
    create_parceria,
    create_login
 } = require('./database/create.js')




 // --- Express App Setup ---
 const app = express();
 const port = process.env.PORT || 3000; // Use environment variable for port
 
 // EJS Configuration
 app.set('view engine', 'ejs');
 app.set("/views", path.join(__dirname, "views"));
 // app.set("/database", path.join(__dirname, "database")); // Usually not needed to set database path as a view setting
 
 // Static Files
 app.use('/static', express.static(path.join(__dirname, 'static'))); // Use path.join for robustness
 
 // Body Parsers
 app.use(bodyParser.urlencoded({ extended: true }));
 app.use(bodyParser.json());

 
 // Session Configuration
 app.use(cookieParser());
 app.use(session({
     secret: process.env.SESSION_SECRET || '@admin', // Use environment variable for secret!
     resave: false,
     saveUninitialized: false,
     cookie: {
         secure: process.env.NODE_ENV === 'production', // Set secure only in production (HTTPS)
         httpOnly: true, // Good practice
         maxAge: 24 * 60 * 60 * 1000 // Example: 1 day session expiry
     }
 }));
 
 // --- Global Middleware ---
 
 // Make user session available in all templates
 app.use((req, res, next) => {
     res.locals.user = req.session.user;
     next();
 });
 // --- Helper Functions & Custom Middleware ---
 
 
    
 
 
 // --- Mount Routers ---
 const homeRoutes = require('./routes/homeRoutes');
 const adocaoRoutes = require('./routes/adocaoRoutes');
 const adotadoRoutes = require('./routes/adotadoRoutes');
 const adotanteRoutes = require('./routes/adotanteRoutes');
 const castracaoRoutes = require('./routes/castracaoRoutes');
 const authRoutes = require('./routes/authRoutes');
 const parceriaRoutes = require('./routes/parceriaRoutes');
 const procuraRoutes = require('./routes/procuraRoutes');
 const relatorioRoutes = require('./routes/relatorioRoutes');
 const cepRoutes = require('./routes/cepRoutes');
 const errorRoutes = require('./routes/errorRoutes');
 const loginRoutes = require('./routes/loginRoutes');
 const privacyRoutes = require('./routes/privacyRoutes');
 const doacaoRoutes = require('./routes/doacaoRoutes');
 const sobreRoutes = require('./routes/sobreRoutes');
 const adminRoutes = require('./routes/adminRoutes');

 
 

 // ... import other route files 
 app.use('/', homeRoutes); // Base routes often go here or in homeRoutes
 app.use('/home', homeRoutes); // Explicit home route
 app.use('/adocao', adocaoRoutes);
 app.use('/adotado', adotadoRoutes); // Map related paths to the same router
 app.use('/adotante', adotanteRoutes); // Map related paths to the same router
 app.use('/castracao', castracaoRoutes);
 app.use('/auth', authRoutes); // For /login, /logout
 app.use('/parceria', parceriaRoutes);
 app.use('/procura_se', procuraRoutes); // Use hyphens for URLs generally
 app.use('/relatorio', relatorioRoutes);
 app.use('/cep', cepRoutes);
 app.use('/error', errorRoutes);
 app.use('/login', loginRoutes);
 app.use('/privacy', privacyRoutes);
 app.use('/doacao', doacaoRoutes);
 app.use('/sobre', sobreRoutes);
 app.use('/admin', adminRoutes);


 
 

 // ... use other routers
 
 // --- Catch-all for 404 Not Found (Place AFTER all other routes) ---
 app.use((req, res, next) => {
     res.status(404).render('error', { error: 'Página não encontrada.' });
 });
 
 // --- Global Error Handler (Place very last) ---
 app.use((err, req, res, next) => {
     console.error("Global Error Handler Caught:", err.stack);
     res.status(err.status || 500).render('error', { error: 'Ocorreu um erro inesperado.' });
 });

 // --- Start Server ---
 app.listen(port, (error) => {
     if (error) {
         return console.error("Erro ao iniciar o servidor:", error); // Return to stop execution
     }
     const url = `http://localhost:${port}`;
     console.log(`Aplicação ATIVA em ${url}`);
    });
 