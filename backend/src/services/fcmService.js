const { admin, db } = require('../config/firebase');

/**
 * Send a multicast push notification to all registered devices of a volunteer.
 * 
 * @param {string} volunteerId - The UID of the volunteer.
 * @param {string} title - The notification title.
 * @param {string} body - The notification body.
 * @param {string} link - The deep link URL to open on click (e.g., '/volunteer/tasks/123').
 */
const notifyVolunteer = async (volunteerId, title, body, link) => {
    try {
        const tokensSnap = await db.collection('users').doc(volunteerId).collection('fcm_tokens').get();
        if (tokensSnap.empty) {
            console.log(`[FCM] No tokens found for volunteer ${volunteerId}. Skipping notification.`);
            return;
        }

        const tokens = [];
        const tokenDocs = [];
        tokensSnap.forEach(doc => {
            tokens.push(doc.data().token);
            tokenDocs.push(doc);
        });

        const message = {
            notification: {
                title: title,
                body: body
            },
            data: {
                click_action: link || '/',
                type: 'SYSTEM_ALERT'
            },
            tokens: tokens
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`[FCM] Sent to volunteer ${volunteerId}: ${response.successCount} success, ${response.failureCount} failed.`);

        // Phase 2 Essential: Cleanup invalid tokens immediately
        if (response.failureCount > 0) {
            const batch = db.batch();
            response.responses.forEach((res, idx) => {
                if (!res.success) {
                    const error = res.error;
                    if (error && (
                        error.code === 'messaging/invalid-registration-token' ||
                        error.code === 'messaging/registration-token-not-registered'
                    )) {
                        console.log(`[FCM] Removing stale token for ${volunteerId}`);
                        batch.delete(tokenDocs[idx].ref);
                    }
                }
            });
            await batch.commit();
        }
    } catch (error) {
        console.error(`[FCM] Error notifying volunteer ${volunteerId}:`, error);
    }
};

module.exports = {
    notifyVolunteer
};
