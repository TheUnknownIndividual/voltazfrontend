
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useBlog } from '../contexts/BlogContext';
import { useUpload } from "../contexts/UploadContext";

interface BlogsItem {
  id: string;
  title: { az: string; en: string; ru: string; tr: string };
  description: { az: string; en: string; ru: string; tr: string };
  content: { az: string; en: string; ru: string; tr: string };
  seoTitle: { az: string; en: string; ru: string; tr: string };
  seoDescription: { az: string; en: string; ru: string; tr: string };
  seoKeywords: { az: string; en: string; ru: string; tr: string };
  image: string;
  imageFile: File | null;
  isActive: boolean;
}

interface AdminBlogsProps {
  onBack: () => void;
}

const LANGUAGES = [
  { code: 'az', name: 'Azərbaycan' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'tr', name: 'Türkçe' }
] as const;

type LangCode = typeof LANGUAGES[number]['code'];

const AdminBlogs: React.FC<AdminBlogsProps> = ({ onBack }) => {
  const { showNotification, confirm } = useNotification();
  const { blogs, getBlogs, createBlog, updateBlog, getBlogById, deleteBlog } = useBlog();
  const { uploadImage, deleteImage } = useUpload();
  const [activeLang, setActiveLang] = useState<LangCode>('az');
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

   useEffect(() => {
           getBlogs();
         }, []);

  // Form State
  const [formData, setFormData] = useState<Omit<BlogsItem, 'id'>>({
    title: { az: '', en: '', ru: '', tr: '' },
    description: { az: '', en: '', ru: '', tr: '' },
    content: { az: '', en: '', ru: '', tr: '' },
    seoTitle: { az: '', en: '', ru: '', tr: '' },
    seoDescription: { az: '', en: '', ru: '', tr: '' },
    seoKeywords: { az: '', en: '', ru: '', tr: '' },
    image: '',
    imageFile: null,
    isActive: true,
  });



  const resetForm = () => {
    setFormData({
      title: { az: '', en: '', ru: '', tr: '' },
      description: { az: '', en: '', ru: '', tr: '' },
      content: { az: '', en: '', ru: '', tr: '' },
      seoTitle: { az: '', en: '', ru: '', tr: '' },
      seoDescription: { az: '', en: '', ru: '', tr: '' },
      seoKeywords: { az: '', en: '', ru: '', tr: '' },
      image: '',
      imageFile: null,
      isActive: true,
    });
    setEditingId(null);
    setIsEditing(false);
    setIsCreating(false);
  };

const handleEdit = async (id: string) => {
  try {
    const res = await getBlogById(id);

    const blog = res; // backend response.data qaytarırsa

    const titles = { az: "", en: "", ru: "", tr: "" };
    const descriptions = { az: "", en: "", ru: "", tr: "" };
    const contents = { az: "", en: "", ru: "", tr: "" };
    const seoTitles = { az: "", en: "", ru: "", tr: "" };
    const seoDescriptions = { az: "", en: "", ru: "", tr: "" };
    const seoKeywords = { az: "", en: "", ru: "", tr: "" };

    (blog.translations || []).forEach((t: any) => {
      const code: LangCode | null = t.languageCode === 1 ? 'az' : t.languageCode === 2 ? 'en' : t.languageCode === 3 ? 'ru' : t.languageCode === 4 ? 'tr' : null;
      if (code) {
        seoTitles[code] = t.seoTitle || '';
        seoDescriptions[code] = t.seoDescription || '';
        seoKeywords[code] = t.seoKeywords || '';
      }
      switch (t.languageCode) {
        case 1:
          titles.az = t.title;
          descriptions.az = t.description;
          contents.az = t.content;
          break;
        case 2:
          titles.en = t.title;
          descriptions.en = t.description;
          contents.en = t.content;
          break;
        case 3:
          titles.ru = t.title;
          descriptions.ru = t.description;
          contents.ru = t.content;
          break;
        case 4:
          titles.tr = t.title;
          descriptions.tr = t.description;
          contents.tr = t.content;
          break;
      }
    });

    setFormData({
      title: titles,
      description: descriptions,
      content: contents,
      seoTitle: seoTitles,
      seoDescription: seoDescriptions,
      seoKeywords,
      image: blog.coverImagePath,
      imageFile: null,
      isActive: blog.isActive,
    });

    setEditingId(id);
    setIsEditing(true);
    setIsCreating(false);

  } catch (err) {
    showNotification("Blog yüklənmədi", "error");
  }
};

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

 const handleDelete = async (id: string) => {
  const isConfirmed = await confirm(
      'Bu blogu silmək istədiyinizə əminsiniz?'
    );

  if (!isConfirmed) return;

  try {
    await deleteBlog(id);      // API call
    showNotification("Blog silindi", "success");

    await getBlogs();          // list refresh
  } catch (error) {
    console.error(error);
    showNotification("Silinmə zamanı xəta baş verdi", "error");
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

const payload = {
  coverImagePath: formData.image,
  translations: [
    {
      languageCode: 1,
      title: formData.title.az,
      description: formData.description.az,
      content: formData.content.az,
      seoTitle: formData.seoTitle.az,
      seoDescription: formData.seoDescription.az,
      seoKeywords: formData.seoKeywords.az,
    },
    {
      languageCode: 2,
      title: formData.title.en,
      description: formData.description.en,
      content: formData.content.en,
      seoTitle: formData.seoTitle.en,
      seoDescription: formData.seoDescription.en,
      seoKeywords: formData.seoKeywords.en,
    },
    {
      languageCode: 3,
      title: formData.title.ru,
      description: formData.description.ru,
      content: formData.content.ru,
      seoTitle: formData.seoTitle.ru,
      seoDescription: formData.seoDescription.ru,
      seoKeywords: formData.seoKeywords.ru,
    },
    {
      languageCode: 4,
      title: formData.title.tr,
      description: formData.description.tr,
      content: formData.content.tr,
      seoTitle: formData.seoTitle.tr,
      seoDescription: formData.seoDescription.tr,
      seoKeywords: formData.seoKeywords.tr,
    },
  ],
};

    try {
      if (editingId) {
        await updateBlog(editingId, payload);
        showNotification("Blog yeniləndi", "success");
      } else {
        await createBlog(payload);
        showNotification("Yeni blog əlavə edildi", "success");
      }

      await getBlogs(); // refresh data
      resetForm();
    } catch (err) {
      showNotification("Xəta baş verdi", "error");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Blogların İdarəedilməsi</h2>
          <p className="text-slate-500 text-xs mt-1">Blogları, texniki parametrləri və statusları idarə edin.</p>
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
              Yeni Blog
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
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Blog Adı ({activeLang.toUpperCase()})</label>
                  <input
                    required
                    type="text"
                    value={formData.title[activeLang]}
                    onChange={e => setFormData({ ...formData, title: { ...formData.title, [activeLang]: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                    placeholder="Blogun adı..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Açar Söz / Kateqoriya ({activeLang.toUpperCase()})</label>
                  <input
                    required
                    type="text"
                    value={formData.description[activeLang]}
                    onChange={e => setFormData({ ...formData, description: { ...formData.description, [activeLang]: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all resize-none"
                    placeholder="Məs: Rəsmi açılış, Qanunvericilik, COP29..."
                  />
                </div>


                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Haqqında ({activeLang.toUpperCase()})</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.content[activeLang]}
                    onChange={e => setFormData({ ...formData, content: { ...formData.content, [activeLang]: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all resize-none"
                    placeholder="Blog haqqında ətraflı məlumat..."
                  />
                </div>
              </div>


              <div className="space-y-8">
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

                </div>

                <div className="bg-emerald-50 rounded-3xl p-8">
                  <h4 className="text-xs font-black text-emerald-900/40 uppercase tracking-[0.2em] mb-4">Ön Baxış</h4>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-slate-200 mb-4 border-4 border-white shadow-lg overflow-hidden">
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="w-full h-full " />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                  </div>
                  <h5 className="font-black text-slate-900 truncate">{formData.title[activeLang] || 'Blog Adı'}</h5>
                  <p className="text-xs text-slate-500 line-clamp-3">{formData.description[activeLang] || 'Blog haqqında qısa məlumat...'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6 text-left">
              <div className="mb-5">
                <h3 className="text-base font-black text-slate-900">SEO parametrləri ({activeLang.toUpperCase()})</h3>
                <p className="mt-1 text-xs text-slate-500">Boş saxlanılan sahələr üçün blog başlığı və mətni avtomatik istifadə edilir.</p>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">SEO başlığı</label>
                  <input
                    type="text"
                    maxLength={200}
                    value={formData.seoTitle[activeLang]}
                    onChange={(event) => setFormData((current) => ({ ...current, seoTitle: { ...current.seoTitle, [activeLang]: event.target.value } }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold outline-none focus:border-emerald-500"
                    placeholder={formData.title[activeLang] || 'Axtarış nəticəsi başlığı'}
                  />
                  <p className="mt-2 text-right text-[9px] font-bold text-slate-400">{formData.seoTitle[activeLang].length}/200</p>
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">SEO açar sözləri</label>
                  <input
                    type="text"
                    maxLength={500}
                    value={formData.seoKeywords[activeLang]}
                    onChange={(event) => setFormData((current) => ({ ...current, seoKeywords: { ...current.seoKeywords, [activeLang]: event.target.value } }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold outline-none focus:border-emerald-500"
                    placeholder="günəş enerjisi, günəş paneli, məsləhətlər"
                  />
                  <p className="mt-2 text-[9px] text-slate-400">Vergüllə ayırın.</p>
                </div>
                <div className="lg:col-span-2">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">SEO təsviri</label>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={formData.seoDescription[activeLang]}
                    onChange={(event) => setFormData((current) => ({ ...current, seoDescription: { ...current.seoDescription, [activeLang]: event.target.value } }))}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium outline-none focus:border-emerald-500"
                    placeholder="Axtarış nəticələrində göstərilən qısa təsvir"
                  />
                  <p className="mt-2 text-right text-[9px] font-bold text-slate-400">{formData.seoDescription[activeLang].length}/500</p>
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
                {editingId ? 'Yadda Saxla' : 'Blogu Əlavə Et'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <div key={blog.id} className={`bg-white rounded-[2.5rem] overflow-hidden border transition-all duration-300 group ${!blog.isActive ? 'border-slate-100 opacity-60' : 'border-slate-100 hover:border-emerald-500 shadow-sm hover:shadow-xl'}`}>
            <div className="relative aspect-video">
              <img src={blog.image} className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 left-4 flex gap-2">
                <div className={`px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest ${blog.isActive ? 'bg-emerald-600' : 'bg-slate-400'}`}>
                  {blog.isActive ? 'Aktiv' : 'Deaktiv'}
                </div>
                <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[8px] font-black text-slate-900 uppercase tracking-widest">
                  {new Date(blog.date).toLocaleDateString("az-AZ")}
                </div>
              </div>
              <div className="absolute bottom-4 left-4">
                <div className="bg-emerald-100/90 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black text-emerald-900 uppercase tracking-widest border border-emerald-200">
                  {blog.description?.[activeLang]}
                </div>
              </div>
            </div>

            <div className="p-8">
              <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-3 h-12 leading-snug">{blog.title?.[activeLang]}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-6 h-8 opacity-80 leading-relaxed font-medium">{blog.content?.[activeLang]}</p>


              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(blog.id)}
                  className="flex-grow py-3 rounded-xl bg-slate-50 text-slate-600 font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Redaktə
                </button>
                <button
                  onClick={() => handleDelete(blog.id)}
                  className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}

        {blogs.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <p className="font-bold text-sm text-slate-400">Heç bir blog tapılmadı.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBlogs;
