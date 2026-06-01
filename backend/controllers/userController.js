const db = require('../config/database');

// Récupérer les utilisateurs du service
const getUsers = async (req, res) => {
    try {
        const serviceId = req.userServiceId;
        
        const [users] = await db.execute(`
            SELECT u.id, u.username, u.full_name, u.email, u.role, u.department, u.is_active, u.created_at,
                   s.name_fr as service_name
            FROM users u
            LEFT JOIN services s ON u.service_id = s.id
            WHERE u.service_id = ? OR u.can_access_all_services = 1
            ORDER BY u.created_at DESC
        `, [serviceId]);
        
        res.json({ success: true, users });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, users: [] });
    }
};

module.exports = { getUsers };