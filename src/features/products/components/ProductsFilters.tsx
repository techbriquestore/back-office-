import { Search } from 'lucide-react';
import type { ProductStatus, Category } from '@/core/types';

interface Props {
  search: string;
  categorySlug: string;
  status: ProductStatus | '';
  categories: Category[];
  categoriesLoading: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onCategoryChange: (slug: string) => void;
  onStatusChange: (status: ProductStatus | '') => void;
}

export function ProductsFilters({
  search,
  categorySlug,
  status,
  categories,
  categoriesLoading,
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
        value={categorySlug}
        onChange={(e) => onCategoryChange(e.target.value)}
        disabled={categoriesLoading}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50"
      >
        <option value="">{categoriesLoading ? 'Chargement...' : 'Toutes catégories'}</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.slug}>{cat.label}</option>
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
