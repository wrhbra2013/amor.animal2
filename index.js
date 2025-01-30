const express = require('express');
const path = require("path");
const body = require('body-parser');
const { title } = require('process');
const app = express();

const port = 3000;

app.set('view engine', 'ejs');
app.use(body.urlencoded({ extended: true }));
app.use(body.json({limit: '100mb'}));
app.use(body.urlencoded({limit: '50mb', extended: true}));

app.set("views", path.join(__dirname, "views"));
app.set("database", path.join(__dirname, "database"));
app.use('/static', express.static('static'));


app.get('/', (req, res) => res.render('home'));

app.get('/home', (req, res) => res.render('home'));

app.get('/results', (req, res) => { res.render('results') });


app.get('/adocao', (req, res) => { res.render('adocao') });

app.get('/adocao', (req, res) => {
 /*  let  forms = {
    title: "Cadastro de adoção",    
    nome: req.body.nomePet, 
    idade:  req.body.idadePet, 
    especie:  req.body.especie, 
    porte:  req.body.porte, 
    caracteristicas:  req.body.caracteristicas, 
     tutor:  req.body.tutor, 
     contato: req.body.contato 
              }; */
    let  forms = [{
    title: "Cadastro de adoção",    
    nome: "Nina", 
    idade:  "10", 
    especie:  "gato", 
    porte:  "Medio", 
    caracteristicas:  "de idade", 
    tutor: "Cre", 
    contato: "cre@internet" 
}];
  console.log(forms)
  res.render('results', { forms: forms} );
});


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



app.listen(port, () => { console.log(`Aplicação ATIVA em http://localhost:${port}`) });

