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
 create_doacao,
 create_home
} = require('./database/create.js');
const { 
insert_adocao, 
insert_adotante,
insert_adotado,
insert_castracao,
insert_parceria,
insert_procura_se,
insert_doacao, 
insert_home
} = require('./database/insert.js');



//Pasta de imagens do Multer
function arq_filtro(parametro) {
  let uploadPath;
  if (parametro === 'castracao') {
    uploadPath = path.join(__dirname, './static/uploads/castracao/');
  } else if (parametro === 'adotado') {
    uploadPath = path.join(__dirname, './static/uploads/adotado/');
  } else if (parametro === 'adocao') {
    uploadPath = path.join(__dirname, './static/uploads/adocao/');
  } else if (parametro === 'procura_se') {
    uploadPath = path.join(__dirname, './static/uploads/procura_se/');
  } else {
    console.log('Parâmetro do Multer INCORRETO.');
    return null;
  }
  const uploads = multer({
    dest: uploadPath
  });
  return uploads;
}


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
app.get('/', async (_, res) => {
  try {
    const queries = [
      `SELECT count(*) as adocao_count FROM adocao;`,
      `SELECT count(*) as adotante_count FROM adotante;`,
      `SELECT count(*) as castracao_count FROM castracao;`,
      `SELECT count(*) as parceria_count FROM parceria;`,
      `SELECT count(*) as doacao_count FROM doacao;`,
      `SELECT * FROM home;`
    ];

    const executeQuery = (query) => {
      return new Promise((resolve, reject) => {
        db.all(query, [], (error, rows) => {
          if (error) reject(error);
          else resolve(rows);
        });
      });
    };

    const results = {};
    const rows1 = await executeQuery(queries[0]);
    results.adocao = rows1.length > 0 ? rows1[0].adocao_count : 0;

    const rows2 = await executeQuery(queries[1]);
    results.adotante = rows2.length > 0 ? rows2[0].adotante_count : 0;

    const rows3 = await executeQuery(queries[2]);
    results.castracao = rows3.length > 0 ? rows3[0].castracao_count : 0;

    const rows4 = await executeQuery(queries[3]);
    results.parceria = rows4.length > 0 ? rows4[0].parceria_count : 0;

    const rows5 = await executeQuery(queries[4]);
    results.doacao = rows5.length > 0 ? rows5[0].doacao_count : 0;

    const rows6 = await executeQuery(queries[5]);
    results.home = rows6;

    res.render('home', { model: results });
  } catch (error) {
    res.render('error', { error: error });
  }
});

//Rotas de navegação
app.get('/home', async (_, res) => {
  try {
    const queries = [
      `SELECT count(*) as adocao_count FROM adocao;`,
      `SELECT count(*) as adotante_count FROM adotante;`,
      `SELECT count(*) as castracao_count FROM castracao;`,
      `SELECT count(*) as parceria_count FROM parceria;`,
      `SELECT count(*) as doacao_count FROM doacao;`,
      `SELECT * FROM home;`
    ];

    const executeQuery = (query) => {
      return new Promise((resolve, reject) => {
        db.all(query, [], (error, rows) => {
          if (error) reject(error);
          else resolve(rows);
        });
      });
    };

    const results = {};
    const rows1 = await executeQuery(queries[0]);
    results.adocao = rows1.length > 0 ? rows1[0].adocao_count : 0;

    const rows2 = await executeQuery(queries[1]);
    results.adotante = rows2.length > 0 ? rows2[0].adotante_count : 0;

    const rows3 = await executeQuery(queries[2]);
    results.castracao = rows3.length > 0 ? rows3[0].castracao_count : 0;

    const rows4 = await executeQuery(queries[3]);
    results.parceria = rows4.length > 0 ? rows4[0].parceria_count : 0;

    const rows5 = await executeQuery(queries[4]);
    results.doacao = rows5.length > 0 ? rows5[0].doacao_count : 0;

    const rows6 = await executeQuery(queries[5]);
    results.home = rows6;

    res.render('home', { model: results });
  } catch (error) {
    res.render('error', { error: error });
  }
});
 
app.get('/adocao', (req, res) => {

  //Busca adotados
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

app.get('/form_home', (req, res) => res.render('form_home'));

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
  db.all(sql, [ ], (error, rows) => {
    if (error) return res.render('error', { error: error })
    res.render('parceria', { model: rows })
  });
  });

app.get('/form_parceria', (req, res) => res.render('form_parceria'));

