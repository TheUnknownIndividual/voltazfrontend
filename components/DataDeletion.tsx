import React from 'react';

interface DataDeletionProps {
  lang?: 'az' | 'en' | 'ru' | 'tr';
  onBack: () => void;
}

const copy = {
  az: {
    back: 'Geri qayıt', title: 'Məlumatların silinməsi', updated: 'Son yenilənmə: 17 avqust 2026',
    intro: 'Bu səhifə Facebook, Messenger, Instagram və WhatsApp vasitəsilə Solarix / Volt.az ilə əlaqə saxlayan şəxslər üçün məlumatların silinməsi qaydasını izah edir.',
    revokeTitle: '1. Meta girişini ləğv edin',
    revoke: 'Facebook hesabınızda Biznes inteqrasiyaları bölməsini açın, Solarix / Volt.az tətbiqini seçin və girişi ləğv edin. Bu, tətbiqin gələcək Meta məlumatlarına girişini dayandırır.',
    requestTitle: '2. Silinmə sorğusu göndərin',
    request: 'support@volt.az ünvanına “Meta məlumatlarının silinməsi” mövzusu ilə e-poçt göndərin. Sorğunu müəyyən etmək üçün adınızı, əlaqə nömrənizi və istifadə etdiyiniz kanalı qeyd edin. Şifrənizi, giriş tokeninizi və ya iki mərhələli doğrulama kodunuzu göndərməyin.',
    processTitle: '3. Sorğunun icrası',
    process: 'Sorğunu yoxladıqdan sonra hüquqi və təhlükəsizlik məqsədləri üçün saxlanılması tələb olunmayan əlaqəli Meta identifikatorlarını, mesaj məzmununu, əlavə metadatasını və daxili xidmət qeydlərini siləcəyik və ya anonimləşdirəcəyik. Tamamlama barədə təqdim etdiyiniz əlaqə vasitəsi ilə məlumat veriləcək.',
    contact: 'Silinmə sorğusu göndər'
  },
  en: {
    back: 'Back', title: 'Data Deletion Instructions', updated: 'Last updated: August 17, 2026',
    intro: 'This page explains how people who contact Solarix / Volt.az through Facebook, Messenger, Instagram, or WhatsApp can request deletion of their associated data.',
    revokeTitle: '1. Revoke Meta access',
    revoke: 'Open Business Integrations in your Facebook account, select the Solarix / Volt.az application, and remove its access. This prevents the application from accessing future Meta data.',
    requestTitle: '2. Submit a deletion request',
    request: 'Email support@volt.az with the subject “Meta Data Deletion Request”. Include your name, contact number, and the messaging channel you used so we can identify the relevant records. Never send your password, access token, or two-factor authentication code.',
    processTitle: '3. Request processing',
    process: 'After verifying the request, we will delete or anonymize associated Meta identifiers, message content, attachment metadata, and internal service records unless retention is required for legal or security purposes. We will notify you through the contact method you provided when processing is complete.',
    contact: 'Send deletion request'
  },
  ru: {
    back: 'Назад', title: 'Удаление данных', updated: 'Последнее обновление: 17 августа 2026 г.',
    intro: 'На этой странице описано, как пользователи, связавшиеся с Solarix / Volt.az через Facebook, Messenger, Instagram или WhatsApp, могут запросить удаление связанных данных.',
    revokeTitle: '1. Отзовите доступ Meta',
    revoke: 'Откройте раздел «Бизнес-интеграции» в аккаунте Facebook, выберите приложение Solarix / Volt.az и удалите его доступ. Это остановит доступ приложения к будущим данным Meta.',
    requestTitle: '2. Отправьте запрос на удаление',
    request: 'Отправьте письмо на support@volt.az с темой «Meta Data Deletion Request». Укажите имя, контактный номер и использованный канал. Не отправляйте пароль, токен доступа или код двухфакторной аутентификации.',
    processTitle: '3. Обработка запроса',
    process: 'После проверки запроса мы удалим или обезличим связанные идентификаторы Meta, содержимое сообщений, метаданные вложений и внутренние сервисные записи, кроме данных, хранение которых требуется законом или в целях безопасности. После завершения мы свяжемся с вами.',
    contact: 'Отправить запрос'
  },
  tr: {
    back: 'Geri', title: 'Veri Silme Talimatları', updated: 'Son güncelleme: 17 Ağustos 2026',
    intro: 'Bu sayfa, Facebook, Messenger, Instagram veya WhatsApp üzerinden Solarix / Volt.az ile iletişim kuran kişilerin ilgili verilerinin silinmesini nasıl talep edebileceğini açıklar.',
    revokeTitle: '1. Meta erişimini kaldırın',
    revoke: 'Facebook hesabınızdaki İşletme Entegrasyonları bölümünü açın, Solarix / Volt.az uygulamasını seçin ve erişimi kaldırın. Bu işlem uygulamanın gelecekteki Meta verilerine erişimini durdurur.',
    requestTitle: '2. Silme talebi gönderin',
    request: 'support@volt.az adresine “Meta Data Deletion Request” konulu bir e-posta gönderin. İlgili kayıtları belirleyebilmemiz için adınızı, iletişim numaranızı ve kullandığınız mesajlaşma kanalını ekleyin. Şifrenizi, erişim belirtecinizi veya iki faktörlü doğrulama kodunuzu göndermeyin.',
    processTitle: '3. Talebin işlenmesi',
    process: 'Talep doğrulandıktan sonra, yasal veya güvenlik amaçlarıyla saklanması gerekmeyen ilişkili Meta tanımlayıcılarını, mesaj içeriklerini, ek meta verilerini ve dahili hizmet kayıtlarını siler veya anonimleştiririz. İşlem tamamlandığında size bilgi verilir.',
    contact: 'Silme talebi gönder'
  }
} as const;

const DataDeletion: React.FC<DataDeletionProps> = ({ lang = 'az', onBack }) => {
  const t = copy[lang] || copy.az;
  return <main className="min-h-screen bg-white">
    <section className="border-b border-emerald-900/50 bg-emerald-950 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-12">
        <button onClick={onBack} className="text-[9px] font-bold uppercase tracking-widest text-emerald-300/70 transition-colors hover:text-white">← {t.back}</button>
        <span className="text-sm font-black uppercase tracking-widest text-white">Volt.az</span>
      </div>
    </section>
    <section className="mx-auto max-w-4xl px-4 py-12 md:py-20">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600">Meta Platform Data</p>
      <h1 className="mt-3 text-4xl font-black text-slate-900 md:text-5xl">{t.title}</h1>
      <p className="mt-5 max-w-3xl leading-7 text-slate-600">{t.intro}</p>
      <div className="mt-10 space-y-5">
        {[[t.revokeTitle, t.revoke], [t.requestTitle, t.request], [t.processTitle, t.process]].map(([title, body]) => <article key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6"><h2 className="font-black text-slate-900">{title}</h2><p className="mt-3 leading-7 text-slate-600">{body}</p></article>)}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href="mailto:support@volt.az?subject=Meta%20Data%20Deletion%20Request" className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-emerald-700">{t.contact}</a>
        <a href="https://www.facebook.com/settings?tab=business_tools" target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition-colors hover:bg-slate-50">Meta Business Integrations</a>
      </div>
      <p className="mt-10 text-xs text-slate-400">{t.updated} · Solarix / Volt.az · support@volt.az</p>
    </section>
  </main>;
};

export default DataDeletion;
