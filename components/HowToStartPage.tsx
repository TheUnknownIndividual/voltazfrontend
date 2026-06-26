
import React from 'react';

interface HowToStartPageProps {
  lang: 'az' | 'en' | 'ru' | 'tr';
  onBack: () => void;
}

const HowToStartPage: React.FC<HowToStartPageProps> = ({ lang, onBack }) => {
  const t = {
    title: lang === 'az' ? 'Necə başlamalı?' : lang === 'en' ? 'How to start?' : lang === 'ru' ? 'Как начать?' : 'Nasıl başlanır?',
    back: lang === 'az' ? 'Geri qayıt' : lang === 'en' ? 'Back' : lang === 'ru' ? 'Назад' : 'Geri',
  };

  const steps = [
  {
    title: {
      az: 'Bizimlə Əlaqə',
      en: 'Contact Us',
      ru: 'Свяжитесь с нами',
      tr: 'Bize Ulaşın'
    },
    desc: {
      az: 'İlk məsləhətləşmə üçün bizimlə əlaqə saxlayın. Elektrik sərfiyyatınızı, obyekt növünü və günəş enerjisi ilə bağlı məqsədlərinizi öyrənirik.',
      en: 'Reach out to us for an initial consultation. We will understand your electricity needs, property type, and solar goals.',
      ru: 'Обратитесь к нам для первичной консультации. Мы изучим ваше потребление электроэнергии, тип объекта и цели по установке солнечной системы.',
      tr: 'İlk danışma üçün bizimlə əlaqə saxlayın. Elektrik istehlakınızı, mülk tipinizi və günəş enerjisi hədəflərinizi öyrənirik.'
    },
    icon: '1'
  },
  {
    title: {
      az: 'Sahə Baxışı',
      en: 'Site Assessment',
      ru: 'Осмотр объекта',
      tr: 'Saha İncelemesi'
    },
    desc: {
      az: 'Komandamız əraziyə baxış keçirir, dam və ya quraşdırma sahəsini, kölgələnməni, konstruksiyanı və mümkün texniki maneələri qiymətləndirir.',
      en: 'Our team visits your location to inspect the roof or installation area, available space, shading, structure, and possible technical obstacles.',
      ru: 'Наша команда выезжает на объект, проверяет крышу или место установки, доступную площадь, затенение, конструкцию и возможные технические препятствия.',
      tr: 'Ekibimiz alanı ziyaret ederek çatı veya kurulum bölgesini, mevcut alanı, gölgelenmeyi, yapıyı ve olası teknik engelleri değerlendirir.'
    },
    icon: '2'
  },
  {
    title: {
      az: 'Layihə & Təklif',
      en: 'Design & Proposal',
      ru: 'Проект & Предложение',
      tr: 'Tasarım & Teklif'
    },
    desc: {
      az: 'Sizə uyğun günəş enerji sistemi hazırlanır: panel düzülüşü, inverter seçimi, gözlənilən istehsal, qənaət və layihə dəyəri təqdim olunur.',
      en: 'We prepare a tailored solar system design with panel layout, inverter selection, expected energy production, estimated savings, and project pricing.',
      ru: 'Мы подготавливаем индивидуальный проект солнечной системы: схему размещения панелей, подбор инвертора, ожидаемую выработку, экономию и стоимость проекта.',
      tr: 'Size özel güneş enerji sistemi tasarlanır: panel yerleşimi, inverter seçimi, beklenen üretim, tasarruf ve proje maliyeti sunulur.'
    },
    icon: '3'
  },
  {
    title: {
      az: 'Təsdiq & Sənədlər',
      en: 'Approval & Documentation',
      ru: 'Согласование & Документы',
      tr: 'Onay & Belgeler'
    },
    desc: {
      az: 'Təklif təsdiqləndikdən sonra lazımi sənədləşmə, icazələr və quraşdırmaya hazırlıq işləri həyata keçirilir.',
      en: 'Once the proposal is approved, we handle the required documentation, permissions, and preparation for installation.',
      ru: 'После утверждения предложения мы занимаемся необходимой документацией, разрешениями и подготовкой к монтажу.',
      tr: 'Teklif onaylandıktan sonra gerekli belgeler, izinler ve kurulum hazırlıkları tamamlanır.'
    },
    icon: '4'
  },
  {
    title: {
      az: 'Quraşdırma & Təhvil',
      en: 'Setup & Handoff',
      ru: 'Монтаж & Передача',
      tr: 'Kurulum & Teslim'
    },
    desc: {
      az: 'Sistem quraşdırılır, qoşulur və test edilir. Aktivləşdirmədən sonra sizə monitorinq tətbiqinə giriş verilir — burada istehsal, sərfiyyat, şəbəkədən alınan və şəbəkəyə ötürülən enerji, həmçinin ümumi sistem performansını izləyə bilərsiniz.',
      en: 'We install, connect, and test the system. After activation, we provide access to the monitoring app, where you can track production, consumption, incoming and outgoing energy, and overall system performance.',
      ru: 'Мы устанавливаем, подключаем и тестируем систему. После запуска предоставляем доступ к приложению мониторинга, где вы сможете отслеживать выработку, потребление, входящую и исходящую энергию, а также общую работу системы.',
      tr: 'Sistem kurulur, bağlantıları yapılır ve test edilir. Aktivasyondan sonra size izleme uygulamasına erişim verilir; burada üretimi, tüketimi, şebekeden alınan ve şebekeye verilen enerjiyi, ayrıca genel sistem performansını takip edebilirsiniz.'
    },
    icon: '5'
  }
];

  return (
    <div className="bg-white min-h-screen relative">
      <section className="bg-emerald-950 py-4 border-b border-emerald-900/50 sticky z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1.5 text-emerald-300/60 hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t.back}
          </button>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">{t.title}</h1>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black text-slate-900 mb-12">{t.title}</h1>
        
        <div className="grid gap-8">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-6 items-start bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-xl shrink-0">
                {step.icon}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-2">{step.title[lang]}</h3>
                <p className="text-slate-600 leading-relaxed">{step.desc[lang]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowToStartPage;
