const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');

// Configuration de multer pour l'upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Générer un nom de fichier unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'file-' + uniqueSuffix + ext);
    }
});

// Filtre pour les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/jpg',
        'image/png'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non autorisé. Formats acceptés: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50 MB
    }
});

// Route d'upload (PUBLIQUE pour test - à protéger ensuite)
router.post('/upload', (req, res) => {
    console.log('📤 Requête d\'upload reçue');
    
    upload.single('file')(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            console.error('Erreur Multer:', err);
            return res.status(400).json({
                success: false,
                message: err.code === 'LIMIT_FILE_SIZE' 
                    ? 'Fichier trop volumineux (max 50MB)' 
                    : 'Erreur lors de l\'upload'
            });
        } else if (err) {
            console.error('Erreur:', err);
            return res.status(400).json({
                success: false,
                message: err.message || 'Erreur lors de l\'upload'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier reçu'
            });
        }

        console.log('✅ Fichier uploadé:', req.file.filename);

        // Retourner les informations du fichier
        res.json({
            success: true,
            fileName: req.file.filename,
            filePath: `/uploads/${req.file.filename}`,
            fileSize: req.file.size,
            fileType: req.file.mimetype
        });
    });
});

// Route pour créer un document (après upload)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            title_fr, title_en,
            description_fr, description_en,
            categoryId,
            fileName, filePath, fileSize, fileType,
            uploadedBy
        } = req.body;

        console.log('📝 Création document:', { title_fr, categoryId, fileName });

        const [result] = await db.execute(
            `INSERT INTO documents 
            (title_fr, title_en, description_fr, description_en, 
             category_id, file_name, file_path, file_size, file_type, uploaded_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title_fr, title_en, description_fr, description_en,
             categoryId, fileName, filePath, fileSize, fileType, uploadedBy]
        );

        // Journaliser l'action
        await db.execute(
            'INSERT INTO history (user_id, action_fr, action_en, document_id) VALUES (?, ?, ?, ?)',
            [uploadedBy, 'upload', 'upload', result.insertId]
        );

        res.json({
            success: true,
            message: 'Document ajouté avec succès',
            id: result.insertId
        });

    } catch (error) {
        console.error('❌ Erreur création document:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du document'
        });
    }
});

module.exports = router;