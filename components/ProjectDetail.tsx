
import React, {useState} from 'react';
import { useProject } from "../contexts/ProjectContext";

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
  // Added lang to props
  lang?: 'az' | 'en' | 'ru' | 'tr';
}
const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack, lang }) => {
    const {  getProjectById} = useProject();
    const [currentIndex, setCurrentIndex] = useState(0);
    const activeLang = lang || 'az';
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
  const localizedValue = (values: Record<string, string> | undefined) =>
    values?.[activeLang] || values?.az || values?.en || values?.ru || values?.tr || '';
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

  const copy = activeLang === 'az'
    ? { notFound: 'Layihə tapılmadı', back: 'Geri qayıt', parameters: 'Texniki parametrlər', location: 'Məkan', power: 'Ümumi güc', annual: 'İllik istehsal', system: 'Sistem tipi', consultation: 'Məsləhət lazımdır?', consultationText: 'Mühəndislərimiz sizə ən uyğun günəş enerjisi həllini seçməkdə kömək edəcəklər.' }
    : activeLang === 'ru'
      ? { notFound: 'Проект не найден', back: 'Назад', parameters: 'Технические параметры', location: 'Местоположение', power: 'Общая мощность', annual: 'Годовая выработка', system: 'Тип системы', consultation: 'Нужна консультация?', consultationText: 'Наши инженеры помогут подобрать наиболее подходящее решение в области солнечной энергетики.' }
      : activeLang === 'tr'
        ? { notFound: 'Proje bulunamadı', back: 'Geri dön', parameters: 'Teknik özellikler', location: 'Konum', power: 'Toplam güç', annual: 'Yıllık üretim', system: 'Sistem tipi', consultation: 'Danışmanlığa mı ihtiyacınız var?', consultationText: 'Mühendislerimiz en uygun güneş enerjisi çözümünü seçmenize yardımcı olacaktır.' }
        : { notFound: 'Project not found', back: 'Go back', parameters: 'Technical specifications', location: 'Location', power: 'Total power', annual: 'Annual generation', system: 'System type', consultation: 'Need a consultation?', consultationText: 'Our engineers will help you select the solar-energy solution that fits you best.' };

  if (!project) return <div className="pt-32 text-center font-bold font-black text-slate-400 uppercase tracking-widest">{copy.notFound}</div>;

  


  return (
    <div className="bg-white min-h-screen relative pb-20">
      <section className="bg-emerald-950 py-4 border-b border-emerald-900/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between relative z-10">
          <button onClick={onBack} className="flex items-center gap-1.5 text-emerald-300/60 hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {copy.back}
          </button>
          <h1 className="text-sm font-black text-white uppercase tracking-widest truncate max-w-[200px] md:max-w-none">{localizedValue(project.title)}</h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-12">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
          <div className="lg:col-span-7">
        
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl mb-8 aspect-video bg-slate-100">

  {/* Image */}
  <img
    src={project.image[currentIndex]}
    alt={localizedValue(project.title)}
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
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 mt-6">{localizedValue(project.title)}</h1>
            <div className="prose prose-lg text-slate-600 leading-relaxed max-w-none">
              <p className="whitespace-pre-line">{localizedValue(project.about)}</p>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-12 space-y-6">
              <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8">
                <h3 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-200 pb-4">
                  {copy.parameters}
                </h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{copy.location}</span>
                    <span className="text-slate-900 font-bold text-sm">{localizedValue(project.location)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{copy.power}</span>
                    <span className="text-emerald-600 font-black text-base">{project.totalPower} {getUnitLabel(powerUnits, project.powerType)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{copy.annual}</span>
                    <span className="text-slate-900 font-bold text-sm">{project.annualProduction} {getUnitLabel(productionUnits, project.annualProductionType)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{copy.system}</span>
                    <span className="text-slate-900 font-bold text-sm">{getUnitLabel(systemTypes, project.systemType)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                <h4 className="text-lg font-black mb-4 relative z-10">{copy.consultation}</h4>
                <p className="text-emerald-100/60 text-xs mb-6 relative z-10 leading-relaxed">{copy.consultationText}</p>
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
