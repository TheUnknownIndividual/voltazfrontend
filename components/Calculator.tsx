
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { logPublicSolarCalculation } from '../api/solarAnalytics';
import { trackCalculatorComplete } from '../utils/analytics';
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
const DESIGN_BUFFER = 1.05;
const VAT_RATE = 0.18;
// The public calculator uses roof mounting by default, matching the admin
// calculator's default "Dam montajı" price.
const ROOF_MOUNT_PRICE_PER_KW = 850;
const OFF_GRID_PRICE_PREMIUM_PER_KW = 850;

// Enables the ABIF and EBRD banners, financing actions, and related calculator UI.
const ABIF_NONRESIDENTIAL_CREDIT_ENABLED = false;
type FinanceSource = 'abif' | 'ebrd';

const FINANCE_BANNERS: Array<{ source: FinanceSource; image: string }> = [
  { source: 'abif', image: '/abif-business-credit-banner.png' },
  { source: 'ebrd', image: '/ebrd-business-finance-banner.png' }
];

const cityProfiles: Record<string, { lat: number; lon: number; yield: number; region?: string }> = {
  'Bakı': { lat: 40.3953, lon: 49.8822, yield: 1620, region: 'Abşeron' },
  'Sumqayıt': { lat: 40.5897, lon: 49.6686, yield: 1615, region: 'Abşeron' },
  'Xırdalan': { lat: 40.4481, lon: 49.7550, yield: 1615, region: 'Abşeron' },
  'Şamaxı': { lat: 40.6314, lon: 48.6394, yield: 1585, region: 'Dağlıq Şirvan' },
  'Qobustan': { lat: 40.5378, lon: 49.3844, yield: 1685, region: 'Dağlıq Şirvan' },
  'Gəncə': { lat: 40.6828, lon: 46.3606, yield: 1540, region: 'Qərb' },
  'Mingəçevir': { lat: 40.7703, lon: 47.0495, yield: 1600, region: 'Aran' },
  'Yevlax': { lat: 40.6127, lon: 47.1522, yield: 1600, region: 'Aran' },
  'Şirvan': { lat: 39.9321, lon: 48.9203, yield: 1690, region: 'Aran' },
  'Salyan': { lat: 39.5967, lon: 48.9831, yield: 1690, region: 'Aran' },
  'Neftçala': { lat: 39.3789, lon: 49.2467, yield: 1660, region: 'Aran' },
  'Lənkəran': { lat: 38.7539, lon: 48.8509, yield: 1415, region: 'Cənub' },
  'Astara': { lat: 38.4506, lon: 48.8756, yield: 1385, region: 'Cənub' },
  'Masallı': { lat: 39.0333, lon: 48.6667, yield: 1440, region: 'Cənub' },
  'Quba': { lat: 41.3611, lon: 48.5134, yield: 1490, region: 'Şimal' },
  'Qusar': { lat: 41.4275, lon: 48.4302, yield: 1460, region: 'Şimal' },
  'Xaçmaz': { lat: 41.4636, lon: 48.8006, yield: 1505, region: 'Şimal' },
  'Şəki': { lat: 41.1919, lon: 47.1706, yield: 1480, region: 'Şimal-qərb' },
  'Zaqatala': { lat: 41.6308, lon: 46.6428, yield: 1440, region: 'Şimal-qərb' },
  'Qəbələ': { lat: 40.9810, lon: 47.8458, yield: 1480, region: 'Şimal-qərb' },
  'İsmayıllı': { lat: 40.7833, lon: 48.15, yield: 1525, region: 'Dağlıq Şirvan' },
  'Naxçıvan': { lat: 39.2090, lon: 45.4126, yield: 1825, region: 'Naxçıvan' },
  'Şərur': { lat: 39.5561, lon: 44.9553, yield: 1825, region: 'Naxçıvan' },
  'Culfa': { lat: 38.9581, lon: 45.6297, yield: 1875, region: 'Naxçıvan' },
  'Ordubad': { lat: 38.9083, lon: 46.0233, yield: 1825, region: 'Naxçıvan' },
  'Ağdam': { lat: 39.9908, lon: 46.9264, yield: 1660, region: 'Qarabağ' },
  'Füzuli': { lat: 39.6014, lon: 47.1447, yield: 1660, region: 'Qarabağ' },
  'Şuşa': { lat: 39.7581, lon: 46.7508, yield: 1525, region: 'Qarabağ' },
  'Laçın': { lat: 39.6428, lon: 46.5486, yield: 1475, region: 'Qarabağ' },
  'Kəlbəcər': { lat: 40.1064, lon: 46.0392, yield: 1475, region: 'Qarabağ' }
};

