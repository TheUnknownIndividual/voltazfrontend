
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useProduct } from "../contexts/ProductContext";


interface OrderPageProps {
  productId: string;
  quantity?: number;
  selectedPower?: string;
  lang?: 'az' | 'en' | 'ru';
  onBack: () => void;
  onNavigate?: (page: any, id?: string, extra?: any) => void;
}

const STORES = ["Əcəmi", "Nərimanov", "Əhmədli", "Sumqayıt Filialı"];

const CITIES = [
  "Abşeron", "Ağcabədi", "Ağdam", "Ağdaş", "Ağstafa", "Ağsu", "Astara", "Babək", "Balakən", "Bərdə", 
  "Beyləqan", "Biləsuvar", "Cəbrayıl", "Cəlilabad", "Culfa", "Daşkəsən", "Füzuli", "Gədəbəy", "Goranboy", 
  "Göyçay", "Göygöl", "Hacıqabul", "Xaçmaz", "Xızı", "Xocalı", "Xocavənd", "İmişli", "İsmayıllı", 
  "Kəlbəcər", "Kəngərli", "Kürdəmir", "Laçın", "Lerik", "Lənkəran", "Masallı", "Neftçala", "Oğuz", 
  "Ordubad", "Qax", "Qazax", "Qəbələ", "Qobustan", "Quba", "Qubadlı", "Qusar", "Saatlı", "Sabirabad", 
  "Salyan", "Samux", "Sədərək", "Siyəzən", "Şabran", "Şahbuz", "Şamaxı", "Şəki", "Şəmkir", "Şərur", 
  "Şuşa", "Tərtər", "Tovuz", "Ucar", "Yardımlı", "Yevlax", "Zaqatala", "Zəngilan", "Zərdab"
];

