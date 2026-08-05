import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Factory,
  Gauge,
  House,
  MapPin,
  Ruler,
  ShieldCheck,
  Sun,
  Wrench,
} from 'lucide-react';
import type { SiteLanguage } from '../utils/seoRoutes';

type Props = {
  lang: SiteLanguage;
  onNavigate: (page: any, id?: string, extra?: any) => void;
};

type Copy = {
  eyebrow: string;
  title: string;
  lead: string;
  estimate: string;
  projects: string;
  trust: string[];
  processTitle: string;
  process: Array<{ title: string; text: string }>;
  solutionsTitle: string;
  solutions: Array<{ title: string; text: string }>;
  sizingTitle: string;
  sizingText: string;
  sizes: string[];
  whyTitle: string;
  why: string[];
  faqTitle: string;
  faq: Array<{ question: string; answer: string }>;
  finalTitle: string;
  finalText: string;
  contact: string;
};

const copy: Record<SiteLanguage, Copy> = {
  az: {
    eyebrow: 'Azərbaycanda günəş enerjisi həlləri',
    title: 'Günəş panellərinin layihələndirilməsi və quraşdırılması',
    lead: 'Ev, biznes və sənaye obyektləri üçün istehlaka, dam və ya torpaq sahəsinə uyğun günəş elektrik sistemi hazırlayırıq.',
    estimate: 'Sistemi hesabla',
    projects: 'Layihələrə bax',
    trust: ['İstehlaka əsaslanan ölçüləndirmə', 'Dam və torpaq montajı', 'On-grid, off-grid və hibrid sistemlər'],
    processTitle: 'Quraşdırma necə aparılır?',
    process: [
      { title: '1. Enerji təhlili', text: 'İllik və aylıq istehlak, tarif və gələcək enerji tələbi qiymətləndirilir.' },
      { title: '2. Texniki baxış', text: 'Damın və ya torpaq sahəsinin ölçüsü, kölgələnmə, istiqamət və elektrik infrastrukturu yoxlanılır.' },
      { title: '3. Layihə və təklif', text: 'Panel, inverter, konstruksiya və qoruma avadanlıqları üzrə uyğun konfiqurasiya hazırlanır.' },
      { title: '4. Montaj və yoxlama', text: 'Sistem quraşdırılır, elektrik sınaqları aparılır və monitorinq istifadəyə verilir.' },
    ],
    solutionsTitle: 'Obyektinizə uyğun həll',
    solutions: [
      { title: 'Ev üçün', text: 'Elektrik xərclərini azaltmağa yönəlmiş damüstü və hibrid sistemlər.' },
      { title: 'Biznes üçün', text: 'Gündüz istehlakını günəş istehsalı ilə qarşılamaq üçün ölçüləndirilən kommersiya sistemləri.' },
      { title: 'Sənaye üçün', text: 'Yüksək güclü inverterlər, çoxsaylı MPPT və genişləndirilə bilən layihə arxitekturası.' },
    ],
    sizingTitle: 'Sistem gücü necə seçilir?',
    sizingText: 'Güc yalnız sahəyə görə deyil, istehlak profili, şəbəkə rejimi, kölgələnmə və avadanlığın elektrik limitləri nəzərə alınaraq seçilir. Aşağıdakı ölçülər istiqamətləndiricidir; yekun seçim texniki baxışdan sonra təsdiqlənir.',
    sizes: ['5 kW ev sistemi', '10 kW geniş ev və kiçik biznes', '20–50 kW kommersiya', '100 kW+ sənaye'],
    whyTitle: 'Niyə layihələndirmə vacibdir?',
    why: ['Panel və inverterin DC/AC uyğunluğu', 'String gərginliyi və cərəyan limitləri', 'Kölgələnmə və istiqamət analizi', 'Qoruma, kabelləmə və torpaqlama', 'İstehsal və geri dönüş proqnozu', 'Monitorinq və servis planı'],
    faqTitle: 'Tez-tez verilən suallar',
    faq: [
      { question: 'Qiymət necə hesablanır?', answer: 'Qiymət sistem gücü, montaj növü, seçilən avadanlıq, kabel məsafəsi və obyektin texniki şərtlərinə əsasən hazırlanır.' },
      { question: 'Dam yoxdursa sistem qurmaq olar?', answer: 'Bəli. Uyğun torpaq sahəsində günəş istiqaməti və konstruksiya hesablanaraq yerüstü sistem layihələndirilə bilər.' },
      { question: 'Elektrik kəsiləndə sistem işləyir?', answer: 'Standart on-grid sistem təhlükəsizlik səbəbi ilə dayanır. Kəsinti zamanı enerji üçün hibrid inverter və uyğun batareya həlli tələb olunur.' },
      { question: 'İlkin hesablamanı necə ala bilərəm?', answer: 'Solar kalkulyatorda istehlak məlumatını daxil edin və ya obyekt məlumatlarını bizə göndərin.' },
    ],
    finalTitle: 'Obyektiniz üçün ilkin günəş enerjisi hesablaması alın',
    finalText: 'İstehlakınızı daxil edin və uyğun sistem gücü, istehsal və qənaət göstəricilərini nəzərdən keçirin.',
    contact: 'Mütəxəssislə əlaqə',
  },
  en: {
    eyebrow: 'Solar energy solutions in Azerbaijan',
    title: 'Solar panel design and installation',
    lead: 'We design solar power systems for homes, businesses, and industrial sites based on consumption and the available roof or ground area.',
    estimate: 'Calculate your system',
    projects: 'View projects',
    trust: ['Consumption-based sizing', 'Roof and ground mounting', 'On-grid, off-grid, and hybrid systems'],
    processTitle: 'How installation works',
    process: [
      { title: '1. Energy assessment', text: 'Annual and monthly consumption, tariffs, and future energy demand are evaluated.' },
      { title: '2. Technical survey', text: 'Roof or land area, shading, orientation, and electrical infrastructure are checked.' },
      { title: '3. Design and proposal', text: 'A suitable panel, inverter, mounting, and protection configuration is prepared.' },
      { title: '4. Installation and testing', text: 'The system is installed, electrically tested, and monitoring is commissioned.' },
    ],
    solutionsTitle: 'A solution for your site',
    solutions: [
      { title: 'Homes', text: 'Roof-mounted and hybrid systems designed to reduce electricity costs.' },
      { title: 'Businesses', text: 'Commercial systems sized to match daytime consumption with solar generation.' },
      { title: 'Industry', text: 'High-power inverters, multiple MPPTs, and scalable project architecture.' },
    ],
    sizingTitle: 'How is system capacity selected?',
    sizingText: 'Capacity is selected using the consumption profile, grid mode, shading, and equipment electrical limits—not area alone. The sizes below are guides; the final design is confirmed after a technical survey.',
    sizes: ['5 kW home system', '10 kW large home or small business', '20–50 kW commercial', '100 kW+ industrial'],
    whyTitle: 'Why engineering matters',
    why: ['Panel and inverter DC/AC compatibility', 'String voltage and current limits', 'Shading and orientation analysis', 'Protection, cabling, and grounding', 'Generation and payback forecast', 'Monitoring and service plan'],
    faqTitle: 'Frequently asked questions',
    faq: [
      { question: 'How is the price calculated?', answer: 'Pricing depends on system capacity, mounting type, selected equipment, cable distance, and site-specific technical conditions.' },
      { question: 'Can I install solar without a suitable roof?', answer: 'Yes. A ground-mounted system can be designed on suitable land after assessing solar orientation and structural requirements.' },
      { question: 'Will the system work during a power cut?', answer: 'A standard on-grid system shuts down for safety. Backup operation requires a hybrid inverter and a compatible battery solution.' },
      { question: 'How do I get an initial estimate?', answer: 'Enter your consumption in the solar calculator or send us the site details.' },
    ],
    finalTitle: 'Get an initial solar estimate for your property',
    finalText: 'Enter your consumption to review suitable capacity, expected generation, and savings.',
    contact: 'Talk to a specialist',
  },
  ru: {
    eyebrow: 'Решения солнечной энергетики в Азербайджане',
    title: 'Проектирование и монтаж солнечных панелей',
    lead: 'Проектируем солнечные электростанции для домов, бизнеса и промышленных объектов с учетом потребления и доступной площади крыши или участка.',
    estimate: 'Рассчитать систему',
    projects: 'Посмотреть проекты',
    trust: ['Расчет по потреблению', 'Монтаж на крыше и земле', 'Сетевые, автономные и гибридные системы'],
    processTitle: 'Как проходит установка',
    process: [
      { title: '1. Анализ энергии', text: 'Оцениваются годовое и месячное потребление, тариф и будущая потребность.' },
      { title: '2. Техническое обследование', text: 'Проверяются площадь, затенение, ориентация и электрическая инфраструктура.' },
      { title: '3. Проект и предложение', text: 'Подбираются панели, инверторы, конструкция и защитное оборудование.' },
      { title: '4. Монтаж и проверка', text: 'Система устанавливается, проходит электрические испытания и подключается к мониторингу.' },
    ],
    solutionsTitle: 'Решение для вашего объекта',
    solutions: [
      { title: 'Для дома', text: 'Крышные и гибридные системы для снижения расходов на электроэнергию.' },
      { title: 'Для бизнеса', text: 'Коммерческие системы, рассчитанные под дневное потребление.' },
      { title: 'Для промышленности', text: 'Мощные инверторы, несколько MPPT и масштабируемая архитектура.' },
    ],
    sizingTitle: 'Как выбирается мощность?',
    sizingText: 'Мощность определяется не только площадью, но и профилем потребления, режимом сети, затенением и электрическими ограничениями оборудования. Размеры ниже ориентировочные; проект подтверждается после обследования.',
    sizes: ['5 кВт для дома', '10 кВт для большого дома или малого бизнеса', '20–50 кВт для коммерции', '100 кВт+ для промышленности'],
    whyTitle: 'Почему важен инженерный расчет',
    why: ['Совместимость DC/AC панелей и инвертора', 'Ограничения напряжения и тока строк', 'Анализ затенения и ориентации', 'Защита, кабели и заземление', 'Прогноз выработки и окупаемости', 'Мониторинг и сервисный план'],
    faqTitle: 'Частые вопросы',
    faq: [
      { question: 'Как рассчитывается цена?', answer: 'Цена зависит от мощности, типа монтажа, оборудования, длины кабелей и технических условий объекта.' },
      { question: 'Можно установить систему без подходящей крыши?', answer: 'Да. На подходящем участке можно спроектировать наземную систему с учетом ориентации и конструкции.' },
      { question: 'Работает ли система при отключении сети?', answer: 'Обычная сетевая система отключается из соображений безопасности. Для резерва нужны гибридный инвертор и совместимая батарея.' },
      { question: 'Как получить предварительный расчет?', answer: 'Укажите потребление в солнечном калькуляторе или отправьте нам данные объекта.' },
    ],
    finalTitle: 'Получите предварительный расчет для вашего объекта',
    finalText: 'Укажите потребление, чтобы увидеть подходящую мощность, выработку и экономию.',
    contact: 'Связаться со специалистом',
  },
  tr: {
    eyebrow: 'Azerbaycan’da güneş enerjisi çözümleri',
    title: 'Güneş paneli projelendirme ve kurulumu',
    lead: 'Evler, işletmeler ve sanayi tesisleri için tüketime ve mevcut çatı veya arazi alanına göre güneş enerjisi sistemi tasarlıyoruz.',
    estimate: 'Sistemi hesapla',
    projects: 'Projeleri gör',
    trust: ['Tüketime göre boyutlandırma', 'Çatı ve arazi montajı', 'On-grid, off-grid ve hibrit sistemler'],
    processTitle: 'Kurulum nasıl ilerler?',
    process: [
      { title: '1. Enerji analizi', text: 'Yıllık ve aylık tüketim, tarife ve gelecekteki enerji ihtiyacı değerlendirilir.' },
      { title: '2. Teknik inceleme', text: 'Çatı veya arazi, gölgelenme, yön ve elektrik altyapısı kontrol edilir.' },
      { title: '3. Tasarım ve teklif', text: 'Uygun panel, inverter, konstrüksiyon ve koruma yapılandırması hazırlanır.' },
      { title: '4. Montaj ve test', text: 'Sistem kurulur, elektrik testleri yapılır ve izleme devreye alınır.' },
    ],
    solutionsTitle: 'Tesisinize uygun çözüm',
    solutions: [
      { title: 'Evler', text: 'Elektrik maliyetlerini azaltmaya yönelik çatı ve hibrit sistemler.' },
      { title: 'İşletmeler', text: 'Gündüz tüketimini güneş üretimiyle karşılamak üzere boyutlandırılan sistemler.' },
      { title: 'Sanayi', text: 'Yüksek güçlü inverterler, çoklu MPPT ve ölçeklenebilir proje mimarisi.' },
    ],
    sizingTitle: 'Sistem gücü nasıl seçilir?',
    sizingText: 'Güç yalnızca alana göre değil; tüketim profili, şebeke modu, gölgelenme ve ekipman elektrik limitleriyle seçilir. Aşağıdaki boyutlar yol göstericidir; nihai tasarım teknik inceleme sonrası onaylanır.',
    sizes: ['5 kW ev sistemi', '10 kW büyük ev veya küçük işletme', '20–50 kW ticari', '100 kW+ sanayi'],
    whyTitle: 'Mühendislik neden önemlidir?',
    why: ['Panel ve inverter DC/AC uyumu', 'Dizi gerilim ve akım limitleri', 'Gölgelenme ve yön analizi', 'Koruma, kablolama ve topraklama', 'Üretim ve geri dönüş tahmini', 'İzleme ve servis planı'],
    faqTitle: 'Sık sorulan sorular',
    faq: [
      { question: 'Fiyat nasıl hesaplanır?', answer: 'Fiyat; sistem gücü, montaj türü, seçilen ekipman, kablo mesafesi ve tesise özel teknik koşullara bağlıdır.' },
      { question: 'Uygun çatı olmadan kurulabilir mi?', answer: 'Evet. Uygun bir arazide yön ve konstrüksiyon değerlendirilerek yer tipi sistem tasarlanabilir.' },
      { question: 'Elektrik kesintisinde çalışır mı?', answer: 'Standart şebeke bağlantılı sistem güvenlik nedeniyle kapanır. Yedekleme için hibrit inverter ve uyumlu batarya gerekir.' },
      { question: 'Ön hesaplamayı nasıl alırım?', answer: 'Güneş hesaplayıcısına tüketiminizi girin veya tesis bilgilerini bize gönderin.' },
    ],
    finalTitle: 'Tesisiniz için ön güneş enerjisi hesabı alın',
    finalText: 'Uygun gücü, beklenen üretimi ve tasarrufu görmek için tüketiminizi girin.',
    contact: 'Uzmanla görüş',
  },
};

