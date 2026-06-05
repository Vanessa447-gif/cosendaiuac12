const path = require('path');
const fs = require('fs');

const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';

if (STORAGE_TYPE === 'backblaze') {
    console.log('☁️ Utilisation du stockage cloud Backblaze B2');
    module.exports = require('./backblaze');
} else {
    console.log('💾 Utilisation du stockage local');
    
    const LOCAL_PATH = path.join(__dirname, '../storage');
    const DOCUMENTS_PATH = path.join(LOCAL_PATH, 'documents');
    
    // Créer les dossiers
    if (!fs.existsSync(LOCAL_PATH)) {
        fs.mkdirSync(LOCAL_PATH, { recursive: true });
    }
    if (!fs.existsSync(DOCUMENTS_PATH)) {
        fs.mkdirSync(DOCUMENTS_PATH, { recursive: true });
    }
    
    const ensureDirectory = (dir) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        return dir;
    };
    
    const uploadFile = async (fileName, fileBuffer, contentType) => {
        const filePath = path.join(DOCUMENTS_PATH, fileName);
        const dir = path.dirname(filePath);
        ensureDirectory(dir);
        fs.writeFileSync(filePath, fileBuffer);
        return { success: true, filePath };
    };
    
    const getFileUrl = (fileName) => {
        return `http://localhost:5000/api/local-file/${fileName}`;
    };
    
    const deleteFile = async (fileName) => {
        const filePath = path.join(DOCUMENTS_PATH, fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    };
    
    const readFile = async (fileName) => {
        const filePath = path.join(DOCUMENTS_PATH, fileName);
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath);
        }
        return null;
    };
    
    const listFiles = async (prefix = '') => {
        return [];
    };
    
    module.exports = {
        uploadFile,
        getFileUrl,
        deleteFile,
        readFile,
        listFiles
    };
}