
import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import RegisterModal from './RegisterModal';
import LoginModal from './LoginModal';
import { useAuth } from "../contexts/AuthContext";

import { useCategory } from "../contexts/CategoryContext";

interface HeaderProps {
  onNavigate: (page: any, id?: string, extra?: any) => void;
  activePage: string;
  currentLang: 'az' | 'en' | 'ru' | 'tr';
  onLangChange: (lang: 'az' | 'en' | 'ru' | 'tr') => void;
  logoSrc?: string;
}

const DropdownItem = ({ label, onClick, icon }: { label: string; onClick: () => void; icon?: React.ReactNode }) => (
  <button
    onClick={onClick}
    className="w-full text-left px-6 py-4 text-[10px] font-black text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all uppercase tracking-widest border-b border-slate-50 last:border-0 flex items-center justify-between group/item"
  >
    <span>{label}</span>
    <svg className="w-3 h-3 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
    </svg>
  </button>
);


const Header: React.FC<HeaderProps> = ({ onNavigate, activePage, currentLang, onLangChange, logoSrc = '/volt-logo.png' }) => {
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
  const [openMobileSubMenu, setOpenMobileSubMenu] = useState<'none' | 'products' | 'usefulInfo' | 'volt'>('none');
  const [co2Saved, setCo2Saved] = useState(450.125);

  useEffect(() => {
    getCategories();
  }, []);

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

  const getItemName = (item: any) => {


    const lang = item?.languages?.[0];

    return (
      lang?.categoryName ||
      lang?.subCategoryName ||
      ""
    );
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCo2Saved(prev => prev + 0.001);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleMobileSubMenu = (menu: 'products' | 'usefulInfo' | 'volt') => {
    setOpenMobileSubMenu(openMobileSubMenu === menu ? 'none' : menu);
  };

  const t = {
    home: currentLang === 'az' ? 'Ana Səhifə' : currentLang === 'en' ? 'Home' : currentLang === 'ru' ? 'Главная' : 'Ana Sayfa',
    volt: 'VOLT',
    company: currentLang === 'az' ? 'Şirkət' : currentLang === 'en' ? 'Company' : currentLang === 'ru' ? 'Компания' : 'Şirket',
    about: currentLang === 'az' ? 'Haqqımızda' : currentLang === 'en' ? 'About' : currentLang === 'ru' ? 'О нас' : 'Hakkımızda',
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
    faq: currentLang === 'az' ? 'Tez-tez verilən suallar' : currentLang === 'en' ? 'FAQ' : currentLang === 'ru' ? 'Часто задаваемые вопросы' : 'Sık Sorulan Sorular',
    mastersClubInfo: currentLang === 'az' ? 'Ustalar klubu nədir?' : currentLang === 'en' ? 'What is Pro Club?' : currentLang === 'ru' ? 'Что такое Клуб мастеров?' : 'Ustalar Kulübü Nedir?',
    necessaryDocuments: currentLang === 'az' ? 'Zəruri sənədlər' : currentLang === 'en' ? 'Necessary Documents' : currentLang === 'ru' ? 'Необходимые документы' : 'Gerekli Belgeler',
    legislationAndDecrees: currentLang === 'az' ? 'Qanunvericilik və Fərmanlar' : currentLang === 'en' ? 'Legislation and Decrees' : currentLang === 'ru' ? 'Законодательство и указы' : 'Mevzuat ve Kararnameler',
    creditTerms: currentLang === 'az' ? 'Kredit şərtləri' : currentLang === 'en' ? 'Credit Terms' : currentLang === 'ru' ? 'Условия кредита' : 'Kredi Şartları',
    support: currentLang === 'az' ? 'Dəstək' : currentLang === 'en' ? 'Support' : currentLang === 'ru' ? 'Поддержка' : 'Destek',
    blog: currentLang === 'az' ? 'Bloq' : currentLang === 'en' ? 'Blog' : currentLang === 'ru' ? 'Блог' : 'Blog',
    privacyPolicy: currentLang === 'az' ? 'Məxfilik siyasəti' : currentLang === 'en' ? 'Privacy Policy' : currentLang === 'ru' ? 'Политика конфиденциальности' : 'Gizlilik Politikası',
    contact: currentLang === 'az' ? 'Əlaqə' : currentLang === 'en' ? 'Contact Us' : currentLang === 'ru' ? 'Контакты' : 'İletişim',
    partnership: currentLang === 'az' ? 'Tərəfdaşlıq' : currentLang === 'en' ? 'Partnership' : currentLang === 'ru' ? 'Партнерство' : 'Ortaklık',
    calculate: currentLang === 'az' ? 'Hesabla' : currentLang === 'en' ? 'Calculate' : currentLang === 'ru' ? 'Рассчитать' : 'Hesapla',
    search: currentLang === 'az' ? 'Axtarış' : currentLang === 'en' ? 'Search' : currentLang === 'ru' ? 'Поиск' : 'Arama',
    menu: currentLang === 'az' ? 'Menyunu aç' : currentLang === 'en' ? 'Open menu' : currentLang === 'ru' ? 'Открыть меню' : 'Menüyü aç',
    closeMenu: currentLang === 'az' ? 'Menyunu bağla' : currentLang === 'en' ? 'Close menu' : currentLang === 'ru' ? 'Закрыть меню' : 'Menüyü kapat'
  };

  const handleItemClick = (page: string, id?: string, extra?: any) => {
    onNavigate(page, id, extra);
    setActiveDropdown('none');
    setIsMobileMenuOpen(false);
  };

  const getLinkClass = (page: string, isDropdown?: boolean) => {
    const isActive = activePage === page;
    return `text-[11px] font-black uppercase tracking-widest transition-all duration-300 transform hover:scale-105 hover:text-emerald-600 flex items-center gap-1 ${isActive ? 'text-emerald-600' : 'text-slate-600'
      }`;
  };

  return (
    <header className="site-header-theme w-full bg-[#f8f9fa] border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full px-2 md:px-4 lg:grid lg:grid-cols-[120px_1fr] items-stretch">
        {/* Logo Column - Spans full height of top + main bars on desktop */}
        <div className="hidden lg:flex items-center justify-center overflow-visible border-r border-gray-100">
          <div onClick={() => onNavigate('home')} className="cursor-pointer transition-transform hover:scale-105 duration-500">
            {/* <Logo className="scale-100" /> */}
            <img className="h-[96px] w-[96px] object-contain" src={logoSrc} alt="Volt.az" />
          </div>
        </div>

        {/* Content Column */}
        <div className="flex flex-col">
          {/* Top Utility Bar */}
          <div className="py-2 flex justify-between lg:justify-end items-center border-b border-gray-100 lg:hidden">
            {/* Mobile Logo */}
            <div onClick={() => onNavigate('home')} className="lg:hidden cursor-pointer">
              {/* <Logo className="scale-100 origin-left" /> */}
              <img className="h-[61px] w-[61px] object-contain" src={logoSrc} alt="Volt.az" />
            </div>

            <div className="flex md:hidden items-center gap-1">
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

            <div className="flex items-center gap-3 md:gap-6">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                aria-label={t.search}
                className="lg:hidden p-1 text-slate-500 hover:text-emerald-600 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Mobile Menu Button */}
              <div className="lg:hidden border-l border-slate-200 pl-3">
                <button aria-label={isMobileMenuOpen ? t.closeMenu : t.menu} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 text-slate-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Main Bar */}
          <div className="hidden md:flex py-3 md:py-5 flex items-center justify-between gap-4">
            {/* Search Bar - Desktop */}
            <div className="flex-1 max-w-lg relative hidden lg:block lg:ml-8">
              <input
                type="text"
                placeholder="Axtarış..."
                className="w-full h-12 px-6 pr-12 rounded-full border-2 border-emerald-600/20 focus:border-emerald-600 outline-none transition-all text-sm font-medium bg-white shadow-sm"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Eco-Contribution Counter */}
            <div className="hidden xl:flex items-center gap-6 border-l border-gray-100 pl-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 text-emerald-700">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Eko-Töhfə Sayğacı</span>
                </div>
                <div className="flex items-center gap-3 text-black">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest flex items-baseline gap-1">
                    <span>Qənaət edilən CO<sub className="bottom-0">2</sub>:</span>
                    <span className="text-emerald-600 tabular-nums text-sm tracking-normal normal-case ml-1">{co2Saved.toFixed(3)}</span>
                    <span className="text-black text-[10px]">Ton</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center gap-2 md:gap-4">
              {/* Calculator Button */}
              <button
                onClick={() => handleItemClick('calculator')}
                className="flex items-center justify-center px-4 md:px-6 h-[42px] md:h-[52px] border-2 border-emerald-600 text-emerald-600 rounded-xl md:rounded-2xl group transition-all hover:bg-emerald-600 hover:text-white hover:shadow-xl hover:shadow-emerald-600/20 active:scale-95"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-colors">
                    {t.calculate}
                  </span>
                  <div className="w-3.5 h-3.5 md:w-5 md:h-5 flex items-center justify-center transition-all group-hover:scale-110">
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Contact Button */}
              <button
                onClick={() => handleItemClick('contact')}
                className="flex items-center justify-center px-4 md:px-6 h-[42px] md:h-[52px] border-2 border-emerald-600 text-emerald-600 rounded-xl md:rounded-2xl group transition-all hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-600/20 active:scale-95"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-colors">
                    {t.contact}
                  </span>
                  <div className="w-3.5 h-3.5 md:w-5 md:h-5 flex items-center justify-center transition-all group-hover:scale-110">
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
              </button>


              {/* User / Login & Languages - Desktop Only */}
              <div className=" flex items-center gap-4 border-l border-slate-200 pl-4">
                {isAuthenticated ? (
                  <div className="relative" onMouseEnter={() => setActiveDropdown('profile')} onMouseLeave={() => setActiveDropdown('none')}>
                    <button className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                    </button>
                    {activeDropdown === 'profile' && (
                      <div className="absolute top-full right-0 w-48 bg-white shadow-2xl border-t-2 border-emerald-500 py-0 z-[100] rounded-b-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
                        <DropdownItem
                          label={role === 'Admin' ? 'Admin Panel' : 'Profil'}
                          onClick={() => handleItemClick(role === 'Admin' ? 'admin-dashboard' : role === 'Master' ? 'pro-club-dashboard' : 'customer-dashboard')}
                        />
                        <button onClick={logout} className="w-full text-left px-6 py-4 text-[10px] font-black text-red-500 hover:bg-red-50 transition-all uppercase tracking-widest">{t.logout}</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={() => setModalType('login')} className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-emerald-600 transition-all uppercase tracking-widest">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                    {t.login}
                  </button>
                )}

                {/* Custom Language Dropdown */}
                <div className="relative group" onMouseEnter={() => setActiveDropdown('lang')} onMouseLeave={() => setActiveDropdown('none')}>
                  <button className="flex items-center gap-1 text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-emerald-600 transition-colors py-1">
                    <span>{currentLang}</span>
                    <svg className={`w-2 h-2 transition-transform ${activeDropdown === 'lang' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {activeDropdown === 'lang' && (
                    <div className="absolute top-full right-0 w-20 bg-white shadow-2xl border-t-2 border-emerald-500 py-0 z-[100] rounded-b-xl overflow-hidden animate-in slide-in-from-top-2 duration-200 before:absolute before:-top-4 before:left-0 before:right-0 before:h-4 before:content-['']">
                      {(['az', 'en', 'ru', 'tr'] as const).map(l => (
                        <button
                          key={l}
                          onClick={() => {
                            localStorage.setItem('lang', l);
                            onLangChange(l);
                            setActiveDropdown('none');
                          }}
                          className={`w-full text-center py-2.5 text-[9px] font-black uppercase tracking-widest transition-all border-b border-slate-50 last:border-0 relative z-10 ${currentLang === l ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:bg-slate-50'}`}
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
        <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 animate-in slide-in-from-top-2 duration-300">

          <div className="relative">
              <input
                type="text"
                placeholder="Axtarış..."
                autoFocus
                className="w-full h-10 px-4 pr-10 rounded-full border-2 border-emerald-600/20 focus:border-emerald-600 outline-none text-xs font-medium bg-gray-50"
              />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl z-[60] py-4 px-6 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-300 max-h-[calc(100vh-80px)] overflow-y-auto overscroll-contain">
          <button onClick={() => handleItemClick('home')} className="text-left text-[11px] font-black uppercase tracking-widest text-slate-600 py-3 border-b border-gray-50">{t.home}</button>

          <button onClick={() => handleItemClick('about')} className="text-left text-[11px] font-black uppercase tracking-widest text-slate-600 py-3 border-b border-gray-50">{t.about}</button>
          <button onClick={() => handleItemClick('services')} className="text-left text-[11px] font-black uppercase tracking-widest text-slate-600 py-3 border-b border-gray-50">{t.services}</button>

          {/* VOLT Mobile Dropdown */}
          <div className="flex flex-col border-b border-gray-50">
            <button
              onClick={() => toggleMobileSubMenu('volt')}
              className="flex items-center justify-between w-full py-3 text-[11px] font-black uppercase tracking-widest text-emerald-600"
            >
              <span>{t.volt}</span>
              <svg className={`w-4 h-4 transition-transform ${openMobileSubMenu === 'volt' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {openMobileSubMenu === 'volt' && (
              <div className="flex flex-col gap-3 pb-4 pl-4 animate-in slide-in-from-top-1 duration-200">
                {/* <button onClick={() => handleItemClick('projects')} className="text-left text-[9px] font-bold uppercase tracking-widest text-slate-500">{t.projects}</button> */}
                <button onClick={() => handleItemClick('news')} className="text-left text-[9px] font-bold uppercase tracking-widest text-slate-500">{t.news}</button>
                {/* <button onClick={() => handleItemClick('reels')} className="text-left text-[9px] font-bold uppercase tracking-widest text-slate-500">{t.reels}</button> */}
                <button onClick={() => handleItemClick('blog')} className="text-left text-[9px] font-bold uppercase tracking-widest text-slate-500">{t.blog}</button>
              </div>
            )}
          </div>

          {/* Products Mobile Dropdown */}
          <div className="flex flex-col border-b border-gray-50">
            <button
              onClick={() => toggleMobileSubMenu('products')}
              className="flex items-center justify-between w-full py-3 text-[11px] font-black uppercase tracking-widest text-slate-600"
            >
              <span>{t.products}</span>
              <svg className={`w-4 h-4 text-[var(--color-primary)] transition-transform ${openMobileSubMenu === 'products' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {openMobileSubMenu === 'products' && (
              <div className="flex flex-col gap-4 pb-4 pl-4 animate-in slide-in-from-top-1 duration-200">
                {categories.map((category: any) => (
                  <div key={category.id} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleItemClick("products", undefined, { category: category.id })}
                        className="flex-1 text-left text-[9px] font-black uppercase tracking-widest text-emerald-600"
                      >
                        {getItemName(category)}
                      </button>
                      <button
                        type="button"
                        aria-label={`${getItemName(category)} alt kateqoriyaları`}
                        onClick={() => {
                          getSubCategories(category.id);
                          setActiveCategoryId(activeCategoryId === category.id ? null : category.id);
                        }}
                        className="p-1.5 text-[var(--color-primary)]"
                      >
                        <svg className={`h-3 w-3 transition-transform ${activeCategoryId === category.id ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>

                    {activeCategoryId === category.id && (
                      <div className="flex flex-col gap-1.5 pl-3 border-l border-emerald-100">
                        {subcategories.map((sub: any) => (
                          <button
                            key={sub.id}
                            onClick={() =>
                              handleItemClick("products", undefined, {
                                category: category.id,
                                subCategory: sub.id,
                              })
                            }
                            className="text-left text-[8px] font-bold uppercase tracking-widest text-slate-400 hover:text-[var(--color-primary)]"
                          >
                            {getItemName(sub)}
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
              className="flex items-center justify-between w-full py-3 text-[11px] font-black uppercase tracking-widest text-slate-600"
            >
              <span>{t.usefulInfo}</span>
              <svg className={`w-4 h-4 transition-transform ${openMobileSubMenu === 'usefulInfo' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {openMobileSubMenu === 'usefulInfo' && (
              <div className="flex flex-col gap-3 pb-4 pl-4 animate-in slide-in-from-top-1 duration-200">
                <button onClick={() => handleItemClick('how-to-start')} className="text-left text-[9px] font-bold uppercase tracking-widest text-slate-500">{t.howToStart}</button>
                {/* <button onClick={() => handleItemClick('pro-club')} className="text-left text-[9px] font-bold uppercase tracking-widest text-slate-500">{t.mastersClubInfo}</button> */}
                <button onClick={() => handleItemClick('necessary-documents')} className="text-left text-[9px] font-bold uppercase tracking-widest text-slate-500">{t.necessaryDocuments}</button>
                <button onClick={() => handleItemClick('legislation')} className="text-left text-[9px] font-bold uppercase tracking-widest text-slate-500">{t.legislationAndDecrees}</button>
                <button onClick={() => handleItemClick('faq')} className="text-left text-[9px] font-bold uppercase tracking-widest text-slate-500">{t.faq}</button>
              </div>
            )}
          </div>


          <button onClick={() => handleItemClick('partnership')} className="text-left text-[11px] font-black uppercase tracking-widest text-slate-600 py-3 border-b border-gray-50">{t.partnership}</button>
          {/* <button onClick={() => handleItemClick('pro-club')} className="text-left text-[11px] font-black uppercase tracking-widest text-emerald-600 py-3 px-4 bg-emerald-50 rounded-xl border border-emerald-100 my-1">{t.proClub}</button> */}
          <button onClick={() => handleItemClick('contact')} className="text-left text-[11px] font-black uppercase tracking-widest text-slate-600 py-3">{t.contact}</button>

          {/* User / Login & Languages - mobile Only */}
          <div className=" flex items-center justify-between gap-2 ">
            {isAuthenticated ? (
              <div className="relative" onMouseEnter={() => setActiveDropdown('profile')} onMouseLeave={() => setActiveDropdown('none')}>
                <button className="flex items-center gap-1.5 pr-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                </button>
              {activeDropdown === 'profile' && (
  <div className="absolute top-0 left-full flex bg-white shadow-2xl border-l-2 border-emerald-500 z-[100] rounded-r-2xl overflow-hidden animate-in slide-in-from-left-2 duration-200">
    
    <button
      onClick={() =>
        handleItemClick(
          role === 'Admin'
            ? 'admin-dashboard'
            : role === 'Master'
            ? 'pro-club-dashboard'
            : 'customer-dashboard'
        )
      }
      className="px-6 py-4 text-[10px] font-black text-slate-700 hover:bg-slate-50 uppercase tracking-widest whitespace-nowrap"
    >
      {role === 'Admin' ? 'Admin Panel' : 'Profil'}
    </button>

    <button
      onClick={logout}
      className="px-6 py-4 text-[10px] font-black text-red-500 hover:bg-red-50 uppercase tracking-widest whitespace-nowrap"
    >
      {t.logout}
    </button>

  </div>
)}
              </div>
            ) : (
              <button onClick={() => setModalType('login')} className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-emerald-600 transition-all uppercase tracking-widest">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                {t.login}
              </button>
            )}

            {/* Custom Language Dropdown */}
            <div className="relative group" onMouseEnter={() => setActiveDropdown('lang')} onMouseLeave={() => setActiveDropdown('none')}>
              <button className="flex items-center gap-1 pl-2 text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-emerald-600 transition-colors py-1">
                <span>{currentLang}</span>
                <svg className={`w-2 h-2 transition-transform ${activeDropdown === 'lang' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeDropdown === 'lang' && (
  <div className="absolute top-0 right-full flex bg-white shadow-2xl border-r-2 border-emerald-500 z-[100] rounded-xl overflow-hidden">
    {(['az', 'en', 'ru', 'tr'] as const).map(l => (
      <button
        key={l}
        onClick={() => {
          localStorage.setItem('lang', l);
          onLangChange(l);
          setActiveDropdown('none');
        }}
        className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest transition-all
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
      <nav className="hidden lg:flex w-full px-2 md:px-4 items-center justify-center bg-white shadow-sm border-t border-gray-50 h-14">
        <div className="flex items-center gap-6 lg:gap-8 whitespace-nowrap">
          <button onClick={() => handleItemClick('home')} className={getLinkClass('home')}>{t.home}</button>

          <button onClick={() => handleItemClick('about')} className={getLinkClass('about')}>{t.about}</button>
          <button onClick={() => handleItemClick('services')} className={getLinkClass('services')}>{t.services}</button>

          {/* VOLT Dropdown */}
          <div className="relative h-14 flex items-center group/nav" onMouseEnter={() => setActiveDropdown('volt')} onMouseLeave={() => setActiveDropdown('none')}>
            <button className={getLinkClass('volt')}>
              {t.volt}
              <svg className={`w-3 h-3 transition-transform ${activeDropdown === 'volt' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {activeDropdown === 'volt' && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 bg-white shadow-2xl border-t-4 border-emerald-500 py-0 z-[100] rounded-b-3xl overflow-hidden animate-in slide-in-from-top-2 duration-200 ring-1 ring-slate-200/50">
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
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-72 bg-white shadow-2xl border-t-4 border-emerald-500 py-0 z-[100] rounded-b-3xl overflow-visible animate-in slide-in-from-top-2 duration-200 ring-1 ring-slate-200/50">

                {categories.map((category: any) => (
                  <div
                    key={category.id}
                    className="relative group/nested"
                    onMouseEnter={() => {
                      setActiveCategoryId(category.id);
                      getSubCategories(category.id);
                    }}
                  >
                    {/* CATEGORY */}
                    <button
                      onClick={() =>
                        handleItemClick('products', undefined, {
                          category: category.id,
                        })
                      }
                      className="w-full text-left px-6 py-4 text-[10px] font-black text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all uppercase tracking-widest border-b border-slate-50 last:border-0 flex items-center justify-between"
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
                      <div className="absolute top-0 left-[calc(100%-1px)] w-72 bg-white shadow-2xl border-l-4 border-emerald-500 py-0 z-[110] rounded-r-3xl opacity-0 invisible group-hover/nested:opacity-100 group-hover/nested:visible transition-all duration-200 ring-1 ring-slate-200/50">

                        {subcategories.map((sub: any) => (
                          <button
                            key={sub.id}
                            onClick={() =>
                              handleItemClick('products', undefined, {
                                category: category.id,
                                subCategory: sub.id,
                              })
                            }
                            className="w-full text-left px-6 py-4 text-[10px] font-black text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all uppercase tracking-widest border-b border-slate-50 last:border-0 flex items-center justify-between group/subitem"
                          >
                            <span>{getItemName(sub)}</span>

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
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-white shadow-2xl border-t-4 border-emerald-500 py-0 z-[100] rounded-b-3xl overflow-hidden animate-in slide-in-from-top-2 duration-200 ring-1 ring-slate-200/50">
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
      </nav>
      <RegisterModal
        isOpen={modalType === 'register'}
        onClose={() => setModalType('none')}
        lang={currentLang === 'az' ? 'az' : 'en'}
      />
      <LoginModal
        isOpen={modalType === 'login'}
        onClose={() => setModalType('none')}
        onSwitchToRegister={() => setModalType('register')}
        lang={currentLang === 'az' ? 'az' : 'en'}
      />
    </header>
  );
};

export default Header;
