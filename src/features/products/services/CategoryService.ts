import api from '../../../core/api';
import type { Category } from '../../../core/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateCategoryPayload {
  slug: string;
  label: string;
  description?: string;
  iconName?: string;
  colorHex?: string;
  bgColorHex?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> {}

// ─── API Calls ────────────────────────────────────────────────────────────────

export const getCategories = (activeOnly = false): Promise<Category[]> =>
  api
    .get<Category[]>('/categories', { params: { activeOnly: String(activeOnly) } })
    .then((res) => res.data);

export const getCategoryById = (id: string): Promise<Category> =>
  api.get<Category>(`/categories/${id}`).then((res) => res.data);

export const getCategoryBySlug = (slug: string): Promise<Category> =>
  api.get<Category>(`/categories/slug/${slug}`).then((res) => res.data);

export const createCategory = (payload: CreateCategoryPayload): Promise<Category> =>
  api.post<Category>('/categories', payload).then((res) => res.data);

export const updateCategory = (id: string, payload: UpdateCategoryPayload): Promise<Category> =>
  api.put<Category>(`/categories/${id}`, payload).then((res) => res.data);

export const toggleCategoryActive = (id: string): Promise<Category> =>
  api.patch<Category>(`/categories/${id}/toggle-active`).then((res) => res.data);

export const deleteCategory = (id: string): Promise<void> =>
  api.delete(`/categories/${id}`).then(() => undefined);

// Service Object 

const CategoryService = {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  toggleCategoryActive,
  deleteCategory,
};

export default CategoryService;
