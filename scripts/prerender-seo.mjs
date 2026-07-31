import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const LANGUAGES = ['az', 'en', 'ru', 'tr'];
const SITE = 'https://volt.az';
// Stable on purpose: __PRERENDER_DIR__ is only an internal IIS rewrite target
// (never a public URL), so keeping this name fixed lets the FTP mirror step
// diff against the previous deploy instead of re-uploading every page.
const prerenderDirectory = '_prerender';
const INSTALLATION_PATHS = {
  az: '/gunes-paneli-qurasdirilmasi',
  en: '/en/solar-panel-installation',
  ru: '/ru/ustanovka-solnechnyh-paneley',
  tr: '/tr/gunes-paneli-kurulumu',
};

const staticRoutes = [
  '/', '/about', '/services', '/solar-installation', '/projects', '/products',
  '/calculator', '/contact', '/videos', '/faq', '/how-to-start',
  '/necessary-documents', '/legislation', '/credits', '/partnership', '/pro-club',
  '/privacy-policy', '/terms-of-service', '/purchase-terms', '/news', '/blog',
];

const text = {
  az: {
    site: 'Volt.az',
    home: 'Günəş Panelləri Satışı və Quraşdırılması',
    description: 'Azərbaycanda ev və biznes üçün günəş panelləri, invertorlar, enerji saxlama, layihələndirmə və quraşdırma həlləri.',
    installation: 'Günəş Paneli Quraşdırılması Azərbaycanda',
    installationDescription: 'Ev və biznes üçün günəş paneli quraşdırılması: sərfiyyat analizi, texniki baxış, layihələndirmə, avadanlıq seçimi, montaj və sistemin təhvili.',
    calculator: 'Günəş Enerjisi Kalkulyatoru',
    calculatorDescription: 'Sistem gücünü, illik istehsalı, təxmini qiyməti və elektrik qənaətini hesablayın.',
    nav: ['Quraşdırma', 'Məhsullar', 'Kalkulyator', 'Layihələr', 'Əlaqə'],
    kind: { product: 'Məhsul', project: 'Layihə', blog: 'Bloq', news: 'Xəbər' },
  },
  en: {
    site: 'Volt.az',
    home: 'Solar Panels and Installation in Azerbaijan',
    description: 'Solar panels, inverters, energy storage, system design, and installation for homes and businesses in Azerbaijan.',
    installation: 'Solar Panel Installation in Azerbaijan',
    installationDescription: 'Solar installation for homes and businesses, including consumption analysis, site survey, design, equipment selection, installation, and handover.',
    calculator: 'Solar Energy Calculator',
    calculatorDescription: 'Estimate solar system size, annual generation, price, and electricity savings.',
    nav: ['Installation', 'Products', 'Calculator', 'Projects', 'Contact'],
    kind: { product: 'Product', project: 'Project', blog: 'Blog', news: 'News' },
  },
  ru: {
    site: 'Volt.az',
    home: 'Солнечные панели и монтаж в Азербайджане',
    description: 'Солнечные панели, инверторы, накопители, проектирование и монтаж для домов и бизнеса в Азербайджане.',
    installation: 'Установка солнечных панелей в Азербайджане',
    installationDescription: 'Установка солнечных панелей для дома и бизнеса: анализ потребления, обследование, проектирование, подбор оборудования, монтаж и сдача.',
    calculator: 'Калькулятор солнечной энергии',
    calculatorDescription: 'Рассчитайте мощность системы, годовую выработку, примерную цену и экономию электроэнергии.',
    nav: ['Установка', 'Продукты', 'Калькулятор', 'Проекты', 'Контакты'],
    kind: { product: 'Продукт', project: 'Проект', blog: 'Блог', news: 'Новость' },
  },
  tr: {
    site: 'Volt.az',
    home: 'Azerbaycan’da Güneş Panelleri ve Kurulum',
    description: 'Azerbaycan’da evler ve işletmeler için güneş panelleri, inverterler, enerji depolama, sistem tasarımı ve kurulum.',
    installation: 'Azerbaycan’da Güneş Paneli Kurulumu',
    installationDescription: 'Ev ve işletmeler için tüketim analizi, keşif, tasarım, ekipman seçimi, güneş paneli kurulumu ve teslim hizmeti.',
    calculator: 'Güneş Enerjisi Hesaplayıcı',
    calculatorDescription: 'Sistem gücünü, yıllık üretimi, tahmini fiyatı ve elektrik tasarrufunu hesaplayın.',
    nav: ['Kurulum', 'Ürünler', 'Hesaplayıcı', 'Projeler', 'İletişim'],
    kind: { product: 'Ürün', project: 'Proje', blog: 'Blog', news: 'Haber' },
  },
};

