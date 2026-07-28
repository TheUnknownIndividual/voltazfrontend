import React from 'react';

export type CalculatorLang = 'az' | 'en' | 'ru' | 'tr';
export type AbifCreditTier = 'small' | 'medium' | 'large';

interface EligibleCreditEstimate {
  status: 'eligible';
  tier: AbifCreditTier;
  financedAmount: number;
  annualInterestRate: number;
  termMonths: number;
  graceMonths: number;
  principalRepaymentMonths: number;
  graceMonthlyPayment: number;
  firstPostGracePayment: number;
  finalPostGracePayment: number;
  principalInstallment: number;
  totalInterest: number;
  totalRepayment: number;
  freeEnergyYears: number;
}

interface BelowMinimumCreditEstimate {
  status: 'belowMinimum';
  financedAmount: number;
  minimumAmount: number;
  amountToMinimum: number;
}

interface AboveMaximumCreditEstimate {
  status: 'aboveMaximum';
  financedAmount: number;
  maximumAmount: number;
}

export type AbifCreditEstimate =
  | EligibleCreditEstimate
  | BelowMinimumCreditEstimate
  | AboveMaximumCreditEstimate;

const MINIMUM_CREDIT_AMOUNT = 5_000;
const MAXIMUM_CREDIT_AMOUNT = 10_000_000;
const ANNUAL_INTEREST_RATE = 0.05;
const SYSTEM_LIFETIME_YEARS = 25;

const CREDIT_TIERS: Array<{
  tier: AbifCreditTier;
  maximumAmount: number;
  termMonths: number;
  graceMonths: number;
}> = [
  { tier: 'small', maximumAmount: 50_000, termMonths: 60, graceMonths: 30 },
  { tier: 'medium', maximumAmount: 1_000_000, termMonths: 60, graceMonths: 30 },
  { tier: 'large', maximumAmount: MAXIMUM_CREDIT_AMOUNT, termMonths: 60, graceMonths: 30 }
];

export const calculateAbifCreditEstimate = (amount: number): AbifCreditEstimate => {
  const financedAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0;

  if (financedAmount < MINIMUM_CREDIT_AMOUNT) {
    return {
      status: 'belowMinimum',
      financedAmount,
      minimumAmount: MINIMUM_CREDIT_AMOUNT,
      amountToMinimum: MINIMUM_CREDIT_AMOUNT - financedAmount
    };
  }

  if (financedAmount > MAXIMUM_CREDIT_AMOUNT) {
    return {
      status: 'aboveMaximum',
      financedAmount,
      maximumAmount: MAXIMUM_CREDIT_AMOUNT
    };
  }

  const selectedTier = CREDIT_TIERS.find(({ maximumAmount }) => financedAmount <= maximumAmount)!;
  const monthlyInterestRate = ANNUAL_INTEREST_RATE / 12;
  const principalRepaymentMonths = selectedTier.termMonths - selectedTier.graceMonths;
  const principalInstallment = financedAmount / principalRepaymentMonths;
  const graceMonthlyPayment = financedAmount * monthlyInterestRate;
  const firstPostGracePayment = principalInstallment + financedAmount * monthlyInterestRate;
  const finalPostGracePayment = principalInstallment + principalInstallment * monthlyInterestRate;
  const repaymentBalanceSum =
    principalRepaymentMonths * financedAmount -
    principalInstallment * principalRepaymentMonths * (principalRepaymentMonths - 1) / 2;
  const totalInterest =
    graceMonthlyPayment * selectedTier.graceMonths + repaymentBalanceSum * monthlyInterestRate;

  return {
    status: 'eligible',
    tier: selectedTier.tier,
    financedAmount,
    annualInterestRate: ANNUAL_INTEREST_RATE,
    termMonths: selectedTier.termMonths,
    graceMonths: selectedTier.graceMonths,
    principalRepaymentMonths,
    graceMonthlyPayment,
    firstPostGracePayment,
    finalPostGracePayment,
    principalInstallment,
    totalInterest,
    totalRepayment: financedAmount + totalInterest,
    freeEnergyYears: SYSTEM_LIFETIME_YEARS - selectedTier.termMonths / 12
  };
};

type CreditCopy = {
  fundName: string;
  title: string;
  description: string;
  estimatedSavings: string;
  estimatedSavingsNote: string;
  amount: string;
  term: string;
  grace: string;
  rate: string;
  tierNames: Record<AbifCreditTier, string>;
  years: string;
  months: string;
  gracePayment: string;
  gracePaymentPeriod: string;
  repaymentRange: string;
  firstPayment: string;
  finalPayment: string;
  totalRepayment: string;
  totalInterest: string;
  detailsLabel: string;
  timelineTitle: string;
  graceStage: string;
  repaymentStage: string;
  freeEnergyStage: string;
  freeEnergyNote: string;
  disclaimer: string;
  cta: string;
  thresholdTitle: string;
  thresholdDescription: string;
  thresholdRemaining: string;
  aboveMaximumTitle: string;
  aboveMaximumDescription: string;
  whatsappTitle: string;
};

