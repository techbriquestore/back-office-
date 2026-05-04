import { apiClient } from '@/lib/api-client';

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

export const auditApi = {
  // Récupérer les logs d'audit
  getAll: async (params?: { limit?: number; offset?: number; action?: string; entity?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.action) queryParams.append('action', params.action);
    if (params?.entity) queryParams.append('entity', params.entity);

    const url = `/admin/audit-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const { data } = await apiClient.get<{ data: AuditLog[]; meta: { total: number; limit: number; offset: number } }>(url);
    return data;
  },
};
