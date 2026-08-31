import { SitemapStream, streamToPromise } from 'sitemap';
import fs from 'fs';
import path from 'path';

// The deployment scripts set the production or test API base. Keep production as
// the safe default so a plain `npm run sitemap` describes the public site.
const API_BASE = (process.env.SITEMAP_API_BASE_URL || "https://api.volt.az/api/").replace(/\/$/, '') + '/';
const SITE_HOSTNAME = (process.env.SITEMAP_HOSTNAME || 'https://volt.az').replace(/\/$/, '');
const OUTPUT_DIR = path.resolve(process.env.SITEMAP_OUTPUT_DIR || './public');
const SEO_CACHE_DIR = path.resolve(process.env.SEO_CACHE_DIR || './.seo-cache');
const seoLinks = [];
const seoRoutes = [];
let solarPanelCategoryId = null;
let inverterCategoryId = null;
const LANGUAGES = ['az', 'en', 'ru', 'tr'];
const INSTALLATION_PATHS = {
  az: '/gunes-paneli-qurasdirilmasi',
  en: '/en/solar-panel-installation',
  ru: '/ru/ustanovka-solnechnyh-paneley',
  tr: '/tr/gunes-paneli-kurulumu',
};
const SOLAR_PANEL_PATHS = {
  az: '/gunes-panelleri',
  en: '/en/solar-panels',
  ru: '/ru/solnechnye-paneli',
  tr: '/tr/gunes-panelleri',
};
const INVERTER_PATHS = {
  az: '/gunes-invertorlari',
  en: '/en/solar-inverters',
  ru: '/ru/solnechnye-invertory',
  tr: '/tr/gunes-invertorleri',
};

const sitemap = new SitemapStream({
  hostname: SITE_HOSTNAME,
});

const localizedPath = (route, language) => {
  const normalized = route === '/' ? '/' : `/${String(route).split('/').filter(Boolean).join('/')}`;
  if (normalized === '/solar-installation') return INSTALLATION_PATHS[language];
  if (normalized === '/solar-panels') return SOLAR_PANEL_PATHS[language];
  if (normalized === '/inverters') return INVERTER_PATHS[language];
  if (language === 'az') return normalized;
  return normalized === '/' ? `/${language}` : `/${language}${normalized}`;
};

const alternateLinks = (route, availableLanguages = LANGUAGES) => [
  ...availableLanguages.map((lang) => ({ lang, url: `${SITE_HOSTNAME}${localizedPath(route, lang)}` })),
  { lang: 'x-default', url: `${SITE_HOSTNAME}${localizedPath(route, 'az')}` },
];

const writeLocalizedRoute = (route, options = {}, availableLanguages = LANGUAGES) => {
  availableLanguages.forEach((language) => {
    sitemap.write({
      ...options,
      url: localizedPath(route, language),
      links: alternateLinks(route, availableLanguages),
    });
  });
};

const staticRoutes = [
  '/',
  '/about',
  '/services',
  '/solar-installation',
  '/solar-panels',
  '/inverters',
  '/projects',
  '/products',
  '/calculator',
  '/contact',
  '/videos',
  '/faq',
  '/how-to-start',
  '/necessary-documents',
  '/legislation',
  '/credits',
  '/partnership',
  '/pro-club',
  '/privacy-policy',
  '/data-deletion',
  '/terms-of-service',
  '/purchase-terms',
  '/news',
  '/blog'
];

staticRoutes.forEach(route => {
  writeLocalizedRoute(route, {
    changefreq: route === '/calculator' ? 'daily' : 'weekly',
    priority: route === '/' || route === '/calculator' ? 1.0 : route === '/solar-panels' || route === '/inverters' || route === '/blog' || route === '/news' ? 0.9 : 0.8,
  });
});

function normalizeItems(json) {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.items)) return json.items;
  if (Array.isArray(json.data)) return json.data;
  if (Array.isArray(json.data?.items)) return json.data.items;
  // if items/data are objects keyed by id, return values
  if (json.items && typeof json.items === 'object') return Object.values(json.items);
  if (json.data && typeof json.data === 'object') return Object.values(json.data);
  return [];
}

