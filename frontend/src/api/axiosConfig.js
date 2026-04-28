import axios from 'axios';
import { getToken } from '../services/authService';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

apiClient.interceptors.request.use(
    (config) => {
        const token = getToken(); // Synchronous cache
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
