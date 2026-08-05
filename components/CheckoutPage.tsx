import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, Edit3, Home, Loader2, MapPin, PackageCheck, Phone, ShieldCheck, ShoppingCart } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useProduct } from '../contexts/ProductContext';
import { API_ENDPOINTS } from '../utils/constants';
import { getStockWarning } from '../utils/productInventory';

type Language = 'az' | 'en' | 'ru' | 'tr';
type StepKey = 'contact' | 'delivery' | 'payment' | 'review' | 'confirmation';

interface User {
  email: string;
  name: string;
  role: string;
  address?: string;
  phone?: string;
  city?: string;
}

interface CartLine {
  id: string;
  quantity: number;
  power?: string;
}

interface CheckoutPageProps {
  cart?: CartLine[];
  singleProduct?: CartLine | null;
  user?: User | null;
  lang?: Language;
  onBackToCart: () => void;
  onGoHome?: () => void;
  onContinueShopping: () => void;
  onViewOrders: () => void;
  onOrderCreated?: (order: any, source: 'cart' | 'single') => void;
  onCustomerContactCaptured?: (contact: { name: string; phone: string; email: string; address: string; city?: string }) => void;
  onLangChange?: (lang: Language) => void;
  onNavigate?: (page: any, id?: string, extra?: any) => void;
}

const CHECKOUT_STORAGE_KEY = 'volt_checkout_state_v1';
const RECENT_ORDERS_KEY = 'volt_recent_order_refs';
const SAVED_CONTACT_KEY = 'volt_checkout_contact_v1';
const CHECKOUT_CONTACTS_BY_EMAIL_KEY = 'volt_checkout_contacts_by_email_v1';
const PICKUP_LOCATION = 'Volt.az pickup point, Baku';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base md:text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10';

