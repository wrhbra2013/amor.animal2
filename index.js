const express = require('express');
const path = require("path");
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const ejs = require('ejs');
const pdfDocument = require('pdfkit');




//banco de dados
const { db, fk_db } = require('./database/database.js');
const { 
create_adocao,
create_adotante,
create_adotado,
create_castracao,
create_procura_se,
create_parceria,
create_home
} = require('./database/create.js');
const { 
insert_adocao, 
insert_adotante,
insert_adotado,
insert_castracao,
insert_parceria,
insert_procura_se,
insert_home
} = require('./database/insert.js');
const {executeAllQueries } = require('./database/queries.js');
const { transferableAbortSignal } = require('util');




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
} else if (parametro === 'home') {
uploadPath = path.join(__dirname, './static/uploads/home/');
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
const port = 3002;

//EJS configs
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("/views", path.join(__dirname, "views"));
app.set("/database", path.join(__dirname, "database"));
app.use('/static', express.static('static'));



//Rotas GET
// Primeira pàgina

app.get('/', (_, res) => {
executeAllQueries()
.then((results) => {
const { home, adocao, adotante, adotado, castracao, sql_castracao, procura_se, parceria, doacao } = results;
res.render('home', { model1: home, model2: adocao, model3: adotante, model4: adotado, model5: castracao, 
model6: sql_castracao, model7: procura_se, model8: parceria });    
})
.catch((error) => {
res.render('error', { error: error });
});  
});        

app.get('/home', (_, res) => {
executeAllQueries()
.then((results) => {
const { home, adocao, adotante, adotado, castracao, sql_castracao, procura_se, parceria } = results;
res.render('home', { model1: home, model2: adocao, model3: adotante, model4: adotado, model5: castracao, 
model6: sql_castracao, model7: procura_se, model8: parceria });    
})
.catch((error) => {
res.render('error', { error: error });
});  
});

app.get('/form_home', (req, res) => res.render('form_home'));

app.get('/privacy-policy',(req, res) =>{
res.render('privacy-policy')
});

app.get('/me',(req, res) =>{
res.render('me')
});

// Adoção 
app.get('/adocao' , (req, res) =>{
executeAllQueries()
.then((results) =>{
const{adotado}=results;
res.render('adocao', { model2:adotado 
});   
})
.catch((error) => {
res.render('error', { error: error });      
});
});


app.get('/adote', (req, res) => {  
const relatorio1 = 'adocao';
relatorio1 = req.params.tabela;
executeAllQueries()
.then((results) =>{
const{adocao}=results;
res.render('adote', { model:adocao, relatorio1: relatorio1
});   
})
.catch((error) => {
res.render('error', { error: error });      
});
});

app.get('/adotante', (req, res) => {  
executeAllQueries()
.then((results) =>{
const{sql_adotante}=results;
res.render('adotante', { model:sql_adotante 
});   
})
.catch((error) => {
res.render('error', { error: error });      
});
});  

app.get('/form_adote', (req, res) => {
executeAllQueries()
.then((results) =>{
const{adotante}=results;
res.render('form_adote', { model:adotante
});   
})
.catch((error) => {
res.render('error', { error: error });      
});
});


app.get('/form_adotante', (req, res) => { { res.render('form_adotante');}});

//Buscar CEP
app.get('/cep', (req, res) => { res.render('cep');});

// Atualizar pagina
app.put('/cep', (req, res) => { res.render('cep');});

app.get('/form_adocao', (req, res) => res.render('form_adocao'));

app.get('/form_adotado', (req, res) => res.render('form_adotado'));

// Castração
app.get('/castracao', (req, res) => {
executeAllQueries()
.then((results) =>{
const{sql_castracao}=results;
res.render('castracao', { model:sql_castracao
});   
})
.catch((error) => {
res.render('error', { error: error });      
});
});

app.get('/form_castracao', (req, res) => res.render('form_castracao'));

// Doação
app.get('/doacao', (req, res) => res.render('doacao'));

app.get('/form_doe', (req, res) => res.render('form_doe'));

// Parceria
app.get('/parceria', (req, res) => {
executeAllQueries()
.then((results) =>{
const{parceria}=results;
res.render('parceria', { model:parceria
});   
})
.catch((error) => {
res.render('error', { error: error });      
});
});

app.get('/form_parceria', (req, res) => res.render('form_parceria'));

// Procura-se
app.get('/procura_se', (req, res) => {
executeAllQueries()
.then((results) =>{
const{procura_se}=results;
res.render('procura_se', { model:procura_se
});   
})
.catch((error) => {
res.render('error', { error: error });      
});
});

app.get('/form_procura_se', (req, res) => res.render('form_procura_se'));

// Sobre
app.get('/sobre', (req, res) => { res.render('sobre');});

// Gerador de pdf
app.get('/relatorio/:tabela', (req, res) => { 
// 1 Seleçầo de tabela
const tabela = req.params.tabela;

//  busca no banco de dados
const sql = 
`SELECT  *, 
strftime('%Y', origem) AS ANO, 
strftime('%B', origem) AS MES 
FROM ${tabela} 
ORDER BY MES  ASC;
GROUP BY ANO;
`

db.all(sql, [], (error, rows) => {
if (error) return res.render('error', { error: error })   
res.render('relatorio', {model: rows, tabela:tabela});  

});  
});  




app.put('/relatorio', (req, res) => { res.render('relatorio')});


// Erro
app.get('/error/<error>', (req, res) => { res.render('error') });

//Rotas POST
// Cadastro de pets para adoção
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
contato: req.body.contato,
whatsapp: req.body.whatsapp
};
console.log(forms);
insert_adocao(forms.arquivo, forms.nome, forms.idade, forms.especie, forms.porte, forms.caracteristicas, forms.responsavel, forms.contato, forms.whatsapp);
res.redirect('/home')
});

