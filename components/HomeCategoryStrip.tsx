import React, { useEffect, useRef } from 'react';
import { useCategory } from '../contexts/CategoryContext';

type Language = 'az' | 'en' | 'ru' | 'tr';

interface HomeCategoryStripProps {
  lang: Language;
  onSelectCategory: (categoryId: number) => void;
  selectedCategoryId?: number | null;
}

const titles: Record<Language, string> = {
  az: 'Kateqoriyalar',
  en: 'Categories',
  ru: 'Категории',
  tr: 'Kategoriler',
};

const MOBILE_QUERY = '(max-width: 767px)';

const HomeCategoryStrip: React.FC<HomeCategoryStripProps> = ({ lang, onSelectCategory, selectedCategoryId = null }) => {
  const { homePageCategories, getHomePageCategories } = useCategory();
  const requestedLanguageRef = useRef<Language | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const loadForMobile = () => {
      if (!mediaQuery.matches || requestedLanguageRef.current === lang) return;
      requestedLanguageRef.current = lang;
      void getHomePageCategories({ language: lang }).catch(() => {
        requestedLanguageRef.current = null;
      });
    };

    loadForMobile();
    mediaQuery.addEventListener('change', loadForMobile);
    return () => mediaQuery.removeEventListener('change', loadForMobile);
  }, [lang]);

  if (homePageCategories.length === 0) {
    return (
      <section className="min-h-[10.5rem] bg-white py-7 md:hidden" aria-busy="true" aria-label={titles[lang]}>
        <div className="mx-auto max-w-[1440px] px-4">
          <div className="mb-4 h-7 w-36 animate-pulse rounded-lg bg-slate-100" />
          <div className="flex gap-4 overflow-hidden pl-1">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex w-[5.25rem] shrink-0 flex-col items-center gap-2.5" aria-hidden="true">
                <div className="h-[5.25rem] w-[5.25rem] animate-pulse rounded-full bg-slate-100" />
                <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-7 md:hidden" aria-labelledby="home-categories-title">
      <div className="mx-auto max-w-[1440px] px-4">
        <h2 id="home-categories-title" className="mb-4 text-xl font-black text-slate-900">
          {titles[lang]}
        </h2>

        <div className="-mr-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pl-1 pr-4 no-scrollbar">
          {homePageCategories.slice(0, 5).map(category => (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              aria-pressed={selectedCategoryId === category.id}
              className="group flex w-[5.25rem] shrink-0 snap-start flex-col items-center gap-2.5 text-center transition active:scale-[0.97]"
            >
              <span className={`flex h-[5.25rem] w-[5.25rem] items-center justify-center overflow-hidden rounded-full border bg-white p-2 shadow-sm transition-all group-active:shadow-none ${selectedCategoryId === category.id ? 'border-[var(--primary)] ring-4 ring-[color-mix(in_srgb,var(--primary)_15%,transparent)]' : 'border-slate-200'}`}>
                <img
                  src={category.imageUrl || '/volt-logo.png'}
                  alt={category.name}
                  loading="lazy"
                  decoding="async"
                  width="84"
                  height="84"
                  draggable={false}
                  onError={(event) => {
                    const image = event.currentTarget;
                    if (!image.src.endsWith('/volt-logo.png')) image.src = '/volt-logo.png';
                  }}
                  className="h-full w-full select-none object-contain transition-transform duration-300 group-active:scale-95"
                />
              </span>
              <span className={`line-clamp-2 min-h-8 text-[11px] font-extrabold leading-4 ${selectedCategoryId === category.id ? 'text-[#658300]' : 'text-slate-800'}`}>
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeCategoryStrip;
