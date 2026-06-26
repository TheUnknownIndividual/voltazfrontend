
import React from 'react';

interface PrivacyPolicyProps {
  lang?: 'az' | 'en' | 'ru' | 'tr';
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ lang = 'az', onBack }) => {
  const t = {
    back: {
      az: 'Geri qayıt',
      en: 'Back',
      ru: 'Назад',
      tr: 'Geri'
    },
    title: {
      az: 'Məxfilik siyasəti',
      en: 'Privacy Policy',
      ru: 'Политика конфиденциальности',
      tr: 'Gizlilik Politikası'
    },
    description: {
      az: `Bu Məxfilik siyasəti Solarix tərəfindən təqdim olunan veb-sayt, müraciət formaları, məsləhət xidmətləri, günəş enerji sistemlərinin layihələndirilməsi, quraşdırılması, monitorinqi və müştəri dəstəyi zamanı şəxsi məlumatların necə toplanıldığını, istifadə edildiyini, saxlanıldığını və qorunduğunu izah edir.
Veb-saytımızdan istifadə etməklə, bizimlə əlaqə saxlamaqla və ya xidmətlərimizdən yararlanmaqla siz bu Məxfilik siyasətində göstərilən şərtlərlə razılaşmış hesab olunursunuz.
`,
      en: `This Privacy Policy explains how Solarix collects, uses, stores, and protects personal information when you use our website, contact forms, consultation services, solar system design, installation, monitoring, and customer support services.
By using our website, contacting us, or using our services, you agree to the terms described in this Privacy Policy.
`,
      ru: `Настоящая Политика конфиденциальности объясняет, как Solarix собирает, использует, хранит и защищает персональные данные при использовании нашего веб-сайта, контактных форм, консультационных услуг, проектирования, установки, мониторинга солнечных энергетических систем и клиентской поддержки.
Используя наш веб-сайт, связываясь с нами или пользуясь нашими услугами, вы соглашаетесь с условиями, указанными в настоящей Политике конфиденциальности.
`,
      tr: `Bu Gizlilik Politikası, Solarix’in web sitesi, iletişim formları, danışmanlık hizmetleri, güneş enerji sistemi tasarımı, kurulumu, izlenmesi ve müşteri destek hizmetleri kapsamında kişisel bilgileri nasıl topladığını, kullandığını, sakladığını ve koruduğunu açıklar.
Web sitemizi kullanarak, bizimle iletişime geçerek veya hizmetlerimizden yararlanarak bu Gizlilik Politikası’nda belirtilen şartları kabul etmiş sayılırsınız.
`,
    },
 updated: {
  az: 'Bu sənəd sonuncu dəfə 5 iyun 2026-cı il tarixində yenilənmişdir.',
  en: 'This document was last updated on June 5, 2026.',
  ru: 'Этот документ был обновлен 5 июня 2026 года.',
  tr: 'Bu belge en son 5 Haziran 2026 tarihinde güncellenmiştir.'
},
    sections: [
      {
        title: {
          az: 'TOPLANAN MƏLUMATLAR',
          en: 'INFORMATION WE COLLECT',
          ru: 'СОБИРАЕМАЯ ИНФОРМАЦИЯ',
          tr: 'TOPLANAN BİLGİLER'
        },
        content: {
          az: `Solarix xidmətlərin göstərilməsi, müraciətlərin cavablandırılması və layihələrin düzgün icrası üçün aşağıdakı məlumatları toplaya bilər:
1.1. Şəxsi məlumatlar
Biz sizdən aşağıdakı şəxsi məlumatları əldə edə bilərik:
•	ad və soyad;
•	telefon nömrəsi;
•	elektron poçt ünvanı;
•	yaşayış və ya obyekt ünvanı;
•	əlaqə üçün təqdim etdiyiniz digər məlumatlar;
•	müştəri kimi müraciət etdiyiniz xidmət növü;
•	günəş enerji sistemi ilə bağlı ilkin tələbləriniz və məqsədləriniz.
1.2. Obyekt və texniki məlumatlar
Günəş enerji sisteminin düzgün qiymətləndirilməsi və layihələndirilməsi üçün aşağıdakı məlumatlar tələb oluna bilər:
•	obyektin ünvanı və yerləşmə məlumatları;
•	damın və ya quraşdırma sahəsinin ölçüləri;
•	dam örtüyünün növü və konstruktiv vəziyyəti;
•	kölgələnmə, maneələr və ətraf mühit şərtləri;
•	mövcud elektrik sərfiyyatı;
•	elektrik abonent kodu;
•	sayğac və qoşulma məlumatları;
•	texniki şərt və digər aidiyyəti sənədlər;
•	günəş paneli, inverter və digər avadanlıqlarla bağlı layihə məlumatları.
1.3. Veb-sayt və texniki məlumatlar
Veb-saytdan istifadə zamanı avtomatik olaraq aşağıdakı texniki məlumatlar toplana bilər:
•	IP ünvanı;
•	cihaz növü;
•	əməliyyat sistemi;
•	brauzer növü və versiyası;
•	veb-sayta daxil olma tarixi və vaxtı;
•	baxılan səhifələr;
•	veb-saytda keçirdiyiniz müddət;
•	istifadəçi davranışı ilə bağlı ümumi analitik məlumatlar;
•	cookies və oxşar texnologiyalar vasitəsilə toplanan texniki məlumatlar.
1.4. Monitorinq və sistem məlumatları
Solarix tərəfindən quraşdırılmış günəş enerji sistemlərində monitorinq tətbiqi və ya inverter platforması istifadə olunduqda aşağıdakı məlumatlar emal oluna bilər:
•	sistemin istehsal etdiyi elektrik enerjisi;
•	obyektin elektrik sərfiyyatı;
•	şəbəkədən alınan enerji;
•	şəbəkəyə ötürülən enerji;
•	inverterin iş vəziyyəti;
•	sistem performansı;
•	texniki xəbərdarlıqlar və nasazlıq bildirişləri;
•	monitorinq tətbiqində görünən digər texniki göstəricilər.
Bu məlumatlar əsasən sistemin işləməsini izləmək, nasazlıqları vaxtında aşkar etmək və müştəriyə texniki dəstək göstərmək məqsədilə istifadə olunur.
`,
          en: `Solarix may collect the following information in order to provide services, respond to inquiries, and properly manage solar energy projects:
•	name and surname;
•	phone number;
•	email address;
•	residential or project address;
•	information you provide through contact forms;
•	type of service requested;
•	electricity consumption details;
•	subscriber or utility-related information, where required;
•	property, roof, or installation area details;
•	IP address;
•	device type;
•	operating system;
•	browser type and version;
•	date and time of website access;
•	pages visited on our website;
•	general website usage behavior;
•	technical information collected through cookies or similar technologies.
During the design and installation of a solar energy system, we may also collect information about the property location, roof dimensions, shading conditions, electrical connection, meter information, technical conditions, subscriber code, and other project-related technical details.
If the installed system includes a monitoring application, technical data such as energy production, energy consumption, energy imported from the grid, energy exported to the grid, inverter status, alerts, and general system performance may also be processed.
`,
          ru: `Solarix может собирать следующую информацию для предоставления услуг, обработки обращений и правильной реализации проектов солнечной энергетики:
•	имя и фамилия;
•	номер телефона;
•	адрес электронной почты;
•	адрес проживания или объекта;
•	информация, предоставленная через контактные формы;
•	тип запрашиваемой услуги;
•	данные о потреблении электроэнергии;
•	абонентская или коммунальная информация, если это необходимо;
•	сведения об объекте, крыше или зоне установки;
•	IP-адрес;
•	тип устройства;
•	операционная система;
•	тип и версия браузера;
•	дата и время посещения веб-сайта;
•	просмотренные страницы;
•	общая информация о поведении пользователя на сайте;
•	технические данные, собираемые через cookies или аналогичные технологии.
В процессе проектирования и установки солнечной энергетической системы мы также можем собирать сведения о местоположении объекта, размерах крыши, условиях затенения, электрическом подключении, данных счетчика, технических условиях, абонентском коде и других технических данных, связанных с проектом.
Если установленная система включает приложение мониторинга, могут обрабатываться технические данные о выработке энергии, потреблении, энергии, полученной из сети, энергии, переданной в сеть, состоянии инвертора, предупреждениях и общей производительности системы.
`,
          tr: `Solarix, hizmet sunmak, başvurulara cevap vermek ve güneş enerji projelerini doğru şekilde yürütmek için aşağıdaki bilgileri toplayabilir:
•	ad ve soyad;
•	telefon numarası;
•	e-posta adresi;
•	ikamet veya proje adresi;
•	iletişim formları aracılığıyla sağladığınız bilgiler;
•	talep edilen hizmet türü;
•	elektrik tüketim bilgileri;
•	gerekli olduğu durumlarda abonelik veya elektrik bağlantısı bilgileri;
•	mülk, çatı veya kurulum alanına ilişkin bilgiler;
•	IP adresi;
•	cihaz türü;
•	işletim sistemi;
•	tarayıcı türü ve sürümü;
•	web sitesine erişim tarihi ve saati;
•	ziyaret edilen sayfalar;
•	web sitesindeki genel kullanıcı davranışı;
•	cookies veya benzer teknolojiler aracılığıyla toplanan teknik bilgiler.
Güneş enerji sisteminin tasarımı ve kurulumu sırasında mülk konumu, çatı ölçüleri, gölgelenme durumu, elektrik bağlantısı, sayaç bilgileri, teknik şartlar, abone kodu ve projeye ilişkin diğer teknik bilgileri de toplayabiliriz.
Kurulan sistem bir izleme uygulaması içeriyorsa, enerji üretimi, enerji tüketimi, şebekeden alınan enerji, şebekeye verilen enerji, inverter durumu, uyarılar ve genel sistem performansı gibi teknik veriler de işlenebilir.
`
        }
      },
      {
        title: {
          az: 'MƏLUMATLARIN İSTİFADƏSİ',
          en: 'HOW WE USE THE INFORMATION',
          ru: 'Использование собранной информации',
          tr: 'BİLGİLERİN KULLANIMI'
        },
        content: {
          az: `Toplanmış məlumatlar yalnız qanuni, zəruri və konkret məqsədlər üçün istifadə olunur.
Solarix sizin məlumatlarınızı aşağıdakı hallarda istifadə edə bilər:
•	sizinlə telefon, e-poçt və ya digər əlaqə vasitələri ilə əlaqə saxlamaq;
•	müraciətiniz əsasında məsləhət vermək;
•	obyektiniz üzrə texniki analiz aparmaq;
•	qiymət təklifi və layihə sənədləri hazırlamaq;
•	quraşdırma komandası ilə işləri koordinasiya etmək;
•	sistem aktivləşdirildikdən sonra monitorinq və texniki dəstək göstərmək;
•	xidmətlərimiz, yeniliklərimiz və xüsusi təkliflərimiz barədə sizi məlumatlandırmaq;
•	sizin razılığınız olduğu halda marketinq və məlumat xarakterli bildirişlər göndərmək.
Siz istənilən vaxt marketinq xarakterli bildirişləri almaqdan imtina edə bilərsiniz.
`,
          en: `We may use your information for the following purposes:
•	to respond to your inquiries;
•	to provide initial consultation;
•	to assess whether your property is suitable for a solar energy system;
•	to conduct site visits and technical assessments;
•	to prepare a customized system design and commercial proposal;
•	to select appropriate equipment and system capacity;
•	to plan and carry out installation works;
•	to assist with documentation and active consumer application processes;
•	to activate and monitor the system;
•	to provide customer and technical support;
•	to identify and resolve technical issues;
•	to improve the quality of our services;
•	to maintain the functionality and security of our website;
•	to comply with legal and regulatory obligations.
With your consent, we may also send you information about our services, updates, and special offers. You may opt out of such communications at any time.
`,
          ru: `Мы можем использовать ваши данные для следующих целей:
•	для ответа на ваши обращения;
•	для предоставления первичной консультации;
•	для оценки пригодности объекта для установки солнечной энергетической системы;
•	для проведения осмотра объекта и технической оценки;
•	для подготовки индивидуального проекта и коммерческого предложения;
•	для подбора оборудования и мощности системы;
•	для планирования и выполнения монтажных работ;
•	для помощи в подготовке документов и оформлении статуса активного потребителя;
•	для активации и мониторинга системы;
•	для предоставления клиентской и технической поддержки;
•	для выявления и устранения технических проблем;
•	для улучшения качества наших услуг;
•	для обеспечения работы и безопасности веб-сайта;
•	для выполнения требований законодательства.
С вашего согласия мы также можем направлять вам информацию о наших услугах, обновлениях и специальных предложениях. Вы можете отказаться от таких уведомлений в любое время.
`,
          tr: `Bilgilerinizi aşağıdaki amaçlarla kullanabiliriz:
•	taleplerinize cevap vermek;
•	ilk danışmanlık hizmetini sağlamak;
•	mülkünüzün güneş enerji sistemi için uygunluğunu değerlendirmek;
•	saha ziyareti ve teknik değerlendirme yapmak;
•	size özel sistem tasarımı ve ticari teklif hazırlamak;
•	uygun ekipmanı ve sistem kapasitesini belirlemek;
•	kurulum çalışmalarını planlamak ve yürütmek;
•	dokümantasyon ve aktif tüketici başvuru süreçlerinde destek sağlamak;
•	sistemi aktive etmek ve izlemek;
•	müşteri ve teknik destek sağlamak;
•	teknik sorunları tespit etmek ve çözmek;
•	hizmet kalitesini iyileştirmek;
•	web sitesinin işlevselliğini ve güvenliğini sağlamak;
•	yasal ve düzenleyici yükümlülükleri yerine getirmek.
Onayınız olması halinde hizmetlerimiz, yeniliklerimiz ve özel tekliflerimiz hakkında bilgilendirme mesajları da gönderebiliriz. Bu tür bildirimleri almaktan istediğiniz zaman vazgeçebilirsiniz.
`
        }
      },
     {
        title: {
          az: 'Məlumatların üçüncü tərəflərlə paylaşılması',
          en: 'Sharing Information with Third Parties',
          ru: 'Передача информации третьим лицам',
          tr: 'Bilgilerin Üçüncü Taraflarla Paylaşılması'
        },
        content: {
          az: `Solarix sizin şəxsi məlumatlarınızı satmır, icarəyə vermir və kommersiya məqsədilə üçüncü tərəflərə ötürmür.
Lakin xidmətlərin düzgün göstərilməsi üçün bəzi məlumatlar aşağıdakı tərəflərlə paylaşılmış ola bilər:
•	quraşdırma və texniki xidmət komandaları;
•	inverter və monitorinq platforması təminatçıları;
•	avadanlıq təchizatçıları;
•	elektrik şəbəkəsi və aidiyyəti dövlət qurumları;
•	sənədləşmə və icazə prosesində iştirak edən tərəflər;
•	IT və veb-sayt xidmət təminatçıları;
•	mühasibat, hüquqi və inzibati xidmət göstərən tərəflər;
•	qanunvericiliklə tələb olunan hallarda dövlət orqanları.
Bu cür paylaşım yalnız xidmətin göstərilməsi və qanuni öhdəliklərin yerinə yetirilməsi üçün zəruri olduğu hallarda həyata keçirilir.
`,
          en: `Solarix does not sell, rent, or commercially transfer your personal information to third parties.
However, where necessary for service delivery, some information may be shared with:
•	installation and technical service teams;
•	inverter and monitoring platform providers;
•	equipment suppliers;
•	electricity network operators and relevant public authorities;
•	parties involved in documentation and permit procedures;
•	IT and website service providers;
•	accounting, legal, and administrative service providers;
•	public authorities where required by law.
Such sharing is carried out only when necessary for service delivery, technical support, project implementation, or legal compliance.
`,
          ru: `Solarix не продает, не сдает в аренду и не передает ваши персональные данные третьим лицам в коммерческих целях.
Однако, если это необходимо для предоставления услуг, часть информации может быть передана следующим сторонам:
•	монтажным и техническим командам;
•	поставщикам инверторов и платформ мониторинга;
•	поставщикам оборудования;
•	операторам электрических сетей и соответствующим государственным органам;
•	сторонам, участвующим в процессах документации и получения разрешений;
•	поставщикам IT-услуг и услуг веб-сайта;
•	бухгалтерским, юридическим и административным поставщикам услуг;
•	государственным органам в случаях, предусмотренных законом.
Такая передача осуществляется только тогда, когда это необходимо для оказания услуги, технической поддержки, реализации проекта или выполнения законных требований.
`,
          tr: `Solarix, kişisel bilgilerinizi satmaz, kiralamaz ve ticari amaçlarla üçüncü taraflara devretmez.
Ancak hizmetlerin doğru şekilde sunulması için gerekli durumlarda bazı bilgiler aşağıdaki taraflarla paylaşılabilir:
•	kurulum ve teknik servis ekipleri;
•	inverter ve izleme platformu sağlayıcıları;
•	ekipman tedarikçileri;
•	elektrik şebekesi işletmecileri ve ilgili kamu kurumları;
•	dokümantasyon ve izin süreçlerinde yer alan taraflar;
•	IT ve web sitesi hizmet sağlayıcıları;
•	muhasebe, hukuk ve idari hizmet sağlayıcıları;
•	kanunen gerekli olduğu durumlarda kamu kurumları.
Bu tür paylaşım yalnızca hizmet sunumu, teknik destek, proje uygulaması veya yasal uyumluluk için gerekli olduğu ölçüde yapılır.
`
        }
      },
      {
        title: {
          az: 'Ödəniş məlumatları',
          en: 'Payment Information',
          ru: 'Платежная информация',
          tr: 'Ödeme Bilgileri'
        },
        content: {
          az: `Əgər gələcəkdə veb-sayt üzərindən onlayn ödəniş imkanı təqdim olunarsa, ödənişlər müvafiq ödəniş sistemi və ya bank xidməti vasitəsilə həyata keçiriləcəkdir.
Solarix kredit və ya debit kart nömrələrini, CVV kodlarını və kartla bağlı həssas ödəniş məlumatlarını öz serverlərində saxlamır.
Ödəniş zamanı təqdim olunan məlumatların emalı müvafiq bank, ödəniş sistemi və ya ödəniş xidməti təminatçısının təhlükəsizlik qaydalarına uyğun olaraq həyata keçirilir.
`,
          en: `If online payment options are introduced on our website in the future, payments will be processed through the relevant bank or payment service provider.
Solarix does not store credit card numbers, debit card numbers, CVV codes, or other sensitive payment card information on its own servers.
Payment information will be processed in accordance with the security rules and privacy policies of the relevant bank or payment provider.
`,
          ru: `Если в будущем на нашем веб-сайте будет доступна онлайн-оплата, платежи будут обрабатываться через соответствующий банк или платежного провайдера.
Solarix не хранит номера кредитных или дебетовых карт, CVV-коды и другие чувствительные платежные данные на своих серверах.
Платежная информация будет обрабатываться в соответствии с правилами безопасности и политиками конфиденциальности соответствующего банка или платежного провайдера.
`,
          tr: `Gelecekte web sitemizde çevrimiçi ödeme seçeneği sunulursa, ödemeler ilgili banka veya ödeme hizmeti sağlayıcısı üzerinden gerçekleştirilecektir.
Solarix, kredi kartı numaralarını, banka kartı numaralarını, CVV kodlarını veya diğer hassas ödeme kartı bilgilerini kendi sunucularında saklamaz.
Ödeme bilgileri, ilgili banka veya ödeme sağlayıcısının güvenlik kuralları ve gizlilik politikalarına uygun olarak işlenir.
`
        }
      },
      {
        title: {
          az: 'Cookies və analitik texnologiyalar',
          en: 'Cookies',
          ru: 'Cookies',
          tr: 'Cookies'
        },
        content: {
          az: `Veb-saytımız istifadəçi təcrübəsini yaxşılaşdırmaq və saytın düzgün işləməsini təmin etmək üçün cookies və oxşar texnologiyalardan istifadə edə bilər.
Cookies aşağıdakı məqsədlərlə istifadə oluna bilər:
•	veb-saytın düzgün işləməsini təmin etmək;
•	istifadəçi sessiyasını tanımaq;
•	dil və istifadəçi seçimlərini yadda saxlamaq;
•	sayt trafikini və istifadəçi davranışını təhlil etmək;
•	xidmət keyfiyyətini və veb-saytın funksionallığını yaxşılaşdırmaq.
Siz brauzer ayarlarından cookies istifadəsini məhdudlaşdıra və ya tamamilə deaktiv edə bilərsiniz. Lakin bu halda veb-saytın bəzi funksiyaları düzgün işləməyə bilər.
`,
          en: `Our website may use cookies and similar technologies to improve user experience and ensure proper website functionality.
Cookies may be used for the following purposes:
•	to ensure the website works properly;
•	to recognize user sessions;
•	to remember language and user preferences;
•	to analyze website traffic and usage behavior;
•	to improve website functionality and service quality.
You may restrict or disable cookies through your browser settings. However, some website features may not function properly if cookies are disabled.
`,
          ru: `Наш веб-сайт может использовать cookies и аналогичные технологии для улучшения пользовательского опыта и обеспечения корректной работы сайта.
Cookies могут использоваться для следующих целей:
•	для обеспечения правильной работы веб-сайта;
•	для распознавания пользовательской сессии;
•	для сохранения языка и пользовательских предпочтений;
•	для анализа трафика и поведения пользователей;
•	для улучшения функциональности сайта и качества услуг.
Вы можете ограничить или отключить cookies в настройках браузера. Однако при отключении cookies некоторые функции сайта могут работать некорректно.
`,
          tr: `Web sitemiz, kullanıcı deneyimini iyileştirmek ve sitenin doğru çalışmasını sağlamak için cookies ve benzer teknolojiler kullanabilir.
Cookies aşağıdaki amaçlarla kullanılabilir:
•	web sitesinin düzgün çalışmasını sağlamak;
•	kullanıcı oturumunu tanımak;
•	dil ve kullanıcı tercihlerini hatırlamak;
•	site trafiğini ve kullanıcı davranışını analiz etmek;
•	web sitesi işlevselliğini ve hizmet kalitesini iyileştirmek.
Tarayıcı ayarlarınızdan cookies kullanımını sınırlayabilir veya tamamen devre dışı bırakabilirsiniz. Ancak cookies devre dışı bırakıldığında web sitesinin bazı özellikleri doğru çalışmayabilir.
`
        }
      },
      {
        title: {
          az: 'Məlumatların saxlanılması',
          en: 'Data Storage',
          ru: 'Хранение данных',
          tr: 'Verilerin Saklanması'
        },
        content: {
          az: `Solarix şəxsi məlumatları yalnız bu Məxfilik siyasətində göstərilən məqsədlər üçün zəruri olduğu müddətdə saxlayır.
Məlumatların saxlanma müddəti aşağıdakılardan asılı ola bilər:
•	xidmətin davam etməsi;
•	layihənin icra mərhələsi;
•	zəmanət və texniki dəstək müddəti;
•	qanunvericiliklə müəyyən edilmiş saxlanma öhdəlikləri;
•	mühasibat və vergi tələbləri;
•	müştəri ilə müqavilə münasibətləri;
•	mümkün hüquqi iddiaların müdafiəsi.
`,
          en: `Solarix stores personal information only for as long as necessary for the purposes described in this Privacy Policy.
The storage period may depend on:
•	the duration of the service;
•	the project stage;
•	warranty and technical support periods;
•	legal storage obligations;
•	accounting and tax requirements;
•	contractual relations with the customer;
•	protection against possible legal claims.
When the information is no longer required, it will be securely deleted, anonymized, or archived.
`,
          ru: `Solarix хранит персональные данные только в течение срока, необходимого для целей, указанных в настоящей Политике конфиденциальности.
Срок хранения может зависеть от:
•	продолжительности предоставления услуги;
•	этапа реализации проекта;
•	гарантийного периода и периода технической поддержки;
•	требований законодательства к хранению данных;
•	бухгалтерских и налоговых требований;
•	договорных отношений с клиентом;
•	защиты от возможных юридических претензий.
`,
          tr: `Solarix, kişisel bilgileri yalnızca bu Gizlilik Politikası’nda belirtilen amaçlar için gerekli olduğu süre boyunca saklar.
Saklama süresi aşağıdakilere bağlı olabilir:
•	hizmet süresi;
•	projenin uygulama aşaması;
•	garanti ve teknik destek süreleri;
•	yasal saklama yükümlülükleri;
•	muhasebe ve vergi gereklilikleri;
•	müşteri ile sözleşmesel ilişkiler;
•	olası hukuki taleplere karşı korunma.
`
        }
      },
      {
        title: {
          az: 'Məlumatların təhlükəsizliyi',
          en: 'Data Security',
          ru: 'Безопасность данных',
          tr: 'Veri Güvenliği'
        },
        content: {
          az: `Solarix şəxsi məlumatların təhlükəsizliyini qorumaq üçün müvafiq texniki və təşkilati tədbirlər görür.
Bu tədbirlərə aşağıdakılar daxil ola bilər:
•	məlumatlara girişin məhdudlaşdırılması;
•	yalnız səlahiyyətli şəxslərə giriş icazəsi verilməsi;
•	təhlükəsiz server və sistemlərdən istifadə;
•	SSL və digər təhlükəsiz ötürmə texnologiyalarından istifadə;
•	daxili nəzarət və məlumatların qorunması prosedurları;
•	sistemlərin mütəmadi yoxlanılması və texniki nəzarət.
Bununla belə, internet üzərindən məlumat ötürülməsi tamamilə risksiz deyil. Solarix məlumatlarınızı qorumaq üçün ağlabatan və zəruri tədbirlər görsə də, elektron ötürülmələrin mütləq təhlükəsizliyinə tam zəmanət verilə bilməz.
`,
          en: `Solarix takes appropriate technical and organizational measures to protect personal information.
These measures may include:
•	limiting access to personal information;
•	allowing access only to authorized personnel;
•	using secure systems and servers;
•	using SSL and other secure data transmission technologies;
•	applying internal data protection procedures;
•	monitoring and maintaining system security.
However, transmission of information over the internet is not completely risk-free. Although Solarix takes reasonable measures to protect your information, absolute security of electronic transmission cannot be guaranteed.
`,
          ru: `Solarix принимает соответствующие технические и организационные меры для защиты персональных данных.
Такие меры могут включать:
•	ограничение доступа к персональным данным;
•	предоставление доступа только уполномоченным лицам;
•	использование защищенных систем и серверов;
•	использование SSL и других технологий безопасной передачи данных;
•	применение внутренних процедур защиты данных;
•	контроль и техническое обслуживание безопасности систем.
Тем не менее передача информации через интернет не является полностью безрисковой. Несмотря на то, что Solarix принимает меры для защиты информации, абсолютная безопасность электронной передачи данных не может быть гарантирована.
`,
          tr: `Solarix, kişisel bilgileri korumak için uygun teknik ve organizasyonel önlemler alır.
Bu önlemler şunları içerebilir:
•	kişisel bilgilere erişimin sınırlandırılması;
•	yalnızca yetkili personele erişim verilmesi;
•	güvenli sistem ve sunucuların kullanılması;
•	SSL ve diğer güvenli veri iletim teknolojilerinin kullanılması;
•	dahili veri koruma prosedürlerinin uygulanması;
•	sistem güvenliğinin izlenmesi ve sürdürülmesi.
Bununla birlikte, internet üzerinden bilgi aktarımı tamamen risksiz değildir. Solarix bilgilerinizi korumak için makul önlemler alsa da elektronik veri iletiminin mutlak güvenliği garanti edilemez.
`
        }
      },
      {
        title: {
          az: 'Monitorinq tətbiqi və üçüncü tərəf platformaları',
          en: 'Monitoring Applications and Third-Party Platforms',
          ru: 'Приложения мониторинга и сторонние платформы',
          tr: 'İzleme Uygulamaları ve Üçüncü Taraf Platformları'
        },
        content: {
          az: `Solarix quraşdırılmış günəş enerji sistemlərinin izlənilməsi üçün inverter istehsalçılarının və ya digər texniki platformaların monitorinq tətbiqlərindən istifadə edə bilər.
Bu platformalar vasitəsilə siz aşağıdakı məlumatları görə bilərsiniz:
•	enerji istehsalı;
•	enerji sərfiyyatı;
•	şəbəkədən alınan enerji;
•	şəbəkəyə ötürülən enerji;
•	sistemin gündəlik, aylıq və illik göstəriciləri;
•	inverterin iş vəziyyəti;
•	texniki xəbərdarlıqlar.
Bu tətbiqlər və platformalar üçüncü tərəf təminatçılarına məxsus ola bilər. Belə hallarda həmin platformaların öz məxfilik siyasəti və istifadə şərtləri də tətbiq oluna bilər.
`,
          en: `Solarix may use inverter manufacturer platforms or other monitoring applications to track the performance of installed solar energy systems.
Through such platforms, customers may be able to view:
•	energy production;
•	energy consumption;
•	energy imported from the grid;
•	energy exported to the grid;
•	daily, monthly, and yearly system performance;
•	inverter operating status;
•	technical alerts and notifications.
These applications and platforms may belong to third-party providers. In such cases, their own privacy policies and terms of use may also apply.
`,
          ru: `Solarix может использовать платформы производителей инверторов или другие приложения мониторинга для отслеживания работы установленных солнечных энергетических систем.
Через такие платформы клиенты могут видеть:
•	выработку электроэнергии;
•	потребление электроэнергии;
•	энергию, полученную из сети;
•	энергию, переданную в сеть;
•	дневные, месячные и годовые показатели системы;
•	рабочее состояние инвертора;
•	технические предупреждения и уведомления.
Такие приложения и платформы могут принадлежать сторонним поставщикам. В таких случаях также могут применяться их собственные политики конфиденциальности и условия использования.
`,
          tr: `Solarix, kurulu güneş enerji sistemlerinin performansını takip etmek için inverter üreticilerinin platformlarını veya diğer izleme uygulamalarını kullanabilir.
Bu platformlar aracılığıyla müşteriler aşağıdaki bilgileri görüntüleyebilir:
•	enerji üretimi;
•	enerji tüketimi;
•	şebekeden alınan enerji;
•	şebekeye verilen enerji;
•	günlük, aylık ve yıllık sistem performansı;
•	inverter çalışma durumu;
•	teknik uyarılar ve bildirimler.
Bu uygulamalar ve platformlar üçüncü taraf sağlayıcılara ait olabilir.
`
        }
      },
      {
        title: {
          az: 'Uşaqların məlumatları',
          en: 'Children’s Information',
          ru: 'Данные детей',
          tr: 'Çocuklara Ait Bilgiler'
        },
        content: {
          az: `Solarix xidmətləri yetkinlik yaşına çatmayan şəxslərə yönəlməyib.
Biz bilərəkdən uşaqlardan şəxsi məlumat toplamırıq. Əgər yetkinlik yaşına çatmayan şəxslə bağlı məlumat valideyn və ya qanuni nümayəndə tərəfindən təqdim olunarsa, həmin məlumat yalnız müvafiq xidmətin göstərilməsi və qanuni məqsədlər üçün istifadə edilə bilər.
`,
          en: `Solarix services are not directed at children.
We do not knowingly collect personal information from minors. If information related to a minor is provided by a parent or legal representative, it will only be used for lawful and necessary service-related purposes.
`,
          ru: `Услуги Solarix не предназначены для детей.
Мы сознательно не собираем персональные данные несовершеннолетних. Если информация о несовершеннолетнем предоставляется родителем или законным представителем, она используется только для законных и необходимых целей, связанных с предоставлением услуги.
`,
          tr: `Solarix hizmetleri çocuklara yönelik değildir.
Bilerek reşit olmayan kişilerden kişisel bilgi toplamıyoruz. Bir çocuğa ait bilgi ebeveyn veya yasal temsilci tarafından sağlanırsa, bu bilgi yalnızca yasal ve hizmetle ilgili gerekli amaçlar için kullanılır.
`
        }
      },
      {
        title: {
          az: 'İstifadəçi hüquqları',
          en: 'User Rights',
          ru: 'Права пользователя',
          tr: 'Kullanıcı Hakları'
        },
        content: {
          az: `Siz şəxsi məlumatlarınızla bağlı aşağıdakı hüquqlara malik ola bilərsiniz:
•	haqqınızda hansı məlumatların toplandığını öyrənmək;
•	şəxsi məlumatlarınıza giriş tələb etmək;
•	yanlış və ya natamam məlumatların düzəldilməsini tələb etmək;
•	qanunvericiliyə uyğun hallarda məlumatların silinməsini tələb etmək;
•	məlumatların emalına etiraz etmək;
•	marketinq bildirişlərindən imtina etmək;
•	məlumatların istifadəsi ilə bağlı izahat almaq.
Bu hüquqlardan istifadə etmək üçün bizimlə əlaqə saxlaya bilərsiniz.
`,
          en: `You may have the right to:
•	request information about the personal data we hold about you;
•	request access to your personal information;
•	request correction of inaccurate or incomplete information;
•	request deletion of your information where permitted by law;
•	object to the processing of your information;
•	withdraw consent for marketing communications;
•	request clarification on how your information is used.
To exercise these rights, you may contact us using the contact details provided below.
`,
          ru: `Вы можете иметь право:
•	запросить информацию о том, какие персональные данные о вас хранятся;
•	запросить доступ к своим персональным данным;
•	потребовать исправления неточной или неполной информации;
•	потребовать удаления данных в случаях, разрешенных законом;
•	возразить против обработки данных;
•	отозвать согласие на получение маркетинговых сообщений;
•	запросить разъяснение о том, как используются ваши данные.
Для реализации этих прав вы можете связаться с нами по контактным данным, указанным ниже.
`,
          tr: `Aşağıdaki haklara sahip olabilirsiniz:
•	hakkınızda hangi kişisel verilerin saklandığını öğrenmek;
•	kişisel bilgilerinize erişim talep etmek;
•	yanlış veya eksik bilgilerin düzeltilmesini talep etmek;
•	kanunun izin verdiği durumlarda bilgilerinizin silinmesini talep etmek;
•	bilgilerinizin işlenmesine itiraz etmek;
•	pazarlama iletişimleri için verdiğiniz onayı geri çekmek;
•	bilgilerinizin nasıl kullanıldığına dair açıklama talep etmek.
Bu hakları kullanmak için aşağıdaki iletişim bilgilerinden bizimle iletişime geçebilirsiniz.
`
        }
      },
      {
        title: {
          az: 'Məlumatların beynəlxalq ötürülməsi',
          en: 'International Data Transfer',
          ru: 'Международная передача данных',
          tr: 'Uluslararası Veri Aktarımı'
        },
        content: {
          az: `Bəzi hallarda istifadə etdiyimiz texniki xidmətlər, monitorinq platformaları, serverlər və ya bulud sistemləri Azərbaycan Respublikasından kənarda yerləşə bilər.
Belə hallarda məlumatların ötürülməsi yalnız xidmətin göstərilməsi üçün zəruri olduğu halda həyata keçirilir.
`,
          en: `In some cases, the technical services, monitoring platforms, servers, or cloud systems we use may be located outside Azerbaijan.
Where such transfer is necessary, it will be carried out only for service-related purposes.
`,
          ru: `В некоторых случаях технические сервисы, платформы мониторинга, серверы или облачные системы, которые мы используем, могут находиться за пределами Азербайджана.
Если такая передача необходима, она осуществляется только в целях предоставления услуги и с применением соответствующих мер безопасности.
`,
          tr: `Bazı durumlarda kullandığımız teknik hizmetler, izleme platformları, sunucular veya bulut sistemleri Azerbaycan dışında bulunabilir.
Böyle bir aktarım gerekli olduğunda, bu yalnızca hizmetle ilgili amaçlarla ve uygun güvenlik önlemleri alınarak gerçekleştirilir.
`
        }
      },
      {
        title: {
          az: 'Qanuni tələblər',
          en: 'Legal Requirements',
          ru: 'Законные требования',
          tr: 'Yasal Gereklilikler'
        },
        content: {
          az: `Solarix qanunvericiliklə tələb olunan hallarda şəxsi məlumatları dövlət orqanlarına, məhkəmələrə və ya digər səlahiyyətli qurumlara təqdim edə bilər.
Bu cür təqdimat yalnız qanuni tələb, məhkəmə qərarı və ya müvafiq dövlət orqanının rəsmi sorğusu əsasında həyata keçirilir.
`,
          en: `Solarix may disclose personal information to public authorities, courts, or other authorized bodies where required by law, court order, or official request.`,
          ru: `Solarix может раскрывать персональные данные государственным органам, судам или другим уполномоченным органам, если это требуется законом, судебным решением или официальным запросом.`,
          tr: `Solarix, kanun, mahkeme kararı veya resmi talep gereği kişisel bilgileri kamu kurumlarına, mahkemelere veya diğer yetkili makamlara açıklayabilir.`
        }
      },
      {
        title: {
          az: 'Məxfilik siyasətində dəyişikliklər',
          en: 'Changes to This Privacy Policy',
          ru: 'Изменения в Политике конфиденциальности',
          tr: 'Gizlilik Politikasındaki Değişiklikler'
        },
        content: {
          az: `Solarix bu Məxfilik siyasətini vaxtaşırı yeniləyə bilər.
Dəyişikliklər veb-saytda dərc edildiyi andan qüvvəyə minir. Məxfilik siyasətinin yenilənmiş versiyası dərc edildikdən sonra veb-saytdan və xidmətlərdən istifadəyə davam etməyiniz həmin dəyişikliklərlə razılaşmanız kimi qəbul oluna bilər.
`,
          en: `Solarix may update this Privacy Policy from time to time.
Any changes will become effective once published on our website. Continued use of our website or services after such changes means that you accept the updated Privacy Policy.
`,
          ru: `Solarix может время от времени обновлять настоящую Политику конфиденциальности.
Любые изменения вступают в силу после публикации на нашем веб-сайте. Продолжение использования веб-сайта или услуг после внесения изменений означает ваше согласие с обновленной Политикой конфиденциальности.
`,
          tr: `Solarix bu Gizlilik Politikası’nı zaman zaman güncelleyebilir.
Değişiklikler web sitemizde yayımlandığı anda yürürlüğe girer. Bu değişikliklerden sonra web sitemizi veya hizmetlerimizi kullanmaya devam etmeniz, güncellenmiş Gizlilik Politikası’nı kabul ettiğiniz anlamına gelir.
`
        }
      },
      {
        title: {
          az: 'Əlaqə',
          en: 'Contact',
          ru: 'Контакты',
          tr: 'İletişim'
        },
        content: {
          az: `Məxfilik siyasəti, şəxsi məlumatlarınızın emalı və ya məlumatlarınızla bağlı hüquqlarınız barədə suallarınız olarsa, bizimlə əlaqə saxlaya bilərsiniz:
Şirkət: Solarix
E-poçt: support@volt.az
Telefon: +994 50 418 00 01
Ünvan: Bakı, Kövkəb Səfərəliyeva 16e, Time Business Centere 6-cı mərtəbə
`,
          en: `If you have any questions about this Privacy Policy or the processing of your personal information, you may contact us:
Company: Solarix
Email: support@volt.az
Phone: +994 50 418 00 01
Address: Baku, Kovkab Safaraliyeva 16e, Time Business Center, 6th floor
`,
          ru: `Если у вас есть вопросы по настоящей Политике конфиденциальности или обработке ваших персональных данных, вы можете связаться с нами:
Компания: Solarix
Электронная почта: support@volt.az
Телефон: +994 50 418 00 01
Адрес: Баку, ул. Ковкаб Сафарлиевой 16e, Time Business Center, 6-й этаж
`,
          tr: `Bu Gizlilik Politikası veya kişisel bilgilerinizin işlenmesi hakkında sorularınız varsa bizimle iletişime geçebilirsiniz:
Şirket: Solarix
E-posta: support@volt.az
Telefon: +994 50 418 00 01
Adres: Bakü, Kövkeb Sefereliyeva 16e, Time Business Center, 6. kat
`
        }
      },
    ]
  };

  return (
    <div className="bg-white min-h-screen relative">
      <section className="bg-emerald-950 py-4 border-b border-emerald-900/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between relative z-10">
          <button onClick={onBack} className="flex items-center gap-1.5 text-emerald-300/60 hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t.back[lang]}
          </button>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">{t.title[lang]}</h1>
           
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">

        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">
          {t.title[lang]}
        </h1>
        <div className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-line mb-10 group-hover:border-emerald-500 transition-colors">
                {t.description[lang]}
              </div>

        <div className="space-y-12">
          {t.sections.map((section, idx) => (
            <div key={idx} className="group">
              <h2 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-4">
                <span className="w-8 h-[2px] bg-emerald-600/20 group-hover:w-12 transition-all"></span>
                {section.title[lang]}
              </h2>
              <div className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-line pl-12 border-l-2 border-slate-100 group-hover:border-emerald-500 transition-colors">
                {section.content[lang]}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
          <p className="text-slate-400 text-xs italic">
            {t.updated[lang]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
