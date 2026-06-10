import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articlesApi, categoriesApi } from '../api/endpoints';
import type { Article, Category } from '../types';
import { getImageSrc, onImgError } from '../utils/images';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function SectionHeading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-0 mb-4">
      <span className="w-1 h-6 bg-orange-500 block mr-3" />
      <h2 className="font-black text-base uppercase tracking-widest text-gray-900">{label}</h2>
      <span className="flex-1 h-px bg-gray-200 ml-4" />
    </div>
  );
}

function ListCard({ article }: { article: Article }) {
  const img = getImageSrc(article.thumbnailUrl || article.imageUrl);
  return (
    <Link to={`/article/${article.slug}`}
      className="flex gap-3 group py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-1 transition-colors">
      <img src={img} alt={article.title} onError={onImgError} className="w-24 h-16 object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
          {article.title}
        </p>
        <p className="text-xs text-gray-400 mt-1">{formatDate(article.publishedAt)}</p>
      </div>
    </Link>
  );
}

function GridCard({ article }: { article: Article }) {
  const img = getImageSrc(article.thumbnailUrl || article.imageUrl);
  return (
    <Link to={`/article/${article.slug}`} className="group block">
      <div className="overflow-hidden bg-gray-200 aspect-[4/3]">
        <img src={img} alt={article.title} onError={onImgError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <p className="mt-2 text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
        {article.title}
      </p>
      <p className="text-xs text-gray-400 mt-1">{formatDate(article.publishedAt)}</p>
    </Link>
  );
}

function FeaturedCard({ article }: { article: Article }) {
  const img = getImageSrc(article.thumbnailUrl || article.imageUrl);
  return (
    <Link to={`/article/${article.slug}`} className="group block relative overflow-hidden bg-gray-900" style={{ aspectRatio: '16/10' }}>
      <img src={img} alt={article.title} onError={onImgError}
          className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      {article.category && (
        <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold uppercase tracking-wide px-2.5 py-0.5">
          {article.category.name}
        </span>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white font-black text-lg leading-snug line-clamp-3 group-hover:text-orange-200 transition-colors">
          {article.title}
        </p>
        <p className="text-gray-300 text-xs mt-1.5">{formatDate(article.publishedAt)}</p>
      </div>
    </Link>
  );
}

function SkeletonGrid() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 aspect-[4/3]" />
      <div className="mt-2 h-3 bg-gray-200 rounded w-full" />
      <div className="mt-1 h-3 bg-gray-200 rounded w-3/4" />
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 animate-pulse">
      <div className="w-24 h-16 bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [catArticles, setCatArticles] = useState<Record<string, Article[]>>({});
  const [topCats, setTopCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    articlesApi.getLatest(30)
      .then(res => setArticles(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));

    categoriesApi.getAll().then(res => {
      const cats: Category[] = res.data;
      const top = cats
        .filter(c => ((c as any)._count?.articles ?? 0) > 0)
        .sort((a, b) => ((b as any)._count?.articles ?? 0) - ((a as any)._count?.articles ?? 0))
        .slice(0, 4);
      setTopCats(top);
      top.forEach(cat => {
        articlesApi.getByCategory(cat.slug, 1, 5)
          .then(r => setCatArticles(prev => ({ ...prev, [cat.slug]: r.data.data ?? r.data })))
          .catch(() => {});
      });
    }).catch(() => {});
  }, []);

  const featured  = articles[0];
  const topLeft   = articles.slice(1, 3);
  const topRight  = articles.slice(3, 5);
  const listItems = articles.slice(5, 17);
  const moreItems = articles.slice(17);

  return (
    <div className="space-y-6">
      {/* ── LATEST NEWS ── */}
      <div className="bg-white border-y sm:border border-gray-200 p-3 sm:p-4">
        <SectionHeading label="Latest News" />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-1 flex flex-col gap-4">
            {loading
              ? [0, 1].map(i => <SkeletonGrid key={i} />)
              : topLeft.map(a => <GridCard key={a.id} article={a} />)
            }
          </div>

          <div className="md:col-span-3">
            {loading
              ? <div className="bg-gray-200 animate-pulse" style={{ aspectRatio: '16/10' }} />
              : featured && <FeaturedCard article={featured} />
            }
          </div>

          <div className="md:col-span-1 flex flex-col gap-4">
            {loading
              ? [0, 1].map(i => <SkeletonGrid key={i} />)
              : topRight.map(a => <GridCard key={a.id} article={a} />)
            }
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonList key={i} />)
            : listItems.map(a => <ListCard key={a.id} article={a} />)
          }
        </div>
      </div>

      {/* ── PER-CATEGORY SECTIONS ── */}
      {topCats.map(cat => {
        const items = catArticles[cat.slug] ?? [];
        const main = items[0];
        const rest = items.slice(1);
        return (
          <div key={cat.id} className="bg-white border-y sm:border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="w-1 h-6 bg-orange-500 block mr-3" />
                <h2 className="font-black text-base uppercase tracking-widest text-gray-900">{cat.name}</h2>
              </div>
              <Link to={`/category/${cat.slug}`}
                className="text-xs font-semibold text-orange-500 hover:text-orange-700 uppercase tracking-wide border border-orange-300 hover:border-orange-500 px-3 py-1 transition-colors">
                View All →
              </Link>
            </div>
            {items.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map(i => <SkeletonGrid key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {main && (
                  <div className="md:col-span-5">
                    <FeaturedCard article={main} />
                  </div>
                )}
                <div className="md:col-span-7">
                  {rest.map(a => <ListCard key={a.id} article={a} />)}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* ── MORE NEWS ── */}
      {moreItems.length > 0 && (
        <div className="bg-white border-y sm:border border-gray-200 p-3 sm:p-4">
          <SectionHeading label="More News" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {moreItems.map(a => <GridCard key={a.id} article={a} />)}
          </div>
        </div>
      )}

      {!loading && articles.length === 0 && (
        <div className="text-center py-16 bg-white border border-gray-200 text-gray-500">
          <p className="text-lg font-semibold">No articles found.</p>
        </div>
      )}
    </div>
  );
}
