import React, { useState,useEffect } from 'react';
import { useProduct } from "../contexts/ProductContext";
import { getProductStock, getStockWarning } from '../utils/productInventory';
import OutOfStockWhatsappAction from './OutOfStockWhatsappAction';


interface CartPageProps {
  cart: { id: string; quantity: number; power?: string }[];
  onRemoveFromCart: (id: string, power?: string) => void;
  onUpdateCartQuantity: (id: string, quantity: number, power?: string, maxStock?: number) => void;
  onBack: () => void;
  onContinueShopping?: () => void;
  onCheckout: () => void;
  lang?: 'az' | 'en' | 'ru' | 'tr';
}

const CartPage: React.FC<CartPageProps> = ({ cart, onRemoveFromCart, onUpdateCartQuantity, onBack, onContinueShopping, onCheckout, lang = 'az' }) => {
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
  } else {
    setProducts([]);
  }
}, [cart]);

const cartProducts = products.map(item => {
  const parameters = Array.isArray(item.productParametrs) ? item.productParametrs : [];
  const selectedParam = item.selectedPower
    ? parameters.find((param: any) => String(param?.technicalPower || '').trim() === item.selectedPower)
    : null;
  const price = Number(selectedParam?.amount ?? parameters[0]?.amount ?? item.price ?? 0);

  return {
    ...item,
    currentPrice: price,
    currentStock: getProductStock(item, item.selectedPower),
  };
});

const stockIssueLines = cartProducts.filter(item => item.quantity > item.currentStock);
const hasStockIssue = stockIssueLines.length > 0;
const cartStockMessage = lang === 'az'
  ? `Salam, bu məhsulların stok vəziyyətini yoxlamaq istəyirəm:\n${stockIssueLines.map((item) => `- ${item.productName}${item.selectedPower ? ` (${item.selectedPower})` : ''}: ${item.quantity} ədəd`).join('\n')}`
  : lang === 'ru'
    ? `Здравствуйте, хочу проверить наличие этих товаров:\n${stockIssueLines.map((item) => `- ${item.productName}${item.selectedPower ? ` (${item.selectedPower})` : ''}: ${item.quantity} шт.`).join('\n')}`
    : lang === 'tr'
      ? `Merhaba, bu ürünlerin stok durumunu kontrol etmek istiyorum:\n${stockIssueLines.map((item) => `- ${item.productName}${item.selectedPower ? ` (${item.selectedPower})` : ''}: ${item.quantity} adet`).join('\n')}`
      : `Hello, I would like to check availability for these products:\n${stockIssueLines.map((item) => `- ${item.productName}${item.selectedPower ? ` (${item.selectedPower})` : ''}: ${item.quantity}`).join('\n')}`;

