import { useState } from 'react';
import { Search, Download, Plus, ArrowUpDown, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/core/utils/formatters';
import type { StockLevel } from '@/core/types';

interface StockRow {
  id: string;
  productName: string;
  productRef: string;
  realStock: number;
  reserved: number;
  available: number;
  alertThreshold: number;
  criticalThreshold: number;
  level: StockLevel;
  updatedAt: string;
}

const MOCK_STOCK: StockRow[] = [
  { id: '1', productName: 'Brique Pleine 20cm', productRef: 'BP-20', realStock: 9000, reserved: 500, available: 8500, alertThreshold: 1000, criticalThreshold: 200, level: 'NORMAL', updatedAt: '2026-03-05T09:00:00Z' },
  { id: '2', productName: 'Brique Pleine 15cm', productRef: 'BP-15', realStock: 3500, reserved: 300, available: 3200, alertThreshold: 500, criticalThreshold: 100, level: 'NORMAL', updatedAt: '2026-03-05T08:00:00Z' },
  { id: '3', productName: 'Brique Creuse 15cm', productRef: 'BC-15', realStock: 1800, reserved: 300, available: 1500, alertThreshold: 500, criticalThreshold: 100, level: 'NORMAL', updatedAt: '2026-03-04T14:00:00Z' },
  { id: '4', productName: 'Brique Creuse 20cm', productRef: 'BC-20', realStock: 120, reserved: 35, available: 85, alertThreshold: 200, criticalThreshold: 50, level: 'ALERT', updatedAt: '2026-03-05T07:00:00Z' },
  { id: '5', productName: 'Brique Réfractaire', productRef: 'BR-01', realStock: 20, reserved: 5, available: 15, alertThreshold: 50, criticalThreshold: 20, level: 'CRITICAL', updatedAt: '2026-03-05T06:00:00Z' },
  { id: '6', productName: 'Brique Décorative Rouge', productRef: 'BD-R1', realStock: 3000, reserved: 200, available: 2800, alertThreshold: 300, criticalThreshold: 50, level: 'NORMAL', updatedAt: '2026-03-04T10:00:00Z' },
  { id: '7', productName: 'Hourdis 16cm', productRef: 'HD-16', realStock: 4500, reserved: 300, available: 4200, alertThreshold: 500, criticalThreshold: 100, level: 'NORMAL', updatedAt: '2026-03-05T08:30:00Z' },
];

const LEVEL_CONFIG: Record<StockLevel, { bg: string; text: string; label: string; dot: string }> = {
  NORMAL: { bg: 'bg-green-50', text: 'text-green-700', label: 'Normal', dot: 'bg-green-500' },
  ALERT: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Alerte', dot: 'bg-yellow-500' },
  CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', label: 'Critique', dot: 'bg-red-500' },
};

type Tab = 'all' | 'ALERT' | 'CRITICAL';

export default function StockPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_STOCK.filter((s) => {
    if (activeTab === 'ALERT' && s.level !== 'ALERT') return false;
    if (activeTab === 'CRITICAL' && s.level !== 'CRITICAL') return false;
    if (search) {
      const q = search.toLowerCase();
      return s.productName.toLowerCase().includes(q) || s.productRef.toLowerCase().includes(q);
    }
    return true;
  });

  const alertCount = MOCK_STOCK.filter((s) => s.level === 'ALERT').length;
  const criticalCount = MOCK_STOCK.filter((s) => s.level === 'CRITICAL').length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des stocks</h1>
          <p className="text-sm text-gray-500 mt-1">
            {MOCK_STOCK.length} produit(s) — {alertCount} en alerte, {criticalCount} critique(s)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <History size={16} /> Historique
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <ArrowUpDown size={16} /> Ajustement
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF8C00] text-white text-sm font-medium rounded-lg hover:bg-[#E67E00]">
            <Plus size={16} /> Entrée de stock
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4">
        {([
          { key: 'all' as Tab, label: 'Tous' },
          { key: 'ALERT' as Tab, label: `Alerte (${alertCount})` },
          { key: 'CRITICAL' as Tab, label: `Critique (${criticalCount})` },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              activeTab === tab.key ? 'bg-[#FF8C00] text-white' : 'text-gray-600 hover:bg-gray-100',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C00] outline-none"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download size={16} /> Exporter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Produit</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Stock réel</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Réservé</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Disponible</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Seuil alerte</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Seuil critique</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Dernière MAJ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const cfg = LEVEL_CONFIG[row.level];
                return (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{row.productName}</p>
                      <p className="text-xs text-gray-400">{row.productRef}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{row.realStock.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-500">{row.reserved.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{row.available.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-500">{row.alertThreshold.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-500">{row.criticalThreshold.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', cfg.bg, cfg.text)}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(row.updatedAt)}</td>
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
