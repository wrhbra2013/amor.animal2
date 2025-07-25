    // routes/relatorioRoutes.js
    const express = require('express');
    const { pool } = require('../database/database'); // Importa a instância do banco PostgreSQL
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
                            TO_CHAR(origem, 'DD/MM/YYYY HH24:MI:SS') AS data,
                            CAST(EXTRACT(YEAR FROM origem) AS INTEGER) AS ANO,
                            CAST(EXTRACT(MONTH FROM origem) AS INTEGER) AS MES_NUM,
                            CASE EXTRACT(MONTH FROM origem)
                                WHEN 1 THEN 'Janeiro'
                                WHEN 2 THEN 'Fevereiro'
                                WHEN 3 THEN 'Março'
                                WHEN 4 THEN 'Abril'
                                WHEN 5 THEN 'Maio'
                                WHEN 6 THEN 'Junho'
                                WHEN 7 THEN 'Julho'
                                WHEN 8 THEN 'Agosto'
                                WHEN 9 THEN 'Setembro'
                                WHEN 10 THEN 'Outubro'
                                WHEN 11 THEN 'Novembro'
                                WHEN 12 THEN 'Dezembro'
                                ELSE ''
                            END AS MES_NOME`;
            sql = `SELECT ${selectFields} FROM ${tabela}`;
        } else {
            sql = `SELECT ${selectFields} FROM ${tabela};`;
        }
    
        try {
            //  Adapt to use a generalized query function from database.js
            const result = await pool.query(sql);
            return result.rows;
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
            const columnsToHideForHtml = ['origem','arquivo','ano', 'mes_num', 'mes_nome','isAdmin']; 
    
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
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
 
             res.setHeader('Content-Type', 'application/pdf');
             res.setHeader('Content-Disposition', `attachment; filename=relatorio_${tabela}_${Date.now()}.pdf`);
 
             pdfDoc.pipe(res);
             pdfDoc.end();
 
         } catch (error) {
             console.error(`Erro POST /relatorio/${tabela}:`, error.message);
             const statusCode = error.status || 500;
             res.status(statusCode).render('error', {
                 error: error.message || 'Erro ao gerar o relatório PDF.'
             });
         }
     });

     router.post('/delete/:tabela/:id', isAdmin, async (req, res) => {
        const { tabela, id } = req.params;  
        const client = await pool.connect();
                try {
                    await client.query('BEGIN'); // Inicia a transação
                    const deleteSql = `DELETE FROM ${tabela} WHERE id = $1`;
                    const result = await client.query(deleteSql, [id]);
        
                    if (result.rowCount === 0) {
                        console.warn(`[relatorioRoutes DELETE] Nenhum registro encontrado na tabela '${tabela}' com ID: ${id} para deletar.`);
                        req.flash('error', `Nenhum registro encontrado na tabela '${tabela}' com ID: ${id} para deletar.`);
                    } else {
                        console.log(`[relatorioRoutes DELETE] Registro de '${tabela}' com ID: ${id} deletado.`);
                        req.flash('success', `Registro deletado com sucesso da tabela '${tabela}'.`);
                    }
                    await client.query('COMMIT'); // Confirma a transação
                    res.redirect(`/relatorio/${tabela}`); // Redireciona de volta para a lista de relatórios
                } catch (error) {
                    await client.query('ROLLBACK'); // Reverte a transação em caso de erro
                    console.error(`[relatorioRoutes DELETE] Erro ao deletar registro de '${tabela}' com ID: ${id}:`, error);
                    req.flash('error', `Erro ao deletar o registro da tabela '${tabela}'. Tente novamente.`);
                    res.status(500).redirect(`/relatorio/${tabela}`); // Redireciona com erro
                } finally {
                    client.release(); // Libera o cliente de volta para o pool
                }
            });
            router.post('/update/:tabela/:id', isAdmin, async (req, res) => {
                const { tabela, id } = req.params;
                const formData = req.body;
                const client = await pool.connect();
            
                try {
                    await client.query('BEGIN'); // Inicia a transação
            
                    // Constrói a query de atualização dinamicamente
                    const updates = [];
                    const values = [];
                    let paramIndex = 1;
            
                    for (const key in formData) {
                        if (Object.hasOwnProperty.call(formData, key) && key !== 'id') { // Não atualiza o ID
                            updates.push(`${key} = $${paramIndex}`);
                            values.push(formData[key]);
                            paramIndex++;
                        }
                    }
            
                    if (updates.length === 0) {
                        req.flash('error', 'Nenhum dado para atualizar.');
                        return res.redirect(`/relatorio/${tabela}`);
                    }
            
                    values.push(id); // Adiciona o ID como último valor para a cláusula WHERE
                    const updateSql = `UPDATE ${tabela} SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
            
                    const result = await client.query(updateSql, values);
            
                    if (result.rowCount === 0) {
                        console.warn(`[relatorioRoutes UPDATE] Nenhum registro encontrado na tabela '${tabela}' com ID: ${id} para atualizar.`);
                        req.flash('error', `Nenhum registro encontrado na tabela '${tabela}' com ID: ${id} para atualizar.`);
                    } else {
                        console.log(`[relatorioRoutes UPDATE] Registro de '${tabela}' com ID: ${id} atualizado.`);
                        req.flash('success', `Registro atualizado com sucesso na tabela '${tabela}'.`);
                    }
                    await client.query('COMMIT'); // Confirma a transação
                    res.redirect(`/relatorio/${tabela}`); // Redireciona de volta para a lista de relatórios
                } catch (error) {
                    await client.query('ROLLBACK'); // Reverte a transação em caso de erro
                    console.error(`[relatorioRoutes UPDATE] Erro ao atualizar registro de '${tabela}' com ID: ${id
            
            }:`, error);
                                req.flash('error', `Erro ao atualizar o registro da tabela '${tabela}'. Tente novamente.`);
                                res.status(500).redirect(`/relatorio/${tabela}`); // Redireciona com erro
                            } finally {
                                client.release(); // Libera o cliente de volta para o pool
                            }
                        });
 
     module.exports = router;
     