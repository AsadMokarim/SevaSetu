import apiClient from './axiosConfig';

export async function createSurvey(formData) {
    try {
        const response = await apiClient.post('/surveys', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error in createSurvey API:', error);
        throw error;
    }
}

export async function getSurveys() {
    try {
        const response = await apiClient.get('/surveys');
        return response.data.data ? response.data.data.surveys : response.data;
    } catch (error) {
        console.error('Error in getSurveys API:', error);
        throw error;
    }
}

export async function updateSurvey(id, data) {
    try {
        const response = await apiClient.put(`/surveys/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error in updateSurvey API:', error);
        throw error;
    }
}

export async function deleteSurvey(id) {
    try {
        const response = await apiClient.delete(`/surveys/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error in deleteSurvey API:', error);
        throw error;
    }
}

export async function extractFromFile(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post('/surveys/extract-from-file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error in extractFromFile API:', error);
        throw error;
    }
}

export async function geocodeLocation(address) {
    try {
        const response = await apiClient.get('/surveys/geocode', {
            params: { q: address }
        });
        return response.data;
    } catch (error) {
        console.error('Error in geocodeLocation API:', error);
        throw error;
    }
}

export async function voteOnSurvey(id, voteType) {
    try {
        const response = await apiClient.post(`/surveys/${id}/vote`, { voteType });
        return response.data;
    } catch (error) {
        console.error('Error in voteOnSurvey API:', error);
        throw error;
    }
}
