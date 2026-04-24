import { apiClient } from '@/lib/api-client';

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface PreorderSchedule {
  id: string;
  preorderId: string;
  dueDate: string;
  amount: number;
  quantity: number;
  status: 'UPCOMING' | 'DUE' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  paidAt: string | null;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PreorderUser {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export interface Preorder {
  id: string;
  userId: string;
  productId: string;
  totalQuantity: number;
  totalAmount: number;
  lockedPrice: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CONVERTED' | 'SUSPENDED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  deliveryAddressId?: string;
  createdAt: string;
  updatedAt: string;
  schedules: PreorderSchedule[];
  user: PreorderUser;
}

export interface PreorderDetail extends Preorder {
  amountPaid: number;
  remaining: number;
  paidSchedules: number;
  totalSchedules: number;
  progress: number;
  nextSchedule: PreorderSchedule | null;
}

export interface PreordersResponse {
  data: Preorder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PreordersQuery {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ValidationCheck {
  label: string;
  passed: boolean;
  detail: string;
}

export interface ValidationReport {
  preorderId: string;
  status: 'VALID' | 'INVALID';
  canConvert: boolean;
  checks: ValidationCheck[];
  summary: {
    totalAmount: number;
    totalPaid: number;
    schedulesCount: number;
    paidCount: number;
    cancelledCount: number;
    unpaidCount: number;
    customer: string;
    product: string;
  };
}

export interface ConvertResult {
  order: {
    id: string;
    orderNumber: string;
  };
  preorderId: string;
  orderNumber: string;
  message: string;
}

// ─── Service ────────────────────────────────────────────────────────────────────

class PreordersAdminApiService {
  async getPreorders(query: PreordersQuery = {}): Promise<PreordersResponse> {
    const params = new URLSearchParams();
    if (query.status) params.set('status', query.status);
    if (query.search) params.set('search', query.search);
    if (query.page) params.set('page', query.page.toString());
    if (query.pageSize) params.set('pageSize', query.pageSize.toString());

    const qs = params.toString();
    const response = await apiClient.get<PreordersResponse>(`/admin/preorders${qs ? `?${qs}` : ''}`);
    return response.data;
  }

  async getPreorder(id: string): Promise<PreorderDetail> {
    const response = await apiClient.get<PreorderDetail>(`/admin/preorders/${id}`);
    return response.data;
  }

  async validate(id: string): Promise<ValidationReport> {
    const response = await apiClient.get<ValidationReport>(`/admin/preorders/${id}/validate`);
    return response.data;
  }

  async convertToOrder(id: string): Promise<ConvertResult> {
    const response = await apiClient.post<ConvertResult>(`/admin/preorders/${id}/convert-to-order`);
    return response.data;
  }

  async suspend(id: string): Promise<Preorder> {
    const response = await apiClient.patch<Preorder>(`/admin/preorders/${id}/suspend`);
    return response.data;
  }

  async cancel(id: string, reason: string): Promise<Preorder> {
    const response = await apiClient.patch<Preorder>(`/admin/preorders/${id}/cancel`, { reason });
    return response.data;
  }

  async reactivate(id: string): Promise<Preorder> {
    const response = await apiClient.patch<Preorder>(`/admin/preorders/${id}/reactivate`);
    return response.data;
  }

  async markSchedulePaid(scheduleId: string): Promise<PreorderSchedule> {
    const response = await apiClient.patch<PreorderSchedule>(`/admin/preorders/schedules/${scheduleId}/mark-paid`);
    return response.data;
  }
}

export const preordersAdminApi = new PreordersAdminApiService();
