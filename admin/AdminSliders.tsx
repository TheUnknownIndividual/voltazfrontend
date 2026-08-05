import React, { useEffect, useState } from 'react';
import { ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import SliderImageCropper from '../components/SliderImageCropper';
import { useNotification } from '../contexts/NotificationContext';
import { useUpload } from '../contexts/UploadContext';
import useApi from '../hooks/useApi';
import { DEFAULT_HOME_SLIDES, normalizeHomeSlides, type HomeSlide } from '../types/homeSlider';
import { API_ENDPOINTS } from '../utils/constants';

type ImageField = 'image' | 'mobileImage';

type CropRequest = {
  field: ImageField;
  source: string;
  sourceType: string;
  fileName: string;
};

const emptySlide = (): Partial<HomeSlide> => ({
  title: '',
  subtitle: '',
  image: '',
  mobileImage: '',
  video: '',
  cta: 'Ətraflı Öyrən',
  centered: true,
});

const AdminSliders: React.FC = () => {
  const { showNotification, confirm } = useNotification();
  const { uploadImage } = useUpload();
  const { get, put } = useApi();
  const [slides, setSlides] = useState<HomeSlide[]>([]);
  const [editingSlide, setEditingSlide] = useState<HomeSlide | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<HomeSlide>>(emptySlide());
  const [pendingFiles, setPendingFiles] = useState<Partial<Record<ImageField, File>>>({});
  const [cropRequest, setCropRequest] = useState<CropRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await get(API_ENDPOINTS.HOME_SLIDER.GET, { skipAuth: true });
        const loaded = normalizeHomeSlides(response?.data || response);
        setSlides(loaded.length ? loaded : DEFAULT_HOME_SLIDES);
      } catch {
        setSlides(DEFAULT_HOME_SLIDES);
        showNotification('Slider məlumatları yüklənmədi', 'error');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const closeEditor = () => {
    if (saving) return;
    setEditingSlide(null);
    setIsAdding(false);
    setFormData(emptySlide());
    setPendingFiles({});
    setCropRequest(null);
  };

  const startAdd = () => {
    setEditingSlide(null);
    setIsAdding(true);
    setFormData(emptySlide());
    setPendingFiles({});
  };

  const startEdit = (slide: HomeSlide) => {
    setEditingSlide(slide);
    setIsAdding(false);
    setFormData(slide);
    setPendingFiles({});
  };

  const beginCrop = (event: React.ChangeEvent<HTMLInputElement>, field: ImageField) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      showNotification('PNG, JPG və ya digər raster şəkil seçin', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setCropRequest({
      field,
      source: String(reader.result),
      sourceType: file.type,
      fileName: file.name,
    });
    reader.onerror = () => showNotification('Şəkil oxunmadı', 'error');
    reader.readAsDataURL(file);
  };

  const uploadPending = async (field: ImageField, currentValue?: string) => {
    const file = pendingFiles[field];
    if (!file) return currentValue || '';
    const response = await uploadImage(file);
    const path = response?.data?.path || response?.path || response?.data;
    if (typeof path !== 'string' || !path) throw new Error('Upload path was not returned');
    return path;
  };

  const save = async () => {
    if (!formData.title?.trim() || !formData.image) {
      showNotification('Başlıq və desktop şəkli mütləqdir', 'error');
      return;
    }

    setSaving(true);
    try {
      const image = await uploadPending('image', formData.image);
      const mobileImage = await uploadPending('mobileImage', formData.mobileImage);
      const completed: HomeSlide = {
        id: editingSlide?.id || Date.now(),
        title: formData.title.trim(),
        subtitle: formData.subtitle?.trim() || '',
        image,
        mobileImage: mobileImage || undefined,
        video: formData.video?.trim() || undefined,
        cta: formData.cta?.trim() || undefined,
        centered: formData.centered !== false,
      };
      const next = editingSlide
        ? slides.map(slide => slide.id === editingSlide.id ? completed : slide)
        : [...slides, completed];
      const response = await put(API_ENDPOINTS.HOME_SLIDER.UPDATE, { slides: next.slice(0, 3) });
      const saved = normalizeHomeSlides(response?.data || response);
      setSlides(saved);
      setSaving(false);
      closeEditor();
      window.dispatchEvent(new Event('volt_data_updated'));
      showNotification(editingSlide ? 'Slider yeniləndi' : 'Yeni slider əlavə edildi');
    } catch (error) {
      console.error('Slider save error:', error);
      showNotification('Slider yadda saxlanmadı', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (slide: HomeSlide) => {
    if (slides.length === 1) {
      showNotification('Ən azı bir slider saxlanmalıdır', 'warning');
      return;
    }
    if (!await confirm('Bu slideri silmək istədiyinizə əminsiniz?')) return;
    try {
      const next = slides.filter(item => item.id !== slide.id);
      const response = await put(API_ENDPOINTS.HOME_SLIDER.UPDATE, { slides: next });
      setSlides(normalizeHomeSlides(response?.data || response));
      window.dispatchEvent(new Event('volt_data_updated'));
      showNotification('Slider silindi', 'warning');
    } catch {
      showNotification('Slider silinmədi', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900">Slider İdarəetməsi</h2>
          <p className="mt-1 text-xs font-medium text-slate-400">Ana səhifənin hero şəkilləri bütün istifadəçilər üçün yayımlanır.</p>
        </div>
        <button type="button" onClick={startAdd} disabled={slides.length >= 3} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40">
          <Plus className="h-4 w-4" /> Əlavə et
        </button>
      </div>

      <section className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-xl">
        <div className="border-b border-slate-50 p-7">
          <h3 className="text-lg font-black text-slate-900">Ana səhifə hero slideri</h3>
          <p className="mt-1 text-xs text-slate-400">Desktop və mobil görünüşlər ayrıca uyğunlaşdırılır. Maksimum 3 şəkil.</p>
        </div>
        <div className="grid gap-5 p-7 md:grid-cols-2 xl:grid-cols-3">
          {loading && <p className="text-sm font-bold text-slate-400">Yüklənir…</p>}
          {!loading && slides.map(slide => (
            <article key={slide.id} className="group overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
              <div className="relative aspect-[16/7] overflow-hidden bg-white">
                <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center gap-3 bg-slate-950/50 opacity-0 transition group-hover:opacity-100">
                  <button type="button" onClick={() => startEdit(slide)} aria-label="Redaktə et" className="rounded-full bg-white p-3 text-emerald-600 shadow-lg"><Pencil className="h-4 w-4" /></button>
                  <button type="button" onClick={() => void remove(slide)} aria-label="Sil" className="rounded-full bg-white p-3 text-red-600 shadow-lg"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="p-4">
                <h4 className="truncate text-sm font-black text-slate-900">{slide.title}</h4>
                <p className="mt-1 text-[10px] font-bold text-slate-400">{slide.mobileImage ? 'Desktop + mobil şəkil' : 'Yalnız desktop şəkli'}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {(editingSlide || isAdding) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button type="button" aria-label="Redaktoru bağla" className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeEditor} />
          <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <h3 className="text-lg font-black uppercase tracking-widest text-slate-900">{editingSlide ? 'Slideri redaktə et' : 'Yeni slider əlavə et'}</h3>
              <button type="button" onClick={closeEditor} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100" aria-label="Bağla"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-6 p-6 md:p-8">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Başlıq</label>
                <input value={formData.title || ''} onChange={event => setFormData(current => ({ ...current, title: event.target.value }))} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500" />
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_15rem]">
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Desktop görünüşü</label>
                      <p className="mt-1 text-[10px] font-bold text-emerald-600">Geniş 16:7 çərçivə</p>
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                      <ImagePlus className="h-4 w-4" /> Şəkil seç
                      <input type="file" accept="image/*" className="hidden" onChange={event => beginCrop(event, 'image')} />
                    </label>
                  </div>
                  <div className="aspect-[16/7] overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
                    {formData.image ? <img src={formData.image} alt="Desktop önizləmə" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs font-bold text-slate-400">Şəkil seçilməyib</div>}
                  </div>
                  <input value={formData.image || ''} onChange={event => {
                    setPendingFiles(current => ({ ...current, image: undefined }));
                    setFormData(current => ({ ...current, image: event.target.value }));
                  }} placeholder="və ya desktop şəkil URL-i" className="mt-3 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold outline-none focus:border-emerald-500" />
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Mobil görünüş</label>
                      <p className="mt-1 text-[10px] font-bold text-emerald-600">Kvadrat 1:1 çərçivə</p>
                    </div>
                  </div>
                  <div className="aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
                    {formData.mobileImage ? <img src={formData.mobileImage} alt="Mobil önizləmə" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center px-5 text-center text-[10px] font-bold leading-4 text-slate-400">Desktop mənbəyini mobil üçün də seçə və ayrıca kəsə bilərsiniz.</div>}
                  </div>
                  <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                    <ImagePlus className="h-4 w-4" /> Mobil şəkil seç
                    <input type="file" accept="image/*" className="hidden" onChange={event => beginCrop(event, 'mobileImage')} />
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Video URL (könüllü)</label>
                <input value={formData.video || ''} onChange={event => setFormData(current => ({ ...current, video: event.target.value }))} placeholder="https://…" className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => void save()} disabled={saving} className="flex-1 rounded-xl bg-emerald-600 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-600/20 disabled:opacity-50">{saving ? 'Yadda saxlanır…' : 'Yadda saxla və yayımla'}</button>
                <button type="button" onClick={closeEditor} disabled={saving} className="flex-1 rounded-xl bg-slate-100 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600">Ləğv et</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {cropRequest && (
        <SliderImageCropper
          source={cropRequest.source}
          sourceType={cropRequest.sourceType}
          fileName={cropRequest.fileName}
          variant={cropRequest.field === 'image' ? 'desktop' : 'mobile'}
          onCancel={() => setCropRequest(null)}
          onDone={(file, preview) => {
            setPendingFiles(current => ({ ...current, [cropRequest.field]: file }));
            setFormData(current => ({ ...current, [cropRequest.field]: preview }));
            setCropRequest(cropRequest.field === 'image'
              ? { ...cropRequest, field: 'mobileImage' }
              : null);
          }}
        />
      )}
    </div>
  );
};

export default AdminSliders;
