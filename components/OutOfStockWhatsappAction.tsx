import React, { useMemo, useState } from 'react';
import { logPublicWhatsappClick } from '../api/solarAnalytics';
import { STORAGE_KEYS } from '../utils/constants';
import { trackWhatsappInteraction } from '../utils/analytics';

type Language = 'az' | 'en' | 'ru' | 'tr';

type DemandProduct = {
  id?: string | number;
  name?: string;
  category?: string | number;
  subCategory?: string | number;
  brand?: string;
  variant?: string;
  requestedQuantity?: number;
  availableStock?: number;
};

type Props = {
  href: string;
  lang: Language;
  placement: string;
  product?: DemandProduct;
  products?: DemandProduct[];
  className?: string;
  children: React.ReactNode;
};

const isAzerbaijanPhone = (value: string) => /^(\+994\d{9}|0\d{9})$/.test(value.replace(/[\s()-]/g, ''));

const appendPhoneToWhatsappLink = (href: string, phone: string) => {
  const url = new URL(href, window.location.href);
  const existingMessage = url.searchParams.get('text') || '';
  url.searchParams.set('text', `${existingMessage}\nTelefon: ${phone}`.trim());
  return url.toString();
};

const copy = {
  az: {
    title: 'Telefon nömrənizi qeyd edin',
    detail: 'Stok məlumatını dəqiqləşdirib qısa zamanda sizinlə əlaqə saxlayacağıq.',
    phone: 'Telefon nömrəsi',
    continue: 'WhatsApp-da davam et',
    cancel: 'Ləğv et',
    invalid: 'Telefon nömrəsini +994 və ya 0 ilə başlayan yerli formatda yazın.',
  },
  en: {
    title: 'Enter your phone number',
    detail: 'We will confirm availability and contact you shortly.',
    phone: 'Phone number',
    continue: 'Continue on WhatsApp',
    cancel: 'Cancel',
    invalid: 'Enter a local phone number beginning with +994 or 0.',
  },
  ru: {
    title: 'Укажите номер телефона',
    detail: 'Мы уточним наличие и свяжемся с вами в ближайшее время.',
    phone: 'Номер телефона',
    continue: 'Продолжить в WhatsApp',
    cancel: 'Отмена',
    invalid: 'Введите местный номер, начинающийся с +994 или 0.',
  },
  tr: {
    title: 'Telefon numaranızı girin',
    detail: 'Stok durumunu doğrulayıp kısa süre içinde sizinle iletişime geçeceğiz.',
    phone: 'Telefon numarası',
    continue: 'WhatsApp’ta devam et',
    cancel: 'İptal',
    invalid: 'Lütfen +994 veya 0 ile başlayan yerel telefon numarası girin.',
  },
} satisfies Record<Language, Record<string, string>>;

const isSignedIn = () => {
  if (typeof window === 'undefined') return false;
  return Boolean(sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));
};

/**
 * Keeps signed-in customers on the direct WhatsApp path. Guests provide only
 * a phone number in memory before WhatsApp opens; it is never stored locally.
 */
const OutOfStockWhatsappAction: React.FC<Props> = ({ href, lang, placement, product, products, className, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const labels = copy[lang];
  const normalizedProducts = useMemo(() => products?.slice(0, 20), [products]);

  const close = () => {
    setIsOpen(false);
    setError('');
  };

  const submitGuestRequest = () => {
    const normalizedPhone = phone.replace(/[\s()-]/g, '');
    if (!isAzerbaijanPhone(normalizedPhone)) {
      setError(labels.invalid);
      return;
    }

    const targetHref = appendPhoneToWhatsappLink(href, normalizedPhone);
    const payload = {
      schemaVersion: 1,
      interactionType: 'out_of_stock_check',
      placement,
      page: { path: window.location.pathname, title: document.title.slice(0, 300) },
      linkLabel: typeof children === 'string' ? children : 'Yoxla',
      prefilledMessage: new URL(targetHref).searchParams.get('text') || undefined,
      product,
      products: normalizedProducts,
      contactPhone: normalizedPhone,
      viewport: { width: window.innerWidth, height: window.innerHeight },
    };

    trackWhatsappInteraction(payload, lang);
    void logPublicWhatsappClick(lang, payload).catch(() => undefined);
    close();
    window.open(targetHref, '_blank', 'noopener,noreferrer');
  };

  if (isSignedIn()) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-analytics-placement={placement}
        data-whatsapp-interaction="out_of_stock_check"
        data-whatsapp-language={lang}
        data-whatsapp-product-id={product?.id}
        data-whatsapp-product-name={product?.name}
        data-whatsapp-product-category={product?.category}
        data-whatsapp-product-subcategory={product?.subCategory}
        data-whatsapp-product-brand={product?.brand}
        data-whatsapp-product-variant={product?.variant}
        data-whatsapp-requested-quantity={product?.requestedQuantity}
        data-whatsapp-available-stock={product?.availableStock}
        data-whatsapp-products={normalizedProducts ? JSON.stringify(normalizedProducts) : undefined}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className={className}>
        {children}
      </button>
      {isOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 p-4"
          role="presentation"
          onClick={close}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="out-of-stock-phone-title"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="out-of-stock-phone-title" className="text-xl font-black text-slate-900">{labels.title}</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{labels.detail}</p>
            <label className="mt-5 block text-xs font-black uppercase tracking-wider text-slate-500" htmlFor="out-of-stock-phone">
              {labels.phone}
            </label>
            <input
              id="out-of-stock-phone"
              value={phone}
              inputMode="tel"
              autoComplete="tel"
              placeholder="+994 50 123 45 67"
              onChange={(event) => { setPhone(event.target.value); setError(''); }}
              onKeyDown={(event) => { if (event.key === 'Enter') submitGuestRequest(); }}
              className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 font-bold text-slate-900 outline-none transition focus:ring-4 focus:ring-emerald-500/10 ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-emerald-500'}`}
            />
            {error && <p className="mt-2 text-xs font-bold text-red-600">{error}</p>}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={close} className="rounded-xl px-4 py-3 text-sm font-black text-slate-600 hover:bg-slate-100">{labels.cancel}</button>
              <button type="button" onClick={submitGuestRequest} className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-700">{labels.continue}</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default OutOfStockWhatsappAction;
