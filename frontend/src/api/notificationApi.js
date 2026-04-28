import apiClient from './axiosConfig';

export async function getAdminNotifications(unreadOnly = false) {
    try {
        const response = await apiClient.get(`/admin/notifications?unreadOnly=${unreadOnly}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching admin notifications:', error);
        throw error;
    }
}

export async function markNotificationAsRead(id) {
    try {
        const response = await apiClient.patch(`/admin/notifications/${id}/read`);
        return response.data;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
}

export async function deleteNotification(id) {
    try {
        const response = await apiClient.delete(`/admin/notifications/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
}

export async function assignFromNotification(data) {
    try {
        // data: { event_id, volunteer_ids: [], notification_id }
        const response = await apiClient.post('/admin/notifications/assign', data);
        return response.data;
    } catch (error) {
        console.error('Error assigning from notification:', error);
        throw error;
    }
}

export async function getAdminNotificationStats() {
    try {
        const response = await apiClient.get('/admin/notifications/stats');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching notification stats:', error);
        throw error;
    }
}

