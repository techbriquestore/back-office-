import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/core/utils/formatters';

type MovementType = 'ENTRY' | 'SALE' | 'ADJUSTMENT' | 'RETURN' | 'RESERVATION' | 'CANCELLATION';

const TYPE_CONFIG: Record<MovementType, { label: string; color: string }> = {
  ENTRY: { label: 'Entrée', color: 'text-green-700 bg-green-50' },
  SALE: { label: 'Sortie (vente)', color: 'text-red-700 bg-red-50' },
  ADJUSTMENT: { label: 'Ajustement', color: 'text-blue-700 bg-blue-50' },
  RETURN: { label: 'Retour', color: 'text-purple-700 bg-purple-50' },
  RESERVATION: { label: 'Réservation', color: 'text-yellow-700 bg-yellow-50' },
  CANCELLATION: { label: 'Annulation', color: 'text-orange-700 bg-orange-50' },
};

interface Movement {
  id: string;
  date: string;
  productName: string;
  productRef: string;
  type: MovementType;
  quantity: number;
  before: number;
  after: number;
  reason: string;
  userName: string;
}

const MOCK: Movement[] = [
  { id: '1', date: '2026-03-05T09:00:00Z', productName: 'Brique Pleine 20cm', productRef: 'BP-20', type: 'ENTRY', quantity: 5000, before: 4000, after: 9000, reason: 'Réception fabrication — BL-2026-00345', userName: 'Konan Marc' },
  { id: '2', date: '2026-03-05T08:45:00Z', productName: 'Brique Pleine 20cm', productRef: 'BP-20', type: 'RESERVATION', quantity: -500, before: 9000, after: 8500, reason: 'CMD-2026-00567 validée', userName: 'Système' },
  { id: '3', date: '2026-03-05T08:30:00Z', productName: 'Brique Creuse 20cm', productRef: 'BC-20', type: 'SALE', quantity: -200, before: 320, after: 120, reason: 'Livraison CMD-2026-00560', userName: 'Système' },
  { id: '4', date: '2026-03-04T16:00:00Z', productName: 'Brique Réfractaire', productRef: 'BR-01', type: 'ADJUSTMENT', quantity: -5, before: 25, after: 20, reason: 'Inventaire — 5 unités cassées en stock', userName: 'Konan Marc' },
  { id: '5', date: '2026-03-04T14:00:00Z', productName: 'Hourdis 16cm', productRef: 'HD-16', type: 'RETURN', quantity: 50, before: 4450, after: 4500, reason: 'Retour client CMD-2026-00480', userName: 'Konan Marc' },
  { id: '6', date: '2026-03-04T10:00:00Z', productName: 'Brique Creuse 15cm', productRef: 'BC-15', type: 'CANCELLATION', quantity: 300, before: 1500, after: 1800, reason: 'Annulation CMD-2026-00555 — stock libéré', userName: 'Système' },
  { id: '7', date: '2026-03-03T11:00:00Z', productName: 'Brique Pleine 15cm', productRef: 'BP-15', type: 'ENTRY', quantity: 2000, before: 1500, after: 3500, reason: 'Réception fournisseur — BL-2026-00340', userName: 'Konan Marc' },
];

export default function StockHistoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<MovementType | ''>('');

  const filtered = MOCK.filter((m) => {
    if (typeFilter && m.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return m.productName.toLowerCase().includes(q) || m.productRef.toLowerCase().includes(q) || m.reason.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/stock')} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Historique des mouvements</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} mouvement(s)</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download size={16} /> Exporter
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par produit, référence ou motif..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C00] outline-none"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as MovementType | '')}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">Tous les types</option>
          {Object.entries(TYPE_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Produit</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Quantité</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Avant</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Après</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Motif</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Auteur</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const cfg = TYPE_CONFIG[m.type];
                return (
                  <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(m.date)}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{m.productName}</p>
                      <p className="text-xs text-gray-400">{m.productRef}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('inline-flex px-2.5 py-1 rounded-full text-xs font-semibold', cfg.color)}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn('text-sm font-semibold', m.quantity > 0 ? 'text-green-600' : 'text-red-600')}>
                        {m.quantity > 0 ? '+' : ''}{m.quantity.toLocaleString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-500">{m.before.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{m.after.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[250px] truncate">{m.reason}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{m.userName}</td>
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