async function resolveSolarPanelCategory() {
  try {
    const response = await fetch(`${API_BASE}ProductCategories/seo/solar-panels`, { headers: { 'Accept-Language': 'az' } });
    if (response.ok) {
      const payload = await response.json();
      solarPanelCategoryId = Number(payload?.data?.id || payload?.id) || null;
      return;
    }
  } catch {
    // The frontend can build immediately before the API migration is deployed.
  }

  try {
    const response = await fetch(`${API_BASE}ProductCategories`, { headers: { 'Accept-Language': 'az' } });
    if (!response.ok) return;
    const categories = normalizeItems(await response.json());
    const category = categories.find((item) => item?.seoKey === 'solar-panels'
      || item?.languages?.some((language) => ['Günəş paneli', 'Günəş panelləri'].includes(language?.categoryName)));
    solarPanelCategoryId = Number(category?.id) || null;
  } catch {
    solarPanelCategoryId = null;
  }
}

async function resolveInverterCategory() {
  try {
    const response = await fetch(`${API_BASE}ProductCategories/seo/inverters`, { headers: { 'Accept-Language': 'az' } });
    if (response.ok) {
      const payload = await response.json();
      inverterCategoryId = Number(payload?.data?.id || payload?.id) || null;
      return;
    }
  } catch {
    // The frontend can build immediately before the data migration is deployed.
  }

  try {
    const response = await fetch(`${API_BASE}ProductCategories`, { headers: { 'Accept-Language': 'az' } });
    if (!response.ok) return;
    const categories = normalizeItems(await response.json());
    const category = categories.find((item) => item?.seoKey === 'inverters'
      || item?.languages?.some((language) => ['İnvertorlar', 'Invertorlar', 'İnverterlər', 'Inverterlər'].includes(language?.categoryName)));
    inverterCategoryId = Number(category?.id) || null;
  } catch {
    inverterCategoryId = null;
  }
}

function normalizeImageUrl(image) {
  if (!image || typeof image !== 'string') return undefined;
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  if (image.startsWith('/')) return `${SITE_HOSTNAME}${image}`;
  return `${SITE_HOSTNAME}/${image}`;
}

function getProductImages(product) {
  const images = product?.productImage || product?.productImages || product?.images || [];
  const values = Array.isArray(images) ? images : [images];
  return values
    .map((item) => normalizeImageUrl(typeof item === 'string' ? item : item?.imageUrl || item?.url || item?.path))
    .filter(Boolean)
    .slice(0, 3)
    .map((url) => ({
      url,
      title: product?.productName || product?.name || undefined,
    }));
}

function getFirstTranslation(item, key = 'translations') {
  const translations = item?.[key] || item?.languages || [];
  return Array.isArray(translations) ? translations[0] : undefined;
}

function languageKey(value) {
  const normalized = String(value ?? '').toLowerCase();
  return ({ '1': 'az', '2': 'en', '3': 'ru', '4': 'tr', az: 'az', en: 'en', ru: 'ru', tr: 'tr', 'az-az': 'az', 'en-us': 'en', 'ru-ru': 'ru', 'tr-tr': 'tr' })[normalized];
}

function getLocalizedSeo(item, fallbackTitle) {
  const translations = [
    ...(Array.isArray(item?.translations) ? item.translations : []),
    ...(Array.isArray(item?.languages) ? item.languages : []),
    ...(Array.isArray(item?.projectLanguages) ? item.projectLanguages : []),
    ...(Array.isArray(item?.productDescriptions)
      ? item.productDescriptions.flatMap((description) => Array.isArray(description?.languages) ? description.languages : [])
      : []),
  ];
  const localized = {};
  for (const translation of translations) {
    const language = languageKey(translation?.languageCode ?? translation?.language ?? translation?.code);
    if (!language) continue;
    localized[language] = {
      title: translation?.title || translation?.productName || fallbackTitle,
      description: translation?.content || translation?.description || translation?.features || '',
    };
  }
  return localized;
}