const CITY_NAME_ALIASES: Record<string, string> = {
  'baku': 'Bakı',
  'sumgayit': 'Sumqayıt',
  'sumgait': 'Sumqayıt',
  'ganja': 'Gəncə',
  'gyandzha': 'Gəncə',
  'lankaran': 'Lənkəran',
  'lenkoran': 'Lənkəran',
  'sheki': 'Şəki',
  'shaki': 'Şəki',
  'gabala': 'Qəbələ',
  'qabala': 'Qəbələ',
  'shamakhi': 'Şamaxı',
  'shemakha': 'Şamaxı',
  'nakhchivan': 'Naxçıvan',
  'nakhichevan': 'Naxçıvan',
  'mingachevir': 'Mingəçevir',
  'mingacevir': 'Mingəçevir',
  'khirdalan': 'Xırdalan',
  'hirdalan': 'Xırdalan',
  'shirvan': 'Şirvan',
  'guba': 'Quba',
  'qusar': 'Qusar',
  'gusar': 'Qusar',
  'yevlakh': 'Yevlax',
  'yevlax': 'Yevlax',
  'salyan': 'Salyan',
  'neftchala': 'Neftçala',
  'astara': 'Astara',
  'masally': 'Masallı',
  'masalli': 'Masallı',
  'khachmaz': 'Xaçmaz',
  'xachmaz': 'Xaçmaz',
  'zaqatala': 'Zaqatala',
  'zakatala': 'Zaqatala',
  'ismayilli': 'İsmayıllı',
  'ismailli': 'İsmayıllı',
  'sharur': 'Şərur',
  'julfa': 'Culfa',
  'ordubad': 'Ordubad',
  'agdam': 'Ağdam',
  'fuzuli': 'Füzuli',
  'shusha': 'Şuşa',
  'shousha': 'Şuşa',
  'lachin': 'Laçın',
  'kalbajar': 'Kəlbəcər',
  'kelbajar': 'Kəlbəcər'
};

