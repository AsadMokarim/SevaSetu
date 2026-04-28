const { db } = require('../config/firebase');

/**
 * Create an admin notification
 */
const createNotification = async (data) => {
    try {
        const { 
            type, event_id, event_title, location, 
            required_volunteers, assigned_volunteers, message, 
            severity, event_date, missing_roles, suggested_volunteers 
        } = data;

        // --- Dynamic Priority Logic ---
        let priority_level = 'MEDIUM';
        if (event_date) {
            const hoursUntilEvent = (new Date(event_date) - new Date()) / (1000 * 60 * 60);
            if (hoursUntilEvent < 24) priority_level = 'CRITICAL';
            else if (hoursUntilEvent < 72) priority_level = 'HIGH';
        }

        // --- Bonus: Prevent spam/duplicates ---
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        const existing = await db.collection('notifications')
            .where('event_id', '==', event_id)
            .where('type', '==', type)
            .where('created_at', '>=', tenMinutesAgo)
            .limit(1)
            .get();

        if (!existing.empty) {
            console.log(`[NotificationService] Duplicate ${type} for event ${event_id} skipped.`);
            return null;
        }

        const notificationRef = db.collection('notifications').doc();
        const newNotification = {
            id: notificationRef.id,
            type,
            event_id,
            event_title,
            location,
            required_volunteers,
            assigned_volunteers,
            message,
            severity: severity || (priority_level === 'CRITICAL' ? 'HIGH' : priority_level),
            priority_level,
            event_date,
            missing_roles: missing_roles || [],
            suggested_volunteers: suggested_volunteers || [],
            status: 'NEW', // NEW, ESCALATED, RESOLVED
            is_read: false,
            created_at: new Date().toISOString(),
            last_notified_at: new Date().toISOString()
        };

        await notificationRef.set(newNotification);
        console.log(`[NotificationService] Created ${type} for event: ${event_title}`);
        
        // Optional: Trigger push notification (e.g. via notificationService)
        // if (newNotification.severity === 'HIGH') { ... }

        return newNotification;
    } catch (error) {
        console.error('[NotificationService] Error creating notification:', error);
        throw error;
    }
};

/**
 * Get all notifications for admin
 */
const getNotifications = async (unreadOnly = false) => {
    let query = db.collection('notifications').orderBy('created_at', 'desc');
    
    if (unreadOnly) {
        query = query.where('is_read', '==', false);
    }

    const snapshot = await query.get();
    const notifications = snapshot.docs.map(doc => doc.data());

    // --- Lazy Escalation Logic ---
    // Mark NEW notifications as ESCALATED if older than 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const updates = [];

    notifications.forEach(n => {
        if (n.status === 'NEW' && new Date(n.created_at) < twoHoursAgo) {
            n.status = 'ESCALATED';
            updates.push(db.collection('notifications').doc(n.id).update({ status: 'ESCALATED' }));
        }
    });

    if (updates.length > 0) {
        await Promise.all(updates).catch(err => console.error('[Escalation] Error updating:', err));
    }

    return notifications;
};

/**
 * Mark notification as read
 */
const markAsRead = async (id) => {
    const docRef = db.collection('notifications').doc(id);
    await docRef.update({ is_read: true, status: 'RESOLVED' });
    return true;
};

/**
 * Resolve notification explicitly (after manual action)
 */
const resolveNotification = async (id) => {
    const docRef = db.collection('notifications').doc(id);
    await docRef.update({ is_read: true, status: 'RESOLVED' });
    return true;
};

/**
 * Delete a notification
 */
const deleteNotification = async (id) => {
    await db.collection('notifications').doc(id).delete();
    return true;
};

/**
 * Get notification analytics
 */
const getNotificationStats = async () => {
    const snapshot = await db.collection('notifications').get();
    const all = snapshot.docs.map(doc => doc.data());

    const total_failures = all.filter(n => n.type === 'MATCH_FAIL').length;
    
    // Most common missing roles
    const roleCounts = {};
    all.forEach(n => {
        (n.missing_roles || []).forEach(role => {
            roleCounts[role] = (roleCounts[role] || 0) + 1;
        });
    });
    const most_common_missing_roles = Object.entries(roleCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([role, count]) => ({ role, count }));

    // Top locations with shortage
    const locCounts = {};
    all.filter(n => n.status !== 'RESOLVED').forEach(n => {
        locCounts[n.location] = (locCounts[n.location] || 0) + 1;
    });
    const top_locations_with_shortage = Object.entries(locCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([location, count]) => ({ location, count }));

    return {
        total_failures,
        most_common_missing_roles,
        top_locations_with_shortage
    };
};

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    resolveNotification,
    deleteNotification,
    getNotificationStats
};
