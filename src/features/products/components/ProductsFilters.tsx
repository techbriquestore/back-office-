import { Search } from 'lucide-react';
import { PRODUCT_CATEGORY_LABELS } from '@/core/types';
import type { ProductCategory, ProductStatus } from '@/core/types';

interface Props {
  search: string;
  category: ProductCategory | '';
  status: ProductStatus | '';
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onCategoryChange: (category: ProductCategory | '') => void;
  onStatusChange: (status: ProductStatus | '') => void;
}

export function ProductsFilters({
  search,
  category,
  status,
  onSearchChange,
  onSearchSubmit,
  onCategoryChange,
  onStatusChange,
}: Props) {
  return (
    <form onSubmit={onSearchSubmit} className="flex flex-wrap items-center gap-3 mb-4">
      <div className="relative flex-1 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher par nom ou référence..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none"
        />
      </div>
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value as ProductCategory | '')}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
      >
        <option value="">Toutes catégories</option>
        {Object.entries(PRODUCT_CATEGORY_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as ProductStatus | '')}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
      >
        <option value="">Tous statuts</option>
        <option value="ACTIVE">Actif</option>
        <option value="HIDDEN">Masqué</option>
        <option value="ARCHIVED">Archivé</option>
      </select>
    </form>
  );
}
