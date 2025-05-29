  // /home/wander/amor.animal2/routes/homeRoutes.js
  const express = require('express');
  const { getPool } = require('../database/database');
  const { executeAllQueries } = require('../database/queries'); // Essencial para buscar dados para a home
  const { insert_home } = require('../database/insert');     // Para o formulário de notícias da home
  const fs = require('fs').promises;
  const path = require('path');
  const { isAdmin } = require('../middleware/auth');
  const { uploadHome } = require('../utils/multerConfig');   // Multer para upload de notícias da home
  
  const router = express.Router();
  
  // Middleware para verificar consentimento de cookies
  function checkCookieConsent(req, res, next) {
      res.locals.showCookieBanner = !(req.cookies && req.cookies.cookie_consent === 'accepted');
      next();
  }
  
  // Função para buscar dados da página inicial
  async function getHomePageData() {
      try {
          // rawData is the direct result from executeAllQueries
          const rawData = await executeAllQueries();
          // Ensure 'data' is an object, even if rawData is null or undefined, to prevent errors.
          const data = rawData || {};
  
          return {
              home: data.home , // Default to empty array if data.home is undefined
              adocao: data.adocao || [],
              adocaoCount: data.adocaoCount || { count: 0 }, // Default to { count: 0 }
              adotante: data.adotante || [],
              adotanteCount: data.adotanteCount || { count: 0 },
              adotado: data.adotado || [],
              adotadoCount: data.adotadoCount || { count: 0 },
              castracao: data.castracao || [], // Ensured default to empty array
              castracaoCount: data.castracaoCount || { count: 0 },
              procura_se: data.procura_se || [],
              procura_seCount: data.procura_seCount || { count: 0 },
              parceria: data.parceria || [],
              parceriaCount: data.parceriaCount || { count: 0 }
          };
      } catch (error) {
          console.error("Error in getHomePageData:", error);
          throw error; // Re-throw the error to be caught by the route handler
      }
  }
  
  
  // Rota principal para '/' e '/home'
  router.get(['/', '/home'], checkCookieConsent, async (req, res) => {
      try {
          const homePageData = await getHomePageData();
          console.log('homePageData =>',homePageData)
          
          // Data is passed to the template using modelN keys as expected by home.ejs
          res.render('home', {
              model1: homePageData.home,
              model2: homePageData.adocao,
              model3: homePageData.adocaoCount,
              model4: homePageData.adotante,
              model5: homePageData.adotanteCount,
              model6: homePageData.adotado,
              model7: homePageData.adotadoCount,
              model8: homePageData.castracao,
              model9: homePageData.castracaoCount,
              model10: homePageData.procura_se,
              model11: homePageData.procura_seCount,
              model12: homePageData.parceria,
              model13: homePageData.parceriaCount,
              // showCookieBanner is set by checkCookieConsent middleware
              // and will be available in res.locals for the template
              
          });
          console.log('model 1=>', homePageData.home);
          console.log('model 2=>', homePageData.adocao);
          console.log('model 3=>', homePageData.adocaoCount);
          console.log('model 4=>', homePageData.adotante);
          console.log('model 5=>', homePageData.adotanteCount);
          console.log('model 6=>', homePageData.adotado);
          console.log('model 7=>', homePageData.adotadoCount);
          console.log('model 8=>', homePageData.castracao);
          console.log('model 9=>', homePageData.castracaoCount);
          console.log('model 10=>', homePageData.procura_se);
          console.log('model 11=>', homePageData.procura_seCount);
          console.log('model 12=>', homePageData.parceria);
          console.log('model 13=>', homePageData.parceriaCount);
          
        
      } catch (error) {
          // Error from getHomePageData will be caught here
          console.error("homeRoutes GET /home: Erro ao carregar a página inicial:", error.message);
          res.status(500).render('error', { error: error.message || 'Não foi possível carregar a página inicial.' });
      }
  });
  
  // Rota para renderizar o formulário de "Notícias" da home
  router.get('/home/form', isAdmin, (req, res) => {
      res.render('form_home'); // Assumes form_home.ejs exists
  });
  
  // Rota para processar o formulário de "Notícias" da home
  router.post('/home/form', isAdmin, uploadHome.single('arquivo'), async (req, res) => {
      if (!req.file) {
          return res.status(400).render('form_home', { error: 'Nenhum arquivo foi enviado.' });
      }
  
      const { destination, filename: tempFilename, originalname } = req.file;
      
      // WARNING: Using 'originalname' directly as 'finalFilename' can lead to file collisions.
      // Consider using 'tempFilename' or a UUID-based filename.
      const finalFilename = originalname; 
      const tempFilePath = path.join(destination, tempFilename);
      const finalFilePath = path.join(destination, finalFilename);
  
      try {
          await fs.rename(tempFilePath, finalFilePath);
          console.log(`homeRoutes: Arquivo de notícia movido para: ${finalFilePath}`);
  
          const homeData = {
              arquivo: finalFilename,
              titulo: req.body.titulo,
              mensagem: req.body.mensagem,
              link: req.body.link
          };
  
          await insert_home(homeData.arquivo, homeData.titulo, homeData.mensagem, homeData.link);
          console.log('homeRoutes: Dados de notícia da home inseridos:', homeData);
          res.redirect('/home');
  
      } catch (error) {
          console.error("homeRoutes POST /form: Erro ao processar formulário de notícia da home:", error);
          try {
              if (await fs.stat(tempFilePath).catch(() => false)) {
                  await fs.unlink(tempFilePath);
                  console.log("homeRoutes: Arquivo temporário removido após erro:", tempFilePath);
              } 
              else if (await fs.stat(finalFilePath).catch(() => false)) {
                   await fs.unlink(finalFilePath);
                   console.log("homeRoutes: Arquivo final (movido) removido após erro:", finalFilePath);
              }
          } catch (cleanupError) {
              console.error("homeRoutes: Erro ao limpar arquivo após falha no formulário de notícia:", cleanupError);
          }
          res.status(500).render('form_home', { error: 'Erro ao salvar os dados da notícia. Tente novamente.' });
      }
  });
  
  // Rota para deletar "Notícias" da home
  router.post('/delete/home/:id/:arq', isAdmin, async (req, res) => {
      const { id, arq } = req.params;
      const pool = getPool();
      const uploadsDir = path.join(__dirname, '..', 'static', 'uploads', 'home');
      const filePath = path.join(uploadsDir, path.basename(arq)); // path.basename for security
  
      try {
          const deleteSql = `DELETE FROM home WHERE id = ?`;
          const [result] = await pool.execute(deleteSql, [id]);
  
          if (result.affectedRows === 0) {
              console.warn(`homeRoutes: Nenhum registro encontrado na tabela 'home' com ID: ${id} para deletar.`);
          } else {
              console.log(`homeRoutes: Registro de notícia da home com ID: ${id} deletado.`);
          }
  
          try {
              await fs.access(filePath); 
              await fs.unlink(filePath);
              console.log(`homeRoutes: Arquivo de notícia ${filePath} deletado.`);
          } catch (fileError) {
              if (fileError.code === 'ENOENT') { 
                  console.log(`homeRoutes: Arquivo ${filePath} não encontrado para deleção, pode já ter sido removido.`);
              } else {
                  console.error(`homeRoutes: Erro ao deletar arquivo de notícia ${filePath} (não é ENOENT):`, fileError);
              }
          }
          res.redirect('/home');
      } catch (error) {
          console.error(`homeRoutes DELETE /delete/home: Erro ao deletar notícia da home com ID: ${id}:`, error);
          res.status(500).render('error', { error: 'Erro ao deletar a notícia. Tente novamente.' });
      }
  });
  
  module.exports = router;
  
 