const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// All admin routes require authentication and admin privileges
router.use(verifyToken);
router.use(isAdmin);

router.get('/stats', adminController.getStats);
router.get('/insights', adminController.getInsights);

// Notifications
router.get('/notifications', adminController.getNotifications);
router.get('/notifications/stats', adminController.getNotificationStats);
router.patch('/notifications/:id/read', adminController.markNotificationRead);
router.post('/notifications/assign', adminController.assignFromNotification);
router.delete('/notifications/:id', adminController.deleteNotification);

// Heatmap Data (REST Fallback for Firestore Permission Issues)
router.get('/heatmap', adminController.getHeatmapData);

module.exports = router;
