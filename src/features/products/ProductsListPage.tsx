import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCFA } from '@/core/utils/formatters';
import { PRODUCT_CATEGORY_LABELS } from '@/core/types';
import type { Product, ProductCategory, ProductStatus } from '@/core/types';

const MOCK_PRODUCTS: Product[] = [
  { id: '1', reference: 'BP-20', name: 'Brique Pleine 20cm', category: 'BRIQUE_PLEINE', unitPrice: 350, bulkPrice: 300, bulkMinQuantity: 500, status: 'ACTIVE', usages: ['Murs porteurs'], images: [], description: 'Brique pleine standard 20cm', lengthCm: 40, widthCm: 20, heightCm: 20, weightKg: 12, createdAt: '2026-01-15', updatedAt: '2026-03-01' },
  { id: '2', reference: 'BP-15', name: 'Brique Pleine 15cm', category: 'BRIQUE_PLEINE', unitPrice: 280, bulkPrice: 240, bulkMinQuantity: 500, status: 'ACTIVE', usages: ['Murs porteurs'], images: [], lengthCm: 40, widthCm: 15, heightCm: 20, weightKg: 9, createdAt: '2026-01-15', updatedAt: '2026-03-01' },
  { id: '3', reference: 'BC-15', name: 'Brique Creuse 15cm', category: 'BRIQUE_CREUSE', unitPrice: 250, bulkPrice: 210, bulkMinQuantity: 500, status: 'ACTIVE', usages: ['Cloisons'], images: [], lengthCm: 40, widthCm: 15, heightCm: 20, weightKg: 7, createdAt: '2026-01-15', updatedAt: '2026-03-01' },
  { id: '4', reference: 'BC-20', name: 'Brique Creuse 20cm', category: 'BRIQUE_CREUSE', unitPrice: 320, status: 'ACTIVE', usages: ['Murs non porteurs'], images: [], lengthCm: 40, widthCm: 20, heightCm: 20, weightKg: 8, createdAt: '2026-01-15', updatedAt: '2026-03-01' },
  { id: '5', reference: 'BR-01', name: 'Brique Réfractaire', category: 'BRIQUE_REFRACTAIRE', unitPrice: 1200, status: 'ACTIVE', usages: ['Fours', 'Cheminées'], images: [], lengthCm: 23, widthCm: 11, heightCm: 6, weightKg: 3.5, createdAt: '2026-01-15', updatedAt: '2026-03-01' },
  { id: '6', reference: 'BD-R1', name: 'Brique Décorative Rouge', category: 'BRIQUE_DECORATIVE', unitPrice: 800, status: 'ACTIVE', usages: ['Parement'], images: [], lengthCm: 21, widthCm: 10, heightCm: 6, weightKg: 2, createdAt: '2026-01-15', updatedAt: '2026-03-01' },
  { id: '7', reference: 'HD-16', name: 'Hourdis 16cm', category: 'HOURDIS', unitPrice: 450, status: 'ACTIVE', usages: ['Planchers'], images: [], lengthCm: 60, widthCm: 20, heightCm: 16, weightKg: 15, createdAt: '2026-01-15', updatedAt: '2026-03-01' },
  { id: '8', reference: 'BD-G1', name: 'Brique Décorative Grise', category: 'BRIQUE_DECORATIVE', unitPrice: 750, status: 'HIDDEN', usages: ['Parement'], images: [], createdAt: '2026-02-01', updatedAt: '2026-03-01' },
];

const STOCK_MOCK: Record<string, { available: number; level: 'NORMAL' | 'ALERT' | 'CRITICAL' }> = {
  '1': { available: 8500, level: 'NORMAL' },
  '2': { available: 3200, level: 'NORMAL' },
  '3': { available: 1500, level: 'NORMAL' },
  '4': { available: 85, level: 'ALERT' },
  '5': { available: 15, level: 'CRITICAL' },
  '6': { available: 2800, level: 'NORMAL' },
  '7': { available: 4200, level: 'NORMAL' },
  '8': { available: 0, level: 'CRITICAL' },
};

const STATUS_COLORS: Record<ProductStatus, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: 'bg-green-100', text: 'text-green-700', label: 'Actif' },
  HIDDEN: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Masqué' },
  ARCHIVED: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Archivé' },
};

const STOCK_LEVEL_COLORS = {
  NORMAL: 'text-green-600',
  ALERT: 'text-yellow-600',
  CRITICAL: 'text-red-600',
};

export default function ProductsListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | ''>('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('');

  const filtered = MOCK_PRODUCTS.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.reference.toLowerCase().includes(q)) return false;
    }
    if (categoryFilter && p.category !== categoryFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catalogue</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} produit(s)</p>
        </div>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF8C00] text-white text-sm font-medium rounded-lg hover:bg-[#E67E00] transition-colors"
        >
          <Plus size={16} /> Nouveau produit
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou référence..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | '')}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">Toutes catégories</option>
          {Object.entries(PRODUCT_CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProductStatus | '')}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">Tous statuts</option>
          <option value="ACTIVE">Actif</option>
          <option value="HIDDEN">Masqué</option>
          <option value="ARCHIVED">Archivé</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Produit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Catégorie</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Dimensions</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Prix unit.</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Prix gros</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const stock = STOCK_MOCK[product.id];
                const st = STATUS_COLORS[product.status];
                return (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                          <Package size={18} className="text-[#FF8C00]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.reference}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{PRODUCT_CATEGORY_LABELS[product.category]}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {product.lengthCm && product.widthCm && product.heightCm
                        ? `${product.lengthCm}×${product.widthCm}×${product.heightCm} cm`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{formatCFA(product.unitPrice)}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {product.bulkPrice ? formatCFA(product.bulkPrice) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {stock && (
                        <span className={cn('text-sm font-semibold', STOCK_LEVEL_COLORS[stock.level])}>
                          {stock.available.toLocaleString('fr-FR')}
                          {stock.level === 'CRITICAL' && ' 🔴'}
                          {stock.level === 'ALERT' && ' 🟡'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('inline-flex px-2 py-0.5 rounded text-xs font-semibold', st.bg, st.text)}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => navigate(`/admin/products/${product.id}`)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Voir">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => navigate(`/admin/products/${product.id}/edit`)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Modifier">
                          <Edit size={16} />
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
