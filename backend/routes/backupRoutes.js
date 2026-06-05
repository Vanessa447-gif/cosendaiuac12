const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Fonction utilitaire
const safeValue = (value, defaultValue = null) => {
    if (value === undefined) return defaultValue;
    if (value === null) return null;
    return value;
};

// Middleware
const authMiddleware = (req, res, next) => {
    req.userId = 1;
    next();
};

router.use(authMiddleware);

// Sauvegarder un brouillon
router.post('/drafts', async (req, res) => {
    try {
        let { documentId, title, content, serviceId } = req.body;
        let userId = req.userId;

        // Nettoyer TOUS les paramètres
        userId = safeValue(userId, 1);
        documentId = safeValue(documentId, null);
        title = safeValue(title, 'Brouillon');
        content = safeValue(content, '');
        serviceId = safeValue(serviceId, 1);

        console.log('💾 Sauvegarde brouillon:', { userId, documentId, title });

        // Vérifier si un brouillon existe
        let query = `SELECT id FROM document_drafts WHERE user_id = ?`;
        let params = [userId];

        if (documentId !== null) {
            query += ` AND document_id = ?`;
            params.push(documentId);
        } else {
            query += ` AND document_id IS NULL`;
        }

        const [existing] = await db.execute(query, params);

        if (existing.length > 0) {
            await db.execute(
                `UPDATE document_drafts SET title = ?, content = ?, last_saved = NOW() WHERE id = ?`,
                [title, content, existing[0].id]
            );
        } else {
            await db.execute(
                `INSERT INTO document_drafts (user_id, service_id, document_id, title, content)
                 VALUES (?, ?, ?, ?, ?)`,
                [userId, serviceId, documentId, title, content]
            );
        }

        res.json({ success: true });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Récupérer les brouillons
router.get('/drafts', async (req, res) => {
    try {
        const userId = safeValue(req.userId, 1);

        const [drafts] = await db.execute(
            'SELECT * FROM document_drafts WHERE user_id = ? ORDER BY last_saved DESC',
            [userId]
        );

        res.json({ success: true, drafts: drafts || [] });

    } catch (error) {
        console.error('Erreur:', error);
        res.json({ success: true, drafts: [] });
    }
});

module.exports = router;