const express = require('express');
const path = require("path");
const body = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const alert = require('alert');

//banco de dados
const { db } = require('./database/database.js')
const { insert_adocao } = require('./database/insert.js');
const { fstat } = require('fs');

const uploads = multer({
  dest: path.join(__dirname, './static/uploads/')
})

//express configs
const app = express();
const port = 3000;

//EJS configs
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.set("/views", path.join(__dirname, "views"));
app.set("/database", path.join(__dirname, "database"));
app.set("/js", path.join(__dirname, "js"));
app.use('/static', express.static('static'));





//Rotas GET
app.get('/', (req, res) => res.render('home'));

app.get('/home', (req, res) => res.render('home'));

app.get('/adocao', (req, res) => { res.render('adocao') });

app.get('/doacao', (req, res) => res.render('doacao'));

app.get('/castracao', (req, res) => res.render('castracao'));

app.get('/resgate', (req, res) => res.render('resgate'));

app.get('/parceria', (req, res) => res.render('parceria'));

app.get('/sobre', (req, res) => {
  const test = {
    title: "Test",
    items: [ "one", "two", "three" ]
  };
  res.render('sobre', { model: test });
});

//Rotas POST
//Upload de imagens Nodejs - SQLite3
app.post('/adocao', uploads.single('arquivo'),  (req, res) => {
   console.log(req.file);
     
  let destination = req.file.destination;
  let temp_file = req.file.filename
  let final_file = req.file.originalname;

  fs.rename(destination + temp_file, destination + final_file, error => {
    if (error)  return console.log(error)
    console.log('Arquivo ENVIADO.')
  });
  console.log('nome do arquivo', destination + final_file);
  let forms = {
    arquivo : destination + final_file,
    nome :  req.body.nomePet,
    idade : req.body.idadePet,
    especie : req.body.especie,
     porte : req.body.porte,
     caracteristicas:  req.body.caracteristicas,
     responsavel :  req.body.tutor,
    contato : req.body.contato
  };
  console.log(forms); 
  insert_adocao(forms.arquivo, forms.nome, forms.idade, forms.especie, forms.porte, forms.caracteristicas, forms.responsavel, forms.contato);
/*   return res.redirect('adocao', {forms:forms}); */
    return res.json(forms)
});

//Rotas alternativas
app.get('/results', (req, res) => { res.render('results') });

app.get('/error/<error>', (req, res) => { res.render('error') });

app.listen(port, () => { console.log(`Aplicação ATIVA em http://localhost:${port}`) });

