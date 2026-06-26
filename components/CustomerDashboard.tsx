
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
interface Address {
  id: string;
  title: string;
  details: string;
  isPrimary: boolean;
}

interface CustomerDashboardProps {
  user: any;
  lang: 'az' | 'en' | 'ru';
  onBack: () => void;
  onUpdateUser: (updatedUser: any) => void;
  cart?: { id: string; quantity: number }[];
  onRemoveFromCart?: (id: string) => void;
  onUpdateCartQuantity?: (id: string, q: number) => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ 
  user, 
  lang, 
  onBack, 
  onUpdateUser,
  cart = [],
  onRemoveFromCart,
  onUpdateCartQuantity
}) => {
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<'profile' | 'cart' | 'orders'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize profile data with separate first/last name and addresses
  const [profileData, setProfileData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bankCard: user?.bankCard || { number: '', expiry: '', cvv: '' },
    addresses: user?.addresses || [
      { id: '1', title: 'Əsas Ünvan', details: user?.address || '', isPrimary: true }
    ]
  });

  const [newAddress, setNewAddress] = useState({ title: '', details: '' });
  const [showAddressForm, setShowAddressForm] = useState(false);

  const t = {
    profile: lang === 'az' ? 'Profil Məlumatları' : 'Profile Information',
    cart: lang === 'az' ? 'Səbətim' : 'My Cart',
    orders: lang === 'az' ? 'Sifarişlərim' : 'My Orders',
    edit: lang === 'az' ? 'Redaktə et' : 'Edit',
    save: lang === 'az' ? 'Yadda saxla' : 'Save Changes',
    cancel: lang === 'az' ? 'Ləğv et' : 'Cancel',
    addAddress: lang === 'az' ? 'Yeni Ünvan Əlavə Et' : 'Add New Address',
    primary: lang === 'az' ? 'Əsas' : 'Primary',
    setPrimary: lang === 'az' ? 'Əsas et' : 'Set as Primary',
    delete: lang === 'az' ? 'Sil' : 'Delete'
  };

  const handleSaveProfile = () => {
    const updatedUser = {
      ...user,
      name: `${profileData.firstName} ${profileData.lastName}`.trim(),
      email: profileData.email,
      phone: profileData.phone,
      bankCard: profileData.bankCard,
      addresses: profileData.addresses,
      address: profileData.addresses.find(a => a.isPrimary)?.details || ''
    };
    onUpdateUser(updatedUser);
    setIsEditing(false);
    showNotification(lang === 'az' ? 'Məlumatlar yeniləndi!' : 'Profile updated!');
  };

  const handleAddAddress = () => {
    if (!newAddress.title || !newAddress.details) return;
    const address: Address = {
      id: Math.random().toString(36).substr(2, 9),
      title: newAddress.title,
      details: newAddress.details,
      isPrimary: profileData.addresses.length === 0
    };
    setProfileData({
      ...profileData,
      addresses: [...profileData.addresses, address]
    });
    setNewAddress({ title: '', details: '' });
    setShowAddressForm(false);
  };

  const setPrimaryAddress = (id: string) => {
    setProfileData({
      ...profileData,
      addresses: profileData.addresses.map(a => ({
        ...a,
        isPrimary: a.id === id
      }))
    });
  };

  const removeAddress = (id: string) => {
    const filtered = profileData.addresses.filter(a => a.id !== id);
    if (filtered.length > 0 && !filtered.find(a => a.isPrimary)) {
      filtered[0].isPrimary = true;
    }
    setProfileData({ ...profileData, addresses: filtered });
  };

 

  const subtotal = 100

  // Mock orders for demonstration
  const [orders] = useState([
    { id: 'ORD-1234', date: '2024-03-20', status: 'delivered', items: 2, total: 450 },
    { id: 'ORD-5678', date: '2024-03-22', status: 'pending', items: 1, total: 1200 }
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Nav */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col pt-32 pb-12">
        <div className="px-8 mb-12">
          <div className="w-20 h-20 rounded-[2rem] bg-emerald-600 flex items-center justify-center text-white mb-6 shadow-xl shadow-emerald-600/20">
            <span className="text-3xl font-black">{user?.name?.[0]}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">{user?.name}</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Müştəri Hesabı</p>
        </div>

        <nav className="flex-grow space-y-2 px-4">
          {[
            { id: 'profile', label: t.profile, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            { id: 'cart', label: t.cart, icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
            { id: 'orders', label: t.orders, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }
          ].map(tab => (
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

        <div className="px-8 mt-12">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-all font-black text-[10px] uppercase tracking-widest">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Alış-verişə davam et
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-8 md:p-12 md:pt-32">
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
          
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div className="bg-white rounded-[3rem] border border-slate-100 p-10 md:p-16 shadow-2xl shadow-slate-200/50">
                <div className="flex justify-between items-center mb-12">
                  <h3 className="text-2xl font-black text-slate-900">{t.profile}</h3>
                  {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 rounded-xl border-2 border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-600 transition-all text-[10px] font-black uppercase tracking-widest">
                      {t.edit}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ad</label>
                      <input disabled={!isEditing} type="text" value={profileData.firstName} onChange={e => setProfileData({...profileData, firstName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none disabled:opacity-60 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Soyad</label>
                      <input disabled={!isEditing} type="text" value={profileData.lastName} onChange={e => setProfileData({...profileData, lastName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none disabled:opacity-60 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Ünvanı</label>
                      <input disabled type="email" value={profileData.email} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 opacity-60" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Əlaqə Nömrəsi</label>
                      <input disabled={!isEditing} type="tel" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none disabled:opacity-60 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Kartı</label>
                      <input disabled={!isEditing} type="text" placeholder="**** **** **** ****" value={profileData.bankCard.number} onChange={e => setProfileData({...profileData, bankCard: {...profileData.bankCard, number: e.target.value}})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none disabled:opacity-60 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Müddət</label>
                        <input disabled={!isEditing} type="text" placeholder="MM/YY" value={profileData.bankCard.expiry} onChange={e => setProfileData({...profileData, bankCard: {...profileData.bankCard, expiry: e.target.value}})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none disabled:opacity-60 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CVV</label>
                        <input disabled={!isEditing} type="password" placeholder="***" value={profileData.bankCard.cvv} onChange={e => setProfileData({...profileData, bankCard: {...profileData.bankCard, cvv: e.target.value}})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none disabled:opacity-60 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-4 mt-12 pt-12 border-t border-slate-50">
                    <button onClick={handleSaveProfile} className="px-10 py-4 rounded-2xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-emerald-600/20">
                      {t.save}
                    </button>
                    <button onClick={() => { setIsEditing(false); setProfileData({
                      firstName: user?.name?.split(' ')[0] || '',
                      lastName: user?.name?.split(' ').slice(1).join(' ') || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      bankCard: user?.bankCard || { number: '', expiry: '', cvv: '' },
                      addresses: user?.addresses || [{ id: '1', title: 'Əsas Ünvan', details: user?.address || '', isPrimary: true }]
                    }); }} className="px-10 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">
                      {t.cancel}
                    </button>
                  </div>
                )}
              </div>

              {/* Addresses Section */}
              <div className="bg-white rounded-[3rem] border border-slate-100 p-10 md:p-16 shadow-2xl shadow-slate-200/50">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Yaşayış Ünvanlarım</h3>
                  <button 
                    onClick={() => setShowAddressForm(true)}
                    className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                    {t.addAddress}
                  </button>
                </div>

                {showAddressForm && (
                  <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Ünvan adı (məs: Ev, İş)" 
                        value={newAddress.title}
                        onChange={e => setNewAddress({...newAddress, title: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <input 
                        type="text" 
                        placeholder="Tam ünvan" 
                        value={newAddress.details}
                        onChange={e => setNewAddress({...newAddress, details: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleAddAddress} className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all">Əlavə et</button>
                      <button onClick={() => setShowAddressForm(false)} className="text-slate-400 px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:text-slate-600">Ləğv et</button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profileData.addresses.map(addr => (
                    <div key={addr.id} className={`p-6 rounded-3xl border-2 transition-all ${addr.isPrimary ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-50 bg-slate-50/50'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-black text-slate-900 text-sm">{addr.title}</h4>
                        {addr.isPrimary && (
                          <span className="bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                            {t.primary}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">{addr.details}</p>
                      <div className="flex gap-3">
                        {!addr.isPrimary && (
                          <button onClick={() => setPrimaryAddress(addr.id)} className="text-emerald-600 text-[9px] font-black uppercase tracking-widest hover:underline">{t.setPrimary}</button>
                        )}
                        <button onClick={() => removeAddress(addr.id)} className="text-red-400 text-[9px] font-black uppercase tracking-widest hover:underline">{t.delete}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cart' && (
            <div className="space-y-8">
              <h3 className="text-3xl font-black text-slate-900 mb-8">{t.cart}</h3>
              {cartItems.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    {cartItems.map(item => (
                      <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-6 shadow-sm">
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-2xl" />
                        <div className="flex-grow">
                          <h4 className="font-black text-slate-900 text-sm">{item.name}</h4>
                          <div className="text-emerald-600 font-black text-sm mt-1">{item.price} AZN</div>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl">
                          <button onClick={() => onUpdateCartQuantity?.(item.id!, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
                          </button>
                          <span className="text-sm font-black text-slate-900 w-4 text-center">{item.quantity}</span>
                          <button onClick={() => onUpdateCartQuantity?.(item.id!, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                          </button>
                        </div>
                        <button onClick={() => onRemoveFromCart?.(item.id!)} className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl h-fit">
                    <h4 className="text-lg font-black text-slate-900 mb-6">Yekun</h4>
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Məhsullar:</span>
                        <span className="font-bold text-slate-900">{subtotal} AZN</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Çatdırılma:</span>
                        <span className="font-bold text-emerald-600">Pulsuz</span>
                      </div>
                      <div className="pt-4 border-t border-slate-50 flex justify-between">
                        <span className="font-black text-slate-900">Cəmi:</span>
                        <span className="font-black text-emerald-600 text-lg">{subtotal} AZN</span>
                      </div>
                    </div>
                    <button className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl shadow-emerald-600/20">
                      Sifarişi Tamamla
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-xl">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-2">Səbətiniz boşdur</h4>
                  <p className="text-slate-400 text-sm">Alış-verişə başlamaq üçün məhsullar bölməsinə keçid edin.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-8">
              <h3 className="text-3xl font-black text-slate-900 mb-8">{t.orders}</h3>
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {order.status === 'delivered' ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900">{order.id}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-12">
                        <div className="text-right">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${order.status === 'delivered' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {order.status === 'delivered' ? 'Çatdırılıb' : 'Hazırlanır'}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Məbləğ</div>
                          <div className="text-sm font-black text-slate-900">{order.total} AZN</div>
                        </div>
                        <button className="text-emerald-600 hover:text-slate-900 transition-colors">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
