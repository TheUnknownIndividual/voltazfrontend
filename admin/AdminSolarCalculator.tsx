import React, { useEffect, useMemo, useState } from 'react';
import { Download, FileText, Plus, Trash2 } from 'lucide-react';
import { buildInitialAssessmentDocx, formatPaybackPeriod, type SolarSystemType } from '../utils/docxTemplate';
import { useAuth } from '../contexts/AuthContext';
import { issueAdminDocxExport, logAdminPdfExport, searchSolarProjects, type SolarProjectOption } from '../api/solarAnalytics';
import { getSolarInverters, type SolarInverterOption } from '../api/solarInverters';
import { addAdminTrackedProjectAttachment, getAdminTrackedProjects, type TrackedProject } from '../api/adminProjectTracker';
import { useUpload } from '../contexts/UploadContext';

type CalculationMethod = 'consumption' | 'system' | 'bill';
type ConsumptionPeriod = 'daily' | 'monthly' | 'yearly';
type MountType = 'roof' | 'ground';
type CustomerType = 'residential' | 'nonResidential';
type ConnectionPhase = 'single' | 'three';
type InverterSelectionMode = 'best' | 'second' | 'manual';
type ProposalStatus =
  | 'preliminary'
  | 'siteSurvey'
  | 'engineeringReview'
  | 'engineerConfirmed'
  | 'sent'
  | 'contracted';
type Lang = 'az' | 'en' | 'ru' | 'tr';

const normalizeProjectLinkName = (value: string) => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('az-AZ');

interface CitySolarProfile {
  city: string;
  specificYield: number;
  region: string;
}

interface InverterRecommendation extends SolarInverterOption {
  quantity: number;
  totalDcKw: number;
  totalNominalAcKw: number;
  totalMaxDcKw: number;
  dcAcRatio: number;
  isPreliminary: boolean;
  hasStock: boolean;
  compatibilityNote: string;
}

interface CalculationResult {
  methodLabel: string;
  city: CitySolarProfile;
  yearlyKWh: number;
  requiredKw: number;
  systemKw: number;
  panelCount: number;
  dailyProduction: number;
  monthlyProduction: number;
  yearlyProduction: number;
  estimatedCost: number;
  mountLabel: string;
  pricePerKw: number;
  customerType: CustomerType;
  tariff: number;
  designBuffer: number;
  roofArea: number;
  targetOffset: number;
  panelWattage: number;
  panelKw: number;
  baseSystemCost: number;
  boqAdditionsCost: number;
  vatAzn: number;
  totalPriceAzn: number;
  annualSavings: number;
  paybackYears: number;
  inverter: InverterRecommendation | null;
  secondBestInverter: InverterRecommendation | null;
  connectionPhase: ConnectionPhase;
}

interface CustomBoqItem {
  id: string;
  name: string;
  spec: string;
  unit: string;
  quantity: string;
  priceAzn: string;
}

const DEFAULT_PANEL_WATTAGE = 650;
const PANEL_WIDTH_METERS = 1.134;
const PANEL_HEIGHT_METERS = 2.382;
const PANEL_AREA = PANEL_WIDTH_METERS * PANEL_HEIGHT_METERS;
const DESIGN_BUFFER = 1.05;
const RESIDENTIAL_HIGH_CONSUMPTION_TARIFF = 0.15;
const DEFAULT_COMMERCIAL_TARIFF = 0.125;
const VAT_RATE = 0.18;
const ROOF_PRICE_PER_KW = 850;
const GROUND_PRICE_PER_KW = 1105;
const DEFAULT_PANEL_MODEL = 'LONGi LR7-72HVHF-650M günəş paneli';
const SOLAR_CALCULATOR_DRAFT_KEY = 'volt-admin-solar-calculator-draft';
const MIN_RECOMMENDED_DC_AC_RATIO = 1.1;
const MAX_RECOMMENDED_DC_AC_RATIO = 1.25;
const TARGET_DC_AC_RATIO = (MIN_RECOMMENDED_DC_AC_RATIO + MAX_RECOMMENDED_DC_AC_RATIO) / 2;
const documentTypeOptions = [
  { code: 'CP', label: 'Kommersiya Təklifi' },
  { code: 'QUO', label: 'Qiymət Təklifi' },
  { code: 'INV', label: 'Hesab-faktura' },
  { code: 'PI', label: 'Proforma Invoice' },
  { code: 'CTR', label: 'Müqavilə' },
  { code: 'AGR', label: 'Razılaşma' },
  { code: 'PO', label: 'Satınalma Sifarişi' },
  { code: 'SO', label: 'Satış Sifarişi' },
  { code: 'BOQ', label: 'Bill of Quantities' },
  { code: 'PRJ', label: 'Layihə' },
  { code: 'DRW', label: 'Çertyoj / Layihə Rəsmi' },
  { code: 'REP', label: 'Hesabat' },
  { code: 'ACT', label: 'Təhvil-Təslim Aktı' },
  { code: 'LET', label: 'Rəsmi Məktub' },
  { code: 'MEM', label: 'Xidmət Qeydi' },
  { code: 'SPEC', label: 'Texniki Spesifikasiya' },
  { code: 'CAL', label: 'Hesablama' }
] as const;

const cityProfiles: CitySolarProfile[] = [
  { city: 'Bakı', specificYield: 1620, region: 'Abşeron' },
  { city: 'Sumqayıt', specificYield: 1615, region: 'Abşeron' },
  { city: 'Xırdalan', specificYield: 1615, region: 'Abşeron' },
  { city: 'Şamaxı', specificYield: 1585, region: 'Dağlıq Şirvan' },
  { city: 'Qobustan', specificYield: 1685, region: 'Dağlıq Şirvan' },
  { city: 'Gəncə', specificYield: 1540, region: 'Qərb' },
  { city: 'Mingəçevir', specificYield: 1600, region: 'Aran' },
  { city: 'Yevlax', specificYield: 1600, region: 'Aran' },
  { city: 'Şirvan', specificYield: 1690, region: 'Aran' },
  { city: 'Salyan', specificYield: 1690, region: 'Aran' },
  { city: 'Neftçala', specificYield: 1660, region: 'Aran' },
  { city: 'Lənkəran', specificYield: 1415, region: 'Cənub' },
  { city: 'Astara', specificYield: 1385, region: 'Cənub' },
  { city: 'Masallı', specificYield: 1440, region: 'Cənub' },
  { city: 'Quba', specificYield: 1490, region: 'Şimal' },
  { city: 'Qusar', specificYield: 1460, region: 'Şimal' },
  { city: 'Xaçmaz', specificYield: 1505, region: 'Şimal' },
  { city: 'Şəki', specificYield: 1480, region: 'Şimal-qərb' },
  { city: 'Zaqatala', specificYield: 1440, region: 'Şimal-qərb' },
  { city: 'Qəbələ', specificYield: 1480, region: 'Şimal-qərb' },
  { city: 'İsmayıllı', specificYield: 1525, region: 'Dağlıq Şirvan' },
  { city: 'Naxçıvan', specificYield: 1825, region: 'Naxçıvan' },
  { city: 'Şərur', specificYield: 1825, region: 'Naxçıvan' },
  { city: 'Culfa', specificYield: 1875, region: 'Naxçıvan' },
  { city: 'Ordubad', specificYield: 1825, region: 'Naxçıvan' },
  { city: 'Ağdam', specificYield: 1660, region: 'Qarabağ' },
  { city: 'Füzuli', specificYield: 1660, region: 'Qarabağ' },
  { city: 'Şuşa', specificYield: 1525, region: 'Qarabağ' },
  { city: 'Laçın', specificYield: 1475, region: 'Qarabağ' },
  { city: 'Kəlbəcər', specificYield: 1475, region: 'Qarabağ' }
];

const methodLabels: Record<Lang, Record<CalculationMethod, string>> = {
  az: { consumption: 'Sərfiyyata görə', system: 'Hazır sistem gücünə görə', bill: 'Aylıq ödənişə görə' },
  en: { consumption: 'By consumption', system: 'By system size', bill: 'By monthly bill' },
  ru: { consumption: 'По потреблению', system: 'По мощности системы', bill: 'По ежемесячному счету' },
  tr: { consumption: 'Tüketime göre', system: 'Sistem gücüne göre', bill: 'Aylık faturaya göre' }
};

const periodLabels: Record<Lang, Record<ConsumptionPeriod, string>> = {
  az: { daily: 'Gündəlik kWh', monthly: 'Aylıq kWh', yearly: 'İllik kWh' },
  en: { daily: 'Daily kWh', monthly: 'Monthly kWh', yearly: 'Yearly kWh' },
  ru: { daily: 'кВт⋅ч в день', monthly: 'кВт⋅ч в месяц', yearly: 'кВт⋅ч в год' },
  tr: { daily: 'Günlük kWh', monthly: 'Aylık kWh', yearly: 'Yıllık kWh' }
};

