import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = process.env.BUILD_DIR
  ? path.resolve(process.env.BUILD_DIR)
  : path.join(ROOT, 'dist');
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

const staticRoutes = [
  '/', '/about', '/services', '/solar-installation', '/solar-panels', '/inverters', '/projects', '/products',
  '/calculator', '/contact', '/videos', '/faq', '/how-to-start',
  '/necessary-documents', '/legislation', '/credits', '/partnership', '/pro-club',
  '/privacy-policy', '/data-deletion', '/terms-of-service', '/purchase-terms', '/news', '/blog',
];

const text = {
  az: {
    site: 'Volt.az',
    home: 'Solar Enerji və Günəş Panelləri Azərbaycanda',
    description: 'Azərbaycanda ev və biznes üçün günəş panelləri, invertorlar, enerji saxlama, layihələndirmə və quraşdırma həlləri.',
    installation: 'Günəş Paneli Quraşdırılması Azərbaycanda',
    installationDescription: '5, 10 və 15 kW günəş enerjisi paketləri: Growatt inverter, 650 W panellər, montaj konstruksiyası və şəbəkəyə qoşulma 4 250 AZN-dən.',
    panels: 'Günəş Panelləri (Gunes Panel) Satışı və Qiymət',
    panelsH1: 'Azərbaycanda Günəş Panelləri Satışı',
    panelsDescription: 'Günəş panelləri və gunes panel sistemləri: LONGi modelləri, texniki göstəricilər, qiymət təklifi və ev, biznes və iri layihələr üçün quraşdırma.',
    inverters: 'Günəş İnvertorları Satışı və Qiymətləri',
    invertersH1: 'Azərbaycanda Günəş İnvertorlarının Satışı',
    invertersDescription: 'Günəş invertorları: Growatt şəbəkəli, hibrid və şəbəkədənkənar modellər, texniki göstəricilər, stok məlumatı və layihəyə uyğun qiymət təklifi.',
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
    installationDescription: '5, 10, and 15 kW solar installation packages with Growatt inverters, 650 W panels, mounting structures, and grid connection from 4,250 AZN.',
    panels: 'Solar Panels for Sale and Prices in Azerbaijan', panelsH1: 'Solar Panels for Sale in Azerbaijan', panelsDescription: 'Solar panels and LONGi systems in Azerbaijan: specifications, quotations, warranties, stock, and installation for homes, businesses, and large projects.',
    inverters: 'Solar Inverters for Sale and Prices in Azerbaijan', invertersH1: 'Solar Inverters for Sale in Azerbaijan', invertersDescription: 'Growatt solar inverters in Azerbaijan: grid-tied, hybrid, and off-grid models, specifications, stock information, technical selection, and quotations.',
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
    installationDescription: 'Пакеты солнечной установки 5, 10 и 15 кВт с инверторами Growatt, панелями 650 Вт, монтажной конструкцией и подключением к сети от 4 250 AZN.',
    panels: 'Солнечные панели: продажа и цены в Азербайджане', panelsH1: 'Продажа солнечных панелей в Азербайджане', panelsDescription: 'Солнечные панели LONGi в Азербайджане: характеристики, цены, гарантия, наличие и монтаж для дома, бизнеса и крупных проектов.',
    inverters: 'Солнечные инверторы: продажа и цены в Азербайджане', invertersH1: 'Продажа солнечных инверторов в Азербайджане', invertersDescription: 'Солнечные инверторы Growatt в Азербайджане: сетевые, гибридные и автономные модели, характеристики, наличие, подбор и расчет цены.',
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
    installationDescription: 'Growatt inverter, 650 W paneller, montaj konstrüksiyonu ve şebeke bağlantısı içeren 5, 10 ve 15 kW güneş kurulum paketleri 4.250 AZN’den.',
    panels: 'Güneş Panelleri Satışı ve Fiyatları', panelsH1: 'Azerbaycan’da Güneş Paneli Satışı', panelsDescription: 'Azerbaycan’da LONGi güneş panelleri: teknik özellikler, fiyat teklifi, garanti, stok ve profesyonel kurulum.',
    inverters: 'Güneş İnverteri Satışı ve Fiyatları', invertersH1: 'Azerbaycan’da Güneş İnverteri Satışı', invertersDescription: 'Azerbaycan’da Growatt güneş inverterleri: şebeke bağlantılı, hibrit ve bağımsız modeller, teknik özellikler, stok ve fiyat teklifi.',
    calculator: 'Güneş Enerjisi Hesaplayıcı',
    calculatorDescription: 'Sistem gücünü, yıllık üretimi, tahmini fiyatı ve elektrik tasarrufunu hesaplayın.',
    nav: ['Kurulum', 'Ürünler', 'Hesaplayıcı', 'Projeler', 'İletişim'],
    kind: { product: 'Ürün', project: 'Proje', blog: 'Blog', news: 'Haber' },
  },
};

