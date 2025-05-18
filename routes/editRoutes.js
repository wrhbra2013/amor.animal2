const express = require('express');
const router = express.Router();
const db = require('../database/database');

const tables = ['adocao', 'adotante', 'adotado', 'castracao', 'procura_se', 'parceria'];

tables.forEach(table => {
    router.get(`/${table}/edit/:id`, async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ message: `${table.charAt(0).toUpperCase() + table.slice(1, -1) || table.charAt(0).toUpperCase() + table.slice(1)} não encontrado` });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao buscar dados' });
        }
    });

    router.put(`/${table}/edit/:id`, async (req, res) => {
        const { id } = req.params;
        const updates = req.body;
        const fields = Object.keys(updates);
        const values = Object.values(updates);

        if (fields.length === 0) {
            return res.status(400).json({ message: 'Nenhum campo para atualizar' });
        }

        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        const query = `UPDATE ${table} SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;

        try {
            const result = await db.query(query, [...values, id]);
            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ message: `${table.charAt(0).toUpperCase() + table.slice(1, -1) || table.charAt(0).toUpperCase() + table.slice(1)} não encontrado` });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao atualizar dados' });
        }
    });
});

module.exports = router;
