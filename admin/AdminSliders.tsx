
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  video?: string;
  cta?: string;
  description?: string;
  linkText?: string;
  page?: string;
  centered?: boolean;
}

const AdminSliders: React.FC = () => {
  const { showNotification, confirm } = useNotification();
  const [heroSlides, setHeroSlides] = useState<Slide[]>([]);
  const [sideSlides, setSideSlides] = useState<Slide[]>([]);
  const [editingSlide, setEditingSlide] = useState<{ type: 'hero' | 'side', slide: Slide } | null>(null);
  const [isAdding, setIsAdding] = useState<'hero' | 'side' | null>(null);

  const [formData, setFormData] = useState<Partial<Slide>>({});

  useEffect(() => {
    const savedHero = JSON.parse(localStorage.getItem('volt_hero_slides') || '[]');
    const savedSide = JSON.parse(localStorage.getItem('volt_side_slides') || '[]');
    
    // If empty, initialize with defaults from HeroSlider.tsx (mocking the initial state)
    if (savedHero.length === 0) {
      const initialHero = [
        { 
          id: 1, 
          title: "Günəş Enerjisi ilə Gələcəyi Aydınlat", 
          subtitle: "", 
          image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=2000", 
          video: "https://assets.mixkit.co/videos/preview/mixkit-solar-panels-on-a-roof-of-a-house-40532-large.mp4",
          cta: "Ətraflı Öyrən",
          centered: true
        },
        { id: 2, title: "və biz parlaq bir çıraq yaratdıq", subtitle: "", image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=2000", cta: "Ətraflı Öyrən", centered: true },
        { id: 3, title: "Net Metering ilə Qazan, İnvestisiyanı Geri Qaytar", subtitle: "", image: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&q=80&w=2000", cta: "Ətraflı Öyrən", centered: true }
      ];
      setHeroSlides(initialHero);
      localStorage.setItem('volt_hero_slides', JSON.stringify(initialHero));
    } else {
      setHeroSlides(savedHero);
    }

    if (savedSide.length === 0) {
      const initialSide = [
        { id: 1, title: "Biznes tərəfdaşlar üçün yeni fürsətlər", subtitle: "Tərəfdaşlıq", description: "Tərəfdaşlarımız üçün xüsusi kampaniyalar və özəl fürsətlər yaratdıq. Yaralanmaq üçün keçid edin.", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000", linkText: "Keçid et", page: 'partnership' },
        { id: 2, title: "Ustalar klubuna qoşul, endirimlərdən yararlan", subtitle: "Pro Club", description: "Peşəkar ustalar üçün nəzərdə tutulmuş özəl imtiyazlar və endirim proqramı.", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1000", linkText: "Keçid et", page: 'pro-club' }
      ];
      setSideSlides(initialSide);
      localStorage.setItem('volt_side_slides', JSON.stringify(initialSide));
    } else {
      setSideSlides(savedSide);
    }
  }, []);

  const handleSave = async () => {
    if (!formData.title || !formData.image) {
      showNotification('Başlıq və Şəkil mütləqdir', 'error');
      return;
    }

    let finalImage = formData.image;

    // Compress if it's a base64 string (uploaded from PC)
    if (finalImage.startsWith('data:image')) {
      try {
        finalImage = await compressImage(finalImage);
      } catch (err) {
        console.error('Compression error:', err);
      }
    }

    try {
      if (editingSlide) {
        const { type, slide } = editingSlide;
        if (type === 'hero') {
          const updated = heroSlides.map(s => s.id === slide.id ? { ...s, ...formData, image: finalImage } : s);
          setHeroSlides(updated as Slide[]);
          localStorage.setItem('volt_hero_slides', JSON.stringify(updated));
        } else {
          const updated = sideSlides.map(s => s.id === slide.id ? { ...s, ...formData, image: finalImage } : s);
          setSideSlides(updated as Slide[]);
          localStorage.setItem('volt_side_slides', JSON.stringify(updated));
        }
        showNotification('Slider yeniləndi');
      } else if (isAdding) {
        const newSlide = {
          id: Date.now(),
          ...formData,
          image: finalImage
        } as Slide;

        if (isAdding === 'hero') {
          const updated = [...heroSlides, newSlide];
          setHeroSlides(updated);
          localStorage.setItem('volt_hero_slides', JSON.stringify(updated));
        } else {
          const updated = [...sideSlides, newSlide];
          setSideSlides(updated);
          localStorage.setItem('volt_side_slides', JSON.stringify(updated));
        }
        showNotification('Yeni slider əlavə edildi');
      }
    } catch (error) {
      console.error('LocalStorage error:', error);
      showNotification('Yadda saxlama xətası: Şəkil çox böyük ola bilər. Zəhmət olmasa daha kiçik şəkil sınayın.', 'error');
      return;
    }

    setEditingSlide(null);
    setIsAdding(null);
    setFormData({});
    window.dispatchEvent(new Event('volt_data_updated'));
  };

  const compressImage = (base64Str: string, maxWidth = 1280, maxHeight = 720): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject('Canvas context not found');
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Convert to JPEG with 0.6 quality to significantly reduce size
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = (err) => reject(err);
    });
  };

  const handleDelete = async (type: 'hero' | 'side', id: number) => {
    if (await confirm('Bu slideri silmək istədiyinizə əminsiniz?')) {
      if (type === 'hero') {
        const updated = heroSlides.filter(s => s.id !== id);
        setHeroSlides(updated);
        localStorage.setItem('volt_hero_slides', JSON.stringify(updated));
      } else {
        const updated = sideSlides.filter(s => s.id !== id);
        setSideSlides(updated);
        localStorage.setItem('volt_side_slides', JSON.stringify(updated));
      }
      showNotification('Slider silindi', 'warning');
      window.dispatchEvent(new Event('volt_data_updated'));
    }
  };

  const startEdit = (type: 'hero' | 'side', slide: Slide) => {
    setEditingSlide({ type, slide });
    setFormData(slide);
    setIsAdding(null);
  };

  const startAdd = (type: 'hero' | 'side') => {
    setIsAdding(type);
    setFormData({
      title: '',
      subtitle: '',
      image: '',
      cta: type === 'hero' ? 'Ətraflı Öyrən' : undefined,
      description: type === 'side' ? '' : undefined,
      linkText: type === 'side' ? 'Keçid et' : undefined,
      page: type === 'side' ? 'home' : undefined
    });
    setEditingSlide(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Slider İdarəetməsi</h2>
      </div>

      {/* Hero Sliders Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-slate-900">Əsas Hero Sliderlər</h3>
            <p className="text-xs text-slate-400 mt-1">Ana səhifənin yuxarı hissəsində görünən böyük sliderlər</p>
          </div>
          <button 
            onClick={() => startAdd('hero')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            Əlavə Et
          </button>
        </div>
        
        <div className="p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {heroSlides.map(slide => (
            <div key={slide.id} className="group relative bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all scale-75 origin-top-left">
              <div className="aspect-video relative">
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                {slide.video && (
                  <div className="absolute top-2 left-2 bg-emerald-600 text-white p-1 rounded-md shadow-lg">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => startEdit('hero', slide)} className="p-2 bg-white text-emerald-600 rounded-full hover:scale-110 transition-transform shadow-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDelete('hero', slide.id)} className="p-2 bg-white text-red-600 rounded-full hover:scale-110 transition-transform shadow-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-black text-slate-900 text-[10px] mb-0.5 line-clamp-1">{slide.title}</h4>
                <p className="text-[8px] text-slate-500 line-clamp-1">{slide.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit/Add Modal */}
      {(editingSlide || isAdding) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">
                {editingSlide ? 'Slideri Redaktə Et' : 'Yeni Slider Əlavə Et'}
              </h3>
              <button onClick={() => { setEditingSlide(null); setIsAdding(null); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Başlıq</label>
                  <input 
                    type="text" 
                    value={formData.title || ''} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                    {editingSlide?.type === 'side' || isAdding === 'side' ? 'Alt Başlıq (Etiket)' : 'Alt Başlıq (Mətn)'}
                  </label>
                  <textarea 
                    value={formData.subtitle || ''} 
                    onChange={e => setFormData({...formData, subtitle: e.target.value})}
                    rows={editingSlide?.type === 'hero' || isAdding === 'hero' ? 3 : 1}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                {(editingSlide?.type === 'side' || isAdding === 'side') && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Təsvir</label>
                    <textarea 
                      value={formData.description || ''} 
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                )}

                {(editingSlide?.type === 'hero' || isAdding === 'hero') && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Video URL (Könüllü)</label>
                    <input 
                      type="text" 
                      value={formData.video || ''} 
                      onChange={e => setFormData({...formData, video: e.target.value})}
                      placeholder="https://... (mp4 format tövsiyə olunur)"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                    />
                    <p className="text-[8px] text-slate-400 mt-1">Video əlavə edildikdə şəkil arxa fon (fallback) kimi istifadə olunacaq.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Şəkil URL</label>
                    <input 
                      type="text" 
                      value={formData.image || ''} 
                      onChange={e => setFormData({...formData, image: e.target.value})}
                      placeholder="https://..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                      Və ya Kompüterdən Yüklə 
                      <span className="ml-2 text-emerald-500 lowercase font-bold">
                        ({(editingSlide?.type === 'hero' || isAdding === 'hero') ? 'Tövsiyə: 1920x1080' : 'Tövsiyə: 800x600'})
                      </span>
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-emerald-500 transition-all file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                  </div>
                </div>

                {formData.image && (
                  <div className="mt-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Şəkil Önizləmə (Kiçildilmiş)</label>
                    <div className="w-32 h-20 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                {(editingSlide?.type === 'hero' || isAdding === 'hero') && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Düymə Mətni (CTA)</label>
                    <input 
                      type="text" 
                      value={formData.cta || ''} 
                      onChange={e => setFormData({...formData, cta: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                )}

                {(editingSlide?.type === 'side' || isAdding === 'side') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Link Mətni</label>
                      <input 
                        type="text" 
                        value={formData.linkText || ''} 
                        onChange={e => setFormData({...formData, linkText: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Keçid Səhifəsi</label>
                      <select 
                        value={formData.page || 'home'} 
                        onChange={e => setFormData({...formData, page: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                      >
                        <option value="home">Ana Səhifə</option>
                        <option value="partnership">Tərəfdaşlıq</option>
                        <option value="pro-club">Pro Club</option>
                        <option value="calculator">Kalkulyator</option>
                        <option value="contact">Əlaqə</option>
                      </select>
                    </div>
                  </div>
                )}
                {(editingSlide?.type === 'hero' || isAdding === 'hero') && (
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4">
                    <input 
                      type="checkbox" 
                      id="centered"
                      checked={formData.centered || false} 
                      onChange={e => setFormData({...formData, centered: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="centered" className="text-xs font-bold text-slate-700 cursor-pointer">Mətni mərkəzləşdir</label>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleSave}
                  className="flex-grow bg-emerald-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                >
                  Yadda Saxla
                </button>
                <button 
                  onClick={() => { setEditingSlide(null); setIsAdding(null); }}
                  className="flex-grow bg-slate-100 text-slate-600 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                >
                  Ləğv Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSliders;
