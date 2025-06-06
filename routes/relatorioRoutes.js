   // routes/relatorioRoutes.js
   const express = require('express');
  const { db } = require('../database/database'); // Importa a instância do banco SQLite
  const fsPromises = require('fs').promises; // Renomeado para clareza
  const fsNode = require('fs'); // Importa o módulo fs tradicional
  const path = require('path');
  const { isAdmin } = require('../middleware/auth');
  const router = express.Router();
   
   // Configuração do pdfmake (assumindo que é a biblioteca correta)
   const PdfPrinter = require('pdfmake');
   const printer = new PdfPrinter({
       Roboto: {
           normal: path.join(__dirname, '..', '/static/fonts/Roboto-Regular.ttf'),
           bold: path.join(__dirname, '..', '/static/fonts/Roboto-Medium.ttf'),
           italics: path.join(__dirname, '..', '/static/fonts/Roboto-Italic.ttf'),
           bolditalics: path.join(__dirname, '..', '/static/fonts/Roboto-MediumItalic.ttf')
       }
   });
   
   const TABELAS_PERMITIDAS = ['adocao', 'adotante', 'adotado', 'castracao', 'procura_se', 'parceria', 'home', 'login'];
   // Defina quais tabelas possuem a coluna 'origem' e para as quais a formatação de data/hora se aplica.
   const TABELAS_COM_COLUNA_ORIGEM = ['adocao', 'adotante', 'adotado', 'castracao', 'procura_se', 'parceria', 'home', 'login'];
  
   // Função auxiliar para obter nomes dos meses em português
   function getMonthName(monthNumber) {
       const months = [
           'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
           'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
       ];
       // Garante que o número do mês esteja dentro do intervalo válido (1-12)
      if (monthNumber >= 1 && monthNumber <= 12) {
          return months[monthNumber - 1];
      }
      return '';
   }
   
   // Função auxiliar para buscar dados do relatório
   async function fetchReportData(tabela) {
       if (!TABELAS_PERMITIDAS.includes(tabela)) {
           const error = new Error(`Nome de tabela inválido: ${tabela}`);
           error.status = 400;
           throw error;
       }
   
       let sql;
       let selectFields = "*"; // Por padrão, seleciona todos os campos
   
       if (TABELAS_COM_COLUNA_ORIGEM.includes(tabela.toLowerCase())) {
           // Adaptação para SQLite: use strftime para formatar e extrair ano/mês
           selectFields = `*,
                           strftime('%d %m %Y %H:%M', origem) AS origem_formatada,
                           CAST(strftime('%Y', origem) AS INTEGER) AS ANO,
                           CAST(strftime('%m', origem) AS INTEGER) AS MES_NUM`;
           sql = `
               SELECT ${selectFields}
               FROM ${tabela}
           `;
       } else {
           // Para tabelas que não têm 'origem' ou para as quais a formatação não se aplica
           sql = `SELECT ${selectFields} FROM ${tabela};`;
       }
   
       const pool = getPool();
       let rowsFromDb = [];
   
       try {
           // Adaptação para SQLite3 - db.all retorna um array de objetos para todas as linhas.
           rowsFromDb = await new Promise((resolve, reject) => {
               db.all(sql, [], (err, rows) => {
                   if (err) return reject(err);
                   resolve(rows);
               });
           });
               throw new Error(`Formato de dados inesperado do banco para a tabela '${tabela}'.`);
           }
        catch (dbError) {
           console.error(`[fetchReportData] Erro de banco de dados ao executar query para '${tabela}':`, dbError.message);
           const originalErrorMessage = dbError.message;
           dbError.message = `Erro ao consultar dados da tabela '${tabela}': ${originalErrorMessage}`;
           throw dbError;
       }
   
       return rowsFromDb.map(row => {
           const mappedRow = { ...row };
           if (row.MES_NUM !== undefined && row.MES_NUM !== null) {
               mappedRow.MES_NOME = getMonthName(row.MES_NUM);
           }
           // A coluna 'origem_formatada' já estará presente se 'origem' existir e for formatada.
           return mappedRow;
       });
   }
   
   router.get('/', isAdmin, (req, res) => {
       res.render('relatorio', { tabelas: TABELAS_PERMITIDAS });
   });
   
   // Rota GET para visualização prévia
   router.get('/:tabela', isAdmin, async (req, res, next) => {
       const tabela = req.params.tabela;
       try {
           const data = await fetchReportData(tabela);
           res.render('relatorio', { model: data, tabela: tabela, tabelas: TABELAS_PERMITIDAS });
       } catch (error) {
           console.error(`Erro ao buscar dados para GET /relatorio/${tabela}:`, error.message); // Log apenas da mensagem
           const statusCode = error.status || 500;
           res.status(statusCode).render('error', {
               error: error.message || 'Erro ao buscar dados para o relatório.'
           });
       }
   });
   
   // Rota POST para gerar o PDF
  router.post('/:tabela', isAdmin, async (req, res, next) => {
      const tabela = req.params.tabela;
      let outputPath = '';
  
      try {
          const tableData = await fetchReportData(tabela);
  
          if (!tableData || tableData.length === 0) {
              return res.status(404).render('error', { error: `Nenhum dado encontrado para a tabela ${tabela}` });
          }
  
          // --- Preparar Dados da Tabela ---
          // 'origem' original é removida, 'origem_formatada' será mantida se existir nos dados.
          const columnsToRemove = ['arquivo', 'ANO', 'MES_NUM', 'MES_NOME', 'origem'];
          let tableHeaders = [];
          if (tableData.length > 0 && tableData[0]) {
              const originalHeaders = Object.keys(tableData[0]);
              tableHeaders = originalHeaders.filter(header => !columnsToRemove.includes(header) && tableData[0][header] !== undefined);
          }
  
  
          const groupedByYear = {};
          tableData.forEach(row => {
              const year = (row.ANO !== null && row.ANO !== undefined && String(row.ANO).trim() !== '')
                  ? String(row.ANO)
                  : "Dados Não Agrupados por Ano"; 
  
              if (!groupedByYear[year]) {
                  groupedByYear[year] = [];
              }
              const rowForDisplay = {};
              tableHeaders.forEach(header => { 
                  rowForDisplay[header] = row[header] !== null && row[header] !== undefined ? String(row[header]) : '';
              });
              groupedByYear[year].push(rowForDisplay);
          });
          
          const years = Object.keys(groupedByYear).sort((a, b) => {
              if (a.startsWith("Dados Não Agrupados")) return 1; 
              if (b.startsWith("Dados Não Agrupados")) return -1;
              return Number(a) - Number(b);
          });
  
          // --- Construir Definição do Documento para pdfmake ---
          const content = [];
          const time = new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
          content.push({ text: `ONG Amor Animal`, style: 'mainHeader', color: '#333333' });
          content.push({ text: `Relatório: ${tabela.charAt(0).toUpperCase() + tabela.slice(1)}`, style: 'subHeader' });
          content.push({ text: `Gerado em: ${time}`, style: 'subHeader', margin: [0, 0, 0, 20] });
  
          if (tableHeaders.length === 0 && tableData.length > 0) {
               content.push({ text: 'Dados encontrados, mas nenhuma coluna selecionada para exibição.', alignment: 'center' });
          } else if (tableHeaders.length === 0) {
              content.push({ text: 'Nenhuma coluna para exibir.', alignment: 'center' });
          } else {
              const columnWidths = tableHeaders.map(header => {
                   if (header === 'id') return 'auto';
                   // Ajustado para 'origem_formatada'
                   if (['caracteristicas', 'historia', 'proposta', 'mensagem', 'descricao', 'origem_formatada'].includes(header.toLowerCase())) return 'auto'; 
                   return '*';
              });
  
              years.forEach(year => {
                  content.push({ text: `Ano: ${year}`, style: 'yearHeader' });
                  const tableBody = [];
                  tableBody.push(tableHeaders.map(header => ({ text: header, style: 'tableHeader' })));
  
                  groupedByYear[year].forEach(dataRow => {
                      const rowContent = tableHeaders.map(header => ({ text: dataRow[header] !== undefined ? dataRow[header] : '', style: 'tableCell' }));
                      tableBody.push(rowContent);
                  });
  
                  content.push({
                      table: { headerRows: 1, widths: columnWidths, body: tableBody },
                      layout: {
                          hLineWidth: (i, node) => (i === 0 || i === node.table.body.length || i === 1) ? 0.5 : 0.5,
                          vLineWidth: () => 0.5,
                          hLineColor: (i, node) => (i === 0 || i === node.table.body.length || i === 1) ? '#333333' : '#cccccc',
                          vLineColor: () => '#cccccc',
                          paddingLeft: () => 3, paddingRight: () => 3, paddingTop: () => 2, paddingBottom: () => 2
                      }
                  });
                  content.push({ text: ' ', margin: [0, 10] });
              });
          }
  
          const docDefinition = {
              content: content,
              pageSize: 'A4',
              pageOrientation: 'portrait',
              pageMargins: [30, 40, 30, 60],
              styles: {
                  mainHeader: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 0, 0, 5] },
                  subHeader: { fontSize: 10, alignment: 'center', margin: [0, 0, 0, 5] },
                  yearHeader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] },
                  tableHeader: { bold: true, fontSize: 7, fillColor: '#E0E0E0', alignment: 'center' },
                  tableCell: { fontSize: 6, alignment: 'left' },
                  footerStyle: { fontSize: 8, alignment: 'center', margin: [0, 20, 0, 0] }
              },
              defaultStyle: { font: 'Roboto' },
              footer: (currentPage, pageCount) => ({
                  text: `Página ${currentPage.toString()} de ${pageCount.toString()}`,
                  style: 'footerStyle'
              })
          };
  
  
          const pdfDir = './static/uploads/pdf/';
          await fsPromises.mkdir(pdfDir, { recursive: true }); 
  
          const outputFilename = `${tabela}_${Date.now()}.pdf`;
          outputPath = path.join(pdfDir, outputFilename);
  
          const pdfDoc = printer.createPdfKitDocument(docDefinition);
          const writeStream = fsNode.createWriteStream(outputPath);
          pdfDoc.pipe(writeStream);
          pdfDoc.end();
  
          await new Promise((resolve, reject) => {
              writeStream.on('finish', resolve);
              writeStream.on('error', reject);
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
                  console.error('Erro ao deletar o arquivo PDF gerado:', unlinkErr);
              }
          });
  
      } catch (error) {
          console.error("Erro durante a geração do PDF ou busca de dados:", error.message); // Log apenas da mensagem
          if (outputPath) {
              try {
                  await fsPromises.access(outputPath); 
                  await fsPromises.unlink(outputPath); 
                  console.log('Arquivo PDF parcialmente gerado deletado devido a erro:', outputPath);
              } catch (cleanupErr) {
                  if (cleanupErr.code !== 'ENOENT') {
                       console.error('Erro ao tentar limpar arquivo PDF após falha:', cleanupErr);
                  }
              }
          }
          if (!res.headersSent) {
              const statusCode = error.status || 500;
              res.status(statusCode).render('error', {
                  error: error.message || 'Erro interno ao gerar o relatório PDF.'
              });
          }
      }
  });
   
   router.post('/delete/:tabela/:id', isAdmin, async (req, res, next) => {
       const tabela = req.params.tabela;
       const id = req.params.id;
   
       if (!TABELAS_PERMITIDAS.includes(tabela)) {
           console.error(`Tentativa de exclusão em tabela inválida: ${tabela}`);
           return res.status(400).render('error', { error: 'Nome de tabela inválido para exclusão.' });
       }
   
       const sql = `DELETE FROM ${tabela} WHERE id = ?`;
   
       try {
           // Adaptação para SQLite3
           const changes = await new Promise((resolve, reject) => {
               db.run(sql, [id], function(err) {
                   if (err) return reject(err);
                   resolve(this.changes); // this.changes contém o número de linhas afetadas
               });
           });
           const result = { affectedRows: changes }; // Simula o resultado do pool.execute para a lógica abaixo
   
           if (result.affectedRows === 0) {
               console.warn(`Tentativa de deletar registro inexistente na tabela ${tabela} com id ${id}`);
               return res.status(404).render('error', { error: `Registro com id ${id} não encontrado na tabela ${tabela}.` });
           }
           console.log(`Registro deletado com sucesso na tabela ${tabela} com id ${id}`);
           res.redirect(`/relatorio/${tabela}`); 
       } catch (error) {
           console.error(`Erro ao deletar registro na tabela ${tabela} com id ${id}:`, error.message); // Log apenas da mensagem
           res.status(500).render('error', { error: `Erro ao deletar registro na tabela ${tabela}.` });
       }
   });
   
   module.exports = router;
 