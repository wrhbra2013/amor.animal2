  // /home/wander/amor.animal2/routes/parceriaRoutes.js
  const express = require('express');
  const { getPool } = require('../database/database'); // Para operações diretas com o BD
  const { executeAllQueries } = require('../database/queries');
  const { insert_parceria } = require('../database/insert');
  const { isAdmin } = require('../middleware/auth');
  // fs e multer não são necessários aqui, pois não há upload de arquivos.
  
  const router = express.Router();
  
  // GET /parceria - Exibe a lista de parcerias
  router.get('/', async (req, res) => {
      try {
          const results = await executeAllQueries();
          const parceriaData = results.parceria;
  
          
  
          res.render('parceria', { model: parceriaData });
      } catch (error) {
          console.error("[parceriaRoutes GET /] Erro ao buscar dados das parcerias:", error.message);
          res.status(500).render('error', { error: error.message || 'Não foi possível carregar os dados das parcerias.' });
      }
  });
  
  // GET /parceria/form - Renderiza o formulário para nova parceria
  router.get('/form', (req, res) => {
      // Considerar adicionar isAdmin se o formulário for apenas para administradores
      // Ex: router.get('/form', isAdmin, (req, res) => res.render('form_parceria'));
      res.render('form_parceria');
  });
  
  // POST /parceria/form - Processa o formulário de nova parceria
  router.post('/form', async (req, res) => { // Adicionar isAdmin se o formulário for protegido
      try {
          const formData = {
              empresa: req.body.empresa,
              localidade: req.body.localidade,
              proposta: req.body.proposta,
              representante: req.body.representante,
              telefone: req.body.telefone,
              whatsapp: req.body.whatsapp,
              email: req.body.email
          };
  
          await insert_parceria(
              formData.empresa,
              formData.localidade,
              formData.proposta,
              formData.representante,
              formData.telefone,
              formData.whatsapp,
              formData.email
          );
  
          console.log('[parceriaRoutes POST /form] Dados de "parceria" inseridos com sucesso:', formData);
          res.redirect('/home'); // Redireciona para a lista de parcerias
  
      } catch (error) {
          console.error("[parceriaRoutes POST /form] Erro ao processar formulário de 'parceria':", error);
          res.status(500).render('form_parceria', {
              error: 'Erro ao salvar os dados da parceria. Verifique os dados e tente novamente.'
              // Você pode querer reenviar os dados do formulário aqui para preenchimento
              // Ex: ... formData
          });
      }
  });
  
  // POST /parceria/delete/:id - Deleta um registro de parceria
  router.post('/delete/:id', isAdmin, async (req, res) => {
      const { id } = req.params;
      const pool = getPool();
  
      try {
          const deleteSql = `DELETE FROM parceria WHERE id = ?`;
          const [result] = await pool.execute(deleteSql, [id]);
  
          if (result.affectedRows === 0) {
              console.warn(`[parceriaRoutes DELETE] Nenhum registro encontrado na tabela 'parceria' com ID: ${id} para deletar.`);
          } else {
              console.log(`[parceriaRoutes DELETE] Registro de 'parceria' com ID: ${id} deletado.`);
          }
          res.redirect('/parceria'); // Redireciona para a lista de parcerias
  
      } catch (error) {
          console.error(`[parceriaRoutes DELETE] Erro ao deletar registro de 'parceria' com ID: ${id}:`, error);
          res.status(500).render('error', { error: 'Erro ao deletar o registro da parceria. Tente novamente.' });
      }
  });
  
  module.exports = router;
 