const SolarInstallationPage: React.FC<Props> = ({ lang, onNavigate }) => {
  const t = copy[lang];
  const processIcons = [Gauge, MapPin, Ruler, Wrench];
  const solutionIcons = [House, Building2, Factory];
  const track = (action: string) => {
    const gtag = (window as Window & { gtag?: (...args: any[]) => void }).gtag;
    gtag?.('event', 'solar_installation_cta', {
      action,
      language: lang,
      page_location: window.location.href,
    });
  };

  const go = (page: string, action: string) => {
    track(action);
    onNavigate(page);
  };

  return (
    <div className="min-h-screen bg-white text-[var(--color-text)]">
      <section className="relative overflow-hidden bg-[var(--color-dark)] py-4">
        <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 md:px-12">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[color-mix(in_srgb,var(--color-primary)_70%,white)] transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
            Volt.az
          </button>
          <span className="max-w-[65%] truncate text-right text-[10px] font-black uppercase tracking-[0.18em] text-white md:text-xs">
            {t.eyebrow}
          </span>
        </div>
      </section>

      <section className="bg-slate-50 py-8 md:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <div className="grid overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[1.05fr_.95fr]">
            <div className="flex flex-col justify-center p-6 sm:p-9 md:p-12 lg:p-14">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-8 bg-[var(--color-primary)]" />
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[var(--color-primary)] md:text-[10px]">
                  {t.eyebrow}
                </p>
              </div>
              <h1 className="max-w-3xl text-3xl font-black leading-[1.08] tracking-tight text-slate-900 md:text-5xl">
                {t.title}
              </h1>
              <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-500 md:text-base md:leading-8">
                {t.lead}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => go('calculator', 'calculator')}
                  className="group flex items-center justify-center gap-3 rounded-2xl bg-[var(--color-primary)] px-6 py-4 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-dark)] shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5"
                >
                  {t.estimate}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => go('projects', 'projects')}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-[10px] font-black uppercase tracking-[0.14em] text-slate-700 transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-dark)]"
                >
                  {t.projects}
                </button>
              </div>
            </div>

            <div className="relative min-h-[330px] overflow-hidden lg:min-h-[520px]">
              <img
                src="/solar-installation-roof.webp"
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                decoding="async"
                fetchPriority="high"
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)] via-[color-mix(in_srgb,var(--color-dark)_20%,transparent)] to-transparent" />
              <div className="absolute inset-x-4 bottom-4 rounded-[1.5rem] border border-white/15 bg-[color-mix(in_srgb,var(--color-dark)_88%,transparent)] p-5 shadow-xl backdrop-blur-md sm:inset-x-6 sm:bottom-6 sm:p-6">
                <div className="grid gap-3">
                  {t.trust.map((item) => (
                    <div key={item} className="flex items-center gap-3 text-xs font-bold leading-5 text-white sm:text-sm">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-dark)]">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <div className="mb-9 max-w-2xl">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-[var(--color-primary)]" />
              <Wrench className="h-4 w-4 text-[var(--color-primary)]" strokeWidth={1.8} />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-4xl">{t.processTitle}</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {t.process.map((item, index) => {
              const Icon = processIcons[index];
              return (
                <article key={item.title} className="group rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-xl">
                  <div className="mb-6 flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_9%,white)] text-[var(--color-primary)] transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-dark)]">
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <span className="text-[10px] font-black tracking-[0.18em] text-slate-300">0{index + 1}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900">{item.title.replace(/^\d+\.\s*/, '')}</h3>
                  <p className="mt-3 text-xs font-medium leading-6 text-slate-500">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-[var(--color-surface)] py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-8 bg-[var(--color-primary)]" />
                <Sun className="h-4 w-4 text-[var(--color-primary)]" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-4xl">{t.solutionsTitle}</h2>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {t.solutions.map((item, index) => {
              const Icon = solutionIcons[index];
              return (
                <article key={item.title} className="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-dark)] text-[var(--color-primary)]">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <h3 className="mt-6 text-lg font-black text-slate-900">{item.title}</h3>
                  <p className="mt-3 text-sm font-medium leading-7 text-slate-500">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 md:px-12 lg:grid-cols-[1.05fr_.95fr]">
          <article className="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-sm md:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,white)] text-[var(--color-primary)]">
              <Ruler className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <h2 className="mt-6 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">{t.sizingTitle}</h2>
            <p className="mt-4 text-sm font-medium leading-7 text-slate-500 md:text-base md:leading-8">{t.sizingText}</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {t.sizes.map((size) => (
                <span key={size} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                  {size}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] bg-[var(--color-dark)] p-7 text-white shadow-xl shadow-slate-900/10 md:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[var(--color-primary)]">
              <ShieldCheck className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <h2 className="mt-6 text-2xl font-black tracking-tight md:text-3xl">{t.whyTitle}</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {t.why.map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs font-bold leading-5 text-slate-200">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" strokeWidth={2.5} />
                  {item}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50 py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-4 md:px-12">
          <div className="mb-9 text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-[var(--color-primary)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">FAQ</span>
              <span className="h-px w-8 bg-[var(--color-primary)]" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-4xl">{t.faqTitle}</h2>
          </div>
          <div className="space-y-3">
            {t.faq.map((item) => (
              <details key={item.question} className="group rounded-2xl border border-slate-100 bg-white px-5 py-1 shadow-sm open:border-[var(--color-primary)] md:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-sm font-black text-slate-900">
                  {item.question}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-[var(--color-primary)]">
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" strokeWidth={2.5} />
                  </span>
                </summary>
                <p className="border-t border-slate-100 py-5 text-sm font-medium leading-7 text-slate-500">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-12 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2rem] bg-[var(--color-primary)] p-7 text-[var(--color-dark)] shadow-xl shadow-slate-900/10 md:p-12">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-3xl">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-dark)] text-[var(--color-primary)]">
                  <Sun className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <h2 className="text-2xl font-black leading-tight md:text-4xl">{t.finalTitle}</h2>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 opacity-80">{t.finalText}</p>
              </div>
              <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
                <button
                  onClick={() => go('solar-panels', 'panels')}
                  className="rounded-2xl border border-[color-mix(in_srgb,var(--color-dark)_22%,transparent)] bg-white px-6 py-4 text-[10px] font-black uppercase tracking-[0.14em]"
                >
                  {{ az: 'Panellərə bax', en: 'View panels', ru: 'Смотреть панели', tr: 'Panellere bak' }[lang]}
                </button>
                <button
                  onClick={() => go('calculator', 'final_calculator')}
                  className="rounded-2xl bg-[var(--color-dark)] px-6 py-4 text-[10px] font-black uppercase tracking-[0.14em] text-white"
                >
                  {t.estimate}
                </button>
                <button
                  onClick={() => go('contact', 'contact')}
                  className="rounded-2xl border border-[color-mix(in_srgb,var(--color-dark)_22%,transparent)] bg-white/20 px-6 py-4 text-[10px] font-black uppercase tracking-[0.14em]"
                >
                  {t.contact}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SolarInstallationPage;