const ui: Record<Lang, Record<string, string>> = {
  az: {
    eyebrow: 'Satış kalkulyatoru',
    title: 'Admin solar hesablaması',
    subtitle: 'Şəhər, sərfiyyat və montaj növünə görə sistem gücünü, qiyməti və istifadə olunan formulaları görün.',
    download: 'PDF təqdimatı yüklə',
    initialAssessmentDownload: 'İlkin Qiymətləndirməni Yüklə',
    downloadingDocx: 'Hazırlanır...',
    documentSettings: 'İlkin qiymətləndirmə sənədi',
    systemType: 'Sistem növü',
    address: 'Ünvan',
    recipient: 'Kimə',
    panelWattage: 'Panel gücü (W)',
    annualSavings: 'İllik qənaət (AZN)',
    installationDays: 'Quraşdırma müddəti (gün)',
    inverterCount: 'İnverter sayı',
    boqDetails: 'BOQ məhsul məlumatları',
    boqAdditions: 'BOQ əlavələri',
    includesAdv: 'ƏDV (18%) əlavə et',
    advIncludedNote: 'ƏDV qiymətə və özünü ödəmə müddətinə daxildir.',
    advExcludedNote: 'ƏDV qiymətə və özünü ödəmə müddətinə daxil deyil.',
    vatAmount: 'ƏDV (18%)',
    totalPrice: 'Yekun qiymət',
    boqItemName: 'Məhsul / xidmət adı',
    boqItemSpec: 'Xüsusiyyət / qeyd',
    boqItemUnit: 'Ölçü vahidi',
    boqItemQuantity: 'Sayı',
    boqItemPrice: 'Vahid qiymət (AZN)',
    addBoqItem: 'Əlavə et',
    deleteBoqItem: 'Sil',
    boqAdditionsTotal: 'BOQ əlavələri',
    panelModel: 'Panel modeli',
    panelSpec: 'Panel xüsusiyyəti',
    inverterModel: 'İnverter modeli',
    inverterSpec: 'İnverter xüsusiyyəti',
    method: 'Hesablama üsulu',
    customerType: 'Abonent növü',
    residential: 'Əhali',
    nonResidential: 'Qeyri-əhali',
    city: 'Şəhər',
    mountType: 'Montaj növü',
    roofMount: 'Dam montajı',
    groundMount: 'Torpaq montajı',
    consumption: 'Sərfiyyat',
    period: 'Period',
    monthlyBill: 'Aylıq ödəniş',
    tariff: 'Qeyri-əhali tarifi (AZN/kWh)',
    systemInput: 'Daxil edilən sistem gücü (kW)',
    offset: 'Ödəniləcək enerji hədəfi',
    sunHours: 'İllik regional istehsal əmsalı',
    sunHourUnit: 'kWh/kWp/il',
    sunNote: 'üçün sabit damüstü sistemlərə əsaslanan ilkin mühəndislik əmsalı. Sahə üzrə PVGIS yoxlaması ayrıca aparılmalıdır.',
    systemPower: 'Sistem gücü',
    estimatedPrice: 'Təxmini qiymət',
    priceFormula: 'Hesablama',
    systemPowerNote: 'Tələb olunan güc',
    paybackFormula: 'Yekun qiymət ÷ İllik qənaət',
    yearlyProduction: 'İllik istehsal',
    requiredArea: 'Tələb olunan sahə',
    pieces650: 'ədəd 650W panel',
    monthlyProduction: 'kWh/ay',
    areaNote: 'm²/panel əsasında',
    formulas: 'Formulalar',
    formulaTitle: 'Hesablama izahı',
    salesNote: 'Satış qeydi',
    yearlyInput: 'İllik kWh girişi',
    rawRequirement: 'Xam tələb',
    dailyProduction: 'Orta gündəlik istehsal',
    designBuffer: 'Dizayn buferi',
    connectionPhase: 'Qoşulma növü',
    singlePhase: 'Bir faza',
    threePhase: 'Üç faza',
    actualDcPower: 'Faktiki DC güc',
    panelCount: 'Panel sayı',
    recommendedInverter: 'Ən yaxşı tövsiyə olunan inverter',
    secondBestInverter: 'İkinci ən yaxşı inverter seçimi',
    selectedForDocument: 'DOCX və BOQ üçün seçilib',
    manualOverride: 'Manual inverter seçimi',
    manualOverrideNote: 'Modeli, sayı və texniki qeydi özünüz daxil edin.',
    manualCollapse: 'Manual seçimi bağla',
    manualRequired: 'Manual seçim üçün inverter modeli və sayı məcburidir.',
    manualReview: 'Manual seçim avtomatik mühəndislik limitləri ilə yoxlanılmır və ayrıca təsdiq tələb edir.',
    inverterWarranty: 'İnverter zəmanəti',
    panelWarranty: 'Panel zəmanəti',
    payback: 'Özünü ödəmə',
    azExclusion: 'Azərişıq prosedurları daxil deyil',
    preliminaryMark: 'İnverter modeli mühəndis yoxlamasından sonra yekun təsdiqlənməlidir.',
    fullSystemPrice: 'Montajla birlikdə tam günəş sistemi dəyəri',
    proposalStatus: 'Təklif statusu',
    preliminary: 'İlkin hesab',
    siteSurvey: 'Obyekt yoxlanışı tələb olunur',
    engineeringReview: 'Mühəndis yoxlamasında',
    engineerConfirmed: 'Mühəndis təsdiqləyib',
    sent: 'Kommersiya təklifi göndərildi',
    contracted: 'Müqavilə bağlandı',
    managerStatusNote: 'Menecer yalnız ilkin təklifi formalaşdırır. Mühəndis təsdiqi mühəndis və ya admin tərəfindən seçilməlidir.',
    manufacturerWarrantyNote: 'Avadanlıq zəmanəti istehsalçı şərtlərinə əsasən verilir və SOLARIX montaj zəmanətindən ayrıdır.',
    connectionWarning: 'Son qoşulma imkanı və icazə verilən güc Azərişıq tərəfindən obyekt sənədləri, mövcud elektrik sxemi və texniki şərtlər əsasında müəyyən edilir.',
    customerDocsNote: 'Aktiv istehlakçı sənədləri, texniki şərtlər və Azərişıq prosedurları bu təklifin qiymətinə daxil deyil və sifarişçi tərəfindən təmin edilməlidir.',
    years: 'il',
    months: 'ay'
  },
  en: {
    eyebrow: 'Sales calculator',
    title: 'Admin solar calculation',
    subtitle: 'See system size, price, and formulas by city, consumption, and mounting type.',
    download: 'Download PDF proposal',
    initialAssessmentDownload: 'Download Initial Assessment',
    downloadingDocx: 'Preparing...',
    documentSettings: 'Initial assessment document',
    systemType: 'System type',
    address: 'Address',
    recipient: 'Recipient',
    panelWattage: 'Panel wattage (W)',
    annualSavings: 'Annual savings (AZN)',
    installationDays: 'Installation days',
    inverterCount: 'Inverter count',
    boqDetails: 'BOQ product details',
    boqAdditions: 'BOQ additions',
    includesAdv: 'Add VAT (18%)',
    advIncludedNote: 'VAT is included in the price and payback period.',
    advExcludedNote: 'VAT is excluded from the price and payback period.',
    vatAmount: 'VAT (18%)',
    totalPrice: 'Total price',
    boqItemName: 'Product / service name',
    boqItemSpec: 'Specification / note',
    boqItemUnit: 'Unit',
    boqItemQuantity: 'Quantity',
    boqItemPrice: 'Unit price (AZN)',
    addBoqItem: 'Add item',
    deleteBoqItem: 'Delete',
    boqAdditionsTotal: 'BOQ additions',
    panelModel: 'Panel model',
    panelSpec: 'Panel specification',
    inverterModel: 'Inverter model',
    inverterSpec: 'Inverter specification',
    method: 'Calculation method',
    customerType: 'Subscriber type',
    residential: 'Residential',
    nonResidential: 'Non-residential',
    city: 'City',
    mountType: 'Mount type',
    roofMount: 'Roof mount',
    groundMount: 'Ground mount',
    consumption: 'Consumption',
    period: 'Period',
    monthlyBill: 'Monthly bill',
    tariff: 'Non-residential tariff (AZN/kWh)',
    systemInput: 'Entered system size (kW)',
    offset: 'Energy offset target',
    sunHours: 'Annual regional yield',
    sunHourUnit: 'kWh/kWp/year',
    sunNote: 'pre-feasibility coefficient for fixed rooftop systems. Site-specific PVGIS verification should be done separately.',
    systemPower: 'System power',
    estimatedPrice: 'Estimated price',
    priceFormula: 'Calculation',
    systemPowerNote: 'Required power',
    paybackFormula: 'Total price ÷ Annual savings',
    yearlyProduction: 'Annual production',
    requiredArea: 'Required area',
    pieces650: '650W panels',
    monthlyProduction: 'kWh/month',
    areaNote: 'based on m²/panel',
    formulas: 'Formulas',
    formulaTitle: 'Calculation explanation',
    salesNote: 'Sales note',
    yearlyInput: 'Annual kWh input',
    rawRequirement: 'Raw requirement',
    dailyProduction: 'Average daily production',
    designBuffer: 'Design buffer',
    connectionPhase: 'Connection type',
    singlePhase: 'Single-phase',
    threePhase: 'Three-phase',
    actualDcPower: 'Actual DC power',
    panelCount: 'Panel count',
    recommendedInverter: 'Best recommended inverter',
    secondBestInverter: 'Second best inverter option',
    selectedForDocument: 'Selected for DOCX and BOQ',
    manualOverride: 'Manual inverter override',
    manualOverrideNote: 'Enter the model, quantity, and technical note yourself.',
    manualCollapse: 'Collapse manual selection',
    manualRequired: 'Inverter model and quantity are required for a manual selection.',
    manualReview: 'A manual selection is not automatically validated against engineering limits and requires separate approval.',
    inverterWarranty: 'Inverter warranty',
    panelWarranty: 'Panel warranty',
    payback: 'Payback',
    azExclusion: 'Azərişıq procedures excluded',
    preliminaryMark: 'The inverter model is a preliminary recommendation and must be confirmed after engineering review.',
    fullSystemPrice: 'Full solar system cost with installation',
    proposalStatus: 'Proposal status',
    preliminary: 'Preliminary calculation',
    siteSurvey: 'Site survey required',
    engineeringReview: 'Engineering review',
    engineerConfirmed: 'Engineer confirmed',
    sent: 'Commercial proposal sent',
    contracted: 'Contract signed',
    managerStatusNote: 'A manager forms only the preliminary proposal. Engineer confirmation must be selected by an engineer or admin.',
    manufacturerWarrantyNote: 'Equipment warranty is provided by the manufacturer and is separate from the SOLARIX workmanship warranty.',
    connectionWarning: 'Final connection possibility and permitted station capacity are determined by Azərişıq based on object documents, existing power-supply scheme, and technical conditions.',
    customerDocsNote: 'Active-consumer documents, technical conditions, and Azərişıq procedures are excluded from this proposal price and must be provided by the customer.',
    years: 'years',
    months: 'months'
  },
  ru: {
    eyebrow: 'Калькулятор продаж',
    title: 'Админ solar расчет',
    subtitle: 'Расчет мощности, цены и формул по городу, потреблению и типу монтажа.',
    download: 'Скачать PDF предложение',
    initialAssessmentDownload: 'Скачать первичную оценку',
    downloadingDocx: 'Подготовка...',
    documentSettings: 'Документ первичной оценки',
    systemType: 'Тип системы',
    address: 'Адрес',
    recipient: 'Получатель',
    panelWattage: 'Мощность панели (W)',
    annualSavings: 'Годовая экономия (AZN)',
    installationDays: 'Дни монтажа',
    inverterCount: 'Количество инверторов',
    boqDetails: 'Данные BOQ',
    boqAdditions: 'Дополнения BOQ',
    includesAdv: 'Добавить НДС (18%)',
    advIncludedNote: 'НДС включён в цену и срок окупаемости.',
    advExcludedNote: 'НДС не включён в цену и срок окупаемости.',
    vatAmount: 'НДС (18%)',
    totalPrice: 'Итоговая цена',
    boqItemName: 'Товар / услуга',
    boqItemSpec: 'Характеристика / примечание',
    boqItemUnit: 'Ед. изм.',
    boqItemQuantity: 'Количество',
    boqItemPrice: 'Цена за ед. (AZN)',
    addBoqItem: 'Добавить',
    deleteBoqItem: 'Удалить',
    boqAdditionsTotal: 'Дополнения BOQ',
    panelModel: 'Модель панели',
    panelSpec: 'Характеристика панели',
    inverterModel: 'Модель инвертора',
    inverterSpec: 'Характеристика инвертора',
    method: 'Метод расчета',
    customerType: 'Тип абонента',
    residential: 'Население',
    nonResidential: 'Не население',
    city: 'Город',
    mountType: 'Тип монтажа',
    roofMount: 'Монтаж на крыше',
    groundMount: 'Наземный монтаж',
    consumption: 'Потребление',
    period: 'Период',
    monthlyBill: 'Ежемесячный счет',
    tariff: 'Нежилой тариф (AZN/kWh)',
    systemInput: 'Введенная мощность системы (kW)',
    offset: 'Цель покрытия энергии',
    sunHours: 'Годовой региональный коэффициент',
    sunHourUnit: 'kWh/kWp/year',
    sunNote: 'предварительный коэффициент для фиксированных крышных систем. Для объекта нужна отдельная проверка PVGIS.',
    systemPower: 'Мощность системы',
    estimatedPrice: 'Ориентировочная цена',
    priceFormula: 'Расчёт',
    systemPowerNote: 'Требуемая мощность',
    paybackFormula: 'Итоговая цена ÷ Годовая экономия',
    yearlyProduction: 'Годовая выработка',
    requiredArea: 'Необходимая площадь',
    pieces650: 'панелей 650W',
    monthlyProduction: 'kWh/месяц',
    areaNote: 'на основе m²/панель',
    formulas: 'Формулы',
    formulaTitle: 'Пояснение расчета',
    salesNote: 'Заметка для продаж',
    yearlyInput: 'Годовой ввод kWh',
    rawRequirement: 'Исходная потребность',
    dailyProduction: 'Средняя дневная выработка',
    designBuffer: 'Буфер проектирования',
    connectionPhase: 'Тип подключения',
    singlePhase: 'Однофазное',
    threePhase: 'Трёхфазное',
    actualDcPower: 'Фактическая DC-мощность',
    panelCount: 'Количество панелей',
    recommendedInverter: 'Лучший рекомендуемый инвертор',
    secondBestInverter: 'Второй лучший вариант инвертора',
    selectedForDocument: 'Выбрано для DOCX и BOQ',
    manualOverride: 'Ручной выбор инвертора',
    manualOverrideNote: 'Введите модель, количество и техническое примечание.',
    manualCollapse: 'Свернуть ручной выбор',
    manualRequired: 'Для ручного выбора обязательны модель и количество инверторов.',
    manualReview: 'Ручной выбор автоматически не проверяется по инженерным ограничениям и требует отдельного подтверждения.',
    inverterWarranty: 'Гарантия на инвертор',
    panelWarranty: 'Гарантия на панели',
    payback: 'Окупаемость',
    azExclusion: 'Процедуры Azərişıq не включены',
    preliminaryMark: 'Модель инвертора является предварительно рекомендованной и подлежит окончательному подтверждению после инженерной проверки объекта.',
    fullSystemPrice: 'Полная стоимость солнечной системы с монтажом',
    proposalStatus: 'Статус предложения',
    preliminary: 'Предварительный расчёт',
    siteSurvey: 'Требуется обследование',
    engineeringReview: 'На инженерной проверке',
    engineerConfirmed: 'Инженерно подтверждено',
    sent: 'Коммерческое предложение отправлено',
    contracted: 'Договор заключён',
    managerStatusNote: 'Менеджер самостоятельно формирует только предварительное предложение. Инженерное подтверждение выбирает инженер или администратор.',
    manufacturerWarrantyNote: 'Гарантия на оборудование предоставляется производителем и отделяется от гарантии SOLARIX на монтажные работы.',
    connectionWarning: 'Окончательная возможность подключения и допустимая мощность солнечной электростанции определяются Azərişıq на основании документов объекта, существующей схемы электроснабжения и технических условий.',
    customerDocsNote: 'Документы, технические условия и процедуры Azərişıq не входят в стоимость предложения и должны быть предоставлены заказчиком.',
    years: 'лет',
    months: 'мес.'
  },
  tr: {
    eyebrow: 'Satış hesaplayıcı',
    title: 'Admin solar hesabı',
    subtitle: 'Şehir, tüketim ve montaj tipine göre sistem gücünü, fiyatı ve formülleri görün.',
    download: 'PDF teklifini indir',
    initialAssessmentDownload: 'İlk Değerlendirmeyi İndir',
    downloadingDocx: 'Hazırlanıyor...',
    documentSettings: 'İlk değerlendirme belgesi',
    systemType: 'Sistem tipi',
    address: 'Adres',
    recipient: 'Alıcı',
    panelWattage: 'Panel gücü (W)',
    annualSavings: 'Yıllık tasarruf (AZN)',
    installationDays: 'Kurulum günü',
    inverterCount: 'İnverter adedi',
    boqDetails: 'BOQ ürün bilgileri',
    boqAdditions: 'BOQ eklemeleri',
    includesAdv: 'KDV (%18) ekle',
    advIncludedNote: 'KDV fiyata ve geri ödeme süresine dahildir.',
    advExcludedNote: 'KDV fiyata ve geri ödeme süresine dahil değildir.',
    vatAmount: 'KDV (%18)',
    totalPrice: 'Toplam fiyat',
    boqItemName: 'Ürün / hizmet adı',
    boqItemSpec: 'Özellik / not',
    boqItemUnit: 'Birim',
    boqItemQuantity: 'Adet',
    boqItemPrice: 'Birim fiyat (AZN)',
    addBoqItem: 'Ekle',
    deleteBoqItem: 'Sil',
    boqAdditionsTotal: 'BOQ eklemeleri',
    panelModel: 'Panel modeli',
    panelSpec: 'Panel özelliği',
    inverterModel: 'İnverter modeli',
    inverterSpec: 'İnverter özelliği',
    method: 'Hesaplama yöntemi',
    customerType: 'Abone tipi',
    residential: 'Konut',
    nonResidential: 'Konut dışı',
    city: 'Şehir',
    mountType: 'Montaj tipi',
    roofMount: 'Çatı montajı',
    groundMount: 'Zemin montajı',
    consumption: 'Tüketim',
    period: 'Periyot',
    monthlyBill: 'Aylık fatura',
    tariff: 'Konut dışı tarife (AZN/kWh)',
    systemInput: 'Girilen sistem gücü (kW)',
    offset: 'Enerji karşılama hedefi',
    sunHours: 'Yıllık bölgesel üretim katsayısı',
    sunHourUnit: 'kWh/kWp/yıl',
    sunNote: 'sabit çatı sistemleri için ön fizibilite katsayısı. Sahaya özel PVGIS kontrolü ayrıca yapılmalıdır.',
    systemPower: 'Sistem gücü',
    estimatedPrice: 'Tahmini fiyat',
    priceFormula: 'Hesaplama',
    systemPowerNote: 'Gerekli güç',
    paybackFormula: 'Toplam fiyat ÷ Yıllık tasarruf',
    yearlyProduction: 'Yıllık üretim',
    requiredArea: 'Gerekli alan',
    pieces650: 'adet 650W panel',
    monthlyProduction: 'kWh/ay',
    areaNote: 'm²/panel bazında',
    formulas: 'Formüller',
    formulaTitle: 'Hesaplama açıklaması',
    salesNote: 'Satış notu',
    yearlyInput: 'Yıllık kWh girişi',
    rawRequirement: 'Ham ihtiyaç',
    dailyProduction: 'Ortalama günlük üretim',
    designBuffer: 'Tasarım tamponu',
    connectionPhase: 'Bağlantı tipi',
    singlePhase: 'Tek faz',
    threePhase: 'Üç faz',
    actualDcPower: 'Fiili DC güç',
    panelCount: 'Panel adedi',
    recommendedInverter: 'En iyi önerilen inverter',
    secondBestInverter: 'İkinci en iyi inverter seçeneği',
    selectedForDocument: 'DOCX ve BOQ için seçildi',
    manualOverride: 'Manuel inverter seçimi',
    manualOverrideNote: 'Modeli, adedi ve teknik notu kendiniz girin.',
    manualCollapse: 'Manuel seçimi kapat',
    manualRequired: 'Manuel seçim için inverter modeli ve adedi zorunludur.',
    manualReview: 'Manuel seçim mühendislik limitlerine göre otomatik doğrulanmaz ve ayrıca onaylanmalıdır.',
    inverterWarranty: 'İnverter garantisi',
    panelWarranty: 'Panel garantisi',
    payback: 'Geri ödeme',
    azExclusion: 'Azərişıq süreçleri dahil değil',
    preliminaryMark: 'İnverter modeli ön öneridir ve saha mühendislik kontrolünden sonra kesinleştirilmelidir.',
    fullSystemPrice: 'Montaj dahil tam güneş sistemi bedeli',
    proposalStatus: 'Teklif durumu',
    preliminary: 'Ön hesaplama',
    siteSurvey: 'Saha incelemesi gerekli',
    engineeringReview: 'Mühendislik kontrolünde',
    engineerConfirmed: 'Mühendis onaylı',
    sent: 'Ticari teklif gönderildi',
    contracted: 'Sözleşme imzalandı',
    managerStatusNote: 'Menecer yalnız ön teklifi hazırlar. Mühendis onayı mühendis veya admin tarafından seçilmelidir.',
    manufacturerWarrantyNote: 'Ekipman garantisi üretici tarafından sağlanır ve SOLARIX montaj garantisinden ayrıdır.',
    connectionWarning: 'Nihai bağlantı imkanı ve izin verilen güç Azərişıq tarafından nesne belgeleri, mevcut elektrik şeması ve teknik şartlara göre belirlenir.',
    customerDocsNote: 'Aktif tüketici belgeleri, teknik şartlar ve Azərişıq süreçleri teklif fiyatına dahil değildir ve müşteri tarafından sağlanmalıdır.',
    years: 'yıl',
    months: 'ay'
  }
};

const toPositiveNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const formatNumber = (value: number, maximumFractionDigits = 0) =>
  value.toLocaleString('az-AZ', {
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits > 0 ? 1 : 0
  });

const formatMoney = (value: number) => `${formatNumber(value)} AZN`;

const defaultPanelSpec = (wattage: number) =>
  `N-tipli günəş paneli; Pmax ${Math.round(wattage)} W; ölçü 2382 × 1134 × 30 mm; çəki 28,5 kq; 1500 V DC; anodlaşdırılmış alüminium çərçivə`;

const getInverterCompatibilityNote = (panelCount: number, panelWattage: number, inverter: SolarInverterOption) => {
  const estimatedPanelCurrent = panelWattage >= 600 ? 'təxminən 15-16 A panel cərəyanı nəzərə alınmalıdır' : 'standart PV panel cərəyanı nəzərə alınmalıdır';
  const technicalDetails = [
    inverter.mpptCount ? `${inverter.mpptCount} MPPT` : null,
    inverter.inputCount ? `${inverter.inputCount} giriş` : null,
    inverter.mpptRange ? `MPPT diapazonu ${inverter.mpptRange}` : null,
    inverter.maxDcVoltage ? `max. DC ${inverter.maxDcVoltage} V` : null,
    inverter.maxInputCurrent ? `max. giriş cərəyanı ${inverter.maxInputCurrent}` : null
  ].filter(Boolean).join(', ');

  const reviewStatus = inverter.hasCompleteEngineeringData
    ? 'String sayı, gərginlik və cərəyan sahə mühəndisliyi ilə təsdiqlənməlidir.'
    : 'Tam datasheet sahələri bazada yoxdur; bu yalnız ilkin tövsiyədir və string, gərginlik, cərəyan, MPPT və şəbəkə yoxlaması ilə təsdiqlənməlidir.';

  return `${technicalDetails || 'İnverter texniki parametrləri'}; ${panelCount} panel üçün ${estimatedPanelCurrent}. ${reviewStatus}`;
};

const getInverterSpec = (recommendation: InverterRecommendation) =>
  [
    `${formatNumber(recommendation.totalDcKw, 2)} kWp DC / ${formatNumber(recommendation.totalNominalAcKw, 2)} kW AC`,
    `DC/AC nisbəti ${formatNumber(recommendation.dcAcRatio, 3)}`,
    recommendation.phase === 'three' ? '3 faza' : '1 faza',
    `maks. tövsiyə olunan PV ${formatNumber(recommendation.maxDcKw, 1)} kWp`,
    recommendation.mpptCount ? `${recommendation.mpptCount} MPPT` : null,
    recommendation.inputCount ? `${recommendation.inputCount} giriş` : null,
    recommendation.mpptRange ? `MPPT ${recommendation.mpptRange}` : null,
    recommendation.maxDcVoltage ? `max. DC ${recommendation.maxDcVoltage} V` : null,
    recommendation.maxInputCurrent ? `max. giriş cərəyanı ${recommendation.maxInputCurrent}` : null
  ].filter(Boolean).join('; ') + '.';

interface InverterCandidate {
  inverter: SolarInverterOption;
  quantity: number;
  totalNominalAcKw: number;
  totalMaxDcKw: number;
  dcAcRatio: number;
  hasStock: boolean;
}

interface InverterRecommendations {
  best: InverterRecommendation | null;
  secondBest: InverterRecommendation | null;
}