const staticTitles = {
  about: ['Haqqımızda', 'About Us', 'О нас', 'Hakkımızda'],
  services: ['Günəş Enerjisi Xidmətləri', 'Solar Energy Services', 'Услуги солнечной энергетики', 'Güneş Enerjisi Hizmetleri'],
  projects: ['Günəş Enerjisi Layihələri', 'Solar Energy Projects', 'Проекты солнечной энергетики', 'Güneş Enerjisi Projeleri'],
  products: ['Günəş Panelləri, İnvertorlar və Avadanlıqlar', 'Solar Panels, Inverters and Equipment', 'Солнечные панели, инверторы и оборудование', 'Güneş Panelleri, İnverterler ve Ekipmanlar'],
  contact: ['Əlaqə', 'Contact', 'Контакты', 'İletişim'],
  videos: ['Videolar', 'Videos', 'Видео', 'Videolar'],
  faq: ['Tez-tez verilən suallar', 'Frequently Asked Questions', 'Часто задаваемые вопросы', 'Sık Sorulan Sorular'],
  'how-to-start': ['Necə başlamaq olar?', 'How to Get Started', 'Как начать', 'Nasıl Başlanır'],
  'necessary-documents': ['Zəruri sənədlər', 'Necessary Documents', 'Необходимые документы', 'Gerekli Belgeler'],
  legislation: ['Qanunvericilik', 'Legislation', 'Законодательство', 'Mevzuat'],
  credits: ['Kredit şərtləri', 'Credit Terms', 'Условия кредита', 'Kredi Şartları'],
  partnership: ['Tərəfdaşlıq', 'Partnership', 'Партнерство', 'İş Ortaklığı'],
  'pro-club': ['Ustalar Klubu', 'Masters Club', 'Клуб мастеров', 'Ustalar Kulübü'],
  'privacy-policy': ['Məxfilik siyasəti', 'Privacy Policy', 'Политика конфиденциальности', 'Gizlilik Politikası'],
  'terms-of-service': ['İstifadə şərtləri', 'Terms of Service', 'Условия использования', 'Kullanım Şartları'],
  'purchase-terms': ['Alış şərtləri', 'Purchase Terms', 'Условия покупки', 'Satın Alma Şartları'],
  news: ['Xəbərlər', 'News', 'Новости', 'Haberler'],
  blog: ['Günəş Enerjisi Bloqu', 'Solar Energy Blog', 'Блог о солнечной энергии', 'Güneş Enerjisi Blogu'],
};

