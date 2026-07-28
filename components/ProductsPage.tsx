
import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { useProduct } from '../contexts/ProductContext';
import { useCategory } from '@/contexts/CategoryContext';
import { ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";

interface ProductsPageProps {
  onSelectProduct: (id: string, returnContext?: { category?: any; subCategory?: any; search?: string }) => void;
  onOrderNow?: (id: string, quantity: number) => void;
  onAddToCart?: (id: string, quantity: number) => void;
  lang?: 'az' | 'en' | 'ru' | 'tr';
  onBack?: () => void;
  initialCategory?: string | number;
  initialSubCategory?: string | number;
  initialSearch?: string;
}

const normalizeFilterId = (value?: string | number) => {
  if (value === undefined || value === null || value === '' || value === 'all') return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const ProductsPage: React.FC<ProductsPageProps> = ({ onSelectProduct, onOrderNow, onAddToCart, lang, onBack, initialCategory = 'all', initialSubCategory = 'all', initialSearch = '' }) => {
  const { getHomeProducts, productHomeData, getProducts, productData} = useProduct();
  const {
    categories,
    getCategories,
    subcategories,
    getSubCategories,
  } = useCategory();

  const initialCategoryId = normalizeFilterId(initialCategory);
  const initialSubCategoryId = normalizeFilterId(initialSubCategory);
  const [filter, setFilter] = useState<number | null>(initialCategoryId);
  const [subFilter, setSubFilter] = useState<number | null>(initialSubCategoryId);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(initialCategoryId);
  const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(12);
const [search, setSearch] = useState(initialSearch);
const [isLoadingProducts, setIsLoadingProducts] = useState(true);
const [hasProductLoadError, setHasProductLoadError] = useState(false);
const [reloadToken, setReloadToken] = useState(0);
const totalPages = productData?.totalPages || 0;

const clearProductSearch = () => {
  if (!search.trim()) return;

  setSearch('');
  const url = new URL(window.location.href);
  url.searchParams.delete('search');
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, '', nextUrl);
};

useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth < 640) {
      setPageSize(6); // mobil
    } else {
      setPageSize(12); // tablet və desktop
    }
  };

  handleResize(); // ilk renderdə işləsin
  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);

  useEffect(() => {
    const catId = normalizeFilterId(initialCategory);
    const subCatId = normalizeFilterId(initialSubCategory);

    setFilter(catId);
    setActiveCategoryId(catId);
    setSubFilter(subCatId);

    if (catId !== null) {
      getSubCategories(catId);
    }

    setPage(1);
  }, [initialCategory, initialSubCategory]);

  useEffect(() => {
    setSearch(initialSearch || '');
    setPage(1);
  }, [initialSearch]);


  useEffect(() => {
    getCategories();
  }, []);

useEffect(() => {
  let isCurrentRequest = true;
  setIsLoadingProducts(true);
  setHasProductLoadError(false);

  getProducts(
      filter ?? undefined,
      subFilter ?? undefined,
      page,
      pageSize,
      search
    )
    .catch(() => {
      if (isCurrentRequest) setHasProductLoadError(true);
    })
    .finally(() => {
      if (isCurrentRequest) setIsLoadingProducts(false);
    });

  return () => {
    isCurrentRequest = false;
  };
}, [filter, subFilter, page, pageSize, search, reloadToken]);

