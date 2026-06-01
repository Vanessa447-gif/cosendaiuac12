const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    getCurrentService,
    getServiceStats,
    getCategories,
    getServiceHistory
} = require('../controllers/serviceController');

// Toutes les routes nécessitent authentification
router.use(authMiddleware);

// Routes spécifiques au service
router.get('/current', getCurrentService);
router.get('/stats', getServiceStats);
router.get('/categories', getCategories);
router.get('/history', getServiceHistory);

module.exports = router;