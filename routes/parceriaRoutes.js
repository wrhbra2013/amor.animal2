  // routes/parceriaRoutes.js
  const express = require('express');
  const { db } = require('../database/database'); // Adjust path
  const fs = require('fs').promises; // Use fs.promises for async/await with file operations
  const path = require('path');
  const { isAdmin } = require('../middleware/auth'); // Assuming you moved isAdmin
  // Import the specific upload instance for parceria
  const { uploadParceria } = require('../utils/multerConfig'); // <-- Import specific instance (assuming it exists)
 
  const router = express.Router();
  // const key = 'parceria'; // Key might not be needed
 
  // GET route to fetch all 'parceria' entries
  router.get('/', async (req, res) => {
      try {
          const query = `SELECT * FROM parceria ORDER BY origem DESC`; // Use actual table name
          const results = await new Promise((resolve, reject) => {
              db.all(query, [], (err, rows) => {
                  if (err) reject(err);
                  else resolve(rows);
              });
          });
          res.render('parceria_list', { parcerias: results }); // Example rendering
          // res.json(results); // Or return JSON
      } catch (error) {
          console.error(`Error fetching parceria data:`, error);
          res.status(500).render('error', { error: 'Erro ao buscar dados de parcerias.' });
      }
  });
 
  // POST route to insert a new 'parceria' entry
  // Corrected usage: Call .single() on the uploadParceria instance
  router.post('/', isAdmin, uploadParceria.single('imagem'), async (req, res) => { // <-- CORRECTED
      const { nome_empresa, proposta, contato_representante, email, telefone } = req.body; // Adjust fields based on your form/table
      // Check req.file *after* multer middleware runs
      const imagem = req.file ? req.file.filename : null;
 
      // Basic validation
      if (!nome_empresa || !proposta || !contato_representante) {
           // req.flash('error_messages', ['Por favor, preencha todos os campos obrigatórios.']);
           // If validation fails after upload, delete the file
           if (req.file) {
               await fs.unlink(req.file.path).catch(err => console.error("Error deleting file after validation fail:", err));
           }
           return res.redirect('/parceria/form'); // Redirect back to form
      }
 
      try {
          const query = `INSERT INTO parceria (nome_empresa, proposta, contato_representante, email, telefone, imagem) VALUES (?, ?, ?, ?, ?, ?)`; // Adjust columns
          const values = [nome_empresa, proposta, contato_representante, email, telefone, imagem];
 
          const lastID = await new Promise((resolve, reject) => {
              db.run(query, values, function(err) {
                  if (err) reject(err);
                  else resolve(this.lastID);
              });
          });
          // req.flash('success_messages', ['Parceria registrada com sucesso!']);
          res.redirect('/parceria'); // Redirect to list
          // res.status(201).json({ id: lastID, ...req.body, imagem }); // Or return JSON
      } catch (error) {
          console.error(`Error inserting parceria data:`, error);
          // Consider deleting file if DB insert fails
          if (req.file) {
              // Use await with fs.promises or stick to callback style consistently
              await fs.unlink(req.file.path).catch(unlinkErr => console.error("Error deleting file after DB error:", unlinkErr));
          }
          res.status(500).render('error', { error: 'Erro ao inserir dados de parceria.' });
      }
  });
 
  // GET route to fetch a single 'parceria' entry by ID
  router.get('/:id', async (req, res) => {
      const { id } = req.params;
      try {
          const query = `SELECT * FROM parceria WHERE id = ?`;
          const result = await new Promise((resolve, reject) => {
              db.get(query, [id], (err, row) => { // Use db.get for single row
                  if (err) reject(err);
                  else resolve(row);
              });
          });
 
          if (result) {
              res.render('parceria_detail', { parceria: result }); // Example rendering detail
              // res.json(result); // Or return JSON
          } else {
              res.status(404).render('error', { error: 'Parceria não encontrada.' });
          }
      } catch (error) {
          console.error(`Error fetching parceria data by ID:`, error);
          res.status(500).render('error', { error: 'Erro ao buscar dados da parceria.' });
      }
  });
 
  // PUT route to update a 'parceria' entry (Using POST for forms)
  // Corrected usage: Call .single() on the uploadParceria instance
  router.post('/update/:id', isAdmin, uploadParceria.single('imagem'), async (req, res) => { // <-- CORRECTED
      const { id } = req.params;
      const data = req.body;
      let oldFilename = null;
      let newFilename = null;
 
      try {
          // Check if a new file was uploaded
          if (req.file) {
              newFilename = req.file.filename;
              // Get the old filename to delete it later
              const oldData = await new Promise((resolve, reject) => {
                  db.get(`SELECT imagem FROM parceria WHERE id = ?`, [id], (err, row) => {
                      if (err) reject(err); else resolve(row);
                  });
              });
              if (oldData && oldData.imagem) {
                  oldFilename = oldData.imagem;
              }
              data.imagem = newFilename; // Update data object with new filename
          }
 
          // Construct the update query dynamically
          let updates = [];
          let values = [];
          for (const [keyName, value] of Object.entries(data)) {
              // Ensure you only try to update valid columns for the 'parceria' table
              // You might want a predefined list of allowed columns to update
              if (keyName !== 'id') { // Don't include id in SET clause
                  updates.push(`${keyName} = ?`);
                  values.push(value);
              }
          }
 
          if (updates.length === 0 && !req.file) { // Check if there's anything to update
               // req.flash('info_messages', ['Nenhum dado para atualizar.']);
               return res.redirect(`/parceria/${id}`); // Or redirect to list
          }
 
          const updateQuery = `UPDATE parceria SET ${updates.join(', ')} WHERE id = ?`;
          values.push(id); // Add id for the WHERE clause
 
          const changes = await new Promise((resolve, reject) => {
              db.run(updateQuery, values, function(err) {
                  if (err) reject(err);
                  else resolve(this.changes);
              });
          });
 
          if (changes > 0) {
              // If update was successful and a new file was uploaded, delete the old one
              if (oldFilename && newFilename && oldFilename !== newFilename) { // Avoid deleting if filename is same
                  const oldFilePath = path.join(__dirname, `../static/uploads/parceria/`, oldFilename);
                  await fs.unlink(oldFilePath).catch(unlinkErr => console.error(`Error deleting old file ${oldFilePath}:`, unlinkErr));
                  console.log(`Old file ${oldFilePath} deleted after update.`);
              }
              // req.flash('success_messages', ['Parceria atualizada com sucesso!']);
              res.redirect('/parceria'); // Redirect to list
          } else {
              // If no rows changed, it might mean the ID didn't exist
              // req.flash('error_messages', ['Parceria não encontrada para atualização.']);
              // If an upload happened but no DB record was updated, delete the newly uploaded file
              if (newFilename) {
                  const newFilePath = path.join(__dirname, `../static/uploads/parceria/`, newFilename);
                  await fs.unlink(newFilePath).catch(unlinkErr => console.error(`Error deleting new file ${newFilePath} after failed update:`, unlinkErr));
              }
              res.status(404).redirect('/parceria');
          }
      } catch (error) {
          console.error(`Error updating parceria data:`, error);
           // If update failed but a new file was uploaded, delete the new file
           if (newFilename) {
               const newFilePath = path.join(__dirname, `../static/uploads/parceria/`, newFilename);
               await fs.unlink(newFilePath).catch(unlinkErr => console.error(`Error deleting new file ${newFilePath} after DB error:`, unlinkErr));
           }
          // req.flash('error_messages', ['Erro ao atualizar parceria.']);
          res.status(500).redirect('/parceria');
      }
  });
 
 
  // DELETE route to delete a 'parceria' entry (Using POST for forms)
  router.post('/delete/:id', isAdmin, async (req, res) => {
      const { id } = req.params;
      const selectQuery = `SELECT imagem FROM parceria WHERE id = ?`;
      const deleteQuery = `DELETE FROM parceria WHERE id = ?`;
 
      try {
          // Get filename first
          const row = await new Promise((resolve, reject) => {
              db.get(selectQuery, [id], (err, row) => {
                  if (err) reject(err); else resolve(row);
              });
          });
 
          // Delete DB record
          const changes = await new Promise((resolve, reject) => {
              db.run(deleteQuery, [id], function(err) {
                  if (err) reject(err); else resolve(this.changes);
              });
          });
 
          if (changes === 0) {
              // req.flash('error_messages', ['Parceria não encontrada para exclusão.']);
              return res.redirect('/parceria');
          }
 
          // Delete file if it existed
          if (row && row.imagem) {
              const filePath = path.join(__dirname, `../static/uploads/parceria/`, row.imagem);
              // Use await with fs.promises or stick to callback style consistently
              await fs.unlink(filePath).catch(unlinkErr => console.error(`Error deleting file ${filePath}:`, unlinkErr));
              console.log(`File ${filePath} deleted successfully.`);
          }
 
          // req.flash('success_messages', ['Parceria excluída com sucesso!']);
          res.redirect('/parceria');
      } catch (error) {
          console.error(`Error deleting parceria data:`, error);
          // req.flash('error_messages', ['Erro ao excluir parceria.']);
          res.status(500).redirect('/parceria');
      }
  });
 
  // Add GET routes for forms if needed
  router.get('/form', isAdmin, (req, res) => {
      res.render('parceria_form'); // Assuming form view exists
  });
  router.get('/edit/:id', isAdmin, async (req, res) => { // Example edit form route
      try {
          const { id } = req.params;
          const query = `SELECT * FROM parceria WHERE id = ?`;
          const result = await new Promise((resolve, reject) => {
              db.get(query, [id], (err, row) => {
                  if (err) reject(err); else resolve(row);
              });
          });
          if (result) {
              res.render('parceria_edit_form', { parceria: result }); // Assuming edit form view exists
          } else {
              res.status(404).render('error', { error: 'Parceria não encontrada.' });
          }
      } catch (error) {
           console.error(`Error fetching parceria for edit:`, error);
           res.status(500).render('error', { error: 'Erro ao carregar dados para edição.' });
      }
  });
 
 
  module.exports = router;
 