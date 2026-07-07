
import React, { useState, useEffect } from 'react';
import { useService } from "../contexts/ServiceContext";

interface ServicesPageProps {
  lang?: 'az' | 'en' | 'ru' | 'tr';
  onBack?: () => void;
  initialService?: string | number;
  focusToken?: string | number;
}

const languageReverseMap = {
  1: "az",
  2: "en",
  3: "ru",
  4: "tr",
} as const;

type LangCode = 'az' | 'en' | 'ru' | 'tr';

export const ICON_MAP = {
  "Günəş": "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z",

  "Sayğac": "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",

  "Maliyyə": "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0116 0z",

  "Parametrlər": "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",

  "Texniki": "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",

  "Konsultasiya": "M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
} as const;

const serviceMatchers: Record<string, string[]> = {
  'smart-meter-monitoring': ['smart', 'saygac', 'inteqrasiya', 'monitorinq', 'meter', 'monitoring'],
  'finance-credit': ['maliyye', 'kredit', 'helleri', 'credit', 'finance'],
  'legal-formalization': ['huquqi', 'texniki', 'resmilesdirme', 'legal', 'formalization'],
  'energy-audit': ['konsultasiya', 'enerji', 'auditi', 'consultation', 'audit'],
  installation: ['gunes', 'sistemlerinin', 'qurasdirilmasi', 'installation'],
  'design-roi': ['sistem', 'layihelendirilmesi', 'roi', 'analizi', 'design']
};

const serviceTargetTitles: Record<string, string[]> = {
  'design-roi': ['Sistem Layihələndirilməsi və ROI Analizi'],
  installation: ['Günəş Sistemlərinin Quraşdırılması'],
  'energy-audit': ['Konsultasiya və Enerji Auditi'],
  'legal-formalization': ['Hüquqi və Texniki Rəsmiləşdirmə'],
  'finance-credit': ['Maliyyə və Kredit Həlləri'],
  'smart-meter-monitoring': ['Smart Sayğac İnteqrasiyası və Monitorinq']
};

const normalizeServiceText = (value: string) =>
  value
    .toLocaleLowerCase('az-AZ')
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u');

