const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getAllServices, getMyServices, getCategoriesByService } = require('../controllers/serviceController');

// Routes publiques
router.get('/public', getAllServices);
router.get('/public/:id', async (req, res) => {
    try {
        const db = require('../config/database');
        const [services] = await db.execute('SELECT * FROM services WHERE id = ? AND is_active = 1', [req.params.id]);
        res.json({ success: true, service: services[0] || null });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// Routes protégées
router.use(authMiddleware);
router.get('/my-services', getMyServices);
router.get('/:serviceId/categories', getCategoriesByService);

module.exports = router;