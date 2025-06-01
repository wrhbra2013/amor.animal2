 // /home/wander/amor.animal2/utils/multerConfig.js
 const multer = require('multer');
 const path = require('path');
 const fs = require('fs');

 
 const targetDir = '/workspace/static/uploads/castracao/'; // Or construct dynamically
 
 try {
   if (!fs.existsSync(targetDir)) {
     fs.mkdirSync(targetDir, { recursive: true });
     console.log(`Directory created successfully: ${targetDir}`);
   } else {
     console.log(`Directory already exists: ${targetDir}`);
   }
 } catch (err) {
   console.error(`Error creating directory ${targetDir}:`, err);
   // Depending on your application, you might want to throw the error
   // or exit if this directory is critical.
   // throw err;
 }
 
 // Now you can safely use this directory, for example, with multer:
 // const multer = require('multer');
 // const storage = multer.diskStorage({
 //   destination: function (req, file, cb) {
 //     cb(null, targetDir); // Use the ensured directory
 //   },
 //   filename: function (req, file, cb) {
 //     cb(null, Date.now() + '-' + file.originalname);
 //   }
 // });
 // const upload = multer({ storage: storage });
 
 
 const uploadBaseDir = path.join(__dirname, '../static/uploads');
 
 const ensureDirExists = (dirPath) => {
     try {
         if (!fs.existsSync(dirPath)) {
             fs.mkdirSync(dirPath, { recursive: true });
             console.log(`Directory created: ${dirPath}`);
         }
     } catch (error) {
         console.error(`Erro ao criar diretório ${dirPath}:`, error);
         throw error; // Re-lança o erro para ser pego pelo try-catch mais externo se necessário
     }
 };
 
 const createDiskStorageConfig = (subfolder) => {
     const destinationPath = path.join(uploadBaseDir, subfolder);
     ensureDirExists(destinationPath);
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
    //  console.log(`[multerConfig] Criando instância para subfolder: ${subfolder}`);
     const storage = createDiskStorageConfig(subfolder);
     const multerOptions = { storage: storage };
     if (fileFilter) multerOptions.fileFilter = fileFilter;
     if (limits) multerOptions.limits = limits;
     return multer(multerOptions);
 };
 
 const defaultLimits = {
     fileSize: 5 * 1024 * 1024
 };
 
 try {
    //  console.log('[multerConfig] Definindo module.exports...');
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
     console.error('[multerConfig] ERRO CRÍTICO DURANTE A INICIALIZAÇÃO DO MÓDULO:', error);
     module.exports = {}; // Exporta um objeto vazio para evitar mais erros de 'undefined'
 }
 