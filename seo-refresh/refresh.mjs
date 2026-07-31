import { mkdir, rename, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const apiBase = (process.env.SEO_API_BASE_URL || 'https://api.volt.az/api/').replace(/\/$/, '') + '/';
const siteUrl = (process.env.SEO_SITE_URL || 'https://volt.az').replace(/\/$/, '');
const outputDir = process.env.SEO_OUTPUT_DIR ? resolve(process.env.SEO_OUTPUT_DIR) : '';
const dryRun = process.env.SEO_DRY_RUN === 'true';
const expectedProducts = Number(process.env.SEO_EXPECTED_PRODUCT_COUNT || '0');

if (!outputDir && !dryRun) throw new Error('SEO_OUTPUT_DIR is required unless SEO_DRY_RUN=true.');

const escapeXml = (value) => String(value ?? '').replace(/[<>&'\"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char]);
const normalizeItems = (json) => Array.isArray(json) ? json : Array.isArray(json?.items) ? json.items : Array.isArray(json?.data) ? json.data : Array.isArray(json?.data?.items) ? json.data.items : [];

async function fetchJson(path) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(`${apiBase}${path}`, { headers: { Accept: 'application/json' }, signal: controller.signal });
    if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function allProducts() {
  const result = [];
  const ids = new Set();
  for (let page = 1; page <= 1000; page += 1) {
    const items = normalizeItems(await fetchJson(`Products?Page=${page}&PageSize=100`));
    for (const item of items) {
      const id = item?.id ?? item?.productId ?? item?.Id;
      if (id && !ids.has(String(id))) { ids.add(String(id)); result.push(item); }
    }
    if (items.length < 100) break;
  }
  if (expectedProducts > 0 && result.length < expectedProducts) throw new Error(`Only ${result.length} products were fetched; expected at least ${expectedProducts}.`);
  return result;
}

function itemId(item) { return item?.id ?? item?.projectId ?? item?.blogId ?? item?.newsPostId ?? item?.Id; }
function loc(path) { return `${siteUrl}${path}`; }
const languages = ['az', 'en', 'ru', 'tr'];
const installationPaths = { az: '/gunes-paneli-qurasdirilmasi', en: '/en/solar-panel-installation', ru: '/ru/ustanovka-solnechnyh-paneley', tr: '/tr/gunes-paneli-kurulumu' };
function localizedPath(basePath, language) {
  if (basePath === '/solar-installation') return installationPaths[language];
  if (language === 'az') return basePath;
  return basePath === '/' ? `/${language}` : `/${language}${basePath}`;
}
function availableLanguages(item) {
  const translations = [
    ...(Array.isArray(item?.translations) ? item.translations : []),
    ...(Array.isArray(item?.languages) ? item.languages : []),
    ...(Array.isArray(item?.projectLanguages) ? item.projectLanguages : []),
    ...(Array.isArray(item?.productDescriptions) ? item.productDescriptions.flatMap((description) => description?.languages || []) : []),
  ];
  const result = new Set(['az']);
  for (const translation of translations) {
    const code = String(translation?.languageCode ?? translation?.language ?? translation?.code ?? '').toLowerCase();
    const language = ({ '1': 'az', '2': 'en', '3': 'ru', '4': 'tr', az: 'az', en: 'en', ru: 'ru', tr: 'tr' })[code];
    if (language) result.add(language);
  }
  return [...result];
}
function localizedEntries(basePath, lastmod, priority, routeLanguages = languages) {
  const alternates = [...routeLanguages.map((language) => `<xhtml:link rel="alternate" hreflang="${language}" href="${escapeXml(loc(localizedPath(basePath, language)))}"/>`), `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(loc(localizedPath(basePath, 'az')))}"/>`].join('');
  return routeLanguages.map((language) => `<url><loc>${escapeXml(loc(localizedPath(basePath, language)))}</loc>${alternates}${lastmod ? `<lastmod>${escapeXml(String(lastmod).slice(0, 10))}</lastmod>` : ''}<changefreq>weekly</changefreq><priority>${priority}</priority></url>`);
}

function createFiles({ products, projects, blogs, news }) {
  const staticRoutes = ['/', '/about', '/services', '/solar-installation', '/projects', '/products', '/calculator', '/contact', '/videos', '/faq', '/how-to-start', '/necessary-documents', '/legislation', '/credits', '/partnership', '/pro-club', '/privacy-policy', '/terms-of-service', '/purchase-terms', '/news', '/blog'];
  const entries = staticRoutes.flatMap((route) => localizedEntries(route, null, route === '/' || route === '/calculator' ? '1.0' : '0.8'));
  for (const product of products) entries.push(...localizedEntries(`/product/${itemId(product)}`, product?.updatedAt ?? product?.updated_at, '0.7', availableLanguages(product)));
  for (const project of projects) if (itemId(project)) entries.push(...localizedEntries(`/projects/${itemId(project)}`, project?.updatedAt ?? project?.createdAt, '0.75', availableLanguages(project)));
  for (const blog of blogs) if (itemId(blog)) entries.push(...localizedEntries(`/blog/${itemId(blog)}`, blog?.updatedAt ?? blog?.createdAt, '0.75', availableLanguages(blog)));
  for (const article of news) if (itemId(article)) entries.push(...localizedEntries(`/news/${itemId(article)}`, article?.updatedAt ?? article?.createdAt, '0.75', availableLanguages(article)));
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.join('')}</urlset>\n`;
  const catalogue = products.map((product) => {
    const id = itemId(product);
    const name = String(product?.productName ?? product?.name ?? `Product ${id}`).replaceAll(']', '');
    const description = String(product?.description ?? product?.shortDescription ?? '').replace(/[\r\n]+/g, ' ').slice(0, 240);
    return `- [${name}](${loc(`/product/${id}`)})${description ? ` — ${description}` : ''}`;
  }).join('\n');
  const llms = `# Volt.az\n\n> Volt.az (SOLARIX MMC) provides solar panels, inverters, energy storage, solar calculators, and professional installation for homes and businesses in Azerbaijan.\n\n## Official sources\n\n- Website: ${loc('/')}\n- Solar products: ${loc('/products')}\n- Solar calculator: ${loc('/calculator')}\n- Solar panel installation: ${loc(installationPaths.az)}\n- Projects: ${loc('/projects')}\n- Public sitemap: ${loc('/sitemap.xml')}\n\n## Languages\n\n- Azərbaycan dili: ${loc('/')}\n- English: ${loc('/en')}\n- Русский: ${loc('/ru')}\n- Türkçe: ${loc('/tr')}\n\n## Product catalogue\n\n${catalogue}\n`;
  const robots = `User-agent: *\nAllow: /\n\nDisallow: /admin\nDisallow: /admin-dashboard\nDisallow: /customer-dashboard\nDisallow: /pro-club/dashboard\nDisallow: /cart\nDisallow: /checkout\nDisallow: /order\nDisallow: /theme-lab\n\nSitemap: ${loc('/sitemap.xml')}\n`;
  return { sitemap, llms, robots };
}

async function writeAtomically(name, contents) {
  const target = join(outputDir, name);
  const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporary, contents, 'utf8');
  await rename(temporary, target);
}

const [products, projects, blogs, news] = await Promise.all([allProducts(), fetchJson('Projects').then(normalizeItems), fetchJson('Blogs').then(normalizeItems), fetchJson('NewsPosts/GetAllForPublic').then(normalizeItems)]);
const files = createFiles({ products, projects, blogs, news });
console.log(`SEO refresh fetched ${products.length} products, ${projects.length} projects, ${blogs.length} blogs, and ${news.length} news items.`);

if (dryRun) {
  console.log('Dry-run passed; no public files were changed.');
} else {
  await mkdir(outputDir, { recursive: true });
  await Promise.all([writeAtomically('sitemap.xml', files.sitemap), writeAtomically('llms.txt', files.llms), writeAtomically('robots.txt', files.robots)]);
  console.log(`SEO files refreshed atomically in ${outputDir}.`);
}
