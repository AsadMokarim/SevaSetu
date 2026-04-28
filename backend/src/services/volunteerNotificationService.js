const { db } = require('../config/firebase');

/**
 * Create a notification for a volunteer
 */
const createNotification = async (userId, data) => {
    try {
        const { title, message, type, link } = data;
        const notificationRef = db.collection('volunteer_notifications').doc();
        
        const newNotification = {
            id: notificationRef.id,
            userId,
            title,
            message,
            type: type || 'GENERAL', // TASK_ASSIGNED, SURVEY_VERIFIED, REPUTATION_CHANGE
            link: link || null,
            isRead: false,
            createdAt: new Date().toISOString()
        };

        await notificationRef.set(newNotification);
        return newNotification;
    } catch (error) {
        console.error('[VolunteerNotification] Error creating notification:', error);
        throw error;
    }
};

/**
 * Get notifications for a volunteer
 */
const getNotifications = async (userId, unreadOnly = false) => {
    try {
        let query = db.collection('volunteer_notifications')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc');

        if (unreadOnly) {
            query = query.where('isRead', '==', false);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        // Fallback for missing index during initial setup
        if (error.message.includes('index')) {
            console.warn('[VolunteerNotification] Index missing, falling back to in-memory filter');
            const snapshot = await db.collection('volunteer_notifications')
                .where('userId', '==', userId)
                .get();
            let notifications = snapshot.docs.map(doc => doc.data());
            notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
            if (unreadOnly) notifications = notifications.filter(n => !n.isRead);
            return notifications;
        }
        throw error;
    }
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId) => {
    try {
        await db.collection('volunteer_notifications').doc(notificationId).update({
            isRead: true
        });
        return true;
    } catch (error) {
        console.error('[VolunteerNotification] Error marking as read:', error);
        throw error;
    }
};

/**
 * Mark all as read for a user
 */
const markAllAsRead = async (userId) => {
    try {
        const snapshot = await db.collection('volunteer_notifications')
            .where('userId', '==', userId)
            .where('isRead', '==', false)
            .get();
        
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { isRead: true });
        });
        
        await batch.commit();
        return true;
    } catch (error) {
        console.error('[VolunteerNotification] Error marking all as read:', error);
        throw error;
    }
};

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead
};
