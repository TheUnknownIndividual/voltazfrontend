
import React, { useEffect, useRef, useState } from 'react';
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { PackageCheck, ShoppingCart } from 'lucide-react';
import { ProductVariant } from '../types';
import { useProduct } from "../contexts/ProductContext";
import { useCategory } from '@/contexts/CategoryContext';
import { useParams } from "react-router-dom";
import Share from "../components/Share";
import ProductCard from './ProductCard';
import OutOfStockWhatsappAction from './OutOfStockWhatsappAction';
import { absoluteSiteUrl, localizePath } from '../utils/seoRoutes';
import { getStockWarning } from '../utils/productInventory';
import { API_ENDPOINTS } from '../utils/constants';

interface ProductDetailProps {
  productId: string;
  onBack: (productCategory?: { category?: string | number; subCategory?: string | number }) => void;
  onOrderNow: (id: string, quantity: number, power: string, maxStock: number) => void;
  onAddToCart: (id: string, quantity: number, power: string, maxStock: number) => void;
  onSelectProduct: (id: string) => void;
  cartPreview?: React.ReactNode;
  lang?: 'az' | 'en' | 'ru' | 'tr';
}

interface ExpandableDescriptionProps {
  text: string;
  expanded: boolean;
  readMoreLabel: string;
  onExpand: () => void;
}

const ExpandableDescription: React.FC<ExpandableDescriptionProps> = ({ text, expanded, readMoreLabel, onExpand }) => {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const normalizedText = text.replace(/\s+/g, ' ').trim();

  useEffect(() => {
    const element = textRef.current;
    if (!element || expanded) return;

    let animationFrame = 0;
    const measure = () => {
      setHasOverflow(element.scrollHeight > element.clientHeight + 1);
    };
    const scheduleMeasure = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        measure();
      });
    };
    const resizeObserver = new ResizeObserver(scheduleMeasure);

    resizeObserver.observe(element);
    scheduleMeasure();
    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [expanded, normalizedText]);

  return (
    <div className="relative">
      <p
        ref={textRef}
        className={`text-sm leading-relaxed text-slate-500 md:text-base ${expanded ? '' : 'product-description-clamped'}`}
      >
        {normalizedText}
      </p>
      {!expanded && hasOverflow && (
        <button
          type="button"
          onClick={onExpand}
          className="product-description-ellipsis absolute bottom-0 right-0 bg-gradient-to-l from-white via-white to-transparent pl-3"
          aria-label={readMoreLabel}
          aria-expanded={false}
        >
          ...
        </button>
      )}
    </div>
  );
};

interface ExpandableFeaturesProps {
  text: string;
  readMoreLabel: string;
  showLessLabel: string;
}

const FEATURES_PREVIEW_CHARACTERS = 320;

const ExpandableFeatures: React.FC<ExpandableFeaturesProps> = ({ text, readMoreLabel, showLessLabel }) => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [text]);

  const normalizedText = text.trim();
  const hasOverflow = normalizedText.length > FEATURES_PREVIEW_CHARACTERS;
  const boundary = hasOverflow
    ? normalizedText.lastIndexOf(' ', FEATURES_PREVIEW_CHARACTERS)
    : normalizedText.length;
  const previewLength = boundary >= FEATURES_PREVIEW_CHARACTERS * 0.7
    ? boundary
    : FEATURES_PREVIEW_CHARACTERS;
  const displayText = expanded || !hasOverflow
    ? normalizedText
    : normalizedText.slice(0, previewLength).trimEnd();

  return (
    <div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
        {displayText}
        {!expanded && hasOverflow && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="product-description-ellipsis ml-1"
            aria-label={readMoreLabel}
            aria-expanded={false}
          >
            ...
          </button>
        )}
        {expanded && hasOverflow && (
          <>
            {' '}
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="product-description-ellipsis text-[var(--color-primary)]"
              aria-expanded={true}
            >
              {showLessLabel}
            </button>
          </>
        )}
      </p>
    </div>
  );
};

interface PdfBookPreviewProps {
  sourceUrl: string;
  title: string;
  lang?: ProductDetailProps['lang'];
}

// The filename is content-hashed by Vite. This additional version prevents a
// browser which cached the old IIS 404 for that same hash from reusing it after
// the server-side MIME fix was deployed.
const PDF_WORKER_VERSION = '20260826.2';

