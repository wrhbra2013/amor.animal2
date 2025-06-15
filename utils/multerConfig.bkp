   // /home/wander/amor.animal2/utils/multerConfig.js
   const multer = require('multer');
   const path = require('path');
   const fs = require('fs');
 
   /**
    * Ensures a directory exists. Creates it recursively if it doesn't.
    * @param {string} dirPath - The path to the directory.
    */
   const ensureDirExists = (dirPath) => {
       try {
           if (!fs.existsSync(dirPath)) {
               fs.mkdirSync(dirPath, { recursive: true });
               console.log(`Directory created: ${dirPath}`);
           } else {
               // Optional: Check if existing path is a directory
               const stat = fs.statSync(dirPath);
               if (!stat.isDirectory()) {
                   throw new Error(`Path ${dirPath} exists but is not a directory.`);
               }
           }
       } catch (error) {
           // Adiciona mais contexto ao erro original antes de relançá-lo
           const enhancedError = new Error(`Failed to ensure directory exists at ${dirPath}: ${error.message}`);
           enhancedError.cause = error; // Para preservar o erro original, se suportado (Node.js >= 16.9.0)
           enhancedError.code = error.code; // Preserva o código do erro original (ex: EACCES, ENOENT)
           console.error(enhancedError.message); // Log do erro aprimorado
           throw enhancedError; // Re-lança o erro para ser pego pelo try-catch mais externo
       }
   };
 
   //  Local config
   //  Assume que __dirname no ambiente de execução (ex: /workspace/utils) leva a um uploadBaseDir como /workspace/static/uploads
   const uploadBaseDir = path.join(__dirname, '../static/uploads');
 
   // Ensure the base upload directory exists
   // Esta chamada é crucial. Se falhar, o erro será lançado aqui.
   try {
     ensureDirExists(uploadBaseDir);
   } catch (error) {
     console.error(`[multerConfig] ERRO CRÍTICO AO INICIALIZAR DIRETÓRIO BASE DE UPLOAD (${uploadBaseDir}):`, error.message);
     // Decide como lidar com isso: relançar para parar a inicialização do módulo ou exportar config vazia.
     // Relançar é geralmente melhor para sinalizar uma falha crítica de configuração.
     throw error; // Isso impedirá que o restante do módulo seja processado se o diretório base falhar.
   }
 
 
   // --- Google Cloud Specific Configuration (comentado como no original) ---
   // ... (mantido como no original)
 
   const createDiskStorageConfig = (subfolder) => {
       const destinationPath = path.join(uploadBaseDir, subfolder);
       ensureDirExists(destinationPath); // Cria o subdiretório específico
       return multer.diskStorage({
           destination: function (req, file, cb) {
               cb(null, destinationPath);
           },
           filename: function (req, file, cb) {
               const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
               const extension = path.extname(file.originalname);
               cb(null, file.fieldname + '-' + uniqueSuffix + extension);
           }
       });
   };
 
   const imageFileFilter = (req, file, cb) => {
       const filetypes = /jpeg|jpg|png|gif|webp/;
       const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
       const mimetype = filetypes.test(file.mimetype);
       if (mimetype && extname) {
           return cb(null, true);
       } else {
           cb(new Error('Erro: Apenas imagens são permitidas (jpeg, jpg, png, gif, webp)!'), false);
       }
   };
 
   const createMulterInstance = (subfolder, fileFilter, limits) => {
       const storage = createDiskStorageConfig(subfolder);
       const multerOptions = { storage: storage };
       if (fileFilter) multerOptions.fileFilter = fileFilter;
       if (limits) multerOptions.limits = limits;
       return multer(multerOptions);
   };
 
   const defaultLimits = {
       fileSize: 5 * 1024 * 1024 // 5MB
   };
 
   try {
       module.exports = {
           uploadCastracao: createMulterInstance('castracao/', imageFileFilter, defaultLimits),
           uploadAdotado: createMulterInstance('adotado/', imageFileFilter, defaultLimits),
           uploadAdocao: createMulterInstance('adocao/', imageFileFilter, defaultLimits),
           uploadProcuraSe: createMulterInstance('procura_se/', imageFileFilter, defaultLimits),
           uploadHome: createMulterInstance('home/', imageFileFilter, defaultLimits),
           uploadParceria: createMulterInstance('parceria/', (req, file, cb) => {
               const filetypes = /jpeg|jpg|png|gif|webp|pdf/;
               const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
               const mimetype = filetypes.test(file.mimetype);
               if (mimetype && extname) {
                   return cb(null, true);
               } else {
                   cb(new Error('Erro: Tipo de arquivo não suportado para parceria!'), false);
               }
           }, defaultLimits)
       };
       console.log('[multerConfig] ATIVO.');
   } catch (error) {
       console.error('[multerConfig] ERRO CRÍTICO DURANTE A INICIALIZAÇÃO DO MÓDULO (após tentativa de criar subdiretórios):', error.message);
       // Se um erro ocorreu aqui, provavelmente foi em ensureDirExists para um subdiretório.
       // O erro original (incluindo o caminho específico) já foi logado por ensureDirExists.
       module.exports = {}; // Exporta um objeto vazio para evitar mais erros de 'undefined'
   }
 