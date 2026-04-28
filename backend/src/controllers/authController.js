const { db } = require('../config/firebase');

/**
 * Get current user profile
 * Handled by verifyToken middleware
 */
const getMe = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'User profile retrieved successfully',
            data: req.user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

/**
 * Placeholder for Admin Login
 * In a Firebase-based system, this often just verifies the token and role
 */
const adminLogin = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Not an admin',
                data: null
            });
        }
        res.status(200).json({
            success: true,
            message: 'Admin login successful',
            data: req.user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

/**
 * Placeholder for Volunteer Signup/Login
 */
const volunteerAuth = async (req, res) => {
    try {
        const { uid } = req.user;
        const { name, skills, location, phone, is_available } = req.body;

        // If body has data (signup flow), update the Firestore document
        if (name || skills || location || phone !== undefined || is_available !== undefined) {
            const updateData = {
                updatedAt: new Date().toISOString()
            };
            if (name) updateData.name = name;
            if (skills) updateData.skills = skills;
            if (location) updateData.location = location;
            if (phone) updateData.phone = phone;
            if (is_available !== undefined) updateData.is_available = is_available;

            await db.collection('users').doc(uid).update(updateData);
            
            // Update req.user for the response
            req.user = { ...req.user, ...updateData };
        }

        res.status(200).json({
            success: true,
            message: 'Volunteer profile updated/authenticated successfully',
            data: req.user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

/**
 * Logout placeholder
 * Clientside usually just clears the token
 */
const logout = async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logged out successfully (client should clear token)',
        data: null
    });
};

/**
 * Update FCM token for the user
 */
const updateFcmToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        if (!fcmToken) {
            return res.status(400).json({
                success: false,
                message: 'fcmToken is required',
                data: null
            });
        }

        await db.collection('users').doc(req.user.uid).update({
            fcmToken,
            updatedAt: new Date().toISOString()
        });

        res.status(200).json({
            success: true,
            message: 'FCM token updated successfully',
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

module.exports = {
    getMe,
    adminLogin,
    volunteerAuth,
    logout,
    updateFcmToken
};
