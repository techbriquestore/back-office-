import { apiClient } from '@/lib/api-client';

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  label: string;
  group: string;
  updatedBy?: string;
  updatedAt: string;
}

export const settingsApi = {
  // Récupérer toutes les configurations
  getAll: async () => {
    const { data } = await apiClient.get<SystemConfig[]>('/admin/system-configs');
    return data;
  },

  // Récupérer les configurations par groupe
  getByGroup: async (group: string) => {
    const { data } = await apiClient.get<SystemConfig[]>(`/admin/system-configs/group/${group}`);
    return data;
  },

  // Récupérer une configuration par clé
  getByKey: async (key: string) => {
    const { data } = await apiClient.get<SystemConfig>(`/admin/system-configs/${key}`);
    return data;
  },

  // Mettre à jour une configuration
  update: async (key: string, value: string, label?: string) => {
    const { data } = await apiClient.put<SystemConfig>(`/admin/system-configs/${key}`, {
      value,
      ...(label && { label }),
    });
    return data;
  },
};
