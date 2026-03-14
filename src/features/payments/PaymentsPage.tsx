import { useState } from 'react';
import { Search, Download, CheckCircle, XCircle, Clock, CreditCard, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCFA, formatDateTime } from '@/core/utils/formatters';

type PaymentStatus = 'CONFIRMED' | 'PENDING' | 'FAILED' | 'REFUNDED';
type Tab = 'all' | 'orders' | 'preorders' | 'overdue';

interface Payment {
  id: string;
  reference: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  type: 'ORDER' | 'PREORDER_INSTALLMENT';
  installmentLabel?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  CONFIRMED: { label: 'Confirmé', color: 'text-green-700', bg: 'bg-green-50', icon: <CheckCircle size={14} /> },
  PENDING: { label: 'En attente', color: 'text-yellow-700', bg: 'bg-yellow-50', icon: <Clock size={14} /> },
  FAILED: { label: 'Échoué', color: 'text-red-700', bg: 'bg-red-50', icon: <XCircle size={14} /> },
  REFUNDED: { label: 'Remboursé', color: 'text-gray-700', bg: 'bg-gray-100', icon: <CreditCard size={14} /> },
};

const MOCK_PAYMENTS: Payment[] = [
  { id: '1', reference: 'PAY-2026-0088', orderNumber: 'CMD-2026-00567', customerName: 'Kouassi Jean', amount: 515000, method: 'Orange Money', status: 'CONFIRMED', type: 'ORDER', createdAt: '2026-03-11T14:30:00Z' },
  { id: '2', reference: 'PAY-2026-0087', orderNumber: 'CMD-2026-00564', customerName: 'Traoré Fatoumata', amount: 225000, method: 'Wave', status: 'CONFIRMED', type: 'ORDER', createdAt: '2026-03-11T10:15:00Z' },
  { id: '3', reference: 'PAY-2026-0086', orderNumber: 'PRE-2026-0012', customerName: 'Bamba Seydou', amount: 312500, method: 'Virement SGBCI', status: 'CONFIRMED', type: 'PREORDER_INSTALLMENT', installmentLabel: 'Échéance 2/4', createdAt: '2026-03-10T08:00:00Z' },
  { id: '4', reference: 'PAY-2026-0085', orderNumber: 'CMD-2026-00560', customerName: 'Koffi Emmanuel', amount: 190000, method: 'MTN Money', status: 'PENDING', type: 'ORDER', createdAt: '2026-03-10T16:00:00Z' },
  { id: '5', reference: 'PAY-2026-0084', orderNumber: 'PRE-2026-0008', customerName: 'Société BTP Plus', amount: 875000, method: 'Orange Money', status: 'FAILED', type: 'PREORDER_INSTALLMENT', installmentLabel: 'Échéance 3/6', createdAt: '2026-03-09T11:00:00Z' },
  { id: '6', reference: 'PAY-2026-0083', orderNumber: 'CMD-2026-00555', customerName: 'Diallo Mamadou', amount: 670000, method: 'Carte Visa', status: 'CONFIRMED', type: 'ORDER', createdAt: '2026-03-08T09:30:00Z' },
  { id: '7', reference: 'PAY-2026-0082', orderNumber: 'PRE-2026-0005', customerName: 'Achi Construction', amount: 1250000, method: 'Virement BICICI', status: 'CONFIRMED', type: 'PREORDER_INSTALLMENT', installmentLabel: 'Échéance 4/6', createdAt: '2026-03-07T14:00:00Z' },
  { id: '8', reference: 'PAY-2026-0081', orderNumber: 'CMD-2026-00548', customerName: 'Koné Adama', amount: 420000, method: 'Wave', status: 'REFUNDED', type: 'ORDER', createdAt: '2026-03-06T10:00:00Z' },
];