const checkoutCopy = {
  az: {
    secure: 'Təhlükəsiz checkout',
    returnCart: 'Səbətə qayıt',
    summary: 'Sifariş xülasəsi',
    products: 'Məhsullar',
    productCount: 'məhsul',
    delivery: 'Çatdırılma',
    deliveryLater: 'Qiymət sonradan veriləcək',
    deliveryLaterLong: 'Ünvana çatdırılma qiyməti sifarişdən sonra menecer tərəfindən hesablanıb bildiriləcək.',
    pickupSecure: 'Təhvil məntəqəsinin dəqiq məlumatı təhlükəsizlik məqsədilə email ilə göndəriləcək.',
    total: 'Yekun',
    manual: 'Qiymət, stok və ya çatdırılma menecer tərəfindən təsdiqlənəcək.',
    contact: 'Əlaqə məlumatları',
    contactSaved: 'Əlaqə məlumatlarınız saxlanılıb. İstəsəniz açıb redaktə edə bilərsiniz.',
    contactPrefill: 'Profil məlumatlarınız əvvəlcədən doldurulub. Dəyişikliklər yalnız bu sifariş üçün istifadə olunur.',
    name: 'Ad və soyad',
    phone: 'Telefon',
    email: 'Email',
    saveProfile: 'Növbəti sifarişlər üçün yadda saxla',
    toDelivery: 'Çatdırılmaya keç',
    deliveryStep: 'Çatdırılma',
    addressDelivery: 'Ünvana çatdırılma',
    addressDeliveryDetail: 'Çatdırılma qiyməti sonradan hesablanıb sizə bildiriləcək.',
    pickup: 'Təhvil məntəqəsindən götürmə',
    pickupDetail: 'Standart məntəqə: Volt.az pickup point, Baku.',
    phoneConfirm: 'Telefonla təsdiqlə',
    phoneConfirmDetail: 'Menecer sifarişi yoxlayıb çatdırılmanı sizinlə razılaşdırır.',
    city: 'Şəhər / region',
    district: 'Rayon',
    street: 'Küçə və bina',
    apartment: 'Mənzil / ofis',
    note: 'Qeyd',
    pickupPoint: 'Təhvil məntəqəsi',
    toPayment: 'Ödənişə keç',
    payment: 'Ödəniş',
    bankTransfer: 'Bank köçürməsi',
    bankTransferDetail: 'Rekvizitlər sifariş təsdiqindən sonra göndərilir.',
    afterConfirm: 'Təsdiqdən sonra ödəniş',
    afterConfirmDetail: 'Komandamız qiymət və stok təsdiqindən sonra sizinlə əlaqə saxlayacaq.',
    consultation: 'Satış konsultasiyası',
    consultationDetail: 'Komanda ən uyğun ödəniş və təhvil variantını təklif edir.',
    managerContact: 'Komandamız sizinlə əlaqə saxlayacaq',
    managerContactDetail: 'Menecerimiz qiymət, stok, çatdırılma və ödəniş şərtlərini sizinlə təsdiqləyəcək.',
    onlineOff: 'Onlayn kart ödənişi müvəqqəti deaktivdir. Sifariş yaradılır, komanda telefon və ya email ilə əlaqə saxlayır.',
    toReview: 'Yoxlamaya keç',
    review: 'Yoxla və göndər',
    confirmed: 'Təsdiqləndi',
    waiting: 'Təsdiq gözləyir',
    accept: 'Sifariş məlumatlarını yoxladım və VOLT.AZ komandasının təsdiq üçün əlaqə saxlamasını qəbul edirəm.',
    acceptTerms: 'Alış şərtləri ilə razıyam.',
    termsLink: 'Alış şərtləri',
    submitRequest: 'Sifariş Sorğusu Göndər',
    submit: 'Sifarişi Göndər',
    sending: 'Göndərilir...',
    success: 'Sifariş qeydə alındı',
    next: 'Komandamız sifarişi yoxlayıb növbəti addım üçün telefon və ya email ilə əlaqə saxlayacaq.',
    quoteSuccess: 'Sorğunuz qeydə alındı!',
    quoteNext: 'Hazırda bu məhsul anbarımızda mövcud olmadığı üçün qiymət və çatdırılma şərtləri saytımızda göstərilən məlumatlardan fərqlənə bilər. Menecerimiz sizinlə ən qısa zamanda əlaqə saxlamağa çalışacaq. Sifarişinizi daha tez dəqiqləşdirmək istəyirsinizsə, "Bizimlə Əlaqə" bölməsindən bizə müraciət edə bilərsiniz, menecerimiz mövcud məlumatlar əsasında qiymət, çatdırılma müddəti və digər detallar barədə sizə kömək etməyə çalışacaq.\nTəşəkkür edirik!',
    myOrders: 'Sifarişlərim',
    continue: 'Davam et',
    print: 'Print',
    noItems: 'Checkout üçün məhsul yoxdur.',
    retry: 'Yenidən cəhd et',
    continueShopping: 'Alış-verişə davam et',
    loadingFailed: 'Səbət məlumatları yüklənmədi. Yenidən cəhd edin.',
    edit: 'Redaktə',
    standard: 'Standart',
    nextButton: 'Davam et',
    sendShort: 'Göndər',
    requestShort: 'Sorğu göndər',
  },
  en: {
    secure: 'Secure checkout',
    returnCart: 'Return to cart',
    summary: 'Order summary',
    products: 'Products',
    productCount: 'items',
    delivery: 'Delivery',
    deliveryLater: 'Priced later',
    deliveryLaterLong: 'Address delivery pricing will be calculated and shared by our manager after the order.',
    pickupSecure: 'Exact pickup details will be sent by email for security.',
    total: 'Total',
    manual: 'Price, stock, or delivery will be confirmed by a manager.',
    contact: 'Contact details',
    contactSaved: 'Your contact details are saved. You can open and edit them if needed.',
    contactPrefill: 'Your profile details are prefilled. Edits are used for this order only.',
    name: 'Full name',
    phone: 'Phone',
    email: 'Email',
    saveProfile: 'Save for next orders',
    toDelivery: 'Continue to delivery',
    deliveryStep: 'Delivery',
    addressDelivery: 'Delivery to address',
    addressDeliveryDetail: 'Delivery price will be calculated and shared later.',
    pickup: 'Pickup point',
    pickupDetail: 'Default point: Volt.az pickup point, Baku.',
    phoneConfirm: 'Confirm by phone',
    phoneConfirmDetail: 'A manager will review the order and agree delivery with you.',
    city: 'City / region',
    district: 'District',
    street: 'Street and building',
    apartment: 'Apartment / office',
    note: 'Note',
    pickupPoint: 'Pickup point',
    toPayment: 'Continue to payment',
    payment: 'Payment',
    bankTransfer: 'Bank transfer',
    bankTransferDetail: 'Bank details are sent after order confirmation.',
    afterConfirm: 'Pay after confirmation',
    afterConfirmDetail: 'Our team will contact you after price and stock confirmation.',
    consultation: 'Sales consultation',
    consultationDetail: 'The team will suggest the best payment and pickup option.',
    managerContact: 'Our team will contact you',
    managerContactDetail: 'Our manager will confirm price, stock, delivery, and payment terms with you.',
    onlineOff: 'Online card payment is temporarily disabled. Your order is created and the team will contact you by phone or email.',
    toReview: 'Continue to review',
    review: 'Review and submit',
    confirmed: 'Confirmed',
    waiting: 'Waiting for confirmation',
    accept: 'I reviewed the order details and agree that VOLT.AZ may contact me for confirmation.',
    acceptTerms: 'I agree to the purchase terms.',
    termsLink: 'Purchase terms',
    submitRequest: 'Submit Order Request',
    submit: 'Submit Order',
    sending: 'Sending...',
    success: 'Order received',
    next: 'Our team will review the order and contact you by phone or email for the next step.',
    quoteSuccess: 'Your request has been recorded.',
    quoteNext: 'Your request has been recorded. Since this product is out of stock or requires price confirmation, price and delivery terms may differ. Our manager will contact you within 24 hours. You can also contact our team from the Contact section to speed up the request. Thank you!',
    myOrders: 'My orders',
    continue: 'Continue',
    print: 'Print',
    noItems: 'There are no checkout items.',
    retry: 'Retry',
    continueShopping: 'Continue shopping',
    loadingFailed: 'Cart details failed to load. Please retry.',
    edit: 'Edit',
    standard: 'Standard',
    nextButton: 'Continue',
    sendShort: 'Submit',
    requestShort: 'Submit request',
  },
  ru: {
    secure: 'Безопасное оформление',
    returnCart: 'Вернуться в корзину',
    summary: 'Итог заказа',
    products: 'Товары',
    productCount: 'товаров',
    delivery: 'Доставка',
    deliveryLater: 'Цена позже',
    deliveryLaterLong: 'Стоимость доставки по адресу будет рассчитана и сообщена менеджером после заказа.',
    pickupSecure: 'Точные данные пункта выдачи будут отправлены по email в целях безопасности.',
    total: 'Итого',
    manual: 'Цена, наличие или доставка будут подтверждены менеджером.',
    contact: 'Контактные данные',
    contactSaved: 'Ваши контакты сохранены. При необходимости их можно открыть и изменить.',
    contactPrefill: 'Данные профиля заполнены заранее. Изменения используются только для этого заказа.',
    name: 'Имя и фамилия',
    phone: 'Телефон',
    email: 'Email',
    saveProfile: 'Сохранить для следующих заказов',
    toDelivery: 'К доставке',
    deliveryStep: 'Доставка',
    addressDelivery: 'Доставка по адресу',
    addressDeliveryDetail: 'Стоимость доставки будет рассчитана и сообщена позже.',
    pickup: 'Самовывоз',
    pickupDetail: 'Стандартный пункт: Volt.az pickup point, Baku.',
    phoneConfirm: 'Подтвердить по телефону',
    phoneConfirmDetail: 'Менеджер проверит заказ и согласует доставку.',
    city: 'Город / регион',
    district: 'Район',
    street: 'Улица и здание',
    apartment: 'Квартира / офис',
    note: 'Примечание',
    pickupPoint: 'Пункт выдачи',
    toPayment: 'К оплате',
    payment: 'Оплата',
    bankTransfer: 'Банковский перевод',
    bankTransferDetail: 'Реквизиты отправляются после подтверждения заказа.',
    afterConfirm: 'Оплата после подтверждения',
    afterConfirmDetail: 'Команда свяжется после подтверждения цены и наличия.',
    consultation: 'Консультация продаж',
    consultationDetail: 'Команда предложит лучший способ оплаты и получения.',
    managerContact: 'Наша команда свяжется с вами',
    managerContactDetail: 'Менеджер подтвердит цену, наличие, доставку и условия оплаты.',
    onlineOff: 'Онлайн-оплата картой временно отключена. Заказ будет создан, команда свяжется по телефону или email.',
    toReview: 'К проверке',
    review: 'Проверить и отправить',
    confirmed: 'Подтверждено',
    waiting: 'Ожидает подтверждения',
    accept: 'Я проверил данные заказа и согласен, что VOLT.AZ свяжется для подтверждения.',
    acceptTerms: 'Я согласен с условиями покупки.',
    termsLink: 'Условия покупки',
    submitRequest: 'Отправить запрос',
    submit: 'Отправить заказ',
    sending: 'Отправляется...',
    success: 'Заказ принят',
    next: 'Команда проверит заказ и свяжется по телефону или email.',
    quoteSuccess: 'Ваш запрос зарегистрирован.',
    quoteNext: 'Ваш запрос зарегистрирован. Так как товар отсутствует на складе или требует подтверждения цены, условия цены и доставки могут отличаться. Менеджер свяжется с вами в течение 24 часов. Вы также можете связаться с нами через раздел Контакты, чтобы ускорить запрос. Спасибо!',
    myOrders: 'Мои заказы',
    continue: 'Продолжить',
    print: 'Печать',
    noItems: 'Нет товаров для оформления.',
    retry: 'Повторить',
    continueShopping: 'Продолжить покупки',
    loadingFailed: 'Не удалось загрузить корзину. Повторите попытку.',
    edit: 'Изменить',
    standard: 'Стандарт',
    nextButton: 'Продолжить',
    sendShort: 'Отправить',
    requestShort: 'Запрос',
  },
  tr: {
    secure: 'Güvenli checkout',
    returnCart: 'Sepete dön',
    summary: 'Sipariş özeti',
    products: 'Ürünler',
    productCount: 'ürün',
    delivery: 'Teslimat',
    deliveryLater: 'Fiyat sonra',
    deliveryLaterLong: 'Adrese teslimat ücreti siparişten sonra hesaplanıp bildirilecek.',
    pickupSecure: 'Güvenlik için kesin teslim noktası bilgisi email ile gönderilecek.',
    total: 'Toplam',
    manual: 'Fiyat, stok veya teslimat yönetici tarafından onaylanacak.',
    contact: 'İletişim bilgileri',
    contactSaved: 'İletişim bilgileriniz kayıtlı. Gerekirse açıp düzenleyebilirsiniz.',
    contactPrefill: 'Profil bilgileriniz dolduruldu. Değişiklikler yalnızca bu sipariş için kullanılır.',
    name: 'Ad soyad',
    phone: 'Telefon',
    email: 'Email',
    saveProfile: 'Sonraki siparişler için kaydet',
    toDelivery: 'Teslimata geç',
    deliveryStep: 'Teslimat',
    addressDelivery: 'Adrese teslimat',
    addressDeliveryDetail: 'Teslimat fiyatı sonra hesaplanıp bildirilecek.',
    pickup: 'Teslim noktasından alma',
    pickupDetail: 'Varsayılan nokta: Volt.az pickup point, Baku.',
    phoneConfirm: 'Telefonla onayla',
    phoneConfirmDetail: 'Yönetici siparişi kontrol edip teslimatı sizinle netleştirir.',
    city: 'Şehir / bölge',
    district: 'İlçe',
    street: 'Sokak ve bina',
    apartment: 'Daire / ofis',
    note: 'Not',
    pickupPoint: 'Teslim noktası',
    toPayment: 'Ödemeye geç',
    payment: 'Ödeme',
    bankTransfer: 'Banka havalesi',
    bankTransferDetail: 'Banka bilgileri sipariş onayından sonra gönderilir.',
    afterConfirm: 'Onaydan sonra ödeme',
    afterConfirmDetail: 'Fiyat ve stok onayından sonra ekip sizinle iletişime geçer.',
    consultation: 'Satış danışmanlığı',
    consultationDetail: 'Ekip en uygun ödeme ve teslim seçeneğini önerir.',
    managerContact: 'Ekibimiz sizinle iletişime geçecek',
    managerContactDetail: 'Yöneticimiz fiyat, stok, teslimat ve ödeme şartlarını sizinle netleştirecek.',
    onlineOff: 'Online kart ödemesi geçici olarak kapalı. Sipariş oluşturulur, ekip telefon veya email ile iletişime geçer.',
    toReview: 'Kontrole geç',
    review: 'Kontrol et ve gönder',
    confirmed: 'Onaylandı',
    waiting: 'Onay bekliyor',
    accept: 'Sipariş bilgilerini kontrol ettim ve VOLT.AZ ekibinin onay için iletişime geçmesini kabul ediyorum.',
    acceptTerms: 'Satın alma şartlarını kabul ediyorum.',
    termsLink: 'Satın alma şartları',
    submitRequest: 'Sipariş Talebi Gönder',
    submit: 'Siparişi Gönder',
    sending: 'Gönderiliyor...',
    success: 'Sipariş alındı',
    next: 'Ekibimiz siparişi kontrol edip telefon veya email ile sizinle iletişime geçecek.',
    quoteSuccess: 'Talebiniz kaydedildi.',
    quoteNext: 'Talebiniz kaydedildi. Bu ürün stokta olmadığı veya fiyat onayı gerektirdiği için fiyat ve teslimat şartları farklı olabilir. Yöneticimiz 24 saat içinde sizinle iletişime geçecektir. Talebi hızlandırmak için İletişim bölümünden ekibimizle görüşebilirsiniz. Teşekkür ederiz!',
    myOrders: 'Siparişlerim',
    continue: 'Devam et',
    print: 'Yazdır',
    noItems: 'Checkout için ürün yok.',
    retry: 'Tekrar dene',
    continueShopping: 'Alışverişe devam et',
    loadingFailed: 'Sepet bilgileri yüklenemedi. Tekrar deneyin.',
    edit: 'Düzenle',
    standard: 'Standart',
    nextButton: 'Devam et',
    sendShort: 'Gönder',
    requestShort: 'Talep gönder',
  },
};

