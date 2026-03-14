import { useState } from 'react';
import { ClipboardCheck, Search, Save, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/core/utils/formatters';

interface InventoryItem {
  id: string;
  productRef: string;
  productName: string;
  systemStock: number;
  physicalCount: number | null;
  gap: number | null;
  status: 'PENDING' | 'COUNTED' | 'VALIDATED';
}

const MOCK_INVENTORY: InventoryItem[] = [
  { id: '1', productRef: 'BP-20', productName: 'Brique Pleine 20cm', systemStock: 8500, physicalCount: 8480, gap: -20, status: 'COUNTED' },
  { id: '2', productRef: 'BP-15', productName: 'Brique Pleine 15cm', systemStock: 3200, physicalCount: 3200, gap: 0, status: 'VALIDATED' },
  { id: '3', productRef: 'BC-15', productName: 'Brique Creuse 15cm', systemStock: 1500, physicalCount: null, gap: null, status: 'PENDING' },
  { id: '4', productRef: 'BC-20', productName: 'Brique Creuse 20cm', systemStock: 85, physicalCount: 82, gap: -3, status: 'COUNTED' },
  { id: '5', productRef: 'BR-01', productName: 'Brique Réfractaire', systemStock: 15, physicalCount: 15, gap: 0, status: 'VALIDATED' },
  { id: '6', productRef: 'BD-R1', productName: 'Brique Décorative Rouge', systemStock: 2800, physicalCount: null, gap: null, status: 'PENDING' },
  { id: '7', productRef: 'HD-16', productName: 'Hourdis 16cm', systemStock: 4200, physicalCount: 4185, gap: -15, status: 'COUNTED' },
  { id: '8', productRef: 'BD-G1', productName: 'Brique Décorative Grise', systemStock: 0, physicalCount: 0, gap: 0, status: 'VALIDATED' },
];

const PAST_INVENTORIES = [
  { id: 'inv1', date: '2026-02-15T10:00:00Z', totalProducts: 8, countedProducts: 8, totalGap: -42, status: 'VALIDATED', author: 'Konan Marc' },
  { id: 'inv2', date: '2026-01-15T09:00:00Z', totalProducts: 8, countedProducts: 8, totalGap: -18, status: 'VALIDATED', author: 'Konan Marc' },
  { id: 'inv3', date: '2025-12-15T10:00:00Z', totalProducts: 7, countedProducts: 7, totalGap: -5, status: 'VALIDATED', author: 'Super Admin' },
];

export default function InventoryPage() {
  const [items, setItems] = useState(MOCK_INVENTORY);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const counted = items.filter((i) => i.status !== 'PENDING').length;
  const totalGap = items.reduce((s, i) => s + (i.gap || 0), 0);
  const hasGaps = items.some((i) => i.gap !== null && i.gap !== 0);

  const filtered = items.filter((i) =>
    search === '' || i.productName.toLowerCase().includes(search.toLowerCase()) || i.productRef.toLowerCase().includes(search.toLowerCase())
  );

  const updateCount = (id: string, value: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const count = value === '' ? null : parseInt(value, 10);
        return {
          ...item,
          physicalCount: count,
          gap: count !== null ? count - item.systemStock : null,
          status: count !== null ? 'COUNTED' as const : 'PENDING' as const,
        };
      })
    );
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventaire physique</h1>
          <p className="text-sm text-gray-500 mt-1">Comptage physique et réconciliation des stocks</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FF8C00] text-white font-semibold rounded-lg hover:bg-[#E67E00] transition-colors text-sm disabled:opacity-50"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
            Enregistrer l'inventaire
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Produits à compter</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{items.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Comptés</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{counted}/{items.length}</p>
          <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2">
            <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${(counted / items.length) * 100}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">Écarts détectés</p>
            {hasGaps && <AlertTriangle size={14} className="text-yellow-500" />}
          </div>
          <p className={cn('text-2xl font-bold mt-1', totalGap === 0 ? 'text-green-600' : 'text-red-600')}>
            {totalGap > 0 ? '+' : ''}{totalGap}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Validés</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{items.filter((i) => i.status === 'VALIDATED').length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none" />
        </div>
      </div>

      {/* Inventory table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Produit</th>
              <th className="text-right px-4 py-3">Stock système</th>
              <th className="text-right px-4 py-3">Comptage physique</th>
              <th className="text-right px-4 py-3">Écart</th>
              <th className="text-left px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((item) => (
              <tr key={item.id} className={cn('hover:bg-gray-50/50', item.gap !== null && item.gap !== 0 && 'bg-yellow-50/30')}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Package size={14} className="text-[#FF8C00]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-xs text-gray-500">{item.productRef}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">{item.systemStock.toLocaleString('fr-FR')}</td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    value={item.physicalCount ?? ''}
                    onChange={(e) => updateCount(item.id, e.target.value)}
                    placeholder="—"
                    className="w-28 text-right px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  {item.gap !== null ? (
                    <span className={cn('font-semibold', item.gap === 0 ? 'text-green-600' : 'text-red-600')}>
                      {item.gap > 0 ? '+' : ''}{item.gap}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {item.status === 'VALIDATED' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                      <CheckCircle size={12} /> Validé
                    </span>
                  )}
                  {item.status === 'COUNTED' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                      <ClipboardCheck size={12} /> Compté
                    </span>
                  )}
                  {item.status === 'PENDING' && (
                    <span className="text-xs text-gray-400">En attente</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Past inventories */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Historique des inventaires</h3>
        <div className="space-y-3">
          {PAST_INVENTORIES.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <ClipboardCheck size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Inventaire du {formatDateTime(inv.date)}</p>
                  <p className="text-xs text-gray-500">Par {inv.author} — {inv.countedProducts}/{inv.totalProducts} produits</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn('text-sm font-semibold', inv.totalGap === 0 ? 'text-green-600' : 'text-red-600')}>
                  Écart : {inv.totalGap > 0 ? '+' : ''}{inv.totalGap}
                </p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">Validé</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
