const db = require('../config/database');

// Fonction utilitaire pour nettoyer les paramètres
const cleanParam = (value) => {
    if (value === undefined || value === null) {
        return null;
    }
    return value;
};

// Créer un nouveau document
const createDocument = async (req, res) => {
    try {
        // Récupérer et nettoyer les paramètres
        let { title, content, service_id } = req.body;
        let userId = req.userId;

        // Nettoyer les valeurs undefined
        title = (title !== undefined && title !== null) ? title : 'Sans titre';
        content = (content !== undefined && content !== null) ? content : '';
        service_id = (service_id !== undefined && service_id !== null) ? service_id : 1;
        userId = (userId !== undefined && userId !== null) ? userId : 1;

        console.log('📝 Création document:', { title, service_id, userId });

        const [result] = await db.execute(
            `INSERT INTO documents 
             (title_fr, title_en, content, uploaded_by, service_id)
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
        console.error('❌ Erreur createDocument:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mettre à jour un document
const updateDocument = async (req, res) => {
    try {
        const { id } = req.params;
        let { title, content } = req.body;
        let userId = req.userId;

        // Nettoyer les valeurs
        title = (title !== undefined && title !== null) ? title : 'Sans titre';
        content = (content !== undefined && content !== null) ? content : '';
        userId = (userId !== undefined && userId !== null) ? userId : 1;

        console.log('✏️ Modification document:', { id, title });

        await db.execute(
            `UPDATE documents SET title_fr = ?, title_en = ?, content = ?, updated_at = NOW() WHERE id = ?`,
            [title, title, content, id]
        );

        res.json({ success: true, message: 'Document mis à jour' });

    } catch (error) {
        console.error('❌ Erreur updateDocument:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Récupérer le contenu d'un document
const getDocumentContent = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('📖 Lecture document:', id);

        const [documents] = await db.execute(
            'SELECT id, title_fr, title_en, content FROM documents WHERE id = ?',
            [id]
        );

        if (documents.length === 0) {
            return res.status(404).json({ success: false, message: 'Document non trouvé' });
        }

        res.json({ success: true, document: documents[0] });

    } catch (error) {
        console.error('❌ Erreur getDocumentContent:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Supprimer un document
const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('🗑️ Suppression document:', id);

        await db.execute('DELETE FROM documents WHERE id = ?', [id]);

        res.json({ success: true, message: 'Document supprimé' });

    } catch (error) {
        console.error('❌ Erreur deleteDocument:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createDocument,
    updateDocument,
    getDocumentContent,
    deleteDocument
};