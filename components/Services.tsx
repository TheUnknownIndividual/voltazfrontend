
import React, { useState, useEffect } from 'react';

interface ServicesProps {
  onNavigate: (page: any) => void;
  lang?: 'az' | 'en' | 'ru' | 'tr';
}

const Services: React.FC<ServicesProps> = ({ onNavigate, lang = 'az' }) => {
  const FIXED_SERVICES = [
    {
      id: "install",
      title: { az: "Günəş Paneli Quraşdırılması", en: "Solar Panel Installation", ru: "Установка солнечных панелей", tr: "Güneş Paneli Kurulumu" },
      desc: { az: "Peşəkar quraşdırma xidməti və 25 il zəmanət", en: "Professional installation service and 25-year warranty", ru: "Профессиональный монтаж и 25-летняя гарантия", tr: "Profesyonel kurulum hizmeti ve 25 yıl garanti" },
      features: {
        az: ["Keyfiyyətli panellər", "25 il zəmanət", "Peşəkar quraşdırma", "Texniki dəstək"],
        en: ["Quality panels", "25-year warranty", "Professional installation", "Technical support"],
        ru: ["Качественные панели", "25-летняя гарантия", "Профессиональный монтаж", "Техническая поддержка"],
        tr: ["Kaliteli paneller", "25 yıl garanti", "Profesyonel kurulum", "Teknik destek"]
      },
      iconPath: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
    },
    {
      id: "smart-meter",
      title: { az: "Smart Sayğac İnteqrasiyası", en: "Smart Meter Integration", ru: "Интеграция смарт-счетчиков", tr: "Akıllı Sayaç Entegrasyonu" },
      desc: { az: "Azerishiq şəbəkəsinə qoşulma və rəsmiləşdirmə", en: "Connection and formalization to Azerishiq network", ru: "Подключение и оформление в сети Азеришиг", tr: "Azerishiq şebekesine bağlantı ve resmileştirme" },
      features: {
        az: ["İki tərəfli sayğac", "Azerishiq inteqrasiyası", "Rəsmiləşdirmə", "Qoşulma"],
        en: ["Two-way meter", "Azerishiq integration", "Formalization", "Connection"],
        ru: ["Двусторонний счетчик", "Интеграция с Азеришиг", "Оформление", "Подключение"],
        tr: ["Çift yönlü sayaç", "Azerishiq entegrasyonu", "Resmileştirme", "Bağlantı"]
      },
      iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    },
    {
      id: "finance",
      title: { az: "Maliyyə Həlləri", en: "Financial Solutions", ru: "Финансовые решения", tr: "Finansal Çözümler" },
      desc: { az: "Kredit və lizinq imkanları ilə asan ödəniş", en: "Easy payment with credit and leasing options", ru: "Простая оплата с кредитом и лизингом", tr: "Kredi ve leasing imkanları ile kolay ödeme" },
      features: {
        az: ["Bank krediti", "Lizinq imkanları", "0% faiz", "Asan şərtlər"],
        en: ["Bank credit", "Leasing options", "0% interest", "Easy terms"],
        ru: ["Банковский кредит", "Возможности лизинга", "0% ставка", "Легкие условия"],
        tr: ["Banka kredisi", "Leasing imkanları", "%0 faiz", "Kolay şartlar"]
      },
      iconPath: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0116 0z"
    },
    {
      id: "maintenance",
      title: { az: "Texniki Xidmət", en: "Technical Maintenance", ru: "Техническое обслуживание", tr: "Teknik Servis" },
      desc: { az: "Daimi texniki dəstək və sistem monitorinqi", en: "Constant technical support and system monitoring", ru: "Постоянная техподдержка и мониторинг системы", tr: "Sürekli teknik destek ve sistem izleme" },
      features: {
        az: ["Aylıq yoxlama", "Təmizlik xidməti", "24/7 dəstək", "Uzaqdan monitorinq"],
        en: ["Monthly check", "Cleaning service", "24/7 support", "Remote monitoring"],
        ru: ["Ежемесячная проверка", "Клининг", "24/7 поддержка", "Удаленный мониторинг"],
        tr: ["Aylık kontrol", "Temizlik hizmeti", "7/24 destek", "Uzaktan izleme"]
      },
      iconPath: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    },
    {
      id: "consultation",
      title: { az: "Konsultasiya", en: "Consultation", ru: "Консультация", tr: "Danışmanlık" },
      desc: { az: "Enerji auditləri və sistem optimallaşdırılması", en: "Energy audits and system optimization", ru: "Энергетический аудит и оптимизация системы", tr: "Enerji denetimleri ve sistem optimizasyonu" },
      features: {
        az: ["Enerji auditi", "Sistem dizaynı", "Optimallaşdırma", "ROI analizi"],
        en: ["Energy audit", "System design", "Optimization", "ROI analysis"],
        ru: ["Энергоаудит", "Дизайн системы", "Оптимизация", "ROI анализ"],
        tr: ["Enerji denetimi", "Sistem tasarımı", "Optimizasyon", "ROI analizi"]
      },
      iconPath: "M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
    },
    {
      id: "legal",
      title: { az: "Hüquqi Dəstək", en: "Legal Support", ru: "Юридическая поддержка", tr: "Hukuki Destek" },
      desc: { az: "Sənədləşmə və qanuni rəsmiləşdirmə prosesi", en: "Documentation and legal formalization process", ru: "Процесс оформления и легализации", tr: "Belgeleme ve yasal resmileştirme süreci" },
      features: {
        az: ["Sənəd hazırlığı", "Müraciət forması", "Hüquqi məsləhət", "İcazə alınması"],
        en: ["Document preparation", "Application form", "Legal advice", "Obtaining permits"],
        ru: ["Подготовка документов", "Форма заявки", "Юридическая консультация", "Получение разрешений"],
        tr: ["Belge hazırlığı", "Başvuru formu", "Hukuki danışmanlık", "İzinlerin alınması"]
      },
      iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    }
  ];

  const [dynamicServices, setDynamicServices] = useState<any[]>(FIXED_SERVICES);

  useEffect(() => {
    // We strictly use FIXED_SERVICES as per your request "Yalnız verdiyim promtu əlavə et"
    setDynamicServices(FIXED_SERVICES);
  }, []);

  const t = {
    title: lang === 'az' ? 'Xidmətlərimiz' : lang === 'en' ? 'Our Services' : 'Наши услуги',
    more: lang === 'az' ? 'Bütün xidmətlər' : lang === 'en' ? 'All services' : 'Все услуги',
    features: lang === 'az' ? 'Üstünlüklər' : lang === 'en' ? 'Features' : 'Преимущества'
  };

  if (dynamicServices.length === 0) return null;

  return (
    <section id="services-home" className="py-20 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="text-left">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">{t.title}</h2>
            <div className="w-20 h-1.5 bg-emerald-500 rounded-full"></div>
          </div>
          <button 
            onClick={() => onNavigate('services')}
            className="group flex items-center gap-3 text-[var(--color-primary)] font-black text-[10px] uppercase tracking-[0.2em] hover:text-[var(--color-dark)] transition-all"
          >
            {t.more}
            <svg className="w-5 h-5 p-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_15%,white)] group-hover:bg-[var(--color-dark)] group-hover:text-white transition-all transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dynamicServices.map((service, idx) => (
            <div 
              key={service.id || idx}
              className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col items-start text-left"
            >
              <div className="w-16 h-16 bg-[color-mix(in_srgb,var(--color-primary)_9%,white)] text-[var(--color-primary)] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-dark)] transition-all duration-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={service.iconPath} />
                </svg>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-4 group-hover:text-[var(--color-primary)] transition-colors h-14 overflow-hidden">
                {service.title?.[lang] || service.title?.['az'] || ''}
              </h3>
              
              <p className="text-slate-500 text-sm leading-relaxed mb-8 h-20 overflow-hidden opacity-80">
                {service.desc?.[lang] || service.desc?.['az'] || ''}
              </p>

              <div className="space-y-3 mb-8 w-full">
                {(service.features?.[lang] || service.features?.['az'] || []).slice(0, 3).map((f: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"></div>
                    {f}
                  </div>
                ))}
              </div>

              <button 
                onClick={() => onNavigate('services')}
                className="mt-auto w-full py-4 rounded-2xl bg-slate-50 text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-[var(--color-primary)] hover:text-[var(--color-dark)] transition-all shadow-sm"
              >
                {lang === 'az' ? 'Ətraflı Bax' : 'Read More'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