// Historia de adotados
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
res.redirect('/home');
});

// Formulario de Adoção
app.post('/form_adotante',(req, res) => {
const form3 ={
quiz1: req.body.q1,
quiz2: req.body.q2,
quiz3: req.body.q3,
tutor: req.body.tutor,
contato: req.body.contato,
whats: req.body.whatsapp,
cep:  req.body.cep,
endereco:  req.body.endereco,
numero: req.body.numero,
complemento: req.body.complemento,
bairro:  req.body.bairro,
cidade:  req.body.cidade,
estado:  req.body.estado  
};  
insert_adotante( form3.quiz1, form3.quiz2, form3.quiz3, form3.tutor, form3.contato, form3.whats, form3.cep, form3.endereco, form3.numero, form3.complemento, form3.bairro, form3.cidade, form3.estado);
res.redirect('/home');
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
whats: req.body.whatsapp,
arquivo: final,
idade: req.body.idade_pet,
especie: req.body.especie,
porte: req.body.porte,
clinica: req.body.clinica,
agenda: req.body.agenda
}
console.log(form2);
insert_castracao(form2.nome, form2.contato, form2.whats, form2.arquivo, form2.idade, form2.especie, form2.porte, form2.clinica, form2.agenda);    
res.redirect('/home')
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
res.redirect('/home');
});

app.post('/form_parceria', (req, res) => {
form9 = {
empresa: req.body.empresa,
localidade: req.body.localidade,
proposta: req.body.proposta,
representante: req.body.representante,
telefone: req.body.telefone,
whatsapp: req.body.whatsapp,
email: req.body.email
};
insert_parceria(form9.empresa, form9.localidade, form9.proposta, form9.representante, form9.telefone,  form9.whatsapp, form9.email)
res.redirect('/parceria')
});

