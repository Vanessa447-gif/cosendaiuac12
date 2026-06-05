const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS - Autoriser toutes les origines pour le développement
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connexion à la base de données
const db = require('./config/database');

// ========== ROUTES PUBLIQUES (sans authentification) ==========

// Route de test
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API OK' });
});

// Route pour récupérer tous les services
app.get('/api/public/services', async (req, res) => {
    console.log('📡 Appel de /api/public/services');
    try {
        const [services] = await db.execute(
            'SELECT id, name_fr, name_en, code, description_fr, description_en, color, icon FROM services WHERE is_active = 1 ORDER BY name_fr'
        );
        console.log(`✅ ${services.length} services trouvés`);
        res.json({ success: true, services });
    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({ success: false, message: error.message, services: [] });
    }
});

// Route pour récupérer un service spécifique
app.get('/api/public/services/:id', async (req, res) => {
    console.log(`📡 Appel de /api/public/services/${req.params.id}`);
    try {
        const [services] = await db.execute(
            'SELECT id, name_fr, name_en, code, description_fr, description_en, color, icon FROM services WHERE id = ? AND is_active = 1',
            [req.params.id]
        );
        if (services.length === 0) {
            return res.status(404).json({ success: false, message: 'Service non trouvé' });
        }
        res.json({ success: true, service: services[0] });
    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
// Route de test Backblaze
app.get('/api/test-storage', async (req, res) => {
    const storage = require('./config/storage');
    
    try {
        const testBuffer = Buffer.from('Test Backblaze B2 - ' + new Date().toISOString());
        const testFileName = `test/test-${Date.now()}.txt`;
        
        const uploadResult = await storage.uploadFile(testFileName, testBuffer, 'text/plain');
        
        if (uploadResult.success) {
            const fileUrl = storage.getFileUrl(testFileName);
            
            res.json({
                success: true,
                message: '✅ Backblaze B2 fonctionne !',
                testFile: fileUrl,
                bucket: process.env.BACKBLAZE_BUCKET_NAME,
                endpoint: process.env.BACKBLAZE_ENDPOINT
            });
        } else {
            res.json({ success: false, error: uploadResult.error });
        }
        
        // Nettoyage
        await storage.deleteFile(testFileName);
        
    } catch (error) {
        console.error('Erreur test:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== ROUTES PROTÉGÉES ==========
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const documentRoutes = require('./routes/documentRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);

// Servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========== DÉMARRAGE ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🚀 SERVEUR DÉMARRÉ`);
    console.log(`${'='.repeat(50)}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`\n📋 ROUTES DISPONIBLES:`);
    console.log(`   GET  /api/test`);
    console.log(`   GET  /api/public/services`);
    console.log(`   GET  /api/public/services/:id`);
    console.log(`   POST /api/auth/login`);
    console.log(`   GET  /api/services/current`);
    console.log(`   GET  /api/documents`);
    console.log(`${'='.repeat(50)}\n`);
});