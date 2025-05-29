 // /home/wander/amor.animal2/routes/adotanteRoutes.js
 const express = require('express');
 const { getPool } = require('../database/database'); // Para operações diretas com o BD
 const { executeAllQueries } = require('../database/queries');
 const { insert_adotante } = require('../database/insert');
 const { isAdmin } = require('../middleware/auth');
 // Não há upload de arquivos neste CRUD específico, então 'fs' e multer não são necessários aqui.
 
 const router = express.Router();
 
 // GET /adotante - Exibe a lista de adotantes
 router.get('/', async (req, res) => {
     try {
         const results = await executeAllQueries();
         const adotanteData = results.adotante;
 
       
 
         res.render('adotante', { listaPrincipal: adotanteData }); // 'listaPrincipal' conforme o EJS original
     } catch (error) {
         console.error("[adotanteRoutes GET /] Erro ao buscar dados dos adotantes:", error.message);
         res.status(500).render('error', { error: error.message || 'Não foi possível carregar os dados dos adotantes.' });
     }
 });
 
 // GET /adotante/form/:idPet - Renderiza o formulário para novo adotante, associado a um pet
 router.get('/form/:idPet', (req, res) => { // Considerar adicionar isAdmin se necessário
     const idPet = req.params.idPet;
     res.render('form_adotante', { idPet: idPet });
 });
 
 // POST /adotante/form - Processa o formulário de novo adotante
 router.post('/form', async (req, res) => { // Adicionar isAdmin se o formulário for protegido
     try {
         const formData = {
             q1: req.body.q1,
             q2: req.body.q2,
             q3: req.body.q3,
             nome: req.body.tutor, // 'nome' é o campo na tabela, 'tutor' no form original
             contato: req.body.contato,
             whatsapp: req.body.whatsapp,
             cep: req.body.cep,
             endereco: req.body.endereco,
             numero: req.body.numero,
             complemento: req.body.complemento,
             bairro: req.body.bairro,
             cidade: req.body.cidade,
             estado: req.body.estado,
             idPet: req.body.idPet
         };
 
         console.log("[adotanteRoutes POST /form] Dados recebidos do formulário:", formData);
 
         // A função insert_adotante já lida com a conversão de q1, q2, q3 e idPet para números
         await insert_adotante(
             formData.q1,
             formData.q2,
             formData.q3,
             formData.nome,
             formData.contato,
             formData.whatsapp,
             formData.cep,
             formData.endereco,
             formData.numero,
             formData.complemento,
             formData.bairro,
             formData.cidade,
             formData.estado,
             formData.idPet
         );
 
         console.log('[adotanteRoutes POST /form] Dados de "adotante" inseridos com sucesso.');
         res.redirect('/home'); // Ou para /home, ou para uma página de sucesso
 
     } catch (error) {
         console.error("[adotanteRoutes POST /form] Erro ao processar formulário de 'adotante':", error);
         // Se o erro for de constraint (ex: idPet não existe em 'adocao'),
         // a mensagem de erro do banco pode ser útil, mas para o usuário uma mensagem genérica é melhor.
         res.status(500).render('form_adotante', {
             error: 'Erro ao salvar os dados do adotante. Verifique os dados e tente novamente.',
             idPet: req.body.idPet // Reenviar idPet para o formulário em caso de erro
         });
     }
 });
 
 // POST /adotante/delete/:id - Deleta um registro de adotante
 // Mantido o nome da rota original /delete/adotante/:id
 router.post('/delete/adotante/:id', isAdmin, async (req, res) => {
     const { id } = req.params;
     const pool = getPool();
 
     try {
         const deleteSql = `DELETE FROM adotante WHERE id = ?`;
         const [result] = await pool.execute(deleteSql, [id]);
 
         if (result.affectedRows === 0) {
             console.warn(`[adotanteRoutes DELETE] Nenhum registro encontrado na tabela 'adotante' com ID: ${id} para deletar.`);
             // Pode ser útil informar ao usuário que o registro não foi encontrado,
             // mas um redirect para a lista pode ser suficiente.
         } else {
             console.log(`[adotanteRoutes DELETE] Registro de 'adotante' com ID: ${id} deletado.`);
         }
         res.redirect('/adotante'); // Redireciona para a lista de adotantes
 
     } catch (error) {
         console.error(`[adotanteRoutes DELETE] Erro ao deletar registro de 'adotante' com ID: ${id}:`, error);
         res.status(500).render('error', { error: 'Erro ao deletar o registro do adotante. Tente novamente.' });
     }
 });
 
 module.exports = router;
