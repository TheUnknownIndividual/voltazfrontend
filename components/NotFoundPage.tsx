import React from 'react';
import type { SiteLanguage } from '../utils/seoRoutes';

const messages = {
  az: ['Səhifə tapılmadı', 'Axtardığınız ünvan mövcud deyil və ya dəyişdirilib.', 'Ana səhifəyə qayıt'],
  en: ['Page not found', 'The address you requested does not exist or has moved.', 'Return home'],
  ru: ['Страница не найдена', 'Запрошенный адрес не существует или был изменен.', 'На главную'],
  tr: ['Sayfa bulunamadı', 'Aradığınız adres mevcut değil veya değiştirilmiş.', 'Ana sayfaya dön'],
} as const;

const NotFoundPage: React.FC<{ lang: SiteLanguage; onHome: () => void }> = ({ lang, onHome }) => {
  const [title, text, action] = messages[lang];
  return (
    <section className="min-h-[65vh] flex items-center justify-center px-5 bg-slate-50">
      <div className="max-w-xl text-center">
        <p className="text-7xl font-black text-[var(--primary)]">404</p>
        <h1 className="mt-5 text-3xl md:text-4xl font-black text-[#132b27]">{title}</h1>
        <p className="mt-4 text-slate-600">{text}</p>
        <button onClick={onHome} className="mt-8 inline-flex min-h-[var(--cta-btn-h)] items-center justify-center rounded-xl bg-[#132b27] px-6 py-4 text-xs font-black uppercase tracking-wider text-white">{action}</button>
      </div>
    </section>
  );
};

export default NotFoundPage;
