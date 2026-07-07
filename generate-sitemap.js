import { SitemapStream, streamToPromise } from 'sitemap';
import fs from 'fs';

// Base API used by the app (match utils/constants URL)
const API_BASE = "https://api.volt.az/api/";

const sitemap = new SitemapStream({
  hostname: 'https://volt.az',
});

const staticRoutes = [
  '/',
  '/about',
  '/services',
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
  '/terms-of-service',
  '/purchase-terms',
  '/news',
  '/blog'
];

staticRoutes.forEach(route => {
  sitemap.write({
    url: route,
    changefreq: route === '/calculator' ? 'daily' : 'weekly',
    priority: route === '/' || route === '/calculator' ? 1.0 : route === '/blog' || route === '/news' ? 0.9 : 0.8,
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

function normalizeImageUrl(image) {
  if (!image || typeof image !== 'string') return undefined;
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  if (image.startsWith('/')) return `https://volt.az${image}`;
  return `https://volt.az/${image}`;
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
        console.warn('Products fetch failed:', res.status);
        return;
      }
      const items = normalizeItems(await res.json());
      console.log(`Products page ${page} normalized to array of length`, items.length);

      if (items.length === 0) break;

      items.forEach((p) => {
        const id = p?.id || p?.productId || p?.Id || p?.ID;
        if (!id || seenIds.has(String(id))) return;
        seenIds.add(String(id));
        total += 1;
        const img = getProductImages(p);
        sitemap.write({
          url: `/product/${id}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: p?.updatedAt || p?.updated_at || p?.modifiedAt || undefined,
          img: img.length > 0 ? img : undefined,
        });
      });

      if (items.length < pageSize) break;
      page += 1;
    }

    console.log('Products total added to sitemap', total);
  } catch (err) {
    console.error('Error fetching products for sitemap:', err);
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
      console.warn('Projects fetch failed:', res.status);
      return;
    }

    const items = normalizeItems(await res.json());
    console.log('Projects response normalized to array of length', items.length);

    items.forEach((item) => {
      const id = item?.id || item?.projectId || item?.Id || item?.ID;
      if (!id) return;

      sitemap.write({
        url: `/projects/${id}`,
        changefreq: 'monthly',
        priority: 0.75,
        lastmod: item?.updatedAt || item?.createdAt || undefined,
        img: getProjectImages(item),
      });
    });
  } catch (err) {
    console.error('Error fetching projects for sitemap:', err);
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
      console.warn('Blogs fetch failed:', res.status);
      return;
    }

    const items = normalizeItems(await res.json());
    console.log('Blogs response normalized to array of length', items.length);

    items.forEach((item) => {
      const id = item?.id || item?.blogId || item?.Id || item?.ID;
      if (!id) return;

      const translation = getFirstTranslation(item, 'translations');
      const image = getContentImage(item);
      sitemap.write({
        url: `/blog/${id}`,
        changefreq: 'weekly',
        priority: 0.75,
        lastmod: item?.updatedAt || item?.createdAt || undefined,
        img: image ? [{ url: image, title: translation?.title || item?.title || undefined }] : undefined,
      });
    });
  } catch (err) {
    console.error('Error fetching blogs for sitemap:', err);
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
      console.warn('News fetch failed:', res.status);
      return;
    }

    const items = normalizeItems(await res.json());
    console.log('News response normalized to array of length', items.length);

    items.forEach((item) => {
      const id = item?.id || item?.newsPostId || item?.Id || item?.ID;
      if (!id) return;

      const translation = getFirstTranslation(item, 'languages');
      const image = getContentImage(item);
      sitemap.write({
        url: `/news/${id}`,
        changefreq: 'weekly',
        priority: 0.75,
        lastmod: item?.updatedAt || item?.createdAt || undefined,
        img: image ? [{ url: image, title: translation?.title || item?.title || undefined }] : undefined,
      });
    });
  } catch (err) {
    console.error('Error fetching news for sitemap:', err);
  }
}

await addProducts();
await addProjects();
await addBlogs();
await addNews();

sitemap.end();

const data = await streamToPromise(sitemap);
fs.writeFileSync('./public/sitemap.xml', data.toString());

console.log('Sitemap yaradıldı!');
