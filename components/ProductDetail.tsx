
import React, { useEffect, useRef, useState } from 'react';
import { PackageCheck, ShoppingCart } from 'lucide-react';
import { ProductVariant } from '../types';
import { useProduct } from "../contexts/ProductContext";
import { useCategory } from '@/contexts/CategoryContext';
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Share from "../components/Share";

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
  onOrderNow: (id: string, quantity: number, power: string) => void;
  onAddToCart: (id: string, quantity: number, power: string) => void;
  cartPreview?: React.ReactNode;
  lang?: 'az' | 'en' | 'ru' | 'tr';
}

const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onBack, onOrderNow, onAddToCart, cartPreview, lang }) => {
  const { getProductById } = useProduct();
  const { getBrandById, getTechnologyById } = useCategory();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [brand, setBrand] = useState<any>(null);
  const [technology, setTechnology] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<'features' | 'shipping' | 'return' | 'warranty'>('features');
  const [months, setMonths] = useState<6 | 12 | 18>(6);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState('');
  const [hoverPreviewImage, setHoverPreviewImage] = useState('');
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showMobileFloatingActions, setShowMobileFloatingActions] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const productShellRef = useRef<HTMLDivElement>(null);
  const inlineActionsRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);
  const floatingActionsVisibleRef = useRef(false);



  const [product, setProduct] = useState<any>(null);

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
    setIsDescriptionExpanded(false);
    setSelectedVariantIndex(0);
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
    const productTitle = product.productName ? `${product.productName} | Volt.az` : 'Məhsul | Volt.az';
    const rawDescription = translation?.description || translation?.features || product.productName || 'Volt.az məhsul məlumatları.';
    const productDescriptionMeta = String(rawDescription).replace(/\s+/g, ' ').trim().slice(0, 155);
    const canonicalUrl = `https://volt.az/product/${product.id || id}`;
    const toAbsoluteUrl = (value: string) => {
      if (!value) return 'https://volt.az/volt-logo.png';
      if (/^https?:\/\//i.test(value)) return value;
      return value.startsWith('/') ? `https://volt.az${value}` : `https://volt.az/${value}`;
    };
    const productImage = Array.isArray(product.productImage) && product.productImage[0]
      ? product.productImage[0]
      : '/volt-logo.png';
    const adminIdentifier = String(product.id || id || '').trim();
    const firstPricedVariant = Array.isArray(product.productParametrs)
      ? product.productParametrs.find((item: any) => Number(item?.amount) > 0)
      : null;
    const priceValue = Number(firstPricedVariant?.amount || product.price || 0);
    const absoluteProductImage = toAbsoluteUrl(String(productImage));
    const schemaImage = absoluteProductImage;

    const setMeta = (selector: string, attr: 'content' | 'href', value: string) => {
      const element = document.head.querySelector(selector);
      element?.setAttribute(attr, value);
    };

    document.title = productTitle;
    setMeta('meta[name="description"]', 'content', productDescriptionMeta);
    setMeta('meta[name="robots"]', 'content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMeta('meta[name="googlebot"]', 'content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMeta('meta[property="og:title"]', 'content', productTitle);
    setMeta('meta[property="og:description"]', 'content', productDescriptionMeta);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[property="og:type"]', 'content', 'product');
    setMeta('meta[property="og:image"]', 'content', absoluteProductImage);
    setMeta('meta[property="twitter:title"]', 'content', productTitle);
    setMeta('meta[property="twitter:description"]', 'content', productDescriptionMeta);
    setMeta('meta[property="twitter:image"]', 'content', absoluteProductImage);
    setMeta('link[rel="canonical"]', 'href', canonicalUrl);

    const productJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.productName || productTitle.replace(' | Volt.az', ''),
      description: productDescriptionMeta,
      image: schemaImage ? [schemaImage] : undefined,
      sku: adminIdentifier,
      productID: adminIdentifier,
      brand: {
        '@type': 'Brand',
        name: brand || product.brand || 'SOLARIX',
      },
      offers: {
        '@type': 'Offer',
        url: canonicalUrl,
        priceCurrency: 'AZN',
        price: priceValue > 0 ? String(priceValue) : undefined,
        availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
        itemCondition: 'https://schema.org/NewCondition',
      },
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

  const productDescription = currentTranslation?.description || "";
  const productFeatures = currentTranslation?.features || "";

  const toProductNumber = (value: unknown) => Number(value || 0);
  const toVariantStatus = (item: any): ProductVariant & { hasVariantPrice: boolean; hasVariantStock: boolean; isPurchasable: boolean } => {
    const count = toProductNumber(item?.count);
    const amount = toProductNumber(item?.amount);

    return {
      technicalPower: item?.technicalPower || '',
      effectiveness: item?.effectiveness || '',
      count,
      amount,
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

  const currentVariant = allVariants[selectedVariantIndex] || allVariants[0] || {
    technicalPower: '',
    effectiveness: '',
    count: 0,
    amount: 0,
  };

  const currentPrice = currentVariant?.amount;
  const currentCount= currentVariant?.count
  const hasPrice = Number(currentPrice || 0) > 0;
  const hasStock = Boolean(product.inStock && Number(currentCount || 0) > 0);
  const currentPower = (currentVariant?.technicalPower || '').trim();
  const currentEfficiency = currentVariant?.effectiveness || '';
  const hasTechnicalPower = Boolean(currentPower && currentPower !== '0');
  const hasAnyTechnicalPower = allVariants.some((variant) => {
    const power = (variant.technicalPower || '').trim();
    return power && power !== '0';
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
      lang === 'az' ? 'Məhsullara qayıt' :
        lang === 'ru' ? 'Назад к товарам' :
          lang === 'tr' ? 'Ürünlere dön' :
            'Back to products',

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
  const handleOrderNow = () => onOrderNow(product.id, quantity, currentPower);
  const handleAddToCart = () => onAddToCart(product.id, quantity, currentPower);
  const primaryActionLabel = !hasPrice ? t.requestPrice : !hasStock ? t.outOfStock : t.orderNow;
  const productActionControls = (compact = false) => (
    <>
      <div className={`product-quantity-control ${compact ? 'product-quantity-control--compact' : ''}`}>
        <button
          type="button"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="product-quantity-button"
          aria-label="Decrease quantity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
        </button>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          className="product-quantity-input"
          aria-label="Quantity"
        />
        <button
          type="button"
          onClick={() => setQuantity(quantity + 1)}
          className="product-quantity-button"
          aria-label="Increase quantity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>
      <button
        type="button"
        onClick={handleOrderNow}
        className="product-order-button"
      >
        <PackageCheck className="w-5 h-5" strokeWidth={2.2} aria-hidden="true" />
        {primaryActionLabel}
      </button>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!hasPrice || !hasStock}
        className="product-cart-button"
        title={t.addToCart}
        aria-label={t.addToCart}
      >
        <ShoppingCart className="w-5 h-5" strokeWidth={2.2} aria-hidden="true" />
        <span className="product-cart-button__label">{t.addToCart}</span>
      </button>
      {!compact && <div className="hidden sm:block">{cartPreview}</div>}
    </>
  );

  const productInfoTabs = (className = '') => (
    <div className={`mt-8 product-info-tabs ${className}`}>
      <div className="border-b border-gray-100 relative group">
        <div className="overflow-x-auto no-scrollbar">
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
        <div className="absolute right-0 top-0 h-full flex items-center pr-1 pointer-events-none md:hidden bg-gradient-to-l from-white via-white/80 to-transparent pl-10">
          <div className="animate-bounce-x text-emerald-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
          </div>
        </div>
      </div>

      <div className="py-5">
        {activeTab === 'features' && <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line"><p>{productFeatures}</p></div>}
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
          <button onClick={() => { navigate('/') }} className="flex items-center gap-1.5 text-emerald-300/60 hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest">
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
              <img src={displayImage} alt={product.productName} className="w-full h-full object-contain transition-transform group-hover:scale-105" />
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
                    <img src={img} className="w-full h-full object-cover" alt={`view ${i + 1}`} />
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
                {hasStock ? (
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {t.stock} ({currentCount})
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{t.outOfStock}</span>
                )}
              </div>
              <div ref={descriptionRef} className="mb-2">
                <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                  <span className="md:hidden">
                    {isDescriptionExpanded || productDescription.length <= 220 ? (
                      productDescription
                    ) : (
                      <>
                        {productDescription.slice(0, 220).trim()}
                        <button
                          type="button"
                          onClick={() => setIsDescriptionExpanded(true)}
                          className="product-description-ellipsis"
                          aria-label={t.readMore}
                        >
                          …
                        </button>
                      </>
                    )}
                  </span>
                  <span className="hidden md:inline">{productDescription}</span>
                </p>
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
                      value={selectedVariantIndex}
                      onChange={(e) => setSelectedVariantIndex(Number(e.target.value))}
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
                      {availableVariants.map((variant, index) => {
                        const optionPower = (variant.technicalPower || '').trim();
                        return optionPower ? (
                          <option key={`available-${index}`} value={index}>
                            {optionPower}
                          </option>
                        ) : null;
                      })}
                      {unavailableVariants.length > 0 && (
                        <option disabled>{t.unavailableVariants}</option>
                      )}
                      {unavailableVariants.map((variant, index) => {
                        const optionPower = (variant.technicalPower || '').trim();
                        const variantIndex = availableVariants.length + index;
                        return optionPower ? (
                          <option key={`unavailable-${index}`} value={variantIndex}>
                            {optionPower}
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
              <div className="mb-3 space-y-3 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
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
              <div className="mb-8 space-y-3 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
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
          <div className="product-floating-actions__preview">
            {cartPreview}
          </div>
          {productActionControls(true)}
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
                datasheetItems.map((ds, idx) => (
                  <div key={idx} className="group/ds relative w-full">
                    <div className="h-[460px] md:h-[614px] w-full bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm relative z-0">
                      <img
                        src={ds}
                        alt={`Datasheet Preview ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <a
                      href={ds}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 z-10"
                    >
                      <span className="sr-only">View Datasheet {idx + 1}</span>
                    </a>
                  </div>
                ))
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetail;
