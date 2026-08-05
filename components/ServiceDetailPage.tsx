import React, { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { useService, type ServiceItem } from '../contexts/ServiceContext';
import { absoluteSiteUrl, localizePath } from '../utils/seoRoutes';

type LangCode = 'az' | 'en' | 'ru' | 'tr';

interface ServiceDetailPageProps {
  slug: string;
  lang: LangCode;
  onBack: () => void;
}

const LANGUAGE_CODES: Record<LangCode, number> = { az: 1, en: 2, ru: 3, tr: 4 };
const LANGUAGE_NAMES: Record<number, LangCode> = { 1: 'az', 2: 'en', 3: 'ru', 4: 'tr' };
const COPY = {
  loading: { az: 'Yüklənir…', en: 'Loading…', ru: 'Загрузка…', tr: 'Yükleniyor…' },
  notFound: { az: 'Səhifə tapılmadı', en: 'Page not found', ru: 'Страница не найдена', tr: 'Sayfa bulunamadı' },
  back: { az: 'Geri qayıt', en: 'Go back', ru: 'Назад', tr: 'Geri dön' },
};

const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({ slug, lang, onBack }) => {
  const { getServiceBySlug } = useService();
  const [service, setService] = useState<ServiceItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void getServiceBySlug(slug).then((result) => {
      if (!cancelled) setService(result);
    }).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [slug, lang]);

  const language = service?.languages?.find((item) => item.languageCode === LANGUAGE_CODES[lang])
    || service?.languages?.find((item) => item.languageCode === 1)
    || service?.languages?.[0];
  const bullets = language
    ? [language.content1, language.content2, language.content3, language.content4].filter(Boolean)
    : [];
  const safeHtml = useMemo(
    () => DOMPurify.sanitize(language?.detailContentHtml || ''),
    [language?.detailContentHtml]
  );

  useEffect(() => {
    if (!service || !language) return;

    const pageTitle = language.seoTitle?.trim() || `${language.title} | Volt.az`;
    const description = language.seoDescription?.trim() || language.description;
    const keywords = language.seoKeywords?.trim() || '';
    const requestedLanguageAvailable = language.languageCode === LANGUAGE_CODES[lang];
    const resolvedLanguage = LANGUAGE_NAMES[language.languageCode] || 'az';
    const canonicalLanguage = requestedLanguageAvailable ? lang : resolvedLanguage;
    const canonicalUrl = absoluteSiteUrl(localizePath(`/services/${slug}`, canonicalLanguage));
    const robots = requestedLanguageAvailable
      ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      : 'noindex, follow';
    const imageUrl = service.bannerImageUrl
      ? (/^https?:\/\//i.test(service.bannerImageUrl)
        ? service.bannerImageUrl
        : `https://volt.az${service.bannerImageUrl.startsWith('/') ? '' : '/'}${service.bannerImageUrl}`)
      : '';
    const setMeta = (selector: string, attributeName: string, attributeValue: string, create: () => HTMLElement) => {
      let element = document.head.querySelector(selector) as HTMLElement | null;
      if (!element) {
        element = create();
        document.head.appendChild(element);
      }
      element.setAttribute(attributeName, attributeValue);
    };
    const meta = (selector: string, attribute: 'name' | 'property', key: string, content: string) => {
      setMeta(selector, 'content', content, () => {
        const element = document.createElement('meta');
        element.setAttribute(attribute, key);
        return element;
      });
    };

    document.title = pageTitle;
    meta('meta[name="description"]', 'name', 'description', description);
    meta('meta[name="keywords"]', 'name', 'keywords', keywords);
    meta('meta[name="robots"]', 'name', 'robots', robots);
    meta('meta[name="googlebot"]', 'name', 'googlebot', robots);
    meta('meta[property="og:type"]', 'property', 'og:type', 'website');
    meta('meta[property="og:title"]', 'property', 'og:title', pageTitle);
    meta('meta[property="og:description"]', 'property', 'og:description', description);
    meta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    meta('meta[name="twitter:card"]', 'name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary');
    meta('meta[name="twitter:title"]', 'name', 'twitter:title', pageTitle);
    meta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    if (imageUrl) {
      meta('meta[property="og:image"]', 'property', 'og:image', imageUrl);
      meta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);
    }
    setMeta('link[rel="canonical"]', 'href', canonicalUrl, () => {
      const element = document.createElement('link');
      element.setAttribute('rel', 'canonical');
      return element;
    });

    let script = document.getElementById('volt-service-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'volt-service-jsonld';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: language.title,
      description,
      url: canonicalUrl,
      ...(imageUrl ? { image: imageUrl } : {}),
      provider: { '@id': 'https://volt.az/#organization' },
      areaServed: { '@type': 'Country', name: 'Azerbaijan' },
      inLanguage: resolvedLanguage,
    });

    return () => document.getElementById('volt-service-jsonld')?.remove();
  }, [lang, language, service, slug]);

  if (isLoading) {
    return <div className="flex min-h-[55vh] items-center justify-center bg-slate-50 text-sm font-bold text-slate-400">{COPY.loading[lang]}</div>;
  }

  if (!service || !language) {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-5 bg-slate-50 px-4 text-center">
        <h1 className="text-2xl font-black text-slate-900">{COPY.notFound[lang]}</h1>
        <button type="button" onClick={onBack} className="rounded-xl bg-[var(--color-dark)] px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[var(--color-primary)] hover:text-[var(--color-dark)]">{COPY.back[lang]}</button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <section className="relative isolate min-h-64 overflow-hidden bg-[var(--color-dark)] md:min-h-72">
        {service.bannerImageUrl && (
          <img src={service.bannerImageUrl} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        )}
        <div
          className="absolute inset-0 -z-10"
          style={{ background: 'linear-gradient(90deg, color-mix(in srgb, var(--color-dark) 96%, transparent), color-mix(in srgb, var(--color-dark) 84%, transparent) 58%, color-mix(in srgb, var(--color-dark) 48%, transparent))' }}
        />
        <div className="mx-auto flex min-h-64 max-w-6xl flex-col justify-center px-4 py-12 md:min-h-72 md:px-12 md:py-14">
          <button
            type="button"
            onClick={onBack}
            className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-sm transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-dark)] md:mb-8"
          >
            <span aria-hidden="true">←</span> {COPY.back[lang]}
          </button>
          <h1 className="max-w-4xl text-3xl font-black leading-tight text-white md:text-5xl">{language.title}</h1>
          <p className="mt-5 max-w-3xl text-sm font-medium leading-relaxed text-white/75 md:text-base">{language.description}</p>
        </div>
      </section>

      <article className="service-detail-content mx-auto mt-10 max-w-4xl rounded-[2rem] border border-slate-100 bg-white p-7 shadow-xl shadow-slate-900/5 md:p-12">
        {safeHtml ? (
          <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
        ) : (
          <>
            <p>{language.description}</p>
            {bullets.length > 0 && (
              <ul>{bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
            )}
          </>
        )}
      </article>
    </main>
  );
};

export default ServiceDetailPage;
