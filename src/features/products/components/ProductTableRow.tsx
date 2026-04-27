import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Package, Trash2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCFA } from '@/core/utils/formatters';
import type { ProductStatus } from '@/core/types';
import type { ProductWithStock } from '@/features/products/store/products.store';

const STATUS_COLORS: Record<ProductStatus, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: 'bg-green-100', text: 'text-green-700', label: 'Actif' },
  HIDDEN: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Masqué' },
  ARCHIVED: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Archivé' },
};


interface Props {
  product: ProductWithStock;
  onDelete: (id: string) => Promise<void>;
  isTrash?: boolean;
  onRestore?: (id: string) => Promise<void>;
}

export function ProductTableRow({ product, onDelete, isTrash, onRestore }: Props) {
  const navigate = useNavigate();
  const st = STATUS_COLORS[product.status];
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {(() => {
            const primaryImg = product.images?.find((img) => img.isPrimary) || product.images?.[0];
            return primaryImg?.url ? (
              <img
                src={primaryImg.url}
                alt={product.name}
                className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }}
              />
            ) : null;
          })()}
          <div className={`w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center ${product.images?.length ? 'hidden' : ''}`}>
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
        <span className={cn('inline-flex px-2 py-0.5 rounded text-xs font-semibold', st.bg, st.text)}>
          {st.label}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1">
          {isTrash ? (
            <>
              <button
                onClick={async () => {
                  if (!onRestore) return;
                  setActionLoading(true);
                  try { await onRestore(product.id); } finally { setActionLoading(false); }
                }}
                disabled={actionLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 disabled:opacity-50"
                title="Restaurer"
              >
                <RotateCcw size={14} />
                {actionLoading ? 'Restauration...' : 'Restaurer'}
              </button>
            </>
          ) : (
            <>
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
              <button
                onClick={() => setShowConfirm(true)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                title="Supprimer"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>

        {/* Modal de confirmation */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowConfirm(false)}>
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mettre ce produit dans la corbeille ?</h3>
              <p className="text-sm text-gray-500 mb-1">
                <span className="font-medium text-gray-700">{product.name}</span>
              </p>
              <p className="text-sm text-gray-500 mb-5">
                Le produit sera déplacé dans la corbeille. Vous pourrez le restaurer ultérieurement.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  disabled={actionLoading}
                >
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    setActionLoading(true);
                    await onDelete(product.id);
                    setActionLoading(false);
                    setShowConfirm(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}
