import axios from 'axios';
import { auth } from '../firebase';

/**
 * Axios Instance for API Calls
 * Automatically attaches Firebase ID Token to every request.
 */
const apiClient = axios.create({
  // Default to emulator URL, but can be overridden by environment variable
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/sevasetu-1ed86/us-central1/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth Token
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (err) {
      console.error('[Axios] Error getting ID token:', err);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Global Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('[Axios] Unauthorized - Redirecting or handling login');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
