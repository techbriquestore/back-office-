import axios from 'axios';
import { useAuthStore } from './stores/auth.store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Pour envoyer les cookies httpOnly
});

// Fonction utilitaire pour lire un cookie
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

// Intercepteur : injecter le token JWT et le token CSRF
api.interceptors.request.use((config) => {
  // Récupérer l'access token depuis le store Zustand (mémoire)
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  // Ajouter le header CSRF pour les mutations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase() || '')) {
    const csrfToken = getCookie('bo_csrf_token');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  
  // Désactiver le cache HTTP
  config.headers['Cache-Control'] = 'no-cache';
  config.headers.Pragma = 'no-cache';
  return config;
});

// Intercepteur : rafraîchir le token si 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log('Erreur API:', error.response?.status, error.config?.url);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log('Tentative de refresh token...');
      try {
        // Le refresh token est maintenant dans un cookie httpOnly, pas besoin de l'envoyer dans le body
        const { data } = await axios.post(`${API_BASE_URL}/backoffice/auth/refresh`, {}, {
          withCredentials: true,
        });

        console.log('Refresh réussi:', data);

        // Stocker l'access token dans le store Zustand (mémoire)
        useAuthStore.getState().refreshSession();

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh échoué:', refreshError);
        useAuthStore.getState().logout();
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
