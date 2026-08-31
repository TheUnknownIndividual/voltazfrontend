
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useNotification } from '../contexts/NotificationContext';
import { API_ENDPOINTS } from '../utils/constants';
import AdminStats from './AdminStats';
import AdminAnalytics from './AdminAnalytics';
import AdminOrders from './AdminOrders';
import AdminInquiries from './AdminInquiries';
import AdminWarehouse from './AdminWarehouse';
import AdminUsers from './AdminUsers';
import AdminMessageInbox from './AdminMessageInbox';
import AdminWhatsAppSetup from './AdminWhatsAppSetup';
import AdminMasters from './AdminMasters';
import AdminSolarCalculator from './AdminSolarCalculator';
import AdminSliders from './AdminSliders';
import AdminCategoryManagement from './AdminCategoryManagement';
import AdminServices from './AdminServices';
import AdminProjects from './AdminProjects';
import AdminProjectTracker from './AdminProjectTracker';
import AdminExecutionProjects from './AdminExecutionProjects';
import AdminAccounting from './AdminAccounting';
import AdminHumanResources from './AdminHumanResources';
import AdminTelegramProfile from './AdminTelegramProfile';
import AdminNews from './AdminNews';
import AdminAbout from './AdminAbout';
import AdminContact from './AdminContact';
import AdminEmail from './AdminEmail';
import AdminPartnershipDirections from './AdminPartnershipDirections';
import MasterForum from '../components/MasterForum';
import { AboutProvider } from '@/contexts/AboutContext';
import { NewsProvider } from '@/contexts/NewsContext';
import { BlogProvider } from '@/contexts/BlogContext';
import AdminBlogs from './AdminBlogs';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { ServiceProvider } from '@/contexts/ServiceContext';
import { ContactProvider } from '@/contexts/ContactContext';
import { CategoryProvider } from '@/contexts/CategoryContext';
import AdminPromotion from './AdminPromotion';
import { PromotionProvider } from '@/contexts/PromotionContext';
import { ProductProvider } from '@/contexts/ProductContext';
import { EmailProvider } from '@/contexts/EmailContext';
import { PartnershipProvider } from '@/contexts/PartnershipContext';
import AdminVerification from './AdminVerification';
import { AdminPage, getAdminSession, type AdminUser } from '../api/adminUsers';
import { getMetaInboxUnreadCount } from '../api/metaInbox';

interface UserRecord {
  email: string;
  name: string;
  role: string;
  isApproved: boolean;
  registrationDate: string;
  city?: string;
  masterType?: string;
  documentImage?: string;
  totalSpent?: number;
}

