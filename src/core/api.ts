import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Intercepteur : injecter le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bo_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur : rafraîchir le token si 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('bo_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE_URL}/backoffice/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem('bo_access_token', data.accessToken);
        localStorage.setItem('bo_refresh_token', data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('bo_access_token');
        localStorage.removeItem('bo_refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    // Extraire le vrai message de validation du backend (NestJS class-validator)
    const backendMessage = error.response?.data?.message;
    if (backendMessage) {
      const msg = Array.isArray(backendMessage)
        ? backendMessage.join(', ')
        : String(backendMessage);
      return Promise.reject(new Error(msg));
    }

    return Promise.reject(error);
  },
);

export default api;
