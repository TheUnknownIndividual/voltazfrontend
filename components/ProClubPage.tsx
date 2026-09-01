
import React, { useState } from 'react';

interface ProClubPageProps {
  lang?: 'az' | 'en' | 'ru';
  onBack?: () => void;
  onRegisterSuccess: (user: any) => void;
  initialMode?: 'info' | 'register';
}

const ProClubPage: React.FC<ProClubPageProps> = ({ lang = 'az', onBack, onRegisterSuccess, initialMode = 'info' }) => {
  const [mode, setMode] = useState<'info' | 'register'>(initialMode);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    city: 'Bakı',
    phonePrefix: '050',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    masterType: 'Mühəndis',
    documentImage: ''
  });
  const [error, setError] = useState('');

  const cities = ['Bakı', 'Gəncə', 'Sumqayıt', 'Quba', 'Qusar', 'Lənkəran', 'Şəki', 'Bərdə', 'Mingəçevir', 'Naxçıvan'];
  const masterTypes = ['Mühəndis', 'Texnik', 'Elektrik', 'Quraşdırıcı', 'Layihəçi'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, documentImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(lang === 'az' ? 'Şifrələr uyğun gəlmir' : 'Passwords do not match');
      return;
    }

    if (!formData.documentImage) {
      setError(lang === 'az' ? 'Zəhmət olmasa sənədin şəklini yükləyin' : 'Please upload a document image');
      return;
    }

    const fullPhone = `${formData.phonePrefix}${formData.phone}`;
    const savedUsers = JSON.parse(localStorage.getItem('volt_users') || '[]');
    if (savedUsers.find((u: any) => u.email === formData.email || u.phone === fullPhone)) {
      setError(lang === 'az' ? 'Bu email və ya nömrə artıq istifadədədir' : 'Email or phone already in use');
      return;
    }
    
    const newUser = { 
      email: formData.email,
      name: `${formData.firstName} ${formData.lastName}`, 
      role: 'master', 
      city: formData.city,
      phone: fullPhone,
      masterType: formData.masterType,
      documentImage: formData.documentImage,
      isApproved: false,
      registrationDate: new Date().toISOString()
    };

    localStorage.setItem('volt_users', JSON.stringify([...savedUsers, newUser]));
    setRegisteredUser(newUser);
    setShowSuccessModal(true);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    if (registeredUser) {
      onRegisterSuccess(registeredUser);
    }
  };

  return (
    <div className="bg-white min-h-screen relative">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white max-w-md w-full rounded-[2.5rem] p-10 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">Qeydiyyat Tamamlandı!</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Məlumatlarınız uğurla qəbul edildi. Hesabınız yoxlanıldıqdan sonra sizinlə tezliklə əlaqə saxlanılacaq və şəxsi kabinetiniz tam aktiv ediləcək.
            </p>
            <button 
              onClick={handleModalClose}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl shadow-emerald-600/20"
            >
              Anladım
            </button>
          </div>
        </div>
      )}

      <section className="bg-emerald-950 py-4 border-b border-emerald-900/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between relative z-10">
          <button onClick={mode === 'register' ? () => setMode('info') : onBack} className="flex items-center gap-1.5 text-emerald-300/60 hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Geri qayıt
          </button>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">
            {mode === 'info' ? 'Ustalar Klubu Nədir?' : 'Ustalar Klubu Qeydiyyatı'}
          </h1>
        </div>
      </section>

      {mode === 'info' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Hero Section */}
          <section className="relative py-24 overflow-hidden bg-slate-900">
            <div className="absolute inset-0 opacity-20">
              <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=2000" alt="Engineers" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-emerald-600/20 text-emerald-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-500/20">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Peşəkarların Məkanı
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-6">
                  Volt.az <span className="text-emerald-500">Ustalar Klubu</span>-na xoş gəlmisiniz!
                </h2>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed opacity-80 mb-10">
                  Azərbaycanın ən böyük günəş enerjisi mütəxəssisləri şəbəkəsinə qoşulun. Bizimlə həm öyrənin, həm də qazanın.
                </p>
                <button 
                  onClick={() => setMode('register')}
                  className="bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white hover:text-emerald-600 transition-all shadow-2xl shadow-emerald-600/20 group"
                >
                  İndi Qoşulun
                  <svg className="w-4 h-4 inline-block ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Klub Haqqında</h3>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                      Peşəkar İnkişaf və <br /> Yeni İmkanlar Platforması
                    </h2>
                  </div>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed opacity-80">
                    "Ustalar Klubu" peşəkar günəş enerjisi quraşdırıcılarını, mühəndisləri və texnikləri bir araya gətirən eksklüziv platformadır. Məqsədimiz Azərbaycanda yaşıl enerji sahəsində çalışan mütəxəssislərin inkişafına dəstək olmaq və onlara ən müasir texnologiyalarla işləmək imkanı yaratmaqdır.
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="text-3xl font-black text-emerald-600 mb-1">500+</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktiv Üzv</div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="text-3xl font-black text-emerald-600 mb-1">20+</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Partnyor Brend</div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1000" alt="Work" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-10 -left-10 bg-emerald-600 p-10 rounded-[2.5rem] shadow-2xl hidden md:block">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How to Join */}
          <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 md:px-12">
              <div className="text-center mb-16">
                <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-4">Proses</h3>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900">Necə Qoşulmaq Olar?</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { step: '01', title: 'Qeydiyyat', desc: 'Onlayn formanı dolduraraq şəxsi məlumatlarınızı daxil edin.' },
                  { step: '02', title: 'Sənəd Təsdiqi', desc: 'Ustalığınızı təsdiq edən sənədi yükləyin və yoxlanışdan keçin.' },
                  { step: '03', title: 'Aktivasiya', desc: 'Hesabınız təsdiqləndikdən sonra bütün imtiyazlardan faydalanın.' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="text-5xl font-black text-slate-100 group-hover:text-emerald-100 transition-colors mb-6">{item.step}</div>
                    <h4 className="text-xl font-black text-slate-900 mb-4">{item.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Aksiyalar & Təlimlər */}
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Aksiyalar */}
                <div className="bg-emerald-600 rounded-[3rem] p-12 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-[10px] font-black text-emerald-200 uppercase tracking-[0.3em] mb-4">Üstünlüklər</h3>
                    <h2 className="text-3xl font-black mb-6">Xüsusi Aksiyalar</h2>
                    <ul className="space-y-4 mb-10">
                      <li className="flex items-center gap-3 text-emerald-50">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        Məhsullara eksklüziv endirimlər
                      </li>
                      <li className="flex items-center gap-3 text-emerald-50">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        Hər alışdan qazanılan bonus balları
                      </li>
                      <li className="flex items-center gap-3 text-emerald-50">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        Mövsümi hədiyyə kampaniyaları
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Təlimlər */}
                <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM3.89 9.5l8.11 4.42 8.11-4.42-8.11-4.42-8.11 4.42z"/></svg>
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">İnkişaf</h3>
                    <h2 className="text-3xl font-black mb-6">Texniki Təlim</h2>
                    <ul className="space-y-4 mb-10">
                      <li className="flex items-center gap-3 text-slate-300">
                        <svg className="w-5 h-5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        Növbəti həftə Growwat mühəndisləri ilə onlayn vebinar.
                      </li>
                      <li className="flex items-center gap-3 text-slate-300">
                        <svg className="w-5 h-5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        Yeni texnologiyalarla tanışlıq seminarları
                      </li>
                      <li className="flex items-center gap-3 text-slate-300">
                        <svg className="w-5 h-5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        Təcrübəli mütəxəssislərlə mentorluq
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      ) : (
        <div className="py-20 flex justify-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="max-w-2xl w-full bg-white p-8 md:p-14 rounded-[3rem] shadow-2xl border border-slate-100">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Klubun Üzvü Ol</h2>
              <p className="text-slate-500 text-sm mb-4">Peşəkar usta olaraq bizə qoşulun.</p>
              <button 
                onClick={() => setMode('info')}
                className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center gap-2 mx-auto"
              >
                Klub haqqında ətraflı
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ad *</label>
                  <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="Əli" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Soyad *</label>
                  <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="Məmmədov" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Şəhər *</label>
                  <select required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none appearance-none">
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Əlaqə nömrəsi *</label>
                  <div className="flex gap-2">
                    <select 
                      value={formData.phonePrefix} 
                      onChange={e => setFormData({...formData, phonePrefix: e.target.value})}
                      className="w-24 bg-slate-50 border border-slate-100 rounded-xl px-3 py-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none appearance-none font-bold text-slate-700"
                    >
                      {['050', '051', '055', '099', '077', '070'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 7)})} className="flex-grow bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-slate-700" placeholder="1234567" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email ünvanı *</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="email@example.com" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Şifrə *</label>
                  <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Yeni Şifrə *</label>
                  <input required type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="••••••••" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ustalığın tipi *</label>
                <select required value={formData.masterType} onChange={e => setFormData({...formData, masterType: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none appearance-none">
                  {masterTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ustalığı təsdiq edən sənədin şəkli *</label>
                <div className="relative group">
                  <input required type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center group-hover:border-emerald-500 transition-all">
                    {formData.documentImage ? (
                      <div className="flex flex-col items-center">
                        <img src={formData.documentImage} alt="Document" className="w-20 h-20 object-cover rounded-lg mb-2" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Şəkil yükləndi</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Şəkil seçin və ya bura sürüşdürün</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-[10px] font-bold text-center bg-red-50 py-2 rounded-lg">{error}</p>}

              <button type="submit" className="flex w-full min-h-[var(--cta-btn-h)] items-center justify-center bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl shadow-emerald-600/20 active:scale-95">
                Usta Hesabını Yarat
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProClubPage;
