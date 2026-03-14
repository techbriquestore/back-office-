import { useState } from 'react';
import { Search, Download, FileText, Eye, Printer, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCFA, formatDate } from '@/core/utils/formatters';

type InvoiceStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED';

interface Invoice {
  id: string;
  number: string;
  orderNumber: string;
  customerName: string;
  customerType: 'PARTICULIER' | 'PROFESSIONNEL';
  amountHT: number;
  tva: number;
  totalTTC: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueDate: string;
}

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  PAID: { label: 'Payée', color: 'text-green-700', bg: 'bg-green-50' },
  PENDING: { label: 'En attente', color: 'text-yellow-700', bg: 'bg-yellow-50' },
  OVERDUE: { label: 'En retard', color: 'text-red-700', bg: 'bg-red-50' },
  CANCELLED: { label: 'Annulée', color: 'text-gray-500', bg: 'bg-gray-100' },
};

const MOCK_INVOICES: Invoice[] = [
  { id: '1', number: 'FAC-2026-000567', orderNumber: 'CMD-2026-00567', customerName: 'Kouassi Jean', customerType: 'PARTICULIER', amountHT: 889150, tva: 160047, totalTTC: 1049300, status: 'PAID', issuedAt: '2026-03-05', dueDate: '2026-03-05' },
  { id: '2', number: 'FAC-2026-000564', orderNumber: 'CMD-2026-00564', customerName: 'Traoré Fatoumata', customerType: 'PARTICULIER', amountHT: 550000, tva: 99000, totalTTC: 649000, status: 'PAID', issuedAt: '2026-03-04', dueDate: '2026-03-04' },
  { id: '3', number: 'FAC-2026-000560', orderNumber: 'CMD-2026-00560', customerName: 'Koffi Emmanuel', customerType: 'PARTICULIER', amountHT: 300000, tva: 54000, totalTTC: 354000, status: 'PENDING', issuedAt: '2026-03-03', dueDate: '2026-03-10' },
  { id: '4', number: 'FAC-2026-000555', orderNumber: 'CMD-2026-00555', customerName: 'Société BTP Plus', customerType: 'PROFESSIONNEL', amountHT: 2500000, tva: 450000, totalTTC: 2950000, status: 'PAID', issuedAt: '2026-03-01', dueDate: '2026-03-01' },
  { id: '5', number: 'FAC-2026-000548', orderNumber: 'CMD-2026-00548', customerName: 'Diallo Mamadou', customerType: 'PARTICULIER', amountHT: 355932, tva: 64068, totalTTC: 420000, status: 'CANCELLED', issuedAt: '2026-02-28', dueDate: '2026-02-28' },
  { id: '6', number: 'FAC-2026-000540', orderNumber: 'PRE-2026-0012', customerName: 'Bamba Seydou', customerType: 'PROFESSIONNEL', amountHT: 264831, tva: 47669, totalTTC: 312500, status: 'PAID', issuedAt: '2026-02-25', dueDate: '2026-02-25' },
  { id: '7', number: 'FAC-2026-000535', orderNumber: 'CMD-2026-00530', customerName: 'Achi Construction', customerType: 'PROFESSIONNEL', amountHT: 4237288, tva: 762712, totalTTC: 5000000, status: 'OVERDUE', issuedAt: '2026-02-20', dueDate: '2026-03-05' },
];

export default function InvoicesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'ALL'>('ALL');

  const filtered = MOCK_INVOICES.filter((inv) => {
    if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;
    if (search && !inv.number.toLowerCase().includes(search.toLowerCase()) && !inv.customerName.toLowerCase().includes(search.toLowerCase()) && !inv.orderNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPaid = MOCK_INVOICES.filter((i) => i.status === 'PAID').reduce((s, i) => s + i.totalTTC, 0);
  const totalOverdue = MOCK_INVOICES.filter((i) => i.status === 'OVERDUE').reduce((s, i) => s + i.totalTTC, 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
          <p className="text-sm text-gray-500 mt-1">Gestion et génération des factures conformes DGI</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download size={16} /> Exporter tout
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Total facturé (payé)</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCFA(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Factures ce mois</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{MOCK_INVOICES.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 border-l-4 border-l-red-500">
          <p className="text-sm text-gray-500">Impayés en retard</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatCFA(totalOverdue)}</p>
        </div>
      </div>

      {/* DGI compliance badge */}
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-lg mb-4 text-xs">
        <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
        <span className="text-green-700 font-medium">Factures conformes à la réglementation DGI — TVA 18% — Numérotation chronologique — Archivage sécurisé 10 ans</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="N° facture, client, commande..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none" />
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {(['ALL', 'PAID', 'PENDING', 'OVERDUE', 'CANCELLED'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-colors', statusFilter === s ? 'bg-[#FF8C00] text-white' : 'text-gray-600 hover:bg-gray-100')}>
              {s === 'ALL' ? 'Toutes' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">N° Facture</th>
              <th className="text-left px-4 py-3">Commande</th>
              <th className="text-left px-4 py-3">Client</th>
              <th className="text-right px-4 py-3">HT</th>
              <th className="text-right px-4 py-3">TVA 18%</th>
              <th className="text-right px-4 py-3">TTC</th>
              <th className="text-left px-4 py-3">Statut</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((inv) => {
              const cfg = STATUS_CONFIG[inv.status];
              return (
                <tr key={inv.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-gray-400" />
                      <span className="font-medium text-gray-900">{inv.number}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{inv.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-gray-900">{inv.customerName}</span>
                      <span className={cn('ml-2 text-[10px] px-1.5 py-0.5 rounded font-medium', inv.customerType === 'PROFESSIONNEL' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500')}>
                        {inv.customerType === 'PROFESSIONNEL' ? 'PRO' : 'PART'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatCFA(inv.amountHT)}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{formatCFA(inv.tva)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCFA(inv.totalTTC)}</td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-semibold', cfg.bg, cfg.color)}>{cfg.label}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(inv.issuedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Voir"><Eye size={14} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="PDF"><Download size={14} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Imprimer"><Printer size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
