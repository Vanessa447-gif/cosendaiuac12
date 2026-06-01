// routes/publicRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Récupérer tous les services actifs (page d'accueil)
router.get('/services', async (req, res) => {
    try {
        const [services] = await db.execute(
            'SELECT id, name_fr, name_en, code, description_fr, description_en, color, icon FROM services WHERE is_active = 1 ORDER BY name_fr'
        );
        res.json({ success: true, services });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Récupérer un service spécifique
router.get('/services/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [services] = await db.execute(
            'SELECT id, name_fr, name_en, code, description_fr, description_en, color, icon FROM services WHERE id = ? AND is_active = 1',
            [id]
        );
        
        if (services.length === 0) {
            return res.status(404).json({ success: false, message: 'Service non trouvé' });
        }
        
        res.json({ success: true, service: services[0] });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

module.exports = router;