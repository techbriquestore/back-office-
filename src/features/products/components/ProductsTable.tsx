import { Loader2 } from 'lucide-react';
import type { ProductWithStock } from '@/features/products/store/products.store';
import { ProductTableRow } from './ProductTableRow';

interface Props {
  products: ProductWithStock[];
  loading: boolean;
}

export function ProductsTable({ products, loading }: Props) {
  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={32} className="animate-spin text-[#FF8C00]" />
      </div>
    );
  }

  return (
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
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Aucun produit trouvé
                </td>
              </tr>
            ) : (
              products.map((product) => <ProductTableRow key={product.id} product={product} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
