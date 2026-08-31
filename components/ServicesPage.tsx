
import React, { useState, useEffect } from 'react';
import {
  BadgeCheck,
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardCheck,
  Container,
  FileCheck2,
  Gauge,
  PanelsTopLeft,
  Truck,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { useService } from "../contexts/ServiceContext";
import PhoneNumberInput, { COUNTRY_CALLING_CODES, DEFAULT_COUNTRY_ISO2 } from './PhoneNumberInput';
import { useNotification } from '../contexts/NotificationContext';
import { trackConfirmedLead } from '../utils/analytics';

interface ServicesPageProps {
  lang?: 'az' | 'en' | 'ru' | 'tr';
  onBack?: () => void;
  initialService?: string | number;
  focusToken?: string | number;
}

const languageReverseMap = {
  1: "az",
  2: "en",
  3: "ru",
  4: "tr",
} as const;

type LangCode = 'az' | 'en' | 'ru' | 'tr';

const SERVICE_ICON_MAP: Record<string, LucideIcon> = {
  "Günəş": PanelsTopLeft,
  "Sayğac": Gauge,
  "Maliyyə": CircleDollarSign,
  "Parametrlər": Wrench,
  "Texniki": FileCheck2,
  "Konsultasiya": ClipboardCheck,
};

interface CorporateService {
  title: string;
  description: string;
  bullets: string[];
  icon: LucideIcon;
  detailPageSlug: string;
}

const CORPORATE_SERVICES: Record<LangCode, CorporateService[]> = {
  az: [
    {
      title: 'Topdan Satış və Konteyner Təchizatı',
      description: 'Solarix korporativ müştərilər və iri layihələr üçün günəş enerjisi avadanlıqlarının topdan satışını həyata keçirir.',
      bullets: [
        'Günəş panelləri, inverterlər və enerji saxlama sistemləri',
        'Tam konteyner — FCL və iri həcmli təchizat',
        'Layihəyə uyğun qarışıq məhsul partiyalarının hazırlanması',
        'Böyük sifarişlər üçün xüsusi korporativ qiymətlər',
      ],
      icon: Container,
      detailPageSlug: 'wholesale-container-supply',
    },
    {
      title: 'LONGi-nin Azərbaycanda Yeganə Rəsmi Tərəfdaşı',
      description: 'Solarix Azərbaycanda LONGi məhsullarının yeganə rəsmi tərəfdaşı olaraq orijinal və sertifikatlaşdırılmış günəş panelləri təqdim edir.',
      bullets: [
        'Orijinal və sertifikatlaşdırılmış LONGi məhsulları',
        'İstehsalçı zəmanəti və mənşə sənədləri',
        'Məhsulun autentikliyinin və seriya nömrəsinin yoxlanılması',
        'Rəsmi satış, texniki və zəmanət dəstəyi',
      ],
      icon: BadgeCheck,
      detailPageSlug: 'longi-official-partner',
    },
    {
      title: 'Açar Təhvil Günəş Enerjisi Layihələri',
      description: 'Solarix layihələndirmə, avadanlıq təchizatı, quraşdırma və istismara vermə daxil olmaqla tam EPC xidmətləri göstərir.',
      bullets: [
        'Obyektə baxış və texniki qiymətləndirmə',
        'Günəş panelləri və montaj konstruksiyalarının quraşdırılması',
        'İnverter, kabel və elektrik avadanlıqlarının montajı',
        'Sistemin sınaqdan keçirilməsi və istismara verilməsi',
      ],
      icon: PanelsTopLeft,
      detailPageSlug: 'turnkey-solar-projects',
    },
    {
      title: 'Layihələndirmə və ROI Analizi',
      description: 'Korporativ obyektlər üçün optimal sistem gücü, enerji istehsalı və investisiyanın geri dönüşü hesablanır.',
      bullets: [
        'Elektrik sərfiyyatına uyğun sistem gücünün hesablanması',
        'İllik enerji istehsalı və qənaət proqnozu',
        'İnvestisiyanın geri dönüş müddəti və ROI analizi',
        'Avadanlıq tərkibinin və layihə uyğunluğunun müəyyən edilməsi',
      ],
      icon: ChartNoAxesCombined,
      detailPageSlug: 'design-roi-analysis',
    },
    {
      title: 'Logistika və Korporativ Təchizat',
      description: 'İri həcmli sifarişlərin istehsalçıdan layihə ünvanına qədər çatdırılması və təchizat prosesi idarə olunur.',
      bullets: [
        'Konteyner və beynəlxalq yükdaşımaların koordinasiyası',
        'Gömrük və idxal sənədlərinin hazırlanmasına dəstək',
        'Mənşə və uyğunluq sertifikatlarının təqdim edilməsi',
        'Mərhələli çatdırılma və anbarlama imkanları',
      ],
      icon: Truck,
      detailPageSlug: 'logistics-corporate-supply',
    },
    {
      title: 'Texniki Xidmət və Satışdan Sonrakı Dəstək',
      description: 'Günəş sistemlərinin uzunmüddətli, təhlükəsiz və yüksək məhsuldarlıqla işləməsi üçün tam texniki dəstək təqdim edilir.',
      bullets: [
        'Planlı texniki baxış və sistem diaqnostikası',
        'Panel, inverter və elektrik bağlantılarının yoxlanılması',
        'Monitorinq və enerji istehsalı göstəricilərinin təhlili',
        'Zəmanət və zəmanətdən sonrakı servis dəstəyi',
      ],
      icon: Wrench,
      detailPageSlug: 'maintenance-after-sales-support',
    },
  ],
  en: [
    {
      title: 'Wholesale and Container Supply',
      description: 'Solarix supplies solar energy equipment wholesale for corporate customers and large-scale projects.',
      bullets: [
        'Solar panels, inverters, and energy storage systems',
        'Full-container (FCL) and high-volume supply',
        'Mixed product batches prepared to project requirements',
        'Special corporate pricing for large orders',
      ],
      icon: Container,
      detailPageSlug: 'wholesale-container-supply',
    },
    {
      title: "LONGi's Only Official Partner in Azerbaijan",
      description: 'As the only official LONGi partner in Azerbaijan, Solarix provides genuine and certified solar panels.',
      bullets: [
        'Genuine and certified LONGi products',
        'Manufacturer warranty and certificates of origin',
        'Product authenticity and serial-number verification',
        'Official sales, technical, and warranty support',
      ],
      icon: BadgeCheck,
      detailPageSlug: 'longi-official-partner',
    },
    {
      title: 'Turnkey Solar Energy Projects',
      description: 'Solarix provides complete EPC services, including design, equipment supply, installation, and commissioning.',
      bullets: [
        'Site survey and technical assessment',
        'Installation of solar panels and mounting structures',
        'Installation of inverters, cabling, and electrical equipment',
        'System testing and commissioning',
      ],
      icon: PanelsTopLeft,
      detailPageSlug: 'turnkey-solar-projects',
    },
    {
      title: 'Design and ROI Analysis',
      description: 'We calculate optimal system capacity, energy generation, and investment payback for corporate facilities.',
      bullets: [
        'System sizing based on electricity consumption',
        'Annual energy generation and savings forecast',
        'Payback period and ROI analysis',
        'Equipment selection and project suitability assessment',
      ],
      icon: ChartNoAxesCombined,
      detailPageSlug: 'design-roi-analysis',
    },
    {
      title: 'Logistics and Corporate Supply',
      description: 'We manage delivery and supply of high-volume orders from the manufacturer to the project site.',
      bullets: [
        'Container and international freight coordination',
        'Support with customs and import documentation',
        'Certificates of origin and conformity',
        'Phased delivery and warehousing options',
      ],
      icon: Truck,
      detailPageSlug: 'logistics-corporate-supply',
    },
    {
      title: 'Maintenance and After-Sales Support',
      description: 'Complete technical support keeps solar systems safe, productive, and reliable over the long term.',
      bullets: [
        'Scheduled maintenance and system diagnostics',
        'Inspection of panels, inverters, and electrical connections',
        'Monitoring and energy-generation performance analysis',
        'Warranty and post-warranty service support',
      ],
      icon: Wrench,
      detailPageSlug: 'maintenance-after-sales-support',
    },
  ],
  ru: [
    {
      title: 'Оптовые продажи и контейнерные поставки',
      description: 'Solarix осуществляет оптовые поставки оборудования для солнечной энергетики корпоративным клиентам и крупным проектам.',
      bullets: [
        'Солнечные панели, инверторы и системы накопления энергии',
        'Полные контейнеры — FCL и крупнообъёмные поставки',
        'Комплектация смешанных партий под требования проекта',
        'Специальные корпоративные цены для крупных заказов',
      ],
      icon: Container,
      detailPageSlug: 'wholesale-container-supply',
    },
    {
      title: 'Единственный официальный партнёр LONGi в Азербайджане',
      description: 'Solarix, являясь единственным официальным партнёром LONGi в Азербайджане, предлагает оригинальные и сертифицированные солнечные панели.',
      bullets: [
        'Оригинальная и сертифицированная продукция LONGi',
        'Гарантия производителя и документы о происхождении',
        'Проверка подлинности продукции и серийного номера',
        'Официальная техническая, гарантийная и сервисная поддержка',
      ],
      icon: BadgeCheck,
      detailPageSlug: 'longi-official-partner',
    },
    {
      title: 'Солнечные энергетические проекты под ключ',
      description: 'Solarix предоставляет полный комплекс EPC-услуг: проектирование, поставку оборудования, монтаж и ввод системы в эксплуатацию.',
      bullets: [
        'Обследование объекта и техническая оценка',
        'Монтаж солнечных панелей и несущих конструкций',
        'Монтаж инверторов, кабелей и электрооборудования',
        'Испытание системы и ввод в эксплуатацию',
      ],
      icon: PanelsTopLeft,
      detailPageSlug: 'turnkey-solar-projects',
    },
    {
      title: 'Проектирование и анализ ROI',
      description: 'Для корпоративных объектов рассчитываются оптимальная мощность системы, выработка энергии и срок окупаемости инвестиций.',
      bullets: [
        'Расчёт мощности системы по потреблению электроэнергии',
        'Прогноз годовой выработки энергии и экономии',
        'Расчёт срока окупаемости и ROI',
        'Подбор оборудования и оценка соответствия проекту',
      ],
      icon: ChartNoAxesCombined,
      detailPageSlug: 'design-roi-analysis',
    },
    {
      title: 'Логистика и корпоративные поставки',
      description: 'Мы управляем доставкой и снабжением крупных заказов от производителя непосредственно до проектного объекта.',
      bullets: [
        'Координация контейнерных и международных перевозок',
        'Поддержка в подготовке таможенных и импортных документов',
        'Предоставление сертификатов происхождения и соответствия',
        'Поэтапная доставка и возможности складского хранения',
      ],
      icon: Truck,
      detailPageSlug: 'logistics-corporate-supply',
    },
    {
      title: 'Техническое и послепродажное обслуживание',
      description: 'Полная техническая поддержка обеспечивает безопасную, эффективную и долговременную работу солнечных систем.',
      bullets: [
        'Плановое техническое обслуживание и диагностика системы',
        'Проверка панелей, инверторов и электрических соединений',
        'Мониторинг и анализ показателей выработки энергии',
        'Гарантийная и послегарантийная сервисная поддержка',
      ],
      icon: Wrench,
      detailPageSlug: 'maintenance-after-sales-support',
    },
  ],
  tr: [
    {
      title: 'Toptan Satış ve Konteyner Tedariki',
      description: 'Solarix, kurumsal müşteriler ve büyük ölçekli projeler için güneş enerjisi ekipmanlarının toptan satışını gerçekleştirir.',
      bullets: [
        'Güneş panelleri, inverterler ve enerji depolama sistemleri',
        'Tam konteyner — FCL ve yüksek hacimli tedarik',
        'Proje gereksinimlerine uygun karma ürün partilerinin hazırlanması',
        'Büyük siparişler için özel kurumsal fiyatlar',
      ],
      icon: Container,
      detailPageSlug: 'wholesale-container-supply',
    },
    {
      title: "LONGi'nin Azerbaycan'daki Tek Resmî Ortağı",
      description: "Solarix, LONGi'nin Azerbaycan'daki tek resmî ortağı olarak orijinal ve sertifikalı güneş panelleri sunar.",
      bullets: [
        'Orijinal ve sertifikalı LONGi ürünleri',
        'Üretici garantisi ve menşe belgeleri',
        'Ürün orijinalliği ve seri numarası doğrulaması',
        'Resmî satış, teknik ve garanti desteği',
      ],
      icon: BadgeCheck,
      detailPageSlug: 'longi-official-partner',
    },
    {
      title: 'Anahtar Teslim Güneş Enerjisi Projeleri',
      description: 'Solarix; projelendirme, ekipman tedariki, kurulum ve devreye alma dâhil eksiksiz EPC hizmetleri sunar.',
      bullets: [
        'Saha incelemesi ve teknik değerlendirme',
        'Güneş panelleri ve montaj konstrüksiyonlarının kurulumu',
        'İnverter, kablo ve elektrik ekipmanlarının montajı',
        'Sistem testleri ve devreye alma',
      ],
      icon: PanelsTopLeft,
      detailPageSlug: 'turnkey-solar-projects',
    },
    {
      title: 'Projelendirme ve ROI Analizi',
      description: 'Kurumsal tesisler için optimum sistem gücü, enerji üretimi ve yatırımın geri dönüşü hesaplanır.',
      bullets: [
        'Elektrik tüketimine göre sistem gücü hesabı',
        'Yıllık enerji üretimi ve tasarruf tahmini',
        'Geri ödeme süresi ve ROI analizi',
        'Ekipman seçimi ve projeye uygunluk değerlendirmesi',
      ],
      icon: ChartNoAxesCombined,
      detailPageSlug: 'design-roi-analysis',
    },
    {
      title: 'Lojistik ve Kurumsal Tedarik',
      description: 'Yüksek hacimli siparişlerin üreticiden proje adresine kadar teslimat ve tedarik süreci yönetilir.',
      bullets: [
        'Konteyner ve uluslararası taşımaların koordinasyonu',
        'Gümrük ve ithalat belgelerinin hazırlanmasına destek',
        'Menşe ve uygunluk sertifikalarının sunulması',
        'Aşamalı teslimat ve depolama olanakları',
      ],
      icon: Truck,
      detailPageSlug: 'logistics-corporate-supply',
    },
    {
      title: 'Teknik Servis ve Satış Sonrası Destek',
      description: 'Güneş sistemlerinin uzun süre güvenli ve yüksek verimle çalışması için eksiksiz teknik destek sağlanır.',
      bullets: [
        'Planlı teknik bakım ve sistem teşhisi',
        'Panel, inverter ve elektrik bağlantılarının kontrolü',
        'İzleme ve enerji üretim verilerinin analizi',
        'Garanti ve garanti sonrası servis desteği',
      ],
      icon: Wrench,
      detailPageSlug: 'maintenance-after-sales-support',
    },
  ],
};

const serviceMatchers: Record<string, string[]> = {
  'smart-meter-monitoring': ['smart', 'saygac', 'inteqrasiya', 'monitorinq', 'meter', 'monitoring'],
  'finance-credit': ['maliyye', 'kredit', 'helleri', 'credit', 'finance'],
  'legal-formalization': ['huquqi', 'texniki', 'resmilesdirme', 'legal', 'formalization'],
  'energy-audit': ['konsultasiya', 'enerji', 'auditi', 'consultation', 'audit'],
  installation: ['gunes', 'sistemlerinin', 'qurasdirilmasi', 'installation'],
  'design-roi': ['sistem', 'layihelendirilmesi', 'roi', 'analizi', 'design']
};

const serviceTargetTitles: Record<string, string[]> = {
  'design-roi': ['Sistem Layihələndirilməsi və ROI Analizi'],
  installation: ['Günəş Sistemlərinin Quraşdırılması'],
  'energy-audit': ['Konsultasiya və Enerji Auditi'],
  'legal-formalization': ['Hüquqi və Texniki Rəsmiləşdirmə'],
  'finance-credit': ['Maliyyə və Kredit Həlləri'],
  'smart-meter-monitoring': ['Smart Sayğac İnteqrasiyası və Monitorinq']
};

const normalizeServiceText = (value: string) =>
  value
    .toLocaleLowerCase('az-AZ')
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u');

const getResidentialServiceIcon = (title: string, backendIcon?: string): LucideIcon => {
  const normalizedTitle = normalizeServiceText(title);

  if (normalizedTitle.includes('saygac') || normalizedTitle.includes('meter')) return Gauge;
  if (normalizedTitle.includes('maliyye') || normalizedTitle.includes('finance') || normalizedTitle.includes('kredit')) return CircleDollarSign;
  if (normalizedTitle.includes('huquqi') || normalizedTitle.includes('legal') || normalizedTitle.includes('resmilesdirme')) return FileCheck2;
  if (normalizedTitle.includes('konsultasiya') || normalizedTitle.includes('consult') || normalizedTitle.includes('audit')) return ClipboardCheck;
  if (normalizedTitle.includes('roi') || normalizedTitle.includes('layihelendirme') || normalizedTitle.includes('design')) return ChartNoAxesCombined;
  if (normalizedTitle.includes('qurasdirma') || normalizedTitle.includes('installation')) return PanelsTopLeft;

  return SERVICE_ICON_MAP[backendIcon || 'Günəş'] || PanelsTopLeft;
};

const ServicesPage: React.FC<ServicesPageProps> = ({ lang = 'az', onBack, initialService, focusToken }) => {

  const { showNotification } = useNotification();

  const {
  services,
  categorySettings,
  getServices,
  getCategorySettings,
  createServiceRequest
} = useService();

 

  const [formData, setFormData] = useState({
    serviceType: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'none' | 'success' | 'error'>('none');
  const [phoneCountry, setPhoneCountry] = useState(DEFAULT_COUNTRY_ISO2);
  const [focusedServiceId, setFocusedServiceId] = useState<string | number | null>(null);
  const [activeAudience, setActiveAudience] = useState<'residential' | 'corporate'>('residential');

  const t = {
  serviceType: {
    az: "Xidmət növü",
    en: "Service Type",
    ru: "Тип услуги",
    tr: "Hizmet Türü",
  },

  title: {
    az: "Xidmətlər",
    en: "Services",
    ru: "Услуги",
    tr: "Hizmetler",
  },

  residential: {
    az: "Əhali",
    en: "Residential",
    ru: "Жилые",
    tr: "Konut",
  },

  corporate: {
    az: "Korporativ",
    en: "Corporative",
    ru: "Корпоративные",
    tr: "Kurumsal",
  },

  readMore: {
    az: "Ətraflı oxu",
    en: "Read More",
    ru: "Подробнее",
    tr: "Devamını Oku",
  },

  back: {
    az: "Geri qayıt",
    en: "Back",
    ru: "Назад",
    tr: "Geri dön",
  },

  apply: {
    az: "Müraciət et",
    en: "Apply Now",
    ru: "Подать заявку",
    tr: "Başvur",
  },

  formTitle: {
    az: "Xidmət üçün müraciət",
    en: "Apply for Service",
    ru: "Заявка на услугу",
    tr: "Hizmet Başvurusu",
  },

  formDesc: {
    az: "Məlumatlarınızı daxil edin, mütəxəssislərimiz sizinlə əlaqə saxlasın.",
    en: "Enter your details, our specialists will contact you.",
    ru: "Введите свои данные, и наши специалисты свяжутся с вами.",
    tr: "Bilgilerinizi girin, uzmanlarımız sizinle iletişime geçsin.",
  },

  firstName: {
    az: "Ad",
    en: "First Name",
    ru: "Имя",
    tr: "Ad",
  },

  lastName: {
    az: "Soyad",
    en: "Last Name",
    ru: "Фамилия",
    tr: "Soyad",
  },

  email: {
    az: "E-mail",
    en: "Email",
    ru: "Электронная почта",
    tr: "E-posta",
  },

  phone: {
    az: "Əlaqə nömrəsi",
    en: "Phone Number",
    ru: "Номер телефона",
    tr: "Telefon Numarası",
  },

  message: {
    az: "Qısa mesaj (maks. 300 simvol)",
    en: "Short message (max. 300 chars)",
    ru: "Краткое сообщение (макс. 300 символов)",
    tr: "Kısa mesaj (maks. 300 karakter)",
  },

  send: {
    az: "Göndər",
    en: "Send",
    ru: "Отправить",
    tr: "Gönder",
  },

  success: {
    az: "Müraciətiniz uğurla göndərildi!",
    en: "Your application has been sent successfully!",
    ru: "Ваша заявка успешно отправлена!",
    tr: "Başvurunuz başarıyla gönderildi!",
  },

  error: {
    az: "Xəta baş verdi. Yenidən cəhd edin.",
    en: "An error occurred. Please try again.",
    ru: "Произошла ошибка. Пожалуйста, попробуйте снова.",
    tr: "Bir hata oluştu. Lütfen tekrar deneyin.",
  },
  scrollToApply: {
  az: "Müraciət etmək üçün aşağı sürüşdürün",
  en: "Scroll down to apply",
  ru: "Прокрутите вниз, чтобы подать заявку",
  tr: "Başvurmak için aşağı kaydırın",
},
selectService: {
  az: "Xidmət seçin",
  en: "Select a service",
  ru: "Выберите услугу",
  tr: "Bir hizmet seçin",
},
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'message' && value.length > 300) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setSubmitStatus("none");

  try {
    const dialCode = COUNTRY_CALLING_CODES.find((c) => c.iso2 === phoneCountry)?.dialCode || '+994';
    const analyticsRequestId = crypto.randomUUID();

    await createServiceRequest({
      name: formData.firstName,
      surname: formData.lastName,
      email: formData.email,
      phone: `${dialCode} ${formData.phone}`.trim(),
      message: formData.message,
      serviceManagementId: Number(formData.serviceType),
    });

    trackConfirmedLead(
      'quote_request_submit',
      'service_request',
      lang,
      analyticsRequestId,
    );

    setSubmitStatus("success");
    showNotification(t.success[lang], 'success');

    setFormData({
      serviceType: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
    });
  } catch (error) {
    console.error(error);
    setSubmitStatus("error");
    showNotification(t.error[lang], 'error');
  } finally {
    setIsSubmitting(false);
  }
};

    const transformService = (item: any, activeLang: LangCode) => {
    const langItem = item.languages?.find(
      (l: any) => languageReverseMap[l.languageCode] === activeLang
    );
    const fallbackLangItem = item.languages?.find((l: any) => l.languageCode === 1);

    return {
      id: item.id,
      title: langItem?.title ?? fallbackLangItem?.title ?? "",
      description: langItem?.description ?? fallbackLangItem?.description ?? "",
      content1: langItem?.content1 ?? fallbackLangItem?.content1 ?? "",
      content2: langItem?.content2 ?? fallbackLangItem?.content2 ?? "",
      content3: langItem?.content3 ?? fallbackLangItem?.content3 ?? "",
      content4: langItem?.content4 ?? fallbackLangItem?.content4 ?? "",
      icon: item.icon ?? "Günəş",
      iconHint: langItem?.title ?? fallbackLangItem?.title ?? "",
      category: Number(item.category || 1),
      readMoreUrl: item.readMoreUrl || "",
      detailPageSlug: item.detailPageSlug || "",
      bannerImageUrl: item.bannerImageUrl || "",
      detailContentHtml: langItem?.detailContentHtml ?? fallbackLangItem?.detailContentHtml ?? "",
    };
  };;
  const safeServices = services.map(s =>
    transformService(s, lang)
  );
   useEffect(() => {
      void Promise.all([getServices(), getCategorySettings()]);
    }, [lang]);

  useEffect(() => {
    if (!initialService || safeServices.length === 0) return;
    setActiveAudience('residential');
    const initialServiceText = String(initialService);
    const directMatch = safeServices.find((service) => String(service.id) === initialServiceText);
    const targetTitles = serviceTargetTitles[initialServiceText] || [];
    const titleMatch = safeServices.find((service) => {
      const normalizedTitle = normalizeServiceText(service.title || '');
      return targetTitles.some((title) => normalizedTitle === normalizeServiceText(title));
    });
    const matchers = serviceMatchers[initialServiceText] || [];
    const scoredMatches = safeServices.map((service) => {
      const searchableText = normalizeServiceText(
        [service.title, service.description, service.content1, service.content2, service.content3, service.content4, service.icon]
          .filter(Boolean)
          .join(' ')
      );

      return {
        service,
        score: matchers.reduce((sum, keyword) => sum + (searchableText.includes(normalizeServiceText(keyword)) ? 1 : 0), 0)
      };
    }).sort((a, b) => b.score - a.score);
    const keywordMatch = scoredMatches[0]?.score > 0 ? scoredMatches[0].service : undefined;
    const targetService = directMatch || titleMatch || keywordMatch;

    if (!targetService) return;

    setFocusedServiceId(targetService.id);
    const clearHighlight = window.setTimeout(() => setFocusedServiceId(null), 3000);
    const scrollTimer = window.setTimeout(() => {
      document.getElementById(`service-${targetService.id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 0);

    return () => {
      window.clearTimeout(clearHighlight);
      window.clearTimeout(scrollTimer);
    };
  }, [initialService, focusToken, services.length, lang]);

  const corporateLanguage = lang;
  const populationServices = safeServices.filter((service) => service.category === 1);
  const corporateServices = safeServices.filter((service) => service.category === 2);
  const corporateCards = CORPORATE_SERVICES[corporateLanguage].map((fallbackService) => {
    const managedService = corporateServices.find((service) => service.detailPageSlug === fallbackService.detailPageSlug);
    if (!managedService) return fallbackService;

    return {
      ...fallbackService,
      ...managedService,
      title: managedService.title || fallbackService.title,
      description: managedService.description || fallbackService.description,
      bullets: [managedService.content1, managedService.content2, managedService.content3, managedService.content4].filter(Boolean),
    };
  });
  const activeCategory = activeAudience === 'residential' ? 1 : 2;
  const activeReadMoreEnabled = categorySettings.find((setting) => setting.category === activeCategory)?.isReadMoreEnabled
    ?? activeCategory === 2;
  const visibleServiceCards = activeAudience === 'residential'
    ? populationServices.map((service) => ({
        key: `residential-${service.id}`,
        elementId: `service-${service.id}`,
        serviceId: service.id,
        title: service.title,
        description: service.description,
        bullets: [service.content1, service.content2, service.content3, service.content4].filter(Boolean),
        icon: getResidentialServiceIcon(service.iconHint, service.icon),
        readMoreUrl: service.readMoreUrl,
        detailPageSlug: service.detailPageSlug,
      }))
    : corporateCards.map((service: any, index) => ({
        key: `corporate-${index}`,
        elementId: `corporate-service-${index + 1}`,
        serviceId: null,
        title: service.title,
        description: service.description,
        bullets: service.bullets || [service.content1, service.content2, service.content3, service.content4].filter(Boolean),
        icon: service.iconHint ? getResidentialServiceIcon(service.iconHint, service.icon) : service.icon,
        readMoreUrl: service.readMoreUrl || '',
        detailPageSlug: service.detailPageSlug || '',
      }));

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-emerald-950 py-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between relative z-10">
          <button onClick={onBack} className="flex items-center gap-1.5 text-emerald-300/60 hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t.back[lang]}
          </button>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">{t.title[lang]}</h1>
        </div>
      </section>

      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="mb-10 flex justify-center">
            <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm" role="tablist" aria-label={t.title[lang]}>
              {(['residential', 'corporate'] as const).map((audience) => {
                const isActive = activeAudience === audience;
                return (
                  <button
                    key={audience}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveAudience(audience)}
                    className={`rounded-xl px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-colors sm:px-9 ${
                      isActive
                        ? 'bg-[var(--color-dark)] text-white shadow-md'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {t[audience][lang]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {visibleServiceCards.map((service) => {
              const ServiceIcon = service.icon;
              const isFocused = service.serviceId !== null && String(focusedServiceId) === String(service.serviceId);
              const localizedServiceBase = lang === 'az' ? '/services' : `/${lang}/services`;
              const readMoreHref = service.readMoreUrl
                || (service.detailPageSlug ? `${localizedServiceBase}/${service.detailPageSlug}` : '')
                || (service.serviceId !== null ? `${localizedServiceBase}?service=${service.serviceId}` : localizedServiceBase);
              return (
                <article
                  key={service.key}
                  id={service.elementId}
                  className={`group flex flex-col rounded-[2rem] border p-8 shadow-sm transition-all duration-500 hover:border-[var(--color-primary)] hover:shadow-2xl ${
                    isFocused
                      ? 'border-[var(--color-primary)] bg-emerald-50 ring-2 ring-[var(--color-primary)]/30 shadow-2xl shadow-emerald-900/10'
                      : 'border-slate-100 bg-white'
                  }`}
                >
                  <div className="mb-6">
                    <div className="mb-3 flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_9%,white)] text-[var(--color-primary)] shadow-inner transition-all duration-500 group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-dark)]">
                        <ServiceIcon className="h-6 w-6" strokeWidth={1.7} aria-hidden="true" />
                      </div>
                      <h3 className="pt-1 text-lg font-black leading-tight text-slate-900 transition-colors group-hover:text-[var(--color-primary)]">
                        {service.title || ''}
                      </h3>
                    </div>
                    <p className="text-[11px] font-medium leading-relaxed text-slate-400">
                      {service.description}
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {service.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                        <span className="text-xs font-bold leading-relaxed text-slate-600">{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {activeReadMoreEnabled && readMoreHref && (
                    <div className="mt-auto pt-8">
                      <a
                        href={readMoreHref}
                        target={/^https?:\/\//i.test(readMoreHref) ? '_blank' : undefined}
                        rel={/^https?:\/\//i.test(readMoreHref) ? 'noreferrer' : undefined}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--color-dark)] px-5 py-3 text-center text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-[var(--color-primary)] hover:text-[var(--color-dark)]"
                      >
                        {t.readMore[lang]}
                      </a>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {/* Scroll Down Arrow */}
          <div className="flex flex-col items-center justify-center mb-16 animate-bounce cursor-pointer group" 
               onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })}>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-hover:text-[var(--color-primary)] transition-colors">
              {t.scrollToApply[lang]}
            </span>
            <div className="w-12 h-12 bg-white rounded-full border border-slate-100 shadow-md flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-dark)] transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7-7-7m14-8l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Application Form */}
          <div id="application-form" className="max-w-4xl mx-auto">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-emerald-900/5 border border-slate-100">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-3">{t.formTitle[lang]}</h2>
                <p className="text-slate-500 text-sm font-medium">{t.formDesc[lang]}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t.serviceType[lang]}</label>
                  <div className="relative group">
                    <select
                      required
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-bold text-slate-900 appearance-none cursor-pointer"
                    >
                      <option value="" disabled>{t.selectService[lang]}</option>
                      {safeServices.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.title }
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-emerald-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t.firstName[lang]}</label>
                    <input 
                      required
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-bold text-slate-900"
                      placeholder="..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t.lastName[lang]}</label>
                    <input 
                      required
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-bold text-slate-900"
                      placeholder="..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t.email[lang]}</label>
                    <input 
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-bold text-slate-900"
                      placeholder="example@mail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t.phone[lang]}</label>
                    <PhoneNumberInput
                      required
                      countryIso2={phoneCountry}
                      onCountryChange={setPhoneCountry}
                      localNumber={formData.phone}
                      onLocalNumberChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
                      placeholder="50 123 45 67"
                      containerClassName="h-14 border-transparent bg-slate-50 focus-within:bg-white"
                      inputClassName="px-6 text-sm font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-4 mr-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.message[lang]}</label>
                    <span className="text-[10px] font-bold text-slate-300">{formData.message.length}/300</span>
                  </div>
                  <textarea 
                    required
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-bold text-slate-900 resize-none"
                    placeholder="..."
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`relative flex w-full items-center justify-center gap-2 overflow-hidden py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.98] disabled:cursor-not-allowed ${submitStatus === 'success' ? 'bg-emerald-600 text-white shadow-emerald-600/20' : isSubmitting ? 'bg-sky-600 text-white shadow-sky-600/20' : 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-slate-900'}`}
                >
                  {submitStatus === 'success' ? (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      {t.success[lang]}
                    </>
                  ) : isSubmitting ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" /><path className="opacity-90" fill="currentColor" d="M12 3a9 9 0 00-9 9h3a6 6 0 016-6V3z" /></svg>
                      {t.send[lang]}
                    </>
                  ) : t.send[lang]}
                </button>

                {submitStatus === 'success' && (
                  <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-center text-xs font-bold animate-in fade-in slide-in-from-top-1">
                    {t.success[lang]}
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-center text-xs font-bold animate-in fade-in slide-in-from-top-1">
                    {t.error[lang]}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
