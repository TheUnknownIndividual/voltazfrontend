import React, { useEffect, useMemo, useState } from 'react';
import { FileText, MapPin, Plus, Upload, Wallet, X, Zap } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

type AdminLang = 'az' | 'en' | 'ru' | 'tr';
type ProjectStatus = 'Sent' | 'Awaiting Payment' | 'Paid' | 'Icra olunur' | 'Completed' | 'Cancelled';
type LandType = 'roof' | 'ground';

interface TrackedProject {
  id: string;
  name: string;
  stationPowerKw?: number;
  landType?: LandType;
  location?: string;
  offerPrice?: number;
  description?: string;
  status: ProjectStatus;
  docName?: string;
  docDataUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminProjectTrackerProps {
  lang?: AdminLang;
}

const STORAGE_KEY = 'volt_admin_project_tracker_v1';
const ROOF_PRICE_PER_KW = 850;
const GROUND_PRICE_PER_KW = 1100;

const statusOptions: ProjectStatus[] = ['Sent', 'Awaiting Payment', 'Paid', 'Icra olunur', 'Completed', 'Cancelled'];

const statusClass: Record<ProjectStatus, string> = {
  Sent: 'bg-blue-50 text-blue-700',
  'Awaiting Payment': 'bg-amber-50 text-amber-700',
  Paid: 'bg-emerald-50 text-emerald-700',
  'Icra olunur': 'bg-purple-50 text-purple-700',
  Completed: 'bg-slate-900 text-white',
  Cancelled: 'bg-red-50 text-red-700',
};

const copy = {
  az: {
    eyebrow: 'Project tracker',
    title: 'Layihələr',
    addProject: 'Layihə əlavə et',
    projectName: 'Project Name',
    power: 'Stansiyanın Gücü (kW)',
    landType: 'Ərazi növü',
    roof: 'Dam sahəsi',
    ground: 'Yer örtüyü',
    location: 'Ərazi (Coğrafi yerləşmə)',
    offerPrice: 'Cəmi Təklif Qiyməti',
    description: 'Qısa təsvir',
    status: 'Status',
    upload: 'DOCX yüklə',
    save: 'Yadda saxla',
    cancel: 'Bağla',
    empty: 'Hələ layihə əlavə edilməyib.',
    noDescription: 'Təsvir əlavə edilməyib.',
    created: 'Layihə əlavə edildi.',
    updated: 'Status yeniləndi.',
    unit: 'AZN',
    kw: 'kW',
    file: 'Sənəd',
    priceBasis: 'Qiymət solar kalkulyatordakı montaj tarifinə görə hesablanır.',
  },
  en: {
    eyebrow: 'Project tracker',
    title: 'Projects',
    addProject: 'Add project',
    projectName: 'Project Name',
    power: 'Station Power (kW)',
    landType: 'Area type',
    roof: 'Roof area',
    ground: 'Ground mount',
    location: 'Area (Geographic location)',
    offerPrice: 'Total Offer Price',
    description: 'Short description',
    status: 'Status',
    upload: 'Upload DOCX',
    save: 'Save',
    cancel: 'Close',
    empty: 'No projects added yet.',
    noDescription: 'No description added.',
    created: 'Project added.',
    updated: 'Status updated.',
    unit: 'AZN',
    kw: 'kW',
    file: 'Document',
    priceBasis: 'Price is calculated from the mounting tariff used in the solar calculator.',
  },
  ru: {
    eyebrow: 'Project tracker',
    title: 'Проекты',
    addProject: 'Добавить проект',
    projectName: 'Название проекта',
    power: 'Мощность станции (кВт)',
    landType: 'Тип площадки',
    roof: 'Площадь крыши',
    ground: 'Наземная площадка',
    location: 'Территория (геолокация)',
    offerPrice: 'Итоговая цена предложения',
    description: 'Краткое описание',
    status: 'Статус',
    upload: 'Загрузить DOCX',
    save: 'Сохранить',
    cancel: 'Закрыть',
    empty: 'Проекты пока не добавлены.',
    noDescription: 'Описание не добавлено.',
    created: 'Проект добавлен.',
    updated: 'Статус обновлен.',
    unit: 'AZN',
    kw: 'кВт',
    file: 'Документ',
    priceBasis: 'Цена рассчитывается по монтажному тарифу из solar-калькулятора.',
  },
};

const readProjects = (): TrackedProject[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const toNumber = (value: string) => Number(String(value).replace(',', '.')) || 0;

const AdminProjectTracker: React.FC<AdminProjectTrackerProps> = ({ lang = 'az' }) => {
  const t = copy[lang === 'tr' ? 'az' : lang] || copy.az;
  const { showNotification } = useNotification();
  const [projects, setProjects] = useState<TrackedProject[]>(() => readProjects());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [stationPowerKw, setStationPowerKw] = useState('');
  const [landType, setLandType] = useState<LandType>('roof');
  const [location, setLocation] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerTouched, setOfferTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Sent');
  const [docFile, setDocFile] = useState<File | null>(null);

  const calculatedOffer = useMemo(() => {
    const pricePerKw = landType === 'ground' ? GROUND_PRICE_PER_KW : ROOF_PRICE_PER_KW;
    return Math.round(toNumber(stationPowerKw) * pricePerKw);
  }, [landType, stationPowerKw]);

  useEffect(() => {
    if (!offerTouched) {
      setOfferPrice(calculatedOffer ? String(calculatedOffer) : '');
    }
  }, [calculatedOffer, offerTouched]);

  const resetForm = () => {
    setName('');
    setStationPowerKw('');
    setLandType('roof');
    setLocation('');
    setOfferPrice('');
    setOfferTouched(false);
    setDescription('');
    setStatus('Sent');
    setDocFile(null);
  };

  const saveProjects = (nextProjects: TrackedProject[]) => {
    setProjects(nextProjects);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProjects));
  };

