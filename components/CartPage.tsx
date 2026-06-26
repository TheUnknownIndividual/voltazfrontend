import React, { useState,useEffect } from 'react';
import { useProduct } from "../contexts/ProductContext";


interface CartPageProps {
  cart: { id: string; quantity: number; power?: string }[];
  onRemoveFromCart: (id: string, power?: string) => void;
  onUpdateCartQuantity: (id: string, quantity: number, power?: string) => void;
  onBack: () => void;
  onCheckout: () => void;
  lang?: 'az' | 'en' | 'ru';
}

const CartPage: React.FC<CartPageProps> = ({ cart, onRemoveFromCart, onUpdateCartQuantity, onBack, onCheckout, lang = 'az' }) => {
   const { getProductById } = useProduct();
   const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
  const loadCartProducts = async () => {
    try {
      const results = await Promise.all(
        cart.map(async (item) => {
          const res = await getProductById(item.id);
          return {
            ...res.data,
            quantity: item.quantity,
            selectedPower: item.power,
          };
        })
      );

      setProducts(results);
    } catch (err) {
      console.error("Cart products load error:", err);
    }
  };

  if (cart.length > 0) {
    loadCartProducts();
  }
}, [cart]);

const cartProducts = products.map(item => {
  const basePrice = item.productParametrs?.[0]?.amount || 0;

  let price = basePrice;

  if (item.selectedPower && item.variants) {
    const variant = item.variants.find(
      (v: any) => v.power === item.selectedPower
    );
    if (variant) price = variant.price;
  }

  return {
    ...item,
    currentPrice: price,
  };
});

const totalAmount = cartProducts.reduce(
  (sum, item) => sum + item.currentPrice * item.quantity,
  0
);
  const t = {
    title: lang === 'az' ? 'Səbət' : lang === 'en' ? 'Shopping Cart' : 'Корзина',
    empty: lang === 'az' ? 'Səbətiniz boşdur' : 'Your cart is empty',
    total: lang === 'az' ? 'Cəmi məbləğ' : 'Total amount',
    checkout: lang === 'az' ? 'Sifariş et' : 'Checkout',
    back: lang === 'az' ? 'Geri qayıt' : 'Go back',
    remove: lang === 'az' ? 'Sil' : 'Remove'
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 relative">
      <section className="bg-emerald-950 py-4 border-b border-emerald-900/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between relative z-10">
          <button onClick={onBack} className="flex items-center gap-1.5 text-emerald-300/60 hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t.back}
          </button>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">{t.title}</h1>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 pt-12">
        {cartProducts.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{t.empty}</h3>
            <button onClick={onBack} className="text-emerald-600 font-bold text-sm hover:underline">Alış-verişə davam et</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartProducts.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6 group">
                  <div className="w-24 h-24 bg-slate-50 rounded-2xl p-2 flex items-center justify-center shrink-0">
                    <img src={item.productImage[0]} alt={item.productName} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{item.brand}</div>
                    <h4 className="text-sm font-black text-slate-900 leading-tight mb-2 truncate">
                      {item.productName} 
                    </h4>
                    <div className="text-emerald-600 font-black text-sm">{item.productParametrs?.[0]?.amount || 0} AZN</div>
                  </div>
                  <div className="flex flex-col items-end gap-4">
                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <button 
                        onClick={() => onUpdateCartQuantity(item.id, item.quantity - 1, item.selectedPower)}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
                      </button>
                      <input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => onUpdateCartQuantity(item.id, parseInt(e.target.value) || 1, item.selectedPower)}
                        className="w-10 text-center bg-transparent font-black text-slate-900 text-sm outline-none"
                      />
                      <button 
                        onClick={() => onUpdateCartQuantity(item.id, item.quantity + 1, item.selectedPower)}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
                    <button 
                      onClick={() => onRemoveFromCart(item.id, item.selectedPower)}
                      className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors"
                    >
                      {t.remove}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl sticky top-32">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">{t.total}</h3>
                <div className="space-y-4 mb-8">
                   <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase">Məhsul sayı</span>
                      <span className="text-sm font-black text-slate-900">{cartProducts.reduce((acc, i) => acc + i.quantity, 0)}</span>
                   </div>
                   <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                      <span className="text-xs font-black text-slate-900 uppercase">Yekun</span>
                      <span className="text-2xl font-black text-emerald-600">{totalAmount.toFixed(2)} AZN</span>
                   </div>
                </div>
                <button 
                  onClick={onCheckout}
                  className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
                >
                  {t.checkout}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
