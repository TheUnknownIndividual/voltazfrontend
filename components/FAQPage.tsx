
import React from 'react';

interface FAQPageProps {
  lang: 'az' | 'en' | 'ru' | 'tr';
  onBack: () => void;
  onNavigate: (page: any, id?: string, extra?: any) => void;
}

const FAQPage: React.FC<FAQPageProps> = ({ lang, onBack , onNavigate}) => {

  const t = {
  title: {
    az: 'Tez-tez verilən suallar',
    en: 'Frequently Asked Questions',
    ru: 'Часто задаваемые вопросы',
    tr: 'Sıkça Sorulan Sorular'
  }[lang],

  back: {
    az: 'Geri qayıt',
    en: 'Back',
    ru: 'Назад',
    tr: 'Geri Dön'
  }[lang],
};

const faqs = [
  {
    q: {
      az: 'Günəş panelləri necə işləyir?',
      en: 'How do solar panels work?',
      ru: 'Как работают солнечные панели?',
      tr: 'Güneş panelleri nasıl çalışır?'
    }[lang],
    a: {
      az: `Günəş panelləri günəş işığını elektrik enerjisinə çevirir. İnverter isə bu enerjini evdə və ya obyektdə istifadə üçün uyğun formaya çevirir. Bu sistem elektrik xərclərini azaltmağa və təmiz enerjidən daha səmərəli istifadə etməyə kömək edir.`,
       en: 'Solar panels convert sunlight into electricity. The inverter then converts this electricity into a form that can be used in your home or business. The system can help reduce your electricity bills and make better use of clean energy.',
      ru: `Солнечные панели преобразуют солнечный свет в электрическую энергию. Инвертор затем преобразует эту энергию в форму, подходящую для использования в доме или на объекте. Такая система помогает снизить расходы на электричество и использовать чистую энергию более эффективно.`,
      tr: 'Güneş panelleri güneş ışığını elektrik enerjisine dönüştürür. İnverter ise bu elektriği evinizde veya işletmenizde kullanılabilecek uygun forma çevirir. Bu sistem elektrik giderlerini azaltmaya ve temiz enerjiden daha verimli yararlanmaya yardımcı olur.'
    }[lang]
  },
  {
    q: {
      az: 'Günəş enerjisi sistemi nələrdən ibarətdir?',
      en: 'What does a solar energy system include?',
      ru: 'Из чего состоит солнечная энергетическая система?',
      tr: 'Güneş enerji sistemi nelerden oluşur?'
    }[lang],
    a: {
      az: `Günəş enerji sistemi adətən panellər, inverter, montaj konstruksiyası, kabellər, qoruyucu avadanlıqlar, elektrik lövhələri və monitorinq sistemindən ibarət olur. Dəqiq komplektasiya dam növü, boş sahə, kölgələnmə, elektrik sərfiyyatı, qoşulma tipi və layihənin ölçüsündən asılıdır.
Qısa izah videomuza buradan baxa bilərsiniz: Günəş sistemi haqqında video.
`, en: `A solar system usually includes solar panels, inverter, mounting structure, cables, protection equipment, electrical panels, and a monitoring system. The exact setup depends on roof type, available space, shading, electricity usage, connection type, and project size.
You can also watch our short explanation here: Solar system explanation video.`,
      ru: `Обычно система состоит из солнечных панелей, инвертора, монтажной конструкции, кабелей, защитного оборудования, электрических щитов и системы мониторинга. Точная комплектация зависит от типа крыши, доступной площади, затенения, потребления электроэнергии, типа подключения и размера проекта.
Краткое объяснение можно посмотреть здесь: видео о солнечной системе.`,
tr: `Güneş enerji sistemi genellikle güneş panelleri, inverter, montaj konstrüksiyonu, kablolar, koruma ekipmanları, elektrik panoları ve izleme sisteminden oluşur. Tam sistem yapısı çatı tipi, mevcut alan, gölgelenme, elektrik tüketimi, bağlantı tipi ve proje büyüklüğüne göre değişir.
Kısa açıklama videomuzu buradan izleyebilirsiniz: güneş sistemi açıklama videosu.`}[lang]
  },
  {
    q: {
      az: '1 kW günəş sistemi neçəyə başa gəlir?',
      en: 'How much does 1 kW of solar cost?',
      ru: 'Сколько стоит 1 kW солнечной системы?',
      tr: '1 kW güneş sistemi ne kadar tutar?'
    }[lang],
a: {
  az: (
    <>
      Ümumi hesabla 1 kW günəş enerji sisteminin qiyməti təxminən 1000 AZN-dən başlaya bilər. Lakin yekun qiymət panel və inverter markası, dam növü, montajın çətinliyi, kabel məsafəsi, elektrik lövhəsinin vəziyyəti, sənədləşmə tələbləri, sistemin gücü və quraşdırma şəraitindən asılıdır.{" "}

      <span
        onClick={() => onNavigate("calculator")}
        className="text-[var(--color-primary)] underline cursor-pointer font-bold hover:text-[var(--color-dark)] transition-colors"
      >
        Hesabla
      </span>{" "}

      bölməsinə keçərək kalkulyatorumuzdan istifadə edə bilərsiniz.
    </>
  ),

  en: (
    <>
      As a general estimate, 1 kW of solar system capacity may start from around 1000 AZN. However, the final price depends on panel and inverter brand, roof type, mounting complexity, cable distance, electrical panel condition, documentation requirements, system size, and installation conditions.{" "}

      <span
        onClick={() => onNavigate("calculator")}
        className="text-[var(--color-primary)] underline cursor-pointer font-bold hover:text-[var(--color-dark)] transition-colors"
      >
        Calculate
      </span>{" "}

      to use our solar calculator.
    </>
  ),

  ru: (
    <>
      В среднем стоимость 1 kW солнечной системы может начинаться примерно от 1000 AZN. Но итоговая цена зависит от бренда панелей и инвертора, типа крыши, сложности монтажа, расстояния кабелей, состояния электрического щита, требований к документации, мощности системы и условий установки.{" "}

      <span
        onClick={() => onNavigate("calculator")}
        className="text-[var(--color-primary)] underline cursor-pointer font-bold hover:text-[var(--color-dark)] transition-colors"
      >
        Рассчитать
      </span>{" "}

      чтобы использовать калькулятор солнечной системы.
    </>
  ),

  tr: (
    <>
      Genel olarak 1 kW güneş enerji sistemi yaklaşık 1000 AZN’den başlayabilir. Ancak nihai fiyat panel ve inverter markası, çatı tipi, montaj zorluğu, kablo mesafesi, elektrik panosunun durumu, belge gereklilikleri, sistem gücü ve kurulum koşullarına bağlıdır.{" "}

      <span
        onClick={() => onNavigate("calculator")}
        className="text-[var(--color-primary)] underline cursor-pointer font-bold hover:text-[var(--color-dark)] transition-colors"
      >
        Hesapla
      </span>{" "}

      güneş hesaplayıcısını kullanabilirsiniz.
    </>
  ),
}[lang]},
  {
    q: {
      az: 'Mənə neçə kW sistem lazımdır?',
      en: 'How can I know what system size I need?',
      ru: 'Как понять, какая мощность системы мне нужна?',
      tr: 'Bana kaç kW sistem gerekir?'
    }[lang],
    a: {
      az: `Lazım olan sistem gücü aylıq elektrik sərfiyyatınızdan, dam sahəsindən, günəşlənmə şəraitindən, büdcənizdən və elektrik xərclərini qismən, yoxsa maksimum azaltmaq istəyinizdən asılıdır. Solarix sizin sərfiyyatınızı və obyekt şəraitini yoxladıqdan sonra uyğun sistemi təklif edir.`,
      en: `The required system size depends on your monthly electricity consumption, roof area, sunlight conditions, budget, and whether you want to reduce bills partially or as much as possible. Solarix reviews your electricity usage and property conditions before recommending the right system.`,
      ru: `Необходимая мощность зависит от вашего месячного потребления электроэнергии, площади крыши, условий освещённости, бюджета и цели — хотите ли вы частично снизить расходы или максимально покрыть потребление. Solarix анализирует ваши данные и условия объекта, после чего предлагает подходящую систему.`,
      tr: `Gerekli sistem gücü aylık elektrik tüketiminize, çatı alanınıza, güneşlenme koşullarına, bütçenize ve elektrik giderlerinizi kısmen mi yoksa mümkün olduğunca fazla mı azaltmak istediğinize bağlıdır.
Solarix sizin elektrik tüketim ve nesne koşullarınızı inceleyerek uygun sistemi önerir.`}[lang]
  },
  {
    q: {
      az: 'Quraşdırma nə qədər vaxt aparır?',
      en: 'How long does installation take?',
      ru: 'Сколько времени занимает установка?',
      tr: 'Kurulum ne kadar sürer?'
    }[lang],
    a: {
      az: `Əksər fərdi yaşayış evlərində quraşdırma adətən 1–3 gün çəkir. Sistemin ölçüsü, damın vəziyyəti və layihənin mürəkkəbliyindən asılı olaraq bu müddət dəyişə bilər.`,
       en: `Most residential systems can usually be installed within 1–3 days, depending on system size and site conditions. Larger or more complex projects may take longer.`,
      ru: `В большинстве частных домов установка обычно занимает 1–3 дня. Срок может меняться в зависимости от размера системы, состояния крыши и сложности проекта.`,
      tr: 'Çoğu konut tipi sistemde kurulum genellikle 1–3 gün sürer. Sistem büyüklüğü, çatının durumu ve projenin karmaşıklığına göre bu süre değişebilir.'
    }[lang]
  },
  {
    q: {
      az: 'Artıq enerjini şəbəkəyə ötürmək mümkündürmü?',
      en: 'Can I send excess energy to the grid?',
      ru: 'Можно ли отдавать лишнюю энергию в сеть?',
      tr: 'Fazla enerjiyi şebekeye verebilir miyim?'
    }[lang],
    a: {
      az: `Bəli. Sistem rəsmi qaydada sənədləşdirildikdə və aktiv istehlakçı mexanizmi üzrə qoşulduqda artıq istehsal olunan enerji şəbəkəyə ötürülə və ikitərəfli sayğac vasitəsilə qeydiyyata alına bilər.`,
       en: `Yes, if the system is properly documented and connected under the active consumer mechanism. In this case, excess electricity can be sent to the grid and measured through a two-way meter.`,
      ru: `Да. Если система официально оформлена и подключена по механизму активного потребителя, излишки произведённой энергии могут передаваться в сеть и учитываться через двухсторонний счётчик.`,
       tr: 'Evet. Sistem resmi olarak belgelenip aktif tüketici mekanizması kapsamında bağlandığında, fazla üretilen enerji şebekeye verilebilir ve çift yönlü sayaçla ölçülebilir.'
    }[lang]
  },
  {
    q: {
      az: 'Solarix sənədləşmə işlərində kömək edirmi?',
      en: 'Does Solarix help with documentation?',
      ru: 'Помогает ли Solarix с документами?',
      tr: 'Solarix belge işlemlerinde yardımcı oluyor mu?'
    }[lang],
    a: {
      az: `Bəli. Solarix texniki sənədlər, layihə məlumatları, quraşdırma sənədləri və zəruri hallarda aktiv istehlakçı müraciəti prosesində müştəriyə dəstək göstərir.`,
       en: `Yes. Solarix supports the customer with technical documents, project information, installation documents, and the active consumer application process where required.`,
      ru: `Да. Solarix помогает с техническими документами, проектной информацией, монтажной документацией и, при необходимости, с процессом подачи заявки активного потребителя.`,
      tr: 'Evet. Solarix teknik belgeler, proje bilgileri, kurulum belgeleri ve gerekli durumlarda aktif tüketici başvuru süreci konusunda müşteriye destek sağlar.'
    }[lang]
  },
  {
    q: {
      az: 'Günəş sistemimi telefondan izləyə bilərəmmi?',
      en: 'Can I monitor my solar system?',
      ru: 'Можно ли следить за системой с телефона?',
      tr: 'Güneş sistemimi telefondan takip edebilir miyim?'
    }[lang],
    a: {
      az: `Bəli. Sistem aktivləşdirildikdən sonra sizə monitorinq tətbiqinə giriş verilə bilər. Bu tətbiq vasitəsilə enerji istehsalını, sərfiyyatı, şəbəkədən alınan enerjini, şəbəkəyə ötürülən enerjini, inverterin vəziyyətini və ümumi sistem performansını izləmək mümkündür.`,
      en:`Yes. After system activation, you can receive access to a monitoring application where you can track energy production, consumption, energy taken from the grid, energy sent to the grid, inverter status, and overall system performance.`,
       ru: `Да. После активации системы вам может быть предоставлен доступ к приложению мониторинга. Через него можно отслеживать выработку, потребление, энергию, полученную из сети, энергию, переданную в сеть, состояние инвертора и общую работу системы.`,
        tr: 'Evet. Sistem aktive edildikten sonra size izleme uygulamasına erişim verilebilir. Bu uygulama üzerinden enerji üretimini, tüketimi, şebekeden alınan enerjiyi, şebekeye verilen enerjiyi, inverter durumunu ve genel sistem performansını takip edebilirsiniz.'
    }[lang]
  }
];

  return (
    <div className="bg-white min-h-screen relative">
      <section className="bg-[var(--color-dark)] py-4 border-b border-[var(--color-primary)] sticky z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1.5 text-[var(--color-primary)] hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t.back}
          </button>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">{t.title}</h1>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black text-slate-900 mb-12">{t.title}</h1>
        
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
              <h3 className="text-lg font-black text-slate-900 mb-3">{faq.q}</h3>
              <p className="text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => onNavigate('solar-panels')} className="mt-10 inline-flex rounded-2xl bg-[var(--color-dark)] px-6 py-4 text-xs font-black text-white">
          {{ az: 'Günəş panellərinə bax', en: 'Explore solar panels', ru: 'Смотреть солнечные панели', tr: 'Güneş panellerini incele' }[lang]}
        </button>
      </div>
    </div>
  );
};

export default FAQPage;
