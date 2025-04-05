const express = require('express');
const path = require("path");
const body = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const notifier = require('node-notifier');


//banco de dados
const { db, fk_db } = require('./database/database.js');
const { 
 create_adocao,
 create_adotante,
 create_adotado,
 create_castracao,
 create_procura_se,
 create_parceria,
 create_doacao
} = require('./database/create.js');
const { 
insert_adocao, 
insert_adotante,
insert_adotado,
insert_castracao,
insert_parceria,
insert_procura_se,
insert_doacao
} = require('./database/insert.js');



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
app.use('/static', express.static('static'));





//Rotas GET
app.get('/', (req, res) => { 
  //Adoção
  const cont1 = `SELECT count( ) adocao;`
  db.all(cont1,[], (error, rows) =>{
   if (error) return res.render('error', { error: error })
     res.render('home', { model: rows})
  });
  
  //Adotante
  const cont2 = `SELECT count( ) adotante;`
  db.all(cont2,[], (error, rows) =>{
   if (error) return res.render('error', { error: error })
     res.render('home', { model: rows})
  })

  //Castracao
  /* const cont3 = `SELECT COUNT() castracao;`
  db.all(cont3,[], (error, rows) =>{
   if (error) return res.render('error', { error: error })
     res.render('home', { model: rows})
  }); */
  });

app.get('/home', (req, res) => {
  
  //Adoção
  const cont1 = `SELECT count( ) adocao;`
  db.all(cont1,[], (error, rows) =>{
   if (error) return res.render('error', { error: error })
     res.render('home', { model: rows})
  });
  //Adotante
  const cont2 = `SELECT count( ) adotante;`
 db.all(cont2,[], (error, rows) =>{
  if (error) return res.render('error', { error: error })
    res.render('home', { model: rows})
 })  

  //Castracao
  /* const cont3 = `SELECT COUNT() castracao
;`
  db.all(cont3,[], (error, rows) =>{
   if (error) return res.render('error', { error: error })
     res.render('home', { model: rows})
  })     */

});

app.get('/adote', (req, res) => {
  const sql = `SELECT * FROM adocao;`
   db.all(sql,  [], (error, rows) => {
    if (error) return res.render('error', { error: error })
    res.render('adote', { model: rows })
  });
 });

app.get('/adocao', (req, res) => {
  const sql = `SELECT * FROM adotado;`
  db.all(sql, [], (error, rows) => {
    if (error) return res.render('error', { error: error })
    res.render('adocao', { model: rows })
  });
});
  

app.get('/form_adote', (req, res) => {
  const sql = `SELECT * FROM adotante;`
  db.all(sql, [], (error, rows) => {
    if (error) return res.render('error', { error: error })
     res.render('form_adote', { model: rows})
  });
   res.render('home')
  });

app.get('/form_adocao', (req, res) => res.render('form_adocao'));

app.get('/form_adotado', (req, res) => res.render('form_adotado'));

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

app.get('/parceria', (req, res) => {
  const sql = `SELECT * FROM parceria;`
  db.all(sql, [], (error, rows) => {
    if (error) return res.render('error', { error: error })
    res.render('parceria', { model: rows })
  });
  });

app.get('/form_parceria', (req, res) => res.render('form_parceria'));

app.get('/procura_se', (req, res) => res.render('procura_se'));

app.get('/form_procura_se', (req, res) => res.render('form_procura_se'));

app.get('/sobre', (req, res) => {
  
  res.render('sobre');
});

app.get('/error/<error>', (req, res) => { res.render('error') });

//Rotas POST
//Upload de imagens Nodejs - SQLite3
app.post('/form_adocao', uploads.single('arquivo'), (req, res) => {
  console.log(req.file);
  let destination = req.file.destination;
  let temp_file = req.file.filename
  let final_file = req.file.originalname;
  console.log('DEStination ->',destination)
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
   res.redirect('adote')
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
  
  res.redirect('/castracao')
});

app.post('/quiz', (req, res) => {
  const form3 ={
    quiz1: req.body.q1,
    quiz2: req.body.q2,
    quiz3: req.body.q3
  };
  insert_adotante(form3.quiz1, form3.quiz2, form3.quiz3);
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

app.post('/form_adotado',  uploads.single('arquivo'), (req, res) => {
  let dest = req.file.destination;
  let temp = req.file.filename
  let final = req.file.originalname;

  fs.rename(dest + temp, dest + final, error => {
    if (error) return res.render('error', { error: error })
    console.log('Arquivo ENVIADO.')
  });
  const form5 = {
    foto: final,
    pet: req.body.nome_pet,
    tutor: req.body.nome_tutor,
    historia: req.body.historia
  };
  console.log(form5)
  insert_adotado(form5.foto, form5.pet, form5.tutor, form5.historia);
  res.redirect('/adocao')
});


app.post('/form_procura_se', (req, res) => {
  const form7 = {
    foto: req.body.arquivo,
    nome: req.body.nomePet,
    idade: req.body.idadePet,
    especie: req.body.especie,
    porte: req.body.porte,
    caracteristicas: req.body.caracteristicas,
    local: req.body.local,
    tutor: req.bodu.tutor,
    contato: req.body.contato
  };
  insert_procura_se(form7.foto, form7.nome, form7.idade, form7.especie, form7.porte, form7.caracteristicas, form7.local, form7.tutor, form7.contato);

  console.log(form7);
  res.redirect('/procura_se');
});

app.post('/form_doe', (req, res) => {
  const form8 = {
    nome: req.body.nome, 
    localidade: req.body.localidade,
    contato: req.body.contato, 
    recurso: req.body.recurso
  };
  console.log(form8);  
  insert_doacao(form8.nome, form8.localidade, form8.contato, form8.recurso)
  res.redirect('/doacao')});

  app.post('/form_parceria', (req, res) => {
    form9 = {
      empresa: req.body.empresa,
      localiidade: req.body.localidade,
      proposta: req.body.proposta,
      representante: req.body.representante,
      telefone: req.body.telefone,
      whatsapp: req.body.whatsapp,
      email: req.body.email
    };
    insert_parceria(form9.empresa, form9.localidade, form9.proposta, form9.representante, form9.telefone, form9.telefone, form9.whatsapp, form9.email)
  res.redirect('/parceria')
});

//Rotas alternativas
//Delete
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

app.post('/delete/adotado/:id/:arq', (req, res) => {
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



app.listen(port, (error) => {
  if (error) return res.render('error', { error: error })
  console.log(`Aplicação ATIVA em http://localhost:${port}`)
  /*  notifier.emit({ message:` Valorizamos sua privacidade
 
 Utilizamos cookies para aprimorar sua experiência de navegação, exibir anúncios ou conteúdo personalizado e analisar nosso tráfego. Ao clicar em “Aceitar todos”, você concorda com nosso uso de cookies..`})        */
});
