import React from 'react';
import { ArrowRight, BookOpen, Calculator, Check, CircleDollarSign, CloudSun, House, Info, Sun, UtilityPole } from 'lucide-react';

type Language = 'az' | 'en' | 'ru' | 'tr';

interface InfoSectionProps {
  lang?: Language;
  onNavigate?: (page: any, id?: string, extra?: any) => void;
}

const installationPackages = [
  { capacityKw: 5, priceAzn: 4250, panelCount: 9, panelWattage: 650 },
  { capacityKw: 10, priceAzn: 8500, panelCount: 17, panelWattage: 650, recommended: true },
  { capacityKw: 15, priceAzn: 12750, panelCount: 26, panelWattage: 650 },
];

const localeByLanguage: Record<Language, string> = {
  az: 'az-AZ',
  en: 'en-US',
  ru: 'ru-RU',
  tr: 'tr-TR',
};

const copy = {
  az: {
    eyebrow: 'Sadə dildə günəş enerjisi',
    title: 'Gündüz öz enerjinizi istifadə edin. Artığını şəbəkəyə ötürün.',
    intro: 'Günəş paneli sistemi düşündüyünüzdən daha sadə işləyir. Eviniz əvvəlcə panellərin yaratdığı enerjidən istifadə edir, çatmayan hissə isə adi qaydada şəbəkədən gəlir.',
    steps: [
      ['01', 'Panellər enerji yaradır', 'Günəş işığı elektrik enerjisinə çevrilir. Sistem avtomatik işləyir.'],
      ['02', 'Eviniz öncə onu istifadə edir', 'Soyuducu, işıqlandırma və digər cihazlar ilk növbədə günəş enerjisi ilə işləyir.'],
      ['03', 'Artıq enerji boşa getmir', 'İstifadə etmədiyiniz enerji uyğun sistem olduqda elektrik şəbəkəsinə ötürülə bilər.'],
    ],
    nightTitle: 'Bəs axşam və buludlu havada?',
    nightText: 'Panellər kifayət qədər enerji yaratmadıqda elektrik avtomatik olaraq şəbəkədən gəlir. Siz heç nə dəyişmirsiniz.',
    benefitTitle: 'Bu sizin üçün nə deməkdir?',
    benefits: ['Aylıq elektrik xərcini azaltmaq imkanı', 'Enerjinin haradan gəldiyini aydın izləmək', 'Evin gündəlik rahatlığını dəyişmədən istifadə'],
    note: 'Nəticə evinizin enerji sərfiyyatı, dam sahəsi və qoşulma imkanından asılıdır.',
    primary: 'Evim üçün hesabla',
    secondary: 'Qaydaları sadə dildə oxu',
    consumerEyebrow: 'Quraşdırılma paketləri',
    consumerTitle: 'Gücünüzü seçin. Quraşdırmanı bizə həvalə edin.',
    consumerIntro: 'Eviniz və ya obyektiniz üçün panel, Growatt inverter, montaj konstruksiyası və şəbəkəyə qoşulmanı bir paketdə təqdim edirik.',
    consumerPackagesLabel: 'Paketlər',
    consumerRecommendedLabel: 'Tövsiyə olunan',
    consumerPanelLabel: (count: number, wattage: number) => `${count} × ${wattage} W panel`,
    consumerServiceText: 'Hər paketə panel, invertor, montaj konstruksiyası və şəbəkəyə qoşulma daxildir; aktiv istehlakçı qeydiyyatı üçün lazım olan sənədləşməni də Volt.az komandası sizin üçün idarə edir.',
    consumerCta: 'Quraşdırma paketlərinə bax',
  },
  en: {
    eyebrow: 'Solar energy, in plain language',
    title: 'Use your own energy by day. Send the extra to the grid.',
    intro: 'A home solar system is simpler than it sounds. Your home uses the electricity from the panels first, and the grid supplies anything else you need.',
    steps: [
      ['01', 'Panels produce electricity', 'Sunlight is converted into usable electricity. The system works automatically.'],
      ['02', 'Your home uses it first', 'Your fridge, lights and other appliances use solar electricity before grid electricity.'],
      ['03', 'Extra energy is not wasted', 'When your system is eligible, electricity you do not use can be sent to the public grid.'],
    ],
    nightTitle: 'What happens at night or on cloudy days?',
    nightText: 'When the panels do not produce enough, electricity comes from the grid automatically. Nothing changes in how you use your home.',
    benefitTitle: 'What does that mean for you?',
    benefits: ['A chance to reduce your monthly electricity bill', 'A clear view of the energy you produce and use', 'The same everyday comfort, with less grid use'],
    note: 'Your result depends on your energy use, available roof space and grid connection.',
    primary: 'Estimate my home',
    secondary: 'Read the rules simply',
    consumerEyebrow: 'Installation packages',
    consumerTitle: 'Choose your capacity. Leave the installation to us.',
    consumerIntro: 'Get solar panels, a Growatt inverter, mounting structure, and grid connection together in one package for your home or property.',
    consumerPackagesLabel: 'Packages',
    consumerRecommendedLabel: 'Recommended',
    consumerPanelLabel: (count: number, wattage: number) => `${count} × ${wattage} W solar panels`,
    consumerServiceText: 'Every package includes the panels, inverter, mounting, and grid connection; the Volt.az team also handles the documentation needed for your active consumer registration.',
    consumerCta: 'See installation packages',
  },
  ru: {
    eyebrow: 'Солнечная энергия простыми словами',
    title: 'Днём используйте свою энергию. Излишки передавайте в сеть.',
    intro: 'Домашняя солнечная система проще, чем кажется. Сначала дом использует энергию панелей, а недостающую электроэнергию получает из обычной сети.',
    steps: [
      ['01', 'Панели вырабатывают энергию', 'Солнечный свет превращается в электричество. Система работает автоматически.'],
      ['02', 'Дом использует её первым', 'Холодильник, освещение и другие приборы сначала используют солнечную энергию.'],
      ['03', 'Излишки не пропадают', 'Если система соответствует условиям, неиспользованную энергию можно передавать в общую сеть.'],
    ],
    nightTitle: 'А ночью или в пасмурную погоду?',
    nightText: 'Когда энергии панелей недостаточно, электричество автоматически поступает из сети. Ваш привычный быт не меняется.',
    benefitTitle: 'Что это значит для вас?',
    benefits: ['Возможность снизить ежемесячный счёт', 'Понятный контроль производства и потребления', 'Привычный комфорт при меньшем потреблении из сети'],
    note: 'Результат зависит от потребления, площади крыши и возможности подключения.',
    primary: 'Рассчитать для дома',
    secondary: 'Простое объяснение правил',
    consumerEyebrow: 'Пакеты установки',
    consumerTitle: 'Выберите мощность. Монтаж доверьте нам.',
    consumerIntro: 'Солнечные панели, инвертор Growatt, монтажная конструкция и подключение к сети — в одном пакете для вашего дома или объекта.',
    consumerPackagesLabel: 'Пакеты',
    consumerRecommendedLabel: 'Рекомендуемый',
    consumerPanelLabel: (count: number, wattage: number) => `${count} × ${wattage} Вт солнечных панелей`,
    consumerServiceText: 'В каждый пакет входят панели, инвертор, монтаж и подключение к сети; команда Volt.az также берёт на себя оформление документов для регистрации активного потребителя.',
    consumerCta: 'Посмотреть пакеты установки',
  },
  tr: {
    eyebrow: 'Basit dille güneş enerjisi',
    title: 'Gündüz kendi enerjinizi kullanın. Fazlasını şebekeye aktarın.',
    intro: 'Ev tipi güneş sistemi düşündüğünüzden daha basittir. Eviniz önce panellerin ürettiği elektriği kullanır, kalan ihtiyaç şebekeden gelir.',
    steps: [
      ['01', 'Paneller elektrik üretir', 'Güneş ışığı kullanılabilir elektriğe dönüşür. Sistem otomatik çalışır.'],
      ['02', 'Önce eviniz kullanır', 'Buzdolabı, aydınlatma ve diğer cihazlar önce güneş elektriğini kullanır.'],
      ['03', 'Fazla enerji boşa gitmez', 'Sisteminiz uygunsa kullanmadığınız enerji elektrik şebekesine aktarılabilir.'],
    ],
    nightTitle: 'Gece veya bulutlu havada ne olur?',
    nightText: 'Paneller yeterli enerji üretmediğinde elektrik otomatik olarak şebekeden gelir. Evinizi kullanma şekliniz değişmez.',
    benefitTitle: 'Bu sizin için ne anlama gelir?',
    benefits: ['Aylık elektrik faturasını azaltma imkânı', 'Üretim ve tüketimi açıkça takip etme', 'Daha az şebeke kullanımıyla aynı günlük konfor'],
    note: 'Sonuç; enerji kullanımınıza, çatı alanınıza ve bağlantı imkânına bağlıdır.',
    primary: 'Evim için hesapla',
    secondary: 'Kuralları basitçe oku',
    consumerEyebrow: 'Kurulum paketleri',
    consumerTitle: 'Gücünüzü seçin. Kurulumu bize bırakın.',
    consumerIntro: 'Eviniz veya tesisiniz için güneş panelleri, Growatt inverter, montaj konstrüksiyonu ve şebeke bağlantısını tek pakette sunuyoruz.',
    consumerPackagesLabel: 'Paketler',
    consumerRecommendedLabel: 'Önerilen',
    consumerPanelLabel: (count: number, wattage: number) => `${count} × ${wattage} W güneş paneli`,
    consumerServiceText: 'Her pakete paneller, inverter, montaj ve şebeke bağlantısı dahildir; Volt.az ekibi aktif tüketici kaydınız için gerekli belgeleri de sizin için yönetir.',
    consumerCta: 'Kurulum paketlerine bakın',
  },
} as const;

