
import React, { useState, useEffect } from 'react';
import { useContact } from "../contexts/ContactContext";
import { useEmail } from "../contexts/EmailContext";
import PhoneNumberInput, { COUNTRY_CALLING_CODES, DEFAULT_COUNTRY_ISO2 } from './PhoneNumberInput';
import { useNotification } from '../contexts/NotificationContext';
import { trackConfirmedLead } from '../utils/analytics';


interface ContactPageProps {
  lang?: 'az' | 'en' | 'ru' | 'tr';
  onBack?: () => void;
  initialService?: string;
  initialProduct?: string; // New: Selected product context
}

const languageReverseMap = {
  1: "az",
  2: "en",
  3: "ru",
  4: "tr",
} as const;

const ContactPage: React.FC<ContactPageProps> = ({ lang, onBack, initialService, initialProduct }) => {
  const { showNotification } = useNotification();
  const { contactData, loading, createContactRequest } = useContact();
  const { applicationTypes, getApplicationTypes } = useEmail();
  const [selectedType, setSelectedType] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isInstalledByUs: '', // 'yes' or 'no'
    companyName: '',
    serviceType: ''
  });
  const [phoneCountry, setPhoneCountry] = useState(DEFAULT_COUNTRY_ISO2);
  const [message, setMessage] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);



  useEffect(() => {
    getApplicationTypes();
    if (initialService) {
      setSelectedType(initialService);
    }

  }, [initialService, initialProduct, lang]);

  const getItemName = (item: any) => {
    return (
      item?.languages?.find((l: any) => l.languageCode === 1)?.name ||
      item?.languages?.find((l: any) => l.languageCode === 2)?.name ||
      item?.languages?.find((l: any) => l.languageCode === 3)?.name ||
      item?.languages?.find((l: any) => l.languageCode === 4)?.name ||
      "No name"
    );
  };

  const t = {
    back:
      lang === "az"
        ? "Geri qayıt"
        : lang === "ru"
          ? "Назад"
          : lang === "tr"
            ? "Geri dön"
            : "Back",

    title:
      lang === "az"
        ? "Bizimlə əlaqə"
        : lang === "ru"
          ? "Свяжитесь с нами"
          : lang === "tr"
            ? "Bizimle iletişime geçin"
            : "Contact Us",

    formHeader:
      lang === "az"
        ? "Bizə mesaj göndərin"
        : lang === "ru"
          ? "Отправьте нам сообщение"
          : lang === "tr"
            ? "Bize mesaj gönderin"
            : "Send us a message",

    successTitle:
      lang === "az"
        ? "Müraciətiniz qeydə alındı!"
        : lang === "ru"
          ? "Ваш запрос зарегистрирован!"
          : lang === "tr"
            ? "Talebiniz alındı!"
            : "Request Registered!",

    successMessage:
      lang === "az"
        ? "Tezliklə sizinlə əlaqə saxlanılacaq."
        : lang === "ru"
          ? "Мы скоро свяжемся с вами."
          : lang === "tr"
            ? "En kısa sürede sizinle iletişime geçilecektir."
            : "We will contact you soon.",

    close:
      lang === "az"
        ? "Bağla"
        : lang === "ru"
          ? "Закрыть"
          : lang === "tr"
            ? "Kapat"
            : "Close",

    labels: {
      type:
        lang === "az"
          ? "Müraciət tipi *"
          : lang === "ru"
            ? "Тип обращения *"
            : lang === "tr"
              ? "Talep türü *"
              : "Request type *",

      firstName:
        lang === "az"
          ? "Ad *"
          : lang === "ru"
            ? "Имя *"
            : lang === "tr"
              ? "Ad *"
              : "First Name *",

      lastName:
        lang === "az"
          ? "Soyad *"
          : lang === "ru"
            ? "Фамилия *"
            : lang === "tr"
              ? "Soyad *"
              : "Last Name *",

      email:
        lang === "az"
          ? "E-poçt *"
          : lang === "ru"
            ? "Эл. почта *"
            : lang === "tr"
              ? "E-posta *"
              : "Email *",

      phone:
        lang === "az"
          ? "Əlaqə nömrəsi *"
          : lang === "ru"
            ? "Номер телефона *"
            : lang === "tr"
              ? "Telefon numarası *"
              : "Phone *",

      message:
        lang === "az"
          ? "Qısa mesaj (maks. 300 simvol) *"
          : lang === "ru"
            ? "Короткое сообщение (макс. 300 символов) *"
            : lang === "tr"
              ? "Kısa mesaj (maks. 300 karakter) *"
              : "Short message (max. 300 chars) *",

      submit:
        lang === "az"
          ? "Göndər"
          : lang === "ru"
            ? "Отправить"
            : lang === "tr"
              ? "Gönder"
              : "Send",

      isInstalledByUs:
        lang === "az"
          ? "Texniki dəstək tələb olunan sistemi tərəfimizdən quraşdırılıb? *"
          : lang === "ru"
            ? "Система была установлена нами? *"
            : lang === "tr"
              ? "Sistem tarafımızdan mı kuruldu? *"
              : "Was the system installed by us? *",

      companyName:
        lang === "az"
          ? "Quraşdıran şirkətin adı *"
          : lang === "ru"
            ? "Название установившей компании *"
            : lang === "tr"
              ? "Kurulum yapan şirket adı *"
              : "Installing company name *",

      serviceType:
        lang === "az"
          ? "İstənəcək xidmət növü seçin *"
          : lang === "ru"
            ? "Выберите тип услуги *"
            : lang === "tr"
              ? "İstenen hizmet türünü seçin *"
              : "Select service type *",

      yes:
        lang === "az"
          ? "Bəli"
          : lang === "ru"
            ? "Да"
            : lang === "tr"
              ? "Evet"
              : "Yes",

      no:
        lang === "az"
          ? "Xeyr"
          : lang === "ru"
            ? "Нет"
            : lang === "tr"
              ? "Hayır"
              : "No"
    },

    placeholders: {
      firstName:
        lang === "az"
          ? "Adınız"
          : lang === "ru"
            ? "Ваше имя"
            : lang === "tr"
              ? "Adınız"
              : "Your first name",

      lastName:
        lang === "az"
          ? "Soyadınız"
          : lang === "ru"
            ? "Ваша фамилия"
            : lang === "tr"
              ? "Soyadınız"
              : "Your last name",

      email: "your@email.com",

      phone: "+994 XX XXX XX XX",

      companyName:
        lang === "az"
          ? "Şirkət adı"
          : lang === "ru"
            ? "Название компании"
            : lang === "tr"
              ? "Şirket adı"
              : "Company name",

      message:
        lang === "az"
          ? "Sizi maraqlandıran sualı qeyd edin..."
          : lang === "ru"
            ? "Введите ваш вопрос..."
            : lang === "tr"
              ? "Sorunuzu yazın..."
              : "Enter your question or message..."
    },

    info: {
      address:
        lang === "az"
          ? "Ünvan:"
          : lang === "ru"
            ? "Адрес:"
            : lang === "tr"
              ? "Adres:"
              : "Address:",

      time:
        lang === "az"
          ? "İş saatı:"
          : lang === "ru"
            ? "Рабочее время:"
            : lang === "tr"
              ? "Çalışma saatleri:"
              : "Work time:",

      phone:
        lang === "az"
          ? "Telefon:"
          : lang === "ru"
            ? "Телефон:"
            : lang === "tr"
              ? "Telefon:"
              : "Phone:",

      email:
        lang === "az"
          ? "E-poçt:"
          : lang === "ru"
            ? "Эл. почта:"
            : lang === "tr"
              ? "E-posta:"
              : "Email:"
    }
  };

  const currentLangData = contactData?.languages?.find(
    (l: any) => languageReverseMap[l.languageCode as 1 | 2 | 3 | 4] === lang
  );

  const contactItems = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: t.info.address,
      value: currentLangData?.address
    },
    {
      // ⏰ DÜZƏLDİLDİ (clock icon)
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" strokeWidth="2" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M12 7v5l3 3" />
        </svg>
      ),
      label: t.info.time,
      value: currentLangData?.workingHoursDescription
    },
    {
      // 📞 telefon
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      label: t.info.phone,
      value: contactData?.phoneNumbers?.[0]?.number
    },
    {
      // ✉️ email
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: t.info.email,
      value: contactData?.emailAddresses?.[0]?.email
    }
  ];

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //   const { name, value } = e.target;
  //   setFormData(prev => ({ ...prev, [name]: value }));
  // };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // yalnız rəqəmlər
      const onlyNumbers = value.replace(/\D/g, "");

      setFormData((prev) => ({
        ...prev,
        phone: onlyNumbers
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= 300) {
      setMessage(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const dialCode = COUNTRY_CALLING_CODES.find((c) => c.iso2 === phoneCountry)?.dialCode || '+994';
    const analyticsRequestId = crypto.randomUUID();

    setIsSubmitting(true);
    try {
      const createdRequest = await createContactRequest({
        name: formData.firstName,
        surname: formData.lastName,
        email: formData.email,
        phone: `${dialCode} ${formData.phone}`.trim(),
        message,
        applicationTypeId: Number(selectedType),
      });

      trackConfirmedLead(
        'generate_lead',
        'contact_request',
        lang || 'az',
        createdRequest?.id ?? createdRequest?.requestId ?? analyticsRequestId,
      );

      setShowSuccessPopup(true);
      showNotification(t.successTitle, 'success');

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        isInstalledByUs: '',
        companyName: '',
        serviceType: '',
      });

      setMessage('');
      setSelectedType('');
    } catch (error) {
      console.error('CREATE CONTACT REQUEST ERROR:', error);
      showNotification(
        lang === 'az' ? 'Müraciəti göndərmək mümkün olmadı.' : lang === 'ru' ? 'Не удалось отправить запрос.' : lang === 'tr' ? 'Talep gönderilemedi.' : 'The request could not be sent.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col relative">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowSuccessPopup(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-10 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{t.successTitle}</h3>
            <p className="text-slate-500 text-sm mb-8">{t.successMessage}</p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-lg"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
      <section className="bg-emerald-950 py-4 relative overflow-hidden shrink-0">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between relative z-10">
          <button onClick={onBack} className="flex items-center gap-1.5 text-emerald-300/60 hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t.back}
          </button>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">{t.title}</h1>
        </div>
      </section>

      {/* Form and Contact Info Section - Now FIRST */}
      <section className="py-12 md:py-20 bg-slate-50/50 flex-grow">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-slate-900">{lang === 'az' ? 'Bizimlə Əlaqə' : 'Contact Us'}</h2>
                <div className="h-1.5 w-16 bg-emerald-500 rounded-full"></div>
              </div>

              <div className="space-y-4">
                {contactItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-100 transition">
                      {item.icon}
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {item.label}
                      </span>

                      <span className="text-sm font-bold text-slate-700 whitespace-pre-line">
                        {item.value || "-"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 relative overflow-hidden">
                <div className="mb-10">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{t.formHeader}</h3>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Dəqiq və tam məlumat daxil edin</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.labels.type}</label>
                    <div className="relative group">
                      <select
                        required
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="">{lang === 'az' ? 'Müraciət tipini seçin' : 'Select request type'}</option>
                        {applicationTypes.map(type => (
                          <option
                            key={type.id}
                            value={type.id}
                            className="text-slate-700 font-bold"
                          >
                            {getItemName(type)}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-emerald-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.labels.firstName}</label>
                      <input required name="firstName" type="text" value={formData.firstName} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-700" placeholder={t.placeholders.firstName} />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.labels.lastName}</label>
                      <input required name="lastName" type="text" value={formData.lastName} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-700" placeholder={t.placeholders.lastName} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.labels.email}</label>
                      <input required name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-700" placeholder={t.placeholders.email} />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.labels.phone}</label>
                      <PhoneNumberInput
                        required
                        countryIso2={phoneCountry}
                        onCountryChange={setPhoneCountry}
                        localNumber={formData.phone}
                        onLocalNumberChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
                        placeholder="50 123 45 67"
                        containerClassName="border-slate-100 bg-slate-50 focus-within:bg-white"
                        inputClassName="px-5 py-4 text-sm font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.labels.message}</label>
                      <span className="text-[9px] font-bold text-slate-300">{message.length}/300</span>
                    </div>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={handleMessageChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all resize-none font-bold text-slate-700"
                      placeholder={t.placeholders.message}
                    ></textarea>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 bg-emerald-600 text-white py-5 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-emerald-600/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-sky-600">
                    {isSubmitting && (
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" /><path className="opacity-90" fill="currentColor" d="M12 3a9 9 0 00-9 9h3a6 6 0 016-6V3z" /></svg>
                    )}
                    {t.labels.submit}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section - Now LAST */}
      <section className="h-[300px] md:h-[450px] w-full relative grayscale-50 hover:grayscale-0 transition-all duration-700 shrink-0">
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3039.3263774431366!2d49.858304800000006!3d40.37945849999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40307d7b124c25e5%3A0x38510736fe9f896c!2sTime%20Business%20Center%20(Time%20Tower)!5e0!3m2!1sen!2saz!4v1781087032109!5m2!1sen!2saz" 
        width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy" title="Office Map"></iframe>
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.1)]"></div>
      </section>
    </div>
  );
};

export default ContactPage;