const OrderPage: React.FC<OrderPageProps> = ({ productId, quantity: initialQuantity = 1, selectedPower, lang = 'az', onBack, onNavigate }) => {
  const { showNotification } = useNotification();
  const { getProductById} = useProduct();
   const [product, setProduct] = useState<any>(null);

  // Find the specific variant price if power is selected
  const activeVariant = product?.variants?.find(v => v.power === selectedPower);
  const currentPrice = product?.productParametrs?.[0]?.amount || 0;

  const [currentQuantity, setCurrentQuantity] = useState(initialQuantity);
  const [step, setStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    selectedCity: '',
    city: '',
    extraInfo: '',
    deliveryMethod: 'delivery', // 'pickup' | 'delivery'
    store: 'Əcəmi',
    paymentMethod: 'cash_delivery',
    cardNumber: '',
    cvc: '',
    expiryDate: '',
    agree: false
  });

  useEffect(() => {
      const loadProduct = async () => {
        try {
          const res = await getProductById(productId);
  
          setProduct(res.data);

        } catch (err) {
          console.error(err);
        }
      };
  
      loadProduct();
    }, [productId]);

  const t = {
    title: lang === 'az' ? 'Sifarişi rəsmiləşdir' : 'Checkout',
    personalInfo: lang === 'az' ? 'Şəxsi məlumatlar' : 'Personal Information',
    firstName: lang === 'az' ? 'Ad' : 'First Name',
    lastName: lang === 'az' ? 'Soyad' : 'Last Name',
    phone: lang === 'az' ? 'Telefon nömrəsi' : 'Phone Number',
    email: 'E-mail',
    selectedCity: lang === 'az' ? 'Şəhər' : 'City',
    city: lang === 'az' ? 'Ünvan' : 'Address',
    extraInfo: lang === 'az' ? 'Əlavə məlumat' : 'Extra Information',
    extraNote: lang === 'az' ? 'Sifariş haqqında əlavə qeyd olarsa, bu xanaya daxil edin.' : 'Add extra notes about your order here.',
    deliveryMethod: lang === 'az' ? 'Məhsulu əldə etmə üsulunu seçin' : 'Delivery Method',
    pickup: lang === 'az' ? 'Mağazadan təhvil alacağam' : 'Pick up from store',
    delivery: lang === 'az' ? 'Ünvana Çatdırılsın' : 'Delivery to address',
    selectStore: lang === 'az' ? 'Təhvil alacağınız mağaza' : 'Select store',
    paymentMethod: lang === 'az' ? 'Ödəniş üsulunu seçin' : 'Payment Method',
    installments: lang === 'az' ? 'Hissə-hissə al' : 'Installments',
    taksit: lang === 'az' ? 'Taksitlə al' : 'Pay with Taksit card',
    cashDelivery: lang === 'az' ? 'Çatdırılma zamanı nağd ödə' : 'Cash on delivery',
    onlinePay: lang === 'az' ? 'Onlayn ödə' : 'Pay online now',
    cardNumber: lang === 'az' ? 'Kart nömrəsi' : 'Card Number',
    cvc: 'CVC',
    expiryDate: lang === 'az' ? 'Bitmə tarixi' : 'Expiry Date',
    agree: lang === 'az' ? 'Şərtlərlə razıyam' : 'I agree to the terms',
    cancel: lang === 'az' ? 'Ləğv et' : 'Cancel',
    continue: lang === 'az' ? 'Davam et' : 'Continue',
    completeOrder: lang === 'az' ? 'Sifarişi tamamla' : 'Complete Order',
    back: lang === 'az' ? 'Geri' : 'Back',
    productDetails: lang === 'az' ? 'Məhsul haqqında' : 'Product Details'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!formData.agree) {
        showNotification(lang === 'az' ? "Zəhmət olmasa şərtlərlə razılaşın" : "Please agree to terms", 'warning');
        return;
      }
      
      if (formData.paymentMethod === 'online_cash') {
        setStep(2);
        window.scrollTo(0, 0);
        return;
      }
    }

    const orderData = {
      id: Date.now(),
      date: new Date().toISOString(),
      productId: product.id,
      productName: product.name,
      productBrand: product.brand,
      quantity: currentQuantity,
      selectedPower: selectedPower || product.power,
      totalPrice: (currentPrice * currentQuantity).toFixed(2),
      customer: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        city: formData.selectedCity,
        address: formData.city
      },
      paymentMethod: formData.paymentMethod,
      deliveryMethod: formData.deliveryMethod,
      store: formData.deliveryMethod === 'pickup' ? formData.store : null,
      extraInfo: formData.extraInfo,
      status: 'new' // new, processing, shipped, completed, cancelled
    };

    const existingOrders = JSON.parse(localStorage.getItem('volt_orders') || '[]');
    localStorage.setItem('volt_orders', JSON.stringify([...existingOrders, orderData]));

    window.dispatchEvent(new Event('volt_data_updated'));
    setShowSuccessModal(true);
  };

  if (!product) return <div className="pt-32 text-center font-bold">Product not found</div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-20 relative">
      <section className="bg-emerald-950 py-4 border-b border-emerald-900/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between relative z-10">
          <button onClick={onBack} className="flex items-center gap-1.5 text-emerald-300/60 hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t.cancel}
          </button>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">{t.title}</h1>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {step === 1 ? (
                <>
                  {/* Payment Method Section */}
                  <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div className="space-y-4">
                      <label className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 block">{t.paymentMethod}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          {id: 'cash_delivery', label: t.cashDelivery},
                          {id: 'online_cash', label: t.onlinePay}
                        ].map(method => (
                          <button key={method.id} type="button" onClick={() => setFormData({...formData, paymentMethod: method.id})} className={`p-5 rounded-2xl border-2 text-left transition-all ${formData.paymentMethod === method.id ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                             <div className="text-[10px] font-black uppercase text-slate-900">{method.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Personal Section */}
                  <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="text-lg font-black text-slate-900 mb-8 border-b border-slate-50 pb-4">{t.personalInfo}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.firstName}</label>
                        <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.lastName}</label>
                        <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.phone}</label>
                        <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" placeholder="+994" />
                      </div>
                      {formData.paymentMethod !== 'cash_delivery' && (
                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.email}</label>
                          <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* City Section */}
                  <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.selectedCity}</label>
                        <div className="relative group">
                          <select 
                            required 
                            value={formData.selectedCity} 
                            onChange={e => setFormData({...formData, selectedCity: e.target.value})} 
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                          >
                            <option value="" disabled>{lang === 'az' ? 'Şəhər seçin' : 'Select city'}</option>
                            {CITIES.map(city => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-emerald-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.city}</label>
                        <input 
                          required 
                          type="text" 
                          value={formData.city} 
                          onChange={e => setFormData({...formData, city: e.target.value})} 
                          placeholder={lang === 'az' ? 'Ünvanı daxil edin' : 'Enter address'}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Extra Info Section */}
                  <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.extraInfo}</label>
                      <textarea 
                        required={formData.paymentMethod === 'cash_delivery'}
                        value={formData.extraInfo} 
                        onChange={e => setFormData({...formData, extraInfo: e.target.value})} 
                        maxLength={300}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all h-32 resize-none" 
                        placeholder={t.extraNote} 
                      />
                      <div className="text-right text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {formData.extraInfo.length} / 300
                      </div>
                    </div>
                  </div>

                  {/* Delivery Section */}
                  {formData.paymentMethod !== 'cash_delivery' && (
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-4">
                        <label className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 block">{t.deliveryMethod}</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <button type="button" onClick={() => setFormData({...formData, deliveryMethod: 'pickup'})} className={`p-5 rounded-2xl border-2 text-left transition-all ${formData.deliveryMethod === 'pickup' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                             <div className="text-[11px] font-black uppercase text-slate-900">{t.pickup}</div>
                          </button>
                          <button type="button" onClick={() => setFormData({...formData, deliveryMethod: 'delivery'})} className={`p-5 rounded-2xl border-2 text-left transition-all ${formData.deliveryMethod === 'delivery' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                             <div className="text-[11px] font-black uppercase text-slate-900">{t.delivery}</div>
                          </button>
                        </div>
                        
                        {formData.deliveryMethod === 'pickup' && (
                          <div className="pt-4 space-y-2 animate-in fade-in slide-in-from-top-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.selectStore}</label>
                             <select value={formData.store} onChange={e => setFormData({...formData, store: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-bold text-slate-700 outline-none">
                               {STORES.map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Agreement and Submit */}
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={formData.agree} onChange={e => setFormData({...formData, agree: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                        <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">{t.agree}</span>
                      </label>
                      <button 
                        type="button"
                        onClick={() => onNavigate?.('privacy-policy')}
                        className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-all group/info"
                        title={lang === 'az' ? 'Məxfilik siyasəti' : 'Privacy Policy'}
                      >
                        <span className="text-[10px] font-black">?</span>
                      </button>
                    </div>
                    <div className="flex gap-4">
                      <button type="button" onClick={onBack} className="flex-1 bg-slate-200 text-slate-600 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-300 transition-all active:scale-95">
                        {t.cancel}
                      </button>
                      <button type="submit" className="flex-[2] bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-emerald-600/20 active:scale-95">
                        {t.continue}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                  {/* Card Information Section */}
                  <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="text-lg font-black text-slate-900 mb-8 border-b border-slate-50 pb-4 flex items-center gap-3">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                      {lang === 'az' ? 'Kart məlumatları' : 'Card Details'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.cardNumber}</label>
                        <input 
                          required 
                          type="text" 
                          maxLength={19}
                          placeholder="0000 0000 0000 0000"
                          value={formData.cardNumber} 
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                            setFormData({...formData, cardNumber: val});
                          }} 
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-mono tracking-widest" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.expiryDate}</label>
                        <input 
                          required 
                          type="text" 
                          maxLength={5}
                          placeholder="MM/YY"
                          value={formData.expiryDate} 
                          onChange={e => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                            setFormData({...formData, expiryDate: val});
                          }} 
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.cvc}</label>
                        <input 
                          required 
                          type="text" 
                          maxLength={3}
                          placeholder="000"
                          value={formData.cvc} 
                          onChange={e => setFormData({...formData, cvc: e.target.value.replace(/\D/g, '')})} 
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 bg-slate-200 text-slate-600 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-300 transition-all active:scale-95">
                      {t.back}
                    </button>
                    <button type="submit" className="flex-[2] bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-emerald-600/20 active:scale-95">
                      {t.completeOrder}
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>

          {/* Product Summary Sidebar */}
          <div className="lg:col-span-1">
             <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl sticky top-32">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">{t.productDetails}</h3>
                <div className="flex flex-col gap-6">
                   <div className="aspect-square bg-slate-50 rounded-2xl p-4 flex items-center justify-center">
                      <img src={product.productImage[0]} className="w-full h-full object-contain" alt={product.name} />
                   </div>
                   <div>
                      <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">{product.brand}</div>
                      <h4 className="text-sm font-black text-slate-900 leading-tight mb-4">{product.productName} {selectedPower && `(${selectedPower})`}</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                           <span className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'az' ? 'Qiymət' : 'Price'}</span>
                           <span className="text-xl font-black text-emerald-600">{currentPrice} AZN</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                           <span className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'az' ? 'Say' : 'Quantity'}</span>
                           <div className="flex items-center gap-3">
                              <button 
                                type="button"
                                onClick={() => setCurrentQuantity(prev => Math.max(1, prev - 1))}
                                className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
                              </button>
                              <span className="text-lg font-black text-slate-900 w-6 text-center">{currentQuantity}</span>
                              <button 
                                type="button"
                                onClick={() => setCurrentQuantity(prev => prev + 1)}
                                className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                              </button>
                           </div>
                        </div>
                        <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                           <span className="text-[10px] font-bold text-emerald-600 uppercase">{lang === 'az' ? 'Cəmi' : 'Total'}</span>
                           <span className="text-xl font-black text-emerald-600">{(currentPrice * currentQuantity).toFixed(2)} AZN</span>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 p-10 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">
              {lang === 'az' ? 'Sifarişiniz qəbul edildi!' : 'Order Received!'}
            </h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
              {lang === 'az' 
                ? 'Təşəkkür edirik! Sifarişiniz uğurla qeydə alındı. Menecerlərimiz ən qısa zamanda sizinlə əlaqə saxlayacaqlar.' 
                : 'Thank you! Your order has been successfully registered. Our managers will contact you as soon as possible.'}
            </p>
            <button 
              onClick={onBack}
              className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
            >
              {lang === 'az' ? 'Bağla' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;
