
import React, { useState, useEffect, useCallback } from 'react';
import useApi from '../hooks/useApi';
import { API_ENDPOINTS } from '../utils/constants';
import { DEFAULT_HOME_SLIDES, normalizeHomeSlides, type HomeSlide as Slide } from '../types/homeSlider';

interface HeroSliderProps {
  lang: 'az' | 'en' | 'ru' | 'tr';
  onNavigate?: (page: any, id?: string, extra?: any) => void;
}

const sideSlides = [
  { 
    id: 1, 
    title: "Biznes tərəfdaşlar üçün yeni fürsətlər", 
    subtitle: "Tərəfdaşlıq",
    description: "Tərəfdaşlarımız üçün xüsusi kampaniyalar və özəl fürsətlər yaratdıq. Yararlanmaq üçün keçid edin.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000",
    linkText: "Keçid et",
    page: 'partnership'
  },
  { 
    id: 2, 
    title: "Ustalar klubuna qoşul, endirimlərdən yararlan", 
    subtitle: "Pro Club",
    description: "Peşəkar ustalar üçün nəzərdə tutulmuş özəl imtiyazlar və endirim proqramı.",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1000",
    linkText: "Keçid et",
    page: 'pro-club'
  }
];

const SWIPE_THRESHOLD = 40;
const HOME_SLIDES_CACHE_KEY = 'volt_home_slides_cache_v1';

const readCachedSlides = () => {
  if (typeof window === 'undefined') return DEFAULT_HOME_SLIDES;

  try {
    const cached = localStorage.getItem(HOME_SLIDES_CACHE_KEY);
    if (!cached) return DEFAULT_HOME_SLIDES;
    const parsed = JSON.parse(cached);
    const normalized = normalizeHomeSlides(parsed?.slides);
    return normalized.length ? normalized : DEFAULT_HOME_SLIDES;
  } catch {
    return DEFAULT_HOME_SLIDES;
  }
};

const preloadVisibleSlideImages = async (nextSlides: Slide[]) => {
  const useMobileImages = window.matchMedia('(max-width: 767px)').matches;
  const sources = Array.from(new Set(nextSlides.map((slide) => (
    useMobileImages && slide.mobileImage ? slide.mobileImage : slide.image
  )).filter(Boolean)));

  await Promise.allSettled(sources.map((source, index) => new Promise<void>((resolve) => {
    const image = new Image();
    const timeout = window.setTimeout(resolve, 8000);
    const finish = () => {
      window.clearTimeout(timeout);
      resolve();
    };

    image.decoding = 'async';
    image.fetchPriority = index === 0 ? 'high' : 'auto';
    image.onload = finish;
    image.onerror = finish;
    image.src = source;
    if (image.complete) finish();
  })));
};

