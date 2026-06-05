const db = require('../config/database');

// Récupérer l'historique d'audit
const getAuditLog = async (req, res) => {
    try {
        const serviceId = req.query.service_id || req.userServiceId;
        const limit = parseInt(req.query.limit) || 100;
        
        let sql = `
            SELECT h.*, 
                   u.full_name as user_name, 
                   d.title_fr as document_title,
                   s.name_fr as service_name
            FROM history h
            LEFT JOIN users u ON h.user_id = u.id
            LEFT JOIN documents d ON h.document_id = d.id
            LEFT JOIN services s ON h.service_id = s.id
        `;
        
        const params = [];
        
        if (serviceId && req.userRole !== 'admin') {
            sql += ' WHERE h.service_id = ?';
            params.push(serviceId);
        }
        
        sql += ' ORDER BY h.created_at DESC LIMIT ?';
        params.push(limit);
        
        const [logs] = await db.execute(sql, params);
        
        res.json({ success: true, logs });
    } catch (error) {
        console.error('Erreur getAuditLog:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', logs: [] });
    }
};

// Ajouter une entrée dans l'audit
const addAuditEntry = async (userId, actionFr, actionEn, documentId = null, serviceId = null) => {
    try {
        await db.execute(
            `INSERT INTO history (user_id, action_fr, action_en, document_id, service_id)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, actionFr, actionEn, documentId, serviceId]
        );
    } catch (error) {
        console.error('Erreur addAuditEntry:', error);
    }
};

module.exports = {
    getAuditLog,
    addAuditEntry
};