app.get('/procura_se', (req, res) => {
  const sql = `SELECT * FROM procura_se;`
  db.all(sql, [], (error, rows) => {
    if (error) return res.render('error', { error: error })
    res.render('procura_se', { model: rows })
  }); 
});



app.get('/form_procura_se', (req, res) => res.render('form_procura_se'));

app.get('/sobre', (req, res) => {
  
  res.render('sobre');
});

app.get('/error/<error>', (req, res) => { res.render('error') });

//Rotas POST
//Upload de imagens Nodejs - SQLite3
let key1 = 'adocao';
app.post('/form_adocao', arq_filtro(key1).single('arquivo'), (req, res) => {
  if (!req.file) {
    return res.render('error', { error: 'Nenhum arquivo foi enviado.' });
  }
  console.log(req.file);
  let destination = req.file.destination;
  let temp_file = req.file.filename;
  //Transformar arquivo em objeto  sequencial 
  const contagem= fs.readdirSync(destination).length
  // Numero aleatorio
   //  let numero = Math.floor(Math.random() * 99999); 
  let  final_file = contagem + path.extname(req.file.originalname);  
  console.log('Final_file ->', final_file);
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

let key2 = 'castracao';
app.post('/form_castracao', arq_filtro(key2).single('arquivo'), (req, res) => {
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

let key3 = 'adotado';
app.post('/form_adotado',  arq_filtro(key3).single('arquivo'), (req, res) => {
  if (!req.file) {
    return res.render('error', { error: 'Nenhum arquivo foi enviado.' });
  }

  let dest = req.file.destination;
  let temp = req.file.filename;
  let final = req.file.originalname;
 
  fs.rename(dest + temp, dest + final, error => {
    if (error) return res.render('error', { error: error });
    console.log('Arquivo ENVIADO.');
  });
  console.log(dest, temp, final)
  const form5 = {
    foto: final,
    pet: req.body.nome_pet,
    tutor: req.body.nome_tutor,
    historia: req.body.historia
  };
  console.log(form5);
  insert_adotado(form5.foto, form5.pet, form5.tutor, form5.historia);
  res.redirect('/adocao');
});

let key4 = 'procura_se';
app.post('/form_procura_se',arq_filtro(key4).single('arquivo'),(req, res) => {
  console.log(req.file);
  let destination = req.file.destination;
  let temp_file = req.file.filename;
  let final_file = req.file.originalname;
  console.log('Destination ->',destination)
  fs.rename(destination + temp_file, destination + final_file, error => {
    if (error) return res.render('error', { error: error })
    console.log('Arquivo ENVIADO.')
  });
  console.log('nome do arquivo', destination + final_file);
  const form7 = {
    foto: final_file,
    nome: req.body.nomePet,
    idade: req.body.idadePet,
    especie: req.body.especie,
    porte: req.body.porte,
    caracteristicas: req.body.caracteristicas,
    local: req.body.local,
    tutor: req.body.tutor,
    contato: req.body.contato, 
    whats: req.body.whatsapp
  };
  insert_procura_se(form7.foto, form7.nome, form7.idade, form7.especie, form7.porte, form7.caracteristicas, form7.local, form7.tutor, form7.contato, form7.whats);

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

app.post('/form_home', (req, res) => {
  form10 ={
    titulo: req.body.titulo,
    mensagem: req.body.mensagem
  }
  insert_home(form10.titulo, form10.mensagem)
  res.redirect('/home')
  });
//Rotas alternativas
//Delete
app.post('/delete/adocao/:id/:arq', (req, res) => {
  const id = req.params.id;
  const arq = req.params.arq;
  const sql = `DELETE FROM adotado WHERE id =  ?`;
  db.run(sql, id, (error) => {
    if (error) res.render('error', { error: error })
    res.redirect('/adocao')
  });
   const  caminho = `./static/uploads/adocao/${arq}`;
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
  const  caminho = `./static/uploads/castracao/${arq}`;
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
app.post('/delete/home/:id', (req, res) =>{
  const id = req.params.id;
  const sql = `DELETE FROM  home WHERE id = ?;`
  db.run(sql, id, (error) => {
    if (error) res.render('error', { error: error })
    res.redirect('/home')
})
});

app.listen(port, (error) => {
  if (error) return res.render('error', { error: error })
  console.log(`Aplicação ATIVA em http://localhost:${port}`)
  
});

module.exports = {
  path: path
};