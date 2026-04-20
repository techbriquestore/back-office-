import { apiClient } from '../../../lib/api-client';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  status: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  amountHt?: number;
  tva?: number;
  deliveryMode: string;
  deliveryAddressId?: string;
  deliveryNotes?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  paymentDuration?: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payments: Payment[];
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: {
    id: string;
    name: string;
    reference: string;
    images?: { id: string; url: string; isPrimary: boolean }[];
  };
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  status: string;
  providerTxId?: string;
  providerRef?: string;
  paidAt?: string;
  failedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersQuery {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class OrdersApiService {
  async getOrders(query: OrdersQuery = {}): Promise<OrdersResponse> {
    const params = new URLSearchParams();
    if (query.search) params.set('search', query.search);
    if (query.status) params.set('status', query.status);
    if (query.page) params.set('page', query.page.toString());
    if (query.pageSize) params.set('pageSize', query.pageSize.toString());
    if (query.sortBy) params.set('sortBy', query.sortBy);
    if (query.sortOrder) params.set('sortOrder', query.sortOrder);

    const response = await apiClient.get<OrdersResponse>(`/admin/orders?${params.toString()}`);
    return response.data;
  }

  async getOrder(id: string): Promise<Order> {
    const response = await apiClient.get<Order>(`/admin/orders/${id}`);
    return response.data;
  }

  async updateOrderStatus(id: string, status: string, reason?: string): Promise<Order> {
    const response = await apiClient.patch<Order>(`/admin/orders/${id}/status`, { status, reason });
    return response.data;
  }

  async cancelOrder(id: string, reason?: string): Promise<Order> {
    const response = await apiClient.patch<Order>(`/admin/orders/${id}/cancel`, { reason });
    return response.data;
  }

  async assignDriver(orderId: string, driverId: string): Promise<Order> {
    const response = await apiClient.patch<Order>(`/admin/orders/${orderId}/driver`, { driverId });
    return response.data;
  }

  async setEstimatedDelivery(orderId: string, estimatedDelivery: Date): Promise<Order> {
    const response = await apiClient.patch<Order>(`/admin/orders/${orderId}/estimated-delivery`, { estimatedDelivery });
    return response.data;
  }

  async markAsDelivered(orderId: string): Promise<Order> {
    const response = await apiClient.patch<Order>(`/admin/orders/${orderId}/mark-delivered`);
    return response.data;
  }

  // Helper: Get preorders (orders with installment payments not fully paid)
  async getPreorders(query: OrdersQuery = {}): Promise<OrdersResponse> {
    // Preorders are orders where payment is not complete
    // For now, we can filter by status or check payment completion on client side
    return this.getOrders({ ...query });
  }
}

export const ordersApiService = new OrdersApiService();
