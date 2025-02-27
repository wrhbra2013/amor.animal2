const express = require('express');
const path = require("path");
const body = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const alert = require('alert');

//banco de dados
const { db } = require('./database/database.js');
const {adocao} = require("./database/create.js")
const { insert_adocao } = require('./database/insert.js');


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

app.get('/adocao', (req, res) => { 
  const sql = `SELECT * FROM adocao;`
  db.all(sql, [], (error, rows) => {
    if (error) {
      return console.log(error)
    }
    res.render('adocao', {model: rows})
  });
 });

app.get('/doacao', (req, res) => res.render('doacao'));

app.get('/castracao', (req, res) => res.render('castracao'));

app.get('/parceria', (req, res) => res.render('parceria'));

app.get('/sobre', (req, res) => {
  const test = {
    title: "Test",
    items: [ "one", "two", "three" ]
  };
  res.render('sobre', { model: test });
});

app.get('/delete', (req, res) => res.render('home'));

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
    arquivo :  final_file,
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
     res.redirect('adocao' )
});

app.post('/delete/:id', (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM adocao WHERE id =  ?;`;
  db.run(sql, id, error =>{
    if (error) return res.render('error', {error: error})
      res.redirect('adocao');
  });
  const caminho = './static/uplods';
  fs.unlink(caminho, (error) =>{
    if (error) return console.log(error)
      return res.send('Cache esvaziado!')

  });
});

//Rotas alternativas
app.get('/results', (req, res) => { res.render('results') });

app.get('/error/<error>', (req, res) => { res.render('error') });

app.listen(port, () => { console.log(`Aplicação ATIVA em http://localhost:${port}`) });