const COPY: Record<CalculatorLang, CreditCopy> = {
  az: {
    fundName: 'Azərbaycan Biznesinin İnkişafı Fondu',
    title: 'ABİF kredit təxmini',
    description: 'Qeyri-əhali günəş layihəniz üçün avtomatik hesablanıb.',
    estimatedSavings: 'Təxmini illik qənaət', estimatedSavingsNote: 'Elektrik xərclərindən qənaət',
    amount: 'Kredit məbləği', term: 'Kredit müddəti', grace: 'Güzəşt müddəti', rate: 'İllik faiz',
    tierNames: { small: 'Kiçik həcmli', medium: 'Orta həcmli', large: 'Böyük həcmli' },
    years: 'il', months: 'ay', gracePayment: 'İlk 30 ayda aylıq', gracePaymentPeriod: '30 aylıq güzəşt müddətində aylıq',
    repaymentRange: 'Sonrakı 30 ayda faiz + əsas borc',
    firstPayment: 'ilk', finalPayment: 'son', totalRepayment: 'Ümumi geri ödəniş',
    totalInterest: 'Ümumi faiz', detailsLabel: 'Ödəniş planına bax', timelineTitle: '25 illik təxmini dövr',
    graceStage: 'Güzəşt dövrü', repaymentStage: 'Əsas borcun ödənişi', freeEnergyStage: '“Pulsuz enerji” dövrü',
    freeEnergyNote: 'Kredit bitdikdən sonra təxmini enerji istehsalı',
    disclaimer: 'Bu sadələşdirilmiş 5 illik təxmindir: ilk 30 ay yalnız faiz, sonrakı 30 ay faiz və əsas borc ödənilir. Şərtlər dəyişə bilər; ətraflı məlumat və yekun ödəniş planı üçün bizimlə əlaqə saxlayın. Deqradasiya, texniki xidmət, şəbəkə xərcləri və avadanlıq dəyişimi daxil deyil.',
    cta: 'Kredit barədə yazın', thresholdTitle: 'ABİF krediti 5 000 AZN-dən başlayır',
    thresholdDescription: 'Qeyri-əhali layihələrində tam quraşdırma məbləği 5 000 AZN-ə çatdıqda güzəştli maliyyələşmə təxmini göstəriləcək.',
    thresholdRemaining: 'Həddə çatmaq üçün', aboveMaximumTitle: 'Məbləğ ABİF-in dərc olunmuş həddini keçir',
    aboveMaximumDescription: 'Dərc olunmuş güzəştli kredit aralığı 5 000–10 000 000 AZN-dir. Fərdi qiymətləndirmə üçün menecerimizlə əlaqə saxlayın.',
    whatsappTitle: 'ABİF kredit təxmini'
  },
  en: {
    fundName: 'Azerbaijan Business Development Fund',
    title: 'ABIF credit estimate', description: 'Calculated automatically for your non-residential solar project.',
    estimatedSavings: 'Estimated annual savings', estimatedSavingsNote: 'Savings on electricity costs', amount: 'Credit amount', term: 'Credit term', grace: 'Grace period', rate: 'Annual rate',
    tierNames: { small: 'Small-scale', medium: 'Medium-scale', large: 'Large-scale' },
    years: 'years', months: 'months', gracePayment: 'Monthly for the first 30 months', gracePaymentPeriod: 'Monthly during the 30-month grace period',
    repaymentRange: 'Next 30 months: interest + principal', firstPayment: 'first', finalPayment: 'final', totalRepayment: 'Total repayment',
    totalInterest: 'Total interest', detailsLabel: 'View payment plan', timelineTitle: 'Estimated 25-year period',
    graceStage: 'Grace period', repaymentStage: 'Principal repayment', freeEnergyStage: '“Free energy” period',
    freeEnergyNote: 'Estimated energy generation after the credit is repaid',
    disclaimer: 'This is a simplified 5-year estimate: the first 30 months are interest-only and the next 30 months include interest and principal. Terms may change; contact us for detailed information and a final payment plan.',
    cta: 'Ask about credit', thresholdTitle: 'ABIF credit starts from 5,000 AZN',
    thresholdDescription: 'For non-residential projects, a concessional financing estimate will appear when the complete installation reaches 5,000 AZN.',
    thresholdRemaining: 'Remaining to qualify', aboveMaximumTitle: 'The amount exceeds ABIF’s published range',
    aboveMaximumDescription: 'The published concessional credit range is 5,000–10,000,000 AZN. Contact our manager for an individual assessment.',
    whatsappTitle: 'ABIF credit estimate'
  },
  ru: {
    fundName: 'Азербайджанский фонд развития бизнеса',
    title: 'Расчет кредита АФРБ', description: 'Автоматический расчет для вашего нежилого солнечного проекта.',
    estimatedSavings: 'Расчетная годовая экономия', estimatedSavingsNote: 'Экономия на расходах за электроэнергию', amount: 'Сумма кредита', term: 'Срок кредита', grace: 'Льготный период', rate: 'Годовая ставка',
    tierNames: { small: 'Малый объем', medium: 'Средний объем', large: 'Крупный объем' },
    years: 'лет', months: 'мес.', gracePayment: 'Ежемесячно первые 30 мес.', gracePaymentPeriod: 'Ежемесячно в течение 30-месячного льготного периода',
    repaymentRange: 'Следующие 30 мес.: проценты + основной долг', firstPayment: 'первый', finalPayment: 'последний', totalRepayment: 'Общая выплата',
    totalInterest: 'Общие проценты', detailsLabel: 'Посмотреть график платежей', timelineTitle: 'Расчетный период 25 лет',
    graceStage: 'Льготный период', repaymentStage: 'Погашение основного долга', freeEnergyStage: 'Период «бесплатной энергии»',
    freeEnergyNote: 'Расчетная выработка энергии после погашения кредита',
    disclaimer: 'Это упрощенный расчет на 5 лет: первые 30 месяцев оплачиваются только проценты, следующие 30 — проценты и основной долг. Условия могут измениться; свяжитесь с нами для подробностей и окончательного графика.',
    cta: 'Узнать о кредите', thresholdTitle: 'Кредит начинается от 5 000 AZN',
    thresholdDescription: 'Для нежилых проектов расчет льготного финансирования появится, когда полная стоимость установки достигнет 5 000 AZN.',
    thresholdRemaining: 'До минимальной суммы', aboveMaximumTitle: 'Сумма превышает опубликованный диапазон',
    aboveMaximumDescription: 'Опубликованный диапазон льготного кредита: 5 000–10 000 000 AZN. Свяжитесь с менеджером для индивидуальной оценки.',
    whatsappTitle: 'Расчет кредита АФРБ'
  },
  tr: {
    fundName: 'Azerbaycan İş Geliştirme Fonu',
    title: 'ABİF kredi tahmini', description: 'Konut dışı güneş projeniz için otomatik hesaplandı.',
    estimatedSavings: 'Tahmini yıllık tasarruf', estimatedSavingsNote: 'Elektrik giderlerinden tasarruf', amount: 'Kredi tutarı', term: 'Kredi süresi', grace: 'Ödemesiz dönem', rate: 'Yıllık faiz',
    tierNames: { small: 'Küçük ölçekli', medium: 'Orta ölçekli', large: 'Büyük ölçekli' },
    years: 'yıl', months: 'ay', gracePayment: 'İlk 30 ay aylık', gracePaymentPeriod: '30 aylık ödemesiz dönemde aylık',
    repaymentRange: 'Sonraki 30 ay: faiz + ana para', firstPayment: 'ilk', finalPayment: 'son', totalRepayment: 'Toplam geri ödeme',
    totalInterest: 'Toplam faiz', detailsLabel: 'Ödeme planını gör', timelineTitle: 'Tahmini 25 yıllık dönem',
    graceStage: 'Ödemesiz dönem', repaymentStage: 'Ana para ödemesi', freeEnergyStage: '“Ücretsiz enerji” dönemi',
    freeEnergyNote: 'Kredi bittikten sonra tahmini enerji üretimi',
    disclaimer: 'Bu basitleştirilmiş 5 yıllık bir tahmindir: ilk 30 ay yalnızca faiz, sonraki 30 ay faiz ve ana para ödenir. Koşullar değişebilir; ayrıntılı bilgi ve nihai ödeme planı için bizimle iletişime geçin.',
    cta: 'Krediyi sorun', thresholdTitle: 'ABİF kredisi 5.000 AZN’den başlar',
    thresholdDescription: 'Konut dışı projelerde tam kurulum tutarı 5.000 AZN’ye ulaştığında avantajlı finansman tahmini gösterilir.',
    thresholdRemaining: 'Alt sınıra kalan', aboveMaximumTitle: 'Tutar yayımlanan ABİF aralığını aşıyor',
    aboveMaximumDescription: 'Yayımlanan avantajlı kredi aralığı 5.000–10.000.000 AZN’dir. Bireysel değerlendirme için yöneticimizle iletişime geçin.',
    whatsappTitle: 'ABİF kredi tahmini'
  }
};

