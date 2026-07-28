import React, { useEffect, useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useProject } from "../contexts/ProjectContext";
import { useUpload } from "../contexts/UploadContext";

interface MultilingualField {
  az: string;
  en: string;
  ru: string;
  tr: string;
}

interface ProjectOfferItem {
  id?: number;
  power: string;
  powerType: number;
  areaType: string;
}

interface ProjectAttachmentItem {
  id?: number;
  filePath: string;
  label: string;
}

interface ProjectItem {
  id: string;
  title: MultilingualField;
  about: MultilingualField;
  location: MultilingualField;
  totalPower: string;
  powerType: number;
  annualProduction: string;
  annualProductionType: number;
  systemType: string;
  contactFullName: string;
  contactPhone: string;
  projectDate: string;
  inquiryReceivedAt: string;
  offerSentAt: string;
  responseExpectedAt: string;
  currentStatus: string;
  shortNote: string;
  offerAmountAzn: string;
  offers: ProjectOfferItem[];
  attachments: ProjectAttachmentItem[];
  image: string[];
  isActive: boolean;
}

interface AdminProjectsProps {
  onBack: () => void;
}

const LANGUAGES = [
  { code: 'az', name: 'Azərbaycan' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'tr', name: 'Türkçe' }
] as const;

type LangCode = typeof LANGUAGES[number]['code'];
type ProjectFormData = Omit<ProjectItem, 'id'>;

const emptyText = (): MultilingualField => ({ az: '', en: '', ru: '', tr: '' });
const createEmptyOffer = (): ProjectOfferItem => ({ power: '', powerType: 1, areaType: '' });
const NOTE_LIMIT = 140;

