const db = require('../config/database');

// Récupérer tous les services
const getAllServices = async (req, res) => {
    try {
        const [services] = await db.execute(
            'SELECT * FROM services WHERE is_active = 1 ORDER BY name_fr'
        );
        res.json({ success: true, services });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, services: [] });
    }
};

// Récupérer les services accessibles par l'utilisateur
const getMyServices = async (req, res) => {
    try {
        const userId = req.userId;
        
        const [user] = await db.execute(
            'SELECT role, service_id, can_access_all_services FROM users WHERE id = ?',
            [userId]
        );
        
        if (user.length === 0) {
            return res.json({ success: true, services: [] });
        }
        
        let services;
        if (user[0].role === 'admin' || user[0].can_access_all_services) {
            [services] = await db.execute('SELECT * FROM services WHERE is_active = 1');
        } else {
            [services] = await db.execute('SELECT * FROM services WHERE id = ?', [user[0].service_id]);
        }
        
        res.json({ success: true, services });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, services: [] });
    }
};

// Récupérer les catégories d'un service
const getCategoriesByService = async (req, res) => {
    try {
        const serviceId = req.params.serviceId;
        
        const [categories] = await db.execute(
            'SELECT * FROM categories WHERE service_id = ? ORDER BY name_fr',
            [serviceId]
        );
        
        res.json({ success: true, categories });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, categories: [] });
    }
};

module.exports = {
    getAllServices,
    getMyServices,
    getCategoriesByService
};