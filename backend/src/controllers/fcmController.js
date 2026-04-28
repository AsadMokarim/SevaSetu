const { db } = require('../config/firebase');

/**
 * Register a new FCM device token for the authenticated volunteer.
 */
const registerToken = async (req, res) => {
    try {
        const { token, device_info } = req.body;
        
        if (!token) {
            return res.status(400).json({ success: false, message: 'FCM token is required' });
        }

        const volunteerId = req.user.uid;
        if (!volunteerId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Store token in subcollection to support multiple devices
        const tokenRef = db.collection('users').doc(volunteerId).collection('fcm_tokens').doc(token);
        
        await tokenRef.set({
            token: token,
            device_info: device_info || 'Unknown Device',
            created_at: new Date().toISOString(),
            last_used_at: new Date().toISOString()
        });

        res.status(200).json({ success: true, message: 'FCM token registered successfully' });
    } catch (error) {
        console.error('[FCM] Error registering token:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Unregister an FCM token (e.g., on logout)
 */
const unregisterToken = async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ success: false, message: 'FCM token is required' });
        }

        const volunteerId = req.user.uid;
        if (!volunteerId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        await db.collection('users').doc(volunteerId).collection('fcm_tokens').doc(token).delete();

        res.status(200).json({ success: true, message: 'FCM token removed successfully' });
    } catch (error) {
        console.error('[FCM] Error unregistering token:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    registerToken,
    unregisterToken
};
