import React, { useState, useEffect } from 'react';
import { useProject } from "../contexts/ProjectContext";
import { projectsAZ, projectsEN, projectsRU } from './Projects';

interface ProjectsPageProps {
  onSelectProject: (id: string) => void;
  lang?: 'az' | 'en' | 'ru';
  onBack?: () => void;
}

const LANGUAGES = [
  { code: 'az', name: 'Azərbaycan' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'tr', name: 'Türkçe' }
] as const;

type LangCode = typeof LANGUAGES[number]['code'];

const ProjectsPage: React.FC<ProjectsPageProps> = ({ onSelectProject, lang , onBack }) => {
  const { loading, projects, getProjects } = useProject();
  const [activeLang, setActiveLang] = useState<LangCode>('az');
  const [dynamicProjects, setDynamicProjects] = useState<any[]>([]);

    useEffect(() => {
    getProjects();
  }, [lang]);

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



 const t = {
  title: {
    az: "Layihələr",
    en: "Projects",
    ru: "Проекты",
    tr: "Projeler",
  },

  back: {
    az: "Geri qayıt",
    en: "Back",
    ru: "Назад",
    tr: "Geri dön",
  },
};

  return (
    <div className="bg-white min-h-screen">
      {/* Compressed Hero */}
      <section className="bg-emerald-950 py-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between relative z-10">
          <button 
            onClick={onBack}
            className="flex items-center gap-1.5 text-emerald-300/60 hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t.back[lang]}
          </button>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">{t.title[lang]}</h1>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {transformedProjects.map((project) => (
              <div 
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="group cursor-pointer bg-white rounded-[2rem] overflow-hidden border border-gray-100 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={project.image?.[0]} 
                    alt={project.title?.[lang]}
                    className="w-full h-full transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="bg-emerald-600 px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest">
                      {project.totalPower} {getUnitLabel(powerUnits, project.powerType)}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-slate-400 text-[8px] font-black uppercase tracking-widest mb-2">
                    <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {project.location?.[lang]}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {project.title?.[lang]}
                  </h3>
                </div>
              </div>
            ))}
          </div>
          {projects.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">
              Heç bir layihə tapılmadı
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProjectsPage;