const recommendInverters = (
  totalDcKw: number,
  panelCount: number,
  panelWattage: number,
  options: SolarInverterOption[]
): InverterRecommendations => {
  if (totalDcKw <= 0 || options.length === 0) {
    return { best: null, secondBest: null };
  }

  const validRanges = options
    .filter((inverter) => inverter.nominalAcKw > 0 && inverter.maxDcKw > 0)
    .map((inverter) => {
      const minimumQuantity = Math.max(
        1,
        Math.ceil(totalDcKw / inverter.maxDcKw),
        Math.ceil(totalDcKw / (inverter.nominalAcKw * MAX_RECOMMENDED_DC_AC_RATIO))
      );
      const maximumQuantity = Math.floor(
        totalDcKw / (inverter.nominalAcKw * MIN_RECOMMENDED_DC_AC_RATIO)
      );

      return { inverter, minimumQuantity, maximumQuantity };
    })
    .filter((range) => range.minimumQuantity <= range.maximumQuantity);

  if (validRanges.length === 0) {
    return { best: null, secondBest: null };
  }

  const minimumValidQuantity = Math.min(...validRanges.map((range) => range.minimumQuantity));
  const maximumPracticalQuantity = minimumValidQuantity * 2;
  const candidatesByKey = new Map<string, InverterCandidate>();

  validRanges.forEach(({ inverter, minimumQuantity, maximumQuantity }) => {
    const practicalMaximum = Math.min(maximumQuantity, maximumPracticalQuantity);
    if (minimumQuantity > practicalMaximum) return;

    const targetQuantity = totalDcKw / (inverter.nominalAcKw * TARGET_DC_AC_RATIO);
    const quantities = new Set([
      minimumQuantity,
      clamp(Math.floor(targetQuantity), minimumQuantity, practicalMaximum),
      clamp(Math.ceil(targetQuantity), minimumQuantity, practicalMaximum)
    ]);

    quantities.forEach((quantity) => {
      const totalNominalAcKw = inverter.nominalAcKw * quantity;
      const totalMaxDcKw = inverter.maxDcKw * quantity;
      const dcAcRatio = totalDcKw / totalNominalAcKw;
      if (
        totalMaxDcKw < totalDcKw ||
        dcAcRatio < MIN_RECOMMENDED_DC_AC_RATIO ||
        dcAcRatio > MAX_RECOMMENDED_DC_AC_RATIO
      ) {
        return;
      }

      const key = `${inverter.productId}:${inverter.specificationId ?? inverter.technicalPower}:${quantity}`;
      candidatesByKey.set(key, {
        inverter,
        quantity,
        totalNominalAcKw,
        totalMaxDcKw,
        dcAcRatio,
        hasStock: inverter.inStock && inverter.availableCount >= quantity
      });
    });
  });

  const rankedCandidates = [...candidatesByKey.values()].sort((a, b) =>
    Math.abs(a.dcAcRatio - TARGET_DC_AC_RATIO) - Math.abs(b.dcAcRatio - TARGET_DC_AC_RATIO) ||
    a.quantity - b.quantity ||
    Number(b.hasStock) - Number(a.hasStock) ||
    b.inverter.nominalAcKw - a.inverter.nominalAcKw ||
    a.inverter.productId - b.inverter.productId
  );
  const selectedCandidate = rankedCandidates[0];

  if (!selectedCandidate) {
    return { best: null, secondBest: null };
  }

  const lowerQuantityCandidate = rankedCandidates.find(
    (candidate) => candidate.quantity < selectedCandidate.quantity
  );
  const secondCandidate = lowerQuantityCandidate || rankedCandidates[1] || null;
  const toRecommendation = (candidate: InverterCandidate): InverterRecommendation => ({
    ...candidate.inverter,
    quantity: candidate.quantity,
    totalDcKw,
    totalNominalAcKw: candidate.totalNominalAcKw,
    totalMaxDcKw: candidate.totalMaxDcKw,
    dcAcRatio: candidate.dcAcRatio,
    isPreliminary: !candidate.inverter.hasCompleteEngineeringData,
    hasStock: candidate.hasStock,
    compatibilityNote: getInverterCompatibilityNote(panelCount, panelWattage, candidate.inverter)
  });

  return {
    best: toRecommendation(selectedCandidate),
    secondBest: secondCandidate ? toRecommendation(secondCandidate) : null
  };
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const createBoqItem = (): CustomBoqItem => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  name: '',
  spec: '',
  unit: 'ədəd',
  quantity: '1',
  priceAzn: ''
});

const readSolarCalculatorDraft = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(SOLAR_CALCULATOR_DRAFT_KEY);
    return raw ? JSON.parse(raw) as Partial<{
      method: CalculationMethod;
      cityName: string;
      consumptionValue: string;
      consumptionPeriod: ConsumptionPeriod;
      targetOffset: string;
      mountType: MountType;
      connectionPhase: ConnectionPhase;
      proposalStatus: ProposalStatus;
      customerType: CustomerType;
      systemKwInput: string;
      monthlyBill: string;
      tariff: string;
      systemType: SolarSystemType;
      address: string;
      recipient: string;
      panelWattage: string;
      annualSavings: string;
      installationDays: string;
      panelModel: string;
      panelSpec: string;
      inverterModel: string;
      inverterSpec: string;
      inverterCount: string;
      inverterSelectionMode: InverterSelectionMode;
      projectName: string;
      documentCode: string;
      adminTrackedProjectId: string;
      includesAdv: boolean;
      customBoqItems: CustomBoqItem[];
    }> : {};
  } catch {
    return {};
  }
};

const clearSolarCalculatorDraft = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(SOLAR_CALCULATOR_DRAFT_KEY);
  }
};

const escapePdfText = (value: string) =>
  value
    .replace(/₼/g, 'manat')
    .replace(/²/g, '2')
    .replace(/[əƏ]/g, 'e')
    .replace(/[ıİ]/g, 'i')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[şŞ]/g, 's')
    .replace(/[çÇ]/g, 'c')
    .replace(/[öÖ]/g, 'o')
    .replace(/[üÜ]/g, 'u')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, '');

const pdfText = (x: number, y: number, size: number, text: string, bold = false, color = '0.06 0.08 0.12 rg') =>
  `${color}\nBT /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`;

const pdfRect = (x: number, y: number, width: number, height: number, color: string) =>
  `${color}\n${x} ${y} ${width} ${height} re f`;

