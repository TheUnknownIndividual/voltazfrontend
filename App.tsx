
import React, { useState, useEffect, Suspense, lazy } from 'react';
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
const OrderPage = lazy(() => import('./components/OrderPage'));
const CartPage = lazy(() => import('./components/CartPage'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const BlogPage = lazy(() => import('./components/BlogPage'));
const NecessaryDocumentsPage = lazy(() => import('./components/NecessaryDocumentsPage'));
const PartnershipPage = lazy(() => import('./components/PartnershipPage'));
const ThemeLab = lazy(() => import('./components/ThemeLab'));
 

type PageView = 'home' | 'about' | 'about-detail' | 'services' | 'projects' | 'products' | 'contact' | 'news' | 'blog' | 'credits' | 'media' | 'project-detail' | 'product-detail' | 'admin-dashboard' | 'calculator' | 'legislation' | 'pro-club' | 'pro-club-dashboard' | 'customer-dashboard' | 'video-reels' | 'order' | 'faq' | 'how-to-start' | 'cart' | 'privacy-policy' | 'necessary-documents' | 'partnership';
type Language = 'az' | 'en' | 'ru' | 'tr';
type UserRole = 'customer' | 'master' | 'admin';


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
import { ProductProvider } from './contexts/ProductContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { EmailProvider } from './contexts/EmailContext';
import { PartnershipProvider } from './contexts/PartnershipContext';

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
  const [view, setView] = useState<{ page: PageView; id?: string; extra?: any }>({ page: 'home' });
  const [lang, setLang] = useState<'az' | 'en' | 'ru' | 'tr'>(
    (localStorage.getItem('lang') as 'az' | 'en' | 'ru' | 'tr') || 'en'
  );
  const [cart, setCart] = useState<{ id: string; quantity: number; power?: string }[]>([]);
  const [user, setUser] = useState<User | null>(null);
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
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    const savedUser = localStorage.getItem('volt_current_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('volt_current_user');
      }
    }

    const savedCart = localStorage.getItem('volt_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCart(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setCart([]);
      }
    }

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
      case 'services': return '/services';
      case 'projects': return '/projects';
      case 'project-detail': return `/projects/${id || ''}`;
      case 'products': {
        const params = new URLSearchParams();
        const category = extra?.category ?? extra?.categoryId;
        const subCategory = extra?.subCategory ?? extra?.subCategoryId;
        if (category !== undefined && category !== null) params.set('category', String(category));
        if (subCategory !== undefined && subCategory !== null) params.set('subCategory', String(subCategory));
        const query = params.toString();
        return query ? `/products?${query}` : '/products';
      }
      case 'product-detail': return `/product/${id || ''}`;
      case 'contact': return '/contact';
      case 'news': return '/news';
      case 'blog': return '/blog';
      case 'credits': return '/credits';
      case 'video-reels': return '/videos';
      case 'faq': return '/faq';
      case 'how-to-start': return '/how-to-start';
      case 'order': return `/order/${id || ''}`;
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
      default: return '/';
    }
  };

  const pathToPage = (path: string, search = '') : {page: PageView; id?: string; extra?: any} => {
    const parts = path.split('/').filter(Boolean);
    if (path === '/' || parts.length === 0) return { page: 'home' };
    if (parts[0] === 'about' && parts[1] === 'detail') return { page: 'about-detail', id: parts[2], extra: { section: parts[2] } };
    if (parts[0] === 'about') return { page: 'about' };
    if (parts[0] === 'services') return { page: 'services' };
    if (parts[0] === 'projects' && parts[1]) return { page: 'project-detail', id: parts[1] };
    if (parts[0] === 'projects') return { page: 'projects' };
    if (parts[0] === 'products') {
      const params = new URLSearchParams(search);
      const category = params.get('category') || undefined;
      const subCategory = params.get('subCategory') || undefined;
      return { page: 'products', extra: { category, subCategory } };
    }
    if (parts[0] === 'product' && parts[1]) return { page: 'product-detail', id: parts[1] };
    if (parts[0] === 'contact') return { page: 'contact' };
    if (parts[0] === 'news') return { page: 'news' };
    if (parts[0] === 'blog') return { page: 'blog' };
    if (parts[0] === 'credits' || parts[0] === 'credit') return { page: 'credits' };
    if (parts[0] === 'videos' || parts[0] === 'reels') return { page: 'video-reels' };
    if (parts[0] === 'faq') return { page: 'faq' };
    if (parts[0] === 'how-to-start') return { page: 'how-to-start' };
    if (parts[0] === 'order' && parts[1]) return { page: 'order', id: parts[1] };
    if (parts[0] === 'order') return { page: 'order' };
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

  const handleAddToCart = (productId: string, quantity: number = 1, power?: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId && item.power === power);
      let updatedCart;
      if (existingItem) {
        updatedCart = prevCart.map(item =>
          (item.id === productId && item.power === power) ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        updatedCart = [...prevCart, { id: productId, quantity, power }];
      }
      localStorage.setItem('volt_cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number, power?: string) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId, power);
      return;
    }
    setCart(prevCart => {
      const updatedCart = prevCart.map(item =>
        (item.id === productId && item.power === power) ? { ...item, quantity } : item
      );
      localStorage.setItem('volt_cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const handleRemoveFromCart = (productId: string, power?: string) => {
    setCart(prevCart => {
      const updatedCart = prevCart.filter(item => !(item.id === productId && item.power === power));
      localStorage.setItem('volt_cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('volt_current_user', JSON.stringify(userData));

    if (userData.role === 'admin') {
      navigateTo('admin-dashboard');
    } else if (userData.role === 'master') {
      navigateTo('pro-club-dashboard');
    } else {
      navigateTo('customer-dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('volt_current_user');
    navigateTo('home');
  };

  // Sync location -> view so direct URL access renders correct content
  const location = useLocation();
  useEffect(() => {
    const mapped = pathToPage(location.pathname, location.search);
    setView({ page: mapped.page, id: mapped.id, extra: mapped.extra });
  }, [location.pathname, location.search]);

  useEffect(() => {
    const seoByPage: Record<PageView, { title: string; description: string; robots?: string }> = {
      home: {
        title: 'Volt.az | Günəş Panelləri Satışı və Quraşdırılması | SOLARIX',
        description: 'Volt.az — günəş panelləri, invertorlar, enerji həlləri və peşəkar quraşdırma xidmətləri. SOLARIX ilə günəş enerjisindən səmərəli istifadə edin.'
      },
      about: {
        title: 'Haqqımızda | Volt.az',
        description: 'Volt.az və SOLARIX MMC haqqında məlumat, missiya, enerji həlləri və Azərbaycanda bərpa olunan enerji yanaşmamız.'
      },
      'about-detail': {
        title: 'Şirkət haqqında | Volt.az',
        description: 'Volt.az şirkət məlumatları, missiya və vizyon bölməsi.'
      },
      services: {
        title: 'Xidmətlər | Günəş Paneli Quraşdırılması | Volt.az',
        description: 'Günəş paneli quraşdırılması, layihələndirmə, enerji auditi, monitorinq, maliyyə və sənədləşmə xidmətləri.'
      },
      products: {
        title: 'Məhsullar | Günəş Panelləri, İnvertorlar və Avadanlıqlar | Volt.az',
        description: 'Volt.az məhsulları: günəş panelləri, invertorlar, kabellər, qoruma avadanlıqları və enerji sistemləri.'
      },
      'product-detail': {
        title: 'Məhsul | Volt.az',
        description: 'Volt.az məhsul məlumatları, xüsusiyyətlər, çatdırılma və zəmanət şərtləri.'
      },
      calculator: {
        title: 'Günəş Enerjisi Kalkulyatoru | Volt.az',
        description: 'Eviniz və biznesiniz üçün günəş paneli sistem ölçüsünü və təxmini qənaəti hesablamaq üçün Volt.az kalkulyatoru.'
      },
      contact: {
        title: 'Əlaqə | Volt.az',
        description: 'Volt.az ilə əlaqə saxlayın və günəş enerjisi həlləri üçün məsləhət alın.'
      },
      partnership: {
        title: 'Tərəfdaşlıq | Volt.az',
        description: 'SOLARIX və Volt.az tərəfdaşlıq imkanları, rəsmi partnyorlar və yaşıl enerji ekosistemi.'
      },
      faq: {
        title: 'Tez-tez verilən suallar | Volt.az',
        description: 'Günəş panelləri, qiymətlər, quraşdırma, sənədləşmə və şəbəkəyə qoşulma ilə bağlı tez-tez verilən suallar.'
      },
      'how-to-start': {
        title: 'Necə başlamalı? | Volt.az',
        description: 'Günəş enerji sisteminə başlamaq üçün əsas addımlar və izahlar.'
      },
      'necessary-documents': {
        title: 'Zəruri sənədlər | Volt.az',
        description: 'Günəş enerji sistemi üçün tələb olunan sənədlər və müraciət qaydaları.'
      },
      legislation: {
        title: 'Qanunvericilik və Fərmanlar | Volt.az',
        description: 'Günəş enerjisi, net-metering və aktiv istehlakçı mexanizmi üzrə sadə izahlar.'
      },
      news: {
        title: 'Xəbərlər | Volt.az',
        description: 'Volt.az xəbərləri və bərpa olunan enerji sahəsində yeniliklər.'
      },
      blog: {
        title: 'Bloq | Volt.az',
        description: 'Günəş enerjisi, məhsullar və enerji qənaəti haqqında faydalı məqalələr.'
      },
      'privacy-policy': {
        title: 'Məxfilik siyasəti | Volt.az',
        description: 'Volt.az məxfilik siyasəti və istifadəçi məlumatlarının qorunması.'
      },
      projects: {
        title: 'Layihələr | Volt.az',
        description: 'Volt.az günəş enerjisi və bərpa olunan enerji layihələri.'
      },
      'project-detail': {
        title: 'Layihə | Volt.az',
        description: 'Volt.az layihə məlumatları və enerji həlləri.'
      },
      credits: {
        title: 'Kredit şərtləri | Volt.az',
        description: 'Günəş paneli sistemləri üçün maliyyələşmə və kredit imkanları.'
      },
      'video-reels': {
        title: 'Video Reels | Volt.az',
        description: 'Volt.az video materialları və günəş enerjisi izahları.'
      },
      'pro-club': {
        title: 'Ustalar Klubu | Volt.az',
        description: 'Volt.az ustalar klubu və peşəkar əməkdaşlıq imkanları.'
      },
      cart: {
        title: 'Səbət | Volt.az',
        description: 'Volt.az alış-veriş səbəti.',
        robots: 'noindex, nofollow'
      },
      order: {
        title: 'Sifariş | Volt.az',
        description: 'Volt.az sifariş səhifəsi.',
        robots: 'noindex, nofollow'
      },
      'customer-dashboard': {
        title: 'Şəxsi kabinet | Volt.az',
        description: 'Volt.az müştəri kabineti.',
        robots: 'noindex, nofollow'
      },
      'admin-dashboard': {
        title: 'Admin panel | Volt.az',
        description: 'Volt.az admin panel.',
        robots: 'noindex, nofollow'
      },
      'pro-club-dashboard': {
        title: 'Usta kabineti | Volt.az',
        description: 'Volt.az usta kabineti.',
        robots: 'noindex, nofollow'
      },
      media: {
        title: 'Media | Volt.az',
        description: 'Volt.az media bölməsi.'
      }
    };

    const meta = seoByPage[view.page] || seoByPage.home;
    const canonicalPath = view.page === 'products' ? '/products' : location.pathname || '/';
    const canonicalUrl = `https://volt.az${canonicalPath === '/' ? '/' : canonicalPath}`;
    const robots = meta.robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

    const setMeta = (selector: string, attr: 'content' | 'href', value: string, create?: () => HTMLElement) => {
      let element = document.head.querySelector(selector) as HTMLElement | null;
      if (!element && create) {
        element = create();
        document.head.appendChild(element);
      }
      element?.setAttribute(attr, value);
    };

    document.title = meta.title;
    setMeta('meta[name="description"]', 'content', meta.description);
    setMeta('meta[name="robots"]', 'content', robots);
    setMeta('meta[name="googlebot"]', 'content', robots);
    setMeta('meta[property="og:title"]', 'content', meta.title);
    setMeta('meta[property="og:description"]', 'content', meta.description);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[property="twitter:title"]', 'content', meta.title);
    setMeta('meta[property="twitter:description"]', 'content', meta.description);
    setMeta('link[rel="canonical"]', 'href', canonicalUrl, () => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      return link;
    });
    document.documentElement.lang = lang;
  }, [view.page, location.pathname, lang]);

  const renderContent = () => {
    switch (view.page) {
      case 'about': return <AboutProvider><AboutPage lang={lang} onBack={handleBack} onNavigate={navigateTo} sectionId={view.extra?.section} /></AboutProvider>;
      case 'about-detail': return <AboutProvider><AboutDetail lang={lang} onBack={() => navigateTo('about', undefined, { section: view.extra?.section })} sectionId={view.extra?.section} /></AboutProvider>;
      case 'services': return <ServiceProvider><ServicesPage lang={lang} onBack={handleBack} /></ServiceProvider>;
      case 'legislation': return <LegislationPage lang={lang} onBack={handleBack} sectionId={view.extra?.section} />;
      case 'pro-club': return <ProClubPage lang={lang} onBack={handleBack} onRegisterSuccess={handleLogin} initialMode={view.extra?.mode} />;
      case 'pro-club-dashboard': return (
        <ProClubDashboard
          user={user}
          lang={lang}
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
      case 'video-reels': return <VideoReels lang={lang} onBack={handleBack} />;
      case 'credits': return <CreditPrivileges lang={lang} onBack={handleBack} />;
      // case 'credit': return <CreditPrivileges lang={lang} onBack={handleBack} />;
      // case 'reels': return <VideoReels lang={lang} onBack={handleBack} />;
      case 'faq': return <FAQPage lang={lang} onBack={handleBack} onNavigate={navigateTo} />;
      case 'how-to-start': return <HowToStartPage lang={lang} onBack={handleBack} />;
      case 'privacy-policy': return <PrivacyPolicy lang={lang} onBack={handleBack} />;
      case 'order': return <ProductProvider><OrderPage productId={view.id || ''} quantity={view.extra?.quantity || 1} selectedPower={view.extra?.power} lang={lang} onBack={handleBack} onNavigate={navigateTo} /></ProductProvider>;
      case 'cart': return (
        <ProductProvider>
          <CartPage
            cart={cart}
            onRemoveFromCart={(id, power) => handleRemoveFromCart(id, power)}
            onUpdateCartQuantity={(id, quantity, power) => handleUpdateCartQuantity(id, quantity, power)}
            onBack={handleBack}
            lang={lang}
            onCheckout={() => {
              if (!user) {
                // Trigger login modal somehow or just navigate to dashboard which handles it
                navigateTo(user?.role === 'master' ? 'pro-club-dashboard' : 'customer-dashboard');
              } else {
                navigateTo(user?.role === 'master' ? 'pro-club-dashboard' : 'customer-dashboard');
              }
            }}
          />
        </ProductProvider>
      );

      case 'calculator': return (
        <div className="pt-20">
          <Calculator lang={lang} />
        </div>
      );
      case 'customer-dashboard': return (
        <CustomerDashboard
          user={user}
          lang={lang}
          onBack={handleBack}
          cart={cart}
          onRemoveFromCart={handleRemoveFromCart}
          onUpdateCartQuantity={handleUpdateCartQuantity}
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
      case 'admin-dashboard':
        if (role !== 'Admin') {
          navigateTo('home');
          return null;
        }
        return <AdminDashboard onBack={handleBack} />;
      case 'news': return <NewsProvider><NewsPage lang={lang} onBack={handleBack} /></NewsProvider>;
      case 'blog': return <BlogProvider><BlogPage lang={lang} onBack={handleBack} /></BlogProvider>;
      case 'necessary-documents': return <NecessaryDocumentsPage lang={lang} onBack={handleBack} />;
      case 'partnership': return <PartnershipProvider><PartnershipPage lang={lang} onBack={handleBack} /></PartnershipProvider>;
      case 'contact': return <ContactProvider><EmailProvider><ContactPage lang={lang} onBack={handleBack} initialService={view.extra?.serviceId} initialProduct={view.extra?.productId} /></EmailProvider></ContactProvider>;
      case 'projects': return <ProjectProvider><ProjectsPage onSelectProject={(id) => navigateTo('project-detail', id)} lang={lang} onBack={handleBack} /> </ProjectProvider>;
      case 'products': return (
        <ProductProvider>
          <CategoryProvider>
            <ProductsPage
              // onSelectProduct={(id) => navigateTo('product-detail', id)} 
              onSelectProduct={(id) => navigate(`/product/${id}`)}
              onOrderNow={(id, quantity) => navigateTo('order', id, { quantity })}
              onAddToCart={handleAddToCart}
              lang={lang}
              onBack={handleBack}
              initialCategory={view.extra?.category ?? view.extra?.categoryId}
              initialSubCategory={view.extra?.subCategory ?? view.extra?.subCategoryId}
            />
          </CategoryProvider>
        </ProductProvider>
      );
      case 'project-detail': return <ProjectProvider><ProjectDetail projectId={view.id || ''} onBack={() => setView({ page: 'projects' })} lang={lang} /></ProjectProvider>;
      // case 'product-detail': return <ProductProvider><CategoryProvider><ProductDetail productId={view.id || ''} onBack={() => setView({ page: view.id ? 'products' : 'home' })} onOrderNow={(id, quantity, power) => navigateTo('order', id, { quantity, power })} onAddToCart={handleAddToCart} lang={lang} /></CategoryProvider></ProductProvider>;
      default:
        return (
          <>
            <HeroSlider lang={lang} onNavigate={navigateTo} />
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


  return (
    <div className="flex flex-col min-h-screen">
      {location.pathname !== '/theme-lab' && <CategoryProvider>
        <Header
          onNavigate={navigateTo}
          activePage={view.page}
          currentLang={lang}
          onLangChange={setLang}
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
                    onOrderNow={(id, quantity, power) =>
                      navigateTo('order', id, { quantity, power })
                    }
                    onAddToCart={handleAddToCart}
                    lang={lang}
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

      {/* Floating Cart Button - Only for customers/guests */}
      {user?.role !== 'admin' && cart.length > 0 && (
        <button
          onClick={() => navigateTo('cart')}
          className="fixed bottom-8 right-8 z-[100] bg-emerald-600 text-white p-4 rounded-full shadow-2xl shadow-emerald-600/40 hover:bg-slate-900 transition-all active:scale-95 group animate-in fade-in zoom-in duration-300"
        >
          <div className="relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute -top-2 -right-2 bg-white text-emerald-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-emerald-600">
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            {lang === 'az' ? 'Səbətə bax' : 'View Cart'}
          </div>
        </button>
      )}

      {location.pathname !== '/theme-lab' && <Footer onNavigate={(p) => navigateTo(p as PageView)} lang={lang} logoSrc={previewLogo || '/volt-logo.png'} />}
    </div>
  );
};

export default App;