  const statusCounts = useMemo(() => statusOptions.map((item) => ({
    status: item,
    count: projects.filter((project) => project.status === item).length,
  })), [projects]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    const docDataUrl = docFile ? await fileToDataUrl(docFile) : undefined;
    const now = new Date().toISOString();
    const nextProject: TrackedProject = {
      id: crypto.randomUUID(),
      name: name.trim(),
      stationPowerKw: toNumber(stationPowerKw),
      landType,
      location: location.trim(),
      offerPrice: toNumber(offerPrice),
      description: description.trim(),
      status,
      docName: docFile?.name,
      docDataUrl,
      createdAt: now,
      updatedAt: now,
    };

    saveProjects([nextProject, ...projects]);
    resetForm();
    setIsModalOpen(false);
    showNotification(t.created);
  };

  const updateStatus = (projectId: string, nextStatus: ProjectStatus) => {
    saveProjects(projects.map((project) => project.id === projectId
      ? { ...project, status: nextStatus, updatedAt: new Date().toISOString() }
      : project));
    showNotification(t.updated, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">{t.eyebrow}</div>
          <h3 className="text-2xl font-black text-slate-900 md:text-3xl">{t.title}</h3>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-emerald-600"
        >
          <Plus className="h-4 w-4" />
          {t.addProject}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusCounts.map((item) => (
          <div key={item.status} className="shrink-0 rounded-full border border-slate-100 bg-white px-4 py-2 shadow-sm">
            <span className={`mr-2 rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-widest ${statusClass[item.status]}`}>{item.status}</span>
            <span className="text-xs font-black text-slate-700">{item.count}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => {
          const isExpanded = expandedId === project.id;
          const price = Number(project.offerPrice || 0);
          return (
            <article key={project.id} className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm">
              <button
                type="button"
                onClick={() => setExpandedId((current) => current === project.id ? null : project.id)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-base font-black text-slate-900">{project.name}</h4>
                    <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {new Date(project.createdAt).toLocaleString(lang === 'ru' ? 'ru-RU' : 'az-AZ')}
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${statusClass[project.status]}`}>{project.status}</span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <Zap className="mb-2 h-4 w-4 text-emerald-600" />
                    <div className="text-sm font-black text-slate-900">{project.stationPowerKw || 0}</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t.kw}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <MapPin className="mb-2 h-4 w-4 text-blue-600" />
                    <div className="truncate text-sm font-black text-slate-900">{project.landType === 'ground' ? t.ground : t.roof}</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{project.location || '-'}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <Wallet className="mb-2 h-4 w-4 text-amber-600" />
                    <div className="text-sm font-black text-slate-900">{price.toLocaleString()}</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t.unit}</div>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="mt-4 space-y-4 border-t border-slate-50 pt-4">
                  <p className="text-sm font-semibold leading-7 text-slate-600">{project.description || t.noDescription}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={project.status}
                      onChange={(event) => updateStatus(project.id, event.target.value as ProjectStatus)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black outline-none focus:border-emerald-500"
                    >
                      {statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                    {project.docDataUrl && (
                      <a
                        href={project.docDataUrl}
                        download={project.docName || `${project.name}.docx`}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white"
                      >
                        <FileText className="h-4 w-4" />
                        {t.file}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-16 text-center text-xs font-bold text-slate-400">
          {t.empty}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <h4 className="text-lg font-black text-slate-900">{t.addProject}</h4>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.projectName}</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                  required
                />
              </label>

              <label>
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.power}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={stationPowerKw}
                  onChange={(event) => setStationPowerKw(event.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                />
              </label>

              <label>
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.landType}</span>
                <select
                  value={landType}
                  onChange={(event) => setLandType(event.target.value as LandType)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                >
                  <option value="roof">{t.roof} - {ROOF_PRICE_PER_KW} {t.unit}/{t.kw}</option>
                  <option value="ground">{t.ground} - {GROUND_PRICE_PER_KW} {t.unit}/{t.kw}</option>
                </select>
              </label>

              <label>
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.location}</span>
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                />
              </label>

              <label>
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.offerPrice}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={offerPrice}
                  onChange={(event) => {
                    setOfferTouched(true);
                    setOfferPrice(event.target.value);
                  }}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                />
                <span className="mt-2 block text-[10px] font-semibold text-slate-400">{t.priceBasis}</span>
              </label>

              <label>
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.status}</span>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as ProjectStatus)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                >
                  {statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>

              <label className="md:col-span-2">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.description}</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-500 md:col-span-2">
                <Upload className="h-4 w-4" />
                <span className="truncate">{docFile?.name || t.upload}</span>
                <input
                  type="file"
                  accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(event) => setDocFile(event.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 p-6">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="rounded-2xl bg-slate-100 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600"
              >
                {t.cancel}
              </button>
              <button className="rounded-2xl bg-slate-900 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-600">
                {t.save}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminProjectTracker;
