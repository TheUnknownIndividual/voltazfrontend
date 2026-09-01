import React, { useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Plug,
  Wrench,
} from 'lucide-react';
import type { SiteLanguage } from '../utils/seoRoutes';

type Props = {
  lang: SiteLanguage;
  onNavigate: (page: any, id?: string, extra?: any) => void;
};

type Package = {
  capacityKw: number;
  priceAzn: number;
  panelCount: number;
  panelWattage: number;
  inverterModels: string[];
  recommended?: boolean;
};

type Copy = {
  title: string;
  lead: string;
  viewPackages: string;
  packagesTitle: string;
  packagesLead: string;
  packageLabel: string;
  recommended: string;
  included: string;
  panel: (count: number, wattage: number) => string;
  inverter: string;
  mounting: string;
  gridConnection: string;
  cta: string;
  faqEyebrow: string;
  faqTitle: string;
  faqLead: string;
  faq: Array<{ question: string; answer: string }>;
  whatsappClosing: string;
};

const packages: Package[] = [
  {
    capacityKw: 5,
    priceAzn: 4250,
    panelCount: 9,
    panelWattage: 650,
    inverterModels: ['Growatt MIN 5000TL-X2'],
  },
  {
    capacityKw: 10,
    priceAzn: 8500,
    panelCount: 17,
    panelWattage: 650,
    inverterModels: ['Growatt MIN 10000TL-X2', 'Growatt MOD10KTL3-X2'],
    recommended: true,
  },
  {
    capacityKw: 15,
    priceAzn: 12750,
    panelCount: 26,
    panelWattage: 650,
    inverterModels: ['Growatt MOD15KTL3-X2'],
  },
];