const staticDescriptions = {
  about: [
    'SOLARIX MMC və Volt.az-ın fəaliyyəti, missiyası və Azərbaycanda bərpa olunan enerji həlləri ilə tanış olun.',
    'Learn about SOLARIX and Volt.az, our mission, and our renewable energy work in Azerbaijan.',
    'Узнайте о SOLARIX и Volt.az, нашей миссии и решениях в области возобновляемой энергетики в Азербайджане.',
    'SOLARIX ve Volt.az, misyonumuz ve Azerbaycan’daki yenilenebilir enerji çalışmalarımız hakkında bilgi alın.',
  ],
  services: [
    'Enerji auditi, günəş sistemi layihələndirilməsi, quraşdırma, monitorinq, maliyyə və sənədləşmə xidmətləri.',
    'Energy audits, solar system design, installation, monitoring, finance, and documentation services.',
    'Энергоаудит, проектирование солнечных систем, монтаж, мониторинг, финансирование и оформление документов.',
    'Enerji etüdü, güneş sistemi tasarımı, kurulum, izleme, finansman ve belgelendirme hizmetleri.',
  ],
  products: [
    'Günəş panelləri, invertorlar, elektrik qoruma avadanlıqları, kabellər və enerji sistemləri kataloqu.',
    'Browse solar panels, inverters, electrical protection equipment, cables, and energy systems.',
    'Каталог солнечных панелей, инверторов, электрозащиты, кабелей и энергетических систем.',
    'Güneş panelleri, inverterler, elektrik koruma ekipmanları, kablolar ve enerji sistemleri kataloğu.',
  ],
  projects: [
    'Volt.az tərəfindən həyata keçirilən günəş enerjisi və bərpa olunan enerji layihələri.',
    'Explore solar and renewable energy projects delivered by Volt.az.',
    'Проекты солнечной и возобновляемой энергетики, реализованные Volt.az.',
    'Volt.az tarafından gerçekleştirilen güneş ve yenilenebilir enerji projeleri.',
  ],
  contact: [
    'Günəş enerjisi sistemi və quraşdırma məsləhəti üçün Volt.az mütəxəssisləri ilə əlaqə saxlayın.',
    'Contact Volt.az specialists for solar system and installation advice.',
    'Свяжитесь со специалистами Volt.az для консультации по солнечной системе и монтажу.',
    'Güneş sistemi ve kurulum danışmanlığı için Volt.az uzmanlarıyla iletişime geçin.',
  ],
  videos: [
    'Günəş enerjisi, məhsullar, quraşdırma və Volt.az layihələri haqqında video materiallar.',
    'Watch Volt.az videos about solar energy, products, installation, and completed projects.',
    'Видео Volt.az о солнечной энергетике, оборудовании, монтаже и реализованных проектах.',
    'Güneş enerjisi, ürünler, kurulum ve Volt.az projeleri hakkındaki videoları izleyin.',
  ],
  partnership: [
    'SOLARIX və Volt.az ilə tərəfdaşlıq imkanları, rəsmi partnyorlar və yaşıl enerji ekosistemi.',
    'SOLARIX and Volt.az partnership opportunities, official partners, and the green energy ecosystem.',
    'Партнерские возможности SOLARIX и Volt.az, официальные партнеры и экосистема зеленой энергетики.',
    'SOLARIX ve Volt.az iş ortaklığı imkanları, resmi partnerler ve yeşil enerji ekosistemi.',
  ],
  news: [
    'Azərbaycan və dünyada bərpa olunan enerji, günəş enerjisi və enerji səmərəliliyi üzrə son xəbərlər.',
    'Latest renewable energy, solar power, and energy-efficiency news from Azerbaijan and worldwide.',
    'Последние новости возобновляемой энергетики, солнечной энергии и энергоэффективности в Азербайджане и мире.',
    'Azerbaycan ve dünyadan yenilenebilir enerji, güneş enerjisi ve enerji verimliliği haberleri.',
  ],
  blog: [
    'Günəş panelləri, invertorlar, enerji qənaəti, quraşdırma və solar hesablamalar haqqında faydalı məqalələr.',
    'Practical articles about solar panels, inverters, energy savings, installation, and solar calculations.',
    'Полезные статьи о солнечных панелях, инверторах, экономии, монтаже и расчетах солнечных систем.',
    'Güneş panelleri, inverterler, enerji tasarrufu, kurulum ve güneş hesapları hakkında faydalı yazılar.',
  ],
};

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const cleanText = (value = '') => String(value)
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const localizedPath = (route, language) => {
  if (route === '/solar-installation') return INSTALLATION_PATHS[language];
  if (language === 'az') return route;
  return route === '/' ? `/${language}` : `/${language}${route}`;
};

const absolute = (route, language) => `${SITE}${localizedPath(route, language)}`;

