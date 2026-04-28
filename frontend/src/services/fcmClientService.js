import { messaging } from '../firebase';
import { getToken, onMessage } from 'firebase/messaging';
import apiClient from '../api/axiosConfig';

/**
 * Requests notification permission from the user and registers the FCM token with the backend.
 */
export const requestPushPermission = async () => {
    console.log('[FCM] requestPushPermission triggered');
    
    if (!messaging) {
        console.error('[FCM] Firebase messaging is not initialized. Check if the browser supports it or if firebase.js setup failed.');
        return false;
    }

    try {
        console.log('[FCM] Requesting Notification permission from browser...');
        const permission = await Notification.requestPermission();
        console.log('[FCM] Browser permission status:', permission);
        
        if (permission === 'granted') {
            const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || 'YOUR_PUBLIC_VAPID_KEY_HERE';
            console.log('[FCM] Using VAPID key:', vapidKey ? 'Present (Hidden for security)' : 'MISSING');

            if (!('serviceWorker' in navigator)) {
                console.error('[FCM] Service Worker not supported');
                return false;
            }

            console.log('[FCM] Registering Service Worker explicitly...');
            let registration;
            try {
                registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                console.log('[FCM] Service Worker registered, waiting for activation...', registration.scope);
                
                // 🔥 CRITICAL FIX
                await navigator.serviceWorker.ready;
                console.log('[FCM] Service Worker is now ACTIVE');
            } catch (swError) {
                console.error('[FCM] Service Worker registration failed:', swError);
                return false;
            }

            console.log('[FCM] Calling getToken()...');
            const token = await getToken(messaging, { 
                vapidKey,
                serviceWorkerRegistration: registration
            });
            console.log('[FCM] getToken() returned:', token ? 'Success' : 'Empty');

            if (token) {
                console.log('[FCM] Token generated successfully:', token);
                
                console.log('[FCM] Sending token to backend API: POST /fcm/tokens');
                const response = await apiClient.post('/fcm/tokens', { 
                    token,
                    device_info: navigator.userAgent
                });
                console.log('[FCM] Backend response:', response.data);
                return true;
            } else {
                console.warn('[FCM] getToken() completed but returned null/undefined. Ensure service worker is registered.');
                return false;
            }
        } else {
            console.warn('[FCM] User denied notification permission.');
            return false;
        }
    } catch (error) {
        console.error('[FCM] Error requesting permission or generating token:', error);
        return false;
    }
};

/**
 * Unregisters the FCM token from the backend (call this on logout).
 */
export const unregisterPushToken = async () => {
    if (!messaging) return;

    try {
        const token = await getToken(messaging);
        if (token) {
            await apiClient.delete('/fcm/tokens', { data: { token } });
            console.log('[FCM] Token unregistered');
        }
    } catch (error) {
        console.error('[FCM] Error unregistering token:', error);
    }
};

/**
 * Listens for foreground messages and triggers a callback.
 */
export const onForegroundMessage = (callback) => {
    if (!messaging) return () => {};
    
    return onMessage(messaging, (payload) => {
        console.log('[FCM] Foreground message received:', payload);
        callback(payload);
    });
};
