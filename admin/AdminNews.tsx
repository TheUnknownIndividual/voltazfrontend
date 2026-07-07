
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useNews } from "../contexts/NewsContext";
import { useUpload } from "../contexts/UploadContext";

interface NewsItem {
  id: string;
  category: { az: string; en: string; ru: string; tr: string };
  title: { az: string; en: string; ru: string; tr: string };
  summary: { az: string; en: string; ru: string; tr: string };
  image: string;
  imageFile: File | null;
  link: string;
  source: string;
  date: string;
  isActive: boolean;
}

interface AdminNewsProps {
  onBack: () => void;
}

const LANGUAGES = [
  { code: 'az', name: 'Azərbaycan' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'tr', name: 'Türkçe' }
] as const;

const languageMap = {
  az: 1,
  en: 2,
  ru: 3,
  tr: 4
}

const getLangValue = (langs: any[], lang: keyof typeof languageMap, key: string) => {
  return langs?.find(l => l.languageCode === languageMap[lang])?.[key] || "";
};

type LangCode = typeof LANGUAGES[number]['code'];

const AdminNews: React.FC<AdminNewsProps> = ({ onBack }) => {
  const { showNotification, confirm } = useNotification();
  const { getNews, createNews, updateNews, deleteNews, getNewsById, loading } = useNews();
  const { uploadImage, deleteImage } = useUpload();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [activeLang, setActiveLang] = useState<LangCode>('az');
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<NewsItem, 'id'>>({
    category: { az: '', en: '', ru: '', tr: '' },
    title: { az: '', en: '', ru: '', tr: '' },
    summary: { az: '', en: '', ru: '', tr: '' },
    image: '',
    imageFile: null,
    link: '',
    source: '',
    date: new Date().toISOString().split('T')[0],
    isActive: true
  });

  useEffect(() => {
    const loadNews = async () => {
      try {
        const res = await getNews();

        // Backend-dən gələn data uyğunlaşdırılır
        const mapped: NewsItem[] = res.data.map((item: any) => ({
          id: item.id,
          image: item.coverImagePath,
          link: item.postLink,
          source: item.source,
          date: item.createdAt?.split("T")[0] || "",
          isActive: item.isActive,

          // languages → object formatına çeviririk
          title: {
            az: getLangValue(item.languages, 'az', 'title'),
            en: getLangValue(item.languages, 'en', 'title'),
            ru: getLangValue(item.languages, 'ru', 'title'),
            tr: getLangValue(item.languages, 'tr', 'title'),
          },
          summary: {
            az: getLangValue(item.languages, 'az', 'content'),
            en: getLangValue(item.languages, 'en', 'content'),
            ru: getLangValue(item.languages, 'ru', 'content'),
            tr: getLangValue(item.languages, 'tr', 'content'),
          },
          category: {
            az: getLangValue(item.languages, 'az', 'description'),
            en: getLangValue(item.languages, 'en', 'description'),
            ru: getLangValue(item.languages, 'ru', 'description'),
            tr: getLangValue(item.languages, 'tr', 'description'),
          }
        }));

        setNews(mapped);
      } catch (e) {
        console.error("Failed to load news:", e);
      }
    };

    loadNews();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadImage(file);

      const path = res?.data?.path;

      setFormData(prev => ({
        ...prev,
        image: path,      // preview
        imageFile: file   // actual file
      }));

    } catch (err) {
      showNotification("Şəkil yüklənmədi", "error");
    }
  };

  const handleImageDelete = async () => {
    if (!formData.image) return;

    try {
      // backend-dən sil
      await deleteImage(formData.image);

      // form-u təmizlə
      setFormData(prev => ({
        ...prev,
        image: '',
        imageFile: null
      }));

      showNotification("Şəkil silindi", "success");
    } catch (err) {
      showNotification("Şəkil silinmədi", "error");
    }
  };
 
  

  const resetForm = () => {
    setFormData({
      category: { az: '', en: '', ru: '', tr: '' },
      title: { az: '', en: '', ru: '', tr: '' },
      summary: { az: '', en: '', ru: '', tr: '' },
      image: '',
      imageFile: null,
      link: '',
      source: '',
      date: new Date().toISOString().split('T')[0],
      isActive: true
    });
    setEditingId(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleEdit = async (item: NewsItem) => {
    try {
      const data = await getNewsById(item.id);

      setFormData({
        category: {
          az: data.languages.find((l: any) => l.languageCode === 1)?.description || '',
          en: data.languages.find((l: any) => l.languageCode === 2)?.description || '',
          ru: data.languages.find((l: any) => l.languageCode === 3)?.description || '',
          tr: data.languages.find((l: any) => l.languageCode === 4)?.description || '',
        },
        title: {
          az: data.languages.find((l: any) => l.languageCode === 1)?.title || '',
          en: data.languages.find((l: any) => l.languageCode === 2)?.title || '',
          ru: data.languages.find((l: any) => l.languageCode === 3)?.title || '',
          tr: data.languages.find((l: any) => l.languageCode === 4)?.title || '',
        },
        summary: {
          az: data.languages.find((l: any) => l.languageCode === 1)?.content || '',
          en: data.languages.find((l: any) => l.languageCode === 2)?.content || '',
          ru: data.languages.find((l: any) => l.languageCode === 3)?.content || '',
          tr: data.languages.find((l: any) => l.languageCode === 4)?.content || '',
        },
        image: data.coverImagePath,
        imageFile: null,
        link: data.postLink,
        source: data.source,
        date: data.createdAt?.split("T")[0] || "",
        isActive: data.isActive
      });

      setEditingId(item.id);
      setIsEditing(true);

    } catch (err) {
      showNotification("Xəbər yüklənmədi", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm(
      'Bu xəbəri silmək istədiyinizə əminsiniz?'
    );

    if (isConfirmed) {
      try {
        await deleteNews(id);

        // UI update
        setNews(prev => prev.filter(n => n.id !== id));

        showNotification('Xəbər silindi', 'success');
      } catch {
        showNotification('Silinmə zamanı xəta', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        coverImagePath: formData.image,
        source: formData.source,
        postLink: formData.link,
        isActive: formData.isActive,
        languages: [
          {
            languageCode: 1,
            title: formData.title.az,
            description: formData.category.az,
            content: formData.summary.az
          },
          {
            languageCode: 2,
            title: formData.title.en,
            description: formData.category.en,
            content: formData.summary.en
          },
          {
            languageCode: 3,
            title: formData.title.ru,
            description: formData.category.ru,
            content: formData.summary.ru
          },
          {
            languageCode: 4,
            title: formData.title.tr,
            description: formData.category.tr,
            content: formData.summary.tr
          }
        ]
      };

      if (editingId) {
        // ✏️ UPDATE
        await updateNews(editingId, payload);
        showNotification('Xəbər yeniləndi', 'success');
      } else {
        // ➕ CREATE
        await createNews(payload);
        showNotification('Xəbər əlavə edildi', 'success');
      }

      // 🔄 reload
      const res = await getNews();

      // yenə map et (səndəki kimi)
      const mapped = res.data.map((item: any) => ({
        id: item.id,
        image: item.coverImagePath,
        link: item.postLink,
        source: item.source,
        date: item.createdAt?.split("T")[0] || "",
        isActive: item.isActive,
        title: {
          az: item.languages.find((l: any) => l.languageCode === 1)?.title || "",
          en: item.languages.find((l: any) => l.languageCode === 2)?.title || "",
          ru: item.languages.find((l: any) => l.languageCode === 3)?.title || "",
          // tr: item.languages.find((l: any) => l.languageCode === 4)?.title || ""
        },
        summary: {
          az: item.languages.find((l: any) => l.languageCode === 1)?.content || "",
          en: item.languages.find((l: any) => l.languageCode === 2)?.content || "",
          ru: item.languages.find((l: any) => l.languageCode === 3)?.content || "",
          // tr: item.languages.find((l: any) => l.languageCode === 4)?.content || ""
        },
        category: {
          az: item.languages.find((l: any) => l.languageCode === 1)?.description || "",
          en: item.languages.find((l: any) => l.languageCode === 2)?.description || "",
          ru: item.languages.find((l: any) => l.languageCode === 3)?.description || "",
          // tr: item.languages.find((l: any) => l.languageCode === 4)?.description || ""
        }
      }));

      setNews(mapped);

      resetForm();

    } catch (error) {
      showNotification('Xəta baş verdi', 'error');
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Xəbərlərin İdarəedilməsi</h2>
          <p className="text-slate-500 text-xs mt-1">Xəbərləri, kateqoriyaları və rəsmi mənbələri 4 dildə idarə edin.</p>
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
              onClick={() => (
                setIsCreating(true),
                setIsEditing(true))}
              className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 text-xs uppercase tracking-widest"
            >
              Yeni Xəbər
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
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tarix:</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Xəbər Başlığı ({activeLang.toUpperCase()})</label>
                  <input
                    required
                    type="text"
                    value={formData.title[activeLang] || ''}
                    onChange={e => setFormData({ ...formData, title: { ...formData.title, [activeLang]: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                    placeholder="Xəbərin başlığı..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Açar Söz / Kateqoriya ({activeLang.toUpperCase()})</label>
                  <input
                    required
                    type="text"
                    value={formData.category[activeLang] || ''}
                    onChange={e => setFormData({ ...formData, category: { ...formData.category, [activeLang]: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                    placeholder="Məs: Rəsmi açılış, Qanunvericilik, COP29..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Qısa Mətn ({activeLang.toUpperCase()})</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.summary[activeLang] || ''}
                    onChange={e => setFormData({ ...formData, summary: { ...formData.summary, [activeLang]: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all resize-none"
                    placeholder="Xəbər haqqında qısa məlumat..."
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

                  {formData.image && (
                    <div className="relative mt-4">
                      <img
                        src={formData.image}
                        className="w-full h-40 rounded-2xl"
                      />

                      <button
                        type="button"
                        onClick={handleImageDelete}
                        className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-3 py-1 rounded-lg"
                      >
                        x
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Rəsmi Mənbə Adı</label>
                  <input
                    required
                    type="text"
                    value={formData.source || ''}
                    onChange={e => setFormData({ ...formData, source: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                    placeholder="Məs: President.az, Minenergy.gov.az..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Rəsmi Mənbə Linki</label>
                  <input
                    required
                    type="url"
                    value={formData.link || ''}
                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-mono focus:border-emerald-500 outline-none transition-all"
                    placeholder="https://..."
                  />
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
                {editingId ? 'Yadda Saxla' : 'Xəbəri Əlavə Et'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        {news.map((item) => (
          <div key={item.id} className={`bg-white rounded-[2.5rem] overflow-hidden border transition-all duration-300 group ${!item.isActive ? 'border-slate-100 opacity-60' : 'border-slate-100 hover:border-emerald-500 shadow-sm hover:shadow-xl'}`}>
            <div className="relative aspect-video">
              <img src={item.image} alt={item.title.az || item.title.en || ''} className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 left-4 flex gap-2">
                <div className={`px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest ${item.isActive ? 'bg-emerald-600' : 'bg-slate-400'}`}>
                  {item.isActive ? 'Aktiv' : 'Deaktiv'}
                </div>
                <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[8px] font-black text-slate-900 uppercase tracking-widest">
                  {item.date}
                </div>
              </div>
              <div className="absolute bottom-4 left-4">
                <div className="bg-emerald-100/90 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black text-emerald-900 uppercase tracking-widest border border-emerald-200">
                  {item.category.az}
                </div>
              </div>
            </div>

            <div className="p-8">
              <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-3 h-12 leading-snug">{item.title.az}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-6 h-8 opacity-80 leading-relaxed font-medium">{item.summary.az}</p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-grow py-3 rounded-xl bg-slate-50 text-slate-600 font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Redaktə
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminNews;