const HeroSlider: React.FC<HeroSliderProps> = ({ lang, onNavigate }) => {
  const { get } = useApi();
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<Slide[]>(readCachedSlides);
  const [loadedSlideSources, setLoadedSlideSources] = useState<Set<string>>(() => new Set());
  const [sideSlidesData, setSideSlidesData] = useState(sideSlides);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedSide = localStorage.getItem('volt_side_slides');
        const response = await get(API_ENDPOINTS.HOME_SLIDER.GET, { skipAuth: true });
        const loaded = normalizeHomeSlides(response?.data || response);
        const nextSlides = loaded.length ? loaded : DEFAULT_HOME_SLIDES;
        await preloadVisibleSlideImages(nextSlides);
        setSlides(nextSlides);
        localStorage.setItem(HOME_SLIDES_CACHE_KEY, JSON.stringify({ slides: nextSlides, cachedAt: Date.now() }));
        if (savedSide) {
          const parsed = JSON.parse(savedSide);
          if (Array.isArray(parsed)) setSideSlidesData(parsed);
        }
      } catch (err) {
        console.error('Error loading slider data:', err);
        setSlides(DEFAULT_HOME_SLIDES);
      }
    };

    void loadData();
    window.addEventListener('volt_data_updated', loadData);
    return () => window.removeEventListener('volt_data_updated', loadData);
  }, []);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrent(prev => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrent(prev => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) <= Math.abs(deltaY)) return;

    if (deltaX < 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  }, [nextSlide, prevSlide]);

  useEffect(() => {
    if (current >= slides.length) {
      setCurrent(0);
    }
  }, [current, slides.length]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') nextSlide();
    }, 7000);
    return () => {
      window.clearInterval(timer);
    };
  }, [nextSlide]);

  useEffect(() => {
    if (slides.length < 2) return;
    const next = slides[(current + 1) % slides.length];
    const preload = () => {
      const useMobileImage = window.matchMedia('(max-width: 767px)').matches;
      const source = useMobileImage && next.mobileImage ? next.mobileImage : next.image;
      const image = new Image();
      image.decoding = 'async';
      image.src = source;
    };
    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(preload, { timeout: 2000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(preload, 1200);
    return () => globalThis.clearTimeout(timeoutId);
  }, [current, slides]);

  return (
    <section className="relative aspect-square w-full overflow-hidden bg-white md:aspect-[16/7]">
      {/* Main Slider (100%) */}
      <div
        className="relative w-full h-full overflow-hidden shadow-xl touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, index) => {
          const isActive = index === current;
          const isNext = slides.length > 1 && index === (current + 1) % slides.length;
          const mediaKey = `${slide.image}|${slide.mobileImage || ''}`;
          const isLoaded = loadedSlideSources.has(mediaKey);
          const isYouTube = slide.video?.includes('youtube.com') || slide.video?.includes('youtu.be');
          let embedUrl = '';
          if (isYouTube && slide.video) {
            const videoId = slide.video.includes('v=') 
              ? slide.video.split('v=')[1]?.split('&')[0]
              : slide.video.split('/').pop()?.split('?')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&vq=hd1080`;
          }

          return (
            <div key={slide.id} aria-hidden={!isActive} className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="absolute inset-0  z-10" />
              <div className="absolute inset-0 flex items-center justify-center bg-white" aria-hidden="true">
                <img
                  src="/volt-logo.png"
                  alt=""
                  width="112"
                  height="112"
                  className="hero-slider-fallback-logo h-20 w-20 object-contain md:h-28 md:w-28"
                />
              </div>
              <picture>
                {slide.mobileImage && <source media="(max-width: 767px)" srcSet={slide.mobileImage} />}
                <img
                  src={slide.image}
                  alt={slide.title}
                  width="1366"
                  height="768"
                  loading={isActive || isNext ? 'eager' : 'lazy'}
                  fetchPriority={isActive ? 'high' : 'low'}
                  decoding="async"
                  onLoad={() => setLoadedSlideSources(previous => {
                    if (previous.has(mediaKey)) return previous;
                    const next = new Set(previous);
                    next.add(mediaKey);
                    return next;
                  })}
                  onError={() => setLoadedSlideSources(previous => {
                    if (!previous.has(mediaKey)) return previous;
                    const next = new Set(previous);
                    next.delete(mediaKey);
                    return next;
                  })}
                  className={`absolute inset-0 h-full w-full object-cover text-transparent transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
              </picture>
              {isActive && slide.video && (
                isYouTube ? (
                  <div className="absolute inset-0 w-full h-full overflow-hidden">
                    <iframe
                      src={embedUrl}
                      title={slide.title}
                      loading="lazy"
                      className={`absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 pointer-events-none transform transition-transform duration-[10000ms] ${isActive ? 'scale-110' : 'scale-100'}`}
                      allow="autoplay; encrypted-media"
                      frameBorder="0"
                    />
                  </div>
                ) : (
                  <video 
                    src={slide.video} 
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    className={`absolute inset-0 w-full h-full object-cover transform transition-transform duration-[10000ms] ${isActive ? 'scale-110' : 'scale-100'}`}
                  />
                )
              )}
              
              {/* <div className={`absolute inset-0 z-20 flex ${slide.centered ? 'items-center justify-center' : 'items-start pt-24 md:pt-[18vh] lg:pt-[22vh] pb-24 md:pb-32'}`}>
              <div className="w-full px-6 md:px-16">
                <div className={`max-w-4xl ${slide.centered ? 'text-center mx-auto' : 'text-left'} text-white`}>
                  <h1 className={`text-3xl md:text-5xl lg:text-7xl font-black ${slide.subtitle ? 'mb-4 md:mb-8' : 'mb-0'} leading-[1.1] drop-shadow-2xl animate-in fade-in ${slide.centered ? 'zoom-in-95' : 'slide-in-from-left-12'} duration-1000`}>
                    {slide.title}
                  </h1>
                  {slide.subtitle && (
                    <p className="text-xs md:text-lg lg:text-xl mb-8 md:mb-12 opacity-90 font-medium leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-left-12 duration-1000 delay-300">
                      {slide.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div> */}
          </div>
        );
      })}
        
        <div className="absolute bottom-8 md:bottom-10 left-0 w-full z-30">
          <div className="px-6 md:px-16">
            <div className="flex gap-3 md:gap-4">
              {slides.map((_, index) => (
                <button key={index} onClick={() => setCurrent(index)} className={`h-1 md:h-1.5 rounded-full transition-all duration-300 ${index === current ? 'w-10 md:w-12 bg-emerald-500' : 'w-4 bg-white/40'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default HeroSlider;
