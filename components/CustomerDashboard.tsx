
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useProduct } from '../contexts/ProductContext';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../utils/constants';
interface Address {
  id: string;
  title: string;
  details: string;
  isPrimary: boolean;
}

interface CustomerDashboardProps {
  user: any;
  lang: 'az' | 'en' | 'ru' | 'tr';
  onBack: () => void;
  onUpdateUser: (updatedUser: any) => void;
  cart?: { id: string; quantity: number; power?: string }[];
  onRemoveFromCart?: (id: string, power?: string) => void;
  onUpdateCartQuantity?: (id: string, q: number, power?: string) => void;
  onNavigate?: (page: string) => void;
  initialTab?: 'profile' | 'cart' | 'orders';
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ 
  user, 
  lang, 
  onBack, 
  onUpdateUser,
  cart = [],
  onRemoveFromCart,
  onUpdateCartQuantity,
  onNavigate,
  initialTab = 'profile'
}) => {
  const { showNotification } = useNotification();
  const { getProductById } = useProduct();
  const [activeTab, setActiveTab] = useState<'profile' | 'cart' | 'orders'>(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [cartProducts, setCartProducts] = useState<any[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [selectedPayment, setSelectedPayment] = useState<'cash' | 'card' | 'credit'>('cash');
  const [selectedDelivery, setSelectedDelivery] = useState<'delivery' | 'pickup'>('delivery');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const cartLoadKey = cart.map((item) => `${item.id}:${item.power || ''}:${item.quantity}`).join('|');
  const hasAuthToken = () => Boolean(sessionStorage.getItem('authToken'));

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  
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
    delete: lang === 'az' ? 'Sil' : 'Delete',
    checkout: lang === 'az' ? 'Sifarişi tamamla' : 'Complete Order',
    continue: lang === 'az' ? 'Davam et' : 'Continue',
    confirm: lang === 'az' ? 'Təsdiqlə' : 'Confirm',
    viewDetails: lang === 'az' ? 'Detallar' : 'Details',
    emptyCart: lang === 'az' ? 'Səbətiniz boşdur' : 'Your cart is empty',
    cartLoading: lang === 'az' ? 'Səbət yüklənir...' : 'Loading cart...',
    orderPlaced: lang === 'az' ? 'Sifarişiniz qəbul edildi!' : 'Your order was placed!',
    delivery: lang === 'az' ? 'Çatdırılma' : 'Delivery',
    pickup: lang === 'az' ? 'Ofisdən götürmə' : 'Pickup',
    cash: lang === 'az' ? 'Nağd / köçürmə' : 'Cash / transfer',
    card: lang === 'az' ? 'Kartla ödəniş' : 'Card payment',
    credit: lang === 'az' ? 'Kredit müraciəti' : 'Credit request'
  };

  const getProductImage = (product: any) =>
    Array.isArray(product?.productImage) ? product.productImage[0] : product?.productImage || '/volt-logo.png';

  const getLinePrice = (product: any) => {
    const parameters = Array.isArray(product?.productParametrs) ? product.productParametrs : [];
    const selectedParam = product.selectedPower
      ? parameters.find((item: any) => String(item?.technicalPower || '').trim() === product.selectedPower)
      : null;
    return Number(selectedParam?.amount ?? parameters[0]?.amount ?? product?.price ?? 0);
  };

  useEffect(() => {
    let cancelled = false;

    const loadCartProducts = async () => {
      setIsCartLoading(true);
      try {
        const results = await Promise.all(
          cart.map(async (item) => {
            const response = await getProductById(item.id);
            return {
              ...response.data,
              quantity: item.quantity,
              selectedPower: item.power,
            };
          })
        );
        if (!cancelled) setCartProducts(results);
      } catch (error) {
        console.error('Dashboard cart load error:', error);
        if (!cancelled) setCartProducts([]);
      } finally {
        if (!cancelled) setIsCartLoading(false);
      }
    };

    if (cart.length === 0) {
      setCartProducts([]);
      setIsCartLoading(false);
      return;
    }

    loadCartProducts();

    return () => {
      cancelled = true;
    };
  }, [cartLoadKey]);

  const handleSaveProfile = async () => {
    const updatedUser = {
      ...user,
      name: `${profileData.firstName} ${profileData.lastName}`.trim(),
      email: profileData.email,
      phone: profileData.phone,
      bankCard: profileData.bankCard,
      addresses: profileData.addresses,
      address: profileData.addresses.find(a => a.isPrimary)?.details || ''
    };

    try {
      if (user?.role === 'customer' && hasAuthToken()) {
        const response = await axiosInstance.put(API_ENDPOINTS.AUTH.CUSTOMER_ME, {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          address: updatedUser.address,
        });

        if (response.data?.success && response.data.data) {
          const apiUser = response.data.data;
          onUpdateUser({
            ...updatedUser,
            id: apiUser.id,
            name: apiUser.name,
            email: apiUser.email,
            phone: apiUser.phone,
            address: apiUser.address,
          });
        } else {
          onUpdateUser(updatedUser);
        }
      } else {
        onUpdateUser(updatedUser);
      }

      setIsEditing(false);
      showNotification(lang === 'az' ? 'Məlumatlar yeniləndi!' : 'Profile updated!');
    } catch {
      showNotification(lang === 'az' ? 'Profil yenilənmədi' : 'Profile update failed');
    }
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

 

  const subtotal = cartProducts.reduce((sum, item) => sum + getLinePrice(item) * item.quantity, 0);
  const totalQuantity = cartProducts.reduce((sum, item) => sum + item.quantity, 0);

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const primaryAddress = profileData.addresses.find(a => a.isPrimary) || profileData.addresses[0];
  const selectedOrder = orders.find(order => order.orderNumber === activeOrderId);

  const orderStatusLabel = (status: number) => {
    switch (status) {
      case 1: return 'Yeni';
      case 2: return 'Təsdiqlənir';
      case 3: return 'Ödəniş gözləyir';
      case 4: return 'İcra olunur';
      case 5: return 'Tamamlanıb';
      case 6: return 'Ləğv edilib';
      default: return 'Yeni';
    }
  };

  const paymentStatusLabel = (status: number) => {
    switch (status) {
      case 1: return 'Pending';
      case 2: return 'Provider gözləyir';
      case 3: return 'Ödənilib';
      case 4: return 'Uğursuz';
      case 5: return 'Qaytarılıb';
      case 6: return 'Tələb olunmur';
      default: return 'Pending';
    }
  };

  const orderIntentLabel = (intent: number) => {
    switch (intent) {
      case 2: return 'Qiymət sorğusu';
      case 3: return 'Stok sorğusu';
      default: return 'Sifariş';
    }
  };

  const isRequestOrder = (order: any) => order?.intent === 2 || order?.intent === 3;

  useEffect(() => {
    let cancelled = false;
    const loadOrders = async () => {
      setOrdersLoading(true);
      try {
        if (user?.role === 'customer' && hasAuthToken()) {
          const response = await axiosInstance.get(API_ENDPOINTS.ORDER.GET_MY_ORDERS);
          if (!cancelled) {
            const apiOrders = response.data?.success && Array.isArray(response.data.data) ? response.data.data : [];
            setOrders(apiOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          }
          return;
        }

        const refs = JSON.parse(localStorage.getItem('volt_recent_order_refs') || '[]');
        const safeRefs = Array.isArray(refs) ? refs : [];
        const uniqueRefs = safeRefs.filter((ref: any, index: number, arr: any[]) =>
          ref?.orderNumber && arr.findIndex((item) => item.orderNumber === ref.orderNumber) === index
        );

        const results = await Promise.all(
          uniqueRefs.map(async (ref: any) => {
            try {
              const email = ref.email || user?.email || '';
              const response = await axiosInstance.get(API_ENDPOINTS.ORDER.LOOKUP_ORDER(ref.orderNumber, email));
              return response.data?.success ? response.data.data : null;
            } catch {
              return null;
            }
          })
        );

        if (!cancelled) {
          setOrders(results.filter(Boolean).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    };

    if (activeTab === 'orders') loadOrders();
    return () => {
      cancelled = true;
    };
  }, [activeTab, user?.email]);

  const handleCheckoutAction = () => {
    onNavigate?.('checkout');
    return;
    if (checkoutStep < 3) {
      setCheckoutStep((checkoutStep + 1) as 1 | 2 | 3);
      return;
    }

    const newOrder = {
      id: `VLT-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().slice(0, 10),
      status: 'pending',
      items: totalQuantity,
      total: subtotal,
      delivery: selectedDelivery,
      payment: selectedPayment,
      address: selectedDelivery === 'delivery' ? primaryAddress?.details : 'SOLARIX / Volt.az ofisi',
      products: cartProducts.map(item => ({
        id: item.id,
        name: item.productName,
        quantity: item.quantity,
        power: item.selectedPower,
        price: getLinePrice(item),
      }))
    };

    const nextOrders = [newOrder, ...orders];
    setOrders(nextOrders);
    localStorage.setItem('volt_customer_orders', JSON.stringify(nextOrders));
    cartProducts.forEach(item => onRemoveFromCart?.(String(item.id), item.selectedPower));
    setActiveTab('orders');
    setActiveOrderId(newOrder.id);
    setCheckoutStep(1);
    showNotification(t.orderPlaced);
  };

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
              {isCartLoading ? (
                <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-xl">
                  <div className="mx-auto mb-6 h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                  <h4 className="text-lg font-black text-slate-900">{t.cartLoading}</h4>
                </div>
              ) : cartProducts.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    {cartProducts.map(item => {
                      const linePrice = getLinePrice(item);
                      return (
                      <div key={`${item.id}-${item.selectedPower || 'base'}`} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col sm:flex-row sm:items-center gap-6 shadow-sm">
                        <div className="w-20 h-20 shrink-0 rounded-2xl bg-slate-50 p-2">
                          <img src={getProductImage(item)} alt={item.productName} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="font-black text-slate-900 text-sm leading-tight">{item.productName}</h4>
                          {item.selectedPower && (
                            <div className="mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.selectedPower}</div>
                          )}
                          <div className="text-emerald-600 font-black text-sm mt-2">{linePrice.toFixed(2)} AZN</div>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl">
                          <button onClick={() => onUpdateCartQuantity?.(String(item.id), item.quantity - 1, item.selectedPower)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
                          </button>
                          <span className="text-sm font-black text-slate-900 w-4 text-center">{item.quantity}</span>
                          <button onClick={() => onUpdateCartQuantity?.(String(item.id), item.quantity + 1, item.selectedPower)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                          </button>
                        </div>
                        <button onClick={() => onRemoveFromCart?.(String(item.id), item.selectedPower)} className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    )})}
                  </div>
                  <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl h-fit">
                    <h4 className="text-lg font-black text-slate-900 mb-6">Checkout</h4>
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Məhsul sayı:</span>
                        <span className="font-bold text-slate-900">{totalQuantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Məhsullar:</span>
                        <span className="font-bold text-slate-900">{subtotal.toFixed(2)} AZN</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Çatdırılma:</span>
                        <span className="font-bold text-amber-600">Checkout-da təsdiqlənəcək</span>
                      </div>
                      <div className="pt-4 border-t border-slate-50 flex justify-between">
                        <span className="font-black text-slate-900">Cəmi:</span>
                        <span className="font-black text-emerald-600 text-lg">{subtotal.toFixed(2)} AZN</span>
                      </div>
                    </div>
                    <button onClick={handleCheckoutAction} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl shadow-emerald-600/20">
                      {t.checkout}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-xl">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-2">{t.emptyCart}</h4>
                  <p className="text-slate-400 text-sm">Alış-verişə başlamaq üçün məhsullar bölməsinə keçid edin.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-8">
              <h3 className="text-3xl font-black text-slate-900 mb-8">{t.orders}</h3>
              {ordersLoading ? (
                <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-xl">
                  <div className="mx-auto mb-6 h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                  <h4 className="text-lg font-black text-slate-900">Sifarişlər yüklənir...</h4>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-xl">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /></svg>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-2">Sifariş yoxdur</h4>
                  <p className="text-slate-400 text-sm">Səbətdən sifariş yaratdıqdan sonra burada görünəcək.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
                  <div className="space-y-4">
                    {orders.map(order => (
                  <div key={order.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isRequestOrder(order) ? 'bg-slate-100 text-slate-500' : order.status === 5 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {isRequestOrder(order) ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                          ) : order.status === 5 ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900">{order.orderNumber}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleString('az-AZ')}</div>
                          <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${isRequestOrder(order) ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {orderIntentLabel(order.intent)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-12">
                        <div className="text-right">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${order.status === 5 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {orderStatusLabel(order.status)}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isRequestOrder(order) ? 'Təxmini məbləğ' : 'Məbləğ'}</div>
                          <div className="text-sm font-black text-slate-900">{isRequestOrder(order) && Number(order.finalTotal || 0) <= 0 ? 'Təsdiqlənəcək' : `${Number(order.finalTotal).toFixed(2)} AZN`}</div>
                        </div>
                        <button onClick={() => setActiveOrderId(activeOrderId === order.orderNumber ? null : order.orderNumber)} className="text-emerald-600 hover:text-slate-900 transition-colors" aria-label={t.viewDetails}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl h-fit">
                    {selectedOrder ? (
                      <div>
                        <div className="mb-6">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.viewDetails}</div>
                          <h4 className="mt-1 text-xl font-black text-slate-900">{selectedOrder.orderNumber}</h4>
                          <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${isRequestOrder(selectedOrder) ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {orderIntentLabel(selectedOrder.intent)}
                          </span>
                        </div>
                        <div className="space-y-4 text-sm">
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-400">Çatdırılma</span>
                            <span className="font-bold text-slate-900 text-right">{selectedOrder.deliveryMethod === 2 ? t.pickup : selectedOrder.deliveryMethod === 1 ? t.delivery : 'Telefonla təsdiq'}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-400">Ödəniş</span>
                            <span className="font-bold text-slate-900 text-right">{paymentStatusLabel(selectedOrder.paymentStatus)}</span>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-4 text-xs font-bold text-slate-500 leading-relaxed">
                            {[selectedOrder.cityOrRegion, selectedOrder.district, selectedOrder.streetAndBuilding, selectedOrder.apartmentOrOffice, selectedOrder.pickupLocation].filter(Boolean).join(', ') || 'Menecer tərəfindən təsdiqlənəcək'}
                          </div>
                        </div>
                        <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
                          {selectedOrder.items?.map((product: any) => (
                            <div key={`${product.id}-${product.selectedPower || 'base'}`} className="flex justify-between gap-4 text-xs">
                              <span className="font-bold text-slate-600">{product.productName} x {product.quantity}</span>
                              <span className="font-black text-emerald-600">{Number(product.lineTotal).toFixed(2)} AZN</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <div className="text-sm font-black text-slate-900">Sifariş seçin</div>
                        <p className="mt-2 text-xs font-bold text-slate-400">Detallara baxmaq üçün ox düyməsinə klikləyin.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