const localeByLang: Record<CalculatorLang, string> = {
  az: 'az-AZ', en: 'en-US', ru: 'ru-RU', tr: 'tr-TR'
};

const formatAmount = (amount: number, lang: CalculatorLang) =>
  new Intl.NumberFormat(localeByLang[lang], { maximumFractionDigits: 0 }).format(Math.round(amount));

const CreditIcon = () => (
  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} d="M5 6.5h14M7.5 10.5h3M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2zM15 14.5h3" />
  </svg>
);

export const getAbifCreditWhatsappSummary = (estimate: EligibleCreditEstimate, lang: CalculatorLang) => {
  const copy = COPY[lang];
  return [
    `${copy.whatsappTitle}:`,
    `${copy.amount}: ${formatAmount(estimate.financedAmount, lang)} AZN (${copy.tierNames[estimate.tier]})`,
    `${copy.term}: ${estimate.termMonths / 12} ${copy.years}`,
    `${copy.grace}: ${estimate.graceMonths} ${copy.months}`,
    `${copy.rate}: ${(estimate.annualInterestRate * 100).toFixed(0)}%`,
    `${copy.gracePayment}: ${formatAmount(estimate.graceMonthlyPayment, lang)} AZN`,
    `${copy.repaymentRange}: ${formatAmount(estimate.firstPostGracePayment, lang)}–${formatAmount(estimate.finalPostGracePayment, lang)} AZN`,
    `${copy.totalRepayment}: ${formatAmount(estimate.totalRepayment, lang)} AZN`,
    `${copy.freeEnergyStage}: ${estimate.freeEnergyYears} ${copy.years}`
  ].join('\n');
};

