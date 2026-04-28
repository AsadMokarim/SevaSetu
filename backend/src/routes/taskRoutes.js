const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// All task routes require authentication
router.use(verifyToken);

// CRUD operations
router.get('/', taskController.getAllTasks);
router.post('/', taskController.createTask);
router.get('/:task_id', taskController.getTaskById);
router.put('/:task_id', taskController.updateTask);
router.delete('/:task_id', taskController.deleteTask);

// Lifecycle operations for volunteers
router.put('/:task_id/accept', taskController.acceptTask);
router.put('/:task_id/reject', taskController.rejectTask);
router.put('/:task_id/complete', taskController.completeTask);

// Assignment operations (usually admin only)
router.post('/:task_id/assign', isAdmin, taskController.assignTask);
router.delete('/:task_id/unassign/:volunteer_id', isAdmin, taskController.unassignTask);
router.put('/:task_id/admin-complete', isAdmin, taskController.adminCompleteTask);

// Matching visibility (admin only)
router.get('/:task_id/matches', isAdmin, taskController.getTaskMatches);

module.exports = router;
