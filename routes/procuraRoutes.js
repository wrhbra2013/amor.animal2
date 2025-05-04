 // routes/procuraRoutes.js
 const express = require('express');
 const { db } = require('../database/database'); // Adjust path
 const fs = require('fs');
 const path = require('path');
 const { isAdmin } = require('../middleware/auth'); // Assuming you moved isAdmin
 // Import the specific upload instance for procura_se
 const { uploadProcuraSe } = require('../utils/multerConfig'); // <-- Import specific instance
 
 const router = express.Router();
 // const key = 'procura_se'; // Key might not be needed
 
 // GET /procura-se (Assuming this is the base path mounted in index.js)
 router.get('/', async (req, res) => {
     try {
         const query = `SELECT * FROM procura_se ORDER BY origem DESC`; // Fetch from procura_se table
         const results = await new Promise((resolve, reject) => {
             db.all(query, [], (err, rows) => {
                 if (err) reject(err);
                 else resolve(rows);
             });
         });
         // Render a view or return JSON
         res.render('procura_list', { procurados: results }); // Example rendering a list
         // res.json(results); // Or return JSON
     } catch (error) {
         console.error('Error fetching procura_se data:', error);
         res.status(500).render('error', { error: 'Erro ao buscar dados de "Procura-se".' });
     }
 });
 
 // POST /procura-se
 // Use the specific upload instance here
 router.post('/', isAdmin, uploadProcuraSe.single('foto'), async (req, res) => { // <-- Use uploadProcuraSe
     if (!req.file) {
         // return res.status(400).json({ error: 'Nenhuma foto enviada.' });
         // req.flash('error_messages', ['É necessário enviar uma foto.']);
         return res.redirect('/procura-se/form'); // Redirect back to form if rendering one
     }
     try {
         const { nome, especie, raca, sexo, idade, cor, porte, local, descricao, contato } = req.body;
         const foto = req.file.filename; // Use the filename saved by multer
 
         // Basic validation
         if (!nome || !especie || !local || !descricao || !contato) {
              // req.flash('error_messages', ['Por favor, preencha todos os campos obrigatórios.']);
              return res.redirect('/procura-se/form'); // Or appropriate redirect/error
         }
 
         const query = `INSERT INTO procura_se (nome, especie, raca, sexo, idade, cor, porte, local, descricao, contato, foto) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
         const values = [nome, especie, raca, sexo, idade, cor, porte, local, descricao, contato, foto];
 
         await new Promise((resolve, reject) => {
             db.run(query, values, function(err) {
                 if (err) reject(err);
                 else resolve(this.lastID);
             });
         });
         // req.flash('success_messages', ['Registro "Procura-se" criado com sucesso!']);
         res.redirect('/procura-se'); // Redirect to the list view
         // res.status(201).json({ message: 'Data inserted successfully' }); // Or return JSON
     } catch (error) {
         console.error('Error inserting procura_se data:', error);
         // Consider deleting file if DB insert fails
         if (req.file) {
             fs.unlink(req.file.path, (unlinkErr) => {
                 if (unlinkErr) console.error("Error deleting file after DB error:", unlinkErr);
             });
         }
         res.status(500).render('error', { error: 'Erro ao inserir dados em "Procura-se".' });
         // res.status(500).json({ error: 'Internal Server Error' }); // Or return JSON error
     }
 });
 
 // DELETE /procura-se/:id (Use DELETE method semantically)
 router.post('/delete/:id', isAdmin, async (req, res) => { // Using POST for simplicity with HTML forms, but DELETE is better for APIs
     const id = req.params.id;
     const selectQuery = `SELECT foto FROM procura_se WHERE id = ?`;
     const deleteQuery = `DELETE FROM procura_se WHERE id = ?`;
 
     try {
          // First, get the filename to delete the file
          const row = await new Promise((resolve, reject) => {
              db.get(selectQuery, [id], (err, row) => {
                  if (err) reject(err);
                  else resolve(row);
              });
          });
 
         // Delete the database record
         const changes = await new Promise((resolve, reject) => {
             db.run(deleteQuery, [id], function(err) {
                 if (err) reject(err);
                 else resolve(this.changes);
             });
         });
 
         if (changes === 0) {
             // req.flash('error_messages', ['Registro não encontrado para exclusão.']);
             return res.redirect('/procura-se');
         }
 
         // If DB deletion was successful and a file existed, delete the file
         if (row && row.foto) {
             const filePath = path.join(__dirname, `../static/uploads/procura_se/`, row.foto);
             fs.unlink(filePath, (unlinkErr) => {
                 if (unlinkErr) {
                     console.error(`Error deleting file ${filePath}:`, unlinkErr);
                     // Log error, but don't necessarily fail the request if DB was updated
                 } else {
                     console.log(`File ${filePath} deleted successfully.`);
                 }
             });
         }
 
         // req.flash('success_messages', ['Registro excluído com sucesso!']);
         res.redirect('/procura-se');
         // res.status(200).json({ message: 'Record deleted successfully' }); // Or return JSON
     } catch (error) {
         console.error('Error deleting procura_se record:', error);
         // req.flash('error_messages', ['Erro ao excluir registro.']);
         res.status(500).redirect('/procura-se');
         // res.status(500).json({ error: 'Internal Server Error' }); // Or return JSON error
     }
 });
 
 // Add GET route for the form if needed
 router.get('/form', isAdmin, (req, res) => {
     res.render('procura_form'); // Assuming you have a form view
 });
 
 
 module.exports = router;
 