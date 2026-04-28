const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// All volunteer routes require authentication
router.use(verifyToken);

router.get('/', isAdmin, volunteerController.getAllVolunteers);
router.post('/', isAdmin, volunteerController.createVolunteer);
router.get('/:volunteer_id', volunteerController.getVolunteerById);
router.put('/:volunteer_id', volunteerController.updateVolunteer);
router.delete('/:volunteer_id', volunteerController.deleteVolunteer);

router.get('/:volunteer_id/tasks', volunteerController.getVolunteerTasks);

// Notifications
router.get('/notifications/me', volunteerController.getNotifications);
router.patch('/notifications/:notification_id/read', volunteerController.markNotificationRead);
router.patch('/notifications/read-all', volunteerController.markAllNotificationsRead);

module.exports = router;
