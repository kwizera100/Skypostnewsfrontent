// Shared TypeScript types for the IREMEE application

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color: string;
  _count?: { articles: number };
}

export interface Author {
  id: number;
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  readTime: number;
  publishedAt: string;
  category: Category;
  author: Author;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}
