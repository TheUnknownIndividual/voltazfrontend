import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const fail = (message) => {
  throw new Error(`SEO verification failed: ${message}`);
};
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const webConfig = read('dist/web.config');
if (webConfig.includes('__PRERENDER_DIR__')) fail('dist/web.config still contains the prerender placeholder.');
if (!webConfig.includes('Noindex test environment')) fail('test.volt.az noindex rule is missing.');
if (!webConfig.includes('Unknown route is a real 404')) fail('real 404 rule is missing.');
if (!webConfig.includes('Removed compromised namespaces')) fail('410 rule for compromised namespaces is missing.');
if (!webConfig.includes('existingResponse="Auto"')) fail('IIS custom errors can replace genuine 404 status codes.');

const prerenderDirectory = webConfig.match(/url="\/(_prerender(?:_[0-9a-f]{12})?)\/\{R:1\}\.html"/)?.[1];
if (!prerenderDirectory) fail('prerender rewrite target was not found.');
const prerenderRoot = path.join(dist, prerenderDirectory);
if (!fs.statSync(prerenderRoot).isDirectory()) fail(`${prerenderDirectory} does not exist.`);

const sitemap = read('public/sitemap.xml');
if (sitemap.includes('Content-Signal')) fail('obsolete Content-Signal directive remains.');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
if (urls.length !== new Set(urls).size) fail('sitemap contains duplicate URLs.');

const requiredUrls = [
  'https://volt.az/',
  'https://volt.az/en',
  'https://volt.az/ru',
  'https://volt.az/tr',
  'https://volt.az/gunes-paneli-qurasdirilmasi',
  'https://volt.az/en/solar-panel-installation',
  'https://volt.az/ru/ustanovka-solnechnyh-paneley',
  'https://volt.az/tr/gunes-paneli-kurulumu',
  'https://volt.az/gunes-panelleri',
  'https://volt.az/en/solar-panels',
  'https://volt.az/ru/solnechnye-paneli',
  'https://volt.az/tr/gunes-panelleri',
  'https://volt.az/gunes-invertorlari',
  'https://volt.az/en/solar-inverters',
  'https://volt.az/ru/solnechnye-invertory',
  'https://volt.az/tr/gunes-invertorleri',
  'https://volt.az/product/261',
];
for (const url of requiredUrls) {
  if (!urls.includes(url)) fail(`sitemap is missing ${url}.`);
}

const checkPage = (relativeFile, expectedCanonical) => {
  const html = fs.readFileSync(path.join(dist, relativeFile), 'utf8');
  if (!/<h1\b/i.test(html)) fail(`${relativeFile} has no prerendered H1.`);
  if (!/<main hidden data-seo-prerendered="true">/i.test(html)) {
    fail(`${relativeFile} can visibly flash its SEO fallback before React loads.`);
  }
  if (!html.includes(`rel="canonical" href="${expectedCanonical}"`)) {
    fail(`${relativeFile} has the wrong canonical URL.`);
  }
  if (!/hreflang="x-default"/i.test(html)) fail(`${relativeFile} has no x-default hreflang.`);
};

checkPage('index.html', 'https://volt.az/');
checkPage(path.join(prerenderDirectory, 'en.html'), 'https://volt.az/en');
checkPage(path.join(prerenderDirectory, 'en', 'solar-panel-installation.html'), 'https://volt.az/en/solar-panel-installation');
checkPage(path.join(prerenderDirectory, 'gunes-panelleri.html'), 'https://volt.az/gunes-panelleri');
const solarPanelsAz = fs.readFileSync(path.join(prerenderRoot, 'gunes-panelleri.html'), 'utf8');
for (const term of ['Günəş Panelləri (Gunes Panel)', 'solar panel', 'Gunes panel qiymetleri']) {
  if (!solarPanelsAz.toLocaleLowerCase('az').includes(term.toLocaleLowerCase('az'))) fail(`solar-panel landing page is missing “${term}”.`);
}
for (const schemaType of ['CollectionPage', 'BreadcrumbList', 'FAQPage', 'ItemList']) {
  if (!solarPanelsAz.includes(schemaType)) fail(`solar-panel landing page is missing ${schemaType} structured data.`);
}

checkPage(path.join(prerenderDirectory, 'gunes-invertorlari.html'), 'https://volt.az/gunes-invertorlari');
const invertersAz = fs.readFileSync(path.join(prerenderRoot, 'gunes-invertorlari.html'), 'utf8');
for (const term of ['Günəş İnvertorları', 'Growatt', 'Hibrid və şəbəkəli invertor']) {
  if (!invertersAz.toLocaleLowerCase('az').includes(term.toLocaleLowerCase('az'))) fail(`inverter landing page is missing “${term}”.`);
}
for (const schemaType of ['CollectionPage', 'BreadcrumbList', 'FAQPage', 'ItemList']) {
  if (!invertersAz.includes(schemaType)) fail(`inverter landing page is missing ${schemaType} structured data.`);
}
if (!webConfig.includes('Canonical inverter landing aliases')) fail('inverter alias redirects are missing.');

const product261 = path.join(prerenderDirectory, 'product', '261.html');
if (fs.existsSync(path.join(dist, product261))) {
  checkPage(product261, 'https://volt.az/product/261');
}
for (const [id, expectedText] of [['54', 'SCB8-63MTS'], ['116', 'SMEP']]) {
  const relativeFile = path.join(prerenderDirectory, 'product', `${id}.html`);
  const absoluteFile = path.join(dist, relativeFile);
  if (!fs.existsSync(absoluteFile)) continue;
  const html = fs.readFileSync(absoluteFile, 'utf8');
  const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || '';
  if (!description.includes(expectedText)) {
    fail(`product ${id} does not have a product-specific meta description.`);
  }
}

const generatedHtmlFiles = fs.readdirSync(prerenderRoot, { recursive: true })
  .filter((file) => String(file).endsWith('.html'));
for (const relativeFile of generatedHtmlFiles) {
  const html = fs.readFileSync(path.join(prerenderRoot, relativeFile), 'utf8');
  const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || '';
  if (!description) fail(`${relativeFile} has no meta description.`);
  if (/sales brand of solarix|solarix mmc-nin satış brendi|торговым брендом solarix|solarix mmc’nin satış markası/i.test(description)) {
    fail(`${relativeFile} still uses the generic footer text as its description.`);
  }
}

const notFound = read('dist/404.html');
if (!/name="robots" content="noindex, nofollow"/i.test(notFound)) fail('404 page is not noindex.');
if (/rel="canonical"/i.test(notFound)) fail('404 page must not declare a canonical URL.');

console.log(`SEO verification passed: ${urls.length} sitemap URLs, prerender set ${prerenderDirectory}.`);
