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
    
    // Add more configurations as needed for other upload types
};
