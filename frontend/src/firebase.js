import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

// Your web app's Firebase configuration
// Replace these with your actual Firebase config if not using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sevasetu-1ed86.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sevasetu-1ed86",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sevasetu-1ed86.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1036881768822", // Updated with realistic fallback or env
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Messaging safely
export let messaging = null;

const initMessaging = async () => {
    try {
        const supported = await isSupported();
        if (supported) {
            messaging = getMessaging(app);
            console.log('[FCM] Firebase Messaging initialized successfully.');
        } else {
            console.warn('[FCM] Firebase Messaging is NOT supported in this browser.');
        }
    } catch (error) {
        console.error('[FCM] Error initializing Firebase Messaging:', error);
    }
};

initMessaging();
