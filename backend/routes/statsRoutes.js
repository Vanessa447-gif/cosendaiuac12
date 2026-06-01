const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { checkServiceAccess } = require('../middleware/serviceMiddleware');
const { getGlobalStats, getServiceStats } = require('../controllers/statsController');

router.use(authMiddleware);
router.use(checkServiceAccess());

router.get('/global', getGlobalStats);
router.get('/service/:serviceId', getServiceStats);
router.get('/service', getServiceStats); // Service actuel

module.exports = router;