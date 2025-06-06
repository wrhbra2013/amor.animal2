  // routes/adocaoRoutes.js
  const express = require('express');
  //const { db } = require('../database/database'); // Importa db para acesso ao banco SQLite
  const { executeQuery } = require('../database/queries'); // Importa executeQuery
  const fs = require('fs').promises; // Use promises API for fs
  const path = require('path');
  const { isAdmin } = require('../middleware/auth');
  const { uploadAdocao } = require('../utils/multerConfig'); // Specific multer instance
  
  const router = express.Router();
  
  // GET route to display adoption listings
  router.get('/', async (req, res) => {
      try {
          const query = "SELECT * FROM adocao";
          const adocaoData = await executeQuery(query); // Use executeQuery para buscar os dados
          res.render('adote', { model: adocaoData });
      } catch (error) {
          console.error("Error fetching adoption data:", error);
          res.status(500).render('error', { error: 'Não foi possível carregar os dados de adoção.' });
      }
  });
  
  // GET route to render the adoption form
  router.get('/form', (req, res) => {
     // Consider adding isAdmin middleware if this form is for admin use only
     res.render('form_adocao');
 });
  
  //Rota generica
  router.get('/:id', async (req, res) => {
      const id = req.params.id;
      const tabela = 'adocao';
      try {
          const query = "SELECT * FROM adocao WHERE id = ? LIMIT 1";
          const [item] = await executeQuery(query, [id]); // Desestrutura o primeiro elemento do array
          res.render('edit', { model: item, tabela: tabela, id: id });
      } catch (error) {
          console.error("Error fetching adoption detail:", error);
          res.status(500).render('error', { error: 'Não foi possível carregar os detalhes do pet para adoção.' });
      }
  });
  
  // POST route to handle form submission for new adoption entries
  router.post('/form', uploadAdocao.single('arquivo'), async (req, res) => {
      if (!req.file) {
          return res.status(400).render('form_adocao', { error: 'Nenhum arquivo foi enviado.' });
      }
  
      const { destination, filename: tempFilename, originalname, mimetype } = req.file;
  
      let finalFilename;
      try {
          const filesInDir = await fs.readdir(destination);
          const count = filesInDir.length;
          finalFilename = `${count}${path.extname(originalname)}`;
      } catch (readDirError) {
          console.error("Error reading directory for file count:", readDirError);
          finalFilename = `${Date.now()}${path.extname(originalname)}`;
      }
  
      const tempFilePath = path.join(destination, tempFilename);
      const finalFilePath = path.join(destination, finalFilename);
  
      try {
          await fs.rename(tempFilePath, finalFilePath);
          console.log(`Arquivo movido para: ${finalFilePath}`);
  
          const adocaoData = {
              arquivo: finalFilename,
              nome: req.body.nomePet,
              idade: req.body.idadePet,
              especie: req.body.especie,
              porte: req.body.porte,
              caracteristicas: req.body.caracteristicas,
              tutor: req.body.tutor,
              contato: req.body.contato,
              whatsapp: req.body.whatsapp
          };
  
          const insertSQL = `INSERT INTO adocao (
              arquivo, nome, idade, especie, porte, caracteristicas, tutor, contato, whatsapp
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          await executeQuery(insertSQL, [
              adocaoData.arquivo,
              adocaoData.nome,
              adocaoData.idade,
              adocaoData.especie,
              adocaoData.porte,
              adocaoData.caracteristicas,
              adocaoData.tutor,
              adocaoData.contato,
              adocaoData.whatsapp
          ]);
          console.log('Dados de adoção inseridos:', adocaoData);
          res.redirect('/home');
  
      } catch (error) {
          console.error("Erro ao processar formulário de adoção:", error);
          try {
              if (await fs.stat(tempFilePath).catch(() => false)) {
                  await fs.unlink(tempFilePath);
                  console.log("Arquivo temporário removido após erro:", tempFilePath);
              } else if (await fs.stat(finalFilePath).catch(() => false)) {
                  await fs.unlink(finalFilePath);
                  console.log("Arquivo final (movido) removido após erro:", finalFilePath);
              }
          } catch (cleanupError) {
              console.error("Erro ao limpar arquivo após falha no formulário de adoção:", cleanupError);
          }
          res.status(500).render('form_adocao', { error: 'Erro ao salvar os dados de adoção. Tente novamente.' });
      }
  });
  
  // POST route to delete an adoption entry
  router.post('/delete/adocao/:id/:arq', isAdmin, async (req, res) => {
      const { id, arq } = req.params;
      const uploadsDir = path.join(__dirname, '..', 'static', 'uploads', 'adocao');
      const filePath = path.join(uploadsDir, arq);
  
      try {
          const deleteSql = `DELETE FROM adocao WHERE id = ?`;
          await executeQuery(deleteSql, [id]);
  
          try {
              await fs.access(filePath);
              await fs.unlink(filePath);
              console.log(`Arquivo ${filePath} deletado com sucesso.`);
          } catch (fileError) {
              if (fileError.code !== 'ENOENT') {
                  console.error(`Erro ao deletar o arquivo ${filePath} (não é ENOENT):`, fileError);
              } else {
                  console.log(`Arquivo ${filePath} não encontrado para deleção (ENOENT), pode já ter sido removido.`);
              }
          }
          res.redirect('/adocao');
  
      } catch (error) {
          console.error(`Erro ao deletar registro de adoção com ID: ${id}:`, error);
          res.status(500).render('error', { error: 'Erro ao deletar o item de adoção. Tente novamente.' });
      }
  });
  
  module.exports = router;
 