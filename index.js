const express = require('express');
const path = require("path");
const body = require('body-parser');
const fs = require('fs');
const multer = require('multer');
const {cadastroPet} = require('./database/database')
const  {insertPet} = require('./database/insert');

//express configs
const app = express();
const port = 3000;

//multer configs
const  upload = multer({
  dest: './static/uploads'
});

//EJS configs
app.set('view engine', 'ejs');
app.use(body.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("database", path.join(__dirname, "database"));
app.use('/static', express.static('static'));


//Rotas GET
app.get('/', (req, res) => res.render('home'));

app.get('/home', (req, res) => res.render('home'));

app.get('/adocao', (req, res) =>  { res.render('adocao' )});

app.get('/doacao', (req, res) => res.render('doacao'));

app.get('/castracao', (req, res) => res.render('castracao'));

app.get('/resgate', (req, res) => res.render('resgate'));

app.get('/parceria', (req, res) => res.render('parceria'));

app.get('/sobre', (req, res) => {
  const test = {
    title: "Test",
    items: ["one", "two", "three"]
  };
  res.render('sobre', { model: test });
});

//Rotas POST
//Upload de imagens Nodejs - SQLite3
app.post('/adocao',  upload.single("petMidia") ,(req, res) => {
    let forms = {
    title: "Cadastro de adoção",
    midia:  req.file.petMidia,
    imagem: path.join(__dirname, './static/uploads'),
    nome: req.body.nomePet,
    idade: req.body.idadePet,
    especie: req.body.especie,
    porte: req.body.porte,
    caracteristicas: req.body.caracteristicas,
    tutor: req.body.tutor,
    contato: req.body.contato
  };
  insertPet(forms);
  res.render('adocao')
});

//Rotas alternativas
app.get('/results', (req, res) => { res.render('results') });

app.get('/error', (req, res) => res.render('error'));






app.listen(port, () => { console.log(`Aplicação ATIVA em http://localhost:${port}/`) });

