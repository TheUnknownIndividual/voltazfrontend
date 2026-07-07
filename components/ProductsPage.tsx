
import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { useProduct } from '../contexts/ProductContext';
import { useCategory } from '@/contexts/CategoryContext';
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductsPageProps {
  onSelectProduct: (id: string) => void;
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
  getProducts(
    filter ?? undefined,
    subFilter ?? undefined,
    page,
    pageSize,
    search
  );
}, [filter, subFilter, page, pageSize, search]);

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
      {/* Compressed Hero */}
      <section className="product-filter-bar bg-emerald-950 py-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between relative z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-emerald-300/60 hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t.back[lang]}
          </button>

          <div className="flex flex-col gap-2 overflow-x-auto no-scrollbar py-2 px-4 max-w-full">
            <div className="flex flex-col gap-3">

              {/* Categories */}
              <div className="flex gap-2 flex-wrap">

                <button
                  onClick={() => {
                    clearProductSearch();
                    setActiveCategoryId(null);
                    setFilter(null);
                    setSubFilter(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all
          ${activeCategoryId === null
                      ? 'bg-[var(--color-primary)] text-[var(--color-dark)]'
                      : 'text-white/65 hover:text-white hover:bg-white/10'
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
                    className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all
          ${activeCategoryId === category.id
                        ? 'bg-[var(--color-primary)] text-[var(--color-dark)]'
                        : 'text-white/65 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    {getItemName(category)}
                  </button>
                ))}

              </div>


              {/* Subcategories */}
              {activeCategoryId && subcategories.length > 0 && (
                <div className="flex gap-2 flex-wrap animate-in slide-in-from-top-1 duration-300">

                  <button
                    onClick={() => {
                      clearProductSearch();
                      setSubFilter(null);
                    }}
                    className={`px-2 py-1 rounded-md text-[7px] font-bold uppercase
          ${subFilter === null
                        ? 'bg-[var(--color-accent)] text-[var(--color-dark)]'
                        : 'text-white/55 hover:text-white'
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
                      className={`px-2 py-1 rounded-md text-[7px] font-bold uppercase
            ${subFilter == sub.id
                          ? 'bg-[var(--color-accent)] text-[var(--color-dark)]'
                          : 'text-white/55 hover:text-white'
                        }`}
                    >
                      {getItemName(sub)}
                    </button>
                  ))}

                </div>
              )}

            </div>


          </div>
          <div className="hidden sm:flex flex-col items-end gap-1">
            <h1 className="text-sm font-black text-white uppercase tracking-widest">{t.title[lang]}</h1>
            {search.trim() && (
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">
                {productData?.totalCount ?? 0} nəticə
              </span>
            )}
          </div>
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

   

<section className="py-12 bg-white">
  <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center gap-4 md:gap-10">

    {/* LEFT */}
    <button
      onClick={() => setPage((p) => Math.max(p - 1, 1))}
      disabled={page === 1}
      className="
        w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14
        hidden sm:flex items-center justify-center
        rounded-full bg-[var(--color-surface)] border border-[color-mix(in_srgb,var(--color-primary)_24%,white)] text-[var(--color-dark)] hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,white)]
        disabled:opacity-40 transition
      "
    >
      <ChevronLeft
        className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
        strokeWidth={2.5}
      />
    </button>

    {/* PRODUCTS */}
    <div className="flex-1">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {productData?.items?.map((product) => (
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

    {/* RIGHT */}
    <button
      onClick={() => setPage((p) => totalPages > 0 ? Math.min(p + 1, totalPages) : p)}
      disabled={totalPages === 0 || page >= totalPages}
      className="
        w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14
        hidden sm:flex items-center justify-center
        rounded-full bg-[var(--color-surface)] border border-[color-mix(in_srgb,var(--color-primary)_24%,white)] text-[var(--color-dark)] hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,white)]
        disabled:opacity-40 transition
      "
    >
      <ChevronRight
        className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
        strokeWidth={2.5}
      />
    </button>

  </div>
</section>
<div className="flex justify-center items-center gap-2 mt-1 pb-8">
     <button
  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
  className="px-3 py-2 rounded"
>
  <ChevronLeft/>
</button>
  {getPagination(page, totalPages).map((item, index) => {
    if (item === "prevDots" || item === "nextDots") {
      return (
        <span key={index} className="px-2 text-gray-400">
          ...
        </span>
      );
    }

    return (
      <>
      <button
        key={item}
        onClick={() => setPage(item)}
        className={`
          w-10 h-10 rounded-full transition
          ${page === item
            ? "bg-[var(--color-primary)] text-[var(--color-dark)]"
            : "bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,white)]"
          }
        `}
      >
        {item}
      </button>
   
      </>
    );
  })}
     <button
  onClick={() =>
    setPage(prev => totalPages > 0 ? Math.min(prev + 1, totalPages) : prev)
  }
  disabled={totalPages === 0 || page >= totalPages}
  className="px-3 py-2 rounded"
>
  <ChevronRight/>
</button>
</div>
 
    </div>
  );
};

export default ProductsPage;
