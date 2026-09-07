import React from 'react';
import { ArrowRight, Check, MessageCircle, Plug, Wrench } from 'lucide-react';

type Language = 'az' | 'en' | 'ru' | 'tr';

interface InstallationPackagesSectionProps {
  lang?: Language;
  onNavigate?: (page: any, id?: string, extra?: any) => void;
}

const installationPackages = [
  { capacityKw: 5, priceAzn: 4250, panelCount: 9, panelWattage: 650, inverterModels: ['Growatt MIN 5000TL-X2'] },
  { capacityKw: 10, priceAzn: 8500, panelCount: 17, panelWattage: 650, inverterModels: ['Growatt MIN 10000TL-X2', 'Growatt MOD10KTL3-X2'], recommended: true },
  { capacityKw: 15, priceAzn: 12750, panelCount: 26, panelWattage: 650, inverterModels: ['Growatt MOD15KTL3-X2'] },
];

const localeByLanguage: Record<Language, string> = {
  az: 'az-AZ',
  en: 'en-US',
  ru: 'ru-RU',
  tr: 'tr-TR',
};

const copy = {
  az: {
    title: 'Gücünüzü seçin. Quraşdırmanı bizə həvalə edin.',
    intro: 'Eviniz və ya obyektiniz üçün panel, Growatt inverter, montaj konstruksiyası və şəbəkəyə qoşulmanı bir paketdə təqdim edirik.',
    recommendedLabel: 'Tövsiyə olunan',
    packageLabel: 'Paketi',
    includedLabel: 'Paketə daxildir',
    inverterLabel: 'İnverter',
    mountingLabel: 'Montaj konstruksiyası',
    gridLabel: 'Şəbəkəyə qoşulma',
    panelLabel: (count: number, wattage: number) => `${count} × ${wattage} W panel`,
    serviceText: 'Hər paketə panel, invertor, montaj konstruksiyası və şəbəkəyə qoşulma daxildir; aktiv istehlakçı qeydiyyatı üçün lazım olan sənədləşməni də Volt.az komandası sizin üçün idarə edir.',
    cta: 'Quraşdırma paketlərinə bax',
    interestCta: 'Paketlə maraqlanıram',
    whatsappIntro: (capacityKw: number) => `Salam, Volt.az saytındakı ${capacityKw} kW quraşdırılma paketi ilə maraqlanıram.`,
    whatsappPackage: 'Paket',
    whatsappPrice: 'Qiymət',
    whatsappPanels: 'Panellər',
    whatsappInverter: 'İnverter',
    whatsappClosing: 'Zəhmət olmasa, paket və növbəti addımlar barədə ətraflı məlumat verin.',
  },
  en: {
    title: 'Choose your capacity. Leave the installation to us.',
    intro: 'Get solar panels, a Growatt inverter, mounting structure, and grid connection together in one package for your home or property.',
    recommendedLabel: 'Recommended',
    packageLabel: 'Package',
    includedLabel: 'Included in the package',
    inverterLabel: 'Inverter',
    mountingLabel: 'Mounting structure',
    gridLabel: 'Grid connection',
    panelLabel: (count: number, wattage: number) => `${count} × ${wattage} W solar panels`,
    serviceText: 'Every package includes the panels, inverter, mounting, and grid connection; the Volt.az team also handles the documentation needed for your active consumer registration.',
    cta: 'See installation packages',
    interestCta: 'I am interested',
    whatsappIntro: (capacityKw: number) => `Hello, I am interested in the ${capacityKw} kW installation package on Volt.az.`,
    whatsappPackage: 'Package',
    whatsappPrice: 'Price',
    whatsappPanels: 'Panels',
    whatsappInverter: 'Inverter',
    whatsappClosing: 'Please share more information about this package and the next steps.',
  },
  ru: {
    title: 'Выберите мощность. Монтаж доверьте нам.',
    intro: 'Солнечные панели, инвертор Growatt, монтажная конструкция и подключение к сети — в одном пакете для вашего дома или объекта.',
    recommendedLabel: 'Рекомендуемый',
    packageLabel: 'Пакет',
    includedLabel: 'В пакет входит',
    inverterLabel: 'Инвертор',
    mountingLabel: 'Монтажная конструкция',
    gridLabel: 'Подключение к сети',
    panelLabel: (count: number, wattage: number) => `${count} × ${wattage} Вт солнечных панелей`,
    serviceText: 'В каждый пакет входят панели, инвертор, монтаж и подключение к сети; команда Volt.az также берёт на себя оформление документов для регистрации активного потребителя.',
    cta: 'Посмотреть пакеты установки',
    interestCta: 'Меня интересует пакет',
    whatsappIntro: (capacityKw: number) => `Здравствуйте, меня интересует пакет установки ${capacityKw} кВт на Volt.az.`,
    whatsappPackage: 'Пакет',
    whatsappPrice: 'Цена',
    whatsappPanels: 'Панели',
    whatsappInverter: 'Инвертор',
    whatsappClosing: 'Пожалуйста, расскажите подробнее об этом пакете и следующих шагах.',
  },
  tr: {
    title: 'Gücünüzü seçin. Kurulumu bize bırakın.',
    intro: 'Eviniz veya tesisiniz için güneş panelleri, Growatt inverter, montaj konstrüksiyonu ve şebeke bağlantısını tek pakette sunuyoruz.',
    recommendedLabel: 'Önerilen',
    packageLabel: 'Paketi',
    includedLabel: 'Pakete dahil',
    inverterLabel: 'İnverter',
    mountingLabel: 'Montaj konstrüksiyonu',
    gridLabel: 'Şebeke bağlantısı',
    panelLabel: (count: number, wattage: number) => `${count} × ${wattage} W güneş paneli`,
    serviceText: 'Her pakete paneller, inverter, montaj ve şebeke bağlantısı dahildir; Volt.az ekibi aktif tüketici kaydınız için gerekli belgeleri de sizin için yönetir.',
    cta: 'Kurulum paketlerine bakın',
    interestCta: 'Paketle ilgileniyorum',
    whatsappIntro: (capacityKw: number) => `Merhaba, Volt.az sitesindeki ${capacityKw} kW kurulum paketiyle ilgileniyorum.`,
    whatsappPackage: 'Paket',
    whatsappPrice: 'Fiyat',
    whatsappPanels: 'Paneller',
    whatsappInverter: 'İnverter',
    whatsappClosing: 'Lütfen bu paket ve sonraki adımlar hakkında ayrıntılı bilgi paylaşın.',
  },
} as const;

