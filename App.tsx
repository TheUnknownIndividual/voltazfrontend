
import React, { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import Calculator from './components/Calculator';
import Projects from './components/Projects';
import Products from './components/Products';
import InfoSection from './components/InfoSection';
import Footer from './components/Footer';
import PartnersSlider from './components/PartnersSlider';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import axiosInstance from './api/axiosInstance';
import { API_ENDPOINTS } from './utils/constants';
import { UploadProvider } from './contexts/UploadContext';
import { NewsProvider } from './contexts/NewsContext';
import { ServiceProvider } from './contexts/ServiceContext';


// Lazy loading for pages
const AboutPage = lazy(() => import('./components/AboutPage'));
const AboutDetail = lazy(() => import('./components/AboutDetail'));
const ServicesPage = lazy(() => import('./components/ServicesPage'));
const ProjectsPage = lazy(() => import('./components/ProjectsPage'));
const ProductsPage = lazy(() => import('./components/ProductsPage'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const ProjectDetail = lazy(() => import('./components/ProjectDetail'));
const ProductDetail = lazy(() => import('./components/ProductDetail'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const LegislationPage = lazy(() => import('./components/LegislationPage'));
const ProClubPage = lazy(() => import('./components/ProClubPage'));
const ProClubDashboard = lazy(() => import('./components/ProClubDashboard'));
const CustomerDashboard = lazy(() => import('./components/CustomerDashboard'));
const NewsPage = lazy(() => import('./components/NewsPage'));
const VideoReels = lazy(() => import('./components/VideoReels'));
const CreditPrivileges = lazy(() => import('./components/CreditPrivileges'));
const FAQPage = lazy(() => import('./components/FAQPage'));
const HowToStartPage = lazy(() => import('./components/HowToStartPage'));
const CheckoutPage = lazy(() => import('./components/CheckoutPage'));
const CartPage = lazy(() => import('./components/CartPage'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));
const PurchaseTerms = lazy(() => import('./components/PurchaseTerms'));
const BlogPage = lazy(() => import('./components/BlogPage'));
const NecessaryDocumentsPage = lazy(() => import('./components/NecessaryDocumentsPage'));
const PartnershipPage = lazy(() => import('./components/PartnershipPage'));
const ThemeLab = lazy(() => import('./components/ThemeLab'));
 

type PageView = 'home' | 'about' | 'about-detail' | 'services' | 'projects' | 'products' | 'contact' | 'news' | 'blog' | 'credits' | 'media' | 'project-detail' | 'product-detail' | 'admin-dashboard' | 'calculator' | 'legislation' | 'pro-club' | 'pro-club-dashboard' | 'customer-dashboard' | 'video-reels' | 'order' | 'checkout' | 'faq' | 'how-to-start' | 'cart' | 'privacy-policy' | 'terms-of-service' | 'purchase-terms' | 'necessary-documents' | 'partnership';
type Language = 'az' | 'en' | 'ru' | 'tr';
type UserRole = 'customer' | 'master' | 'admin';
type LocalizedText = Record<Language, string>;
type SeoMeta = {
  title: LocalizedText;
  description: LocalizedText;
  keywords?: string;
  robots?: string;
  type?: string;
  previewImage?: string | null;
};


interface User {
  email: string;
  name: string;
  role: UserRole;
  isApproved?: boolean;
  address?: string;
  phone?: string;
  city?: string;
  masterType?: string;
  documentImage?: string;
}

import { NotificationProvider } from './contexts/NotificationContext';
import { AboutProvider } from './contexts/AboutContext';
import { BlogProvider } from './contexts/BlogContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { ContactProvider } from './contexts/ContactContext';
import { ProductProvider, useProduct } from './contexts/ProductContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { EmailProvider } from './contexts/EmailContext';
import { PartnershipProvider } from './contexts/PartnershipContext';

const isSupportedLanguage = (value: string | null): value is Language =>
  value === 'az' || value === 'en' || value === 'ru' || value === 'tr';

const detectBrowserLanguage = (): Language | null => {
  const browserLanguages = typeof navigator === 'undefined'
    ? []
    : [navigator.language, ...(navigator.languages || [])].filter(Boolean);

  if (browserLanguages.some((value) => value.toLowerCase().startsWith('ru'))) return 'ru';
  if (browserLanguages.some((value) => value.toLowerCase().startsWith('az'))) return 'az';
  if (browserLanguages.some((value) => value.toLowerCase().startsWith('tr'))) return 'tr';
  return null;
};

const languageFromCountry = (countryCode: string | undefined): Language => {
  switch ((countryCode || '').toUpperCase()) {
    case 'AZ':
      return 'az';
    case 'RU':
      return 'ru';
    case 'TR':
      return 'tr';
    default:
      return 'en';
  }
};

const detectIpLanguage = async (): Promise<Language | null> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 1800);

  try {
    const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    if (!response.ok) return null;

    const data = await response.json();
    return languageFromCountry(data?.country_code);
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
};

interface CartLine {
  id: string;
  quantity: number;
  power?: string;
}

interface CartSession {
  key: string;
  email: string;
  name: string;
  role: UserRole;
  lastSeenAt: string;
}

interface CartTransferCandidate extends CartSession {
  quantity: number;
  isCurrent: boolean;
}

interface PendingCartTransfer {
  user: User;
  guestCart: CartLine[];
  candidates: CartTransferCandidate[];
}

const isSameCartLine = (
  item: { id: string | number; power?: string | null },
  productId: string | number,
  power?: string | null
) => String(item.id) === String(productId) && String(item.power ?? '') === String(power ?? '');

const CART_STORAGE_KEY = 'volt_cart';
const GUEST_CART_STORAGE_KEY = 'volt_guest_cart';
const USER_CARTS_STORAGE_KEY = 'volt_user_carts';
const CART_SESSIONS_STORAGE_KEY = 'volt_cart_sessions';
const CHECKOUT_CONTACTS_BY_EMAIL_KEY = 'volt_checkout_contacts_by_email_v1';

const readStorageJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const normalizeCart = (value: unknown): CartLine[] =>
  Array.isArray(value)
    ? value
        .map((item: any) => ({
          id: String(item?.id ?? ''),
          quantity: Math.max(1, Number(item?.quantity || 1)),
          power: item?.power ? String(item.power) : undefined,
        }))
        .filter((item) => item.id)
    : [];

const mergeCartLines = (baseCart: CartLine[], incomingCart: CartLine[]) => {
  const merged = new Map<string, CartLine>();

  [...baseCart, ...incomingCart].forEach((item) => {
    const key = `${item.id}::${item.power || ''}`;
    const existing = merged.get(key);
    merged.set(key, {
      id: item.id,
      power: item.power,
      quantity: (existing?.quantity || 0) + Math.max(1, Number(item.quantity || 1)),
    });
  });

  return Array.from(merged.values());
};

const getCartQuantity = (cart: CartLine[]) =>
  cart.reduce((sum, item) => sum + Math.max(0, Number(item.quantity || 0)), 0);

const getUserCartKey = (nextUser: Pick<User, 'email' | 'name' | 'phone'> | null | undefined) =>
  String(nextUser?.email || nextUser?.phone || nextUser?.name || '').trim().toLowerCase();

const getUserCartMap = () =>
  readStorageJson<Record<string, CartLine[]>>(USER_CARTS_STORAGE_KEY, {});

const saveUserCartMap = (cartMap: Record<string, CartLine[]>) => {
  localStorage.setItem(USER_CARTS_STORAGE_KEY, JSON.stringify(cartMap));
};

const getCartForUserKey = (userKey: string) =>
  normalizeCart(getUserCartMap()[userKey]);

const saveCartForUserKey = (userKey: string, nextCart: CartLine[]) => {
  if (!userKey) return;
  const cartMap = getUserCartMap();
  cartMap[userKey] = normalizeCart(nextCart);
  saveUserCartMap(cartMap);
};

const getCartForUser = (nextUser: User | null) =>
  getCartForUserKey(getUserCartKey(nextUser));

const saveCartForUser = (nextUser: User | null, nextCart: CartLine[]) => {
  saveCartForUserKey(getUserCartKey(nextUser), nextCart);
};

const splitNameForProfile = (name: string) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || 'Volt',
    lastName: parts.slice(1).join(' ') || 'Customer',
  };
};

const getCheckoutContactForUser = (nextUser: User | null | undefined) => {
  const emailKey = String(nextUser?.email || '').trim().toLowerCase();
  if (!emailKey) return null;

  const contacts = readStorageJson<Record<string, any>>(CHECKOUT_CONTACTS_BY_EMAIL_KEY, {});
  return contacts[emailKey] || null;
};

const getLatestOrderContactForCurrentCustomer = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.ORDER.GET_MY_ORDERS);
    const orders = response.data?.success && Array.isArray(response.data.data) ? response.data.data : [];
    const latestOrder = orders
      .filter((order: any) => order?.email)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    if (!latestOrder) return null;

    return {
      fullName: latestOrder.fullName || '',
      phone: latestOrder.phone || '',
      email: latestOrder.email || '',
      address: [
        latestOrder.cityOrRegion,
        latestOrder.district,
        latestOrder.streetAndBuilding,
        latestOrder.apartmentOrOffice,
        latestOrder.pickupLocation,
      ].filter(Boolean).join(', '),
      city: latestOrder.cityOrRegion || '',
    };
  } catch {
    return null;
  }
};

