 // Node Core Modules
 const path = require("path");
 
 // NPM Modules
 const express = require('express');
 const session = require('express-session');
 const cookieParser = require("cookie-parser");
 
 // Local Modules
 const { initializePool } = require('./database/database.js');
 const { initializeDatabaseTables } = require('./database/create.js');
 // const { executeAllQueries } = require('./database/queries'); // Se usado apenas para verificação inicial, pode ser opcional aqui
 
 // --- Express App Setup ---
 const app = express();
 const PORT = process.env.PORT || 3000;
 
 // --- Middleware ---
 // Substitui bodyParser.urlencoded e bodyParser.json
 app.use(express.urlencoded({ extended: true }));
 app.use(express.json());
 app.use(cookieParser());
 
 // Session middleware setup
 // IMPORTANTE: Defina process.env.SESSION_SECRET em seu ambiente de produção!
 const sessionSecret = process.env.SESSION_SECRET || '@admin_super_secret_key_replace_me';
 if (sessionSecret === '@admin_super_secret_key_replace_me' && process.env.NODE_ENV === 'production') {
     console.warn('AVISO: SESSION_SECRET não está configurada adequadamente para produção!');
 }
 app.use(session({
     secret: sessionSecret,
     resave: false,
     saveUninitialized: true,
     cookie: {
         secure: process.env.NODE_ENV === 'production', // Use cookies seguros em produção (HTTPS)
         httpOnly: true, // Ajuda a prevenir ataques XSS
         // maxAge: 24 * 60 * 60 * 1000 // Opcional: define o tempo de vida do cookie da sessão (ex: 1 dia)
     }
 }));
 
 // Middleware para disponibilizar informações do usuário e estado do cookie para as views
 app.use((req, res, next) => {
     res.locals.user = req.session.user || null; // Informações do usuário logado
     res.locals.showCookieBanner = !(req.cookies && req.cookies.cookie_consent === 'accepted'); // Controla a exibição do banner de cookies
     next();
 });
 
 // --- View Engine Setup ---
 app.set('view engine', 'ejs');
 app.set('views', path.join(__dirname, 'views')); // Corrigido: app.set('views', ...)
 
 // --- Static Files ---
 // Servir arquivos estáticos da pasta 'static'
 app.use('/static', express.static(path.join(__dirname, 'static')));
 // Servir arquivos da pasta 'uploads' (que está dentro de 'static')
 app.use('/uploads', express.static(path.join(__dirname, 'static', 'uploads')));
 
 
 // --- Routes ---
 
 // Importação de Rotas
 const homeRoutes = require('./routes/homeRoutes');
 const adocaoRoutes = require('./routes/adocaoRoutes');
 const adotanteRoutes = require('./routes/adotanteRoutes');
 const adotadoRoutes = require('./routes/adotadoRoutes');
 const castracaoRoutes = require('./routes/castracaoRoutes');
 const procuraRoutes = require('./routes/procuraRoutes');
 const parceriaRoutes = require('./routes/parceriaRoutes');
 const doacaoRoutes = require('./routes/doacaoRoutes');
 const sobreRoutes = require('./routes/sobreRoutes');
 const privacyRoutes = require('./routes/privacyRoutes');
 const cepRoutes = require('./routes/cepRoutes');
 const authRoutes = require('./routes/authRoutes'); // Para login/logout
 const adminRoutes = require('./routes/adminRoutes');
 const relatorioRoutes = require('./routes/relatorioRoutes');
 const errorRoutes = require('./routes/errorRoutes'); // Se for uma página de erro específica
//   const loginRoutes = require('./routes/loginRoutes'); // GET /login agora é tratado por authRoutes
 
 
 // Montagem das Rotas
 app.use('/', homeRoutes); // homeRoutes já lida com '/' e '/home' internamente
 // app.use('/home', homeRoutes); // Redundante se homeRoutes já trata /home
 app.use('/adote', adocaoRoutes); // Mantido para consistência, mas '/adocao' é mais comum
 app.use('/adocao', adocaoRoutes);
 app.use('/adotante', adotanteRoutes);
 app.use('/adotado', adotadoRoutes);
 app.use('/castracao', castracaoRoutes);
 app.use('/procura_se', procuraRoutes);
 app.use('/parceria', parceriaRoutes);
 app.use('/doacao', doacaoRoutes);
 app.use('/sobre', sobreRoutes);
 app.use('/privacy', privacyRoutes);
 app.use('/cep', cepRoutes);
 app.use('/auth', authRoutes); // Monta authRoutes na raiz para ter /login, /logout
 app.use('/admin', adminRoutes);
 app.use('/relatorio', relatorioRoutes);
 
 
 // Rotas para consentimento de cookies
 app.get('/cookie-consent', (req, res) => { // Esta rota deve vir ANTES do 404
     res.render('cookie-consent'); // Supondo que você tenha um 'cookie-consent.ejs'
 });
 
 app.post('/accept-cookies', (req, res) => { // Esta rota deve vir ANTES do 404
     res.cookie('cookie_consent', 'accepted', { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true });
     res.sendStatus(200);
 });
 
 // Se você tem uma rota específica para exibir uma página de erro genérica
 app.use('/error', errorRoutes);
 
 
 // --- Error Handling ---
 // Manipulador para erros 404 (Página Não Encontrada) - Deve ser o último manipulador de rota regular
 app.use((req, res, next) => {
     res.status(404).render('error', { error: 'Página não encontrada.' });
 });
 
 // Manipulador de Erro Global - Deve ser o último middleware
 app.use((err, req, res, next) => {
     console.error('Erro Global Capturado:', err.stack);
     // Evite vazar detalhes do erro em produção
     const errorMessage = process.env.NODE_ENV === 'production' ?
         'Ocorreu um erro interno no servidor.' :
         err.message || 'Ocorreu um erro interno no servidor.';
     res.status(err.status || 500).render('error', { error: errorMessage });
 });
 
 // --- Start Server Function ---
 async function startServer() {
     try {
         await initializePool(); // CRÍTICO: Inicializa o pool de conexões primeiro
         console.log("Pool de conexões com o banco de dados inicializado.");
 
         await initializeDatabaseTables(); // Inicializa/verifica as tabelas do banco (usa o pool)
         console.log("Tabelas do banco de dados verificadas/inicializadas.");
 
         // Opcional: Executar queries de verificação ao iniciar (para desenvolvimento/diagnóstico)
         // const { executeAllQueries } = require('./database/queries');
         // await executeAllQueries();
         // console.log("Queries de verificação inicial executadas.");
 
         app.listen(PORT, () => {
             console.log(`Aplicação ATIVA em http://localhost:${PORT}`);
         });
 
     } catch (error) {
         console.error("FATAL: Falha ao inicializar a aplicação:", error);
         process.exit(1); // Encerra o processo se a inicialização crítica falhar
     }
 }
 
 // Inicia o servidor
 startServer();
 