
import React, { useEffect } from 'react';
import { Scale, Zap , Landmark, FileCheck} from "lucide-react";

interface LegislationSection {
  id: string;
  title: string;
  desc: string;
  quote?: string;
  details: string[];
  icon: React.ReactNode;
  links?: { label: string; url: string }[];
}

interface LegislationPageProps {
  lang?: 'az' | 'en' | 'ru' | 'tr';
  onBack?: () => void;
  sectionId?: string;
}

const LegislationPage: React.FC<LegislationPageProps> = ({ lang = 'az', onBack, sectionId }) => {
  useEffect(() => {
    if (sectionId) {
      const el = document.getElementById(sectionId);
      if (el) {
        const offset = 100;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [sectionId]);

  // const t = {
  //   back: lang === 'az' ? 'Geri qayıt' : 'Back',
  //   title: lang === 'az' ? 'Qanunvericilik və Mexanizmlər' : 'Legislation and Mechanisms',
  //   ref: lang === 'az' ? 'Rəsmi İstinadlar' : 'Official References',
  //   sections: [
  //     {
  //       id: 'net-metering',
  //       title: "Net-metering (Xalis Ölçmə)",
  //       desc: "Azərbaycanda tətbiq edilən xalis ölçmə mexanizmi sayəsində aktiv istehlakçılar gündüz istehsal etdikləri artıq enerjini şəbəkəyə ötürür və gecə saatlarında eyni miqdarda enerjini geri alırlar.",
  //       details: ["Gündüz istehsal olunan enerjinin şəbəkəyə ötürülməsi", "İki tərəfli smart sayğacların tətbiqi", "Aylıq və ya illik balanslaşdırma imkanı", "Enerji xərclərinin 90-100% azaldılması"],
  //       icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  //       links: [
  //         { label: "Bərpa Olunan Enerji Mənbələri üzrə Normativ Aktlar", url: "https://minenergy.gov.az/az/berpa-olunan-enerji/normativ-huquqi-aktlar" }
  //       ]
  //     },
  //     {
  //       id: 'reforms',
  //       title: "Enerji Sahəsində İslahatlar",
  //       desc: "Azərbaycan Respublikasının 2030-cu ilə qədər bərpa olunan enerji sahəsində qoyuluş gücünün 30%-ə çatdırılması hədəflənir.",
  //       details: ["Yaşıl Enerji Zonalarının yaradılması", "Karbon emissiyasının azaldılması strategiyası", "Xarici investorlar üçün güzəştlər", "Dövlət-Özəl tərəfdaşlıq modelləri"],
  //       icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  //       links: [
  //         { label: "Azərbaycan 2030: Sosial-iqtisadi inkişafa dair Milli Prioritetlər", url: "https://president.az/az/articles/view/50474" }
  //       ]
  //     },
  //     {
  //       id: 'laws',
  //       title: "Qanunvericilik Bazası",
  //       desc: "2021-ci ildə qəbul edilmiş 'Elektrik enerjisi istehsalında bərpa olunan enerji mənbələrindən istifadə haqqında' Azərbaycan Respublikasının Qanunu əsas sənəddir.",
  //       details: ["339-VIQ nömrəli Qanun", "Energetika sektoru üzrə normativ aktlar", "Tarif Şurasının müvafiq qərarları", "Sadələşdirilmiş rəsmiləşdirmə"],
  //       icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  //       links: [
  //         { label: "Qanunun tam mətni (e-qanun.az)", url: "https://e-qanun.az/framework/47653" }
  //       ]
  //     },
  //     {
  //       id: 'documents',
  //       title: "Zəruri Sənədlər",
  //       desc: "Günəş panellərinin şəbəkəyə qoşulması və rəsmiləşdirilməsi üçün tələb olunan sənədlər toplusu.",
  //       details: ["Mülkiyyət sənədi", "Texniki şərt müraciəti", "Layihə sənədləri", "Qoşulma müqaviləsi"],
  //       icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>,
  //       links: [
  //         { label: "Azərişıq ASC - Onlayn Müraciət", url: "https://www.azerishiq.az/az/electronic-services" }
  //       ]
  //     },
  //     {
  //       id: 'decrees',
  //       title: "Fərmanlar və Sərəncamlar",
  //       desc: "Bərpa olunan enerji mənbələrinin inkişafı ilə bağlı Azərbaycan Respublikası Prezidentinin imzaladığı mühüm fərmanlar.",
  //       details: ["Yaşıl enerji zonası fərmanı", "Strateji yol xəritələri", "İnvestisiya təşviqi sənədləri", "Azad edilmiş ərazilər üzrə xüsusi fərmanlar"],
  //       icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  //       links: [
  //         { label: "Prezident Kitabxanası - Enerji Siyasəti", url: "https://files.preslib.az/projects/azereco/az/eco_m4_2.pdf" }
  //       ]
  //     }
  //   ] as LegislationSection[]
  // };

  const t = {
  back: {
    az: 'Geri qayıt',
    en: 'Back',
    ru: 'Назад',
    tr: 'Geri Dön'
  }[lang],

  title: {
    az: 'Qanunvericilik və Mexanizmlər',
    en: 'Legislation and Mechanisms',
    ru: 'Законодательство и механизмы',
    tr: 'Mevzuat ve Mekanizmalar'
  }[lang],

  ref: {
    az: 'Rəsmi İstinadlar',
    en: 'Official References',
    ru: 'Официальные источники',
    tr: 'Resmi Kaynaklar'
  }[lang],

  sections: [
    {
      id: 'net-metering',
      title: {
        az: 'Net-metering (Xalis Ölçmə)',
        en: 'Net Metering',
        ru: 'Сальдированный учёт (Net Metering)',
        tr: 'Net Metering / Mahsuplaşma'
      }[lang],
      

      desc: {
        az: `Xalis ölçmə mexanizmi aktiv istehlakçılara günəş panelləri ilə istehsal etdikləri artıq enerjini şəbəkəyə ötürmək və daha sonra şəbəkədən aldıqları enerji ilə qarşılıqlı hesablaşma aparmaq imkanı verir.`,
        en: 'Net metering allows active consumers to transfer surplus electricity generated by solar panels to the grid and later settle it against the electricity received from the grid.',
        ru: `Механизм net metering позволяет активным потребителям передавать в сеть излишки электроэнергии, произведённой солнечными панелями, и затем учитывать их при расчёте с электроэнергией, полученной из сети.`,
        tr: `Net metering mekanizması, aktif tüketicilerin güneş panelleriyle ürettikleri fazla elektriği şebekeye aktarmasına ve daha sonra şebekeden aldığı elektrikle karşılıklı mahsuplaşma yapmasına imkân verir.`}[lang],
       quote: {
    az: "Bu proses Azərbaycan Respublikasının müvafiq qanunvericilik aktları və tətbiq olunan qaydaları əsasında tənzimlənir.",
    en: "This process is regulated in accordance with the relevant legislative acts and applicable rules of the Republic of Azerbaijan.",
    ru: "Данный процесс регулируется соответствующими законодательными актами и применимыми правилами Азербайджанской Республики.",
    tr: "Bu süreç, Azerbaycan Cumhuriyeti’nin ilgili mevzuat hükümleri ve geçerli kuralları çerçevesinde düzenlenir.",
  }[lang],
      details: {
        az: [
          "Gündüz istehsal olunan enerjinin şəbəkəyə ötürülməsi",
          "İkitərəfli smart sayğacla dəqiq qeydiyyat",
          "Aylıq və ya illik balanslaşdırma imkanı",
          "Elektrik xərclərinin əhəmiyyətli azalması"
        ],
        en: [
          "Surplus daytime generation can be exported to the grid",
          "Accurate recording through a two-way smart meter",
          "Possibility of monthly or annual balancing",
          "Significant reduction of electricity costs"
        ],
        ru: [
          'Передача излишков дневной генерации в сеть',
          'Точный учёт через двусторонний smart-счётчик',
          'Возможность месячного или годового баланса',
          'Существенное снижение расходов на электроэнергию'
        ],
        tr: [
          'Gündüz üretilen fazla enerjinin şebekeye aktarılması',
          'Çift yönlü smart sayaç ile doğru kayıt',
          'Aylık veya yıllık dengeleme imkânı',
          'Elektrik maliyetlerinde önemli azalma'
        ]
      }[lang],

      links: {
        az: [
          { label: "Aktiv istehlakçının dəstəklənməsi mexanizminin tətbiqi Qaydaları", url: "https://e-qanun.az/framework/55295" }
        ,{ label: "Elektrik enerjisi istehsalında bərpa olunan enerji mənbələrindən istifadə haqqında Qanun", url: "https://e-qanun.az/framework/47842" }
        ],
        en: [
          { label: "Rules on the Application of the Support Mechanism for Active Consumers", url: "https://e-qanun.az/framework/55295" },
          { label: "Law on the Use of Renewable Energy Sources in Electricity Production", url: "https://e-qanun.az/framework/47842" }
        ],
        ru: [
          { label: "Правила применения механизма поддержки активных потребителей", url: "https://e-qanun.az/framework/55295" },
          { label: "Закон об использовании возобновляемых источников энергии в производстве электроэнергии", url: "https://e-qanun.az/framework/47842" }
        ],
        tr: [
          { label: "Aktif Tüketiciler için Destek Mekanizmasının Uygulanması Hakkında Kurallar", url: "https://e-qanun.az/framework/55295" },
          { label: "Elektrik Enerjisi Üretiminde Yenilenebilir Enerji Kaynaklarının Kullanımı Hakkında Kanun", url: "https://e-qanun.az/framework/47842" }
        ]
      }[lang],

      icon: <Scale className="w-8 h-8" />
    },

    {
      id: 'mechanism',
      title: {
        az: 'Aktiv İstehlakçı Mexanizmi',
        en: 'Active Consumer Mechanism',
        ru: 'Механизм активного потребителя',
        tr: 'Aktif Tüketici Mekanizması'
      }[lang],

      desc: {
        az: `Aktiv istehlakçı — bərpa olunan enerji mənbələri hesabına elektrik enerjisi istehsal edən və bu enerjidən öz ehtiyacları üçün istifadə edən fiziki və ya hüquqi şəxsdir.
Bu mexanizm müştəriyə öz elektrik sərfiyyatının bir hissəsini günəş enerjisi ilə qarşılamaq və artıq enerjini şəbəkəyə ötürmək imkanı yaradır.
`,     en: `An active consumer is an individual or legal entity that produces electricity from renewable energy sources and uses it for their own needs.
This mechanism allows customers to cover part of their electricity consumption with solar energy and transfer surplus electricity to the grid.
`,ru: `Активный потребитель — это физическое или юридическое лицо, которое производит электроэнергию за счёт возобновляемых источников и использует её для собственных нужд.
Этот механизм позволяет клиенту покрывать часть своего потребления солнечной энергией, а излишки передавать в сеть.`,     
tr: `Aktif tüketici, yenilenebilir enerji kaynaklarıyla elektrik üreten ve bu elektriği kendi ihtiyaçları için kullanan gerçek veya tüzel kişidir.
Bu mekanizma, müşterinin elektrik tüketiminin bir kısmını güneş enerjisiyle karşılamasına ve fazla üretimi şebekeye aktarmasına olanak sağlar.
`}[lang],
  quote: {
    az: "Aktiv istehlakçı mexanizmi Azərbaycan Respublikasının müvafiq qanunvericiliyi və rəsmi prosedurları ilə müəyyən edilir.",
    en: "The active consumer mechanism is defined by the relevant legislation and official procedures of the Republic of Azerbaijan.",
    ru: "Механизм активного потребителя определяется соответствующим законодательством и официальными процедурами Азербайджанской Республики.",
    tr: "Aktif tüketici mekanizması, Azerbaycan Cumhuriyeti’nin ilgili mevzuatı ve resmî prosedürleri doğrultusunda belirlenir.",
  }[lang],

      details: {
        az: [
         'Daha çox enerji müstəqilliyi',
'Şəbəkə ilə rəsmi hesablaşma',
'İstehsal və sərfiyyata şəffaf nəzarət',
'Qanuni və texniki uyğunluq'

        ],
        en: [
          "Greater energy independence",
          "Official settlement with the grid",
          "Transparent control of production and consumption",
          "Legal and technical compliance"
        ],
        ru: [
          `Больше энергетической независимости`,
          `Официальный расчёт с сетью`,
          `Прозрачный контроль производства и потребления`,
          `Юридическое и техническое соответствие`
        ],
        tr: [
          'Daha fazla enerji bağımsızlığı',
          'Şebeke ile resmî mahsuplaşma',
          'Üretim ve tüketimin şeffaf takibi',
          'Hukuki ve teknik uygunluk'
        ]
      }[lang],

      links: {
        az: [
          { label: "ASAN Kommunal — Aktiv istehlakçının qeydiyyata alınması", url: "https://www.asan.gov.az/service/asan-kommunal/azerisiq-asc-terefinden-goesterilen-xidmetler/aktiv-istehlakcinin-qeydiyyata-alinmasi" }
         ,{ label: "Aktiv istehlakçının dəstəklənməsi mexanizminin tətbiqi Qaydaları", url: "https://e-qanun.az/framework/55295" }
        ],
        en: [
          { label: "ASAN Kommunal — Registration of an Active Consumer", url: "https://www.asan.gov.az/service/asan-kommunal/azerisiq-asc-terefinden-goesterilen-xidmetler/aktiv-istehlakcinin-qeydiyyata-alinmasi" }
         ,{ label: "Rules on the Application of the Support Mechanism for Active Consumers", url: "https://e-qanun.az/framework/55295" }
        ],
        ru: [   
          { label: "ASAN Kommunal — Регистрация активного потребителя", url: "https://www.asan.gov.az/service/asan-kommunal/azerisiq-asc-terefinden-goesterilen-xidmetler/aktiv-istehlakcinin-qeydiyyata-alinmasi" }
         ,{ label: "Правила применения механизма поддержки активных потребителей", url: "https://e-qanun.az/framework/55295" }
        ],
        tr: [
          { label: "ASAN Kommunal — Aktif Tüketici Kaydı", url: "https://www.asan.gov.az/service/asan-kommunal/azerisiq-asc-terefinden-goesterilen-xidmetler/aktiv-istehlakcinin-qeydiyyata-alinmasi" },
          { label: "Aktif Tüketiciler İçin Destek Mekanizmasının Uygulanmasına İlişkin Kurallar", url: "https://e-qanun.az/framework/55295" }
        ]
      }[lang],

      icon: <Zap className="w-8 h-8" />
    },

    {
      id: 'reforms',
      title: {
        az: 'Qanunvericilik Bazası',
        en: 'Energy Sector Reforms',
        ru: 'Реформы в энергетической сфере',
        tr: 'Enerji Alanındaki Reformlar'
      }[lang],

      desc: {
        az: `Azərbaycanda enerji sektorunda aparılan islahatların əsas istiqamətlərindən biri bərpa olunan enerji mənbələrindən istifadənin genişləndirilməsidir.
Günəş enerjisi artıq sadəcə texniki seçim deyil, qanunvericiliklə tənzimlənən və gələcəyə yönəlmiş enerji modelidir.
`,en: `One of the main directions of energy sector reforms in Azerbaijan is the expansion of renewable energy use.
Solar energy is no longer just a technical option; it is a regulated and future-oriented energy model.
`,ru: `Одним из основных направлений реформ в энергетическом секторе Азербайджана является расширение использования возобновляемых источников энергии.
Солнечная энергия — это уже не просто технический выбор, а регулируемая и ориентированная на будущее энергетическая модель.
`, tr: `Azerbaycan’da enerji sektöründeki reformların temel yönlerinden biri yenilenebilir enerji kaynaklarının kullanımının artırılmasıdır.
Güneş enerjisi artık yalnızca teknik bir tercih değil, mevzuatla düzenlenen ve geleceğe yönelik bir enerji modelidir.
`}[lang],
quote: {
    az: "Enerji sahəsində bu istiqamət Azərbaycan Respublikasının müvafiq qanunvericilik bazası və strateji enerji siyasəti ilə tənzimlənir.",
    en: "This area of the energy sector is regulated by the relevant legislative framework and strategic energy policy of the Republic of Azerbaijan.",
    ru: "Данное направление энергетического сектора регулируется соответствующей законодательной базой и стратегической энергетической политикой Азербайджанской Республики.",
    tr: "Enerji sektöründeki bu alan, Azerbaycan Cumhuriyeti’nin ilgili yasal çerçevesi ve stratejik enerji politikası kapsamında düzenlenir.",
  }[lang],

      details: {
        az: [
          'Günəş enerjisi rəsmi mexanizmə malikdir',
          'Şəbəkəyə qoşulma qaydaları mövcuddur',
          'Uzunmüddətli qənaət imkanı yaranır',
          'Yaşıl enerji ölkə strategiyasının bir hissəsidir'
        ],
        en: [
          "Solar energy has an official legal mechanism",
          "Grid connection rules are in place",
          "Long-term savings become possible",
          "Green energy is part of the national strategy"
        ],
        ru: [
          `Солнечная энергия имеет официальный правовой механизм`,
          `Существуют правила подключения к сети`,
          `Появляется возможность долгосрочной экономии`,
          `Зелёная энергия является частью государственной стратегии`
        ],
        tr: [	
          `Güneş enerjisi resmî bir hukuki mekanizmaya sahiptir`,
          `Şebekeye bağlantı kuralları mevcuttur`,
          `Uzun vadeli tasarruf imkânı oluşur`,
          `Yeşil enerji ülke stratejisinin bir parçasıdır`
        ]
      }[lang],

      links: {
        az: [
          { label: "Energetika sektorunda islahatların sürətləndirilməsi haqqında Sərəncam", url: "https://e-qanun.az/framework/42550" }
         ,{ label: "Elektrik enerjisi istehsalında bərpa olunan enerji mənbələrindən istifadə haqqında Qanun", url: "https://e-qanun.az/framework/47842" }
          ,{ label: "Energetika Nazirliyi — Azərbaycanda bərpa olunan enerji mənbələrindən istifadə", url: "https://www.minenergy.gov.az/az/alternativ-ve-berpa-olunan-enerji/azerbaycanda-berpa-olunan-enerji-menbelerinden-istifade" }
       ],
        en: [
          { label: "Decree on Accelerating Reforms in the Energy Sector", url: "https://e-qanun.az/framework/42550" }
         ,{ label: "Law on the Use of Renewable Energy Sources in Electricity Production", url: "https://e-qanun.az/framework/47842" }
          ,{ label: "Ministry of Energy — Use of Renewable Energy Sources in Azerbaijan", url: "https://www.minenergy.gov.az/az/alternativ-ve-berpa-olunan-enerji/azerbaycanda-berpa-olunan-enerji-menbelerinden-istifade" }
        ],
        ru: [   
          { label: "Распоряжение об ускорении реформ в энергетическом секторе", url: "https://e-qanun.az/framework/42550" }
         ,{ label: "Закон об использовании возобновляемых источников энергии в производстве электроэнергии", url: "https://e-qanun.az/framework/47842" }
          ,{ label: "Министерство энергетики — Использование возобновляемых источников энергии в Азербайджане", url: "https://www.minenergy.gov.az/az/alternativ-ve-berpa-olunan-enerji/azerbaycanda-berpa-olunan-enerji-menbelerinden-istifade" }
       ],
        tr: [
            { label: "Enerji Sektöründeki Reformların Hızlandırılması Hakkında Karar", url: "https://e-qanun.az/framework/42550" }
         ,{ label: "Elektrik Üretiminde Yenilenebilir Enerji Kaynaklarının Kullanımı Hakkında Kanun", url: "https://e-qanun.az/framework/47842" }
          ,{ label: "Enerji Bakanlığı — Azerbaycan’da Yenilenebilir Enerji Kaynaklarının Kullanımı", url: "https://www.minenergy.gov.az/az/alternativ-ve-berpa-olunan-enerji/azerbaycanda-berpa-olunan-enerji-menbelerinden-istifade" }
       
        ]

      }[lang],

      icon: <Landmark className="w-8 h-8" />
    },

     {
      id: 'goals',
      title: {
        az: 'Fərmanlar, Sərəncamlar və Strateji Hədəflər',
        en: 'Decrees, Orders and Strategic Goals',
        ru: 'Указы, распоряжения и стратегические цели',
        tr: 'Kararnameler, Talimatlar ve Stratejik Hedefler'
      }[lang],

      desc: {
        az: `Azərbaycan Respublikasında bərpa olunan enerji mənbələrinin inkişafı dövlət səviyyəsində müəyyən edilmiş strateji istiqamətlərdən biridir.
Bu istiqamətdə qəbul edilən qanunlar və dövlət proqramları günəş enerjisi həllərinin inkişafını və daha təmiz enerji modelinə keçidi dəstəkləyir.
`,en: `The development of renewable energy sources in Azerbaijan is one of the strategic directions defined at the state level.
The adopted laws and state programs support the development of solar energy solutions and the transition to a cleaner energy model.
`,ru: `Развитие возобновляемых источников энергии в Азербайджане является одним из стратегических направлений, определённых на государственном уровне.
Принятые законы и государственные программы поддерживают развитие солнечных энергетических решений и переход к более чистой энергетической модели.
`, tr: `Azerbaycan’da yenilenebilir enerji kaynaklarının geliştirilmesi devlet düzeyinde belirlenmiş stratejik yönlerden biridir.
Kabul edilen kanunlar ve devlet programları, güneş enerjisi çözümlerinin gelişimini ve daha temiz bir enerji modeline geçişi destekler.
`}[lang],
 quote: {
    az: "Bu sahənin inkişafı Azərbaycan Respublikasının qanunvericilik aktları, dövlət proqramları və strateji hədəfləri əsasında həyata keçirilir.",
    en: "The development of this sector is carried out on the basis of the legislative acts, state programs and strategic objectives of the Republic of Azerbaijan.",
    ru: "Развитие данного направления осуществляется на основе законодательных актов, государственных программ и стратегических целей Азербайджанской Республики.",
    tr: "Bu alanın gelişimi, Azerbaycan Cumhuriyeti’nin yasal düzenlemeleri, devlet programları ve stratejik hedefleri temelinde yürütülür.",
  }[lang],
      details: {
        az: [
          'Günəş enerjisi gələcəyə yönəlmiş seçimdir',
          'Hüquqi baza mərhələli şəkildə inkişaf edir',
          'Ekoloji və iqtisadi fayda yaradır',
          'Müştəri daha məlumatlı qərar verə bilir'
        ],
        en: [
          "Solar energy is a future-oriented choice",
          "The legal framework is gradually developing",
          "It creates environmental and economic benefits",
          "The customer can make a more informed decision"
        ],
        ru: [
          `Солнечная энергия — выбор, направленный в будущее`,
          `Правовая база постепенно развивается`,
          `Создаётся экологическая и экономическая польза`,
          `Клиент может принимать более осознанное решение`
        ],
        tr: [
          `Güneş enerjisi geleceğe yönelik bir tercihtir`,
          `Hukuki altyapı aşamalı olarak gelişmektedir`,
          `Ekolojik ve ekonomik fayda sağlar`,
          `Müşteri daha bilinçli karar verebilir`

        ]
      }[lang],

      links: {
        az: [
          { label: "Azərbaycan Respublikasının 2022–2026-cı illərdə sosial-iqtisadi inkişaf Strategiyası", url: "https://e-qanun.az/framework/50013" }
         ,{ label: "Yaşıl Enerji Zonasının yaradılması ilə bağlı Sərəncam", url: "https://e-qanun.az/framework/47397" }
          ,{ label: "Energetika Nazirliyi — İqlim hədəfləri və bərpa olunan enerji", url: "https://www.minenergy.gov.az/az/alternativ-ve-berpa-olunan-enerji/azerbaycanda-berpa-olunan-enerji-menbelerinden-istifade" } 
        ],
        en: [
          { label: "Socio-Economic Development Strategy of the Republic of Azerbaijan for 2022–2026", url: "https://e-qanun.az/framework/50013" }
         ,{ label: "Order on the Establishment of a Green Energy Zone", url: "https://e-qanun.az/framework/47397" }
          ,{ label: "Ministry of Energy — Climate Goals and Renewable Energy", url: "https://www.minenergy.gov.az/az/alternativ-ve-berpa-olunan-enerji/azerbaycanda-berpa-olunan-enerji-menbelerinden-istifade" } 
        ],
        ru: [
          { label: "Стратегия социально-экономического развития Азербайджанской Республики на 2022–2026 годы", url: "https://e-qanun.az/framework/50013" }
         ,{ label: "Распоряжение о создании Зоны зелёной энергии", url: "https://e-qanun.az/framework/47397" }
          ,{ label: "Министерство энергетики — Климатические цели и возобновляемая энергия", url: "https://www.minenergy.gov.az/az/alternativ-ve-berpa-olunan-enerji/azerbaycanda-berpa-olunan-enerji-menbelerinden-istifade" } 
        
        ],
        tr: [
          { label: "Azerbaycan Cumhuriyeti’nin 2022–2026 Sosyo-Ekonomik Kalkınma Stratejisi", url: "https://e-qanun.az/framework/50013" }
         ,{ label: "Yeşil Enerji Bölgesi’nin Oluşturulmasına İlişkin Karar", url: "https://e-qanun.az/framework/47397" }
          ,{ label: "Enerji Bakanlığı — İklim Hedefleri ve Yenilenebilir Enerji", url: "https://www.minenergy.gov.az/az/alternativ-ve-berpa-olunan-enerji/azerbaycanda-berpa-olunan-enerji-menbelerinden-istifade" } 
        
        ]
      }[lang],

      icon: <FileCheck className="w-8 h-8" />
    }
  ] as LegislationSection[]
};

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-emerald-950 py-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between relative z-10">
          <button onClick={onBack} className="flex items-center gap-1.5 text-emerald-300/60 hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t.back}
          </button>
          <h1 className="text-sm font-black text-white uppercase tracking-widest text-right">{t.title}</h1>
        </div>
      </section>

      <div className="py-16 md:py-24 space-y-24">
        {t.sections.map((section, idx) => (
          <section key={section.id} id={section.id} className="max-w-6xl mx-auto px-4 md:px-12 scroll-mt-32">
            <div className={`flex flex-col md:flex-row items-start gap-12 ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              <div className="flex-1 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                  {section.icon }
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                  {section.title}
                </h2>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed opacity-80">
                  {section.desc}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  {section.details.map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
                      <span className="text-xs font-bold text-slate-700">{detail}</span>
                    </div>
                  ))}
                </div>
                
                {section.links && (
                  <div className="mt-8 p-6 bg-slate-900 rounded-3xl border border-slate-800">
                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4">{t.ref}</h4>
                    <div className="space-y-3">
                      {section.links.map((link, lIdx) => (
                        <a 
                          key={lIdx} 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between group/link bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-all border border-white/5"
                        >
                          <span className="text-xs font-medium text-slate-300 group-hover/link:text-white transition-colors">{link.label}</span>
                          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 w-full flex justify-center items-center">
                 <div className="w-full aspect-video bg-emerald-900/5 rounded-[3rem] border border-emerald-900/10 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
                    <div className="text-[10rem] font-black text-emerald-900/5 select-none">{idx + 1}</div>
                    <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                       <p className="text-slate-400 font-serif italic text-sm">{section.quote}</p>
                    </div>
                 </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default LegislationPage;
