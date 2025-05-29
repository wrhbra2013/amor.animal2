 // routes/adocaoRoutes.js
 const express = require('express');
 const { getPool } = require('../database/database'); // For direct DB operations
 const { executeAllQueries } = require('../database/queries'); // Assumes this is refactored
 const { insert_adocao } = require('../database/insert'); // Assumes this is refactored
 const fs = require('fs').promises; // Use promises API for fs
 const path = require('path');
 const { isAdmin } = require('../middleware/auth');
 const { uploadAdocao } = require('../utils/multerConfig'); // Specific multer instance
 
 const router = express.Router();
 
 // GET route to display adoption listings
 router.get('/', async (req, res) => { // Converted to async
     try {
             // executeAllQueries returns an object with results for all tables.
         // We only need the 'adocao' part for this route.
         // Ensure executeAllQueries is efficient or adapt it if needed.
         // For this route, you might consider a dedicated query function
         // like getAdocaoData() if executeAllQueries fetches too much unnecessary data.
         const results = await executeAllQueries();
         const adocaoData = results.adocao; // Extract the adocao data
         console.log('adocao de adocaoRoutes =>', adocaoData)    // Check if adocao data was successfully retrieved
       
         
         res.render('adote', {model: adocaoData });
     } catch (error) {
         console.error("Error fetching adoption data:", error);
         // It's better to render an error page than redirect to the same page with an error query param
         res.status(500).render('error', { error: 'Não foi possível carregar os dados de adoção.' });
     }
 });
 
 // GET route to render the adoption form
 router.get('/form', (req, res) => {
     // Consider adding isAdmin middleware if this form is for admin use only
     res.render('form_adocao');
 });
 
 // POST route to handle form submission for new adoption entries
 router.post('/form', uploadAdocao.single('arquivo'), async (req, res) => { // Converted to async
     if (!req.file) {
         // It's good practice to return here to stop further execution
         return res.status(400).render('form_adocao', { error: 'Nenhum arquivo foi enviado.' });
     }
 
     const { destination, filename: tempFilename, originalname, mimetype } = req.file;
 
     // File naming: Using a count can be problematic in concurrent environments.
     // Multer's generated filename (tempFilename) is already unique.
     // Consider using tempFilename or generating a UUID and storing originalname separately.
     // For now, sticking to the existing logic but with a note.
     let finalFilename;
     try {
         const filesInDir = await fs.readdir(destination);
         const count = filesInDir.length; // This count includes the new temp file
         finalFilename = `${count}${path.extname(originalname)}`;
     } catch (readDirError) {
         console.error("Error reading directory for file count:", readDirError);
         // Fallback or error handling for file naming
         finalFilename = `${Date.now()}${path.extname(originalname)}`; // Example fallback
     }
 
     const tempFilePath = path.join(destination, tempFilename);
     const finalFilePath = path.join(destination, finalFilename);
 
     try {
         await fs.rename(tempFilePath, finalFilePath);
         console.log(`Arquivo movido para: ${finalFilePath}`);
 
         const adocaoData = {
             arquivo: finalFilename, // Store the final filename
             nome: req.body.nomePet,
             idade: req.body.idadePet, // Ensure this is parsed to INT if your DB expects it
             especie: req.body.especie,
             porte: req.body.porte,
             caracteristicas: req.body.caracteristicas,
             tutor: req.body.tutor, // Changed from 'responsavel' to 'tutor' to match insert_adocao
             contato: req.body.contato,
             whatsapp: req.body.whatsapp
         };
 
         // insert_adocao should be an async function
         await insert_adocao(
             adocaoData.arquivo,
             adocaoData.nome,
             adocaoData.idade,
             adocaoData.especie,
             adocaoData.porte,
             adocaoData.caracteristicas,
             adocaoData.tutor, // Using tutor
             adocaoData.contato,
             adocaoData.whatsapp
         );
         console.log('Dados de adoção inseridos:', adocaoData);
         res.redirect('/adocao'); // Redirect to the adoption list page
 
     } catch (error) {
         console.error("Erro ao processar formulário de adoção:", error);
         // Attempt to clean up uploaded files if an error occurred
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
 router.post('/delete/adocao/:id/:arq', isAdmin, async (req, res) => { // Converted to async
     const { id, arq } = req.params;
     const pool = getPool();
     // Construct the full path to the file to be deleted
     const uploadsDir = path.join(__dirname, '..', 'static', 'uploads', 'adocao');
     const filePath = path.join(uploadsDir, arq);
 
     try {
         // Corrected: Delete from 'adocao' table
         const deleteSql = `DELETE FROM adocao WHERE id = ?`;
         const result = await pool.execute(deleteSql, [id]);
 
         if (result.affectedRows === 0) {
             console.warn(`Nenhum registro encontrado na tabela 'adocao' com ID: ${id} para deletar.`);
         } else {
             console.log(`Registro de adoção com ID: ${id} deletado com sucesso.`);
         }
 
         // Attempt to delete the associated file
         try {
             await fs.access(filePath); // Check if file exists
             await fs.unlink(filePath);
             console.log(`Arquivo ${filePath} deletado com sucesso.`);
         } catch (fileError) {
             if (fileError.code !== 'ENOENT') { // ENOENT = Error NO ENTry (file not found)
                 console.error(`Erro ao deletar o arquivo ${filePath} (não é ENOENT):`, fileError);
             } else {
                 console.log(`Arquivo ${filePath} não encontrado para deleção (ENOENT), pode já ter sido removido.`);
             }
         }
         res.redirect('/adocao'); // Redirect to the adoption list page
 
     } catch (error) {
         console.error(`Erro ao deletar registro de adoção com ID: ${id}:`, error);
         res.status(500).render('error', { error: 'Erro ao deletar o item de adoção. Tente novamente.' });
     }
 });
 
 module.exports = router;
 