function getContentImage(item) {
  return normalizeImageUrl(item?.coverImagePath || item?.coverImage || item?.image || item?.imageUrl);
}

function getProjectImages(project) {
  const images = project?.imagePaths || project?.images || project?.projectImages || [];
  const values = Array.isArray(images) ? images : [images];
  return values
    .map((item) => normalizeImageUrl(typeof item === 'string' ? item : item?.imagePath || item?.imageUrl || item?.url || item?.path))
    .filter(Boolean)
    .slice(0, 3)
    .map((url) => ({
      url,
      title: project?.title || project?.name || undefined,
    }));
}

// Fetch all products from API and add /product/:id routes
async function addProducts() {
  try {
    const headers = {};
    if (process.env.SITEMAP_API_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.SITEMAP_API_TOKEN}`;
      console.log('Using SITEMAP_API_TOKEN for authorization');
    }

    const pageSize = 100;
    const seenIds = new Set();
    let page = 1;
    let total = 0;

    while (page < 1000) {
      const url = `${API_BASE}Products?Page=${page}&PageSize=${pageSize}`;
      console.log('Fetching products from', url);

      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new Error(`Products fetch failed with HTTP ${res.status}`);
      }
      const items = normalizeItems(await res.json());
      console.log(`Products page ${page} normalized to array of length`, items.length);

      if (items.length === 0) break;

      items.forEach((p) => {
        const id = p?.id || p?.productId || p?.Id || p?.ID;
        if (!id || seenIds.has(String(id))) return;
        seenIds.add(String(id));
        total += 1;
        seoLinks.push({
          url: `${SITE_HOSTNAME}/product/${id}`,
          title: p?.productName || p?.name || `Volt.az məhsul ${id}`,
          description: p?.description || p?.shortDescription || '',
        });
        const img = getProductImages(p);
        const localized = getLocalizedSeo(p, p?.productName || p?.name || `Volt.az məhsul ${id}`);
        const variants = Array.isArray(p?.productParametrs) ? p.productParametrs : [];
        const representativeVariant = variants.find((variant) => variant?.technicalPower || variant?.effectiveness || Number(variant?.amount) > 0);
        const availableLanguages = [...new Set(['az', ...Object.keys(localized)])];
        seoRoutes.push({
          path: `/product/${id}`,
          kind: 'product',
          id: String(id),
          title: p?.productName || p?.name || `Volt.az məhsul ${id}`,
          description: p?.description || p?.shortDescription || '',
          localized,
          availableLanguages,
          image: img[0]?.url,
          technicalPower: representativeVariant?.technicalPower || undefined,
          effectiveness: representativeVariant?.effectiveness || undefined,
          price: Number(representativeVariant?.amount) > 0 ? Number(representativeVariant.amount) : undefined,
          inStock: Boolean(p?.inStock && (variants.length === 0 || variants.some((variant) => Number(variant?.count) > 0))),
          categorySeoKey: solarPanelCategoryId && Number(p?.productCategoryId) === solarPanelCategoryId
            ? 'solar-panels'
            : inverterCategoryId && Number(p?.productCategoryId) === inverterCategoryId
              ? 'inverters'
              : undefined,
          lastmod: p?.updatedAt || p?.updated_at || p?.modifiedAt || undefined,
        });
        writeLocalizedRoute(`/product/${id}`, {
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: p?.updatedAt || p?.updated_at || p?.modifiedAt || undefined,
          img: img.length > 0 ? img : undefined,
        }, availableLanguages);
      });

      if (items.length < pageSize) break;
      page += 1;
    }

    console.log('Products total added to sitemap', total);
  } catch (err) {
    console.error('Error fetching products for sitemap:', err);
    throw err;
  }
}

async function addProjects() {
  try {
    const url = `${API_BASE}Projects`;
    console.log('Fetching projects from', url);

    const headers = {};
    if (process.env.SITEMAP_API_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.SITEMAP_API_TOKEN}`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`Projects fetch failed with HTTP ${res.status}`);
    }

    const items = normalizeItems(await res.json());
    console.log('Projects response normalized to array of length', items.length);

    items.forEach((item) => {
      const id = item?.id || item?.projectId || item?.Id || item?.ID;
      if (!id) return;

      const projectImages = getProjectImages(item);
      const localized = getLocalizedSeo(item, item?.title || item?.name || `Volt.az layihə ${id}`);
      const availableLanguages = [...new Set(['az', ...Object.keys(localized)])];
      seoRoutes.push({
        path: `/projects/${id}`,
        kind: 'project',
        id: String(id),
        title: item?.title || item?.name || `Volt.az layihə ${id}`,
        description: item?.description || '',
        localized,
        availableLanguages,
        image: projectImages[0]?.url,
        lastmod: item?.updatedAt || item?.createdAt || undefined,
      });
      writeLocalizedRoute(`/projects/${id}`, {
        changefreq: 'monthly',
        priority: 0.75,
        lastmod: item?.updatedAt || item?.createdAt || undefined,
        img: projectImages,
      }, availableLanguages);
    });
  } catch (err) {
    console.error('Error fetching projects for sitemap:', err);
    throw err;
  }
}

