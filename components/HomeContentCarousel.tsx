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
      <div className="relative aspect-[5/4] overflow-hidden bg-slate-100">
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
  const dragMovedRef = useRef(0);

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
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let x = 0;
    let speed = BASE_SPEED_PX_S;
    let lastTime: number | null = null;
    let frameId = 0;
    let isDragging = false;
    let dragPointerId: number | null = null;
    let dragStartClientX = 0;
    let dragStartX = 0;

    const getLoopWidth = () => track.scrollWidth / 2;

    // Cards are duplicated once for the seamless auto-scroll loop, so any
    // absolute x (auto-advance or manual drag) wraps back into the single
    // [-loopWidth, 0] range instead of running off the end of the track.
    const wrapX = (value: number, loopWidth: number) => {
      if (loopWidth <= 0) return value;
      let wrapped = value % loopWidth;
      if (wrapped > 0) wrapped -= loopWidth;
      return wrapped;
    };

    const step = (time: number) => {
      const loopWidth = getLoopWidth();
      if (lastTime === null) lastTime = time;
      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      if (!isDragging && !reduceMotion) {
        const target = hoveredRef.current ? HOVER_SPEED_PX_S : BASE_SPEED_PX_S;
        const lerp = dt > 0 ? 1 - Math.exp(-dt / SPEED_TIME_CONSTANT) : 0;
        speed += (target - speed) * lerp;
        if (loopWidth > 0) x = wrapX(x - speed * dt, loopWidth);
      }
      track.style.transform = `translateX(${x}px)`;

      frameId = requestAnimationFrame(step);
    };

    // Pointer Events unify mouse + touch: dragging pauses the auto-scroll
    // (by short-circuiting the branch in step()) and moves the track 1:1
    // with the pointer; auto-scroll resumes from wherever the drag ended.
    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      isDragging = true;
      dragPointerId = event.pointerId;
      dragStartClientX = event.clientX;
      dragStartX = x;
      dragMovedRef.current = 0;
      track.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging || event.pointerId !== dragPointerId) return;
      const delta = event.clientX - dragStartClientX;
      dragMovedRef.current = Math.max(dragMovedRef.current, Math.abs(delta));
      x = wrapX(dragStartX + delta, getLoopWidth());
    };

    const endDrag = (event: PointerEvent) => {
      if (!isDragging || event.pointerId !== dragPointerId) return;
      isDragging = false;
      dragPointerId = null;
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    };

    track.addEventListener('pointerdown', handlePointerDown);
    track.addEventListener('pointermove', handlePointerMove);
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    frameId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frameId);
      track.removeEventListener('pointerdown', handlePointerDown);
      track.removeEventListener('pointermove', handlePointerMove);
      track.removeEventListener('pointerup', endDrag);
      track.removeEventListener('pointercancel', endDrag);
    };
  }, [trackItems]);

  if (bothSettled && cards.length === 0) return null;

  return (
    <section className="bg-white py-16 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-4 md:px-12">
        <div className="mb-8 flex flex-row items-center justify-between gap-3 md:mb-12 md:items-end">
          <div className="min-w-0 flex-1 text-left">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)] md:mb-3">{t.eyebrow}</span>
            <h2 className="text-xl font-black leading-tight tracking-tight text-slate-900 md:text-4xl">{t.title}</h2>
          </div>
          <div className="flex flex-none">
            <button
              onClick={() => onNavigate?.('blog')}
              className="group inline-flex min-h-[var(--cta-btn-h)] items-center gap-1.5 whitespace-nowrap rounded-xl bg-[var(--header-bg)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-[var(--primary)] md:gap-2 md:px-8 md:py-4 md:text-xs"
            >
              {t.viewAll}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1.5 md:h-4 md:w-4" aria-hidden="true" />
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
            <div
              ref={trackRef}
              onClickCapture={(event) => {
                // A drag that moved more than a few px shouldn't also fire
                // the card's onClick — this only suppresses that one click.
                if (dragMovedRef.current > 6) {
                  event.preventDefault();
                  event.stopPropagation();
                }
              }}
              className="volt-home-carousel-track flex w-max gap-4 will-change-transform md:gap-6"
            >
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
