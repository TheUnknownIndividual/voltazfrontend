
import React, { useState, useEffect } from 'react';
import { useProject } from "../contexts/ProjectContext";
import { Project } from '../types';

export const projectsAZ: Project[] = [
  { id: '1', title: "Qarabağ GES Layihəsi", location: "Ağdam, Azərbaycan", capacity: "500 kW", description: "İşğaldan azad olunmuş ərazilərdə həyata keçirilən ilk genişmiqyaslı günəş stansiyası layihəsidir. Bu layihə regionun enerji müstəqilliyini tam təmin etməklə yanaşı, həm də ərazinin yaşıl enerji zonasına çevrilməsinə böyük töhfə verir. Müasir texnologiyalar tətbiq olunub.", image: "https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&q=80&w=1200" },
  { id: '2', title: "Sumqayıt Sənaye Sistemi", location: "Sumqayıt, Azərbaycan", capacity: "1.2 MW", description: "Sənaye müəssisəsinin enerji ehtiyaclarını 80% nisbətində qarşılayan modern dam üstü günəş paneli sistemidir. Layihə müəssisənin karbon emissiyasını əhəmiyyətli dərəcədə azaldır və uzunmüddətli iqtisadi səmərəlilik təmin edir. Yüksək effektivlikli panellərdən istifadə edilib.", image: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&q=80&w=1200" },
  { id: '3', title: "Bakı Rezidens Layihəsi", location: "Mərdəkan, Bakı", capacity: "15 kW", description: "Ağıllı ev sistemi ilə tam inteqrasiya olunmuş fərdi yaşayış həllidir. Gündüz vaxtı evin bütün enerji təminatını yaşıl enerji hesabına qarşılayır. Müasir texnologiyalar sayəsində enerji sərfiyyatına tam nəzarət etmək və xərcləri minimuma endirmək mümkündür. Estetik dizayn.", image: "https://images.unsplash.com/photo-1594818379496-da1e345b0ded?auto=format&fit=crop&q=80&w=1200" },
  { id: '4', title: "Gəncə Solar Park", location: "Gəncə, Azərbaycan", capacity: "300 kW", description: "Gəncə regionunun sənaye potensialını dəstəkləyən və yerli istehsalatın enerji xərclərini optimallaşdıran yaşıl enerji layihəsidir. Bu park həm də regionda bərpa olunan enerji mənbələrinə olan marağın artmasına və ekoloji təmiz mühitin qorunmasına xidmət edir. Davamlılıq.", image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=1200" },
  { id: '5', title: "Şamaxı Eko-Ferma", location: "Şamaxı, Azərbaycan", capacity: "50 kW", description: "Kənd təsərrüfatı müəssisəsinin tam avtonom enerji təminatını həyata keçirən innovativ layihədir. Şəbəkədən asılı olmadan fəaliyyət göstərən bu sistem, fermer təsərrüfatının fasiləsiz və ucuz enerji ilə təmin olunmasına imkan yaradır. Təbiətlə dost texnologiya tətbiq edilib.", image: "https://images.unsplash.com/photo-1466611653911-954ffaa13b6f?auto=format&fit=crop&q=80&w=1200" }
];

export const projectsEN: Project[] = [
  { id: '1', title: "Karabakh Solar Project", location: "Agdam, Azerbaijan", capacity: "500 kW", description: "The first large-scale solar station in the liberated territories. This project ensures energy independence of the region and contributes significantly to turning the area into a green energy zone. Modern technologies were applied to ensure maximum efficiency.", image: "https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&q=80&w=1200" },
  { id: '2', title: "Factory X System", location: "Sumgait Industrial Park", capacity: "1.2 MW", description: "Modern rooftop solar system covering 80% of industrial needs. The project significantly reduces the carbon footprint of the enterprise and provides long-term economic benefits. High-efficiency panels were used for this large-scale installation.", image: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&q=80&w=1200" },
  { id: '3', title: "Baku Residence", location: "Baku, Azerbaijan", capacity: "15 kW", description: "Smart home integrated solar solution for private residences. It covers the entire daytime energy needs of the house using green energy. Modern technologies allow full control over energy consumption and minimize costs with an aesthetic design.", image: "https://images.unsplash.com/photo-1594818379496-da1e345b0ded?auto=format&fit=crop&q=80&w=1200" },
  { id: '4', title: "Ganja Project", location: "Ganja, Azerbaijan", capacity: "300 kW", description: "Industrial green energy project supporting the industrial potential of the Ganja region. This project optimizes energy costs for local production and serves to increase interest in renewable energy sources while protecting the environment.", image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=1200" },
  { id: '5', title: "Eco Farm", location: "Shamakhi, Azerbaijan", capacity: "50 kW", description: "Autonomous farm energy system providing full energy independence for agricultural enterprises. Operating off-grid, this system allows the farm to be supplied with continuous and low-cost energy using nature-friendly technologies.", image: "https://images.unsplash.com/photo-1466611653911-954ffaa13b6f?auto=format&fit=crop&q=80&w=1200" }
];

export const projectsRU: Project[] = [
  { id: '1', title: "Проект Карабахская СЭС", location: "Агдам, Азербайджан", capacity: "500 кВт", description: "Первая крупномасштабная солнечная станция на освобожденных территориях. Этот проект обеспечивает энергетическую независимость региона и вносит значительный вклад в превращение территории в зону зеленой энергии. Применены современные технологии.", image: "https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&q=80&w=1200" },
  { id: '2', title: "Кровельная система Завода X", location: "Сумгаитский индустриальный парк", capacity: "1.2 МВт", description: "Современная кровельная система солнечных панелей, покрывающая 80% потребностей промышленного предприятия. Проект значительно снижает углеродный след предприятия и обеспечивает долгосрочную экономическую выгоду. Использованы высокоэффективные панели.", image: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&q=80&w=1200" },
  { id: '3', title: "Бакинская Резиденция", location: "Баку, Азербайджан", capacity: "15 кВт", description: "Интегрированное решение для умного дома в частных резиденциях. Оно полностью покрывает дневные потребности дома в электроэнергии за счет зеленой энергии. Современные технологии позволяют полностью контролировать потребление и минимизировать расходы.", image: "https://images.unsplash.com/photo-1594818379496-da1e345b0ded?auto=format&fit=crop&q=80&w=1200" },
  { id: '4', title: "Проект Гянджа", location: "Гянджа, Азербайджан", capacity: "300 кВт", description: "Промышленный проект зеленой энергии, поддерживающий индустриальный потенциал Гянджинского региона. Этот проект оптимизирует затраты на электроэнергию для местного производства и способствует росту интереса к возобновляемым источникам энергии.", image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=1200" },
  { id: '5', title: "Эко Ферма", location: "Шамахы, Азербайджан", capacity: "50 кВт", description: "Автономная система энергоснабжения фермы, обеспечивающая полную независимость сельскохозяйственных предприятий. Работая вне сети, эта система позволяет ферме получать непрерывную и недорогую энергию с использованием экологически чистых технологий.", image: "https://images.unsplash.com/photo-1466611653911-954ffaa13b6f?auto=format&fit=crop&q=80&w=1200" }
];

const Projects: React.FC<{ onSelectProject: (id: string) => void; lang?: 'az' | 'en' | 'ru' | 'tr' }> = ({ onSelectProject, lang = 'az' }) => {
  const { loading, projects, getProjects } = useProject();
  const [activeIndex, setActiveIndex] = useState(0);
  const [dynamicProjects, setDynamicProjects] = useState<any[]>([]);

      useEffect(() => {
      getProjects();
    }, [lang]);

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


  const transformedProjects = (projects || []).map(transformProject);

useEffect(() => {
  if (transformedProjects.length === 0) return;

  const timer = setInterval(() => {
    setActiveIndex((prev) => (prev + 1) % transformedProjects.length);
  }, 5000);

  return () => clearInterval(timer);
}, [transformedProjects.length]);

 if (transformedProjects.length === 0) return null;

const currentProject = transformedProjects[activeIndex];

const title =
  currentProject?.title?.[lang] ||
  currentProject?.title?.az ||
  '';

const desc =
  currentProject?.about?.[lang] ||
  currentProject?.about?.az ||
  '';

const power = currentProject?.totalPower || '';

  const getPosition = (index: number) => {
    const total = transformedProjects.length;
    const diff = (index - activeIndex + total) % total;
    if (diff === 0) return 'center';
    if (diff === 1) return 'right';
    if (diff === 2) return 'far-right';
    if (diff === total - 1) return 'left';
    if (diff === total - 2) return 'far-left';
    return 'hidden';
  };
  

  return (
    <section id="projects" className="py-12 md:py-20 bg-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
          <div className="lg:col-span-4 space-y-2 md:space-y-4 text-left">
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight mb-1 md:mb-2">Portfoliomuz</h2>
            </div>
            <div className="space-y-2 md:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="hidden md:block bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 w-fit">
                  GÜC: {power}
               </div>
               <h4 className="text-xl md:text-2xl font-black text-slate-900 leading-snug">
                  {title} 
                  <span className="md:hidden text-emerald-600 ml-1.5">({power})</span>
               </h4>
               <p className="text-slate-500 text-[11px] md:text-sm leading-relaxed line-clamp-2 md:line-clamp-none">
                  {desc}
               </p>
               <button onClick={() => onSelectProject(currentProject.id)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95">Layihəyə Bax</button>
            </div>
          </div>

          <div className="lg:col-span-8 relative h-[280px] md:h-[420px] flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              {transformedProjects.map((project, index) => {
                const position = getPosition(index);
                if (position === 'hidden') return null;
                const pTitle = project.title?.[lang] || project.title?.['az'] || '';
                return (
                  <div
                    key={project.id}
                    className={`absolute transition-all duration-700 ease-in-out cursor-pointer
                      ${position === 'center' ? 'z-40 w-full max-w-[360px] md:max-w-[540px] opacity-100 scale-100 translate-x-0 shadow-2xl' : ''}
                      ${position === 'right' ? 'z-30 w-full max-w-[260px] md:max-w-[380px] opacity-40 scale-75 translate-x-[55%] blur-[1px]' : ''}
                      ${position === 'left' ? 'z-30 w-full max-w-[260px] md:max-w-[380px] opacity-40 scale-75 -translate-x-[55%] blur-[1px]' : ''}
                      ${position === 'far-right' ? 'z-20 w-full max-w-[190px] md:max-w-[300px] opacity-10 scale-50 translate-x-[90%] blur-[4px]' : ''}
                      ${position === 'far-left' ? 'z-20 w-full max-w-[190px] md:max-w-[300px] opacity-10 scale-50 -translate-x-[90%] blur-[4px]' : ''}
                    `}
                    onClick={() => position !== 'center' && setActiveIndex(index)}
                  >
                    <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-slate-100 h-[190px] md:h-[300px]">
                      <img src={project.image?.[0]} alt={pTitle} width="720" height="400" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="absolute -bottom-4 md:-bottom-6 flex gap-2">
              {transformedProjects.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all ${i === activeIndex ? 'w-6 md:w-8 bg-emerald-600' : 'w-1.5 bg-slate-200'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