let key5 = 'home';
app.post('/form_home', arq_filtro(key5).single('arquivo'),(req, res) => {

let dest = req.file.destination;
let temp = req.file.filename;
let final = req.file.originalname;

fs.rename(dest + temp, dest + final, error => {
if (error) return res.render('error', { error: error });
console.log('Arquivo ENVIADO.');
});
console.log(dest, temp, final)
form10 ={
arquivo: final,
titulo: req.body.titulo,
mensagem: req.body.mensagem
}
insert_home(form10.arquivo, form10.titulo, form10.mensagem)
res.redirect('/home')
});


  // ESTA É A DEFINIÇÃO CORRETA A SER MODIFICADA
  app.post('/relatorio/:tabela', (req, res) => {
    const tabela = req.params.tabela;
    // Validação básica do nome da tabela (ADICIONADO PARA SEGURANÇA)
    const tabelasPermitidas = ['adocao', 'adotante', 'adotado', 'castracao', 'procura_se', 'parceria', 'home'];
    if (!tabelasPermitidas.includes(tabela)) {
        console.error(`Tentativa de acesso a tabela inválida: ${tabela}`);
        return res.status(400).render('error', { error: 'Nome de tabela inválido.' });
    }

    const sql = `SELECT *,
    strftime('%Y', origem) AS ANO,
    strftime('%B', origem) AS MES
    FROM ${tabela}
    ORDER BY ANO ASC, MES ASC;`;
    
    
    db.all(sql, [], (error, rows) => {
        if (error) {
            console.error("Erro na consulta SQL:", error);
            return res.status(500).render('error', { error: 'Erro ao buscar dados para o relatório.' });
        }
        if (!rows || rows.length === 0) {
            // É melhor retornar um erro ou uma mensagem na página do que gerar um PDF vazio
            return res.status(404).render('error', { error: `Nenhum dado encontrado para a tabela ${tabela}` });
        }

        const pdfDir = './static/uploads/pdf/';
        try {
            if (!fs.existsSync(pdfDir)) {
                fs.mkdirSync(pdfDir, { recursive: true });
                console.log(`Diretório ${pdfDir} criado.`);
            }
        } catch (mkdirError) {
            console.error("Erro ao criar diretório para PDFs:", mkdirError);
            return res.status(500).render('error', { error: 'Erro interno ao preparar o relatório.' });
        }

        // --- Configuração do PDF ---
        const outputFilename = `${tabela}_${Date.now()}.pdf`;
        const outputPath = path.join(pdfDir, outputFilename);
        const escrita = fs.createWriteStream(outputPath);

        // --- MODIFICAÇÃO: Usar margens menores e layout paisagem para caber mais ---
        const pageMargins = { top: 40, bottom: 40, left: 30, right: 30 };
        const doc = new pdfDocument({
            size: 'A4',
            layout: 'landscape', // Paisagem ajuda com tabelas largas
            margins: pageMargins,
            // autoFirstPage: true // Este é o padrão, não precisa remover a linha abaixo
        });

        escrita.on('error', (err) => {
            console.error("ERRO ao escrever no arquivo PDF:", err);
            // Evita crash se a resposta já foi enviada
            if (!res.headersSent) {
                res.status(500).send('Erro ao gerar o arquivo PDF.');
            }
        });

        escrita.on('finish', () => {
            console.log('PDF gerado com sucesso:', outputPath);
            if (!res.headersSent) {
                res.download(outputPath, `${tabela}_report.pdf`, (downloadErr) => { // Nome de arquivo mais amigável
                    if (downloadErr) {
                        console.error('Erro ao enviar o PDF para o cliente:', downloadErr);
                        // Não precisa enviar outra resposta aqui se o download falhar,
                        // o res.download já tenta lidar com isso.
                    } else {
                        console.log('PDF enviado com sucesso!');
                    }
                    // Limpar o arquivo gerado após o envio (ou falha)
                    fs.unlink(outputPath, (unlinkErr) => {
                        if (unlinkErr) console.error('Erro ao deletar o arquivo PDF gerado:', unlinkErr);
                        else console.log('Arquivo PDF temporário deletado:', outputPath);
                    });
                });
            } else {
                console.log("Cabeçalhos já enviados, não foi possível enviar o PDF para download.");
                 // Limpar o arquivo mesmo se não puder enviar
                 fs.unlink(outputPath, (unlinkErr) => {
                   if (unlinkErr) console.error('Erro ao deletar o arquivo PDF (cabeçalhos já enviados):', unlinkErr);
                 });
            }
        });

        doc.pipe(escrita);

        // --- REMOVER ESTA LINHA ---
        // doc.addPage(); // <--- REMOVA OU COMENTE ESTA LINHA

        // --- Desenhar Cabeçalho do Relatório ---
        const time = new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const reportHeaderText = `Relatório: ${tabela}\nGerado em: ${time}`; // Renomeado para evitar conflito
        doc.fontSize(12).font('Helvetica-Bold').text(reportHeaderText, { align: 'center' });
        doc.moveDown(1.5); // Aumentar espaço após o cabeçalho

        // --- Preparar Dados da Tabela ---
        const tableData = rows; // Já temos os dados de 'rows'

        // Verifica se há dados antes de tentar acessar tableData[0]
        if (!tableData || tableData.length === 0) { 
           console.warn(`Nenhum dado em tableData para a tabela ${tabela} após a consulta.`); 
           doc.fontSize(10).font('Helvetica').text('Nenhum dado encontrado para esta tabela.', { align: 'center' }); 
           doc.end(); 
           return; // Sai da função db.all callback
        }


        const table = {
            headers: Object.keys(tableData[0]),
            rows: tableData.map(obj => Object.values(obj).map(val => (val !== null && val !== undefined ? String(val) : '')))
        };

        // Remover colunas ('arquivo', 'ANO', 'MES') ANTES de calcular larguras
        const columnsToRemove = ['arquivo'];
        columnsToRemove.forEach(colName => {
            const colIndex = table.headers.indexOf(colName);
            if (colIndex > -1) {
                table.headers.splice(colIndex, 1);
                table.rows.forEach(row => row.splice(colIndex, 1));
            }
        });

        // Agrupar por ano e criar cabeçalhos de ano
        const groupedByYear = {};
        tableData.forEach(row => {
            const year = row.ANO;
            if (!groupedByYear[year]) {
                groupedByYear[year] = [];
            }
            groupedByYear[year].push(row);
        });
        const years = Object.keys(groupedByYear).sort();
        
        



        // --- Calcular Larguras das Colunas ---
        const tableTop = doc.y; // Pega a posição Y atual após o cabeçalho
        const tableLeft = doc.page.margins.left;
        const availableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const tableRight = doc.page.width - doc.page.margins.right;
        const rowHeight = 14; // Altura da linha (ajuste se necessário)
        const defaultRatio = 1.0;
        const columnWidthRatios = {}; 
        let totalRatio = 0;

        if (table.headers.length === 0) {
           console.warn(`Nenhuma coluna restante na tabela ${tabela} após remover colunas.`);
           doc.fontSize(10).font('Helvetica').text('Nenhuma coluna para exibir.', { align: 'center' });
           doc.end();
           return;
        }


        table.headers.forEach(header => {
            let ratio = defaultRatio;
            
            if (header === 'id') ratio = 0.3;
            else if (['nome', 'pet', 'empresa', 'titulo', 'tutor'].includes(header)) ratio = 1.5;
            else if (['caracteristicas', 'historia', 'proposta', 'mensagem', 'endereco'].includes(header)) ratio = 2.5;
            else if (['contato', 'whatsapp', 'email', 'localidade', 'representante', 'telefone'].includes(header)) ratio = 1.2;
            else if (['idade', 'especie', 'porte', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'cep', 'clinica', 'agenda', 'local'].includes(header)) ratio = 0.8; 
            else if (['q1', 'q2', 'q3','qTotal'].includes(header)) ratio = 0.5; // Ainda menores
            columnWidthRatios[header] = ratio;
            totalRatio += ratio;
        });

        const columnWidths = {};
        table.headers.forEach(header => {
            // Garante que totalRatio não seja zero para evitar divisão por zero
            columnWidths[header] = totalRatio > 0 ? (columnWidthRatios[header] / totalRatio) * availableWidth : availableWidth / table.headers.length;
        });

        // --- Definir Tamanhos de Fonte e Padding ---
        const headerFontSize = 7;
        const cellFontSize = 6;
        const cellPadding = 2; // Um pouco mais de padding pode ajudar na leitura

        // --- Desenhar Cabeçalhos da Tabela ---
        doc.font('Helvetica-Bold').fontSize(headerFontSize); 
        let currentX_draw = tableLeft;
        table.headers.forEach((hText) => {
            const currentColumnWidth = columnWidths[hText];
            let fillColor = '#E0E0E0'; // Cinza claro padrão
            // Pode adicionar cores específicas se quiser
            // if (hText === 'id') fillColor = '#D0D0D0';

            doc.fillColor(fillColor).rect(currentX_draw, tableTop, currentColumnWidth, rowHeight).fill().fillColor('black'); // Cor do texto preta
            doc.text(hText, currentX_draw + cellPadding, tableTop + cellPadding, {
                width: currentColumnWidth - (cellPadding * 2),
                align: 'center'
            });
            currentX_draw += currentColumnWidth;
        });
        // Linha abaixo dos cabeçalhos
        doc.moveTo(tableLeft, tableTop + rowHeight).lineTo(tableRight, tableTop + rowHeight).lineWidth(0.5).strokeColor('#333333').stroke();

        let currentY = tableTop + rowHeight; // Começa abaixo dos cabeçalhos

        years.forEach(year => {
            // Desenha o cabeçalho do ano
            const yearHeaderTop = currentY;
            doc.font('Helvetica-Bold').fontSize(headerFontSize).fillColor('black');
            doc.text(`Ano: ${year}`, tableLeft, yearHeaderTop, { align: 'left' });
            currentY += rowHeight; // Move para baixo para a próxima linha

            // Desenha a linha abaixo do cabeçalho do ano
            doc.moveTo(tableLeft, currentY).lineTo(tableRight, currentY).lineWidth(0.5).strokeColor('#333333').stroke();

            // --- Desenhar Linhas e Células da Tabela ---
            doc.font('Helvetica').fontSize(cellFontSize);

            groupedByYear[year].forEach((row) => {
                const rowTop = currentY;
                // Verifica se a próxima linha caberia na página (IMPORTANTE para evitar corte)
                // Se não couber, não desenha mais (pois o objetivo é uma página só)
                if (rowTop + rowHeight > doc.page.height - doc.page.margins.bottom) {
                    console.warn(`Conteúdo da tabela ${tabela} excedeu a altura da página. Algumas linhas podem não ser exibidas.`);
                    // Poderia adicionar uma nota no PDF aqui se quisesse
                    // doc.addPage(); // NÃO adicionar página nova
                    return; // Para de desenhar linhas
                }

                const calculatedRowHeight = rowHeight; // Mantém altura fixa
                let currentX_cell = tableLeft;

                // Mapeia os valores da linha para a ordem dos cabeçalhos
                const rowValues = table.headers.map(header => row[header]);

                rowValues.forEach((cell, j) => {
                    const currentColumnHeader = table.headers[j];
                    // Tratamento de erro caso header não exista (improvável aqui, mas seguro)
                    const currentColumnWidth = columnWidths[currentColumnHeader] || (availableWidth / table.headers.length);
                    const cellX = currentX_cell + cellPadding;
                    const cellY = rowTop + cellPadding;
                    const textWidth = currentColumnWidth - (cellPadding * 2);
                    const textOptions = {
                        width: textWidth,
                        align: 'center',
                        lineBreak: false, // Não quebrar linha
                        ellipsis: true    // Adicionar '...' se não couber
                    };

                    // Desenha o texto da célula
                    doc.fillColor('black').text(cell, cellX, cellY, textOptions);

                    currentX_cell += currentColumnWidth;
                });

                // Linha abaixo da linha de dados
                doc.moveTo(tableLeft, rowTop + calculatedRowHeight).lineTo(tableRight, rowTop + calculatedRowHeight).lineWidth(0.5).strokeColor('#cccccc').stroke();
                currentY += calculatedRowHeight;
            });

            const finalTableBottom = currentY; // Posição final da tabela

            // --- Desenhar Linhas Verticais ---
            let currentVerticalX = tableLeft;
            table.headers.forEach(hText => {
                const currentColumnWidth = columnWidths[hText];
                doc.moveTo(currentVerticalX, tableTop)
                   .lineTo(currentVerticalX, finalTableBottom) // Desenha até o fim da última linha
                   .lineWidth(0.5).strokeColor('#cccccc').stroke();
                currentVerticalX += currentColumnWidth;
            });
            // Desenha a última linha vertical na borda direita
            doc.moveTo(tableRight, tableTop)
               .lineTo(tableRight, finalTableBottom)
               .lineWidth(0.5).strokeColor('#cccccc').stroke();
        });





        // --- Finalizar o PDF ---
        doc.end();

    }); // Fim do db.all callback
}); // Fim da rota app.post




