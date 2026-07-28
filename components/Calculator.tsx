
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { logPublicSolarCalculation, logPublicWhatsappClick } from '../api/solarAnalytics';
import AbifCreditEstimateCard, {
  calculateAbifCreditEstimate,
  getAbifCreditWhatsappSummary
} from './AbifCreditEstimate';

interface CalculatorProps {
  lang: 'az' | 'en' | 'ru' | 'tr';
}

type Lang = CalculatorProps['lang'];
type LocalizedText = Record<Lang, string>;

const getText = (value: LocalizedText, lang: Lang) => value[lang] || value.az;

const PANEL_WATTAGE = 650;
const AREA_PER_PANEL = 2.7;
const AZERBAIJAN_AVERAGE_YIELD = 1350;
const DEFAULT_BILL = 150;
const DEFAULT_SAVING_TARGET = 100;
const DEFAULT_ELECTRICITY_TARIFF = 0.15;

// Enables the ABIF and EBRD banners, financing actions, and related calculator UI.
const ABIF_NONRESIDENTIAL_CREDIT_ENABLED = false;
type FinanceSource = 'abif' | 'ebrd';

const FINANCE_BANNERS: Array<{ source: FinanceSource; image: string }> = [
  { source: 'abif', image: '/abif-business-credit-banner.png' },
  { source: 'ebrd', image: '/ebrd-business-finance-banner.png' }
];

const cityProfiles: Record<string, { lat: number; lon: number; yield: number }> = {
  'Bakı': { lat: 40.3953, lon: 49.8822, yield: 1380 },
  'Sumqayıt': { lat: 40.5897, lon: 49.6686, yield: 1370 },
  'Gəncə': { lat: 40.6828, lon: 46.3606, yield: 1340 },
  'Lənkəran': { lat: 38.7539, lon: 48.8509, yield: 1280 },
  'Şəki': { lat: 41.1919, lon: 47.1706, yield: 1310 },
  'Qəbələ': { lat: 40.9810, lon: 47.8458, yield: 1320 },
  'Şamaxı': { lat: 40.6314, lon: 48.6394, yield: 1360 },
  'Naxçıvan': { lat: 39.2090, lon: 45.4126, yield: 1460 },
  'Mingəçevir': { lat: 40.7703, lon: 47.0495, yield: 1350 },
  'Xırdalan': { lat: 40.4481, lon: 49.7550, yield: 1370 },
  'Şirvan': { lat: 39.9321, lon: 48.9203, yield: 1400 },
  'Quba': { lat: 41.3611, lon: 48.5134, yield: 1300 },
  'Qusar': { lat: 41.4275, lon: 48.4302, yield: 1290 }
};

const getOptimalTilt = (lat: number) => Math.round(Math.abs(lat));

const getTiltFactor = (tilt: number, optimalTilt: number) => {
  const difference = Math.abs(tilt - optimalTilt);
  return Math.max(0.85, 1 - difference * 0.006);
};

const getOrientationFactor = (orientation: number) => {
  const normalized = ((orientation % 360) + 360) % 360;
  const distanceFromSouth = Math.min(Math.abs(normalized - 180), 360 - Math.abs(normalized - 180));
  return Math.max(0.72, 1 - (distanceFromSouth / 180) * 0.28);
};

const parsePositiveNumber = (value: string) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const formatMoney = (value: string | number) => {
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? Math.round(numeric).toLocaleString() : '0';
};

