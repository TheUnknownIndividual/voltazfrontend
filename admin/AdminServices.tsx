
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useService } from "../contexts/ServiceContext";

interface ServiceItem {
  id: string;
  title: { az: string; en: string; ru: string; tr: string };
  description: { az: string; en: string; ru: string; tr: string };

  content1: { az: string; en: string; ru: string; tr: string };
  content2: { az: string; en: string; ru: string; tr: string };
  content3: { az: string; en: string; ru: string; tr: string };
  content4: { az: string; en: string; ru: string; tr: string };

  icon: keyof typeof ICON_MAP;
}

interface AdminServicesProps {
  onBack: () => void;
}
const languageMap = {
  az: 1,
  en: 2,
  ru: 3,
  tr: 4,
} as const;
const languageReverseMap = {
  1: "az",
  2: "en",
  3: "ru",
  4: "tr",
} as const;
const LANGUAGES = [
  { code: 'az', name: 'Azərbaycan' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'tr', name: 'Türkçe' }
] as const;

type LangCode = typeof LANGUAGES[number]['code'];

const DEFAULT_ICONS = [
  { name: 'Günəş', path: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" },
  { name: 'Sayğac', path: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { name: 'Maliyyə', path: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0116 0z" },
  { name: 'Parametrlər', path: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  { name: 'Texniki', path: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  { name: 'Konsultasiya', path: "M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" },
];
export const ICON_MAP = {
  "Günəş": "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z",

  "Sayğac": "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",

  "Maliyyə": "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0116 0z",

  "Parametrlər": "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",

  "Texniki": "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",

  "Konsultasiya": "M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
} as const;



const AdminServices: React.FC<AdminServicesProps> = ({ onBack }) => {
  const { showNotification, confirm } = useNotification();
  const {
    services,
    loading,
    getServices,
    createService,
    getServiceById,
    updateService,
    deleteService
  } = useService();
  // const [services, setServices] = useState<ServiceItem[]>([]);
  const [activeLang, setActiveLang] = useState<LangCode>('az');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);


  // Form State
  const [formData, setFormData] = useState<any>({
    title: { az: '', en: '', ru: '', tr: '' },
    description: { az: '', en: '', ru: '', tr: '' },

    content1: { az: '', en: '', ru: '', tr: '' },
    content2: { az: '', en: '', ru: '', tr: '' },
    content3: { az: '', en: '', ru: '', tr: '' },
    content4: { az: '', en: '', ru: '', tr: '' },

    icon: DEFAULT_ICONS[0].name,
  });

  useEffect(() => {
    getServices();
  }, []);

  const resetForm = () => {
    setFormData({
      title: { az: '', en: '', ru: '', tr: '' },
      description: { az: '', en: '', ru: '', tr: '' },

      content1: { az: '', en: '', ru: '', tr: '' },
      content2: { az: '', en: '', ru: '', tr: '' },
      content3: { az: '', en: '', ru: '', tr: '' },
      content4: { az: '', en: '', ru: '', tr: '' },

      icon: DEFAULT_ICONS[0].name,
    });

    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = async (id: string) => {
    const data = await getServiceById(id);

    if (!data) return;

    const newFormData: any = {
      title: { az: '', en: '', ru: '', tr: '' },
      description: { az: '', en: '', ru: '', tr: '' },
      content1: { az: '', en: '', ru: '', tr: '' },
      content2: { az: '', en: '', ru: '', tr: '' },
      content3: { az: '', en: '', ru: '', tr: '' },
      content4: { az: '', en: '', ru: '', tr: '' },
      icon: data.icon || "Günəş",
    };

    data.languages?.forEach((lang: any) => {
      const code = languageReverseMap[lang.languageCode];

      if (!code) return;

      newFormData.title[code] = lang.title || '';
      newFormData.description[code] = lang.description || '';
      newFormData.content1[code] = lang.content1 || '';
      newFormData.content2[code] = lang.content2 || '';
      newFormData.content3[code] = lang.content3 || '';
      newFormData.content4[code] = lang.content4 || '';
    });

    setFormData(newFormData);
    setEditingId(id);
    setIsEditing(true);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        languages: [
          {
            languageCode: 1,
            title: formData.title.az,
            description: formData.description.az,
            content1: formData.content1.az,
            content2: formData.content2.az,
            content3: formData.content3.az,
            content4: formData.content4.az,
          },
          {
            languageCode: 2,
            title: formData.title.en,
            description: formData.description.en,
            content1: formData.content1.en,
            content2: formData.content2.en,
            content3: formData.content3.en,
            content4: formData.content4.en,
          },
          {
            languageCode: 3,
            title: formData.title.ru,
            description: formData.description.ru,
            content1: formData.content1.ru,
            content2: formData.content2.ru,
            content3: formData.content3.ru,
            content4: formData.content4.ru,
          },
          {
            languageCode: 4,
            title: formData.title.tr,
            description: formData.description.tr,
            content1: formData.content1.tr,
            content2: formData.content2.tr,
            content3: formData.content3.tr,
            content4: formData.content4.tr,
          }
        ],
        icon: formData.icon
      };

      if (editingId) {
        await updateService(editingId, payload);
        showNotification("Xidmət yeniləndi");
      } else {
        await createService(payload);
        showNotification("Yeni xidmət əlavə edildi");
      }
      await getServices(); 
      resetForm();
    } catch (error) {
      showNotification("Xəta baş verdi", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (await confirm("Bu xidməti silmək istədiyinizə əminsiniz?")) {
      try {
        await deleteService(id);
        showNotification("Xidmət silindi", "warning");
      } catch (error) {
        showNotification("Silinmə zamanı xəta", "error");
      }
    }
  };

  const transformService = (item: any, activeLang: LangCode) => {
    const langItem = item.languages?.find(
      (l: any) => languageReverseMap[l.languageCode] === activeLang
    );

    return {
      id: item.id,
      title: langItem?.title ?? "",
      description: langItem?.description ?? "",
      content1: langItem?.content1 ?? "",
      content2: langItem?.content2 ?? "",
      content3: langItem?.content3 ?? "",
      content4: langItem?.content4 ?? "",
      icon: item.icon ?? "Günəş",
    };
  };;
  const safeServices = services.map(s =>
    transformService(s, activeLang)
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Xidmətlər İdarəetməsi</h2>
          <p className="text-slate-500">Saytın xidmətlər bölməsini 4 dildə tənzimləyin.</p>
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
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 text-xs uppercase tracking-widest"
            >
              Yeni xidmət
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-10">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Başlıq ({activeLang.toUpperCase()})</label>
                  <input
                    required
                    type="text"
                    value={formData.title[activeLang]}
                    onChange={e => setFormData({ ...formData, title: { ...formData.title, [activeLang]: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                    placeholder="Xidmətin adı..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Qısa Təsvir ({activeLang.toUpperCase()})</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description[activeLang]}
                    onChange={e => setFormData({ ...formData, description: { ...formData.description, [activeLang]: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all resize-none"
                    placeholder="Xidmət haqqında qısa məlumat..."
                  />
                </div>

              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Üstünlüklər / Xüsusiyyətlər (4 ədəd)</label>
                {/* <div className="grid grid-cols-1 gap-4">
                  {[0, 1, 2, 3].map(idx => (
                    <div key={idx} className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <input
                        type="text"
                        value={formData.features[activeLang][idx] || ''}
                        onChange={e => updateFeature(activeLang, idx, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 text-xs font-bold focus:border-emerald-500 outline-none transition-all"
                        placeholder={`${idx + 1}-ci xüsusiyyət...`}
                      />
                    </div>
                  ))}
                </div> */}
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-500 rounded-full"></div>


                      <input
                        type="text"
                        value={formData[`content${n}`][activeLang]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [`content${n}`]: {
                              ...formData[`content${n}`],
                              [activeLang]: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 text-xs font-bold focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">İkon Seçimi</label>
              <div className="grid grid-cols-6 gap-4">
                {DEFAULT_ICONS.map((icon, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: icon.name })}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${formData.icon === icon.name ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}
                  >
                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d={ICON_MAP[icon.name]}
                      />
                    </svg>
                    <span className="text-[8px] font-black uppercase tracking-widest">{icon.name}</span>
                  </button>
                ))}
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
                {editingId ? 'Yadda Saxla' : 'Xidməti Əlavə Et'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {safeServices.map((service) => (
          <div key={service.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm group hover:border-emerald-500 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={ICON_MAP[service.icon ?? "Günəş"]} />
                </svg>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(service.id)}
                  className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>

            <div className="mb-6">

              <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{service.title}</h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{service.description}</p>
            </div>

            <div className="space-y-2">

              <div className="flex items-center gap-3">
                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                <span className="text-[10px] font-bold text-slate-600">{service.content1}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                <span className="text-[10px] font-bold text-slate-600">{service.content2}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                <span className="text-[10px] font-bold text-slate-600">{service.content3}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                <span className="text-[10px] font-bold text-slate-600">{service.content4}</span>
              </div>

            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            <p className="font-bold text-sm">Heç bir xidmət tapılmadı.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminServices;
