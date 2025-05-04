// routes/adocaoRoutes.js
const express = require('express');
const { executeAllQueries } = require('../database/queries');
// Correctly import the specific insert function if needed, or use db.run
// const { insert_adocao } = require('../database/insert'); // Example
const { db } = require('../database/database');
const fs = require('fs');
const path = require('path');
const { isAdmin } = require('../middleware/auth');
// Import the specific upload instance for adocao
const { uploadAdocao } = require('../utils/multerConfig'); // <-- Import specific instance

const router = express.Router();
// const key = 'adocao'; // Key might not be needed if using specific upload instance

// GET route to render the form
router.get('/form', isAdmin, async (req, res) => {
    try {
        // Assuming 'animais' table holds animals available for adoption
        const animais = await new Promise((resolve, reject) => {
             // Fetch animals not yet adopted
            db.all("SELECT id, nome FROM animais WHERE adotado = 0", [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        res.render('adocao_form', { animais }); // Pass animais to the template
    } catch (error) {
        console.error("Error fetching data for adocao form:", error);
        res.status(500).render('error', { error: "Erro ao carregar formulário de adoção" });
    }
});

// POST route to handle form submission
// Use the specific upload instance here
router.post('/submit', isAdmin, uploadAdocao.single('imagem'), async (req, res) => { // <-- Use uploadAdocao
    const { nome, email, telefone, animal_id } = req.body;
    const imagem = req.file ? req.file.filename : null; // Save filename if file exists

    // Basic validation
    if (!nome || !email || !telefone || !animal_id) {
        // req.flash('error_messages', ['Por favor, preencha todos os campos obrigatórios.']);
        return res.redirect('/adocao/form'); // Redirect back to form
    }

    try {
        // Use db.run directly or a specific insert_adocao function
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO adocoes (nome, email, telefone, animal_id, imagem) VALUES (?, ?, ?, ?, ?)`,
                   [nome, email, telefone, animal_id, imagem],
                   function(err) { // Use function() to get lastID if needed
                       if (err) reject(err);
                       else resolve(this.lastID);
                   });
        });

        // Update the 'adotado' status of the animal
        await new Promise((resolve, reject) => {
            db.run(`UPDATE animais SET adotado = 1 WHERE id = ?`, [animal_id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });

        // req.flash('success_messages', ['Adoção registrada com sucesso!']);
        res.redirect('/adocao/list'); // Redirect to a relevant page, maybe a list or dashboard
    } catch (error) {
        console.error("Error submitting adocao form:", error);
        // req.flash('error_messages', ['Erro ao registrar adoção.']);
        // Consider deleting the uploaded file if DB operations fail
        if (req.file) {
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error("Error deleting file after DB error:", unlinkErr);
            });
        }
        res.status(500).render('error', { error: "Erro ao registrar adoção." });
    }
});

// Route to display adoptions with images
router.get('/list', isAdmin, async (req, res) => {
    try {
        // Fetch adoption data, potentially joining with animais table
        const adocoes = await new Promise((resolve, reject) => {
            db.all(`SELECT a.*, an.nome as animal_nome
                    FROM adocoes a
                    LEFT JOIN animais an ON a.animal_id = an.id
                    ORDER BY a.origem DESC`, // Assuming 'origem' is the timestamp column
                   [],
                   (err, rows) => {
                       if (err) reject(err);
                       else resolve(rows);
                   });
        });
        // Define path relative to the static folder setup in index.js
        const imagePath = '/static/uploads/adocao/'; // Path accessible by the browser
        res.render('adocao_list', { adocoes, imagePath });
    } catch (error) {
        console.error("Error fetching adoptions:", error);
        res.status(500).render('error', { error: "Erro ao carregar lista de adoções" });
    }
});

module.exports = router;
