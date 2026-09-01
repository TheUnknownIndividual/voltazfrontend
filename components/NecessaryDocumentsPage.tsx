
import React, { useState, useEffect } from 'react';

interface NecessaryDocumentsPageProps {
  lang?: 'az' | 'en' | 'ru' | 'tr';
  onBack?: () => void;
}

const NecessaryDocumentsPage: React.FC<NecessaryDocumentsPageProps> = ({ lang , onBack }) => {
const pdfUrls = {
  az: "/Volt-ZəruriSənədlər.pdf",
  en: "/Volt-NecessaryDocuments.pdf",
  ru: "/Volt-Необходимыедокументы.pdf",
  tr: "/Volt-GerekliBelgeler.pdf",
};

const [showBar, setShowBar] = useState(true);
let lastScrollY = 0;

useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY) {
      // scroll down → hide
      setShowBar(false);
    } else {
      // scroll up → show
      setShowBar(true);
    }

    lastScrollY = currentScrollY;
  };

  window.addEventListener("scroll", handleScroll);

  return () => window.removeEventListener("scroll", handleScroll);
}, []);

const t = {
  title: {
    az: "Zəruri Sənədlər",
    en: "Necessary Documents",
    ru: "Необходимые документы",
    tr: "Gerekli Belgeler",
  },

  back: {
    az: "Geri qayıt",
    en: "Back",
    ru: "Назад",
    tr: "Geri dön",
  },

  subtitle: {
    az: "Sistemi aktiv etmək üçün tələb olunan sənədlər və müraciət qaydaları",
    en: "Documents and application procedures required to activate the system",
    ru: "Документы и порядок подачи заявки, необходимые для активации системы",
    tr: "Sistemi aktifleştirmek için gerekli belgeler ve başvuru prosedürleri",
  },

  entityLabel: {
    az: "Qurum:",
    en: "Entity:",
    ru: "Организация:",
    tr: "Kurum:",
  },

  stepsLabel: {
    az: "Ardıcıllıq və Tələblər:",
    en: "Sequence and Requirements:",
    ru: "Последовательность и требования:",
    tr: "Sıralama ve Gereklilikler:",
  },

  ctaTitle: {
    az: "Sənədləşmə işlərində çətinlik çəkirsiniz?",
    en: "Having trouble with paperwork?",
    ru: "Возникли трудности с документами?",
    tr: "Evrak işlerinde zorlanıyor musunuz?",
  },

  ctaDesc: {
    az: "Mütəxəssislərimiz bütün hüquqi və texniki sənədləşmə prosesində sizə tam dəstək göstərir.",
    en: "Our specialists provide full support in all legal and technical documentation processes.",
    ru: "Наши специалисты оказывают полную поддержку во всех юридических и технических процессах оформления документов.",
    tr: "Uzmanlarımız tüm hukuki ve teknik evrak süreçlerinde size tam destek sağlar.",
  },

  ctaBtn: {
    az: "Məsləhət Alın",
    en: "Get Consultation",
    ru: "Получить консультацию",
    tr: "Danışmanlık Alın",
  },

  portalTitle: {
    az: "VAHİD SƏNƏD PORTALI",
    en: "UNIFIED DOCUMENT PORTAL",
    ru: "ЕДИНЫЙ ПОРТАЛ ДОКУМЕНТОВ",
    tr: "TEK BELGE PORTALI",
  },

  stickyNotice: {
    az: "Bütün qurumlar üzrə tələb olunan sənədlərin tam və vahid müraciət paketini bir kliklə yükləyin.",
    en: "Download the complete unified application package containing all required documents for every institution with a single click.",
    ru: "Скачайте полный единый пакет документов для всех учреждений одним кликом.",
    tr: "Tüm kurumlar için gerekli belgeleri içeren eksiksiz ve birleşik başvuru paketini tek tıklamayla indirin.",
  },
};

  const documents = [
  {
    id: 'volt',
    institution: {
      az: 'Volt.az',
      en: 'Volt.az',
      ru: 'Volt.az',
      tr: 'Volt.az'
    },

    title: {
      az: 'Şirkətimiz tərəfindən tələb olunan ilkin sənədlər',
      en: 'Initial documents required by our company',
      ru: 'Первичные документы, требуемые нашей компанией',
      tr: 'Şirketimiz tarafından talep edilen ilk belgeler'
    },

    desc: {
      az: `Layihənin qiymətləndirilməsi və texniki şərtlərin hazırlanması üçün tələb olunan sənədlər:`,
      en: 'Documents required for project evaluation and preparation of technical conditions:',
      ru: 'Документы, необходимые для оценки проекта и подготовки технических условий:',
      tr: 'Projenin değerlendirilmesi ve teknik şartların hazırlanması için gerekli belgeler:'
    },

    requirements: {
      az: [
       `Mülkiyyət hüququnu təsdiq edən sənəd — Çıxarış`,
`Şəxsiyyət vəsiqəsinin surəti`,
`Azərişıq abonent kodu və ya son elektrik enerjisi ödəniş qəbzi`,
`Obyektin ünvanı və ya yerləşdiyi ərazinin koordinatları`
    ],
      en: [
        `Document confirming property ownership — Extract`,
`Copy of ID card`,
`Azərişıq subscriber code or latest electricity payment receipt`,
`Property address or location coordinates`

      ],
      ru: [
        `Документ, подтверждающий право собственности — Выписка`,
`Копия удостоверения личности`,
`Абонентский код Azərişıq или последняя квитанция об оплате электроэнергии`,
`Адрес объекта или координаты его расположения`

      ],
      tr: [
        `Mülkiyet hakkını doğrulayan belge — Çıkarış / Tapu belgesi`,
`Kimlik kartı fotokopisi`,
`Azərişıq abone kodu veya son elektrik ödeme makbuzu`,
`Mülkün adresi veya bulunduğu yerin koordinatları`

      ]
    }
  },

  {
    id: 'asan',

    institution: {
      az: 'ASAN Kommunal / Azərişıq ASC',
      en: 'ASAN Kommunal / Azərişıq ASC',
      ru: 'ASAN Kommunal / Azərişıq ASC',
      tr: 'ASAN Kommunal / Azərişıq ASC'
    },

    title: {
      az: 'Aktiv istehlakçı qeydiyyatı',
      en: 'Active consumer registration',
      ru: 'Регистрация активного потребителя',
      tr: 'Aktif tüketici kaydı'
    },

    desc: {
      az: `Günəş enerji sistemi şəbəkəyə qoşulduqda və artıq enerjinin şəbəkəyə ötürülməsi nəzərdə tutulduqda, müştəri aktiv istehlakçı kimi qeydiyyata alınmalıdır.`,
      en: `When the solar energy system is connected to the grid and excess energy is planned to be exported to the grid, the customer must be registered as an active consumer.`,
      ru: 'Когда солнечная энергетическая система подключается к сети и предусматривается передача излишков энергии в сеть, клиент должен быть зарегистрирован как активный потребитель.',
      tr: 'Güneş enerji sistemi şebekeye bağlandığında ve fazla enerjinin şebekeye verilmesi planlandığında, müşteri aktif tüketici olarak kaydedilmelidir.'
    },

    requirements: {
      az: [
        `Abonentin şəxsiyyət vəsiqəsi`,
`Abonent kodu`,
`Mövcud texniki şərt`,
`Layihə sənədləri`,
`Texniki quraşdırma aktı`
      ],
      en: [
        `Subscriber’s ID card`,
`Subscriber code`,
`Existing technical condition`,
`Project documents`,
`Technical installation act`

      ],
      ru: [
        `Удостоверение личности абонента`,
`Абонентский код`,
`Действующие технические условия`,
`Проектные документы`,
`Акт технической установки`

      ],
      tr: [
        `Abonenin kimlik kartı`,
`Abone kodu`,
`Mevcut teknik şart`,
`Proje belgeleri`,
`Teknik kurulum tutanağı`

      ]
    }
  },

  {
    id: 'azerisiq',

    institution: {
      az: 'Azərişıq ASC',
      en: 'Azərişıq ASC',
      ru: 'Azərişıq ASC',
      tr: 'Azərişıq ASC'
    },

    title: {
      az: 'Şəbəkəyə qoşulma və sayğacın quraşdırılması',
      en: 'Grid connection and meter installation',
      ru: 'Подключение к сети и установка счётчика',
      tr: 'Şebekeye bağlantı ve sayaç kurulumu'
    },

    desc: {
      az: `Mikro-generasiya sisteminin şəbəkəyə qoşulması üçün Azərişıq ASC tərəfindən texniki baxış, müraciət, müqavilə və ikitərəfli sayğacın quraşdırılması mərhələləri həyata keçirilir.`,
      en: `For connecting a micro-generation system to the grid, Azərişıq ASC carries out technical review, application, contract, and two-way meter installation stages.`,
      ru: `Для подключения системы микрогенерации к сети Azərişıq ASC осуществляет техническое рассмотрение, подачу заявки, оформление договора и установку двухстороннего счётчика.`,
      tr: `Mikro üretim sisteminin şebekeye bağlanması için Azərişıq ASC tarafından teknik inceleme, başvuru, sözleşme ve çift yönlü sayaç kurulumu aşamaları yürütülür.`
    },

    requirements: {
      az: [
        `Azərişıq regional idarəsinə müraciət`,
`Texniki şərtlərin yoxlanılması`,
`Elektrik qoşulma sxemi`,
`Import/export tipli sayğacın quraşdırılması`,
`Xidmət müqaviləsi və ödəniş`,
`Elektrik enerjisinin alqı-satqısı müqaviləsi`
      ],
      en: [
        `Application to the regional Azərişıq office`,
`Review of technical conditions`,
`Electrical connection scheme`,
`Installation of import/export type meter`,
`Service contract and payment`,
`Electricity purchase and sale agreement`

      ],
      ru: [
        `Обращение в региональное управление Azərişıq`,
`Проверка технических условий`,
`Электрическая схема подключения`,
`Установка счётчика типа import/export`,
`Договор на услугу и оплата`,
`Договор купли-продажи электроэнергии`

      ],
      tr: [
        `Azərişıq bölge ofisine başvuru`,
`Teknik şartların incelenmesi`,
`Elektrik bağlantı şeması`,
`Import/export tipli sayacın kurulumu`,
`Hizmet sözleşmesi ve ödeme`,
`Elektrik enerjisi alım-satım sözleşmesi`

      ]
    }
  }
];

  return (
    <div className="bg-white min-h-screen relative">
      {/* Page Header */}
      <section className="bg-[var(--color-dark)] py-4 border-b border-[var(--color-primary)] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between relative z-10">
          <button onClick={onBack} className="flex items-center gap-1.5 text-[var(--color-primary)] hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t.back[lang]}
          </button>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">{t.title[lang]}</h1>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-14 md:py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-12 text-center space-y-6">
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">{t.title[lang]}</h2>
          <p className="text-slate-500 max-w-3xl mx-auto text-lg font-medium opacity-80">{t.subtitle[lang]}</p>
        </div>
      </section>

      {/* Documents List */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="space-y-24">
            {documents.map((doc, idx) => (
              <div key={doc.id} className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12 items-start animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="space-y-4 sticky top-32">
                  <div className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-[0.2em]">{t.entityLabel[lang]}</div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">{doc.institution?.[lang] || doc.institution?.['az']}</h3>
                  <div className="w-12 h-1 bg-[var(--color-primary)] rounded-full"></div>
                </div>
                
                <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 space-y-10">
                  <div className="space-y-4">
                    <h4 className="text-2xl font-black text-slate-900">{doc.title?.[lang] || doc.title?.['az']}</h4>
                    <p className="text-slate-500 text-lg leading-relaxed">{doc.desc?.[lang] || doc.desc?.['az']}</p>
                  </div>

                  <div className="space-y-8">
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                       <span className="w-8 h-px bg-slate-200"></span>
                       {t.stepsLabel[lang]}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(doc.requirements?.[lang] || doc.requirements?.['az'] || []).map((step: string, sIdx: number) => (
                        <div key={sIdx} className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-[var(--color-primary)] transition-all group">
                          <div className="w-10 h-10 rounded-2xl bg-white shadow-sm text-[var(--color-primary)] flex items-center justify-center text-sm font-black shrink-0 group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-dark)] transition-all">{sIdx + 1}</div>
                          <span className="text-sm text-slate-700 font-bold leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="bg-[var(--color-dark)] py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-primary)] blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
           <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-primary)] blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8 relative z-10">
          <h2 className="text-3xl md:text-5xl font-black leading-tight">{t.ctaTitle[lang]}</h2>
          <p className="text-white/70 text-lg">{t.ctaDesc[lang]}</p>
          <div className="pt-4">
            <a
  href="https://wa.me/9940504180001?text=Salam%20Volt%20əməkdaşı,%20sənədləşmə%20işləri%20barədə%20məlumat%20almaq%20istəyirəm."
  target="_blank"
  rel="noopener noreferrer"
  data-analytics-placement="necessary_documents_cta"
  data-whatsapp-interaction="documents_consultation"
  data-whatsapp-language={lang}
>
            <button className="inline-flex items-center justify-center bg-[var(--color-primary)] text-[var(--color-dark)] px-10 py-5 min-h-[var(--cta-btn-h)] rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[var(--color-dark)] transition-all shadow-2xl">
              {t.ctaBtn[lang]}
            </button></a>
          </div>

        </div>
      </section>



       <div 
        // className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-100 shadow-[0_-12px_40px_rgba(15,23,42,0.08)] py-5 px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 animate-in slide-in-from-bottom-12"
      className={`
  fixed bottom-0 left-0 right-0 z-50 
  bg-white/90 backdrop-blur-xl border-t border-slate-100
  shadow-[0_-12px_40px_rgba(15,23,42,0.08)]
  py-5 px-6 md:px-12
  flex flex-col sm:flex-row items-center justify-between gap-4

  transition-all duration-500 ease-in-out

  ${showBar 
    ? "translate-y-0 opacity-100" 
    : "translate-y-full opacity-0"
  }
`}
      >
        <div className="flex items-center gap-4 text-left max-w-2xl ">
          <div className="w-11 h-11 bg-[var(--color-surface)] border border-[var(--color-primary)] rounded-xl flex items-center justify-center shrink-0 text-[var(--color-primary)]">
            <svg 
              className="w-5 h-5 animate-pulse" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <span className="text-[8px] font-black text-[var(--color-dark)] uppercase tracking-widest bg-[var(--color-primary)] px-2 py-0.5 rounded-md mb-1 inline-block">
              {t.portalTitle[lang]}
            </span>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              {t.stickyNotice[lang]}
            </p>
          </div>
        </div>

      <a
  href={pdfUrls[lang]}
  target="_blank"
  rel="noopener noreferrer"
  className="
    w-full sm:w-auto
    flex items-center justify-center gap-3

    bg-[var(--color-primary)] hover:bg-[var(--color-dark)]
    border border-[var(--color-primary)]

    text-[var(--color-dark)] hover:text-white font-black uppercase tracking-wider

    text-[10px] sm:text-xs md:text-sm

    px-4 sm:px-6 md:px-8
    py-3 sm:py-4

    rounded-2xl
    shadow-xl shadow-slate-900/10

    active:scale-95 hover:shadow-slate-900/10
    transition-all duration-200
    cursor-pointer group
  "
>
  <svg
    className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-y-0.5 transition-transform"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth="2.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
    />
  </svg>

</a>
      </div>
    </div>
  );
};

export default NecessaryDocumentsPage;
