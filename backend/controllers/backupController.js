const db = require('../config/database');

// Sauvegarder un brouillon sur le serveur
const saveDraft = async (req, res) => {
    try {
        const { documentId, title, content, serviceId } = req.body;
        const userId = req.userId;

        // Vérifier si un brouillon existe déjà
        const [existing] = await db.execute(
            `SELECT id FROM document_drafts 
             WHERE user_id = ? AND (document_id = ? OR (document_id IS NULL AND ? IS NULL))`,
            [userId, documentId, documentId]
        );

        if (existing.length > 0) {
            await db.execute(
                `UPDATE document_drafts 
                 SET title = ?, content = ?, last_saved = NOW(), expires_at = DATE_ADD(NOW(), INTERVAL 48 HOUR)
                 WHERE id = ?`,
                [title, content, existing[0].id]
            );
        } else {
            await db.execute(
                `INSERT INTO document_drafts (user_id, service_id, document_id, title, content, expires_at)
                 VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 48 HOUR))`,
                [userId, serviceId, documentId, title, content]
            );
        }

        res.json({ success: true, message: 'Brouillon sauvegardé' });

    } catch (error) {
        console.error('Erreur saveDraft:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Récupérer les brouillons d'un utilisateur
const getUserDrafts = async (req, res) => {
    try {
        const userId = req.userId;

        const [drafts] = await db.execute(
            `SELECT d.*, s.name_fr as service_name, doc.title_fr as original_title
             FROM document_drafts d
             LEFT JOIN services s ON d.service_id = s.id
             LEFT JOIN documents doc ON d.document_id = doc.id
             WHERE d.user_id = ? AND d.expires_at > NOW()
             ORDER BY d.last_saved DESC`,
            [userId]
        );

        res.json({ success: true, drafts });

    } catch (error) {
        console.error('Erreur getUserDrafts:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Récupérer un brouillon spécifique
const getDraft = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const [drafts] = await db.execute(
            `SELECT * FROM document_drafts WHERE id = ? AND user_id = ? AND expires_at > NOW()`,
            [id, userId]
        );

        if (drafts.length === 0) {
            return res.status(404).json({ success: false, message: 'Brouillon non trouvé' });
        }

        res.json({ success: true, draft: drafts[0] });

    } catch (error) {
        console.error('Erreur getDraft:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Supprimer un brouillon
const deleteDraft = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        await db.execute(
            `DELETE FROM document_drafts WHERE id = ? AND user_id = ?`,
            [id, userId]
        );

        res.json({ success: true, message: 'Brouillon supprimé' });

    } catch (error) {
        console.error('Erreur deleteDraft:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Sauvegarde automatique serveur
const serverAutoSave = async (req, res) => {
    try {
        const { documentId, title, content } = req.body;
        const userId = req.userId;

        await db.execute(
            `INSERT INTO server_autosaves (user_id, document_id, title, content)
             VALUES (?, ?, ?, ?)`,
            [userId, documentId, title, content]
        );

        // Garder seulement les 50 derniers autosaves par utilisateur
        await db.execute(
            `DELETE FROM server_autosaves 
             WHERE user_id = ? AND id NOT IN (
                 SELECT id FROM (
                     SELECT id FROM server_autosaves 
                     WHERE user_id = ? 
                     ORDER BY timestamp DESC LIMIT 50
                 ) AS keep
             )`,
            [userId, userId]
        );

        res.json({ success: true });

    } catch (error) {
        console.error('Erreur serverAutoSave:', error);
        res.status(500).json({ success: false });
    }
};

module.exports = {
    saveDraft,
    getUserDrafts,
    getDraft,
    deleteDraft,
    serverAutoSave
};