const InstallationPackagesSection: React.FC<InstallationPackagesSectionProps> = ({ lang = 'az', onNavigate }) => {
  const t = copy[lang] || copy.az;
  const locale = localeByLanguage[lang] || localeByLanguage.az;

  const buildWhatsappMessage = (pkg: typeof installationPackages[number]) => [
    t.whatsappIntro(pkg.capacityKw),
    '',
    `${t.whatsappPackage}: ${pkg.capacityKw} kW`,
    `${t.whatsappPrice}: ${pkg.priceAzn.toLocaleString(locale)} AZN`,
    `${t.whatsappPanels}: ${pkg.panelCount} × ${pkg.panelWattage} W`,
    `${t.whatsappInverter}: ${pkg.inverterModels.join(' / ')}`,
    '',
    t.whatsappClosing,
  ].join('\n');

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="mx-auto max-w-[1440px] px-4 md:px-12">
        <div className="mb-8 text-left md:mb-12">
          <h3 className="text-2xl font-black leading-tight tracking-tight text-[#081510] md:text-4xl md:whitespace-nowrap">{t.title}</h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 md:mt-4 md:text-base md:leading-7">{t.intro}</p>
        </div>

        <ul className="grid items-stretch gap-5 text-left lg:grid-cols-3 lg:gap-6">
          {installationPackages.map(pkg => {
            const futurePriceAzn = Math.round(pkg.priceAzn * 1.12);
            const whatsappMessage = buildWhatsappMessage(pkg);
            const whatsappHref = `https://wa.me/994504180001?text=${encodeURIComponent(whatsappMessage)}`;
            const analyticsContext = JSON.stringify({
              source: 'home_installation_packages',
              package: {
                capacityKw: pkg.capacityKw,
                priceAzn: pkg.priceAzn,
                futurePriceAzn,
                panelCount: pkg.panelCount,
                panelWattage: pkg.panelWattage,
                inverterModels: pkg.inverterModels,
              },
            });
            return (
              <li
                key={pkg.capacityKw}
                className={`relative flex min-w-0 flex-col overflow-hidden rounded-[1.75rem] border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-8 ${pkg.recommended ? 'border-[color-mix(in_srgb,var(--color-primary)_48%,#cbd5e1)] bg-[color-mix(in_srgb,var(--color-primary)_4%,white)]' : 'border-[var(--border-light)] hover:border-[var(--color-primary)]'}`}
              >
                {pkg.recommended && (
                  <span className="absolute right-5 top-5 rounded-full border border-[color-mix(in_srgb,var(--color-primary)_35%,#cbd5e1)] bg-white px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-slate-700 sm:right-7 sm:top-7">
                    {t.recommendedLabel}
                  </span>
                )}
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{t.packageLabel}</span>

                <div className="mt-7 flex items-end justify-between gap-4 border-b border-[var(--border-light)] pb-7">
                  <span className="shrink-0 text-3xl font-black tracking-[-0.03em] tabular-nums text-[#081510]">{pkg.capacityKw}&nbsp;kW</span>
                  <div className="min-w-0 text-right">
                    <del className="text-base font-bold tabular-nums text-slate-400 decoration-red-500 decoration-2">
                      {futurePriceAzn.toLocaleString(locale)}&nbsp;AZN
                    </del>
                    <div className="mt-1 flex items-end justify-end gap-1.5">
                      <span className="text-3xl font-black tracking-[-0.04em] tabular-nums text-[#081510] sm:text-4xl">
                        {pkg.priceAzn.toLocaleString(locale)}
                      </span>
                      <span className="whitespace-nowrap pb-0.5 text-[10px] font-black uppercase tracking-wider text-slate-500">AZN</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col pt-7">
                  <p className="mb-4 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">{t.includedLabel}</p>
                  <ul className="space-y-3.5">
                    <li className="flex gap-3 text-sm font-semibold leading-6 text-slate-600">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-dark)]"><Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" /></span>
                      {t.panelLabel(pkg.panelCount, pkg.panelWattage)}
                    </li>
                    <li className="flex gap-3 text-sm font-semibold leading-6 text-slate-600">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-dark)]"><Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" /></span>
                      <span className="min-w-0">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">{t.inverterLabel}</span>
                        {pkg.inverterModels.map(model => <span key={model} className="block break-words" translate="no">{model}</span>)}
                      </span>
                    </li>
                    <li className="flex gap-3 text-sm font-semibold leading-6 text-slate-600">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-dark)]"><Wrench className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" /></span>
                      {t.mountingLabel}
                    </li>
                    <li className="flex gap-3 text-sm font-semibold leading-6 text-slate-600">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-dark)]"><Plug className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" /></span>
                      {t.gridLabel}
                    </li>
                  </ul>

                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-analytics-placement="home_installation_packages"
                    data-whatsapp-interaction="installation_package_quote"
                    data-whatsapp-language={lang}
                    data-whatsapp-context={analyticsContext}
                    className={`mt-8 inline-flex min-h-[var(--cta-btn-h)] touch-manipulation items-center justify-center gap-3 rounded-xl px-5 py-4 text-center text-[10px] font-black uppercase tracking-[0.13em] transition-colors ${pkg.recommended ? 'bg-[var(--color-primary)] text-[var(--color-dark)] hover:bg-[var(--color-dark)] hover:text-white' : 'bg-[var(--color-dark)] text-white hover:bg-[var(--color-primary)] hover:text-[var(--color-dark)]'}`}
                  >
                    <MessageCircle className="h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden="true" />
                    {t.interestCta}
                  </a>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 flex flex-col items-center gap-4 border-t border-[var(--border-light)] pt-6 md:flex-row md:justify-between md:gap-10">
          <p className="flex-1 text-left text-sm leading-6 text-slate-500">{t.serviceText}</p>
          <button
            onClick={() => onNavigate?.('solar-installation')}
            className="inline-flex min-h-[var(--cta-btn-h)] flex-none items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[var(--color-primary)] px-5 py-3 text-xs font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-[var(--primary-hover)] md:px-6 md:py-4"
          >
            {t.cta}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default InstallationPackagesSection;