useEffect(() => {
  setPage(1);
}, [filter, subFilter]);


  const getItemName = (item: any) => {


    const lang = item?.languages?.[0];

    return (
      lang?.categoryName ||
      lang?.subCategoryName ||
      lang?.brandName ||
      ""
    );
  };


  const t = {
    title: {
      az: "Məhsullar",
      en: "Products",
      ru: "Продукты",
      tr: "Ürünler",
    },

    back: {
      az: "Geri qayıt",
      en: "Back",
      ru: "Назад",
      tr: "Geri dön",
    },
    all: {
      az: "Hamısı",
      en: "All",
      ru: "Все",
      tr: "Tümü",
    },
    results: {
      az: "nəticə",
      en: "results",
      ru: "результатов",
      tr: "sonuç",
    },
    emptyTitle: {
      az: "Uyğun məhsul tapılmadı",
      en: "No matching products found",
      ru: "Подходящие товары не найдены",
      tr: "Uygun ürün bulunamadı",
    },
    emptyDescription: {
      az: "Seçilmiş filtr və ya axtarış üzrə məhsul yoxdur. Filtrləri təmizləyib yenidən yoxlayın.",
      en: "No products match the selected filters or search. Clear the filters and try again.",
      ru: "Выбранным фильтрам или поиску ничего не соответствует. Очистите фильтры и попробуйте снова.",
      tr: "Seçilen filtrelere veya aramaya uygun ürün yok. Filtreleri temizleyip tekrar deneyin.",
    },
    clearFilters: {
      az: "Filtrləri təmizlə",
      en: "Clear filters",
      ru: "Очистить фильтры",
      tr: "Filtreleri temizle",
    },
    loadErrorTitle: {
      az: "Məhsullar yüklənmədi",
      en: "Products could not be loaded",
      ru: "Не удалось загрузить товары",
      tr: "Ürünler yüklenemedi",
    },
    loadErrorDescription: {
      az: "Kataloq xidməti ilə əlaqə yaratmaq mümkün olmadı. Bir qədər sonra yenidən yoxlayın.",
      en: "The catalog service could not be reached. Please try again shortly.",
      ru: "Не удалось связаться с сервисом каталога. Повторите попытку немного позже.",
      tr: "Katalog hizmetine ulaşılamadı. Lütfen kısa süre sonra tekrar deneyin.",
    },
    retry: {
      az: "Yenidən yoxla",
      en: "Try again",
      ru: "Повторить",
      tr: "Tekrar dene",
    },
  };

  const getPagination = (current, total, windowSize = 5) => {
  const pages = [];

  let start = Math.floor((current - 1) / windowSize) * windowSize + 1;
  let end = Math.min(start + windowSize - 1, total);

  // əvvəlki "..." varsa
  if (start > 1) {
    pages.push("prevDots");
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // sonrakı "..." varsa
  if (end < total) {
    pages.push("nextDots");
  }

  return pages;
};


  return (
    <div className="bg-white min-h-screen">
      {/* Hero + Filter Bar */}
      <section className="product-filter-bar relative overflow-hidden bg-emerald-950 py-5 shadow-lg shadow-emerald-950/10">
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-12">
          <div className="mb-4 flex items-center justify-between gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-emerald-200/70 transition-colors hover:text-white font-bold text-[9px] uppercase tracking-widest"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              {t.back[lang]}
            </button>

            <div className="flex flex-col items-end gap-1">
              <h1 className="text-sm font-black text-white uppercase tracking-widest">{t.title[lang]}</h1>
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">
                {isLoadingProducts ? '…' : productData?.totalCount ?? 0} {t.results[lang]}
              </span>
            </div>
          </div>

          {/* Categories */}
          <div className="relative">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar snap-x snap-proximity scroll-px-4 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
              <button
                onClick={() => {
                  clearProductSearch();
                  setActiveCategoryId(null);
                  setFilter(null);
                  setSubFilter(null);
                }}
                className={`shrink-0 snap-start px-4 py-2.5 md:py-2 rounded-full text-[11px] md:text-xs font-black uppercase tracking-wide transition-all
          ${activeCategoryId === null
                    ? 'bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-300'
                    : 'border border-white/10 bg-white/5 text-emerald-50/75 hover:border-white/20 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {t.all[lang]}
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    clearProductSearch();
                    setActiveCategoryId(category.id);
                    setFilter(category.id);
                    setSubFilter(null);
                    getSubCategories(category.id);
                  }}
                  className={`shrink-0 snap-start px-4 py-2.5 md:py-2 rounded-full text-[11px] md:text-xs font-black uppercase tracking-wide transition-all
          ${activeCategoryId === category.id
                      ? 'bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-300'
                      : 'border border-white/10 bg-white/5 text-emerald-50/75 hover:border-white/20 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  {getItemName(category)}
                </button>
              ))}
            </div>
            {/* fade edges to hint horizontal scroll on mobile */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-emerald-950 to-transparent md:hidden" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-emerald-950 to-transparent md:hidden" />
          </div>

          {/* Subcategories */}
          {activeCategoryId && subcategories.length > 0 && (
            <div className="relative mt-3 animate-in slide-in-from-top-1 duration-300">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar snap-x snap-proximity scroll-px-4 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
                <button
                  onClick={() => {
                    clearProductSearch();
                    setSubFilter(null);
                  }}
                  className={`shrink-0 snap-start px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all
          ${subFilter === null
                    ? 'border border-emerald-300 bg-emerald-500 text-emerald-950 shadow-md shadow-emerald-950/25'
                    : 'border border-white/10 bg-white/5 text-emerald-50/70 hover:border-white/20 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  {lang === 'az' ? 'Hamısı' : lang === 'ru' ? 'Все' : lang === 'tr' ? 'Tümü' : 'All'}
                </button>

                {subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      clearProductSearch();
                      setSubFilter(sub.id);
                    }}
                    className={`shrink-0 snap-start px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all
            ${subFilter == sub.id
                        ? 'border border-emerald-300 bg-emerald-500 text-emerald-950 shadow-md shadow-emerald-950/25'
                        : 'border border-white/10 bg-white/5 text-emerald-50/70 hover:border-white/20 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    {getItemName(sub)}
                  </button>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-emerald-950 to-transparent md:hidden" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-emerald-950 to-transparent md:hidden" />
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      
      {/* <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
   
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            
            {productHomeData?.items?.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
                onOrderNow={onOrderNow}
                lang={lang === 'ru' ? 'az' : lang}
              />
            ))}
          </div>
        </div>
      </section> */}

   

<section className="py-8 md:py-12 bg-white">
  <div className="max-w-7xl mx-auto px-4 md:px-6">
    {!isLoadingProducts && hasProductLoadError ? (
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-[2rem] border border-rose-100 bg-rose-50/70 px-6 py-12 text-center shadow-sm md:px-12 md:py-16">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
          <PackageSearch className="h-8 w-8" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-black text-slate-900 md:text-2xl">{t.loadErrorTitle[lang]}</h2>
        <p className="mt-3 max-w-lg text-sm font-medium leading-relaxed text-slate-600">{t.loadErrorDescription[lang]}</p>
        <button
          type="button"
          onClick={() => setReloadToken((current) => current + 1)}
          className="mt-6 rounded-2xl bg-slate-900 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-colors hover:bg-slate-800"
        >
          {t.retry[lang]}
        </button>
      </div>
    ) : !isLoadingProducts && (productData?.items?.length ?? 0) === 0 ? (
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-[2rem] border border-emerald-100 bg-emerald-50/60 px-6 py-12 text-center shadow-sm md:px-12 md:py-16">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <PackageSearch className="h-8 w-8" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-black text-slate-900 md:text-2xl">{t.emptyTitle[lang]}</h2>
        <p className="mt-3 max-w-lg text-sm font-medium leading-relaxed text-slate-600">{t.emptyDescription[lang]}</p>
        <button
          type="button"
          onClick={() => {
            clearProductSearch();
            setActiveCategoryId(null);
            setFilter(null);
            setSubFilter(null);
            setPage(1);
          }}
          className="mt-6 rounded-2xl bg-emerald-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-700/20 transition-colors hover:bg-emerald-700"
        >
          {t.clearFilters[lang]}
        </button>
      </div>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {productData?.items?.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onSelectProduct={onSelectProduct}
          onAddToCart={onAddToCart}
          onOrderNow={onOrderNow}
          lang={lang === 'ru' ? 'az' : lang}
          search={search}
        />
        ))}
      </div>
    )}
  </div>
</section>

{totalPages > 1 && (
  <div className="flex justify-center items-center gap-1.5 md:gap-2 mt-1 pb-10 px-4">
    <button
      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
      disabled={page === 1}
      className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[var(--color-surface)] border border-[color-mix(in_srgb,var(--color-primary)_24%,white)] text-[var(--color-dark)] hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,white)] disabled:opacity-40 transition"
    >
      <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
    </button>
    {getPagination(page, totalPages).map((item, index) => {
      if (item === "prevDots" || item === "nextDots") {
        return (
          <span key={index} className="px-1.5 text-gray-400">
            ...
          </span>
        );
      }

      return (
        <button
          key={item}
          onClick={() => setPage(item)}
          className={`
            w-9 h-9 md:w-10 md:h-10 rounded-full text-sm font-bold transition
            ${page === item
              ? "bg-[var(--color-primary)] text-[var(--color-dark)]"
              : "bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,white)]"
            }
          `}
        >
          {item}
        </button>
      );
    })}
    <button
      onClick={() => setPage(prev => totalPages > 0 ? Math.min(prev + 1, totalPages) : prev)}
      disabled={totalPages === 0 || page >= totalPages}
      className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[var(--color-surface)] border border-[color-mix(in_srgb,var(--color-primary)_24%,white)] text-[var(--color-dark)] hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,white)] disabled:opacity-40 transition"
    >
      <ChevronRight className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
    </button>
  </div>
)}

    </div>
  );
};

export default ProductsPage;
