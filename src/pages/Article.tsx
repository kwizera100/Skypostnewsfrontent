import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, TrendingUp, Eye } from 'lucide-react';
import { articlesApi } from '../api/endpoints';
import type { Article } from '../types';
import { getImageSrc, onImgError, fixContentImages } from '../utils/images';
import { useAdminAuth } from '../admin/AdminAuth';

const CATEGORY_COLORS: Record<string, string> = {
  ents: 'bg-purple-600 text-white',
  science: 'bg-green-600 text-white',
  ubwenge: 'bg-blue-600 text-white',
  ibindi: 'bg-orange-600 text-white',
};

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { token } = useAdminAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);
  const [mostReadArticles, setMostReadArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    
    Promise.all([
      articlesApi.getBySlug(slug),
      articlesApi.getLatest(5),
      articlesApi.getLatest(5),
    ])
      .then(([articleRes, popularRes, mostReadRes]) => {
        setArticle(articleRes.data);
        setPopularArticles(popularRes.data);
        setMostReadArticles(mostReadRes.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-white rounded shadow-sm p-6 animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-8 bg-gray-200 rounded" />
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="w-full h-64 bg-gray-200 rounded" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="bg-white rounded shadow-sm p-10 text-center">
        <p className="text-xl font-bold text-gray-700">Article not found.</p>
        <p className="text-gray-500 mt-2">The article you requested is missing or has been removed.</p>
        <Link to="/" className="btn-read-more inline-block mt-4">
          ← Go Back
        </Link>
      </div>
    );
  }

  const badgeColor = CATEGORY_COLORS[article.category.slug] ?? 'bg-red-600 text-white';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Article Content */}
      <article className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Back link */}
        <div className="px-6 pt-4">
          <Link
            to={`/category/${article.category.slug}`}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <ArrowLeft size={14} />
            {article.category.name}
          </Link>
        </div>

        {/* Header */}
        <div className="px-6 pt-3 pb-4">
          <Link to={`/category/${article.category.slug}`}>
            <span className={`category-badge ${badgeColor} mb-3`}>
              {article.category.name}
            </span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mt-2">
            {article.title}
          </h1>
          <p className="text-gray-500 text-base mt-2 leading-relaxed italic">
            {article.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 border-t border-b border-gray-100 py-3">
            <span className="flex items-center gap-1 font-medium text-gray-700">
              <User size={14} className="text-red-600" />
              {article.author.name}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {article.readTime} min read
            </span>
            {token && (
              <span className="flex items-center gap-1 font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                <Eye size={14} />
                {article.views || 0} views
              </span>
            )}
          </div>
        </div>

        {/* Featured image */}
        <img
          src={getImageSrc(article.imageUrl || article.thumbnailUrl)}
          alt={article.title}
          onError={onImgError}
          className="w-full max-h-[500px] object-cover"
        />

        {/* Article body */}
        <div
          className="px-6 py-6 prose prose-lg max-w-none text-gray-800 leading-relaxed
            prose-headings:font-bold prose-headings:text-gray-900
            prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline
            prose-p:my-6 prose-p:leading-8 prose-p:text-base
            prose-img:my-8 prose-img:rounded-xl prose-img:shadow-lg
            prose-ul:my-6 prose-ol:my-6 prose-li:my-2
            prose-blockquote:my-6 prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:pl-4 prose-blockquote:italic"
          dangerouslySetInnerHTML={{ __html: fixContentImages(article.content) }}
        />
      </article>

      {/* Sidebar */}
      <aside className="space-y-6">
        {/* Popular Articles */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp size={16} />
              Popular Articles
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {popularArticles.slice(0, 5).map((popularArticle) => (
              <Link
                key={popularArticle.id}
                to={`/article/${popularArticle.slug}`}
                className="flex gap-3 group"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={getImageSrc(popularArticle.imageUrl || popularArticle.thumbnailUrl)}
                    alt={popularArticle.title}
                    onError={onImgError}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {popularArticle.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(popularArticle.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Most Read */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye size={16} />
              Most Read
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {mostReadArticles.slice(0, 5).map((mostReadArticle) => (
              <Link
                key={mostReadArticle.id}
                to={`/article/${mostReadArticle.slug}`}
                className="flex gap-3 group"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={getImageSrc(mostReadArticle.imageUrl || mostReadArticle.thumbnailUrl)}
                    alt={mostReadArticle.title}
                    onError={onImgError}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {mostReadArticle.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(mostReadArticle.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