const copy: Record<SiteLanguage, Copy> = {
  az: {
    title: 'Gücünüzü seçin. Quraşdırmanı bizə həvalə edin.',
    lead: 'Eviniz və ya obyektiniz üçün panel, Growatt inverter, montaj konstruksiyası və şəbəkəyə qoşulmanı bir paketdə təqdim edirik.',
    viewPackages: 'Paketlərə bax',
    packagesTitle: 'Quraşdırılma paketləri',
    packagesLead: 'Uyğun gücü seçin və birbaşa WhatsApp vasitəsilə komandamızdan məlumat alın.',
    packageLabel: 'paketi',
    recommended: 'Tövsiyə olunan',
    included: 'Paketə daxildir',
    panel: (count, wattage) => `${count} × ${wattage} W günəş paneli`,
    inverter: 'İnverter',
    mounting: 'Montaj konstruksiyası',
    gridConnection: 'Şəbəkəyə qoşulma',
    cta: 'Paketlə maraqlanıram',
    faqEyebrow: 'FAQ',
    faqTitle: 'Tez-tez verilən suallar',
    faqLead: 'Paket, quraşdırma və şəbəkəyə qoşulma ilə bağlı əsas sualların cavabları.',
    faq: [
      {
        question: 'Paketin qiymətinə nələr daxildir?',
        answer: 'Hər paketə göstərilən sayda 650 W günəş panelləri, qeyd olunan Growatt inverter, montaj konstruksiyası və şəbəkəyə qoşulma daxildir. Batareya və siyahıda göstərilməyən əlavə işlər paketə daxil deyil.',
      },
      {
        question: 'Mənim üçün hansı paket uyğundur?',
        answer: 'Uyğun paket aylıq elektrik sərfiyyatınızdan, dam sahəsindən, kölgələnmədən və obyektin şəbəkə xüsusiyyətlərindən asılıdır. Komandamız obyekt məlumatlarını nəzərdən keçirərək 5, 10 və ya 15 kW paketlərdən uyğun olanı dəqiqləşdirə bilər.',
      },
      {
        question: 'Quraşdırma nə qədər vaxt aparır?',
        answer: 'Əksər yaşayış obyektlərində quraşdırma adətən 1–3 gün çəkir. Müddət damın vəziyyətinə, kabel məsafəsinə və obyektin texniki şəraitinə görə dəyişə bilər.',
      },
      {
        question: 'Şəbəkə kəsiləndə sistem işləyəcəkmi?',
        answer: 'Bu paketlərdəki standart on-grid sistem təhlükəsizlik səbəbi ilə elektrik şəbəkəsi kəsildikdə dayanır. Kəsinti zamanı ehtiyat enerji üçün ayrıca uyğun hibrid inverter və batareya həlli tələb olunur.',
      },
    ],
    whatsappClosing: 'Zəhmət olmasa, paket və növbəti addımlar barədə ətraflı məlumat verin.',
  },
  en: {
    title: 'Choose your capacity. Leave the installation to us.',
    lead: 'Get solar panels, a Growatt inverter, mounting structure, and grid connection together in one package for your home or property.',
    viewPackages: 'View packages',
    packagesTitle: 'Installation packages',
    packagesLead: 'Choose a suitable capacity and contact our team directly through WhatsApp.',
    packageLabel: 'package',
    recommended: 'Recommended',
    included: 'Included in the package',
    panel: (count, wattage) => `${count} × ${wattage} W solar panels`,
    inverter: 'Inverter',
    mounting: 'Mounting structure',
    gridConnection: 'Grid connection',
    cta: 'I am interested',
    faqEyebrow: 'FAQ',
    faqTitle: 'Frequently asked questions',
    faqLead: 'Clear answers about the packages, installation, and grid connection.',
    faq: [
      {
        question: 'What is included in the package price?',
        answer: 'Each package includes the listed number of 650 W solar panels, the specified Growatt inverter, mounting structure, and grid connection. Batteries and additional work not listed here are not included.',
      },
      {
        question: 'Which package is right for me?',
        answer: 'The right package depends on your monthly electricity use, roof area, shading, and the grid configuration at your property. Our team can review your site details and confirm whether the 5, 10, or 15 kW package is suitable.',
      },
      {
        question: 'How long does installation take?',
        answer: 'Installation at most residential properties usually takes 1–3 days. Timing can vary depending on the roof condition, cable distance, and technical conditions at the site.',
      },
      {
        question: 'Will the system work during a power cut?',
        answer: 'The standard on-grid systems in these packages shut down during a grid outage for safety. Backup power during an outage requires a separate compatible hybrid inverter and battery solution.',
      },
    ],
    whatsappClosing: 'Please share more information about this package and the next steps.',
  },
  ru: {
    title: 'Выберите мощность. Монтаж доверьте нам.',
    lead: 'Солнечные панели, инвертор Growatt, монтажная конструкция и подключение к сети — в одном пакете для вашего дома или объекта.',
    viewPackages: 'Смотреть пакеты',
    packagesTitle: 'Пакеты установки',
    packagesLead: 'Выберите подходящую мощность и свяжитесь с нашей командой напрямую через WhatsApp.',
    packageLabel: 'пакет',
    recommended: 'Рекомендуемый',
    included: 'В пакет входит',
    panel: (count, wattage) => `${count} × ${wattage} Вт солнечных панелей`,
    inverter: 'Инвертор',
    mounting: 'Монтажная конструкция',
    gridConnection: 'Подключение к сети',
    cta: 'Меня интересует пакет',
    faqEyebrow: 'FAQ',
    faqTitle: 'Часто задаваемые вопросы',
    faqLead: 'Ответы на основные вопросы о пакетах, монтаже и подключении к сети.',
    faq: [
      {
        question: 'Что входит в стоимость пакета?',
        answer: 'Каждый пакет включает указанное количество солнечных панелей мощностью 650 Вт, соответствующий инвертор Growatt, монтажную конструкцию и подключение к сети. Аккумуляторы и дополнительные работы, не указанные в списке, не входят.',
      },
      {
        question: 'Какой пакет подойдет мне?',
        answer: 'Выбор зависит от ежемесячного потребления электроэнергии, площади крыши, затенения и параметров сети на объекте. Наша команда изучит данные объекта и уточнит, какой пакет — 5, 10 или 15 кВт — вам подходит.',
      },
      {
        question: 'Сколько времени занимает установка?',
        answer: 'На большинстве жилых объектов установка обычно занимает 1–3 дня. Срок зависит от состояния крыши, расстояния кабелей и технических условий объекта.',
      },
      {
        question: 'Будет ли система работать при отключении сети?',
        answer: 'Стандартная сетевая система в этих пакетах отключается при пропадании сети из соображений безопасности. Для резервного питания нужны отдельные совместимые гибридный инвертор и аккумулятор.',
      },
    ],
    whatsappClosing: 'Пожалуйста, расскажите подробнее об этом пакете и следующих шагах.',
  },
  tr: {
    title: 'Gücünüzü seçin. Kurulumu bize bırakın.',
    lead: 'Eviniz veya tesisiniz için güneş panelleri, Growatt inverter, montaj konstrüksiyonu ve şebeke bağlantısını tek pakette sunuyoruz.',
    viewPackages: 'Paketleri incele',
    packagesTitle: 'Kurulum paketleri',
    packagesLead: 'Uygun gücü seçin ve WhatsApp üzerinden ekibimizle doğrudan iletişime geçin.',
    packageLabel: 'paketi',
    recommended: 'Önerilen',
    included: 'Pakete dahil',
    panel: (count, wattage) => `${count} × ${wattage} W güneş paneli`,
    inverter: 'İnverter',
    mounting: 'Montaj konstrüksiyonu',
    gridConnection: 'Şebeke bağlantısı',
    cta: 'Paketle ilgileniyorum',
    faqEyebrow: 'FAQ',
    faqTitle: 'Sık sorulan sorular',
    faqLead: 'Paketler, kurulum ve şebeke bağlantısı hakkında temel soruların yanıtları.',
    faq: [
      {
        question: 'Paket fiyatına neler dahildir?',
        answer: 'Her pakete belirtilen sayıda 650 W güneş paneli, ilgili Growatt inverter, montaj konstrüksiyonu ve şebeke bağlantısı dahildir. Batarya ve listede belirtilmeyen ek işler pakete dahil değildir.',
      },
      {
        question: 'Hangi paket benim için uygun?',
        answer: 'Uygun paket aylık elektrik tüketiminize, çatı alanına, gölgelenmeye ve tesisinizdeki şebeke yapısına bağlıdır. Ekibimiz tesis bilgilerinizi inceleyerek 5, 10 veya 15 kW paketlerden hangisinin uygun olduğunu netleştirebilir.',
      },
      {
        question: 'Kurulum ne kadar sürer?',
        answer: 'Çoğu konut tipi tesiste kurulum genellikle 1–3 gün sürer. Süre çatının durumuna, kablo mesafesine ve tesisin teknik koşullarına göre değişebilir.',
      },
      {
        question: 'Elektrik kesildiğinde sistem çalışır mı?',
        answer: 'Bu paketlerdeki standart şebeke bağlantılı sistem güvenlik nedeniyle şebeke kesildiğinde kapanır. Kesinti sırasında yedek enerji için ayrıca uyumlu hibrit inverter ve batarya çözümü gerekir.',
      },
    ],
    whatsappClosing: 'Lütfen bu paket ve sonraki adımlar hakkında ayrıntılı bilgi paylaşın.',
  },
};

