
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import MasterForum from './MasterForum';


interface ProClubDashboardProps {
  user: any;
  lang: 'az' | 'en' | 'ru';
  onBack: () => void;
  onNavigate?: (page: any) => void;
  onUpdateUser: (updatedUser: any) => void;
}

const ProClubDashboard: React.FC<ProClubDashboardProps> = ({ user, lang, onBack, onNavigate, onUpdateUser }) => {
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'forum' | 'campaigns' | 'stats'>('forum');
  const [currentUser, setCurrentUser] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({ ...user });

  useEffect(() => {
    // Bazadan istifadəçinin son statusunu çək
    const checkApproval = () => {
      const savedUsers = JSON.parse(localStorage.getItem('volt_users') || '[]');
      const dbUser = savedUsers.find((u: any) => u.email === user.email);
      if (dbUser) {
        setCurrentUser(dbUser);
        setProfileData(dbUser);
      }
    };
    
    checkApproval();
    // Real-time simulyasiyası üçün hər 5 saniyədən bir yoxla
    const interval = setInterval(checkApproval, 5000);
    return () => clearInterval(interval);
  }, [user.email]);

  const t = {
    welcome: lang === 'az' ? `Xoş gəlmisiniz, Usta ${(currentUser?.name || '').split(' ')[0]}!` : `Welcome, Master ${(currentUser?.name || '').split(' ')[0]}!`,
    pending: lang === 'az' ? 'Hesabınız hələ administrator tərəfindən təsdiqlənməyib. Forum və Kompaniyalar təsdiqdən sonra aktiv olacaq.' : 'Your account is pending admin approval. Forum and Campaigns will be active soon.',
    approved: lang === 'az' ? 'Hesabınız təsdiqlənib! Peşəkar imkanlardan yararlana bilərsiniz.' : 'Your account is approved!',
    tabs: {
      profile: lang === 'az' ? 'Profil' : 'Profile',
      orders: lang === 'az' ? 'Sifarişlərim' : 'Orders',
      forum: lang === 'az' ? 'Form' : 'Form',
      campaigns: lang === 'az' ? 'Ustalara özəl' : 'Exclusive for Masters',
      stats: lang === 'az' ? 'Statistika' : 'Stats'
    },
    edit: lang === 'az' ? 'Redaktə et' : 'Edit',
    save: lang === 'az' ? 'Yadda saxla' : 'Save Changes',
    cancel: lang === 'az' ? 'Ləğv et' : 'Cancel'
  };

  const isApproved = currentUser?.isApproved;

  if (!isApproved) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-amber-50 rounded-[2.5rem] flex items-center justify-center text-amber-500 mx-auto mb-8 shadow-inner">
            <svg className="w-12 h-12 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Təsdiq Gözlənilir</h2>
          <p className="text-slate-500 text-lg leading-relaxed mb-10">
            Hörmətli usta, qeydiyyat məlumatlarınız hazırda administrator tərəfindən yoxlanılır. Hesabınız təsdiqləndikdən sonra bütün imkanlardan (Forum, Aksiyalar, Sifarişlər) yararlana biləcəksiniz.
          </p>
          <div className="space-y-4">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 text-left">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dəstək</div>
                <div className="text-sm font-bold text-slate-700">usta@volt.az</div>
              </div>
            </div>
            <button 
              onClick={onBack}
              className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-xl"
            >
              Ana Səhifəyə Qayıt
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveProfile = () => {
    onUpdateUser(profileData);
    setIsEditing(false);
    showNotification(lang === 'az' ? 'Məlumatlar yeniləndi!' : 'Profile updated!');
  };

  const menuItems = [
    { id: 'profile', label: t.tabs.profile, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'orders', label: t.tabs.orders, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'forum', label: t.tabs.forum, icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z' },
    { id: 'campaigns', label: t.tabs.campaigns, icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' },
    { id: 'stats', label: t.tabs.stats, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Nav */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col pt-32 pb-12">
        <div className="px-8 mb-12">
          <div className="w-20 h-20 rounded-[2rem] bg-emerald-600 flex items-center justify-center text-white mb-6 shadow-xl shadow-emerald-600/20">
            <span className="text-3xl font-black">{currentUser?.name?.[0]}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">{currentUser?.name}</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Peşəkar Usta</p>
          
          <div className="flex items-center gap-3 mt-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${isApproved ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600 animate-pulse'}`}>
              {isApproved ? 'Təsdiqlənib' : 'Gözləyir'}
            </div>
            
            {isApproved && (
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                <svg className="w-3 h-3 text-yellow-500 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-[10px] font-black text-yellow-700">5.0</span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-grow space-y-2 px-4">
          {menuItems.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <div className="flex items-center gap-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} /></svg>
                {tab.label}
              </div>
            </button>
          ))}
        </nav>

        <div className="px-8 mt-12 space-y-4">
          <button onClick={onBack} className="w-full flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-all font-black text-[10px] uppercase tracking-widest">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Mağazaya Qayıt
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-8 md:p-12 md:pt-32 relative">
        <div className="max-w-5xl mx-auto">
          
          {activeTab === 'profile' && (
            <div className="bg-white rounded-[3rem] border border-slate-100 p-10 md:p-16 shadow-2xl shadow-slate-200/50 animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-12">
                <h3 className="text-2xl font-black text-slate-900">{t.tabs.profile}</h3>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 rounded-xl border-2 border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-600 transition-all text-[10px] font-black uppercase tracking-widest">
                    {t.edit}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ad Soyad</label>
                    <input disabled={!isEditing} type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none disabled:opacity-60 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Ünvanı</label>
                    <input disabled type="email" value={profileData.email} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 opacity-60" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Əlaqə Nömrəsi</label>
                    <input disabled={!isEditing} type="tel" value={profileData.phone || ''} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none disabled:opacity-60 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Şəhər</label>
                    <input disabled type="text" value={profileData.city || ''} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 opacity-60" />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-4 mt-12 pt-12 border-t border-slate-50">
                  <button onClick={handleSaveProfile} className="px-10 py-4 rounded-2xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-emerald-600/20">
                    {t.save}
                  </button>
                  <button onClick={() => { setIsEditing(false); setProfileData({...currentUser}); }} className="px-10 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">
                    {t.cancel}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h3 className="text-3xl font-black text-slate-900 mb-8">{t.tabs.orders}</h3>
              <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-xl">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-2">Hələlik sifariş yoxdur</h4>
                <p className="text-slate-400 text-sm">İlk sifarişinizi etmək üçün məhsullar bölməsinə keçid edin.</p>
              </div>
            </div>
          )}

          {activeTab === 'forum' && <MasterForum lang={lang} />}
          
          {activeTab === 'campaigns' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { title: "Huawei Inverter Keşbek", desc: "M1 seriyası invertorlar alımında 5% anlıq keşbek.", code: "HW2024" },
                  { title: "Yay Kampaniyası", desc: "10 panel alana 1 panel hədiyyə!", code: "SOLAR10" },
                  { title: "Texniki Təlim", desc: "Növbəti həftə Growwat mühəndisləri ilə onlayn vebinar.", code: "WEBINAR" }
                ].map((camp, i) => (
                  <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-emerald-500 transition-all group">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                    </div>
                    <h4 className="text-xl font-black mb-2 text-slate-900">{camp.title}</h4>
                    <p className="text-sm text-slate-500 mb-6">{camp.desc}</p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 text-center">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Promo Kod</span>
                       <span className="text-sm font-black text-emerald-600 tracking-widest">{camp.code}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: "Ümumi Alış", val: "0 AZN", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0116 0z" },
                  { label: "Tamamlanmış Sifariş", val: "0", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0116 0z" },
                  { label: "Aktiv Cashback", val: "0 AZN", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mx-auto mb-4">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} /></svg>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
                    <div className="text-2xl font-black text-slate-900">{stat.val}</div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default ProClubDashboard;
