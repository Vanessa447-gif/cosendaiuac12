const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const app = express();

// ========== CORS ==========
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'userid']
}));
app.use(express.json());

// ========== CONFIGURATION MULTER POUR L'UPLOAD ==========
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'file-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'];
        const ext = path.extname(file.originalname).toLowerCase().substring(1);
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Type de fichier non autorisé'), false);
        }
    }
});

// Créer les dossiers nécessaires
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}
if (!fs.existsSync('./storage')) {
    fs.mkdirSync('./storage');
}

// ========== CONNEXION MYSQL ==========
const db = require('./config/database');

// ========== ROUTES PUBLIQUES ==========

// Route de test
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API OK' });
});

// Liste des services (publique)
app.get('/api/public/services', async (req, res) => {
    try {
        const [services] = await db.execute(
            'SELECT id, name_fr, name_en, code, color, icon FROM services WHERE is_active = 1'
        );
        res.json({ success: true, services });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, services: [] });
    }
});

// Service par ID (public)
app.get('/api/public/services/:id', async (req, res) => {
    try {
        const [services] = await db.execute(
            'SELECT id, name_fr, name_en, code, color, icon FROM services WHERE id = ?',
            [req.params.id]
        );
        res.json({ success: true, service: services[0] || null });
    } catch (error) {
        res.status(500).json({ success: false, service: null });
    }
});

// ========== ROUTE D'UPLOAD (PUBLIQUE) ==========
app.post('/api/documents/upload', (req, res) => {
    console.log('📤 Requête upload reçue');
    
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error('❌ Erreur upload:', err);
            return res.status(400).json({ 
                success: false, 
                message: err.message 
            });
        }
        
        if (!req.file) {
            console.error('❌ Aucun fichier reçu');
            return res.status(400).json({ 
                success: false, 
                message: 'Aucun fichier reçu' 
            });
        }
        
        console.log('✅ Fichier uploadé:', req.file.filename);
        
        res.json({
            success: true,
            fileName: req.file.filename,
            filePath: `/uploads/${req.file.filename}`,
            fileSize: req.file.size,
            fileType: req.file.mimetype
        });
    });
});

