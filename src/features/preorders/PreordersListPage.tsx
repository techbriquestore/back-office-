import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCFA, formatDate } from '@/core/utils/formatters';
import type { PreorderStatus } from '@/core/types';
import { preordersApiService, type PreorderRow } from './services/preorders-api.service';

const STATUS_CONFIG: Record<PreorderStatus, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: 'bg-green-50', text: 'text-green-700', label: 'Active' },
  COMPLETED: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Terminée' },
  SUSPENDED: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Suspendue' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', label: 'Annulée' },
};

type Tab = 'all' | PreorderStatus | 'UNPAID';

export default function PreordersListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [preorders, setPreorders] = useState<PreorderRow[]>([]);

  const loadPreorders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await preordersApiService.getPreorders();
      const transformed = response.data.map(preordersApiService.transformOrderToPreorderRow);
      // Filter for preorders (orders with installment payments not fully paid)
      const activePreorders = transformed.filter((p) => p.hasUnpaid);
      setPreorders(activePreorders);
    } catch (error) {
      console.error('Error loading preorders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPreorders();
  }, [loadPreorders]);

  const unpaidCount = preorders.filter((p) => p.hasUnpaid).length;

  const filtered = preorders.filter((p) => {
    if (activeTab === 'UNPAID') return p.hasUnpaid;
    if (activeTab !== 'all' && p.status !== activeTab) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.number.toLowerCase().includes(q) || p.customerName.toLowerCase().includes(q);
    }
    return true;
  });

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'ACTIVE', label: 'Actives' },
    { key: 'UNPAID', label: 'Échéances impayées', count: unpaidCount },
    { key: 'SUSPENDED', label: 'Suspendues' },
    { key: 'COMPLETED', label: 'Terminées' },
    { key: 'CANCELLED', label: 'Annulées' },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pré-commandes</h1>
          <p className="text-sm text-gray-500 mt-1">{preorders.length} pré-commande(s)</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
              activeTab === tab.key ? 'bg-[#FF8C00] text-white' : 'text-gray-600 hover:bg-gray-100',
              tab.key === 'UNPAID' && unpaidCount > 0 && activeTab !== 'UNPAID' && 'text-red-600',
            )}
          >
            {tab.label}
            {tab.count != null && tab.count > 0 && (
              <span className={cn('ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold',
                activeTab === tab.key ? 'bg-white/20' : 'bg-red-100 text-red-600',
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par n° ou client..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C00] outline-none"
        />
      </div>

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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">N° Pré-commande</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Produit</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Qté totale</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Montant</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Progression</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Prochaine échéance</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const cfg = STATUS_CONFIG[row.status as PreorderStatus];
                  return (
                    <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-900">{row.number}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{row.customerName}</p>
                        {row.customerCompany && <p className="text-xs text-gray-400">{row.customerCompany}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.productName}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{row.totalQuantity.toLocaleString('fr-FR')}</td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCFA(row.totalAmount)}</p>
                        <p className="text-xs text-gray-400">Payé : {formatCFA(row.paidAmount)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', row.progress >= 100 ? 'bg-green-500' : row.progress >= 50 ? 'bg-[#FF8C00]' : 'bg-yellow-500')}
                              style={{ width: `${Math.min(100, row.progress)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-600 w-8">{row.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {row.nextDueDate ? (
                          <div className="flex items-center gap-1">
                            {row.hasUnpaid && <AlertTriangle size={14} className="text-red-500" />}
                            <div>
                              <p className="text-sm text-gray-900">{formatDate(row.nextDueDate)}</p>
                              <p className="text-xs text-gray-400">{row.nextDueAmount ? formatCFA(row.nextDueAmount) : ''}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn('inline-flex px-2.5 py-1 rounded-full text-xs font-semibold', cfg.bg, cfg.text)}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => navigate(`/admin/preorders/${row.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#FF8C00] bg-orange-50 rounded-lg hover:bg-orange-100"
                        >
                          <Eye size={14} /> Voir
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">
                      Aucune pré-commande trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
