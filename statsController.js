const db = require('../config/database');

const getStats = async (req, res) => {
    try {
        const [totalDocs] = await db.execute(
            'SELECT COUNT(*) as total FROM documents WHERE status = ?',
            ['actif']
        );

        const [totalViews] = await db.execute(
            'SELECT SUM(views_count) as total FROM documents'
        );

        const [totalDownloads] = await db.execute(
            'SELECT SUM(downloads_count) as total FROM documents'
        );

        const [categories] = await db.execute(`
            SELECT c.*, COUNT(d.id) as count
            FROM categories c
            LEFT JOIN documents d ON c.id = d.category_id AND d.status = 'actif'
            GROUP BY c.id
        `);

        const [recentDocuments] = await db.execute(`
            SELECT d.*, u.full_name as uploader_name, 
                   c.name_fr as category_name_fr, c.name_en as category_name_en,
                   c.color as category_color
            FROM documents d
            LEFT JOIN users u ON d.uploaded_by = u.id
            LEFT JOIN categories c ON d.category_id = c.id
            WHERE d.status = 'actif'
            ORDER BY d.created_at DESC
            LIMIT 5
        `);

        const [recentActivities] = await db.execute(`
            SELECT h.*, u.full_name as user_name, 
                   d.title_fr as document_title_fr, d.title_en as document_title_en
            FROM history h
            LEFT JOIN users u ON h.user_id = u.id
            LEFT JOIN documents d ON h.document_id = d.id
            ORDER BY h.created_at DESC
            LIMIT 10
        `);

        const [activeUsers] = await db.execute(
            'SELECT COUNT(*) as total FROM users WHERE is_active = 1'
        );

        const stats = {
            totalDocuments: totalDocs[0].total,
            totalViews: totalViews[0]?.total || 0,
            totalDownloads: totalDownloads[0]?.total || 0,
            documentsByCategory: categories,
            recentDocuments,
            recentActivities,
            activeUsers: activeUsers[0].total
        };

        res.json({ success: true, stats });

    } catch (error) {
        console.error('Erreur getStats:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

module.exports = { getStats };