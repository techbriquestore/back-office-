import { ordersApiService, type Order, type OrdersQuery, type OrdersResponse } from '../../orders/services/orders-api.service';

export interface PreorderRow {
  id: string;
  number: string;
  customerName: string;
  customerCompany?: string;
  productName: string;
  totalQuantity: number;
  totalAmount: number;
  paidAmount: number;
  nextDueDate?: string;
  nextDueAmount?: number;
  deliveryDate?: string;
  status: string;
  hasUnpaid: boolean;
  progress: number;
}

class PreordersApiService {
  // Preorders are orders with installment payments not fully paid
  async getPreorders(query: OrdersQuery = {}): Promise<OrdersResponse> {
    return ordersApiService.getOrders(query);
  }

  async getPreorder(id: string): Promise<Order> {
    return ordersApiService.getOrder(id);
  }

  // Transform Order to PreorderRow for display
  transformOrderToPreorderRow(order: Order): PreorderRow {
    // Calculate total paid amount from payments
    const paidAmount = order.payments
      .filter((p) => p.status === 'CONFIRMED')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalAmount = order.totalAmount;
    const progress = Math.round((paidAmount / totalAmount) * 100);
    const hasUnpaid = paidAmount < totalAmount;

    // Get product name from first item
    const productName = order.items[0]?.product?.name || 'Produit inconnu';
    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

    // Calculate next due amount (simplified - would need payment schedule logic)
    const remainingAmount = totalAmount - paidAmount;
    const nextDueAmount = remainingAmount > 0 ? remainingAmount : undefined;

    return {
      id: order.id,
      number: order.orderNumber,
      customerName: `${order.user.firstName} ${order.user.lastName}`,
      customerCompany: order.user.email, // TODO: get from user.companyName if available
      productName,
      totalQuantity,
      totalAmount,
      paidAmount,
      nextDueDate: order.estimatedDelivery,
      nextDueAmount,
      deliveryDate: order.estimatedDelivery,
      status: order.status,
      hasUnpaid,
      progress,
    };
  }
}

export const preordersApiService = new PreordersApiService();
