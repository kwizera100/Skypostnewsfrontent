import apiClient from './client';
import type { Article, Category, PaginatedResponse } from '../types';

export const articlesApi = {
  getAll: (params?: { page?: number; pageSize?: number; categorySlug?: string }) =>
    apiClient.get<PaginatedResponse<Article>>('/articles', { params }),

  getByCategory: (categorySlug: string, page = 1, pageSize = 6) =>
    apiClient.get<PaginatedResponse<Article>>('/articles', { params: { categorySlug, page, pageSize } }),

  getBySlug: (slug: string) =>
    apiClient.get<Article>(`/articles/${slug}`),

  getLatest: (limit = 5) =>
    apiClient.get<Article[]>('/articles/latest', { params: { limit } }),

  create: (data: FormData) =>
    apiClient.post<Article>('/articles', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: number, data: FormData) =>
    apiClient.put<Article>(`/articles/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: number) =>
    apiClient.delete(`/articles/${id}`),
};

export const categoriesApi = {
  getAll: () =>
    apiClient.get<Category[]>('/categories'),

  getBySlug: (slug: string) =>
    apiClient.get<Category>(`/categories/${slug}`),

  create: (data: { name: string; slug: string; description?: string; color?: string }) =>
    apiClient.post<Category>('/categories', data),

  update: (id: number, data: { name: string; slug: string; description?: string; color?: string }) =>
    apiClient.put<Category>(`/categories/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/categories/${id}`),
};

export interface SiteSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export const settingsApi = {
  getPublic: () => apiClient.get<SiteSettings>('/settings/public'),
  get: () => apiClient.get<SiteSettings>('/settings'),
  update: (data: Partial<SiteSettings>) => apiClient.put<SiteSettings>('/settings', data),
};

export interface AdBanner {
  id: number;
  position: string;
  imageUrl: string;
  linkUrl: string | null;
  altText: string | null;
  width: number;
  height: number;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const adsApi = {
  getAll: () => apiClient.get<AdBanner[]>('/ads'),
  getAllAdmin: () => apiClient.get<AdBanner[]>('/ads/all'),
  getByPosition: (position: string) => apiClient.get<AdBanner>(`/ads/${position}`),
  update: (position: string, data: Partial<AdBanner>) => apiClient.put<AdBanner>(`/ads/${position}`, data),
  delete: (position: string) => apiClient.delete(`/ads/${position}`),
};

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    apiClient.post('/auth/register', { name, email, password }),
};
