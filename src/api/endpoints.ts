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

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    apiClient.post('/auth/register', { name, email, password }),
};
