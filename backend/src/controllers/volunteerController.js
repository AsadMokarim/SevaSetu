const volunteerService = require('../services/volunteerService');

const getAllVolunteers = async (req, res) => {
    try {
        const { limit, cursor } = req.query;
        const { volunteers, nextCursor } = await volunteerService.getAllVolunteers(limit, cursor);
        res.status(200).json({
            success: true,
            message: 'Volunteers retrieved successfully',
            data: { volunteers, nextCursor }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

const getVolunteerById = async (req, res) => {
    try {
        const volunteer = await volunteerService.getVolunteerById(req.params.volunteer_id);
        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found',
                data: null
            });
        }
        res.status(200).json({
            success: true,
            message: 'Volunteer retrieved successfully',
            data: volunteer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

const updateVolunteer = async (req, res) => {
    try {
        // Enforce that a volunteer can only update their own profile, or an admin can update anyone's
        if (req.user.role !== 'admin' && req.user.uid !== req.params.volunteer_id) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You can only update your own profile',
                data: null
            });
        }

        const volunteer = await volunteerService.updateVolunteer(req.params.volunteer_id, req.body);
        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found',
                data: null
            });
        }
        res.status(200).json({
            success: true,
            message: 'Volunteer updated successfully',
            data: volunteer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

const deleteVolunteer = async (req, res) => {
    try {
        // Only admins should delete accounts entirely in this flow
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Admin access required',
                data: null
            });
        }

        const deleted = await volunteerService.deleteVolunteer(req.params.volunteer_id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found',
                data: null
            });
        }
        res.status(200).json({
            success: true,
            message: 'Volunteer deleted successfully',
            data: null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

const getVolunteerTasks = async (req, res) => {
    try {
        // A volunteer can see their own tasks, admins can see any volunteer's tasks
        if (req.user.role !== 'admin' && req.user.uid !== req.params.volunteer_id) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Cannot view tasks for another volunteer',
                data: null
            });
        }

        const { limit, cursor } = req.query;
        const { tasks, nextCursor } = await volunteerService.getVolunteerTasks(req.params.volunteer_id, limit, cursor);
        res.status(200).json({
            success: true,
            message: 'Volunteer tasks retrieved successfully',
            data: { tasks, nextCursor }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

const createVolunteer = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Admin access required',
                data: null
            });
        }

        const volunteer = await volunteerService.createVolunteer(req.body);
        res.status(201).json({
            success: true,
            message: 'Volunteer created successfully',
            data: volunteer
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
        const notificationService = require('../services/volunteerNotificationService');
        const { unreadOnly } = req.query;
        const notifications = await notificationService.getNotifications(req.user.uid, unreadOnly === 'true');
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
        const notificationService = require('../services/volunteerNotificationService');
        await notificationService.markAsRead(req.params.notification_id);
        res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const markAllNotificationsRead = async (req, res) => {
    try {
        const notificationService = require('../services/volunteerNotificationService');
        await notificationService.markAllAsRead(req.user.uid);
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllVolunteers,
    getVolunteerById,
    createVolunteer,
    updateVolunteer,
    deleteVolunteer,
    getVolunteerTasks,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead
};
