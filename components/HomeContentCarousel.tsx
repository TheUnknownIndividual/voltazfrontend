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
  excerpt: string;
  image: string;
  date: string | null;
}

const MIN_FILL_CARDS = 8; // enough slots to cover the screen before looping
const MAX_CARDS = 20;
const SKELETON_COUNT = 4;

// Constant pixel speed (not a fixed loop duration) so the crawl reads the
// same regardless of how many posts there are, and a spring-like lerp
// toward the hover target instead of a hard speed swap — an instant
// animation-duration change on a running CSS animation re-scales its
// progress and makes the track visibly jump, which is what we're avoiding.
const BASE_SPEED_PX_S = 40;
const HOVER_SPEED_PX_S = 6;
const SPEED_TIME_CONSTANT = 0.4;

const copy = {
  az: {
    eyebrow: 'Bloq və Xəbərlər',
    title: 'Ən son yazılarımız və xəbərlərimiz',
    blogPill: 'Bloq',
    newsPill: 'Xəbər',
    viewAll: 'Hamısına bax',
    readMore: 'Davamını oxu',
  },
  en: {
    eyebrow: 'Blog & News',
    title: 'Our latest articles and news',
    blogPill: 'Blog',
    newsPill: 'News',
    viewAll: 'View all',
    readMore: 'Read More',
  },
  ru: {
    eyebrow: 'Блог и новости',
    title: 'Наши последние статьи и новости',
    blogPill: 'Блог',
    newsPill: 'Новости',
    viewAll: 'Смотреть все',
    readMore: 'Читать далее',
  },
  tr: {
    eyebrow: 'Blog ve Haberler',
    title: 'En son yazılarımız ve haberlerimiz',
    blogPill: 'Blog',
    newsPill: 'Haber',
    viewAll: 'Hepsini gör',
    readMore: 'Devamını Oku',
  },
} as const;

const localeByLanguage: Record<Language, string> = {
  az: 'az-AZ',
  en: 'en-US',
  ru: 'ru-RU',
  tr: 'tr-TR',
};

const langCodeByLang: Record<Language, number> = { az: 1, en: 2, ru: 3, tr: 4 };

interface CardTileProps {
  card?: CarouselCard;
  pillLabel?: string;
  readMoreLabel: string;
  locale: string;
  highPriority?: boolean;
  onSelect?: () => void;
}

// Shared by the loading and loaded states so both render the exact same
// element structure/spacing — a skeleton that doesn't match the real
// card's height makes the section jump when the real content swaps in.
const CardTile: React.FC<CardTileProps> = ({ card, pillLabel, readMoreLabel, locale, highPriority, onSelect }) => {
  const loading = !card;
  return (
    <button
      onClick={onSelect}
      disabled={loading}
      aria-hidden={loading}
      className={`group w-[280px] flex-none overflow-hidden rounded-2xl border border-[var(--border-light)] bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-lg md:w-[340px] ${loading ? 'animate-pulse' : ''}`}
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {card && (
          <img
            src={card.image}
            alt={card.title}
            // loading="lazy" never resolves on a continuously-translated marquee track, so load eagerly and only vary priority
            loading="eager"
            fetchPriority={highPriority ? 'high' : 'low'}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-[var(--color-primary)] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-white shadow">
          {loading ? <span className="inline-block h-2.5 w-8 rounded bg-white/40" /> : pillLabel}
        </span>
      </div>
      <div className="p-4">
        <div className="mb-2 flex h-3.5 items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {loading ? (
            <span className="h-2.5 w-16 rounded bg-slate-100" />
          ) : (
            <>
              <Calendar className="h-3 w-3" aria-hidden="true" />
              {card.date ? new Date(card.date).toLocaleDateString(locale) : ''}
            </>
          )}
        </div>
        <h3 className="mb-2 line-clamp-2 min-h-[38px] text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-[var(--color-primary)]">
          {loading ? (
            <span className="block space-y-1.5">
              <span className="block h-3 w-full rounded bg-slate-100" />
              <span className="block h-3 w-2/3 rounded bg-slate-100" />
            </span>
          ) : card.title}
        </h3>
        <p className="mb-3 line-clamp-3 min-h-[58px] text-xs leading-relaxed text-slate-500">
          {loading ? (
            <span className="block space-y-1.5">
              <span className="block h-2.5 w-full rounded bg-slate-100" />
              <span className="block h-2.5 w-full rounded bg-slate-100" />
              <span className="block h-2.5 w-4/5 rounded bg-slate-100" />
            </span>
          ) : card.excerpt}
        </p>
        <span className="theme-more-link">
          {loading ? <span className="h-3 w-20 rounded bg-slate-200" /> : (
            <>
              {readMoreLabel}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </>
          )}
        </span>
      </div>
    </button>
  );
};

