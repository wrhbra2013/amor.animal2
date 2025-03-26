const express = require('express');
const path = require("path");
const body = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const notifier = require('node-notifier');


//banco de dados
const { db } = require('./database/database.js');
const { 
adocao, 
adotante,
adotado,
castracao} = require('./database/create.js');
const { insert_adocao, insert_castracao, insert_adotante } = require('./database/insert.js');


//Pasta de imagens
const uploads = multer({
  dest: path.join(__dirname, './static/uploads/')
})

//express configs
const app = express();
const port = 3001;

//EJS configs
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.set("/views", path.join(__dirname, "views"));
app.set("/database", path.join(__dirname, "database"));
app.set("/js", path.join(__dirname, "js"));
app.use('/static', express.static('static'));





//Rotas GET
app.get('/', (req, res) => { 
  //Adoção
  const cont1 = `SELECT count( ) adocao;`
  db.all(cont1,[], (error, rows) =>{
   if (error) return res.render('error', { error: error })
     res.render('home', { model: rows})
  })

  //Adotante
  const cont2 = `SELECT count( ) adotante;`
  db.all(cont2,[], (error, rows) =>{
   if (error) return res.render('error', { error: error })
     res.render('home', { model: rows})
  })
  });

app.get('/inicio', (req, res) => {
  //Adoção
  const cont1 = `SELECT count( ) adocao;`
  db.all(cont1,[], (error, rows) =>{
   if (error) return res.render('error', { error: error })
     res.render('home', { model: rows})
  })

  //Adotante
  const cont2 = `SELECT count( ) adotante;`
 db.all(cont2,[], (error, rows) =>{
  if (error) return res.render('error', { error: error })
    res.render('home', { model: rows})
 })  
});

app.get('/adote', (req, res) => {
  const sql = `SELECT * FROM adocao;`
   db.all(sql,  [], (error, rows) => {
    if (error) return res.render('error', { error: error })
    res.render('adote', { model: rows })
  });
 });

app.get('/adocao', (req, res) => res.render('adocao'));

app.get('/form_adote', (req, res) => {
  const sql = `SELECT * FROM adotante;`
  db.all(sql, [], (error, rows) => {
    if (error) return res.render('error', { error: error })
     res.render('form_adote', { model: rows})
  });
  });

app.get('/form_adocao', (req, res) => res.render('form_adocao'));

app.get('/form_adotados', (req, res) => res.render('form_adotados'));

app.get('/castracao', (req, res) => {

  const sql = `SELECT * FROM castracao;`
  db.all(sql, [], (error, rows) => {
    if (error) return res.render('error', { error: error })
    res.render('castracao', { model: rows })
  });
});

app.get('/form_castracao', (req, res) => res.render('form_castracao'));

app.get('/doacao', (req, res) => res.render('doacao'));

app.get('/quiz', (req, res) => res.render('quiz'));


app.get('/form_doe', (req, res) => res.render('form_doe'));

app.get('/parceria', (req, res) => res.render('parceria'));

app.get('/form_parceria', (req, res) => res.render('form_parceria'));

app.get('/procura_se', (req, res) => res.render('procura_se'));

app.get('/form_procura_se', (req, res) => res.render('form_procura_se'));

app.get('/sobre', (req, res) => {
  
  res.render('sobre');
});


//Rotas POST
//Upload de imagens Nodejs - SQLite3
app.post('/form_adocao', uploads.single('arquivo'), (req, res) => {
  console.log(req.file);

  let destination = req.file.destination;
  let temp_file = req.file.filename
  let final_file = req.file.originalname;

  fs.rename(destination + temp_file, destination + final_file, error => {
    if (error) return res.render('error', { error: error })
    console.log('Arquivo ENVIADO.')
  });
  console.log('nome do arquivo', destination + final_file);
  let forms = {
    arquivo: final_file,
    nome: req.body.nomePet,
    idade: req.body.idadePet,
    especie: req.body.especie,
    porte: req.body.porte,
    caracteristicas: req.body.caracteristicas,
    responsavel: req.body.tutor,
    contato: req.body.contato
  };
  console.log(forms);
  insert_adocao(forms.arquivo, forms.nome, forms.idade, forms.especie, forms.porte, forms.caracteristicas, forms.responsavel, forms.contato);
  return res.redirect('adote')
});

app.post('/form_castracao', uploads.single('arquivo'), (req, res) => {
  console.log(req.file)
  let dest = req.file.destination;
  let temp = req.file.filename
  let final = req.file.originalname;

  fs.rename(dest + temp, dest + final, error => {
    if (error) return res.render('error', { error: error })
    console.log('Arquivo ENVIADO.')
  });
  let form2 = {
    nome: req.body.nome,
    contato: req.body.contato,
    arquivo: final,
    idade: req.body.idade_pet,
    especie: req.body.especie,
    porte: req.body.porte,
    observacoes: req.body.obs
     }
  console.log(form2);
  insert_castracao(form2.nome, form2.contato, form2.arquivo, form2.idade, form2.especie, form2.porte, form2.observacoes);
  
  return res.redirect('castracao')
});

app.post('/quiz', (req, res) => {
  const form3 ={
    quiz1: req.body.q1,
    quiz2: req.body.q2,
    quiz3: req.body.q3
  };
  insert_adotante(form3.quiz1,form3.quiz2,form3.quiz3);
  res.redirect('/form_adote');
});

app.post('/form_adote', (req, res) => {
  const form4= {
    tutor: req.body.tutor,
    contato: req.body.contato
  }
  insert_adotante(form4.tutor, form4.contato)
  res.redirect('/adote')
});

app.post('/delete/adocao/:id/:arq', (req, res) => {
  const id = req.params.id;
  const arq = req.params.arq;
  const sql = `DELETE FROM adocao WHERE id =  ?`;
  db.run(sql, id, (error) => {
    if (error) res.render('error', { error: error })
    res.redirect('/adocao')
  });
   const  caminho = `./static/uploads/${arq}`;
  fs.unlinkSync(caminho, error => {
    console.log(error)
  }) 
});

app.post('/delete/castracao/:ticket/:arq', (req, res) => {
  const id = req.params.ticket;
  const arq = req.params.arq;
  const sql = `DELETE FROM castracao WHERE ticket =  ?;`;
  db.run(sql, id, (error) => {
    if (error) res.render('error', { error: error })
    res.redirect('/castracao');
  });
  console.log(id, 'deletado')
  const  caminho = `./static/uploads/${arq}`;
  fs.unlinkSync(caminho, error => {
    console.log(error)
  });
});


//Rotas alternativas
app.get('/error/<error>', (req, res) => { res.render('error') });




app.listen(port, (error) => {
  if (error) return res.render('error', { error: error })
  console.log(`Aplicação ATIVA em http://localhost:${port}`)
  /*  notifier.emit({ message:` Valorizamos sua privacidade
 
 Utilizamos cookies para aprimorar sua experiência de navegação, exibir anúncios ou conteúdo personalizado e analisar nosso tráfego. Ao clicar em “Aceitar todos”, você concorda com nosso uso de cookies..`})        */
});