const totalAmount = cartProducts.reduce(
  (sum, item) => sum + item.currentPrice * item.quantity,
  0
);
  const t = lang === 'az'
    ? { title: 'Səbət', empty: 'Səbətiniz boşdur', total: 'Cəmi məbləğ', checkout: 'Sifariş et', back: 'Geri qayıt', remove: 'Sil', stock: 'Stok', contact: 'Bizimlə əlaqə', continueShopping: 'Alış-verişə davam et', productCount: 'Məhsul sayı', final: 'Yekun' }
    : lang === 'ru'
      ? { title: 'Корзина', empty: 'Ваша корзина пуста', total: 'Общая сумма', checkout: 'Оформить заказ', back: 'Назад', remove: 'Удалить', stock: 'Остаток', contact: 'Связаться с нами', continueShopping: 'Продолжить покупки', productCount: 'Количество товаров', final: 'Итого' }
      : lang === 'tr'
        ? { title: 'Sepet', empty: 'Sepetiniz boş', total: 'Toplam tutar', checkout: 'Sipariş ver', back: 'Geri dön', remove: 'Sil', stock: 'Stok', contact: 'Bizimle iletişime geçin', continueShopping: 'Alışverişe devam et', productCount: 'Ürün sayısı', final: 'Toplam' }
        : { title: 'Shopping Cart', empty: 'Your cart is empty', total: 'Total amount', checkout: 'Checkout', back: 'Go back', remove: 'Remove', stock: 'Stock', contact: 'Contact us', continueShopping: 'Continue shopping', productCount: 'Product count', final: 'Total' };

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
            <button onClick={onContinueShopping || onBack} className="text-emerald-600 font-bold text-sm hover:underline">{t.continueShopping}</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {hasStockIssue && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-relaxed text-amber-800" role="alert">
                  {stockIssueLines.map((item) => (
                    <div key={`${item.id}-${item.selectedPower || 'base'}-stock-warning`}>
                      {item.productName}: {getStockWarning(lang, item.currentStock, item.quantity)}
                    </div>
                  ))}
                  <OutOfStockWhatsappAction
                    href={`https://wa.me/994504180001?text=${encodeURIComponent(cartStockMessage)}`}
                    lang={lang}
                    placement="cart_stock_warning"
                    products={stockIssueLines.map((item) => ({
                      id: item.id,
                      name: item.productName,
                      category: item.category || item.productCategoryId,
                      subCategory: item.subCategory || item.productSubCategoryId,
                      brand: item.brand,
                      variant: item.selectedPower,
                      requestedQuantity: item.quantity,
                      availableStock: item.currentStock,
                    }))}
                    className="mt-2 inline-block font-black underline underline-offset-2"
                  >{t.contact}</OutOfStockWhatsappAction>
                </div>
              )}
              {cartProducts.map((item) => (
                <div key={`${item.id}-${item.selectedPower || 'base'}`} className="bg-white p-4 sm:p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 group">
                  <div className="flex items-center gap-4 sm:contents">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-50 rounded-2xl p-2 flex items-center justify-center shrink-0">
                      <img src={item.productImage[0]} alt={item.productName} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{item.brand}</div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight mb-1 sm:mb-2 line-clamp-2 sm:truncate">
                        {item.productName}
                      </h4>
                      {item.selectedPower && (
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.selectedPower}</div>
                      )}
                      <div className="text-emerald-600 font-black text-sm">{item.currentPrice.toFixed(2)} AZN</div>
                      <div className="mt-1 text-[10px] font-bold text-slate-400">{t.stock}: {item.currentStock}</div>
                    </div>
                    <button
                      onClick={() => onRemoveFromCart(item.id, item.selectedPower)}
                      className="sm:hidden shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      aria-label={t.remove}
                      title={t.remove}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9.5 4h5a1 1 0 011 1v2H8.5V5a1 1 0 011-1z" /></svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 sm:gap-4 shrink-0">
                    <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 p-1.5 sm:p-2 rounded-xl border border-slate-100">
                      <button
                        onClick={() => onUpdateCartQuantity(item.id, item.quantity - 1, item.selectedPower, item.currentStock)}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
                      </button>
                      <input
                        type="number"
                        min={0}
                        max={item.currentStock}
                        value={item.quantity}
                        onChange={(e) => {
                          const nextValue = Number.parseInt(e.target.value, 10);
                          onUpdateCartQuantity(item.id, Number.isNaN(nextValue) ? 0 : Math.max(0, nextValue), item.selectedPower, item.currentStock);
                        }}
                        className="w-7 sm:w-10 text-center bg-transparent font-black text-slate-900 text-sm outline-none"
                      />
                      <button
                        onClick={() => onUpdateCartQuantity(item.id, item.quantity + 1, item.selectedPower, item.currentStock)}
                        disabled={item.quantity >= item.currentStock}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
                    <button
                      onClick={() => onRemoveFromCart(item.id, item.selectedPower)}
                      className="hidden sm:flex w-8 h-8 items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      aria-label={t.remove}
                      title={t.remove}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9.5 4h5a1 1 0 011 1v2H8.5V5a1 1 0 011-1z" /></svg>
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
                      <span className="text-xs font-bold text-slate-400 uppercase">{t.productCount}</span>
                      <span className="text-sm font-black text-slate-900">{cartProducts.reduce((acc, i) => acc + i.quantity, 0)}</span>
                   </div>
                   <div className="space-y-3 border-y border-slate-50 py-4">
                      {cartProducts.map((item) => (
                        <div key={`${item.id}-${item.selectedPower || 'base'}-summary`} className="rounded-2xl bg-slate-50 p-3">
                          <div className="line-clamp-2 text-[11px] font-black text-slate-900">{item.productName}</div>
                          {item.selectedPower && <div className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">{item.selectedPower}</div>}
                          <div className="mt-2 flex items-center justify-between gap-3 text-[11px] font-bold text-slate-500">
                            <span>{item.currentPrice.toFixed(2)} AZN x {item.quantity}</span>
                            <span className="font-black text-emerald-600">{(item.currentPrice * item.quantity).toFixed(2)} AZN</span>
                          </div>
                        </div>
                      ))}
                   </div>
                   <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                      <span className="text-xs font-black text-slate-900 uppercase">{t.final}</span>
                      <span className="text-2xl font-black text-emerald-600">{totalAmount.toFixed(2)} AZN</span>
                   </div>
                </div>
                <button 
                  onClick={onCheckout}
                  disabled={hasStockIssue}
                  className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
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
