import React from 'react';
import { ArrowRight, BookOpen, Calculator, Check, CircleDollarSign, CloudSun, House, Info, Sun, UtilityPole } from 'lucide-react';

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
  const icons = [Sun, House, UtilityPole];

  return (
    <section id="legislation" className="relative overflow-hidden bg-[var(--color-dark)] py-6 md:py-20">
      <img src="/solar-energy-field.webp" alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-50" aria-hidden="true" />
      <div className="absolute inset-0" style={{ backgroundColor: 'color-mix(in srgb, var(--color-dark) 55%, transparent)' }} />
      <div className="relative mx-auto max-w-[1440px] px-4 md:px-12">
        <div className="grid overflow-hidden rounded-[1.25rem] border border-white/10 shadow-xl shadow-black/10 md:rounded-[2rem] lg:grid-cols-2">
          <div className="flex flex-col p-4 md:p-10 lg:min-h-[720px] lg:p-12" style={{ backgroundColor: 'color-mix(in srgb, var(--color-dark) 95%, transparent)' }}>
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
            <aside className="w-full max-w-none rounded-b-[1.25rem] rounded-t-none bg-[var(--color-primary)] p-4 text-[var(--color-dark)] shadow-xl shadow-black/10 md:max-w-md md:rounded-[2rem] md:p-8">
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

              <button onClick={() => onNavigate?.('calculator')} className="group mt-4 flex w-full items-center justify-between rounded-xl bg-[var(--color-dark)] px-4 py-3 text-left text-[9px] font-black uppercase tracking-[0.12em] text-white transition-all hover:bg-white hover:text-[var(--color-dark)] md:mt-6 md:px-5 md:py-4 md:text-[10px]">
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
  );
};

export default InfoSection;
