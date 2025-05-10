// routes/castracaoRoutes.js
const express = require('express');
const { db } = require('../database/database'); // Adjust path
const fs = require('fs');
const path = require('path');
const pdfDocument = require('pdfkit');
const { isAdmin } = require('../middleware/auth'); // Assuming you moved isAdmin
const router = express.Router();

router.get('/', isAdmin, (req, res) => {
    const tabelas = ['adocao', 'adotante', 'adotado', 'castracao', 'procura_se', 'parceria', 'home'];
    res.render('relatorio', { tabelas: tabelas });
    
})


// Gerador de pdf
router.get('/:tabela',isAdmin, (req, res) => { 

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

// ESTA É A DEFINIÇÃO CORRETA A SER MODIFICADA
router.post('/:tabela', isAdmin,(req, res) => {
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

    const outputFilename = `${tabela}_${Date.now()}.pdf`;
    const outputPath = path.join(pdfDir, outputFilename);
    const escrita = fs.createWriteStream(outputPath);

      const pageMargins = { top: 40, bottom: 40, left: 30, right: 30 };
      const doc = new pdfDocument({
          size: 'A4',
          layout: 'portrait', //landscape or portrait
          margins: pageMargins,
      });

    escrita.on('error', (err) => {
        console.error("ERRO ao escrever no arquivo PDF:", err);
        if (!res.headersSent) {
            res.status(500).send('Erro ao gerar o arquivo PDF.');
          }
      });

      escrita.on('finish', () => {
          console.log('PDF gerado com sucesso:', outputPath);
          if (!res.headersSent) {
              res.download(outputPath, `${tabela}_report.pdf`, (downloadErr) => {
                  if (downloadErr) {
                      console.error('Erro ao enviar o PDF para o cliente:', downloadErr);
                  } else {
                    console.log('PDF enviado com sucesso!');
                  }
                  fs.unlink(outputPath, (unlinkErr) => {
                    if (unlinkErr) console.error('Erro ao deletar o arquivo PDF gerado:', unlinkErr);
                    else console.log('Arquivo PDF temporário deletado:', outputPath);
                  });
              });
          } else {
              console.log("Cabeçalhos já enviados, não foi possível enviar o PDF para download.");
               fs.unlink(outputPath, (unlinkErr) => {
                 if (unlinkErr) console.error('Erro ao deletar o arquivo PDF (cabeçalhos já enviados):', unlinkErr);
               });
          }
      });

    doc.pipe(escrita);

    // --- Desenhar Cabeçalho do Relatório ---
      const time = new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const reportHeaderText = `Relatório: ${tabela}\nGerado em: ${time}`;
      doc.fontSize(12).font('Helvetica-Bold').text(reportHeaderText, { align: 'center' });
      doc.moveDown(1.5);

      // --- Preparar Dados da Tabela ---
      const tableData = rows;

      if (!tableData || tableData.length === 0) {
         console.warn(`Nenhum dado em tableData para a tabela ${tabela} após a consulta.`);
         doc.fontSize(10).font('Helvetica').text('Nenhum dado encontrado para esta tabela.', { align: 'center' });
         doc.end();
         return;
      }

      // --- MODIFICAÇÃO AQUI: Adicionar 'ANO' e 'MES' para remover ---
    const columnsToRemove = ['arquivo', 'ANO', 'MES']; // <--- ADICIONADO ANO E MES AQUI

    // Cria uma cópia dos cabeçalhos originais antes de modificar
    const originalHeaders = Object.keys(tableData[0]);
    const tableHeaders = originalHeaders.filter(header => !columnsToRemove.includes(header));

      // Cria as linhas da tabela apenas com os dados das colunas que não foram removidas
      const tableRows = tableData.map(obj => {
          return tableHeaders.map(header => {
              const val = obj[header];
              return (val !== null && val !== undefined ? String(val) : '');
          });
      });

      // Agrupar por ano (usando os dados originais 'tableData')
      const groupedByYear = {};
      tableData.forEach(row => {
          const year = row.ANO; // Usa a coluna ANO original
          if (!groupedByYear[year]) {
              groupedByYear[year] = [];
          }
          // Adiciona apenas os dados das colunas que serão exibidas
          const rowForDisplay = {};
          tableHeaders.forEach(header => {
              rowForDisplay[header] = row[header];
          });
          groupedByYear[year].push(rowForDisplay);
      });
    const years = Object.keys(groupedByYear).sort();


    // --- Calcular Larguras das Colunas (usando tableHeaders) ---
      const tableTop = doc.y;
      const tableLeft = doc.page.margins.left;
      const availableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const tableRight = doc.page.width - doc.page.margins.right;
      const rowHeight = 14;
      const defaultRatio = 1.0;
      const columnWidthRatios = {};
      let totalRatio = 0;

      if (tableHeaders.length === 0) {
         console.warn(`Nenhuma coluna restante na tabela ${tabela} após remover colunas.`);
         doc.fontSize(10).font('Helvetica').text('Nenhuma coluna para exibir.', { align: 'center' });
         doc.end();
         return;
      }

      // Calcula ratios usando os cabeçalhos filtrados (tableHeaders)
      tableHeaders.forEach(header => {
          let ratio = defaultRatio;
          if (header === 'id') ratio = 0.3;
          else if (['nome', 'pet', 'empresa', 'titulo', 'tutor'].includes(header)) ratio = 1.5;
          else if (['caracteristicas', 'historia', 'proposta', 'mensagem', 'endereco'].includes(header)) ratio = 2.5;
          else if (['contato', 'whatsapp', 'email', 'localidade', 'representante', 'telefone'].includes(header)) ratio = 1.2;
          else if (['idade', 'especie', 'porte', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'cep', 'clinica', 'agenda', 'local'].includes(header)) ratio = 0.8;
          else if (['q1', 'q2', 'q3','qTotal'].includes(header)) ratio = 0.5;
          columnWidthRatios[header] = ratio;
          totalRatio += ratio;
      });

    const columnWidths = {};
    tableHeaders.forEach(header => {
        columnWidths[header] = totalRatio > 0 ? (columnWidthRatios[header] / totalRatio) * availableWidth : availableWidth / tableHeaders.length;
      });

      // --- Definir Tamanhos de Fonte e Padding ---
      const headerFontSize = 7;
      const cellFontSize = 6;
      const cellPadding = 2;

      // --- Desenhar Cabeçalhos da Tabela (usando tableHeaders) ---
      doc.font('Helvetica-Bold').fontSize(headerFontSize);
    let currentX_draw = tableLeft;
    tableHeaders.forEach((hText) => { // Itera sobre os cabeçalhos filtrados
        const currentColumnWidth = columnWidths[hText];
        let fillColor = '#E0E0E0';
        doc.fillColor(fillColor).rect(currentX_draw, tableTop, currentColumnWidth, rowHeight).fill().fillColor('black');
        doc.text(hText, currentX_draw + cellPadding, tableTop + cellPadding, {
            width: currentColumnWidth - (cellPadding * 2),
            align: 'center'
        });
        currentX_draw += currentColumnWidth;
      });
      doc.moveTo(tableLeft, tableTop + rowHeight).lineTo(tableRight, tableTop + rowHeight).lineWidth(0.5).strokeColor('#333333').stroke();

      let currentY = tableTop + rowHeight;

      // Itera sobre os anos agrupados
      years.forEach(year => {
        const yearHeaderTop = currentY;
        doc.font('Helvetica-Bold').fontSize(headerFontSize).fillColor('black');
        doc.text(`Ano: ${year}`, tableLeft, yearHeaderTop, { align: 'left' });
        currentY += rowHeight;
        doc.moveTo(tableLeft, currentY).lineTo(tableRight, currentY).lineWidth(0.5).strokeColor('#333333').stroke();

          doc.font('Helvetica').fontSize(cellFontSize);

          // Itera sobre as linhas DENTRO do ano atual (groupedByYear[year])
          groupedByYear[year].forEach((row) => {
              const rowTop = currentY;
              if (rowTop + rowHeight > doc.page.height - doc.page.margins.bottom) {
                  console.warn(`Conteúdo da tabela ${tabela} excedeu a altura da página. Algumas linhas podem não ser exibidas.`);
                  return;
              }

            const calculatedRowHeight = rowHeight;
              let currentX_cell = tableLeft;

              // Pega os valores da linha na ordem correta dos cabeçalhos exibidos
              const rowValues = tableHeaders.map(header => row[header] !== null && row[header] !== undefined ? String(row[header]) : '');

              rowValues.forEach((cell, j) => {
                  const currentColumnHeader = tableHeaders[j]; // Usa o cabeçalho filtrado
                const currentColumnWidth = columnWidths[currentColumnHeader];
                const cellX = currentX_cell + cellPadding;
                const cellY = rowTop + cellPadding;
                const textWidth = currentColumnWidth - (cellPadding * 2);
                const textOptions = {
                    width: textWidth,
                    align: 'center',
                    lineBreak: false,
                    ellipsis: true
                };
                doc.fillColor('black').text(cell, cellX, cellY, textOptions);
                currentX_cell += currentColumnWidth;
              });

              doc.moveTo(tableLeft, rowTop + calculatedRowHeight).lineTo(tableRight, rowTop + calculatedRowHeight).lineWidth(0.5).strokeColor('#cccccc').stroke();
              currentY += calculatedRowHeight;
          });

          const finalTableBottom = currentY;

          // --- Desenhar Linhas Verticais ---
          let currentVerticalX = tableLeft;
        tableHeaders.forEach(hText => { // Usa os cabeçalhos filtrados
            const currentColumnWidth = columnWidths[hText];
            doc.moveTo(currentVerticalX, tableTop)
               .lineTo(currentVerticalX, finalTableBottom)
                 .lineWidth(0.5).strokeColor('#cccccc').stroke();
              currentVerticalX += currentColumnWidth;
          });
          doc.moveTo(tableRight, tableTop)
             .lineTo(tableRight, finalTableBottom)
             .lineWidth(0.5).strokeColor('#cccccc').stroke();
      }); // Fim do loop years.forEach

    // --- Finalizar o PDF ---
    doc.end();

}); // Fim do db.all callback
}); // Fim da rota app.post




module.exports = router;