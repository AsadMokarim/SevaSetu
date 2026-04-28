const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // Option 1: Use stringified JSON from environment variable (Best for Render/Heroku)
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin SDK initialized (Environment Variable)');
    } else {
        // Option 2: Fallback to local file (Development only)
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';
        const absolutePath = path.isAbsolute(serviceAccountPath) 
            ? serviceAccountPath 
            : path.join(__dirname, '../../', serviceAccountPath);
        
        const serviceAccount = require(absolutePath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin SDK initialized (Local File)');
    }
} catch (error) {
    console.error('Firebase Admin init error:', error.message);
    console.warn('Backend running in DEMO MODE with limited database functionality.');
}

const db = admin.firestore();
const auth = admin.auth();
const messaging = admin.messaging();

module.exports = { admin, db, auth, messaging };
