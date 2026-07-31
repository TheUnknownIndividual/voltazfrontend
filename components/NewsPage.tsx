
import React, { useState } from 'react';
import { useNews } from "../contexts/NewsContext";
import { absoluteSiteUrl, localizePath } from '../utils/seoRoutes';

interface NewsItem {
  id: string;
  category: string;
  date: string;
  title: string;
  summary: string;
  image: string;
  link: string;
  source: string;
  publishedAt?: string;
  updatedAt?: string;
}

interface NewsPageProps {
  lang?: LangCode;
  onBack?: () => void;
  initialId?: string;
  onNavigate?: (page: any, id?: string) => void;
}

const newsData: NewsItem[] = [
  {
    id: 'n1',
    category: 'Rəsmi Açılış',
    date: '26 Oktyabr 2023',
    title: "Azərbaycanda 230 MVt gücündə Qaradağ Günəş Elektrik Stansiyasının açılışı olub",
    summary: "Xəzər regionunda və MDB məkanında ən böyük günəş elektrik stansiyası olan bu layihə Azərbaycanın yaşıl enerji keçidində tarixi addımdır.",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=1200",
    link: "https://president.az/az/articles/view/61821",
    source: "President.az"
  },
  {
    id: 'n2',
    category: 'Qanunvericilik',
    date: '15 May 2024',
    title: "Bərpa olunan enerji mənbələri üzrə hərracların keçirilməsi qaydaları təsdiqlənib",
    summary: "Nazirlər Kabineti bərpa olunan enerji sahəsində investorların cəlb edilməsi üçün şəffaf hərrac mexanizmini təsdiq edən yeni qərar qəbul edib.",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200",
    link: "https://e-qanun.az/framework/57000",
    source: "E-qanun.az"
  },
  {
    id: 'n3',
    category: 'COP29',
    date: '12 Yanvar 2024',
    title: "Azərbaycan 2024-cü ili 'Yaşıl dünya naminə həmrəylik ili' elan edib",
    summary: "Prezident İlham Əliyevin Sərəncamı ilə Azərbaycanda COP29 konfransına hazırlıq çərçivəsində ekoloji layihələrin icrası sürətləndirilir.",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=1200",
    link: "https://president.az/az/articles/view/62744",
    source: "President.az"
  },
  {
    id: 'n4',
    category: 'Strateji Hədəflər',
    date: '05 Aprel 2024',
    title: "Energetika Nazirliyi: 2030-cu ilə qədər hədəf 30% bərpa olunan enerjidir",
    summary: "Azərbaycanın enerji balansında yaşıl enerjinin payının artırılması məqsədilə 7 QVt-dan çox qoyuluş gücü planlaşdırılır.",
    image: "https://images.unsplash.com/photo-1466611653911-954ffaa13b6f?auto=format&fit=crop&q=80&w=1200",
    link: "https://minenergy.gov.az/az/berpa-olunan-enerji/strateji-hedefler",
    source: "Minenergy.gov.az"
  },
  {
    id: 'n5',
    category: 'İnnovasiya',
    date: '20 Fevral 2024',
    title: "Yaşıl Enerji Zonası: İşğaldan azad edilmiş ərazilərdə solar layihələr",
    summary: "Qarabağ və Şərqi Zəngəzurda 'Sıfır Emissiya' zonası konsepsiyası çərçivəsində yeni günəş paneli parkları salınır.",
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=1200",
    link: "https://minenergy.gov.az/az/layiheler/yasil-enerji-zonasi",
    source: "Minenergy.gov.az"
  }
];

const LANGUAGES = [
  { code: 'az', name: 'Azərbaycan' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'tr', name: 'Türkçe' },
] as const;

type LangCode = typeof LANGUAGES[number]['code'];