interface AdminDashboardProps {
  onBack: () => void;
  lang?: 'az' | 'en' | 'ru' | 'tr';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, lang = 'az' }) => {
  const { showNotification, confirm } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const isWhatsAppSetupPath = location.pathname.toLowerCase() === '/admin-dashboard/whatsapp-setup';
  const [activeTab, setActiveTab] = useState<'masters' | 'customers' | 'settings' | 'stats' | 'analytics' | 'orders' | 'requests' | 'message-inbox' | 'warehouse' | 'permissions' | 'verification' | 'solar-calculator' | 'solar-inverter-qa' | 'project-tracker' | 'execution-projects' | 'accounting' | 'human-resources' | 'telegram-profile'>(isWhatsAppSetupPath ? 'settings' : 'stats');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [adminSession, setAdminSession] = useState<AdminUser | null>(null);
  const [adminSessionLoaded, setAdminSessionLoaded] = useState(false);
  const [activityUserId, setActivityUserId] = useState<number | null>(null);
  const [settingsView, setSettingsView] = useState<'main' | 'sliders' | 'categories' | 'projects' | 'news' | 'about' | 'blogs' | 'service' | 'contact' | 'promotion' | 'email' | 'partnership' | 'whatsapp'>(isWhatsAppSetupPath ? 'whatsapp' : 'main');
  const canManageWhatsApp = Boolean(adminSession &&
    (adminSession.isSuperAdmin || adminSession.allowedPages.includes(AdminPage.WhatsAppOnboarding)));

  useEffect(() => {
    // Reset settingsView when tab changes
    if (activeTab !== 'settings') {
      setSettingsView('main');
    }
  }, [activeTab]);

  useEffect(() => {
    if (!isWhatsAppSetupPath) return;
    setActiveTab('settings');
    setSettingsView('whatsapp');
    if (adminSession && !canManageWhatsApp) navigate('/admin-dashboard', { replace: true });
  }, [isWhatsAppSetupPath, adminSession, canManageWhatsApp, navigate]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [counts, setCounts] = useState({ orders: 0, requests: 0, serviceRequests: 0 });
  const [orderUnreadCount, setOrderUnreadCount] = useState(0);
  const [requestsUnreadCount, setRequestsUnreadCount] = useState(0);
  const [messageInboxUnreadCount, setMessageInboxUnreadCount] = useState(0);
  const [adminOrders, setAdminOrders] = useState<any[]>([]);
  const [expandedCustomerEmail, setExpandedCustomerEmail] = useState<string | null>(null);

  const SERVICE_TYPES = [
    "Günəş Paneli Quraşdırılması",
    "Smart Sayğac İnteqrasiyası",
    "Maliyyə Həlləri",
    "Texniki xidmət",
    "konsultasiya",
    "hüquqi dəstək"
  ];


  useEffect(() => {
    // LocalStorage-dan istifadəçiləri yüklə
    const savedUsers = localStorage.getItem('volt_users');
    if (savedUsers) {
      const parsed = JSON.parse(savedUsers);
      setUsers(Array.isArray(parsed) ? parsed : []);
    } else {
      // Test üçün ilkin data
      const initialUsers: UserRecord[] = [
        { email: 'admin@volt.az', name: 'Administrator', role: 'admin', isApproved: true, registrationDate: '2024-01-01' },
        { email: 'usta_ali@gmail.com', name: 'Əli Məmmədov', role: 'master', isApproved: true, registrationDate: '2024-05-10', city: 'Bakı', masterType: 'Elektrik' },
        { email: 'vusal_h@gmail.com', name: 'Vüsal Həsənov', role: 'master', isApproved: true, registrationDate: '2024-05-11', city: 'Gəncə', masterType: 'Mühəndis' },
        { email: 'samir_q@volt.az', name: 'Samir Quliyev', role: 'master', isApproved: false, registrationDate: '2024-05-15', city: 'Sumqayıt', masterType: 'Quraşdırıcı' },
        { email: 'leyla_m@mail.ru', name: 'Leyla Məlikova', role: 'master', isApproved: false, registrationDate: '2024-05-16', city: 'Bakı', masterType: 'Layihəçi' },
        { email: 'kamil_e@gmail.com', name: 'Kamil Eyvazov', role: 'master', isApproved: true, registrationDate: '2024-05-18', city: 'Lənkəran', masterType: 'Texnik' },
        { email: 'mushtari@mail.ru', name: 'Zaur H.', role: 'customer', isApproved: true, registrationDate: '2024-05-12', city: 'Sumqayıt', totalSpent: 1250 }
      ];
      setUsers(initialUsers);
      localStorage.setItem('volt_users', JSON.stringify(initialUsers));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getAdminSession()
      .then((session) => { if (!cancelled) setAdminSession(session); })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setAdminSessionLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!adminSession || isWhatsAppSetupPath || adminSession.isSuperAdmin || adminSession.allowedPages.includes(AdminPage.Stats)) return;
    if (activeTab === 'message-inbox' && adminSession.allowedPages.includes(AdminPage.MessageInbox)) return;
    if (adminSession.allowedPages.includes(AdminPage.WhatsAppOnboarding)) {
      navigate('/admin-dashboard/whatsapp-setup', { replace: true });
      return;
    }
    if (adminSession.allowedPages.includes(AdminPage.MessageInbox)) setActiveTab('message-inbox');
  }, [adminSession, isWhatsAppSetupPath, activeTab, navigate]);

  useEffect(() => {
    if (!adminSession || (!adminSession.isSuperAdmin && !adminSession.allowedPages.includes(AdminPage.MessageInbox))) return;
    let cancelled = false;
    const load = async () => {
      if (document.visibilityState === 'hidden') return;
      try { const count = await getMetaInboxUnreadCount(); if (!cancelled) setMessageInboxUnreadCount(count); }
      catch { if (!cancelled) setMessageInboxUnreadCount(0); }
    };
    load();
    const interval = window.setInterval(load, 30000);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [adminSession, activeTab]);

  useEffect(() => {
    let cancelled = false;
    const loadOrderUnreadCount = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.ORDER.GET_ORDERS());
        const apiOrders = response.data?.success && Array.isArray(response.data.data) ? response.data.data : [];
        if (!cancelled) {
          setAdminOrders(apiOrders);
          setOrderUnreadCount(apiOrders.filter((order: any) => !order.isViewedByAdmin).length);
        }
      } catch {
        if (!cancelled) {
          setAdminOrders([]);
          setOrderUnreadCount(0);
        }
      }
    };

    loadOrderUnreadCount();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  useEffect(() => {
    let cancelled = false;
    const loadRequestsUnreadCount = async () => {
      try {
        const [contactRes, serviceRes, partnershipRes] = await Promise.all([
          axiosInstance.get(API_ENDPOINTS.CONTACT_REQUEST.GET_CONTACT_REQUEST()),
          axiosInstance.get(API_ENDPOINTS.SERVICE_REQUEST.GET_SERVICE_REQUEST()),
          axiosInstance.get(API_ENDPOINTS.PARTNERSHIP_REQUEST.GET_PARTNERSHIP_REQUEST())
        ]);

        const extractUnread = (response: any) => {
          const list = response.data?.success && Array.isArray(response.data.data) ? response.data.data : [];
          return list.filter((item: any) => !item.isViewedByAdmin).length;
        };

        if (!cancelled) {
          setRequestsUnreadCount(
            extractUnread(contactRes) + extractUnread(serviceRes) + extractUnread(partnershipRes)
          );
        }
      } catch {
        if (!cancelled) {
          setRequestsUnreadCount(0);
        }
      }
    };

    loadRequestsUnreadCount();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const [selectedMaster, setSelectedMaster] = useState<any | null>(null);

  const handleApprove = (email: string) => {
    const safeUsers = Array.isArray(users) ? users : [];
    const updated = safeUsers.map(u => u.email === email ? { ...u, isApproved: true } : u);
    setUsers(updated);
    localStorage.setItem('volt_users', JSON.stringify(updated));
    showNotification('Usta təsdiqləndi! Ona bildiriş göndərildi.');
    setSelectedMaster(null);
  };

  const handleBlock = async (email: string) => {
    if (await confirm('Bu istifadəçini bloklamaq istədiyinizə əminsiniz?')) {
      const updated = users.filter(u => u.email !== email);
      setUsers(updated);
      localStorage.setItem('volt_users', JSON.stringify(updated));
      setSelectedMaster(null);
      showNotification('İstifadəçi bloklandı', 'warning');
    }
  };

  const orderStatusLabel = (status: number) => {
    const labels: Record<number, string> = {
      1: 'Yeni',
      2: 'Təsdiqləndi',
      3: 'Hazırlanır',
      4: 'Göndərildi',
      5: 'Tamamlandı',
      6: 'Ləğv edildi',
    };
    return labels[status] || 'Naməlum';
  };

  const orderIntentLabel = (intent: number) => {
    const labels: Record<number, string> = {
      1: 'Satış',
      2: 'Qiymət sorğusu',
      3: 'Stok sorğusu',
    };
    return labels[intent] || 'Sorğu';
  };

  const customerRows = React.useMemo(() => {
    const localCustomers = (Array.isArray(users) ? users : []).filter((user) => user.role === 'customer');
    const rows = new Map<string, UserRecord & { orders: any[]; pendingOrders: number; requestCount: number; totalSpent: number }>();

    localCustomers.forEach((user) => {
      rows.set(user.email.toLowerCase(), {
        ...user,
        orders: [],
        pendingOrders: 0,
        requestCount: 0,
        totalSpent: Number(user.totalSpent || 0),
      });
    });

    adminOrders.forEach((order) => {
      const email = String(order.email || '').trim().toLowerCase();
      if (!email) return;

      const existing = rows.get(email);
      if (!existing) {
        rows.set(email, {
          email,
          name: order.fullName || email,
          role: 'customer',
          isApproved: true,
          registrationDate: order.createdAt || new Date().toISOString(),
          city: order.cityOrRegion || order.district || '',
          totalSpent: 0,
          orders: [order],
          pendingOrders: order.status !== 5 && order.status !== 6 ? 1 : 0,
          requestCount: order.intent === 2 || order.intent === 3 ? 1 : 0,
        });
        return;
      }

      existing.orders.push(order);
      if (order.status !== 5 && order.status !== 6) existing.pendingOrders += 1;
      if (order.intent === 2 || order.intent === 3) existing.requestCount += 1;
      if (order.intent === 1) existing.totalSpent += Number(order.finalTotal || 0);
      if (!existing.city && order.cityOrRegion) existing.city = order.cityOrRegion;
    });

    return Array.from(rows.values()).map((row) => ({
      ...row,
      orders: row.orders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()),
    }));
  }, [adminOrders, users]);

  const searchedCustomerRows = customerRows.filter((user) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
  });

  const customerPendingOrders = customerRows.reduce((sum, user) => sum + user.pendingOrders, 0);
  const customerRequestCount = customerRows.reduce((sum, user) => sum + user.requestCount, 0);

  return (
    <div className="admin-dashboard min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full shrink-0 bg-slate-900 text-white flex flex-col pt-5 md:sticky md:top-0 md:h-screen md:w-64 md:min-w-[16rem] md:max-w-[16rem] md:pt-7">
        <div className="min-h-[58px] px-6 mb-5 md:mb-7">
          <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Yüksək Səlahiyyət</div>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-black">Admin Panel</h2>
            <button
              type="button"
              onClick={() => setIsMobileNavOpen((value) => !value)}
              className="md:hidden rounded-xl border border-white/10 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-300"
            >
              Səhifələr
            </button>
          </div>
        </div>

        <nav className={`${isMobileNavOpen ? 'block' : 'hidden'} md:block md:flex-grow md:overflow-y-auto space-y-1 px-3`}>
          {!adminSessionLoaded && (
            <div className="hidden space-y-1 md:block" aria-label="Admin menyusu yüklənir">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="h-10 w-full rounded-xl bg-white/5" />
              ))}
            </div>
          )}
          {adminSessionLoaded && (
            <>
            {[
              { id: 'stats', label: 'Statistika', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              { id: 'analytics', label: 'CC & Internal Analytics', icon: 'M3 3v18h18M7 16l3-3 3 2 5-7' },
              { id: 'project-tracker', label: 'Projects', icon: 'M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 012-2z' },
              { id: 'execution-projects', label: 'İcra olunan layihələr', icon: 'M12 2l7 4v6c0 5-3 8-7 10-4-2-7-5-7-10V6l7-4zm-3 10 2 2 4-4' },
              { id: 'human-resources', label: 'İnsan Resursları', icon: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2m7-8a4 4 0 100-8 4 4 0 000 8m7-1a3 3 0 100-6m4 14v-2a3 3 0 00-2-2.83' },
              { id: 'telegram-profile', label: 'Telegram bildirişləri', icon: 'M22 2L11 13m11-11-7 20-4-9-9-4 20-7z' },
              { id: 'solar-calculator', label: 'Solar Kalkulyator', icon: 'M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0l-1.414-1.414M7.05 7.05L5.636 5.636M12 8a4 4 0 100 8 4 4 0 000-8z' },
              { id: 'orders', label: 'Sifarişlər', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
            { id: 'requests', label: 'Müraciətlər', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
            { id: 'message-inbox', label: lang === 'en' ? 'Meta Messages' : 'Meta Mesajları', icon: 'M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4v8zM8 9h8M8 13h5' },
            { id: 'warehouse', label: 'Məhsullar', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
            { id: 'verification', label: 'Sənəd doğrulaması', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
            { id: 'permissions', label: 'İstifadəçilər Siyahısı', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
            { id: 'masters', label: 'Ustalar Klubu', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { id: 'customers', label: 'İstifadəçilər', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { id: 'settings', label: lang === 'en' ? 'System Settings' : 'Sistem Parametrləri', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
          ].filter((tab) => {
            if (!adminSession) return false;
            if (adminSession.isSuperAdmin) return true;
            if (tab.id === 'telegram-profile') return true;
            if (tab.id === 'human-resources') return Boolean(adminSession.canViewAccounting || adminSession.allowedPages.includes(AdminPage.Accounting));
            if (tab.id === 'verification') return false;
            if (tab.id === 'requests') {
              return [AdminPage.Requests, AdminPage.ServiceRequests, AdminPage.PartnershipRequests]
                .some((page) => adminSession.allowedPages.includes(page));
            }
            if (tab.id === 'settings') {
              return adminSession.allowedPages.includes(AdminPage.Settings) ||
                adminSession.allowedPages.includes(AdminPage.WhatsAppOnboarding);
            }
            const pageByTab: Record<string, AdminPage> = {
              stats: AdminPage.Stats, analytics: AdminPage.Analytics, 'project-tracker': AdminPage.ProjectTracker, 'execution-projects': AdminPage.ExecutionProjects, accounting: AdminPage.Accounting,
              'solar-calculator': AdminPage.SolarCalculator, orders: AdminPage.Orders, requests: AdminPage.Requests,
              warehouse: AdminPage.Warehouse, verification: AdminPage.Verification,
              permissions: AdminPage.Users, 'message-inbox': AdminPage.MessageInbox
            };
            return pageByTab[tab.id] !== undefined && adminSession.allowedPages.includes(pageByTab[tab.id]);
          }).map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'settings') {
                  const hasGeneralSettings = Boolean(adminSession?.isSuperAdmin || adminSession?.allowedPages.includes(AdminPage.Settings));
                  setSettingsView(hasGeneralSettings ? 'main' : 'whatsapp');
                  navigate(hasGeneralSettings ? '/admin-dashboard' : '/admin-dashboard/whatsapp-setup', { replace: true });
                } else if (isWhatsAppSetupPath) {
                  navigate('/admin-dashboard', { replace: true });
                }
                setIsMobileNavOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} /></svg>
                {tab.label}
              </div>
              {tab.id === 'orders' && orderUnreadCount > 0 && (
                <span className={`ml-3 rounded-full px-2 py-0.5 text-[8px] font-black ${activeTab === tab.id ? 'bg-white text-amber-600' : 'bg-amber-500 text-white'}`}>
                  {orderUnreadCount}
                </span>
              )}
              {tab.id === 'requests' && requestsUnreadCount > 0 && (
                <span className={`ml-3 rounded-full px-2 py-0.5 text-[8px] font-black ${activeTab === tab.id ? 'bg-white text-amber-600' : 'bg-amber-500 text-white'}`}>
                  {requestsUnreadCount}
                </span>
              )}
              {tab.id === 'message-inbox' && messageInboxUnreadCount > 0 && (
                <span className={`ml-3 rounded-full px-2 py-0.5 text-[8px] font-black ${activeTab === tab.id ? 'bg-white text-emerald-700' : 'bg-emerald-500 text-white'}`}>
                  {messageInboxUnreadCount}
                </span>
              )}
            </button>
          ))}
            </>
          )}
        </nav>

        <div className={`${isMobileNavOpen ? 'block' : 'hidden'} md:block p-6 border-t border-white/10`}>
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Ana Səhifəyə Qayıt
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-5 md:p-7 md:pt-10 relative">
        {activeTab === 'masters' && (
          <AdminMasters
            users={users}
            onUpdateUsers={setUsers}
            onSelectMaster={setSelectedMaster}
          />
        )}

        {activeTab === 'customers' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Ümumi Müştəri', val: customerRows.length, color: 'emerald' },
                { label: 'Sorğu Sayı', val: customerRequestCount, color: 'blue' },
                { label: 'Aktiv Sifarişlər', val: customerPendingOrders, color: 'amber' }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
                  <div className={`text-3xl font-black text-${stat.color}-600`}>{stat.val}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <h3 className="text-xl font-black text-slate-900">İstifadəçilər Siyahısı</h3>

                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                  <div className="relative flex-grow lg:flex-grow-0">
                    <input
                      type="text"
                      placeholder="Axtarış..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs outline-none focus:border-emerald-500 transition-all w-full lg:w-64"
                    />
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-8 py-4">Ad / Email</th>
                      <th className="px-8 py-4">Şəhər / Əlaqə</th>
                      <th className="px-8 py-4">Sifarişlər</th>
                      <th className="px-8 py-4">Aktiv / Sorğu</th>
                      <th className="px-8 py-4">Ümumi Alış-veriş</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4 text-right">Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {searchedCustomerRows.map((user: any) => (
                      <React.Fragment key={user.email}>
                        <tr className="group hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="text-sm font-black text-slate-900">{user.name}</div>
                            <div className="text-xs text-slate-400">{user.email}</div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-xs font-medium text-slate-600">{user.city || '-'}</span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-sm font-black text-slate-900">{user.orders.length}</span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full bg-amber-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-amber-700">
                                {user.pendingOrders} aktiv
                              </span>
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-blue-700">
                                {user.requestCount} sorğu
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-sm font-black text-emerald-600">{Number(user.totalSpent || 0).toLocaleString()} AZN</span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${user.isApproved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                              <span className="text-[10px] font-bold text-slate-600">
                                {user.isApproved ? 'Təsdiqlənib' : 'Gözləyir'}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setExpandedCustomerEmail((current) => current === user.email ? null : user.email)}
                                className="px-3 py-2 bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors text-[9px] font-black uppercase tracking-widest"
                              >
                                Bax
                              </button>
                              <button
                                onClick={() => handleBlock(user.email)}
                                className="p-2 bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                                title="Sil / Blokla"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedCustomerEmail === user.email && (
                          <tr>
                            <td colSpan={7} className="bg-slate-50 px-8 py-6">
                              <div className="grid gap-3">
                                {user.orders.slice(0, 8).map((order: any) => (
                                  <div key={order.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4">
                                    <div>
                                      <div className="text-xs font-black text-slate-900">#{order.orderNumber || order.id}</div>
                                      <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        {order.createdAt ? new Date(order.createdAt).toLocaleString('az-AZ') : '-'}
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-600">{orderIntentLabel(order.intent)}</span>
                                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-700">{orderStatusLabel(order.status)}</span>
                                    </div>
                                    <div className="text-sm font-black text-slate-900">{Number(order.finalTotal || 0).toLocaleString()} AZN</div>
                                  </div>
                                ))}
                                {user.orders.length === 0 && (
                                  <div className="rounded-2xl bg-white p-6 text-center text-xs font-bold text-slate-400">Bu istifadəçiyə bağlı sifariş tapılmadı.</div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {searchedCustomerRows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-8 py-16 text-center text-xs font-bold text-slate-400">İstifadəçi tapılmadı.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && <AdminStats users={users} />}

        {activeTab === 'analytics' && <AdminAnalytics lang={lang} orders={adminOrders} onOpenAdminUser={(id) => { setActivityUserId(id); setActiveTab('permissions'); }} />}

        {activeTab === 'project-tracker' && <AdminProjectTracker lang={lang} />}
        {activeTab === 'execution-projects' && <AdminExecutionProjects adminSession={adminSession} />}
        {activeTab === 'accounting' && <AdminAccounting />}
        {activeTab === 'human-resources' && adminSession && (adminSession.isSuperAdmin || adminSession.canViewAccounting || adminSession.allowedPages.includes(AdminPage.Accounting)) && <AdminHumanResources />}
        {activeTab === 'telegram-profile' && <AdminTelegramProfile />}

        {activeTab === 'solar-calculator' && <AdminSolarCalculator lang={lang} />}

        {activeTab === 'orders' && (
          <AdminOrders
            unreadCount={orderUnreadCount}
            onOrderViewed={() => setOrderUnreadCount((count) => Math.max(0, count - 1))}
          />
        )}

        {activeTab === 'requests' && <AdminInquiries adminSession={adminSession} onUnreadCountChange={setRequestsUnreadCount} />}

        {activeTab === 'message-inbox' && <AdminMessageInbox lang={lang} />}

        {activeTab === 'warehouse' && <ProductProvider><PromotionProvider><CategoryProvider><AdminWarehouse /></CategoryProvider></PromotionProvider></ProductProvider>}

        {activeTab === 'permissions' && adminSession && (adminSession.isSuperAdmin || adminSession.allowedPages.includes(AdminPage.Users)) && <AdminUsers adminSession={adminSession} openActivityUserId={activityUserId} onActivityOpened={() => setActivityUserId(null)} />}
        {activeTab === 'verification' && <AdminVerification />}

        {/* Master Details Modal */}
        {selectedMaster && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Usta Məlumatları</h3>
                <button onClick={() => setSelectedMaster(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ad Soyad</div>
                    <div className="text-sm font-bold text-slate-900">{selectedMaster.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</div>
                    <div className="text-sm font-bold text-slate-900">{selectedMaster.email}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Şəhər</div>
                    <div className="text-sm font-bold text-slate-900">{selectedMaster.city}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ustalığın tipi</div>
                    <div className="text-sm font-bold text-slate-900">{selectedMaster.masterType}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reytinq</div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-yellow-500 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-bold text-slate-900">5.0</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Təsdiqedici Sənəd</div>
                  {selectedMaster.documentImage ? (
                    <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50">
                      <img src={selectedMaster.documentImage} alt="Document" className="w-full h-48 object-contain" />
                    </div>
                  ) : (
                    <div className="p-8 bg-slate-50 rounded-2xl text-center text-slate-400 text-xs italic">Sənəd yüklənməyib</div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  {!selectedMaster.isApproved && (
                    <button
                      onClick={() => handleApprove(selectedMaster.email)}
                      className="flex-grow bg-emerald-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all"
                    >
                      Təsdiqlə
                    </button>
                  )}
                  <button
                    onClick={() => handleBlock(selectedMaster.email)}
                    className="flex-grow bg-red-50 text-red-600 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-100 transition-all"
                  >
                    İmtina et / Sil
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {settingsView === 'main' ? (
              <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl">
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">Sistem Parametrləri</h3>
                    <p className="text-slate-500">Saytın qlobal tənzimləmələri və idarəetmə keçidləri</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {canManageWhatsApp && <button
                    onClick={() => { setSettingsView('whatsapp'); navigate('/admin-dashboard/whatsapp-setup'); }}
                    className="group p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-left hover:bg-[#25D366] transition-all duration-500"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#168c43] mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 11.5a8.38 8.38 0 01-.9 3.8A8.5 8.5 0 1112.5 3a8.38 8.38 0 013.8.9L21 3l-.9 4.7a8.38 8.38 0 01.9 3.8zM8 12h.01M12 12h.01M16 12h.01" /></svg>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-white mb-2">{lang === 'en' ? 'WhatsApp Connection' : 'WhatsApp Bağlantısı'}</h4>
                    <p className="text-xs text-slate-500 group-hover:text-emerald-50 leading-relaxed">{lang === 'en' ? 'Connect the WhatsApp Business mobile app to Cloud API and the Volt Meta Inbox.' : 'WhatsApp Business mobil tətbiqini Cloud API və Volt Meta Inbox ilə qoşun.'}</p>
                  </button>}
                  <button 
                    onClick={() => setSettingsView('sliders')}
                    className="group p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-left hover:bg-emerald-600 transition-all duration-500"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-white mb-2">Slider İdarəetməsi</h4>
                    <p className="text-xs text-slate-500 group-hover:text-emerald-100 leading-relaxed">Hero və yan sliderlərin məzmununu, şəkillərini və keçidlərini buradan idarə edin.</p>
                  </button>
                  <button
                    onClick={() => setSettingsView('contact')}
                    className="group p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-left hover:bg-emerald-600 transition-all duration-500"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-white mb-2">Əlaqə İdarəetməsi</h4>
                    <p className="text-xs text-slate-500 group-hover:text-emerald-100 leading-relaxed">Əlaqələrin 4 dildə idarə edilməsi.</p>
                  </button>

                  <button
                    onClick={() => setSettingsView('projects')}
                    className="group p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-left hover:bg-emerald-600 transition-all duration-500"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-white mb-2">Layihələrin İdarəedilməsi</h4>
                    <p className="text-xs text-slate-500 group-hover:text-emerald-100 leading-relaxed">Layihələr bölməsini, texniki parametrləri və portfolionu 4 dildə idarə edin.</p>
                  </button>

                  <button
                    onClick={() => setSettingsView('blogs')}
                    className="group p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-left hover:bg-emerald-600 transition-all duration-500"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-white mb-2">Blog İdarəetməsi</h4>
                    <p className="text-xs text-slate-500 group-hover:text-emerald-100 leading-relaxed">Blog yazılarını 4 dildə idarə edin.</p>
                  </button>

                  <button
                    onClick={() => setSettingsView('news')}
                    className="group p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-left hover:bg-emerald-600 transition-all duration-500"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-white mb-2">Xəbərlərin İdarəedilməsi</h4>
                    <p className="text-xs text-slate-500 group-hover:text-emerald-100 leading-relaxed">Xəbərlər və yeniliklər bölməsini, rəsmi mənbələri 4 dildə idarə edin.</p>
                  </button>

                  <button
                    onClick={() => setSettingsView('about')}
                    className="group p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-left hover:bg-emerald-600 transition-all duration-500"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-white mb-2">Haqqımızda</h4>
                    <p className="text-xs text-slate-500 group-hover:text-emerald-100 leading-relaxed">Haqqımızda bölməsini, rəsmi mənbələri 4 dildə idarə edin.</p>
                  </button>

                  <button
                    onClick={() => setSettingsView('categories')}
                    className="group p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-left hover:bg-emerald-600 transition-all duration-500"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-white mb-2">Kateqoriya İdarəetməsi</h4>
                    <p className="text-xs text-slate-500 group-hover:text-emerald-100 leading-relaxed">Məhsul alt-kateqoriyalarını, markaları və texnologiyaları idarə edin.</p>
                  </button>

                  <button
                    onClick={() => setSettingsView('promotion')}
                    className="group p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-left hover:bg-emerald-600 transition-all duration-500"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-white mb-2">Promosiyalar</h4>
                    <p className="text-xs text-slate-500 group-hover:text-emerald-100 leading-relaxed">Promosiyaları əlavə, redaktə və silin.</p>
                  </button>

                  <button
                    onClick={() => setSettingsView('service')}
                    className="group p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-left hover:bg-emerald-600 transition-all duration-500"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-white mb-2">Xidmətlər və Səhifələr</h4>
                    <p className="text-xs text-slate-500 group-hover:text-emerald-100 leading-relaxed">Xidmət kartlarını, xüsusi URL-li səhifələri, bannerləri və zəngin məzmunu 4 dildə idarə edin.</p>
                  </button>

                  <button
                    onClick={() => setSettingsView('email')}
                    className="group p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-left hover:bg-emerald-600 transition-all duration-500"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>

                    <h4 className="text-lg font-black text-slate-900 group-hover:text-white mb-2">
                      Email Tənzimləmələri
                    </h4>

                    <p className="text-xs text-slate-500 group-hover:text-emerald-100 leading-relaxed">
                      Bildirişlərin və avtomatik e-maillərin idarə edilməsi.
                    </p>
                  </button>

                   <button
                    onClick={() => setSettingsView('partnership')}
                    className="group p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-left hover:bg-emerald-600 transition-all duration-500"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-white mb-2">Tərəfdaşlıq Tənzimləməri</h4>
                    <p className="text-xs text-slate-500 group-hover:text-emerald-100 leading-relaxed">Tərəfdaşlıq müraciətlərini 4 dildə idarə edin.</p>
                  </button>


                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 opacity-50 cursor-not-allowed">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 mb-6">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mb-2">Ödəniş Metodları</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Tezliklə: Onlayn ödəniş sistemlərinin inteqrasiyası.</p>
                  </div>
                </div>
              </div>
            ) : settingsView === 'sliders' ? (
              <div className="space-y-6">
                <button
                  onClick={() => setSettingsView('main')}
                  className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors font-black text-[10px] uppercase tracking-widest mb-4"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                  Ayarlara Qayıt
                </button>
                <AdminSliders />
              </div>
            ) : settingsView === 'whatsapp' ? (
              canManageWhatsApp
                ? <AdminWhatsAppSetup lang={lang} onBack={() => {
                    const hasGeneralSettings = Boolean(adminSession?.isSuperAdmin || adminSession?.allowedPages.includes(AdminPage.Settings));
                    if (hasGeneralSettings) {
                      setSettingsView('main');
                    } else if (adminSession?.allowedPages.includes(AdminPage.MessageInbox)) {
                      setActiveTab('message-inbox');
                    } else {
                      onBack();
                    }
                    navigate('/admin-dashboard');
                  }} />
                : <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-sm font-bold text-slate-400">Bu səhifə üçün WhatsApp bağlantısı icazəsi tələb olunur.</div>
            ) : settingsView === 'contact' ? (
              <div className="space-y-6">
                <ContactProvider>
                  <AdminContact onBack={() => setSettingsView('main')} />
                </ContactProvider>
              </div>
            ) : settingsView === 'service' ? (
              <div className="space-y-6">
                <ServiceProvider>
                  <AdminServices onBack={() => setSettingsView('main')} />
                </ServiceProvider>
              </div>
            ) : settingsView === 'projects' ? (
              <div className="space-y-6">
                <ProjectProvider>
                  <AdminProjects onBack={() => setSettingsView('main')} />
                </ProjectProvider>
              </div>
            ) : settingsView === 'blogs' ? (
              <div className="space-y-6">
                <BlogProvider>
                  <AdminBlogs onBack={() => setSettingsView('main')} />
                </BlogProvider>
              </div>
            ) : settingsView === 'news' ? (
              <div className="space-y-6">
                <NewsProvider>
                  <AdminNews onBack={() => setSettingsView('main')} />
                </NewsProvider>
              </div>
            ) : settingsView === 'promotion' ? (
              <div className="space-y-6">
                <button
                  onClick={() => setSettingsView('main')}
                  className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors font-black text-[10px] uppercase tracking-widest mb-4"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                  Ayarlara Qayıt
                </button>
                <PromotionProvider>
                  <AdminPromotion onBack={() => setSettingsView('main')} />
                </PromotionProvider>
              </div>
            ) : settingsView === 'email' ? (
              <div className="space-y-6">
                <button
                  onClick={() => setSettingsView('main')}
                  className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors font-black text-[10px] uppercase tracking-widest mb-4"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                  Ayarlara Qayıt
                </button>
                <EmailProvider>
                  <AdminEmail onBack={() => setSettingsView('main')} />
                </EmailProvider>
              </div>
            ) : settingsView === 'about' ? (
              <div className="space-y-6">
                <AboutProvider>
                  <AdminAbout onBack={() => setSettingsView('main')} />
                </AboutProvider>
              </div>
            ) : settingsView === 'partnership' ? (
              <div className="space-y-6">
                  <PartnershipProvider>
                    <AdminPartnershipDirections onBack={() => setSettingsView('main')} />
                  </PartnershipProvider>
              </div>
            ) : settingsView === 'categories' ? (
              <div className="space-y-6">
                <button
                  onClick={() => setSettingsView('main')}
                  className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors font-black text-[10px] uppercase tracking-widest mb-4"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                  Ayarlara Qayıt
                </button>
                <CategoryProvider>
                  <AdminCategoryManagement />
                </CategoryProvider>
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