interface AbifCreditEstimateCardProps {
  lang: CalculatorLang;
  estimate: AbifCreditEstimate;
  estimatedAnnualSavings: number;
  whatsappHref: string;
  onWhatsappClick: () => void;
}

const AbifCreditEstimateCard: React.FC<AbifCreditEstimateCardProps> = ({
  lang,
  estimate,
  estimatedAnnualSavings,
  whatsappHref,
  onWhatsappClick
}) => {
  const copy = COPY[lang];

  if (estimate.status === 'belowMinimum') {
    return (
      <aside className="mt-4 rounded-2xl border border-[var(--color-primary)]/40 bg-gradient-to-br from-amber-50 to-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-dark)]"><CreditIcon /></div>
          <div className="min-w-0 flex-1">
            <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">{copy.fundName}</p>
            <h4 className="mt-1 text-sm font-black leading-tight text-slate-900">{copy.thresholdTitle}</h4>
            <p className="mt-1 text-[10px] font-medium leading-relaxed text-slate-500">{copy.thresholdDescription}</p>
            <div className="mt-3 inline-flex rounded-lg border border-amber-200 bg-white px-3 py-2 text-[9px] font-bold text-slate-600">
              {copy.thresholdRemaining}: <strong className="ml-1 text-slate-900">{formatAmount(estimate.amountToMinimum, lang)} AZN</strong>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  if (estimate.status === 'aboveMaximum') {
    return (
      <aside className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-amber-900"><CreditIcon /></div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.15em] text-amber-700">{copy.fundName}</p>
            <h4 className="mt-1 text-sm font-black leading-tight text-slate-900">{copy.aboveMaximumTitle}</h4>
            <p className="mt-1 text-[10px] font-medium leading-relaxed text-slate-600">{copy.aboveMaximumDescription}</p>
          </div>
        </div>
      </aside>
    );
  }

  const termYears = estimate.termMonths / 12;
  const graceWidth = estimate.graceMonths / estimate.termMonths * 100;
  const repaymentWidth = estimate.principalRepaymentMonths / estimate.termMonths * 100;

  return (
    <aside className="mt-4 overflow-hidden rounded-2xl border border-slate-800/10 bg-[var(--color-dark)] p-4 text-white shadow-lg shadow-slate-900/10 md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-dark)]"><CreditIcon /></div>
          <div className="min-w-0">
            <h4 className="text-base font-black leading-tight">{copy.title}</h4>
            <p className="mt-0.5 text-[9px] font-medium text-white/45">{copy.fundName} · {copy.tierNames[estimate.tier]}</p>
          </div>
        </div>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onWhatsappClick}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)] px-3 py-2 text-[8px] font-black uppercase tracking-[0.1em] text-[var(--color-dark)] transition-colors hover:bg-[var(--color-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {copy.cta}
        </a>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-xl bg-[var(--color-primary)] p-3 text-[var(--color-dark)]">
          <p className="text-[7px] font-black uppercase tracking-[0.12em] opacity-60">{copy.repaymentRange}</p>
          <p className="mt-1 text-xl font-black leading-none">{formatAmount(estimate.firstPostGracePayment, lang)}–{formatAmount(estimate.finalPostGracePayment, lang)} <span className="text-[9px]">AZN</span></p>
          <p className="mt-1 text-[8px] font-bold opacity-60">{copy.firstPayment} → {copy.finalPayment}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[7px] font-black uppercase tracking-[0.12em] text-white/40">{copy.term}</p>
          <p className="mt-1 text-xl font-black leading-none">{termYears} <span className="text-[9px] text-white/45">{copy.years}</span></p>
          <p className="mt-1 text-[8px] font-bold text-white/40">{estimate.termMonths} {copy.months}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 p-3">
          <p className="text-[7px] font-black uppercase tracking-[0.12em] text-[var(--color-primary)]/70">{copy.estimatedSavings}</p>
          <p className="mt-1 text-xl font-black leading-none text-[var(--color-primary)]">{formatAmount(estimatedAnnualSavings, lang)} <span className="text-[9px]">AZN</span></p>
          <p className="mt-1 text-[8px] font-bold leading-tight text-white/40">{copy.estimatedSavingsNote}</p>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5 text-[7px] font-bold text-white/45">
        <span className="rounded-md bg-white/[0.06] px-2 py-1.5">{copy.amount}: {formatAmount(estimate.financedAmount, lang)} AZN</span>
        <span className="rounded-md bg-white/[0.06] px-2 py-1.5">{copy.grace}: {estimate.graceMonths} {copy.months}</span>
        <span className="rounded-md bg-white/[0.06] px-2 py-1.5">{copy.rate}: {(estimate.annualInterestRate * 100).toFixed(0)}%-dək</span>
      </div>

      <details className="group mt-3 rounded-xl border border-white/10 bg-black/10">
        <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-[8px] font-black uppercase tracking-[0.1em] text-white/65 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]">
          {copy.detailsLabel}
          <svg aria-hidden="true" className="h-3.5 w-3.5 rotate-180 transition-transform duration-300 ease-out group-open:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
        </summary>
        <div className="border-t border-white/10 px-3 pb-3 pt-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div><p className="text-[7px] font-black uppercase tracking-wider text-white/35">{copy.gracePaymentPeriod}</p><p className="mt-1 text-xs font-black">{formatAmount(estimate.graceMonthlyPayment, lang)} AZN</p></div>
            <div><p className="text-[7px] font-black uppercase tracking-wider text-white/35">{copy.totalRepayment}</p><p className="mt-1 text-xs font-black">{formatAmount(estimate.totalRepayment, lang)} AZN</p></div>
            <div><p className="text-[7px] font-black uppercase tracking-wider text-white/35">{copy.totalInterest}</p><p className="mt-1 text-xs font-black">{formatAmount(estimate.totalInterest, lang)} AZN</p></div>
          </div>

          <div className="mt-4">
            <p className="text-[7px] font-black uppercase tracking-wider text-white/35">{copy.timelineTitle}</p>
            <div className="mt-2 flex h-2 overflow-hidden rounded-sm bg-white/10" aria-hidden="true">
              <span className="bg-[var(--color-primary)]" style={{ width: `${graceWidth * termYears / SYSTEM_LIFETIME_YEARS}%` }} />
              <span className="bg-amber-200/70" style={{ width: `${repaymentWidth * termYears / SYSTEM_LIFETIME_YEARS}%` }} />
              <span className="flex-1 bg-white/20" />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-[7px] font-bold leading-tight text-white/45">
              <span>{copy.graceStage}<strong className="mt-0.5 block text-white">{estimate.graceMonths} {copy.months}</strong></span>
              <span>{copy.repaymentStage}<strong className="mt-0.5 block text-white">{estimate.principalRepaymentMonths} {copy.months}</strong></span>
              <span>{copy.freeEnergyStage}<strong className="mt-0.5 block text-[var(--color-primary)]">{estimate.freeEnergyYears} {copy.years}</strong></span>
            </div>
          </div>

          <p className="mt-4 border-t border-white/10 pt-3 text-[7px] font-medium leading-relaxed text-white/35">{copy.disclaimer}</p>
        </div>
      </details>
    </aside>
  );
};

export default AbifCreditEstimateCard;
