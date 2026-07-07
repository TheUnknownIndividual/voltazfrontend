import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, FileText, MousePointerClick, RefreshCw, SunMedium } from 'lucide-react';
import { getSolarAnalyticsDashboard, type SolarAnalyticsDashboard } from '../api/solarAnalytics';

type AdminLang = 'az' | 'en' | 'ru' | 'tr';

interface AdminAnalyticsProps {
  lang?: AdminLang;
  orders?: any[];
}

interface StoredProject {
  id: string;
  createdAt: string;
}

const PROJECT_STORAGE_KEY = 'volt_admin_project_tracker_v1';

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

const getLocale = (lang: AdminLang) => (lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'az-AZ');

const formatDateTime = (value: string, lang: AdminLang) =>
  new Date(value).toLocaleString(getLocale(lang), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

const sameDate = (value: string | undefined, date: string) => {
  if (!value) return false;
  return new Date(value).toISOString().slice(0, 10) === date;
};

const readStoredProjects = (): StoredProject[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const copy = {
  az: {
    eyebrow: 'Solar analytics',
    title: 'Kalkulyator analitikası',
    subtitle: 'Admin ixracları, WEB hesablamaları, WhatsApp klikləri və sənəd nömrələndirməsi üzrə real DB statistikası.',
    from: 'Başlanğıc',
    to: 'Son',
    refresh: 'Yenilə',
    totalCalculations: 'Ümumi hesablamalar',
    webCalculations: 'WEB hesablamalar',
    adminExports: 'Admin ixracları',
    whatsappClicks: 'WhatsApp klikləri',
    documents: 'Sənədlər',
    uniqueProjects: 'Unikal layihələr',
    daily: 'Günlük hərəkət',
    days: 'gün',
    movement: 'hərəkət',
    calculations: 'Hesab',
    docs: 'Sənəd',
    whatsapp: 'WA',
    projects: 'Layihə',
    orders: 'Sifariş',
    documentCodes: 'Sənəd kodları',
    noDocs: 'Hələ sənəd yoxdur.',
    sources: 'Mənbələr',
    topProjects: 'Top layihələr',
    project: 'Layihə',
    calculationCount: 'Hesab',
    documentCount: 'Sənəd',
    lastActivity: 'Son aktivlik',
    recentActivity: 'Son fəaliyyət',
    noActivity: 'Hələ fəaliyyət yoxdur.',
    loadError: 'Analytics məlumatları yüklənmədi.',
  },
  en: {
    eyebrow: 'Solar analytics',
    title: 'Calculator analytics',
    subtitle: 'Live database statistics for admin exports, web calculations, WhatsApp clicks, and document numbering.',
    from: 'From',
    to: 'To',
    refresh: 'Refresh',
    totalCalculations: 'Total calculations',
    webCalculations: 'Web calculations',
    adminExports: 'Admin exports',
    whatsappClicks: 'WhatsApp clicks',
    documents: 'Documents',
    uniqueProjects: 'Unique projects',
    daily: 'Daily movement',
    days: 'days',
    movement: 'actions',
    calculations: 'Calc',
    docs: 'Docs',
    whatsapp: 'WA',
    projects: 'Projects',
    orders: 'Orders',
    documentCodes: 'Document codes',
    noDocs: 'No documents yet.',
    sources: 'Sources',
    topProjects: 'Top projects',
    project: 'Project',
    calculationCount: 'Calc',
    documentCount: 'Docs',
    lastActivity: 'Last activity',
    recentActivity: 'Recent activity',
    noActivity: 'No activity yet.',
    loadError: 'Analytics data could not be loaded.',
  },
  ru: {
    eyebrow: 'Solar analytics',
    title: 'Аналитика калькулятора',
    subtitle: 'Статистика из базы по экспортам администратора, WEB-расчетам, кликам WhatsApp и нумерации документов.',
    from: 'Начало',
    to: 'Конец',
    refresh: 'Обновить',
    totalCalculations: 'Всего расчетов',
    webCalculations: 'WEB-расчеты',
    adminExports: 'Экспорт админа',
    whatsappClicks: 'Клики WhatsApp',
    documents: 'Документы',
    uniqueProjects: 'Уникальные проекты',
    daily: 'Движение по дням',
    days: 'дней',
    movement: 'действий',
    calculations: 'Расчет',
    docs: 'Док.',
    whatsapp: 'WA',
    projects: 'Проекты',
    orders: 'Заказы',
    documentCodes: 'Коды документов',
    noDocs: 'Документов пока нет.',
    sources: 'Источники',
    topProjects: 'Топ проекты',
    project: 'Проект',
    calculationCount: 'Расчет',
    documentCount: 'Док.',
    lastActivity: 'Активность',
    recentActivity: 'Последняя активность',
    noActivity: 'Активности пока нет.',
    loadError: 'Не удалось загрузить аналитику.',
  },
};

const eventLabels = {
  az: {
    ADMIN_DOCX_EXPORT: 'DOCX ixracı',
    ADMIN_PDF_EXPORT: 'PDF ixracı',
    WEB_CALCULATION: 'WEB hesablama',
    WEB_WHATSAPP_CLICK: 'WhatsApp klik',
  },
  en: {
    ADMIN_DOCX_EXPORT: 'DOCX export',
    ADMIN_PDF_EXPORT: 'PDF export',
    WEB_CALCULATION: 'Web calculation',
    WEB_WHATSAPP_CLICK: 'WhatsApp click',
  },
  ru: {
    ADMIN_DOCX_EXPORT: 'Экспорт DOCX',
    ADMIN_PDF_EXPORT: 'Экспорт PDF',
    WEB_CALCULATION: 'WEB-расчет',
    WEB_WHATSAPP_CLICK: 'Клик WhatsApp',
  },
};

const documentCodeLabels = {
  az: {
    CP: 'Kommersiya Təklifi',
    QUO: 'Qiymət Təklifi',
    INV: 'Hesab-faktura',
    PI: 'Proforma Invoice',
    CTR: 'Müqavilə',
    AGR: 'Razılaşma',
    PO: 'Satınalma Sifarişi',
    SO: 'Satış Sifarişi',
    BOQ: 'Bill of Quantities',
    PRJ: 'Layihə',
    DRW: 'Çertyoj / Layihə Rəsmi',
    REP: 'Hesabat',
    ACT: 'Təhvil-Təslim Aktı',
    LET: 'Rəsmi Məktub',
    MEM: 'Xidmət Qeydi',
    SPEC: 'Texniki Spesifikasiya',
    CAL: 'Hesablama',
  },
  en: {
    CP: 'Commercial Proposal',
    QUO: 'Quotation',
    INV: 'Invoice',
    PI: 'Proforma Invoice',
    CTR: 'Contract',
    AGR: 'Agreement',
    PO: 'Purchase Order',
    SO: 'Sales Order',
    BOQ: 'Bill of Quantities',
    PRJ: 'Project',
    DRW: 'Drawing / Project Drawing',
    REP: 'Report',
    ACT: 'Handover Act',
    LET: 'Official Letter',
    MEM: 'Service Memo',
    SPEC: 'Technical Specification',
    CAL: 'Calculation',
  },
  ru: {
    CP: 'Коммерческое предложение',
    QUO: 'Ценовое предложение',
    INV: 'Счет-фактура',
    PI: 'Проформа-инвойс',
    CTR: 'Договор',
    AGR: 'Соглашение',
    PO: 'Заказ на закупку',
    SO: 'Заказ продажи',
    BOQ: 'Ведомость объемов',
    PRJ: 'Проект',
    DRW: 'Чертеж / Проектный чертеж',
    REP: 'Отчет',
    ACT: 'Акт приема-передачи',
    LET: 'Официальное письмо',
    MEM: 'Служебная записка',
    SPEC: 'Техническая спецификация',
    CAL: 'Расчет',
  },
};

const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ lang = 'az', orders = [] }) => {
  const uiLang = lang === 'tr' ? 'az' : lang;
  const t = copy[uiLang] || copy.az;
  const today = useMemo(() => new Date(), []);
  const [from, setFrom] = useState(formatDateInput(new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000)));
  const [to, setTo] = useState(formatDateInput(today));
  const [dashboard, setDashboard] = useState<SolarAnalyticsDashboard | null>(null);
  const [storedProjects, setStoredProjects] = useState<StoredProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoverDay, setHoverDay] = useState<string | null>(null);
  const [pinnedDay, setPinnedDay] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    setStoredProjects(readStoredProjects());

    try {
      const data = await getSolarAnalyticsDashboard(from, to);
      setDashboard(data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.details || err?.message || t.loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const summaryCards = dashboard ? [
    { label: t.totalCalculations, value: dashboard.summary.totalCalculations, icon: BarChart3, color: 'text-slate-900' },
    { label: t.webCalculations, value: dashboard.summary.webCalculations, icon: SunMedium, color: 'text-emerald-600' },
    { label: t.adminExports, value: dashboard.summary.adminExports, icon: FileText, color: 'text-blue-600' },
    { label: t.whatsappClicks, value: dashboard.summary.whatsappClicks, icon: MousePointerClick, color: 'text-amber-600' },
    { label: t.documents, value: dashboard.summary.documentsIssued, icon: FileText, color: 'text-purple-600' },
    { label: t.uniqueProjects, value: dashboard.summary.uniqueProjects, icon: BarChart3, color: 'text-rose-600' }
  ] : [];

  const dailyPoints = useMemo(() => (dashboard?.timeSeries || []).map((point) => {
    const projectCount = storedProjects.filter((project) => sameDate(project.createdAt, point.date)).length;
    const orderCount = orders.filter((order) => sameDate(order.createdAt, point.date)).length;
    const total = point.calculations + point.documents + point.whatsappClicks + projectCount + orderCount;
    return { ...point, projectCount, orderCount, total };
  }), [dashboard?.timeSeries, orders, storedProjects]);

  const maxDailyTotal = Math.max(1, ...dailyPoints.map((point) => point.total));
  const activeDay = hoverDay || pinnedDay;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">{t.eyebrow}</div>
          <h3 className="text-2xl font-black text-slate-900 md:text-3xl">{t.title}</h3>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-500">{t.subtitle}</p>
        </div>
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
          <div>
            <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-slate-400">{t.from}</label>
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-black text-slate-700 outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-slate-400">{t.to}</label>
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-black text-slate-700 outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            {t.refresh}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-5 text-sm font-bold text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50">
                <Icon className={`h-5 w-5 ${card.color}`} aria-hidden="true" />
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{card.label}</div>
              <div className={`mt-2 text-3xl font-black ${card.color}`}>{card.value.toLocaleString(getLocale(uiLang))}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h4 className="text-lg font-black text-slate-900">{t.daily}</h4>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
              {dailyPoints.length} {t.days}
            </span>
          </div>
          <div className="flex min-h-72 items-end gap-2 overflow-x-auto rounded-3xl bg-slate-50 px-4 pb-10 pt-8">
            {dailyPoints.map((point) => {
              const height = Math.max(8, (point.total / maxDailyTotal) * 210);
              const isActive = activeDay === point.date;
              return (
                <div
                  key={point.date}
                  className="relative flex min-w-12 flex-1 flex-col items-center justify-end"
                  onMouseEnter={() => setHoverDay(point.date)}
                  onMouseLeave={() => setHoverDay(null)}
                >
                  {isActive && (
                    <div className="absolute bottom-[calc(100%+0.75rem)] z-10 w-56 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-xl">
                      <div className="mb-3 text-xs font-black text-slate-900">{point.date}</div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span>{t.calculations}: {point.calculations}</span>
                        <span>{t.docs}: {point.documents}</span>
                        <span>{t.whatsapp}: {point.whatsappClicks}</span>
                        <span>{t.projects}: {point.projectCount}</span>
                        <span>{t.orders}: {point.orderCount}</span>
                        <span>{t.movement}: {point.total}</span>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setPinnedDay((current) => current === point.date ? null : point.date)}
                    className={`w-full max-w-12 rounded-t-2xl transition-all ${isActive ? 'bg-emerald-600 shadow-lg shadow-emerald-100' : 'bg-slate-300 hover:bg-emerald-500'}`}
                    style={{ height }}
                    aria-label={`${point.date}: ${point.total}`}
                  />
                  <div className="mt-2 w-14 truncate text-center text-[9px] font-black text-slate-400">
                    {point.date.slice(5)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
            <h4 className="mb-4 text-lg font-black text-slate-900">{t.documentCodes}</h4>
            <div className="space-y-2">
              {(dashboard?.documentsByCode || []).map((item) => (
                <div key={item.key} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-black text-slate-700">{item.key}</span>
                    <span className="text-sm font-black text-emerald-600">{item.count}</span>
                  </div>
                  <div className="mt-1 text-[10px] font-semibold text-slate-400">
                    {documentCodeLabels[uiLang]?.[item.key as keyof typeof documentCodeLabels.az] || item.key}
                  </div>
                </div>
              ))}
              {dashboard?.documentsByCode.length === 0 && <div className="text-xs font-bold text-slate-400">{t.noDocs}</div>}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
            <h4 className="mb-4 text-lg font-black text-slate-900">{t.sources}</h4>
            <div className="space-y-2">
              {(dashboard?.sourceBreakdown || []).map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-xs font-black text-slate-700">{item.key}</span>
                  <span className="text-sm font-black text-blue-600">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-50 p-6">
            <h4 className="text-lg font-black text-slate-900">{t.topProjects}</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-6 py-4">{t.project}</th>
                  <th className="px-6 py-4">{t.calculationCount}</th>
                  <th className="px-6 py-4">{t.documentCount}</th>
                  <th className="px-6 py-4">{t.lastActivity}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(dashboard?.topProjects || []).map((project) => (
                  <tr key={project.projectId}>
                    <td className="px-6 py-4 text-sm font-black text-slate-900">{project.projectName}</td>
                    <td className="px-6 py-4 text-xs font-black text-slate-600">{project.calculationCount}</td>
                    <td className="px-6 py-4 text-xs font-black text-slate-600">{project.documentCount}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-400">{formatDateTime(project.lastActivityAt, uiLang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-50 p-6">
            <h4 className="text-lg font-black text-slate-900">{t.recentActivity}</h4>
          </div>
          <div className="divide-y divide-slate-50">
            {(dashboard?.recentActivity || []).map((activity, index) => (
              <div key={`${activity.createdAt}-${index}`} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-black text-slate-900">
                      {activity.documentNumber || eventLabels[uiLang]?.[activity.eventType as keyof typeof eventLabels.az] || activity.eventType}
                    </div>
                    <div className="mt-1 text-xs font-bold text-slate-400">{activity.projectName || activity.source}</div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
                    {activity.documentCode || activity.source}
                  </span>
                </div>
                <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{formatDateTime(activity.createdAt, uiLang)}</div>
              </div>
            ))}
            {dashboard?.recentActivity.length === 0 && <div className="p-6 text-xs font-bold text-slate-400">{t.noActivity}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