async function addBlogs() {
  try {
    const url = `${API_BASE}Blogs`;
    console.log('Fetching blogs from', url);

    const headers = {};
    if (process.env.SITEMAP_API_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.SITEMAP_API_TOKEN}`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`Blogs fetch failed with HTTP ${res.status}`);
    }

    const items = normalizeItems(await res.json());
    console.log('Blogs response normalized to array of length', items.length);

    items.forEach((item) => {
      const id = item?.id || item?.blogId || item?.Id || item?.ID;
      if (!id) return;

      const translation = getFirstTranslation(item, 'translations');
      const image = getContentImage(item);
      const localized = getLocalizedSeo(item, translation?.title || item?.title || `Volt.az bloq ${id}`);
      const availableLanguages = [...new Set(['az', ...Object.keys(localized)])];
      seoRoutes.push({
        path: `/blog/${id}`,
        kind: 'blog',
        id: String(id),
        title: translation?.title || item?.title || `Volt.az bloq ${id}`,
        description: translation?.description || item?.description || '',
        localized,
        availableLanguages,
        image,
        lastmod: item?.updatedAt || item?.createdAt || undefined,
      });
      writeLocalizedRoute(`/blog/${id}`, {
        changefreq: 'weekly',
        priority: 0.75,
        lastmod: item?.updatedAt || item?.createdAt || undefined,
        img: image ? [{ url: image, title: translation?.title || item?.title || undefined }] : undefined,
      }, availableLanguages);
    });
  } catch (err) {
    console.error('Error fetching blogs for sitemap:', err);
    throw err;
  }
}

async function addNews() {
  try {
    const url = `${API_BASE}NewsPosts/GetAllForPublic`;
    console.log('Fetching news from', url);

    const headers = {};
    if (process.env.SITEMAP_API_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.SITEMAP_API_TOKEN}`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`News fetch failed with HTTP ${res.status}`);
    }

    const items = normalizeItems(await res.json());
    console.log('News response normalized to array of length', items.length);

    items.forEach((item) => {
      const id = item?.id || item?.newsPostId || item?.Id || item?.ID;
      if (!id) return;

      const translation = getFirstTranslation(item, 'languages');
      const image = getContentImage(item);
      const localized = getLocalizedSeo(item, translation?.title || item?.title || `Volt.az xəbər ${id}`);
      const availableLanguages = [...new Set(['az', ...Object.keys(localized)])];
      seoRoutes.push({
        path: `/news/${id}`,
        kind: 'news',
        id: String(id),
        title: translation?.title || item?.title || `Volt.az xəbər ${id}`,
        description: translation?.description || item?.description || '',
        localized,
        availableLanguages,
        image,
        lastmod: item?.updatedAt || item?.createdAt || undefined,
      });
      writeLocalizedRoute(`/news/${id}`, {
        changefreq: 'weekly',
        priority: 0.75,
        lastmod: item?.updatedAt || item?.createdAt || undefined,
        img: image ? [{ url: image, title: translation?.title || item?.title || undefined }] : undefined,
      }, availableLanguages);
    });
  } catch (err) {
    console.error('Error fetching news for sitemap:', err);
    throw err;
  }
}

