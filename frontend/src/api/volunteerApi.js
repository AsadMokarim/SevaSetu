import apiClient from './axiosConfig';

export async function getVolunteers() {
    try {
        const response = await apiClient.get('/volunteers');
        return response.data.data ? response.data.data.volunteers : response.data;
    } catch (error) {
        console.error('Error fetching volunteers:', error);
        throw error;
    }
}

export async function getVolunteer(id) {
    try {
        const response = await apiClient.get(`/volunteers/${id}`);
        return response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching volunteer:', error);
        throw error;
    }
}

export async function getVolunteerTasks(volunteerId) {
    try {
        const response = await apiClient.get(`/volunteers/${volunteerId}/tasks`);
        return response.data.data ? response.data.data.tasks : response.data;
    } catch (error) {
        console.error('Error fetching volunteer tasks:', error);
        throw error;
    }
}

export async function addVolunteer(data) {
    try {
        // In the backend, a volunteer signs up via auth route, not this.
        // If there's an admin route to manually add a volunteer, we'd hit that.
        // Assuming /volunteers/ doesn't exist for POST, this might fail, but kept for parity.
        const response = await apiClient.post('/volunteers', data);
        return response.data;
    } catch (error) {
        console.error('Error adding volunteer:', error);
        throw error;
    }
}

export async function updateVolunteer(id, data) {
    try {
        const response = await apiClient.put(`/volunteers/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating volunteer:', error);
        throw error;
    }
}

export async function deleteVolunteer(id) {
    try {
        const response = await apiClient.delete(`/volunteers/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting volunteer:', error);
        throw error;
    }
}
export async function getVolunteerNotifications(unreadOnly = false) {
    try {
        const response = await apiClient.get('/volunteers/notifications/me', {
            params: { unreadOnly }
        });
        return response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
}

export async function markNotificationRead(id) {
    try {
        const response = await apiClient.patch(`/volunteers/notifications/${id}/read`);
        return response.data;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
}

export async function markAllNotificationsRead() {
    try {
        const response = await apiClient.patch('/volunteers/notifications/read-all');
        return response.data;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
}