const AdminProjects: React.FC<AdminProjectsProps> = ({ onBack }) => {
  const { showNotification, confirm } = useNotification();
  const { loading, projects, getProjects, createProject, getProjectById, updateProject, deleteProject } = useProject();
  const { uploadImage, deleteImage, uploadPDF, deletePDF } = useUpload();
  const [activeLang, setActiveLang] = useState<LangCode>('az');
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  const getEmptyForm = (): ProjectFormData => ({
    title: emptyText(),
    about: emptyText(),
    location: emptyText(),
    totalPower: '',
    powerType: 1,
    annualProduction: '',
    annualProductionType: 1,
    systemType: '',
    contactFullName: '',
    contactPhone: '',
    projectDate: '',
    inquiryReceivedAt: '',
    offerSentAt: '',
    responseExpectedAt: '',
    currentStatus: '',
    shortNote: '',
    offerAmountAzn: '',
    offers: [createEmptyOffer()],
    attachments: [],
    image: [],
    isActive: true,
  });

  const [formData, setFormData] = useState<ProjectFormData>(getEmptyForm);

  useEffect(() => {
    getProjects();
  }, []);

  const systemTypes = [
    { id: 1, label: "On-Grid" },
    { id: 2, label: "Off-Grid" },
    { id: 3, label: "Hybrid" }
  ];

  const powerUnits = [
    { id: 1, label: "kW" },
    { id: 2, label: "MW" },
    { id: 3, label: "GW" }
  ];

  const productionUnits = [
    { id: 1, label: "kWh" },
    { id: 2, label: "MWh" },
    { id: 3, label: "GWh" }
  ];

  const statusOptions = [
    'Sorgu Gelib',
    'Teklif Gonderilib',
    'Cavab Gozlenilir',
    'Qebul Edildi',
    'Imtina Edildi'
  ];

  const getUnitLabel = (units: { id: number; label: string }[], id: number) => units.find(u => u.id === id)?.label || "";

  const toDateInput = (value?: string | null) => {
    if (!value) return '';
    return value.slice(0, 10);
  };

  const toNullableDate = (value: string) => value ? value : null;
  const toNullableText = (value: string) => value.trim() ? value.trim() : null;

  const transformProject = (item: any): ProjectItem => {
    const title = emptyText();
    const about = emptyText();
    const location = emptyText();

    (item.languages || []).forEach((langItem: any) => {
      const lang: LangCode =
        langItem.languageCode === 1 ? "az" :
          langItem.languageCode === 2 ? "en" :
            langItem.languageCode === 3 ? "ru" : "tr";

      title[lang] = langItem.title || "";
      about[lang] = langItem.description || "";
      location[lang] = langItem.location || "";
    });

    const offers = (item.offers || [])
      .filter((offer: any) => offer?.isActive !== false)
      .map((offer: any) => ({
        id: offer.id,
        power: String(offer.power ?? ''),
        powerType: Number(offer.powerType) || 1,
        areaType: offer.areaType || ''
      }));

    return {
      id: String(item.id),
      title,
      about,
      location,
      totalPower: String(item.totalPower ?? ""),
      powerType: Number(item.powerType) || 1,
      annualProduction: String(item.annualProduction ?? ""),
      annualProductionType: Number(item.annualProductionType) || 1,
      systemType: String(item.systemType ?? ""),
      contactFullName: item.contactFullName || '',
      contactPhone: item.contactPhone || '',
      projectDate: toDateInput(item.projectDate),
      inquiryReceivedAt: toDateInput(item.inquiryReceivedAt),
      offerSentAt: toDateInput(item.offerSentAt),
      responseExpectedAt: toDateInput(item.responseExpectedAt),
      currentStatus: item.currentStatus || '',
      shortNote: item.shortNote || '',
      offerAmountAzn: item.offerAmountAzn === null || item.offerAmountAzn === undefined ? '' : String(item.offerAmountAzn),
      offers: offers.length > 0 ? offers : [{
        power: String(item.totalPower ?? ''),
        powerType: Number(item.powerType) || 1,
        areaType: 'Dam sahəsi'
      }],
      attachments: (item.attachments || [])
        .filter((attachment: any) => attachment?.isActive !== false)
        .map((attachment: any) => ({
          id: attachment.id,
          filePath: attachment.filePath || '',
          label: attachment.label || ''
        })),
      image: (item.images || []).filter((img: any) => img?.isActive !== false).map((img: any) => img.imagePath),
      isActive: item.isActive ?? true,
    };
  };

  const transformedProjects = (projects || []).map(transformProject);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const responses = await Promise.all(files.map(file => uploadImage(file)));
      const uploadedPaths = responses.map(res => res?.data?.path).filter(Boolean);
      setFormData(prev => ({ ...prev, image: [...prev.image, ...uploadedPaths] }));
      e.target.value = "";
    } catch {
      showNotification("Şəkillər yüklənmədi", "error");
    }
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const responses = await Promise.all(files.map(file => uploadPDF(file)));
      const uploadedAttachments = responses
        .map(res => res?.data?.path)
        .filter(Boolean)
        .map((filePath: string) => ({ filePath, label: '' }));

      setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...uploadedAttachments] }));
      e.target.value = "";
    } catch {
      showNotification("Sənədlər yüklənmədi", "error");
    }
  };

  const handleImageDelete = async (imgToDelete: string) => {
    if (!imgToDelete) return;

    try {
      await deleteImage(imgToDelete);
      setFormData(prev => ({ ...prev, image: prev.image.filter(img => img !== imgToDelete) }));
      showNotification("Şəkil silindi", "success");
    } catch {
      showNotification("Şəkil silinmədi", "error");
    }
  };

  const handleAttachmentDelete = async (filePath: string) => {
    if (!filePath) return;

    try {
      await deletePDF(filePath);
      setFormData(prev => ({ ...prev, attachments: prev.attachments.filter(item => item.filePath !== filePath) }));
      showNotification("Sənəd silindi", "success");
    } catch {
      showNotification("Sənəd silinmədi", "error");
    }
  };

  const updateOffer = (index: number, patch: Partial<ProjectOfferItem>) => {
    setFormData(prev => ({
      ...prev,
      offers: prev.offers.map((offer, offerIndex) => offerIndex === index ? { ...offer, ...patch } : offer)
    }));
  };

  const updateAttachmentLabel = (index: number, label: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.map((attachment, attachmentIndex) =>
        attachmentIndex === index ? { ...attachment, label } : attachment)
    }));
  };

  const resetForm = () => {
    setFormData(getEmptyForm());
    setEditingId(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setFormData(getEmptyForm());
    setEditingId(null);
    setIsCreating(true);
    setIsEditing(true);
  };

  const handleEdit = async (project: ProjectItem) => {
    try {
      const full = await getProjectById(project.id);
      const data = transformProject(full ?? project);
      setFormData({
        title: data.title,
        about: data.about,
        location: data.location,
        totalPower: data.totalPower,
        powerType: data.powerType,
        annualProduction: data.annualProduction,
        annualProductionType: data.annualProductionType,
        systemType: data.systemType,
        contactFullName: data.contactFullName,
        contactPhone: data.contactPhone,
        projectDate: data.projectDate,
        inquiryReceivedAt: data.inquiryReceivedAt,
        offerSentAt: data.offerSentAt,
        responseExpectedAt: data.responseExpectedAt,
        currentStatus: data.currentStatus,
        shortNote: data.shortNote,
        offerAmountAzn: data.offerAmountAzn,
        offers: data.offers.length > 0 ? data.offers : [createEmptyOffer()],
        attachments: data.attachments,
        image: data.image,
        isActive: data.isActive,
      });

      setEditingId(project.id);
      setIsEditing(true);
      setIsCreating(false);
    } catch {
      showNotification("Data yüklənmədi", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm('Bu layihəni silmək istədiyinizə əminsiniz?');
    if (!isConfirmed) return;

    await deleteProject(id);
    showNotification('Layihə uğurla silindi', 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const offers = formData.offers
      .filter(offer => Number(offer.power) > 0 && offer.areaType.trim())
      .map(offer => ({
        power: Number(offer.power),
        powerType: Number(offer.powerType) || 1,
        areaType: offer.areaType.trim()
      }));

    const primaryOffer = offers[0];
    const payload = {
      languages: [
        { languageCode: 1, title: formData.title.az, description: formData.about.az, location: formData.location.az },
        { languageCode: 2, title: formData.title.en, description: formData.about.en, location: formData.location.en },
        { languageCode: 3, title: formData.title.ru, description: formData.about.ru, location: formData.location.ru },
        { languageCode: 4, title: formData.title.tr, description: formData.about.tr, location: formData.location.tr }
      ],
      imagePaths: formData.image,
      attachments: formData.attachments.map(attachment => ({
        filePath: attachment.filePath,
        label: toNullableText(attachment.label)
      })),
      offers,
      totalPower: primaryOffer ? Math.round(primaryOffer.power) : Number(formData.totalPower) || 0,
      powerType: primaryOffer ? primaryOffer.powerType : Number(formData.powerType) || 1,
      annualProduction: Number(formData.annualProduction) || 0,
      annualProductionType: Number(formData.annualProductionType) || 1,
      systemType: Number(formData.systemType) || 0,
      contactFullName: toNullableText(formData.contactFullName),
      contactPhone: toNullableText(formData.contactPhone),
      projectDate: toNullableDate(formData.projectDate),
      inquiryReceivedAt: toNullableDate(formData.inquiryReceivedAt),
      offerSentAt: toNullableDate(formData.offerSentAt),
      responseExpectedAt: toNullableDate(formData.responseExpectedAt),
      currentStatus: toNullableText(formData.currentStatus),
      shortNote: toNullableText(formData.shortNote),
      offerAmountAzn: formData.offerAmountAzn ? Number(formData.offerAmountAzn) : null,
    };

    try {
      if (editingId) {
        await updateProject(editingId, payload);
        await getProjects();
        showNotification("Layihə yeniləndi", "success");
      } else {
        await createProject(payload);
        showNotification("Layihə yaradıldı", "success");
      }

      resetForm();
    } catch {
      showNotification("Xəta baş verdi", "error");
    }
  };

  const renderDateStatus = (label: string, value: string) => (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
      <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <span className="text-xs font-bold text-slate-700">{value || '-'}</span>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Layihələrin İdarəedilməsi</h2>
          <p className="text-slate-500 text-xs mt-1">Layihələri, texniki parametrləri, statusları və sənədləri idarə edin.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-xs uppercase tracking-widest"
          >
            Geri Qayıt
          </button>
          {!isEditing && (
            <button
              onClick={handleCreate}
              className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 text-xs uppercase tracking-widest"
            >
              Yeni Layihə
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-6 md:p-10 mb-12 animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex flex-wrap p-1 bg-slate-100 rounded-2xl">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setActiveLang(lang.code)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeLang === lang.code ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>

              {!isCreating && (
                <div className="flex items-center gap-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktiv:</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    aria-label="Aktiv statusu dəyiş"
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isActive ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Layihə Adı ({activeLang.toUpperCase()})</label>
                  <input
                    required
                    type="text"
                    value={formData.title[activeLang]}
                    onChange={e => setFormData({ ...formData, title: { ...formData.title, [activeLang]: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                    placeholder="Layihənin adı..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Yerləşdiyi Məkan ({activeLang.toUpperCase()})</label>
                  <input
                    required
                    type="text"
                    value={formData.location[activeLang]}
                    onChange={e => setFormData({ ...formData, location: { ...formData.location, [activeLang]: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                    placeholder="Məs: Bakı, Azərbaycan..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Ətraflı məzmun ({activeLang.toUpperCase()})</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.about[activeLang]}
                    onChange={e => setFormData({ ...formData, about: { ...formData.about, [activeLang]: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all resize-none"
                    placeholder="Layihə haqqında ətraflı məlumat..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Şəxs</label>
                    <input
                      type="text"
                      value={formData.contactFullName}
                      onChange={e => setFormData({ ...formData, contactFullName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:border-emerald-500 outline-none"
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Telefon</label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:border-emerald-500 outline-none"
                      placeholder="+994..."
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Təkliflər</label>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, offers: [...prev.offers, createEmptyOffer()] }))}
                      className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-black text-[10px] uppercase tracking-widest"
                    >
                      + Birini də əlavə et
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.offers.map((offer, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_130px_1fr_auto] gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-4">
                        <input
                          required={index === 0}
                          type="number"
                          min="0"
                          step="0.01"
                          value={offer.power}
                          onChange={e => updateOffer(index, { power: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:border-emerald-500 outline-none"
                          placeholder="Stansiyanın gücü"
                        />
                        <select
                          value={offer.powerType}
                          onChange={e => updateOffer(index, { powerType: Number(e.target.value) })}
                          className="appearance-none bg-white border border-slate-200 rounded-xl px-3 py-3 text-xs font-bold"
                        >
                          {powerUnits.map(unit => <option key={unit.id} value={unit.id}>{unit.label}</option>)}
                        </select>
                        <input
                          required={index === 0}
                          type="text"
                          value={offer.areaType}
                          onChange={e => updateOffer(index, { areaType: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:border-emerald-500 outline-none"
                          placeholder="Ərazi növü, məs: Dam sahəsi"
                        />
                        {formData.offers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, offers: prev.offers.filter((_, offerIndex) => offerIndex !== index) }))}
                            className="px-4 py-3 rounded-xl bg-red-50 text-red-600 font-black text-[10px]"
                          >
                            Sil
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 rounded-3xl p-6 space-y-5">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pb-3 border-b border-slate-100">Status və tarixlər</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Sorgu Gelib</label>
                      <input type="date" value={formData.inquiryReceivedAt} onChange={e => setFormData({ ...formData, inquiryReceivedAt: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Teklif Gonderilib</label>
                      <input type="date" value={formData.offerSentAt} onChange={e => setFormData({ ...formData, offerSentAt: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Cavab Gozlenilir</label>
                      <input type="date" value={formData.responseExpectedAt} onChange={e => setFormData({ ...formData, responseExpectedAt: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Date</label>
                      <input type="date" value={formData.projectDate} onChange={e => setFormData({ ...formData, projectDate: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-emerald-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Status</label>
                    <select
                      value={formData.currentStatus}
                      onChange={e => setFormData({ ...formData, currentStatus: e.target.value })}
                      className="appearance-none w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-emerald-500"
                    >
                      <option value="">Seçin...</option>
                      {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Kiçik qeyd tagı</label>
                      <span className="text-[9px] font-bold text-slate-400">{formData.shortNote.length}/{NOTE_LIMIT}</span>
                    </div>
                    <input
                      type="text"
                      maxLength={NOTE_LIMIT}
                      value={formData.shortNote}
                      onChange={e => setFormData({ ...formData, shortNote: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-emerald-500"
                      placeholder="Kartda görünəcək qısa qeyd..."
                    />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 space-y-5">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pb-3 border-b border-slate-100">Texniki və sənədlər</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">İllik İstehsal</label>
                      <input required type="number" value={formData.annualProduction} onChange={e => setFormData({ ...formData, annualProduction: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-emerald-500" placeholder="750000" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Vahid</label>
                      <select value={formData.annualProductionType} onChange={e => setFormData({ ...formData, annualProductionType: Number(e.target.value) })} className="appearance-none w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold">
                        {productionUnits.map(unit => <option key={unit.id} value={unit.id}>{unit.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Sistem Tipi</label>
                      <select required value={formData.systemType} onChange={e => setFormData({ ...formData, systemType: e.target.value })} className="appearance-none w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold">
                        <option value="">Seçin...</option>
                        {systemTypes.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Teklif Hecmi (AZN)</label>
                    <input type="number" min="0" step="0.01" value={formData.offerAmountAzn} onChange={e => setFormData({ ...formData, offerAmountAzn: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-emerald-500" placeholder="Məs: 125000" />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Şəkillər</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-3xl p-5 bg-white">
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="project-image-upload" />
                      <label htmlFor="project-image-upload" className="cursor-pointer flex flex-col items-center text-xs font-bold text-slate-500">Şəkil seçin</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                        {formData.image.map((img, index) => (
                          <div key={`${img}-${index}`} className="relative">
                            <img src={img} className="w-full h-24 rounded-xl object-cover bg-slate-100" alt="" />
                            <button type="button" onClick={() => handleImageDelete(img)} className="absolute top-1 right-1 bg-red-500 text-white text-[10px] px-2 py-1 rounded-lg">x</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Əlavə sənədlər</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-3xl p-5 bg-white">
                      <input type="file" accept="application/pdf,.pdf" multiple onChange={handleAttachmentUpload} className="hidden" id="project-attachment-upload" />
                      <label htmlFor="project-attachment-upload" className="cursor-pointer flex flex-col items-center text-xs font-bold text-slate-500">PDF sənəd seçin</label>
                      <div className="space-y-3 mt-4">
                        {formData.attachments.map((attachment, index) => (
                          <div key={`${attachment.filePath}-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 rounded-2xl bg-slate-50 p-3">
                            <div>
                              <span className="block text-[10px] font-bold text-slate-500 truncate">{attachment.filePath}</span>
                              {formData.attachments.length > 1 && (
                                <input
                                  type="text"
                                  maxLength={120}
                                  value={attachment.label}
                                  onChange={e => updateAttachmentLabel(index, e.target.value)}
                                  className="mt-2 w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-emerald-500"
                                  placeholder="Bu sənəd nə üçündür?"
                                />
                              )}
                            </div>
                            <button type="button" onClick={() => handleAttachmentDelete(attachment.filePath)} className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-black text-[10px]">Sil</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-slate-50">
              <button type="button" onClick={resetForm} className="px-10 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">Ləğv Et</button>
              <button type="submit" disabled={loading} className="px-10 py-4 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-60">
                {editingId ? 'Yadda Saxla' : 'Layihəni Əlavə Et'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {transformedProjects.map((project) => {
          const primaryOffer = project.offers[0];
          const isExpanded = expandedProjectId === project.id;

          return (
            <div key={project.id} className={`bg-white rounded-[2rem] overflow-hidden border transition-all duration-300 ${!project.isActive ? 'border-slate-100 opacity-60' : 'border-slate-100 hover:border-emerald-500 shadow-sm hover:shadow-xl'}`}>
              <div className="p-6 space-y-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest ${project.isActive ? 'bg-emerald-600' : 'bg-slate-400'}`}>
                        {project.isActive ? 'Aktiv' : 'Deaktiv'}
                      </span>
                      {project.currentStatus && <span className="px-3 py-1 rounded-full text-[8px] font-black bg-slate-900 text-white uppercase tracking-widest">{project.currentStatus}</span>}
                      {project.shortNote && <span className="px-3 py-1 rounded-full text-[8px] font-black bg-emerald-50 text-emerald-700 uppercase tracking-widest">{project.shortNote}</span>}
                    </div>
                    <h3 className="text-xl font-black text-slate-900 line-clamp-1">{project.title?.[activeLang]}</h3>
                  </div>
                  {project.image?.[0] && <img src={project.image[0]} alt={project.title?.[activeLang]} className="w-full md:w-32 h-24 object-cover rounded-2xl bg-slate-100" />}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {renderDateStatus('Sorgu Gelib', project.inquiryReceivedAt)}
                  {renderDateStatus('Teklif Gonderilib', project.offerSentAt)}
                  {renderDateStatus('Cavab Gozlenilir', project.responseExpectedAt)}
                </div>

                <div className="rounded-3xl bg-slate-50 border border-slate-100 p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(project.offers.length > 0 ? project.offers : [primaryOffer]).filter(Boolean).slice(0, 2).map((offer, index) => (
                      <div key={index} className="rounded-2xl bg-white border border-slate-100 p-4">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">
                          <span>Power</span>
                          <span>Tip</span>
                        </div>
                        <div className="flex justify-between gap-3 text-xs font-black text-slate-800">
                          <span>{offer.power} {getUnitLabel(powerUnits, offer.powerType)}</span>
                          <span className="text-right">{offer.areaType || '-'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-bold text-slate-600">
                    <div className="flex items-center gap-2 min-w-0">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                      <span className="truncate">{project.location?.[activeLang] || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <span className="truncate">{project.contactFullName || '-'} {project.contactPhone ? `(${project.contactPhone})` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M5 11h14M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      <span>{project.projectDate || project.inquiryReceivedAt || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="block text-[9px] font-black text-slate-300 uppercase tracking-widest">Teklif Hecmi</span>
                    <span className="text-lg font-black text-slate-900">{project.offerAmountAzn ? `${Number(project.offerAmountAzn).toLocaleString('az-AZ')} AZN` : '-'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                      className="px-5 py-3 rounded-xl bg-emerald-50 text-emerald-700 font-black hover:bg-emerald-100 transition-all text-[10px] uppercase tracking-widest"
                    >
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </button>
                    <button onClick={() => handleEdit(project)} className="px-5 py-3 rounded-xl bg-slate-50 text-slate-600 font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-all text-[10px] uppercase tracking-widest">Redaktə</button>
                    <button onClick={() => handleDelete(project.id)} className="w-11 h-11 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center" aria-label="Layihəni sil">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 space-y-5 animate-in fade-in duration-200">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ətraflı məzmun</h4>
                      <p className="text-sm leading-6 text-slate-600 whitespace-pre-line">{project.about?.[activeLang] || '-'}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="rounded-2xl bg-white p-4 border border-slate-100">
                        <span className="block text-[9px] font-black text-slate-300 uppercase tracking-widest">İllik istehsal</span>
                        <span className="text-xs font-bold text-slate-700">{project.annualProduction} {getUnitLabel(productionUnits, project.annualProductionType)}</span>
                      </div>
                      <div className="rounded-2xl bg-white p-4 border border-slate-100">
                        <span className="block text-[9px] font-black text-slate-300 uppercase tracking-widest">Sistem tipi</span>
                        <span className="text-xs font-bold text-slate-700">{getUnitLabel(systemTypes, Number(project.systemType)) || '-'}</span>
                      </div>
                      <div className="rounded-2xl bg-white p-4 border border-slate-100">
                        <span className="block text-[9px] font-black text-slate-300 uppercase tracking-widest">Sənədlər</span>
                        <span className="text-xs font-bold text-slate-700">{project.attachments.length}</span>
                      </div>
                    </div>
                    {project.attachments.length > 0 && (
                      <div className="space-y-2">
                        {project.attachments.map((attachment, index) => (
                          <a key={`${attachment.filePath}-${index}`} href={attachment.filePath} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-2xl bg-white border border-slate-100 p-4 text-xs font-bold text-slate-700 hover:text-emerald-700">
                            <span className="truncate">{project.attachments.length > 1 ? (attachment.label || `Sənəd ${index + 1}`) : 'Sənəd'}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest">Aç</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {transformedProjects.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <p className="font-bold text-sm text-slate-400">Heç bir layihə tapılmadı.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProjects;
