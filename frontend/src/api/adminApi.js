import apiClient from './axiosConfig';

export async function getAdminStats() {
    try {
        const response = await apiClient.get('/admin/stats');
        return response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        throw error;
    }
}

export async function getStrategicInsights() {
    try {
        const response = await apiClient.get('/admin/insights');
        return response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching admin insights:', error);
        throw error;
    }
}
