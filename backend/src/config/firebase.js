const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';
const absolutePath = path.isAbsolute(serviceAccountPath) 
    ? serviceAccountPath 
    : path.join(__dirname, '../../', serviceAccountPath);

try {
    const serviceAccount = require(absolutePath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
    console.warn('Backend will run with limited functionality without Firebase credentials.');
}

const db = admin.firestore();
const auth = admin.auth();
const messaging = admin.messaging();

module.exports = { admin, db, auth, messaging };