const resolveDetectedCity = (rawCityName: string): string | null => {
  const normalized = rawCityName.trim().toLowerCase();
  if (!normalized) return null;

  const aliasMatch = CITY_NAME_ALIASES[normalized];
  if (aliasMatch) return aliasMatch;

  const directMatch = Object.keys(cityProfiles).find(
    (name) => name.toLowerCase() === normalized
  );
  return directMatch || null;
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

const formatPaybackPeriod = (paybackYears: number, yearLabel: string, monthLabel: string) => {
  const totalMonths = Math.floor(Math.max(0, paybackYears) * 12 + Number.EPSILON);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return `${years} ${yearLabel} ${months} ${monthLabel}`;
};

const DESKTOP_SCROLL_FOLLOW_QUERY = '(min-width: 1024px)';
const SCROLL_FOLLOW_VIEWPORT_RATIO = 0.35;

const useDesktopScrollFollow = (
  trackRef: React.RefObject<HTMLDivElement | null>,
  contentRef: React.RefObject<HTMLDivElement | null>,
  formCardRef: React.RefObject<HTMLDivElement | null>
) => {
  const targetY = useMotionValue(0);
  const springY = useSpring(targetY, {
    stiffness: 120,
    damping: 26,
    mass: 0.8
  });
  const prefersReducedMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia(DESKTOP_SCROLL_FOLLOW_QUERY);
    let animationFrame = 0;
    let hasMeasured = false;
    let metrics = {
      trackTop: 0,
      startY: 0,
      maxY: 0,
      viewportTop: 0
    };

    const updatePosition = () => {
      if (!desktopQuery.matches) return;

      const nextY = Math.min(
        metrics.maxY,
        Math.max(metrics.startY, window.scrollY + metrics.viewportTop - metrics.trackTop)
      );

      targetY.set(nextY);
      if (!hasMeasured) {
        springY.jump(nextY);
        hasMeasured = true;
      }
    };

    const schedulePositionUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        updatePosition();
      });
    };

    const measure = () => {
      const track = trackRef.current;
      const content = contentRef.current;
      const formCard = formCardRef.current;

      if (!desktopQuery.matches || !track || !content || !formCard) return;

      const scrollY = window.scrollY;
      const trackRect = track.getBoundingClientRect();
      const formCardRect = formCard.getBoundingClientRect();
      const headerBottom = Math.max(
        0,
        document.querySelector<HTMLElement>('.site-header-theme')
          ?.getBoundingClientRect().bottom ?? 0
      );
      const trackTop = trackRect.top + scrollY;
      const formStart = Math.max(0, formCardRect.top + scrollY - trackTop);
      const maxY = Math.max(formStart, formStart + formCardRect.height - content.offsetHeight);
      const viewportTop = headerBottom
        + Math.max(0, window.innerHeight - headerBottom) * SCROLL_FOLLOW_VIEWPORT_RATIO;

      metrics = {
        trackTop,
        startY: Math.min(formStart, maxY),
        maxY,
        viewportTop
      };

      updatePosition();
    };

    const scheduleMeasure = () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        measure();
      });
    };

    const handleDesktopChange = () => {
      const desktop = desktopQuery.matches;
      setIsDesktop(desktop);

      if (desktop) {
        hasMeasured = false;
        scheduleMeasure();
      } else {
        hasMeasured = false;
        targetY.jump(0);
        springY.jump(0);
      }
    };

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    const header = document.querySelector<HTMLElement>('.site-header-theme');
    [trackRef.current, contentRef.current, formCardRef.current, header].forEach((element) => {
      if (element) resizeObserver.observe(element);
    });

    window.addEventListener('scroll', schedulePositionUpdate, { passive: true });
    window.addEventListener('resize', scheduleMeasure);
    desktopQuery.addEventListener('change', handleDesktopChange);
    handleDesktopChange();

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', schedulePositionUpdate);
      window.removeEventListener('resize', scheduleMeasure);
      desktopQuery.removeEventListener('change', handleDesktopChange);
    };
  }, [contentRef, formCardRef, springY, targetY, trackRef]);

  return isDesktop ? (prefersReducedMotion ? targetY : springY) : 0;
};

const Calculator: React.FC<CalculatorProps> = ({ lang }) => {
  const [bill, setBill] = useState<number>(DEFAULT_BILL);
  const [propertyType, setPropertyType] = useState<'home' | 'business'>('home');
  const [systemType, setSystemType] = useState<'on-grid' | 'off-grid'>('on-grid');
  const [savingTarget, setSavingTarget] = useState<number>(DEFAULT_SAVING_TARGET);
  
  // New states
  const [city, setCity] = useState<string>('Bakı');
  const [hasUserPickedCity, setHasUserPickedCity] = useState(false);
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
  const followTrackRef = useRef<HTMLDivElement | null>(null);
  const followContentRef = useRef<HTMLDivElement | null>(null);
  const formCardRef = useRef<HTMLDivElement | null>(null);
  const followY = useDesktopScrollFollow(followTrackRef, followContentRef, formCardRef);

  const cities = useMemo(() => Object.keys(cityProfiles), []);

  const markCalculatorInteraction = () => setHasInteracted(true);

  useEffect(() => {
    if (hasUserPickedCity) return;

    let isCancelled = false;

    const detectCityFromIp = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) return;
        const data = await response.json();
        if (isCancelled || data?.country_code !== 'AZ') return;

        const matchedCity = resolveDetectedCity(String(data?.city || ''));
        if (matchedCity && !isCancelled) {
          setCity(matchedCity);
        }
      } catch {
        // Silent fallback: keep the default city if geolocation is unavailable.
      }
    };

    detectCityFromIp();

    return () => {
      isCancelled = true;
    };
  }, [hasUserPickedCity]);

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

    const neededKWp = (annualConsumption / solarYield) * DESIGN_BUFFER;
    const panelsForFullCoverage = Math.max(1, Math.ceil((neededKWp * 1000) / PANEL_WATTAGE));
    const neededArea = panelsForFullCoverage * AREA_PER_PANEL;
    const roofLimit = parsePositiveNumber(isAdvancedOpen && maxRoofArea ? maxRoofArea : roofArea);
    const maxPanelsByRoof = roofLimit ? Math.max(1, Math.floor(roofLimit / AREA_PER_PANEL)) : null;
    const panels = maxPanelsByRoof ? Math.min(panelsForFullCoverage, maxPanelsByRoof) : panelsForFullCoverage;
    const powerKWp = (panels * PANEL_WATTAGE) / 1000;
    const annualProduction = powerKWp * solarYield;
    const yearlySaving = annualProduction * tariff;
    const pricePerKw = ROOF_MOUNT_PRICE_PER_KW + (systemType === 'off-grid' ? OFF_GRID_PRICE_PREMIUM_PER_KW : 0);
    const preTaxEstimate = powerKWp * pricePerKw;
    const vatAmount = preTaxEstimate * VAT_RATE;
    const installationEstimate = Math.round(preTaxEstimate + vatAmount);
    const paybackYears = yearlySaving > 0 ? installationEstimate / yearlySaving : 0;

    return {
      power: powerKWp.toFixed(1),
      panels,
      price: installationEstimate,
      vat: Math.round(vatAmount),
      yearly: yearlySaving.toFixed(0),
      production: Math.round(annualProduction),
      area: Math.round(panels * AREA_PER_PANEL),
      yield: solarYield,
      coverage: Math.min(100, Math.round((annualProduction / annualConsumption) * 100)),
      limitedByRoof: Boolean(roofLimit && neededArea > roofLimit),
      paybackYears
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
    roofAreaHint: {
      az: 'Yalnız damın tuta biləcəyi maksimum sistemi məhdudlaşdırmaq üçün istifadə olunur — daha böyük dam əlavə panel əlavə etmir.',
      en: 'Only used to cap the system to what your roof can hold — a bigger roof does not add extra panels.',
      ru: 'Используется только для ограничения системы тем, что вместит крыша — большая крыша не добавляет лишних панелей.',
      tr: 'Yalnızca çatının kaldırabileceği maksimum sistemi sınırlamak için kullanılır — daha büyük bir çatı ekstra panel eklemez.'
    },
    roofPlaceholder: { az: 'Məsələn: 50', en: 'Example: 50', ru: 'Например: 50', tr: 'Örnek: 50' },
    roofLimitedWarning: {
      az: 'Damınızın sahəsi seçdiyiniz qənaət hədəfi üçün kifayət etmir. Bu, mövcud dam sahəniz üçün əldə edilə bilən maksimum sistemdir.',
      en: 'Your roof area is not enough to reach the selected saving target. This is the maximum system your available roof space can support.',
      ru: 'Площади вашей крыши недостаточно для выбранной цели экономии. Это максимальная система, которую может выдержать доступная площадь крыши.',
      tr: 'Çatı alanınız seçtiğiniz tasarruf hedefi için yeterli değil. Bu, mevcut çatı alanınızın destekleyebileceği maksimum sistemdir.'
    },
    monthlyBill: { az: 'Aylıq ödəniş', en: 'Monthly bill', ru: 'Ежемесячный счет', tr: 'Aylık fatura' },
    savingTarget: { az: 'Qənaət hədəfi', en: 'Saving target', ru: 'Цель экономии', tr: 'Tasarruf hedefi' },
    creditView: { az: 'Kredit ilə bax', en: 'View credit', ru: 'Посмотреть кредит', tr: 'Krediyi gör' },
    creditHide: { az: 'Krediti gizlət', en: 'Hide credit', ru: 'Скрыть кредит', tr: 'Krediyi gizlət' },
    maxRoofArea: { az: 'Maksimum dam sahəsi (m²)', en: 'Maximum roof area (m²)', ru: 'Максимальная площадь крыши (м²)', tr: 'Maksimum çatı alanı (m²)' },
    tiltAngle: { az: 'Meyl bucağı (°)', en: 'Tilt angle (°)', ru: 'Угол наклона (°)', tr: 'Eğim açısı (°)' },
    orientation: { az: 'İstiqamət (°)', en: 'Orientation (°)', ru: 'Ориентация (°)', tr: 'Yön (°)' },
    advancedToggleShow: { az: 'Əlavə parametrlər', en: 'Advanced settings', ru: 'Дополнительные параметры', tr: 'Gelişmiş ayarlar' },
    advancedToggleHide: { az: 'Əlavə parametrləri gizlət', en: 'Hide advanced settings', ru: 'Скрыть доп. параметры', tr: 'Gelişmiş ayarları gizle' },
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
    paybackPeriod: { az: 'Özünü ödəmə müddəti', en: 'Payback period', ru: 'Срок окупаемости', tr: 'Geri ödeme süresi' },
    paybackYears: { az: 'il', en: 'yr', ru: 'лет', tr: 'yıl' },
    paybackMonths: { az: 'ay', en: 'mo', ru: 'мес', tr: 'ay' },
    vatIncluded: { az: 'ƏDV (18%) daxil edilib', en: 'VAT (18%) included', ru: 'Включая НДС (18%)', tr: 'KDV (%18) dahildir' },
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
      trackCalculatorComplete(lang, propertyType, systemType, Number(results.power));
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [bill, city, hasInteracted, isAdvancedOpen, lang, maxRoofArea, orientation, propertyType, quoteDetails, results, roofArea, savingTarget, systemType, tiltAngle]);

  const handleWhatsappClick = () => {
    setHasInteracted(true);
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
          <div ref={followTrackRef} className="relative lg:col-span-5">
            <motion.div ref={followContentRef} style={{ y: followY }} className="flex flex-col space-y-6 md:space-y-8">
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
            </motion.div>
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
                      loading="lazy"
                      decoding="async"
                      width="1200"
                      height="300"
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
            <div ref={formCardRef} className={`${ABIF_NONRESIDENTIAL_CREDIT_ENABLED ? 'mt-3' : ''} h-full rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl md:rounded-[2.5rem] md:p-10`}>
              <div className="mb-6 grid grid-cols-1 items-stretch gap-2.5 sm:grid-cols-2">
              <div className="h-full rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                <div className="mb-1.5 px-0.5 text-[9px] font-black uppercase tracking-widest text-slate-400 md:text-[10px]">
                  {getText(t.propertyType, lang)}
                </div>
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100/80 p-1" role="group" aria-label={getText(t.propertyType, lang)}>
                  <button
                  type="button"
                  aria-pressed={propertyType === 'home'}
                  onClick={() => { markCalculatorInteraction(); setPropertyType('home'); setFinanceSource(null); setShowCreditEstimate(false); }}
                  className={`min-h-9 min-w-0 rounded-md px-2 py-1.5 text-center text-[9px] font-black uppercase tracking-wider transition-all md:text-[10px] ${propertyType === 'home' ? 'bg-[var(--color-primary)] text-[var(--color-dark)] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <span className="truncate">{getText(t.residential, lang)}</span>
                  </button>
                  <button
                  type="button"
                  aria-pressed={propertyType === 'business'}
                  onClick={() => { markCalculatorInteraction(); setPropertyType('business'); }}
                  className={`min-h-9 min-w-0 rounded-md px-2 py-1.5 text-center text-[9px] font-black uppercase tracking-wider transition-all md:text-[10px] ${propertyType === 'business' ? 'bg-[var(--color-primary)] text-[var(--color-dark)] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <span className="truncate">{getText(t.commercial, lang)}</span>
                  </button>
                </div>
              </div>

              <div className="h-full rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                <div className="mb-1.5 px-0.5 text-[9px] font-black uppercase tracking-widest text-slate-400 md:text-[10px]">
                  {getText(t.systemType, lang)}
                </div>
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100/80 p-1" role="group" aria-label={getText(t.systemType, lang)}>
                  <button
                  type="button"
                  aria-pressed={systemType === 'on-grid'}
                  onClick={() => { markCalculatorInteraction(); setSystemType('on-grid'); }}
                  className={`min-h-9 min-w-0 rounded-md px-2 py-1.5 text-center leading-tight transition-all ${systemType === 'on-grid' ? 'bg-[var(--color-primary)] text-[var(--color-dark)] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <span className="block text-[9px] font-black uppercase tracking-wider md:text-[10px]">{getText(t.onGrid, lang)}</span>
                    <span className={`block text-[8px] font-medium normal-case tracking-normal ${systemType === 'on-grid' ? 'text-[var(--color-dark)]/70' : 'text-slate-400/70'}`}>{getText(t.onGridNote, lang)}</span>
                  </button>
                  <button
                  type="button"
                  aria-pressed={systemType === 'off-grid'}
                  onClick={() => { markCalculatorInteraction(); setSystemType('off-grid'); }}
                  className={`min-h-9 min-w-0 rounded-md px-2 py-1.5 text-center leading-tight transition-all ${systemType === 'off-grid' ? 'bg-[var(--color-primary)] text-[var(--color-dark)] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <span className="block text-[9px] font-black uppercase tracking-wider md:text-[10px]">{getText(t.offGrid, lang)}</span>
                    <span className={`block text-[8px] font-medium normal-case tracking-normal ${systemType === 'off-grid' ? 'text-[var(--color-dark)]/70' : 'text-slate-400/70'}`}>{getText(t.offGridNote, lang)}</span>
                  </button>
                </div>
              </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">{getText(t.city, lang)}</label>
                  <select 
                    value={city} 
                    onChange={(e) => { markCalculatorInteraction(); setHasUserPickedCity(true); setCity(e.target.value); }}
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
                  <p className="mt-1.5 text-[9px] leading-relaxed text-slate-400">{getText(t.roofAreaHint, lang)}</p>
                </div>
              </div>

              {results.limitedByRoof && (
                <div className="mb-8 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                  <p className="text-xs font-semibold leading-relaxed text-amber-700">{getText(t.roofLimitedWarning, lang)}</p>
                </div>
              )}

              <div className="space-y-8 md:space-y-10 mb-8">
                <div>
                  <div className="flex justify-between items-center mb-3 md:mb-4">
                    <label className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest">{getText(t.monthlyBill, lang)}</label>
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 pl-3 pr-1 py-1 focus-within:border-[var(--color-primary)] transition-colors">
                      <input
                        type="number"
                        min={30}
                        max={10000}
                        step={10}
                        value={bill}
                        onChange={(e) => {
                          markCalculatorInteraction();
                          const next = Number(e.target.value);
                          setBill(Number.isFinite(next) ? Math.min(10000, Math.max(0, next)) : 0);
                        }}
                        onBlur={(e) => {
                          const next = Number(e.target.value);
                          setBill(Number.isFinite(next) ? Math.min(10000, Math.max(30, next)) : DEFAULT_BILL);
                        }}
                        className="w-20 md:w-24 bg-transparent text-right text-base md:text-xl font-black text-[var(--color-primary)] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-[9px] md:text-xs font-bold text-slate-400 uppercase pr-1">AZN</span>
                    </div>
                  </div>
                  <input type="range" min="30" max="10000" step="10" value={bill} onChange={(e) => { markCalculatorInteraction(); setBill(Number(e.target.value)); }} className="w-full h-1.5 md:h-2 bg-slate-100 rounded-full appearance-none accent-[var(--color-primary)] cursor-pointer" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3 md:mb-4">
                    <label className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest">{getText(t.savingTarget, lang)}</label>
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 pl-3 pr-1 py-1 focus-within:border-[var(--color-primary)] transition-colors">
                      <input
                        type="number"
                        min={10}
                        max={100}
                        step={5}
                        value={savingTarget}
                        onChange={(e) => {
                          markCalculatorInteraction();
                          const next = parseInt(e.target.value, 10);
                          setSavingTarget(Number.isFinite(next) ? Math.min(100, Math.max(0, next)) : 0);
                        }}
                        onBlur={(e) => {
                          const next = parseInt(e.target.value, 10);
                          setSavingTarget(Number.isFinite(next) ? Math.min(100, Math.max(10, next)) : DEFAULT_SAVING_TARGET);
                        }}
                        className="w-16 md:w-20 bg-transparent text-right text-base md:text-xl font-black text-[var(--color-primary)] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-[9px] md:text-xs font-bold text-slate-400 uppercase pr-1">%</span>
                    </div>
                  </div>
                  <input type="range" min="10" max="100" step="5" value={savingTarget} onChange={(e) => { markCalculatorInteraction(); setSavingTarget(parseInt(e.target.value)); }} className="w-full h-1.5 md:h-2 bg-slate-100 rounded-full appearance-none accent-[var(--color-primary)] cursor-pointer" />
                </div>
              </div>

              <div className="mb-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => { markCalculatorInteraction(); setIsAdvancedOpen((open) => !open); }}
                  aria-expanded={isAdvancedOpen}
                  className="inline-flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-[var(--color-primary)]"
                >
                  {getText(isAdvancedOpen ? t.advancedToggleHide : t.advancedToggleShow, lang)}
                  <svg className={`h-3.5 w-3.5 transition-transform duration-300 ease-out ${isAdvancedOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </button>
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
                    <div className="mt-0.5 text-[6px] opacity-40">{getText(t.vatIncluded, lang)}</div>
                  </div>
                  <div className="bg-white/10 rounded-xl md:rounded-2xl py-2 md:py-4 px-2 md:px-6 border border-white/10 min-w-0 overflow-hidden">
                    <div className="text-[6px] md:text-[8px] font-black text-[var(--color-primary)] uppercase tracking-widest mb-0.5">{getText(t.yearlySaving, lang)}</div>
                    <div className="flex flex-wrap items-baseline justify-center gap-x-1 text-sm md:text-2xl xl:text-3xl font-black text-[var(--color-primary)] leading-tight">
                      <span>{formatMoney(results.yearly)}</span>
                      <span className="text-[7px] md:text-sm">AZN</span>
                    </div>
                  </div>
                </div>

                {results.paybackYears > 0 && (
                  <div className="mt-4 md:mt-6 flex items-center justify-center gap-2 border-t border-white/10 pt-4 md:pt-6">
                    <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest opacity-60">{getText(t.paybackPeriod, lang)}:</span>
                    <span className="text-[10px] md:text-sm font-black text-[var(--color-primary)]">
                      {formatPaybackPeriod(results.paybackYears, getText(t.paybackYears, lang), getText(t.paybackMonths, lang))}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 md:mt-4 grid grid-cols-2 gap-2 md:gap-4 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-center md:rounded-2xl md:py-4">
                  <div className="text-[6px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{getText(t.annualProduction, lang)}</div>
                  <div className="text-[11px] md:text-base font-black text-slate-800">{formatMoney(results.production)} <span className="text-[7px] font-bold text-slate-400">kWh</span></div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-center md:rounded-2xl md:py-4">
                  <div className="text-[6px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{getText(t.solarYield, lang)}</div>
                  <div className="text-[11px] md:text-base font-black text-slate-800">{formatMoney(results.yield)} <span className="text-[7px] font-bold text-slate-400">kWh/kWp</span></div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-center md:rounded-2xl md:py-4">
                  <div className="text-[6px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{getText(t.neededRoofArea, lang)}</div>
                  <div className="text-[11px] md:text-base font-black text-slate-800">{formatMoney(results.area)} <span className="text-[7px] font-bold text-slate-400">m²</span></div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-center md:rounded-2xl md:py-4">
                  <div className="text-[6px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{getText(t.coverage, lang)}</div>
                  <div className="text-[11px] md:text-base font-black text-slate-800">{results.coverage}<span className="text-[7px] font-bold text-slate-400">%</span></div>
                </div>
              </div>

              {ABIF_NONRESIDENTIAL_CREDIT_ENABLED && financeSource === 'abif' && propertyType === 'business' && showCreditEstimate && (
                <AbifCreditEstimateCard
                  lang={lang}
                  estimate={abifCreditEstimate}
                  estimatedAnnualSavings={Number(results.yearly)}
                  whatsappHref={quoteHref}
                  whatsappTrackingContext={JSON.stringify(buildTrackingPayload('whatsapp'))}
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
                  data-analytics-placement="solar_calculator_quote"
                  data-whatsapp-interaction="calculator_quote"
                  data-whatsapp-language={lang}
                  data-whatsapp-context={JSON.stringify(buildTrackingPayload('whatsapp'))}
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