//Rotas alternativas
//Delete
app.post('/delete/adocao/:id/:arq', (req, res) => {
const id = req.params.id;
const arq = req.params.arq;
const sql = `DELETE FROM adotado WHERE id =  ?`;
db.run(sql, id, (error) => {
if (error) res.render('error', { error: error })
console.log('DELETADO com sucesso!!!' )
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
console.log('DELETADO com sucesso!!!' )
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
console.log('DELETADO com sucesso!!!' )
res.redirect('/adocao')
});
const  caminho = `./static/uploads/${arq}`;
fs.unlinkSync(caminho, error => {
console.log(error)
}) 
});
app.post('/delete/procura_se/:id/:arq', (req, res) => {
const id = req.params.id;
const arq = req.params.arq;
const sql = `DELETE FROM procura_se WHERE id =  ?`;
db.run(sql, id, (error) => {
if (error) res.render('error', { error: error })
console.log('DELETADO com sucesso!!!' )
res.redirect('/procura_se')

});
const  caminho = `./static/uploads/procura_se/${arq}`;
fs.unlinkSync(caminho, error => {
console.log(error)
}) 
});
app.post('/delete/parceria/:id', (req, res) => {
const id = req.params.id;
const sql = `DELETE FROM parceria WHERE id = ?;`
db.run(sql, id, (error) => {
if (error) res.render('error', { error: error })
console.log('DELETADO com sucesso!!!' )
res.redirect('/parceria')
})
});

app.post('/delete/form_adotante/:id', (req, res) => {
const id = req.params.id;
const sql = `DELETE FROM adotante WHERE id = ?;`
db.run(sql, id, (error) => {
if (error) res.render('error', { error: error })
console.log('DELETADO com sucesso!!!' )
res.redirect('/adote')
})
});

app.post('/delete_home/:id/:arq', (req, res) =>{
const id = req.params.id;
const arq = req.params.arq;
const sql = `DELETE FROM  home WHERE id = ?;`
db.run(sql, id, (error) => {
if (error) res.render('error', { error: error })
console.log('DELETADO com sucesso!!!' )
res.redirect('/home')
});
const caminho = `./static/uploads/home/${arq}`;
fs.unlinkSync(caminho, error => {
console.log(error)
})
});

app.listen(port, (error) => {
if (error) return res.render('error', { error: error })
console.log(`Aplicação ATIVA em http://localhost:${port}`)

});

module.exports = {
path: path
};