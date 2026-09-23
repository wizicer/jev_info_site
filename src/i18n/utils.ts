import { DEFAULT_LOCALE, LOCALES, ui, type Locale, type UIStrings } from './ui';

export function getLocaleFromUrl(url: URL | string): Locale {
  const pathname = typeof url === 'string' ? url : url.pathname;
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0] as Locale | undefined;
  if (first && LOCALES.includes(first) && first !== DEFAULT_LOCALE) {
    return first;
  }
  return DEFAULT_LOCALE;
}

export function stripLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0] as Locale | undefined;
  if (first && LOCALES.includes(first) && first !== DEFAULT_LOCALE) {
    const rest = segments.slice(1).join('/');
    return '/' + rest;
  }
  return pathname.startsWith('/') ? pathname : '/' + pathname;
}

export function getLocalizedPath(pathname: string, targetLocale: Locale): string {
  const cleanPath = stripLocaleFromPath(pathname);
  if (targetLocale === DEFAULT_LOCALE) {
    return cleanPath === '' ? '/' : cleanPath;
  }
  const prefix = `/${targetLocale}`;
  if (cleanPath === '/' || cleanPath === '') {
    return prefix;
  }
  return `${prefix}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
}

export function useTranslations(locale: Locale = DEFAULT_LOCALE): UIStrings {
  return ui[locale] ?? ui[DEFAULT_LOCALE];
}
