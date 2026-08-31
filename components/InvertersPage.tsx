import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BatteryCharging, Building2, Calculator, Check, Gauge, House, ShieldCheck } from 'lucide-react';
import { useCategory } from '../contexts/CategoryContext';
import { useProduct } from '../contexts/ProductContext';
import type { SiteLanguage } from '../utils/seoRoutes';
import ProductsPage from './ProductsPage';
import type { ProductReturnContext } from './ProductCard';

type Props = {
  lang: SiteLanguage;
  initialPage?: string | number;
  onNavigate: (page: any, id?: string, extra?: any) => void;
  onSelectProduct: (id: string, returnContext?: ProductReturnContext) => void;
  onOrderNow?: (id: string, quantity: number, power?: string, maxStock?: number) => void;
  onAddToCart?: (id: string, quantity: number, power?: string, maxStock?: number) => void;
};

const content = {
  az: {
    eyebrow: 'Volt.az günəş enerjisi avadanlıqları',
    title: 'Azərbaycanda Günəş İnvertorlarının Satışı',
    lead: 'Ev, biznes və iri layihələr üçün şəbəkəli, hibrid və şəbəkədənkənar Growatt invertorları, texniki seçim və qiymət təklifi təqdim edirik.',
    detail: 'Sistem gücünə, panel konfiqurasiyasına və batareya ehtiyacına uyğun invertor seçimi və texniki dəstək.',
    catalogue: 'Günəş invertorları kataloqu',
    catalogueText: 'Mövcud modelləri, güc göstəricilərini və stok məlumatını müqayisə edin. Dəqiq qiymət üçün təklif istəyin.',
    calculator: 'Sistemi hesabla', contact: 'Qiymət təklifi al', products: 'Bütün məhsullar',
    solutionsTitle: 'Ev və korporativ layihələr üçün invertor həlləri',
    solutions: [
      { title: 'Yaşayış sistemləri', text: 'Ev sərfiyyatı, panel gücü və batareya planına uyğun şəbəkəli və ya hibrid invertor seçilir.', icon: House },
      { title: 'Biznes və iri layihələr', text: 'Kommersiya və sənaye obyektləri üçün üçfazalı invertorlar, sistem uyğunluğu və mərhələli təchizat.', icon: Building2 },
    ],
    selectTitle: 'Günəş invertorunu necə seçmək olar?',
    selectText: 'Seçim sistem gücü, faza sayı, MPPT diapazonu, panel sətirlərinin quruluşu, batareya uyğunluğu, monitorinq, qoruma və layihənin iş rejimi əsasında aparılır.',
    benefits: ['Şəbəkəli, hibrid və şəbəkədənkənar seçimlər', 'Panel gücünə uyğun MPPT və giriş göstəriciləri', 'Monitorinq və ağıllı enerji idarəetməsi', 'Zəmanət və texniki dəstək'],
    priceTitle: 'Günəş invertorunun qiymətinə nə təsir edir?',
    priceText: 'Qiymət invertorun gücü, faza sayı, hibrid və ya şəbəkəli quruluşu, batareya uyğunluğu, MPPT sayı, qoruma funksiyaları və layihə tələblərindən asılıdır.',
    warrantyTitle: 'Uyğunluq, zəmanət və təchizat',
    warrantyText: 'Məhsul kartlarındakı güc, giriş diapazonu, səmərəlilik, zəmanət və stok məlumatları uyğun modeli müqayisə etməyə kömək edir. Təklif sistemin real texniki tələblərinə əsasən hazırlanır.',
    faqTitle: 'Günəş invertorları haqqında suallar',
    faqs: [
      ['Günəş invertorunun qiyməti necə hesablanır?', 'Qiymət güc, faza sayı, sistem növü, batareya uyğunluğu, MPPT sayı, qoruma və əlavə idarəetmə funksiyalarına görə dəyişir.'],
      ['Ev üçün hansı gücdə invertor lazımdır?', 'Uyğun güc elektrik sərfiyyatı, panel massivinin gücü, eyni vaxtda işləyən yüklər və gələcək genişlənmə planına əsasən hesablanır.'],
      ['Hibrid və şəbəkəli invertor arasında fərq nədir?', 'Şəbəkəli invertor əsasən şəbəkə ilə paralel işləyir. Hibrid invertor isə uyğun batareya ilə enerjinin saxlanmasını və ehtiyat enerji ssenarilərini dəstəkləyə bilər.'],
      ['Günəş paneli ilə invertor necə uyğunlaşdırılır?', 'Panel sətirlərinin gərginlik və cərəyanı invertorun MPPT və maksimum giriş hədlərinə uyğun olmalıdır; yekun uyğunluq texniki layihədə yoxlanılır.'],
    ],
    finalTitle: 'Sisteminiz üçün uyğun invertoru seçək',
    finalText: 'Sərfiyyatınızı hesablayın və ya yaşayış, biznes və iri layihələr üçün texniki seçim və fərdi qiymət təklifi alın.',
  },
  en: {
    eyebrow: 'Volt.az solar energy equipment', title: 'Solar Inverters for Sale in Azerbaijan',
    lead: 'Grid-tied, hybrid, and off-grid Growatt inverters with technical selection and quotations for homes, businesses, and large projects.',
    detail: 'Choose an inverter matched to system capacity, panel configuration, operating mode, and battery requirements.',
    catalogue: 'Solar inverter catalogue', catalogueText: 'Compare available models, power ratings, and stock information, then request an exact quotation.',
    calculator: 'Calculate your system', contact: 'Request a quote', products: 'All products',
    solutionsTitle: 'Inverter solutions for homes and corporate projects',
    solutions: [{ title: 'Residential systems', text: 'Grid-tied or hybrid inverters are selected for household consumption, array size, and battery plans.', icon: House }, { title: 'Business and large projects', text: 'Three-phase inverters, system compatibility, and staged supply for commercial and industrial facilities.', icon: Building2 }],
    selectTitle: 'How to choose a solar inverter', selectText: 'Selection considers system capacity, phase configuration, MPPT range, string design, battery compatibility, monitoring, protection, and operating mode.',
    benefits: ['Grid-tied, hybrid, and off-grid options', 'MPPT and input ratings matched to the array', 'Monitoring and smart energy management', 'Warranty and technical support'],
    priceTitle: 'What affects solar inverter prices?', priceText: 'Pricing depends on power, phase configuration, grid-tied or hybrid design, battery compatibility, MPPT count, protection features, and project requirements.',
    warrantyTitle: 'Compatibility, warranty, and supply', warrantyText: 'Product pages provide available power, input range, efficiency, warranty, and stock data. Each proposal is based on the system’s actual technical requirements.',
    faqTitle: 'Solar inverter FAQs',
    faqs: [['How are solar inverter prices calculated?', 'Prices vary by power, phase configuration, system type, battery compatibility, MPPT count, protection, and control features.'], ['What inverter capacity does a home need?', 'Capacity is calculated from consumption, solar array size, simultaneous loads, and future expansion plans.'], ['What is the difference between hybrid and grid-tied inverters?', 'A grid-tied inverter works primarily in parallel with the utility grid, while a compatible hybrid inverter can also support battery storage and backup scenarios.'], ['How are solar panels matched to an inverter?', 'String voltage and current must remain within the inverter’s MPPT and maximum input limits; final compatibility is confirmed during system design.']],
    finalTitle: 'Choose the right inverter for your system', finalText: 'Calculate consumption or request technical selection and a tailored quotation for residential, business, or large-scale projects.',
  },
  ru: {
    eyebrow: 'Оборудование солнечной энергетики Volt.az', title: 'Продажа солнечных инверторов в Азербайджане',
    lead: 'Сетевые, гибридные и автономные инверторы Growatt, технический подбор и расчет цены для дома, бизнеса и крупных проектов.',
    detail: 'Подбор инвертора по мощности системы, конфигурации панелей, режиму работы и требованиям к аккумулятору.',
    catalogue: 'Каталог солнечных инверторов', catalogueText: 'Сравните модели, мощность и наличие, затем запросите точное предложение.',
    calculator: 'Рассчитать систему', contact: 'Получить предложение', products: 'Все продукты',
    solutionsTitle: 'Инверторные решения для дома и бизнеса',
    solutions: [{ title: 'Жилые системы', text: 'Сетевой или гибридный инвертор подбирается по потреблению, мощности панелей и плану аккумуляции.', icon: House }, { title: 'Бизнес и крупные проекты', text: 'Трехфазные инверторы, проверка совместимости и поэтапная поставка для коммерческих объектов.', icon: Building2 }],
    selectTitle: 'Как выбрать солнечный инвертор', selectText: 'Учитываются мощность, количество фаз, диапазон MPPT, конфигурация стрингов, совместимость с аккумулятором, мониторинг и защита.',
    benefits: ['Сетевые, гибридные и автономные модели', 'MPPT и входные параметры под массив панелей', 'Мониторинг и управление энергией', 'Гарантия и техническая поддержка'],
    priceTitle: 'От чего зависит цена инвертора?', priceText: 'Цена зависит от мощности, количества фаз, типа системы, совместимости с аккумулятором, числа MPPT, функций защиты и требований проекта.',
    warrantyTitle: 'Совместимость, гарантия и поставка', warrantyText: 'В карточках указаны доступные данные о мощности, входном диапазоне, эффективности, гарантии и наличии. Предложение готовится по реальным требованиям системы.',
    faqTitle: 'Вопросы о солнечных инверторах',
    faqs: [['Как рассчитывается цена инвертора?', 'Учитываются мощность, фазы, тип системы, аккумулятор, количество MPPT, защита и функции управления.'], ['Какая мощность инвертора нужна для дома?', 'Мощность рассчитывается по потреблению, массиву панелей, одновременным нагрузкам и планам расширения.'], ['Чем гибридный инвертор отличается от сетевого?', 'Сетевой инвертор работает параллельно с сетью, а совместимый гибридный инвертор может поддерживать аккумулятор и резервное питание.'], ['Как согласовать панели и инвертор?', 'Напряжение и ток стрингов должны соответствовать диапазону MPPT и входным ограничениям инвертора.']],
    finalTitle: 'Подберем инвертор для вашей системы', finalText: 'Рассчитайте потребление или запросите технический подбор и индивидуальное предложение.',
  },
  tr: {
    eyebrow: 'Volt.az güneş enerjisi ekipmanları', title: 'Azerbaycan’da Güneş İnverteri Satışı',
    lead: 'Ev, işletme ve büyük projeler için şebeke bağlantılı, hibrit ve şebekeden bağımsız Growatt inverterler, teknik seçim ve fiyat teklifi.',
    detail: 'Sistem gücü, panel dizilimi, çalışma şekli ve batarya ihtiyacına uygun inverter seçimi.',
    catalogue: 'Güneş inverteri kataloğu', catalogueText: 'Mevcut modelleri, güç değerlerini ve stok bilgisini karşılaştırıp net teklif alın.',
    calculator: 'Sistemi hesapla', contact: 'Teklif al', products: 'Tüm ürünler',
    solutionsTitle: 'Konut ve kurumsal projeler için inverter çözümleri',
    solutions: [{ title: 'Konut sistemleri', text: 'Şebeke bağlantılı veya hibrit inverter tüketim, panel gücü ve batarya planına göre seçilir.', icon: House }, { title: 'İşletme ve büyük projeler', text: 'Ticari tesisler için üç fazlı inverterler, uyumluluk kontrolü ve aşamalı tedarik.', icon: Building2 }],
    selectTitle: 'Güneş inverteri nasıl seçilir?', selectText: 'Sistem gücü, faz yapısı, MPPT aralığı, dizi tasarımı, batarya uyumu, izleme, koruma ve çalışma modu birlikte değerlendirilir.',
    benefits: ['Şebeke bağlantılı, hibrit ve bağımsız seçenekler', 'Panel dizisine uygun MPPT ve giriş değerleri', 'İzleme ve akıllı enerji yönetimi', 'Garanti ve teknik destek'],
    priceTitle: 'İnverter fiyatını neler etkiler?', priceText: 'Fiyat; güç, faz yapısı, sistem tipi, batarya uyumu, MPPT sayısı, koruma özellikleri ve proje gereksinimlerine bağlıdır.',
    warrantyTitle: 'Uyumluluk, garanti ve tedarik', warrantyText: 'Ürün kartları mevcut güç, giriş aralığı, verimlilik, garanti ve stok bilgilerini gösterir. Teklif sistemin gerçek teknik ihtiyaçlarına göre hazırlanır.',
    faqTitle: 'Güneş inverterleri hakkında sorular',
    faqs: [['Güneş inverteri fiyatı nasıl hesaplanır?', 'Fiyat güç, faz yapısı, sistem türü, batarya uyumu, MPPT sayısı, koruma ve kontrol özelliklerine göre değişir.'], ['Bir ev için hangi güçte inverter gerekir?', 'Güç; tüketim, panel dizisi, eş zamanlı yükler ve gelecekteki genişleme planına göre hesaplanır.'], ['Hibrit ve şebeke bağlantılı inverter arasındaki fark nedir?', 'Şebeke bağlantılı inverter şebekeyle paralel çalışır; uyumlu hibrit inverter batarya ve yedek enerji senaryolarını da destekleyebilir.'], ['Paneller inverterle nasıl eşleştirilir?', 'Dizi gerilimi ve akımı inverterin MPPT ve maksimum giriş sınırları içinde olmalıdır.']],
    finalTitle: 'Sisteminiz için doğru inverteri seçelim', finalText: 'Tüketiminizi hesaplayın veya teknik seçim ve projeye özel fiyat teklifi alın.',
  },
} as const;

