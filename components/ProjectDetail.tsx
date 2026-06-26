
import React, {useState} from 'react';
import { useProject } from "../contexts/ProjectContext";

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
  // Added lang to props
  lang?: 'az' | 'en' | 'ru' | 'tr';
}
const LANGUAGES = [
  { code: 'az', name: 'Azərbaycan' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'tr', name: 'Türkçe' }
] as const;

type LangCode = typeof LANGUAGES[number]['code'];

const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack, lang }) => {
    const {  getProjectById} = useProject();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeLang, setActiveLang] = useState<LangCode>('az')
  const [project, setProject] = React.useState<any>(null);
    const systemTypes = [
    { id: 1, label: "On-Grid" },
    { id: 2, label: "Off-Grid" },
    { id: 3, label: "Hybrid" }
  ];

  const powerUnits = [
    { id: 1, label: "kW" },
    { id: 2, label: "MW" },
    { id: 3, label: "GW" }
  ];

  const productionUnits = [
    { id: 1, label: "kWh" },
    { id: 2, label: "MWh" },
    { id: 3, label: "GWh" }
  ];

  const mapLang = (code: number) => {
    switch (code) {
      case 1: return "az";
      case 2: return "en";
      case 3: return "ru";
      case 4: return "tr";
      default: return "az";
    }
  };
const nextImage = () => {
  setCurrentIndex(prev =>
    prev === project.image.length - 1 ? 0 : prev + 1
  );
};

const prevImage = () => {
  setCurrentIndex(prev =>
    prev === 0 ? project.image.length - 1 : prev - 1
  );
};

const getUnitLabel = (units: { id: number; label: string }[], id: number) => {
  return units.find(u => u.id === id)?.label || "";
};
 const transformProject = (item: any) => {
    const title = { az: "", en: "", ru: "", tr: "" };
    const about = { az: "", en: "", ru: "", tr: "" };
    const location = { az: "", en: "", ru: "", tr: "" };

    (item.languages || []).forEach((langItem: any) => {
      const lang =
        langItem.languageCode === 1 ? "az" :
          langItem.languageCode === 2 ? "en" :
            langItem.languageCode === 3 ? "ru" : "tr";

      title[lang] = langItem.title || "";
      about[lang] = langItem.description || "";
      location[lang] = langItem.location || "";
    });

    return {
      id: item.id,
      title,
      about,
      location,

      totalPower: item.totalPower ?? "",
      powerType: item.powerType ?? 1,
      annualProduction: item.annualProduction ?? "",
      annualProductionType: item.annualProductionType ?? 1,
      systemType: item.systemType ?? "",

      image: item.images?.map((img: any) => img.imagePath) || [],

      isActive: item.isActive ?? true,
    };
  };

React.useEffect(() => {
  const load = async () => {
    const data = await getProjectById(projectId);
    const transformed = transformProject(data);
setProject(transformed);
  };

  load();
}, [projectId]);

  if (!project) return <div className="pt-32 text-center font-bold font-black text-slate-400 uppercase tracking-widest">{lang === 'az' ? 'Layihə tapılmadı' : lang === 'ru' ? 'Проект не найден' : 'Project not found'}</div>;

  


  return (
    <div className="bg-white min-h-screen relative pb-20">
      <section className="bg-emerald-950 py-4 border-b border-emerald-900/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between relative z-10">
          <button onClick={onBack} className="flex items-center gap-1.5 text-emerald-300/60 hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {lang === 'az' ? 'Geri qayıt' : lang === 'ru' ? 'Назад' : 'Go back'}
          </button>
          <h1 className="text-sm font-black text-white uppercase tracking-widest truncate max-w-[200px] md:max-w-none">{project.title?.[activeLang]}</h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-12">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
          <div className="lg:col-span-7">
        
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl mb-8 aspect-video bg-slate-100">

  {/* Image */}
  <img
    src={project.image[currentIndex]}
    alt={project.title?.[activeLang]}
    className="w-full h-full"
  />

  {/* LEFT BUTTON */}
  {project.image.length > 1 && (
   <button
  onClick={prevImage}
  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
  </svg>
</button>
  )}

  {/* RIGHT BUTTON */}
  {project.image.length > 1 && (
    <button
  onClick={nextImage}
  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
</button>
  )}

</div>
<div className="flex gap-2 mt-4 overflow-x-auto">
  {project.image.map((img, i) => (
    <img
      key={i}
      src={img}
      onClick={() => setCurrentIndex(i)}
      className={`w-20 h-16 rounded-lg cursor-pointer border-2 ${
        i === currentIndex ? "border-emerald-500" : "border-transparent"
      }`}
    />
  ))}
</div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 mt-6">{project.title?.[activeLang]}</h1>
            <div className="prose prose-lg text-slate-600 leading-relaxed max-w-none">
              <p className="whitespace-pre-line">{project.about?.[activeLang]}</p>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-12 space-y-6">
              <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8">
                <h3 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-200 pb-4">
                  {lang === 'az' ? 'Texniki Parametrlər' : lang === 'ru' ? 'Технические параметры' : 'Technical Parameters'}
                </h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{lang === 'az' ? 'Məkan' : lang === 'ru' ? 'Место' : 'Location'}</span>
                    <span className="text-slate-900 font-bold text-sm">{project.location?.[activeLang]}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{lang === 'az' ? 'Ümumi Güc' : lang === 'ru' ? 'Общая мощность' : 'Total Power'}</span>
                    <span className="text-emerald-600 font-black text-base">{project.totalPower} {getUnitLabel(powerUnits, project.powerType)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{lang === 'az' ? 'İllik İstehsal' : lang === 'ru' ? 'Годовое производство' : 'Annual Generation'}</span>
                    <span className="text-slate-900 font-bold text-sm">{project.annualProduction} {getUnitLabel(productionUnits, project.annualProductionType)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{lang === 'az' ? 'Sistem Tipi' : lang === 'ru' ? 'Тип системы' : 'System Type'}</span>
                    <span className="text-slate-900 font-bold text-sm">{getUnitLabel(systemTypes, project.systemType)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                <h4 className="text-lg font-black mb-4 relative z-10">{lang === 'az' ? 'Məsləhət lazımdır?' : lang === 'ru' ? 'Нужна консультация?' : 'Need a consultation?'}</h4>
                <p className="text-emerald-100/60 text-xs mb-6 relative z-10 leading-relaxed">{lang === 'az' ? 'Mühəndislərimiz sizə ən uyğun solar həllini seçməkdə kömək edəcəklər.' : lang === 'ru' ? 'Наши инженеры помогут вам выбрать наиболее подходящее солнечное решение.' : 'Our engineers will help you choose the most suitable solar solution.'}</p>
                <div className="flex items-center gap-3 text-emerald-400 font-black text-sm relative z-10">
                   <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                   </div>
                   <span>+994 50 418 00 01</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
