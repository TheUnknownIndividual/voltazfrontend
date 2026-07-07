import React from 'react';

type Lang = 'az' | 'en' | 'ru' | 'tr';

interface PurchaseTermsProps {
  lang?: Lang;
  onBack: () => void;
}

const text = {
  title: {
    az: 'Alış şərtləri',
    en: 'Purchase Terms',
    ru: 'Условия покупки',
    tr: 'Satın Alma Şartları',
  },
  back: {
    az: 'Geri qayıt',
    en: 'Back',
    ru: 'Назад',
    tr: 'Geri',
  },
  body: {
    az: 'Bu səhifədə VOLT.AZ məhsullarının alışı, ödənişi, çatdırılması və qaytarılması ilə bağlı şərtlər yerləşdiriləcək. Hazırda məzmun hazırlanır.',
    en: 'This page will contain the purchase, payment, delivery, and return terms for VOLT.AZ products. The content is currently being prepared.',
    ru: 'На этой странице будут размещены условия покупки, оплаты, доставки и возврата товаров VOLT.AZ. Содержание сейчас готовится.',
    tr: 'Bu sayfada VOLT.AZ ürünlerinin satın alma, ödeme, teslimat ve iade şartları yer alacak. İçerik şu anda hazırlanıyor.',
  },
};

const PurchaseTerms: React.FC<PurchaseTermsProps> = ({ lang = 'az', onBack }) => (
  <div className="bg-white min-h-screen relative">
    <section className="bg-emerald-950 py-4 border-b border-emerald-900/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between relative z-10">
        <button onClick={onBack} className="flex items-center gap-1.5 text-emerald-300/60 hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {text.back[lang]}
        </button>
        <h1 className="text-sm font-black text-white uppercase tracking-widest">{text.title[lang]}</h1>
      </div>
    </section>

    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">{text.title[lang]}</h1>
      <p className="text-slate-600 text-sm md:text-base leading-relaxed">{text.body[lang]}</p>
    </main>
  </div>
);

export default PurchaseTerms;
