const express = require('express');
const router = express.Router();
const fcmController = require('../controllers/fcmController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Mount routes with authentication required
router.post('/tokens', verifyToken, fcmController.registerToken);
router.delete('/tokens', verifyToken, fcmController.unregisterToken);

module.exports = router;
