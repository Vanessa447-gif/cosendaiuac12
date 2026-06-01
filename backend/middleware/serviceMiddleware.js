const db = require('../config/database');

const checkServiceAccess = () => {
    return async (req, res, next) => {
        const userId = req.userId;
        const requestedServiceId = req.params.serviceId || req.query.service_id || req.body.service_id;
        
        try {
            // Récupérer les infos de l'utilisateur
            const [users] = await db.execute(
                'SELECT role, service_id, can_access_all_services FROM users WHERE id = ?',
                [userId]
            );
            
            if (users.length === 0) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Utilisateur non trouvé' 
                });
            }
            
            const user = users[0];
            
            // Admin ou super-utilisateur peut tout voir
            if (user.role === 'admin' || user.can_access_all_services) {
                req.currentServiceId = requestedServiceId || null;
                return next();
            }
            
            // Si un service spécifique est demandé, vérifier l'accès
            if (requestedServiceId && user.service_id !== parseInt(requestedServiceId)) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Vous n\'avez pas accès à ce service' 
                });
            }
            
            // Service par défaut de l'utilisateur
            req.currentServiceId = user.service_id;
            next();
            
        } catch (error) {
            console.error('Erreur middleware service:', error);
            res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
    };
};

module.exports = { checkServiceAccess };