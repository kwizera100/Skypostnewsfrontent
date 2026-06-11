import { Link } from 'react-router-dom';
import { Calendar, Clock, User } from 'lucide-react';
import type { Article } from '../types';
import { getImageSrc, onImgError } from '../utils/images';

const CATEGORY_COLORS: Record<string, string> = {
  ents: 'bg-purple-600 text-white',
  science: 'bg-green-600 text-white',
  ubwenge: 'bg-blue-600 text-white',
  ibindi: 'bg-orange-600 text-white',
};

interface Props {
  article: Article;
  variant?: 'default' | 'horizontal' | 'compact' | 'featured';
}

export default function ArticleCard({ article, variant = 'default' }: Props) {
  const badgeColor = CATEGORY_COLORS[article.category.slug] ?? 'bg-sky-700 text-white';
  const thumb = getImageSrc(article.thumbnailUrl || article.imageUrl);

  // ── Compact (sidebar list item) ──────────────────────────────────────────
  if (variant === 'compact') {
    return (
      <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
        <div className="relative flex-shrink-0 w-20 h-16 overflow-hidden">
          <img
            src={thumb}
            alt={article.title}
            onError={onImgError}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <Link
            to={`/article/${article.slug}`}
            className="block text-sm font-bold text-gray-800 hover:text-sky-700 line-clamp-2 leading-snug mb-1"
          >
            {article.title}
          </Link>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar size={10} />
            {new Date(article.publishedAt).toLocaleDateString('en-US', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </p>
        </div>
      </div>
    );
  }

  // ── Horizontal ───────────────────────────────────────────────────────────
  if (variant === 'horizontal') {
    return (
      <div className="flex gap-3 bg-white p-3 hover:shadow-md transition-shadow">
        <div className="relative flex-shrink-0 w-28 h-20 overflow-hidden">
          <img
            src={thumb}
            alt={article.title}
            onError={onImgError}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          />
          <Link
            to={`/category/${article.category.slug}`}
            className={`absolute bottom-1 left-1 category-badge text-xs ${badgeColor}`}
            style={{ fontSize: '9px', padding: '1px 5px' }}
          >
            {article.category.name}
          </Link>
        </div>
        <div className="flex-1 min-w-0">
          <Link
            to={`/article/${article.slug}`}
            className="block font-bold text-gray-900 hover:text-sky-700 line-clamp-2 text-sm leading-snug mb-1"
          >
            {article.title}
          </Link>
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <span className="flex items-center gap-1"><Calendar size={10} />
              {new Date(article.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
            </span>
            <span className="flex items-center gap-1"><Clock size={10} />{article.readTime} min</span>
          </p>
        </div>
      </div>
    );
  }

  // ── Featured (large hero) ─────────────────────────────────────────────────
  if (variant === 'featured') {
    return (
      <article className="featusky-card">
        <div className="relative overflow-hidden">
          <Link to={`/article/${article.slug}`}>
            <img
              src={thumb}
              alt={article.title}
              onError={onImgError}
              className="featusky-img w-full"
              style={{ height: '360px', objectFit: 'cover' }}
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </Link>
          {/* Category badge overlaid */}
          <Link
            to={`/category/${article.category.slug}`}
            className={`absolute top-4 left-4 category-badge ${badgeColor} shadow-md`}
          >
            {article.category.name}
          </Link>
          {/* Title overlaid at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <Link to={`/article/${article.slug}`}>
              <h2 className="text-white text-xl sm:text-2xl font-black leading-snug hover:text-sky-300 transition-colors line-clamp-3">
                {article.title}
              </h2>
            </Link>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-300">
              <span className="flex items-center gap-1"><User size={11} />{article.author.name}</span>
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {new Date(article.publishedAt).toLocaleDateString('en-US', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1"><Clock size={11} />{article.readTime} min</span>
            </div>
          </div>
        </div>
        {article.excerpt && (
          <div className="p-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{article.excerpt}</p>
            <Link to={`/article/${article.slug}`} className="btn-read-more">
            Read More →
          </Link>
          </div>
        )}
      </article>
    );
  }

  // ── Default card ──────────────────────────────────────────────────────────
  return (
    <article className="bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      <div className="relative overflow-hidden">
        <Link to={`/article/${article.slug}`}>
          <img
            src={thumb}
            alt={article.title}
            onError={onImgError}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-400"
          />
        </Link>
        {/* Category badge overlay */}
        <Link
          to={`/category/${article.category.slug}`}
          className={`absolute top-3 left-3 category-badge ${badgeColor} shadow`}
        >
          {article.category.name}
        </Link>
        {/* Read time badge */}
        <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 flex items-center gap-1">
          <Clock size={10} />
          {article.readTime} min
        </span>
      </div>

      <div className="p-4">
        <Link
          to={`/article/${article.slug}`}
          className="block text-base font-bold text-gray-900 hover:text-sky-700 transition-colors line-clamp-2 leading-snug mb-2"
        >
          {article.title}
        </Link>

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2 border-b border-gray-100 pb-2">
          <span className="flex items-center gap-1">
            <User size={11} />
            {article.author.name}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {new Date(article.publishedAt).toLocaleDateString('en-US', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </span>
        </div>

        {article.excerpt && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-1">
            {article.excerpt}
          </p>
        )}

        <Link to={`/article/${article.slug}`} className="btn-read-more">
          Read More →
        </Link>
      </div>
    </article>
  );
}


