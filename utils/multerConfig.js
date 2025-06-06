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
          }
      } catch (error) {
          console.error(`Erro ao criar diretório ${dirPath}:`, error);
          throw error; // Re-lança o erro para ser pego pelo try-catch mais externo se necessário
      }
  };
  
  //  Local config
  const uploadBaseDir = path.join(__dirname, '../static/uploads');
  
  // Ensure the base upload directory exists
  ensureDirExists(uploadBaseDir); // Agora a função está definida antes de ser chamada
  
  //  Google Cloud Config
  //const uploadBaseDir = multer({ storage: multer.memoryStorage() });
  // Create a Multer instance configured for memory storage
  // This is typically used when you intend to process files in memory (e.g., stream to Cloud Storage)
  // instead of saving them to the local filesystem.
  
  // --- Google Cloud Specific Configuration ---
  // When deploying to Google Cloud Run or App Engine Standard, saving files locally
  // to the ephemeral filesystem is generally NOT recommended for production apps
  // because files might be lost when instances restart or scale.
  // A better approach is to stream files directly to a service like Google Cloud Storage.
  // For this, Multer's memory storage is useful.
  
  // NOTE: The file handling logic in routes (fs.rename, fs.unlink) would need to be
  // adapted to use Cloud Storage APIs instead of local filesystem operations.
  // The current routes are set up for disk storage.
  
  // If you ARE using a Cloud SQL Proxy that makes a local path available (rare for file uploads),
  // or if this is for local testing with a simulated cloud env,
  // you might still use Disk Storage but specify a path accessible to the proxy.
  // Otherwise, switch to memory storage and Cloud Storage APIs.
  
  // ** IMPORTANT: The current route handlers are using fs.rename and fs.unlink,
  // which implies Disk Storage is expected. The Multer memoryStorage() config below
  // conflicts with the fs operations in routes.
  // To correctly use memory storage, you would process req.file.buffer directly
  // and send it to Cloud Storage, bypassing fs operations. **
  
  // Choosing Disk Storage for Google Cloud SQL Proxy (if applicable) or local dev:
  // Define the base directory where uploads will be saved.
  // Ensure this path is writeable by your application and, if using Cloud SQL Proxy
  // for file access (uncommon), accessible via that method.
  // Example for potential proxy setup (verify your proxy config):
  // const uploadBaseDir = process.env.UPLOAD_BASE_DIR || '/mnt/disks/cloudsql-proxy-mount/amor.animal2/static/uploads';
  // OR if you are using a local filesystem for local development:
  // const uploadBaseDir = path.join(__dirname, '../static/uploads');
  
  // ** Assuming local filesystem for development/testing matches route logic **
  // If deploying to a production PaaS like Cloud Run/App Engine Standard, this needs significant changes
  // to use memory storage and Cloud
  //Storage APIs like Cloud Storage. **
  
  const createDiskStorageConfig = (subfolder) => {
      const destinationPath = path.join(uploadBaseDir, subfolder);
      ensureDirExists(destinationPath); // This will now be the primary way directories are created
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
      console.error('[multerConfig] ERRO CRÍTICO DURANTE A INICIALIZAÇÃO DO MÓDULO:', error);
      module.exports = {}; // Exporta um objeto vazio para evitar mais erros de 'undefined'
  }
 