await resolveSolarPanelCategory();
await resolveInverterCategory();
await addProducts();
await addProjects();
await addBlogs();
await addNews();

sitemap.end();

const data = await streamToPromise(sitemap);
function writeAtomically(fileName, contents) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const target = path.join(OUTPUT_DIR, fileName);
  const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temporary, contents, 'utf8');
  fs.renameSync(temporary, target);
}

function writeSeoCache(contents) {
  fs.mkdirSync(SEO_CACHE_DIR, { recursive: true });
  const target = path.join(SEO_CACHE_DIR, 'routes.json');
  const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temporary, contents, 'utf8');
  fs.renameSync(temporary, target);
}

writeAtomically('sitemap.xml', data.toString());
writeSeoCache(JSON.stringify(seoRoutes));

const llmsHeader = `# Volt.az\n\n> Volt.az (SOLARIX MMC) supplies, designs, installs, and supports solar panels, inverters, energy storage, and solar power systems for homes and businesses across Azerbaijan.\n\nUpdated: ${new Date().toISOString().slice(0, 10)}\n\n## Authoritative Azerbaijani pages\n\n- Main website: ${SITE_HOSTNAME}/\n- Solar panels: ${SITE_HOSTNAME}${SOLAR_PANEL_PATHS.az}\n- Solar inverters: ${SITE_HOSTNAME}${INVERTER_PATHS.az}\n- Solar panel installation: ${SITE_HOSTNAME}${INSTALLATION_PATHS.az}\n- Solar calculator: ${SITE_HOSTNAME}/calculator\n- Completed projects: ${SITE_HOSTNAME}/projects\n- Contact information: ${SITE_HOSTNAME}/contact\n\n## Russian commercial pages\n\n- Солнечные панели: ${SITE_HOSTNAME}${SOLAR_PANEL_PATHS.ru}\n- Солнечные инверторы: ${SITE_HOSTNAME}${INVERTER_PATHS.ru}\n- Установка солнечных панелей: ${SITE_HOSTNAME}${INSTALLATION_PATHS.ru}\n- Калькулятор: ${SITE_HOSTNAME}/ru/calculator\n- Проекты: ${SITE_HOSTNAME}/ru/projects\n- Контакты: ${SITE_HOSTNAME}/ru/contact\n\n## Source and coverage notes\n\n- Official operator: SOLARIX MMC / Volt.az.\n- Service coverage: homes, businesses, and industrial sites across Azerbaijan, subject to a technical site assessment.\n- System sizing, production, savings, price, warranty, and installation timing depend on the selected equipment and verified site conditions.\n- The public sitemap is ${SITE_HOSTNAME}/sitemap.xml and crawler guidance is ${SITE_HOSTNAME}/robots.txt.\n\n## Languages\n\n- Azərbaycan dili: ${SITE_HOSTNAME}/\n- English: ${SITE_HOSTNAME}/en\n- Русский: ${SITE_HOSTNAME}/ru\n- Türkçe: ${SITE_HOSTNAME}/tr\n\n## Product catalogue\n\n`;
const llmsProducts = seoLinks.map(({ url, title, description }) => `- [${String(title).replaceAll(']', '')}](${url})${description ? ` — ${String(description).replaceAll('\n', ' ').slice(0, 240)}` : ''}`).join('\n');
writeAtomically('llms.txt', `${llmsHeader}${llmsProducts}\n`);

console.log('Sitemap yaradıldı!');
console.log(`LLM catalogue yaradıldı: ${seoLinks.length} məhsul`);
