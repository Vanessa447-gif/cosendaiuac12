const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');
const {
    getDocuments,
    getDocumentById,
    createDocument,
    deleteDocument,
    incrementDownload
} = require('../controllers/documentController');

// Configuration multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Upload public
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'Aucun fichier' });
    res.json({
        success: true,
        fileName: req.file.filename,
        filePath: `/uploads/${req.file.filename}`,
        fileSize: req.file.size,
        fileType: req.file.mimetype
    });
});

// Routes protégées
router.use(authMiddleware);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.post('/', createDocument);
router.delete('/:id', deleteDocument);
router.post('/:id/download', incrementDownload);

module.exports = router;