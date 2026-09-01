
import React, { useEffect, useRef, useState } from 'react';
import Logo from './Logo';
import RegisterModal from './RegisterModal';
import LoginModal from './LoginModal';
import { useAuth } from "../contexts/AuthContext";
import { API_ENDPOINTS } from "../utils/constants";
import axiosInstance from "../api/axiosInstance";
import { getLocalizedCategoryName } from "../utils/categoryLocalization";

import { useCategory } from "../contexts/CategoryContext";

interface HeaderProps {
  onNavigate: (page: any, id?: string, extra?: any) => void;
  activePage: string;
  currentLang: 'az' | 'en' | 'ru' | 'tr';
  onLangChange: (lang: 'az' | 'en' | 'ru' | 'tr') => void;
  logoSrc?: string;
  user?: any;
  onLogout?: () => void;
  onLogin?: (userData: any) => void;
}

const DropdownItem = ({ label, onClick, icon }: { label: string; onClick: () => void; icon?: React.ReactNode }) => (
  <button
    onClick={onClick}
    className="header-dropdown-item group/item flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.04em] text-slate-600 transition-colors last:border-0 hover:bg-emerald-50 hover:text-emerald-600"
  >
    <span>{label}</span>
    <svg className="w-3 h-3 shrink-0 text-slate-400 group-hover/item:text-emerald-500 group-hover/item:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
    </svg>
  </button>
);

const verseQuoteByLang = {
  az: '“Və biz parlaq bir çıraq yaratdıq”',
  en: '“And We created a shining lamp”',
  ru: '“И Мы создали сияющий светильник”',
  tr: '“Ve parlak bir kandil yarattık”',
};

