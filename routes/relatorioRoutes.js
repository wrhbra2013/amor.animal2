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
  normal: path.join(__dirname, '..', 'static', 'fonts', 'Roboto-Regular.ttf'),
  bold: path.join(__dirname, '..', 'static', 'fonts', 'Roboto-Medium.ttf'),
  italics: path.join(__dirname, '..', 'static', 'fonts', 'Roboto-Italic.ttf'),
  bolditalics: path.join(__dirname, '..', 'static', 'fonts', 'Roboto-MediumItalic.ttf')
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
                             strftime('%d  %m  %Y %H:%M', origem) AS origem,
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
     
        
         let rowsFromDb = [];
     
         try {
             // Adaptação para SQLite3 - db.all retorna um array de objetos para todas as linhas.
             rowsFromDb = await new Promise((resolve, reject) => {
                 db.all(sql, [], (err, rows) => {
                     if (err) return reject(err);
                     resolve(rows);
                 });
             });
             // REMOVIDO: throw new Error(`Formato de dados inesperado do banco para a tabela '${tabela}'.`);
             return rowsFromDb; // ADICIONADO: Retorna os dados obtidos
         }
          catch (dbError) {
             console.error(`[fetchReportData] Erro de banco de dados ao executar query para '${tabela}':`, dbError.message);
             const originalErrorMessage = dbError.message;
             // Cria um novo erro para propagar, mantendo a mensagem original
             const errorToThrow = new Error(`Erro ao consultar dados da tabela '${tabela}': ${originalErrorMessage}`);
             errorToThrow.status = dbError.status || 500; // Preserva o status code se existir
             throw errorToThrow;
         }
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
    // routes/relatorioRoutes.js
    // ... (código anterior) ...
    
    router.post('/:tabela', isAdmin, async (req, res, next) => {
        const tabela = req.params.tabela;
        let outputPath = '';
    
        try {
            const tableData = await fetchReportData(tabela);
    
            if (!tableData || tableData.length === 0) {
                return res.status(404).render('error', { error: `Nenhum dado encontrado para a tabela ${tabela}. Por favor, verifique se a tabela contém registros.` });
            }
    
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
                tableHeaders.forEach(header => { // 'header' é uma chave original da linha de dados (ex: nome_coluna)
                    let cellValue = row[header];
                    let displayValue = (cellValue !== null && cellValue !== undefined) ? String(cellValue) : '';
    
                    // --- Início da aplicação de replace() ---
    
                    // Exemplo 1: Remover espaços em branco no início e fim de todas as strings
                    // e substituir múltiplos espaços por um único espaço.
                    if (typeof displayValue === 'string') {
                        displayValue = displayValue.replace(/^\s+|\s+$/g, ''); // Remove espaços no início/fim
                        displayValue = displayValue.replace(/ +/g, ' ');       // Substitui múltiplos espaços por um
                    }
    
                    // Exemplo 2: Se uma coluna chamada 'status' existir, traduzir seus valores.
                    // A flag 'i' em /pending/gi torna a busca case-insensitive.
                    if (header.toLowerCase() === 'status' && typeof displayValue === 'string') {
                        displayValue = displayValue.replace(/pending/gi, 'Pendente');
                        displayValue = displayValue.replace(/approved/gi, 'Aprovado');
                        displayValue = displayValue.replace(/rejected/gi, 'Rejeitado');
                    }
    
                    // Exemplo 3: Em uma coluna 'descricao', substituir quebras de linha duplas por uma única.
                    if (header.toLowerCase() === 'descricao' && typeof displayValue === 'string') {
                        displayValue = displayValue.replace(/\n\s*\n/g, '\n');
                    }
                    
                    // Exemplo 4: Se você tivesse um nome de fonte e quisesse garantir que não há espaços
                    // (embora isso seja mais relevante para a configuração da fonte em si, não para dados de célula):
                    // if (header.toLowerCase() === 'font_name_column' && typeof displayValue === 'string') {
                    //     displayValue = displayValue.replace(/ /g, '-'); // Substitui todos os espaços por hífens
                    // }
    
                    // --- Fim da aplicação de replace() ---
    
                    rowForDisplay[header] = displayValue;
                });
                groupedByYear[year].push(rowForDisplay);
            });
            
            // ... (restante do código para construir a definição do PDF e gerá-lo) ...
    
            const content = [];
            const time = new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
            content.push({ text: `ONG Amor Animal`, style: 'mainHeader', color: '#333333' });
            content.push({ text: `Relatório: ${tabela.charAt(0).toUpperCase() + tabela.slice(1)}`, style: 'subHeader' });
            content.push({ text: `Gerado em: ${time}`, style: 'subHeader', margin: [0, 0, 0, 20] });
    
            if (tableHeaders.length === 0 && tableData.length > 0) {
                 content.push({ text: 'Dados encontrados, mas nenhuma coluna selecionada para exibição.', alignment: 'center' });
            } else if (tableHeaders.length === 0) { 
                content.push({ text: 'Nenhuma coluna para exibir (sem dados ou sem cabeçalhos definidos).', alignment: 'center' });
            } else {
                const columnWidths = tableHeaders.map(header => {
                     if (header === 'id') return 'auto';
                     if (['caracteristicas', 'historia', 'proposta', 'mensagem', 'descricao', 'origem_formatada'].includes(header.toLowerCase())) return 'auto'; 
                     return '*';
                });
    
                // FIX: Define 'years' based on the keys of 'groupedByYear'
                const years = Object.keys(groupedByYear).sort(); // Ordena os anos
    
                years.forEach(year => {
                    content.push({ text: `Ano: ${year}`, style: 'yearHeader' });
                    const tableBody = [];
                    // Os tableHeaders aqui são os nomes das colunas como vêm do banco (após o filtro em columnsToRemove)
                    // Se você quisesse transformar os próprios cabeçalhos (ex: "nome_usuario" para "Nome Usuário"),
                    // você faria isso ao definir `tableHeaders` e depois usaria esses cabeçalhos transformados aqui.
                    tableBody.push(tableHeaders.map(header => ({ text: header.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), style: 'tableHeader' })));
    
    
                    groupedByYear[year].forEach(dataRow => { // dataRow é o rowForDisplay
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
                defaultStyle: { font: 'Roboto' }, // Certifique-se que 'Roboto' está corretamente configurado
                footer: (currentPage, pageCount) => ({
                    text: `Página ${currentPage.toString()} de ${pageCount.toString()}`,
                    style: 'footerStyle'
                })
            };
    
            // ... (restante do código para gerar e enviar o PDF)
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
            console.error("Erro durante a geração do PDF ou busca de dados:", error.message);
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
   
  
 