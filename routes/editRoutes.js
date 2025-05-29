  // /home/wander/amor.animal2/routes/editRoutes.js
  const express = require('express');
  const router = express.Router();
  const { getPool } = require('../database/database'); // Using getPool for MariaDB
  const { isAdmin } = require('../middleware/auth'); // Assuming edits should be admin-protected
  
  // List of tables allowed for editing.
  // Consider fetching this from a config or database schema if it becomes dynamic.
  const ALLOWED_TABLES = ['adocao', 'adotante', 'adotado', 'castracao', 'procura_se', 'parceria', 'home', 'login'];
  
  // Helper function to validate if the table is allowed
  function isValidTable(tableName) {
      return ALLOWED_TABLES.includes(tableName.toLowerCase());
  }
  
  // Helper function to create a display name for the table (e.g., "Adocao")
  function getTableDisplayName(tableName) {
      if (!tableName) return 'Registro';
      return tableName.charAt(0).toUpperCase() + tableName.slice(1);
  }
  
  ALLOWED_TABLES.forEach(table => {
      // GET /:table/edit/:id - Render a form or fetch data for editing
      // This route now fetches data and could be used to render an edit form
      // or provide data to a frontend client.
      router.get(`/${table}/edit/:id`, isAdmin, async (req, res) => {
          const { id } = req.params;
  
          if (!isValidTable(table)) {
              return res.status(400).json({ message: 'Operação não permitida para esta tabela.' });
          }
  
          const pool = getPool();
          try {
              const sql = `SELECT * FROM ${table} WHERE id = ?`; // MariaDB uses ?
              const [rows] = await pool.execute(sql, [id]);
  
              if (rows.length > 0) {
                  // For an API, sending JSON is fine.
                  // If you intend to render an EJS form:
                  // res.render(`form_edit_${table}`, { item: rows[0], tableName: table });
                  res.json(rows[0]);
              } else {
                  res.status(404).json({ message: `${getTableDisplayName(table)} não encontrado(a).` });
              }
          } catch (err) {
              console.error(`[editRoutes GET /${table}/edit/:id] Erro ao buscar dados:`, err.message);
              res.status(500).json({ message: 'Erro interno ao buscar dados para edição.' });
          }
      });
  
      // PUT /:table/edit/:id - Update an existing record
      // Changed to PUT as it's more conventional for updates, but POST can also be used.
      // Ensure your client/forms send PUT requests or change this to router.post(...)
      router.put(`/${table}/edit/:id`, isAdmin, async (req, res) => {
          const { id } = req.params;
          const updates = req.body; // e.g., { nome: "Novo Nome", idade: 5 }
  
          if (!isValidTable(table)) {
              return res.status(400).json({ message: 'Operação não permitida para esta tabela.' });
          }
  
          const fields = Object.keys(updates);
          const values = Object.values(updates);
  
          if (fields.length === 0) {
              return res.status(400).json({ message: 'Nenhum campo fornecido para atualização.' });
          }
  
          // Basic validation: ensure 'id' is not in the updates body to prevent changing the primary key.
          if (fields.includes('id')) {
              return res.status(400).json({ message: 'Não é permitido atualizar o ID.' });
          }
  
          const pool = getPool();
          try {
              // Construct SET clause: field1 = ?, field2 = ?, ...
              const setClause = fields.map(field => `\`${field}\` = ?`).join(', '); // Escape field names
              const updateSql = `UPDATE \`${table}\` SET ${setClause} WHERE id = ?`;
  
              const [result] = await pool.execute(updateSql, [...values, id]);
  
              if (result.affectedRows > 0) {
                  // MariaDB UPDATE doesn't return the row. Fetch it separately if needed.
                  const selectSql = `SELECT * FROM \`${table}\` WHERE id = ?`;
                  const [updatedRows] = await pool.execute(selectSql, [id]);
                  if (updatedRows.length > 0) {
                      res.json({ message: `${getTableDisplayName(table)} atualizado(a) com sucesso.`, item: updatedRows[0] });
                  } else {
                      // Should not happen if affectedRows > 0, but as a safeguard
                      res.status(404).json({ message: `${getTableDisplayName(table)} não encontrado(a) após atualização.` });
                  }
              } else {
                  res.status(404).json({ message: `${getTableDisplayName(table)} com ID ${id} não encontrado(a) ou nenhum dado alterado.` });
              }
          } catch (err) {
              console.error(`[editRoutes PUT /${table}/edit/:id] Erro ao atualizar dados:`, err.message);
              // Check for specific errors, e.g., foreign key constraints, data type issues
              if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
                  return res.status(409).json({ message: 'Erro de integridade referencial: Verifique os dados relacionados.' });
              }
              if (err.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD' || err.code === 'ER_DATA_TOO_LONG') {
                  return res.status(400).json({ message: 'Erro de tipo de dado ou valor muito longo para um campo.'});
              }
              res.status(500).json({ message: 'Erro interno ao atualizar dados.' });
          }
      });
  });
  
  module.exports = router;
 