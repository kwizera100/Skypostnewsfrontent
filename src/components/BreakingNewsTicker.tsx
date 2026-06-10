import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articlesApi } from '../api/endpoints';
import type { Article } from '../types';

export default function BreakingNewsTicker() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    articlesApi.getLatest(10)
      .then(res => setArticles(res.data))
      .catch(() => {});
  }, []);

  if (articles.length === 0) return null;

  const items = [...articles, ...articles];

  return (
    <div className="bg-white border-b border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-stretch h-9">
        <div className="flex-shrink-0 text-white text-xs font-black uppercase px-4 flex items-center whitespace-nowrap tracking-wider"
          style={{ backgroundColor: '#e05c1a' }}>
          🔴 Breaking
        </div>
        <div className="w-px bg-orange-200 flex-shrink-0" />
        <div className="flex-1 overflow-hidden relative ml-3 flex items-center">
          <div className="ticker-animate whitespace-nowrap inline-block">
            {items.map((a, i) => (
              <span key={i} className="inline-block mr-10">
                <span className="text-orange-500 mr-1.5 font-bold">◆</span>
                <Link to={`/article/${a.slug}`}
                  className="text-sm text-gray-700 hover:text-orange-600 transition-colors font-medium">
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

