const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Public routes (if any would go here, but all our auth routes verify the Firebase token)

// All these routes require a valid Firebase ID token
router.use(verifyToken);

router.get('/me', authController.getMe);
router.post('/admin/login', authController.adminLogin);
router.post('/volunteer/signup', authController.volunteerAuth);
router.post('/volunteer/login', authController.volunteerAuth);
router.post('/logout', authController.logout);
router.put('/fcm-token', authController.updateFcmToken);

module.exports = router;