const localeByLanguage: Record<SiteLanguage, string> = {
  az: 'az-AZ',
  en: 'en-US',
  ru: 'ru-RU',
  tr: 'tr-TR',
};

const SolarInstallationPage: React.FC<Props> = ({ lang }) => {
  const t = copy[lang];
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(() => new Set());

  const toggleFaq = (index: number) => {
    setOpenFaqs((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const buildWhatsappMessage = (item: Package) => {
    const inverterLabel = item.inverterModels.join(' / ');
    const localizedIntro = {
      az: `Salam, Volt.az saytındakı ${item.capacityKw} kW quraşdırılma paketi ilə maraqlanıram.`,
      en: `Hello, I am interested in the ${item.capacityKw} kW installation package on Volt.az.`,
      ru: `Здравствуйте, меня интересует пакет установки ${item.capacityKw} кВт на Volt.az.`,
      tr: `Merhaba, Volt.az sitesindeki ${item.capacityKw} kW kurulum paketiyle ilgileniyorum.`,
    }[lang];
    const detailLabels = {
      az: { package: 'Paket', price: 'Qiymət', panels: 'Panellər', inverter: 'İnverter' },
      en: { package: 'Package', price: 'Price', panels: 'Panels', inverter: 'Inverter' },
      ru: { package: 'Пакет', price: 'Цена', panels: 'Панели', inverter: 'Инвертор' },
      tr: { package: 'Paket', price: 'Fiyat', panels: 'Paneller', inverter: 'İnverter' },
    }[lang];

    return [
      localizedIntro,
      '',
      `${detailLabels.package}: ${item.capacityKw} kW`,
      `${detailLabels.price}: ${item.priceAzn.toLocaleString(localeByLanguage[lang])} AZN`,
      `${detailLabels.panels}: ${item.panelCount} × ${item.panelWattage} W`,
      `${detailLabels.inverter}: ${inverterLabel}`,
      '',
      t.whatsappClosing,
    ].join('\n');
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="bg-white px-4 pb-8 pt-6 md:px-12 md:pb-12 md:pt-10">
        <div className="group relative isolate mx-auto flex min-h-[38rem] max-w-7xl items-end overflow-hidden rounded-[2rem] border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.08),0_28px_70px_-42px_rgba(15,23,42,0.45)] sm:min-h-[34rem] md:items-center md:rounded-[2.5rem]">
          <picture className="absolute inset-0 -z-20">
            <source media="(max-width: 767px)" srcSet="/solar-installation-packages-mobile.webp" />
            <img
              src="/solar-installation-packages-desktop.webp"
              alt=""
              width="1942"
              height="809"
              fetchPriority="high"
              decoding="async"
              aria-hidden="true"
              className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </picture>
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/55 via-transparent to-slate-950/10 md:bg-gradient-to-r md:from-slate-950/35 md:via-transparent md:to-transparent" />

          <div className="w-full p-4 sm:p-6 md:p-10 lg:p-12">
            <div className="max-w-xl rounded-[1.5rem] border border-white/70 bg-white/95 p-6 text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.12),0_24px_60px_-28px_rgba(15,23,42,0.55)] backdrop-blur-md sm:p-8 md:rounded-[2rem] md:p-10">
              <h1 className="text-balance text-3xl font-black leading-[1.08] tracking-[-0.035em] sm:text-4xl md:text-5xl">
                {t.title}
              </h1>
              <p className="mt-5 max-w-lg text-sm font-medium leading-7 text-slate-600 md:text-base md:leading-8">
                {t.lead}
              </p>
              <a
                href="#installation-packages"
                className="mt-7 inline-flex min-h-12 touch-manipulation items-center justify-center gap-2 rounded-xl bg-[var(--color-dark)] px-5 py-3 text-[10px] font-black uppercase tracking-[0.13em] text-white transition-[background-color,color,transform] duration-150 hover:bg-[var(--color-primary)] hover:text-[var(--color-dark)] active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
              >
                {t.viewPackages}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="installation-packages" className="scroll-mt-24 bg-white px-4 pb-16 pt-12 md:px-12 md:pb-24 md:pt-16">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-9 max-w-2xl text-center md:mb-12">
            <h2 className="text-3xl font-black tracking-[-0.025em] md:text-5xl">{t.packagesTitle}</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-7 text-slate-500 md:text-base">{t.packagesLead}</p>
          </div>

          <div className="grid items-stretch gap-5 lg:grid-cols-3 lg:gap-6">
            {packages.map((item) => {
              const futurePriceAzn = Math.round(item.priceAzn * 1.12);
              const whatsappMessage = buildWhatsappMessage(item);
              const whatsappHref = `https://wa.me/994504180001?text=${encodeURIComponent(whatsappMessage)}`;
              const analyticsContext = JSON.stringify({
                source: 'solar_installation_packages',
                package: {
                  capacityKw: item.capacityKw,
                  priceAzn: item.priceAzn,
                  futurePriceAzn,
                  panelCount: item.panelCount,
                  panelWattage: item.panelWattage,
                  inverterModels: item.inverterModels,
                },
              });

              return (
                <article
                  key={item.capacityKw}
                  className={`relative flex min-w-0 flex-col overflow-hidden rounded-[1.75rem] border p-6 transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(15,23,42,0.08),0_28px_64px_-36px_rgba(51,65,85,0.48)] motion-reduce:transform-none motion-reduce:transition-none sm:p-8 ${
                    item.recommended
                      ? 'border-[color-mix(in_srgb,var(--color-primary)_48%,#cbd5e1)] bg-[color-mix(in_srgb,var(--color-primary)_4%,white)] shadow-[0_1px_2px_rgba(15,23,42,0.08),0_24px_56px_-38px_rgba(51,65,85,0.42)] hover:border-[var(--color-primary)]'
                      : 'border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_20px_48px_-38px_rgba(51,65,85,0.34)] hover:border-slate-300'
                  }`}
                >
                  {item.recommended && (
                    <div className="absolute right-5 top-5 rounded-full border border-[color-mix(in_srgb,var(--color-primary)_35%,#cbd5e1)] bg-white px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-slate-700 sm:right-7 sm:top-7">
                      {t.recommended}
                    </div>
                  )}

                  <div className={item.recommended ? 'pr-28' : ''}>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{t.packageLabel}</p>
                  </div>

                  <div className="mt-7 flex items-end justify-between gap-4 border-b border-slate-200 pb-7">
                    <h3 className="shrink-0 pb-0.5 text-3xl font-black tracking-[-0.03em] tabular-nums">
                      {item.capacityKw}<span className="whitespace-nowrap">&nbsp;kW</span>
                    </h3>
                    <div className="min-w-0 text-right">
                      <del className="text-base font-bold tabular-nums text-slate-400 decoration-red-500 decoration-2">
                        {futurePriceAzn.toLocaleString(localeByLanguage[lang])}&nbsp;AZN
                      </del>
                      <div className="mt-1 flex items-end justify-end gap-1.5">
                        <span className="text-3xl font-black tracking-[-0.04em] tabular-nums sm:text-4xl">
                        {item.priceAzn.toLocaleString(localeByLanguage[lang])}
                        </span>
                        <span className="whitespace-nowrap pb-0.5 text-[10px] font-black uppercase tracking-wider text-slate-500">AZN</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col pt-7">
                    <p className="mb-4 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">{t.included}</p>
                    <ul className="space-y-3.5">
                      <li className="flex gap-3 text-sm font-semibold leading-6 text-slate-600">
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-dark)]">
                          <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                        </span>
                        {t.panel(item.panelCount, item.panelWattage)}
                      </li>
                      <li className="flex gap-3 text-sm font-semibold leading-6 text-slate-600">
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-dark)]">
                          <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">{t.inverter}</span>
                          {item.inverterModels.map((model) => (
                            <span key={model} className="block break-words" translate="no">{model}</span>
                          ))}
                        </span>
                      </li>
                      <li className="flex gap-3 text-sm font-semibold leading-6 text-slate-600">
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-dark)]">
                          <Wrench className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
                        </span>
                        {t.mounting}
                      </li>
                      <li className="flex gap-3 text-sm font-semibold leading-6 text-slate-600">
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-dark)]">
                          <Plug className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
                        </span>
                        {t.gridConnection}
                      </li>
                    </ul>

                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-analytics-placement="solar_installation_package"
                      data-whatsapp-interaction="installation_package_quote"
                      data-whatsapp-language={lang}
                      data-whatsapp-context={analyticsContext}
                      className={`mt-8 inline-flex min-h-[var(--cta-btn-h)] touch-manipulation items-center justify-center gap-3 rounded-xl px-5 py-4 text-center text-[10px] font-black uppercase tracking-[0.13em] transition-[background-color,color,transform] duration-150 active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 ${
                        item.recommended
                          ? 'bg-[var(--color-primary)] text-[var(--color-dark)] hover:bg-[var(--color-accent)] focus-visible:ring-offset-white'
                          : 'bg-[var(--color-dark)] text-white hover:bg-[var(--color-primary)] hover:text-[var(--color-dark)] focus-visible:ring-offset-white'
                      }`}
                    >
                      <MessageCircle className="h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden="true" />
                      {t.cta}
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-white px-4 py-16 text-slate-900 md:px-12 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center md:mb-12">
            <span className="relative mx-auto block h-14 w-[4.5rem]" aria-hidden="true">
              <span className="absolute bottom-0 right-0 h-9 w-11 rounded-[0.85rem] border-2 border-slate-900 bg-white after:absolute after:-bottom-1.5 after:right-2 after:h-3 after:w-3 after:rotate-45 after:border-b-2 after:border-r-2 after:border-slate-900 after:bg-white" />
              <span className="absolute left-0 top-0 z-10 flex h-10 w-[3.4rem] items-center justify-center rounded-[0.9rem] bg-slate-900 text-[0.8rem] font-black tracking-[-0.02em] text-white after:absolute after:-bottom-1.5 after:left-2 after:h-3 after:w-3 after:rotate-45 after:bg-slate-900">
                FAQ
              </span>
            </span>
            <h2 className="mt-5 text-balance text-3xl font-black tracking-[-0.025em] md:text-4xl">{t.faqTitle}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-500">{t.faqLead}</p>
          </div>

          <div className="space-y-3">
            {t.faq.map((item, index) => {
              const isOpen = openFaqs.has(index);
              const buttonId = `installation-faq-button-${index}`;
              const panelId = `installation-faq-panel-${index}`;
              return (
                <article
                  key={item.question}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none ${isOpen ? 'border-[color-mix(in_srgb,var(--color-primary)_55%,#cbd5e1)] shadow-[0_14px_34px_-28px_rgba(15,23,42,0.4)]' : 'border-slate-200'}`}
                >
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleFaq(index)}
                    className="flex min-h-[4.5rem] w-full touch-manipulation items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium leading-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)] md:px-6 md:text-base"
                  >
                    {item.question}
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-700 transition-[background-color,color] duration-200 motion-reduce:transition-none ${isOpen ? 'bg-[var(--color-primary)] text-[var(--color-dark)]' : 'bg-slate-100'}`}>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ease-out motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} aria-hidden="true" />
                    </span>
                  </button>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="mx-5 border-t-2 border-slate-200 pb-6 pt-5 text-sm font-medium leading-7 text-slate-600 md:mx-6 md:pr-12">{item.answer}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
};

export default SolarInstallationPage;
