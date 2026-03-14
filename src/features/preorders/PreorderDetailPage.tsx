import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Pause, Play, XCircle, Plus, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/core/stores/auth.store';
import { hasPermission } from '@/core/permissions';
import { formatCFA, formatDate, formatDateTime } from '@/core/utils/formatters';
import type { ScheduleStatus } from '@/core/types';

const SCHEDULE_STATUS: Record<ScheduleStatus, { bg: string; text: string; label: string }> = {
  UPCOMING: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'À venir' },
  DUE: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Échue' },
  PAID: { bg: 'bg-green-50', text: 'text-green-700', label: 'Payée' },
  OVERDUE: { bg: 'bg-red-50', text: 'text-red-700', label: 'Impayée' },
  CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Annulée' },
};

const MOCK = {
  id: '1',
  number: 'PC-2026-00142',
  customerName: 'Société BTP Plus',
  customerCompany: 'BTP Plus SARL',
  customerPhone: '+225 27 22 44 55',
  customerEmail: 'info@btpplus.ci',
  productName: 'Brique Pleine 20cm',
  productRef: 'BP-20',
  totalQuantity: 50000,
  totalAmount: 15000000,
  lockedPrice: 300,
  paidAmount: 9000000,
  status: 'ACTIVE' as const,
  startDate: '2026-01-15',
  endDate: '2026-06-15',
  deliveryDate: '2026-06-01',
  schedules: [
    { id: 's1', number: 1, dueDate: '2026-01-15', amount: 2250000, quantity: 7500, status: 'PAID' as ScheduleStatus, paidAt: '2026-01-15T10:00:00Z' },
    { id: 's2', number: 2, dueDate: '2026-02-15', amount: 2250000, quantity: 7500, status: 'PAID' as ScheduleStatus, paidAt: '2026-02-14T14:00:00Z' },
    { id: 's3', number: 3, dueDate: '2026-03-15', amount: 2250000, quantity: 7500, status: 'PAID' as ScheduleStatus, paidAt: '2026-03-10T09:00:00Z' },
    { id: 's4', number: 4, dueDate: '2026-04-15', amount: 2250000, quantity: 7500, status: 'PAID' as ScheduleStatus, paidAt: '2026-04-15T11:00:00Z' },
    { id: 's5', number: 5, dueDate: '2026-05-15', amount: 3000000, quantity: 10000, status: 'DUE' as ScheduleStatus },
    { id: 's6', number: 6, dueDate: '2026-06-01', amount: 3000000, quantity: 10000, status: 'UPCOMING' as ScheduleStatus },
  ],
  notes: [
    { id: 'n1', content: 'Client fidèle, gros projet de construction.', author: 'Konan Marc', date: '2026-01-15T10:30:00Z' },
  ],
  createdAt: '2026-01-10T08:00:00Z',
};

export default function PreorderDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  void params.id;
  const user = useAuthStore((s) => s.user);
  const canManage = user ? hasPermission(user.role, 'preorders.manage') : false;
  const [newNote, setNewNote] = useState('');

  const order = MOCK;
  const progress = Math.round((order.paidAmount / order.totalAmount) * 100);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/preorders')} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{order.number}</h1>
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
              Active
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Créée le {formatDate(order.createdAt)}</p>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100">
              <Send size={16} /> Rappel paiement
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100">
              <Pause size={16} /> Suspendre
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary card */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Résumé</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Client</p>
                <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                <p className="text-xs text-gray-400">{order.customerCompany}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Produit</p>
                <p className="text-sm font-medium text-gray-900">{order.productName}</p>
                <p className="text-xs text-gray-400">{order.productRef} — Prix bloqué : {formatCFA(order.lockedPrice)}/u</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Quantité totale</p>
                <p className="text-sm font-bold text-gray-900">{order.totalQuantity.toLocaleString('fr-FR')} unités</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Montant total</p>
                <p className="text-sm font-bold text-[#FF8C00]">{formatCFA(order.totalAmount)}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Progression du paiement</span>
                <span className="font-semibold text-gray-900">{formatCFA(order.paidAmount)} / {formatCFA(order.totalAmount)} ({progress}%)</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', progress >= 100 ? 'bg-green-500' : 'bg-[#FF8C00]')}
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Échéancier */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Échéancier détaillé</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">N°</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date prévue</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Montant</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Quantité</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date paiement</th>
                  </tr>
                </thead>
                <tbody>
                  {order.schedules.map((s) => {
                    const cfg = SCHEDULE_STATUS[s.status];
                    return (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">Tranche {s.number}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(s.dueDate)}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{formatCFA(s.amount)}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">{s.quantity.toLocaleString('fr-FR')}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn('inline-flex px-2.5 py-1 rounded-full text-xs font-semibold', cfg.bg, cfg.text)}>
                            {s.status === 'PAID' && <CheckCircle size={12} className="mr-1" />}
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {s.paidAt ? formatDateTime(s.paidAt) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Notes internes</h3>
            <div className="space-y-3 mb-4">
              {order.notes.map((note) => (
                <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">{note.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{note.author} — {formatDateTime(note.date)}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Ajouter une note..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C00] outline-none"
              />
              <button disabled={!newNote.trim()} className="px-4 py-2 bg-[#FF8C00] text-white text-sm font-medium rounded-lg hover:bg-[#E67E00] disabled:opacity-50">
                <Plus size={16} className="inline mr-1" /> Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Dates clés</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Début</span><span className="font-medium text-gray-900">{formatDate(order.startDate)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Fin</span><span className="font-medium text-gray-900">{formatDate(order.endDate)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Livraison prévue</span><span className="font-medium text-gray-900">{formatDate(order.deliveryDate)}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Contact client</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700 font-medium">{order.customerName}</p>
              <p className="text-gray-500">{order.customerPhone}</p>
              <p className="text-gray-500">{order.customerEmail}</p>
            </div>
          </div>

          {canManage && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100">
                  <Play size={16} /> Planifier livraison
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100">
                  <XCircle size={16} /> Annuler la pré-commande
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
