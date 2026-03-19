import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, AlertCircle, Package, Tags } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductStatus } from '@/core/types';
import { useProductsStore } from '@/features/products/store/products.store';
import { useCategoriesStore } from './store/categories.store';
import { ProductsFilters } from './components/ProductsFilters';
import { ProductsTable } from './components/ProductsTable';
import { CategoriesManager } from './components/CategoriesManager';

type TabKey = 'products' | 'categories';

export default function ProductsListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('products');
  const { products, total, filters, loading, error, setFilters, fetchProducts, clearError } =
    useProductsStore();
  const { categories, fetchCategories, loading: categoriesLoading } = useCategoriesStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    }
  }, [fetchProducts, filters.categorySlug, filters.status, filters.page, activeTab]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catalogue</h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeTab === 'products' ? `${total} produit(s)` : `${categories.length} catégorie(s)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => activeTab === 'products' ? fetchProducts() : fetchCategories()}
            disabled={loading || categoriesLoading}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw size={16} className={(loading || categoriesLoading) ? 'animate-spin' : ''} />
          </button>
          {activeTab === 'products' && (
            <button
              onClick={() => navigate('/admin/products/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF8C00] text-white text-sm font-medium rounded-lg hover:bg-[#E67E00] transition-colors"
            >
              <Plus size={16} /> Nouveau produit
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('products')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'products'
              ? 'border-[#FF8C00] text-[#FF8C00]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
        >
          <Package size={16} />
          Produits
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'categories'
              ? 'border-[#FF8C00] text-[#FF8C00]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
        >
          <Tags size={16} />
          Catégories
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <>
          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
              <button onClick={clearError} className="ml-auto text-red-500 hover:text-red-700">×</button>
            </div>
          )}

          {/* Filters */}
          <ProductsFilters
            search={filters.search}
            categorySlug={filters.categorySlug}
            status={filters.status as ProductStatus | ''}
            categories={categories}
            categoriesLoading={categoriesLoading}
            onSearchChange={(value) => setFilters({ search: value })}
            onSearchSubmit={(e) => { e.preventDefault(); fetchProducts(); }}
            onCategoryChange={(categorySlug) => setFilters({ categorySlug, page: 1 })}
            onStatusChange={(status) => setFilters({ status, page: 1 })}
          />

          {/* Table */}
          <ProductsTable products={products} loading={loading} />
        </>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && <CategoriesManager />}
    </div>
  );
}
