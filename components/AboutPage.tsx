
import React, { useEffect } from 'react';
import { useAbout } from '../contexts/AboutContext';

interface AboutPageProps {
  lang?: 'az' | 'en' | 'ru' | 'tr';
  onBack?: () => void;
  onNavigate?: (page: any, id?: string, extra?: any) => void;
  sectionId?: string;
}

const AboutPage: React.FC<AboutPageProps> = ({ lang , onBack, onNavigate, sectionId }) => {
  const { aboutData, getAbout} = useAbout();
    useEffect(() => {
    getAbout();
  }, [lang]);
  
  useEffect(() => {
    if (sectionId) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [sectionId]);

const t = {
  back: {
    az: "Geri qayıt",
    en: "Back",
    ru: "Назад",
    tr: "Geri dön",
  },

  title: {
    az: "Haqqımızda",
    en: "About Us",
    ru: "О нас",
    tr: "Hakkımızda",
  },

  readMore: {
    az: "Daha çox oxu",
    en: "Read More",
    ru: "Подробнее",
    tr: "Daha Fazla Oku",
  },
};
  const items = [
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 21a11.955 11.955 0 01-9.618-7.016A11.955 11.955 0 0112 3c1.74 0 3.41.37 4.912 1.036",
    title: {
      az: "25 İl Zəmanət",
      en: "25 Year Warranty",
      ru: "Гарантия 25 лет",
      tr: "25 Yıl Garanti"
    },
    desc: {
      az: "Məhsullarımızın performansına tam zəmanət veririk.",
      en: "We guarantee the long term performance of our products.",
      ru: "Мы гарантируем долгосрочную эффективность нашей продукции.",
      tr: "Ürünlerimizin uzun vadeli performansını garanti ediyoruz."
    }
  },
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    title: {
      az: "Peşəkar Heyət",
      en: "Professional Team",
      ru: "Профессиональная команда",
      tr: "Profesyonel Ekip"
    },
    desc: {
      az: "Mühəndislərimiz beynəlxalq sertifikatlara malikdir.",
      en: "Our engineers hold international certifications and professional expertise.",
      ru: "Наши инженеры обладают международными сертификатами и опытом.",
      tr: "Mühendislerimiz uluslararası sertifikalara sahiptir."
    }
  },
  {
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0116 0z",
    title: {
      az: "Yaşıl Gələcək",
      en: "Greener Future",
      ru: "Зелёное будущее",
      tr: "Yeşil Gelecek"
    },
    desc: {
      az: "Hər layihə ilə karbon emissiyasını azaldırıq.",
      en: "With every project, we contribute to reducing carbon emissions.",
      ru: "Каждым проектом мы сокращаем выбросы углерода.",
      tr: "Her projeyle karbon emisyonlarını azaltıyoruz."
    }
  }
];

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

    {/* Zig-Zag Content Sections */}
<div className="py-12 md:py-20 space-y-24 md:space-y-32">
  {aboutData?.map((item, idx) => {
    const langData = item.languages?.[0];
    const image = item.imagePath;

    const isReversed = idx % 2 !== 0;

    return (
      <section
        key={item.id}
        className="max-w-7xl mx-auto px-4 md:px-12 scroll-mt-32"
      >
        <div
          className={`flex flex-col ${
            isReversed ? "md:flex-row-reverse" : "md:flex-row"
          } items-center gap-12 md:gap-20`}
        >
          
          {/* Text Side */}
          <div className="flex-1 space-y-5 md:space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-emerald-600 font-black text-[9px] uppercase tracking-[0.2em] bg-emerald-50 px-3 py-1 rounded-lg">
                Bölmə 0{idx + 1}
              </span>
            </div>

            <h3 className="text-2xl md:text-4xl font-black text-slate-900">
              {langData?.title}
            </h3>

            <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium opacity-90 text-justify md:text-left line-clamp-5">
              {langData?.description}
            </p>

            <div className="pt-2">
              <button
                onClick={() =>
                  onNavigate?.("about-detail", undefined, {
                    section: item.id,
                  })
                }
                className="group inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.13em] text-white transition-colors duration-150 hover:bg-[var(--color-accent)] hover:text-[var(--color-dark)]"
              >
                {t.readMore[lang]}
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Image Side */}
          <div className="flex-1 w-full">
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 aspect-video md:aspect-square lg:aspect-video group">
              <img
                src={image}
                alt={langData?.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-all duration-500"></div>
            </div>
          </div>

        </div>
      </section>
    );
  })}
</div>

      {/* Minimal Values Bar */}
      <section className="bg-slate-50 py-16 border-t border-slate-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {items.map((val, i) => (
               <div key={i} className="flex gap-5 items-start p-6 bg-white rounded-3xl border border-slate-100">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={val.icon} /></svg>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm mb-1">{val.title[lang]}</h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{val.desc[lang]}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
