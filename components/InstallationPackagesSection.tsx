import React from 'react';
import { ArrowRight, Check, Plug, Wrench } from 'lucide-react';

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
    eyebrow: 'Quraşdırılma paketləri',
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
  },
  en: {
    eyebrow: 'Installation packages',
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
  },
  ru: {
    eyebrow: 'Пакеты установки',
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
  },
  tr: {
    eyebrow: 'Kurulum paketleri',
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
  },
} as const;

const InstallationPackagesSection: React.FC<InstallationPackagesSectionProps> = ({ lang = 'az', onNavigate }) => {
  const t = copy[lang] || copy.az;
  const locale = localeByLanguage[lang] || localeByLanguage.az;

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="mx-auto max-w-[1440px] px-4 md:px-12">
        <div className="overflow-hidden rounded-2xl border border-[var(--border-light)] md:rounded-[1.75rem]">
          <div className="relative h-48 w-full md:h-72">
            <img src="/installation-packages-bg.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
          </div>

          <div className="p-5 text-center md:p-10">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)] md:mb-3">{t.eyebrow}</span>
            <h3 className="mx-auto mb-3 max-w-lg text-xl font-bold leading-tight tracking-tight text-[#081510] md:mb-4 md:text-2xl">{t.title}</h3>
            <p className="mx-auto max-w-xl text-sm leading-6 text-slate-500 md:text-base md:leading-7">{t.intro}</p>

            <ul className="mt-6 grid items-stretch gap-4 text-left sm:grid-cols-3 md:mt-8">
              {installationPackages.map(pkg => {
                const futurePriceAzn = Math.round(pkg.priceAzn * 1.12);
                return (
                <li
                  key={pkg.capacityKw}
                  className={`relative flex flex-col overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${pkg.recommended ? 'border-[color-mix(in_srgb,var(--color-primary)_48%,#cbd5e1)] bg-[color-mix(in_srgb,var(--color-primary)_4%,white)]' : 'border-[var(--border-light)] hover:border-[var(--color-primary)]'}`}
                >
                  {pkg.recommended && (
                    <span className="absolute right-4 top-4 rounded-full border border-[color-mix(in_srgb,var(--color-primary)_35%,#cbd5e1)] bg-white px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-slate-700">
                      {t.recommendedLabel}
                    </span>
                  )}
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">{t.packageLabel}</span>

                  <div className="mt-3 flex items-end justify-between gap-2 border-b border-[var(--border-light)] pb-4">
                    <span className="text-2xl font-black tracking-tight text-[#081510]">{pkg.capacityKw}&nbsp;kW</span>
                    <div className="text-right">
                      <del className="block text-xs font-bold tabular-nums text-slate-400 decoration-red-500">
                        {futurePriceAzn.toLocaleString(locale)}&nbsp;AZN
                      </del>
                      <span className="text-lg font-black tabular-nums text-[#081510]">
                        {pkg.priceAzn.toLocaleString(locale)} <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">AZN</span>
                      </span>
                    </div>
                  </div>

                  <p className="mb-3 mt-4 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">{t.includedLabel}</p>
                  <ul className="space-y-2.5 text-xs leading-5 text-slate-600">
                    <li className="flex gap-2.5">
                      <span className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-md bg-[var(--color-primary)] text-white"><Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden="true" /></span>
                      {t.panelLabel(pkg.panelCount, pkg.panelWattage)}
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-md bg-[var(--color-primary)] text-white"><Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden="true" /></span>
                      <span className="min-w-0">
                        <span className="block text-[9px] font-black uppercase tracking-wide text-slate-500">{t.inverterLabel}</span>
                        {pkg.inverterModels.map(model => <span key={model} className="block break-words" translate="no">{model}</span>)}
                      </span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-md bg-[var(--color-primary)] text-white"><Wrench className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden="true" /></span>
                      {t.mountingLabel}
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-md bg-[var(--color-primary)] text-white"><Plug className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden="true" /></span>
                      {t.gridLabel}
                    </li>
                  </ul>
                </li>
              );})}
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
        </div>
      </div>
    </section>
  );
};

export default InstallationPackagesSection;
