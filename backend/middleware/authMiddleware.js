const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Accès non autorisé' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_2024');
        req.userId = decoded.id;
        req.userRole = decoded.role;
        req.userServiceId = decoded.service_id;
        req.canAccessAllServices = decoded.can_access_all_services || false;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token invalide' });
    }
};