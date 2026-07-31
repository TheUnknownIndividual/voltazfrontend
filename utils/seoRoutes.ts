export type SiteLanguage = 'az' | 'en' | 'ru' | 'tr';

export const SITE_LANGUAGES: SiteLanguage[] = ['az', 'en', 'ru', 'tr'];
const PREFIXED_LANGUAGES: SiteLanguage[] = ['en', 'ru', 'tr'];
const INSTALLATION_SLUGS = new Set([
  '/gunes-paneli-qurasdirilmasi',
  '/solar-panel-installation',
  '/ustanovka-solnechnyh-paneley',
  '/gunes-paneli-kurulumu',
]);

export const INSTALLATION_PATHS: Record<SiteLanguage, string> = {
  az: '/gunes-paneli-qurasdirilmasi',
  en: '/en/solar-panel-installation',
  ru: '/ru/ustanovka-solnechnyh-paneley',
  tr: '/tr/gunes-paneli-kurulumu',
};

export const getLanguageFromPath = (pathname: string): SiteLanguage => {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return PREFIXED_LANGUAGES.includes(firstSegment as SiteLanguage)
    ? firstSegment as SiteLanguage
    : 'az';
};

export const stripLanguagePrefix = (pathname: string) => {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const installationEntry = Object.entries(INSTALLATION_PATHS)
    .find(([, localizedPath]) => normalized.replace(/\/+$/, '') === localizedPath);
  if (installationEntry) return '/solar-installation';

  const segments = normalized.split('/').filter(Boolean);
  if (PREFIXED_LANGUAGES.includes(segments[0] as SiteLanguage)) {
    const stripped = `/${segments.slice(1).join('/')}`;
    const cleanPath = stripped === '/' ? '/' : stripped.replace(/\/+$/, '');
    return INSTALLATION_SLUGS.has(cleanPath) ? '/solar-installation' : cleanPath;
  }
  const cleanPath = normalized === '/' ? '/' : normalized.replace(/\/+$/, '');
  return INSTALLATION_SLUGS.has(cleanPath) ? '/solar-installation' : cleanPath;
};

export const localizePath = (pathWithQuery: string, language: SiteLanguage) => {
  const [pathname, query = ''] = pathWithQuery.split('?');
  const basePath = stripLanguagePrefix(pathname || '/');
  if (basePath === '/solar-installation') {
    return query ? `${INSTALLATION_PATHS[language]}?${query}` : INSTALLATION_PATHS[language];
  }
  const localized = language === 'az'
    ? basePath
    : basePath === '/'
      ? `/${language}`
      : `/${language}${basePath}`;
  return query ? `${localized}?${query}` : localized;
};

export const normalizeCanonicalPath = (pathname: string) => {
  if (!pathname || pathname === '/') return '/';
  return `/${pathname.split('/').filter(Boolean).join('/')}`;
};

export const absoluteSiteUrl = (pathname: string) =>
  `https://volt.az${normalizeCanonicalPath(pathname)}`;

export const getLocalizedAlternates = (basePath: string) => ({
  az: absoluteSiteUrl(localizePath(basePath, 'az')),
  en: absoluteSiteUrl(localizePath(basePath, 'en')),
  ru: absoluteSiteUrl(localizePath(basePath, 'ru')),
  tr: absoluteSiteUrl(localizePath(basePath, 'tr')),
  'x-default': absoluteSiteUrl(localizePath(basePath, 'az')),
});
