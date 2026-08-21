import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { articlesApi } from '../api/endpoints';
import { getImageSrc, onImgError } from '../utils/images';
import { getLangFromPath, addLangPrefix } from '../i18n';
import type { Article } from '../types';

export default function BreakingNewsTicker() {
  const { pathname } = useLocation();
  const [articles, setArticles] = useState<Article[]>([]);

  const lang = getLangFromPath(pathname);

  useEffect(() => {
    articlesApi.getLatest(10)
      .then(res => setArticles(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, [lang]);

  if (articles.length === 0) return null;

  const items = [...articles, ...articles];

  return (
    <div className="hidden sm:block bg-white border-b border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-stretch h-12">
        <div className="flex-shrink-0 text-white text-xs font-black uppercase px-4 flex items-center whitespace-nowrap tracking-wider"
          style={{ backgroundColor: '#e05c1a' }}>
          🔴 Breaking
        </div>
        <div className="w-px bg-orange-200 flex-shrink-0" />
        <div className="flex-1 overflow-hidden relative ml-3 flex items-center">
          <div className="ticker-animate whitespace-nowrap inline-block">
            {items.map((a, i) => (
              <span key={i} className="inline-block mr-10 align-middle">
                <img
                  src={getImageSrc(a.thumbnailUrl || a.imageUrl)}
                  alt={a.title}
                  onError={onImgError}
                  className="inline-block w-8 h-8 object-cover rounded mr-2 align-middle flex-shrink-0"
                />
                <Link to={addLangPrefix(`/article/${a.slug}`, lang)}
                  className="text-sm text-gray-700 hover:text-orange-600 transition-colors font-medium align-middle">
                  {a.title}
                </Link>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

