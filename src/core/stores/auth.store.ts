import { create } from 'zustand';
import type { AuthUser, Role } from '../types';
import api from '../api';

// Mock users for development (when backend is not running)
const MOCK_USERS: Record<string, AuthUser> = {
  'admin@briques.store': {
    id: 'dev-1', email: 'admin@briques.store', firstName: 'Super', lastName: 'Admin',
    role: 'SUPER_ADMIN', status: 'ACTIVE', createdAt: '2025-01-01T00:00:00Z',
  },
  'commercial@briques.store': {
    id: 'dev-2', email: 'commercial@briques.store', firstName: 'Konan', lastName: 'Marc',
    role: 'COMMERCIAL_LOGISTICS', status: 'ACTIVE', createdAt: '2025-01-01T00:00:00Z',
  },
  'service@briques.store': {
    id: 'dev-3', email: 'service@briques.store', firstName: 'Marie', lastName: 'Kouadio',
    role: 'SERVICE_CLIENT', status: 'ACTIVE', createdAt: '2025-01-01T00:00:00Z',
  },
};

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('bo_access_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/backoffice/auth/login', { email, password });
      localStorage.setItem('bo_access_token', data.accessToken);
      localStorage.setItem('bo_refresh_token', data.refreshToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      // DEV fallback: if API is unreachable, use mock users
      const mockUser = MOCK_USERS[email];
      if (mockUser && password) {
        localStorage.setItem('bo_access_token', 'dev-token');
        set({ user: mockUser, isAuthenticated: true, isLoading: false });
        return;
      }
      set({ error: 'Email ou mot de passe incorrect', isLoading: false });
      throw new Error('Login failed');
    }
  },

  logout: async () => {
    try {
      await api.post('/backoffice/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('bo_access_token');
      localStorage.removeItem('bo_refresh_token');
      set({ user: null, isAuthenticated: false });
    }
  },

  fetchProfile: async () => {
    try {
      const { data } = await api.get('/backoffice/auth/profile');
      set({ user: data, isAuthenticated: true });
    } catch {
      // DEV fallback: if token exists but API unreachable, set default mock user
      if (localStorage.getItem('bo_access_token') === 'dev-token') {
        set({ user: MOCK_USERS['admin@briques.store']!, isAuthenticated: true });
        return;
      }
      localStorage.removeItem('bo_access_token');
      localStorage.removeItem('bo_refresh_token');
      set({ user: null, isAuthenticated: false });
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/backoffice/auth/change-password', { currentPassword, newPassword });
      set({ isLoading: false });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erreur lors du changement de mot de passe';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),

  hasRole: (...roles) => {
    const user = get().user;
    return user ? roles.includes(user.role) : false;
  },
}));
