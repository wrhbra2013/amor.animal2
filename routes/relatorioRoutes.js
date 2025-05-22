  // routes/relatorioRoutes.js
  const express = require('express');
  const { db } = require('../database/database');
  const fs = require('fs'); // Mantenha para manipulação de arquivos
  const path = require('path');
  // const pdfDocument = require('pdfkit'); // Remova ou comente pdfkit
  const { isAdmin } = require('../middleware/auth');
  const router = express.Router();
  
  // SUBSTITUA PELA IMPORTAÇÃO DA SUA BIBLIOTECA PDF
  // Exemplo se fosse pdfmake:
  const PdfPrinter = require('pdfmake');
  const printer = new PdfPrinter({
      Roboto: { // Exemplo de configuração de fonte para pdfmake
          normal: path.join(__dirname, '..', '/static/fonts/Roboto-Regular.ttf'),
          bold: path.join(__dirname, '..', '/static/fonts/Roboto-Medium.ttf'),
          italics: path.join(__dirname, '..', '/static/fonts/Roboto-Italic.ttf'),
          bolditalics: path.join(__dirname, '..', '/static/fonts/Roboto-MediumItalic.ttf')
      }
  });
  // Se for "mudder-pdf", use a importação correta:
  // const MudderPDF = require('mudder-pdf'); // Nome hipotético
  
  router.get('/', isAdmin, (req, res) => {
      const tabelas = ['adocao', 'adotante', 'adotado', 'castracao', 'procura_se', 'parceria', 'home', 'login'];
      res.render('relatorio', { tabelas: tabelas });
  });
  
  // Rota GET para visualização prévia (se necessário, pode ser mantida ou adaptada)
  router.get('/:tabela', isAdmin, (req, res) => {
      const tabela = req.params.tabela;
      const tabelasPermitidas = ['adocao', 'adotante', 'adotado', 'castracao', 'procura_se', 'parceria', 'home', 'login'];
      if (!tabelasPermitidas.includes(tabela)) {
         console.error(`Tentativa de acesso a tabela inválida (GET): ${tabela}`);                
          return res.status(400).render('error', { error: `Tentativa de acesso a tabela inválida (GET): ${tabela} `});
      }
      const sql =
          `SELECT *, 
          strftime('%Y', origem) AS ANO, 
          strftime('%m', origem) AS MES_NUM, -- Usar número do mês para ordenação correta
          CASE strftime('%m', origem)
              WHEN '01' THEN 'Janeiro' WHEN '02' THEN 'Fevereiro' WHEN '03' THEN 'Março'
              WHEN '04' THEN 'Abril' WHEN '05' THEN 'Maio' WHEN '06' THEN 'Junho'
              WHEN '07' THEN 'Julho' WHEN '08' THEN 'Agosto' WHEN '09' THEN 'Setembro'
              WHEN '10' THEN 'Outubro' WHEN '11' THEN 'Novembro' WHEN '12' THEN 'Dezembro'
          END AS MES_NOME
          FROM ${tabela} 
          ORDER BY ANO ASC, MES_NUM ASC;`; // Removido GROUP BY que não fazia sentido aqui
  
      db.all(sql, [], (error, rows) => {
          if (error) return res.render('error', { error: error });
          res.render('relatorio', { model: rows, tabela: tabela, tabelas: tabelasPermitidas }); // Passar tabelas para o <select>
      });
  });
  
  
  // Rota POST para gerar o PDF
  router.post('/:tabela', isAdmin, (req, res) => {
      const tabela = req.params.tabela;
      const tabelasPermitidas = ['adocao', 'adotante', 'adotado', 'castracao', 'procura_se', 'parceria', 'home', 'login'];
      if (!tabelasPermitidas.includes(tabela)) {
          console.error(`Tentativa de acesso a tabela inválida (POST): ${tabela}`);
          return res.status(400).render('error', { error: 'Nome de tabela inválido.' });
      }
  
      const sql = `SELECT *,
          strftime('%Y', origem) AS ANO,
          strftime('%m', origem) AS MES_NUM, -- Usar número do mês para ordenação correta
          CASE strftime('%m', origem)
              WHEN '01' THEN 'Janeiro' WHEN '02' THEN 'Fevereiro' WHEN '03' THEN 'Março'
              WHEN '04' THEN 'Abril' WHEN '05' THEN 'Maio' WHEN '06' THEN 'Junho'
              WHEN '07' THEN 'Julho' WHEN '08' THEN 'Agosto' WHEN '09' THEN 'Setembro'
              WHEN '10' THEN 'Outubro' WHEN '11' THEN 'Novembro' WHEN '12' THEN 'Dezembro'
          END AS MES_NOME
          FROM ${tabela}
          ORDER BY ANO ASC, MES_NUM ASC;`;
  
      db.all(sql, [], (error, rows) => {
          if (error) {
              console.error("Erro na consulta SQL:", error);
              return res.status(500).render('error', { error: 'Erro ao buscar dados para o relatório.' });
          }
          if (!rows || rows.length === 0) {
              return res.status(404).render('error', { error: `Nenhum dado encontrado para a tabela ${tabela}` });
          }
  
          // --- Preparar Dados da Tabela (esta lógica pode ser mantida) ---
          const tableData = rows;
          const columnsToRemove = ['arquivo', 'ANO', 'MES_NUM', 'MES_NOME']; // Colunas auxiliares
          const originalHeaders = Object.keys(tableData[0] || {});
          const tableHeaders = originalHeaders.filter(header => !columnsToRemove.includes(header));
  
          // Agrupar por ano
          const groupedByYear = {};
          tableData.forEach(row => {
              const year = row.ANO; // year pode ser null aqui
           if (!groupedByYear[year]) {
                      groupedByYear[year] = [];
                  }
                  // Adiciona apenas os dados das colunas que serão exibidas
                  const rowForDisplay = {};
                  tableHeaders.forEach(header => {
                      rowForDisplay[header] = row[header] !== null && row[header] !== undefined ? String(row[header]) : '';
                  });
                  groupedByYear[year].push(rowForDisplay);           
          });
          
          const years = Object.keys(groupedByYear).sort();
  
          // --- Construir Definição do Documento para a Biblioteca PDF ---
          const content = [];
  
          // Cabeçalho do Relatório
          const time = new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
          content.push({ text: `ONG Amor Animal`, style: 'mainHeader' , color:'#333333'});
          content.push({ text: `Relatório: ${tabela.charAt(0).toUpperCase() + tabela.slice(1)}`, style: 'subHeader' });
          content.push({ text: `Gerado em: ${time}`, style: 'subHeader', margin: [0, 0, 0, 20] }); // Adiciona margem inferior
  
          if (tableHeaders.length === 0) {
              content.push({ text: 'Nenhuma coluna para exibir.', alignment: 'center' });
          } else {
 
              // Calcular larguras das colunas (adapte conforme a API da sua biblioteca)
              // Exemplo para pdfmake: pode ser '*', 'auto', ou valores numéricos/percentuais
              // A lógica de ratios pode ser adaptada aqui.
              // Por simplicidade, vamos usar '*' para distribuir igualmente:
              const columnWidths = tableHeaders.map(() => '*');
              // Ou, para uma lógica mais customizada (exemplo):
              // const columnWidths = tableHeaders.map(header => {
              //     if (header === 'id') return 'auto';
              //     if (['caracteristicas', 'historia', 'proposta', 'mensagem'].includes(header)) return '30%';
              //     return '*';
              // });
  
  
              years.forEach(year => {
                 const yearText = (year === "null" || year === null) ? "Desconhecido" : year;
                       content.push({ text: `Ano: ${yearText}`, style: 'yearHeader' });
                  
                  
  
                  const tableBody = [];
                  // Adicionar cabeçalhos da tabela (formatados para a biblioteca)
                  tableBody.push(tableHeaders.map(header => ({ text: header, style: 'tableHeader' })));
  
                  // Adicionar linhas de dados
                  groupedByYear[year].forEach(dataRow => {
                      const rowContent = tableHeaders.map(header => ({ text: dataRow[header], style: 'tableCell' }));
                      tableBody.push(rowContent);
                  });
  
                  content.push({
                      table: {
                          headerRows: 1,
                          widths: columnWidths,
                          body: tableBody
                      },
                      // Layout da tabela (bordas, etc.) - específico da biblioteca
                      layout: { // Exemplo de layout similar ao pdfmake
                          hLineWidth: (i, node) => (i === 0 || i === node.table.body.length || i === 1) ? 0.5 : 0.5,
                          vLineWidth: (i, node) => 0.5,
                          hLineColor: (i, node) => (i === 0 || i === node.table.body.length || i === 1) ? '#333333' : '#cccccc',
                          vLineColor: (i, node) => '#cccccc',
                          paddingLeft: () => 3,
                          paddingRight: () => 3,
                          paddingTop: () => 2,
                          paddingBottom: () => 2
                      }
                  });
                  content.push({ text: ' ', margin: [0, 10] }); // Espaço entre tabelas de anos
              });
          }
  
          const docDefinition = {
              content: content,
              pageSize: 'A4',
              pageOrientation: 'portrait', // ou 'landscape'
              pageMargins: [30, 40, 30, 60], // [left, top, right, bottom] - Aumentei a margem inferior para o rodapé
              styles: { // Defina seus estilos
                  mainHeader: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 0, 0, 5] },
                  subHeader: { fontSize: 10, alignment: 'center', margin: [0, 0, 0, 5] },
                  yearHeader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] },
                  tableHeader: { bold: true, fontSize: 7, fillColor: '#E0E0E0', alignment: 'center' },
                  tableCell: { fontSize: 6, alignment: 'left' }, // Alinhar células à esquerda para melhor leitura
                  footerStyle: { fontSize: 8, alignment: 'center', margin: [0, 20, 0, 0] } // Estilo para o rodapé
              },
              defaultStyle: { // Estilo padrão, se a biblioteca suportar
                  // font: 'Roboto' // Se estiver usando pdfmake com fontes customizadas
              },
              // ADICIONAR O RODAPÉ AQUI
              footer: function(currentPage, pageCount) {
                  return {
                      text: `Página ${currentPage.toString()} de ${pageCount.toString()}`,
                      style: 'footerStyle', // Aplica o estilo definido acima
                      // Você pode adicionar mais propriedades aqui, como margens específicas para o rodapé
                      // margin: [esquerda, topo, direita, baixo]
                      // Exemplo: margin: [30, 10, 30, 10] // Se pageMargins não for suficiente
                  };
              }
          };
  
          // --- Gerar PDF com a Biblioteca Escolhida ---
          try {
              const pdfDir = './static/uploads/pdf/';
              if (!fs.existsSync(pdfDir)) {
                  fs.mkdirSync(pdfDir, { recursive: true });
              }
              const outputFilename = `${tabela}_${Date.now()}.pdf`;
              const outputPath = path.join(pdfDir, outputFilename);
              const escrita = fs.createWriteStream(outputPath);
  
              // A GERAÇÃO DO PDF DEPENDE DA API DA SUA BIBLIOTECA
              // Exemplo com pdfmake:
              const pdfDoc = printer.createPdfKitDocument(docDefinition);
              pdfDoc.pipe(escrita);
              pdfDoc.end();             
  
              escrita.on('finish', () => {
                  console.log('PDF gerado com sucesso:', outputPath);
                  if (!res.headersSent) {
                      res.download(outputPath, `${tabela}_report.pdf`, (downloadErr) => {
                          if (downloadErr) {
                              console.error('Erro ao enviar o PDF para o cliente:', downloadErr);
                          }
                          // Deletar o arquivo após o download (ou tentativa)
                          fs.unlink(outputPath, (unlinkErr) => {
                              if (unlinkErr) console.error('Erro ao deletar o arquivo PDF gerado:', unlinkErr);
                              else console.log('Arquivo PDF temporário deletado:', outputPath);
                          });
                      });
                  } else {
                       fs.unlink(outputPath, (unlinkErr) => { // Deletar mesmo se headers já enviados
                          if (unlinkErr) console.error('Erro ao deletar o arquivo PDF (headers já enviados):', unlinkErr);
                       });
                  }
              });
  
              escrita.on('error', (err) => {
                  console.error("ERRO ao escrever no arquivo PDF:", err);
                  if (!res.headersSent) {
                      res.status(500).send('Erro ao gerar o arquivo PDF.');
                  }
                  // Tentar deletar o arquivo em caso de erro na escrita
                  fs.unlink(outputPath, (unlinkErr) => {
                      if (unlinkErr) console.error('Erro ao deletar o arquivo PDF após erro de escrita:', unlinkErr);
                  });
              });
  
          } catch (genError) {
              console.error("Erro durante a preparação ou geração do PDF:", genError);
              res.status(500).render('error', { error: 'Erro interno ao gerar o relatório PDF.' });
          }
      });
  });
  
  module.exports = router;
  
 