const db = require('../config/database');

// Récupérer l'historique (filtré par service)
const getAuditLog = async (req, res) => {
    try {
        const serviceId = req.query.service_id || req.currentServiceId;
        const limit = parseInt(req.query.limit) || 100;
        
        let sql = `
            SELECT h.*, 
                   u.full_name as user_name, 
                   d.title_fr as document_title_fr,
                   d.title_en as document_title_en,
                   s.name_fr as service_name_fr,
                   s.name_en as service_name_en
            FROM history h
            LEFT JOIN users u ON h.user_id = u.id
            LEFT JOIN documents d ON h.document_id = d.id
            LEFT JOIN services s ON h.service_id = s.id
        `;
        
        const params = [];
        
        if (serviceId && req.userRole !== 'admin' && !req.canAccessAllServices) {
            sql += ' WHERE h.service_id = ?';
            params.push(serviceId);
        }
        
        sql += ' ORDER BY h.created_at DESC LIMIT ?';
        params.push(limit);
        
        const [logs] = await db.execute(sql, params);
        
        res.json({ success: true, logs });
        
    } catch (error) {
        console.error('Erreur getAuditLog:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

module.exports = { getAuditLog };