const getSavedContact = () => {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_CONTACT_KEY) || 'null');
    return parsed?.fullName && parsed?.phone && parsed?.email ? parsed : null;
  } catch {
    return null;
  }
};

const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || fullName.trim(),
    lastName: parts.slice(1).join(' ') || '-',
  };
};

const getDeliveryAddress = (delivery: any) =>
  [
    delivery.cityOrRegion,
    delivery.district,
    delivery.streetAndBuilding,
    delivery.apartmentOrOffice,
    delivery.pickupLocation,
  ].filter(Boolean).join(', ');

const saveCheckoutContactForEmail = (contact: any, delivery: any) => {
  if (typeof window === 'undefined' || !contact?.email) return;
  const emailKey = String(contact.email).trim().toLowerCase();
  if (!emailKey) return;

  try {
    const parsed = JSON.parse(localStorage.getItem(CHECKOUT_CONTACTS_BY_EMAIL_KEY) || '{}');
    const contacts = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    contacts[emailKey] = {
      fullName: contact.fullName.trim(),
      phone: contact.phone.trim(),
      email: emailKey,
      address: getDeliveryAddress(delivery),
      city: delivery.cityOrRegion || '',
      delivery: {
        method: delivery.method,
        cityOrRegion: delivery.cityOrRegion || '',
        district: delivery.district || '',
        streetAndBuilding: delivery.streetAndBuilding || '',
        apartmentOrOffice: delivery.apartmentOrOffice || '',
        pickupLocation: delivery.pickupLocation || '',
      },
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(CHECKOUT_CONTACTS_BY_EMAIL_KEY, JSON.stringify(contacts));
  } catch {
    // Capturing checkout contact details should never block order success.
  }
};

const getImage = (product: any) =>
  Array.isArray(product?.productImage) ? product.productImage[0] : product?.productImage || '/volt-logo.png';

const getPrice = (product: any, selectedPower?: string) => {
  const parameters = Array.isArray(product?.productParametrs) ? product.productParametrs : [];
  const selectedParam = selectedPower
    ? parameters.find((item: any) => String(item?.technicalPower || '').trim() === selectedPower)
    : null;
  return Number(selectedParam?.amount ?? parameters[0]?.amount ?? product?.price ?? 0);
};

const getCount = (product: any, selectedPower?: string) => {
  const parameters = Array.isArray(product?.productParametrs) ? product.productParametrs : [];
  const selectedParam = selectedPower
    ? parameters.find((item: any) => String(item?.technicalPower || '').trim() === selectedPower)
    : null;
  return Number(selectedParam?.count ?? parameters[0]?.count ?? 0);
};

const normalizePhone = (value: string) => value.replace(/[\s()-]/g, '');
const isAzerbaijanPhone = (value: string) => /^(\+994\d{9}|0\d{9})$/.test(normalizePhone(value));
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const defaultForm = (user?: User | null) => {
  const savedContact = getSavedContact();
  return {
    contact: {
      fullName: user?.name || savedContact?.fullName || '',
      phone: user?.phone || savedContact?.phone || '',
      email: user?.email || savedContact?.email || '',
      saveToProfile: false,
    },
  delivery: {
    method: 1,
    cityOrRegion: user?.city || '',
    district: '',
    streetAndBuilding: user?.address || '',
    apartmentOrOffice: '',
    deliveryNotes: '',
    pickupLocation: PICKUP_LOCATION,
  },
  paymentMethod: 3,
  acceptedReview: false,
  };
};

const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cart = [],
  singleProduct = null,
  user = null,
  lang = 'az',
  onBackToCart,
  onGoHome,
  onContinueShopping,
  onViewOrders,
  onOrderCreated,
  onCustomerContactCaptured,
  onLangChange,
  onNavigate,
}) => {
  const { getProductById } = useProduct();
  const [activeStep, setActiveStep] = useState<StepKey>(() => getSavedContact() ? 'delivery' : 'contact');
  const [form, setForm] = useState(() => defaultForm(user));
  const [lines, setLines] = useState<any[]>([]);
  const [loadingLines, setLoadingLines] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [attemptedStep, setAttemptedStep] = useState<StepKey | null>(null);

  const source = singleProduct ? 'single' : 'cart';
  const checkoutItems = (singleProduct ? [singleProduct] : cart).filter((item) => item.quantity > 0);
  const checkoutKey = checkoutItems.map((item) => `${item.id}:${item.power || ''}:${item.quantity}`).join('|');
  const copy = checkoutCopy[lang] || checkoutCopy.az;
  const deliveryMethods = [
    { id: 1, key: 'address', title: copy.addressDelivery, detail: copy.addressDeliveryDetail, icon: Home },
    { id: 2, key: 'pickup', title: copy.pickup, detail: copy.pickupDetail, icon: MapPin },
    { id: 3, key: 'phone', title: copy.phoneConfirm, detail: copy.phoneConfirmDetail, icon: Phone },
  ];
  const paymentMethods = [
    { id: 3, title: copy.managerContact, detail: copy.managerContactDetail, icon: Phone },
  ];

  useEffect(() => {
    const saved = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (parsed?.checkoutKey === checkoutKey) {
        setActiveStep(parsed.activeStep || 'contact');
        setForm({ ...defaultForm(user), ...parsed.form });
      }
    } catch {
      sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
    }
  }, [checkoutKey]);

  useEffect(() => {
    if (activeStep === 'confirmation') return;
    sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify({ checkoutKey, activeStep, form }));
  }, [checkoutKey, activeStep, form]);

  useEffect(() => {
    let cancelled = false;
    const loadLines = async () => {
      if (checkoutItems.length === 0) {
        setLines([]);
        setLoadingLines(false);
        return;
      }

      setLoadingLines(true);
      setLoadError('');
      try {
        const hydrated = await Promise.all(
          checkoutItems.map(async (item) => {
            const response = await getProductById(item.id);
            const product = response.data;
            return {
              ...product,
              lineId: `${item.id}:${item.power || 'base'}`,
              quantity: item.quantity,
              selectedPower: item.power,
              currentPrice: getPrice(product, item.power),
              currentCount: getCount(product, item.power),
            };
          })
        );
        if (!cancelled) setLines(hydrated);
      } catch {
        if (!cancelled) setLoadError(copy.loadingFailed);
      } finally {
        if (!cancelled) setLoadingLines(false);
      }
    };

    loadLines();
    return () => {
      cancelled = true;
    };
  }, [checkoutKey]);

  const subtotal = useMemo(
    () => lines.reduce((sum, item) => sum + item.currentPrice * item.quantity, 0),
    [lines]
  );
  const deliveryIsKnown = form.delivery.method === 2;
  const deliveryFee = deliveryIsKnown ? 0 : null;
  const hasQuoteLine = lines.some((item) => !item.currentPrice || item.currentPrice <= 0);
  const hasOutOfStockLine = lines.some((item) => !item.inStock || Number(item.currentCount || 0) < item.quantity);
  const stockIssueLines = lines.filter((item) => !item.inStock || Number(item.currentCount || 0) < item.quantity);
  const orderIntent = hasQuoteLine ? 2 : hasOutOfStockLine ? 3 : 1;
  const isContactRequest = orderIntent !== 1;
  const requiresManualConfirmation = !deliveryIsKnown || hasQuoteLine || hasOutOfStockLine;
  const total = subtotal + (deliveryFee ?? 0);

  useEffect(() => {
    if (form.paymentMethod === 1 || requiresManualConfirmation && form.paymentMethod === 1) {
      setForm((current) => ({ ...current, paymentMethod: 3 }));
    }
  }, [requiresManualConfirmation, form.paymentMethod]);

  useEffect(() => {
    if (isContactRequest && activeStep !== 'confirmation') {
      setActiveStep('contact');
    }
  }, [isContactRequest, activeStep]);

  const stepErrors = (step: StepKey) => {
    const errors: string[] = [];
    if (step === 'contact') {
      if (!form.contact.fullName.trim()) errors.push(lang === 'az' ? 'Ad və soyad tələb olunur.' : 'Full name is required.');
      if (!isAzerbaijanPhone(form.contact.phone)) errors.push(lang === 'az' ? 'Telefon nömrəsi +994 və ya 0 ilə başlayan yerli formatda olmalıdır.' : 'Phone must use +994 or local Azerbaijan format.');
      if (!isEmail(form.contact.email)) errors.push(lang === 'az' ? 'Email təsdiq məktubu üçün tələb olunur.' : 'Email is required for order confirmation.');
    }
    if (step === 'delivery') {
      if (!form.delivery.method) errors.push(lang === 'az' ? 'Çatdırılma üsulu seçin.' : 'Choose a delivery method.');
      if (form.delivery.method === 1) {
        if (!form.delivery.cityOrRegion.trim()) errors.push(lang === 'az' ? 'Şəhər və ya region tələb olunur.' : 'City or region is required.');
        if (!form.delivery.district.trim()) errors.push(lang === 'az' ? 'Rayon tələb olunur.' : 'District is required.');
        if (!form.delivery.streetAndBuilding.trim()) errors.push(lang === 'az' ? 'Küçə və bina tələb olunur.' : 'Street and building are required.');
      }
      if (form.delivery.method === 2 && !form.delivery.pickupLocation.trim()) {
        errors.push(lang === 'az' ? 'Təhvil məntəqəsi seçin.' : 'Choose a pickup point.');
      }
    }
    if (step === 'payment' && !form.paymentMethod) errors.push(lang === 'az' ? 'Ödəniş üsulu seçin.' : 'Choose a payment method.');
    if (step === 'review' && !form.acceptedReview) errors.push(lang === 'az' ? 'Alış şərtləri ilə razılaşın.' : 'Please agree to the purchase terms.');
    return errors;
  };

  const canComplete = (step: StepKey) => stepErrors(step).length === 0;
  const showErrors = (step: StepKey) => attemptedStep === step && stepErrors(step).length > 0;

  const goNext = (step: StepKey, next: StepKey) => {
    setAttemptedStep(step);
    if (!canComplete(step)) return;
    if (step === 'contact') {
      localStorage.setItem(SAVED_CONTACT_KEY, JSON.stringify({
        fullName: form.contact.fullName.trim(),
        phone: form.contact.phone.trim(),
        email: form.contact.email.trim(),
      }));
    }
    setAttemptedStep(null);
    setActiveStep(next);
  };

  const submitOrder = async () => {
    setAttemptedStep(isContactRequest ? 'contact' : 'review');
    setSubmitError('');
    if (isContactRequest) {
      if (!canComplete('contact')) {
        setActiveStep('contact');
        return;
      }
    } else if (!canComplete('contact') || !canComplete('delivery') || !canComplete('payment') || !canComplete('review')) {
      setActiveStep(!canComplete('contact') ? 'contact' : !canComplete('delivery') ? 'delivery' : !canComplete('payment') ? 'payment' : 'review');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        contact: {
          fullName: form.contact.fullName.trim(),
          phone: form.contact.phone.trim(),
          email: form.contact.email.trim(),
        },
        delivery: {
          method: isContactRequest ? 3 : form.delivery.method,
          cityOrRegion: isContactRequest ? '' : form.delivery.cityOrRegion.trim(),
          district: isContactRequest ? '' : form.delivery.district.trim(),
          streetAndBuilding: isContactRequest ? '' : form.delivery.streetAndBuilding.trim(),
          apartmentOrOffice: isContactRequest ? '' : form.delivery.apartmentOrOffice.trim(),
          deliveryNotes: isContactRequest ? '' : form.delivery.deliveryNotes.trim(),
          pickupLocation: isContactRequest ? '' : form.delivery.pickupLocation.trim(),
        },
        paymentMethod: 3,
        source: source === 'single' ? 2 : 1,
        intent: orderIntent,
        acceptedTerms: isContactRequest ? false : form.acceptedReview,
        items: checkoutItems.map((item) => ({
          productId: Number(item.id),
          selectedPower: item.power || '',
          quantity: item.quantity,
        })),
      };

      const response = await axiosInstance.post(API_ENDPOINTS.ORDER.CREATE_ORDER, payload);
      const apiResponse = response.data;
      if (!apiResponse?.success) throw new Error(apiResponse?.error?.details || 'Order failed');

      const order = apiResponse.data;
      setCreatedOrder(order);
      setActiveStep('confirmation');
      sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
      localStorage.setItem(SAVED_CONTACT_KEY, JSON.stringify({
        fullName: form.contact.fullName.trim(),
        phone: form.contact.phone.trim(),
        email: form.contact.email.trim(),
      }));
      saveCheckoutContactForEmail(form.contact, payload.delivery);

      const refs = JSON.parse(localStorage.getItem(RECENT_ORDERS_KEY) || '[]');
      const safeRefs = Array.isArray(refs) ? refs : [];
      localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify([
        { id: order.id, orderNumber: order.orderNumber, email: order.email, createdAt: order.createdAt },
        ...safeRefs.filter((item: any) => item.orderNumber !== order.orderNumber),
      ].slice(0, 12)));

      onOrderCreated?.(order, source);

      const capturedAddress = getDeliveryAddress(payload.delivery);
      if (user?.role === 'customer') {
        const { firstName, lastName } = splitFullName(form.contact.fullName);
        try {
          const profileResponse = await axiosInstance.put(API_ENDPOINTS.AUTH.CUSTOMER_ME, {
            firstName,
            lastName,
            phone: form.contact.phone.trim(),
            address: capturedAddress,
          });
          const profile = profileResponse.data?.success ? profileResponse.data.data : null;
          onCustomerContactCaptured?.({
            name: profile?.name || form.contact.fullName.trim(),
            phone: profile?.phone || form.contact.phone.trim(),
            email: profile?.email || form.contact.email.trim(),
            address: profile?.address || capturedAddress,
            city: payload.delivery.cityOrRegion || user.city,
          });
        } catch {
          onCustomerContactCaptured?.({
            name: form.contact.fullName.trim(),
            phone: form.contact.phone.trim(),
            email: form.contact.email.trim(),
            address: capturedAddress,
            city: payload.delivery.cityOrRegion || user.city,
          });
        }
      }
    } catch (error: any) {
      const status = error?.response?.status;
      setSubmitError(status === 404
        ? (lang === 'az' ? 'Orders API tapılmadı. Lokal test üçün backend http://localhost:5001 ünvanında açıq olmalıdır və frontend həmin API-yə qoşulmalıdır.' : 'Orders API was not found. For local testing, run the backend on http://localhost:5001 and connect the frontend to it.')
        : error?.response?.data?.error?.details || error?.message || (lang === 'az' ? 'Sifarişi yaratmaq mümkün olmadı.' : 'Could not create the order.'));
    } finally {
      setSubmitting(false);
    }
  };

  const updateContact = (key: string, value: string | boolean) =>
    setForm((current) => ({ ...current, contact: { ...current.contact, [key]: value } }));
  const updateDelivery = (key: string, value: string | number) =>
    setForm((current) => ({ ...current, delivery: { ...current.delivery, [key]: value } }));

  const renderErrors = (step: StepKey) => showErrors(step) ? (
    <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
      {stepErrors(step).map((error) => <div key={error}>{error}</div>)}
    </div>
  ) : null;

  const sectionHeader = (step: StepKey, index: number, title: string, summary: string) => (
    <button
      type="button"
      onClick={() => setActiveStep(step)}
      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${canComplete(step) ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
          {canComplete(step) ? <Check className="h-4 w-4" /> : index}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-black text-slate-900">{title}</div>
          {activeStep !== step && <div className="truncate text-xs font-semibold text-slate-400">{summary}</div>}
        </div>
      </div>
      {activeStep !== step && <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-600"><Edit3 className="h-3.5 w-3.5" /> {copy.edit}</span>}
    </button>
  );

  const summaryPanel = (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-xs font-black uppercase tracking-widest text-slate-400">{copy.summary}</div>
        <div className="text-xs font-black text-slate-900">{checkoutItems.reduce((sum, item) => sum + item.quantity, 0)} {copy.productCount}</div>
      </div>
      <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
        {lines.map((item) => (
          <div key={item.lineId} className="flex gap-3 rounded-xl bg-slate-50 p-2">
            <img src={getImage(item)} alt={item.productName} className="h-14 w-14 rounded-lg bg-white object-contain p-1" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-black text-slate-900">{item.productName}</div>
              <div className="text-[10px] font-bold text-slate-400">{item.selectedPower || copy.standard} x {item.quantity}</div>
              <div className="mt-1 text-xs font-black text-emerald-600">{(item.currentPrice * item.quantity).toFixed(2)} AZN</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
        <div className="flex justify-between text-slate-500"><span>{copy.products}</span><strong>{subtotal.toFixed(2)} AZN</strong></div>
        <div className="flex justify-between text-slate-500"><span>{copy.delivery}</span><strong>{deliveryFee === null ? copy.deliveryLater : `${deliveryFee.toFixed(2)} AZN`}</strong></div>
        <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-black text-slate-900"><span>{copy.total}</span><span>{total.toFixed(2)} AZN</span></div>
      </div>
      {requiresManualConfirmation && (
        <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-700">
          {copy.manual}
        </div>
      )}
    </aside>
  );

  if (loadingLines && !(activeStep === 'confirmation' && createdOrder)) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
  }

  if ((loadError || checkoutItems.length === 0) && !(activeStep === 'confirmation' && createdOrder)) {
    return (
      <div className="min-h-screen bg-slate-50">
        <CheckoutHeader lang={lang} onLangChange={onLangChange} onBackToCart={onBackToCart} onGoHome={onGoHome} />
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <h1 className="text-2xl font-black text-slate-900">{loadError || copy.noItems}</h1>
          <button onClick={loadError ? () => window.location.reload() : onContinueShopping} className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white">
            {loadError ? copy.retry : copy.continueShopping}
          </button>
        </div>
      </div>
    );
  }

  if (activeStep === 'confirmation' && createdOrder) {
    if (createdOrder.intent === 2 || createdOrder.intent === 3) {
      return (
        <div className="min-h-screen bg-slate-50">
          <CheckoutHeader lang={lang} onLangChange={onLangChange} onBackToCart={onBackToCart} onGoHome={onGoHome} compact />
          <main className="mx-auto max-w-3xl px-4 py-10">
            <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-white p-8 text-center shadow-sm">
              <img
                src="/volt-logo.png"
                alt=""
                className="pointer-events-none absolute -bottom-10 -right-8 h-48 w-48 object-contain opacity-[0.09] grayscale brightness-50 sm:h-64 sm:w-64"
                aria-hidden="true"
              />
              <div className="relative z-10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <Check className="h-8 w-8" />
              </div>
              <div className="relative z-10 text-xs font-black uppercase tracking-widest text-amber-600">{copy.quoteSuccess}</div>
              <h1 className="relative z-10 mt-2 text-3xl font-black text-slate-900">{createdOrder.orderNumber}</h1>
              <p className="relative z-10 mx-auto mt-4 max-w-2xl whitespace-pre-line text-sm font-semibold leading-7 text-slate-600">
                {copy.quoteNext}
              </p>
              <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-3">
                <button onClick={onContinueShopping} className="rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-lg active:scale-[0.98]">{copy.continue}</button>
                <button onClick={onViewOrders} className="rounded-xl bg-slate-900 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]">{copy.myOrders}</button>
                <button onClick={() => onNavigate?.('contact')} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 transition-all hover:-translate-y-0.5 hover:border-emerald-500 hover:text-emerald-600 active:scale-[0.98]">{lang === 'az' ? 'Bizimlə əlaqə' : 'Contact us'}</button>
              </div>
            </div>
          </main>
        </div>
      );
    }

    const createdAt = createdOrder.createdAt ? new Date(createdOrder.createdAt) : new Date();
    const placedAt = createdAt.toLocaleString(lang === 'az' ? 'az-AZ' : undefined, { dateStyle: 'medium', timeStyle: 'short' });

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <CheckoutHeader lang={lang} onLangChange={onLangChange} onBackToCart={onBackToCart} onGoHome={onGoHome} compact />
        <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-white"><Check className="h-4 w-4" /> {copy.success}</span>
                  <span className="text-sm font-semibold text-slate-500">{placedAt}</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{createdOrder.orderNumber}</h1>
                <p className="mt-3 text-sm font-semibold text-slate-500">{copy.next}</p>
              </div>
              <div className="border-slate-200 md:border-l md:pl-10 md:text-right">
                <div className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-400">{copy.total}</div>
                <div className="mt-1 text-4xl font-black text-slate-900">{Number(createdOrder.finalTotal || 0).toFixed(2)} AZN</div>
                <div className="mt-1 text-sm font-semibold text-slate-500">{paymentMethods.find((item) => item.id === createdOrder.paymentMethod)?.title || copy.managerContact}</div>
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">{lang === 'az' ? 'Sifariş prosesi' : 'Order journey'}</h2>
              <div className="mt-7 space-y-7">
                {[
                  [lang === 'az' ? 'Sifariş verildi' : 'Order placed', placedAt, true],
                  [lang === 'az' ? 'Menecer təsdiqi' : 'Manager confirmation', copy.waiting, true],
                  [lang === 'az' ? 'Çatdırılma razılaşdırılır' : 'Delivery arranged', copy.waiting, false],
                  [lang === 'az' ? 'Tamamlandı' : 'Completed', copy.waiting, false],
                ].map(([title, detail, active], index) => (
                  <div key={String(title)} className="relative flex gap-4">
                    {index < 3 && <span className={`absolute left-[9px] top-6 h-10 w-0.5 ${active ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                    <span className={`mt-1 h-5 w-5 rounded-full border-2 ${active ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'}`} />
                    <div>
                      <div className={`text-sm font-black ${active ? 'text-slate-900' : 'text-slate-400'}`}>{title}</div>
                      <div className="mt-1 text-xs font-semibold text-slate-400">{detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="space-y-8">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 text-[11px] font-black uppercase tracking-[0.35em] text-slate-400">{lang === 'az' ? 'Sifariş detalları' : 'Order details'}</div>
                <div className="space-y-4">
                  {createdOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black text-slate-900">{item.productName}</div>
                        <div className="mt-1 text-xs font-semibold text-slate-400">{item.selectedPower || copy.standard} · Qty {item.quantity}</div>
                      </div>
                      <div className="shrink-0 text-sm font-black text-slate-900">{Number(item.lineTotal).toFixed(2)} AZN</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                  <div className="flex justify-between text-sm text-slate-500"><span>{copy.products}</span><strong className="text-slate-900">{Number(createdOrder.productsSubtotal || 0).toFixed(2)} AZN</strong></div>
                  <div className="flex justify-between text-sm text-slate-500"><span>{copy.delivery}</span><strong className="text-slate-900">{createdOrder.deliveryFee === null || createdOrder.deliveryFee === undefined ? copy.deliveryLater : `${Number(createdOrder.deliveryFee).toFixed(2)} AZN`}</strong></div>
                  <div className="flex justify-between border-t border-slate-100 pt-4 text-xl font-black text-slate-900"><span>{copy.total}</span><span>{Number(createdOrder.finalTotal || 0).toFixed(2)} AZN</span></div>
                </div>
              </section>

              <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-3">
                <ReviewBlockDark title={copy.contact} lines={[createdOrder.fullName, createdOrder.phone, createdOrder.email]} />
                <ReviewBlockDark title={copy.delivery} lines={[
                  deliveryMethods.find((item) => item.id === createdOrder.deliveryMethod)?.title || copy.managerContact,
                  [createdOrder.cityOrRegion, createdOrder.district, createdOrder.streetAndBuilding, createdOrder.apartmentOrOffice].filter(Boolean).join(', ') || copy.waiting,
                ]} />
                <ReviewBlockDark title={copy.payment} lines={[copy.managerContact, copy.waiting]} />
              </section>

              <div className="grid gap-3 sm:grid-cols-3">
                <button onClick={onViewOrders} className="rounded-xl bg-slate-900 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]">{copy.myOrders}</button>
                <button onClick={onContinueShopping} className="rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-lg active:scale-[0.98]">{copy.continue}</button>
                <button onClick={() => window.print()} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 transition-all hover:-translate-y-0.5 hover:border-emerald-500 hover:text-emerald-600 active:scale-[0.98]">{copy.print}</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isContactRequest) {
    return (
      <div className="min-h-screen bg-slate-50 pb-12">
        <CheckoutHeader lang={lang} onLangChange={onLangChange} onBackToCart={onBackToCart} onGoHome={onGoHome} />
        <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
          <CheckoutSection>
            <div className="p-6">
              <div className="mb-2 text-xs font-black uppercase tracking-widest text-amber-600">{copy.submitRequest}</div>
              <h1 className="text-2xl font-black text-slate-900">{copy.contact}</h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">{copy.manual}</p>
              {stockIssueLines.length > 0 && (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-relaxed text-amber-800" role="alert">
                  {stockIssueLines.map((item) => (
                    <div key={`${item.lineId}-stock-warning`}>
                      {item.productName}: {getStockWarning(lang, Number(item.currentCount || 0), item.quantity)}
                    </div>
                  ))}
                  <button type="button" onClick={onBackToCart} className="mt-2 font-black underline underline-offset-2">
                    {lang === 'az' ? 'Səbətə qayıdıb sayı azaldın' : lang === 'ru' ? 'Вернуться в корзину и уменьшить количество' : lang === 'tr' ? 'Sepete dönüp miktarı azaltın' : 'Return to cart and reduce the quantity'}
                  </button>
                </div>
              )}
            </div>
            <div className="checkout-step-panel border-t border-slate-100 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={copy.name}><input value={form.contact.fullName} onChange={(e) => updateContact('fullName', e.target.value)} className={inputClass} /></Field>
                <Field label={copy.phone}><input value={form.contact.phone} onChange={(e) => updateContact('phone', e.target.value)} placeholder="050 123 45 67" className={inputClass} /></Field>
                <Field label={copy.email}><input value={form.contact.email} onChange={(e) => updateContact('email', e.target.value)} className={inputClass} /></Field>
              </div>
              {renderErrors('contact')}
              {submitError && <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-bold text-red-600">{submitError}</div>}
              <StepAction onClick={submitOrder} disabled={submitting}>
                {submitting ? copy.sending : copy.submitRequest}
              </StepAction>
            </div>
          </CheckoutSection>
          <div>{summaryPanel}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 lg:pb-12">
      <CheckoutHeader lang={lang} onLangChange={onLangChange} onBackToCart={onBackToCart} onGoHome={onGoHome} />

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
        <div className="space-y-4">
          <button type="button" onClick={() => setSummaryOpen((value) => !value)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left lg:hidden">
            <span className="text-sm font-black text-slate-900">{copy.summary}</span>
            <span className="flex items-center gap-2 text-sm font-black text-emerald-600">{total.toFixed(2)} AZN <ChevronDown className={`h-4 w-4 transition ${summaryOpen ? 'rotate-180' : ''}`} /></span>
          </button>
          {summaryOpen && <div className="lg:hidden">{summaryPanel}</div>}

          <CheckoutSection>
            {sectionHeader('contact', 1, copy.contact, `${form.contact.fullName || copy.name} / ${form.contact.phone || copy.phone}`)}
            {activeStep === 'contact' && (
              <div className="checkout-step-panel border-t border-slate-100 p-5">
                {getSavedContact() && <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700">{copy.contactSaved}</div>}
                {user && <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700">{copy.contactPrefill}</div>}
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={copy.name}><input value={form.contact.fullName} onChange={(e) => updateContact('fullName', e.target.value)} className={inputClass} /></Field>
                  <Field label={copy.phone}><input value={form.contact.phone} onChange={(e) => updateContact('phone', e.target.value)} placeholder="050 123 45 67" className={inputClass} /></Field>
                  <Field label={copy.email}><input value={form.contact.email} onChange={(e) => updateContact('email', e.target.value)} className={inputClass} /></Field>
                </div>
                <label className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-600"><input type="checkbox" checked={form.contact.saveToProfile} onChange={(e) => updateContact('saveToProfile', e.target.checked)} /> {copy.saveProfile}</label>
                {renderErrors('contact')}
                <StepAction onClick={() => goNext('contact', 'delivery')}>{copy.toDelivery}</StepAction>
              </div>
            )}
          </CheckoutSection>

          <CheckoutSection>
            {sectionHeader('delivery', 2, copy.deliveryStep, deliveryMethods.find((item) => item.id === form.delivery.method)?.title || copy.waiting)}
            {activeStep === 'delivery' && (
              <div className="checkout-step-panel border-t border-slate-100 p-5">
                <div className="grid gap-3 md:grid-cols-3">
                  {deliveryMethods.map((method) => <RadioCard key={method.id} active={form.delivery.method === method.id} icon={method.icon} title={method.title} detail={method.detail} onClick={() => updateDelivery('method', method.id)} />)}
                </div>
                {form.delivery.method === 1 && (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2 rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-700">{copy.deliveryLaterLong}</div>
                    <Field label={copy.city}><input value={form.delivery.cityOrRegion} onChange={(e) => updateDelivery('cityOrRegion', e.target.value)} className={inputClass} /></Field>
                    <Field label={copy.district}><input value={form.delivery.district} onChange={(e) => updateDelivery('district', e.target.value)} className={inputClass} /></Field>
                    <Field label={copy.street}><input value={form.delivery.streetAndBuilding} onChange={(e) => updateDelivery('streetAndBuilding', e.target.value)} className={inputClass} /></Field>
                    <Field label={copy.apartment}><input value={form.delivery.apartmentOrOffice} onChange={(e) => updateDelivery('apartmentOrOffice', e.target.value)} className={inputClass} /></Field>
                    <Field label={copy.note}><textarea value={form.delivery.deliveryNotes} onChange={(e) => updateDelivery('deliveryNotes', e.target.value)} className={`${inputClass} min-h-24 md:col-span-2`} /></Field>
                  </div>
                )}
                {form.delivery.method === 2 && (
                  <div className="mt-5 space-y-3">
                    <Field label={copy.pickupPoint}><input value={form.delivery.pickupLocation} onChange={(e) => updateDelivery('pickupLocation', e.target.value)} className={inputClass} /></Field>
                    <div className="rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-500">{copy.pickupSecure}</div>
                  </div>
                )}
                {renderErrors('delivery')}
                <StepAction onClick={() => goNext('delivery', 'payment')}>{copy.toPayment}</StepAction>
              </div>
            )}
          </CheckoutSection>

          <CheckoutSection>
            {sectionHeader('payment', 3, copy.payment, paymentMethods.find((item) => item.id === form.paymentMethod)?.title || copy.waiting)}
            {activeStep === 'payment' && (
              <div className="checkout-step-panel border-t border-slate-100 p-5">
                <div className="grid gap-3 md:grid-cols-2">
                  {paymentMethods
                    .map((method) => <RadioCard key={method.id} active={form.paymentMethod === method.id} icon={method.icon} title={method.title} detail={method.detail} onClick={() => setForm((current) => ({ ...current, paymentMethod: method.id }))} />)}
                </div>
                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-500">{copy.onlineOff}</div>
                {renderErrors('payment')}
                <StepAction onClick={() => goNext('payment', 'review')}>{copy.toReview}</StepAction>
              </div>
            )}
          </CheckoutSection>

          <CheckoutSection>
            {sectionHeader('review', 4, copy.review, form.acceptedReview ? copy.confirmed : copy.waiting)}
            {activeStep === 'review' && (
              <div className="checkout-step-panel border-t border-slate-100 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <ReviewBlock title={copy.contact} lines={[form.contact.fullName, form.contact.phone, form.contact.email]} />
                  <ReviewBlock title={copy.delivery} lines={[
                    deliveryMethods.find((item) => item.id === form.delivery.method)?.title || '',
                    form.delivery.method === 1 ? `${form.delivery.cityOrRegion}, ${form.delivery.district}, ${form.delivery.streetAndBuilding}` : form.delivery.pickupLocation,
                  ]} />
                </div>
                <label className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-bold text-slate-600">
                  <input type="checkbox" className="mt-0.5" checked={form.acceptedReview} onChange={(e) => setForm((current) => ({ ...current, acceptedReview: e.target.checked }))} />
                  <span>
                    {copy.acceptTerms}{' '}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        onNavigate?.('purchase-terms');
                      }}
                      className="font-black text-emerald-600 underline underline-offset-4 hover:text-slate-900"
                    >
                      {copy.termsLink}
                    </button>
                  </span>
                </label>
                {renderErrors('review')}
                {submitError && <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-bold text-red-600">{submitError}</div>}
                <StepAction onClick={submitOrder} disabled={submitting}>
                  {submitting ? copy.sending : copy.submit}
                </StepAction>
              </div>
            )}
          </CheckoutSection>
        </div>

        <div className="hidden lg:block">{summaryPanel}</div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-3 shadow-2xl lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{copy.total}</div>
            <div className="text-lg font-black text-slate-900">{total.toFixed(2)} AZN</div>
          </div>
          <button
            onClick={() => activeStep === 'review' ? submitOrder() : goNext(activeStep, activeStep === 'contact' ? 'delivery' : activeStep === 'delivery' ? 'payment' : 'review')}
            className="rounded-xl bg-emerald-600 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white"
          >
            {activeStep === 'review' ? copy.sendShort : copy.nextButton}
          </button>
        </div>
      </div>
    </div>
  );
};

const CheckoutHeader = ({ lang, onLangChange, onBackToCart, onGoHome, compact = false }: { lang: Language; onLangChange?: (lang: Language) => void; onBackToCart: () => void; onGoHome?: () => void; compact?: boolean }) => (
  <header className="border-b border-slate-200 bg-white">
    <div className={`mx-auto flex max-w-7xl items-center justify-between px-4 lg:px-8 ${compact ? 'py-3' : 'py-4'}`}>
      <button type="button" onClick={onGoHome || onBackToCart} className="rounded-lg transition-transform hover:-translate-y-0.5 active:scale-95" aria-label="Volt.az home">
        <img src="/volt-logo.png" alt="Volt.az" className="h-9 w-auto" />
      </button>
      <div className="hidden items-center gap-2 text-sm font-black text-slate-700 sm:flex"><ShieldCheck className="h-4 w-4 text-emerald-600" /> {(checkoutCopy[lang] || checkoutCopy.az).secure}</div>
      <div className="flex items-center gap-2">
        {onLangChange && (
          <select value={lang} onChange={(e) => onLangChange(e.target.value as Language)} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-base md:text-xs font-black text-slate-700 transition-all hover:border-emerald-500 focus:border-emerald-500 focus:outline-none">
            <option value="az">AZ</option>
            <option value="en">EN</option>
            <option value="ru">RU</option>
            <option value="tr">TR</option>
          </select>
        )}
        <button onClick={onBackToCart} className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:-translate-y-0.5 hover:border-emerald-500 hover:text-emerald-600 active:scale-[0.98]">{(checkoutCopy[lang] || checkoutCopy.az).returnCart}</button>
      </div>
    </div>
  </header>
);

const CheckoutSection = ({ children }: { children: React.ReactNode }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/60">{children}</section>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block text-xs font-black uppercase tracking-widest text-slate-400">
    {label}
    <div className="mt-2 text-sm font-semibold normal-case tracking-normal text-slate-900">{children}</div>
  </label>
);

const RadioCard = ({ active, icon: Icon, title, detail, onClick }: { active: boolean; icon: any; title: string; detail: string; onClick: () => void }) => (
  <button type="button" onClick={onClick} className={`min-h-32 rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] ${active ? 'border-emerald-500 bg-emerald-50 shadow-emerald-600/10' : 'border-slate-200 bg-white hover:border-emerald-300'}`}>
    <Icon className={`mb-3 h-5 w-5 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
    <div className="text-sm font-black text-slate-900">{title}</div>
    <div className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">{detail}</div>
  </button>
);

const StepAction = ({ children, onClick, disabled = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) => (
  <button disabled={disabled} onClick={onClick} className="mt-6 w-full rounded-xl bg-emerald-600 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto md:px-8">
    {children}
  </button>
);

const ReviewBlock = ({ title, lines }: { title: string; lines: string[] }) => (
  <div className="rounded-xl bg-slate-50 p-4">
    <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</div>
    {lines.filter(Boolean).map((line) => <div key={line} className="text-sm font-bold text-slate-800">{line}</div>)}
  </div>
);

const ReviewBlockDark = ({ title, lines }: { title: string; lines: string[] }) => (
  <div>
    <div className="mb-3 text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">{title}</div>
    {lines.filter(Boolean).map((line) => <div key={line} className="text-sm font-semibold leading-6 text-slate-600">{line}</div>)}
  </div>
);

export default CheckoutPage;
