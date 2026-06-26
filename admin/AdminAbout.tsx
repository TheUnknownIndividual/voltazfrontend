import React, { useState, useEffect, use } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { AboutSection, MultilingualText } from '../types';
import { useAbout } from '../contexts/AboutContext';
import { useUpload } from "../contexts/UploadContext";
import { get } from 'http';

interface AdminAboutProps {
  onBack: () => void;
}

const LANGUAGES = [
  { code: 'az', name: 'Azərbaycan' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'tr', name: 'Türkçe' }
] as const;

type LangCode = typeof LANGUAGES[number]['code'];

const AdminAbout: React.FC<AdminAboutProps> = ({ onBack }) => {
  const { showNotification, confirm } = useNotification();
  const { getAbout, aboutData, createAbout, updateAbout, getAboutById, deleteAbout, loading } = useAbout();
  const { uploadImage, deleteImage } = useUpload();
  const [activeLang, setActiveLang] = useState<LangCode>('az');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lang, setLang] = useState<'az' | 'en' | 'ru' | 'tr'>(() => {
    return (localStorage.getItem('lang') as 'az' | 'en' | 'ru' | 'tr') || 'az';
  });

  // Form State
  const [formData, setFormData] = useState<Omit<AboutSection, 'id'>>({
    title: { az: '', en: '', ru: '', tr: '' },
    description: { az: '', en: '', ru: '', tr: '' },
    images: ""
  });

  const languageMap = {
    az: 1,
    en: 2,
    ru: 3,
    tr: 4
  };



  useEffect(() => {
    getAbout();
  }, [lang]);

  const sections = aboutData;


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadImage(file);
      const imageUrl = res?.data?.path;

      if (imageUrl) {
        setFormData(prev => ({
          ...prev,
          images: imageUrl // ✅ birbaşa string
        }));
      }
    } catch (err) {
      console.error(err);
      showNotification("Şəkil yüklənmədi", "error");
    }
  };

  const removeImage = async () => {
    if (!formData.images) return;

    try {
      await deleteImage(formData.images);

      setFormData(prev => ({
        ...prev,
        images: ""
      }));
    } catch (err) {
      console.error(err);
      showNotification("Şəkil silinmədi", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    const payload = {
      languages: [
        {
          languageCode: 1,
          title: formData.title.az,
          description: formData.description.az,
        },
        {
          languageCode: 2,
          title: formData.title.en,
          description: formData.description.en,
        },
        {
          languageCode: 3,
          title: formData.title.ru,
          description: formData.description.ru,
        },
        {
          languageCode: 4,
          title: formData.title.tr,
          description: formData.description.tr,
        },
      ],
      imagePath: formData.images,
    };

    try {
      if (editingId) {
        await updateAbout(editingId, payload);
        showNotification("Uğurla yeniləndi", "success");
      } else {
        await createAbout(payload);
        showNotification("Uğurla yaradıldı", "success");
      }

      resetForm();
      await getAbout(); // refresh data
    } catch (err) {
      console.error(err);
      showNotification("Xəta baş verdi", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      title: { az: '', en: '', ru: '', tr: '' },
      description: { az: '', en: '', ru: '', tr: '' },
      images: ''
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = async (section: AboutSection) => {
    try {
      const data = await getAboutById(section.id);

      setFormData({
        title: {
          az: data.languages.find((l: any) => l.languageCode === 1)?.title || '',
          en: data.languages.find((l: any) => l.languageCode === 2)?.title || '',
          ru: data.languages.find((l: any) => l.languageCode === 3)?.title || '',
          tr: data.languages.find((l: any) => l.languageCode === 4)?.title || '',
        },
        description: {
          az: data.languages.find((l: any) => l.languageCode === 1)?.description || '',
          en: data.languages.find((l: any) => l.languageCode === 2)?.description || '',
          ru: data.languages.find((l: any) => l.languageCode === 3)?.description || '',
          tr: data.languages.find((l: any) => l.languageCode === 4)?.description || '',
        },
        images: data.imagePath || ""
      });

      setEditingId(section.id);
      setIsEditing(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error(err);
      showNotification("Məlumat yüklənmədi", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (await confirm('Bu bölməni silmək istədiyinizə əminsiniz?')) {
      try {
        await deleteAbout(id); // 👈 API call

        showNotification('Bölmə silindi', 'success');

        getAbout(); // 👈 list refresh
      } catch (err) {
        console.error(err);
        showNotification('Silinmədi', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">"Haqqımızda" İdarəetmə Paneli</h1>
            <p className="text-slate-500">Şirkət məlumatlarını və sıralamanı tənzimləyin.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
            >
              Geri Qayıt
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
            >
              Yeni Bölmə Əlavə Et
            </button>
          </div>
        </div>

        {/* Editor Form */}
        {isEditing && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 mb-12 animate-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-900">{editingId ? 'Bölməni Redaktə Et' : 'Yeni Bölmə Yaradın'}</h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-red-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Language Tabs */}
              <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setActiveLang(lang.code)}
                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeLang === lang.code ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Text Content */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Başlıq ({activeLang.toUpperCase()})</label>
                    <input
                      type="text"
                      maxLength={150}
                      required
                      value={formData.title[activeLang]}
                      onChange={(e) => setFormData({ ...formData, title: { ...formData.title, [activeLang]: e.target.value } })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      placeholder="Maksimum 150 simvol..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Təsvir ({activeLang.toUpperCase()})</label>
                    <textarea
                      rows={6}
                      required
                      value={formData.description[activeLang]}
                      onChange={(e) => setFormData({ ...formData, description: { ...formData.description, [activeLang]: e.target.value } })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                      placeholder="Şirkət haqqında ətraflı məlumat..."
                    />
                  </div>

                </div>


                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Şəkil</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 bg-slate-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="news-image-upload"
                    />

                    <label htmlFor="news-image-upload" className="cursor-pointer flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-500">
                        Şəkil seçin və ya buraya atın
                      </span>
                    </label>

                    {formData.images && (
                      <div className="relative mt-4">
                        <img
                          src={formData.images}
                          className="w-full h-40 rounded-2xl"
                        />

                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-3 py-1 rounded-lg"
                        >
                          x
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
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
                  {editingId ? 'Dəyişiklikləri Saxla' : 'Bölməni Tamamla'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sections List */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-900 mb-6">Mövcud Bölmələr</h2>
          {aboutData?.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
              <p className="text-slate-400">Heç bir bölmə əlavə edilməyib.</p>
            </div>
          ) : (
            aboutData?.map((section) => (
              <div key={section.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6 group hover:border-emerald-200 transition-all">

                <div className="flex-grow min-w-0">
                  <h3 className="text-lg font-black text-slate-900 truncate mb-1">{section.languages.find(l => l.languageCode === languageMap[activeLang])?.title}</h3>
                  <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{section.languages.find(l => l.languageCode === languageMap[activeLang])?.description}</p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="flex -space-x-2">
                    {section.imagePath && (
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-slate-100 shadow-sm">
                        <img
                          src={section.imagePath}
                          className="w-full h-full"
                          alt="preview"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(section)}
                      className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                      title="Redaktə et"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button
                      onClick={() => handleDelete(section.id)}
                      className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Sil"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAbout;