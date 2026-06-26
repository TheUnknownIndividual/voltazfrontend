
import React, { useState, useMemo } from 'react';

interface CalculatorProps {
  lang: 'az' | 'en' | 'ru' | 'tr';
}

type Lang = CalculatorProps['lang'];
type LocalizedText = Record<Lang, string>;

const getText = (value: LocalizedText, lang: Lang) => value[lang] || value.az;

const PANEL_WATTAGE = 550;
const AREA_PER_PANEL = 2.5;
const AZERBAIJAN_AVERAGE_YIELD = 1350;

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

const extraDeviceAnnualKWh: Record<string, number> = {
  'ev-charger': 3000,
  pool: 2000,
  ac: 2500,
  heater: 1800,
  oven: 1200
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

const Calculator: React.FC<CalculatorProps> = ({ lang }) => {
  const [bill, setBill] = useState<number>(150);
  const [propertyType, setPropertyType] = useState<'home' | 'business'>('home');
  const [systemType, setSystemType] = useState<'on-grid' | 'off-grid'>('on-grid');
  const [savingTarget, setSavingTarget] = useState<number>(100);
  
  // New states
  const [city, setCity] = useState<string>('Bakı');
  const [roofArea, setRoofArea] = useState<string>('');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  const [maxRoofArea, setMaxRoofArea] = useState<string>('');
  const [tiltAngle, setTiltAngle] = useState<number>(35);
  const [orientation, setOrientation] = useState<number>(180);

  const cities = [
    'Bakı', 'Sumqayıt', 'Gəncə', 'Lənkəran', 'Şəki', 'Qəbələ', 'Şamaxı', 
    'Naxçıvan', 'Mingəçevir', 'Xırdalan', 'Şirvan', 'Quba', 'Qusar'
  ];

  const extraDevicesList: Array<{ id: string; label: LocalizedText }> = [
    { id: 'ev-charger', label: { az: 'Şarj stansiyası', en: 'EV charger', ru: 'Зарядная станция', tr: 'Şarj istasyonu' } },
    { id: 'pool', label: { az: 'Hovuz', en: 'Pool', ru: 'Бассейн', tr: 'Havuz' } },
    { id: 'ac', label: { az: 'Kondisioner', en: 'Air conditioner', ru: 'Кондиционер', tr: 'Klima' } },
    { id: 'heater', label: { az: 'Su qızdırıcısı', en: 'Water heater', ru: 'Водонагреватель', tr: 'Su ısıtıcı' } },
    { id: 'oven', label: { az: 'Elektrikli soba', en: 'Electric oven', ru: 'Электрическая печь', tr: 'Elektrikli fırın' } }
  ];

  const toggleDevice = (id: string) => {
    setSelectedDevices(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const results = useMemo(() => {
    const tariff = propertyType === 'home' ? 0.08 : 0.12;
    const annualConsumptionFromBill = (bill / tariff) * 12 * (savingTarget / 100);
    const extraConsumption = selectedDevices.reduce((total, device) => total + (extraDeviceAnnualKWh[device] || 0), 0);
    const offGridBuffer = systemType === 'off-grid' ? 1.15 : 1;
    const annualConsumption = (annualConsumptionFromBill + extraConsumption) * offGridBuffer;

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

    return {
      power: powerKWp.toFixed(1),
      panels,
      yearly: yearlySaving.toFixed(0),
      production: Math.round(annualProduction),
      area: Math.round(panels * AREA_PER_PANEL),
      yield: solarYield,
      coverage: Math.min(100, Math.round((annualProduction / annualConsumption) * 100)),
      limitedByRoof: Boolean(roofLimit && neededArea > roofLimit)
    };
  }, [bill, propertyType, savingTarget, selectedDevices, systemType, city, roofArea, isAdvancedOpen, maxRoofArea, tiltAngle, orientation]);

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
    extraDevices: { az: 'Əlavə yüksək sərfiyyatlı cihazlar', en: 'Extra high-consumption devices', ru: 'Дополнительные энергоемкие устройства', tr: 'Ek yüksek tüketimli cihazlar' },
    optional: { az: 'varsa seçin', en: 'select if any', ru: 'если есть, выберите', tr: 'varsa seçin' },
    monthlyBill: { az: 'Aylıq ödəniş', en: 'Monthly bill', ru: 'Ежемесячный счет', tr: 'Aylık fatura' },
    savingTarget: { az: 'Qənaət hədəfi', en: 'Saving target', ru: 'Цель экономии', tr: 'Tasarruf hedefi' },
    advanced: { az: 'Təkmilləşdirilmiş', en: 'Advanced', ru: 'Расширенные', tr: 'Gelişmiş' },
    maxRoofArea: { az: 'Maksimum dam sahəsi (m²)', en: 'Maximum roof area (m²)', ru: 'Максимальная площадь крыши (м²)', tr: 'Maksimum çatı alanı (m²)' },
    tiltAngle: { az: 'Meyl bucağı (°)', en: 'Tilt angle (°)', ru: 'Угол наклона (°)', tr: 'Eğim açısı (°)' },
    orientation: { az: 'İstiqamət (°)', en: 'Orientation (°)', ru: 'Ориентация (°)', tr: 'Yön (°)' },
    systemPower: { az: 'Sistem gücü', en: 'System power', ru: 'Мощность системы', tr: 'Sistem gücü' },
    panelCount: { az: 'Panel sayı', en: 'Panel count', ru: 'Количество панелей', tr: 'Panel sayısı' },
    yearlySaving: { az: 'İllik qənaət', en: 'Yearly saving', ru: 'Годовая экономия', tr: 'Yıllık tasarruf' },
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
    detailsTitle: { az: 'Seçilmiş məlumatlar:', en: 'Selected details:', ru: 'Выбранные данные:', tr: 'Seçilen bilgiler:' },
    notSelected: { az: 'Seçilməyib', en: 'Not selected', ru: 'Не выбрано', tr: 'Seçilmedi' },
    yes: { az: 'Bəli', en: 'Yes', ru: 'Да', tr: 'Evet' },
    no: { az: 'Xeyr', en: 'No', ru: 'Нет', tr: 'Hayır' },
    advancedMode: { az: 'Təkmilləşdirilmiş rejim', en: 'Advanced mode', ru: 'Расширенный режим', tr: 'Gelişmiş mod' },
    annualProduction: { az: 'İllik istehsal', en: 'Annual production', ru: 'Годовая выработка', tr: 'Yıllık üretim' },
    neededRoofArea: { az: 'Tələb olunan dam sahəsi', en: 'Required roof area', ru: 'Необходимая площадь крыши', tr: 'Gerekli çatı alanı' },
    solarYield: { az: 'Günəş göstəricisi', en: 'Solar yield', ru: 'Солнечная выработка', tr: 'Güneş verimi' },
    coverage: { az: 'Enerji əhatəsi', en: 'Energy coverage', ru: 'Покрытие энергии', tr: 'Enerji karşılama' },
    roofLimited: { az: 'Dam sahəsi limiti', en: 'Roof space limited', ru: 'Ограничение площади крыши', tr: 'Çatı alanı sınırı' }
  };

  const selectedDeviceLabels = selectedDevices.length
    ? selectedDevices
        .map((id) => extraDevicesList.find((device) => device.id === id))
        .filter(Boolean)
        .map((device) => getText(device!.label, lang))
        .join(', ')
    : getText(t.notSelected, lang);

  const messageRoofArea = roofArea.trim() ? `${roofArea.trim()} m²` : getText(t.notSelected, lang);
  const messageMaxRoofArea = isAdvancedOpen && maxRoofArea.trim() ? `${maxRoofArea.trim()} m²` : getText(t.notSelected, lang);
  const propertyLabel = propertyType === 'home' ? getText(t.residential, lang) : getText(t.commercial, lang);
  const systemLabel = systemType === 'on-grid' ? getText(t.onGrid, lang) : getText(t.offGrid, lang);
  const quoteDetails = [
    `${getText(t.city, lang)}: ${city}`,
    `${getText(t.roofArea, lang)}: ${messageRoofArea}`,
    `${getText(t.extraDevices, lang)}: ${selectedDeviceLabels}`,
    `${getText(t.monthlyBill, lang)}: ${bill} AZN`,
    `${getText(t.savingTarget, lang)}: ${savingTarget}%`,
    `${getText(t.propertyType, lang)}: ${propertyLabel}`,
    `${getText(t.systemType, lang)}: ${systemLabel}`,
    `${getText(t.advancedMode, lang)}: ${isAdvancedOpen ? getText(t.yes, lang) : getText(t.no, lang)}`,
    `${getText(t.maxRoofArea, lang)}: ${messageMaxRoofArea}`,
    `${getText(t.tiltAngle, lang)}: ${isAdvancedOpen ? `${tiltAngle}°` : getText(t.notSelected, lang)}`,
    `${getText(t.orientation, lang)}: ${isAdvancedOpen ? `${orientation}°` : getText(t.notSelected, lang)}`,
    `${getText(t.systemPower, lang)}: ${results.power} kVt`,
    `${getText(t.panelCount, lang)}: ${results.panels} ${getText(t.pieces, lang)}`,
    `${getText(t.yearlySaving, lang)}: ${results.yearly} AZN`,
    `${getText(t.annualProduction, lang)}: ${results.production} kWh`,
    `${getText(t.neededRoofArea, lang)}: ${results.area} m²`,
    `${getText(t.solarYield, lang)}: ${results.yield} kWh/kWp/year`,
    `${getText(t.coverage, lang)}: ${results.coverage}%`,
    `${getText(t.roofLimited, lang)}: ${results.limitedByRoof ? getText(t.yes, lang) : getText(t.no, lang)}`
  ].join('\n');

  const quoteHref = `https://wa.me/994504180001?text=${encodeURIComponent(
    `${getText(t.quoteMessage, lang)}\n\n${getText(t.detailsTitle, lang)}\n${quoteDetails}`
  )}`;

  return (
    <section id="calculator" className="py-12 md:py-24 bg-[var(--color-surface)] overflow-hidden relative">
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-stretch">
          
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6 md:space-y-8">
            <header className="text-left">
              <h2 className="text-[var(--color-primary)] font-bold tracking-[0.2em] uppercase mb-1 md:mb-2 text-[9px] md:text-[10px]">{getText(t.eyebrow, lang)}</h2>
              <h3 className="text-2xl md:text-5xl font-black text-slate-900 leading-tight mb-3 md:mb-4">{getText(t.title, lang)}</h3>
              <p className="text-slate-500 text-[10px] md:text-sm leading-relaxed max-w-sm">{getText(t.subtitle, lang)}</p>
            </header>
            
            <div className="grid gap-3">
              {t.steps[lang].map((item, idx) => (
                <div key={idx} className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-sm flex gap-4 items-center group transition-all hover:bg-white">
                  <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-[var(--color-dark)] flex items-center justify-center text-xs font-black">{idx + 1}</div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-800 uppercase leading-none mb-1">{item.t}</h4>
                    <p className="text-[10px] text-slate-400 font-medium leading-tight">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="h-full bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-slate-100 p-6 md:p-10">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button onClick={() => setPropertyType('home')} className={`py-3 md:py-3.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all ${propertyType === 'home' ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-dark)] shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{getText(t.residential, lang)}</button>
                <button onClick={() => setPropertyType('business')} className={`py-3 md:py-3.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all ${propertyType === 'business' ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-dark)] shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{getText(t.commercial, lang)}</button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => setSystemType('on-grid')} 
                  className={`py-3 md:py-3.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all ${systemType === 'on-grid' ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-dark)] shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                >
                  {getText(t.onGrid, lang)} <span className={`normal-case font-medium ml-1 ${systemType === 'on-grid' ? 'text-[var(--color-dark)] opacity-75' : 'text-slate-400 opacity-60'}`}>({getText(t.onGridNote, lang)})</span>
                </button>
                <button 
                  onClick={() => setSystemType('off-grid')} 
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
                    onChange={(e) => setCity(e.target.value)}
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
                    onChange={(e) => setRoofArea(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3">
                    {getText(t.extraDevices, lang)} <span className="text-slate-400 normal-case font-medium ml-1">({getText(t.optional, lang)})</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {extraDevicesList.map(device => (
                      <button
                        key={device.id}
                        type="button"
                        onClick={() => toggleDevice(device.id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${
                          selectedDevices.includes(device.id)
                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-dark)] shadow-md'
                            : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-[var(--color-primary)]'
                        }`}
                      >
                        {getText(device.label, lang)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8 md:space-y-10 mb-8">
                <div>
                  <div className="flex justify-between items-center mb-3 md:mb-4">
                    <label className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest">{getText(t.monthlyBill, lang)}</label>
                    <span className="text-lg md:text-xl font-black text-[var(--color-primary)]">{bill} AZN</span>
                  </div>
                  <input type="range" min="30" max="2000" step="10" value={bill} onChange={(e) => setBill(parseInt(e.target.value))} className="w-full h-1.5 md:h-2 bg-slate-100 rounded-full appearance-none accent-[var(--color-primary)] cursor-pointer" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3 md:mb-4">
                    <label className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest">{getText(t.savingTarget, lang)}</label>
                    <span className="text-lg md:text-xl font-black text-[var(--color-primary)]">{savingTarget}%</span>
                  </div>
                  <input type="range" min="10" max="100" step="5" value={savingTarget} onChange={(e) => setSavingTarget(parseInt(e.target.value))} className="w-full h-1.5 md:h-2 bg-slate-100 rounded-full appearance-none accent-[var(--color-primary)] cursor-pointer" />
                </div>
              </div>

              <div className="mb-8 flex justify-center">
                <button 
                  type="button"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className={`group flex items-center gap-3 px-8 py-3 rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] transition-all border-2 ${
                    isAdvancedOpen 
                      ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-dark)] shadow-xl scale-105' 
                      : 'bg-white border-[var(--color-primary)] text-[var(--color-dark)] hover:border-[var(--color-primary)] hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  <span className="relative">
                    {getText(t.advanced, lang)}
                  </span>
                  <svg className={`w-4 h-4 transition-transform duration-500 ${isAdvancedOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {isAdvancedOpen && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-8 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">{getText(t.maxRoofArea, lang)}</label>
                      <input 
                        type="number" 
                        value={maxRoofArea}
                        onChange={(e) => setMaxRoofArea(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">{getText(t.tiltAngle, lang)}</label>
                      <input 
                        type="number" 
                        value={tiltAngle}
                        onChange={(e) => setTiltAngle(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">{getText(t.orientation, lang)}</label>
                      <input 
                        type="number" 
                        value={orientation}
                        onChange={(e) => setOrientation(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                      />
                    </div>
                  </div>
                )}

              <div className="bg-[var(--color-dark)] rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 text-white">
                <div className="grid grid-cols-3 gap-1 md:gap-8 text-center items-center">
                  <div>
                    <div className="text-[6px] md:text-[8px] font-black text-[var(--color-primary)] opacity-60 uppercase tracking-widest mb-0.5">{getText(t.systemPower, lang)}</div>
                    <div className="text-xs md:text-2xl font-black">{results.power} <span className="text-[7px] opacity-40">kVt</span></div>
                  </div>
                  <div>
                    <div className="text-[6px] md:text-[8px] font-black text-[var(--color-primary)] opacity-60 uppercase tracking-widest mb-0.5">{getText(t.panelCount, lang)}</div>
                    <div className="text-xs md:text-2xl font-black">{results.panels} <span className="text-[7px] opacity-40">{getText(t.pieces, lang)}</span></div>
                  </div>
                  <div className="bg-white/10 rounded-xl md:rounded-2xl py-2 md:py-4 px-1 md:px-6 border border-white/10">
                    <div className="text-[6px] md:text-[8px] font-black text-[var(--color-primary)] uppercase tracking-widest mb-0.5">{getText(t.yearlySaving, lang)}</div>
                    <div className="text-sm md:text-3xl font-black text-[var(--color-primary)]">{results.yearly} <span className="text-[7px] md:text-sm">AZN</span></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-[var(--color-primary)] bg-[var(--color-surface)] p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h4 className="text-base md:text-lg font-black text-[var(--color-dark)] leading-tight">{getText(t.quoteTitle, lang)}</h4>
                  <p className="text-xs md:text-sm text-slate-500 font-medium mt-1 max-w-md">{getText(t.quoteDesc, lang)}</p>
                </div>
                <a
                  href={quoteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl bg-[var(--color-primary)] px-6 py-3 text-[10px] md:text-xs font-black uppercase tracking-widest text-[var(--color-dark)] shadow-lg shadow-slate-900/5 transition-all hover:-translate-y-0.5 hover:bg-[var(--color-accent)]"
                >
                  {getText(t.quoteButton, lang)}
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
