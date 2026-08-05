import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Building2, Calculator, Check, House, ShieldCheck, Sun } from 'lucide-react';
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
    title: 'Azərbaycanda Günəş Panelləri Satışı',
    lead: 'Ev, biznes və iri layihələr üçün LONGi günəş panelləri, texniki seçim, qiymət təklifi və peşəkar quraşdırma xidməti təqdim edirik.',
    alias: 'Sertifikatlaşdırılmış günəş panellərini layihənizin güc tələbinə, tətbiq sahəsinə və büdcəsinə uyğun seçin.',
    catalogue: 'Günəş panelləri kataloqu',
    catalogueText: 'Mövcud modelləri, güc göstəricilərini və stok məlumatını nəzərdən keçirin. Dəqiq qiymət üçün təklif istəyin.',
    calculator: 'Sistemi hesabla', contact: 'Qiymət təklifi al', installation: 'Quraşdırma xidməti',
    solutionsTitle: 'Ev və korporativ layihələr üçün həllər',
    solutions: [
      { title: 'Yaşayış obyektləri', text: 'Dam sahəsi və istehlaka uyğun panel sayı, inverter və ehtiyac olduqda batareya birlikdə hesablanır.', icon: House },
      { title: 'Biznes və iri layihələr', text: 'Kommersiya və sənaye obyektləri üçün texniki layihə, topdan təchizat, ROI analizi və mərhələli quraşdırma.', icon: Building2 },
    ],
    selectTitle: 'Günəş panelini necə seçmək olar?',
    selectText: 'Panel seçimi nominal güc, modul səmərəliliyi, dam sahəsi, temperatur göstəriciləri, məhsul və performans zəmanəti, inverter uyğunluğu və layihənin büdcəsi əsasında aparılır.',
    benefits: ['Yüksək səmərəlilik və real texniki göstəricilər', 'Məhsul və performans zəmanəti', 'Orijinal LONGi məhsulları və rəsmi təchizat', 'Layihəyə uyğun panel, inverter və qoruma seçimi'],
    priceTitle: 'Günəş paneli qiymətinə nə təsir edir?',
    priceText: 'Yekun qiymət təkcə panel sayından deyil, sistem gücü, panel modeli, inverter, konstruksiya, kabelləmə, qoruma avadanlığı, logistika və montaj şəraitindən asılıdır. Buna görə təklif istehlak və obyekt məlumatları əsasında hazırlanır.',
    warrantyTitle: 'Səmərəlilik, zəmanət və təchizat',
    warrantyText: 'Məhsul kartlarında göstərilən güc, səmərəlilik, zəmanət və stok məlumatları uyğun modeli müqayisə etməyə kömək edir. Solarix LONGi-nin Azərbaycandakı rəsmi tərəfdaşı kimi orijinal və sənədləşdirilmiş məhsul təchizatı təqdim edir.',
    faqTitle: 'Günəş panelləri haqqında suallar',
    faqs: [
      ['Gunes panel qiymetleri necə hesablanır?', 'Qiymət panel sayı və gücü ilə yanaşı inverter, konstruksiya, qoruma, kabel, çatdırılma və quraşdırma şərtlərinə görə hesablanır.'],
      ['Ev üçün neçə günəş paneli lazımdır?', 'Panel sayı illik elektrik sərfiyyatı, seçilən panelin gücü, dam sahəsi, istiqamət və kölgələnmə nəticələrinə əsasən müəyyən edilir.'],
      ['Solar panel sistemi nə qədər elektrik istehsal edir?', 'İstehsal sistem gücü, yerləşmə, istiqamət, kölgə, itkilər və mövsümi günəşlənmədən asılıdır; ilkin proqnozu kalkulyatordan almaq olar.'],
      ['Günəş panellərinin zəmanəti varmı?', 'Zəmanət müddəti model və istehsalçıya görə dəyişir. Dəqiq məhsul və performans zəmanəti seçilən modelin sənədlərində göstərilir.'],
    ],
    finalTitle: 'Uyğun panel və sistem gücünü birlikdə seçək',
    finalText: 'İstehlak məlumatınızı hesablayın və ya yaşayış, biznes və topdan təchizat üçün fərdi qiymət təklifi alın.',
  },
  en: {
    eyebrow: 'Volt.az solar energy equipment', title: 'Solar Panels for Sale in Azerbaijan',
    lead: 'LONGi solar panels, technical selection, quotations, and professional installation for homes, businesses, and utility-scale projects.',
    alias: 'Explore one trusted catalogue for residential, commercial, and wholesale solar panel requirements in Azerbaijan.',
    catalogue: 'Solar panel catalogue', catalogueText: 'Compare available models, power ratings, and stock information, then request an exact quotation.',
    calculator: 'Calculate your system', contact: 'Request a quote', installation: 'Installation service',
    solutionsTitle: 'Solutions for homes and corporate projects',
    solutions: [{ title: 'Residential systems', text: 'Panel quantity, inverter, and optional battery are sized for your consumption and available roof area.', icon: House }, { title: 'Business and large projects', text: 'Engineering, wholesale supply, ROI analysis, and staged installation for commercial and industrial facilities.', icon: Building2 }],
    selectTitle: 'How to choose a solar panel', selectText: 'Selection considers rated power, module efficiency, available area, temperature ratings, product and performance warranties, inverter compatibility, and project budget.',
    benefits: ['Verified power and efficiency specifications', 'Product and performance warranties', 'Original LONGi products and official supply', 'Project-matched panels, inverters, and protection'],
    priceTitle: 'What affects solar panel prices?', priceText: 'The final quotation depends on system size, panel model, inverter, mounting, cabling, protection, logistics, and installation conditions—not only the number of panels.',
    warrantyTitle: 'Efficiency, warranty, and supply', warrantyText: 'Product pages show the available technical, warranty, price, and stock data for each model. Solarix supplies original, documented LONGi products as an official partner in Azerbaijan.',
    faqTitle: 'Solar panel FAQs', faqs: [['How are solar panel prices calculated?', 'Pricing reflects the complete system: panels, inverter, mounting, protection, cables, delivery, and installation conditions.'], ['How many solar panels does a home need?', 'The quantity depends on electricity consumption, panel wattage, roof area, orientation, and shading.'], ['How much electricity does a solar panel system produce?', 'Production varies with system capacity, location, orientation, shading, losses, and seasonal irradiation.'], ['Do solar panels include a warranty?', 'Product and performance warranty terms vary by manufacturer and model and are confirmed in the selected model documentation.']],
    finalTitle: 'Choose the right panels and system size', finalText: 'Calculate your consumption or request a tailored residential, business, or wholesale proposal.',
  },
  ru: {
    eyebrow: 'Оборудование солнечной энергетики Volt.az', title: 'Продажа солнечных панелей в Азербайджане',
    lead: 'Солнечные панели LONGi, технический подбор, расчет цены и профессиональный монтаж для дома, бизнеса и крупных проектов.', alias: 'Единый каталог для бытовых, корпоративных и оптовых проектов солнечной энергетики в Азербайджане.',
    catalogue: 'Каталог солнечных панелей', catalogueText: 'Сравните модели, мощность и наличие, затем запросите точное предложение.', calculator: 'Рассчитать систему', contact: 'Получить предложение', installation: 'Услуга монтажа',
    solutionsTitle: 'Решения для дома и корпоративных проектов', solutions: [{ title: 'Жилые объекты', text: 'Количество панелей, инвертор и аккумулятор подбираются по потреблению и площади крыши.', icon: House }, { title: 'Бизнес и крупные проекты', text: 'Проектирование, оптовая поставка, ROI-анализ и поэтапный монтаж для коммерческих объектов.', icon: Building2 }],
    selectTitle: 'Как выбрать солнечную панель', selectText: 'Учитываются мощность, эффективность, доступная площадь, температурные параметры, гарантии, совместимость с инвертором и бюджет.', benefits: ['Проверенные характеристики мощности и КПД', 'Гарантия на продукт и производительность', 'Оригинальные панели LONGi', 'Комплексный подбор оборудования'],
    priceTitle: 'От чего зависит цена?', priceText: 'Итог зависит от мощности системы, модели панелей, инвертора, конструкции, кабелей, защиты, логистики и условий монтажа.', warrantyTitle: 'Эффективность, гарантия и поставка', warrantyText: 'В карточках указаны доступные характеристики, гарантия, цена и наличие. Solarix поставляет оригинальную документированную продукцию LONGi.',
    faqTitle: 'Вопросы о солнечных панелях', faqs: [['Как рассчитывается цена солнечных панелей?', 'Учитывается вся система: панели, инвертор, крепления, защита, кабели, доставка и монтаж.'], ['Сколько панелей нужно для дома?', 'Количество зависит от потребления, мощности панели, площади и ориентации крыши, а также затенения.'], ['Сколько энергии производит система?', 'Результат зависит от мощности, места, ориентации, затенения, потерь и сезона.'], ['Есть ли гарантия?', 'Условия гарантии зависят от производителя и модели и подтверждаются документацией.']],
    finalTitle: 'Подберем панели и мощность системы', finalText: 'Рассчитайте потребление или запросите индивидуальное предложение.',
  },
  tr: {
    eyebrow: 'Volt.az güneş enerjisi ekipmanları', title: 'Azerbaycan’da Güneş Paneli Satışı',
    lead: 'Ev, işletme ve büyük projeler için LONGi güneş panelleri, teknik seçim, fiyat teklifi ve profesyonel kurulum.', alias: 'Azerbaycan’daki konut, kurumsal ve toptan güneş paneli ihtiyaçları için tek güvenilir katalog.',
    catalogue: 'Güneş paneli kataloğu', catalogueText: 'Mevcut modelleri, güç değerlerini ve stok bilgisini karşılaştırıp net teklif alın.', calculator: 'Sistemi hesapla', contact: 'Teklif al', installation: 'Kurulum hizmeti',
    solutionsTitle: 'Konut ve kurumsal proje çözümleri', solutions: [{ title: 'Konut sistemleri', text: 'Panel sayısı, inverter ve gerekirse batarya tüketim ve çatı alanına göre boyutlandırılır.', icon: House }, { title: 'İşletme ve büyük projeler', text: 'Ticari tesisler için mühendislik, toptan tedarik, ROI analizi ve aşamalı kurulum.', icon: Building2 }],
    selectTitle: 'Güneş paneli nasıl seçilir?', selectText: 'Güç, modül verimliliği, alan, sıcaklık değerleri, ürün ve performans garantisi, inverter uyumu ve bütçe birlikte değerlendirilir.', benefits: ['Doğrulanmış güç ve verimlilik değerleri', 'Ürün ve performans garantisi', 'Orijinal LONGi ürünleri', 'Projeye uygun ekipman seçimi'],
    priceTitle: 'Fiyatı neler etkiler?', priceText: 'Nihai fiyat sistem gücü, panel modeli, inverter, konstrüksiyon, kablo, koruma, lojistik ve kurulum koşullarına bağlıdır.', warrantyTitle: 'Verimlilik, garanti ve tedarik', warrantyText: 'Ürün kartları mevcut teknik, garanti, fiyat ve stok bilgisini gösterir. Solarix orijinal ve belgeli LONGi ürünleri tedarik eder.',
    faqTitle: 'Güneş paneli soruları', faqs: [['Güneş paneli fiyatları nasıl hesaplanır?', 'Panel, inverter, konstrüksiyon, koruma, kablo, teslimat ve kurulum birlikte hesaplanır.'], ['Bir ev için kaç panel gerekir?', 'Sayı tüketim, panel gücü, çatı alanı, yön ve gölgeye göre belirlenir.'], ['Bir sistem ne kadar elektrik üretir?', 'Üretim güç, konum, yön, gölge, kayıplar ve mevsime bağlıdır.'], ['Paneller garantili mi?', 'Ürün ve performans garantisi üretici ve modele göre değişir.']],
    finalTitle: 'Doğru paneli ve sistem gücünü seçelim', finalText: 'Tüketiminizi hesaplayın veya özel teklif alın.',
  },
} as const;

