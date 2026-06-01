const db = require('../config/database');

// Statistiques globales (admin uniquement)
const getGlobalStats = async (req, res) => {
    try {
        // Total documents par service
        const [docsByService] = await db.execute(`
            SELECT s.name_fr, s.name_en, s.color, s.icon, COUNT(d.id) as count
            FROM services s
            LEFT JOIN documents d ON s.id = d.service_id AND d.status = 'actif'
            GROUP BY s.id
        `);
        
        // Total utilisateurs par service
        const [usersByService] = await db.execute(`
            SELECT s.name_fr, COUNT(u.id) as count
            FROM services s
            LEFT JOIN users u ON s.id = u.service_id AND u.is_active = 1
            GROUP BY s.id
        `);
        
        // Activités récentes globales
        const [recentActivities] = await db.execute(`
            SELECT h.*, u.full_name as user_name, 
                   d.title_fr as document_title_fr, d.title_en as document_title_en,
                   s.name_fr as service_name_fr
            FROM history h
            LEFT JOIN users u ON h.user_id = u.id
            LEFT JOIN documents d ON h.document_id = d.id
            LEFT JOIN services s ON h.service_id = s.id
            ORDER BY h.created_at DESC
            LIMIT 20
        `);
        
        res.json({
            success: true,
            stats: {
                documentsByService: docsByService,
                usersByService: usersByService,
                recentActivities: recentActivities
            }
        });
        
    } catch (error) {
        console.error('Erreur getGlobalStats:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Statistiques d'un service spécifique
const getServiceStats = async (req, res) => {
    try {
        const serviceId = req.params.serviceId || req.currentServiceId;
        
        // Documents actifs
        const [activeDocs] = await db.execute(
            'SELECT COUNT(*) as count FROM documents WHERE service_id = ? AND status = "actif"',
            [serviceId]
        );
        
        // Archives
        const [archives] = await db.execute(
            'SELECT COUNT(*) as count FROM documents WHERE service_id = ? AND status = "archive"',
            [serviceId]
        );
        
        // Total vues
        const [totalViews] = await db.execute(
            'SELECT SUM(views_count) as total FROM documents WHERE service_id = ?',
            [serviceId]
        );
        
        // Total téléchargements
        const [totalDownloads] = await db.execute(
            'SELECT SUM(downloads_count) as total FROM documents WHERE service_id = ?',
            [serviceId]
        );
        
        res.json({
            success: true,
            stats: {
                activeDocuments: activeDocs[0].count,
                archivedDocuments: archives[0].count,
                totalViews: totalViews[0]?.total || 0,
                totalDownloads: totalDownloads[0]?.total || 0
            }
        });
        
    } catch (error) {
        console.error('Erreur getServiceStats:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

module.exports = {
    getGlobalStats,
    getServiceStats
};