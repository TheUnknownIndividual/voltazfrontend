import React, { useEffect, useRef } from 'react';
import { useCategory } from '../contexts/CategoryContext';

type Language = 'az' | 'en' | 'ru' | 'tr';

interface HomeCategoryStripProps {
  lang: Language;
  onSelectCategory: (categoryId: number) => void;
  onSelectSolarPanels?: () => void;
  onSelectInverters?: () => void;
}

const titles: Record<Language, string> = {
  az: 'Kateqoriyalar',
  en: 'Categories',
  ru: 'Категории',
  tr: 'Kategoriler',
};

const MOBILE_QUERY = '(max-width: 767px)';

const HomeCategoryStrip: React.FC<HomeCategoryStripProps> = ({ lang, onSelectCategory, onSelectSolarPanels, onSelectInverters }) => {
  const { homePageCategories, getHomePageCategories } = useCategory();
  const requestedRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const loadForMobile = () => {
      if (!mediaQuery.matches || requestedRef.current) return;
      requestedRef.current = true;
      void getHomePageCategories().catch(() => {
        requestedRef.current = false;
      });
    };

    loadForMobile();
    mediaQuery.addEventListener('change', loadForMobile);
    return () => mediaQuery.removeEventListener('change', loadForMobile);
  }, []);

  if (homePageCategories.length === 0) return null;

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
              onClick={() => category.seoKey === 'solar-panels' && onSelectSolarPanels
                ? onSelectSolarPanels()
                : category.seoKey === 'inverters' && onSelectInverters
                  ? onSelectInverters()
                  : onSelectCategory(category.id)}
              className="group flex w-[5.25rem] shrink-0 snap-start flex-col items-center gap-2.5 text-center transition active:scale-[0.97]"
            >
              <span className="flex h-[5.25rem] w-[5.25rem] items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white p-2 shadow-sm transition-shadow group-active:shadow-none">
                <img
                  src={category.imageUrl || '/volt-logo.png'}
                  alt={category.name}
                  loading="lazy"
                  draggable={false}
                  onError={(event) => {
                    const image = event.currentTarget;
                    if (!image.src.endsWith('/volt-logo.png')) image.src = '/volt-logo.png';
                  }}
                  className="h-full w-full select-none object-contain transition-transform duration-300 group-active:scale-95"
                />
              </span>
              <span className="line-clamp-2 min-h-8 text-[11px] font-extrabold leading-4 text-slate-800">
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
