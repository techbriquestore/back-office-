import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download, Eye, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/core/stores/auth.store';
import { formatCFA, formatDateTime } from '@/core/utils/formatters';
import {
  ORDER_STATUS_LABELS, ORDER_STATUS_COLORS,
  PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
} from '@/core/types';
import type { OrderStatus } from '@/core/types';
import { ordersApiService, type Order } from './services/orders-api.service';

type Tab = 'all' | OrderStatus;

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'PENDING_VALIDATION', label: 'À valider' },
  { key: 'VALIDATED', label: 'Validées' },
  { key: 'IN_PREPARATION', label: 'En fabrication' },
  { key: 'SHIPPED', label: 'Expédiées' },
  { key: 'DELIVERED', label: 'Livrées' },
  { key: 'CANCELLED', label: 'Annulées' },
];

function StatusBadge({ status, labels, colors }: { status: string; labels: Record<string, string>; colors: Record<string, string> }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: `${colors[status]}18`, color: colors[status] }}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: colors[status] }} />
      {labels[status] || status}
    </span>
  );
}

export default function OrdersListPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ordersApiService.getOrders({
        search: search || undefined,
        status: activeTab !== 'all' ? activeTab : undefined,
        page,
        pageSize,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setOrders(response.data.map(transformApiOrder));
      setTotal(response.total);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, page]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pendingCount = orders.filter((o) => o.status === 'PENDING_VALIDATION').length;

  // Transform API order to match existing Order type
  function transformApiOrder(apiOrder: Order): any {
    return {
      ...apiOrder,
      customerName: `${apiOrder.user.firstName} ${apiOrder.user.lastName}`,
      customerPhone: apiOrder.user.phone,
      customerEmail: apiOrder.user.email,
      customerType: 'PARTICULIER', // TODO: get from user.clientType
      paymentMethod: apiOrder.payments[0]?.method,
      paymentStatus: apiOrder.payments[0]?.status,
      driverName: apiOrder.driver ? `${apiOrder.driver.firstName} ${apiOrder.driver.lastName}` : undefined,
    };
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          <p className="text-sm text-gray-500 mt-1">{total} commande(s)</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download size={16} /> Exporter
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
              activeTab === tab.key ? 'bg-[#FF8C00] text-white' : 'text-gray-600 hover:bg-gray-100',
            )}
          >
            {tab.label}
            {tab.key === 'PENDING_VALIDATION' && pendingCount > 0 && (
              <span className="ml-1.5 bg-white/20 text-white px-1.5 py-0.5 rounded-full text-xs">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par n° commande ou nom client..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors',
            showFilters ? 'bg-[#FF8C00] text-white border-[#FF8C00]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50',
          )}
        >
          <Filter size={16} /> Filtres
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date début</label>
            <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date fin</label>
            <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Type client</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">Tous</option>
              <option value="PARTICULIER">Particulier</option>
              <option value="PROFESSIONNEL">Professionnel</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Mode paiement</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">Tous</option>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-[#FF8C00]" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">N° commande</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Paiement</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut paiement</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut commande</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-gray-900">{order.orderNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{order.customerName}</span>
                        <span className={cn(
                          'text-[10px] font-bold px-1.5 py-0.5 rounded',
                          order.customerType === 'PROFESSIONNEL' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600',
                        )}>
                          {order.customerType === 'PROFESSIONNEL' ? 'PRO' : 'PART'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-gray-900">{formatCFA(order.totalAmount)}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.paymentMethod ? PAYMENT_METHOD_LABELS[order.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {order.paymentStatus ? (
                        <StatusBadge status={order.paymentStatus} labels={PAYMENT_STATUS_LABELS as Record<string, string>} colors={PAYMENT_STATUS_COLORS as Record<string, string>} />
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} labels={ORDER_STATUS_LABELS as Record<string, string>} colors={ORDER_STATUS_COLORS as Record<string, string>} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#FF8C00] bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                      >
                        <Eye size={14} /> Voir
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">
                      Aucune commande trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              {total} résultat(s) — Page {page}/{totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick action for pending validation */}
      {user?.role !== 'SERVICE_CLIENT' && pendingCount > 0 && activeTab === 'PENDING_VALIDATION' && (
        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between">
          <p className="text-sm text-orange-800 font-medium">
            {pendingCount} commande(s) en attente de validation
          </p>
          <button className="px-4 py-2 bg-[#FF8C00] text-white text-sm font-medium rounded-lg hover:bg-[#E67E00] transition-colors">
            Tout valider
          </button>
        </div>
      )}
    </div>
  );
}
