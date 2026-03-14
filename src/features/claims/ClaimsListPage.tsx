import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/core/utils/formatters';
import { CLAIM_TYPE_LABELS, CLAIM_STATUS_LABELS } from '@/core/types';
import type { ClaimStatus, ClaimType } from '@/core/types';
import { useAuthStore } from '@/core/stores/auth.store';

interface ClaimRow {
  id: string;
  number: string;
  orderNumber: string;
  customerName: string;
  type: ClaimType;
  status: ClaimStatus;
  assignedTo?: string;
  daysSinceOpen: number;
  createdAt: string;
}

const MOCK: ClaimRow[] = [
  { id: '1', number: 'REC-2026-0045', orderNumber: 'CMD-2026-00892', customerName: 'Kouassi Jean', type: 'DEFECTIVE_PRODUCT', status: 'OPEN', daysSinceOpen: 0, createdAt: '2026-03-05T07:30:00Z' },
  { id: '2', number: 'REC-2026-0044', orderNumber: 'CMD-2026-00887', customerName: 'Société ABC SARL', type: 'MISSING_ITEMS', status: 'OPEN', daysSinceOpen: 0, createdAt: '2026-03-05T03:00:00Z' },
  { id: '3', number: 'REC-2026-0043', orderNumber: 'CMD-2026-00875', customerName: 'Diallo Mamadou', type: 'DELIVERY_ISSUE', status: 'IN_PROGRESS', assignedTo: 'Marie K.', daysSinceOpen: 1, createdAt: '2026-03-04T10:00:00Z' },
  { id: '4', number: 'REC-2026-0042', orderNumber: 'CMD-2026-00860', customerName: 'Traoré Fatoumata', type: 'DAMAGED_IN_TRANSIT', status: 'IN_PROGRESS', assignedTo: 'Marie K.', daysSinceOpen: 3, createdAt: '2026-03-02T14:00:00Z' },
  { id: '5', number: 'REC-2026-0041', orderNumber: 'CMD-2026-00850', customerName: 'Yao Aya', type: 'WRONG_PRODUCT', status: 'RESOLVED', assignedTo: 'Jean P.', daysSinceOpen: 5, createdAt: '2026-02-28T09:00:00Z' },
  { id: '6', number: 'REC-2026-0040', orderNumber: 'CMD-2026-00845', customerName: 'Koffi Emmanuel', type: 'OTHER', status: 'CLOSED', assignedTo: 'Marie K.', daysSinceOpen: 7, createdAt: '2026-02-26T16:00:00Z' },
];

const STATUS_COLORS: Record<ClaimStatus, { bg: string; text: string }> = {
  OPEN: { bg: 'bg-red-50', text: 'text-red-700' },
  IN_PROGRESS: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  RESOLVED: { bg: 'bg-green-50', text: 'text-green-700' },
  CLOSED: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

type Tab = 'all' | 'UNASSIGNED' | 'MINE' | 'IN_PROGRESS' | 'RESOLVED';

export default function ClaimsListPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');

  const unassignedCount = MOCK.filter((c) => c.status === 'OPEN' && !c.assignedTo).length;

  const filtered = MOCK.filter((c) => {
    if (activeTab === 'UNASSIGNED') return !c.assignedTo && c.status === 'OPEN';
    if (activeTab === 'MINE') return c.assignedTo === `${user?.firstName} ${user?.lastName?.[0]}.`;
    if (activeTab === 'IN_PROGRESS') return c.status === 'IN_PROGRESS';
    if (activeTab === 'RESOLVED') return c.status === 'RESOLVED' || c.status === 'CLOSED';
    if (search) {
      const q = search.toLowerCase();
      return c.number.toLowerCase().includes(q) || c.customerName.toLowerCase().includes(q) || c.orderNumber.toLowerCase().includes(q);
    }
    return true;
  });

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'UNASSIGNED', label: 'Non assignées', count: unassignedCount },
    { key: 'MINE', label: 'Mes réclamations' },
    { key: 'IN_PROGRESS', label: 'En cours' },
    { key: 'RESOLVED', label: 'Résolues' },
    { key: 'all', label: 'Toutes' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Réclamations</h1>
        <p className="text-sm text-gray-500 mt-1">{MOCK.length} réclamation(s) — {unassignedCount} non assignée(s)</p>
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

      <div className="relative max-w-md mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par n°, client ou commande..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C00] outline-none"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">N° Réclamation</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Commande</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Assigné à</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Délai</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const sc = STATUS_COLORS[c.status];
                return (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{c.number}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(c.createdAt)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.customerName}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/admin/orders/1`)}
                        className="text-sm text-[#FF8C00] hover:underline font-medium"
                      >
                        {c.orderNumber}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{CLAIM_TYPE_LABELS[c.type]}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('inline-flex px-2.5 py-1 rounded-full text-xs font-semibold', sc.bg, sc.text)}>
                        {CLAIM_STATUS_LABELS[c.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {c.assignedTo || (
                        <span className="text-red-500 text-xs font-medium">Non assigné</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('text-sm font-medium',
                        c.daysSinceOpen > 2 ? 'text-red-600' : c.daysSinceOpen > 0 ? 'text-yellow-600' : 'text-gray-600',
                      )}>
                        {c.daysSinceOpen === 0 ? "Aujourd'hui" : `${c.daysSinceOpen}j`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {!c.assignedTo && (
                          <button className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="S'assigner">
                            <UserCheck size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/admin/claims/${c.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#FF8C00] bg-orange-50 rounded-lg hover:bg-orange-100"
                        >
                          <Eye size={14} /> Voir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