const Header: React.FC<HeaderProps> = ({ onNavigate, activePage, currentLang, onLangChange, logoSrc = '/volt-logo-test.png', user, onLogout, onLogin }) => {
  const { role, logout, isAuthenticated } = useAuth();
  const {
    categories,
    getCategories,
    subcategories,
    getSubCategories,
  } = useCategory();
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [modalType, setModalType] = useState<'none' | 'register' | 'login'>('none');
  const [activeDropdown, setActiveDropdown] = useState<'none' | 'profile' | 'products' | 'usefulInfo' | 'lang' | 'volt'>('none');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [openMobileSubMenu, setOpenMobileSubMenu] = useState<'none' | 'products' | 'usefulInfo' | 'volt'>('none');
  const [isDesktopNavHidden, setIsDesktopNavHidden] = useState(false);
  const desktopNavScrollFrame = useRef(0);
  const verseQuote = verseQuoteByLang[currentLang];

  const blurActiveInput = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  useEffect(() => {
    setActiveCategoryId(null);
    void getCategories({ language: currentLang });
  }, [currentLang]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    let lastY = window.scrollY;
    const handleScroll = () => {
      if (window.scrollY > lastY) setIsMobileMenuOpen(false);
      lastY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let accumulatedDistance = 0;
    let scrollDirection: 'up' | 'down' | null = null;
    let navIsHidden = false;
    let ignoreScrollUntil = 0;

    const scrollThreshold = 16;
    const navHideStartY = 160;
    const navTopRevealY = 8;
    const navTransitionDuration = 320;

    setIsDesktopNavHidden(false);

    const updateDesktopNav = () => {
      desktopNavScrollFrame.current = 0;
      const currentScrollY = Math.max(0, window.scrollY);
      const delta = currentScrollY - lastScrollY;

      // Collapsing the sticky nav changes the document height. Ignore the
      // scroll adjustments produced by that transition so they are not
      // mistaken for the user reversing direction.
      if (performance.now() < ignoreScrollUntil) {
        lastScrollY = currentScrollY;
        accumulatedDistance = 0;
        scrollDirection = null;
        return;
      }

      if (currentScrollY <= navTopRevealY) {
        if (navIsHidden) {
          navIsHidden = false;
          setIsDesktopNavHidden(false);
          ignoreScrollUntil = performance.now() + navTransitionDuration;
        }
        accumulatedDistance = 0;
        scrollDirection = null;
        lastScrollY = currentScrollY;
        return;
      }

      if (Math.abs(delta) < 0.5) {
        lastScrollY = currentScrollY;
        return;
      }

      const nextDirection = delta > 0 ? 'down' : 'up';

      if (nextDirection !== scrollDirection) {
        scrollDirection = nextDirection;
        accumulatedDistance = Math.abs(delta);
      } else {
        accumulatedDistance += Math.abs(delta);
      }

      if (accumulatedDistance >= scrollThreshold) {
        if (scrollDirection === 'down' && !navIsHidden && currentScrollY > navHideStartY) {
          navIsHidden = true;
          setIsDesktopNavHidden(true);
          setActiveDropdown('none');
          ignoreScrollUntil = performance.now() + navTransitionDuration;
        } else if (scrollDirection === 'up' && navIsHidden) {
          navIsHidden = false;
          setIsDesktopNavHidden(false);
          ignoreScrollUntil = performance.now() + navTransitionDuration;
        }
        accumulatedDistance = 0;
        scrollDirection = null;
      }

      lastScrollY = currentScrollY;
    };

    const handleDesktopNavScroll = () => {
      if (desktopNavScrollFrame.current) return;
      desktopNavScrollFrame.current = window.requestAnimationFrame(updateDesktopNav);
    };

    window.addEventListener('scroll', handleDesktopNavScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleDesktopNavScroll);
      window.cancelAnimationFrame(desktopNavScrollFrame.current);
      desktopNavScrollFrame.current = 0;
    };
  }, [activePage]);

  const getItemName = (item: any, type: 'category' | 'subcategory' = 'category') => (
    getLocalizedCategoryName(item, currentLang, type)
  );

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults(null);
      setIsSearchLoading(false);
      return;
    }

    let cancelled = false;
    setIsSearchLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const res = await axiosInstance.get(API_ENDPOINTS.SEARCH.GET_SEARCH(query, 6));
        if (!cancelled) {
          setSearchResults(res?.data?.data || null);
        }
      } catch (error) {
        if (!cancelled) {
          setSearchResults(null);
        }
      } finally {
        if (!cancelled) {
          setIsSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  const toggleMobileSubMenu = (menu: 'products' | 'usefulInfo' | 'volt') => {
    setOpenMobileSubMenu(openMobileSubMenu === menu ? 'none' : menu);
  };

  const t = {
    home: currentLang === 'az' ? 'Ana Səhifə' : currentLang === 'en' ? 'Home' : currentLang === 'ru' ? 'Главная' : 'Ana Sayfa',
    volt: 'VOLT',
    company: currentLang === 'az' ? 'Şirkət' : currentLang === 'en' ? 'Company' : currentLang === 'ru' ? 'Компания' : 'Şirket',
    about: currentLang === 'az' ? 'Haqqımızda' : currentLang === 'en' ? 'About' : currentLang === 'ru' ? 'О нас' : 'Hakkımızda',
    installationPage: currentLang === 'az' ? 'Quraşdırılma' : currentLang === 'en' ? 'Installation' : currentLang === 'ru' ? 'Установка' : 'Kurulum',
    aboutCompany: currentLang === 'az' ? 'Şirkət haqqında' : currentLang === 'en' ? 'About Company' : currentLang === 'ru' ? 'О компании' : 'Şirket Hakkında',
    mission: currentLang === 'az' ? 'Missiyamız' : currentLang === 'en' ? 'Our Mission' : currentLang === 'ru' ? 'Наша миссия' : 'Misyonumuz',
    vision: currentLang === 'az' ? 'Vizyonumuz' : currentLang === 'en' ? 'Our Vision' : currentLang === 'ru' ? 'Наше видение' : 'Vizyonumuz',
    services: currentLang === 'az' ? 'Xidmətlər' : currentLang === 'en' ? 'Services' : currentLang === 'ru' ? 'Услуги' : 'Hizmetler',
    news: currentLang === 'az' ? 'Xəbərlər' : currentLang === 'en' ? 'News' : currentLang === 'ru' ? 'Новости' : 'Haberler',
    calculator: currentLang === 'az' ? 'Kalkulyator' : currentLang === 'en' ? 'Calculator' : currentLang === 'ru' ? 'Калькулятор' : 'Hesaplayıcı',
    legislation: currentLang === 'az' ? 'Qanunvericilik' : currentLang === 'en' ? 'Legislation' : currentLang === 'ru' ? 'Законодательство' : 'Mevzuat',
    decrees: currentLang === 'az' ? 'Fərmanlar' : currentLang === 'en' ? 'Decrees' : currentLang === 'ru' ? 'Указы' : 'Kararnameler',
    login: currentLang === 'az' ? 'Giriş' : currentLang === 'en' ? 'Login' : currentLang === 'ru' ? 'Вход' : 'Giriş',
    logout: currentLang === 'az' ? 'Çıxış' : currentLang === 'en' ? 'Logout' : currentLang === 'ru' ? 'Выход' : 'Çıkış',
    myProfile: currentLang === 'az' ? 'Profilim' : currentLang === 'en' ? 'My Profile' : currentLang === 'ru' ? 'Мой профиль' : 'Profilim',
    myOrders: currentLang === 'az' ? 'Sifarişlərim' : currentLang === 'en' ? 'My Orders' : currentLang === 'ru' ? 'Мои заказы' : 'Siparişlerim',
    proClub: currentLang === 'az' ? 'Ustalar Klubu' : currentLang === 'en' ? 'Pro Club' : currentLang === 'ru' ? 'Клуб мастеров' : 'Ustalar Kulübü',
    projects: currentLang === 'az' ? 'Layihələr' : currentLang === 'en' ? 'Projects' : currentLang === 'ru' ? 'Проекты' : 'Projeler',
    products: currentLang === 'az' ? 'Məhsullar' : currentLang === 'en' ? 'Products' : currentLang === 'ru' ? 'Продукты' : 'Ürünler',
    solarPanels: currentLang === 'az' ? 'Günəş panelləri' : currentLang === 'en' ? 'Solar Panels' : currentLang === 'ru' ? 'Солнечные панели' : 'Güneş Panelleri',
    inverters: currentLang === 'az' ? 'İnverterlər' : currentLang === 'en' ? 'Inverters' : currentLang === 'ru' ? 'Инверторы' : 'İnvertörler',
    storage: currentLang === 'az' ? 'Enerji saxlama sistemləri' : currentLang === 'en' ? 'Energy Storage Systems' : currentLang === 'ru' ? 'Системы хранения энергии' : 'Enerji Depolama Sistemleri',
    installation: currentLang === 'az' ? 'Quraşdırma və montaj' : currentLang === 'en' ? 'Installation and Assembly' : currentLang === 'ru' ? 'Установка и монтаж' : 'Kurulum ve Montaj',
    electrical: currentLang === 'az' ? 'Elektrik və bağlantı' : currentLang === 'en' ? 'Electrical and Connection' : currentLang === 'ru' ? 'Электрика и подключение' : 'Elektrik ve Bağlantı',
    monitoring: currentLang === 'az' ? 'Monitorinq və İdarəetmə' : currentLang === 'en' ? 'Monitoring and Management' : currentLang === 'ru' ? 'Мониторинг и управление' : 'İzleme ve Yönetim',
    usefulInfo: currentLang === 'az' ? 'Faydalı Məlumat' : currentLang === 'en' ? 'Useful Information' : currentLang === 'ru' ? 'Полезная информация' : 'Faydalı Bilgiler',
    howToStart: currentLang === 'az' ? 'Necə başlamalı?' : currentLang === 'en' ? 'How to Start?' : currentLang === 'ru' ? 'С чего начать?' : 'Nasıl Başlanır?',
    reels: currentLang === 'az' ? 'Video Reels' : currentLang === 'en' ? 'Video Reels' : currentLang === 'ru' ? 'Видео Reels' : 'Video Reels',
    faq: currentLang === 'az' ? 'Suallar' : currentLang === 'en' ? 'FAQ' : currentLang === 'ru' ? 'Часто задаваемые вопросы' : 'Sık Sorulan Sorular',
    mastersClubInfo: currentLang === 'az' ? 'Ustalar klubu nədir?' : currentLang === 'en' ? 'What is Pro Club?' : currentLang === 'ru' ? 'Что такое Клуб мастеров?' : 'Ustalar Kulübü Nedir?',
    necessaryDocuments: currentLang === 'az' ? 'Zəruri sənədlər' : currentLang === 'en' ? 'Necessary Documents' : currentLang === 'ru' ? 'Необходимые документы' : 'Gerekli Belgeler',
    legislationAndDecrees: currentLang === 'az' ? 'Qanunvericilik' : currentLang === 'en' ? 'Legislation and Decrees' : currentLang === 'ru' ? 'Законодательство и указы' : 'Mevzuat ve Kararnameler',
    creditTerms: currentLang === 'az' ? 'Kredit şərtləri' : currentLang === 'en' ? 'Credit Terms' : currentLang === 'ru' ? 'Условия кредита' : 'Kredi Şartları',
    support: currentLang === 'az' ? 'Dəstək' : currentLang === 'en' ? 'Support' : currentLang === 'ru' ? 'Поддержка' : 'Destek',
    blog: currentLang === 'az' ? 'Bloq' : currentLang === 'en' ? 'Blog' : currentLang === 'ru' ? 'Блог' : 'Blog',
    privacyPolicy: currentLang === 'az' ? 'Məxfilik siyasəti' : currentLang === 'en' ? 'Privacy Policy' : currentLang === 'ru' ? 'Политика конфиденциальности' : 'Gizlilik Politikası',
    termsOfService: currentLang === 'az' ? 'İstifadə şərtləri' : currentLang === 'en' ? 'Terms of Use' : currentLang === 'ru' ? 'Условия использования' : 'Kullanım Şartları',
    contact: currentLang === 'az' ? 'Əlaqə' : currentLang === 'en' ? 'Contact Us' : currentLang === 'ru' ? 'Контакты' : 'İletişim',
    partnership: currentLang === 'az' ? 'Tərəfdaşlıq' : currentLang === 'en' ? 'Partnership' : currentLang === 'ru' ? 'Партнерство' : 'Ortaklık',
    calculate: currentLang === 'az' ? 'Hesabla' : currentLang === 'en' ? 'Calculate' : currentLang === 'ru' ? 'Рассчитать' : 'Hesapla',
    search: currentLang === 'az' ? 'Axtarış' : currentLang === 'en' ? 'Search' : currentLang === 'ru' ? 'Поиск' : 'Arama',
    menu: currentLang === 'az' ? 'Menyunu aç' : currentLang === 'en' ? 'Open menu' : currentLang === 'ru' ? 'Открыть меню' : 'Menüyü aç',
    closeMenu: currentLang === 'az' ? 'Menyunu bağla' : currentLang === 'en' ? 'Close menu' : currentLang === 'ru' ? 'Закрыть меню' : 'Menüyü kapat',
    searchLoading: currentLang === 'az' ? 'Axtarılır...' : currentLang === 'en' ? 'Searching...' : currentLang === 'ru' ? 'Идет поиск...' : 'Aranıyor...',
    searchNoResults: currentLang === 'az' ? 'Nəticə tapılmadı' : currentLang === 'en' ? 'No results found' : currentLang === 'ru' ? 'Результаты не найдены' : 'Sonuç bulunamadı',
    productCategories: currentLang === 'az' ? 'Məhsul kateqoriyaları' : currentLang === 'en' ? 'Product categories' : currentLang === 'ru' ? 'Категории продуктов' : 'Ürün kategorileri',
    servicesGroup: currentLang === 'az' ? 'Xidmətlərimiz' : currentLang === 'en' ? 'Our services' : currentLang === 'ru' ? 'Наши услуги' : 'Hizmetlerimiz',
    resultsCount: currentLang === 'az' ? 'nəticə' : currentLang === 'en' ? 'results' : currentLang === 'ru' ? 'результатов' : 'sonuç'
  };

  const handleItemClick = (page: string, id?: string, extra?: any) => {
    onNavigate(page, id, extra);
    setActiveDropdown('none');
    setIsMobileMenuOpen(false);
  };

  const closeSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setIsSearchLoading(false);
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    blurActiveInput();
  };

  const resetMobileSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setIsSearchLoading(false);
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    blurActiveInput();
  };

  useEffect(() => {
    if (!isMobileSearchOpen) return;

    let lastY = window.scrollY;
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastY + 4) {
        resetMobileSearch();
        return;
      }
      lastY = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileSearchOpen]);

  useEffect(() => {
    if (!isSearchFocused) return;

    let lastY = window.scrollY;
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastY + 4) {
        setIsSearchFocused(false);
        blurActiveInput();
      }
      lastY = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSearchFocused]);

  const handleSearchSubmit = () => {
    const query = searchQuery.trim();
    if (!query) return;
    closeSearch();
    handleItemClick('products', undefined, { search: query });
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearchSubmit();
    }
  };

  const staticUsefulPages = [
    { title: t.faq, description: t.usefulInfo, page: 'faq' },
    { title: t.howToStart, description: t.usefulInfo, page: 'how-to-start' },
    { title: t.necessaryDocuments, description: t.usefulInfo, page: 'necessary-documents' },
    { title: t.legislationAndDecrees, description: t.usefulInfo, page: 'legislation' },
    { title: t.creditTerms, description: t.usefulInfo, page: 'credits' },
    { title: t.privacyPolicy, description: t.usefulInfo, page: 'privacy-policy' },
    { title: t.termsOfService, description: t.usefulInfo, page: 'terms-of-service' },
    { title: t.blog, description: t.usefulInfo, page: 'blog' },
    { title: t.news, description: t.usefulInfo, page: 'news' },
  ];

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const hasTypedSearch = normalizedSearchQuery.length > 0;
  const staticUsefulMatches = hasTypedSearch
    ? staticUsefulPages.filter(page =>
        page.title.toLowerCase().includes(normalizedSearchQuery)
        || page.description.toLowerCase().includes(normalizedSearchQuery))
    : staticUsefulPages;
  const dynamicUsefulPages = hasTypedSearch ? searchResults?.usefulPages || [] : [];
  const usefulPages = [
    ...staticUsefulMatches,
    ...dynamicUsefulPages.filter((page: any) =>
      !staticUsefulMatches.some(staticPage => staticPage.page === page.page)),
  ];
  const hasSearchResults = Boolean(
    (searchResults?.products?.items?.length || 0) > 0
    || (searchResults?.categories?.length || 0) > 0
    || (searchResults?.services?.length || 0) > 0
    || usefulPages.length > 0
  );
  const isSignedIn = isAuthenticated || Boolean(user);
  const resolvedRole = role || (user?.role === 'admin' ? 'Admin' : user?.role === 'master' ? 'Master' : user?.role ? 'Customer' : null);
  const handleLogout = () => {
    onLogout?.();
    if (isAuthenticated) logout();
  };

  const renderSearchDropdown = () => {
    if (!isSearchFocused) return null;

    return (
      <div
        onMouseDown={(event) => event.preventDefault()}
        className="header-search-results absolute left-0 right-0 top-full z-[120] mt-2 overflow-hidden rounded-lg border bg-white"
      >
        <div className="max-h-[70vh] overflow-y-auto overscroll-contain py-2">
          {isSearchLoading && (
            <div className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.04em] text-slate-400">
              {t.searchLoading}
            </div>
          )}

          {!isSearchLoading && hasTypedSearch && !hasSearchResults && (
            <div className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.04em] text-slate-400">
              {t.searchNoResults}
            </div>
          )}

          {(searchResults?.products?.items?.length || 0) > 0 && (
            <div className="py-2">
              <div className="px-5 pb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.04em] text-slate-400">{t.products}</span>
                <button
                  onClick={handleSearchSubmit}
                  className="text-xs font-semibold uppercase tracking-[0.04em] text-emerald-600 hover:text-emerald-700"
                >
                  {searchResults?.products?.totalCount || 0} {t.resultsCount}
                </button>
              </div>
              {searchResults.products.items.map((product: any) => (
                <button
                  key={product.id}
                  onClick={() => {
                    closeSearch();
                    handleItemClick('product-detail', String(product.id));
                  }}
                  className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-emerald-50 transition-colors"
                >
                  <img
                    src={product.productImage?.[0] || '/volt-logo.png'}
                    alt={product.productName}
                    className="w-10 h-10 rounded-lg object-contain bg-slate-50 border border-slate-100"
                  />
                  <span className="line-clamp-2 text-xs font-semibold text-slate-700">{product.productName}</span>
                </button>
              ))}
            </div>
          )}

          {(searchResults?.categories?.length || 0) > 0 && (
            <div className="py-2 border-t border-slate-50">
              <div className="px-5 pb-2 text-xs font-semibold uppercase tracking-[0.04em] text-slate-400">{t.productCategories}</div>
              {searchResults.categories.map((category: any) => (
                <button
                  key={`${category.type}-${category.productCategoryId}-${category.productSubCategoryId || 'all'}`}
                  onClick={() => {
                    closeSearch();
                    handleItemClick('products', undefined, {
                      category: category.productCategoryId,
                      subCategory: category.productSubCategoryId,
                    });
                  }}
                  className="w-full px-5 py-2.5 text-left text-xs font-semibold text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {(searchResults?.services?.length || 0) > 0 && (
            <div className="py-2 border-t border-slate-50">
              <div className="px-5 pb-2 text-xs font-semibold uppercase tracking-[0.04em] text-slate-400">{t.servicesGroup}</div>
              {searchResults.services.map((service: any) => (
                <button
                  key={service.id}
                  onClick={() => {
                    closeSearch();
                    handleItemClick('services', undefined, { service: service.id });
                  }}
                  className="w-full px-5 py-2 text-left hover:bg-emerald-50 transition-colors"
                >
                  <span className="block text-xs font-semibold text-slate-700">{service.title}</span>
                  {service.description && <span className="block text-xs text-slate-400 line-clamp-1">{service.description}</span>}
                </button>
              ))}
            </div>
          )}

          {usefulPages.length > 0 && (
            <div className="py-2 border-t border-slate-50">
              <div className="px-5 pb-2 text-xs font-semibold uppercase tracking-[0.04em] text-slate-400">{t.usefulInfo}</div>
              {usefulPages.map((page: any, index: number) => (
                <button
                  key={`${page.page}-${page.id || index}`}
                  onClick={() => {
                    closeSearch();
                    handleItemClick(page.page);
                  }}
                  className="w-full px-5 py-2 text-left hover:bg-emerald-50 transition-colors"
                >
                  <span className="block text-xs font-semibold text-slate-700">{page.title}</span>
                  {page.description && <span className="block text-xs text-slate-400 line-clamp-1">{page.description}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const getLinkClass = (page: string, isDropdown?: boolean) => {
    const isActive = activePage === page;
    return `header-nav-link flex items-center gap-1 uppercase transition-colors duration-200 ${isActive ? 'is-active' : ''}`;
  };

  return (
    <header className={`site-header-theme sticky top-0 z-50 w-full border-b ${isDesktopNavHidden ? 'is-compact' : ''}`}>
      <div className="header-top-grid mx-auto w-full max-w-[1440px] items-stretch px-2 md:px-4 lg:grid lg:grid-cols-[64px_minmax(0,1fr)] lg:px-8">
        {/* Logo Column - Spans full height of top + main bars on desktop */}
        <div className="header-logo-column hidden lg:flex items-center justify-center overflow-visible">
          <div onClick={() => onNavigate('home')} className="header-logo-link cursor-pointer">
            {/* <Logo className="scale-100" /> */}
            <img className="header-logo-image object-contain" src={logoSrc} alt="Volt.az" />
          </div>
        </div>

        {/* Content Column */}
        <div className="header-content-column flex flex-col">
          {/* Top Utility Bar */}
          <div className="header-mobile-row flex min-h-[76px] items-center justify-between border-b py-2 lg:hidden">
            {/* Mobile Logo */}
            <div onClick={() => onNavigate('home')} className="lg:hidden cursor-pointer">
              {/* <Logo className="scale-100 origin-left" /> */}
              <img className="h-[61px] w-[61px] object-contain" src={logoSrc} alt="Volt.az" />
            </div>

            <div className="flex items-center gap-1 md:hidden">
              {/* Calculator Button */}
              <button
                onClick={() => handleItemClick('calculator')}
                className="mobile-utility-button mobile-utility-button--primary group"
              >
                <div className="flex items-center gap-2">
                  <span>{t.calculate}</span>
                  <div className="w-3.5 h-3.5 flex items-center justify-center transition-transform group-hover:scale-105">
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Contact Button */}
              <button
                onClick={() => handleItemClick('contact')}
                className="mobile-utility-button mobile-utility-button--secondary group"
              >
                <div className="flex items-center gap-2">
                  <span>{t.contact}</span>
                  <div className="w-3.5 h-3.5 flex items-center justify-center transition-transform group-hover:scale-105">
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
              </button>



            </div>

            <div className="flex items-center gap-1 md:gap-3">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => {
                  if (isMobileSearchOpen) {
                    resetMobileSearch();
                  } else {
                    setIsMobileSearchOpen(true);
                  }
                }}
                aria-label={t.search}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Mobile Menu Button */}
              <div className="border-l border-slate-200 pl-1 lg:hidden">
                <button aria-label={isMobileMenuOpen ? t.closeMenu : t.menu} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white/5 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Main Bar */}
          <div className="header-main-row hidden items-center gap-4 py-3 lg:flex lg:py-5">
            {/* Search Bar - Desktop */}
            <div className="header-search-shell relative hidden lg:block">
              <input
                type="text"
                placeholder="Axtarış..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => window.setTimeout(() => setIsSearchFocused(false), 150)}
                onKeyDown={handleSearchKeyDown}
                className="header-search-input h-11 w-full rounded-lg border px-4 pr-11 text-sm font-medium outline-none transition-colors"
              />
              <button
                onClick={handleSearchSubmit}
                aria-label={t.search}
                className="header-search-button absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              {renderSearchDropdown()}
            </div>

            <div className="header-verse hidden items-center xl:flex">
              <p className="relative m-0 pl-7 text-left">
                <span className="header-verse-icon absolute left-0 top-0.5 flex h-5 w-5 items-center justify-center" aria-hidden="true">
                  <span className="header-verse-icon-halo absolute h-3.5 w-3.5 rounded-full"></span>
                  <svg className="relative h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3.25" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="header-verse-text block text-sm font-bold leading-5">
                  {verseQuote}
                  <span className="header-verse-reference ml-1.5 whitespace-nowrap align-baseline text-xs font-semibold">
                    78:13
                  </span>
                </span>
                <span
                  className="volt-verse-line mt-1 block h-px w-24"
                ></span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="header-actions hidden items-center gap-3 lg:flex">
              {/* Calculator Button */}
              <button
                onClick={() => handleItemClick('calculator')}
                className="header-primary-action flex items-center justify-center rounded-lg border px-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <div className="flex items-center gap-2">
                  <span className="header-action-label uppercase">
                    {t.calculate}
                  </span>
                  <div className="header-primary-icon flex h-5 w-5 items-center justify-center">
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Contact Button */}
              <button
                onClick={() => handleItemClick('contact')}
                className="header-secondary-action flex items-center justify-center rounded-lg border px-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <div className="flex items-center gap-2">
                  <span className="header-action-label uppercase">
                    {t.contact}
                  </span>
                  <div className="header-secondary-icon flex h-5 w-5 items-center justify-center">
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
              </button>


              {/* User / Login & Languages - Desktop Only */}
              <div className="header-account-cluster flex items-center gap-3">
                {isSignedIn ? (
                  <div className="relative" onMouseEnter={() => setActiveDropdown('profile')} onMouseLeave={() => setActiveDropdown('none')}>
                    <button aria-label={t.myProfile} className="header-profile-action flex h-11 w-11 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
                      <div className="flex h-5 w-5 items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                    </button>
                    {activeDropdown === 'profile' && (
                      <div className="header-dropdown-panel absolute top-full right-0 w-48 bg-white border py-1 z-[100] rounded-lg overflow-hidden">
                        {resolvedRole === 'Admin' ? (
                          <DropdownItem label="Admin Panel" onClick={() => handleItemClick('admin-dashboard')} />
                        ) : (
                          <>
                            <DropdownItem label={t.myProfile} onClick={() => handleItemClick(resolvedRole === 'Master' ? 'pro-club-dashboard' : 'customer-dashboard', undefined, { tab: 'profile' })} />
                            <DropdownItem label={t.myOrders} onClick={() => handleItemClick('customer-dashboard', undefined, { tab: 'orders' })} />
                          </>
                        )}
                        <button onClick={handleLogout} className="w-full px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.04em] text-red-500 transition-colors hover:bg-red-50">{t.logout}</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={() => setModalType('login')} className="header-login-action flex h-11 items-center gap-2 rounded-lg px-2 text-xs font-semibold uppercase tracking-[0.04em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
                    <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m10 17 5-5-5-5m5 5H3" />
                    </svg>
                    <span>{t.login}</span>
                  </button>
                )}

                {/* Custom Language Dropdown */}
                <div className="relative group" onMouseEnter={() => setActiveDropdown('lang')} onMouseLeave={() => setActiveDropdown('none')}>
                  <button className="header-language-action flex h-11 min-w-11 items-center justify-center gap-1 rounded-lg px-2 text-xs font-semibold uppercase tracking-[0.04em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
                    <span>{currentLang}</span>
                    <svg className={`w-2 h-2 transition-transform ${activeDropdown === 'lang' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {activeDropdown === 'lang' && (
                    <div className="header-dropdown-panel absolute top-full right-0 w-20 bg-white border py-1 z-[100] rounded-lg overflow-hidden">
                      {(['az', 'en', 'ru', 'tr'] as const).map(l => (
                        <button
                          key={l}
                          onClick={() => {
                            localStorage.setItem('lang', l);
                            onLangChange(l);
                            setActiveDropdown('none');
                          }}
                          className={`relative z-10 w-full border-b border-slate-100 py-2 text-center text-xs font-semibold uppercase tracking-[0.04em] transition-colors last:border-0 ${currentLang === l ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar Overlay */}
      {isMobileSearchOpen && (
        <div className="header-mobile-search lg:hidden border-b px-4 py-3 animate-in slide-in-from-top-2 duration-300">

          <div className="relative">
              <input
                type="text"
                placeholder="Axtarış..."
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => window.setTimeout(() => setIsSearchFocused(false), 150)}
                onKeyDown={handleSearchKeyDown}
                className="header-search-input w-full h-11 px-4 pr-11 rounded-lg border outline-none text-xs font-medium"
              />
            <button onClick={handleSearchSubmit} aria-label={t.search} className="header-search-button absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            {renderSearchDropdown()}
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="header-mobile-menu absolute left-0 top-full z-[60] flex max-h-[calc(100vh-80px)] w-full flex-col gap-2 overflow-y-auto overscroll-contain border-b px-6 py-4 lg:hidden">
          <button onClick={() => handleItemClick('home')} className="header-mobile-link border-b border-gray-50">{t.home}</button>

          <button onClick={() => handleItemClick('about')} className="header-mobile-link border-b border-gray-50">{t.about}</button>

          <button onClick={() => handleItemClick('solar-installation')} className="header-mobile-link border-b border-gray-50">{t.installationPage}</button>

          <button onClick={() => handleItemClick('services')} className="header-mobile-link border-b border-gray-50">{t.services}</button>

          {/* VOLT Mobile Dropdown */}
          <div className="flex flex-col border-b border-gray-50">
            <button
              onClick={() => toggleMobileSubMenu('volt')}
              className="header-mobile-link flex w-full items-center justify-between"
            >
              <span>{t.volt}</span>
              <svg className={`w-4 h-4 transition-transform ${openMobileSubMenu === 'volt' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {openMobileSubMenu === 'volt' && (
              <div className="flex flex-col gap-3 pb-4 pl-4 animate-in slide-in-from-top-1 duration-200">
                {/* <button onClick={() => handleItemClick('projects')} className="text-left text-[9px] font-bold uppercase tracking-widest text-slate-500">{t.projects}</button> */}
                <button onClick={() => handleItemClick('news')} className="header-mobile-sub-link">{t.news}</button>
                {/* <button onClick={() => handleItemClick('reels')} className="text-left text-[9px] font-bold uppercase tracking-widest text-slate-500">{t.reels}</button> */}
                <button onClick={() => handleItemClick('blog')} className="header-mobile-sub-link">{t.blog}</button>
              </div>
            )}
          </div>

          {/* Products Mobile Dropdown */}
          <div className="flex flex-col border-b border-gray-50">
            <button
              onClick={() => toggleMobileSubMenu('products')}
              className="header-mobile-link flex w-full items-center justify-between"
            >
              <span>{t.products}</span>
              <svg className={`w-4 h-4 text-slate-400 transition-transform ${openMobileSubMenu === 'products' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {openMobileSubMenu === 'products' && (
              <div className="flex flex-col gap-4 pb-4 pl-4 animate-in slide-in-from-top-1 duration-200">
                {categories.map((category: any) => (
                  <div key={category.id} className="flex flex-col gap-2">
                    <div className="relative flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleItemClick("products", undefined, { category: category.id })}
                        className="header-mobile-sub-link min-h-11 flex-1 pr-[45%]"
                      >
                        {getItemName(category)}
                      </button>
                      <button
                        type="button"
                        aria-label={`${getItemName(category)} alt kateqoriyaları`}
                        aria-expanded={activeCategoryId === category.id}
                        onClick={() => {
                          getSubCategories(category.id, { language: currentLang });
                          setActiveCategoryId(activeCategoryId === category.id ? null : category.id);
                        }}
                        className="absolute inset-y-0 right-0 flex w-[45%] items-center justify-end p-1.5 text-slate-400"
                      >
                        <svg className={`h-3 w-3 transition-transform ${activeCategoryId === category.id ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>

                    {activeCategoryId === category.id && (
                      <div className="flex flex-col gap-1.5 pl-3 border-l border-slate-100">
                        {subcategories.map((sub: any) => (
                          <button
                            key={sub.id}
                            onClick={() =>
                              handleItemClick("products", undefined, {
                                category: category.id,
                                subCategory: sub.id,
                              })
                            }
                            className="header-mobile-sub-link min-h-10 text-slate-400 hover:text-white"
                          >
                            {getItemName(sub, 'subcategory')}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Useful Info Mobile Dropdown */}
          <div className="flex flex-col border-b border-gray-50">
            <button
              onClick={() => toggleMobileSubMenu('usefulInfo')}
              className="header-mobile-link flex w-full items-center justify-between"
            >
              <span>{t.usefulInfo}</span>
              <svg className={`w-4 h-4 transition-transform ${openMobileSubMenu === 'usefulInfo' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {openMobileSubMenu === 'usefulInfo' && (
              <div className="flex flex-col gap-3 pb-4 pl-4 animate-in slide-in-from-top-1 duration-200">
                <button onClick={() => handleItemClick('how-to-start')} className="header-mobile-sub-link">{t.howToStart}</button>
                {/* <button onClick={() => handleItemClick('pro-club')} className="text-left text-[9px] font-bold uppercase tracking-widest text-slate-500">{t.mastersClubInfo}</button> */}
                <button onClick={() => handleItemClick('necessary-documents')} className="header-mobile-sub-link">{t.necessaryDocuments}</button>
                <button onClick={() => handleItemClick('legislation')} className="header-mobile-sub-link">{t.legislationAndDecrees}</button>
                <button onClick={() => handleItemClick('faq')} className="header-mobile-sub-link">{t.faq}</button>
              </div>
            )}
          </div>


          <button onClick={() => handleItemClick('partnership')} className="header-mobile-link border-b border-gray-50">{t.partnership}</button>
          {/* <button onClick={() => handleItemClick('pro-club')} className="text-left text-[11px] font-black uppercase tracking-widest text-emerald-600 py-3 px-4 bg-emerald-50 rounded-xl border border-emerald-100 my-1">{t.proClub}</button> */}
          <button onClick={() => handleItemClick('contact')} className="header-mobile-link">{t.contact}</button>

          {/* User / Login & Languages - mobile Only */}
          <div className=" flex items-center justify-between gap-2 ">
            {isSignedIn ? (
              <div className="relative" onMouseEnter={() => setActiveDropdown('profile')} onMouseLeave={() => setActiveDropdown('none')}>
                <button className="header-mobile-account-action flex min-h-11 items-center gap-1.5 pr-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                </button>
              {activeDropdown === 'profile' && (
  <div className="header-dropdown-panel absolute left-full top-0 z-[100] flex overflow-hidden rounded-lg border bg-white">
    
    {resolvedRole === 'Admin' ? (
      <button
        onClick={() => handleItemClick('admin-dashboard')}
        className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-[0.04em] text-slate-700 hover:bg-slate-50"
      >
        Admin Panel
      </button>
    ) : (
      <>
        <button
          onClick={() => handleItemClick(resolvedRole === 'Master' ? 'pro-club-dashboard' : 'customer-dashboard', undefined, { tab: 'profile' })}
          className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-[0.04em] text-slate-700 hover:bg-slate-50"
        >
          {t.myProfile}
        </button>
        <button
          onClick={() => handleItemClick('customer-dashboard', undefined, { tab: 'orders' })}
          className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-[0.04em] text-slate-700 hover:bg-slate-50"
        >
          {t.myOrders}
        </button>
      </>
    )}

    <button
      onClick={handleLogout}
      className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-[0.04em] text-red-500 hover:bg-red-50"
    >
      {t.logout}
    </button>

  </div>
)}
              </div>
            ) : (
              <button onClick={() => setModalType('login')} className="header-mobile-account-action flex min-h-11 items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m10 17 5-5-5-5m5 5H3" />
                </svg>
                {t.login}
              </button>
            )}

            {/* Custom Language Dropdown */}
            <div className="relative group" onMouseEnter={() => setActiveDropdown('lang')} onMouseLeave={() => setActiveDropdown('none')}>
              <button className="header-mobile-account-action flex min-h-11 min-w-11 items-center justify-center gap-1 px-2">
                <span>{currentLang}</span>
                <svg className={`w-2 h-2 transition-transform ${activeDropdown === 'lang' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeDropdown === 'lang' && (
  <div className="header-dropdown-panel absolute right-full top-0 z-[100] flex overflow-hidden rounded-lg border bg-white">
    {(['az', 'en', 'ru', 'tr'] as const).map(l => (
      <button
        key={l}
        onClick={() => {
          localStorage.setItem('lang', l);
          onLangChange(l);
          setActiveDropdown('none');
        }}
        className={`px-3 py-2 text-xs font-semibold uppercase tracking-[0.04em] transition-colors
          ${
            currentLang === l
              ? 'text-emerald-600 bg-emerald-50'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
      >
        {l}
      </button>
    ))}
  </div>
)}
            </div>
          </div>
        </div>
      )}


      {/* Desktop Navigation */}
      <nav
        className={`site-desktop-nav hidden w-full border-t lg:flex ${isDesktopNavHidden ? 'is-scroll-hidden' : ''}`}
        aria-hidden={isDesktopNavHidden}
      >
        <div className="site-desktop-nav-inner mx-auto flex h-14 w-full max-w-[1440px] items-center justify-center px-8">
        <div className="header-nav-list flex items-center gap-6 whitespace-nowrap">
          <button onClick={() => handleItemClick('home')} className={getLinkClass('home')}>{t.home}</button>

          <button onClick={() => handleItemClick('about')} className={getLinkClass('about')}>{t.about}</button>

          <button onClick={() => handleItemClick('solar-installation')} className={getLinkClass('solar-installation')}>{t.installationPage}</button>

          <button onClick={() => handleItemClick('services')} className={getLinkClass('services')}>{t.services}</button>

          {/* VOLT Dropdown */}
          <div className="relative h-14 flex items-center group/nav" onMouseEnter={() => setActiveDropdown('volt')} onMouseLeave={() => setActiveDropdown('none')}>
            <button className={getLinkClass('volt')}>
              {t.volt}
              <svg className={`w-3 h-3 transition-transform ${activeDropdown === 'volt' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {activeDropdown === 'volt' && (
              <div className="header-dropdown-panel absolute top-full left-1/2 -translate-x-1/2 w-48 bg-white border py-1 z-[100] rounded-lg overflow-hidden">
                {/* <DropdownItem label={t.projects} onClick={() => handleItemClick('projects')} /> */}
                <DropdownItem label={t.news} onClick={() => handleItemClick('news')} />
                {/* <DropdownItem label={t.reels} onClick={() => handleItemClick('reels')} /> */}
                <DropdownItem label={t.blog} onClick={() => handleItemClick('blog')} />
              </div>
            )}
          </div>

          {/* Products Dropdown - Nested Menu */}
          <div className="relative h-14 flex items-center group/nav" onMouseEnter={() => setActiveDropdown('products')} onMouseLeave={() => setActiveDropdown('none')}>
            <button className={getLinkClass('products')}>
              {t.products}
              <svg className={`w-3 h-3 transition-transform ${activeDropdown === 'products' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </button>

            {activeDropdown === 'products' && (
              <div className="header-dropdown-panel absolute top-full left-1/2 -translate-x-1/2 w-64 bg-white border py-1 z-[100] rounded-lg overflow-visible">

                {categories.map((category: any) => (
                  <div
                    key={category.id}
                    className="relative group/nested"
                    onMouseEnter={() => {
                      setActiveCategoryId(category.id);
                      getSubCategories(category.id, { language: currentLang });
                    }}
                  >
                    {/* CATEGORY */}
                    <button
                      onClick={() =>
                        handleItemClick('products', undefined, {
                          category: category.id,
                        })
                      }
                      className="header-dropdown-item group/item flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.04em] text-slate-600 transition-colors last:border-0 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <span>{getItemName(category)}</span>

                      <svg
                        className="w-3 h-3 text-slate-400 group-hover/nested:text-[var(--color-primary)] transition-all"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>

                    {/* SUBCATEGORIES */}
                    {activeCategoryId === category.id && (
                      <div className="header-dropdown-panel absolute top-0 left-[calc(100%-1px)] w-64 bg-white border py-1 z-[110] rounded-lg opacity-0 invisible group-hover/nested:opacity-100 group-hover/nested:visible transition-opacity duration-150">

                        {subcategories.map((sub: any) => (
                          <button
                            key={sub.id}
                            onClick={() =>
                              handleItemClick('products', undefined, {
                                category: category.id,
                                subCategory: sub.id,
                              })
                            }
                            className="header-dropdown-item group/subitem flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.04em] text-slate-600 transition-colors last:border-0 hover:bg-emerald-50 hover:text-emerald-600"
                          >
                            <span>{getItemName(sub, 'subcategory')}</span>

                            <svg
                              className="w-3 h-3 opacity-0 -translate-x-2 group-hover/subitem:opacity-100 group-hover/subitem:translate-x-0 transition-all text-[var(--color-primary)]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="3"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Useful Info Dropdown */}
          <div className="relative h-14 flex items-center group/nav" onMouseEnter={() => setActiveDropdown('usefulInfo')} onMouseLeave={() => setActiveDropdown('none')}>
            <button className={getLinkClass('how-to-start')}>
              {t.usefulInfo}
              <svg className={`w-3 h-3 transition-transform ${activeDropdown === 'usefulInfo' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {activeDropdown === 'usefulInfo' && (
              <div className="header-dropdown-panel absolute top-full left-1/2 -translate-x-1/2 w-56 bg-white border py-1 z-[100] rounded-lg overflow-hidden">
                <DropdownItem label={t.howToStart} onClick={() => handleItemClick('how-to-start')} />
                {/* <DropdownItem label={t.mastersClubInfo} onClick={() => handleItemClick('pro-club')} /> */}
                <DropdownItem label={t.necessaryDocuments} onClick={() => handleItemClick('necessary-documents')} />
                <DropdownItem label={t.legislationAndDecrees} onClick={() => handleItemClick('legislation')} />
                <DropdownItem label={t.faq} onClick={() => handleItemClick('faq')} />
              </div>
            )}
          </div>

          <button onClick={() => handleItemClick('partnership')} className={getLinkClass('partnership')}>{t.partnership}</button>
          {/* <button
            onClick={() => handleItemClick('pro-club')}
            className="text-[11px] font-black uppercase tracking-widest px-4 py-2 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95"
          >
            {t.proClub}
          </button> */}
        </div>
        </div>
      </nav>
      <RegisterModal
        isOpen={modalType === 'register'}
        onClose={() => setModalType('none')}
        lang={currentLang === 'az' ? 'az' : 'en'}
        onRegisterSuccess={(nextUser) => {
          onLogin?.(nextUser);
          setModalType('none');
        }}
      />
      <LoginModal
        isOpen={modalType === 'login'}
        onClose={() => setModalType('none')}
        onSwitchToRegister={() => setModalType('register')}
        lang={currentLang === 'az' ? 'az' : 'en'}
        onCustomerLogin={(nextUser) => {
          onLogin?.(nextUser);
          setModalType('none');
        }}
      />
    </header>
  );
};

export default Header;