const Calculator: React.FC<CalculatorProps> = ({ lang }) => {
  const [bill, setBill] = useState<number>(DEFAULT_BILL);
  const [propertyType, setPropertyType] = useState<'home' | 'business'>('home');
  const [systemType, setSystemType] = useState<'on-grid' | 'off-grid'>('on-grid');
  const [savingTarget, setSavingTarget] = useState<number>(DEFAULT_SAVING_TARGET);
  
  // New states
  const [city, setCity] = useState<string>('Bakı');
  const [roofArea, setRoofArea] = useState<string>('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  const [maxRoofArea, setMaxRoofArea] = useState<string>('');
  const [tiltAngle, setTiltAngle] = useState<number>(35);
  const [orientation, setOrientation] = useState<number>(180);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showCreditEstimate, setShowCreditEstimate] = useState(false);
  const [financeSource, setFinanceSource] = useState<FinanceSource | null>(null);
  const [activeFinanceBanner, setActiveFinanceBanner] = useState(0);
  const lastLoggedCalculationRef = useRef<string>('');

  const cities = [
    'Bakı', 'Sumqayıt', 'Gəncə', 'Lənkəran', 'Şəki', 'Qəbələ', 'Şamaxı', 
    'Naxçıvan', 'Mingəçevir', 'Xırdalan', 'Şirvan', 'Quba', 'Qusar'
  ];

  const markCalculatorInteraction = () => setHasInteracted(true);

  const results = useMemo(() => {
    const tariff = DEFAULT_ELECTRICITY_TARIFF;
    const annualConsumptionFromBill = (bill / tariff) * 12 * (savingTarget / 100);
    const offGridBuffer = systemType === 'off-grid' ? 1.15 : 1;
    const annualConsumption = annualConsumptionFromBill * offGridBuffer;

    const cityProfile = cityProfiles[city] || cityProfiles['Bakı'];
    const optimalTilt = getOptimalTilt(cityProfile.lat);
    const effectiveTilt = isAdvancedOpen ? tiltAngle : optimalTilt;
    const effectiveOrientation = isAdvancedOpen ? orientation : 180;
    const solarYield = Math.max(
      1,
      Math.round(
        (cityProfile.yield || AZERBAIJAN_AVERAGE_YIELD) *
          getTiltFactor(effectiveTilt, optimalTilt) *
          getOrientationFactor(effectiveOrientation)
      )
    );

    const neededKWp = annualConsumption / solarYield;
    const panelsForFullCoverage = Math.max(1, Math.ceil((neededKWp * 1000) / PANEL_WATTAGE));
    const neededArea = panelsForFullCoverage * AREA_PER_PANEL;
    const roofLimit = parsePositiveNumber(isAdvancedOpen && maxRoofArea ? maxRoofArea : roofArea);
    const maxPanelsByRoof = roofLimit ? Math.max(1, Math.floor(roofLimit / AREA_PER_PANEL)) : null;
    const panels = maxPanelsByRoof ? Math.min(panelsForFullCoverage, maxPanelsByRoof) : panelsForFullCoverage;
    const powerKWp = (panels * PANEL_WATTAGE) / 1000;
    const annualProduction = powerKWp * solarYield;
    const usefulProduction = Math.min(annualProduction, annualConsumption);
    const yearlySaving = usefulProduction * tariff * 0.95;
    const kwpPrice = (propertyType === 'home' ? 1250 : 1150) + (systemType === 'off-grid' ? 850 : 0);
    const installationBase = propertyType === 'home' ? 450 : 700;
    const installationEstimate = Math.round((powerKWp * kwpPrice + panels * 35 + installationBase) / 50) * 50;

    return {
      power: powerKWp.toFixed(1),
      panels,
      price: installationEstimate,
      yearly: yearlySaving.toFixed(0),
      production: Math.round(annualProduction),
      area: Math.round(panels * AREA_PER_PANEL),
      yield: solarYield,
      coverage: Math.min(100, Math.round((annualProduction / annualConsumption) * 100)),
      limitedByRoof: Boolean(roofLimit && neededArea > roofLimit)
    };
  }, [bill, propertyType, savingTarget, systemType, city, roofArea, isAdvancedOpen, maxRoofArea, tiltAngle, orientation]);

  const abifCreditEstimate = useMemo(
    () => calculateAbifCreditEstimate(results.price),
    [results.price]
  );

  const t = {
    eyebrow: { az: 'Ağıllı hesablama', en: 'Smart calculation', ru: 'Умный расчет', tr: 'Akıllı hesaplama' },
    title: { az: 'Sistem və qiymət planlaması', en: 'System and price planning', ru: 'Планирование системы и цены', tr: 'Sistem ve fiyat planlaması' },
    subtitle: { az: 'Düzgün nəticə üçün məlumatları dəqiq daxil edin:', en: 'For a better estimate, enter the details accurately:', ru: 'Для более точного результата укажите данные точно:', tr: 'Daha doğru sonuç için bilgileri net girin:' },
    steps: {
      az: [
        { t: 'Şəhər və sahə', d: 'Məkan və dam sahəsini daxil edin.' },
        { t: 'Məkan növü', d: 'Yaşayış və ya qeyri-yaşayış sahəsi.' },
        { t: 'Sərfiyyat', d: 'Aylıq orta elektrik ödənişiniz (AZN).' }
      ],
      en: [
        { t: 'City & area', d: 'Enter location and roof area.' },
        { t: 'Property type', d: 'Residential or commercial area.' },
        { t: 'Consumption', d: 'Average monthly electricity bill (AZN).' }
      ],
      ru: [
        { t: 'Город и площадь', d: 'Укажите город и площадь крыши.' },
        { t: 'Тип объекта', d: 'Жилой или нежилой объект.' },
        { t: 'Потребление', d: 'Средний ежемесячный счет (AZN).' }
      ],
      tr: [
        { t: 'Şehir ve alan', d: 'Konum ve çatı alanını girin.' },
        { t: 'Mülk tipi', d: 'Konut veya ticari alan.' },
        { t: 'Tüketim', d: 'Ortalama aylık elektrik faturası (AZN).' }
      ]
    },
    residential: { az: 'Yaşayış', en: 'Residential', ru: 'Жилой', tr: 'Konut' },
    commercial: { az: 'Qeyri-yaşayış', en: 'Commercial', ru: 'Нежилой', tr: 'Ticari' },
    propertyType: { az: 'Məkan növü', en: 'Property type', ru: 'Тип объекта', tr: 'Mülk tipi' },
    systemType: { az: 'Sistem növü', en: 'System type', ru: 'Тип системы', tr: 'Sistem tipi' },
    onGrid: { az: 'Şəbəkəli', en: 'On-grid', ru: 'Сетевой', tr: 'Şebekeli' },
    offGrid: { az: 'Şəbəkəsiz', en: 'Off-grid', ru: 'Автономный', tr: 'Şebekesiz' },
    onGridNote: { az: 'Şəbəkəyə qoşulu', en: 'Grid-connected', ru: 'Подключено к сети', tr: 'Şebekeye bağlı' },
    offGridNote: { az: 'Batareya ilə', en: 'With battery', ru: 'С батареей', tr: 'Bataryalı' },
    city: { az: 'Şəhər seçin', en: 'Select city', ru: 'Выберите город', tr: 'Şehir seçin' },
    roofArea: { az: 'Damın sahəsi (m²)', en: 'Roof area (m²)', ru: 'Площадь крыши (м²)', tr: 'Çatı alanı (m²)' },
    roofPlaceholder: { az: 'Məsələn: 50', en: 'Example: 50', ru: 'Например: 50', tr: 'Örnek: 50' },
    monthlyBill: { az: 'Aylıq ödəniş', en: 'Monthly bill', ru: 'Ежемесячный счет', tr: 'Aylık fatura' },
    savingTarget: { az: 'Qənaət hədəfi', en: 'Saving target', ru: 'Цель экономии', tr: 'Tasarruf hedefi' },
    creditView: { az: 'Kredit ilə bax', en: 'View credit', ru: 'Посмотреть кредит', tr: 'Krediyi gör' },
    creditHide: { az: 'Krediti gizlət', en: 'Hide credit', ru: 'Скрыть кредит', tr: 'Krediyi gizlət' },
    maxRoofArea: { az: 'Maksimum dam sahəsi (m²)', en: 'Maximum roof area (m²)', ru: 'Максимальная площадь крыши (м²)', tr: 'Maksimum çatı alanı (m²)' },
    tiltAngle: { az: 'Meyl bucağı (°)', en: 'Tilt angle (°)', ru: 'Угол наклона (°)', tr: 'Eğim açısı (°)' },
    orientation: { az: 'İstiqamət (°)', en: 'Orientation (°)', ru: 'Ориентация (°)', tr: 'Yön (°)' },
    systemPower: { az: 'Sistem gücü', en: 'System power', ru: 'Мощность системы', tr: 'Sistem gücü' },
    panelCount: { az: 'Panel sayı', en: 'Panel count', ru: 'Количество панелей', tr: 'Panel sayısı' },
    yearlySaving: { az: 'İllik qənaət', en: 'Yearly saving', ru: 'Годовая экономия', tr: 'Yıllık tasarruf' },
    installationPrice: { az: 'Təxmini qiymət', en: 'Estimated price', ru: 'Ориентировочная цена', tr: 'Tahmini fiyat' },
    pieces: { az: 'ədəd', en: 'pcs', ru: 'шт.', tr: 'adet' },
    quoteTitle: { az: 'Dəqiq qiymət istəyirsiniz?', en: 'Want an exact quote?', ru: 'Нужна точная смета?', tr: 'Net fiyat teklifi ister misiniz?' },
    quoteDesc: { az: 'Mütəxəssisimiz nəticəni yoxlasın və uyğun təklif hazırlasın.', en: 'Let our specialist review the result and prepare the right offer.', ru: 'Наш специалист проверит расчет и подготовит подходящее предложение.', tr: 'Uzmanımız sonucu kontrol edip uygun teklifi hazırlasın.' },
    quoteButton: { az: 'Qiymət təklifi al', en: 'Get a quote now', ru: 'Получить предложение', tr: 'Teklif al' },
    quoteMessage: {
      az: 'Salam, kalkulyatordakı nəticəyə əsasən qiymət təklifi almaq istəyirəm.',
      en: 'Hello, I would like to get a quote based on the calculator result.',
      ru: 'Здравствуйте, хочу получить предложение по результату калькулятора.',
      tr: 'Merhaba, hesaplayıcı sonucuna göre teklif almak istiyorum.'
    },
    defaultQuoteMessage: {
      az: 'Salam, günəş paneli quraşdırılması ilə maraqlanıram. Növbəti addımlarım nədir?',
      en: 'Hello, I am interested in a solar panel installation. What are my next steps?',
      ru: 'Здравствуйте, меня интересует установка солнечных панелей. Какие мои следующие шаги?',
      tr: 'Merhaba, güneş paneli kurulumu ile ilgileniyorum. Sonraki adımlarım nelerdir?'
    },
    detailsTitle: { az: 'Seçilmiş məlumatlar:', en: 'Selected details:', ru: 'Выбранные данные:', tr: 'Seçilen bilgiler:' },
    notSelected: { az: 'Seçilməyib', en: 'Not selected', ru: 'Не выбрано', tr: 'Seçilmedi' },
    yes: { az: 'Bəli', en: 'Yes', ru: 'Да', tr: 'Evet' },
    no: { az: 'Xeyr', en: 'No', ru: 'Нет', tr: 'Hayır' },
    annualProduction: { az: 'İllik istehsal', en: 'Annual production', ru: 'Годовая выработка', tr: 'Yıllık üretim' },
    neededRoofArea: { az: 'Tələb olunan dam sahəsi', en: 'Required roof area', ru: 'Необходимая площадь крыши', tr: 'Gerekli çatı alanı' },
    solarYield: { az: 'Günəş göstəricisi', en: 'Solar yield', ru: 'Солнечная выработка', tr: 'Güneş verimi' },
    coverage: { az: 'Enerji əhatəsi', en: 'Energy coverage', ru: 'Покрытие энергии', tr: 'Enerji karşılama' },
    roofLimited: { az: 'Dam sahəsi limiti', en: 'Roof space limited', ru: 'Ограничение площади крыши', tr: 'Çatı alanı sınırı' },
    creditBannerTitle: {
      az: '5%-dək güzəştli kredit imkanı',
      en: 'Concessional credit up to 5%',
      ru: 'Льготный кредит до 5%',
      tr: "%5'e kadar avantajlı kredi"
    },
    creditBannerAction: {
      az: 'Biznes üçün hesabla',
      en: 'Calculate for business',
      ru: 'Рассчитать для бизнеса',
      tr: 'İşletme için hesapla'
    },
    ebrdBannerTitle: {
      az: 'Biznes üçün yaşıl maliyyələşmə',
      en: 'Green financing for business',
      ru: 'Зеленое финансирование для бизнеса',
      tr: 'İşletmeler için yeşil finansman'
    },
    ebrdBannerAction: {
      az: 'Layihəni doldurun',
      en: 'Fill in your project',
      ru: 'Заполнить данные проекта',
      tr: 'Proje bilgilerini doldurun'
    },
    ebrdContactTitle: {
      az: 'EBRD maliyyələşməsi haqqında ətraflı məlumat alın',
      en: 'Get EBRD financing details',
      ru: 'Получите подробности финансирования EBRD',
      tr: 'EBRD finansman ayrıntılarını alın'
    },
    ebrdContactDescription: {
      az: 'Hesablamanızla birlikdə müraciət edin. Komandamız uyğun maliyyələşmə şərtləri barədə məlumat verəcək.',
      en: 'Apply with your calculation. Our team will provide the applicable financing terms.',
      ru: 'Подайте заявку вместе с расчетом. Наша команда сообщит вам о применимых условиях финансирования.',
      tr: 'Hesaplamanızla birlikte başvurun. Ekibimiz uygun finansman koşulları hakkında bilgi verecektir.'
    },
    ebrdContactButton: {
      az: 'Müraciət et',
      en: 'Apply now',
      ru: 'Подать заявку',
      tr: 'Başvur'
    },
    creditWhatsappSource: {
      az: 'Maliyyələşmə mənbəyi: Azərbaycan Biznesinin İnkişafı Fondu (ABİF)',
      en: 'Financing source: Azerbaijan Business Development Fund (ABIF)',
      ru: 'Источник финансирования: Азербайджанский фонд развития бизнеса (АБИФ)',
      tr: 'Finansman kaynağı: Azerbaycan İş Geliştirme Fonu (ABİF)'
    },
    ebrdWhatsappSource: {
      az: 'Maliyyələşmə mənbəyi: EBRD və Bank Respublika',
      en: 'Financing source: EBRD and Bank Respublika',
      ru: 'Источник финансирования: ЕБРР и Bank Respublika',
      tr: 'Finansman kaynağı: EBRD ve Bank Respublika'
    }
  };

  const propertyLabel = propertyType === 'home' ? getText(t.residential, lang) : getText(t.commercial, lang);
  const systemLabel = systemType === 'on-grid' ? getText(t.onGrid, lang) : getText(t.offGrid, lang);
  const isDefaultRequest =
    bill === DEFAULT_BILL &&
    savingTarget === DEFAULT_SAVING_TARGET &&
    propertyType === 'home' &&
    systemType === 'on-grid' &&
    city === 'Bakı' &&
    !roofArea.trim() &&
    !isAdvancedOpen;
  const abifCreditWhatsappSummary =
    ABIF_NONRESIDENTIAL_CREDIT_ENABLED && financeSource === 'abif' && propertyType === 'business' && showCreditEstimate && abifCreditEstimate.status === 'eligible'
      ? getAbifCreditWhatsappSummary(abifCreditEstimate, lang)
      : '';
  const quoteDetails = [
    financeSource === 'abif' && propertyType === 'business' && getText(t.creditWhatsappSource, lang),
    financeSource === 'ebrd' && propertyType === 'business' && getText(t.ebrdWhatsappSource, lang),
    city !== 'Bakı' && `${getText(t.city, lang)}: ${city}`,
    parsePositiveNumber(roofArea) && `${getText(t.roofArea, lang)}: ${roofArea.trim()} m²`,
    bill > 0 && bill !== DEFAULT_BILL && `${getText(t.monthlyBill, lang)}: ${bill} AZN`,
    savingTarget > 0 && savingTarget !== DEFAULT_SAVING_TARGET && `${getText(t.savingTarget, lang)}: ${savingTarget}%`,
    propertyType !== 'home' && `${getText(t.propertyType, lang)}: ${propertyLabel}`,
    systemType !== 'on-grid' && `${getText(t.systemType, lang)}: ${systemLabel}`,
    isAdvancedOpen && parsePositiveNumber(maxRoofArea) && `${getText(t.maxRoofArea, lang)}: ${maxRoofArea.trim()} m²`,
    isAdvancedOpen && tiltAngle > 0 && `${getText(t.tiltAngle, lang)}: ${tiltAngle}°`,
    isAdvancedOpen && orientation > 0 && `${getText(t.orientation, lang)}: ${orientation}°`,
    Number(results.power) > 0 && `${getText(t.systemPower, lang)}: ${results.power} kVt`,
    results.price > 0 && `${getText(t.installationPrice, lang)}: ${results.price.toLocaleString()} AZN`,
    Number(results.yearly) > 0 && `${getText(t.yearlySaving, lang)}: ${results.yearly} AZN`,
    results.production > 0 && `${getText(t.annualProduction, lang)}: ${results.production} kWh`,
    results.area > 0 && `${getText(t.neededRoofArea, lang)}: ${results.area} m²`,
    results.yield > 0 && `${getText(t.solarYield, lang)}: ${results.yield} kWh/kWp/year`,
    results.coverage > 0 && `${getText(t.coverage, lang)}: ${results.coverage}%`,
    results.limitedByRoof && `${getText(t.roofLimited, lang)}: ${getText(t.yes, lang)}`,
    abifCreditWhatsappSummary
  ].filter(Boolean).join('\n');
  const quoteMessage = isDefaultRequest
    ? getText(t.defaultQuoteMessage, lang)
    : `${getText(t.quoteMessage, lang)}${quoteDetails ? `\n\n${getText(t.detailsTitle, lang)}\n${quoteDetails}` : ''}`;

  const quoteHref = `https://wa.me/994504180001?text=${encodeURIComponent(
    quoteMessage
  )}`;

  const buildTrackingPayload = (eventType: 'calculation' | 'whatsapp') => ({
    eventType,
    inputs: {
      bill,
      propertyType,
      systemType,
      savingTarget,
      city,
      roofArea,
      isAdvancedOpen,
      maxRoofArea,
      tiltAngle,
      orientation
    },
    result: results,
    creditEstimate:
      ABIF_NONRESIDENTIAL_CREDIT_ENABLED && financeSource === 'abif' && propertyType === 'business' && showCreditEstimate && abifCreditEstimate.status === 'eligible'
        ? abifCreditEstimate
        : undefined,
    quoteDetails: eventType === 'whatsapp' ? quoteDetails : undefined
  });

  useEffect(() => {
    if (!hasInteracted || Number(results.power) <= 0 || results.price <= 0) {
      return;
    }

    const payload = buildTrackingPayload('calculation');
    const payloadKey = JSON.stringify(payload);

    if (payloadKey === lastLoggedCalculationRef.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      lastLoggedCalculationRef.current = payloadKey;
      logPublicSolarCalculation(lang, payload).catch(() => undefined);
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [bill, city, hasInteracted, isAdvancedOpen, lang, maxRoofArea, orientation, propertyType, quoteDetails, results, roofArea, savingTarget, systemType, tiltAngle]);

  const handleWhatsappClick = () => {
    setHasInteracted(true);
    logPublicWhatsappClick(lang, buildTrackingPayload('whatsapp')).catch(() => undefined);
  };

  const openBusinessCredit = () => {
    markCalculatorInteraction();
    setPropertyType('business');
    setFinanceSource('abif');
    setShowCreditEstimate(true);
  };

  const openEbrdFinance = () => {
    markCalculatorInteraction();
    setPropertyType('business');
    setFinanceSource('ebrd');
    setShowCreditEstimate(false);
  };

  useEffect(() => {
    if (!ABIF_NONRESIDENTIAL_CREDIT_ENABLED) {
      return;
    }

    const rotation = window.setInterval(() => {
      setActiveFinanceBanner((current) => (current + 1) % FINANCE_BANNERS.length);
    }, 5000);

    return () => window.clearInterval(rotation);
  }, []);

  const activeBanner = FINANCE_BANNERS[activeFinanceBanner];
  const isAbifBanner = activeBanner.source === 'abif';

  return (
    <section id="calculator" className="relative overflow-hidden bg-[var(--color-surface)] py-12 md:py-24">
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 relative z-10">
        <div className="grid grid-cols-1 items-stretch gap-8 md:gap-12 lg:grid-cols-12">
          <div className="flex flex-col justify-center space-y-6 md:space-y-8 lg:col-span-5">
            <header className="text-left">
              <h2 className="mb-1 text-[var(--color-primary)] text-[9px] font-bold uppercase tracking-[0.2em] md:mb-2 md:text-[10px]">{getText(t.eyebrow, lang)}</h2>
              <h1 className="mb-3 text-2xl font-black leading-tight text-slate-900 md:mb-4 md:text-5xl">{getText(t.title, lang)}</h1>
              <p className="max-w-sm text-[10px] leading-relaxed text-slate-500 md:text-sm">{getText(t.subtitle, lang)}</p>
            </header>

            <div className="grid gap-3">
            {t.steps[lang].map((item, idx) => (
              <div key={idx} className="group flex items-center gap-4 rounded-2xl border border-white bg-white/60 p-4 shadow-sm backdrop-blur-sm transition-all hover:bg-white">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-xs font-black text-[var(--color-dark)]">{idx + 1}</div>
                <div>
                  <h3 className="mb-1 text-[11px] font-black uppercase leading-none text-slate-800">{item.t}</h3>
                  <p className="text-[10px] font-medium leading-tight text-slate-400">{item.d}</p>
                </div>
            </div>
            ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            {ABIF_NONRESIDENTIAL_CREDIT_ENABLED && (
              <>
                <div className="relative aspect-[4/1] w-full overflow-hidden rounded-[1.5rem] border border-slate-800/10 bg-[var(--color-dark)] shadow-lg shadow-slate-900/10">
                  {FINANCE_BANNERS.map((banner, index) => (
                    <img
                      key={banner.source}
                      src={banner.image}
                      alt={activeFinanceBanner === index ? getText(banner.source === 'abif' ? t.creditBannerTitle : t.ebrdBannerTitle, lang) : ''}
                      aria-hidden={activeFinanceBanner !== index}
                      className={`absolute inset-0 block h-full w-full object-cover transition-opacity duration-700 ${banner.source === 'ebrd' ? 'object-[center_8%]' : 'object-center'} ${activeFinanceBanner === index ? 'opacity-100' : 'opacity-0'}`}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={isAbifBanner ? openBusinessCredit : openEbrdFinance}
                    className="absolute bottom-3 right-3 hidden items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-[8px] font-black uppercase tracking-[0.1em] text-[var(--color-dark)] shadow-lg transition-all hover:bg-[var(--color-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:bottom-4 sm:right-4 sm:inline-flex sm:px-4 sm:py-2.5 sm:text-[9px]"
                  >
                    {getText(isAbifBanner ? t.creditBannerAction : t.ebrdBannerAction, lang)}
                    <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className="mt-3 flex justify-center sm:hidden">
                  <button
                    type="button"
                    onClick={isAbifBanner ? openBusinessCredit : openEbrdFinance}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.1em] text-[var(--color-dark)] shadow-lg transition-all hover:bg-[var(--color-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dark)]"
                  >
                    {getText(isAbifBanner ? t.creditBannerAction : t.ebrdBannerAction, lang)}
                    <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </>
            )}
            <div className={`${ABIF_NONRESIDENTIAL_CREDIT_ENABLED ? 'mt-3' : ''} h-full rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl md:rounded-[2.5rem] md:p-10`}>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button onClick={() => { markCalculatorInteraction(); setPropertyType('home'); setFinanceSource(null); setShowCreditEstimate(false); }} className={`py-3 md:py-3.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all ${propertyType === 'home' ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-dark)] shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{getText(t.residential, lang)}</button>
                <button onClick={() => { markCalculatorInteraction(); setPropertyType('business'); }} className={`py-3 md:py-3.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all ${propertyType === 'business' ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-dark)] shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{getText(t.commercial, lang)}</button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => { markCalculatorInteraction(); setSystemType('on-grid'); }} 
                  className={`py-3 md:py-3.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all ${systemType === 'on-grid' ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-dark)] shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                >
                  {getText(t.onGrid, lang)} <span className={`normal-case font-medium ml-1 ${systemType === 'on-grid' ? 'text-[var(--color-dark)] opacity-75' : 'text-slate-400 opacity-60'}`}>({getText(t.onGridNote, lang)})</span>
                </button>
                <button 
                  onClick={() => { markCalculatorInteraction(); setSystemType('off-grid'); }} 
                  className={`py-3 md:py-3.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all ${systemType === 'off-grid' ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-dark)] shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                >
                  {getText(t.offGrid, lang)} <span className={`normal-case font-medium ml-1 ${systemType === 'off-grid' ? 'text-[var(--color-dark)] opacity-75' : 'text-slate-400 opacity-60'}`}>({getText(t.offGridNote, lang)})</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">{getText(t.city, lang)}</label>
                  <select 
                    value={city} 
                    onChange={(e) => { markCalculatorInteraction(); setCity(e.target.value); }}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  >
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">{getText(t.roofArea, lang)}</label>
                  <input 
                    type="number" 
                    placeholder={getText(t.roofPlaceholder, lang)}
                    value={roofArea}
                    onChange={(e) => { markCalculatorInteraction(); setRoofArea(e.target.value); }}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-8 md:space-y-10 mb-8">
                <div>
                  <div className="flex justify-between items-center mb-3 md:mb-4">
                    <label className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest">{getText(t.monthlyBill, lang)}</label>
                    <span className="text-lg md:text-xl font-black text-[var(--color-primary)]">{formatMoney(bill)} AZN</span>
                  </div>
                  <input type="range" min="30" max="10000" step="10" value={bill} onChange={(e) => { markCalculatorInteraction(); setBill(Number(e.target.value)); }} className="w-full h-1.5 md:h-2 bg-slate-100 rounded-full appearance-none accent-[var(--color-primary)] cursor-pointer" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3 md:mb-4">
                    <label className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest">{getText(t.savingTarget, lang)}</label>
                    <span className="text-lg md:text-xl font-black text-[var(--color-primary)]">{savingTarget}%</span>
                  </div>
                  <input type="range" min="10" max="100" step="5" value={savingTarget} onChange={(e) => { markCalculatorInteraction(); setSavingTarget(parseInt(e.target.value)); }} className="w-full h-1.5 md:h-2 bg-slate-100 rounded-full appearance-none accent-[var(--color-primary)] cursor-pointer" />
                </div>
              </div>

              {ABIF_NONRESIDENTIAL_CREDIT_ENABLED && propertyType === 'business' && financeSource !== 'ebrd' && (
                <div className="mb-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      markCalculatorInteraction();
                      setFinanceSource('abif');
                      setShowCreditEstimate((visible) => !visible);
                    }}
                    aria-expanded={showCreditEstimate}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[var(--color-primary)] bg-white px-8 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-[var(--color-dark)] transition-all hover:bg-[var(--color-primary)] hover:shadow-lg md:text-[11px] ${showCreditEstimate ? 'font-black' : 'font-extrabold'}`}
                  >
                    {getText(showCreditEstimate ? t.creditHide : t.creditView, lang)}
                    <svg className={`h-4 w-4 transition-transform duration-300 ease-out ${showCreditEstimate ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 9l6 6 6-6" /></svg>
                  </button>
                </div>
              )}

              {isAdvancedOpen && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-8 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">{getText(t.maxRoofArea, lang)}</label>
                      <input 
                        type="number" 
                        value={maxRoofArea}
                        onChange={(e) => { markCalculatorInteraction(); setMaxRoofArea(e.target.value); }}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">{getText(t.tiltAngle, lang)}</label>
                      <input 
                        type="number" 
                        value={tiltAngle}
                        onChange={(e) => { markCalculatorInteraction(); setTiltAngle(parseInt(e.target.value) || 0); }}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">{getText(t.orientation, lang)}</label>
                      <input 
                        type="number" 
                        value={orientation}
                        onChange={(e) => { markCalculatorInteraction(); setOrientation(parseInt(e.target.value) || 0); }}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                      />
                    </div>
                  </div>
                )}

              <div className="bg-[var(--color-dark)] rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 text-white">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-6 text-center items-center">
                  <div>
                    <div className="text-[6px] md:text-[8px] font-black text-[var(--color-primary)] opacity-60 uppercase tracking-widest mb-0.5">{getText(t.systemPower, lang)}</div>
                    <div className="text-xs md:text-2xl font-black">{results.power} <span className="text-[7px] opacity-40">kVt</span></div>
                  </div>
                  <div>
                    <div className="text-[6px] md:text-[8px] font-black text-[var(--color-primary)] opacity-60 uppercase tracking-widest mb-0.5">{getText(t.installationPrice, lang)}</div>
                    <div className="text-xs md:text-2xl font-black whitespace-nowrap">{formatMoney(results.price)} <span className="text-[7px] opacity-40">AZN</span></div>
                  </div>
                  <div className="bg-white/10 rounded-xl md:rounded-2xl py-2 md:py-4 px-2 md:px-6 border border-white/10 min-w-0 overflow-hidden">
                    <div className="text-[6px] md:text-[8px] font-black text-[var(--color-primary)] uppercase tracking-widest mb-0.5">{getText(t.yearlySaving, lang)}</div>
                    <div className="flex flex-wrap items-baseline justify-center gap-x-1 text-sm md:text-2xl xl:text-3xl font-black text-[var(--color-primary)] leading-tight">
                      <span>{formatMoney(results.yearly)}</span>
                      <span className="text-[7px] md:text-sm">AZN</span>
                    </div>
                  </div>
                </div>
              </div>

              {ABIF_NONRESIDENTIAL_CREDIT_ENABLED && financeSource === 'abif' && propertyType === 'business' && showCreditEstimate && (
                <AbifCreditEstimateCard
                  lang={lang}
                  estimate={abifCreditEstimate}
                  estimatedAnnualSavings={Number(results.yearly)}
                  whatsappHref={quoteHref}
                  onWhatsappClick={handleWhatsappClick}
                />
              )}

              <div className="mt-6 rounded-[1.5rem] border border-[var(--color-primary)] bg-[var(--color-surface)] p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h4 className="text-base md:text-lg font-black text-[var(--color-dark)] leading-tight">{getText(financeSource === 'ebrd' && propertyType === 'business' ? t.ebrdContactTitle : t.quoteTitle, lang)}</h4>
                  <p className="text-xs md:text-sm text-slate-500 font-medium mt-1 max-w-md">{getText(financeSource === 'ebrd' && propertyType === 'business' ? t.ebrdContactDescription : t.quoteDesc, lang)}</p>
                </div>
                <a
                  href={quoteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsappClick}
                  className="inline-flex items-center justify-center rounded-2xl bg-[var(--color-primary)] px-6 py-3 text-[10px] md:text-xs font-black uppercase tracking-widest text-[var(--color-dark)] shadow-lg shadow-slate-900/5 transition-all hover:-translate-y-0.5 hover:bg-[var(--color-accent)]"
                >
                  {getText(financeSource === 'ebrd' && propertyType === 'business' ? t.ebrdContactButton : t.quoteButton, lang)}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calculator;
