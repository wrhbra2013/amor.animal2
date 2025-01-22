const express = require('express');
const body = require('body-parser');
const app = express();

const port = 3000;

app.set('view engine', 'ejs');
app.use(body.urlencoded({extended : true}));

app.use(express.static('views'));
app.use(express.static('database'));
app.use('/static',express.static('static'));


app.get('/', (req, res) => res.render('home'));

app.get('/home', (req, res) => res.render('home'));

app.get('/results', (req, res) => { res.render('results')});


app.get('/adocao', (req, res) => { res.render('adocao')});

app.post('/adocao', (req, res)=> {      
          let forms = {
            'nome' : req.body.nomePet,
            'idade' : req.body.idadePet,
            'responsavel' : req.body.responsavel,
            'especie' :  req.body.especie,
            'porte' : req.body.porte
             }
        
         console.log(forms)
         res.render('results', {forms:forms}) 
         .catch( error => {
            console.log(error)
         })
                               
        });
   
     

app.get('/doacao', (req, res) => res.render('doacao'));

app.get('/castracao', (req, res) => res.render('castracao'));

app.get('/resgate', (req, res) => res.render('resgate'));

app.get('/parceria', (req, res) => res.render('parceria'));


app.listen(port, () => {console.log(`Aplicação ATIVA em http://localhost:${port}`)}) ;

