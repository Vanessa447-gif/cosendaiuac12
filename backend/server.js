const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

// ========== IMPORTS DES ROUTES ==========
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const statsRoutes = require('./routes/statsRoutes');
const auditRoutes = require('./routes/auditRoutes');
const editorRoutes = require('./routes/editorRoutes');
const backupRoutes = require('./routes/backupRoutes');

// ========== ROUTES ==========
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/editor', editorRoutes);
app.use('/api/backup', backupRoutes);

// ========== ROUTES SUPPLÉMENTAIRES ==========

// Route pour la récupération des brouillons (GET)
app.get('/api/backup/drafts', async (req, res) => {
    try {
        const db = require('./config/database');
        const userId = req.userId || 1;
        
        const [drafts] = await db.execute(
            `SELECT * FROM document_drafts WHERE user_id = ? AND expires_at > NOW() ORDER BY last_saved DESC`,
            [userId]
        );
        
        res.json({ success: true, drafts: drafts || [] });
    } catch (error) {
        console.error('Erreur get drafts:', error);
        res.json({ success: true, drafts: [] });
    }
});

// Route pour l'autosave (POST)
app.post('/api/backup/autosave', async (req, res) => {
    try {
        const db = require('./config/database');
        const { documentId, title, content, serviceId } = req.body;
        const userId = req.userId || 1;
        
        await db.execute(
            `INSERT INTO server_autosaves (user_id, document_id, title, content)
             VALUES (?, ?, ?, ?)`,
            [userId, documentId, title, content]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur autosave:', error);
        res.json({ success: true });
    }
});

// Route pour récupérer un brouillon spécifique
app.get('/api/backup/drafts/:id', async (req, res) => {
    try {
        const db = require('./config/database');
        const { id } = req.params;
        
        const [drafts] = await db.execute(
            `SELECT * FROM document_drafts WHERE id = ?`,
            [id]
        );
        
        if (drafts.length > 0) {
            res.json({ success: true, draft: drafts[0] });
        } else {
            res.json({ success: false, message: 'Brouillon non trouvé' });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Route pour supprimer un brouillon
app.delete('/api/backup/drafts/:id', async (req, res) => {
    try {
        const db = require('./config/database');
        const { id } = req.params;
        
        await db.execute(`DELETE FROM document_drafts WHERE id = ?`, [id]);
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false });
    }
});

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Créer les dossiers nécessaires
const dirs = ['./uploads', './storage', './storage/documents'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Route de test
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API OK' });
});

// ========== DÉMARRAGE ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log('✅ Routes disponibles:');
    console.log('   POST /api/auth/login');
    console.log('   GET  /api/documents');
    console.log('   GET  /api/editor/documents/:id');
    console.log('   POST /api/editor/documents');
    console.log('   PUT  /api/editor/documents/:id');
    console.log('   GET  /api/backup/drafts');
    console.log('   POST /api/backup/autosave');
});