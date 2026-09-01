
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Product } from '../types';
import { useCategory } from '@/contexts/CategoryContext';
import OutOfStockWhatsappAction from './OutOfStockWhatsappAction';

export interface ProductReturnContext {
  category?: string | number;
  subCategory?: string | number;
  search?: string;
  page?: number;
  returnUrl?: string;
}

interface ProductCardProps {
  product: Product;
  onSelectProduct: (id: string, returnContext?: ProductReturnContext) => void;
  onAddToCart?: (id: string, quantity: number, power?: string, maxStock?: number) => void;
  onOrderNow?: (id: string, quantity: number, power?: string, maxStock?: number) => void;
  lang?: 'az' | 'en' | 'ru' | 'tr';
  search?: string;
  enableImageGallery?: boolean;
}

const parsePowerInWatts = (value: string) => {
  const match = value.trim().match(/^(\d+(?:[.,]\d+)?)\s*(kw|w)?$/i);
  if (!match) return null;

  const parsed = Number(match[1].replace(',', '.'));
  if (!Number.isFinite(parsed)) return null;
  return match[2]?.toLowerCase() === 'kw' ? parsed * 1000 : parsed;
};

const matchesVariantSearch = (technicalPower: string | undefined, search: string) => {
  const variantValue = technicalPower?.trim();
  const query = search.trim();
  if (!variantValue || !query) return false;

  const normalizedVariant = variantValue.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9]+/g, '');
  if (normalizedVariant === normalizedQuery) return true;
  if (/[a-z]/.test(normalizedQuery) && normalizedVariant.includes(normalizedQuery)) return true;

  const powerQuery = query.match(/(\d+(?:[.,]\d+)?)\s*(kw|w)\b/i);
  if (powerQuery) {
    const queryWatts = parsePowerInWatts(`${powerQuery[1]}${powerQuery[2]}`);
    const variantWatts = parsePowerInWatts(variantValue);
    return queryWatts !== null && variantWatts === queryWatts;
  }

  if (/^\d+(?:[.,]\d+)?$/.test(query)) {
    const numericQuery = Number(query.replace(',', '.'));
    const variantWatts = parsePowerInWatts(variantValue);
    return Number.isFinite(numericQuery)
      && (variantWatts === numericQuery || variantWatts === numericQuery * 1000);
  }

  return false;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct, onAddToCart, onOrderNow, lang = 'az', search = '', enableImageGallery = false }) => {
  const galleryImages = useMemo(() => {
    const candidates = [
      ...(Array.isArray(product.productImage) ? product.productImage : []),
      ...(Array.isArray(product.images) ? product.images : []),
      product.image,
    ];

    return Array.from(new Set(candidates.filter((image): image is string => Boolean(image?.trim())))).slice(0, enableImageGallery ? 5 : 1);
  }, [enableImageGallery, product.image, product.images, product.productImage]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryHovered, setIsGalleryHovered] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const didSwipeRef = useRef(false);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product.id]);

  useEffect(() => {
    setActiveImageIndex((current) => current < galleryImages.length ? current : 0);
  }, [galleryImages.length]);

  useEffect(() => {
    if (!isGalleryHovered || galleryImages.length < 2) return;

    const timer = window.setTimeout(() => {
      setActiveImageIndex((current) => (current + 1) % galleryImages.length);
    }, 2800);

    return () => window.clearTimeout(timer);
  }, [activeImageIndex, galleryImages.length, isGalleryHovered]);

  useEffect(() => {
    if (!enableImageGallery || isGalleryHovered || activeImageIndex === 0) return;

    const resetTimer = window.setTimeout(() => {
      setActiveImageIndex(0);
    }, 7000);

    return () => window.clearTimeout(resetTimer);
  }, [activeImageIndex, enableImageGallery, isGalleryHovered]);

  const showPreviousImage = () => {
    setActiveImageIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length);
  };

  const showNextImage = () => {
    setActiveImageIndex((current) => (current + 1) % galleryImages.length);
  };

  const handleProductOpen = (event: React.MouseEvent) => {
    if (didSwipeRef.current) {
      event.preventDefault();
      didSwipeRef.current = false;
      return;
    }
    onSelectProduct(product.id);
  };
  const t = {
    onOrder: lang === 'az' ? 'Sifarişlə' : lang === 'en' ? 'On Order' : lang === 'ru' ? 'Под заказ' : 'Sipariş üzerine',
    inStock: lang === 'az' ? 'Stokda' : lang === 'en' ? 'In Stock' : lang === 'ru' ? 'В наличии' : 'Stokta',
    addToCart: lang === 'az' ? 'Səbətə əlavə et' : lang === 'en' ? 'Add to Cart' : lang === 'ru' ? 'В корзину' : 'Sepete ekle',
    orderNow: lang === 'az' ? 'Sifariş Et' : lang === 'en' ? 'Order Now' : lang === 'ru' ? 'Заказать сейчас' : 'Sipariş ver',
    requestPrice: lang === 'az' ? 'Qiymət təklifi al' : lang === 'en' ? 'Request Price' : lang === 'ru' ? 'Запросить цену' : 'Fiyat teklifi al',
    check: lang === 'az' ? 'Yoxla' : lang === 'en' ? 'Check' : lang === 'ru' ? 'Проверить' : 'Kontrol et',
    buyCredit: lang === 'az' ? 'Kreditlə al' : lang === 'en' ? 'Buy with credit' : lang === 'ru' ? 'Купить в кредит' : 'Krediyle al'
  };
  const {
    brands,
  } = useCategory();
  const parameters = Array.isArray(product.productParametrs) ? product.productParametrs : [];
  const matchingParam = parameters.find((item) =>
    matchesVariantSearch(item?.technicalPower, search)
  );
  const purchasableParam = parameters.find((item) =>
    Boolean(product.inStock && Number(item?.count || 0) > 0 && Number(item?.amount || 0) > 0)
  );
  const displayParam = matchingParam || purchasableParam || parameters[0];
  const productSpecBadge = displayParam?.technicalPower?.trim();
  const firstAmount = Number(displayParam?.amount || 0);
  const firstCount = Number(displayParam?.count || 0);
  const hasPrice = firstAmount > 0;
  const hasStock = Boolean(product.inStock && firstCount > 0);
  const stockCheckMessage = lang === 'az'
    ? `Salam, "${product.productName}" məhsulunun stokda olub-olmadığını öyrənmək istəyirəm.`
    : lang === 'en'
      ? `Hello, I would like to know if "${product.productName}" is in stock.`
      : lang === 'ru'
        ? `Здравствуйте, хочу узнать, есть ли в наличии "${product.productName}".`
        : `Merhaba, "${product.productName}" ürününün stokta olup olmadığını öğrenmek istiyorum.`;
  const stockCheckHref = `https://wa.me/994504180001?text=${encodeURIComponent(stockCheckMessage)}`;


  const getItemName = (item: any) => {
    const languageCode = lang === 'en' ? 2 : lang === 'ru' ? 3 : lang === 'tr' ? 4 : 1;
    const translations = Array.isArray(item?.languages) ? item.languages : [];
    const translation = translations.find((entry: any) => Number(entry?.languageCode) === languageCode)
      || translations.find((entry: any) => Number(entry?.languageCode) === 1)
      || translations[0];

    return (
      translation?.categoryName ||
      translation?.subCategoryName ||
      translation?.brandName ||
      translation?.seriesName ||
      translation?.technologyName ||
      translation?.promotionName ||
      ""
    );
  };


  return (
    <div className="group relative flex flex-col bg-white rounded-[1.75rem] transition-all duration-500 hover:-translate-y-2 h-full">
      {/* Main Card Body */}
      <div className="flex flex-col h-full border border-slate-100 rounded-[1.75rem] p-1.5 bg-white shadow-sm group-hover:shadow-2xl group-hover:border-emerald-100 transition-all duration-500 overflow-hidden">

        {/* Image Container */}
        <div
          onClick={handleProductOpen}
          onMouseEnter={() => {
            if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) setIsGalleryHovered(true);
          }}
          onMouseLeave={() => setIsGalleryHovered(false)}
          onPointerDown={(event) => {
            if (event.pointerType !== 'touch') return;
            touchStartXRef.current = event.clientX;
            didSwipeRef.current = false;
          }}
          onPointerUp={(event) => {
            if (event.pointerType !== 'touch' || touchStartXRef.current === null) return;
            const distance = event.clientX - touchStartXRef.current;
            touchStartXRef.current = null;
            if (Math.abs(distance) < 35 || galleryImages.length < 2) return;
            didSwipeRef.current = true;
            if (distance < 0) showNextImage();
            else showPreviousImage();
          }}
          onPointerCancel={() => { touchStartXRef.current = null; }}
          className="group/gallery relative aspect-[4/4.5] touch-pan-y overflow-hidden rounded-[1.25rem] bg-slate-50 cursor-pointer transition-colors duration-500 group-hover:bg-emerald-50/50"
        >
          <img
            src={galleryImages[activeImageIndex] || '/volt-logo.png'}
            alt={product.productName || product.name}
            loading="lazy"
            decoding="async"
            width="640"
            height="720"
            draggable={false}
            className="h-full w-full select-none object-contain transition-[transform,opacity] duration-500 group-hover:scale-105"
          />

          {galleryImages.length > 1 && (
            <>
              {isGalleryHovered && (
                <>
                  <button
                    type="button"
                    aria-label="Əvvəlki şəkil"
                    onClick={(event) => { event.stopPropagation(); showPreviousImage(); }}
                    className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg border border-[var(--border-light)] bg-white text-[var(--text-primary)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] md:flex"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Növbəti şəkil"
                    onClick={(event) => { event.stopPropagation(); showNextImage(); }}
                    className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg border border-[var(--border-light)] bg-white text-[var(--text-primary)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] md:flex"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </>
              )}

              <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-950/35 px-2 py-1.5 backdrop-blur-sm">
                {galleryImages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`${index + 1}-ci şəkli göstər`}
                    aria-current={activeImageIndex === index ? 'true' : undefined}
                    onClick={(event) => { event.stopPropagation(); setActiveImageIndex(index); }}
                    className={`h-1.5 rounded-full transition-all ${activeImageIndex === index ? 'w-4 bg-[var(--primary)]' : 'w-1.5 bg-white/75'}`}
                  />
                ))}
              </div>
            </>
          )}

          {productSpecBadge && (
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <div className="rounded-full border border-[color-mix(in_srgb,var(--primary)_22%,white)] bg-[var(--mint)] px-2.5 py-0.5 text-[7px] font-bold text-[var(--primary)] md:text-[9px]">
              {productSpecBadge}
            </div>
          </div>
          )}

          {hasStock && (
            <div className="absolute bottom-3 right-3">
              <div className="rounded-full bg-[var(--mint)] px-2.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.04em] text-[var(--primary)] md:text-[9px]">
                {firstCount}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="py-4 md:py-5 px-0 flex flex-col flex-grow">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[7px] md:text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">{
              getItemName(
                brands.find(c => c.id === product.productBrandId)
              )
            }</span>

            <span className="text-[6px] md:text-[8px] font-bold text-slate-400 uppercase tracking-tight">{product.subCategory}</span>

          </div>

          <h4
            onClick={() => onSelectProduct(product.id)}
            className="text-[10px] md:text-sm font-bold text-slate-900 mb-2 leading-tight line-clamp-2 cursor-pointer hover:text-emerald-600 transition-colors"
          >
            {product.productName}
          </h4>

          <div className="mt-auto">
            {hasPrice && (
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-xs md:text-xl font-black text-slate-900">
                {firstAmount}
              </span>
              <span className="text-[7px] md:text-[10px] font-bold text-slate-400 uppercase">
                AZN
              </span>
            </div>)}

            <div className="flex flex-col gap-2">
              {hasStock ? (
                <button
                  onClick={(e) => { e.stopPropagation(); onOrderNow?.(product.id, 1, productSpecBadge, firstCount); }}
                  className="flex w-full min-h-[var(--cta-btn-h)] items-center justify-center rounded-xl bg-[var(--primary)] py-3 text-xs font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-[var(--primary-hover)] md:py-4"
                >
                  {!hasPrice ? t.requestPrice : t.orderNow}
                </button>
              ) : (
                <OutOfStockWhatsappAction
                  href={stockCheckHref}
                  lang={lang}
                  placement="product_card_stock_check"
                  product={{
                    id: product.id,
                    name: product.productName || product.name,
                    category: product.category,
                    subCategory: product.subCategory,
                    brand: product.brand,
                    variant: productSpecBadge,
                    requestedQuantity: 1,
                    availableStock: firstCount,
                  }}
                  className="flex w-full min-h-[var(--cta-btn-h)] items-center justify-center rounded-xl bg-[var(--primary)] py-3 text-center text-xs font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-[var(--primary-hover)] md:py-4"
                >
                  {t.check}
                </OutOfStockWhatsappAction>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onAddToCart?.(product.id, 1, productSpecBadge, firstCount); }}
                disabled={!hasPrice || !hasStock}
                className="flex w-full min-h-[var(--cta-btn-h)] items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--primary)_24%,white)] bg-[var(--mint)] py-3 text-xs font-semibold uppercase tracking-[0.04em] text-[var(--header-bg)] transition-colors hover:bg-[var(--mint-hover)] disabled:cursor-not-allowed disabled:border-[var(--border-light)] disabled:bg-slate-100 disabled:text-slate-400 md:py-4"
              >
                {t.addToCart}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
