const { messaging, db } = require('../config/firebase');

/**
 * Send a notification to a specific user via FCM
 */
const sendNotificationToUser = async (userId, title, body, data = {}) => {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) return;

        const userData = userDoc.data();
        if (!userData.fcmToken) {
            console.log(`User ${userId} has no FCM token. Skipping notification.`);
            return;
        }

        const message = {
            notification: {
                title,
                body
            },
            data,
            token: userData.fcmToken
        };

        const response = await messaging.send(message);
        console.log('Successfully sent message:', response);
    } catch (error) {
        console.error('Error sending FCM notification:', error.message);
    }
};

/**
 * Send a notification to all admins (e.g., when a task is completed or rejected)
 */
const notifyAdmins = async (title, body, data = {}) => {
    try {
        const adminsSnap = await db.collection('users').where('role', '==', 'admin').get();
        const tokens = [];

        adminsSnap.forEach(doc => {
            const userData = doc.data();
            if (userData.fcmToken) {
                tokens.push(userData.fcmToken);
            }
        });

        if (tokens.length === 0) return;

        const message = {
            notification: { title, body },
            data,
            tokens
        };

        const response = await messaging.sendEachForMulticast(message);
        console.log(`${response.successCount} messages were sent successfully to admins.`);
    } catch (error) {
        console.error('Error notifying admins:', error.message);
    }
};

module.exports = {
    sendNotificationToUser,
    notifyAdmins
};
