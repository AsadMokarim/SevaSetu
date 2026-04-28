const { auth, db } = require('../config/firebase');
const dotenv = require('dotenv');

dotenv.config();

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim().toLowerCase());

/**
 * Middleware to verify Firebase ID Token and auto-create user document if not exists
 */
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: No token provided',
            data: null
        });
    }

    const idToken = authHeader.split(' ')[1];

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;

        // Check if user exists in Firestore
        let userDoc = await db.collection('users').doc(uid).get();

        if (!userDoc.exists) {
            console.log(`Auto-creating Firestore document for user: ${email}`);
            
            // Determine role
            const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'volunteer';

            const newUser = {
                uid,
                email,
                name: name || email.split('@')[0],
                role,
                photoURL: picture || '',
                fcmToken: '',
                performanceScore: 0, // Trust Score
                totalSurveys: 0,
                correctVotes: 0,
                wrongVotes: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await db.collection('users').doc(uid).set(newUser);
            req.user = newUser;
        } else {
            req.user = userDoc.data();
        }

        next();
    } catch (error) {
        console.error('Error verifying token:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid token',
            data: null
        });
    }
};

/**
 * Middleware to restrict access to Admins only
 */
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Admin access required',
            data: null
        });
    }
};

module.exports = { verifyToken, isAdmin };
