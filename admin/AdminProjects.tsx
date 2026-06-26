import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useProject } from "../contexts/ProjectContext";
import { useUpload } from "../contexts/UploadContext";

interface ProjectItem {
  id: string;
  title: { az: string; en: string; ru: string; tr: string };
  about: { az: string; en: string; ru: string; tr: string };
  location: { az: string; en: string; ru: string; tr: string };
  totalPower: string;
  powerType: number;
  annualProduction: string;
  annualProductionType: number;
  systemType: string;
  image: string[];
  isActive: boolean;
}

interface AdminProjectsProps {
  onBack: () => void;
}

const LANGUAGES = [
  { code: 'az', name: 'Azərbaycan' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'tr', name: 'Türkçe' }
] as const;

type LangCode = typeof LANGUAGES[number]['code'];

const AdminProjects: React.FC<AdminProjectsProps> = ({ onBack }) => {
  const { showNotification, confirm } = useNotification();
  const { loading, projects, getProjects, createProject, getProjectById, updateProject, deleteProject } = useProject();
  const { uploadImage, deleteImage } = useUpload();
  // const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [activeLang, setActiveLang] = useState<LangCode>('az');
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<ProjectItem, 'id'>>({
    title: { az: '', en: '', ru: '', tr: '' },
    about: { az: '', en: '', ru: '', tr: '' },
    location: { az: '', en: '', ru: '', tr: '' },
    totalPower: '',
    powerType: 1,
    annualProduction: '',
    annualProductionType: 1,
    systemType: "",
    image: [],
    isActive: true,
  });

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

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  try {
    const responses = await Promise.all(
      files.map(file => uploadImage(file))
    );

    const uploadedPaths = responses
      .map(res => res?.data?.path)
      .filter(Boolean);

    setFormData(prev => ({
      ...prev,
      image: [...prev.image, ...uploadedPaths]
    }));

    e.target.value = "";

  } catch (err) {
    showNotification("Şəkillər yüklənmədi", "error");
  }
};

  const handleImageDelete = async (imgToDelete: string) => {
    if (!imgToDelete) return;

    try {
      await deleteImage(imgToDelete);

      setFormData(prev => ({
        ...prev,
        image: prev.image.filter(img => img !== imgToDelete)
      }));

      showNotification("Şəkil silindi", "success");
    } catch (err) {
      showNotification("Şəkil silinmədi", "error");
    }
  };




  const resetForm = () => {
    setFormData({
     title: { az: '', en: '', ru: '', tr: '' },
    about: { az: '', en: '', ru: '', tr: '' },
    location: { az: '', en: '', ru: '', tr: '' },
    totalPower: '',
    powerType: 1,
    annualProduction: '',
    annualProductionType: 1,
    systemType: "",
    image: [],
    isActive: true,
    });
    setEditingId(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleEdit = async (project: any) => {
    try {
      const full = await getProjectById(project.id);

      const raw = full ?? project;

      const data = transformProject(raw); // 👈 BURASI HƏLLEDİR

      setFormData({
        title: data.title,
        about: data.about,
        location: data.location,

        totalPower: String(data.totalPower ?? ""),
        powerType: Number(data.powerType) || 1,
        annualProduction: String(data.annualProduction ?? ""),
        annualProductionType: Number(data.annualProductionType) || 1,

        systemType: data.systemType ?? { az: "", en: "", ru: "", tr: "" },

        image: data.image ?? [],

        isActive: data.isActive ?? true,
      });

      setEditingId(project.id);
      setIsEditing(true);
      setIsCreating(false);

    } catch (err) {
      showNotification("Data yüklənmədi", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm(
      'Bu blogu silmək istədiyinizə əminsiniz?'
    );

    if (isConfirmed) {
      await deleteProject(id);
      showNotification('Layihə uğurla silindi', 'success');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      languages: [
        {
          languageCode: 1,
          title: formData.title.az,
          description: formData.about.az,
          location: formData.location.az,
        },
        {
          languageCode: 2,
          title: formData.title.en,
          description: formData.about.en,
          location: formData.location.en
        },
        {
          languageCode: 3,
          title: formData.title.ru,
          description: formData.about.ru,
          location: formData.location.ru,
        },
        {
          languageCode: 4,
          title: formData.title.tr,
          description: formData.about.tr,
          location: formData.location.tr,
        }
      ],

     imagePaths: formData.image.map(img => img),

      totalPower: Number(formData.totalPower) || 0,
      powerType: Number(formData.powerType),

      annualProduction: Number(formData.annualProduction) || 0,
      annualProductionType: Number(formData.annualProductionType),

      systemType: Number(formData.systemType)
    };

    try {
      if (editingId) {
        // 🔥 UPDATE
        await updateProject(editingId, payload);
        getProjects()
        showNotification("Layihə yeniləndi", "success");
      } else {
        // ➕ CREATE
        await createProject(payload);
        showNotification("Layihə yaradıldı", "success");
      }

      resetForm();
      setIsEditing(false);
    } catch (err) {
      showNotification("Xəta baş verdi", "error");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Layihələrin İdarəedilməsi</h2>
          <p className="text-slate-500 text-xs mt-1">Layihələri, texniki parametrləri və statusları idarə edin.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-xs uppercase tracking-widest"
          >
            Geri Qayıt
          </button>
          {!isEditing && (
            <button
              onClick={() => {
                setIsCreating(true);
                setIsEditing(true)
              }}
              className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 text-xs uppercase tracking-widest"
            >
              Yeni Layihə
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-12 mb-12 animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex p-1 bg-slate-100 rounded-2xl">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setActiveLang(lang.code)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeLang === lang.code ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>

              {!isCreating && (
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktiv:</label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      className={`w-12 h-6 rounded-full transition-all relative ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isActive ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Layihə Adı ({activeLang.toUpperCase()})</label>
                  <input
                    required
                    type="text"
                    value={formData.title[activeLang]}
                    onChange={e => setFormData({ ...formData, title: { ...formData.title, [activeLang]: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                    placeholder="Layihənin adı..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Yerləşdiyi Məkan ({activeLang.toUpperCase()})</label>
                  <input
                    required
                    type="text"
                    value={formData.location[activeLang]}
                    onChange={e => setFormData({ ...formData, location: { ...formData.location, [activeLang]: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                    placeholder="Məs: Bakı, Azərbaycan..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Haqqında ({activeLang.toUpperCase()})</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.about[activeLang]}
                    onChange={e => setFormData({ ...formData, about: { ...formData.about, [activeLang]: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all resize-none"
                    placeholder="Layihə haqqında ətraflı məlumat..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Şəkil</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 bg-slate-50">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="news-image-upload"
                    />

                    <label htmlFor="news-image-upload" className="cursor-pointer flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-500">
                        Şəkil seçin və ya buraya atın
                      </span>
                    </label>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {formData.image.map((img, index) => (
                        <div key={index} className="relative">
                          <img
                            src={img}
                            className="w-full h-24 rounded-xl"
                          />

                          <button
                            type="button"
                            onClick={() => handleImageDelete(img)}
                            className="absolute top-1 right-1 bg-red-500 text-white text-[10px] px-2 py-1 rounded-lg"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-slate-50 rounded-3xl p-8 space-y-6">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pb-4 border-b border-slate-100">Texniki Parametrlər</h4>


                  <div className="grid grid-cols-2 gap-6">

                    {/* Ümumi Güc */}
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        Ümumi Güc
                      </label>

                      <div className="flex">
                        <input
                          required
                          type="number"
                          value={formData.totalPower}
                          onChange={e => setFormData({ ...formData, totalPower: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-l-xl px-4 py-3 text-xs font-bold focus:border-emerald-500 outline-none transition-all"
                          placeholder="Məs: 500"
                        />

                        <select
                          value={formData.powerType || ""}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              powerType: Number(e.target.value)
                            })
                          }
                          className="appearance-none bg-white border border-l-0 border-slate-200 rounded-r-xl px-3 py-3 text-xs font-bold"
                        >
                          <option value="" disabled>Seçin</option>

                          {powerUnits.map(unit => (
                            <option key={unit.id} value={unit.id}>
                              {unit.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* İllik İstehsal */}
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        İllik İstehsal
                      </label>

                      <div className="flex">
                        <input
                          required
                          type="number"
                          value={formData.annualProduction}
                          onChange={e => setFormData({ ...formData, annualProduction: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-l-xl px-4 py-3 text-xs font-bold focus:border-emerald-500 outline-none transition-all"
                          placeholder="Məs: 750000"
                        />

                        <select
                          value={formData.annualProductionType || ""}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              annualProductionType: Number(e.target.value)
                            })
                          }
                          className="appearance-none bg-white border border-l-0 border-slate-200 rounded-r-xl px-3 py-3 text-xs font-bold"
                        >
                          <option value="" disabled>Seçin</option>

                          {productionUnits.map(unit => (
                            <option key={unit.id} value={unit.id}>
                              {unit.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Sistem Tipi
                    </label>

                    <div className="relative">
                      <select
                        required
                        value={formData.systemType || ""}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            systemType: e.target.value
                          })
                        }
                        className="appearance-none w-full bg-white border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-xs font-bold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all cursor-pointer"
                      >
                        <option value="" disabled>Seçin...</option>

                        {systemTypes.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>

                      {/* Icon */}
                      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-3xl p-8">
                  <h4 className="text-xs font-black text-emerald-900/40 uppercase tracking-[0.2em] mb-4">Ön Baxış</h4>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-slate-200 mb-4 border-4 border-white shadow-lg overflow-hidden">
                    {formData.image?.[0] ? (
                      <img src={formData.image?.[0]} alt="Preview" className="w-full h-full " />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                  </div>
                  <h5 className="font-black text-slate-900 truncate">{formData.title[activeLang] || 'Layihə Adı'}</h5>
                  <p className="text-[10px] text-slate-500 mt-1">{formData.location[activeLang] || 'Məkan mumatı'}</p>
                </div>

              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-slate-50">
              <button
                type="button"
                onClick={resetForm}
                className="px-10 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
              >
                Ləğv Et
              </button>
              <button
                type="submit"
                className="px-10 py-4 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-emerald-600/20"
              >
                {editingId ? 'Yadda Saxla' : 'Layihəni Əlavə Et'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {transformedProjects.map((project) => (
          <div key={project.id} className={`bg-white rounded-[2.5rem] overflow-hidden border transition-all duration-300 group ${!project.isActive ? 'border-slate-100 opacity-60' : 'border-slate-100 hover:border-emerald-500 shadow-sm hover:shadow-xl'}`}>
            <div className="relative aspect-video">
              <img src={project.image?.[0]} alt={project.title.az} className="w-full h-full" />
              <div className="absolute top-4 left-4 flex gap-2">
                <div className={`px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest ${project.isActive ? 'bg-emerald-600' : 'bg-slate-400'}`}>
                  {project.isActive ? 'Aktiv' : 'Deaktiv'}
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{project.title?.[activeLang]}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{project.location?.[activeLang]}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-6 mb-6 border-b border-slate-50">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block">Güc</span>
                  <span className="text-xs font-bold text-slate-700">{project.totalPower}{getUnitLabel(powerUnits, project.powerType)}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block">İstehsal</span>
                  <span className="text-xs font-bold text-slate-700">{project.annualProduction}{getUnitLabel(productionUnits, project.annualProductionType)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(project)}
                  className="flex-grow py-3 rounded-xl bg-slate-50 text-slate-600 font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Redaktə
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <p className="font-bold text-sm text-slate-400">Heç bir layihə tapılmadı.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProjects;
