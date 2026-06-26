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
  '/products',
  '/calculator',
  '/contact',
  '/faq',
  '/how-to-start',
  '/necessary-documents',
  '/legislation',
  '/partnership',
  '/privacy-policy',
  '/news',
  '/blog'
];

staticRoutes.forEach(route => {
  sitemap.write({
    url: route,
    changefreq: 'weekly',
    priority: route === '/' ? 1.0 : 0.8,
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

// Fetch all products from API and add /product/:id routes
async function addProducts() {
  try {
    const url = `${API_BASE}Products?Page=1&PageSize=10000`;
    console.log('Fetching products from', url);

    const headers = {};
    if (process.env.SITEMAP_API_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.SITEMAP_API_TOKEN}`;
      console.log('Using SITEMAP_API_TOKEN for authorization');
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn('Products fetch failed:', res.status);
      return;
    }
    const json = await res.json();

    const items = normalizeItems(json);
    console.log('Products response normalized to array of length', items.length);

    items.forEach((p) => {
      const id = p?.id || p?.productId || p?.Id || p?.ID;
      if (!id) return;
      sitemap.write({
        url: `/product/${id}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: p?.updatedAt || p?.updated_at || p?.modifiedAt || undefined,
      });
    });
  } catch (err) {
    console.error('Error fetching products for sitemap:', err);
  }
}

await addProducts();

sitemap.end();

const data = await streamToPromise(sitemap);
fs.writeFileSync('./public/sitemap.xml', data.toString());

console.log('Sitemap yaradıldı!');