const mergeCheckoutContactIntoUser = async (nextUser: User): Promise<User> => {
  if (nextUser.role !== 'customer') return nextUser;

  const checkoutContact = getCheckoutContactForUser(nextUser) || await getLatestOrderContactForCurrentCustomer();
  if (!checkoutContact) return nextUser;

  const mergedUser: User = {
    ...nextUser,
    name: checkoutContact.fullName || nextUser.name,
    phone: checkoutContact.phone || nextUser.phone,
    address: checkoutContact.address || nextUser.address,
    city: checkoutContact.city || nextUser.city,
  };

  if (!mergedUser.phone) return mergedUser;

  try {
    const { firstName, lastName } = splitNameForProfile(mergedUser.name);
    const response = await axiosInstance.put(API_ENDPOINTS.AUTH.CUSTOMER_ME, {
      firstName,
      lastName,
      phone: mergedUser.phone,
      address: mergedUser.address || '',
    });
    const profile = response.data?.success ? response.data.data : null;
    if (!profile) return mergedUser;

    return {
      ...mergedUser,
      name: profile.name || mergedUser.name,
      email: profile.email || mergedUser.email,
      phone: profile.phone || mergedUser.phone,
      address: profile.address || mergedUser.address,
    };
  } catch {
    return mergedUser;
  }
};

const getGuestCart = () => {
  if (localStorage.getItem(GUEST_CART_STORAGE_KEY) !== null) {
    return normalizeCart(readStorageJson(GUEST_CART_STORAGE_KEY, []));
  }

  return normalizeCart(readStorageJson(CART_STORAGE_KEY, []));
};

const saveGuestCart = (nextCart: CartLine[]) => {
  localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(normalizeCart(nextCart)));
};

const saveVisibleCart = (nextCart: CartLine[]) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizeCart(nextCart)));
};

const clearGuestCart = () => {
  localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify([]));
};

const rememberCartSession = (nextUser: User) => {
  const key = getUserCartKey(nextUser);
  if (!key || nextUser.role === 'admin') {
    return readStorageJson<CartSession[]>(CART_SESSIONS_STORAGE_KEY, []);
  }

  const previous = readStorageJson<CartSession[]>(CART_SESSIONS_STORAGE_KEY, []);
  const session: CartSession = {
    key,
    email: nextUser.email || '',
    name: nextUser.name || nextUser.email || key,
    role: nextUser.role,
    lastSeenAt: new Date().toISOString(),
  };
  const nextSessions = [
    session,
    ...previous.filter((item) => item.key !== key && item.role !== 'admin'),
  ].slice(0, 8);

  localStorage.setItem(CART_SESSIONS_STORAGE_KEY, JSON.stringify(nextSessions));
  return nextSessions;
};

const buildCartTransferCandidates = (sessions: CartSession[], currentUser: User): CartTransferCandidate[] => {
  const currentKey = getUserCartKey(currentUser);
  const normalizedSessions = sessions.some((session) => session.key === currentKey)
    ? sessions
    : [
        {
          key: currentKey,
          email: currentUser.email || '',
          name: currentUser.name || currentUser.email || currentKey,
          role: currentUser.role,
          lastSeenAt: new Date().toISOString(),
        },
        ...sessions,
      ];

  return normalizedSessions
    .filter((session) => session.key && session.role !== 'admin')
    .map((session) => ({
      ...session,
      quantity: getCartQuantity(getCartForUserKey(session.key)),
      isCurrent: session.key === currentKey,
    }));
};

interface FloatingCartPreviewProps {
  cart: CartLine[];
  lang: Language;
  user: User | null;
  mode?: 'fixed' | 'inline';
  onOpenCart: () => void;
  onRemoveFromCart: (id: string, power?: string) => void;
  onUpdateCartQuantity: (id: string, quantity: number, power?: string) => void;
}

const getProductImage = (product: any) =>
  Array.isArray(product?.productImage) ? product.productImage[0] : product?.productImage || '/volt-logo.png';

const getCartLinePrice = (product: any, selectedPower?: string) => {
  const parameters = Array.isArray(product?.productParametrs) ? product.productParametrs : [];
  const selectedParam = selectedPower
    ? parameters.find((item: any) => String(item?.technicalPower || '').trim() === selectedPower)
    : null;
  return Number(selectedParam?.amount ?? parameters[0]?.amount ?? product?.price ?? 0);
};

