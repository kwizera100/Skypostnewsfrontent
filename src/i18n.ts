import { createContext, useContext } from 'react';

export type Language = 'en' | 'fr' | 'rw';

export const LanguageContext = createContext<Language>('en');

export function useLanguage(): Language {
  return useContext(LanguageContext);
}

export function getLangFromPath(path: string): Language {
  if (path === '/fr' || path.startsWith('/fr/')) return 'fr';
  if (path === '/rw' || path.startsWith('/rw/')) return 'rw';
  return 'en';
}

export function stripLangPrefix(path: string): string {
  if (path === '/fr' || path === '/rw') return '/';
  if (path.startsWith('/fr/')) return path.slice(3);
  if (path.startsWith('/rw/')) return path.slice(3);
  return path;
}

export function addLangPrefix(path: string, lang: Language): string {
  if (lang === 'en') return path;
  if (path === '/') return `/${lang}`;
  return `/${lang}${path}`;
}
