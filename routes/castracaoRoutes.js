  // /home/wander/amor.animal2/routes/castracaoRoutes.js
  const express = require('express');
  const { executeAllQueries } = require('../database/queries');
  const { insert_castracao } = require('../database/insert');
  const fs = require('fs').promises;
  const path = require('path');
  const { isAdmin } = require('../middleware/auth');
  const { uploadCastracao } = require('../utils/multerConfig');
  
  const router = express.Router();
  
  // GET /castracao - Exibe os registros de castração
  router.get('/', async (req, res) => {
      try {
          const results = await executeAllQueries();
          const castracaoData = results.castracao; // Extrai os dados específicos de castração
  
          
  
          res.render('castracao', { model: castracaoData });
      } catch (error) {
          console.error("[castracaoRoutes GET /] Erro ao buscar dados de castração:", error.message);
          res.status(500).render('error', { error: error.message || 'Não foi possível carregar os dados de castração.' });
      }
  });
  
  // GET /castracao/form - Renderiza o formulário para novo registro de castração
  router.get('/form', (req, res) => {
      // Considerar adicionar isAdmin se o formulário for apenas para administradores
      // Ex: router.get('/form', isAdmin, (req, res) => res.render('form_castracao'));
      res.render('form_castracao');
  });
  
  // POST /castracao/form - Processa o formulário de novo registro de castração
  router.post('/form', uploadCastracao.single('arquivo'), async (req, res) => {
      if (!req.file) {
          return res.status(400).render('form_castracao', { error: 'Nenhum arquivo foi enviado.' });
      }
  
      const { destination, filename: tempFilename, originalname } = req.file;
  
      // Usando 'originalname' para o nome final do arquivo, conforme lógica anterior.
      // Considerar 'tempFilename' ou um UUID para nomes únicos mais robustos.
      const finalFilename = originalname;
      const tempFilePath = path.join(destination, tempFilename);
      const finalFilePath = path.join(destination, finalFilename);
  
      try {
          await fs.rename(tempFilePath, finalFilePath);
          console.log(`[castracaoRoutes POST /form] Arquivo de castração movido para: ${finalFilePath}`);
  
          // Gera um ticket. A coluna 'ticket' na tabela 'castracao' é UNIQUE.
          // Uma geração de ID único mais robusta pode ser necessária para alta concorrência.
          const ticket = req.body.ticket || Math.floor(Math.random() * 10000);

          const castracaoData = {
              ticket: ticket,
              nome: req.body.nome,
              contato: req.body.contato,
              whatsapp: req.body.whatsapp, // Corrigido para 'whatsapp' se o campo no form for 'whatsapp'
              arquivo: finalFilename,
              idade: req.body.idade_pet,
              especie: req.body.especie,
              porte: req.body.porte,
              clinica: req.body.clinica,
              agenda: req.body.agenda,
          };
  
          await insert_castracao(
              castracaoData.ticket,
              castracaoData.nome,
              castracaoData.contato,
              castracaoData.whatsapp, // Usando o nome corrigido
              castracaoData.arquivo,
              castracaoData.idade,
              castracaoData.especie,
              castracaoData.porte,
              castracaoData.clinica,
              castracaoData.agenda
          );
          console.log('[castracaoRoutes POST /form] Dados de castração inseridos:', castracaoData);
          res.redirect('/home');
  
      } catch (error) {
          console.error("[castracaoRoutes POST /form] Erro ao processar formulário de castração:", error);
          // Tenta limpar os arquivos enviados se ocorrer um erro
          try {
              if (await fs.stat(tempFilePath).catch(() => false)) {
                  await fs.unlink(tempFilePath);
                  console.log("[castracaoRoutes POST /form] Arquivo temporário removido após erro:", tempFilePath);
              } else if (await fs.stat(finalFilePath).catch(() => false)) {
                  await fs.unlink(finalFilePath);
                  console.log("[castracaoRoutes POST /form] Arquivo final (movido) removido após erro:", finalFilePath);
              }
          } catch (cleanupError) {
              console.error("[castracaoRoutes POST /form] Erro ao limpar arquivo após falha no formulário:", cleanupError);
          }
  
          let errorMessage = 'Erro ao salvar os dados de castração. Tente novamente.';
          // Verifica se o erro é de entrada duplicada para o ticket (ER_DUP_ENTRY é específico do MySQL/MariaDB)
 if (error.message.includes('SQLITE_CONSTRAINT: UNIQUE constraint failed: castracao.ticket')) {
 errorMessage = 'Erro: O número do ticket já existe. Tente enviar o formulário novamente ou gere um novo ticket.';
          }
          res.status(500).render('form_castracao', { error: errorMessage });
      }
  });
  
  // POST /castracao/delete/:id/:arq - Deleta um registro de castração
  router.post('/delete/:id/:arq', isAdmin, async (req, res) => {
      const { id, arq } = req.params;
 const { db } = require('../database/database');
      const uploadsDir = path.join(__dirname, '..', 'static', 'uploads', 'castracao');
      const filePath = path.join(uploadsDir, path.basename(arq)); // path.basename para segurança
  
      try {
          const deleteSql = `DELETE FROM castracao WHERE id = ?`;
          const [result] = await pool.execute(deleteSql, [id]);
  
 // Adaptação para SQLite3
 const changes = await new Promise((resolve, reject) => {
 db.run(deleteSql, [id], function(err) {
 if (err) return reject(err);
 resolve(this.changes); // this.changes contém o número de linhas afetadas
 });
          });
 if (changes === 0) {
              console.warn(`[castracaoRoutes DELETE] Nenhum registro encontrado na tabela 'castracao' com ID: ${id} para deletar.`);
          } else {
              console.log(`[castracaoRoutes DELETE] Registro de castração com ID: ${id} deletado.`);
          }
  
          // Tenta deletar o arquivo associado
          try {
              await fs.access(filePath); // Verifica se o arquivo existe
              await fs.unlink(filePath);
              console.log(`[castracaoRoutes DELETE] Arquivo de castração ${filePath} deletado.`);
          } catch (fileError) {
              if (fileError.code === 'ENOENT') { // ENOENT = Error NO ENTry (arquivo não encontrado)
                  console.log(`[castracaoRoutes DELETE] Arquivo ${filePath} não encontrado para deleção, pode já ter sido removido.`);
              } else {
                  console.error(`[castracaoRoutes DELETE] Erro ao deletar arquivo de castração ${filePath} (não é ENOENT):`, fileError);
              }
          }
          res.redirect('/castracao');
  
      } catch (error) {
          console.error(`[castracaoRoutes DELETE /delete/:id/:arq] Erro ao deletar registro de castração com ID: ${id}:`, error);
          res.status(500).render('error', { error: 'Erro ao deletar o agendamento de castração. Tente novamente.' });
      }
  });

  //Rota generica
   router.get('/:id', async (req, res) => {
   const id = req.params.id;
   const tabela = 'castracao'
 const { db } = require('../database/database');
   try {
 // Adaptação para SQLite3
 const item = await new Promise((resolve, reject) => {
 db.get("SELECT * FROM castracao WHERE id = ? LIMIT 1", [id], (err, row) => {
 if (err) return reject(err);
 resolve(row);
            });
 });
   res.render('edit',{model : item, tabela: tabela, id: id}); // Assuming a detail EJS template named 'adocao_detail'
   } catch (error) {
   console.error("Error fetching adoption detail:", error);
   res.status(500).render('error', { error: 'Não foi possível carregar os detalhes do pet para adoção.' });
   }
  
   })
   
   
  
  module.exports = router;
 