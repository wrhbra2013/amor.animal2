   // routes/relatorioRoutes.js
   const express = require('express');
   const { db } = require('../database/database'); // Importa a instância do banco SQLite
   const fsPromises = require('fs').promises;
   const fsNode = require('fs'); // Para streams síncronos e verificação de existência
   const path = require('path');
   const { isAdmin } = require('../middleware/auth');
   const router = express.Router();
   
   const PdfPrinter = require('pdfmake');
   
   // Função para sanitizar texto para o PDF
   function sanitizeTextForPdf(text) {
       if (text === null || text === undefined) {
           return '';
       }
       let str = String(text);
       // eslint-disable-next-line no-control-regex
       str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
       str = str.replace(/^\s+|\s+$/g, '').replace(/ +/g, ' ');
       return str;
   }
   
   const fontDescriptors = {
       Roboto: {
           normal: path.join(__dirname, '..', 'static', 'fonts', 'Roboto-Regular.ttf'),
           bold: path.join(__dirname, '..', 'static', 'fonts', 'Roboto-Medium.ttf'),
           italics: path.join(__dirname, '..', 'static', 'fonts', 'Roboto-Italic.ttf'),
           bolditalics: path.join(__dirname, '..', 'static', 'fonts', 'Roboto-MediumItalic.ttf')
       }
   };
   
   Object.values(fontDescriptors.Roboto).forEach(fontPath => {
       if (!fsNode.existsSync(fontPath)) {
           console.warn(`[PDF Font Warning] Arquivo de fonte não encontrado: ${fontPath}. Isso pode causar erros na geração do PDF ou PDF inválido.`);
       }
   });
   
   const printer = new PdfPrinter(fontDescriptors);
   
   const TABELAS_PERMITIDAS = ['adocao', 'adotante', 'adotado', 'castracao', 'procura_se', 'parceria', 'home', 'login', 'voluntario','coleta'];
   const TABELAS_COM_COLUNA_ORIGEM = ['adocao', 'adotante', 'adotado', 'castracao', 'procura_se', 'parceria', 'home', 'login','voluntario','coleta'];
   
   async function fetchReportData(tabela) {
       if (!TABELAS_PERMITIDAS.includes(tabela)) {
           const error = new Error(`Nome de tabela inválido: ${tabela}`);
           error.status = 400;
           throw error;
       }
   
       let sql;
       let selectFields = "*";
   
       if (TABELAS_COM_COLUNA_ORIGEM.includes(tabela.toLowerCase())) {
           selectFields = `*,
                           strftime('%d/%m/%Y %H:%M:%S', origem) AS data,
                           CAST(strftime('%Y', origem) AS INTEGER) AS ANO,
                           CAST(strftime('%m', origem) AS INTEGER) AS MES_NUM,
                           CASE strftime('%m', origem)
                               WHEN '01' THEN 'Janeiro'
                               WHEN '02' THEN 'Fevereiro'
                               WHEN '03' THEN 'Março'
                               WHEN '04' THEN 'Abril'
                               WHEN '05' THEN 'Maio'
                               WHEN '06' THEN 'Junho'
                               WHEN '07' THEN 'Julho'
                               WHEN '08' THEN 'Agosto'
                               WHEN '09' THEN 'Setembro'
                               WHEN '10' THEN 'Outubro'
                               WHEN '11' THEN 'Novembro'
                               WHEN '12' THEN 'Dezembro'
                               ELSE ''
                           END AS MES_NOME`;
           sql = `SELECT ${selectFields} FROM ${tabela}`;
       } else {
           sql = `SELECT ${selectFields} FROM ${tabela};`;
       }
   
       try {
           const rowsFromDb = await new Promise((resolve, reject) => {
               db.all(sql, [], (err, rows) => {
                   if (err) return reject(err);
                   resolve(rows || []);
               });
           });
           return rowsFromDb;
       } catch (dbError) {
           console.error(`[fetchReportData] Erro de banco de dados para '${tabela}':`, dbError.message);
           const errorToThrow = new Error(`Erro ao consultar dados da tabela '${tabela}': ${dbError.message}`);
           errorToThrow.status = dbError.status || 500;
           throw errorToThrow;
       }
   }
   
   router.get('/', isAdmin, (req, res) => {
       res.render('relatorio', { tabelas: TABELAS_PERMITIDAS });
   });
   
   router.get('/:tabela', isAdmin, async (req, res) => {
       const tabela = req.params.tabela;
       try {
           const data = await fetchReportData(tabela);
           // MES_NOME será usado para exibição, MES_NUM para lógica interna se necessário.
           const columnsToHideForHtml = ['origem', 'ANO', 'MES_NUM', 'MES_NOME','isAdmin']; 
   
           const sanitizedData = data.map(row => {
               const sanitizedRow = {};
               for (const key in row) {
                   if (!columnsToHideForHtml.includes(key)) {
                       sanitizedRow[key] = sanitizeTextForPdf(row[key]);
                   }
               }
               return sanitizedRow;
           });
           res.render('relatorio', { model: sanitizedData, tabela: tabela, tabelas: TABELAS_PERMITIDAS });
       } catch (error) {
           console.error(`Erro GET /relatorio/${tabela}:`, error.message);
           const statusCode = error.status || 500;
           res.status(statusCode).render('error', {
               error: error.message || 'Erro ao buscar dados para o relatório.'
           });
       }
   });
   
   router.post('/:tabela', isAdmin, async (req, res) => {
       const tabela = req.params.tabela;
       let outputPath = '';
   
       try {
           const tableData = await fetchReportData(tabela);
   
           if (!tableData || tableData.length === 0) {
               return res.status(404).render('error', { error: `Nenhum dado encontrado para a tabela ${tabela}.` });
           }
   
           const columnsToRemoveForPdf = ['arquivo', 'ANO', 'MES_NUM', 'MES_NOME', 'origem', 'isAdmin','whatsapp'];
           let tableHeaders = [];
           if (tableData.length > 0 && tableData[0]) {
               const originalHeaders = Object.keys(tableData[0]);
               tableHeaders = originalHeaders.filter(header =>
                   !columnsToRemoveForPdf.includes(header) &&
                   tableData[0][header] !== undefined
               );
           }
   
           const groupedByYearAndMonth = {};
           tableData.forEach(row => {
               const year = (row.ANO !== null && row.ANO !== undefined && String(row.ANO).trim() !== '')
                   ? String(row.ANO)
                   : "Dados Sem Agrupamento por Ano";
               
               const monthNum = (row.MES_NUM !== null && row.MES_NUM !== undefined && String(row.MES_NUM).trim() !== '')
                   ? parseInt(String(row.MES_NUM), 10) // Guardar como número para ordenação
                   : 0; // Para "Dados Sem Agrupamento"
               
               const monthName = (row.MES_NOME !== null && row.MES_NOME !== undefined && String(row.MES_NOME).trim() !== '')
                   ? String(row.MES_NOME)
                   : "Mês Não Especificado";
   
               if (!groupedByYearAndMonth[year]) {
                   groupedByYearAndMonth[year] = {};
               }
               if (!groupedByYearAndMonth[year][monthName]) {
                   groupedByYearAndMonth[year][monthName] = { monthNum: monthNum, data: [] };
               }
   
               const rowForDisplay = {};
               tableHeaders.forEach(header => {
                   let cellValue = row[header];
                   let displayValue = sanitizeTextForPdf(cellValue);
   
                   if (header.toLowerCase() === 'status' && typeof displayValue === 'string') {
                       displayValue = displayValue.replace(/pending/gi, 'Pendente')
                                          .replace(/approved/gi, 'Aprovado')
                                          .replace(/rejected/gi, 'Rejeitado');
                   }
                   if (header.toLowerCase() === 'descricao' && typeof displayValue === 'string') {
                       displayValue = displayValue.replace(/\n\s*\n/g, '\n');
                   }
                   rowForDisplay[header] = displayValue;
               });
               groupedByYearAndMonth[year][monthName].data.push(rowForDisplay);
           });
   
           const content = [];
           const time = new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
           content.push({ text: sanitizeTextForPdf(`ONG Amor Animal Marilia.`), style: 'mainHeader' });
           content.push({ text: sanitizeTextForPdf(`Relatório: ${tabela.charAt(0).toUpperCase() + tabela.slice(1)}`), style: 'subHeader' });
           content.push({ text: sanitizeTextForPdf(`Gerado em: ${time}`), style: 'subHeader', margin: [0, 0, 0, 20] });
   
           if (tableHeaders.length === 0) {
               content.push({ text: 'Nenhuma coluna para exibir (sem dados ou sem cabeçalhos definidos).', alignment: 'center' });
           } else {
               const columnWidths = tableHeaders.map(header => {
                   if (header === 'id') return 'auto';
                   if (['caracteristicas', 'historia', 'proposta', 'mensagem', 'descricao', 'data', 'complemento', 'quantidade','numero'].includes(header.toLowerCase())) return 'auto';
                   return '*';
               });

               const abbreviatedHeaders = {
                   'caracteristicas': 'Carac.',
                   'historia': 'Hist.',
                   'proposta': 'Prop.',
                   'mensagem': 'Msg.',
                   'descricao': 'Desc.',
                   'complemento':'Compl.',
                   'quantidade':'Quant.',
                   'numero':'No.'
                   

               };
   
               const years = Object.keys(groupedByYearAndMonth).sort((a, b) => {
                   if (a === "Dados Sem Agrupamento por Ano") return 1;
                   if (b === "Dados Sem Agrupamento por Ano") return -1;
                   return a.localeCompare(b); // Ordena anos
               });
   
               years.forEach(year => {
                   content.push({ text: sanitizeTextForPdf(`Ano: ${year}`), style: 'yearHeader' });
                   
                   const monthsOfYear = groupedByYearAndMonth[year];
                   const sortedMonthNames = Object.keys(monthsOfYear).sort((a, b) => {
                       // Ordena os meses pelo monthNum armazenado
                       if (monthsOfYear[a].monthNum === 0) return 1; // "Mês Não Especificado" ao final
                       if (monthsOfYear[b].monthNum === 0) return -1;
                       return monthsOfYear[a].monthNum - monthsOfYear[b].monthNum;
                   });
 
                   sortedMonthNames.forEach(monthName => {
                       content.push({ text: sanitizeTextForPdf(`Mês: ${monthName}`), style: 'monthHeader' });
                       
                       const monthData = monthsOfYear[monthName].data;
                       if (monthData.length === 0) {
                           content.push({ text: sanitizeTextForPdf(`Nenhum dado encontrado para ${monthName} de ${year}.`), style: 'subHeader', margin: [0, 5, 0, 10] });
                           return;
                       }
 
                       const tableBody = [];
                       tableBody.push(tableHeaders.map(header => ({
                           text: sanitizeTextForPdf(header.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())),
                           text: abbreviatedHeaders[header.toLowerCase()] || sanitizeTextForPdf(header.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())),
                           style: 'tableHeader',
                           alignment: 'center'
                       })));
       
                       monthData.forEach(dataRow => {
                           const rowContent = tableHeaders.map(header => ({
                               text: dataRow[header] !== undefined ? dataRow[header] : '',
                               style: 'tableCell'
                           }));
                           tableBody.push(rowContent); // Adiciona a linha de dados
                       });
       
                       if (tableBody.length > 1) { // Só adiciona a tabela se houver dados (além do cabeçalho)
                           content.push({
                               table: { headerRows: 1, widths: columnWidths, body: tableBody },
                               layout: {
                                   hLineWidth: (i, node) => (i === 0 || i === node.table.body.length || i === 1) ? 0.5 : 0.5,
                                   vLineWidth: () => 0.5,
                                   hLineColor: () => '#333333',
                                   vLineColor: () => '#cccccc',
                                   paddingLeft: () => 3, paddingRight: () => 3, paddingTop: () => 2, paddingBottom: () => 2
                               }
                           });
                           content.push({ text: ' ', margin: [0, 10] }); // Espaço entre tabelas de meses
                       }
                   });
                   content.push({ text: ' ', margin: [0, 15] }); // Espaço maior entre anos
               });
           }
   
           const docDefinition = {
               content: content,
               pageSize: 'A4',
               pageOrientation: 'portrait', //or landscape (paisagem ou retyrato)
               pageMargins: [20, 30, 20, 50],
               styles: {
                   mainHeader: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 0, 0, 5], color: '#333333' },
                   subHeader: { fontSize: 10, alignment: 'center', margin: [0, 0, 0, 5] },
                   yearHeader: { fontSize: 14, bold: true, margin: [0, 15, 0, 5], color: '#222222' },
                   monthHeader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5], color: '#444444' },
                   tableHeader: { bold: true, fontSize: 7, fillColor: '#E0E0E0', alignment: 'center' },
                   tableCell: { fontSize: 6, alignment: 'left' },
                   footerStyle: { fontSize: 8, alignment: 'center', margin: [0, 20, 0, 0] }
               },
               defaultStyle: { font: 'Roboto' },
               footer: (currentPage, pageCount) => ({
                   text: sanitizeTextForPdf(`Página ${currentPage.toString()} de ${pageCount.toString()}`),
                   style: 'footerStyle'
               })
           };
   
           const pdfDir = path.join(__dirname, '..', 'static', 'uploads', 'pdf');
           await fsPromises.mkdir(pdfDir, { recursive: true });
   
           const outputFilename = `${tabela}_${Date.now()}.pdf`;
           outputPath = path.join(pdfDir, outputFilename);
   
           const pdfDoc = printer.createPdfKitDocument(docDefinition);
           const writeStream = fsNode.createWriteStream(outputPath);
           
           let streamError = null;
           pdfDoc.on('error', (err) => {
               streamError = err;
               console.error("Erro no stream interno do PDFKit:", err);
               if (!writeStream.destroyed) writeStream.end();
           });
   
           pdfDoc.pipe(writeStream);
           pdfDoc.end();
   
           await new Promise((resolve, reject) => {
               writeStream.on('finish', () => {
                   if (streamError) {
                       reject(new Error(`Falha na geração do PDF devido a erro no stream: ${streamError.message}`));
                   } else {
                       resolve();
                   }
               });
               writeStream.on('error', (err) => {
                   reject(new Error(`Erro ao escrever arquivo PDF no disco: ${err.message}`));
               });
           });
   
           console.log('PDF gerado com sucesso:', outputPath);
           res.download(outputPath, `${tabela}_report.pdf`, async (downloadErr) => {
               if (downloadErr) {
                   console.error('Erro ao enviar o PDF para o cliente:', downloadErr);
               }
               try {
                   await fsPromises.unlink(outputPath);
                   console.log('Arquivo PDF temporário deletado:', outputPath);
               } catch (unlinkErr) {
                   if (unlinkErr.code !== 'ENOENT') {
                       console.error('Erro ao deletar o arquivo PDF gerado:', unlinkErr);
                   }
               }
           });
   
       } catch (error) {
           console.error("Erro durante a geração do PDF:", error.message, error.stack);
           if (outputPath) {
               try {
                   if (fsNode.existsSync(outputPath)) {
                      await fsPromises.unlink(outputPath);
                      console.log('Arquivo PDF parcialmente gerado deletado devido a erro:', outputPath);
                   }
               } catch (cleanupErr) {
                   if (cleanupErr.code !== 'ENOENT') {
                       console.error('Erro ao tentar limpar arquivo PDF após falha:', cleanupErr);
                   }
               }
           }
           if (!res.headersSent) {
               const statusCode = error.status || 500;
               const userMessage = (error.status === 400 || error.status === 404) ? error.message : 'Erro interno ao gerar o relatório PDF.';
               res.status(statusCode).render('error', { error: userMessage });
           }
       }
   });
   
   router.post('/delete/:tabela/:id', isAdmin, async (req, res) => {
       const tabela = req.params.tabela;
       const id = req.params.id;
   
       if (!TABELAS_PERMITIDAS.includes(tabela)) {
           return res.status(400).render('error', { error: 'Nome de tabela inválido para exclusão.' });
       }
   
       const sql = `DELETE FROM ${tabela} WHERE id = ?`;
   
       try {
           const changes = await new Promise((resolve, reject) => {
               db.run(sql, [id], function(err) {
                   if (err) return reject(err);
                   resolve(this.changes);
               });
           });
           
           if (changes === 0) {
               return res.status(404).render('error', { error: `Registro com id ${id} não encontrado na tabela ${tabela}.` });
           }
           console.log(`Registro deletado com sucesso: tabela ${tabela}, id ${id}`);
           res.redirect(`/relatorio/${tabela}`);
       } catch (error) {
           console.error(`Erro ao deletar registro: tabela ${tabela}, id ${id}:`, error.message);
           res.status(500).render('error', { error: `Erro ao deletar registro na tabela ${tabela}.` });
       }
   });
   
   module.exports = router;
  
 