 // Node Core Modules
 const path = require("path");
  
 // NPM Modules
 const express = require('express');
 const session = require('express-session');
 const bodyParser = require('body-parser');
 const multer = require('multer');
 const ejs = require('ejs');
 const pdfDocument = require('pdfkit');
 
 // Local Modules: Database
 const { db, fk_db } = require('./database/database.js');
 const {
     // create functions (consider if these need to be imported if create.js runs them on require)
 } = require('./database/create.js'); // create.js likely runs on require, so you might not need to import these functions unless called elsewhere
 const {
     insert_adocao,
     insert_adotante,
     // ... other insert functions
 } = require('./database/insert.js');
 const { executeAllQueries } = require('./database/queries.js');
 
 // Local Modules: Utilities (Example - if you move helpers)
 // const multerConfig = require('./utils/multerConfig');
 // const authMiddleware = require('./middleware/auth');
 // --- Express App Setup ---
 const app = express();
 const port = process.env.PORT || 3002; // Use environment variable for port
 
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
 app.use(session({
     secret: process.env.SESSION_SECRET || '@admin', // Use environment variable for secret!
     resave: false,
     saveUninitialized: false,
     cookie: {
         // secure: process.env.NODE_ENV === 'production', // Set secure only in production (HTTPS)
         httpOnly: true, // Good practice
         // maxAge: 24 * 60 * 60 * 1000 // Example: 1 day session expiry
     }
 }));
 
 // --- Global Middleware ---
 
 // Make user session available in all templates
 app.use((req, res, next) => {
     res.locals.user = req.session.user;
     next();
 });
 // --- Helper Functions & Custom Middleware ---
 
 // Multer Configuration (Consider moving to utils/multerConfig.js)
 function arq_filtro(parametro) {
     const uploadPaths = {
         'castracao': path.join(__dirname, './static/uploads/castracao/'),
         'adotado': path.join(__dirname, './static/uploads/adotado/'),
         'adocao': path.join(__dirname, './static/uploads/adocao/'),
         'procura_se': path.join(__dirname, './static/uploads/procura_se/'),
         'home': path.join(__dirname, './static/uploads/home/')
     };
 
     const uploadPath = uploadPaths[parametro];
 
     if (!uploadPath) {
         console.error('Parâmetro do Multer INCORRETO:', parametro);
         // Maybe throw an error or return a middleware that sends an error response
         return null; // Or handle error appropriately
     }
 
     // Ensure directory exists (optional, but good practice)
     // fs.mkdirSync(uploadPath, { recursive: true });
 
     const storage = multer.diskStorage({
         destination: function (req, file, cb) {
             cb(null, uploadPath);
         },
         filename: function (req, file, cb) {
             // More robust filename generation (prevents overwrites, handles special chars)
             const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
             const extension = path.extname(file.originalname);
             const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_'); // Sanitize
             // cb(null, uniqueSuffix + extension); // Option 1: Unique name
             cb(null, file.fieldname + '-' + uniqueSuffix + extension); // Option 2: Fieldname + unique
             // Your current logic relies on renaming later, which is less ideal.
         }
     });
 
     return multer({ storage: storage });
 }
 
 
 // Authentication Middleware (Consider moving to middleware/auth.js)
 function isAdmin(req, res, next) {
     if (req.session.user && req.session.user.isAdmin) {
         next();
     } else {
         console.warn('Unauthorized access attempt to admin route by:', req.session.user ? req.session.user.username : 'Guest', 'on path:', req.originalUrl);
         // Provide feedback to the user
         // req.flash('error', 'Acesso não autorizado.'); // If using connect-flash
         // res.redirect('/login');
         res.status(403).render('error', { error: 'Acesso não autorizado.' });
     }
 }
 // --- Mount Routers ---
 const homeRoutes = require('./routes/homeRoutes');
 const adocaoRoutes = require('./routes/adocaoRoutes');
 const castracaoRoutes = require('./routes/castracaoRoutes');
 const authRoutes = require('./routes/authRoutes');
 const parceriaRoutes = require('./routes/parceriaRoutes');
 const procuraRoutes = require('./routes/procuraRoutes');
 const relatorioRoutes = require('./routes/relatorioRoutes');
 
 

 // ... import other route files
 
 app.use('/', homeRoutes); // Base routes often go here or in homeRoutes
 app.use('/home', homeRoutes); // Explicit home route
 app.use('/adocao', adocaoRoutes);
 app.use('/adote', adocaoRoutes); // Map related paths to the same router
 app.use('/adotante', adocaoRoutes); // Map related paths to the same router
 app.use('/castracao', castracaoRoutes);
 app.use('/auth', authRoutes); // For /login, /logout
 app.use('/parceria', parceriaRoutes);
 app.use('/procura-se', procuraRoutes); // Use hyphens for URLs generally
 app.use('/relatorio', relatorioRoutes);
 app.use('/cep', require('./routes/cepRoutes'));
app.use('/error', require('./routes/errorRoutes'));
app.use('/login', require('./routes/loginRoutes'));


 
 

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
     executeAllQueries(); // Initialize database or other async tasks here if needed before server truly ready
 });
 