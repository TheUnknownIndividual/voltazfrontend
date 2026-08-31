import { useAbout } from '../contexts/AboutContext';
import React, {useState} from 'react';

interface AboutDetailProps {
  lang?: 'az' | 'en' | 'ru' | 'tr';
  onBack: () => void;
  sectionId: string;
}

const LANGUAGES = [
  { code: 'az', name: 'Azərbaycan' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'tr', name: 'Türkçe' }
] as const;

type LangCode = typeof LANGUAGES[number]['code'];

const AboutDetail: React.FC<AboutDetailProps> = ({ lang , onBack, sectionId }) => {
  const { getAboutById, loading } = useAbout();
  const [data, setData] = React.useState<any>(null);

  const transformAbout = (item: any) => {
  const title = { az: "", en: "", ru: "", tr: "" };
  const description = { az: "", en: "", ru: "", tr: "" };

  (item.languages || []).forEach((langItem: any) => {
    const lang =
      langItem.languageCode === 1 ? "az" :
      langItem.languageCode === 2 ? "en" :
      langItem.languageCode === 3 ? "ru" : "tr";

    title[lang] = langItem.title || "";
    description[lang] = langItem.description || "";
  });

  return {
    id: item.id,
    title,
    description,
    image: item.imagePath || "",
  };
};

React.useEffect(() => {
  const load = async () => {
    try {
      const res = await getAboutById(sectionId);
      const transformed = transformAbout(res);
      console.log(transformed);
      setData(transformed);
    } catch (err) {
      console.error(err);
    }
  };

  load();
}, [sectionId]);

const t = {
  trustedPartner: {
    az: "Etibarlı Tərəfdaş",
    en: "Trusted Partner",
    ru: "Надёжный партнёр",
    tr: "Güvenilir Ortak",
  },
  sustainableEnergySolutions: {
    az: "Dayanıqlı Enerji Həlləri",
    en: "Sustainable Energy Solutions",
    ru: "Устойчивые энергетические решения",
    tr: "Sürdürülebilir Enerji Çözümleri",
  },
   launchYear: {
    az: "Rəsmi fəaliyyət başlanğıcı",
    en: "Official launch year",
    ru: "Год официального запуска",
    tr: "Resmi faaliyet başlangıcı",
  },

  qualityCommitment: {
    az: "Keyfiyyətə bağlılıq",
    en: "Commitment to quality",
    ru: "Приверженность качеству",
    tr: "Kaliteye bağlılık",
  },
};



if (!data) {
  return (
    <div className="pt-32 text-center font-bold text-slate-400">
      Loading...
    </div>
  );
}

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-emerald-950 py-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between relative z-10">
          <button 
            onClick={onBack}
            className="flex items-center gap-1.5 text-emerald-300/60 hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {lang === 'az' ? 'Geri qayıt' : lang === 'ru' ? 'Назад' : lang === 'tr' ? 'Geri dön' : 'Back'}
          </button>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">{data.title?.[lang]}</h1>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-start">
            <div className="space-y-8">
              <div className="prose prose-emerald max-w-none">
                <p className="text-slate-600 text-base md:text-xl leading-relaxed text-justify font-medium">
                  {data.description?.[lang]}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                  <div className="text-emerald-600 font-black text-2xl mb-1">2026</div>
                  <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{t.launchYear[lang]}</div>
                </div>
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                  <div className="text-emerald-600 font-black text-2xl mb-1">100%</div>
                  <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{t.qualityCommitment[lang]}</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                <img src={data.image} alt={data.title?.[lang]} className="w-full aspect-[3/4] object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <div className="text-slate-900 font-black text-lg">{t.trustedPartner[lang]}</div>
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.sustainableEnergySolutions[lang]}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutDetail;
