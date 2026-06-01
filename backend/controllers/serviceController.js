const db = require('../config/database');

const getCurrentService = async (req, res) => {
    try {
        const serviceId = req.userServiceId;
        
        const [services] = await db.execute(
            'SELECT * FROM services WHERE id = ? AND is_active = 1',
            [serviceId]
        );
        
        if (services.length === 0) {
            return res.status(404).json({ success: false, message: 'Service non trouvé' });
        }
        
        res.json({ success: true, service: services[0] });
    } catch (error) {
        console.error('Erreur getCurrentService:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

const getServiceStats = async (req, res) => {
    try {
        const serviceId = req.userServiceId;
        
        const [totalDocs] = await db.execute(
            'SELECT COUNT(*) as total FROM documents WHERE service_id = ? AND status = "actif"',
            [serviceId]
        );
        
        const [totalViews] = await db.execute(
            'SELECT SUM(views_count) as total FROM documents WHERE service_id = ?',
            [serviceId]
        );
        
        const [totalDownloads] = await db.execute(
            'SELECT SUM(downloads_count) as total FROM documents WHERE service_id = ?',
            [serviceId]
        );
        
        const [categoryStats] = await db.execute(`
            SELECT c.id, c.name_fr, c.name_en, c.color, COUNT(d.id) as count
            FROM categories c
            LEFT JOIN documents d ON c.id = d.category_id AND d.service_id = ? AND d.status = 'actif'
            WHERE c.service_id = ?
            GROUP BY c.id
        `, [serviceId, serviceId]);
        
        const [activeUsers] = await db.execute(
            'SELECT COUNT(*) as total FROM users WHERE service_id = ? AND is_active = 1',
            [serviceId]
        );
        
        res.json({
            success: true,
            stats: {
                totalDocuments: totalDocs[0].total,
                totalViews: totalViews[0]?.total || 0,
                totalDownloads: totalDownloads[0]?.total || 0,
                activeUsers: activeUsers[0].total,
                documentsByCategory: categoryStats
            }
        });
    } catch (error) {
        console.error('Erreur getServiceStats:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

const getCategories = async (req, res) => {
    try {
        const serviceId = req.userServiceId;
        
        const [categories] = await db.execute(
            'SELECT * FROM categories WHERE service_id = ? ORDER BY name_fr',
            [serviceId]
        );
        
        res.json({ success: true, categories });
    } catch (error) {
        console.error('Erreur getCategories:', error);
        res.status(500).json({ success: false, categories: [] });
    }
};

const getServiceHistory = async (req, res) => {
    try {
        const serviceId = req.userServiceId;
        const limit = parseInt(req.query.limit) || 50;
        
        const [history] = await db.execute(`
            SELECT h.*, u.full_name as user_name, d.title_fr as document_title
            FROM history h
            LEFT JOIN users u ON h.user_id = u.id
            LEFT JOIN documents d ON h.document_id = d.id
            WHERE h.service_id = ?
            ORDER BY h.created_at DESC
            LIMIT ?
        `, [serviceId, limit]);
        
        res.json({ success: true, history });
    } catch (error) {
        console.error('Erreur getServiceHistory:', error);
        res.status(500).json({ success: false, history: [] });
    }
};

module.exports = {
    getCurrentService,
    getServiceStats,
    getCategories,
    getServiceHistory
};