const SolarPanelsPage: React.FC<Props> = ({ lang, initialPage, onNavigate, onSelectProduct, onOrderNow, onAddToCart }) => {
  const copy = content[lang];
  const { getCategoryBySeoKey } = useCategory();
  const { productData } = useProduct();
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoadFailed(false);
    void getCategoryBySeoKey('solar-panels')
      .then((category) => { if (active) setCategoryId(Number(category?.id)); })
      .catch(() => { if (active) setLoadFailed(true); });
    return () => { active = false; };
  }, []);

  const items = useMemo(() => Array.isArray(productData?.items) ? productData.items : [], [productData]);
  useEffect(() => {
    const scriptId = 'solar-panel-item-list-schema';
    if (items.length === 0) {
      document.getElementById(scriptId)?.remove();
      return;
    }
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script'); script.id = scriptId; script.type = 'application/ld+json'; document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'ItemList',
      itemListElement: items.map((item: any, index: number) => ({ '@type': 'ListItem', position: index + 1, url: `https://volt.az${lang === 'az' ? '' : `/${lang}`}/product/${item.id}`, name: item.productName })),
    });
    return () => { document.getElementById(scriptId)?.remove(); };
  }, [items, lang]);

  return <main className="bg-white text-slate-900">
    <section className="relative isolate overflow-hidden bg-slate-950 px-4 py-16 text-white md:py-24">
      <img
        src="/solar-panels-hero.webp"
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full select-none object-cover object-[62%_center] md:object-center"
      />
      <div className="absolute inset-0 -z-10 bg-slate-950/35" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/25" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_20%,rgba(154,194,29,.18),transparent_38%)]" />
      <div className="relative mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[.24em] text-[#b9dc49]">{copy.eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">{copy.title}</h1>
        <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-slate-200 md:text-lg">{copy.lead}</p>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">{copy.alias}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={() => onNavigate('calculator')} className="inline-flex items-center gap-2 rounded-xl bg-[#9ac21d] px-5 py-3 text-sm font-black text-slate-950"><Calculator className="h-4 w-4" />{copy.calculator}</button>
          <button onClick={() => onNavigate('contact')} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-black text-white">{copy.contact}<ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <h2 className="text-2xl font-black md:text-3xl">{copy.solutionsTitle}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">{copy.solutions.map(({ title, text, icon: Icon }) => <article key={title} className="rounded-2xl border border-slate-200 p-5 shadow-sm md:p-6"><Icon className="h-7 w-7 text-[#759700]" /><h3 className="mt-4 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600 md:text-[15px]">{text}</p></article>)}</div>
    </section>

    <section className="bg-slate-50"><div className="mx-auto grid max-w-7xl gap-7 px-4 py-12 md:grid-cols-2 md:py-16">
      <div><Sun className="h-8 w-8 text-[#759700]" /><h2 className="mt-4 text-2xl font-black md:text-3xl">{copy.selectTitle}</h2><p className="mt-3 text-sm leading-7 text-slate-600 md:text-[15px]">{copy.selectText}</p><ul className="mt-5 space-y-2.5">{copy.benefits.map(item => <li key={item} className="flex gap-2.5 text-sm font-semibold leading-6 text-slate-700 md:text-[15px]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#759700]" />{item}</li>)}</ul></div>
      <div className="space-y-4"><article className="rounded-2xl bg-white p-5 shadow-sm md:p-6"><h2 className="text-xl font-black">{copy.priceTitle}</h2><p className="mt-3 text-sm leading-7 text-slate-600 md:text-[15px]">{copy.priceText}</p></article><article className="rounded-2xl bg-slate-950 p-5 text-white md:p-6"><ShieldCheck className="h-7 w-7 text-[#b9dc49]" /><h2 className="mt-3 text-xl font-black">{copy.warrantyTitle}</h2><p className="mt-3 text-sm leading-7 text-slate-300 md:text-[15px]">{copy.warrantyText}</p></article></div>
    </div></section>

    <section className="mx-auto max-w-7xl px-4 pt-14 md:pt-20">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><h2 className="text-3xl font-black md:text-4xl">{copy.catalogue}</h2><p className="mt-3 max-w-3xl leading-7 text-slate-600">{copy.catalogueText}</p></div><button onClick={() => onNavigate('solar-installation')} className="inline-flex w-fit items-center gap-2 font-black text-[#658300]">{copy.installation}<ArrowRight className="h-4 w-4" /></button></div>
    </section>
    {categoryId ? <ProductsPage lang={lang} initialCategory={categoryId} initialPage={initialPage} lockedCategory catalogueLabel={copy.catalogue} onSelectProduct={onSelectProduct} onOrderNow={onOrderNow} onAddToCart={onAddToCart} /> : <div className="mx-auto max-w-7xl px-4 py-12 text-slate-500">{loadFailed ? copy.catalogueText : '…'}</div>}

    <section className="bg-slate-50"><div className="mx-auto max-w-4xl px-4 py-14 md:py-20"><h2 className="text-3xl font-black">{copy.faqTitle}</h2><div className="mt-8 space-y-4">{copy.faqs.map(([question, answer]) => <details key={question} className="group rounded-2xl border border-slate-200 bg-white p-5"><summary className="cursor-pointer list-none pr-8 font-black">{question}</summary><p className="mt-4 leading-7 text-slate-600">{answer}</p></details>)}</div></div></section>
    <section className="px-4 py-14 md:py-20"><div className="mx-auto max-w-5xl rounded-[2.5rem] bg-[#9ac21d] p-8 md:p-12"><h2 className="text-3xl font-black text-slate-950">{copy.finalTitle}</h2><p className="mt-4 max-w-3xl font-semibold leading-7 text-slate-800">{copy.finalText}</p><div className="mt-7 flex flex-wrap gap-3"><button onClick={() => onNavigate('calculator')} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white">{copy.calculator}</button><button onClick={() => onNavigate('contact')} className="rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950">{copy.contact}</button></div></div></section>
  </main>;
};

export default SolarPanelsPage;