const InfoSection: React.FC<InfoSectionProps> = ({ lang = 'az', onNavigate }) => {
  const t = copy[lang] || copy.az;
  const icons = [Sun, House, UtilityPole];
  const locale = localeByLanguage[lang] || localeByLanguage.az;

  return (
    <>
    <section id="legislation" className="relative overflow-hidden bg-[var(--color-dark)] py-6 md:py-20">
      <div className="relative mx-auto max-w-[1440px] px-4 md:px-12">
        <div className="grid overflow-hidden rounded-[1.25rem] border border-white/10 shadow-xl shadow-black/10 md:rounded-[2rem] lg:grid-cols-2">
          <div className="flex flex-col p-4 md:p-10 lg:min-h-[720px] lg:p-12" style={{ backgroundColor: 'var(--header-surface)' }}>
            <header className="mb-4 md:mb-8">
              <div className="mb-3 flex items-center gap-3 md:mb-4">
                <span className="h-px w-6 bg-[var(--color-primary)] md:w-8" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">{t.eyebrow}</span>
              </div>
              <h2 className="mb-3 max-w-2xl text-xl font-black leading-tight tracking-tight text-white md:mb-4 md:text-4xl">{t.title}</h2>
              <p className="max-w-xl text-xs leading-5 text-slate-300 md:text-sm md:leading-7">{t.intro}</p>
            </header>

            <div className="border-t border-white/10">
              {t.steps.map((step, index) => {
                const Icon = icons[index];
                return (
                  <article key={step[0]} className="flex gap-3 border-b border-white/10 py-3 md:gap-5 md:py-5">
                    <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-white/10 text-[var(--color-primary)] md:h-11 md:w-11">
                      <Icon className="h-4 w-4 md:h-5 md:w-5" strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-3">
                        <span className="text-[8px] font-black tracking-[0.18em] text-[var(--color-accent)]">{step[0]}</span>
                        <h3 className="text-sm font-black text-white md:text-base">{step[1]}</h3>
                      </div>
                      <p className="text-[11px] leading-5 text-slate-400 md:text-sm">{step[2]}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="flex gap-3 pt-3 md:gap-4 md:pt-5">
              <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-white/10 text-[var(--color-primary)] md:h-11 md:w-11">
                <CloudSun className="h-4 w-4 md:h-5 md:w-5" strokeWidth={1.8} aria-hidden="true" />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-black text-white">{t.nightTitle}</h3>
                <p className="text-xs leading-5 text-slate-400">{t.nightText}</p>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 items-stretch justify-center p-0 md:min-h-[620px] md:items-center md:p-10 lg:min-h-[720px]">
            <aside data-cart-contrast-surface className="w-full max-w-none rounded-b-[1.25rem] rounded-t-none bg-[var(--color-primary)] p-4 text-[var(--color-dark)] shadow-xl shadow-black/10 md:max-w-md md:rounded-[2rem] md:p-8">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-dark)] text-[var(--color-primary)] md:mb-4 md:h-11 md:w-11">
                <CircleDollarSign className="h-4 w-4 md:h-5 md:w-5" strokeWidth={1.8} aria-hidden="true" />
              </div>
              <h3 className="mb-4 text-base font-black leading-tight md:mb-5 md:text-2xl">{t.benefitTitle}</h3>
              <ul className="grid gap-2 md:gap-3">
                {t.benefits.map(benefit => (
                  <li key={benefit} className="flex gap-2 text-xs font-medium leading-5 text-[var(--color-dark)] opacity-90 md:gap-3 md:text-sm">
                    <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--color-dark) 10%, transparent)' }}>
                      <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>

              <button onClick={() => onNavigate?.('calculator')} className="group mt-4 flex w-full min-h-[var(--cta-btn-h)] items-center justify-between rounded-lg bg-[var(--header-bg)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-[var(--primary-active)] md:mt-6 md:px-5 md:py-4">
                <span className="flex items-center gap-3"><Calculator className="h-4 w-4" strokeWidth={2} aria-hidden="true" />{t.primary}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </button>
            </aside>
          </div>
        </div>

        <div className="mt-3 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-4 md:mt-6 md:flex-row md:items-center md:gap-5 md:pt-6">
          <p className="flex max-w-2xl gap-3 text-xs leading-5 text-white/55">
            <Info className="mt-0.5 h-4 w-4 flex-none text-[var(--color-primary)]" strokeWidth={1.8} aria-hidden="true" />
            {t.note}
          </p>
          <button onClick={() => onNavigate?.('legislation', undefined, { section: 'net-metering' })} className="group flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.16em] text-[var(--color-primary)] transition-colors hover:text-white">
            <BookOpen className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
            {t.secondary}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>

    <section className="bg-white py-10 md:py-14">
      <div className="mx-auto max-w-[1440px] px-4 md:px-12">
        <div className="flex flex-col gap-6 rounded-[1.25rem] border border-[var(--border-light)] bg-[color-mix(in_srgb,var(--color-primary)_6%,white)] p-6 shadow-sm md:gap-8 md:rounded-[2rem] md:p-10">
          <div className="ml-auto max-w-2xl text-right">
            <div className="mb-3 flex flex-row-reverse items-center gap-3">
              <span className="h-px w-6 bg-[var(--color-primary)] md:w-8" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">{t.consumerEyebrow}</span>
            </div>
            <h3 className="mb-3 text-lg font-black leading-tight tracking-tight text-[#081510] md:mb-4 md:text-2xl">{t.consumerTitle}</h3>
            <p className="text-xs leading-5 text-slate-500 md:text-sm md:leading-7">{t.consumerIntro}</p>
          </div>

          <div className="border-t border-[var(--border-light)] pt-6 md:pt-8">
            <h4 className="mb-3 text-right text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-primary)] md:mb-4 md:text-xs">{t.consumerPackagesLabel}</h4>
            <ul className="grid gap-2 md:gap-3">
              {installationPackages.map(pkg => (
                <li key={pkg.capacityKw} className="flex flex-row-reverse items-center justify-between gap-3 rounded-xl border border-[var(--border-light)] bg-white/70 px-4 py-3">
                  <div className="text-right">
                    <div className="flex flex-row-reverse items-center gap-2">
                      <span className="text-base font-black text-[#081510] md:text-lg">{pkg.capacityKw}&nbsp;kW</span>
                      {pkg.recommended && (
                        <span className="rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-white">
                          {t.consumerRecommendedLabel}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{t.consumerPanelLabel(pkg.panelCount, pkg.panelWattage)}</p>
                  </div>
                  <div className="flex-none text-left">
                    <span className="text-lg font-black text-[var(--color-primary)] md:text-xl">{pkg.priceAzn.toLocaleString(locale)}</span>
                    <span className="ml-1 text-[10px] font-black uppercase tracking-wide text-slate-500">AZN</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4 border-t border-[var(--border-light)] pt-6 md:flex-row-reverse md:items-center md:justify-between md:gap-10 md:pt-8">
            <p className="max-w-2xl text-right text-xs leading-5 text-slate-500 md:text-sm md:leading-7">{t.consumerServiceText}</p>
            <button
              onClick={() => onNavigate?.('solar-installation')}
              className="inline-flex min-h-[42px] flex-none items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[var(--color-primary)] px-5 text-[10px] font-black uppercase tracking-[0.13em] text-white transition-colors duration-150 hover:bg-[var(--primary-hover)]"
            >
              <ArrowRight className="h-4 w-4 rotate-180" aria-hidden="true" />
              {t.consumerCta}
            </button>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default InfoSection;
