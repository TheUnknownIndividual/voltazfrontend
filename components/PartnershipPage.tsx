import React, { useEffect, useRef, useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import {
  PartnershipDirection,
  loadPartnershipDirections
} from './partnershipDirections';
import { usePartnership } from '@/contexts/PartnershipContext';
import PhoneNumberInput, { COUNTRY_CALLING_CODES, DEFAULT_COUNTRY_ISO2 } from './PhoneNumberInput';

interface PartnershipPageProps {
  lang?: 'az' | 'en' | 'ru' | 'tr';
  onBack?: () => void;
}

type Lang = 'az' | 'en' | 'ru' | 'tr';
type LocalizedText = { az: string; en?: string; ru?: string; tr?: string };

interface Partner {
  name: string | LocalizedText;
  logo: string;
  logoScale?: number;
  description?: LocalizedText;
}

interface PartnerGroup {
  id: string;
  title: LocalizedText;
  eyebrow: LocalizedText;
  summary: LocalizedText;
  accent: string;
  partners: Partner[];
}

const FALLBACK_LOGO =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 80"%3E%3Crect width="160" height="80" rx="18" fill="%23f2fff0"/%3E%3Cpath d="M28 52h104M39 32h82M50 20h60" stroke="%2300463c" stroke-width="6" stroke-linecap="round"/%3E%3Ccircle cx="80" cy="40" r="9" fill="%2340dc3a"/%3E%3C/svg%3E';
const VOLT_LOGO = 'https://i.ibb.co/zHF55zs5/Simple-Modern-Yoga-Studio-Logo-removebg-preview-1.png';
const VIRTUAL_AZERBAIJAN_LOGO = new URL('./virtualazerbaijan.png', import.meta.url).href;
const AIKTSA_LOGO = new URL('./aiktsa.png', import.meta.url).href;
const SOLARIX_LOGO = new URL('./solarix.png', import.meta.url).href;

const partnerGroups: PartnerGroup[] = [
  {
    id: 'international-technology',
    title: {
      az: 'Beynəlxalq texnologiya tərəfdaşları',
      en: 'International technology partners',
      ru: 'Международные технологические партнеры',
      tr: 'Uluslararası teknoloji ortakları'
    },
    eyebrow: {
      az: 'Beynalxalq / qlobal avadanlıq',
      en: 'Non-local / global equipment',
      ru: 'Международное оборудование',
      tr: 'Yerel olmayan / küresel ekipman'
    },
    summary: {
      az: 'Günəş paneli, invertor və qoruma komponentləri üzrə rəsmi avadanlıq ekosistemi.',
      en: 'Official equipment ecosystem for solar panels, inverters and protection components.',
      ru: 'Экосистема официального оборудования для панелей, инверторов и защитных компонентов.',
      tr: 'Güneş panelleri, invertörler ve koruma bileşenleri için resmi ekipman ekosistemi.'
    },
    accent: 'border-emerald-600',
    partners: [
      {
        name: 'Growatt',
        logo: 'https://i.ibb.co/SXkswsMF/image-removebg-preview.png',
        logoScale: 2.35,
        description: {
          az: 'İnvertor və enerji idarəetmə texnologiyaları',
          en: 'Inverter and energy management technologies',
          ru: 'Инверторы и технологии управления энергией',
          tr: 'İnvertör ve enerji yönetimi teknolojileri'
        }
      },
      {
        name: 'LONGi Solar',
        logo: 'https://i.ibb.co/8pDYTN9/image-removebg-preview-1.png',
        logoScale: 1.35,
        description: {
          az: 'Yüksək səmərəli günəş paneli həlləri',
          en: 'High-efficiency solar panel solutions',
          ru: 'Высокоэффективные решения солнечных панелей',
          tr: 'Yüksek verimli güneş paneli çözümleri'
        }
      },
      {
        name: 'Suntree',
        logo: 'https://i.ibb.co/WWjTwptK/image-removebg-preview-4.png',
        logoScale: 1.2,
        description: {
          az: 'DC qoruma, kommutasiya və solar elektrik komponentləri',
          en: 'DC protection, switching and solar electrical components',
          ru: 'DC-защита, коммутация и солнечные электрические компоненты',
          tr: 'DC koruma, anahtarlama ve solar elektrik bileşenleri'
        }
      }
    ]
  },
  {
    id: 'international-funding',
    title: {
      az: 'Beynəlxalq maliyyələşmə',
      en: 'International funding',
      ru: 'Международное финансирование',
      tr: 'Uluslararası finansman'
    },
    eyebrow: {
      az: 'Beynalxalq / yaşıl maliyyə',
      en: 'Non-local / green finance',
      ru: 'Международное зеленое финансирование',
      tr: 'Yerel olmayan / yeşil finans'
    },
    summary: {
      az: 'Bərpa olunan enerji layihələri üçün beynəlxalq maliyyə, məsləhət və kredit dəstəyi istiqaməti.',
      en: 'International financing, advisory and credit support direction for renewable energy projects.',
      ru: 'Международное финансирование, консультации и кредитная поддержка проектов ВИЭ.',
      tr: 'Yenilenebilir enerji projeleri için uluslararası finansman, danışmanlık ve kredi desteği alanı.'
    },
    accent: 'border-blue-600',
    partners: [
      {
        name: 'EBRD',
        logo: 'https://i.ibb.co/9mN5Lyrp/image.png',
        logoScale: 1.15,
        description: {
          az: '“Həyatları dəyişmək üçün sərmayə yatırırıq.” EBRD üç qitədə uğurlu bazar iqtisadiyyatlarına keçidi dəstəkləyir. Bərpa olunan enerji layihələrində kredit xidmətləri, məsləhət və siyasət islahatları ilə yanaşı, Azərbaycan və region üzrə uyğun layihələrdə 10%-dək cashback imkanları təqdim oluna bilər.',
          en: '“We invest in changing lives.” The EBRD works across three continents to support successful market economies. For renewable energy projects, it may support credit services, advice and policy reform, including eligible cashback opportunities of up to 10% in Azerbaijan and beyond.',
          ru: '“Мы инвестируем в изменение жизни.” ЕБРР работает на трех континентах, поддерживая переход к успешной рыночной экономике. В проектах ВИЭ возможна поддержка кредитными услугами, консультациями и реформами, включая cashback до 10% для подходящих проектов в Азербайджане и за его пределами.',
          tr: '“Hayatları değiştirmek için yatırım yapıyoruz.” EBRD, başarılı piyasa ekonomilerine geçişi desteklemek için üç kıtada çalışır. Yenilenebilir enerji projelerinde kredi hizmetleri, danışmanlık ve politika reformu desteğinin yanında, Azerbaycan ve bölgedeki uygun projelerde %10’a kadar cashback imkanı sunulabilir.'
        }
      }
    ]
  },
  {
    id: 'local-finance',
    title: {
      az: 'Yerli maliyyə tərəfdaşları',
      en: 'Local financial partners',
      ru: 'Локальные финансовые партнеры',
      tr: 'Yerel finans ortakları'
    },
    eyebrow: {
      az: 'Azərbaycan / maliyyə',
      en: 'Azerbaijan / finance',
      ru: 'Азербайджан / финансы',
      tr: 'Azerbaycan / finans'
    },
    summary: {
      az: 'Müştərilər üçün ödəniş, kreditləşmə və yaşıl layihə maliyyələşməsi dəstəyi.',
      en: 'Payment, credit and green project financing support for customers.',
      ru: 'Поддержка платежей, кредитования и финансирования зеленых проектов.',
      tr: 'Müşteriler için ödeme, kredi ve yeşil proje finansmanı desteği.'
    },
    accent: 'border-sky-500',
    partners: [
      {
        name: 'Pashabank',
        logo: 'https://i.ibb.co/svvwfxq4/image-removebg-preview-5.png',
        logoScale: 1.25,
        description: {
          az: 'Yaşıl layihələr üçün maliyyə ekosistemi',
          en: 'Financial ecosystem for green projects',
          ru: 'Финансовая экосистема для зеленых проектов',
          tr: 'Yeşil projeler için finans ekosistemi'
        }
      },
      {
        name: 'Bank Respublika',
        logo: 'https://i.ibb.co/KcmQ346N/image-removebg-preview-6.png',
        logoScale: 1.15,
        description: {
          az: 'Müştəri kreditləşməsi və ödəniş tərəfdaşlığı',
          en: 'Customer financing and payment partnership',
          ru: 'Партнерство по клиентскому кредитованию и платежам',
          tr: 'Müşteri kredilendirme ve ödeme ortaklığı'
        }
      }
    ]
  },
  {
    id: 'local-media-software',
    title: {
      az: 'Media və proqram təminatı',
      en: 'Media and software',
      ru: 'Медиа и программное обеспечение',
      tr: 'Medya ve yazılım'
    },
    eyebrow: {
      az: 'Azərbaycan / kommunikasiya',
      en: 'Azerbaijan / communication',
      ru: 'Азербайджан / коммуникация',
      tr: 'Azerbaycan / iletişim'
    },
    summary: {
      az: 'Rəqəmsal kommunikasiya, media yayımı və əməliyyat proseslərinin dəstəyi.',
      en: 'Support for digital communication, media distribution and operational processes.',
      ru: 'Поддержка цифровой коммуникации, медиа и операционных процессов.',
      tr: 'Dijital iletişim, medya yayını ve operasyonel süreç desteği.'
    },
    accent: 'border-violet-500',
    partners: [
      {
        name: {
          az: 'Azərbaycan İnformasiya və Kommunikasiya Texnologiyaları Sənayesi Assosiasiyası',
          en: 'Azerbaijan Information and Communication Technologies Industry Association',
          ru: 'Ассоциация индустрии информационных и коммуникационных технологий Азербайджана',
          tr: 'Azerbaycan Bilgi ve İletişim Teknolojileri Sanayisi Derneği'
        },
        logo: AIKTSA_LOGO,
        logoScale: 1.1,
        description: {
          az: 'Azərbaycan İKT sənayesi və assosiasiya ekosistemi ilə əlaqə',
          en: 'Connection with Azerbaijan’s ICT industry and association ecosystem',
          ru: 'Связь с ИКТ-индустрией и ассоциационной экосистемой Азербайджана',
          tr: 'Azerbaycan ICT sektörü ve dernek ekosistemi ile bağlantı'
        }
      },
      {
        name: 'visiontv.az',
        logo: 'https://i.ibb.co/gF4W3m5j/image-removebg-preview-3-2.png',
        description: {
          az: 'Media yayımı və visiontv.az üzərindən vizual kommunikasiya dəstəyi',
          en: 'Media distribution and visual communication support through visiontv.az',
          ru: 'Медиа и визуальная коммуникация через visiontv.az',
          tr: 'visiontv.az üzerinden medya yayını ve görsel iletişim desteği'
        }
      }
    ]
  },
  {
    id: 'local-ict-communication',
    title: {
      az: 'Kommunikasiya və İKT ekosistemi',
      en: 'Communication and ICT ecosystem',
      ru: 'Экосистема коммуникаций и ИКТ',
      tr: 'İletişim ve ICT ekosistemi'
    },
    eyebrow: {
      az: 'Azərbaycan / İKT və kommunikasiya',
      en: 'Azerbaijan / ICT & communication',
      ru: 'Азербайджан / ИКТ и коммуникации',
      tr: 'Azerbaycan / ICT ve iletişim'
    },
    summary: {
      az: 'Azərbaycan daxilində kommunikasiya, İKT sənayesi və rəqəmsal tərəfdaşlıq mühitini gücləndirən yerli qurumlar.',
      en: 'Local organizations strengthening communication, the ICT industry and digital partnership environment inside Azerbaijan.',
      ru: 'Локальные организации, усиливающие коммуникации, ИКТ-индустрию и цифровое партнерство в Азербайджане.',
      tr: 'Azerbaycan içinde iletişim, ICT sektörü ve dijital ortaklık ortamını güçlendiren yerel kurumlar.'
    },
    accent: 'border-cyan-500',
    partners: [
      {
        name: {
          az: 'Virtual Azerbaijan Şirkətlər Qrupu',
          en: 'Virtual Azerbaijan Group of Companies',
          ru: 'Группа компаний Virtual Azerbaijan',
          tr: 'Virtual Azerbaijan Şirketler Grubu'
        },
        logo: VIRTUAL_AZERBAIJAN_LOGO,
        logoScale: 1.05,
        description: {
          az: 'Rəqəmsal kommunikasiya və yerli biznes şəbəkəsi üzrə tərəfdaşlıq',
          en: 'Partnership for digital communication and local business networking',
          ru: 'Партнерство в цифровой коммуникации и локальной бизнес-сети',
          tr: 'Dijital iletişim ve yerel iş ağı ortaklığı'
        }
      },
      {
        name: 'Timesoft',
        logo: 'https://i.ibb.co/7dGzTzjj/timesoft.png',
        logoScale: 1.12,
        description: {
          az: 'Rəqəmsal proseslər və proqram təminatı tərəfdaşlığı',
          en: 'Digital process and software partnership',
          ru: 'Партнерство по цифровым процессам и программному обеспечению',
          tr: 'Dijital süreçler ve yazılım ortaklığı'
        }
      }
    ]
  },
  {
    id: 'local-construction',
    title: {
      az: 'Tikinti və infrastruktur',
      en: 'Construction and infrastructure',
      ru: 'Строительство и инфраструктура',
      tr: 'İnşaat ve altyapı'
    },
    eyebrow: {
      az: 'Azərbaycan / layihə icrası',
      en: 'Azerbaijan / project delivery',
      ru: 'Азербайджан / проектная реализация',
      tr: 'Azerbaycan / proje uygulaması'
    },
    summary: {
      az: 'Obyekt, tikinti koordinasiyası və yerli icra mühiti ilə layihələrin tamamlanması.',
      en: 'Project completion through site, construction coordination and local delivery.',
      ru: 'Завершение проектов через строительную координацию и локальную реализацию.',
      tr: 'Saha, inşaat koordinasyonu ve yerel uygulama ile projelerin tamamlanması.'
    },
    accent: 'border-amber-500',
    partners: [
      {
        name: 'Northwest',
        logo: 'https://i.ibb.co/KxScXBwz/NW-Construction.png',
        logoScale: 1.2
      },
      {
        name: 'PROES',
        logo: 'https://i.ibb.co/BHfZYcgf/image-removebg-preview-1.png',
        logoScale: 1.45,
        description: {
          az: 'Quraşdırma və montaj üzrə əsas icra tərəfdaşı',
          en: 'Main installation and assembly execution partner',
          ru: 'Основной партнер по монтажу и установке',
          tr: 'Kurulum ve montaj için ana uygulama ortağı'
        }
      }
    ]
  }
];

const translations = {
  title: {
    az: 'Tərəfdaşlıq ekosistemimiz',
    en: 'Our partnership ecosystem',
    ru: 'Наша партнерская экосистема',
    tr: 'Ortaklık ekosistemimiz'
  },
  headerTitle: {
    az: 'Tərəfdaşlıq',
    en: 'Partnership',
    ru: 'Партнерство',
    tr: 'Ortaklık'
  },
  structureTitle: {
    az: 'Volt.az tərəfdaşlıq strukturu yaşıl enerji ekosisteminin rol bölgüsünə əsasən formalaşıb.',
    en: 'The Volt.az partnership structure is shaped around roles in the green energy ecosystem.',
    ru: 'Партнерская структура Volt.az сформирована вокруг ролей в экосистеме зеленой энергии.',
    tr: 'Volt.az ortaklık yapısı yeşil enerji ekosistemindeki rol dağılımına göre şekillenmiştir.'
  },
  subtitle: {
    az: 'Beynəlxalq texnologiya istehsalçıları və Azərbaycanda fəaliyyət göstərən yerli tərəfdaşlarla qurduğumuz işbirlikləri burada qruplaşdırılıb.',
    en: 'This page groups our collaborations with international technology manufacturers and local partners operating in Azerbaijan.',
    ru: 'Здесь собраны наши партнерства с международными производителями технологий и локальными партнерами, работающими в Азербайджане.',
    tr: 'Uluslararası teknoloji üreticileri ve Azerbaycan’da faaliyet gösteren yerel ortaklarla kurduğumuz iş birlikleri burada gruplandırılmıştır.'
  },
  back: {
    az: 'Geri qayıt',
    en: 'Back',
    ru: 'Назад',
    tr: 'Geri dön'
  },
  pageLabel: {
    az: 'Tərəfdaşlıq səhifəsi',
    en: 'Partnership page',
    ru: 'Партнерская страница',
    tr: 'Ortaklık sayfası'
  },
  centralNode: {
    az: 'VOLT.AZ',
    en: 'VOLT.AZ',
    ru: 'VOLT.AZ'
  },
  internationalAssets: {
    az: 'Beynəlxalq texnologiya aktivləri',
    en: 'International technology assets',
    ru: 'Международные технологические активы',
    tr: 'Uluslararası teknoloji varlıkları'
  },
  localAssets: {
    az: 'Yerli biznes ekosistemi',
    en: 'Local business ecosystem',
    ru: 'Локальная бизнес-экосистема',
    tr: 'Yerel iş ekosistemi'
  },
  internationalAssetsDesc: {
    az: 'Bu blok Azərbaycandan kənarda fəaliyyət göstərən beynəlxalq istehsalçıları əhatə edir. Onlar Volt layihələri üçün panel, invertor və qoruma komponentləri üzrə texnologiya bazasını formalaşdırır.',
    en: 'This block covers international manufacturers operating outside Azerbaijan. They form the technology base for panels, inverters and protection components used in Volt projects.',
    ru: 'Этот блок охватывает международных производителей за пределами Азербайджана. Они формируют технологическую базу панелей, инверторов и защитных компонентов для проектов Volt.',
    tr: 'Bu bölüm Azerbaycan dışında faaliyet gösteren uluslararası üreticileri kapsar. Volt projelerinde kullanılan panel, invertör ve koruma bileşenleri için teknoloji tabanını oluştururlar.'
  },
  localAssetsDesc: {
    az: 'Bu istiqamət Azərbaycanda fəaliyyət göstərən yerli tərəfdaş şirkətləri göstərir. Maliyyə, media, proqram təminatı, İKT, kommunikasiya və tikinti dəstəyi layihələrin ölkə daxilində real icrasını tamamlayır.',
    en: 'This direction shows local partner companies operating in Azerbaijan. Finance, media, software, ICT, communication and construction support complete the real delivery of projects inside the country.',
    ru: 'Это направление показывает локальные партнерские компании, работающие в Азербайджане. Финансы, медиа, ПО, ИКТ, коммуникации и строительство помогают реализовывать проекты внутри страны.',
    tr: 'Bu alan Azerbaycan’da faaliyet gösteren yerel ortak şirketleri gösterir. Finans, medya, yazılım, ICT, iletişim ve inşaat desteği projelerin ülke içindeki gerçek uygulamasını tamamlar.'
  },
  coreDivider: {
    az: 'Əsas texnologiya tərəfdaşları',
    en: 'Core Technology Partners',
    ru: 'Основные технологические партнеры',
    tr: 'Ana Teknoloji Ortakları'
  },
  localDivider: {
    az: 'Yerli ekosistem',
    en: 'Local Ecosystem',
    ru: 'Локальная экосистема',
    tr: 'Yerel Ekosistem'
  },
  badge: {
    az: 'Rəsmi tərəfdaşlıqlar',
    en: 'Official Partnerships',
    ru: 'Официальные партнерства',
    tr: 'Resmi ortaklıklar'
  },
  nodeTitle: {
    az: 'SOLARIX tərəfdaşlıq mərkəzi',
    en: 'SOLARIX partnership hub',
    ru: 'Партнерский центр SOLARIX',
    tr: 'SOLARIX ortaklık merkezi'
  },
  nodeSubtitle: {
    az: 'Volt.az SOLARIX MMC-nin quraşdırma və xidmət brendi kimi bu ekosistemin icra xəttini formalaşdırır.',
    en: 'Volt.az operates as the installation and service brand of SOLARIX LLC inside this ecosystem.',
    ru: 'Volt.az выступает брендом установки и сервиса ООО SOLARIX в этой экосистеме.',
    tr: 'Volt.az, bu ekosistemde SOLARIX MMC’nin kurulum ve hizmet markası olarak çalışır.'
  },
  voltBrandLabel: {
    az: 'Solarix-in satış subbrendi',
    en: 'A Solarix sales sub-brand',
    ru: 'Торговый суббренд Solarix',
    tr: 'Solarix’in satış alt markası'
  },
  voltBrandDescription: {
    az: 'Volt.az Solarix-in günəş panelləri, invertorlar, enerji saxlama sistemləri, elektrik avadanlıqları və tamamlayıcı komponentlərin satışına yönəlmiş subbrendidir.',
    en: 'Volt.az is a Solarix sub-brand focused on the sale of solar panels, inverters, energy storage systems, electrical equipment and complementary components.',
    ru: 'Volt.az — суббренд Solarix, специализирующийся на продаже солнечных панелей, инверторов, систем накопления энергии, электрооборудования и комплектующих.',
    tr: 'Volt.az; güneş panelleri, invertörler, enerji depolama sistemleri, elektrik ekipmanları ve tamamlayıcı bileşenlerin satışına odaklanan bir Solarix alt markasıdır.'
  },
  divider: {
    az: 'Rəsmi tərəfdaşlar',
    en: 'Official partners',
    ru: 'Официальные партнеры',
    tr: 'Resmi ortaklar'
  },
  mapNote: {
    az: 'Beynəlxalq avadanlıq tərəfdaşları və yerli ekosistem partnyorları SOLARIX / Volt.az layihələrinin planlama, maliyyələşmə, kommunikasiya və icra mərhələlərini tamamlayır.',
    en: 'International equipment partners and local ecosystem partners support SOLARIX / Volt.az projects across planning, financing, communication and delivery.',
    ru: 'Международные поставщики оборудования и локальные партнеры поддерживают проекты SOLARIX / Volt.az на этапах планирования, финансирования, коммуникации и реализации.',
    tr: 'Uluslararası ekipman ortakları ve yerel ekosistem ortakları SOLARIX / Volt.az projelerinin planlama, finansman, iletişim ve uygulama aşamalarını destekler.'
  },
  footnote: {
    az: '* Tərəfdaşlıq xəritəsi Volt.az ekosistemində rol bölgüsünü göstərir.',
    en: '* The partnership map shows role distribution inside the Volt.az ecosystem.',
    ru: '* Карта партнерства показывает распределение ролей в экосистеме Volt.az.',
    tr: '* Ortaklık haritası Volt.az ekosistemindeki rol dağılımını gösterir.'
  },
  applyKicker: {
    az: 'İndi müraciət et',
    en: 'Apply now',
    ru: 'Подать заявку',
    tr: 'Şimdi başvur'
  },
  floatingCta: {
    az: 'Tərəfdaş ol',
    en: 'Become partner',
    ru: 'Стать партнером',
    tr: 'Partner ol'
  },
  applyTitle: {
    az: 'Tərəfdaşlıq üçün rəsmi müraciət',
    en: 'Official partnership application',
    ru: 'Официальная заявка на партнерство',
    tr: 'Ortaklık için resmi başvuru'
  },
  applyDesc: {
    az: 'Bizimlə texnologiya, maliyyə, media, proqram təminatı və ya tikinti istiqamətində əməkdaşlıq etmək üçün məlumatları doldurun.',
    en: 'Fill in the information to collaborate with us in technology, finance, media, software or construction.',
    ru: 'Заполните информацию для сотрудничества в сфере технологий, финансов, медиа, ПО или строительства.',
    tr: 'Teknoloji, finans, medya, yazılım veya inşaat alanında bizimle iş birliği yapmak için bilgileri doldurun.'
  },
  labelCompany: {
    az: 'Şirkətinizin adı',
    en: 'Company name',
    ru: 'Название компании',
    tr: 'Şirket adı'
  },
  labelPerson: {
    az: 'Səlahiyyətli şəxs',
    en: 'Contact person',
    ru: 'Контактное лицо',
    tr: 'Yetkili kişi'
  },
  labelPhone: {
    az: 'Telefon nömrəsi',
    en: 'Phone number',
    ru: 'Номер телефона',
    tr: 'Telefon numarası'
  },
  labelEmail: {
    az: 'E-poçt ünvanı',
    en: 'Email address',
    ru: 'Электронная почта',
    tr: 'E-posta adresi'
  },
  labelType: {
    az: 'Tərəfdaşlıq istiqaməti',
    en: 'Partnership direction',
    ru: 'Направление партнерства',
    tr: 'Ortaklık alanı'
  },
  labelMessage: {
    az: 'Əməkdaşlıq təklifinin qısa təsviri',
    en: 'Brief description of partnership proposal',
    ru: 'Краткое описание партнерского предложения',
    tr: 'Ortaklık teklifinin kısa açıklaması'
  },
  btnSubmit: {
    az: 'Müraciəti göndər',
    en: 'Submit proposal',
    ru: 'Отправить заявку',
    tr: 'Başvuruyu gönder'
  },
  submitting: {
    az: 'Göndərilir...',
    en: 'Submitting...',
    ru: 'Отправка...',
    tr: 'Gönderiliyor...'
  },
  successMsg: {
    az: 'Müraciətiniz qəbul edildi! Sizinlə tezliklə əlaqə saxlanılacaq.',
    en: 'Your application was accepted! We will contact you soon.',
    ru: 'Ваша заявка принята! Мы скоро свяжемся с вами.',
    tr: 'Başvurunuz kabul edildi! Kısa süre içinde sizinle iletişime geçilecektir.'
  },
  submitSuccess: {
    az: 'Müraciət qəbul edildi',
    en: 'Application accepted',
    ru: 'Заявка принята',
    tr: 'Başvuru kabul edildi'
  },
  errorMsg: {
    az: 'Zəhmət olmasa bütün mütləq sahələri doldurun.',
    en: 'Please fill in all required fields.',
    ru: 'Пожалуйста, заполните все обязательные поля.',
    tr: 'Lütfen tüm zorunlu alanları doldurun.'
  },
  placeholders: {
    company: {
      az: 'Məs: SOLARIX tərəfdaşı',
      en: 'E.g. SOLARIX partner',
      ru: 'Напр: партнер SOLARIX',
      tr: 'Örn: SOLARIX ortağı'
    },
    person: {
      az: 'Məs: Əli Səfərov',
      en: 'E.g. Ali Safarov',
      ru: 'Напр: Али Сафаров',
      tr: 'Örn: Ali Safarov'
    },
    phone: {
      az: 'Məs: 50 123 45 67',
      en: 'E.g. 50 123 45 67',
      ru: 'Напр: 50 123 45 67',
      tr: 'Örn: 50 123 45 67'
    },
    email: {
      az: 'Məs: business@company.az',
      en: 'E.g. business@company.az',
      ru: 'Напр: business@company.az',
      tr: 'Örn: business@company.az'
    },
    message: {
      az: 'Təklif etmək istədiyiniz əməkdaşlığı qısa təsvir edin...',
      en: 'Briefly describe the collaboration you want to propose...',
      ru: 'Кратко опишите сотрудничество, которое хотите предложить...',
      tr: 'Önermek istediğiniz iş birliğini kısaca açıklayın...'
    }
  }
};

const getText = (value: LocalizedText, lang: Lang) => value[lang] || value.az;
const getPartnerName = (partner: Partner, lang: Lang) =>
  typeof partner.name === 'string' ? partner.name : getText(partner.name, lang);

const PartnerLogo: React.FC<{ partner: Partner; lang: Lang }> = ({ partner, lang }) => (
  <div className="group/partner flex items-start gap-4 border-t border-slate-100 py-4 first:border-t-0 first:pt-0 last:pb-0">
    <div
      className="flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-3 ring-1 ring-slate-100 transition-all duration-300 group-hover/partner:ring-emerald-200"
      style={{ width: 96, height: 56, overflow: 'hidden' }}
    >
      <img
        src={partner.logo}
        alt={`${getPartnerName(partner, lang)} logo`}
        loading="lazy"
        className="max-h-full max-w-full object-contain transition-transform duration-300"
        style={{ transform: `scale(${partner.logoScale ?? 1})` }}
        onError={(event) => {
          const image = event.currentTarget;
          if (image.src !== FALLBACK_LOGO) {
            image.src = FALLBACK_LOGO;
          }
        }}
      />
    </div>
    <div className="min-w-0">
      <h4 className="text-sm font-black text-slate-950">{getPartnerName(partner, lang)}</h4>
      {partner.description && (
        <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-500">
          {getText(partner.description, lang)}
        </p>
      )}
    </div>
  </div>
);

const PartnerGroupCard: React.FC<{ group: PartnerGroup; lang: Lang; index: number; className?: string }> = ({ group, lang, index, className = '' }) => {
  const isCoreTechnology = group.id === 'international-technology';

  return (
    <article className={`relative rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/70 ${isCoreTechnology ? 'shadow-2xl shadow-emerald-600/15 ring-1 ring-emerald-100/80' : 'shadow-sm'} ${group.accent} ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="min-w-0">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            {getText(group.eyebrow, lang)}
          </span>
          <h3 className="mt-2 text-lg font-black leading-tight text-slate-950">
            {getText(group.title, lang)}
          </h3>
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${isCoreTechnology ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-950'}`}>
          0{index + 1}
        </div>
      </div>
      <p className="mb-5 text-xs font-semibold leading-relaxed text-slate-500">
        {getText(group.summary, lang)}
      </p>
      <div>
        {group.partners.map((partner) => (
          <PartnerLogo key={getPartnerName(partner, lang)} partner={partner} lang={lang} />
        ))}
      </div>
    </article>
  );
};

const PortfolioTile: React.FC<{
  title: string;
  description: string;
}> = ({ title, description }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-7 md:p-9 lg:min-h-[220px]">
    <div className="flex h-full flex-col justify-center">
      <span className="mb-5 h-px w-16 bg-emerald-600" />
      <h3 className="text-xl font-black text-emerald-700">{title}</h3>
      <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-slate-600 md:text-[15px]">
        {description}
      </p>
    </div>
  </div>
);

const SectionDivider: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-xl border border-emerald-600 bg-white px-6 py-6 text-center ${className}`}>
    <h3 className="text-2xl font-medium tracking-tight text-emerald-700 md:text-3xl">
      {children}
    </h3>
  </div>
);

const PartnershipPage: React.FC<PartnershipPageProps> = (props) => {
  const lang: Lang = props.lang ?? 'az';
  const { onBack } = props;
  const { showNotification } = useNotification();
  const { partnershipTypes, getPartnershipTypes, createPartnershipRequest } = usePartnership();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const formSectionRef = useRef<HTMLElement | null>(null);
  const formCardRef = useRef<HTMLDivElement | null>(null);
  const footnoteRef = useRef<HTMLParagraphElement | null>(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const check = () => setIsModalOpen(document.querySelectorAll('[class*="backdrop-blur"]').length > 0);
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCountry, setPhoneCountry] = useState(DEFAULT_COUNTRY_ISO2);
  const [email, setEmail] = useState('');
  const [partnerType, setPartnerType] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitAnimation, setHasSubmitAnimation] = useState(false);
  const [submitStage, setSubmitStage] = useState<'idle' | 'sending' | 'success'>('idle');
  const [isCtaVisible, setIsCtaVisible] = useState(true);
  const [partnerTypeOptions, setPartnerTypeOptions] = useState<PartnershipDirection[]>(() => loadPartnershipDirections());
  const internationalGroup = partnerGroups[0];
  const fundingGroup = partnerGroups[1];
  const financeGroup = partnerGroups[2];
  const mediaGroup = partnerGroups[3];
  const ictGroup = partnerGroups[4];
  const constructionGroup = partnerGroups[5];

  useEffect(() => {
    getPartnershipTypes();
  }, []);

  const getItemName = (item: any) => {
    return (
      item?.languages?.find((l: any) => l.languageCode === 1)?.name ||
      item?.languages?.find((l: any) => l.languageCode === 2)?.name ||
      item?.languages?.find((l: any) => l.languageCode === 3)?.name ||
      item?.languages?.find((l: any) => l.languageCode === 4)?.name ||
      "No name"
    );
  };

  useEffect(() => {
    const refreshDirections = () => {
      const nextDirections = loadPartnershipDirections();
      setPartnerTypeOptions(nextDirections);
      setPartnerType((currentType) => (
        nextDirections.some((direction) => direction.id === currentType)
          ? currentType
          : nextDirections[0]?.id || 'technology'
      ));
    };

    refreshDirections();
    window.addEventListener('volt_data_updated', refreshDirections);
    return () => window.removeEventListener('volt_data_updated', refreshDirections);
  }, []);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;
      const isNearTop = currentScrollY < 80;
      const footnoteBottom = footnoteRef.current?.getBoundingClientRect().bottom ?? Number.POSITIVE_INFINITY;
      const isPastFootnote = footnoteBottom < window.innerHeight - 96;

      if (isPastFootnote) {
        setIsCtaVisible(false);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      if (isNearTop) {
        setIsCtaVisible(true);
      } else if (currentScrollY > lastScrollY + 8) {
        setIsCtaVisible(false);
      } else if (currentScrollY < lastScrollY - 8) {
        setIsCtaVisible(true);
      }
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePartnerCtaClick = () => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const card = formCardRef.current || document.querySelector<HTMLDivElement>('[data-partnership-form-card]');
    if (card) {
      card.classList.remove('partnership-form-pulse');
      window.requestAnimationFrame(() => card.classList.add('partnership-form-pulse'));
      window.setTimeout(() => card.classList.remove('partnership-form-pulse'), 5000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName || !contactPerson || !phone || !email || !partnerType) {
      showNotification(getText(translations.errorMsg, lang), 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      setHasSubmitAnimation(true);
      setSubmitStage('sending');

      const dialCode = COUNTRY_CALLING_CODES.find((c) => c.iso2 === phoneCountry)?.dialCode || '+994';

      await createPartnershipRequest({
        companyName,
        companyPerson: contactPerson,
        email,
        phoneNumber: `${dialCode} ${phone}`.trim(),
        message,
        partnershipTypeId: Number(partnerType),
      });

      setSubmitStage('success');

      showNotification(
        getText(translations.successMsg, lang),
        'success'
      );

      setCompanyName('');
      setContactPerson('');
      setPhone('');
      setEmail('');
      setMessage('');

      setTimeout(() => {
        setIsSubmitting(false);
        setHasSubmitAnimation(false);
        setSubmitStage('idle');
      }, 1300);

    } catch (error) {
      console.error(error);

      setIsSubmitting(false);
      setHasSubmitAnimation(false);
      setSubmitStage('idle');

      showNotification('Müraciət göndərilmədi', 'error');
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-slate-950">
      <section className="relative z-40 overflow-hidden bg-emerald-950 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-12">
          <button onClick={onBack} className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-emerald-300/60 transition-colors hover:text-white">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {getText(translations.back, lang)}
          </button>
          <h1 className="text-sm font-black uppercase tracking-widest text-white">
            {getText(translations.headerTitle, lang)}
          </h1>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 pb-8 pt-12 md:pb-12 md:pt-16">
          <h2 className="mb-4 text-4xl font-black text-slate-950">
            {getText(translations.title, lang)}
          </h2>
          <p className="text-base font-medium leading-relaxed text-slate-600 md:text-lg">
            {getText(translations.subtitle, lang)}
          </p>

          <div className="relative mx-auto mt-10 flex w-full max-w-2xl flex-col items-center">
            <div className="flex w-full justify-center">
              <div className="relative h-24 w-72 overflow-hidden sm:w-80">
                <img
                  src={SOLARIX_LOGO}
                  alt="Solarix logo"
                  className="absolute left-1/2 top-1/2 h-auto w-full max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
                  onError={(event) => {
                    const image = event.currentTarget;
                    if (image.src !== FALLBACK_LOGO) {
                      image.src = FALLBACK_LOGO;
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex h-12 flex-col items-center" aria-hidden="true">
              <span className="h-8 w-px bg-[var(--primary)]" />
              <span className="h-3 w-3 rotate-45 border-b-2 border-r-2 border-[var(--primary)]" />
            </div>

            <div className="w-full max-w-xl rounded-[2rem] border-2 border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_6%,white)] px-6 py-7 text-center shadow-[0_1px_2px_rgba(15,23,42,0.08),0_24px_56px_-32px_color-mix(in_srgb,var(--primary)_45%,transparent)] transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-[var(--primary-hover)] hover:shadow-[0_4px_10px_rgba(15,23,42,0.1),0_32px_72px_-30px_color-mix(in_srgb,var(--primary)_60%,transparent)] sm:px-10 md:py-9">
              <div className="mx-auto h-20 w-full max-w-sm overflow-hidden">
                <img
                  src={VOLT_LOGO}
                  alt="Volt.az logo"
                  className="relative left-1/2 top-1/2 h-auto w-full max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
                  onError={(event) => {
                    const image = event.currentTarget;
                    if (image.src !== FALLBACK_LOGO) {
                      image.src = FALLBACK_LOGO;
                    }
                  }}
                />
              </div>
              <div className="mx-auto mt-5 max-w-md border-t border-[var(--primary)] pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[var(--primary)]">
                  {getText(translations.voltBrandLabel, lang)}
                </p>
                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600 md:text-[15px]">
                  {getText(translations.voltBrandDescription, lang)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white pb-16 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <PortfolioTile
                title={getText(translations.internationalAssets, lang)}
                description={getText(translations.internationalAssetsDesc, lang)}
              />
            </div>
            <div className="lg:col-span-5">
              <PortfolioTile
                title={getText(translations.localAssets, lang)}
                description={getText(translations.localAssetsDesc, lang)}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
            <div className="space-y-6 lg:col-span-7">
              <SectionDivider>{getText(translations.coreDivider, lang)}</SectionDivider>
              <PartnerGroupCard group={internationalGroup} lang={lang} index={0} />
              <PartnerGroupCard group={fundingGroup} lang={lang} index={1} />
              <section ref={formSectionRef} id="partnership-form" className="scroll-mt-28 rounded-2xl border border-slate-100 bg-slate-50 p-3 md:p-5">
                <div ref={formCardRef} data-partnership-form-card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-500 md:p-8">
                  <div className="mx-auto max-w-2xl text-center">
                    <span className="inline-block rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-800">
                      {getText(translations.applyKicker, lang)}
                    </span>
                    <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 md:mt-4 md:text-2xl">
                      {getText(translations.applyTitle, lang)}
                    </h2>
                    <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-500 md:text-sm">
                      {getText(translations.applyDesc, lang)}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4 md:mt-8 md:space-y-5">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                          {getText(translations.labelCompany, lang)} <span className="text-emerald-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder={getText(translations.placeholders.company, lang)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                          {getText(translations.labelPerson, lang)} <span className="text-emerald-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          placeholder={getText(translations.placeholders.person, lang)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                          {getText(translations.labelPhone, lang)} <span className="text-emerald-500">*</span>
                        </label>
                        <PhoneNumberInput
                          required
                          countryIso2={phoneCountry}
                          onCountryChange={setPhoneCountry}
                          localNumber={phone}
                          onLocalNumberChange={setPhone}
                          placeholder={getText(translations.placeholders.phone, lang)}
                          inputClassName="px-4 py-3 text-xs font-semibold text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                          {getText(translations.labelEmail, lang)} <span className="text-emerald-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={getText(translations.placeholders.email, lang)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                        {getText(translations.labelType, lang)}
                      </label>

                      <select
                        value={partnerType}
                        onChange={(e) => setPartnerType(e.target.value)}
                        className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="">
                          Seçin
                        </option>

                        {partnershipTypes.map((item) => (
                          <option key={item.id} value={item.id}>
                            {getItemName(item)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                        {getText(translations.labelMessage, lang)}
                      </label>
                      <textarea
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={getText(translations.placeholders.message, lang)}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`partnership-submit-button relative flex w-full min-h-[var(--cta-btn-h)] cursor-pointer items-center justify-center overflow-hidden rounded-xl py-4 text-xs font-black uppercase tracking-widest text-white shadow-md transition-all hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed ${submitStage === 'success'
                          ? 'partnership-submit-success bg-emerald-600'
                          : hasSubmitAnimation
                            ? 'bg-sky-600 partnership-submit-flight'
                            : 'bg-emerald-600'
                        }`}
                    >
                      <span className={`partnership-submit-label flex items-center justify-center gap-2 ${submitStage === 'idle' ? '' : 'partnership-submit-label-out'}`}>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{getText(translations.btnSubmit, lang)}</span>
                      </span>
                      {submitStage === 'sending' && (
                        <svg className="partnership-plane absolute h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10.5l18-7.5-7.5 18-3-7.5-7.5-3zM10.5 13.5L21 3" />
                        </svg>
                      )}
                      {submitStage === 'success' && (
                        <span className="partnership-success-label absolute inset-0 flex items-center justify-center px-4">
                          {getText(translations.submitSuccess, lang)}
                        </span>
                      )}
                    </button>
                  </form>
                </div>
                <p ref={footnoteRef} className="mt-4 px-1 text-[11px] font-medium italic text-slate-400">
                  {getText(translations.footnote, lang)}
                </p>
              </section>
            </div>

            <aside className="space-y-6 lg:col-span-5">
              <SectionDivider>{getText(translations.localDivider, lang)}</SectionDivider>
              <PartnerGroupCard group={financeGroup} lang={lang} index={2} />
              <PartnerGroupCard group={constructionGroup} lang={lang} index={3} />
              <PartnerGroupCard group={mediaGroup} lang={lang} index={4} />
              <PartnerGroupCard group={ictGroup} lang={lang} index={5} />
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {getText(translations.badge, lang)}
                </span>
                <p className="mt-3 text-xs font-medium leading-relaxed text-slate-600 md:mt-4 md:text-sm">
                  {getText(translations.mapNote, lang)}
                </p>
              </div>
            </aside>
          </div>

        </div>
      </section>

      {!isModalOpen && (
        <div
          className={`fixed bottom-4 left-1/2 z-[90] flex -translate-x-1/2 flex-col items-center gap-2 transition-all duration-500 md:bottom-7 ${isCtaVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}
        >
          <button
            type="button"
            onClick={handlePartnerCtaClick}
            className="rounded-full bg-emerald-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl shadow-emerald-600/30 transition-all hover:bg-emerald-700 active:scale-95 md:px-8 md:py-4"
            aria-label={getText(translations.floatingCta, lang)}
          >
            {getText(translations.floatingCta, lang)}
          </button>
          <svg className="h-5 w-5 animate-bounce rounded-full bg-white/95 p-1 text-emerald-700 shadow-lg ring-1 ring-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}

      <style>{`
        @keyframes partnershipFormPulse {
          0% {
            transform: scale(1);
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08), 0 0 0 0 rgba(64, 220, 58, 0);
          }
          35% {
            transform: scale(1.025);
            box-shadow: 0 24px 80px rgba(0, 70, 60, 0.2), 0 0 0 7px rgba(64, 220, 58, 0.24);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08), 0 0 0 0 rgba(64, 220, 58, 0);
          }
        }

        .partnership-form-pulse {
          animation: partnershipFormPulse 1.6s ease-out;
        }

        @keyframes partnershipSubmitFlight {
          0% {
            left: -28px;
            transform: translateY(-50%) rotate(50deg) scale(0.9);
            opacity: 0;
          }
          12% {
            left: 16px;
            transform: translateY(-50%) rotate(50deg) scale(1.12);
            opacity: 1;
          }
          44% {
            left: calc(50% - 10px);
            transform: translateY(-50%) rotate(50deg) scale(1.32);
            opacity: 1;
          }
          62% {
            left: calc(50% + 8px);
            transform: translateY(-50%) rotate(50deg) scale(1.38);
            opacity: 1;
          }
          82% {
            left: calc(100% - 12px);
            transform: translateY(-50%) rotate(50deg) scale(1.5);
            opacity: 1;
          }
          100% {
            left: calc(100% + 42px);
            transform: translateY(-50%) rotate(50deg) scale(1.55);
            opacity: 0;
          }
        }

        @keyframes partnershipSubmitLabelOut {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(18px);
            opacity: 0;
          }
        }

        @keyframes partnershipSuccessIn {
          0% {
            transform: translateX(-42%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .partnership-submit-button {
          min-height: 48px;
        }

        .partnership-submit-flight {
          box-shadow: 0 18px 40px rgba(2, 132, 199, 0.24);
        }

        .partnership-submit-label {
          transition: opacity 180ms ease, transform 180ms ease;
        }

        .partnership-submit-label-out {
          animation: partnershipSubmitLabelOut 560ms ease forwards;
        }

        .partnership-submit-flight .partnership-plane {
          animation: partnershipSubmitFlight 1.15s cubic-bezier(0.22, 0.72, 0.18, 1) forwards;
          left: -28px;
          top: 50%;
          transform-origin: center;
        }

        .partnership-success-label {
          animation: partnershipSuccessIn 420ms cubic-bezier(0.2, 0.72, 0.2, 1) both;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default PartnershipPage;