const ServicesPage: React.FC<ServicesPageProps> = ({ lang , onBack, initialService, focusToken }) => {

  const {
  services,
  getServices,
  createServiceRequest
} = useService();

 

  const [formData, setFormData] = useState({
    serviceType: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'none' | 'success' | 'error'>('none');
  const [focusedServiceId, setFocusedServiceId] = useState<string | number | null>(null);

  const t = {
  serviceType: {
    az: "Xidmət növü",
    en: "Service Type",
    ru: "Тип услуги",
    tr: "Hizmet Türü",
  },

  title: {
    az: "Xidmətlər",
    en: "Services",
    ru: "Услуги",
    tr: "Hizmetler",
  },

  back: {
    az: "Geri qayıt",
    en: "Back",
    ru: "Назад",
    tr: "Geri dön",
  },

  apply: {
    az: "Müraciət et",
    en: "Apply Now",
    ru: "Подать заявку",
    tr: "Başvur",
  },

  formTitle: {
    az: "Xidmət üçün müraciət",
    en: "Apply for Service",
    ru: "Заявка на услугу",
    tr: "Hizmet Başvurusu",
  },

  formDesc: {
    az: "Məlumatlarınızı daxil edin, mütəxəssislərimiz sizinlə əlaqə saxlasın.",
    en: "Enter your details, our specialists will contact you.",
    ru: "Введите свои данные, и наши специалисты свяжутся с вами.",
    tr: "Bilgilerinizi girin, uzmanlarımız sizinle iletişime geçsin.",
  },

  firstName: {
    az: "Ad",
    en: "First Name",
    ru: "Имя",
    tr: "Ad",
  },

  lastName: {
    az: "Soyad",
    en: "Last Name",
    ru: "Фамилия",
    tr: "Soyad",
  },

  email: {
    az: "E-mail",
    en: "Email",
    ru: "Электронная почта",
    tr: "E-posta",
  },

  phone: {
    az: "Əlaqə nömrəsi",
    en: "Phone Number",
    ru: "Номер телефона",
    tr: "Telefon Numarası",
  },

  message: {
    az: "Qısa mesaj (maks. 300 simvol)",
    en: "Short message (max. 300 chars)",
    ru: "Краткое сообщение (макс. 300 символов)",
    tr: "Kısa mesaj (maks. 300 karakter)",
  },

  send: {
    az: "Göndər",
    en: "Send",
    ru: "Отправить",
    tr: "Gönder",
  },

  success: {
    az: "Müraciətiniz uğurla göndərildi!",
    en: "Your application has been sent successfully!",
    ru: "Ваша заявка успешно отправлена!",
    tr: "Başvurunuz başarıyla gönderildi!",
  },

  error: {
    az: "Xəta baş verdi. Yenidən cəhd edin.",
    en: "An error occurred. Please try again.",
    ru: "Произошла ошибка. Пожалуйста, попробуйте снова.",
    tr: "Bir hata oluştu. Lütfen tekrar deneyin.",
  },
  scrollToApply: {
  az: "Müraciət etmək üçün aşağı sürüşdürün",
  en: "Scroll down to apply",
  ru: "Прокрутите вниз, чтобы подать заявку",
  tr: "Başvurmak için aşağı kaydırın",
},
selectService: {
  az: "Xidmət seçin",
  en: "Select a service",
  ru: "Выберите услугу",
  tr: "Bir hizmet seçin",
},
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'message' && value.length > 300) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setSubmitStatus("none");

  try {
    const selectedService = services.find((s) => {
      const langItem = s.languages?.find(
        (l) => languageReverseMap[l.languageCode] === lang
      );

      return langItem?.title === formData.serviceType;
    });

    await createServiceRequest({
  name: formData.firstName,
  surname: formData.lastName,
  email: formData.email,
  phone: formData.phone,
  message: formData.message,
  serviceManagementId: Number(formData.serviceType),
});

    setSubmitStatus("success");

    setFormData({
      serviceType: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
    });
  } catch (error) {
    console.error(error);
    setSubmitStatus("error");
  } finally {
    setIsSubmitting(false);
  }
};

    const transformService = (item: any, activeLang: LangCode) => {
    const langItem = item.languages?.find(
      (l: any) => languageReverseMap[l.languageCode] === lang
    );

    return {
      id: item.id,
      title: langItem?.title ?? "",
      description: langItem?.description ?? "",
      content1: langItem?.content1 ?? "",
      content2: langItem?.content2 ?? "",
      content3: langItem?.content3 ?? "",
      content4: langItem?.content4 ?? "",
      icon: item.icon ?? "Günəş",
    };
  };;
  const safeServices = services.map(s =>
    transformService(s, lang)
  );
   useEffect(() => {
      getServices();
    }, [lang]);

  useEffect(() => {
    if (!initialService || safeServices.length === 0) return;
    const initialServiceText = String(initialService);
    const directMatch = safeServices.find((service) => String(service.id) === initialServiceText);
    const targetTitles = serviceTargetTitles[initialServiceText] || [];
    const titleMatch = safeServices.find((service) => {
      const normalizedTitle = normalizeServiceText(service.title || '');
      return targetTitles.some((title) => normalizedTitle === normalizeServiceText(title));
    });
    const matchers = serviceMatchers[initialServiceText] || [];
    const scoredMatches = safeServices.map((service) => {
      const searchableText = normalizeServiceText(
        [service.title, service.description, service.content1, service.content2, service.content3, service.content4, service.icon]
          .filter(Boolean)
          .join(' ')
      );

      return {
        service,
        score: matchers.reduce((sum, keyword) => sum + (searchableText.includes(normalizeServiceText(keyword)) ? 1 : 0), 0)
      };
    }).sort((a, b) => b.score - a.score);
    const keywordMatch = scoredMatches[0]?.score > 0 ? scoredMatches[0].service : undefined;
    const targetService = directMatch || titleMatch || keywordMatch;

    if (!targetService) return;

    setFocusedServiceId(targetService.id);
    const clearHighlight = window.setTimeout(() => setFocusedServiceId(null), 3000);
    const scrollTimer = window.setTimeout(() => {
      document.getElementById(`service-${targetService.id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 0);

    return () => {
      window.clearTimeout(clearHighlight);
      window.clearTimeout(scrollTimer);
    };
  }, [initialService, focusToken, services.length, lang]);

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-emerald-950 py-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between relative z-10">
          <button onClick={onBack} className="flex items-center gap-1.5 text-emerald-300/60 hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t.back[lang]}
          </button>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">{t.title[lang]}</h1>
        </div>
      </section>

      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {safeServices.map((service) => {
              const isFocused = String(focusedServiceId) === String(service.id);
              return (
              <div 
                key={service.id}
                id={`service-${service.id}`}
                className={`rounded-[2rem] p-8 border shadow-sm hover:shadow-2xl hover:border-[var(--color-primary)] transition-all duration-500 flex flex-col group ${
                  isFocused
                    ? 'bg-emerald-50 border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30 shadow-2xl shadow-emerald-900/10'
                    : 'bg-white border-slate-100'
                }`}
              >
               <div className="mb-6">
  <div className="flex items-center gap-4 mb-3">
    <div className="w-14 h-14 bg-[color-mix(in_srgb,var(--color-primary)_9%,white)] text-[var(--color-primary)] rounded-2xl flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-dark)] transition-all duration-500 shadow-inner">
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d={ICON_MAP[service.icon ?? "Günəş"]}
        />
      </svg>
    </div>

    <h3 className="text-lg font-black text-slate-900 group-hover:text-[var(--color-primary)] transition-colors">
      {service.title || ""}
    </h3>
  </div>

  <p className="text-[11px] text-slate-400 font-medium leading-tight">
    {service.description}
  </p>
</div>

                <div className="space-y-3">
                  
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full"></div>
                      <span className="text-xs font-bold text-slate-600">{service.content1}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full"></div>
                      <span className="text-xs font-bold text-slate-600">{service.content2}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full"></div>
                      <span className="text-xs font-bold text-slate-600">{service.content3}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full"></div>
                      <span className="text-xs font-bold text-slate-600">{service.content4}</span>
                    </div>
               
                </div>
              </div>
              );
            })}
          </div>

          {/* Scroll Down Arrow */}
          <div className="flex flex-col items-center justify-center mb-16 animate-bounce cursor-pointer group" 
               onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })}>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-hover:text-[var(--color-primary)] transition-colors">
              {t.scrollToApply[lang]}
            </span>
            <div className="w-12 h-12 bg-white rounded-full border border-slate-100 shadow-md flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-dark)] transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7-7-7m14-8l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Application Form */}
          <div id="application-form" className="max-w-4xl mx-auto">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-emerald-900/5 border border-slate-100">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-3">{t.formTitle[lang]}</h2>
                <p className="text-slate-500 text-sm font-medium">{t.formDesc[lang]}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t.serviceType[lang]}</label>
                  <div className="relative group">
                    <select
                      required
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-bold text-slate-900 appearance-none cursor-pointer"
                    >
                      <option value="" disabled>{t.selectService[lang]}</option>
                      {safeServices.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.title }
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-emerald-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t.firstName[lang]}</label>
                    <input 
                      required
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-bold text-slate-900"
                      placeholder="..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t.lastName[lang]}</label>
                    <input 
                      required
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-bold text-slate-900"
                      placeholder="..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t.email[lang]}</label>
                    <input 
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-bold text-slate-900"
                      placeholder="example@mail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t.phone[lang]}</label>
                    <input 
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-bold text-slate-900"
                      placeholder="+994 -- --- -- --"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-4 mr-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.message[lang]}</label>
                    <span className="text-[10px] font-bold text-slate-300">{formData.message.length}/300</span>
                  </div>
                  <textarea 
                    required
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-bold text-slate-900 resize-none"
                    placeholder="..."
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl shadow-emerald-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '...' : t.send[lang]}
                </button>

                {submitStatus === 'success' && (
                  <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-center text-xs font-bold animate-in fade-in slide-in-from-top-1">
                    {t.success[lang]}
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-center text-xs font-bold animate-in fade-in slide-in-from-top-1">
                    {t.error[lang]}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
