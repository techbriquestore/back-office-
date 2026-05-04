import { apiClient } from '@/lib/api-client';
import type { Role } from '../types';

export interface BackofficeUser {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  profilePhotoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const usersApi = {
  // Récupérer tous les utilisateurs backoffice
  getAll: async () => {
    const { data } = await apiClient.get<{ data: BackofficeUser[]; total: number }>('/admin/users');
    return data;
  },

  // Récupérer un utilisateur par ID
  getById: async (id: string) => {
    const { data } = await apiClient.get<BackofficeUser>(`/admin/users/${id}`);
    return data;
  },

  // Modifier un utilisateur
  update: async (id: string, updates: Partial<BackofficeUser>) => {
    const { data } = await apiClient.patch<BackofficeUser>(`/admin/users/${id}`, updates);
    return data;
  },

  // Désactiver un utilisateur
  deactivate: async (id: string) => {
    const { data } = await apiClient.patch<{ message: string }>(`/admin/users/${id}/deactivate`);
    return data;
  },

  // Activer un utilisateur
  activate: async (id: string) => {
    const { data } = await apiClient.patch<{ message: string }>(`/admin/users/${id}/activate`);
    return data;
  },
};
