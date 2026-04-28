const adminService = require('../services/adminService');
const adminNotificationService = require('../services/adminNotificationService');
const taskService = require('../services/taskService');
const geocodingService = require('../services/geocodingService');

const getStats = async (req, res) => {
    try {
        const stats = await adminService.getStats();
        res.status(200).json({
            success: true,
            message: 'Admin stats retrieved successfully',
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

const getInsights = async (req, res) => {
    try {
        const insights = await adminService.getInsights();
        res.status(200).json({
            success: true,
            message: 'Admin insights retrieved successfully',
            data: insights
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

const getNotifications = async (req, res) => {
    try {
        const { unreadOnly } = req.query;
        const notifications = await adminNotificationService.getNotifications(unreadOnly === 'true');
        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const markNotificationRead = async (req, res) => {
    try {
        await adminNotificationService.markAsRead(req.params.id);
        res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteNotification = async (req, res) => {
    try {
        await adminNotificationService.deleteNotification(req.params.id);
        res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const fcmService = require('../services/fcmService');

const assignFromNotification = async (req, res) => {
    try {
        const { event_id, volunteer_ids, notification_id } = req.body;
        
        // 1. Assign volunteers to the task
        await taskService.assignTask(event_id, volunteer_ids);

        // --- Phase 1: Notify volunteers asynchronously ---
        if (volunteer_ids && volunteer_ids.length > 0) {
            volunteer_ids.forEach(vId => {
                const link = `/volunteer/tasks`;
                fcmService.notifyVolunteer(vId, `🚨 Urgent Task Assigned`, `You have been assigned to an emergency task from the Command Center. Tap to view.`, link)
                    .catch(err => console.error(`Failed to notify ${vId}:`, err));
            });
        }
        
        // 2. Mark notification as resolved
        if (notification_id) {
            await adminNotificationService.resolveNotification(notification_id);
        }

        res.status(200).json({ 
            success: true, 
            message: 'Volunteers assigned and notification resolved successfully' 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getNotificationStats = async (req, res) => {
    try {
        const stats = await adminNotificationService.getNotificationStats();
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getStats,
    getInsights,
    getNotifications,
    markNotificationRead,
    deleteNotification,
    assignFromNotification,
    getNotificationStats,
    getHeatmapData: async (req, res) => {
        try {
            const { db } = require('../config/firebase');
            
            // Fetch all 3 sources in parallel (Admin SDK bypasses rules)
            const [tasksSnap, surveysSnap, failSnap] = await Promise.all([
                db.collection('tasks').where('status', 'in', ['open', 'assigned', 'accepted']).get(),
                db.collection('surveys').get(),
                db.collection('admin_notifications')
                    .where('type', 'in', ['MATCH_FAIL', 'PARTIAL_ASSIGNMENT'])
                    .where('is_read', '==', false)
                    .get()
            ]);

            const tasks = tasksSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, source: 'task' }));
            const surveys = surveysSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, source: 'survey' }));
            const failures = failSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, source: 'failure' }));

                res.status(200).json({
                    success: true,
                    data: { tasks, surveys, failures }
                });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        },
        geocode: async (req, res) => {
        try {
            const { q } = req.query;
            if (!q) return res.status(400).json({ success: false, message: 'Query parameter q is required' });
            
            const result = await geocodingService.geocode(q);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
