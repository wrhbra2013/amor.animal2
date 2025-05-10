// /home/wander/amor.animal2/utils/multerConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadBaseDir = path.join(__dirname, '../static/uploads'); // Base directory for uploads

// Function to ensure the destination directory exists
const ensureDirExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Directory created: ${dirPath}`);
    }
};

// Function to create a specific Multer disk storage configuration
const createDiskStorage = (subfolder) => {
    const destinationPath = path.join(uploadBaseDir, subfolder);
    ensureDirExists(destinationPath); // Create directory if it doesn't exist

    return multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, destinationPath);
        },
        filename: function (req, file, cb) {
            // Generate a unique and safe filename
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = path.extname(file.originalname);
            // Using fieldname + unique suffix is generally robust
            cb(null, file.fieldname + '-' + uniqueSuffix + extension);
        }
    });
};



// Export configured Multer instances for different upload types
module.exports = {
    uploadCastracao: multer({ storage: createDiskStorage('castracao') }),
    uploadAdotado: multer({ storage: createDiskStorage('adotado') }),
    uploadAdocao: multer({ storage: createDiskStorage('adocao') }),
    uploadProcuraSe: multer({ storage: createDiskStorage('procura_se') }),
    uploadHome: multer({ storage: createDiskStorage('home') }),
    uploadParceria: multer({ storage: createDiskStorage('parceria') }),

};

// Multer Configuration (Consider moving to utils/multerConfig.js)
function arq_filtro(parametro) {
    const uploadPaths = {
        'castracao': path.join(__dirname, './static/uploads/castracao/'),
        'adotado': path.join(__dirname, './static/uploads/adotado/'),
        'adocao': path.join(__dirname, './static/uploads/adocao/'),
        'procura_se': path.join(__dirname, './static/uploads/procura_se/'),
        'home': path.join(__dirname, './static/uploads/home/')
    };

    
    // Add more configurations as needed for other upload types
     const uploadPath = uploadPaths[parametro];
 
     if (!uploadPath) {
         console.error('Parâmetro do Multer INCORRETO:', parametro);
         // Maybe throw an error or return a middleware that sends an error response
         return null; // Or handle error appropriately
     }
 
     // Ensure directory exists (optional, but good practice)
     // fs.mkdirSync(uploadPath, { recursive: true });
 
     const storage = multer.diskStorage({
         destination: function (req, file, cb) {
             cb(null, uploadPath);
         },
         filename: function (req, file, cb) {
             // More robust filename generation (prevents overwrites, handles special chars)
             const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
             const extension = path.extname(file.originalname);
             const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_'); // Sanitize
             // cb(null, uniqueSuffix + extension); // Option 1: Unique name
             cb(null, file.fieldname + '-' + uniqueSuffix + extension); // Option 2: Fieldname + unique
             // Your current logic relies on renaming later, which is less ideal.
         }
     });
    
     return multer({ storage: storage });
    };

    