const FloatingCartPreview: React.FC<FloatingCartPreviewProps> = ({ cart, lang, user, mode = 'fixed', onOpenCart, onRemoveFromCart, onUpdateCartQuantity }) => {
  const { getProductById } = useProduct();
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartPreviewKey = cart.map((item) => `${item.id}:${item.power || ''}:${item.quantity}`).join('|');
  const isInline = mode === 'inline';

  useEffect(() => {
    let cancelled = false;

    const loadPreviewProducts = async () => {
      if (!isOpen) {
        setProducts([]);
        return;
      }

      if (cart.length === 0) {
        setProducts([]);
        return;
      }

      try {
        const results = await Promise.all(
          cart.slice(0, 4).map(async (item) => {
            const response = await getProductById(item.id);
            return {
              ...response.data,
              cartId: item.id,
              quantity: item.quantity,
              selectedPower: item.power,
            };
          })
        );
        if (!cancelled) setProducts(results);
      } catch (error) {
        console.error('Cart preview load error:', error);
        if (!cancelled) setProducts([]);
      }
    };

    loadPreviewProducts();

    return () => {
      cancelled = true;
    };
  }, [cartPreviewKey, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!previewRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleScroll = () => setIsOpen(false);
    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  if (user?.role === 'admin' || cart.length === 0) return null;

  const subtotal = products.reduce((sum, item) => sum + getCartLinePrice(item, item.selectedPower) * item.quantity, 0);
  const itemWord = lang === 'az' ? 'məhsul' : lang === 'ru' ? 'товаров' : lang === 'tr' ? 'ürün' : 'items';
  const label = lang === 'az' ? 'Səbətə bax' : lang === 'ru' ? 'Открыть корзину' : lang === 'tr' ? 'Sepeti aç' : 'View Cart';
  const fullView = lang === 'az' ? 'Tam səbətə keç' : lang === 'ru' ? 'Вся корзина' : lang === 'tr' ? 'Tam sepete git' : 'Full cart view';
  const emptyLoading = lang === 'az' ? 'Məhsullar yüklənir...' : lang === 'ru' ? 'Загрузка товаров...' : lang === 'tr' ? 'Ürünler yükleniyor...' : 'Loading items...';

  const handleMainClick = () => {
    setIsOpen((value) => !value);
  };

  const handleFullView = () => {
    setIsOpen(false);
    onOpenCart();
  };

  const changePreviewQuantity = (item: any, nextQuantity: number) => {
    const id = String(item.cartId ?? item.id);
    if (nextQuantity < 0) {
      onRemoveFromCart(id, item.selectedPower);
      return;
    }
    setProducts((current) => current.map((product) =>
      String(product.cartId ?? product.id) === id && product.selectedPower === item.selectedPower
        ? { ...product, quantity: nextQuantity }
        : product
    ));
    onUpdateCartQuantity(id, nextQuantity, item.selectedPower);
  };

  const handlePreviewQuantityInput = (item: any, value: string) => {
    const nextQuantity = Number.parseInt(value, 10);
    if (Number.isNaN(nextQuantity)) return;
    changePreviewQuantity(item, Math.max(0, nextQuantity));
  };

  const stopPreviewPointer = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  const removePreviewItem = (item: any) => {
    const id = String(item.cartId ?? item.id);
    setProducts((current) => current.filter((product) =>
      !(String(product.cartId ?? product.id) === id && product.selectedPower === item.selectedPower)
    ));
    onRemoveFromCart(id, item.selectedPower);
  };

  return (
    <div
      ref={previewRef}
      className={isInline ? "relative z-[60]" : "fixed bottom-5 right-4 z-[100] sm:bottom-8 sm:right-8"}
    >
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-4 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/20 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</div>
              <div className="text-sm font-black text-slate-900">{totalQuantity} {itemWord}</div>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-600">
              {subtotal.toFixed(2)} AZN
            </span>
          </div>

          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {products.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-slate-400">{emptyLoading}</div>
            ) : (
              products.map((item) => {
                const price = getCartLinePrice(item, item.selectedPower);
                return (
                  <div key={`${item.id}-${item.selectedPower || 'base'}`} className="flex items-center gap-3 rounded-xl bg-slate-50 p-2 transition-all hover:bg-slate-100">
                    <div className="h-14 w-14 shrink-0 rounded-lg bg-white p-1.5">
                      <img src={getProductImage(item)} alt={item.productName} className="h-full w-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-black text-slate-900">{item.productName}</div>
                      {item.selectedPower && <div className="text-[10px] font-bold text-slate-400">{item.selectedPower}</div>}
                      <div className="mt-1 text-[11px] font-black text-emerald-600">{(price * item.quantity).toFixed(2)} AZN</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onPointerDown={stopPreviewPointer}
                        onClick={(event) => {
                          event.stopPropagation();
                          changePreviewQuantity(item, item.quantity - 1);
                        }}
                        className="flex h-8 w-8 touch-manipulation items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm transition-all hover:bg-emerald-50 hover:text-emerald-600 active:scale-95"
                        aria-label="Decrease quantity"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
                      </button>
                      <input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        value={item.quantity}
                        onPointerDown={stopPreviewPointer}
                        onClick={(event) => event.stopPropagation()}
                        onFocus={(event) => event.currentTarget.select()}
                        onChange={(event) => handlePreviewQuantityInput(item, event.target.value)}
                        className="flex h-8 w-11 touch-manipulation rounded-lg bg-white px-1 text-center text-xs font-black text-slate-900 shadow-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500/40"
                        aria-label="Cart item quantity"
                      />
                      <button
                        type="button"
                        onPointerDown={stopPreviewPointer}
                        onClick={(event) => {
                          event.stopPropagation();
                          changePreviewQuantity(item, item.quantity + 1);
                        }}
                        className="flex h-8 w-8 touch-manipulation items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm transition-all hover:bg-emerald-50 hover:text-emerald-600 active:scale-95"
                        aria-label="Increase quantity"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                      </button>
                      <button
                        type="button"
                        onPointerDown={stopPreviewPointer}
                        onClick={(event) => {
                          event.stopPropagation();
                          removePreviewItem(item);
                        }}
                        className="flex h-8 w-8 touch-manipulation items-center justify-center rounded-lg bg-white text-slate-300 shadow-sm transition-all hover:bg-red-50 hover:text-red-500 active:scale-95"
                        aria-label="Remove item"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button
            type="button"
            onClick={handleFullView}
            className="mt-4 w-full rounded-xl bg-emerald-600 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-lg active:scale-[0.98]"
          >
            {fullView}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleMainClick}
        className={isInline
          ? "group flex h-full min-h-12 items-center justify-center rounded-xl bg-emerald-600 px-4 text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-slate-900 active:scale-95"
          : "group rounded-full bg-emerald-600 p-4 text-white shadow-2xl shadow-emerald-600/40 transition-all hover:bg-slate-900 active:scale-95 animate-in fade-in zoom-in duration-300"}
        aria-expanded={isOpen}
        aria-label={label}
      >
        <div className="relative">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-emerald-600 bg-white text-[10px] font-black text-emerald-600 shadow-md">
            {totalQuantity}
          </span>
        </div>
        <div className={`${isInline ? 'hidden' : 'pointer-events-none absolute right-full top-1/2 mr-4 -translate-y-1/2'} whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white opacity-0 transition-opacity group-hover:opacity-100`}>
          {label}
        </div>
      </button>
    </div>
  );
};

interface CartTransferModalProps {
  pending: PendingCartTransfer;
  lang: Language;
  onTransfer: (targetKey: string) => void;
  onCancel: () => void;
}

const CartTransferModal: React.FC<CartTransferModalProps> = ({ pending, lang, onTransfer, onCancel }) => {
  const guestQuantity = getCartQuantity(pending.guestCart);
  const copy = {
    title: lang === 'az' ? 'Səbəti hara köçürək?' : lang === 'ru' ? 'Куда перенести корзину?' : lang === 'tr' ? 'Sepet nereye aktarılsın?' : 'Where should we move the cart?',
    body: lang === 'az'
      ? 'Bu cihazda bir neçə hesab istifadə olunub. Girişdən əvvəl topladığınız məhsulları hansı hesaba əlavə etmək istədiyinizi seçin.'
      : lang === 'ru'
        ? 'На этом устройстве использовалось несколько аккаунтов. Выберите, в какой аккаунт добавить товары, выбранные до входа.'
        : lang === 'tr'
          ? 'Bu cihazda birden fazla hesap kullanılmış. Girişten önce eklediğiniz ürünlerin hangi hesaba aktarılacağını seçin.'
          : 'This device has used more than one account. Choose which account should receive the items added before login.',
    guest: lang === 'az' ? 'Gözləyən səbət' : lang === 'ru' ? 'Ожидающая корзина' : lang === 'tr' ? 'Bekleyen sepet' : 'Pending cart',
    current: lang === 'az' ? 'hazırki giriş' : lang === 'ru' ? 'текущий вход' : lang === 'tr' ? 'mevcut giriş' : 'current login',
    existing: lang === 'az' ? 'mövcud məhsul' : lang === 'ru' ? 'товаров уже есть' : lang === 'tr' ? 'mevcut ürün' : 'existing items',
    cancel: 'Cancel',
    note: lang === 'az'
      ? 'Cancel seçsəniz, məhsullar heç bir hesaba göndərilməyəcək və qonaq səbətində saxlanacaq.'
      : lang === 'ru'
        ? 'Если выбрать Cancel, товары не будут отправлены ни в один аккаунт и останутся в гостевой корзине.'
        : lang === 'tr'
          ? 'Cancel seçerseniz ürünler hiçbir hesaba gönderilmez ve misafir sepetinde kalır.'
          : 'Cancel keeps these items out of every account and leaves them in the guest cart.',
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl shadow-slate-950/25">
        <div className="mb-5 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2 2h13M9 21a1 1 0 100-2 1 1 0 000 2Zm8 0a1 1 0 100-2 1 1 0 000 2Z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">{copy.title}</h3>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{copy.body}</p>
          </div>
        </div>

        <div className="mb-4 rounded-xl bg-slate-50 px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{copy.guest}</div>
          <div className="mt-1 text-sm font-black text-slate-900">{guestQuantity} {lang === 'az' ? 'məhsul' : lang === 'ru' ? 'товаров' : lang === 'tr' ? 'ürün' : 'items'}</div>
        </div>

        <div className="space-y-2">
          {pending.candidates.map((candidate) => (
            <button
              key={candidate.key}
              type="button"
              onClick={() => onTransfer(candidate.key)}
              className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-3 text-left transition-all hover:border-emerald-200 hover:bg-emerald-50"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-black text-slate-900">
                  {candidate.name || candidate.email}
                  {candidate.isCurrent && <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">{copy.current}</span>}
                </span>
                <span className="block truncate text-xs font-bold text-slate-400">{candidate.email}</span>
              </span>
              <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                {candidate.quantity} {copy.existing}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs font-semibold leading-5 text-slate-400">{copy.note}</p>
        <button
          type="button"
          onClick={onCancel}
          className="mt-5 w-full rounded-xl border border-slate-200 py-3 text-[11px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-50"
        >
          {copy.cancel}
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <UploadProvider>
          <AppContent />
        </UploadProvider>
      </AuthProvider>
    </NotificationProvider>
  );
};

const AppContent: React.FC = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const savedLang = localStorage.getItem('lang');
  const [view, setView] = useState<{ page: PageView; id?: string; extra?: any }>({ page: 'home' });
  const [hasStoredLang, setHasStoredLang] = useState(isSupportedLanguage(savedLang));
  const [lang, setLang] = useState<'az' | 'en' | 'ru' | 'tr'>(
    isSupportedLanguage(savedLang) ? savedLang : 'en'
  );
  const [cart, setCart] = useState<{ id: string; quantity: number; power?: string }[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [pendingCartTransfer, setPendingCartTransfer] = useState<PendingCartTransfer | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  useEffect(() => {
    const defaults = { primary: '#99c21c', accent: '#a0ae5e', dark: '#172b27', surface: '#f7faf9', text: '#334155' };
    let activeTheme = defaults;
    try {
      activeTheme = { ...defaults, ...JSON.parse(localStorage.getItem('volt-theme-lab-saved') || '{}') };
    } catch {
      activeTheme = defaults;
    }
    Object.entries(activeTheme).forEach(([role, color]) => {
      document.documentElement.style.setProperty(`--color-${role}`, color);
    });
  }, []);

  useEffect(() => {
    const handleThemePreview = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== 'volt-theme-preview') return;
      const previewTheme = event.data.theme || {};
      Object.entries(previewTheme).forEach(([role, color]) => {
        if (typeof color === 'string') document.documentElement.style.setProperty(`--color-${role}`, color);
      });
      if (typeof event.data.logo === 'string') setPreviewLogo(event.data.logo);
    };
    window.addEventListener('message', handleThemePreview);
    return () => window.removeEventListener('message', handleThemePreview);
  }, []);


  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view.page, view.id]);

  useEffect(() => {
    if (hasStoredLang) {
      localStorage.setItem('lang', lang);
    }
  }, [lang, hasStoredLang]);

  useEffect(() => {
    if (hasStoredLang) return;

    let cancelled = false;
    const detectLanguage = async () => {
      const detectedLang = await detectIpLanguage() || detectBrowserLanguage() || 'en';
      if (cancelled) return;
      setLang(detectedLang);
      localStorage.setItem('lang', detectedLang);
      setHasStoredLang(true);
    };

    detectLanguage();

    return () => {
      cancelled = true;
    };
  }, [hasStoredLang]);

  useEffect(() => {
    const savedUser = localStorage.getItem('volt_current_user');
    let restoredUser: User | null = null;

    if (savedUser) {
      try {
        restoredUser = JSON.parse(savedUser);
        setUser(restoredUser);
      } catch (e) {
        localStorage.removeItem('volt_current_user');
      }
    }

    const restoredUserCart = restoredUser && restoredUser.role !== 'admin'
      ? getCartForUser(restoredUser)
      : [];
    const restoredCart = restoredUser && restoredUser.role !== 'admin'
      ? (restoredUserCart.length > 0 ? restoredUserCart : normalizeCart(readStorageJson(CART_STORAGE_KEY, [])))
      : getGuestCart();
    setCart(restoredCart);
    saveVisibleCart(restoredCart);

    if (!localStorage.getItem('volt_users')) {
      const initialUsers = [
        { email: 'admin@volt.az', name: 'Administrator', role: 'admin', isApproved: true }
      ];
      localStorage.setItem('volt_users', JSON.stringify(initialUsers));
    }
  }, []);

  // Helpers to map pages <-> paths so navigation uses routes while keeping view state for legacy components
  const pageToPath = (page: PageView, id?: string, extra?: any) => {
    switch (page) {
      case 'home': return '/';
      case 'about': return '/about';
      case 'about-detail': return `/about/detail/${extra?.section || id || ''}`;
      case 'services': {
        const service = extra?.service ?? extra?.serviceId;
        const params = new URLSearchParams();
        if (service !== undefined && service !== null) params.set('service', String(service));
        if (extra?.focus !== undefined && extra?.focus !== null) params.set('focus', String(extra.focus));
        const query = params.toString();
        return query ? `/services?${query}` : '/services';
      }
      case 'projects': return '/projects';
      case 'project-detail': return `/projects/${id || ''}`;
      case 'products': {
        const params = new URLSearchParams();
        const category = extra?.category ?? extra?.categoryId;
        const subCategory = extra?.subCategory ?? extra?.subCategoryId;
        const search = extra?.search;
        if (category !== undefined && category !== null) params.set('category', String(category));
        if (subCategory !== undefined && subCategory !== null) params.set('subCategory', String(subCategory));
        if (search !== undefined && search !== null && String(search).trim()) params.set('search', String(search).trim());
        const query = params.toString();
        return query ? `/products?${query}` : '/products';
      }
      case 'product-detail': return `/product/${id || ''}`;
      case 'contact': return '/contact';
      case 'news': return id ? `/news/${id}` : '/news';
      case 'blog': return id ? `/blog/${id}` : '/blog';
      case 'credits': return '/credits';
      case 'video-reels': return '/videos';
      case 'faq': return '/faq';
      case 'how-to-start': return '/how-to-start';
      case 'order': return `/order/${id || ''}`;
      case 'checkout': return '/checkout';
      case 'cart': return '/cart';
      case 'calculator': return '/calculator';
      case 'customer-dashboard': return '/customer-dashboard';
      case 'admin-dashboard': return '/admin-dashboard';
      case 'legislation': return '/legislation';
      case 'pro-club': return '/pro-club';
      case 'pro-club-dashboard': return '/pro-club/dashboard';
      case 'necessary-documents': return '/necessary-documents';
      case 'partnership': return '/partnership';
      case 'privacy-policy': return '/privacy-policy';
      case 'terms-of-service': return '/terms-of-service';
      case 'purchase-terms': return '/purchase-terms';
      default: return '/';
    }
  };

  const pathToPage = (path: string, search = '') : {page: PageView; id?: string; extra?: any} => {
    const parts = path.split('/').filter(Boolean);
    if (path === '/' || parts.length === 0) return { page: 'home' };
    if (parts[0] === 'about' && parts[1] === 'detail') return { page: 'about-detail', id: parts[2], extra: { section: parts[2] } };
    if (parts[0] === 'about') return { page: 'about' };
    if (parts[0] === 'services') {
      const params = new URLSearchParams(search);
      const service = params.get('service') || undefined;
      const focus = params.get('focus') || undefined;
      return { page: 'services', extra: { service, focus } };
    }
    if (parts[0] === 'projects' && parts[1]) return { page: 'project-detail', id: parts[1] };
    if (parts[0] === 'projects') return { page: 'projects' };
    if (parts[0] === 'products') {
      const params = new URLSearchParams(search);
      const category = params.get('category') || undefined;
      const subCategory = params.get('subCategory') || undefined;
      const productSearch = params.get('search') || undefined;
      return { page: 'products', extra: { category, subCategory, search: productSearch } };
    }
    if (parts[0] === 'product' && parts[1]) return { page: 'product-detail', id: parts[1] };
    if (parts[0] === 'contact') return { page: 'contact' };
    if (parts[0] === 'news' && parts[1]) return { page: 'news', id: parts[1] };
    if (parts[0] === 'news') return { page: 'news' };
    if (parts[0] === 'blog' && parts[1]) return { page: 'blog', id: parts[1] };
    if (parts[0] === 'blog') return { page: 'blog' };
    if (parts[0] === 'credits' || parts[0] === 'credit') return { page: 'credits' };
    if (parts[0] === 'videos' || parts[0] === 'reels') return { page: 'video-reels' };
    if (parts[0] === 'faq') return { page: 'faq' };
    if (parts[0] === 'how-to-start') return { page: 'how-to-start' };
    if (parts[0] === 'order' && parts[1]) return { page: 'order', id: parts[1] };
    if (parts[0] === 'order') return { page: 'order' };
    if (parts[0] === 'checkout') return { page: 'checkout' };
    if (parts[0] === 'cart') return { page: 'cart' };
    if (parts[0] === 'calculator') return { page: 'calculator' };
    if (parts[0] === 'customer-dashboard') return { page: 'customer-dashboard' };
    if (parts[0] === 'admin-dashboard') return { page: 'admin-dashboard' };
    if (parts[0] === 'legislation') return { page: 'legislation' };
    if (parts[0] === 'pro-club' && parts[1] === 'dashboard') return { page: 'pro-club-dashboard' };
    if (parts[0] === 'pro-club') return { page: 'pro-club' };
    if (parts[0] === 'necessary-documents') return { page: 'necessary-documents' };
    if (parts[0] === 'partnership') return { page: 'partnership' };
    if (parts[0] === 'privacy-policy') return { page: 'privacy-policy' };
    if (parts[0] === 'terms-of-service' || parts[0] === 'terms') return { page: 'terms-of-service' };
    if (parts[0] === 'purchase-terms') return { page: 'purchase-terms' };
    return { page: 'home' };
  };

  const navigateTo = (page: PageView, id?: string, extra?: any) => {
    const path = pageToPath(page, id, extra);
    navigate(path);
    setView({ page, id, extra });
  };


  const handleBack = () => {
    navigate("/");
    setView({ page: 'home' });
  };

  const persistCart = (nextCart: CartLine[], owner: User | null = user) => {
    const normalizedCart = normalizeCart(nextCart);

    if (owner && owner.role !== 'admin') {
      saveCartForUser(owner, normalizedCart);
    } else {
      saveGuestCart(normalizedCart);
    }

    saveVisibleCart(normalizedCart);
  };

  const handleAddToCart = (productId: string, quantity: number = 1, power?: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => isSameCartLine(item, productId, power));
      let updatedCart;
      if (existingItem) {
        updatedCart = prevCart.map(item =>
          isSameCartLine(item, productId, power) ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        updatedCart = [...prevCart, { id: productId, quantity, power }];
      }
      persistCart(updatedCart);
      return updatedCart;
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number, power?: string) => {
    if (quantity < 0) {
      handleRemoveFromCart(productId, power);
      return;
    }
    setCart(prevCart => {
      const updatedCart = prevCart.map(item =>
        isSameCartLine(item, productId, power) ? { ...item, quantity } : item
      );
      persistCart(updatedCart);
      return updatedCart;
    });
  };

  const handleRemoveFromCart = (productId: string, power?: string) => {
    setCart(prevCart => {
      const updatedCart = prevCart.filter(item => !isSameCartLine(item, productId, power));
      persistCart(updatedCart);
      return updatedCart;
    });
  };

  const handleClearCart = () => {
    setCart([]);
    persistCart([]);
  };

  const handleCustomerContactCaptured = (contact: { name: string; phone: string; email: string; address: string; city?: string }) => {
    setUser((current) => {
      if (!current || current.role !== 'customer' || current.email.toLowerCase() !== contact.email.toLowerCase()) {
        return current;
      }

      const updated = {
        ...current,
        name: contact.name || current.name,
        phone: contact.phone || current.phone,
        address: contact.address || current.address,
        city: contact.city || current.city,
      };
      localStorage.setItem('volt_current_user', JSON.stringify(updated));
      return updated;
    });
  };

  const handleCheckoutFromCart = () => {
    const activeCart = cart.filter((item) => item.quantity > 0);
    if (activeCart.length !== cart.length) {
      setCart(activeCart);
      persistCart(activeCart);
    }
    if (activeCart.length > 0) {
      navigateTo('checkout');
    }
  };

  const handleLogin = async (userData: User) => {
    const wasGuest = !user;
    const pendingGuestCart = wasGuest ? normalizeCart(cart.length > 0 ? cart : getGuestCart()) : [];
    const hydratedUser = await mergeCheckoutContactIntoUser(userData);
    const sessions = rememberCartSession(hydratedUser);

    setUser(hydratedUser);
    localStorage.setItem('volt_current_user', JSON.stringify(hydratedUser));

    if (hydratedUser.role === 'admin') {
      if (pendingGuestCart.length > 0) saveGuestCart(pendingGuestCart);
      setCart([]);
      saveVisibleCart([]);
      navigateTo('admin-dashboard');
      return;
    }

    if (wasGuest && pendingGuestCart.length > 0) {
      const candidates = buildCartTransferCandidates(sessions, hydratedUser);

      if (candidates.length > 1) {
        const currentCart = getCartForUser(hydratedUser);
        saveGuestCart(pendingGuestCart);
        setCart(currentCart);
        saveVisibleCart(currentCart);
        setPendingCartTransfer({
          user: hydratedUser,
          guestCart: pendingGuestCart,
          candidates,
        });
      } else {
        const mergedCart = mergeCartLines(getCartForUser(hydratedUser), pendingGuestCart);
        saveCartForUser(hydratedUser, mergedCart);
        clearGuestCart();
        setCart(mergedCart);
        saveVisibleCart(mergedCart);
      }
    } else {
      const nextCart = getCartForUser(hydratedUser);
      setCart(nextCart);
      saveVisibleCart(nextCart);
    }

    if (hydratedUser.role === 'master') {
      navigateTo('pro-club-dashboard');
    } else {
      navigateTo('customer-dashboard');
    }
  };

  const handleLogout = () => {
    if (user && user.role !== 'admin') {
      saveCartForUser(user, cart);
    }

    const guestCart = getGuestCart();
    setUser(null);
    setCart(guestCart);
    saveVisibleCart(guestCart);
    localStorage.removeItem('volt_current_user');
    setPendingCartTransfer(null);
    navigateTo('home');
  };

  const handleCartTransfer = (targetKey: string) => {
    if (!pendingCartTransfer) return;

    const targetCart = getCartForUserKey(targetKey);
    const mergedCart = mergeCartLines(targetCart, pendingCartTransfer.guestCart);
    saveCartForUserKey(targetKey, mergedCart);
    clearGuestCart();

    const currentKey = getUserCartKey(pendingCartTransfer.user);
    if (targetKey === currentKey) {
      setCart(mergedCart);
      saveVisibleCart(mergedCart);
    } else {
      const currentCart = getCartForUserKey(currentKey);
      setCart(currentCart);
      saveVisibleCart(currentCart);
    }

    setPendingCartTransfer(null);
  };

  const handleCancelCartTransfer = () => {
    if (!pendingCartTransfer) return;

    saveGuestCart(pendingCartTransfer.guestCart);
    const currentCart = getCartForUser(pendingCartTransfer.user);
    setCart(currentCart);
    saveVisibleCart(currentCart);
    setPendingCartTransfer(null);
  };

  // Sync location -> view so direct URL access renders correct content
  const location = useLocation();
  useEffect(() => {
    const mapped = pathToPage(location.pathname, location.search);
    setView({ page: mapped.page, id: mapped.id, extra: mapped.extra });
  }, [location.pathname, location.search]);

  useEffect(() => {
    const publicRobots = 'index, follow, max-image-preview:none, max-snippet:-1, max-video-preview:-1';
    const imageRobots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    const seoByPage: Record<PageView, SeoMeta> = {
      home: {
        title: {
          az: 'Volt.az | Günəş Panelləri Satışı və Quraşdırılması | SOLARIX',
          en: 'Volt.az | Solar Panels, Installation and Energy Solutions',
          ru: 'Volt.az | Солнечные панели, монтаж и энергетические решения',
          tr: 'Volt.az | Güneş Panelleri, Kurulum ve Enerji Çözümleri'
        },
        description: {
          az: 'Volt.az Azərbaycanda günəş panelləri, invertorlar, enerji saxlama, quraşdırma və solar kalkulyator xidmətləri təqdim edir.',
          en: 'Volt.az provides solar panels, inverters, energy storage, installation services, and solar calculators in Azerbaijan for homes and businesses.',
          ru: 'Volt.az предлагает солнечные панели, инверторы, накопители энергии, монтаж и солнечный калькулятор для домов и бизнеса в Азербайджане.',
          tr: 'Volt.az Azerbaycan’da güneş panelleri, inverterler, enerji depolama, kurulum hizmetleri ve güneş enerjisi hesaplayıcısı sunar.'
        },
        keywords: 'günəş panelləri, günəş paneli, solar panel, solar enerji, günəş enerjisi, SOLARIX, Volt.az, solar panels Azerbaijan, solar installation Azerbaijan',
        robots: publicRobots,
        previewImage: null
      },
      about: {
        title: { az: 'Haqqımızda | Volt.az', en: 'About Us | Volt.az', ru: 'О нас | Volt.az', tr: 'Hakkımızda | Volt.az' },
        description: {
          az: 'Volt.az və SOLARIX MMC haqqında məlumat, missiya, enerji həlləri və Azərbaycanda bərpa olunan enerji yanaşmamız.',
          en: 'Learn about Volt.az and SOLARIX, our mission, solar energy solutions, and renewable energy approach in Azerbaijan.',
          ru: 'Информация о Volt.az и SOLARIX, миссии, решениях солнечной энергетики и подходе к возобновляемой энергии в Азербайджане.',
          tr: 'Volt.az ve SOLARIX hakkında bilgi, misyonumuz, güneş enerjisi çözümleri ve Azerbaycan’da yenilenebilir enerji yaklaşımımız.'
        }
      },
      'about-detail': {
        title: { az: 'Şirkət haqqında | Volt.az', en: 'Company | Volt.az', ru: 'Компания | Volt.az', tr: 'Şirket | Volt.az' },
        description: {
          az: 'Volt.az şirkət məlumatları, missiya və vizyon bölməsi.',
          en: 'Volt.az company information, mission, and vision.',
          ru: 'Информация о компании Volt.az, миссия и видение.',
          tr: 'Volt.az şirket bilgileri, misyon ve vizyon.'
        }
      },
      services: {
        title: { az: 'Xidmətlər | Günəş Paneli Quraşdırılması | Volt.az', en: 'Services | Solar Panel Installation | Volt.az', ru: 'Услуги | Монтаж солнечных панелей | Volt.az', tr: 'Hizmetler | Güneş Paneli Kurulumu | Volt.az' },
        description: {
          az: 'Günəş paneli quraşdırılması, layihələndirmə, enerji auditi, monitorinq, maliyyə və sənədləşmə xidmətləri.',
          en: 'Solar panel installation, system design, energy audits, monitoring, finance, and documentation services.',
          ru: 'Монтаж солнечных панелей, проектирование систем, энергоаудит, мониторинг, финансирование и оформление документов.',
          tr: 'Güneş paneli kurulumu, sistem tasarımı, enerji etüdü, izleme, finansman ve belge desteği hizmetleri.'
        },
        keywords: 'günəş paneli quraşdırılması, solar installation, solar panel installation Azerbaijan, günəş sistemi layihələndirmə'
      },
      products: {
        title: { az: 'Məhsullar | Günəş Panelləri, İnvertorlar və Avadanlıqlar | Volt.az', en: 'Products | Solar Panels, Inverters and Equipment | Volt.az', ru: 'Продукты | Солнечные панели, инверторы и оборудование | Volt.az', tr: 'Ürünler | Güneş Panelleri, İnverterler ve Ekipmanlar | Volt.az' },
        description: {
          az: 'Volt.az məhsulları: günəş panelləri, invertorlar, kabellər, qoruma avadanlıqları və enerji sistemləri.',
          en: 'Volt.az products include solar panels, inverters, cables, protection equipment, and complete energy systems.',
          ru: 'Продукты Volt.az: солнечные панели, инверторы, кабели, защитное оборудование и энергетические системы.',
          tr: 'Volt.az ürünleri: güneş panelleri, inverterler, kablolar, koruma ekipmanları ve enerji sistemleri.'
        },
        robots: imageRobots
      },
      'product-detail': {
        title: { az: 'Məhsul | Volt.az', en: 'Product | Volt.az', ru: 'Продукт | Volt.az', tr: 'Ürün | Volt.az' },
        description: {
          az: 'Volt.az məhsul məlumatları, xüsusiyyətlər, çatdırılma və zəmanət şərtləri.',
          en: 'Volt.az product details, specifications, delivery, and warranty information.',
          ru: 'Информация о продукте Volt.az, характеристики, доставка и гарантия.',
          tr: 'Volt.az ürün bilgileri, özellikler, teslimat ve garanti şartları.'
        },
        robots: imageRobots
      },
      calculator: {
        title: {
          az: 'Günəş Paneli və Günəş Enerjisi Kalkulyatoru | Volt.az',
          en: 'Solar Calculator | Solar Panel and Energy Savings Calculator | Volt.az',
          ru: 'Солнечный калькулятор | Расчет солнечных панелей | Volt.az',
          tr: 'Güneş Enerjisi Hesaplayıcı | Güneş Paneli Kalkülatörü | Volt.az'
        },
        description: {
          az: 'Volt.az günəş enerjisi kalkulyatoru ilə ev və biznes üçün günəş paneli sistem gücünü, illik istehsalı, təxmini qiyməti və qənaəti hesablayın.',
          en: 'Use the Volt.az solar calculator to estimate solar panel system size, annual production, price, payback, and electricity savings for homes and businesses.',
          ru: 'Используйте солнечный калькулятор Volt.az для расчета мощности солнечных панелей, годовой выработки, цены, окупаемости и экономии.',
          tr: 'Volt.az güneş enerjisi hesaplayıcısı ile sistem gücünü, yıllık üretimi, fiyatı, geri ödeme süresini ve elektrik tasarrufunu hesaplayın.'
        },
        keywords: 'günəş paneli kalkulyatoru, günəş enerjisi kalkulyatoru, solar calculator, solar energy calculator, solar panel calculator, PV calculator, solar savings calculator, günəş paneli hesabla, elektrik qənaəti kalkulyatoru, güneş paneli hesaplayıcı, солнечный калькулятор',
        robots: publicRobots,
        type: 'website',
        previewImage: null
      },
      contact: {
        title: { az: 'Əlaqə | Volt.az', en: 'Contact | Volt.az', ru: 'Контакты | Volt.az', tr: 'İletişim | Volt.az' },
        description: {
          az: 'Volt.az ilə əlaqə saxlayın və günəş enerjisi həlləri üçün məsləhət alın.',
          en: 'Contact Volt.az for consultation on solar energy solutions.',
          ru: 'Свяжитесь с Volt.az для консультации по решениям солнечной энергетики.',
          tr: 'Güneş enerjisi çözümleri için Volt.az ile iletişime geçin.'
        }
      },
      partnership: {
        title: { az: 'Tərəfdaşlıq | Volt.az', en: 'Partnership | Volt.az', ru: 'Партнерство | Volt.az', tr: 'İş Ortaklığı | Volt.az' },
        description: {
          az: 'SOLARIX və Volt.az tərəfdaşlıq imkanları, rəsmi partnyorlar və yaşıl enerji ekosistemi.',
          en: 'SOLARIX and Volt.az partnership opportunities, official partners, and green energy ecosystem.',
          ru: 'Партнерские возможности SOLARIX и Volt.az, официальные партнеры и экосистема зеленой энергии.',
          tr: 'SOLARIX ve Volt.az iş ortaklığı imkanları, resmi partnerler ve yeşil enerji ekosistemi.'
        }
      },
      faq: {
        title: { az: 'Tez-tez verilən suallar | Volt.az', en: 'FAQ | Volt.az', ru: 'Частые вопросы | Volt.az', tr: 'Sık Sorulan Sorular | Volt.az' },
        description: {
          az: 'Günəş panelləri, qiymətlər, quraşdırma, sənədləşmə və şəbəkəyə qoşulma ilə bağlı tez-tez verilən suallar.',
          en: 'Frequently asked questions about solar panels, prices, installation, documentation, and grid connection.',
          ru: 'Частые вопросы о солнечных панелях, ценах, монтаже, документах и подключении к сети.',
          tr: 'Güneş panelleri, fiyatlar, kurulum, belgeler ve şebeke bağlantısı hakkında sık sorulan sorular.'
        }
      },
      'how-to-start': {
        title: { az: 'Necə başlamalı? | Volt.az', en: 'How to Start | Volt.az', ru: 'Как начать? | Volt.az', tr: 'Nasıl Başlanır? | Volt.az' },
        description: {
          az: 'Günəş enerji sisteminə başlamaq üçün əsas addımlar və izahlar.',
          en: 'Key steps and explanations for starting a solar energy system.',
          ru: 'Основные шаги и объяснения для запуска системы солнечной энергетики.',
          tr: 'Güneş enerjisi sistemine başlamak için temel adımlar ve açıklamalar.'
        }
      },
      'necessary-documents': {
        title: { az: 'Zəruri sənədlər | Volt.az', en: 'Required Documents | Volt.az', ru: 'Необходимые документы | Volt.az', tr: 'Gerekli Belgeler | Volt.az' },
        description: {
          az: 'Günəş enerji sistemi üçün tələb olunan sənədlər və müraciət qaydaları.',
          en: 'Required documents and application steps for a solar energy system.',
          ru: 'Необходимые документы и порядок обращения для системы солнечной энергетики.',
          tr: 'Güneş enerjisi sistemi için gerekli belgeler ve başvuru adımları.'
        }
      },
      legislation: {
        title: { az: 'Qanunvericilik və Fərmanlar | Volt.az', en: 'Legislation and Decrees | Volt.az', ru: 'Законодательство и указы | Volt.az', tr: 'Mevzuat ve Kararlar | Volt.az' },
        description: {
          az: 'Günəş enerjisi, net-metering və aktiv istehlakçı mexanizmi üzrə sadə izahlar.',
          en: 'Simple explanations of solar energy legislation, net metering, and active consumer mechanisms.',
          ru: 'Простые объяснения законодательства о солнечной энергетике, net-metering и механизма активного потребителя.',
          tr: 'Güneş enerjisi mevzuatı, net-metering ve aktif tüketici mekanizması hakkında sade açıklamalar.'
        }
      },
      news: {
        title: { az: 'Xəbərlər | Volt.az', en: 'News | Volt.az', ru: 'Новости | Volt.az', tr: 'Haberler | Volt.az' },
        description: {
          az: 'Volt.az xəbərləri, SOLARIX yenilikləri və bərpa olunan enerji sahəsində rəsmi məlumatlar.',
          en: 'Volt.az news, SOLARIX updates, and official renewable energy information.',
          ru: 'Новости Volt.az, обновления SOLARIX и официальная информация о возобновляемой энергетике.',
          tr: 'Volt.az haberleri, SOLARIX güncellemeleri ve yenilenebilir enerji alanında resmi bilgiler.'
        },
        keywords: 'Volt.az xəbərlər, solar news Azerbaijan, renewable energy news, günəş enerjisi xəbərləri, bərpa olunan enerji xəbərləri',
        robots: publicRobots
      },
      blog: {
        title: { az: 'Bloq | Günəş Enerjisi Məqalələri | Volt.az', en: 'Blog | Solar Energy Articles | Volt.az', ru: 'Блог | Статьи о солнечной энергетике | Volt.az', tr: 'Blog | Güneş Enerjisi Yazıları | Volt.az' },
        description: {
          az: 'Günəş enerjisi, günəş panelləri, invertorlar, enerji qənaəti və solar kalkulyator haqqında faydalı məqalələr.',
          en: 'Useful articles about solar energy, solar panels, inverters, energy savings, and solar calculators.',
          ru: 'Полезные статьи о солнечной энергетике, солнечных панелях, инверторах, экономии энергии и солнечных калькуляторах.',
          tr: 'Güneş enerjisi, güneş panelleri, inverterler, enerji tasarrufu ve güneş hesaplayıcıları hakkında faydalı yazılar.'
        },
        keywords: 'solar blog, günəş enerjisi bloqu, solar articles, günəş paneli məqalələri, solar calculator blog, renewable energy blog',
        robots: publicRobots
      },
      'privacy-policy': {
        title: { az: 'Məxfilik siyasəti | Volt.az', en: 'Privacy Policy | Volt.az', ru: 'Политика конфиденциальности | Volt.az', tr: 'Gizlilik Politikası | Volt.az' },
        description: {
          az: 'Volt.az məxfilik siyasəti və istifadəçi məlumatlarının qorunması.',
          en: 'Volt.az privacy policy and user data protection.',
          ru: 'Политика конфиденциальности Volt.az и защита данных пользователей.',
          tr: 'Volt.az gizlilik politikası ve kullanıcı verilerinin korunması.'
        }
      },
      'terms-of-service': {
        title: { az: 'İstifadə şərtləri | Volt.az', en: 'Terms of Service | Volt.az', ru: 'Условия использования | Volt.az', tr: 'Kullanım Şartları | Volt.az' },
        description: {
          az: 'Volt.az istifadə şərtləri, sifariş, ödəniş, çatdırılma, zəmanət və məsuliyyət qaydaları.',
          en: 'Volt.az terms of service, ordering, payment, delivery, warranty, and responsibility rules.',
          ru: 'Условия использования Volt.az, правила заказа, оплаты, доставки, гарантии и ответственности.',
          tr: 'Volt.az kullanım şartları, sipariş, ödeme, teslimat, garanti ve sorumluluk kuralları.'
        }
      },
      'purchase-terms': {
        title: { az: 'Alış şərtləri | Volt.az', en: 'Purchase Terms | Volt.az', ru: 'Условия покупки | Volt.az', tr: 'Satın Alma Şartları | Volt.az' },
        description: {
          az: 'Volt.az məhsul alışı üçün şərtlər.',
          en: 'Volt.az product purchase terms.',
          ru: 'Условия покупки товаров Volt.az.',
          tr: 'Volt.az ürün satın alma şartları.'
        }
      },
      projects: {
        title: { az: 'Layihələr | Volt.az', en: 'Projects | Volt.az', ru: 'Проекты | Volt.az', tr: 'Projeler | Volt.az' },
        description: {
          az: 'Volt.az günəş enerjisi və bərpa olunan enerji layihələri.',
          en: 'Volt.az solar energy and renewable energy projects.',
          ru: 'Проекты Volt.az в области солнечной и возобновляемой энергетики.',
          tr: 'Volt.az güneş enerjisi ve yenilenebilir enerji projeleri.'
        },
        robots: imageRobots
      },
      'project-detail': {
        title: { az: 'Layihə | Volt.az', en: 'Project | Volt.az', ru: 'Проект | Volt.az', tr: 'Proje | Volt.az' },
        description: {
          az: 'Volt.az layihə məlumatları və enerji həlləri.',
          en: 'Volt.az project information and energy solutions.',
          ru: 'Информация о проекте Volt.az и энергетические решения.',
          tr: 'Volt.az proje bilgileri ve enerji çözümleri.'
        },
        robots: imageRobots
      },
      credits: {
        title: { az: 'Kredit şərtləri | Volt.az', en: 'Credit Terms | Volt.az', ru: 'Условия кредита | Volt.az', tr: 'Kredi Şartları | Volt.az' },
        description: {
          az: 'Günəş paneli sistemləri üçün maliyyələşmə və kredit imkanları.',
          en: 'Financing and credit options for solar panel systems.',
          ru: 'Финансирование и кредитные возможности для систем солнечных панелей.',
          tr: 'Güneş paneli sistemleri için finansman ve kredi imkanları.'
        }
      },
      'video-reels': {
        title: { az: 'Video Reels | Volt.az', en: 'Video Reels | Volt.az', ru: 'Видео | Volt.az', tr: 'Video Reels | Volt.az' },
        description: {
          az: 'Volt.az video materialları və günəş enerjisi izahları.',
          en: 'Volt.az videos and solar energy explanations.',
          ru: 'Видео Volt.az и объяснения о солнечной энергетике.',
          tr: 'Volt.az video içerikleri ve güneş enerjisi açıklamaları.'
        }
      },
      'pro-club': {
        title: { az: 'Ustalar Klubu | Volt.az', en: 'Masters Club | Volt.az', ru: 'Клуб мастеров | Volt.az', tr: 'Ustalar Kulübü | Volt.az' },
        description: {
          az: 'Volt.az ustalar klubu və peşəkar əməkdaşlıq imkanları.',
          en: 'Volt.az masters club and professional cooperation opportunities.',
          ru: 'Клуб мастеров Volt.az и возможности профессионального сотрудничества.',
          tr: 'Volt.az ustalar kulübü ve profesyonel iş birliği imkanları.'
        }
      },
      cart: {
        title: { az: 'Səbət | Volt.az', en: 'Cart | Volt.az', ru: 'Корзина | Volt.az', tr: 'Sepet | Volt.az' },
        description: { az: 'Volt.az alış-veriş səbəti.', en: 'Volt.az shopping cart.', ru: 'Корзина Volt.az.', tr: 'Volt.az alışveriş sepeti.' },
        robots: 'noindex, nofollow'
      },
      checkout: {
        title: { az: 'Checkout | Volt.az', en: 'Checkout | Volt.az', ru: 'Оформление заказа | Volt.az', tr: 'Checkout | Volt.az' },
        description: { az: 'Volt.az təhlükəsiz checkout səhifəsi.', en: 'Volt.az secure checkout page.', ru: 'Страница безопасного оформления заказа Volt.az.', tr: 'Volt.az güvenli checkout sayfası.' },
        robots: 'noindex, nofollow'
      },
      order: {
        title: { az: 'Sifariş | Volt.az', en: 'Order | Volt.az', ru: 'Заказ | Volt.az', tr: 'Sipariş | Volt.az' },
        description: { az: 'Volt.az sifariş səhifəsi.', en: 'Volt.az order page.', ru: 'Страница заказа Volt.az.', tr: 'Volt.az sipariş sayfası.' },
        robots: 'noindex, nofollow'
      },
      'customer-dashboard': {
        title: { az: 'Şəxsi kabinet | Volt.az', en: 'Customer Dashboard | Volt.az', ru: 'Личный кабинет | Volt.az', tr: 'Müşteri Paneli | Volt.az' },
        description: { az: 'Volt.az müştəri kabineti.', en: 'Volt.az customer dashboard.', ru: 'Личный кабинет Volt.az.', tr: 'Volt.az müşteri paneli.' },
        robots: 'noindex, nofollow'
      },
      'admin-dashboard': {
        title: { az: 'Admin panel | Volt.az', en: 'Admin Panel | Volt.az', ru: 'Админ-панель | Volt.az', tr: 'Admin Paneli | Volt.az' },
        description: { az: 'Volt.az admin panel.', en: 'Volt.az admin panel.', ru: 'Админ-панель Volt.az.', tr: 'Volt.az admin paneli.' },
        robots: 'noindex, nofollow'
      },
      'pro-club-dashboard': {
        title: { az: 'Usta kabineti | Volt.az', en: 'Master Dashboard | Volt.az', ru: 'Кабинет мастера | Volt.az', tr: 'Usta Paneli | Volt.az' },
        description: { az: 'Volt.az usta kabineti.', en: 'Volt.az master dashboard.', ru: 'Кабинет мастера Volt.az.', tr: 'Volt.az usta paneli.' },
        robots: 'noindex, nofollow'
      },
      media: {
        title: { az: 'Media | Volt.az', en: 'Media | Volt.az', ru: 'Медиа | Volt.az', tr: 'Medya | Volt.az' },
        description: {
          az: 'Volt.az media bölməsi.',
          en: 'Volt.az media section.',
          ru: 'Медиа-раздел Volt.az.',
          tr: 'Volt.az medya bölümü.'
        }
      }
    };

    const meta = seoByPage[view.page] || seoByPage.home;
    const canonicalPath = view.page === 'products' ? '/products' : location.pathname || '/';
    const canonicalUrl = `https://volt.az${canonicalPath === '/' ? '/' : canonicalPath}`;
    const robots = meta.robots || publicRobots;
    const title = meta.title[lang] || meta.title.az;
    const description = meta.description[lang] || meta.description.az;

    const setMeta = (selector: string, attr: 'content' | 'href', value: string, create?: () => HTMLElement) => {
      let element = document.head.querySelector(selector) as HTMLElement | null;
      if (!element && create) {
        element = create();
        document.head.appendChild(element);
      }
      element?.setAttribute(attr, value);
    };
    const removeMeta = (selector: string) => {
      document.head.querySelector(selector)?.remove();
    };
    const setAlternate = (code: Language | 'x-default', href: string) => {
      setMeta(`link[rel="alternate"][hreflang="${code}"]`, 'href', href, () => {
        const link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', code);
        return link;
      });
    };

    document.title = title;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[name="keywords"]', 'content', meta.keywords || seoByPage.home.keywords || '');
    setMeta('meta[name="robots"]', 'content', robots);
    setMeta('meta[name="googlebot"]', 'content', robots);
    setMeta('meta[property="og:type"]', 'content', meta.type || 'website');
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[property="twitter:title"]', 'content', title);
    setMeta('meta[property="twitter:description"]', 'content', description);
    if (meta.previewImage) {
      setMeta('meta[property="twitter:card"]', 'content', 'summary_large_image');
      setMeta('meta[property="og:image"]', 'content', meta.previewImage, () => {
        const tag = document.createElement('meta');
        tag.setAttribute('property', 'og:image');
        return tag;
      });
      setMeta('meta[property="twitter:image"]', 'content', meta.previewImage, () => {
        const tag = document.createElement('meta');
        tag.setAttribute('property', 'twitter:image');
        return tag;
      });
    } else {
      setMeta('meta[property="twitter:card"]', 'content', 'summary');
      removeMeta('meta[property="og:image"]');
      removeMeta('meta[property="twitter:image"]');
    }
    setMeta('link[rel="canonical"]', 'href', canonicalUrl, () => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      return link;
    });
    (['az', 'en', 'ru', 'tr'] as Language[]).forEach((code) => setAlternate(code, canonicalUrl));
    setAlternate('x-default', canonicalUrl);
    document.documentElement.lang = lang;
  }, [view.page, view.id, location.pathname, lang]);

  const renderContent = () => {
    switch (view.page) {
      case 'about': return <AboutProvider><AboutPage lang={lang} onBack={handleBack} onNavigate={navigateTo} sectionId={view.extra?.section} /></AboutProvider>;
      case 'about-detail': return <AboutProvider><AboutDetail lang={lang} onBack={() => navigateTo('about', undefined, { section: view.extra?.section })} sectionId={view.extra?.section} /></AboutProvider>;
      case 'services': return <ServiceProvider><ServicesPage lang={lang} onBack={handleBack} initialService={view.extra?.service} focusToken={view.extra?.focus} /></ServiceProvider>;
      case 'legislation': return <LegislationPage lang={lang as any} onBack={handleBack} sectionId={view.extra?.section} />;
      case 'pro-club': return <ProClubPage lang={lang as any} onBack={handleBack} onRegisterSuccess={handleLogin} initialMode={view.extra?.mode} />;
      case 'pro-club-dashboard': return (
        <ProClubDashboard
          user={user}
          lang={lang as any}
          onBack={handleBack}
          onNavigate={navigateTo}
          onUpdateUser={(updated) => {
            setUser(updated);
            localStorage.setItem('volt_current_user', JSON.stringify(updated));
            const allUsers = JSON.parse(localStorage.getItem('volt_users') || '[]');
            const safeAllUsers = Array.isArray(allUsers) ? allUsers : [];
            const updatedAll = safeAllUsers.map((u: any) => u.email === updated.email ? updated : u);
            localStorage.setItem('volt_users', JSON.stringify(updatedAll));
          }}
        />
      );
      case 'video-reels': return <VideoReels lang={lang as any} onBack={handleBack} />;
      case 'credits': return <CreditPrivileges lang={lang as any} onBack={handleBack} />;
      // case 'credit': return <CreditPrivileges lang={lang} onBack={handleBack} />;
      // case 'reels': return <VideoReels lang={lang} onBack={handleBack} />;
      case 'faq': return <FAQPage lang={lang as any} onBack={handleBack} onNavigate={navigateTo} />;
      case 'how-to-start': return <HowToStartPage lang={lang as any} onBack={handleBack} />;
      case 'privacy-policy': return <PrivacyPolicy lang={lang as any} onBack={handleBack} />;
      case 'terms-of-service': return <TermsOfService lang={lang as any} onBack={handleBack} />;
      case 'purchase-terms': return <PurchaseTerms lang={lang as any} onBack={handleBack} />;
      case 'order': return (
        <ProductProvider>
          <CheckoutPage
            singleProduct={{ id: view.id || '', quantity: view.extra?.quantity || 1, power: view.extra?.power }}
            user={user}
            lang={lang as any}
            onBackToCart={() => navigateTo('product-detail', view.id)}
            onGoHome={() => navigateTo('home')}
            onContinueShopping={() => navigateTo('products')}
            onViewOrders={() => navigateTo('customer-dashboard', undefined, { tab: 'orders' })}
            onCustomerContactCaptured={handleCustomerContactCaptured}
            onLangChange={(nextLang) => {
              localStorage.setItem('lang', nextLang);
              setHasStoredLang(true);
              setLang(nextLang);
            }}
            onNavigate={navigateTo}
          />
        </ProductProvider>
      );
      case 'checkout': return (
        <ProductProvider>
          <CheckoutPage
            cart={cart}
            user={user}
            lang={lang as any}
            onBackToCart={() => navigateTo('cart')}
            onGoHome={() => navigateTo('home')}
            onContinueShopping={() => navigateTo('products')}
            onViewOrders={() => navigateTo('customer-dashboard', undefined, { tab: 'orders' })}
            onOrderCreated={() => handleClearCart()}
            onCustomerContactCaptured={handleCustomerContactCaptured}
            onLangChange={(nextLang) => {
              localStorage.setItem('lang', nextLang);
              setHasStoredLang(true);
              setLang(nextLang);
            }}
            onNavigate={navigateTo}
          />
        </ProductProvider>
      );
      case 'cart': return (
        <ProductProvider>
          <CartPage
            cart={cart}
            onRemoveFromCart={(id, power) => handleRemoveFromCart(id, power)}
            onUpdateCartQuantity={(id, quantity, power) => handleUpdateCartQuantity(id, quantity, power)}
            onBack={handleBack}
            lang={lang as any}
            onCheckout={handleCheckoutFromCart}
          />
        </ProductProvider>
      );

      case 'calculator': return (
        <div className="pt-20">
          <Calculator lang={lang} />
        </div>
      );
      case 'customer-dashboard': return (
        <ProductProvider>
          <CustomerDashboard
            user={user}
            lang={lang as any}
            onBack={handleBack}
            cart={cart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartQuantity={handleUpdateCartQuantity}
            onNavigate={(page) => navigateTo(page as PageView)}
            initialTab={view.extra?.tab}
            onUpdateUser={(updated) => {
              setUser(updated);
              localStorage.setItem('volt_current_user', JSON.stringify(updated));
              const allUsers = JSON.parse(localStorage.getItem('volt_users') || '[]');
              const safeAllUsers = Array.isArray(allUsers) ? allUsers : [];
              const updatedAll = safeAllUsers.map((u: any) => u.email === updated.email ? updated : u);
              localStorage.setItem('volt_users', JSON.stringify(updatedAll));
            }}
          />
        </ProductProvider>
      );
      case 'admin-dashboard':
        if (role !== 'Admin' && user?.role !== 'admin') {
          navigateTo('home');
          return null;
        }
        return <AdminDashboard onBack={handleBack} lang={lang as any} />;
      case 'news': return <NewsProvider><NewsPage lang={lang as any} onBack={handleBack} initialId={view.id} onNavigate={navigateTo} /></NewsProvider>;
      case 'blog': return <BlogProvider><BlogPage lang={lang as any} onBack={handleBack} initialId={view.id} onNavigate={navigateTo} /></BlogProvider>;
      case 'necessary-documents': return <NecessaryDocumentsPage lang={lang as any} onBack={handleBack} />;
      case 'partnership': return <PartnershipProvider><PartnershipPage lang={lang as any} onBack={handleBack} /></PartnershipProvider>;
      case 'contact': return <ContactProvider><EmailProvider><ContactPage lang={lang as any} onBack={handleBack} initialService={view.extra?.serviceId} initialProduct={view.extra?.productId} /></EmailProvider></ContactProvider>;
      case 'projects': return <ProjectProvider><ProjectsPage onSelectProject={(id) => navigateTo('project-detail', id)} lang={lang as any} onBack={handleBack} /> </ProjectProvider>;
      case 'products': return (
        <ProductProvider>
          <CategoryProvider>
            <ProductsPage
              // onSelectProduct={(id) => navigateTo('product-detail', id)} 
              onSelectProduct={(id) => navigate(`/product/${id}`)}
              onOrderNow={(id, quantity) => navigateTo('order', id, { quantity })}
              onAddToCart={handleAddToCart}
              lang={lang as any}
              onBack={handleBack}
              initialCategory={view.extra?.category ?? view.extra?.categoryId}
              initialSubCategory={view.extra?.subCategory ?? view.extra?.subCategoryId}
              initialSearch={view.extra?.search}
            />
          </CategoryProvider>
        </ProductProvider>
      );
      case 'project-detail': return <ProjectProvider><ProjectDetail projectId={view.id || ''} onBack={() => setView({ page: 'projects' })} lang={lang as any} /></ProjectProvider>;
      // case 'product-detail': return <ProductProvider><CategoryProvider><ProductDetail productId={view.id || ''} onBack={() => setView({ page: view.id ? 'products' : 'home' })} onOrderNow={(id, quantity, power) => navigateTo('order', id, { quantity, power })} onAddToCart={handleAddToCart} lang={lang} /></CategoryProvider></ProductProvider>;
      default:
        return (
          <>
            <HeroSlider lang={lang as any} onNavigate={navigateTo} />
            <ProductProvider>
              <CategoryProvider>
                <Products
                  onSelectProduct={(id) => navigateTo('product-detail', id)}
                  onViewAll={() => navigateTo('products')}
                  onOrderNow={(id, quantity) => navigateTo('order', id, { quantity })}
                  onAddToCart={handleAddToCart}
                    lang={lang === 'az' ? 'az' : 'en'}
                />
              </CategoryProvider>
            </ProductProvider>
            <InfoSection lang={lang} onNavigate={navigateTo} />
            {/* <ProjectProvider>
              <Projects onSelectProject={(id) => navigateTo('project-detail', id)} lang={lang} />
            </ProjectProvider> */}
            {/* <PartnersSlider lang={lang === 'az' ? 'az' : 'en'} /> */}
          </>
        );
    }
  };


  const isSimplifiedCheckout =
    view.page === 'checkout' ||
    view.page === 'order' ||
    location.pathname === '/checkout' ||
    location.pathname.startsWith('/order');
  const isProductDetailPage =
    view.page === 'product-detail' ||
    location.pathname.startsWith('/product/');

  return (
    <div className="flex flex-col min-h-screen">
      {location.pathname !== '/theme-lab' && !isSimplifiedCheckout && <CategoryProvider>
        <Header
          onNavigate={navigateTo}
          activePage={view.page}
          currentLang={lang}
          onLangChange={(nextLang) => {
            localStorage.setItem('lang', nextLang);
            setHasStoredLang(true);
            setLang(nextLang);
          }}
          logoSrc={previewLogo || '/volt-logo.png'}
          user={user}
          onLogout={handleLogout}
          onLogin={handleLogin}
        />
      </CategoryProvider>}
      <main className="flex-grow overflow-x-hidden">
        {/* <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}>
          {renderContent()}
        </Suspense> */}

        <Routes>

          <Route
            path="/theme-lab"
            element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading colour lab…</div>}><ThemeLab /></Suspense>}
          />

          {/* Sənin mövcud sistem */}
          <Route
            path="/"
            element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}>
                {renderContent()}
              </Suspense>
            }
          />

          <Route
            path="/product/:id"
            element={
              <ProductProvider>
                <CategoryProvider>
                  <ProductDetail
                    productId={view.id || ''}
                    onBack={handleBack}
                    onOrderNow={(id, quantity, power) =>
                      navigateTo('order', id, { quantity, power })
                    }
                    onAddToCart={handleAddToCart}
                    cartPreview={
                      <FloatingCartPreview
                        mode="inline"
                        cart={cart}
                        lang={lang}
                        user={user}
                        onOpenCart={() => navigateTo('cart')}
                        onRemoveFromCart={handleRemoveFromCart}
                        onUpdateCartQuantity={handleUpdateCartQuantity}
                      />
                    }
                    lang={lang as any}
                  />
                </CategoryProvider>
              </ProductProvider>
            }
          />

          {/* Fallback: render the same content for other routes (renderContent driven by view state) */}
          <Route
            path="*"
            element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}>
                {renderContent()}
              </Suspense>
            }
          />

        </Routes>
      </main>

      {!isSimplifiedCheckout && view.page !== 'cart' && !isProductDetailPage && (
        <ProductProvider>
          <FloatingCartPreview
            cart={cart}
            lang={lang}
            user={user}
            onOpenCart={() => navigateTo('cart')}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartQuantity={handleUpdateCartQuantity}
          />
        </ProductProvider>
      )}

      {pendingCartTransfer && (
        <CartTransferModal
          pending={pendingCartTransfer}
          lang={lang}
          onTransfer={handleCartTransfer}
          onCancel={handleCancelCartTransfer}
        />
      )}

      {location.pathname !== '/theme-lab' && !isSimplifiedCheckout && <Footer onNavigate={(p, id, extra) => navigateTo(p as PageView, id, extra)} lang={lang} logoSrc={previewLogo || '/volt-logo.png'} />}
    </div>
  );
};

export default App;
