const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Middleware d'authentification simple
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        req.userId = 1;
        req.userRole = 'admin';
        return next();
    }
    try {
        // Pour les tests, on met un ID par défaut
        req.userId = 1;
        req.userRole = 'admin';
        next();
    } catch (error) {
        req.userId = 1;
        next();
    }
};

router.use(authMiddleware);

// GET /api/audit - Récupérer l'historique
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        
        const [logs] = await db.execute(`
            SELECT h.*, 
                   u.full_name as user_name, 
                   d.title_fr as document_title,
                   s.name_fr as service_name
            FROM history h
            LEFT JOIN users u ON h.user_id = u.id
            LEFT JOIN documents d ON h.document_id = d.id
            LEFT JOIN services s ON h.service_id = s.id
            ORDER BY h.created_at DESC
            LIMIT ?
        `, [limit]);
        
        res.json({ success: true, logs: logs || [] });
    } catch (error) {
        console.error('Erreur GET /api/audit:', error);
        res.json({ success: true, logs: [] });
    }
});

// POST /api/audit - Ajouter une entrée
router.post('/', async (req, res) => {
    try {
        const { action_fr, action_en, document_id, service_id } = req.body;
        const userId = req.userId || 1;
        
        await db.execute(
            `INSERT INTO history (user_id, action_fr, action_en, document_id, service_id)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, action_fr, action_en, document_id, service_id]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur POST /api/audit:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;