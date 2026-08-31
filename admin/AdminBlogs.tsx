
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useBlog } from '../contexts/BlogContext';
import { useUpload } from "../contexts/UploadContext";
import { Archive, ArchiveRestore, ImagePlus } from 'lucide-react';
import SliderImageCropper from '../components/SliderImageCropper';
import RichTextEditor from './RichTextEditor';

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
type StatusFilter = 'all' | 'published' | 'archived';

type CropRequest = {
  source: string;
  sourceType: string;
  fileName: string;
};

const plainBlogText = (value: string) => value
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const AdminBlogs: React.FC<AdminBlogsProps> = ({ onBack }) => {
  const { showNotification, confirm } = useNotification();
  const { blogs, getAdminBlogs, createBlog, updateBlog, getAdminBlogById, setBlogActive } = useBlog();
  const { uploadImage } = useUpload();
  const [activeLang, setActiveLang] = useState<LangCode>('az');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [cropRequest, setCropRequest] = useState<CropRequest | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    void getAdminBlogs().catch(() => showNotification('Blog siyahısı yüklənmədi', 'error'));
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
    setPendingCoverFile(null);
    setCropRequest(null);
  };

const handleEdit = async (id: string) => {
  try {
    const res = await getAdminBlogById(id);

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
    setPendingCoverFile(null);

  } catch (err) {
    showNotification("Blog yüklənmədi", "error");
  }
};

  const beginCoverCrop = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      showNotification('PNG, JPG, WebP və ya digər raster şəkil seçin', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setCropRequest({
      source: String(reader.result),
      sourceType: file.type,
      fileName: file.name,
    });
    reader.onerror = () => showNotification('Şəkil oxunmadı', 'error');
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    beginCoverCrop(file);
  };

  const handleImageDelete = () => {
    setPendingCoverFile(null);
    setFormData(prev => ({ ...prev, image: '', imageFile: null }));
  };

  const handleStatusChange = async (id: string, isActive: boolean) => {
    const action = isActive ? 'yayımlamaq' : 'arxivə göndərmək';
    if (!await confirm(`Bu blogu ${action} istədiyinizə əminsiniz?`)) return;
    try {
      await setBlogActive(id, isActive);
      await getAdminBlogs();
      showNotification(isActive ? 'Blog yayımlandı' : 'Blog arxivə göndərildi', 'success');
    } catch (error) {
      console.error(error);
      showNotification('Status dəyişdirilmədi', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const isActive = submitter?.value === 'archive' ? false : submitter?.value === 'publish' ? true : formData.isActive;
    if (!formData.image) {
      showNotification('Blog banneri seçilməlidir', 'error');
      return;
    }

    setSaving(true);
    try {
      let coverImagePath = formData.image;
      if (pendingCoverFile) {
        const uploaded = await uploadImage(pendingCoverFile);
        const path = uploaded?.data?.path || uploaded?.path || uploaded?.data;
        if (typeof path !== 'string' || !path) throw new Error('Upload path was not returned');
        coverImagePath = path;
      }

      const payload = {
        coverImagePath,
        isActive,
        translations: LANGUAGES.map((language, index) => ({
          languageCode: index + 1,
          title: formData.title[language.code],
          description: formData.description[language.code],
          content: formData.content[language.code],
          seoTitle: formData.seoTitle[language.code],
          seoDescription: formData.seoDescription[language.code],
          seoKeywords: formData.seoKeywords[language.code],
          isActive: true,
        })),
      };

      if (editingId) {
        await updateBlog(editingId, payload);
        showNotification(isActive ? 'Blog yeniləndi və yayımlandı' : 'Blog yeniləndi və arxivə saxlanıldı', 'success');
      } else {
        await createBlog(payload);
        showNotification(isActive ? 'Yeni blog yayımlandı' : 'Blog sonrakı redaktə üçün arxivə saxlanıldı', 'success');
      }

      await getAdminBlogs();
      resetForm();
    } catch (err) {
      showNotification("Xəta baş verdi", "error");
    } finally {
      setSaving(false);
    }
  };

  const visibleBlogs = blogs.filter((blog) => (
    statusFilter === 'all'
      || (statusFilter === 'published' && blog.isActive)
      || (statusFilter === 'archived' && !blog.isActive)
  ));

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
              onClick={() => setIsEditing(true)}
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

              <div className={`rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-widest ${formData.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {formData.isActive ? 'Yayımlanacaq' : 'Hazırda arxivdədir'}
              </div>
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
                  <RichTextEditor
                    value={formData.content[activeLang]}
                    onChange={(html) => setFormData({ ...formData, content: { ...formData.content, [activeLang]: html } })}
                    onImageUpload={async (file) => {
                      const response = await uploadImage(file);
                      const path = response?.data?.path;
                      if (!path) throw new Error('Image upload did not return a path');
                      return path;
                    }}
                  />
                </div>
              </div>


              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Banner şəkli</label>
                  <div
                    className="border-2 border-dashed border-slate-200 rounded-3xl p-6 bg-slate-50"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      beginCoverCrop(event.dataTransfer.files?.[0]);
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="blog-image-upload"
                    />

                    <label htmlFor="blog-image-upload" className="cursor-pointer flex flex-col items-center gap-2 py-2">
                      <ImagePlus className="h-6 w-6 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-500">
                        Şəkil seçin və ya buraya atın — sonra 16:9 ölçüdə kəsiləcək
                      </span>
                    </label>

                    {formData.image && (
                      <div className="relative mt-4">
                        <img
                          src={formData.image}
                          alt="Blog banner önizləməsi"
                          className="aspect-video w-full rounded-2xl object-cover"
                        />

                        <button
                          type="button"
                          onClick={handleImageDelete}
                          className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-3 py-1 rounded-lg"
                        >
                          Sil
                        </button>
                      </div>
                    )}
                  </div>

                </div>

                <div className="bg-emerald-50 rounded-3xl p-8">
                  <h4 className="text-xs font-black text-emerald-900/40 uppercase tracking-[0.2em] mb-4">Ön Baxış</h4>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-slate-200 mb-4 border-4 border-white shadow-lg overflow-hidden">
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
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
                disabled={saving}
                className="px-10 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
              >
                Ləğv Et
              </button>
              <button
                type="submit"
                name="publicationIntent"
                value="archive"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
              >
                <Archive className="h-4 w-4" /> Sonra üçün saxla
              </button>
              <button
                type="submit"
                name="publicationIntent"
                value="publish"
                disabled={saving}
                className="px-10 py-4 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50"
              >
                {saving ? 'Yadda saxlanır…' : editingId && !formData.isActive ? 'Yayımla' : editingId ? 'Yadda Saxla' : 'Blogu Yayımla'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-100 bg-white p-2">
        {([
          ['all', `Hamısı (${blogs.length})`],
          ['published', `Yayımlanan (${blogs.filter((blog) => blog.isActive).length})`],
          ['archived', `Arxiv (${blogs.filter((blog) => !blog.isActive).length})`],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatusFilter(value)}
            className={`rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition ${statusFilter === value ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleBlogs.map((blog) => (
          <div key={blog.id} className={`bg-white rounded-[2.5rem] overflow-hidden border transition-all duration-300 group ${!blog.isActive ? 'border-slate-100 opacity-60' : 'border-slate-100 hover:border-emerald-500 shadow-sm hover:shadow-xl'}`}>
            <div className="relative aspect-video">
              <img src={blog.image} alt={blog.title?.[activeLang] || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 left-4 flex gap-2">
                <div className={`px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest ${blog.isActive ? 'bg-emerald-600' : 'bg-slate-400'}`}>
                  {blog.isActive ? 'Yayımda' : 'Arxiv'}
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
              <p className="text-xs text-slate-500 line-clamp-2 mb-6 h-8 opacity-80 leading-relaxed font-medium">{plainBlogText(blog.content?.[activeLang] || '')}</p>


              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(blog.id)}
                  className="flex-grow py-3 rounded-xl bg-slate-50 text-slate-600 font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Redaktə
                </button>
                <button
                  type="button"
                  onClick={() => void handleStatusChange(blog.id, !blog.isActive)}
                  aria-label={blog.isActive ? 'Arxivə göndər' : 'Yayımla'}
                  title={blog.isActive ? 'Arxivə göndər' : 'Yayımla'}
                  className={`w-12 h-12 rounded-xl transition-all flex items-center justify-center ${blog.isActive ? 'bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-700' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                >
                  {blog.isActive ? <Archive className="h-4 w-4" /> : <ArchiveRestore className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        ))}

        {visibleBlogs.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <p className="font-bold text-sm text-slate-400">Heç bir blog tapılmadı.</p>
          </div>
        )}
      </div>

      {cropRequest && (
        <SliderImageCropper
          source={cropRequest.source}
          sourceType={cropRequest.sourceType}
          fileName={cropRequest.fileName}
          variant="blog"
          onCancel={() => setCropRequest(null)}
          onDone={(file, preview) => {
            setPendingCoverFile(file);
            setFormData((current) => ({ ...current, image: preview, imageFile: file }));
            setCropRequest(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminBlogs;