const installationPackages = [
  { capacity: '5 kW', price: '4 250 AZN', panels: '9 × 650 W', inverter: 'Growatt MIN 5000TL-X2' },
  { capacity: '10 kW', price: '8 500 AZN', panels: '17 × 650 W', inverter: 'Growatt MIN 10000TL-X2 / Growatt MOD10KTL3-X2' },
  { capacity: '15 kW', price: '12 750 AZN', panels: '26 × 650 W', inverter: 'Growatt MOD15KTL3-X2' },
];

const installationFaqs = {
  az: [['Paketin qiymətinə nələr daxildir?', 'Hər paketə göstərilən sayda 650 W günəş panelləri, qeyd olunan Growatt inverter, montaj konstruksiyası və şəbəkəyə qoşulma daxildir. Batareya və siyahıda göstərilməyən əlavə işlər paketə daxil deyil.'], ['Mənim üçün hansı paket uyğundur?', 'Uyğun paket aylıq elektrik sərfiyyatı, dam sahəsi, kölgələnmə və obyektin şəbəkə xüsusiyyətlərinə görə seçilir.'], ['Quraşdırma nə qədər vaxt aparır?', 'Əksər yaşayış obyektlərində quraşdırma adətən 1–3 gün çəkir və obyektin texniki şəraitinə görə dəyişə bilər.'], ['Şəbəkə kəsiləndə sistem işləyəcəkmi?', 'Standart on-grid sistem təhlükəsizlik səbəbi ilə şəbəkə kəsildikdə dayanır. Ehtiyat enerji üçün ayrıca uyğun hibrid inverter və batareya tələb olunur.']],
  en: [['What is included in the package price?', 'Each package includes the listed number of 650 W solar panels, the specified Growatt inverter, mounting structure, and grid connection. Batteries and additional work not listed here are not included.'], ['Which package is right for me?', 'The right package depends on monthly electricity use, roof area, shading, and the grid configuration at the property.'], ['How long does installation take?', 'Installation at most residential properties usually takes 1–3 days and can vary with site conditions.'], ['Will the system work during a power cut?', 'The standard on-grid system shuts down during a grid outage for safety. Backup power requires a separate compatible hybrid inverter and battery.']],
  ru: [['Что входит в стоимость пакета?', 'Каждый пакет включает указанное количество панелей 650 Вт, соответствующий инвертор Growatt, монтажную конструкцию и подключение к сети. Аккумуляторы и неуказанные дополнительные работы не входят.'], ['Какой пакет подойдет мне?', 'Выбор зависит от ежемесячного потребления, площади крыши, затенения и параметров сети на объекте.'], ['Сколько времени занимает установка?', 'На большинстве жилых объектов установка обычно занимает 1–3 дня и зависит от технических условий.'], ['Будет ли система работать при отключении сети?', 'Стандартная сетевая система отключается при пропадании сети из соображений безопасности. Для резерва нужны отдельные совместимые гибридный инвертор и аккумулятор.']],
  tr: [['Paket fiyatına neler dahildir?', 'Her pakete belirtilen sayıda 650 W güneş paneli, ilgili Growatt inverter, montaj konstrüksiyonu ve şebeke bağlantısı dahildir. Batarya ve belirtilmeyen ek işler dahil değildir.'], ['Hangi paket benim için uygun?', 'Uygun paket aylık elektrik tüketimi, çatı alanı, gölgelenme ve tesisin şebeke yapısına göre seçilir.'], ['Kurulum ne kadar sürer?', 'Çoğu konut tipi tesiste kurulum genellikle 1–3 gün sürer ve teknik koşullara göre değişebilir.'], ['Elektrik kesildiğinde sistem çalışır mı?', 'Standart şebeke bağlantılı sistem güvenlik nedeniyle kesintide kapanır. Yedek enerji için ayrıca uyumlu hibrit inverter ve batarya gerekir.']],
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
  'data-deletion': ['Məlumatların silinməsi', 'Data Deletion Instructions', 'Удаление данных', 'Veri Silme Talimatları'],
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
  'data-deletion': [
    'Facebook, Messenger, Instagram və WhatsApp məlumatlarının silinməsi üçün Volt.az təlimatları.',
    'Volt.az instructions for requesting deletion of Facebook, Messenger, Instagram, and WhatsApp data.',
    'Инструкции Volt.az по удалению данных Facebook, Messenger, Instagram и WhatsApp.',
    'Facebook, Messenger, Instagram ve WhatsApp verilerinin silinmesi için Volt.az talimatları.',
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
  if (route === '/solar-panels') return SOLAR_PANEL_PATHS[language];
  if (route === '/inverters') return INVERTER_PATHS[language];
  if (language === 'az') return route;
  return route === '/' ? `/${language}` : `/${language}${route}`;
};

const absolute = (route, language) => `${SITE}${localizedPath(route, language)}`;

const pageMeta = (route, language, dynamic) => {
  const localized = text[language];
  if (route === '/') return { title: `${localized.home} | Volt.az`, description: localized.description };
  if (route === '/solar-installation') return { title: `${localized.installation} | Volt.az`, description: localized.installationDescription };
  if (route === '/solar-panels') return { title: `${localized.panels} | Volt.az`, description: localized.panelsDescription };
  if (route === '/inverters') return { title: `${localized.inverters} | Volt.az`, description: localized.invertersDescription };
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
    const productFacts = dynamic.kind === 'product' ? [dynamic.technicalPower, dynamic.effectiveness ? `${dynamic.effectiveness}%` : '', dynamic.price ? `${dynamic.price} AZN` : '', dynamic.inStock ? ({ az: 'stokda', en: 'in stock', ru: 'в наличии', tr: 'stokta' }[language]) : ''].filter(Boolean).join(', ') : '';
    return { title: `${name} | Volt.az`, description: `${description}${productFacts ? ` ${productFacts}.` : ''}`.slice(0, 160) };
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
  if (route === '/solar-installation') {
    const labels = {
      az: { heading: 'Quraşdırılma paketləri', panels: 'Panellər', inverter: 'İnverter', included: 'Bütün paketlərə montaj konstruksiyası və şəbəkəyə qoşulma daxildir.' },
      en: { heading: 'Installation packages', panels: 'Panels', inverter: 'Inverter', included: 'Every package includes a mounting structure and grid connection.' },
      ru: { heading: 'Пакеты установки', panels: 'Панели', inverter: 'Инвертор', included: 'Во все пакеты входят монтажная конструкция и подключение к сети.' },
      tr: { heading: 'Kurulum paketleri', panels: 'Paneller', inverter: 'İnverter', included: 'Tüm paketlere montaj konstrüksiyonu ve şebeke bağlantısı dahildir.' },
    }[language];
    return `<main class="seo-prerender" data-seo-prerendered="true">
      <h1>${escapeHtml(meta.title.replace(/ \| Volt\.az$/, ''))}</h1>
      <p>${escapeHtml(meta.description)}</p>
      <section><h2>${escapeHtml(labels.heading)}</h2>
        ${installationPackages.map((item) => `<article><h3>${escapeHtml(item.capacity)} — ${escapeHtml(item.price)}</h3><p>${escapeHtml(labels.panels)}: ${escapeHtml(item.panels)}. ${escapeHtml(labels.inverter)}: ${escapeHtml(item.inverter)}.</p></article>`).join('')}
        <p>${escapeHtml(labels.included)}</p>
      </section>
      <section><h2>FAQ</h2>${installationFaqs[language].map(([question, answer]) => `<h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p>`).join('')}</section>
      <nav aria-label="Primary">${links}</nav>
    </main>`;
  }
  if (route === '/solar-panels') {
    const panelContent = {
      az: {
        intro: 'Sertifikatlaşdırılmış günəş panellərini layihənizin güc tələbinə, tətbiq sahəsinə və büdcəsinə uyğun seçin.',
        sections: [['Ev və korporativ günəş paneli həlləri', 'Yaşayış, biznes və iri layihələr üçün panel, inverter, konstruksiya və quraşdırma həlləri.'], ['Panel seçimi, səmərəlilik və zəmanət', 'Güc, modul səmərəliliyi, sahə, məhsul və performans zəmanəti və inverter uyğunluğu birlikdə qiymətləndirilir.'], ['LONGi təchizatı və qiymət', 'Orijinal LONGi günəş panelləri, real stok məlumatı və layihəyə uyğun fərdi qiymət təklifi.']],
        faqs: [['Gunes panel qiymetleri necə hesablanır?', 'Qiymət panel, inverter, konstruksiya, qoruma, kabel, logistika və quraşdırmaya görə hesablanır.'], ['Ev üçün neçə günəş paneli lazımdır?', 'Panel sayı sərfiyyat, panel gücü, dam sahəsi, istiqamət və kölgələnməyə əsaslanır.'], ['Solar panel sistemi nə qədər elektrik istehsal edir?', 'İstehsal güc, yerləşmə, istiqamət, kölgə, itkilər və mövsümdən asılıdır.']],
      },
      en: { intro: 'LONGi solar panels, specifications, quotations, warranty, stock, and installation for homes and businesses.', sections: [['Residential and corporate solar solutions', 'Panels and complete systems for homes, commercial facilities, and large projects.'], ['Selection, efficiency, and warranty', 'Compare rated power, efficiency, area requirements, warranties, and inverter compatibility.'], ['LONGi supply and pricing', 'Original LONGi panels and project-specific quotations based on real requirements.']], faqs: [['How are solar panel prices calculated?', 'Pricing includes panels, inverter, mounting, protection, cables, logistics, and installation.'], ['How many solar panels does a home need?', 'Quantity depends on consumption, wattage, roof area, orientation, and shading.'], ['How much electricity does a solar system produce?', 'Production depends on capacity, location, orientation, shading, losses, and season.']] },
      ru: { intro: 'Панели LONGi, технический подбор, гарантия, наличие, расчет цены и монтаж в Азербайджане.', sections: [['Решения для дома и бизнеса', 'Комплексные системы для жилых, коммерческих и крупных объектов.'], ['Выбор, эффективность и гарантия', 'Сравните мощность, КПД, требования к площади, гарантию и совместимость.'], ['Поставка LONGi и цена', 'Оригинальные панели LONGi и индивидуальный расчет проекта.']], faqs: [['Как рассчитывается цена?', 'Учитываются панели, инвертор, крепления, защита, кабели, логистика и монтаж.'], ['Сколько панелей нужно для дома?', 'Количество зависит от потребления, мощности, площади, ориентации и тени.'], ['Сколько энергии производит система?', 'Производство зависит от мощности, места, ориентации, потерь и сезона.']] },
      tr: { intro: 'Ev, işletme ve büyük projeler için LONGi güneş panelleri, teknik seçim, garanti, stok ve kurulum.', sections: [['Konut ve kurumsal çözümler', 'Evler, işletmeler ve büyük projeler için panel ve komple sistemler.'], ['Seçim, verimlilik ve garanti', 'Güç, verimlilik, alan, garanti ve inverter uyumunu karşılaştırın.'], ['LONGi tedariki ve fiyat', 'Orijinal LONGi panelleri ve projeye özel fiyat teklifi.']], faqs: [['Fiyatlar nasıl hesaplanır?', 'Panel, inverter, konstrüksiyon, koruma, kablo, lojistik ve kurulum hesaplanır.'], ['Bir ev için kaç panel gerekir?', 'Sayı tüketim, güç, alan, yön ve gölgeye bağlıdır.'], ['Bir sistem ne kadar elektrik üretir?', 'Üretim kapasite, konum, yön, kayıplar ve mevsime bağlıdır.']] },
    }[language];
    return `<main class="seo-prerender" data-seo-prerendered="true">
      <h1>${escapeHtml(localized.panelsH1)}</h1>
      <p>${escapeHtml(localized.panelsDescription)}</p><p>${escapeHtml(panelContent.intro)}</p>
      ${panelContent.sections.map(([heading, body]) => `<section><h2>${escapeHtml(heading)}</h2><p>${escapeHtml(body)}</p></section>`).join('')}
      <section><h2>FAQ</h2>${panelContent.faqs.map(([question, answer]) => `<h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p>`).join('')}</section>
      <nav aria-label="Primary">${links}</nav>
    </main>`;
  }
  if (route === '/inverters') {
    const inverterContent = {
      az: {
        intro: 'Sistem gücünə, panel konfiqurasiyasına və batareya ehtiyacına uyğun günəş invertoru seçimi və texniki dəstək.',
        sections: [['Ev və korporativ invertor həlləri', 'Yaşayış, biznes və iri layihələr üçün şəbəkəli, hibrid və şəbəkədənkənar invertorlar.'], ['Güc, MPPT və batareya uyğunluğu', 'Faza sayı, panel sətirləri, giriş diapazonu, monitorinq və iş rejimi birlikdə qiymətləndirilir.'], ['Growatt təchizatı və qiymət', 'Mövcud Growatt modelləri, stok məlumatı və layihəyə uyğun fərdi qiymət təklifi.']],
        faqs: [['Günəş invertorunun qiyməti necə hesablanır?', 'Qiymət güc, faza sayı, sistem növü, batareya uyğunluğu, MPPT sayı və qoruma funksiyalarına görə dəyişir.'], ['Ev üçün hansı gücdə invertor lazımdır?', 'Güc sərfiyyat, panel massivinin gücü, eyni vaxtda işləyən yüklər və genişlənmə planına əsasən hesablanır.'], ['Hibrid və şəbəkəli invertor arasında fərq nədir?', 'Hibrid invertor uyğun batareya və ehtiyat enerji ssenarilərini dəstəkləyə bilər.']],
      },
      en: { intro: 'Choose a solar inverter matched to system capacity, panel configuration, operating mode, and battery requirements.', sections: [['Residential and corporate inverter solutions', 'Grid-tied, hybrid, and off-grid inverters for homes, businesses, and large projects.'], ['Power, MPPT, and battery compatibility', 'Phase configuration, strings, input range, monitoring, and operating mode are evaluated together.'], ['Growatt supply and pricing', 'Available Growatt models, stock information, and project-specific quotations.']], faqs: [['How are solar inverter prices calculated?', 'Prices vary by power, phase configuration, system type, battery compatibility, MPPT count, and protection.'], ['What inverter capacity does a home need?', 'Capacity depends on consumption, array size, simultaneous loads, and expansion plans.'], ['What is the difference between hybrid and grid-tied inverters?', 'A compatible hybrid inverter can also support battery storage and backup scenarios.']] },
      ru: { intro: 'Подбор солнечного инвертора по мощности, конфигурации панелей, режиму работы и требованиям к аккумулятору.', sections: [['Решения для дома и бизнеса', 'Сетевые, гибридные и автономные инверторы для жилых, коммерческих и крупных объектов.'], ['Мощность, MPPT и аккумулятор', 'Фазы, стринги, входной диапазон, мониторинг и режим работы оцениваются вместе.'], ['Поставка Growatt и цена', 'Доступные модели Growatt, наличие и индивидуальный расчет проекта.']], faqs: [['Как рассчитывается цена инвертора?', 'Учитываются мощность, фазы, тип системы, аккумулятор, MPPT и защита.'], ['Какая мощность инвертора нужна для дома?', 'Мощность зависит от потребления, массива панелей, нагрузок и планов расширения.'], ['Чем гибридный инвертор отличается от сетевого?', 'Совместимый гибридный инвертор может поддерживать аккумулятор и резервное питание.']] },
      tr: { intro: 'Sistem gücü, panel dizilimi, çalışma şekli ve batarya ihtiyacına uygun güneş inverteri seçimi.', sections: [['Konut ve kurumsal çözümler', 'Evler, işletmeler ve büyük projeler için şebeke bağlantılı, hibrit ve bağımsız inverterler.'], ['Güç, MPPT ve batarya uyumu', 'Faz yapısı, diziler, giriş aralığı, izleme ve çalışma modu birlikte değerlendirilir.'], ['Growatt tedariki ve fiyat', 'Mevcut Growatt modelleri, stok bilgisi ve projeye özel fiyat teklifi.']], faqs: [['Güneş inverteri fiyatı nasıl hesaplanır?', 'Fiyat güç, faz yapısı, sistem türü, batarya, MPPT ve korumaya göre değişir.'], ['Bir ev için hangi güçte inverter gerekir?', 'Güç tüketim, panel dizisi, eş zamanlı yükler ve genişleme planına göre hesaplanır.'], ['Hibrit ve şebeke bağlantılı inverter arasındaki fark nedir?', 'Uyumlu hibrit inverter batarya ve yedek enerji senaryolarını da destekleyebilir.']] },
    }[language];
    return `<main class="seo-prerender" data-seo-prerendered="true">
      <h1>${escapeHtml(localized.invertersH1)}</h1>
      <p>${escapeHtml(localized.invertersDescription)}</p><p>${escapeHtml(inverterContent.intro)}</p>
      ${inverterContent.sections.map(([heading, body]) => `<section><h2>${escapeHtml(heading)}</h2><p>${escapeHtml(body)}</p></section>`).join('')}
      <section><h2>FAQ</h2>${inverterContent.faqs.map(([question, answer]) => `<h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p>`).join('')}</section>
      <nav aria-label="Primary">${links}</nav>
    </main>`;
  }
  return `<main class="seo-prerender" data-seo-prerendered="true">
      <h1 style="font-size:clamp(2rem,5vw,4rem);line-height:1.05">${escapeHtml(meta.title.replace(/ \| Volt\.az$/, ''))}</h1>
      <p style="max-width:48rem;font-size:1.1rem;line-height:1.7;color:#475569">${escapeHtml(meta.description)}</p>
      <nav aria-label="Primary">${links}</nav>
    </main>`;
};

const render = (template, route, language, dynamic) => {
  const meta = pageMeta(route, language, dynamic);
  const canonical = absolute(route, language);
  const image = dynamic?.image || (route === '/solar-installation'
    ? `${SITE}/solar-installation-packages-desktop.webp`
    : route === '/inverters'
      ? `${SITE}/inverters-hero.webp`
      : `${SITE}/volt-site-icon.png`);
  const type = dynamic?.kind === 'product' ? 'product' : dynamic?.kind === 'blog' || dynamic?.kind === 'news' ? 'article' : 'website';
  const schema = route === '/solar-installation'
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Service',
            '@id': `${canonical}#service`,
            name: text[language].installation,
            description: text[language].installationDescription,
            url: canonical,
            provider: { '@id': `${SITE}/#organization` },
            areaServed: { '@type': 'Country', name: 'Azerbaijan' },
            serviceType: 'Solar panel system installation packages',
            inLanguage: language,
          },
          {
            '@type': 'BreadcrumbList',
            '@id': `${canonical}#breadcrumb`,
            itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Volt.az', item: `${SITE}/` }, { '@type': 'ListItem', position: 2, name: text[language].installation, item: canonical }],
          },
          {
            '@type': 'FAQPage',
            '@id': `${canonical}#faq`,
            mainEntity: installationFaqs[language].map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
          },
        ],
      }
    : route === '/solar-panels'
      ? (() => {
          const products = dynamicRoutes
            .filter((item) => item.kind === 'product' && item.categorySeoKey === 'solar-panels')
            .slice(0, 5);
          const schemaFaqs = {
            az: [['Gunes panel qiymetleri necə hesablanır?', 'Qiymət panel, inverter, konstruksiya, qoruma, kabel, logistika və quraşdırmaya görə hesablanır.'], ['Ev üçün neçə günəş paneli lazımdır?', 'Panel sayı sərfiyyat, panel gücü, dam sahəsi, istiqamət və kölgələnməyə əsaslanır.'], ['Solar panel sistemi nə qədər elektrik istehsal edir?', 'İstehsal güc, yerləşmə, istiqamət, kölgə, itkilər və mövsümdən asılıdır.']],
            en: [['How are solar panel prices calculated?', 'Pricing includes panels, inverter, mounting, protection, cables, logistics, and installation.'], ['How many solar panels does a home need?', 'Quantity depends on consumption, wattage, roof area, orientation, and shading.'], ['How much electricity does a solar system produce?', 'Production depends on capacity, location, orientation, shading, losses, and season.']],
            ru: [['Как рассчитывается цена?', 'Учитываются панели, инвертор, крепления, защита, кабели, логистика и монтаж.'], ['Сколько панелей нужно для дома?', 'Количество зависит от потребления, мощности, площади, ориентации и тени.'], ['Сколько энергии производит система?', 'Производство зависит от мощности, места, ориентации, потерь и сезона.']],
            tr: [['Fiyatlar nasıl hesaplanır?', 'Panel, inverter, konstrüksiyon, koruma, kablo, lojistik ve kurulum hesaplanır.'], ['Bir ev için kaç panel gerekir?', 'Sayı tüketim, güç, alan, yön ve gölgeye bağlıdır.'], ['Bir sistem ne kadar elektrik üretir?', 'Üretim kapasite, konum, yön, kayıplar ve mevsime bağlıdır.']],
          }[language];
          return {
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'CollectionPage', '@id': `${canonical}#collection`, name: text[language].panelsH1, description: text[language].panelsDescription, url: canonical, inLanguage: language, isPartOf: { '@id': `${SITE}/#website` } },
            { '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Volt.az', item: `${SITE}/` }, { '@type': 'ListItem', position: 2, name: text[language].panelsH1, item: canonical }] },
            { '@type': 'FAQPage', '@id': `${canonical}#faq`, mainEntity: schemaFaqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
            ...(products.length ? [{ '@type': 'ItemList', '@id': `${canonical}#products`, itemListElement: products.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.localized?.[language]?.title || item.title, url: `${SITE}${localizedPath(item.path, language)}` })) }] : []),
          ],
        };
        })()
    : route === '/inverters'
      ? (() => {
          const products = dynamicRoutes
            .filter((item) => item.kind === 'product' && item.categorySeoKey === 'inverters')
            .slice(0, 5);
          const schemaFaqs = {
            az: [['Günəş invertorunun qiyməti necə hesablanır?', 'Qiymət güc, faza sayı, sistem növü, batareya uyğunluğu, MPPT sayı və qoruma funksiyalarına görə dəyişir.'], ['Ev üçün hansı gücdə invertor lazımdır?', 'Güc sərfiyyat, panel massivinin gücü, eyni vaxtda işləyən yüklər və genişlənmə planına əsasən hesablanır.'], ['Hibrid və şəbəkəli invertor arasında fərq nədir?', 'Uyğun hibrid invertor batareya və ehtiyat enerji ssenarilərini dəstəkləyə bilər.']],
            en: [['How are solar inverter prices calculated?', 'Prices vary by power, phase configuration, system type, battery compatibility, MPPT count, and protection.'], ['What inverter capacity does a home need?', 'Capacity depends on consumption, array size, simultaneous loads, and expansion plans.'], ['What is the difference between hybrid and grid-tied inverters?', 'A compatible hybrid inverter can also support battery storage and backup scenarios.']],
            ru: [['Как рассчитывается цена инвертора?', 'Учитываются мощность, фазы, тип системы, аккумулятор, MPPT и защита.'], ['Какая мощность инвертора нужна для дома?', 'Мощность зависит от потребления, массива панелей, нагрузок и планов расширения.'], ['Чем гибридный инвертор отличается от сетевого?', 'Совместимый гибридный инвертор может поддерживать аккумулятор и резервное питание.']],
            tr: [['Güneş inverteri fiyatı nasıl hesaplanır?', 'Fiyat güç, faz yapısı, sistem türü, batarya, MPPT ve korumaya göre değişir.'], ['Bir ev için hangi güçte inverter gerekir?', 'Güç tüketim, panel dizisi, eş zamanlı yükler ve genişleme planına göre hesaplanır.'], ['Hibrit ve şebeke bağlantılı inverter arasındaki fark nedir?', 'Uyumlu hibrit inverter batarya ve yedek enerji senaryolarını da destekleyebilir.']],
          }[language];
          return {
            '@context': 'https://schema.org',
            '@graph': [
              { '@type': 'CollectionPage', '@id': `${canonical}#collection`, name: text[language].invertersH1, description: text[language].invertersDescription, url: canonical, inLanguage: language, isPartOf: { '@id': `${SITE}/#website` }, primaryImageOfPage: { '@type': 'ImageObject', contentUrl: `${SITE}/inverters-hero.webp` } },
              { '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Volt.az', item: `${SITE}/` }, { '@type': 'ListItem', position: 2, name: text[language].invertersH1, item: canonical }] },
              { '@type': 'FAQPage', '@id': `${canonical}#faq`, mainEntity: schemaFaqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
              ...(products.length ? [{ '@type': 'ItemList', '@id': `${canonical}#products`, itemListElement: products.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.localized?.[language]?.title || item.title, url: `${SITE}${localizedPath(item.path, language)}` })) }] : []),
            ],
          };
        })()
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
          ...(dynamic.price ? { offers: { '@type': 'Offer', url: canonical, priceCurrency: 'AZN', price: String(dynamic.price), availability: dynamic.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', itemCondition: 'https://schema.org/NewCondition' } } : {}),
          ...((dynamic.technicalPower || dynamic.effectiveness) ? { additionalProperty: [dynamic.technicalPower ? { '@type': 'PropertyValue', name: 'Power', value: String(dynamic.technicalPower) } : null, dynamic.effectiveness ? { '@type': 'PropertyValue', name: 'Efficiency', value: `${dynamic.effectiveness}%` } : null].filter(Boolean) } : {}),
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
  const imagePreload = route === '/'
    ? '<link rel="preload" as="image" href="/sliderphotomobile.webp" media="(max-width: 767px)" fetchpriority="high"><link rel="preload" as="image" href="/sliderphoto.webp" media="(min-width: 768px)" fetchpriority="high">'
    : route === '/solar-installation'
      ? '<link rel="preload" as="image" href="/solar-installation-packages-mobile.webp" media="(max-width: 767px)" fetchpriority="high"><link rel="preload" as="image" href="/solar-installation-packages-desktop.webp" media="(min-width: 768px)" fetchpriority="high">'
      : route === '/solar-panels'
        ? '<link rel="preload" as="image" href="/solar-panels-hero.webp" fetchpriority="high">'
        : route === '/inverters'
          ? '<link rel="preload" as="image" href="/inverters-hero.webp" fetchpriority="high">'
          : dynamic?.kind === 'product' && dynamic.image
            ? `<link rel="preload" as="image" href="${escapeHtml(dynamic.image)}" fetchpriority="high">`
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
    ${imagePreload}
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