const OVERDUE_INSTALLMENTS = [
  { id: 'ov1', preorderNumber: 'PRE-2026-0010', customerName: 'Yao Pierre', amount: 437500, dueDate: '2026-03-05', daysPastDue: 6, installmentLabel: 'Échéance 3/4', phone: '+225 05 44 33 22' },
  { id: 'ov2', preorderNumber: 'PRE-2026-0008', customerName: 'Société BTP Plus', amount: 875000, dueDate: '2026-03-03', daysPastDue: 8, installmentLabel: 'Échéance 3/6', phone: '+225 07 88 99 00' },
  { id: 'ov3', preorderNumber: 'PRE-2026-0006', customerName: 'Diabaté Moussa', amount: 250000, dueDate: '2026-03-01', daysPastDue: 10, installmentLabel: 'Échéance 2/3', phone: '+225 01 22 33 44' },
];

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'Tous les paiements' },
  { key: 'orders', label: 'Commandes' },
  { key: 'preorders', label: 'Pré-commandes' },
  { key: 'overdue', label: 'Échéances impayées' },
];

export default function PaymentsPage() {
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_PAYMENTS.filter((p) => {
    if (tab === 'orders') return p.type === 'ORDER';
    if (tab === 'preorders') return p.type === 'PREORDER_INSTALLMENT';
    return true;
  }).filter((p) =>
    search === '' || p.reference.toLowerCase().includes(search.toLowerCase()) || p.customerName.toLowerCase().includes(search.toLowerCase()) || p.orderNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totalConfirmed = MOCK_PAYMENTS.filter((p) => p.status === 'CONFIRMED').reduce((s, p) => s + p.amount, 0);
  const totalPending = MOCK_PAYMENTS.filter((p) => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);
  const totalOverdue = OVERDUE_INSTALLMENTS.reduce((s, o) => s + o.amount, 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
          <p className="text-sm text-gray-500 mt-1">Suivi des transactions et échéances</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download size={16} /> Exporter
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Paiements confirmés</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCFA(totalConfirmed)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">En attente de confirmation</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{formatCFA(totalPending)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 border-l-4 border-l-red-500">
          <p className="text-sm text-gray-500">Échéances impayées</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatCFA(totalOverdue)}</p>
          <p className="text-xs text-red-500 mt-1">{OVERDUE_INSTALLMENTS.length} échéances en retard</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 mb-4 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              tab === t.key ? 'bg-[#FF8C00] text-white' : 'text-gray-600 hover:bg-gray-100',
            )}
          >
            {t.label}
            {t.key === 'overdue' && OVERDUE_INSTALLMENTS.length > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{OVERDUE_INSTALLMENTS.length}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'overdue' ? (
        /* Overdue installments */
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            <h3 className="font-semibold text-gray-900 text-sm">Échéances de pré-commandes en retard</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Pré-commande</th>
                <th className="text-left px-4 py-3">Client</th>
                <th className="text-left px-4 py-3">Échéance</th>
                <th className="text-right px-4 py-3">Montant</th>
                <th className="text-left px-4 py-3">Date due</th>
                <th className="text-left px-4 py-3">Retard</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {OVERDUE_INSTALLMENTS.map((o) => (
                <tr key={o.id} className="hover:bg-red-50/30">
                  <td className="px-4 py-3 font-medium text-gray-900">{o.preorderNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{o.customerName}</td>
                  <td className="px-4 py-3 text-gray-600">{o.installmentLabel}</td>
                  <td className="px-4 py-3 text-right font-semibold text-red-600">{formatCFA(o.amount)}</td>
                  <td className="px-4 py-3 text-gray-500">{o.dueDate}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                      {o.daysPastDue}j de retard
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs font-medium text-[#FF8C00] hover:underline">Relancer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Payments list */
        <>
          <div className="mb-4">
            <div className="relative w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par référence, client..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Référence</th>
                  <th className="text-left px-4 py-3">Commande</th>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-right px-4 py-3">Montant</th>
                  <th className="text-left px-4 py-3">Méthode</th>
                  <th className="text-left px-4 py-3">Statut</th>
                  <th className="text-left px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => {
                  const cfg = STATUS_CONFIG[p.status];
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-900">{p.reference}</td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-gray-900">{p.orderNumber}</span>
                          {p.installmentLabel && (
                            <span className="ml-2 text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">{p.installmentLabel}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.customerName}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCFA(p.amount)}</td>
                      <td className="px-4 py-3 text-gray-600">{p.method}</td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold', cfg.bg, cfg.color)}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDateTime(p.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