const pageMeta = (route, language, dynamic) => {
  const localized = text[language];
  if (route === '/') return { title: `${localized.site} | ${localized.home}`, description: localized.description };
  if (route === '/solar-installation') return { title: `${localized.installation} | Volt.az`, description: localized.installationDescription };
  if (route === '/calculator') return { title: `${localized.calculator} | Volt.az`, description: localized.calculatorDescription };
  if (dynamic) {
    const localizedDynamic = dynamic.localized?.[language] || {};
    const name = cleanText(localizedDynamic.title || dynamic.title) || `${localized.kind[dynamic.kind]} ${dynamic.id}`;
    const sourceDescription = cleanText(localizedDynamic.description || dynamic.description);
    const pageSpecificDescription = sourceDescription
      ? sourceDescription.toLocaleLowerCase(language).includes(name.toLocaleLowerCase(language))
        ? sourceDescription
        : `${name}. ${sourceDescription}`
      : `${name} — ${localized.description}`;
    const description = pageSpecificDescription.slice(0, 160);
    return { title: `${name} | Volt.az`, description };
  }
  const key = route.split('/').filter(Boolean)[0];
  const values = staticTitles[key];
  const label = values?.[LANGUAGES.indexOf(language)] || localized.home;
  const routeDescription = staticDescriptions[key]?.[LANGUAGES.indexOf(language)];
  return { title: `${label} | Volt.az`, description: routeDescription || `${label}. ${localized.description}` };
};

const routeFile = (route) => {
  if (route === '/') return path.join(DIST, 'index.html');
  return path.join(DIST, prerenderDirectory, `${route.replace(/^\//, '')}.html`);
};

const alternates = (route) => [
  ...LANGUAGES.map((language) => `<link rel="alternate" hreflang="${language}" href="${absolute(route, language)}">`),
  `<link rel="alternate" hreflang="x-default" href="${absolute(route, 'az')}">`,
].join('\n    ');

const fallbackMarkup = (route, language, meta) => {
  const localized = text[language];
  const navRoutes = ['/solar-installation', '/products', '/calculator', '/projects', '/contact'];
  const links = navRoutes.map((item, index) =>
    `<a href="${localizedPath(item, language)}">${escapeHtml(localized.nav[index])}</a>`
  ).join(' · ');
  return `<main hidden data-seo-prerendered="true">
      <h1 style="font-size:clamp(2rem,5vw,4rem);line-height:1.05">${escapeHtml(meta.title.replace(/ \| Volt\.az$/, ''))}</h1>
      <p style="max-width:48rem;font-size:1.1rem;line-height:1.7;color:#475569">${escapeHtml(meta.description)}</p>
      <nav aria-label="Primary">${links}</nav>
    </main>`;
};

