import { Link } from 'react-router-dom';
import { Phone, Mail } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon } from './SocialIcons';

const CATEGORIES = [
  { label: 'Home', to: '/' },
  { label: 'Entertainment', to: '/category/ents' },
  { label: 'Health', to: '/category/science' },
  { label: 'Knowledge', to: '/category/ubwenge' },
  { label: 'Others', to: '/category/ibindi' },
];

const SOCIAL = [
  { Icon: FacebookIcon, href: 'https://www.facebook.com/rwanda.lyvine', label: 'Facebook' },
  { Icon: InstagramIcon, href: 'https://instagram.com/lyvinerwanda', label: 'Instagram' },
  { Icon: TwitterIcon, href: 'https://twitter.com/rwanda_lyvine', label: 'Twitter' },
  { Icon: YoutubeIcon, href: 'https://youtube.com/@lyvinerwandatv1', label: 'YouTube' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: '#111111' }} className="text-gray-400 mt-6">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand column */}
          <div>
            <Link to="/" className="block mb-3">
              <h2
                className="font-black text-white leading-none hover:text-red-500 transition-colors"
                style={{ fontSize: '2.5rem', letterSpacing: '-1px' }}
              >
                IREMEE
              </h2>
              <p className="text-gray-500 text-xs tracking-widest uppercase mt-1">
                News · Knowledge · Health
              </p>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mt-3">
              Our goal is to provide accurate, unbiased news in a timely manner so that our readers can make informed decisions based on factual information.
            </p>
            {/* Social icons */}
            <div className="flex gap-2 mt-4">
              {SOCIAL.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="bg-gray-800 hover:bg-red-700 text-gray-400 hover:text-white
                             transition-colors p-2.5"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-xs mb-4
                           border-b border-gray-800 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {CATEGORIES.map(({ label, to }) => (
                <li key={to} className="flex items-center gap-2">
                  <span className="text-red-700 text-xs">◆</span>
                  <Link
                    to={to}
                    className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-xs mb-4
                           border-b border-gray-800 pb-2">
              Contact Us
            </h3>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-3">
                <span className="bg-red-700 p-1.5 text-white flex-shrink-0"><Phone size={12} /></span>
                <span>+250 788 668 737</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="bg-red-700 p-1.5 text-white flex-shrink-0"><Phone size={12} /></span>
                <span>+250 781 729 706</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="bg-red-700 p-1.5 text-white flex-shrink-0"><Mail size={12} /></span>
                <a href="mailto:info@iremee.com" className="hover:text-red-400 transition-colors">
                  info@iremee.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ backgroundColor: '#0a0a0a' }} className="border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-600">
            © {year} <span className="text-gray-500 font-semibold">IREMEE</span>. All rights reserved.
          </p>
          <p className="text-xs text-gray-700">
            Designed by <a href="https://umunsi.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline font-bold">UMUNSI SITE LTD</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