// ========== AUTHENTIFICATION ==========
app.post('/api/auth/login', async (req, res) => {
    const { username, password, service_id } = req.body;
    
    console.log(`🔐 Tentative login: ${username}`);
    
    try {
        const [users] = await db.execute(
            'SELECT * FROM users WHERE username = ? AND is_active = 1',
            [username]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        
        const user = users[0];
        
        if (password !== user.password) {
            return res.status(401).json({ success: false, message: 'Mot de passe incorrect' });
        }
        
        // Générer un token simple
        const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
        
        // Récupérer les infos du service
        let service = null;
        if (user.service_id) {
            const [services] = await db.execute('SELECT * FROM services WHERE id = ?', [user.service_id]);
            if (services.length > 0) service = services[0];
        }
        
        // Audit - Connexion
        await db.execute(
            'INSERT INTO history (user_id, action_fr, action_en, created_at) VALUES (?, ?, ?, NOW())',
            [user.id, 'connexion', 'login']
        );
        
        delete user.password;
        
        res.json({
            success: true,
            token,
            user,
            service
        });
        
    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// ========== MIDDLEWARE AUTHENTIFICATION ==========
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Token manquant' });
    }
    
    try {
        const decoded = Buffer.from(token, 'base64').toString();
        const userId = parseInt(decoded.split(':')[0]);
        req.userId = userId;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token invalide' });
    }
};

// ========== ROUTES PROTÉGÉES ==========

// Service actuel
app.get('/api/services/current', authMiddleware, async (req, res) => {
    try {
        const [users] = await db.execute('SELECT service_id FROM users WHERE id = ?', [req.userId]);
        const serviceId = users[0]?.service_id || 1;
        
        const [services] = await db.execute('SELECT * FROM services WHERE id = ?', [serviceId]);
        res.json({ success: true, service: services[0] || null });
    } catch (error) {
        res.json({ success: true, service: null });
    }
});

// Statistiques du service
app.get('/api/services/stats', authMiddleware, async (req, res) => {
    try {
        const [users] = await db.execute('SELECT service_id FROM users WHERE id = ?', [req.userId]);
        const serviceId = users[0]?.service_id || 1;
        
        const [totalDocs] = await db.execute('SELECT COUNT(*) as total FROM documents WHERE service_id = ?', [serviceId]);
        const [totalViews] = await db.execute('SELECT SUM(views_count) as total FROM documents WHERE service_id = ?', [serviceId]);
        const [totalDownloads] = await db.execute('SELECT SUM(downloads_count) as total FROM documents WHERE service_id = ?', [serviceId]);
        const [activeUsers] = await db.execute('SELECT COUNT(*) as total FROM users WHERE service_id = ? AND is_active = 1', [serviceId]);
        
        res.json({
            success: true,
            stats: {
                totalDocuments: totalDocs[0]?.total || 0,
                totalViews: totalViews[0]?.total || 0,
                totalDownloads: totalDownloads[0]?.total || 0,
                activeUsers: activeUsers[0]?.total || 0,
                documentsByCategory: []
            }
        });
    } catch (error) {
        console.error('Erreur stats:', error);
        res.json({ success: true, stats: { totalDocuments: 0, totalViews: 0, totalDownloads: 0, activeUsers: 0, documentsByCategory: [] } });
    }
});

// Catégories du service
app.get('/api/services/categories', authMiddleware, async (req, res) => {
    try {
        const [users] = await db.execute('SELECT service_id FROM users WHERE id = ?', [req.userId]);
        const serviceId = users[0]?.service_id || 1;
        
        const [categories] = await db.execute('SELECT * FROM categories WHERE service_id = ?', [serviceId]);
        res.json({ success: true, categories });
    } catch (error) {
        console.error('Erreur categories:', error);
        res.json({ success: true, categories: [] });
    }
});

// Historique (audit)
app.get('/api/services/history', authMiddleware, async (req, res) => {
    res.json({ success: true, history: [] });
});

// ========== GESTION DES DOCUMENTS ==========

// Liste des documents (avec vues et téléchargements)
app.get('/api/documents', authMiddleware, async (req, res) => {
    try {
        const [users] = await db.execute('SELECT service_id FROM users WHERE id = ?', [req.userId]);
        const serviceId = users[0]?.service_id || 1;
        const search = req.query.search || '';
        
        let sql = 'SELECT *, views_count, downloads_count FROM documents WHERE service_id = ?';
        const params = [serviceId];
        
        if (search) {
            sql += ' AND (title_fr LIKE ? OR title_en LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        sql += ' ORDER BY created_at DESC';
        
        const [documents] = await db.execute(sql, params);
        res.json({ success: true, documents });
    } catch (error) {
        console.error('Erreur get documents:', error);
        res.json({ success: true, documents: [] });
    }
});

// Récupérer un document par ID (avec incrémentation des vues)
app.get('/api/documents/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        
        // 1. Incrémenter les vues
        await db.execute('UPDATE documents SET views_count = views_count + 1 WHERE id = ?', [id]);
        
        // 2. Audit - Consultation
        await db.execute(
            'INSERT INTO history (user_id, action_fr, action_en, document_id, created_at) VALUES (?, ?, ?, ?, NOW())',
            [userId, 'consultation', 'view', id]
        );
        
        // 3. Récupérer le document
        const [documents] = await db.execute('SELECT * FROM documents WHERE id = ?', [id]);
        
        res.json({ success: true, document: documents[0] });
    } catch (error) {
        console.error('Erreur get document by id:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Créer un document
app.post('/api/documents', authMiddleware, async (req, res) => {
    try {
        const { title_fr, title_en, description_fr, description_en, categoryId, fileName, filePath, fileSize, fileType, uploadedBy, service_id } = req.body;
        const userId = req.userId;
        
        const [result] = await db.execute(
            `INSERT INTO documents 
             (title_fr, title_en, description_fr, description_en, category_id, file_name, file_path, file_size, file_type, uploaded_by, service_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title_fr, title_en, description_fr || '', description_en || '', categoryId, fileName, filePath, fileSize, fileType, uploadedBy || userId, service_id || 1]
        );
        
        // Audit - Upload
        await db.execute(
            'INSERT INTO history (user_id, action_fr, action_en, document_id, created_at) VALUES (?, ?, ?, ?, NOW())',
            [userId, 'upload', 'upload', result.insertId]
        );
        
        res.json({ success: true, message: 'Document créé', id: result.insertId });
    } catch (error) {
        console.error('Erreur create document:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Supprimer un document
app.delete('/api/documents/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        
        // Audit - Suppression
        await db.execute(
            'INSERT INTO history (user_id, action_fr, action_en, document_id, created_at) VALUES (?, ?, ?, ?, NOW())',
            [userId, 'suppression', 'delete', id]
        );
        
        await db.execute('DELETE FROM documents WHERE id = ?', [id]);
        
        res.json({ success: true, message: 'Document supprimé' });
    } catch (error) {
        console.error('Erreur delete document:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Télécharger un document (avec incrémentation)
app.post('/api/documents/:id/download', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        
        // 1. Incrémenter les téléchargements
        await db.execute('UPDATE documents SET downloads_count = downloads_count + 1 WHERE id = ?', [id]);
        
        // 2. Audit - Téléchargement
        await db.execute(
            'INSERT INTO history (user_id, action_fr, action_en, document_id, created_at) VALUES (?, ?, ?, ?, NOW())',
            [userId, 'téléchargement', 'download', id]
        );
        
        // 3. Récupérer le chemin du fichier
        const [docs] = await db.execute('SELECT file_path FROM documents WHERE id = ?', [id]);
        const filePath = docs[0]?.file_path;
        
        res.json({ 
            success: true, 
            downloadUrl: `http://localhost:5000${filePath}`,
            message: 'Téléchargement prêt'
        });
    } catch (error) {
        console.error('Erreur download:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== GESTION DES UTILISATEURS ==========

// Liste des utilisateurs
app.get('/api/users', authMiddleware, async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, username, full_name, email, role FROM users');
        res.json({ success: true, users });
    } catch (error) {
        console.error('Erreur get users:', error);
        res.json({ success: true, users: [] });
    }
});

// ========== JOURNAL D'AUDIT ==========
app.get('/api/audit', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        
        const [history] = await db.execute(`
            SELECT h.*, u.full_name as user_name, d.title_fr as document_name
            FROM history h
            LEFT JOIN users u ON h.user_id = u.id
            LEFT JOIN documents d ON h.document_id = d.id
            ORDER BY h.created_at DESC
            LIMIT 100
        `);
        
        res.json({ success: true, logs: history });
    } catch (error) {
        console.error('Erreur audit:', error);
        res.json({ success: true, logs: [] });
    }
});

// ========== SERVEUR STATIQUE ==========
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========== DÉMARRAGE ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 SERVEUR DÉMARRÉ AVEC SUCCÈS`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📁 Uploads: ${path.join(__dirname, 'uploads')}`);
    console.log(`\n📋 ROUTES DISPONIBLES:`);
    console.log(`   🌐 PUBLIQUES:`);
    console.log(`      GET  /api/public/services`);
    console.log(`      GET  /api/public/services/:id`);
    console.log(`      POST /api/documents/upload`);
    console.log(`      POST /api/auth/login`);
    console.log(`\n   🔒 PROTÉGÉES (AUTH REQUISE):`);
    console.log(`      GET  /api/services/current`);
    console.log(`      GET  /api/services/stats`);
    console.log(`      GET  /api/services/categories`);
    console.log(`      GET  /api/documents`);
    console.log(`      GET  /api/documents/:id    → Incrémente les vues + audit`);
    console.log(`      POST /api/documents         → Création document + audit`);
    console.log(`      DELETE /api/documents/:id   → Suppression + audit`);
    console.log(`      POST /api/documents/:id/download → Incrémente téléchargements + audit`);
    console.log(`      GET  /api/users`);
    console.log(`      GET  /api/audit             → Journal d'audit`);
    console.log(`${'='.repeat(60)}\n`);
});