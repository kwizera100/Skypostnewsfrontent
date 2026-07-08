import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, TrendingUp, Eye } from 'lucide-react';
import { articlesApi } from '../api/endpoints';
import type { Article } from '../types';
import { getImageSrc, onImgError, fixContentImages, injectSponsoredAd } from '../utils/images';
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

  const updateMeta = useCallback((art: Article) => {
    document.title = `${art.title} | Sky Post News`;
    const setMetaProp = (prop: string, content: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
      el.content = content;
    };
    const setMetaName = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
      el.content = content;
    };
    const desc = art.excerpt || 'Read the full article on Sky Post News.';
    const rawImg = getImageSrc(art.imageUrl || art.thumbnailUrl);
    const img = rawImg.startsWith('http') ? rawImg : `${window.location.origin}${rawImg}`;
    const url = window.location.href;

    setMetaProp('og:title', art.title);
    setMetaProp('og:description', desc);
    setMetaProp('og:image', img);
    setMetaProp('og:url', url);
    setMetaProp('og:type', 'article');
    setMetaProp('og:site_name', 'Sky Post News');
    setMetaProp('og:locale', 'en_US');

    setMetaName('twitter:card', 'summary_large_image');
    setMetaName('twitter:title', art.title);
    setMetaName('twitter:description', desc);
    setMetaName('twitter:image', img);

    if (art.publishedAt) {
      setMetaProp('article:published_time', new Date(art.publishedAt).toISOString());
    }
    if (art.author?.name) {
      setMetaProp('article:author', art.author.name);
    }
    if (art.category?.name) {
      setMetaProp('article:section', art.category.name);
    }
  }, []);

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
        if (!articleRes.data || typeof articleRes.data !== 'object' || !('id' in articleRes.data)) {
          setError(true);
          return;
        }
        setArticle(articleRes.data);
        updateMeta(articleRes.data);
        setPopularArticles(Array.isArray(popularRes.data) ? popularRes.data : []);
        setMostReadArticles(Array.isArray(mostReadRes.data) ? mostReadRes.data : []);
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

  const badgeColor = CATEGORY_COLORS[article.category.slug] ?? 'bg-sky-600 text-white';

  const adHtml = `<div class="my-6 bg-gradient-to-r from-green-900 to-green-800 rounded-xl overflow-hidden shadow-md">
    <div class="px-4 py-2 bg-green-950/50 text-xs font-bold text-green-100 uppercase tracking-wider">Sponsored Ad</div>
    <a href="https://www.marchalestate.rw" target="_blank" rel="noopener noreferrer" class="block">
      <img src="/ads/marchal-real-estate-ad.jpg" alt="Marchal Real Estate - Build, Buy, Sell, Rent" class="w-full h-auto object-cover" onerror="this.style.display='none'" />
    </a>
  </div>`;

  const articleContent = injectSponsoredAd(fixContentImages(article.content), adHtml);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Article Content */}
      <article className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Back link */}
        <div className="px-6 pt-4">
          <Link
            to={`/category/${article.category.slug}`}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-sky-600 transition-colors"
          >
            <ArrowLeft size={14} />
            {article.category.name}
          </Link>
        </div>

        {/* Title */}
        <div className="px-6 pt-3 pb-3">
          <Link to={`/category/${article.category.slug}`}>
            <span className={`category-badge ${badgeColor} mb-3`}>
              {article.category.name}
            </span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-normal text-gray-900 leading-tight mt-2">
            {article.title}
          </h1>
        </div>

        {/* Featured image (responsive) */}
        <img
          src={getImageSrc(article.imageUrl || article.thumbnailUrl)}
          alt={article.title}
          onError={onImgError}
          className="w-full h-auto max-h-[260px] sm:max-h-[460px] object-cover"
        />

        {/* Author, date, time, Sky AI + lead */}
        <div className="px-6 pt-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-b border-gray-100 pb-3">
            <span className="flex items-center gap-1 font-medium text-gray-700">
              <User size={14} className="text-sky-600" />
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
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('skyai:open'))}
              className="flex items-center gap-1.5 font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 px-2 py-1 rounded-full transition-colors cursor-pointer"
              title="Ask Sky AI about this article"
            >
              <img
                src="/logo-bird.png"
                alt="Sky AI"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                className="h-4 w-auto object-contain"
              />
              Sky AI
            </button>
            {token && (
              <span className="flex items-center gap-1 font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                <Eye size={14} />
                {article.views || 0} views
              </span>
            )}
            <span className="ml-auto flex items-center gap-1.5">
              <button
                onClick={() => {
                  const u = encodeURIComponent(window.location.href);
                  window.open('https://www.facebook.com/sharer/sharer.php?u=' + u, '_blank', 'width=600,height=400');
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-90 transition-opacity"
                title="Share on Facebook"
                aria-label="Share on Facebook"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </button>
              <button
                onClick={() => {
                  const u = encodeURIComponent(window.location.href);
                  const t = encodeURIComponent(article.title);
                  window.open('https://twitter.com/intent/tweet?url=' + u + '&text=' + t, '_blank', 'width=600,height=400');
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-black text-white hover:opacity-90 transition-opacity"
                title="Share on X"
                aria-label="Share on X"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </button>
              <button
                onClick={() => {
                  const u = encodeURIComponent(window.location.href);
                  const t = encodeURIComponent(article.title);
                  window.open('https://wa.me/?text=' + t + '%20' + u, '_blank');
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-[#25D366] text-white hover:opacity-90 transition-opacity"
                title="Share on WhatsApp"
                aria-label="Share on WhatsApp"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </button>
              <button
                onClick={async () => {
                  const url = window.location.href;
                  try { await navigator.clipboard.writeText(url); } catch {
                    const ta = document.createElement('textarea'); ta.value = url; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                  }
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-600 text-white hover:opacity-90 transition-opacity"
                title="Copy link"
                aria-label="Copy link"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              </button>
            </span>
          </div>
          <p className="text-gray-700 text-base sm:text-lg mt-4 leading-relaxed italic font-bold">
            {article.excerpt}
          </p>
        </div>

        {/* Article body */}
        <div
          className="article-body px-6 py-6 max-w-none"
          dangerouslySetInnerHTML={{ __html: articleContent }}
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
                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-sky-600 transition-colors">
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
          <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-3">
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
                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-sky-600 transition-colors">
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
