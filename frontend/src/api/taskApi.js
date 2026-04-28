import apiClient from './axiosConfig';

export async function getTasks() {
    try {
        const response = await apiClient.get('/tasks');
        return response.data.data ? response.data.data.tasks : response.data;
    } catch (error) {
        console.error('Error in getTasks API:', error);
        throw error;
    }
}

export async function assignTask(taskId, volunteerId, volunteerIds) {
    try {
        const response = await apiClient.post(`/tasks/${taskId}/assign`, { volunteerId, volunteerIds });
        return response.data;
    } catch (error) {
        console.error('Error assigning task:', error);
        throw error;
    }
}

export async function volunteerAcceptTask(taskId) {
    const response = await apiClient.put(`/tasks/${taskId}/accept`);
    return response.data;
}

export async function volunteerRejectTask(taskId) {
    const response = await apiClient.put(`/tasks/${taskId}/reject`);
    return response.data;
}

export async function volunteerCompleteTask(taskId) {
    const response = await apiClient.put(`/tasks/${taskId}/complete`);
    return response.data;
}

export async function unassignTask(taskId, volunteerId) {
    const response = await apiClient.delete(`/tasks/${taskId}/unassign/${volunteerId}`);
    return response.data;
}

export async function adminCompleteTask(taskId) {
    try {
        const response = await apiClient.put(`/tasks/${taskId}/admin-complete`);
        return response.data;
    } catch (error) {
        console.error('Error admin completing task:', error);
        throw error;
    }
}

export async function createTask(data) {
    try {
        const response = await apiClient.post('/tasks', data);
        return response.data;
    } catch (error) {
        console.error('Error creating task:', error);
        throw error;
    }
}

export async function updateTask(id, data) {
    try {
        const response = await apiClient.put(`/tasks/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating task:', error);
        throw error;
    }
}

export async function deleteTask(id) {
    try {
        const response = await apiClient.delete(`/tasks/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
    }
}

export async function getTaskMatches(taskId) {
    try {
        const response = await apiClient.get(`/tasks/${taskId}/matches`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching task matches:', error);
        throw error;
    }
}
