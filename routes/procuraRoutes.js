  // /home/wander/amor.animal2/routes/procuraRoutes.js
  const express = require('express');
  const { executeAllQueries } = require('../database/queries');
  const { insert_procura_se } = require('../database/insert');
  const fs = require('fs').promises; // Usar a API de Promises do fs
  const path = require('path');
  const { isAdmin } = require('../middleware/auth');
  const { uploadProcuraSe } = require('../utils/multerConfig'); // Instância específica do multer
  
  const router = express.Router();
  
  // GET /procura_se - Exibe a lista de pets procurados
  router.get('/', async (req, res) => {
      try {
          const results = await executeAllQueries();
          const procuraSeData = results.procura_se;
  
          
  
          res.render('procura_se', { model: procuraSeData });
      } catch (error) {
          console.error("[procuraRoutes GET /] Erro ao buscar dados dos pets procurados:", error.message);
          res.status(500).render('error', { error: error.message || 'Não foi possível carregar os dados dos pets procurados.' });
      }
  });
  
  // GET /procura_se/form - Renderiza o formulário para novo registro de pet procurado
  router.get('/form', (req, res) => {
      // Considerar adicionar isAdmin se o formulário for apenas para administradores
      res.render('form_procura_se');
  });
  
  // POST /procura_se/form - Processa o formulário de novo registro de pet procurado
  router.post('/form', uploadProcuraSe.single('arquivo'), async (req, res) => {
      if (!req.file) {
          return res.status(400).render('form_procura_se', { error: 'Nenhum arquivo foi enviado.' });
      }
  
      const { destination, filename: tempFilename, originalname } = req.file;
  
      // Usando 'originalname' para o nome final do arquivo, conforme lógica anterior.
      // Considerar 'tempFilename' ou um UUID para nomes únicos mais robustos.
      const finalFilename = originalname;
      const tempFilePath = path.join(destination, tempFilename);
      const finalFilePath = path.join(destination, finalFilename);
  
      try {
          await fs.rename(tempFilePath, finalFilePath);
          console.log(`[procuraRoutes POST /form] Arquivo de 'procura_se' movido para: ${finalFilePath}`);
  
          const formData = {
              arquivo: finalFilename,
              nomePet: req.body.nomePet, // Corrigido para nomePet
              idadePet: req.body.idadePet, // Corrigido para idadePet
              especie: req.body.especie,
              porte: req.body.porte,
              caracteristicas: req.body.caracteristicas,
              local: req.body.local,
              tutor: req.body.tutor,
              contato: req.body.contato,
              whatsapp: req.body.whatsapp // Corrigido de 'whats' para 'whatsapp'
          };
  
          await insert_procura_se(
              formData.arquivo,
              formData.nomePet,
              formData.idadePet,
              formData.especie,
              formData.porte,
              formData.caracteristicas,
              formData.local,
              formData.tutor,
              formData.contato,
              formData.whatsapp
          );
  
          console.log('[procuraRoutes POST /form] Dados de "procura_se" inseridos:', formData);
          req.flash('success', 'Dados de pet desaparecido inseridos com sucesso.')
          res.redirect('/home'); // Redireciona para a lista de pets procurados
  
      } catch (error) {
          console.error("[procuraRoutes POST /form] Erro ao processar formulário de 'procura_se':", error);
          // Tenta limpar os arquivos enviados se ocorrer um erro
          try {
              if (await fs.stat(tempFilePath).catch(() => false)) {
                  await fs.unlink(tempFilePath);
                  console.log("[procuraRoutes POST /form] Arquivo temporário removido após erro:", tempFilePath);
              } else if (await fs.stat(finalFilePath).catch(() => false)) {
                  await fs.unlink(finalFilePath);
                  console.log("[procuraRoutes POST /form] Arquivo final (movido) removido após erro:", finalFilePath);
              }
          } catch (cleanupError) {
              console.error("[procuraRoutes POST /form] Erro ao limpar arquivo após falha no formulário:", cleanupError);
          }
          res.status(500).render('form_procura_se', { error: 'Erro ao salvar os dados do pet procurado. Tente novamente.' });
      }
  });
  
  // POST /procura_se/delete/:id/:arq - Deleta um registro de pet procurado
  router.post('/delete/:id/:arq', isAdmin, async (req, res) => {
      const { id, arq } = req.params;
      const pool = getPool();
      const uploadsDir = path.join(__dirname, '..', 'static', 'uploads', 'procura_se');
      const filePath = path.join(uploadsDir, path.basename(arq)); // path.basename para segurança
  
      try {
          const deleteSql = `DELETE FROM procura_se WHERE id = ?`;
          const [result] = await pool.execute(deleteSql, [id]);
  
          if (result.affectedRows === 0) {
              console.warn(`[procuraRoutes DELETE] Nenhum registro encontrado na tabela 'procura_se' com ID: ${id} para deletar.`);
          } else {
              console.log(`[procuraRoutes DELETE] Registro de 'procura_se' com ID: ${id} deletado.`);
          }
  
          // Tenta deletar o arquivo associado
          try {
              await fs.access(filePath); // Verifica se o arquivo existe
              await fs.unlink(filePath);
              console.log(`[procuraRoutes DELETE] Arquivo ${filePath} deletado.`);
          } catch (fileError) {
              if (fileError.code === 'ENOENT') {
                  console.log(`[procuraRoutes DELETE] Arquivo ${filePath} não encontrado para deleção, pode já ter sido removido.`);
              } else {
                  console.error(`[procuraRoutes DELETE] Erro ao deletar arquivo ${filePath} (não é ENOENT):`, fileError);
              }
          }
          res.redirect('/procura_se'); // Redireciona para a lista de pets procurados
  
      } catch (error) {
          console.error(`[procuraRoutes DELETE] Erro ao deletar registro de 'procura_se' com ID: ${id}:`, error);
          res.status(500).render('error', { error: 'Erro ao deletar o registro do pet procurado. Tente novamente.' });
      }
  });

  //Rota generica
   router.get('/:id', async (req, res) => {
   const id = req.params.id;
   const tabela = 'procura_se'
 const { db } = require('../database/database');
   try {
 // Adaptação para SQLite3
 const item = await new Promise((resolve, reject) => {
 db.get("SELECT * FROM procura_se WHERE id = ? LIMIT 1", [id], (err, row) => {
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
 