const PdfBookPreview: React.FC<PdfBookPreviewProps> = ({ sourceUrl, title, lang }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<Array<HTMLCanvasElement | null>>([]);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [renderedPages, setRenderedPages] = useState<number[]>([]);
  const [failed, setFailed] = useState(false);
  const [isDesktopSpread, setIsDesktopSpread] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches,
  );

  const labels = {
    loading: lang === 'az' ? 'PDF hazırlanır…' : lang === 'ru' ? 'PDF загружается…' : lang === 'tr' ? 'PDF hazırlanıyor…' : 'Preparing PDF…',
    page: lang === 'az' ? 'Səhifə' : lang === 'ru' ? 'Страница' : lang === 'tr' ? 'Sayfa' : 'Page',
    fallback: lang === 'az' ? 'Daxili PDF görüntüləyicisi' : lang === 'ru' ? 'Встроенный просмотрщик PDF' : lang === 'tr' ? 'Yerleşik PDF görüntüleyici' : 'Built-in PDF viewer',
  };

  useEffect(() => {
    const element = rootRef.current;
    if (!element || shouldLoad) return;
    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: '500px 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [shouldLoad]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const updateLayout = () => setIsDesktopSpread(mediaQuery.matches);
    updateLayout();
    mediaQuery.addEventListener('change', updateLayout);
    return () => mediaQuery.removeEventListener('change', updateLayout);
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    let cancelled = false;
    let loadingTask: PDFDocumentLoadingTask | undefined;
    let pdfDocument: PDFDocumentProxy | undefined;
    const renderTasks: RenderTask[] = [];
    const abortController = new AbortController();

    const render = async () => {
      try {
        setFailed(false);
        setRenderedPages([]);
        const [pdfjs, response] = await Promise.all([
          import('pdfjs-dist'),
          fetch(API_ENDPOINTS.PRODUCT.PREVIEW_DATASHEET(sourceUrl), {
            signal: abortController.signal,
            credentials: 'omit',
          }),
        ]);
        if (cancelled) return;
        if (!response.ok) {
          throw new Error(`Datasheet request failed with HTTP ${response.status}.`);
        }

        // Passing the fetched bytes to PDF.js avoids a second, browser-specific
        // range/stream request. That is especially important on mobile WebViews,
        // where the native PDF viewer used to take over after the first page.
        const data = new Uint8Array(await response.arrayBuffer());
        if (cancelled) return;
        pdfjs.GlobalWorkerOptions.workerSrc = `${pdfWorkerUrl}?v=${PDF_WORKER_VERSION}`;
        loadingTask = pdfjs.getDocument({
          data,
        });
        pdfDocument = await loadingTask.promise;
        if (cancelled) return;

        // Two pages are always loaded: desktop lays them out as a spread while
        // mobile presents them vertically, so page two is reached by scrolling.
        const visiblePages = Math.min(2, pdfDocument.numPages);
        setPageCount(pdfDocument.numPages);
        const availableWidth = rootRef.current?.clientWidth || 900;
        const targetWidth = isDesktopSpread && visiblePages > 1
          ? (availableWidth - 24) / 2
          : availableWidth;
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

        for (let pageNumber = 1; pageNumber <= visiblePages; pageNumber += 1) {
          if (cancelled) return;
          const page = await pdfDocument.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const cssScale = Math.min(1.5, targetWidth / baseViewport.width);
          const viewport = page.getViewport({ scale: cssScale * pixelRatio });
          const canvas = canvasRefs.current[pageNumber - 1];
          if (!canvas) continue;
          canvas.width = Math.max(1, Math.floor(viewport.width));
          canvas.height = Math.max(1, Math.floor(viewport.height));
          canvas.style.aspectRatio = `${viewport.width} / ${viewport.height}`;
          const renderTask = page.render({ canvas, viewport });
          renderTasks.push(renderTask);
          await renderTask.promise;
          if (!cancelled) setRenderedPages((current) => [...new Set([...current, pageNumber])]);
        }
      } catch (error) {
        const errorName = (error as { name?: string })?.name;
        if (!cancelled && errorName !== 'RenderingCancelledException' && errorName !== 'AbortError') setFailed(true);
      }
    };

    void render();
    return () => {
      cancelled = true;
      abortController.abort();
      renderTasks.forEach((task) => task.cancel());
      if (loadingTask) void loadingTask.destroy();
    };
  }, [shouldLoad, sourceUrl, isDesktopSpread]);

  const visiblePageSlots = pageCount === 1 ? [1] : [1, 2];

  return (
    <div ref={rootRef} className="rounded-[1.5rem] border border-slate-200 bg-slate-200/60 p-3 shadow-sm md:p-5">
      {failed ? (
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
          <iframe
            src={`${sourceUrl}#page=1&view=FitH&navpanes=0`}
            title={`${title} — ${labels.fallback}`}
            loading="lazy"
            className="h-[72vh] min-h-[520px] w-full bg-white"
          />
          <div className="border-t border-slate-100 px-4 py-3">
            <span className="min-w-0 truncate text-[10px] font-bold text-slate-500">{title}</span>
          </div>
        </div>
      ) : (
        <>
          <div className={`grid gap-3 md:gap-5 ${visiblePageSlots.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'mx-auto max-w-xl grid-cols-1'}`}>
            {visiblePageSlots.map((pageNumber) => (
              <div key={pageNumber} className="relative overflow-hidden rounded-xl bg-white shadow-[0_8px_30px_rgba(15,23,42,0.12)] ring-1 ring-slate-200">
                {!renderedPages.includes(pageNumber) && (
                  <div className="absolute inset-0 z-10 flex aspect-[210/297] items-center justify-center bg-white text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {shouldLoad ? labels.loading : 'PDF'}
                  </div>
                )}
                <canvas ref={(element) => { canvasRefs.current[pageNumber - 1] = element; }} className="block h-auto w-full bg-white" aria-label={`${title} — ${labels.page} ${pageNumber}`} />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <span className="min-w-0 truncate text-[10px] font-bold text-slate-500">{title}{pageCount ? ` · ${pageCount} ${labels.page.toLowerCase()}` : ''}</span>
          </div>
        </>
      )}
    </div>
  );
};

const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onBack, onOrderNow, onAddToCart, onSelectProduct, cartPreview, lang }) => {
  const { getProductById, prefetchProducts } = useProduct();
  const { getBrandById, getTechnologyById } = useCategory();
  const { id } = useParams<{ id: string }>();
  const [brand, setBrand] = useState<any>(null);
  const [technology, setTechnology] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<'features' | 'shipping' | 'return' | 'warranty'>('features');
  const [months, setMonths] = useState<6 | 12 | 18>(6);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [stockLimitAttempted, setStockLimitAttempted] = useState(false);
  const [activeImage, setActiveImage] = useState('');
  const [hoverPreviewImage, setHoverPreviewImage] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showMobileFloatingActions, setShowMobileFloatingActions] = useState(false);
  const [tabsCanScrollMore, setTabsCanScrollMore] = useState(false);
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const productShellRef = useRef<HTMLDivElement>(null);
  const inlineActionsRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);
  const floatingActionsVisibleRef = useRef(false);



  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [isLoadingSimilarProducts, setIsLoadingSimilarProducts] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await getProductById(id);

        setProduct(res.data);

        if (res.data.productBrandId) {
          const brandRes = await getBrandById(res.data.productBrandId);
          setBrand(brandRes.name);
        }

        if (res.data.productTechnologyId) {
          const techRes = await getTechnologyById(
            res.data.productTechnologyId
          );

          setTechnology(techRes.name);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadProduct();
  }, [id]);

  useEffect(() => {
    const categoryId = Number(product?.productCategoryId);
    if (!product?.id || !Number.isFinite(categoryId)) {
      setSimilarProducts([]);
      setIsLoadingSimilarProducts(false);
      return;
    }

    let isCurrentRequest = true;
    setIsLoadingSimilarProducts(true);
    setSimilarProducts([]);

    void prefetchProducts(categoryId, undefined, 1, 8)
      .then((data) => {
        if (!isCurrentRequest) return;

        const items = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data?.items)
            ? data.data.items
            : Array.isArray(data)
              ? data
              : [];
        const currentProductId = String(product.id);
        const currentSubCategoryId = String(product.productSubCategoryId ?? '');
        const currentBrandId = String(product.productBrandId ?? '');
        const currentTechnologyId = String(product.productTechnologyId ?? '');

        const rankedProducts = items
          .filter((item: any) => String(item?.id) !== currentProductId)
          .map((item: any, index: number) => ({
            item,
            index,
            score:
              (currentSubCategoryId && String(item?.productSubCategoryId ?? '') === currentSubCategoryId ? 4 : 0)
              + (currentBrandId && String(item?.productBrandId ?? '') === currentBrandId ? 2 : 0)
              + (currentTechnologyId && String(item?.productTechnologyId ?? '') === currentTechnologyId ? 1 : 0),
          }))
          .sort((left, right) => right.score - left.score || left.index - right.index)
          .slice(0, 4)
          .map(({ item }: { item: any }) => item);

        setSimilarProducts(rankedProducts);
      })
      .catch(() => {
        if (isCurrentRequest) setSimilarProducts([]);
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoadingSimilarProducts(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [product?.id, product?.productCategoryId, product?.productSubCategoryId, product?.productBrandId, product?.productTechnologyId]);

  useEffect(() => {
    setIsDescriptionExpanded(false);
    setSelectedVariantId('');
    setQuantity(1);
    setStockLimitAttempted(false);
    setActiveImage('');
    setHoverPreviewImage('');
  }, [id]);

  useEffect(() => {
    if (!isDescriptionExpanded || !descriptionRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setIsDescriptionExpanded(false);
    }, { threshold: 0 });
    observer.observe(descriptionRef.current);
    return () => observer.disconnect();
  }, [isDescriptionExpanded]);

  useEffect(() => {
    const el = tabsScrollRef.current;
    if (!el) return;

    const updateScrollState = () => {
      const remaining = el.scrollWidth - el.clientWidth - el.scrollLeft;
      setTabsCanScrollMore(remaining > 4);
    };

    updateScrollState();
    el.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [product]);

  useEffect(() => {
    const syncMobileFloatingActions = () => {
      const productShell = productShellRef.current;
      const inlineActions = inlineActionsRef.current;
      const isPhone = window.innerWidth < 640;

      if (!productShell || !isPhone) {
        floatingActionsVisibleRef.current = false;
        setShowMobileFloatingActions(false);
        lastScrollYRef.current = window.scrollY;
        return;
      }

      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < lastScrollYRef.current - 4;
      const scrollingDown = currentScrollY > lastScrollYRef.current + 4;
      const productRect = productShell.getBoundingClientRect();
      const inlineRect = inlineActions?.getBoundingClientRect();
      const productIsActive = productRect.top < window.innerHeight - 110 && productRect.bottom > 0;
      const inlineActionsVisible = inlineRect
        ? inlineRect.top < window.innerHeight - 96 && inlineRect.bottom > 88
        : false;
      const inlineActionsStillAhead = inlineRect ? inlineRect.top > window.innerHeight - 96 : false;
      const canFloat = productIsActive && !inlineActionsVisible && inlineActionsStillAhead;
      let nextVisible = floatingActionsVisibleRef.current;

      if (!canFloat || scrollingDown) nextVisible = false;
      if (canFloat && (scrollingUp || !scrollingDown)) nextVisible = true;

      floatingActionsVisibleRef.current = nextVisible;
      setShowMobileFloatingActions(nextVisible);
      lastScrollYRef.current = currentScrollY;
    };

    syncMobileFloatingActions();
    window.addEventListener('scroll', syncMobileFloatingActions, { passive: true });
    window.addEventListener('resize', syncMobileFloatingActions);

    return () => {
      window.removeEventListener('scroll', syncMobileFloatingActions);
      window.removeEventListener('resize', syncMobileFloatingActions);
    };
  }, [id, product?.id]);

  useEffect(() => {
    if (!product) return;
    const languageCode = ({ az: 1, en: 2, ru: 3, tr: 4 } as const)[lang || 'az'] || 1;
    const translation = product.productDescriptions?.[0]?.languages?.find(
      (item: any) => item.languageCode === languageCode
    );
    const hasRequestedTranslation = (lang || 'az') === 'az' || Boolean(translation);
    const productTitle = product.productName ? `${product.productName} | Volt.az` : 'Məhsul | Volt.az';
    const rawDescription = String(translation?.description || translation?.features || '').replace(/\s+/g, ' ').trim();
    const productName = String(product.productName || '').trim();
    const productVariants = Array.isArray(product.productParametrs)
      ? product.productParametrs
      : [];
    const representativeVariant = productVariants.find((item: any) => item?.technicalPower || item?.effectiveness || Number(item?.amount) > 0);
    const factLabels = {
      az: { power: 'güc', efficiency: 'səmərəlilik', quote: 'qiymət təklifi', stock: 'stokda mövcuddur', details: 'Texniki göstəricilər, zəmanət və sifariş məlumatı.' },
      en: { power: 'power', efficiency: 'efficiency', quote: 'request a quote', stock: 'in stock', details: 'Specifications, warranty, and ordering information.' },
      ru: { power: 'мощность', efficiency: 'эффективность', quote: 'цена по запросу', stock: 'в наличии', details: 'Характеристики, гарантия и условия заказа.' },
      tr: { power: 'güç', efficiency: 'verimlilik', quote: 'fiyat teklifi', stock: 'stokta', details: 'Teknik özellikler, garanti ve sipariş bilgisi.' },
    }[lang || 'az'];
    const buyerFacts = [
      representativeVariant?.technicalPower ? `${representativeVariant.technicalPower} ${factLabels.power}` : '',
      representativeVariant?.effectiveness ? `${representativeVariant.effectiveness} ${factLabels.efficiency}` : '',
      Number(representativeVariant?.amount) > 0 ? `${representativeVariant.amount} AZN` : '',
      Number(representativeVariant?.amount) > 0 ? '' : factLabels.quote,
      product.inStock ? factLabels.stock : '',
    ].filter(Boolean).join(', ');
    const descriptionBase = (
      rawDescription && productName && !rawDescription.toLocaleLowerCase().includes(productName.toLocaleLowerCase())
        ? `${productName}. ${rawDescription}`
        : rawDescription || `${productName || 'Volt.az məhsulu'}. ${factLabels.details}`
    );
    const productDescriptionMeta = `${descriptionBase}${buyerFacts ? ` ${buyerFacts}.` : ''}`.slice(0, 155);
    const canonicalUrl = absoluteSiteUrl(localizePath(`/product/${product.id || id}`, hasRequestedTranslation ? (lang || 'az') : 'az'));
    const toAbsoluteUrl = (value: string) => {
      if (!value) return 'https://volt.az/volt-logo.png';
      if (/^https?:\/\//i.test(value)) return value;
      return value.startsWith('/') ? `https://volt.az${value}` : `https://volt.az/${value}`;
    };
    const productImage = Array.isArray(product.productImage) && product.productImage[0]
      ? product.productImage[0]
      : '/volt-logo.png';
    const adminIdentifier = String(product.id || id || '').trim();
    const firstPricedVariant = productVariants.find((item: any) => Number(item?.amount) > 0);
    const priceValue = Number(firstPricedVariant?.amount || product.price || 0);
    const hasTrackedVariantStock = productVariants.length === 0
      || productVariants.some((item: any) => Number(item?.count) > 0);
    const isInStock = Boolean(product.inStock && hasTrackedVariantStock);
    const additionalProperty = [
      ...new Set<string>(
        productVariants
          .flatMap((item: any) => [
            item?.technicalPower && { name: 'Güc', value: String(item.technicalPower) },
            item?.effectiveness && { name: 'Səmərəlilik', value: String(item.effectiveness) },
          ])
          .filter(Boolean)
          .map((item: any) => JSON.stringify(item))
      ),
    ].map((item: string) => JSON.parse(item));
    const absoluteProductImage = toAbsoluteUrl(String(productImage));
    const schemaImage = absoluteProductImage;

    const setMeta = (selector: string, attr: 'content' | 'href', value: string) => {
      const element = document.head.querySelector(selector);
      element?.setAttribute(attr, value);
    };

    document.title = productTitle;
    setMeta('meta[name="description"]', 'content', productDescriptionMeta);
    const robots = hasRequestedTranslation
      ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      : 'noindex, follow';
    setMeta('meta[name="robots"]', 'content', robots);
    setMeta('meta[name="googlebot"]', 'content', robots);
    setMeta('meta[property="og:title"]', 'content', productTitle);
    setMeta('meta[property="og:description"]', 'content', productDescriptionMeta);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[property="og:type"]', 'content', 'product');
    setMeta('meta[property="og:image"]', 'content', absoluteProductImage);
    setMeta('meta[property="twitter:title"]', 'content', productTitle);
    setMeta('meta[property="twitter:description"]', 'content', productDescriptionMeta);
    setMeta('meta[property="twitter:image"]', 'content', absoluteProductImage);
    setMeta('link[rel="canonical"]', 'href', canonicalUrl);

    const productJsonLd: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Product',
          '@id': `${canonicalUrl}#product`,
          name: product.productName || productTitle.replace(' | Volt.az', ''),
          description: productDescriptionMeta,
          image: schemaImage ? [schemaImage] : undefined,
          sku: adminIdentifier,
          productID: adminIdentifier,
          ...(product.model ? { mpn: String(product.model) } : {}),
          ...(brand || product.brand ? {
            brand: {
              '@type': 'Brand',
              name: brand || product.brand,
            },
          } : {}),
          ...(additionalProperty.length > 0 ? { additionalProperty } : {}),
          ...(priceValue > 0 ? {
            offers: {
              '@type': 'Offer',
              url: canonicalUrl,
              priceCurrency: 'AZN',
              price: String(priceValue),
              availability: isInStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              itemCondition: 'https://schema.org/NewCondition',
            },
          } : {}),
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${canonicalUrl}#breadcrumb`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Ana səhifə', item: 'https://volt.az/' },
            { '@type': 'ListItem', position: 2, name: 'Məhsullar', item: 'https://volt.az/products' },
            { '@type': 'ListItem', position: 3, name: product.productName || productTitle.replace(' | Volt.az', ''), item: canonicalUrl },
          ],
        },
      ],
    };

    let script = document.getElementById('volt-product-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'volt-product-jsonld';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(productJsonLd);

    return () => {
      document.getElementById('volt-product-jsonld')?.remove();
    };
  }, [product, id, lang, brand]);


  if (!product) {
    return (
      <div className="pt-32 text-center">
        Loading...
      </div>
    );
  }

  const languageCodeMap = {
    az: 1,
    en: 2,
    ru: 3,
    tr: 4
  };

  const currentLanguageCode =
    languageCodeMap[lang as keyof typeof languageCodeMap] || 1;

  const currentTranslation =
    product.productDescriptions?.[0]?.languages?.find(
      l => l.languageCode === currentLanguageCode
    );

  const commonProductDescription = currentTranslation?.description || "";
  const commonProductFeatures = currentTranslation?.features || "";

  const toProductNumber = (value: unknown) => Number(value || 0);
  const toVariantStatus = (item: any, index: number): ProductVariant & { variantKey: string; hasVariantPrice: boolean; hasVariantStock: boolean; isPurchasable: boolean } => {
    const count = toProductNumber(item?.count);
    const amount = toProductNumber(item?.amount);

    return {
      id: item?.id,
      variantKey: String(item?.id ?? `legacy-${index}`),
      modelLabel: item?.modelLabel || '',
      technicalPower: item?.technicalPower || '',
      effectiveness: item?.effectiveness || '',
      count,
      amount,
      languages: Array.isArray(item?.languages) ? item.languages : [],
      hasVariantPrice: amount > 0,
      hasVariantStock: Boolean(product.inStock && count > 0),
      isPurchasable: Boolean(product.inStock && count > 0 && amount > 0),
    };
  };



  // const allVariants: ProductVariant[] = [
  //   {
  //     technicalPower: product.productParametrs?.[0]?.technicalPower || '',
  //     effectiveness: product.productParametrs?.[0]?.effectiveness || '',
  //     count: product.productParametrs?.[0]?.count || 0,
  //     amount: product.productParametrs?.[0]?.amount || 0
  //   },
  // ];


  // const currentVariant = allVariants[selectedVariantIndex];
  const variantsByStatus = (product.productParametrs || []).map(toVariantStatus);
  const availableVariants = variantsByStatus.filter((variant) => variant.isPurchasable);
  const unavailableVariants = variantsByStatus.filter((variant) => !variant.isPurchasable);
  const allVariants = [...availableVariants, ...unavailableVariants];

  const currentVariant = allVariants.find((variant) => variant.variantKey === selectedVariantId) || allVariants[0] || {
    variantKey: '',
    modelLabel: '',
    technicalPower: '',
    effectiveness: '',
    count: 0,
    amount: 0,
    languages: [],
  };
  const currentVariantTranslation = !product.useCommonVariantContent
    ? currentVariant.languages?.find((translation) => Number(translation.languageCode) === currentLanguageCode)
    : undefined;
  const productDescription = currentVariantTranslation?.description || commonProductDescription;
  const productFeatures = currentVariantTranslation?.features || commonProductFeatures;

  const currentPrice = currentVariant?.amount;
  const currentCount= currentVariant?.count
  const availableStock = Math.max(0, Math.floor(Number(currentCount || 0)));
  const hasPrice = Number(currentPrice || 0) > 0;
  const hasStock = Boolean(product.inStock && availableStock > 0);
  const quantityExceedsStock = hasStock && quantity > availableStock;
  const showStockLimitWarning = quantityExceedsStock || stockLimitAttempted;
  const stockCheckMessage = lang === 'az'
    ? `Salam, "${product.productName}" məhsulunun stokda olub-olmadığını öyrənmək istəyirəm.`
    : lang === 'ru'
      ? `Здравствуйте, хочу узнать, есть ли в наличии "${product.productName}".`
      : lang === 'tr'
        ? `Merhaba, "${product.productName}" ürününün stokta olup olmadığını öğrenmek istiyorum.`
        : `Hello, I would like to know if "${product.productName}" is in stock.`;
  const stockCheckHref = `https://wa.me/994504180001?text=${encodeURIComponent(stockCheckMessage)}`;
  const currentPower = (currentVariant?.technicalPower || '').trim();
  const currentEfficiency = currentVariant?.effectiveness || '';
  const hasTechnicalPower = Boolean(currentPower && currentPower !== '0');
  const hasAnyTechnicalPower = allVariants.some((variant) => {
    const power = (variant.technicalPower || '').trim();
    return (power && power !== '0') || Boolean(variant.modelLabel?.trim());
  });
  const hasEfficiency = Boolean(currentEfficiency && currentEfficiency !== '0');
  const datasheetItems = Array.isArray(product.productDatasheet)
    ? product.productDatasheet.filter((item: string) => typeof item === 'string' && item.trim())
    : [];
  const certificateItems = [
    ...(typeof product.certificate === 'string' && product.certificate.trim() ? [product.certificate.trim()] : []),
    ...(Array.isArray(product.certificates)
      ? product.certificates.filter((item: string) => typeof item === 'string' && item.trim())
      : [])
  ];
  const hasDocuments = datasheetItems.length > 0 || certificateItems.length > 0;

  const t = {
    notFound:
      lang === 'az' ? 'Məhsul tapılmadı' :
        lang === 'ru' ? 'Товар не найден' :
          lang === 'tr' ? 'Ürün bulunamadı' :
            'Product not found',

    back:
      lang === 'az' ? 'Geriyə qayıt' :
        lang === 'ru' ? 'Назад' :
          lang === 'tr' ? 'Geri dön' :
            'Go back',

    stock:
      lang === 'az' ? 'Stokda var' :
        lang === 'ru' ? 'В наличии' :
          lang === 'tr' ? 'Stokta var' :
            'In Stock',

    onOrder:
      lang === 'az' ? 'Sifarişlə' :
        lang === 'ru' ? 'Под заказ' :
          lang === 'tr' ? 'Sipariş üzerine' :
            'On order',

    power:
      lang === 'az' ? 'Texniki Güc' :
        lang === 'ru' ? 'Техническая мощность' :
          lang === 'tr' ? 'Teknik Güç' :
            'Technical Power',

    efficiency:
      lang === 'az' ? 'Effektivlik' :
        lang === 'ru' ? 'Эффективность' :
          lang === 'tr' ? 'Verimlilik' :
            'Efficiency',

    addToCart:
      lang === 'az' ? 'Səbətə at' :
        lang === 'ru' ? 'В корзину' :
          lang === 'tr' ? 'Sepete ekle' :
            'Add to cart',

    readMore:
      lang === 'az' ? 'Daha çox oxu' :
        lang === 'ru' ? 'Читать далее' :
          lang === 'tr' ? 'Devamını oku' :
            'Read more',

    showLess:
      lang === 'az' ? 'Daha az göstər' :
        lang === 'ru' ? 'Скрыть' :
          lang === 'tr' ? 'Daha az göster' :
            'Show less',

    similarProducts:
      lang === 'az' ? 'Oxşar məhsullar' :
        lang === 'ru' ? 'Похожие товары' :
          lang === 'tr' ? 'Benzer ürünler' :
            'Similar products',

    orderNow:
      lang === 'az' ? 'Sifariş et' :
        lang === 'ru' ? 'Заказать' :
          lang === 'tr' ? 'Sipariş ver' :
            'Order now',

    requestPrice:
      lang === 'az' ? 'Qiymət təklifi al' :
        lang === 'ru' ? 'Запросить цену' :
          lang === 'tr' ? 'Fiyat teklifi al' :
            'Request price',

    outOfStock:
      lang === 'az' ? 'Stokda yoxdur' :
        lang === 'ru' ? 'Нет в наличии' :
          lang === 'tr' ? 'Stokta yok' :
            'Out of stock',

    check:
      lang === 'az' ? 'Yoxla' :
        lang === 'ru' ? 'Проверить' :
          lang === 'tr' ? 'Kontrol et' :
            'Check',

    availableVariants:
      lang === 'az' ? 'Stokda və qiymətli' :
        lang === 'ru' ? 'В наличии с ценой' :
          lang === 'tr' ? 'Stokta ve fiyatlı' :
            'In stock with price',

    unavailableVariants:
      lang === 'az' ? 'Stokda yoxdur / qiymətsiz' :
        lang === 'ru' ? 'Нет в наличии / без цены' :
          lang === 'tr' ? 'Stokta yok / fiyatsız' :
            'Out of stock / no price',

    buyCredit:
      lang === 'az' ? 'Kreditlə al' :
        lang === 'ru' ? 'Купить в кредит' :
          lang === 'tr' ? 'Taksitle al' :
            'Buy with credit',

    warranty:
      lang === 'az' ? '25 il performans zəmanəti' :
        lang === 'ru' ? '25 лет гарантии производительности' :
          lang === 'tr' ? '25 yıl performans garantisi' :
            '25 years performance warranty',

    consultation:
      lang === 'az' ? 'Pulsuz çatdırılma və ilkin konsultasiya' :
        lang === 'ru' ? 'Бесплатная доставка и первичная консультация' :
          lang === 'tr' ? 'Ücretsiz teslimat ve ilk danışmanlık' :
            'Free delivery and initial consultation',

    technology:
      lang === 'az' ? 'Texnologiya' :
        lang === 'ru' ? 'Технология' :
          lang === 'tr' ? 'Teknoloji' :
            'Technology',

    model:
      lang === 'az' ? 'Model' :
        lang === 'ru' ? 'Модель' :
          lang === 'tr' ? 'Model' :
            'Model',

    mppt:
      lang === 'az' ? 'MPPT' :
        lang === 'ru' ? 'MPPT' :
          lang === 'tr' ? 'MPPT' :
            'MPPT',

    phaseCount:
      lang === 'az' ? 'Faz sayı' :
        lang === 'ru' ? 'Количество фаз' :
          lang === 'tr' ? 'Faz sayısı' :
            'Phase count',

    installmentOptions:
      lang === 'az' ? 'Taksit imkanları' :
        lang === 'ru' ? 'Варианты рассрочки' :
          lang === 'tr' ? 'Taksit seçenekleri' :
            'Installment options',

    calculatorTitle:
      lang === 'az' ? 'Kredit Kalkulyatoru' :
        lang === 'ru' ? 'Кредитный калькулятор' :
          lang === 'tr' ? 'Kredi Hesaplayıcı' :
            'Credit Calculator',

    downPaymentLabel:
      lang === 'az' ? 'İlkin ödəniş (AZN)' :
        lang === 'ru' ? 'Первоначальный взнос (AZN)' :
          lang === 'tr' ? 'Peşinat (AZN)' :
            'Down payment (AZN)',

    monthlyPaymentLabel:
      lang === 'az' ? 'Aylıq ödəniş' :
        lang === 'ru' ? 'Ежемесячный платеж' :
          lang === 'tr' ? 'Aylık ödeme' :
            'Monthly payment',

    totalAmountLabel:
      lang === 'az' ? 'Cəmi məbləğ' :
        lang === 'ru' ? 'Итоговая сумма' :
          lang === 'tr' ? 'Toplam tutar' :
            'Total amount',

    // 🆕 TAB LABELS
    tabs: {
      features:
        lang === 'az' ? 'Xüsusiyyətlər' :
          lang === 'ru' ? 'Характеристики' :
            lang === 'tr' ? 'Özellikler' :
              'Features',

      shipping:
        lang === 'az' ? 'Çatdırılma şərtləri' :
          lang === 'ru' ? 'Условия доставки' :
            lang === 'tr' ? 'Teslimat koşulları' :
              'Shipping conditions',

      return:
        lang === 'az' ? 'Qaytarılma şərtləri' :
          lang === 'ru' ? 'Условия возврата' :
            lang === 'tr' ? 'İade koşulları' :
              'Return policy',

      warranty:
        lang === 'az' ? 'Zəmanət şərtləri' :
          lang === 'ru' ? 'Гарантийные условия' :
            lang === 'tr' ? 'Garanti koşulları' :
              'Warranty conditions',

    }
  };

  if (!product) return <div className="pt-32 text-center font-bold">{t.notFound}</div>;

  const remainingAmount = Math.max(0, currentPrice - downPayment);
  const monthlyPayment = (remainingAmount / months).toFixed(2);
  const truncateText = (value: string, limit: number) => value.length > limit ? `${value.slice(0, limit).trim()}…` : value;
  const primaryImage = product.productImage?.[0] || '/volt-logo.png';
  const displayImage = hoverPreviewImage || activeImage || primaryImage;
  const handleOrderNow = () => {
    if (quantityExceedsStock) return;
    onOrderNow(product.id, quantity, currentPower, availableStock);
  };
  const handleAddToCart = () => {
    if (quantityExceedsStock) return;
    onAddToCart(product.id, quantity, currentPower, availableStock);
  };
  const primaryActionLabel = !hasStock ? t.check : !hasPrice ? t.requestPrice : t.orderNow;
  const productActionControls = (compact = false) => (
    <>
      <div className={`product-quantity-control ${compact ? 'product-quantity-control--compact' : ''}`}>
        <button
          type="button"
          onClick={() => {
            const nextQuantity = Math.max(1, quantity - 1);
            setQuantity(nextQuantity);
            if (nextQuantity <= availableStock) setStockLimitAttempted(false);
          }}
          className="product-quantity-button"
          aria-label="Decrease quantity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
        </button>
        <input
          type="number"
          min={1}
          max={availableStock || undefined}
          value={quantity}
          onChange={(e) => {
            const nextQuantity = Math.max(1, parseInt(e.target.value, 10) || 1);
            setQuantity(nextQuantity);
            setStockLimitAttempted(nextQuantity > availableStock);
          }}
          className="product-quantity-input"
          aria-label="Quantity"
          aria-invalid={quantityExceedsStock}
        />
        <button
          type="button"
          onClick={() => {
            if (quantity >= availableStock) {
              setStockLimitAttempted(true);
              return;
            }
            setQuantity(quantity + 1);
            setStockLimitAttempted(false);
          }}
          className="product-quantity-button"
          aria-label="Increase quantity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>
      {hasStock ? (
        <button
          type="button"
          onClick={handleOrderNow}
          disabled={quantityExceedsStock}
          className="product-order-button"
        >
          <PackageCheck className="w-5 h-5" strokeWidth={2.2} aria-hidden="true" />
          {primaryActionLabel}
        </button>
      ) : (
        <OutOfStockWhatsappAction
          href={stockCheckHref}
          lang={lang || 'az'}
          placement="product_detail_stock_check"
          product={{
            id: product.id,
            name: product.productName || product.name,
            category: product.productCategoryId || product.category,
            subCategory: product.productSubCategoryId || product.subCategory,
            brand: brand || product.brand,
            variant: currentPower,
            requestedQuantity: quantity,
            availableStock,
          }}
          className="product-order-button"
        >
          <PackageCheck className="w-5 h-5" strokeWidth={2.2} aria-hidden="true" />
          {primaryActionLabel}
        </OutOfStockWhatsappAction>
      )}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!hasPrice || !hasStock || quantityExceedsStock}
        className="product-cart-button"
        title={t.addToCart}
        aria-label={t.addToCart}
      >
        <ShoppingCart className="w-5 h-5" strokeWidth={2.2} aria-hidden="true" />
        <span className="product-cart-button__label">{t.addToCart}</span>
      </button>
    </>
  );

  const productInfoTabs = (className = '') => (
    <div className={`mt-8 product-info-tabs ${className}`}>
      <div className="border-b border-gray-100 relative group">
        <div ref={tabsScrollRef} className="overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-8 md:gap-12 min-w-max px-1">
            {[
              { id: 'features', label: t.tabs.features },
              { id: 'shipping', label: t.tabs.shipping },
              { id: 'return', label: t.tabs.return },
              { id: 'warranty', label: t.tabs.warranty },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-[var(--color-dark)]' : 'text-[var(--color-text)] opacity-55 hover:opacity-100'}`}
              >
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-primary)] rounded-full" />}
              </button>
            ))}
          </div>
        </div>
        {tabsCanScrollMore && (
          <div className="absolute right-0 top-0 h-full flex items-center pr-1 pointer-events-none md:hidden bg-gradient-to-l from-white via-white/80 to-transparent pl-10">
            <div className="animate-bounce-x text-emerald-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            </div>
          </div>
        )}
      </div>

      <div className="py-5">
        {activeTab === 'features' && (
          <ExpandableFeatures text={productFeatures} readMoreLabel={t.readMore} showLessLabel={t.showLess} />
        )}
        {activeTab === 'shipping' && <div className="text-slate-600 text-sm leading-relaxed"><p>Bakı daxili çatdırılma 24 saat ərzində həyata keçirilir. 500 AZN-dən yuxarı sifarişlər üçün çatdırılma pulsuzdur.</p></div>}
        {activeTab === 'return' && <div className="text-slate-600 text-sm leading-relaxed"><p>Məhsulun qaytarılması 14 gün ərzində, qablaşdırma zədələnmədiyi halda mümkündür.</p></div>}
        {activeTab === 'warranty' && <div className="text-slate-600 text-sm leading-relaxed"><p>Bütün avadanlıqlara rəsmi istehsalçı zəmanəti verilir. Günəş panelləri üçün 25 il performans zəmanəti mövcuddur.</p></div>}
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen relative pb-20">
      <section className="bg-emerald-950 py-4 border-b border-emerald-900/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between relative z-10">
          <button
            onClick={() => onBack({
              category: product.productCategoryId,
              subCategory: product.productSubCategoryId,
            })}
            className="flex items-center gap-1.5 text-emerald-300/60 hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t.back}
          </button>
          <h1 className="max-w-[58%] text-right text-sm font-black text-white uppercase tracking-widest md:max-w-none">
            <span className="md:hidden">{truncateText(product.productName || '', 44)}</span>
            <span className="hidden md:inline">{product.productName}</span>
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-12">

        <div ref={productShellRef} className="grid grid-cols-1 lg:grid-cols-[45%_1fr] gap-12 lg:gap-20">
          <div className="space-y-6">
            <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-gray-50 border border-gray-100 p-6 shadow-inner group">
              <img src={displayImage} alt={product.productName} width="960" height="720" fetchPriority="high" decoding="async" className="w-full h-full object-contain transition-transform group-hover:scale-105" />
              <div className="absolute right-4 top-4 z-20">
                <Share lang={lang} variant="image-mobile" />
              </div>
            </div>
            {product.productImage?.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.productImage.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveImage(img)}
                    onMouseEnter={() => {
                      if (i > 0) setHoverPreviewImage(img);
                    }}
                    onMouseLeave={() => {
                      if (i > 0) setHoverPreviewImage('');
                    }}
                    className={`aspect-[4/3] bg-gray-50 rounded-xl border overflow-hidden cursor-pointer transition-all ${(hoverPreviewImage || activeImage || primaryImage) === img ? 'border-emerald-500 ring-2 ring-emerald-500/20 opacity-100' : 'border-gray-100 opacity-50 hover:opacity-100'}`}
                  >
                    <img src={img} width="320" height="240" loading="lazy" decoding="async" className="w-full h-full object-cover" alt={`view ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}

            {productInfoTabs('hidden lg:block')}

          </div>

          <div className="flex flex-col">
            <div className="mb-8">
              <div className="text-emerald-600 font-black uppercase tracking-widest text-xs mb-3">{product.brand}</div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-6">{product.productName}</h1>
              <div className="flex items-center gap-4 mb-8">
                {hasPrice && (
                  <span className="text-2xl font-black text-emerald-600">{currentPrice} AZN</span>)}
                {hasStock && (
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {t.stock} ({currentCount})
                  </span>
                )}
              </div>
              <div ref={descriptionRef} className="mb-2">
                <ExpandableDescription
                  text={productDescription}
                  expanded={isDescriptionExpanded}
                  readMoreLabel={t.readMore}
                  onExpand={() => setIsDescriptionExpanded(true)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-6">

              {hasAnyTechnicalPower && (
              allVariants.length > 1 ? (
                <div className="p-2 md:p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {t.power}
                  </div>

                  <div className="relative">
                    <select
                      value={currentVariant.variantKey}
                      onChange={(e) => {
                        setSelectedVariantId(e.target.value);
                        setStockLimitAttempted(false);
                        setIsDescriptionExpanded(false);
                      }}
                      className="
        w-full
        bg-transparent
        text-[11px] md:text-[13px]
        font-black text-slate-900
        border border-slate-200
        rounded-xl
        px-3 py-2
        pr-8
        appearance-none
        outline-none
        focus:ring-2 focus:ring-slate-200
        focus:border-slate-300
      "
                    >
                      {availableVariants.length > 0 && unavailableVariants.length > 0 && (
                        <option disabled>{t.availableVariants}</option>
                      )}
                      {availableVariants.map((variant) => {
                        const optionPower = (variant.technicalPower || '').trim();
                        const optionLabel = variant.modelLabel?.trim();
                        const label = optionPower || optionLabel;
                        return label ? (
                          <option key={`available-${variant.variantKey}`} value={variant.variantKey}>
                            {label}
                          </option>
                        ) : null;
                      })}
                      {unavailableVariants.length > 0 && (
                        <option disabled>{t.unavailableVariants}</option>
                      )}
                      {unavailableVariants.map((variant) => {
                        const optionPower = (variant.technicalPower || '').trim();
                        const optionLabel = variant.modelLabel?.trim();
                        const label = optionPower || optionLabel;
                        return label ? (
                          <option key={`unavailable-${variant.variantKey}`} value={variant.variantKey}>
                            {label}
                          </option>
                        ) : null;
                      })}
                    </select>

                    {/* custom arrow */}
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

              ) : (
                <div className="p-2 md:p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                    {t.power}
                  </div>
                  <div className="text-[11px] md:text-[13px] font-black text-slate-900">
                    {currentPower}
                  </div>
                </div>
              ))}

              {hasEfficiency  && (
              allVariants.length > 1 ? (
                <div className="p-2 md:p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t.efficiency}</div>
                <div className="mt-1 border border-slate-200
        rounded-xl
        px-3 py-2
        pr-8 text-[11px] md:text-[13px] font-black text-slate-900">{currentEfficiency}%</div>
              </div>)
               :
              ( <div className="p-2 md:p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t.efficiency}</div>
                <div className="mt-1 text-[11px] md:text-[13px] font-black text-slate-900">{currentEfficiency}%</div>
              </div>)
              )}
              
            </div>

            {product.productTechnologyId && product.productTechnologyId != 0 && (
              <div className="hidden mb-3 space-y-3 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                <div className="flex items-center gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                  <svg
                    className="w-5 h-5 text-emerald-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{technology}</span>
                </div>
              </div>
            )}

            {product.productBrandId && product.productBrandId != 0 && (
              <div className="hidden mb-8 space-y-3 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                <div className="flex items-center gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                  <svg
                    className="w-5 h-5 text-emerald-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{brand}</span>
                </div>
              </div>
            )}

            {showStockLimitWarning && (
              <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold leading-relaxed text-amber-800" role="alert">
                {getStockWarning(lang || 'az', availableStock, quantity)}{' '}
                <OutOfStockWhatsappAction
                  href={stockCheckHref}
                  lang={lang || 'az'}
                  placement="product_detail_stock_limit"
                  product={{
                    id: product.id,
                    name: product.productName || product.name,
                    category: product.productCategoryId || product.category,
                    subCategory: product.productSubCategoryId || product.subCategory,
                    brand: brand || product.brand,
                    variant: currentPower,
                    requestedQuantity: quantity,
                    availableStock,
                  }}
                  className="font-black underline underline-offset-2"
                >
                  {lang === 'az' ? 'Bizimlə əlaqə saxlayın' : lang === 'ru' ? 'Связаться с нами' : lang === 'tr' ? 'Bizimle iletişime geçin' : 'Contact us'}
                </OutOfStockWhatsappAction>
              </div>
            )}

            <div ref={inlineActionsRef} className="product-action-row mb-6">
              {productActionControls()}
            </div>

            {productInfoTabs('lg:hidden')}

            {/* Credit Calculator - Table Format */}
            {/* <div className="mb-8 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                {t.calculatorTitle}
              </h3>

              <div className="mb-6">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{t.downPaymentLabel}</label>
                <input 
                  type="number" 
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                  placeholder="0"
                />
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Seçim</th>
                      <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">İlkin ödəniş</th>
                      <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Müddət</th>
                      <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Aylıq ödəniş</th>
                      <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Yekun məbləğ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[6, 12, 18].map((m) => {
                      const rowMonthly = (remainingAmount / m).toFixed(2);
                      return (
                        <tr 
                          key={m} 
                          onClick={() => setMonths(m as any)}
                          className={`group cursor-pointer transition-colors ${months === m ? 'bg-emerald-50/30' : 'hover:bg-slate-50/50'}`}
                        >
                          <td className="py-4">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${months === m ? 'border-emerald-500 bg-white' : 'border-slate-200'}`}>
                              {months === m && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-in zoom-in duration-200" />}
                            </div>
                          </td>
                          <td className="py-4 text-xs font-bold text-slate-600">{downPayment}</td>
                          <td className="py-4 text-xs font-black text-slate-900">{m} ay</td>
                          <td className="py-4 text-xs font-black text-emerald-600">{rowMonthly} AZN</td>
                          <td className="py-4 text-xs font-black text-slate-900">{currentPrice} AZN</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-8">
                <button 
                  onClick={() => onOrderNow(product.id, quantity, currentPower)}
                  className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
                >
                  {t.buyCredit}
                </button>
              </div>
            </div> */}

          </div>
        </div>

        <div
          className={`product-floating-actions sm:hidden ${showMobileFloatingActions ? 'product-floating-actions--visible' : ''}`}
          aria-hidden={!showMobileFloatingActions}
        >
          {showStockLimitWarning && (
            <div className="mb-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-bold leading-snug text-amber-800" role="alert">
              {getStockWarning(lang || 'az', availableStock, quantity)}
            </div>
          )}
          <div className="product-floating-actions__preview">
            {cartPreview}
          </div>
          <div className="product-floating-actions__controls">
            {productActionControls(true)}
          </div>
        </div>

        {/* Documents Section */}
        {hasDocuments && (
          <div className="mt-16 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Datasheet
              </h3>

              {certificateItems.length > 0 && (
                <a
                  href={certificateItems[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Sertifikat (PDF)
                </a>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {datasheetItems.length > 0 && (
                datasheetItems.map((ds, idx) => {
                  const isPdf = ds.split('?')[0].toLowerCase().endsWith('.pdf');
                  return (
                  <div key={idx} className={`group/ds relative w-full ${isPdf ? 'md:col-span-2' : ''}`}>
                    {isPdf ? (
                      <PdfBookPreview
                        sourceUrl={ds}
                        title={decodeURIComponent(ds.split('/').pop() || `Datasheet ${idx + 1}`)}
                        lang={lang}
                      />
                    ) : (
                      <div className="relative z-0 h-[460px] w-full overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm md:h-[614px]">
                        <img
                          src={ds}
                          alt={`Datasheet Preview ${idx + 1}`}
                          loading="lazy"
                          decoding="async"
                          width="900"
                          height="1200"
                          className="w-full h-full object-contain"
                        />
                        <a href={ds} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10"><span className="sr-only">View Datasheet {idx + 1}</span></a>
                      </div>
                    )}
                  </div>
                  );
                })
              )}

            </div>
          </div>
        )}

        {(isLoadingSimilarProducts || similarProducts.length > 0) && (
          <section className="mt-12 border-t border-slate-100 pt-10 md:mt-16 md:pt-14" aria-labelledby="similar-products-title">
            <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
              <h2 id="similar-products-title" className="text-2xl font-black text-slate-900 md:text-3xl">
                {t.similarProducts}
              </h2>
              <span className="h-1 w-12 shrink-0 rounded-full bg-[#9ac21d] md:w-16" aria-hidden="true" />
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
              {isLoadingSimilarProducts
                ? Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className="animate-pulse rounded-[1.75rem] border border-slate-100 bg-white p-1.5" aria-hidden="true">
                      <div className="aspect-[4/4.5] rounded-[1.25rem] bg-slate-100" />
                      <div className="space-y-3 px-1 py-5">
                        <div className="h-2 w-1/3 rounded bg-slate-100" />
                        <div className="h-3 w-4/5 rounded bg-slate-100" />
                        <div className="h-9 rounded-xl bg-slate-100" />
                      </div>
                    </div>
                  ))
                : similarProducts.map((similarProduct) => (
                    <ProductCard
                      key={similarProduct.id}
                      product={similarProduct}
                      onSelectProduct={onSelectProduct}
                      onAddToCart={onAddToCart}
                      onOrderNow={onOrderNow}
                      lang={lang || 'az'}
                    />
                  ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default ProductDetail;
