import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import { useBlog } from '../contexts/BlogContext';
import { useNews } from '../contexts/NewsContext';

type Language = 'az' | 'en' | 'ru' | 'tr';

interface HomeContentCarouselProps {
  lang?: Language;
  onNavigate?: (page: any, id?: string, extra?: any) => void;
}

interface CarouselCard {
  key: string;
  id: string;
  type: 'blog' | 'news';
  title: string;
  image: string;
  date: string | null;
}

const MIN_FILL_CARDS = 8; // enough slots to cover the screen before looping
const MAX_CARDS = 20;

const copy = {
  az: {
    eyebrow: 'Bloq və Xəbərlər',
    title: 'Ən son yazılarımız və xəbərlərimiz',
    blogPill: 'Bloq',
    newsPill: 'Xəbər',
    viewBlog: 'Bloqa bax',
    viewNews: 'Xəbərlərə bax',
  },
  en: {
    eyebrow: 'Blog & News',
    title: 'Our latest articles and news',
    blogPill: 'Blog',
    newsPill: 'News',
    viewBlog: 'View blog',
    viewNews: 'View news',
  },
  ru: {
    eyebrow: 'Блог и новости',
    title: 'Наши последние статьи и новости',
    blogPill: 'Блог',
    newsPill: 'Новости',
    viewBlog: 'Смотреть блог',
    viewNews: 'Смотреть новости',
  },
  tr: {
    eyebrow: 'Blog ve Haberler',
    title: 'En son yazılarımız ve haberlerimiz',
    blogPill: 'Blog',
    newsPill: 'Haber',
    viewBlog: 'Bloga git',
    viewNews: 'Haberlere git',
  },
} as const;

const localeByLanguage: Record<Language, string> = {
  az: 'az-AZ',
  en: 'en-US',
  ru: 'ru-RU',
  tr: 'tr-TR',
};

const langCodeByLang: Record<Language, number> = { az: 1, en: 2, ru: 3, tr: 4 };

const SkeletonCard: React.FC = () => (
  <div className="w-[260px] flex-none animate-pulse overflow-hidden rounded-2xl border border-[var(--border-light)] bg-white md:w-[300px]" aria-hidden="true">
    <div className="aspect-video bg-slate-100" />
    <div className="space-y-2 p-4">
      <div className="h-2.5 w-1/3 rounded bg-slate-100" />
      <div className="h-3.5 w-full rounded bg-slate-100" />
      <div className="h-3.5 w-2/3 rounded bg-slate-100" />
    </div>
  </div>
);

const HomeContentCarousel: React.FC<HomeContentCarouselProps> = ({ lang = 'az', onNavigate }) => {
  const t = copy[lang] || copy.az;
  const locale = localeByLanguage[lang] || localeByLanguage.az;
  const { blogs, getBlogs } = useBlog();
  const { publicNews, getPublicNews } = useNews();

  const [blogsLoaded, setBlogsLoaded] = useState(false);
  const [newsLoaded, setNewsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getBlogs().finally(() => { if (!cancelled) setBlogsLoaded(true); });
    void getPublicNews().finally(() => { if (!cancelled) setNewsLoaded(true); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const cards = useMemo<CarouselCard[]>(() => {
    const fromBlogs: CarouselCard[] = (blogs || [])
      .filter((post: any) => post?.image && (post?.title?.[lang] || post?.title?.az))
      .map((post: any) => ({
        key: `blog-${post.id}`,
        id: String(post.id),
        type: 'blog' as const,
        title: post.title?.[lang] || post.title?.az || '',
        image: post.image,
        date: post.date || null,
      }));

    const fromNews: CarouselCard[] = (publicNews || [])
      .map((item: any) => {
        const langItem = (item.languages || []).find((l: any) => l.languageCode === langCodeByLang[lang])
          || (item.languages || [])[0];
        return {
          key: `news-${item.id}`,
          id: String(item.id),
          type: 'news' as const,
          title: langItem?.title || '',
          image: item.coverImagePath || '',
          date: item.createdAt || null,
        };
      })
      .filter((item) => item.image && item.title);

    return [...fromBlogs, ...fromNews]
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
      .slice(0, MAX_CARDS);
  }, [blogs, publicNews, lang]);

  const bothSettled = blogsLoaded && newsLoaded;

  const trackItems = useMemo(() => {
    if (cards.length === 0) return [];
    const filled: CarouselCard[] = [];
    while (filled.length < MIN_FILL_CARDS) {
      filled.push(...cards);
    }
    return filled;
  }, [cards]);

  const uniqueCount = cards.length;

  if (bothSettled && cards.length === 0) return null;

  const showSkeleton = !bothSettled && cards.length === 0;

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="mx-auto max-w-[1440px] px-4 md:px-12">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:mb-12 md:flex-row md:items-end">
          <div className="text-left">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)] md:mb-3">{t.eyebrow}</span>
            <h2 className="text-2xl font-black leading-tight tracking-tight text-slate-900 md:text-4xl">{t.title}</h2>
          </div>
          <div className="flex flex-none flex-wrap gap-3">
            <button
              onClick={() => onNavigate?.('blog')}
              className="group inline-flex min-h-[var(--cta-btn-h)] items-center gap-2 rounded-xl border border-[var(--border-light)] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-slate-700 transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              {t.viewBlog}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </button>
            <button
              onClick={() => onNavigate?.('news')}
              className="group inline-flex min-h-[var(--cta-btn-h)] items-center gap-2 rounded-xl border border-[var(--border-light)] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-slate-700 transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              {t.viewNews}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="volt-home-carousel-viewport overflow-hidden">
        {showSkeleton ? (
          <div className="flex gap-4 px-4 md:gap-6 md:px-12">
            {Array.from({ length: MIN_FILL_CARDS / 2 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div
            className="volt-home-carousel-track flex w-max gap-4 md:gap-6"
            style={{ ['--volt-marquee-duration' as any]: `${Math.max(uniqueCount, 4) * 5}s` }}
          >
            {[...trackItems, ...trackItems].map((card, index) => {
              const highPriority = index < 4;
              return (
                <button
                  key={`${card.key}-${index}`}
                  onClick={() => onNavigate?.(card.type, card.id)}
                  className="group w-[260px] flex-none overflow-hidden rounded-2xl border border-[var(--border-light)] bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-lg md:w-[300px]"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    <img
                      src={card.image}
                      alt={card.title}
                      // loading="lazy" never resolves on a transform-animated marquee, so load eagerly and only vary priority
                      loading="eager"
                      fetchPriority={highPriority ? 'high' : 'low'}
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-[var(--color-primary)] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-white shadow">
                      {card.type === 'blog' ? t.blogPill : t.newsPill}
                    </span>
                  </div>
                  <div className="p-4">
                    {card.date && (
                      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <Calendar className="h-3 w-3" aria-hidden="true" />
                        {new Date(card.date).toLocaleDateString(locale)}
                      </div>
                    )}
                    <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-[var(--color-primary)]">
                      {card.title}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeContentCarousel;
