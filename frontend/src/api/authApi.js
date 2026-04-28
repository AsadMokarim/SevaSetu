import apiClient from './axiosConfig';

export async function adminLogin(email, password) {
  // In the real flow, the frontend will call Firebase Auth first (in the component),
  // then call this to ensure the backend recognizes the login.
  // Actually, the new plan says VolunteerLoginPage and AdminLoginPage will call loginVolunteer(email, password) from authService.
  // We can just keep these routes if needed, or point them to the backend if the backend needs to know immediately.
  // But wait, the backend doesn't handle the password in Firebase Auth. It only accepts a token.
  // So the component handles Firebase Auth, then calls /api/auth/me to get the user.
  // I will just update these to POST to the backend with the token already attached by the interceptor.
  const response = await apiClient.post('/auth/admin/login');
  return response.data;
}

export async function volunteerLogin() {
  const response = await apiClient.post('/auth/volunteer/login');
  return response.data;
}

export async function volunteerSignup(data) {
  // data here might be name, email, etc. Pass it to the backend.
  const response = await apiClient.post('/auth/volunteer/signup', data);
  return response.data;
}

export async function getMe() {
  try {
    const response = await apiClient.get('/auth/me');
    // our backend returns { success: true, message: "...", data: { ...user } }
    // The previous implementation expected the user object directly, or checking res.json().
    // We'll return response.data.data assuming backend follows the standard `{ success, message, data }` format.
    return response.data.data || response.data;
  } catch (error) {
    return null;
  }
}

export async function logout() {
  await apiClient.post('/auth/logout');
}
