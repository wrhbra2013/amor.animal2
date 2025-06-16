 // /home/wander/amor.animal2/routes/adotadoRoutes.js
 const express = require('express');
 //const { getPool } = require('../database/database'); // For direct DB operations
 const { executeAllQueries } = require('../database/queries');
 const { insert_adotado } = require('../database/insert');
 const fs = require('fs').promises; // Use promises API for fs
 const path = require('path');
 const { isAdmin } = require('../middleware/auth');
 const { uploadAdotado } = require('../utils/multerConfig'); // Specific multer instance
 
 const router = express.Router();
 
 // GET /adotado - Display adopted records
 router.get('/', async (req, res) => {
     try {
         const results = await executeAllQueries();
         const adotadoData = results.adotado;
 
        
 
         res.render('adotado', { model: adotadoData });
     } catch (error) {
         console.error("[adotadoRoutes GET /] Error fetching adopted data:", error.message);
         res.status(500).render('error', { error: error.message || 'Não foi possível carregar os dados dos pets adotados.' });
     }
 });
 
 // GET /adotado/form - Render the form for new adopted entry
 router.get('/form',  (req, res) => { // Added isAdmin, remove if not needed
     res.render('form_adotado');
 });
 
 // POST /adotado/form - Handle form submission for new adopted entry
 router.post('/form',  uploadAdotado.single('arquivo'), async (req, res) => { // Added isAdmin
     if (!req.file) {
         return res.status(400).render('form_adotado', { error: 'Nenhum arquivo foi enviado.' });
     }
 
     const { destination, filename: tempFilename, originalname } = req.file;
 
     // Using originalname for the final filename as per existing pattern.
     // Consider using tempFilename or a UUID for more robust unique naming.
     const finalFilename = originalname;
     const tempFilePath = path.join(destination, tempFilename);
     const finalFilePath = path.join(destination, finalFilename);
     
 
     try {
         await fs.rename(tempFilePath, finalFilePath);
         console.log(`[adotadoRoutes POST /form] Arquivo de 'adotado' movido para: ${finalFilePath}`);
 
         const formData = {
             arquivo: finalFilename, // 'foto' in previous version, 'arquivo' is more consistent
             pet: req.body.nome_pet,
             tutor: req.body.nome_tutor,
             historia: req.body.historia
         };
 
         await insert_adotado(formData.arquivo, formData.pet, formData.tutor, formData.historia);
         console.log('[adotadoRoutes POST /form] Dados de "adotado" inseridos:', formData);
         req.flash('success', 'Dados de adoção inseridos com sucesso.')
         res.redirect('/home'); // Redirect to the list of adopted pets
 
     } catch (error) {
         console.error("[adotadoRoutes POST /form] Erro ao processar formulário de 'adotado':", error);
         // Attempt to clean up uploaded files if an error occurred
         try {
             if (await fs.stat(tempFilePath).catch(() => false)) {
                 await fs.unlink(tempFilePath);
                 console.log("[adotadoRoutes POST /form] Arquivo temporário removido após erro:", tempFilePath);
             } else if (await fs.stat(finalFilePath).catch(() => false)) {
                 await fs.unlink(finalFilePath);
                 console.log("[adotadoRoutes POST /form] Arquivo final (movido) removido após erro:", finalFilePath);
             }
         } catch (cleanupError) {
             console.error("[adotadoRoutes POST /form] Erro ao limpar arquivo após falha no formulário:", cleanupError);
         }
         res.status(500).render('form_adotado', { error: 'Erro ao salvar a história do pet adotado. Tente novamente.' });
     }
 });
 
 // POST /adotado/delete/:id/:arq - Delete an adopted entry
 router.post('/delete/:id/:arq', isAdmin, async (req, res) => { // Changed route to match convention /delete/:id/:arq
     const { id, arq } = req.params;
     const pool = getPool();
     const uploadsDir = path.join(__dirname, '..', 'static', 'uploads', 'adotado');
     const filePath = path.join(uploadsDir, path.basename(arq)); // Use path.basename for security
 
     try {
         const deleteSql = `DELETE FROM adotado WHERE id = ?`;
         const [result] = await pool.execute(deleteSql, [id]);
 
         if (result.affectedRows === 0) {
             console.warn(`[adotadoRoutes DELETE] Nenhum registro encontrado na tabela 'adotado' com ID: ${id} para deletar.`);
         } else {
             console.log(`[adotadoRoutes DELETE] Registro de 'adotado' com ID: ${id} deletado.`);
         }
 
         // Attempt to delete the associated file
         try {
             await fs.access(filePath); // Check if file exists
             await fs.unlink(filePath);
             console.log(`[adotadoRoutes DELETE] Arquivo ${filePath} deletado.`);
         } catch (fileError) {
             if (fileError.code === 'ENOENT') {
                 console.log(`[adotadoRoutes DELETE] Arquivo ${filePath} não encontrado para deleção, pode já ter sido removido.`);
             } else {
                 console.error(`[adotadoRoutes DELETE] Erro ao deletar arquivo ${filePath} (não é ENOENT):`, fileError);
             }
         }
         res.redirect('/adotado'); // Redirect to the list of adopted pets
 
     } catch (error) {
         console.error(`[adotadoRoutes DELETE] Erro ao deletar registro de 'adotado' com ID: ${id}:`, error);
         res.status(500).render('error', { error: 'Erro ao deletar a história do pet adotado. Tente novamente.' });
     }
 });
 

 
 module.exports = router;
