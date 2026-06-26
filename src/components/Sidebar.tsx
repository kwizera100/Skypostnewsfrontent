import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Info, List } from 'lucide-react';
import { articlesApi, categoriesApi } from '../api/endpoints';
import ArticleCard from './ArticleCard';
import type { Article, Category } from '../types';

export default function Sidebar() {
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    articlesApi.getLatest(5).then((res) => setLatestArticles(res.data)).catch(() => {});
    categoriesApi.getAll().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  return (
    <aside className="w-full">
      {/* ── Other Posts ──────────────────────────────────────── */}
      <div className="sidebar-widget">
        <div className="sidebar-widget-header flex items-center gap-2">
          <List size={13} />
          <span>Latest News</span>
        </div>
        <div className="sidebar-widget-body divide-y divide-gray-100 p-0">
          {latestArticles.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-3">
                  <div className="w-20 h-14 bg-gray-200 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                  </div>
                </div>
              ))
            : latestArticles.map((a) => (
                <div key={a.id} className="px-3">
                  <ArticleCard article={a} variant="compact" />
                </div>
              ))}
        </div>
      </div>

      {/* ── Categories ───────────────────────────────────────── */}
      <div className="sidebar-widget">
        <div className="sidebar-widget-header flex items-center gap-2">
          <List size={13} />
          <span>Categories</span>
        </div>
        <div className="sidebar-widget-body p-0">
          {categories.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 animate-pulse mb-px" />
              ))
            : categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 last:border-0
                             hover:bg-sky-700 hover:text-white transition-colors group"
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-700 group-hover:text-white">
                    {cat.name}
                  </span>
                  {cat._count && (
                    <span className="bg-gray-100 group-hover:bg-sky-600 text-gray-600 group-hover:text-white
                                     text-xs font-bold px-2 py-0.5 transition-colors">
                      {cat._count.articles}
                    </span>
                  )}
                </Link>
              ))}
        </div>
      </div>

      {/* ── Contact Us ───────────────────────────────────────── */}
      <div className="sidebar-widget">
        <div className="sidebar-widget-header flex items-center gap-2">
          <Phone size={13} />
          <span>Contact Us</span>
        </div>
        <div className="sidebar-widget-body text-sm text-gray-700 space-y-2.5">
          <p className="flex items-center gap-2 font-bold text-gray-900">
            <span className="bg-sky-700 text-white p-1"><Phone size={12} /></span>
            +250 781 729 706
          </p>
          <p className="flex items-center gap-2 font-bold text-gray-900">
            <span className="bg-sky-700 text-white p-1"><Phone size={12} /></span>
            +250 788 668 737
          </p>
          <a
            href="mailto:info@skypostnews.com"
            className="block text-sky-700 hover:underline text-xs border-t border-gray-100 pt-2 mt-2"
          >
            info@skypostnews.com
          </a>
        </div>
      </div>

      {/* ── About Us ─────────────────────────────────────────── */}
      <div className="sidebar-widget">
        <div className="sidebar-widget-header flex items-center gap-2">
          <Info size={13} />
          <span>About Us</span>
        </div>
        <div className="sidebar-widget-body text-sm text-gray-600 leading-relaxed">
          <p>
            Sky Post News is Rwanda&rsquo;s premier digital-first multimedia news network,
            operated under IREMEE LTD in Nyarugenge, Kigali. Guided by our philosophy
            <em> &ldquo;Your Voice, Your News,&rdquo;</em> we deliver trusted journalism and
            dynamic multimedia storytelling.
          </p>
          <Link to="/about" className="inline-block mt-2 text-sky-700 hover:underline font-semibold text-xs uppercase tracking-wide">
            Read more &rarr;
          </Link>
        </div>
      </div>
    </aside>
  );
}

