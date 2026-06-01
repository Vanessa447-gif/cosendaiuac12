const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Import des routes
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const documentRoutes = require('./routes/documentRoutes');
const userRoutes = require('./routes/userRoutes');

// Routes PUBLIQUES (pas besoin de token)
app.get('/api/public/services', async (req, res) => {
    try {
        const db = require('./config/database');
        const [services] = await db.execute(
            'SELECT id, name_fr, name_en, code, description_fr, description_en, color, icon FROM services WHERE is_active = 1 ORDER BY name_fr'
        );
        console.log('📡 Services publics envoyés:', services.length);
        res.json({ success: true, services });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, services: [] });
    }
});

app.get('/api/public/services/:id', async (req, res) => {
    try {
        const db = require('./config/database');
        const [services] = await db.execute(
            'SELECT id, name_fr, name_en, code, description_fr, description_en, color, icon FROM services WHERE id = ? AND is_active = 1',
            [req.params.id]
        );
        res.json({ success: true, service: services[0] || null });
    } catch (error) {
        res.status(500).json({ success: false, service: null });
    }
});

// Routes protégées
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API OK' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log('✅ Routes publiques: /api/public/services');
    console.log('✅ Routes protégées: /api/services, /api/documents\n');
});