const HomeContentCarousel: React.FC<HomeContentCarouselProps> = ({ lang = 'az', onNavigate }) => {
  const t = copy[lang] || copy.az;
  const locale = localeByLanguage[lang] || localeByLanguage.az;
  const { blogs, getBlogs } = useBlog();
  const { publicNews, getPublicNews } = useNews();

  const [blogsLoaded, setBlogsLoaded] = useState(false);
  const [newsLoaded, setNewsLoaded] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const hoveredRef = useRef(false);

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
        excerpt: post.description?.[lang] || post.description?.az || '',
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
          excerpt: langItem?.description || '',
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

  const showSkeleton = !bothSettled && cards.length === 0;

  useEffect(() => {
    const track = trackRef.current;
    if (!track || trackItems.length === 0) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let x = 0;
    let speed = BASE_SPEED_PX_S;
    let lastTime: number | null = null;
    let frameId = 0;

    const step = (time: number) => {
      const loopWidth = track.scrollWidth / 2;
      if (lastTime === null) lastTime = time;
      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      const target = hoveredRef.current ? HOVER_SPEED_PX_S : BASE_SPEED_PX_S;
      const lerp = dt > 0 ? 1 - Math.exp(-dt / SPEED_TIME_CONSTANT) : 0;
      speed += (target - speed) * lerp;

      if (loopWidth > 0) {
        x -= speed * dt;
        if (x <= -loopWidth) x += loopWidth;
        track.style.transform = `translateX(${x}px)`;
      }

      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [trackItems]);

  if (bothSettled && cards.length === 0) return null;

  return (
    <section className="bg-white py-16 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-4 md:px-12">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:mb-12 md:flex-row md:items-end">
          <div className="text-left">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)] md:mb-3">{t.eyebrow}</span>
            <h2 className="text-2xl font-black leading-tight tracking-tight text-slate-900 md:text-4xl">{t.title}</h2>
          </div>
          <div className="flex flex-none">
            <button
              onClick={() => onNavigate?.('blog')}
              className="group inline-flex min-h-[var(--cta-btn-h)] items-center gap-2 rounded-xl bg-[var(--header-bg)] px-6 py-3 text-xs font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-[var(--primary)] md:px-8 md:py-4"
            >
              {t.viewAll}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          className="volt-home-carousel-viewport relative overflow-hidden"
          onMouseEnter={() => { hoveredRef.current = true; }}
          onMouseLeave={() => { hoveredRef.current = false; }}
          onFocus={() => { hoveredRef.current = true; }}
          onBlur={() => { hoveredRef.current = false; }}
        >
          {showSkeleton ? (
            <div className="flex gap-4 md:gap-6">
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <CardTile key={i} readMoreLabel={t.readMore} locale={locale} />
              ))}
            </div>
          ) : (
            <div ref={trackRef} className="volt-home-carousel-track flex w-max gap-4 will-change-transform md:gap-6">
              {[...trackItems, ...trackItems].map((card, index) => (
                <CardTile
                  key={`${card.key}-${index}`}
                  card={card}
                  pillLabel={card.type === 'blog' ? t.blogPill : t.newsPill}
                  readMoreLabel={t.readMore}
                  locale={locale}
                  highPriority={index < 4}
                  onSelect={() => onNavigate?.(card.type, card.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HomeContentCarousel;