const buildProposalPdf = (result: CalculationResult, formulas: string[]) => {
  const commands: string[] = [
    pdfRect(0, 0, 612, 792, '0.96 0.98 0.97 rg'),
    pdfRect(0, 680, 612, 112, '0.02 0.22 0.15 rg'),
    pdfRect(44, 608, 248, 44, '0.87 0.98 0.91 rg'),
    pdfRect(320, 608, 248, 44, '1 1 1 rg'),
    pdfRect(44, 540, 248, 44, '1 1 1 rg'),
    pdfRect(320, 540, 248, 44, '1 1 1 rg'),
    pdfText(44, 738, 24, 'Volt Solar Proposal', true, '1 1 1 rg'),
    pdfText(44, 714, 11, 'Prepared for internal sales consultation', false, '0.82 0.92 0.87 rg'),
    pdfText(44, 632, 10, 'Required system', false, '0.18 0.48 0.34 rg'),
    pdfText(44, 614, 22, `${formatNumber(result.systemKw, 1)} kW`, true),
    pdfText(320, 632, 10, 'Estimated total price', false, '0.18 0.48 0.34 rg'),
    pdfText(320, 614, 22, `${formatNumber(result.totalPriceAzn)} manat`, true),
    pdfText(44, 564, 10, 'Annual production', false, '0.18 0.48 0.34 rg'),
    pdfText(44, 546, 22, `${formatNumber(result.yearlyProduction)} kWh`, true),
    pdfText(320, 564, 10, 'Panels and area', false, '0.18 0.48 0.34 rg'),
    pdfText(320, 546, 22, `${result.panelCount} panels / ${formatNumber(result.roofArea)} m2`, true)
  ];

  const summary = [
    `Method: ${result.methodLabel}`,
    `City: ${result.city.city} (${formatNumber(result.city.specificYield)} kWh/kWp/year)`,
    `Mount: ${result.mountLabel} at ${formatNumber(result.pricePerKw)} manat/kW`,
    `Subscriber type: ${result.customerType === 'residential' ? 'Residential' : 'Non-residential'} (${result.tariff} AZN/kWh)`,
    `Target offset: ${formatNumber(result.targetOffset)}%`,
    `Average daily production: ${formatNumber(result.dailyProduction)} kWh`,
    `Monthly production: ${formatNumber(result.monthlyProduction)} kWh`
  ];

  let y = 486;
  commands.push(pdfText(44, y, 14, 'Project summary', true));
  y -= 24;
  summary.forEach((line) => {
    commands.push(pdfText(44, y, 10, line));
    y -= 18;
  });

  y -= 12;
  commands.push(pdfText(44, y, 14, 'Formulas used', true));
  y -= 24;
  formulas.slice(0, 5).forEach((line) => {
    commands.push(pdfText(44, y, 9, line));
    y -= 17;
  });

  commands.push(pdfRect(44, 44, 524, 40, '0.02 0.22 0.15 rg'));
  commands.push(pdfText(60, 60, 10, 'Volt.az | support@volt.az | +994 50 418 00 01', false, '1 1 1 rg'));

  const content = commands.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
  ];
  const offsets: number[] = [0];
  let pdf = '%PDF-1.4\n';

  objects.forEach((object, index) => {
    offsets[index + 1] = pdf.length;
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
};

const AdminSolarCalculator: React.FC<{ lang?: Lang }> = ({ lang = 'az' }) => {
  const { role } = useAuth();
  const { uploadPDF } = useUpload();
  const t = ui[lang] || ui.az;
  const methods = methodLabels[lang] || methodLabels.az;
  const periods = periodLabels[lang] || periodLabels.az;
  const draft = useMemo(() => readSolarCalculatorDraft(), []);
  const [method, setMethod] = useState<CalculationMethod>(draft.method || 'consumption');
  const [cityName, setCityName] = useState<string>(draft.cityName || 'Bakı');
  const [consumptionValue, setConsumptionValue] = useState<string>(draft.consumptionValue || '1200');
  const [consumptionPeriod, setConsumptionPeriod] = useState<ConsumptionPeriod>(draft.consumptionPeriod || 'monthly');
  const [targetOffset, setTargetOffset] = useState<string>(draft.targetOffset || '100');
  const [mountType, setMountType] = useState<MountType>(draft.mountType || 'roof');
  const [connectionPhase, setConnectionPhase] = useState<ConnectionPhase>(draft.connectionPhase || 'three');
  const [proposalStatus, setProposalStatus] = useState<ProposalStatus>(draft.proposalStatus || 'preliminary');
  const [customerType, setCustomerType] = useState<CustomerType>(draft.customerType || 'residential');
  const [systemKwInput, setSystemKwInput] = useState<string>(draft.systemKwInput || '30');
  const [monthlyBill, setMonthlyBill] = useState<string>(draft.monthlyBill || '1000');
  const [tariff, setTariff] = useState<string>(draft.tariff || String(DEFAULT_COMMERCIAL_TARIFF));
  const [systemType, setSystemType] = useState<SolarSystemType>(draft.systemType || 'on-grid');
  const [address, setAddress] = useState<string>(draft.address || '');
  const [recipient, setRecipient] = useState<string>(draft.recipient || '');
  const [panelWattage, setPanelWattage] = useState<string>(draft.panelWattage || String(DEFAULT_PANEL_WATTAGE));
  const [annualSavings, setAnnualSavings] = useState<string>(draft.annualSavings || '');
  const [installationDays, setInstallationDays] = useState<string>(draft.installationDays || '7');
  const [panelModel, setPanelModel] = useState<string>(draft.panelModel || '');
  const [panelSpec, setPanelSpec] = useState<string>(draft.panelSpec || '');
  const [inverterModel, setInverterModel] = useState<string>(draft.inverterModel || '');
  const [inverterSpec, setInverterSpec] = useState<string>(draft.inverterSpec || '');
  const [inverterCount, setInverterCount] = useState<string>(draft.inverterCount || '');
  const [inverterSelectionMode, setInverterSelectionMode] = useState<InverterSelectionMode>(
    draft.inverterSelectionMode || 'best'
  );
  const [isManualInverterOpen, setIsManualInverterOpen] = useState(false);
  // Project identity must always be deliberately entered or selected for each
  // calculator session. Do not revive a prior customer's project from a local draft.
  const [projectName, setProjectName] = useState<string>('');
  const [documentCode, setDocumentCode] = useState<string>(draft.documentCode || 'CP');
  const [adminTrackedProjectId, setAdminTrackedProjectId] = useState<string>('');
  const [includesAdv, setIncludesAdv] = useState<boolean>(draft.includesAdv ?? true);
  const [trackedProjects, setTrackedProjects] = useState<TrackedProject[]>([]);
  const [projectOptions, setProjectOptions] = useState<SolarProjectOption[]>([]);
  const [isProjectSearchOpen, setIsProjectSearchOpen] = useState(false);
  const [customBoqItems, setCustomBoqItems] = useState<CustomBoqItem[]>(Array.isArray(draft.customBoqItems) ? draft.customBoqItems : []);
  const [inverterOptions, setInverterOptions] = useState<SolarInverterOption[]>([]);
  const [isLoadingInverterOptions, setIsLoadingInverterOptions] = useState(true);
  const [inverterCatalogError, setInverterCatalogError] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);
  const normalizedRole = (role || '').toLowerCase();
  const canConfirmEngineering =
    normalizedRole.includes('admin') ||
    normalizedRole.includes('engineer') ||
    normalizedRole.includes('mühəndis') ||
    normalizedRole.includes('muhendis') ||
    normalizedRole.includes('supervayzer');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(SOLAR_CALCULATOR_DRAFT_KEY, JSON.stringify({
      method,
      cityName,
      consumptionValue,
      consumptionPeriod,
      targetOffset,
      mountType,
      connectionPhase,
      proposalStatus,
      customerType,
      systemKwInput,
      monthlyBill,
      tariff,
      systemType,
      address,
      recipient,
      panelWattage,
      annualSavings,
      installationDays,
      panelModel,
      panelSpec,
      inverterModel,
      inverterSpec,
      inverterCount,
      inverterSelectionMode,
      projectName: '',
      documentCode,
      adminTrackedProjectId: '',
      includesAdv,
      customBoqItems
    }));
  }, [address, adminTrackedProjectId, annualSavings, cityName, connectionPhase, consumptionPeriod, consumptionValue, customBoqItems, customerType, documentCode, includesAdv, installationDays, inverterCount, inverterModel, inverterSelectionMode, inverterSpec, method, monthlyBill, mountType, panelModel, panelSpec, panelWattage, projectName, proposalStatus, recipient, systemKwInput, systemType, targetOffset, tariff]);

  useEffect(() => {
    let cancelled = false;
    getAdminTrackedProjects().then((projects) => { if (!cancelled) setTrackedProjects(projects); }).catch(() => { if (!cancelled) setTrackedProjects([]); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingInverterOptions(true);
    setInverterCatalogError(false);
    setInverterOptions([]);

    getSolarInverters(systemType, connectionPhase)
      .then((options) => {
        if (!cancelled) {
          setInverterOptions(options);
        }
      })
      .catch((error) => {
        console.error('Inverter catalog could not be loaded:', error);
        if (!cancelled) {
          setInverterCatalogError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingInverterOptions(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [connectionPhase, systemType]);

  useEffect(() => {
    let cancelled = false;
    const query = projectName.trim();

    if (query.length < 2) {
      setProjectOptions([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        const results = await searchSolarProjects(query);
        if (!cancelled) {
          setProjectOptions(results);
        }
      } catch (error) {
        if (!cancelled) {
          setProjectOptions([]);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [projectName]);

  const updateCustomBoqItem = (id: string, key: keyof Omit<CustomBoqItem, 'id'>, value: string) => {
    setCustomBoqItems((items) => items.map((item) => item.id === id ? { ...item, [key]: value } : item));
  };

  const deleteCustomBoqItem = (id: string) => {
    setCustomBoqItems((items) => items.filter((item) => item.id !== id));
  };

  const applySavedProjectPayload = (option: SolarProjectOption) => {
    setProjectName(option.name);
    setIsProjectSearchOpen(false);
    const matches = trackedProjects.filter((project) => normalizeProjectLinkName(project.name) === normalizeProjectLinkName(option.name));
    setAdminTrackedProjectId(option.adminTrackedProjectId ? String(option.adminTrackedProjectId) : matches.length === 1 ? matches[0].id : '');

    if (!option.latestPayloadJson) {
      return;
    }

    try {
      const payload = JSON.parse(option.latestPayloadJson);
      const inputs = payload?.inputs || {};

      if (inputs.method) setMethod(inputs.method);
      if (inputs.cityName) setCityName(inputs.cityName);
      if (inputs.consumptionValue !== undefined) setConsumptionValue(String(inputs.consumptionValue));
      if (inputs.consumptionPeriod) setConsumptionPeriod(inputs.consumptionPeriod);
      if (inputs.targetOffset !== undefined) setTargetOffset(String(inputs.targetOffset));
      if (inputs.mountType) setMountType(inputs.mountType);
      if (inputs.connectionPhase) setConnectionPhase(inputs.connectionPhase);
      if (inputs.proposalStatus) setProposalStatus(inputs.proposalStatus);
      if (inputs.customerType) setCustomerType(inputs.customerType);
      if (inputs.systemKwInput !== undefined) setSystemKwInput(String(inputs.systemKwInput));
      if (inputs.monthlyBill !== undefined) setMonthlyBill(String(inputs.monthlyBill));
      if (inputs.tariff !== undefined) setTariff(String(inputs.tariff));
      if (inputs.systemType) setSystemType(inputs.systemType);
      if (inputs.address !== undefined) setAddress(String(inputs.address));
      if (inputs.recipient !== undefined) setRecipient(String(inputs.recipient));
      if (inputs.panelWattage !== undefined) setPanelWattage(String(inputs.panelWattage));
      if (inputs.annualSavings !== undefined) setAnnualSavings(String(inputs.annualSavings));
      if (inputs.installationDays !== undefined) setInstallationDays(String(inputs.installationDays));
      if (inputs.panelModel !== undefined) setPanelModel(String(inputs.panelModel));
      if (inputs.panelSpec !== undefined) setPanelSpec(String(inputs.panelSpec));
      if (inputs.inverterModel !== undefined) setInverterModel(String(inputs.inverterModel));
      if (inputs.inverterSpec !== undefined) setInverterSpec(String(inputs.inverterSpec));
      if (inputs.inverterCount !== undefined) setInverterCount(String(inputs.inverterCount));
      if (inputs.inverterSelectionMode === 'best' || inputs.inverterSelectionMode === 'second' || inputs.inverterSelectionMode === 'manual') {
        setInverterSelectionMode(inputs.inverterSelectionMode);
      }
      if (payload?.documentCode) setDocumentCode(String(payload.documentCode));
      if (Array.isArray(inputs.customBoqItems)) setCustomBoqItems(inputs.customBoqItems);
    } catch (error) {
      console.error('Saved project payload could not be applied:', error);
    }
  };

  const selectExactSavedProject = async () => {
    const normalizedName = normalizeProjectLinkName(projectName);
    if (!normalizedName) {
      return;
    }

    const exactTrackedProject = trackedProjects.find((project) => normalizeProjectLinkName(project.name) === normalizedName);
    let exactMatch = projectOptions.find((option) => normalizeProjectLinkName(option.name) === normalizedName);
    if (!exactMatch && !exactTrackedProject) {
      try {
        const results = await searchSolarProjects(projectName.trim());
        exactMatch = results.find((option) => normalizeProjectLinkName(option.name) === normalizedName);
        setProjectOptions(results);
      } catch (error) {
        console.error('Existing project lookup failed:', error);
      }
    }

    if (exactTrackedProject && !exactMatch) {
      setProjectName(exactTrackedProject.name);
      setAdminTrackedProjectId(exactTrackedProject.id);
      setIsProjectSearchOpen(false);
      return;
    }

    if (exactMatch) {
      applySavedProjectPayload(exactMatch);
      return;
    }

    setAdminTrackedProjectId('');
    setIsProjectSearchOpen(false);
  };

  const selectTrackedProject = (trackedProjectId: string) => {
    setAdminTrackedProjectId(trackedProjectId);
    const trackedProject = trackedProjects.find((project) => project.id === trackedProjectId);
    if (trackedProject) {
      setProjectName(trackedProject.name);
      setIsProjectSearchOpen(false);
    }
  };

  const result = useMemo<CalculationResult>(() => {
    const city = cityProfiles.find((profile) => profile.city === cityName) || cityProfiles[0];
    const offset = clamp(toPositiveNumber(targetOffset) || 100, 1, 200);
    const pricePerKw = mountType === 'ground' ? GROUND_PRICE_PER_KW : ROOF_PRICE_PER_KW;
    const mountLabel = mountType === 'ground' ? t.groundMount : t.roofMount;
    const panelWattageValue = clamp(toPositiveNumber(panelWattage) || DEFAULT_PANEL_WATTAGE, 100, 1000);
    const panelKw = panelWattageValue / 1000;
    const enteredConsumption = toPositiveNumber(consumptionValue);
    const enteredTariff =
      customerType === 'residential'
        ? RESIDENTIAL_HIGH_CONSUMPTION_TARIFF
        : toPositiveNumber(tariff) || DEFAULT_COMMERCIAL_TARIFF;
    const annualConsumptionFromBill = enteredTariff > 0 ? (toPositiveNumber(monthlyBill) * 12) / enteredTariff : 0;
    const yearlyKWh =
      method === 'bill'
        ? annualConsumptionFromBill
        : consumptionPeriod === 'daily'
          ? enteredConsumption * 365
          : consumptionPeriod === 'monthly'
            ? enteredConsumption * 12
            : enteredConsumption;
    const requiredKw =
      method === 'system'
        ? toPositiveNumber(systemKwInput)
        : ((yearlyKWh * (offset / 100)) / city.specificYield) * DESIGN_BUFFER;
    const panelCount = requiredKw > 0 ? Math.max(1, Math.ceil(requiredKw / panelKw)) : 0;
    const systemKw = panelCount > 0 ? panelCount * panelKw : 0;
    const yearlyProduction = systemKw * city.specificYield;
    const baseSystemCost = systemKw * pricePerKw;
    const boqAdditionsCost = customBoqItems.reduce((sum, item) => {
      const quantity = Math.max(1, Math.round(toPositiveNumber(item.quantity) || 1));
      return sum + (quantity * toPositiveNumber(item.priceAzn));
    }, 0);
    const estimatedCost = baseSystemCost + boqAdditionsCost;
    const calculatedAnnualSavings = yearlyProduction * enteredTariff;
    const annualSavingsValue = toPositiveNumber(annualSavings) || calculatedAnnualSavings;
    const vatAzn = includesAdv ? estimatedCost * VAT_RATE : 0;
    const totalPriceAzn = estimatedCost + vatAzn;
    const inverterRecommendations = recommendInverters(
      systemKw,
      panelCount,
      panelWattageValue,
      inverterOptions
    );

    return {
      methodLabel: methods[method],
      city,
      yearlyKWh,
      requiredKw,
      systemKw,
      panelCount,
      dailyProduction: yearlyProduction / 365,
      monthlyProduction: yearlyProduction / 12,
      yearlyProduction,
      estimatedCost,
      mountLabel,
      pricePerKw,
      customerType,
      tariff: enteredTariff,
      designBuffer: DESIGN_BUFFER,
      roofArea: panelCount * PANEL_AREA,
      targetOffset: offset,
      panelWattage: panelWattageValue,
      panelKw,
      baseSystemCost,
      boqAdditionsCost,
      vatAzn,
      totalPriceAzn,
      annualSavings: annualSavingsValue,
      paybackYears: annualSavingsValue > 0 ? totalPriceAzn / annualSavingsValue : 0,
      inverter: inverterRecommendations.best,
      secondBestInverter: inverterRecommendations.secondBest,
      connectionPhase
    };
  }, [annualSavings, cityName, connectionPhase, consumptionPeriod, consumptionValue, customBoqItems, customerType, includesAdv, inverterOptions, method, monthlyBill, mountType, panelWattage, systemKwInput, targetOffset, tariff, methods, t.groundMount, t.roofMount]);

  const selectedCatalogInverter =
    inverterSelectionMode === 'second'
      ? result.secondBestInverter
      : inverterSelectionMode === 'best'
        ? result.inverter
        : null;
  const manualInverterCount = Math.max(0, Math.round(toPositiveNumber(inverterCount)));
  const manualInverterIsValid = inverterModel.trim().length > 0 && manualInverterCount > 0;
  const selectedInverterModel =
    inverterSelectionMode === 'manual'
      ? inverterModel.trim()
      : selectedCatalogInverter?.modelLabel || '';
  const selectedInverterCount =
    inverterSelectionMode === 'manual'
      ? manualInverterCount
      : selectedCatalogInverter?.quantity || 0;
  const selectedInverterSpec =
    inverterSelectionMode === 'manual'
      ? inverterSpec.trim()
      : selectedCatalogInverter
        ? getInverterSpec(selectedCatalogInverter)
        : '';

  useEffect(() => {
    if (inverterSelectionMode === 'second' && !isLoadingInverterOptions && !result.secondBestInverter) {
      setInverterSelectionMode('best');
    }
  }, [inverterSelectionMode, isLoadingInverterOptions, result.secondBestInverter]);

  const formulas = useMemo(() => {
    const tariffFormula =
      customerType === 'residential'
        ? lang === 'az'
          ? `İllik sərfiyyat = Aylıq ödəniş x 12 / ${RESIDENTIAL_HIGH_CONSUMPTION_TARIFF} AZN/kWh (yüksək sərfiyyatlı əhali üçün sadələşdirilmiş tarif)`
          : lang === 'ru'
            ? `Годовое потребление = ежемесячный счет x 12 / ${RESIDENTIAL_HIGH_CONSUMPTION_TARIFF} AZN/kWh (упрощенный тариф для высокого жилого потребления)`
            : lang === 'tr'
              ? `Yıllık tüketim = aylık fatura x 12 / ${RESIDENTIAL_HIGH_CONSUMPTION_TARIFF} AZN/kWh (yüksek konut tüketimi için basitleştirilmiş tarife)`
              : `Annual consumption = monthly bill x 12 / ${RESIDENTIAL_HIGH_CONSUMPTION_TARIFF} AZN/kWh (simplified high-consumption residential tariff)`
        : lang === 'az'
          ? `İllik sərfiyyat = Aylıq ödəniş x 12 / ${result.tariff} AZN/kWh (qeyri-əhali tarifi)`
          : lang === 'ru'
            ? `Годовое потребление = ежемесячный счет x 12 / ${result.tariff} AZN/kWh (нежилой тариф)`
            : lang === 'tr'
              ? `Yıllık tüketim = aylık fatura x 12 / ${result.tariff} AZN/kWh (konut dışı tarife)`
              : `Annual consumption = monthly bill x 12 / ${result.tariff} AZN/kWh (non-residential tariff)`;
    const lines = [
      lang === 'az'
        ? method === 'bill' ? tariffFormula : `İllik sərfiyyat = ${periods[consumptionPeriod]} dəyərinin illik ekvivalenti`
        : lang === 'ru'
          ? method === 'bill' ? tariffFormula : `Годовое потребление = годовой эквивалент ${periods[consumptionPeriod]}`
          : lang === 'tr'
            ? method === 'bill' ? tariffFormula : `Yıllık tüketim = ${periods[consumptionPeriod]} değerinin yıllık karşılığı`
            : method === 'bill' ? tariffFormula : `Annual consumption = annual equivalent of ${periods[consumptionPeriod]}`,
      lang === 'az'
        ? `Tələb olunan kWp = İllik kWh x hədəf / ${formatNumber(result.city.specificYield)} kWh/kWp/il x ${DESIGN_BUFFER} dizayn buferi`
        : lang === 'ru'
          ? `Требуемые kWp = годовые kWh x цель / ${formatNumber(result.city.specificYield)} kWh/kWp/year x ${DESIGN_BUFFER} буфер`
          : lang === 'tr'
            ? `Gerekli kWp = yıllık kWh x hedef / ${formatNumber(result.city.specificYield)} kWh/kWp/yıl x ${DESIGN_BUFFER} tasarım tamponu`
            : `Required kWp = annual kWh x target / ${formatNumber(result.city.specificYield)} kWh/kWp/year x ${DESIGN_BUFFER} design buffer`,
      lang === 'az'
        ? `Panel sayı = yuxarı yuvarlaqla(Tələb olunan kW / ${formatNumber(result.panelKw, 2)} kW)`
        : lang === 'ru'
          ? `Количество панелей = округлить вверх(требуемые kW / ${formatNumber(result.panelKw, 2)} kW)`
          : lang === 'tr'
            ? `Panel sayısı = yukarı yuvarla(gerekli kW / ${formatNumber(result.panelKw, 2)} kW)`
            : `Panel count = round up(required kW / ${formatNumber(result.panelKw, 2)} kW)`,
      lang === 'az'
        ? `Sistem gücü = Panel sayı x ${formatNumber(result.panelKw, 2)} kW`
        : lang === 'ru'
          ? `Мощность системы = количество панелей x ${formatNumber(result.panelKw, 2)} kW`
          : lang === 'tr'
            ? `Sistem gücü = panel sayısı x ${formatNumber(result.panelKw, 2)} kW`
            : `System size = panel count x ${formatNumber(result.panelKw, 2)} kW`,
      lang === 'az'
        ? `Qiymət = Sistem gücü x ${result.pricePerKw} AZN/kW`
        : lang === 'ru'
          ? `Цена = мощность системы x ${result.pricePerKw} AZN/kW`
          : lang === 'tr'
            ? `Fiyat = sistem gücü x ${result.pricePerKw} AZN/kW`
            : `Price = system size x ${result.pricePerKw} AZN/kW`
    ];

    if (method === 'system') {
      const systemLines = [
        lang === 'az' ? `Sistem gücü = daxil edilən kW dəyəri (${formatNumber(result.requiredKw, 1)} kW)` : lang === 'ru' ? `Мощность системы = введенное значение kW (${formatNumber(result.requiredKw, 1)} kW)` : lang === 'tr' ? `Sistem gücü = girilen kW değeri (${formatNumber(result.requiredKw, 1)} kW)` : `System size = entered kW value (${formatNumber(result.requiredKw, 1)} kW)`,
        lang === 'az' ? `Panel sayı = yuxarı yuvarlaqla(Sistem gücü / ${formatNumber(result.panelKw, 2)} kW)` : lang === 'ru' ? `Количество панелей = округлить вверх(мощность системы / ${formatNumber(result.panelKw, 2)} kW)` : lang === 'tr' ? `Panel sayısı = yukarı yuvarla(sistem gücü / ${formatNumber(result.panelKw, 2)} kW)` : `Panel count = round up(system size / ${formatNumber(result.panelKw, 2)} kW)`,
        lang === 'az' ? `İllik istehsal = Sistem gücü x ${formatNumber(result.city.specificYield)} kWh/kWp/il` : lang === 'ru' ? `Годовая выработка = мощность системы x ${formatNumber(result.city.specificYield)} kWh/kWp/year` : lang === 'tr' ? `Yıllık üretim = sistem gücü x ${formatNumber(result.city.specificYield)} kWh/kWp/yıl` : `Annual production = system size x ${formatNumber(result.city.specificYield)} kWh/kWp/year`,
        lang === 'az' ? `Qiymət = Sistem gücü x ${result.pricePerKw} AZN/kW` : lang === 'ru' ? `Цена = мощность системы x ${result.pricePerKw} AZN/kW` : lang === 'tr' ? `Fiyat = sistem gücü x ${result.pricePerKw} AZN/kW` : `Price = system size x ${result.pricePerKw} AZN/kW`
      ];

      if (result.boqAdditionsCost > 0) {
        systemLines.push(
          lang === 'az'
            ? `Yekun baza qiymət = ${formatMoney(result.baseSystemCost)} + ${formatMoney(result.boqAdditionsCost)} BOQ əlavələri`
            : lang === 'ru'
              ? `Итоговая базовая цена = ${formatMoney(result.baseSystemCost)} + ${formatMoney(result.boqAdditionsCost)} дополнения BOQ`
              : lang === 'tr'
                ? `Toplam baz fiyat = ${formatMoney(result.baseSystemCost)} + ${formatMoney(result.boqAdditionsCost)} BOQ eklemeleri`
                : `Total base price = ${formatMoney(result.baseSystemCost)} + ${formatMoney(result.boqAdditionsCost)} BOQ additions`
        );
      }

      return systemLines;
    }

    if (result.boqAdditionsCost > 0) {
      lines.push(
        lang === 'az'
          ? `Yekun baza qiymət = ${formatMoney(result.baseSystemCost)} + ${formatMoney(result.boqAdditionsCost)} BOQ əlavələri`
          : lang === 'ru'
            ? `Итоговая базовая цена = ${formatMoney(result.baseSystemCost)} + ${formatMoney(result.boqAdditionsCost)} дополнения BOQ`
            : lang === 'tr'
              ? `Toplam baz fiyat = ${formatMoney(result.baseSystemCost)} + ${formatMoney(result.boqAdditionsCost)} BOQ eklemeleri`
              : `Total base price = ${formatMoney(result.baseSystemCost)} + ${formatMoney(result.boqAdditionsCost)} BOQ additions`
      );
    }

    return lines;
  }, [consumptionPeriod, customerType, lang, method, periods, result.baseSystemCost, result.boqAdditionsCost, result.city.specificYield, result.panelKw, result.pricePerKw, result.requiredKw, result.tariff]);

  const estimatedPriceFormula = [
    formatMoney(result.baseSystemCost),
    result.boqAdditionsCost > 0 ? formatMoney(result.boqAdditionsCost) : null,
    includesAdv ? `${t.vatAmount}: ${formatMoney(result.vatAzn)}` : t.advExcludedNote
  ].filter(Boolean).join(' + ');

  const buildAnalyticsPayload = (exportType: 'pdf' | 'docx', issuedDocumentNumber?: string) => ({
    exportType,
    projectName: projectName.trim(),
    documentCode: exportType === 'docx' ? documentCode : undefined,
    documentNumber: issuedDocumentNumber,
    inputs: {
      method,
      cityName,
      consumptionValue,
      consumptionPeriod,
      targetOffset,
      mountType,
      connectionPhase,
      proposalStatus,
      customerType,
      systemKwInput,
      monthlyBill,
      tariff,
      systemType,
      address,
      recipient,
      panelWattage,
      annualSavings,
      installationDays,
      panelModel,
      panelSpec,
      inverterModel,
      inverterSpec,
      inverterCount,
      inverterSelectionMode,
      includesAdv,
      customBoqItems
    },
    result: {
      methodLabel: result.methodLabel,
      city: result.city.city,
      region: result.city.region,
      yearlyKWh: result.yearlyKWh,
      requiredKw: result.requiredKw,
      systemKw: result.systemKw,
      panelCount: result.panelCount,
      yearlyProduction: result.yearlyProduction,
      estimatedCost: result.estimatedCost,
      vatAzn: result.vatAzn,
      totalPriceAzn: result.totalPriceAzn,
      annualSavings: result.annualSavings,
      paybackYears: result.paybackYears,
      inverterSelectionMode,
      inverter: selectedInverterModel || null,
      inverterQuantity: selectedInverterCount || null,
      inverterProductId: selectedCatalogInverter?.productId || null,
      inverterSpecificationId: selectedCatalogInverter?.specificationId || null,
      inverterNominalAcKw: selectedCatalogInverter?.totalNominalAcKw || null,
      inverterMaxDcKw: selectedCatalogInverter?.totalMaxDcKw || null,
      inverterHasStock: selectedCatalogInverter?.hasStock ?? null
    },
    formulas
  });

  const validateExportProject = (requiresTrackedProject: boolean) => {
    if (!projectName.trim()) {
      alert('Layihə adı məcburidir.');
      return false;
    }

    if (!address.trim()) {
      alert('Layihənin ünvanı məcburidir.');
      return false;
    }

    if (!recipient.trim()) {
      alert('Kimə sahəsi məcburidir.');
      return false;
    }

    if (requiresTrackedProject && !adminTrackedProjectId) {
      alert('Təqdimat və ilkin qiymətləndirmə üçün aktiv tracker layihəsi seçilməlidir.');
      return false;
    }

    return true;
  };

  const downloadPdf = async () => {
    if (!validateExportProject(true)) {
      return;
    }

    setIsDownloadingPdf(true);

    try {
      await logAdminPdfExport(projectName.trim(), lang, buildAnalyticsPayload('pdf'), Number(adminTrackedProjectId));
      const blob = new Blob([buildProposalPdf(result, formulas)], { type: 'application/pdf' });
      downloadBlob(blob, `volt-solar-proposal-${Date.now()}.pdf`);
      clearSolarCalculatorDraft();
    } catch (error) {
      console.error(error);
      alert('PDF ixracı sistemdə qeyd edilmədi.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const downloadInitialAssessment = async () => {
    if (!validateExportProject(false)) {
      return;
    }

    setIsDownloadingDocx(true);

    try {
      const basePrice = result.estimatedCost;
      if (!selectedInverterModel || selectedInverterCount < 1) {
        throw new Error(
          inverterSelectionMode === 'manual'
            ? t.manualRequired
            : 'The selected inverter recommendation is not available. Load the catalog or choose a manual override.'
        );
      }
      const issue = await issueAdminDocxExport(projectName.trim(), documentCode, lang, buildAnalyticsPayload('docx'), Number(adminTrackedProjectId));
      const customDocItems = customBoqItems
        .filter((item) => item.name.trim().length > 0)
        .map((item) => {
          const quantity = Math.max(1, Math.round(toPositiveNumber(item.quantity) || 1));

          return {
            name: item.name,
            spec: item.spec,
            unit: item.unit,
            quantity,
            priceAzn: quantity * toPositiveNumber(item.priceAzn)
          };
        });
      const blob = await buildInitialAssessmentDocx({
        date: new Date(),
        documentNumber: issue.documentNumber,
        verificationUrl: issue.verificationUrl,
        projectName: projectName.trim(),
        address: address.trim(),
        recipient: recipient.trim(),
        mountDescription: mountType === 'ground' ? 'Torpaq sahəsi' : 'Dam örtüyü',
        systemType,
        systemKw: result.systemKw,
        panelCount: result.panelCount,
        panelWattage: result.panelWattage,
        yearlyProductionKWh: result.yearlyProduction,
        monthlyProductionKWh: result.monthlyProduction,
        annualSavingsAzn: result.annualSavings,
        customerType: result.customerType,
        mountType,
        panelModel: panelModel.trim() || DEFAULT_PANEL_MODEL,
        panelSpec: panelSpec.trim() || defaultPanelSpec(result.panelWattage),
        inverterModel: selectedInverterModel,
        inverterSpec: selectedInverterSpec,
        inverterCount: selectedInverterCount,
        basePriceAzn: basePrice,
        includesAdv,
        vatAzn: result.vatAzn,
        totalPriceAzn: result.totalPriceAzn,
        installationDays: Math.max(1, Math.round(toPositiveNumber(installationDays) || 7)),
        customBoqItems: customDocItems
      });

      const documentFilename = `${issue.documentNumber}-solarix-ilkin-qiymetlendirme.docx`;
      const uploadedDocument = await uploadPDF(new File([blob], documentFilename, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }));
      const uploadedFilePath = uploadedDocument?.data?.path;
      if (!uploadedFilePath) {
        throw new Error('DOCX sənədi tracker layihəsinə yüklənmədi.');
      }
      const updatedTrackedProject = await addAdminTrackedProjectAttachment(String(issue.adminTrackedProjectId), {
        fileName: documentFilename,
        filePath: uploadedFilePath,
        label: 'İlkin qiymətləndirmə sənədi'
      });
      setTrackedProjects((projects) => {
        const exists = projects.some((project) => project.id === updatedTrackedProject.id);
        return exists
          ? projects.map((project) => project.id === updatedTrackedProject.id ? updatedTrackedProject : project)
          : [updatedTrackedProject, ...projects];
      });
      setAdminTrackedProjectId(updatedTrackedProject.id);
      downloadBlob(blob, documentFilename);
      clearSolarCalculatorDraft();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'DOCX sənədi hazırlanmadı.');
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  const ResultCard = ({
    label,
    value,
    note,
    tone = 'default',
    selected = false,
    onClick,
    actionLabel,
    onAction
  }: {
    label: string;
    value: string;
    note?: string;
    tone?: 'default' | 'recommended' | 'alternative';
    selected?: boolean;
    onClick?: () => void;
    actionLabel?: string;
    onAction?: () => void;
  }) => {
    const className = `w-full rounded-3xl border p-6 text-left shadow-sm transition-all ${
      tone === 'recommended'
        ? 'border-emerald-200 bg-emerald-50'
        : tone === 'alternative'
          ? 'border-amber-300 bg-amber-50'
          : 'border-slate-100 bg-white'
    } ${
      selected
        ? tone === 'alternative'
          ? 'ring-4 ring-amber-300/50'
          : 'ring-4 ring-emerald-300/50'
        : ''
    } ${onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/60' : ''}`;
    const content = (
      <>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className={`text-[10px] font-black uppercase tracking-widest ${
            tone === 'recommended'
              ? 'text-emerald-700'
              : tone === 'alternative'
                ? 'text-amber-700'
                : 'text-slate-400'
          }`}>{label}</div>
          {selected && (
            <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
              tone === 'alternative'
                ? 'bg-amber-200 text-amber-900'
                : 'bg-emerald-200 text-emerald-900'
            }`}>
              {t.selectedForDocument}
            </span>
          )}
        </div>
        <div className="break-words text-xl font-black leading-tight text-slate-900 md:text-2xl">{value}</div>
        {note && <div className={`mt-2 break-words text-xs font-medium leading-relaxed ${
          tone === 'alternative' ? 'text-amber-800' : 'text-slate-500'
        }`}>{note}</div>}
      </>
    );

    if (onAction && actionLabel) {
      return (
        <div className={className}>
          {onClick ? (
            <button type="button" className="w-full text-left" onClick={onClick} aria-pressed={selected}>
              {content}
            </button>
          ) : content}
          <button
            type="button"
            onClick={onAction}
            className={`mt-4 inline-flex rounded-xl border px-3 py-2 text-[9px] font-black uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/60 ${
              tone === 'alternative'
                ? 'border-amber-300 bg-white/70 text-amber-800 hover:bg-white'
                : 'border-emerald-300 bg-white/70 text-emerald-800 hover:bg-white'
            }`}
          >
            {actionLabel}
          </button>
        </div>
      );
    }

    return onClick ? (
      <button type="button" className={className} onClick={onClick} aria-pressed={selected}>
        {content}
      </button>
    ) : (
      <div className={className}>{content}</div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
        <div>
          <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">{t.eyebrow}</div>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900">{t.title}</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl">
            {t.subtitle}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={downloadPdf}
            disabled={isDownloadingPdf}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-900/10 transition-all hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {isDownloadingPdf ? t.downloadingDocx : t.download}
          </button>
          <button
            onClick={downloadInitialAssessment}
            disabled={isDownloadingDocx}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            {isDownloadingDocx ? t.downloadingDocx : t.initialAssessmentDownload}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-5 bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 shadow-xl space-y-6">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="relative md:col-span-2">
                <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2">Layihə adı *</label>
                <input
                  value={projectName}
                  onFocus={() => setIsProjectSearchOpen(true)}
                  onBlur={() => window.setTimeout(() => setIsProjectSearchOpen(false), 150)}
                  onChange={(event) => {
                    setProjectName(event.target.value);
                    setAdminTrackedProjectId('');
                    setIsProjectSearchOpen(true);
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') {
                      return;
                    }

                    event.preventDefault();
                    void selectExactSavedProject();
                  }}
                  placeholder="Məsələn: Ağ şəhər ofis binası"
                  className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
                />
                {isProjectSearchOpen && projectOptions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-xl">
                    {projectOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => applySavedProjectPayload(option)}
                        className="block w-full px-4 py-3 text-left text-xs font-black text-slate-700 transition-colors hover:bg-emerald-50"
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs font-semibold text-emerald-800/70">Mövcud layihəni seçin və ya adı yazıb Enter basın. Uyğun layihə yoxdursa tracker sahəsi boş qalır və DOCX ixracında yeni layihə yaradılır.</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2">Sənəd növü *</label>
                <select
                  value={documentCode}
                  onChange={(event) => setDocumentCode(event.target.value)}
                  className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
                >
                  {documentTypeOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.code} - {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs font-semibold text-emerald-800/70">DOCX üçün nömrə backend tərəfindən VOLT-XXX-YYYY-MM-NNN formatında veriləcək.</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2">Tracker layihəsi (DOCX üçün)</label>
                <select value={adminTrackedProjectId} onChange={(event) => selectTrackedProject(event.target.value)} className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500">
                  <option value="">Aktiv layihə seçin</option>
                  {trackedProjects.map((project) => <option key={project.id} value={project.id}>{project.name}{project.personName ? ` — ${project.personName}` : ''}</option>)}
                </select>
                <p className="mt-2 text-xs font-semibold text-emerald-800/70">Bu sahə ilkin olaraq boşdur. Seçilməzsə, DOCX ixracı zamanı layihə adı ilə yeni tracker layihəsi yaradılacaq.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t.method}</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(Object.keys(methods) as CalculationMethod[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setMethod(item)}
                  className={`rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                    method === item ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/10' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {methods[item]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.city}</label>
              <select
                value={cityName}
                onChange={(event) => setCityName(event.target.value)}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
              >
                {cityProfiles.map((profile) => (
                  <option key={profile.city} value={profile.city}>
                    {profile.city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.customerType}</label>
              <div className="grid grid-cols-2 gap-2">
                {(['residential', 'nonResidential'] as CustomerType[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCustomerType(item)}
                    className={`rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                      customerType === item ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {item === 'residential' ? t.residential : t.nonResidential}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.mountType}</label>
              <select
                value={mountType}
                onChange={(event) => setMountType(event.target.value as MountType)}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
              >
                <option value="roof">{t.roofMount} - {ROOF_PRICE_PER_KW} AZN/kW</option>
                <option value="ground">{t.groundMount} - {GROUND_PRICE_PER_KW} AZN/kW</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.connectionPhase}</label>
              <select
                value={connectionPhase}
                onChange={(event) => setConnectionPhase(event.target.value as ConnectionPhase)}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
              >
                <option value="single">{t.singlePhase}</option>
                <option value="three">{t.threePhase}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.proposalStatus}</label>
            <select
              value={proposalStatus}
              onChange={(event) => setProposalStatus(event.target.value as ProposalStatus)}
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
            >
              <option value="preliminary">{t.preliminary}</option>
              <option value="siteSurvey" disabled={!canConfirmEngineering}>{t.siteSurvey}</option>
              <option value="engineeringReview" disabled={!canConfirmEngineering}>{t.engineeringReview}</option>
              <option value="engineerConfirmed" disabled={!canConfirmEngineering}>{t.engineerConfirmed}</option>
              <option value="sent" disabled={!canConfirmEngineering}>{t.sent}</option>
              <option value="contracted" disabled={!canConfirmEngineering}>{t.contracted}</option>
            </select>
            <p className="mt-2 text-xs font-semibold text-slate-500">{t.managerStatusNote}</p>
          </div>

          {method === 'consumption' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.consumption}</label>
                <input
                  type="number"
                  min="0"
                  value={consumptionValue}
                  onChange={(event) => setConsumptionValue(event.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.period}</label>
                <select
                  value={consumptionPeriod}
                  onChange={(event) => setConsumptionPeriod(event.target.value as ConsumptionPeriod)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
                >
                  {(Object.keys(periods) as ConsumptionPeriod[]).map((period) => (
                    <option key={period} value={period}>
                      {periods[period]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {method === 'bill' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.monthlyBill}</label>
                  <input
                    type="number"
                    min="0"
                    value={monthlyBill}
                    onChange={(event) => setMonthlyBill(event.target.value)}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
                  />
                </div>
                {customerType === 'nonResidential' ? (
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.tariff}</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.001"
                      value={tariff}
                      onChange={(event) => setTariff(event.target.value)}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.tariff}</div>
                    <div className="text-sm font-black text-slate-700">{RESIDENTIAL_HIGH_CONSUMPTION_TARIFF} AZN/kWh</div>
                  </div>
                )}
              </div>
              <a
                href="https://www.azerishiq.az/menu/tarif-surasinin-qerarlari"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-[10px] font-black uppercase tracking-widest text-emerald-700 transition-colors hover:text-slate-900"
              >
                Tarif qərarlarını yoxla
              </a>
            </div>
          )}

          {method === 'system' && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.systemInput}</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={systemKwInput}
                onChange={(event) => setSystemKwInput(event.target.value)}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {method !== 'system' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.offset}</label>
                <span className="text-sm font-black text-emerald-600">{toPositiveNumber(targetOffset) || 100}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                step="5"
                value={toPositiveNumber(targetOffset) || 100}
                onChange={(event) => setTargetOffset(event.target.value)}
                className="w-full h-2 rounded-full bg-slate-100 accent-emerald-600"
              />
            </div>
          )}

          <div className="rounded-3xl bg-emerald-50 border border-emerald-100 p-5">
            <div className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">{t.sunHours}</div>
            <div className="text-2xl font-black text-slate-900">{formatNumber(result.city.specificYield)} {t.sunHourUnit}</div>
            <p className="text-xs font-medium text-slate-500 mt-2">
              {result.city.city}, {result.city.region} {t.sunNote}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 space-y-4">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.documentSettings}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.systemType}</label>
                <select
                  value={systemType}
                  onChange={(event) => setSystemType(event.target.value as SolarSystemType)}
                  className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
                >
                  <option value="on-grid">On-Grid</option>
                  <option value="off-grid">Off-Grid</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.address}</label>
                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Məsələn: Şamaxı"
                  className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.recipient}</label>
                <input
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                  placeholder="Məsələn: Əliyev Əli"
                  className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.panelWattage}</label>
                <input
                  type="number"
                  min="100"
                  step="10"
                  value={panelWattage}
                  onChange={(event) => setPanelWattage(event.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.annualSavings}</label>
                <input
                  type="number"
                  min="0"
                  value={annualSavings}
                  placeholder={formatNumber(result.yearlyProduction * result.tariff)}
                  onChange={(event) => setAnnualSavings(event.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.installationDays}</label>
                <input
                  type="number"
                  min="1"
                  value={installationDays}
                  onChange={(event) => setInstallationDays(event.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
                />
              </div>
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3 md:col-span-2">
                <span>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-700">{t.includesAdv}</span>
                  <span className="mt-1 block text-xs font-medium text-slate-500">{includesAdv ? t.advIncludedNote : t.advExcludedNote}</span>
                </span>
                <input
                  type="checkbox"
                  checked={includesAdv}
                  onChange={(event) => setIncludesAdv(event.target.checked)}
                  className="h-5 w-5 shrink-0 accent-emerald-600"
                />
              </label>
            </div>
            <details className="group">
              <summary className="cursor-pointer list-none rounded-2xl bg-white px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:text-emerald-600">
                {t.boqDetails}
              </summary>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.panelModel}</label>
                  <input
                    value={panelModel}
                    placeholder={DEFAULT_PANEL_MODEL}
                    onChange={(event) => setPanelModel(event.target.value)}
                    className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.panelSpec}</label>
                  <textarea
                    value={panelSpec}
                    placeholder={defaultPanelSpec(result.panelWattage)}
                    onChange={(event) => setPanelSpec(event.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.boqAdditions}</div>
                    <button
                      type="button"
                      onClick={() => setCustomBoqItems((items) => [...items, createBoqItem()])}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-emerald-700"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      {t.addBoqItem}
                    </button>
                  </div>
                  {customBoqItems.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-100 bg-white p-4">
                      <div className="mb-3 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => deleteCustomBoqItem(item.id)}
                          title={t.deleteBoqItem}
                          aria-label={t.deleteBoqItem}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.boqItemName}</label>
                          <input
                            value={item.name}
                            onChange={(event) => updateCustomBoqItem(item.id, 'name', event.target.value)}
                            className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.boqItemSpec}</label>
                          <input
                            value={item.spec}
                            onChange={(event) => updateCustomBoqItem(item.id, 'spec', event.target.value)}
                            className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.boqItemUnit}</label>
                          <input
                            value={item.unit}
                            onChange={(event) => updateCustomBoqItem(item.id, 'unit', event.target.value)}
                            className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.boqItemQuantity}</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(event) => updateCustomBoqItem(item.id, 'quantity', event.target.value)}
                              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.boqItemPrice}</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.priceAzn}
                              onChange={(event) => updateCustomBoqItem(item.id, 'priceAzn', event.target.value)}
                              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          </div>
        </div>

        <div className="xl:col-span-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard
              label={t.systemPower}
              value={`${formatNumber(result.requiredKw, 1)} kW`}
              note={`${t.systemPowerNote}: ${formatNumber(result.requiredKw, 1)} kW · ${t.actualDcPower}: ${formatNumber(result.systemKw, 2)} kW (${result.panelCount} × ${formatNumber(result.panelWattage)}W)`}
            />
            <ResultCard
              label={t.estimatedPrice}
              value={formatMoney(result.totalPriceAzn)}
              note={`${t.priceFormula}: ${estimatedPriceFormula}`}
            />
            <ResultCard label={t.yearlyProduction} value={`${formatNumber(result.yearlyProduction)} kWh`} note={`${formatNumber(result.monthlyProduction)} ${t.monthlyProduction}`} />
            <ResultCard label={t.payback} value={formatPaybackPeriod(result.paybackYears, t.years, t.months)} note={`${t.paybackFormula}: ${formatMoney(result.totalPriceAzn)} ÷ ${formatMoney(result.annualSavings)}`} />
            <div className="space-y-3 md:col-span-2">
              <ResultCard
                tone="recommended"
                selected={inverterSelectionMode === 'best' && Boolean(result.inverter)}
                onClick={result.inverter ? () => {
                  setInverterSelectionMode('best');
                  setIsManualInverterOpen(false);
                } : undefined}
                actionLabel={t.manualOverride}
                onAction={() => {
                  setInverterSelectionMode('manual');
                  setIsManualInverterOpen(true);
                }}
                label={t.recommendedInverter}
                value={result.inverter
                  ? `${result.inverter.quantity} x ${result.inverter.modelLabel}`
                  : isLoadingInverterOptions
                    ? 'Loading live inverter catalog…'
                    : 'No matching inverter'}
                note={result.inverter
                  ? `${formatNumber(result.inverter.totalDcKw, 2)} kWp DC / ${formatNumber(result.inverter.totalNominalAcKw, 2)} kW AC · DC/AC ${formatNumber(result.inverter.dcAcRatio, 3)} (hədəf ${TARGET_DC_AC_RATIO.toFixed(3)}, diapazon ${MIN_RECOMMENDED_DC_AC_RATIO.toFixed(2)}–${MAX_RECOMMENDED_DC_AC_RATIO.toFixed(2)}) · ${result.inverter.hasStock ? 'In stock' : 'Out of stock — procurement review required'} · ${result.inverter.hasCompleteEngineeringData ? 'Engineering data complete' : 'Preliminary — engineering review required'}`
                  : inverterCatalogError
                    ? 'Live inverter catalog could not be loaded. You can enter an explicit manual override below.'
                    : `No eligible inverter meets the ${MIN_RECOMMENDED_DC_AC_RATIO.toFixed(2)}–${MAX_RECOMMENDED_DC_AC_RATIO.toFixed(2)} DC/AC range and PV-power limit for this DC size.`}
              />
              <ResultCard
                tone="alternative"
                selected={inverterSelectionMode === 'second'}
                onClick={result.secondBestInverter ? () => {
                  setInverterSelectionMode('second');
                  setIsManualInverterOpen(false);
                } : undefined}
                actionLabel={t.manualOverride}
                onAction={() => {
                  setInverterSelectionMode('manual');
                  setIsManualInverterOpen(true);
                }}
                label={t.secondBestInverter}
                value={result.secondBestInverter
                  ? `${result.secondBestInverter.quantity} x ${result.secondBestInverter.modelLabel}`
                  : 'No second fitting option available'}
                note={result.secondBestInverter
                  ? `${formatNumber(result.secondBestInverter.totalDcKw, 2)} kWp DC / ${formatNumber(result.secondBestInverter.totalNominalAcKw, 2)} kW AC · DC/AC ${formatNumber(result.secondBestInverter.dcAcRatio, 3)} (hədəf ${TARGET_DC_AC_RATIO.toFixed(3)}, diapazon ${MIN_RECOMMENDED_DC_AC_RATIO.toFixed(2)}–${MAX_RECOMMENDED_DC_AC_RATIO.toFixed(2)}) · ${result.secondBestInverter.hasStock ? 'In stock' : 'Out of stock — procurement review required'} · ${result.secondBestInverter.hasCompleteEngineeringData ? 'Engineering data complete' : 'Preliminary — engineering review required'}`
                  : 'No distinct second configuration satisfies the inverter DC limit and preferred DC/AC range.'}
              />
              {isManualInverterOpen && (
                <div className={`rounded-3xl border p-5 ${
                  manualInverterIsValid
                    ? 'border-amber-300 bg-amber-50'
                    : 'border-red-300 bg-red-50'
                }`}>
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-sky-700">{t.manualOverride}</div>
                      <div className="mt-1 text-xs font-medium text-slate-600">{t.manualOverrideNote}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsManualInverterOpen(false)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/60"
                    >
                      {t.manualCollapse}
                    </button>
                  </div>
                  {!manualInverterIsValid && (
                    <div className="mb-4 text-xs font-black text-red-700">{t.manualRequired}</div>
                  )}
                  {manualInverterIsValid && (
                    <div className="mb-4 text-xs font-black text-amber-800">{t.manualReview}</div>
                  )}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">{t.inverterModel}</label>
                      <input
                        value={inverterModel}
                        onChange={(event) => setInverterModel(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">{t.inverterCount}</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={inverterCount}
                        onChange={(event) => setInverterCount(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">{t.inverterSpec}</label>
                      <textarea
                        value={inverterSpec}
                        onChange={(event) => setInverterSpec(event.target.value)}
                        rows={3}
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <ResultCard label={t.requiredArea} value={`${formatNumber(result.roofArea)} m²`} note={`${formatNumber(PANEL_AREA, 2)} m²/panel (${PANEL_WIDTH_METERS * 1000} × ${PANEL_HEIGHT_METERS * 1000} mm)`} />
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.formulas}</div>
                <h4 className="text-lg font-black text-slate-900">{t.formulaTitle}</h4>
              </div>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                {t.designBuffer} {DESIGN_BUFFER}
              </span>
            </div>
            <div className="space-y-3">
              {formulas.map((formula, index) => (
                <div key={formula} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-[10px] font-black text-white">{index + 1}</div>
                  <div className="text-sm font-bold text-slate-700 leading-relaxed">{formula}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-6 md:p-8 text-white">
            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">{t.salesNote}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-slate-400 text-xs mb-1">{t.yearlyInput}</div>
                <div className="font-black">{formatNumber(result.yearlyKWh)} kWh</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs mb-1">{t.rawRequirement}</div>
                <div className="font-black">{formatNumber(result.requiredKw, 1)} kW</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs mb-1">{t.dailyProduction}</div>
                <div className="font-black">{formatNumber(result.dailyProduction)} kWh</div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 text-xs font-semibold leading-relaxed text-slate-300">
              <p>{t.customerDocsNote}</p>
              <p>{t.connectionWarning}</p>
              <p>{t.preliminaryMark}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSolarCalculator;
