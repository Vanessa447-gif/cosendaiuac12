const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Middleware d'authentification
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    // Pour les tests, on met un ID par défaut
    req.userId = 1;
    next();
};

router.use(authMiddleware);



// ============================================
// CRÉER UN DOCUMENT
// ============================================
router.post('/documents', async (req, res) => {
    try {
        let { title, content, service_id } = req.body;
        let userId = req.userId || 1;

        // Nettoyer les valeurs (éviter undefined)
        title = (title && title !== undefined) ? title : 'Sans titre';
        content = (content && content !== undefined) ? content : '';
        service_id = (service_id && service_id !== undefined) ? service_id : 1;
        userId = (userId && userId !== undefined) ? userId : 1;

        console.log('📝 Création document:', { title, service_id, userId });

        const [result] = await db.execute(
            `INSERT INTO documents (title_fr, title_en, content, uploaded_by, service_id)
             VALUES (?, ?, ?, ?, ?)`,
            [title, title, content, userId, service_id]
        );

        res.json({ 
            success: true, 
            message: 'Document créé',
            document: { 
                id: result.insertId, 
                title_fr: title, 
                title_en: title, 
                content: content 
            }
        });

    } catch (error) {
        console.error('❌ Erreur POST /documents:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// METTRE À JOUR UN DOCUMENT
// ============================================
router.put('/documents/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let { title, content } = req.body;

        // Vérifier l'ID
        if (!id || isNaN(id)) {
            return res.status(400).json({ success: false, message: 'ID invalide' });
        }

        // Nettoyer les valeurs
        title = (title && title !== undefined) ? title : 'Sans titre';
        content = (content && content !== undefined) ? content : '';

        console.log('✏️ Modification document:', { id, title });

        await db.execute(
            `UPDATE documents SET title_fr = ?, title_en = ?, content = ?, updated_at = NOW() WHERE id = ?`,
            [title, title, content, parseInt(id)]
        );

        res.json({ success: true, message: 'Document mis à jour' });

    } catch (error) {
        console.error('❌ Erreur PUT /documents/:id:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
//=======================
// editer un document
//=======================
// Récupérer le contenu d'un document
router.get('/documents/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [documents] = await db.execute(
            'SELECT id, title_fr, title_en, content FROM documents WHERE id = ?',
            [id]
        );
        
        if (documents.length === 0) {
            return res.status(404).json({ success: false, message: 'Document non trouvé' });
        }
        
        res.json({ success: true, document: documents[0] });
        
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// SUPPRIMER UN DOCUMENT
// ============================================
router.delete('/documents/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ success: false, message: 'ID invalide' });
        }

        console.log('🗑️ Suppression document:', id);

        await db.execute('DELETE FROM documents WHERE id = ?', [parseInt(id)]);

        res.json({ success: true, message: 'Document supprimé' });

    } catch (error) {
        console.error('❌ Erreur DELETE /documents/:id:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;