const render = (template, route, language, dynamic) => {
  const meta = pageMeta(route, language, dynamic);
  const canonical = absolute(route, language);
  const image = dynamic?.image || `${SITE}/volt-site-icon.png`;
  const type = dynamic?.kind === 'product' ? 'product' : dynamic?.kind === 'blog' || dynamic?.kind === 'news' ? 'article' : 'website';
  const schema = route === '/solar-installation'
    ? {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: text[language].installation,
        description: text[language].installationDescription,
        url: canonical,
        provider: { '@id': `${SITE}/#organization` },
        areaServed: { '@type': 'Country', name: 'Azerbaijan' },
        inLanguage: language,
      }
    : dynamic?.kind === 'product'
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          '@id': `${canonical}#product`,
          name: meta.title.replace(/ \| Volt\.az$/, ''),
          description: meta.description,
          url: canonical,
          sku: dynamic.id,
          ...(dynamic.image ? { image: [dynamic.image] } : {}),
          inLanguage: language,
        }
      : dynamic?.kind === 'blog' || dynamic?.kind === 'news'
        ? {
            '@context': 'https://schema.org',
            '@type': dynamic.kind === 'news' ? 'NewsArticle' : 'BlogPosting',
            '@id': `${canonical}#article`,
            headline: meta.title.replace(/ \| Volt\.az$/, ''),
            description: meta.description,
            mainEntityOfPage: canonical,
            ...(dynamic.image ? { image: [dynamic.image] } : {}),
            ...(dynamic.lastmod ? { dateModified: dynamic.lastmod } : {}),
            publisher: { '@id': `${SITE}/#organization` },
            inLanguage: language,
          }
        : null;
  const extraSchema = schema
    ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
    : '';

  let html = template
    .replace(/<html\b[^>]*lang="[^"]*"([^>]*)>/i, `<html lang="${language}"$1>`)
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`)
    .replace(/\s*<meta\s+name="description"[^>]*>/gi, '')
    .replace(/\s*<meta\s+name="robots"[^>]*>/gi, '')
    .replace(/\s*<meta\s+name="googlebot"[^>]*>/gi, '')
    .replace(/\s*<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/\s*<link\s+rel="alternate"\s+hreflang="[^"]+"[^>]*>/gi, '')
    .replace(/\s*<meta\s+property="og:(?:type|url|title|description|image)"[^>]*>/gi, '')
    .replace(/\s*<meta\s+property="og:locale"[^>]*>/gi, '')
    .replace(/\s*<meta\s+property="twitter:(?:card|title|description|image)"[^>]*>/gi, '');

  const tags = `
    <meta name="description" content="${escapeHtml(meta.description)}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <link rel="canonical" href="${canonical}">
    ${alternates(route)}
    <meta property="og:type" content="${type}">
    <meta property="og:locale" content="${language === 'az' ? 'az_AZ' : language === 'en' ? 'en_US' : language === 'ru' ? 'ru_RU' : 'tr_TR'}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:title" content="${escapeHtml(meta.title)}">
    <meta property="og:description" content="${escapeHtml(meta.description)}">
    <meta property="og:image" content="${escapeHtml(image)}">
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:title" content="${escapeHtml(meta.title)}">
    <meta property="twitter:description" content="${escapeHtml(meta.description)}">
    <meta property="twitter:image" content="${escapeHtml(image)}">
    ${extraSchema}`;

  html = html.replace('</head>', `${tags}\n</head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${fallbackMarkup(route, language, meta)}</div>`);
  return html;
};

const template = await fs.readFile(path.join(DIST, 'index.html'), 'utf8');
let dynamicRoutes = [];
try {
  const dynamicRouteSource = await fs.readFile(path.join(ROOT, '.seo-cache', 'routes.json'), 'utf8');
  dynamicRoutes = JSON.parse(dynamicRouteSource);
} catch {
  console.warn('No SEO route cache found; prerendering static routes only.');
}

const allRoutes = [
  ...staticRoutes.map((route) => ({ path: route })),
  ...dynamicRoutes,
];

for (const item of allRoutes) {
  for (const language of item.availableLanguages || LANGUAGES) {
    const localized = localizedPath(item.path, language);
    const target = routeFile(localized);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, render(template, item.path, language, item.kind ? item : undefined), 'utf8');
  }
}

const notFound = render(template, '/', 'az')
  .replace(/<title>[\s\S]*?<\/title>/i, '<title>Səhifə tapılmadı | Volt.az</title>')
  .replace(/<meta name="robots"[^>]*>/i, '<meta name="robots" content="noindex, nofollow">')
  .replace(/<meta name="googlebot"[^>]*>/i, '<meta name="googlebot" content="noindex, nofollow">')
  .replace(/\s*<link rel="canonical"[^>]*>/gi, '')
  .replace(/\s*<link rel="alternate" hreflang="[^"]+"[^>]*>/gi, '')
  .replace(/<main(?: hidden)? data-seo-prerendered="true"[\s\S]*?<\/main>/i, '<main data-seo-prerendered="true" style="max-width:50rem;margin:8rem auto;padding:2rem"><h1>Səhifə tapılmadı</h1><p>Axtardığınız səhifə mövcud deyil.</p><a href="/">Ana səhifəyə qayıt</a></main>');
await fs.writeFile(path.join(DIST, '404.html'), notFound, 'utf8');
const webConfigPath = path.join(DIST, 'web.config');
try {
  const webConfig = await fs.readFile(webConfigPath, 'utf8');
  await fs.writeFile(webConfigPath, webConfig.replaceAll('__PRERENDER_DIR__', prerenderDirectory), 'utf8');
} catch {
  console.warn('dist/web.config was not found; prerender rewrite rules were not versioned.');
}
await fs.rm(path.join(ROOT, '.seo-cache'), { recursive: true, force: true });

console.log(`Prerendered ${staticRoutes.length * LANGUAGES.length + dynamicRoutes.reduce((total, route) => total + (route.availableLanguages?.length || LANGUAGES.length), 0)} SEO pages in ${prerenderDirectory} with translation-aware indexing.`);
