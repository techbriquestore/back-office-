import { create } from 'zustand';
import type { Category } from '../../../core/types';
import CategoryService, {
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
} from '../services/CategoryService';

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchCategories: (activeOnly?: boolean) => Promise<void>;
  createCategory: (payload: CreateCategoryPayload) => Promise<Category | null>;
  updateCategory: (id: string, payload: UpdateCategoryPayload) => Promise<Category | null>;
  toggleActive: (id: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async (activeOnly = false) => {
    set({ loading: true, error: null });
    try {
      const categories = await CategoryService.getCategories(activeOnly);
      set({ categories, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des catégories';
      set({ error: message, loading: false });
    }
  },

  createCategory: async (payload) => {
    set({ loading: true, error: null });
    try {
      const category = await CategoryService.createCategory(payload);
      set((state) => ({
        categories: [...state.categories, category].sort((a, b) => a.sortOrder - b.sortOrder),
        loading: false,
      }));
      return category;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création';
      set({ error: message, loading: false });
      return null;
    }
  },

  updateCategory: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const updated = await CategoryService.updateCategory(id, payload);
      set((state) => ({
        categories: state.categories
          .map((c) => (c.id === id ? updated : c))
          .sort((a, b) => a.sortOrder - b.sortOrder),
        loading: false,
      }));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      set({ error: message, loading: false });
      return null;
    }
  },

  toggleActive: async (id) => {
    set({ loading: true, error: null });
    try {
      const updated = await CategoryService.toggleCategoryActive(id);
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? updated : c)),
        loading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      set({ error: message, loading: false });
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      await CategoryService.deleteCategory(id);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        loading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      set({ error: message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
