import React from 'react';
import { ArrowRight, BookOpen, Calculator, Check, CloudSun, House, Info, Share2, Sun } from 'lucide-react';

type Language = 'az' | 'en' | 'ru' | 'tr';

interface InfoSectionProps {
  lang?: Language;
  onNavigate?: (page: any, id?: string, extra?: any) => void;
}

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
  },
} as const;

const InfoSection: React.FC<InfoSectionProps> = ({ lang = 'az', onNavigate }) => {
  const t = copy[lang] || copy.az;
  const stepIcons = [Sun, House, Share2];

  return (
    <>
    <section id="legislation" className="relative overflow-hidden bg-[#0b2b23] py-10 md:py-20">
      <div className="relative mx-auto max-w-[1440px] px-4 md:px-12">
        <div className="grid overflow-hidden rounded-2xl border border-white/10 md:rounded-[1.75rem] lg:grid-cols-2">
          <div className="flex flex-col p-5 md:p-10 lg:min-h-[680px] lg:p-12" style={{ backgroundColor: 'var(--header-surface)' }}>
            <header className="mb-6 md:mb-10">
              <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.14em] text-white md:mb-4">{t.eyebrow}</span>
              <h2 className="mb-3 max-w-2xl text-2xl font-bold leading-[1.15] tracking-tight text-white md:mb-4 md:text-[2.25rem]">{t.title}</h2>
              <p className="max-w-xl text-sm leading-6 text-slate-300 md:text-base md:leading-7">{t.intro}</p>
            </header>

            <div className="relative">
              {t.steps.map((step, index) => {
                const Icon = stepIcons[index];
                const isLast = index === t.steps.length - 1;
                return (
                  <article key={step[0]} className="relative flex gap-4 pb-6 md:gap-6 md:pb-8">
                    {!isLast && <span className="absolute left-4 top-8 h-[calc(100%-2rem)] w-px bg-white/20 md:left-5 md:top-10" />}
                    <div className="relative z-10 flex h-8 w-8 flex-none items-center justify-center rounded-full border border-white/15 bg-[#0f2a22] md:h-10 md:w-10">
                      <Icon className="h-4 w-4 text-white" strokeWidth={1.75} aria-hidden="true" />
                    </div>
                    <div className="pt-1">
                      <div className="mb-1.5 flex items-center gap-2.5">
                        <span className="font-mono text-[11px] font-medium leading-none text-white">{step[0]}</span>
                        <h3 className="text-[15px] font-semibold text-white md:text-base">{step[1]}</h3>
                      </div>
                      <p className="text-[13px] leading-5 text-slate-400 md:text-sm md:leading-6">{step[2]}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="border-t border-white/10 pt-4 md:pt-6">
              <p className="flex gap-2.5 text-[13px] leading-5 text-slate-400 md:text-sm">
                <CloudSun className="mt-0.5 h-4 w-4 flex-none text-white/40" strokeWidth={1.75} aria-hidden="true" />
                <span><span className="font-semibold text-slate-200">{t.nightTitle}</span> {t.nightText}</span>
              </p>
            </div>
          </div>

          <div className="relative flex min-h-0 items-stretch justify-center overflow-hidden p-0 md:min-h-[560px] md:items-center md:p-10 lg:min-h-[680px]">
            <img src="/benefit-card-bg.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06180f]/95 via-[#0b2b23]/80 to-[#0b2b23]/40" aria-hidden="true" />
            <aside data-cart-contrast-surface className="relative w-full max-w-none border-white/15 p-5 text-white md:max-w-md md:rounded-2xl md:border md:bg-white/10 md:p-8 md:backdrop-blur-md">
              <h3 className="mb-4 text-lg font-bold leading-tight md:mb-5 md:text-xl">{t.benefitTitle}</h3>
              <ul className="mb-5 grid gap-2.5 md:mb-6 md:gap-3">
                {t.benefits.map(benefit => (
                  <li key={benefit} className="flex gap-3 border-b border-white/15 pb-2.5 text-sm leading-5 text-white/90 last:border-0 last:pb-0">
                    <Check className="mt-0.5 h-4 w-4 flex-none text-white" strokeWidth={2.25} aria-hidden="true" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <button onClick={() => onNavigate?.('calculator')} className="group flex w-full min-h-[var(--cta-btn-h)] items-center justify-between rounded-xl bg-[var(--color-primary)] px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-[var(--primary-hover)] md:px-5 md:py-4">
                <span className="flex items-center gap-3"><Calculator className="h-4 w-4" strokeWidth={2} aria-hidden="true" />{t.primary}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </button>
            </aside>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-4 md:mt-6 md:flex-row md:items-center md:gap-5 md:pt-6">
          <p className="flex max-w-2xl gap-2.5 text-xs leading-5 text-white/50">
            <Info className="mt-0.5 h-4 w-4 flex-none text-white/40" strokeWidth={1.75} aria-hidden="true" />
            {t.note}
          </p>
          <button onClick={() => onNavigate?.('legislation', undefined, { section: 'net-metering' })} className="group flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-[var(--color-accent)]">
            <BookOpen className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            {t.secondary}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
    </>
  );
};

export default InfoSection;