const INVERTER_CATEGORY_NAMES = new Set(['İnvertorlar', 'Invertorlar', 'İnverterlər', 'Inverterlər']);

const InvertersPage: React.FC<Props> = ({ lang, initialPage, onNavigate, onSelectProduct, onOrderNow, onAddToCart }) => {
  const copy = content[lang];
  const { getCategoryBySeoKey, getCategories } = useCategory();
  const { productData } = useProduct();
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoadFailed(false);
    const resolveCategory = async () => {
      try {
        const category = await getCategoryBySeoKey('inverters');
        if (active) setCategoryId(Number(category?.id));
      } catch {
        try {
          const categories = await getCategories();
          const category = Array.isArray(categories)
            ? categories.find((item) => item?.seoKey === 'inverters' || item?.languages?.some((language: any) => INVERTER_CATEGORY_NAMES.has(language?.categoryName)))
            : null;
          if (!category) throw new Error('Inverter category was not found.');
          if (active) setCategoryId(Number(category.id));
        } catch {
          if (active) setLoadFailed(true);
        }
      }
    };
    void resolveCategory();
    return () => { active = false; };
  }, []);

  const items = useMemo(() => Array.isArray(productData?.items) ? productData.items : [], [productData]);
  useEffect(() => {
    const scriptId = 'inverter-item-list-schema';
    if (items.length === 0) {
      document.getElementById(scriptId)?.remove();
      return;
    }
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: items.map((item: any, index: number) => ({ '@type': 'ListItem', position: index + 1, url: `https://volt.az${lang === 'az' ? '' : `/${lang}`}/product/${item.id}`, name: item.productName })),
    });
    return () => { document.getElementById(scriptId)?.remove(); };
  }, [items, lang]);

  return <main className="bg-white text-slate-900">
    <section className="relative isolate overflow-hidden bg-slate-950 px-4 pb-9 pt-5 text-white md:py-24">
      <div className="relative mx-auto mb-6 aspect-[16/10] max-w-md overflow-hidden rounded-3xl border border-white/10 md:hidden">
        <img src="/inverters-hero.webp" alt="" aria-hidden="true" width="960" height="600" fetchPriority="high" decoding="async" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent" />
      </div>
      <img src="/inverters-hero.webp" alt="" aria-hidden="true" width="1600" height="900" fetchPriority="high" decoding="async" className="pointer-events-none absolute inset-0 -z-20 hidden h-full w-full select-none object-cover object-center md:block" />
      <div className="absolute inset-0 -z-10 hidden bg-slate-950/30 md:block" />
      <div className="absolute inset-0 -z-10 hidden bg-gradient-to-l from-slate-950/95 via-slate-950/75 to-slate-950/20 md:block" />
      <div className="relative mx-auto max-w-7xl"><div className="md:ml-auto md:max-w-3xl">
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#b9dc49] md:text-xs md:tracking-[.24em]">{copy.eyebrow}</p>
        <h1 className="mt-3 text-[2rem] font-black leading-[1.08] md:mt-4 md:text-6xl md:leading-tight">{copy.title}</h1>
        <p className="mt-4 text-[15px] font-medium leading-6 text-slate-200 md:mt-6 md:text-lg md:leading-8">{copy.lead}</p>
        <p className="mt-3 text-[13px] leading-5 text-slate-300 md:text-sm md:leading-7">{copy.detail}</p>
        <div className="mt-6 grid gap-2.5 sm:flex sm:flex-wrap md:mt-8 md:gap-3">
          <button onClick={() => onNavigate('calculator')} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#9ac21d] px-5 py-3 text-sm font-black text-slate-950 sm:w-auto"><Calculator className="h-4 w-4" />{copy.calculator}</button>
          <button onClick={() => onNavigate('contact')} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-slate-950/20 px-5 py-3 text-sm font-black text-white sm:w-auto">{copy.contact}<ArrowRight className="h-4 w-4" /></button>
        </div>
      </div></div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-9 md:py-16">
      <h2 className="text-xl font-black leading-tight md:text-3xl">{copy.solutionsTitle}</h2>
      <div className="mt-4 grid gap-3 md:mt-6 md:grid-cols-2 md:gap-4">{copy.solutions.map(({ title, text, icon: Icon }) => <article key={title} className="rounded-2xl border border-slate-200 p-4 shadow-sm md:p-6"><Icon className="h-6 w-6 text-[#759700] md:h-7 md:w-7" /><h3 className="mt-3 text-base font-black md:mt-4 md:text-lg">{title}</h3><p className="mt-2 text-[13px] leading-5 text-slate-600 md:text-[15px] md:leading-6">{text}</p></article>)}</div>
    </section>

    <section className="bg-slate-50"><div className="mx-auto grid max-w-7xl gap-5 px-4 py-9 md:grid-cols-2 md:gap-7 md:py-16">
      <div><Gauge className="h-8 w-8 text-[#759700]" /><h2 className="mt-4 text-2xl font-black md:text-3xl">{copy.selectTitle}</h2><p className="mt-3 text-sm leading-7 text-slate-600 md:text-[15px]">{copy.selectText}</p><ul className="mt-5 space-y-2.5">{copy.benefits.map(item => <li key={item} className="flex gap-2.5 text-sm font-semibold leading-6 text-slate-700 md:text-[15px]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#759700]" />{item}</li>)}</ul></div>
      <div className="space-y-4"><article className="rounded-2xl bg-white p-5 shadow-sm md:p-6"><h2 className="text-xl font-black">{copy.priceTitle}</h2><p className="mt-3 text-sm leading-7 text-slate-600 md:text-[15px]">{copy.priceText}</p></article><article className="rounded-2xl bg-slate-950 p-5 text-white md:p-6"><ShieldCheck className="h-7 w-7 text-[#b9dc49]" /><h2 className="mt-3 text-xl font-black">{copy.warrantyTitle}</h2><p className="mt-3 text-sm leading-7 text-slate-300 md:text-[15px]">{copy.warrantyText}</p></article></div>
    </div></section>

    <section className="mx-auto max-w-7xl px-4 pt-10 md:pt-20">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end md:gap-5"><div><h2 className="text-2xl font-black md:text-4xl">{copy.catalogue}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 md:mt-3 md:text-base md:leading-7">{copy.catalogueText}</p></div><button onClick={() => onNavigate('products')} className="inline-flex w-fit items-center gap-2 text-sm font-black text-[#658300] md:text-base">{copy.products}<ArrowRight className="h-4 w-4" /></button></div>
    </section>
    {categoryId ? <ProductsPage lang={lang} initialCategory={categoryId} initialPage={initialPage} lockedCategory catalogueLabel={copy.catalogue} onSelectProduct={onSelectProduct} onOrderNow={onOrderNow} onAddToCart={onAddToCart} /> : <div className="mx-auto max-w-7xl px-4 py-12 text-slate-500">{loadFailed ? copy.catalogueText : '…'}</div>}

    <section className="bg-slate-50"><div className="mx-auto max-w-4xl px-4 py-10 md:py-20"><h2 className="text-2xl font-black md:text-3xl">{copy.faqTitle}</h2><div className="mt-5 space-y-3 md:mt-8 md:space-y-4">{copy.faqs.map(([question, answer]) => <details key={question} className="group rounded-xl border border-slate-200 bg-white p-4 md:rounded-2xl md:p-5"><summary className="cursor-pointer list-none pr-6 text-sm font-black md:pr-8 md:text-base">{question}</summary><p className="mt-3 text-sm leading-6 text-slate-600 md:mt-4 md:leading-7">{answer}</p></details>)}</div></div></section>
    <section className="px-4 py-10 md:py-20"><div className="mx-auto max-w-5xl rounded-3xl bg-[#9ac21d] p-6 md:rounded-[2.5rem] md:p-12"><BatteryCharging className="h-7 w-7 text-slate-950 md:h-8 md:w-8" /><h2 className="mt-3 text-2xl font-black leading-tight text-slate-950 md:mt-4 md:text-3xl">{copy.finalTitle}</h2><p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-800 md:mt-4 md:text-base md:leading-7">{copy.finalText}</p><div className="mt-5 grid gap-2.5 sm:flex sm:flex-wrap md:mt-7 md:gap-3"><button onClick={() => onNavigate('calculator')} className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white sm:w-auto">{copy.calculator}</button><button onClick={() => onNavigate('contact')} className="w-full rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 sm:w-auto">{copy.contact}</button></div></div></section>
  </main>;
};

export default InvertersPage;
