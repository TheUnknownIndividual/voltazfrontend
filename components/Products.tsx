
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from '../types';
import ProductCard from './ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { useProduct } from '../contexts/ProductContext';

const DESKTOP_PRODUCTS_QUERY = '(min-width: 1024px)';

const getResponsiveItemsPerPage = () => {
  if (typeof window === 'undefined') return 4;
  return window.matchMedia(DESKTOP_PRODUCTS_QUERY).matches ? 4 : 2;
};

interface ProductsProps {
  onSelectProduct: (id: string) => void;
  onViewAll?: () => void;
  onOrderNow?: (id: string, quantity: number) => void;
  onAddToCart?: (id: string, quantity: number) => void;
  lang?: 'az' | 'en' | 'ru' | 'tr';
}

const Products: React.FC<ProductsProps> = ({ onSelectProduct, onViewAll, onOrderNow, onAddToCart, lang = 'az' }) => {
  const { getHomeProducts, productHomeData } = useProduct();
  const [startIndex, setStartIndex] = useState(0);
  const [direction, setDirection] = useState(0); 
  const [itemsPerPage, setItemsPerPage] = useState(getResponsiveItemsPerPage);
   
useEffect(() => {
  const fetchProducts = async () => {
    await getHomeProducts(
  undefined,
  undefined,
  1,
  12
);
  };

  fetchProducts();
}, []);

useEffect(() => {
  const mediaQuery = window.matchMedia(DESKTOP_PRODUCTS_QUERY);
  const updateItemsPerPage = () => {
    setItemsPerPage(mediaQuery.matches ? 4 : 2);
    setStartIndex(0);
  };

  updateItemsPerPage();
  mediaQuery.addEventListener('change', updateItemsPerPage);

  return () => mediaQuery.removeEventListener('change', updateItemsPerPage);
}, []);

  console.log('productHomeData', productHomeData);
const hasVisiblePrice = (product: Product) =>
  (product.productParametrs || []).some((param: any) => Number(param?.amount || 0) > 0);

const items = [...(productHomeData?.items || [])].sort((a, b) => {
  const aHasPrice = hasVisiblePrice(a);
  const bHasPrice = hasVisiblePrice(b);
  if (aHasPrice !== bHasPrice) return aHasPrice ? -1 : 1;
  return Number(b.id || 0) - Number(a.id || 0);
});

const totalPages = Math.ceil(items.length / itemsPerPage);

const currentPage = totalPages > 0
  ? Math.floor(startIndex / itemsPerPage) % totalPages
  : 0;

const productsToShow = items.slice(
  startIndex,
  startIndex + itemsPerPage
);

const getWrappedIndex = (nextIndex: number) => {
  if (items.length === 0) return 0;
  if (nextIndex >= items.length) return 0;
  if (nextIndex < 0) return Math.max((totalPages - 1) * itemsPerPage, 0);
  return nextIndex;
};

useEffect(() => {
  if (items.length <= itemsPerPage) return;

  const timer = setInterval(() => {
    setDirection(1);
    setStartIndex((prev) => getWrappedIndex(prev + itemsPerPage));
  }, 4000);

  return () => clearInterval(timer);
}, [items.length, itemsPerPage, totalPages]);

const handleNext = () => {
  setDirection(1);
  setStartIndex((prev) => getWrappedIndex(prev + itemsPerPage));
};

 const handlePrev = () => {
  setDirection(-1);
  setStartIndex((prev) => getWrappedIndex(prev - itemsPerPage));
};

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  return (
    <section id="products" className="products-theme py-12 md:py-24 bg-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-6">
          <div className="text-left">
            <h2 className="text-2xl md:text-5xl font-black text-slate-900 leading-tight mb-1 md:mb-2">Məhsullarımız</h2>
            <p className="text-slate-500 text-[11px] md:text-base leading-relaxed max-w-lg mt-3 md:mt-4">Beynəlxalq sertifikatlı brendlərin rəsmi distribütoru olaraq orijinal avadanlıqlar təklif edirik.</p>
          </div>
          
          {items.length > itemsPerPage && (
            <div className="flex gap-3">
              <button 
                onClick={handlePrev}
                className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:border-emerald-600 hover:text-emerald-600 transition-all active:scale-90"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button 
                onClick={handleNext}
                className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:border-emerald-600 hover:text-emerald-600 transition-all active:scale-90"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={startIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {productsToShow?.map((product) => (
                <ProductCard 
                  key={product.id}
                  product={product} 
                  onSelectProduct={onSelectProduct} 
                  onAddToCart={onAddToCart} 
                  onOrderNow={onOrderNow} 
                  lang={lang} 
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {items.length > itemsPerPage && (
          <div className="mt-12 flex flex-col items-center gap-8">
            {/* Pagination Dots */}
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > currentPage ? 1 : -1);
                    setStartIndex(i * itemsPerPage);
                  }}
                  className={`h-1.5 transition-all rounded-full ${currentPage === i ? 'w-8 bg-emerald-600' : 'w-2 bg-slate-200 hover:bg-slate-300'}`}
                />
              ))}
            </div>

            <button onClick={onViewAll} className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95 group">
              Hamısına Bax
              <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Products;
