
import React, { useState, useEffect, useCallback } from 'react';

interface HeroSliderProps {
  lang: 'az' | 'en' | 'ru';
  onNavigate?: (page: any, id?: string, extra?: any) => void;
}

interface Slide {
  id: number;
  title: string;
  image: string;
  mobileImage?: string;
  video?: string;
  cta?: string;
  centered?: boolean;
}

const slidesAZ: Slide[] = [
  { id: 1, title: "solar enerji",  image: "/sliderphoto.png", mobileImage: "/sliderphotomobile.png" ,cta: "Ətraflı Öyrən", centered: true },
  { id: 2, title: "enerji qənaəti", image: "/sliderphoto2.png",mobileImage: "/sliderphotomobile2.png", cta: "Ətraflı Öyrən", centered: true },
];

const normalizeHeroSlides = (value: unknown): Slide[] => {
  if (!Array.isArray(value)) return slidesAZ;

  const normalized = value
    .slice(0, 3)
    .map((slide: any, index) => ({
      id: Number(slide?.id) || index + 1,
      title: String(slide?.title || `Slide ${index + 1}`),
      image: String(slide?.image || '').trim(),
      mobileImage: String(slide?.mobileImage || '').trim() || undefined,
      video: String(slide?.video || '').trim() || undefined,
      cta: slide?.cta,
      centered: slide?.centered !== false,
    }))
    .filter(slide => slide.image);

  return normalized.length > 0 ? normalized : slidesAZ;
};

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

const HeroSlider: React.FC<HeroSliderProps> = ({ lang, onNavigate }) => {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState(slidesAZ);
  const [sideSlidesData, setSideSlidesData] = useState(sideSlides);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const loadData = () => {
      try {
        const savedHero = localStorage.getItem('volt_hero_slides');
        const savedSide = localStorage.getItem('volt_side_slides');
        
        if (savedHero) {
          const parsed = JSON.parse(savedHero);
          setSlides(normalizeHeroSlides(parsed));
        }
        if (savedSide) {
          const parsed = JSON.parse(savedSide);
          if (Array.isArray(parsed)) setSideSlidesData(parsed);
        }
      } catch (err) {
        console.error('Error loading slider data:', err);
        setSlides(slidesAZ);
      }
    };

    loadData();
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
    const timer = setInterval(nextSlide, 7000);
    return () => {
      clearInterval(timer);
    };
  }, [nextSlide]);

  return (
    <section className="relative h-[45vh] md:h-[75vh] w-full overflow-hidden bg-white">
      {/* Main Slider (100%) */}
      <div
        className="relative w-full h-full overflow-hidden shadow-xl touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, index) => {
          const isYouTube = slide.video?.includes('youtube.com') || slide.video?.includes('youtu.be');
          let embedUrl = '';
          if (isYouTube && slide.video) {
            const videoId = slide.video.includes('v=') 
              ? slide.video.split('v=')[1]?.split('&')[0]
              : slide.video.split('/').pop()?.split('?')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&vq=hd1080`;
          }

          return (
            <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="absolute inset-0  z-10" />
              <picture>
                {slide.mobileImage && <source media="(max-width: 768px)" srcSet={slide.mobileImage} />}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </picture>
              {slide.video && (
                isYouTube ? (
                  <div className="absolute inset-0 w-full h-full overflow-hidden">
                    <iframe
                      src={embedUrl}
                      className={`absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 pointer-events-none transform transition-transform duration-[10000ms] ${index === current ? 'scale-110' : 'scale-100'}`}
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
                    className={`absolute inset-0 w-full h-full object-cover transform transition-transform duration-[10000ms] ${index === current ? 'scale-110' : 'scale-100'}`}
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