const NewsPage: React.FC<NewsPageProps> = ({ onBack, lang, initialId, onNavigate }) => {
  const currentLang = lang || 'az';
  const { getPublicNews, getNewsById } = useNews();

  const [news, setNews] = React.useState<any[]>([]);
  const [selectedNews, setSelectedNews] = React.useState<any | null>(null);

  const mapNewsItem = (item: any) => {
    const requestedLangItem =
      item.languages?.find((l: any) =>
        (currentLang === 'az' && l.languageCode === 1) ||
        (currentLang === 'en' && l.languageCode === 2) ||
        (currentLang === 'ru' && l.languageCode === 3) ||
        (currentLang === 'tr' && l.languageCode === 4)
      );
    const langItem = requestedLangItem || item.languages?.[0];
    const resolvedLanguage = ({ 1: 'az', 2: 'en', 3: 'ru', 4: 'tr' } as const)[langItem?.languageCode as 1 | 2 | 3 | 4] || 'az';

    return {
      id: item.id,
      title: langItem?.title,
      summary: langItem?.content,
      image: item.coverImagePath,
      link: item.postLink,
      source: item.source,
      date: new Date(item.createdAt).toLocaleDateString("az-AZ"),
      publishedAt: item.createdAt,
      updatedAt: item.updatedAt || undefined,
      category: langItem?.description,
      requestedLanguageAvailable: Boolean(requestedLangItem),
      resolvedLanguage,
    };
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPublicNews();
        const mapped = (res.data || res || []).map(mapNewsItem);

        setNews(mapped);
      } catch (err) {
        console.error(err);
        setNews([]);
      }
    };

    fetchData();
  }, [currentLang]);

  React.useEffect(() => {
    if (!initialId) {
      setSelectedNews(null);
      return;
    }

    let cancelled = false;
    const loadNews = async () => {
      try {
        const data = await getNewsById(initialId);
        if (!cancelled) setSelectedNews(mapNewsItem(data));
      } catch (error) {
        console.error(error);
      }
    };

    loadNews();
    return () => {
      cancelled = true;
    };
  }, [initialId, currentLang]);

  React.useEffect(() => {
    if (!selectedNews) return;

    const title = selectedNews.title || 'Volt.az News';
    const summary = String(selectedNews.summary || selectedNews.category || '')
      .replace(/\s+/g, ' ')
      .trim();
    const description = (
      summary.toLocaleLowerCase().includes(String(title).toLocaleLowerCase())
        ? summary
        : `${title}. ${summary}`
    ).slice(0, 155);
    const canonicalLanguage = selectedNews.requestedLanguageAvailable ? currentLang : selectedNews.resolvedLanguage;
    const canonicalUrl = absoluteSiteUrl(localizePath(`/news/${selectedNews.id}`, canonicalLanguage));
    const robots = selectedNews.requestedLanguageAvailable
      ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      : 'noindex, follow';
    const setMeta = (selector: string, attr: 'content' | 'href', value: string, create?: () => HTMLElement) => {
      let element = document.head.querySelector(selector) as HTMLElement | null;
      if (!element && create) {
        element = create();
        document.head.appendChild(element);
      }
      element?.setAttribute(attr, value);
    };

    document.title = `${title} | Volt.az`;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[name="robots"]', 'content', robots);
    setMeta('meta[name="googlebot"]', 'content', robots);
    setMeta('meta[property="og:type"]', 'content', 'article');
    setMeta('meta[property="og:title"]', 'content', `${title} | Volt.az`);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    if (selectedNews.image) {
      setMeta('meta[property="twitter:card"]', 'content', 'summary_large_image');
      setMeta('meta[property="og:image"]', 'content', selectedNews.image, () => {
        const tag = document.createElement('meta');
        tag.setAttribute('property', 'og:image');
        return tag;
      });
      setMeta('meta[property="twitter:image"]', 'content', selectedNews.image, () => {
        const tag = document.createElement('meta');
        tag.setAttribute('property', 'twitter:image');
        return tag;
      });
    }
    setMeta('meta[property="twitter:title"]', 'content', `${title} | Volt.az`);
    setMeta('meta[property="twitter:description"]', 'content', description);
    setMeta('link[rel="canonical"]', 'href', canonicalUrl);

    const image = selectedNews.image
      ? (/^https?:\/\//i.test(selectedNews.image) ? selectedNews.image : `https://volt.az${selectedNews.image.startsWith('/') ? '' : '/'}${selectedNews.image}`)
      : undefined;
    const newsJsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'NewsArticle',
          '@id': `${canonicalUrl}#article`,
          headline: title,
          description,
          mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
          ...(selectedNews.publishedAt ? {
            datePublished: selectedNews.publishedAt,
            dateModified: selectedNews.updatedAt || selectedNews.publishedAt,
          } : {}),
          ...(image ? { image: [image] } : {}),
          author: selectedNews.source
            ? { '@type': 'Organization', name: selectedNews.source }
            : { '@type': 'Organization', name: 'SOLARIX MMC' },
          publisher: { '@id': 'https://volt.az/#organization' },
          inLanguage: currentLang,
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${canonicalUrl}#breadcrumb`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Ana səhifə', item: 'https://volt.az/' },
            { '@type': 'ListItem', position: 2, name: 'Xəbərlər', item: 'https://volt.az/news' },
            { '@type': 'ListItem', position: 3, name: title, item: canonicalUrl },
          ],
        },
      ],
    };
    let script = document.getElementById('volt-news-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'volt-news-jsonld';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(newsJsonLd);

    return () => document.getElementById('volt-news-jsonld')?.remove();
  }, [selectedNews]);

  const handleBackClick = () => {
    if (selectedNews) {
      setSelectedNews(null);
      onNavigate?.('news');
      return;
    }

    onBack?.();
  };

  const t = {
    title: {
      az: "Xəbərlər və Yeniliklər",
      en: "News & Updates",
      ru: "Новости и обновления",
      tr: "Haberler ve Güncellemeler",
    },

    back: {
      az: "Geri qayıt",
      en: "Back",
      ru: "Назад",
      tr: "Geri dön",
    },

    readMore: {
      az: "Rəsmi mənbəyə keçid",
      en: "Go to official source",
      ru: "Перейти к официальному источнику",
      tr: "Resmî kaynağa git",
    },

    subtitle: {
      az: "Azərbaycanın enerji sektorundakı ən son rəsmi məlumatlar",
      en: "Latest official updates in Azerbaijan energy sector",
      ru: "Последние официальные новости энергетического сектора Азербайджана",
      tr: "Azerbaycan enerji sektöründeki en son resmî gelişmeler",
    },
    quote: {
    az: "Azərbaycanın enerji gələcəyi yaşıl rəngdədir.",
    en: "Azerbaijan’s energy future is green.",
    ru: "Энергетическое будущее Азербайджана — зелёное.",
    tr: "Azerbaycan’ın enerji geleceği yeşil renktedir.",
  },

  description: {
    az: "Biz hər gün bu hədəfə bir addım daha yaxınlaşmaq üçün çalışırıq. Ən son rəsmi layihələrdən xəbərdar olmaq üçün rəsmi dövlət portallarını izləməyi unutmayın.",
    en: "We work every day to get one step closer to this goal. Don’t forget to follow official state portals for the latest official projects.",
    ru: "Мы ежедневно работаем, чтобы приблизиться к этой цели. Не забывайте следить за официальными государственными порталами для получения последних проектов.",
    tr: "Bu hedefe her gün bir adım daha yaklaşmak için çalışıyoruz. En son resmî projeler için devlet portallarını takip etmeyi unutmayın.",
  },
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <section className="bg-emerald-950 py-4 border-b border-emerald-900/50 sticky z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between">
          <button onClick={handleBackClick} className="flex items-center gap-1.5 text-emerald-300/60 hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t.back[currentLang]}
          </button>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">{selectedNews?.title || t.title[currentLang]}</h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          {selectedNews ? (
            <article className="mx-auto max-w-4xl rounded-[3rem] border border-slate-100 bg-white shadow-2xl overflow-hidden">
              {selectedNews.image && (
                <div className="aspect-video w-full overflow-hidden bg-slate-100">
                  <img src={selectedNews.image} alt={selectedNews.title || ''} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="p-8 md:p-14">
                <div className="mb-6 flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>{selectedNews.date}</span>
                  {selectedNews.source && <span>{selectedNews.source}</span>}
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">{selectedNews.title}</h2>
                {selectedNews.category && (
                  <div className="mt-6 inline-flex rounded-full bg-emerald-600 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white">
                    {selectedNews.category}
                  </div>
                )}
                <div className="mt-8 space-y-5 text-base leading-relaxed text-slate-600">
                  {(selectedNews.summary || '').split('\n').map((paragraph: string, index: number) => (
                    <p key={index}>{paragraph.trim()}</p>
                  ))}
                </div>
                {selectedNews.link && (
                  <a
                    href={selectedNews.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-10 inline-flex rounded-2xl bg-slate-900 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-emerald-600"
                  >
                    {t.readMore[currentLang]}
                  </a>
                )}
              </div>
            </article>
          ) : (
            <>
          <div className="mb-16 text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">{t.title[currentLang]}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-sm md:text-base font-medium opacity-80">{t.subtitle[currentLang]}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedNews(item);
                  onNavigate?.('news', item.id);
                }}
                className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col cursor-pointer"
              >
                {/* Image Wrap */}
                <div className="relative aspect-video overflow-hidden">
                  <img src={item.image} alt={item.title || ''} className="w-full h-full transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 left-4">
                    <div className="bg-emerald-600 px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest shadow-lg">
                      {item.category || ''}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-grow text-left">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {item.date}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight mb-4 group-hover:text-emerald-600 transition-colors">
                    {item.title || ''}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed opacity-80 line-clamp-3 mb-3">
                    {item.summary || ''}
                  </p>

                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      Mənbə: {item.source}
                    </span>

                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="theme-more-link group/link"
                    >
                      {t.readMore[currentLang]}
                      <svg
                        className="w-3.5 h-3.5 transform group-hover/link:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {news.length === 0 && (
            <div className="py-20 text-center font-black text-slate-400 uppercase tracking-widest text-xs">
              Heç bir xəbər tapılmadı
            </div>
          )}
          </>
          )}
        </div>
      </section>

      {/* Newsletter / Info Footer Section */}
      <section className="bg-emerald-600 py-20 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <h3 className="text-2xl md:text-4xl font-black italic">"{t.quote[currentLang]}"</h3>
          <p className="text-emerald-50/80 text-sm max-w-xl mx-auto leading-relaxed">
             {t.description[currentLang]}
          </p>
        </div>
      </section>
    </div>
  );
};

export default NewsPage;
