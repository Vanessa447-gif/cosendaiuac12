const AWS = require('aws-sdk');
const B2 = require('backblaze-b2');

// Configuration Backblaze B2 (mode S3 compatible)
const s3 = new AWS.S3({
    endpoint: process.env.BACKBLAZE_ENDPOINT,
    accessKeyId: process.env.BACKBLAZE_KEY_ID,
    secretAccessKey: process.env.BACKBLAZE_APPLICATION_KEY,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
    region: 'us-east-005'
});

const bucketName = process.env.BACKBLAZE_BUCKET_NAME;
const downloadUrl = process.env.BACKBLAZE_DOWNLOAD_URL;

// Version B2 native (pour certaines opérations)
const b2 = new B2({
    applicationKeyId: process.env.BACKBLAZE_KEY_ID,
    applicationKey: process.env.BACKBLAZE_APPLICATION_KEY
});

// Initialiser la connexion
const initB2 = async () => {
    try {
        await b2.authorize();
        console.log('✅ Backblaze B2 connecté');
        return true;
    } catch (error) {
        console.error('❌ Erreur connexion Backblaze:', error);
        return false;
    }
};

// Upload d'un fichier via S3 compatible API
const uploadFile = async (fileName, fileBuffer, contentType) => {
    try {
        const params = {
            Bucket: bucketName,
            Key: fileName,
            Body: fileBuffer,
            ContentType: contentType
        };
        
        const result = await s3.upload(params).promise();
        console.log(`✅ Fichier uploadé: ${fileName}`);
        
        return {
            success: true,
            location: result.Location,
            key: result.Key
        };
        
    } catch (error) {
        console.error('❌ Erreur upload:', error);
        return { success: false, error: error.message };
    }
};

// Obtenir l'URL publique d'un fichier
const getFileUrl = (fileName) => {
    return `${downloadUrl}/${fileName}`;
};

// Supprimer un fichier
const deleteFile = async (fileName) => {
    try {
        const params = {
            Bucket: bucketName,
            Key: fileName
        };
        
        await s3.deleteObject(params).promise();
        console.log(`✅ Fichier supprimé: ${fileName}`);
        return true;
        
    } catch (error) {
        console.error('❌ Erreur suppression:', error);
        return false;
    }
};

// Lire un fichier
const readFile = async (fileName) => {
    try {
        const params = {
            Bucket: bucketName,
            Key: fileName
        };
        
        const result = await s3.getObject(params).promise();
        return result.Body;
        
    } catch (error) {
        console.error('❌ Erreur lecture:', error);
        return null;
    }
};

// Lister les fichiers
const listFiles = async (prefix = '') => {
    try {
        const params = {
            Bucket: bucketName,
            Prefix: prefix
        };
        
        const result = await s3.listObjectsV2(params).promise();
        return result.Contents || [];
        
    } catch (error) {
        console.error('❌ Erreur liste fichiers:', error);
        return [];
    }
};

// Initialiser (appelé au démarrage)
initB2();

module.exports = {
    uploadFile,
    getFileUrl,
    deleteFile,
    readFile,
    listFiles,
    bucketName
};