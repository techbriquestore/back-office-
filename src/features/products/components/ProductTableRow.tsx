import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCFA } from '@/core/utils/formatters';
import type { ProductStatus } from '@/core/types';
import type { ProductWithStock } from '@/features/products/store/products.store';

const STATUS_COLORS: Record<ProductStatus, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: 'bg-green-100', text: 'text-green-700', label: 'Actif' },
  HIDDEN: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Masqué' },
  ARCHIVED: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Archivé' },
};

const STOCK_LEVEL_COLORS: Record<string, string> = {
  NORMAL: 'text-green-600',
  ALERT: 'text-yellow-600',
  CRITICAL: 'text-red-600',
};

interface Props {
  product: ProductWithStock;
}

export function ProductTableRow({ product }: Props) {
  const navigate = useNavigate();
  const st = STATUS_COLORS[product.status];

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50">
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
      <td className="px-4 py-3 text-sm text-gray-600">{product.category?.label ?? '—'}</td>
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
        {product.stock && (
          <span className={cn('text-sm font-semibold', STOCK_LEVEL_COLORS[product.stock.level])}>
            {product.stock.available.toLocaleString('fr-FR')}
            {product.stock.level === 'CRITICAL' && ' 🔴'}
            {product.stock.level === 'ALERT' && ' 🟡'}
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
          <button
            onClick={() => navigate(`/admin/products/${product.id}`)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
            title="Voir"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => navigate(`/admin/products/${product.id}/edit`)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
            title="Modifier"
          >
            <Edit size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
