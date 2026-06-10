import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { articlesApi, categoriesApi } from '../api/endpoints';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import type { Article, Category, PaginatedResponse } from '../types';

const PAGE_SIZE = 8;

const CATEGORY_COLORS: Record<string, string> = {
  ents: 'bg-purple-600',
  science: 'bg-green-600',
  ubwenge: 'bg-blue-600',
  ibindi: 'bg-orange-600',
};

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PaginatedResponse<Article> | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1);
    if (slug) {
      categoriesApi.getBySlug(slug).then((res) => setCategory(res.data)).catch(() => {});
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    articlesApi
      .getAll({ page, pageSize: PAGE_SIZE, categorySlug: slug })
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, page]);

  const headerColor = CATEGORY_COLORS[slug ?? ''] ?? 'bg-red-600';

  return (
    <div>
      {/* Category header */}
      <div className={`${headerColor} text-white rounded p-4 mb-5 flex items-center gap-3`}>
        <span className="block w-1 h-8 bg-white/50 rounded" />
        <div>
          <h1 className="text-xl font-bold uppercase tracking-widest">
            {category?.name ?? slug?.toUpperCase()}
          </h1>
          {category?.description && (
            <p className="text-sm text-white/80 mt-0.5">{category.description}</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded shadow-sm overflow-hidden">
              <div className="w-full h-48 bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                <div className="h-5 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {data.data.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={data.pagination.totalPages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <div className="text-center py-16 text-gray-500 bg-white rounded shadow-sm">
          <p className="text-lg font-semibold">No articles found in this category.</p>
        </div>
      )}
    </div>
  );
}
