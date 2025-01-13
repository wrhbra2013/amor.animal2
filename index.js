const express = require('express')
const body = require('body-parser');
const path = require('path');
const app = express();

const port = 3000;

app.engine('html', require('ejs').renderFile)
app.use(express.static('views'));
app.use('/static',express.static(path.join( __dirname,'static')));
app.use(body.urlencoded({extended:true}));
app.use(body.raw());
app.use(body.text());

app.get('/', (req, res) => res.render('home.html'));
app.get('/adocao', (req, res) => {
    let cadastro = req.body.cadastroPet.map();    
    res.render('adocao.html',
        cadastro=cadastro)});
app.get('/doacao', (req, res) => res.render('doacao.html'));
app.get('/castracao', (req, res) => res.render('castracao.html'));
app.get('/resgate', (req, res) => res.render('resgate'));
app.get('/parceria', (req, res) => res.render('parceria.html'));



app.listen(port, () => {console.log(`Aplicação ATIVA em http://localhost:${port}`)}) ;

