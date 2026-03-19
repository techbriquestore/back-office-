import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2, AlertCircle, Check, X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category } from '@/core/types';
import { useCategoriesStore } from '../store/categories.store';

interface CategoryFormData {
  label: string;
  slug: string;
  description: string;
  iconName: string;
  colorHex: string;
  bgColorHex: string;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY_FORM: CategoryFormData = {
  label: '',
  slug: '',
  description: '',
  iconName: '',
  colorHex: '#FF8C00',
  bgColorHex: '#FFF3E6',
  isActive: true,
  sortOrder: 0,
};

export function CategoriesManager() {
  const {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError,
  } = useCategoriesStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm({ ...EMPTY_FORM, sortOrder: categories.length });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setForm({
      label: cat.label,
      slug: cat.slug,
      description: cat.description ?? '',
      iconName: cat.iconName ?? '',
      colorHex: cat.colorHex ?? '#FF8C00',
      bgColorHex: cat.bgColorHex ?? '#FFF3E6',
      isActive: cat.isActive,
      sortOrder: cat.sortOrder,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim() || !form.slug.trim()) return;

    setSaving(true);
    try {
      const payload = {
        label: form.label.trim(),
        slug: form.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: form.description.trim() || undefined,
        iconName: form.iconName.trim() || undefined,
        colorHex: form.colorHex,
        bgColorHex: form.bgColorHex,
        isActive: form.isActive,
        sortOrder: form.sortOrder,
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
      } else {
        await createCategory(payload);
      }
      closeModal();
    } catch {
      // Error handled by store
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      setDeleteConfirm(null);
    } catch {
      // Error handled by store
    }
  };

  const generateSlug = (label: string) => {
    return label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const updateField = <K extends keyof CategoryFormData>(field: K, value: CategoryFormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'label' && !editingCategory) {
      setForm((prev) => ({ ...prev, slug: generateSlug(value as string) }));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{categories.length} catégorie(s)</p>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF8C00] text-white text-sm font-medium rounded-lg hover:bg-[#E67E00] transition-colors"
        >
          <Plus size={16} /> Nouvelle catégorie
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
          <button onClick={clearError} className="ml-auto text-red-500 hover:text-red-700">×</button>
        </div>
      )}

      {/* Loading */}
      {loading && categories.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-[#FF8C00]" />
        </div>
      )}

      {/* Categories List */}
      {categories.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="w-10"></th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Catégorie</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Slug</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Couleur</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Produits</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-2 py-3 text-gray-400">
                    <GripVertical size={16} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{
                          backgroundColor: cat.bgColorHex ?? '#FFF3E6',
                          color: cat.colorHex ?? '#FF8C00',
                        }}
                      >
                        {cat.label.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{cat.label}</p>
                        {cat.description && (
                          <p className="text-xs text-gray-400 truncate max-w-[200px]">{cat.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{cat.slug}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span
                        className="w-5 h-5 rounded border border-gray-200"
                        style={{ backgroundColor: cat.colorHex ?? '#FF8C00' }}
                        title={`Couleur: ${cat.colorHex}`}
                      />
                      <span
                        className="w-5 h-5 rounded border border-gray-200"
                        style={{ backgroundColor: cat.bgColorHex ?? '#FFF3E6' }}
                        title={`Fond: ${cat.bgColorHex}`}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {cat.productCount ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        'inline-flex px-2 py-0.5 rounded text-xs font-semibold',
                        cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {cat.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {deleteConfirm === cat.id ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                          title="Confirmer"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                          title="Annuler"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(cat.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && categories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500 mb-4">Aucune catégorie créée</p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF8C00] text-white text-sm font-medium rounded-lg hover:bg-[#E67E00]"
          >
            <Plus size={16} /> Créer une catégorie
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => updateField('label', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C00] outline-none"
                  placeholder="Ex: Briques pleines"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#FF8C00] outline-none"
                  placeholder="briques-pleines"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C00] outline-none resize-none"
                  placeholder="Description de la catégorie..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.colorHex}
                      onChange={(e) => updateField('colorHex', e.target.value)}
                      className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={form.colorHex}
                      onChange={(e) => updateField('colorHex', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#FF8C00] outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Couleur fond</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.bgColorHex}
                      onChange={(e) => updateField('bgColorHex', e.target.value)}
                      className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={form.bgColorHex}
                      onChange={(e) => updateField('bgColorHex', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#FF8C00] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'icône</label>
                <input
                  type="text"
                  value={form.iconName}
                  onChange={(e) => updateField('iconName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C00] outline-none"
                  placeholder="Ex: brick, cube, box..."
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => updateField('isActive', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-[#FF8C00] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF8C00]"></div>
                </label>
                <span className="text-sm text-gray-700">Catégorie active</span>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.label.trim() || !form.slug.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#FF8C00] text-white text-sm font-medium rounded-lg hover:bg-[#E67E00] disabled:opacity-50"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {editingCategory ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
