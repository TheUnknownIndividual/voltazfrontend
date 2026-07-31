import React, { useEffect, useMemo, useState } from 'react';
import { FileText, MapPin, Pencil, Plus, Trash2, Upload, User, X } from 'lucide-react';
import {
  createAdminTrackedProject,
  deleteAdminTrackedProject,
  getAdminTrackedProjects,
  type ProjectAttachment,
  type ProjectOffer,
  type ProjectSystemType,
  type TrackedProject,
  updateAdminTrackedProject,
  requestStakeholderReview,
  retryStakeholderApproval
} from '../api/adminProjectTracker';
import { useNotification } from '../contexts/NotificationContext';
import { useUpload } from '../contexts/UploadContext';
import axiosInstance from '../api/axiosInstance';
import { getAdminSession } from '../api/adminUsers';

type AdminLang = 'az' | 'en' | 'ru' | 'tr';
type LinkedVerification = { documentLogId: number; documentNumber: string; revokedAt?: string | null };

interface AdminProjectTrackerProps {
  lang?: AdminLang;
}

const NOTE_LIMIT = 140;
const ROOF_PRICE_PER_KW = 850;
const GROUND_PRICE_PER_KW = 1100;
const VAT_RATE = 0.18;

const statusOptions = [
  'Sorgu Gelib',
  'Teklif Gonderilib',
  'Cavab Gozlenilir',
  'Qebul Edildi',
  'Imtina Edildi',
  'Tamamlandi',
];

const systemTypeOptions: { id: ProjectSystemType; label: string }[] = [
  { id: 1, label: 'On-Grid' },
  { id: 2, label: 'Off-Grid' },
  { id: 3, label: 'Hybrid' },
];

const getSystemTypeLabel = (systemType?: ProjectSystemType | null) =>
  systemTypeOptions.find((item) => item.id === systemType)?.label || '-';

const approvalBadge = (status?: string) => {
  switch (status) {
    case 'Dispatching': return { label: 'Təsdiq sorğusu göndərilir', className: 'bg-sky-50 text-sky-700' };
    case 'Pending': return { label: 'Stakeholder təsdiqi gözləyir', className: 'bg-amber-50 text-amber-700' };
    case 'DeliveryFailed': return { label: 'Bildiriş göndərilmədi', className: 'bg-rose-50 text-rose-700' };
    case 'Approved': return { label: 'Stakeholder təsdiqlədi', className: 'bg-emerald-50 text-emerald-700' };
    case 'Declined': return { label: 'ON HOLD', className: 'bg-rose-50 text-rose-700' };
    default: return null;
  }
};

const copy = {
  az: {
    eyebrow: 'Layihələrin izlənməsi',
    title: 'Layihələr',
    addProject: 'Layihə əlavə et',
    editProject: 'Layihəni redaktə et',
    all: 'Hamısı',
    filter: 'Status üzrə filtr',
    projectName: 'Layihənin adı',
    power: 'Stansiyanın gücü',
    powerLabel: 'Güc',
    addOffer: 'Başqa təklif əlavə et',
    areaType: 'Ərazi növü',
    areaPlaceholder: 'Məs.: Dam sahəsi',
    roofMount: 'Dam sahəsi',
    groundMount: 'Yerüstü quraşdırma',
    offerAmount: 'Ümumi məbləğ (ADV daxil)',
    location: 'Lokasiya',
    person: 'Şəxs',
    phone: 'Telefon nömrəsi',
    systemType: 'Sistem növü',
    inquiryReceivedAt: 'Sorğu gəldi',
    offerSentAt: 'Son təklif göndərildi',
    responseExpectedAt: 'Son əlaqə tarixi',
    lastContact: 'Son əlaqə',
    offerDate: 'Göndərilmə tarixi',
    offerNumber: 'Təklif',
    advIncluded: 'ADV daxil',
    vatAmount: 'ADV 18%',
    currentStatus: 'Cari status',
    smallNote: 'Qısa qeyd',
    description: 'Ətraflı məzmun',
    attachments: 'Əlavə sənədlər',
    attachmentLabel: 'Bu sənəd nə üçündür?',
    upload: 'PDF və ya DOCX sənədi seçin',
    expand: 'Genişləndir',
    collapse: 'Yığ',
    showOffers: 'Digər təkliflərə bax',
    hideOffers: 'Təklifləri yığ',
    showDetails: 'Ətraflı bax',
    hideDetails: 'Ətraflı məlumatı gizlət',
    viewAll: 'Hamısına bax',
    hideAll: 'Hamısını yığ',
    save: 'Yadda saxla',
    cancel: 'Bağla',
    edit: 'Redaktə',
    delete: 'Sil',
    empty: 'Hələ layihə əlavə edilməyib.',
    noDescription: 'Ətraflı məzmun əlavə edilməyib.',
    filteredEmpty: 'Bu statusda layihə tapılmadı.',
    loading: 'Layihələr yüklənir...',
    loadError: 'Layihələr DB-dən yüklənmədi.',
    apiMissing: 'Layihə izləmə API-si test serverdə tapılmadı. Backend yerləşdirilməlidir.',
    saveError: 'Layihə yadda saxlanmadı.',
    deleteError: 'Layihə silinmədi.',
    created: 'Layihə əlavə edildi.',
    updated: 'Layihə yeniləndi.',
    deleted: 'Layihə silindi.',
    unit: 'AZN',
    kw: 'kW',
    file: 'Sənəd',
    status: 'Status',
  },
  en: {
    eyebrow: 'Project tracker',
    title: 'Projects',
    addProject: 'Add project',
    editProject: 'Edit project',
    all: 'All',
    filter: 'Filter by status',
    projectName: 'Project Name',
    power: 'Station Power',
    powerLabel: 'Power',
    addOffer: 'Add another offer',
    areaType: 'Area type',
    areaPlaceholder: 'Example: Roof area',
    roofMount: 'Roof area',
    groundMount: 'Ground mount',
    offerAmount: 'Total Amount (VAT included)',
    location: 'Location',
    person: 'Person',
    phone: 'Phone Number',
    systemType: 'System type',
    inquiryReceivedAt: 'Inquiry Received',
    offerSentAt: 'Latest Offer Sent',
    responseExpectedAt: 'Last contact date',
    lastContact: 'Last contact',
    offerDate: 'Sent on',
    offerNumber: 'Offer',
    advIncluded: 'VAT included',
    vatAmount: 'VAT',
    currentStatus: 'Current Status',
    smallNote: 'Small note tag',
    description: 'Detailed content',
    attachments: 'Attachments',
    attachmentLabel: 'What is this document?',
    upload: 'Select a PDF or DOCX document',
    expand: 'Expand',
    collapse: 'Collapse',
    showOffers: 'Show other offers',
    hideOffers: 'Hide offers',
    showDetails: 'View details',
    hideDetails: 'Hide details',
    viewAll: 'View all',
    hideAll: 'Hide all',
    save: 'Save',
    cancel: 'Close',
    edit: 'Edit',
    delete: 'Delete',
    empty: 'No projects added yet.',
    noDescription: 'No detailed content added.',
    filteredEmpty: 'No projects match this status.',
    loading: 'Loading projects...',
    loadError: 'Projects could not be loaded from the database.',
    apiMissing: 'Project tracker API was not found on the test server. Backend deployment is required.',
    saveError: 'Project could not be saved.',
    deleteError: 'Project could not be deleted.',
    created: 'Project added.',
    updated: 'Project updated.',
    deleted: 'Project deleted.',
    unit: 'AZN',
    kw: 'kW',
    file: 'Document',
    status: 'Status',
  },
  ru: {
    eyebrow: 'Трекер проектов',
    title: 'Проекты',
    addProject: 'Добавить проект',
    editProject: 'Редактировать проект',
    all: 'Все',
    filter: 'Фильтр по статусу',
    projectName: 'Название проекта',
    power: 'Мощность станции',
    powerLabel: 'Мощность',
    addOffer: 'Добавить еще предложение',
    areaType: 'Тип территории',
    areaPlaceholder: 'Напр.: крыша',
    roofMount: 'Крыша',
    groundMount: 'Наземный монтаж',
    offerAmount: 'Итоговая сумма (НДС включён)',
    location: 'Локация',
    person: 'Контакт',
    phone: 'Номер телефона',
    systemType: 'Тип системы',
    inquiryReceivedAt: 'Запрос получен',
    offerSentAt: 'Последнее предложение отправлено',
    responseExpectedAt: 'Дата последнего контакта',
    lastContact: 'Последний контакт',
    offerDate: 'Дата отправки',
    offerNumber: 'Предложение',
    advIncluded: 'НДС включён',
    vatAmount: 'НДС',
    currentStatus: 'Текущий статус',
    smallNote: 'Короткая заметка',
    description: 'Подробное содержание',
    attachments: 'Документы',
    attachmentLabel: 'Что это за документ?',
    upload: 'Выберите PDF или DOCX',
    expand: 'Развернуть',
    collapse: 'Свернуть',
    showOffers: 'Показать другие предложения',
    hideOffers: 'Скрыть предложения',
    showDetails: 'Подробнее',
    hideDetails: 'Скрыть подробности',
    viewAll: 'Показать всё',
    hideAll: 'Скрыть всё',
    save: 'Сохранить',
    cancel: 'Закрыть',
    edit: 'Редактировать',
    delete: 'Удалить',
    empty: 'Проекты пока не добавлены.',
    noDescription: 'Подробное содержание не добавлено.',
    filteredEmpty: 'Проекты с этим статусом не найдены.',
    loading: 'Проекты загружаются...',
    loadError: 'Не удалось загрузить проекты из базы.',
    apiMissing: 'API трекера проектов не найден на тестовом сервере. Требуется развернуть backend.',
    saveError: 'Не удалось сохранить проект.',
    deleteError: 'Не удалось удалить проект.',
    created: 'Проект добавлен.',
    updated: 'Проект обновлен.',
    deleted: 'Проект удален.',
    unit: 'AZN',
    kw: 'кВт',
    file: 'Документ',
    status: 'Статус',
  },
  tr: {
    eyebrow: 'Proje takip',
    title: 'Projeler',
    addProject: 'Proje ekle',
    editProject: 'Projeyi düzenle',
    all: 'Tümü',
    filter: 'Duruma göre filtrele',
    projectName: 'Proje Adı',
    power: 'Santral Gücü',
    powerLabel: 'Güç',
    addOffer: 'Bir teklif daha ekle',
    areaType: 'Alan türü',
    areaPlaceholder: 'Örn: Çatı alanı',
    roofMount: 'Çatı alanı',
    groundMount: 'Zemin montaj',
    offerAmount: 'Toplam Tutar (KDV dahil)',
    location: 'Konum',
    person: 'Kişi',
    phone: 'Telefon',
    systemType: 'Sistem tipi',
    inquiryReceivedAt: 'Talep Geldi',
    offerSentAt: 'Son teklif gönderildi',
    responseExpectedAt: 'Son iletişim tarihi',
    lastContact: 'Son iletişim',
    offerDate: 'Gönderim tarihi',
    offerNumber: 'Teklif',
    advIncluded: 'KDV dahil',
    vatAmount: 'KDV',
    currentStatus: 'Mevcut Durum',
    smallNote: 'Kısa not',
    description: 'Detaylı içerik',
    attachments: 'Belgeler',
    attachmentLabel: 'Bu belge nedir?',
    upload: 'PDF veya DOCX belge seç',
    expand: 'Genişlet',
    collapse: 'Daralt',
    showOffers: 'Diğer teklifleri göster',
    hideOffers: 'Teklifleri gizle',
    showDetails: 'Detayları göster',
    hideDetails: 'Detayları gizle',
    viewAll: 'Tümünü göster',
    hideAll: 'Tümünü gizle',
    save: 'Kaydet',
    cancel: 'Kapat',
    edit: 'Düzenle',
    delete: 'Sil',
    empty: 'Henüz proje eklenmedi.',
    noDescription: 'Detaylı içerik eklenmedi.',
    filteredEmpty: 'Bu durumda proje bulunamadı.',
    loading: 'Projeler yükleniyor...',
    loadError: 'Projeler veritabanından yüklenemedi.',
    apiMissing: 'Proje takip API\'si test sunucusunda bulunamadı. Backend dağıtımı gerekiyor.',
    saveError: 'Proje kaydedilemedi.',
    deleteError: 'Proje silinemedi.',
    created: 'Proje eklendi.',
    updated: 'Proje güncellendi.',
    deleted: 'Proje silindi.',
    unit: 'AZN',
    kw: 'kW',
    file: 'Belge',
    status: 'Durum',
  },
};

const emptyOffer = (): ProjectOffer => ({ power: '', mountType: 'roof', areaType: '', extraAmount: '', sentAt: '' });

const getOfferUnitPrice = (mountType: ProjectOffer['mountType']) =>
  mountType === 'ground' ? GROUND_PRICE_PER_KW : ROOF_PRICE_PER_KW;

const getDefaultAreaType = (mountType: ProjectOffer['mountType']) =>
  mountType === 'ground' ? 'Ground mount' : 'Dam sahəsi';

const getOfferAmount = (offer: ProjectOffer) =>
  toNumber(offer.power) * getOfferUnitPrice(offer.mountType);

const getOfferVat = (offer: ProjectOffer) => getOfferAmount(offer) * VAT_RATE;
const getOfferTotalWithVat = (offer: ProjectOffer) => getOfferAmount(offer) + getOfferVat(offer);

const calculateOfferTotal = (items: ProjectOffer[]) =>
  items.reduce((sum, offer) => sum + getOfferAmount(offer), 0);

const getLatestOfferDate = (items: ProjectOffer[]) =>
  items.reduce((latest, offer) => offer.sentAt && offer.sentAt > latest ? offer.sentAt : latest, '');

const toNumber = (value: string) => Number(String(value).replace(',', '.')) || 0;

const formatDate = (date?: string, lang: AdminLang = 'az') => {
  if (!date) return '-';
  const parsed = new Date(date);
  const locale = { az: 'az-AZ', en: 'en-GB', ru: 'ru-RU', tr: 'tr-TR' }[lang];
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString(locale);
};

const formatPhone = (phone?: string) => {
  const cleaned = String(phone || '').replace(/^\+?994\s*/, '').trim();
  return cleaned ? `+994 ${cleaned}` : '';
};

const formatContact = (project: TrackedProject) => {
  const name = project.personName?.trim();
  const phone = formatPhone(project.phoneNumber);

  if (name && phone) return `${name} (${phone})`;
  if (name) return name;
  if (phone) return phone;
  return '-';
};

const getStatusLabel = (status: string, lang: AdminLang) => {
  const labels: Record<AdminLang, Record<string, string>> = {
    az: {
      'Sorgu Gelib': 'Sorğu gəldi',
      'Teklif Gonderilib': 'Təklif göndərildi',
      'Cavab Gozlenilir': 'Son əlaqə',
      'Qebul Edildi': 'Qəbul edildi',
      'Imtina Edildi': 'İmtina edildi',
      Tamamlandi: 'Tamamlandı',
    },
    en: {
      'Sorgu Gelib': 'Inquiry received',
      'Teklif Gonderilib': 'Offer sent',
      'Cavab Gozlenilir': 'Last contact',
      'Qebul Edildi': 'Accepted',
      'Imtina Edildi': 'Declined',
      Tamamlandi: 'Completed',
    },
    ru: {
      'Sorgu Gelib': 'Запрос получен',
      'Teklif Gonderilib': 'Предложение отправлено',
      'Cavab Gozlenilir': 'Последний контакт',
      'Qebul Edildi': 'Принято',
      'Imtina Edildi': 'Отклонено',
      Tamamlandi: 'Завершено',
    },
    tr: {
      'Sorgu Gelib': 'Talep geldi',
      'Teklif Gonderilib': 'Teklif gönderildi',
      'Cavab Gozlenilir': 'Son iletişim',
      'Qebul Edildi': 'Kabul edildi',
      'Imtina Edildi': 'Reddedildi',
      Tamamlandi: 'Tamamlandı',
    },
  };

  return labels[lang]?.[status] || status;
};

const AdminProjectTracker: React.FC<AdminProjectTrackerProps> = ({ lang = 'az' }) => {
  const t = copy[lang] || copy.az;
  const { showNotification, confirm } = useNotification();
  const { uploadPDF } = useUpload();
  const [projects, setProjects] = useState<TrackedProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [offers, setOffers] = useState<ProjectOffer[]>([emptyOffer()]);
  const [location, setLocation] = useState('');
  const [personName, setPersonName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [systemType, setSystemType] = useState<ProjectSystemType>(1);
  const [inquiryReceivedAt, setInquiryReceivedAt] = useState('');
  const [responseExpectedAt, setResponseExpectedAt] = useState('');
  const [currentStatus, setCurrentStatus] = useState(statusOptions[0]);
  const [smallNote, setSmallNote] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<ProjectAttachment[]>([]);
  const [isFullAdmin, setIsFullAdmin] = useState(false);
  const [canDeleteProjects, setCanDeleteProjects] = useState(false);
  const [canEditProjects, setCanEditProjects] = useState(false);
  const [projectForRevocation, setProjectForRevocation] = useState<TrackedProject | null>(null);
  const [linkedVerifications, setLinkedVerifications] = useState<LinkedVerification[]>([]);
  const [revocationReason, setRevocationReason] = useState('');

  const loadProjects = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getAdminTrackedProjects();
      setProjects(data);
    } catch (error: any) {
      setLoadError(error?.response?.status === 404
        ? t.apiMissing
        : error?.response?.data?.error?.details || error?.message || t.loadError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    getAdminSession().then((session) => {
      setIsFullAdmin(session.isSuperAdmin);
      setCanDeleteProjects(session.canDeleteProjects);
      setCanEditProjects(session.canEditProjects);
    }).catch(() => {
      setIsFullAdmin(false);
      setCanDeleteProjects(false);
      setCanEditProjects(false);
    });
  }, []);

  const statusCounts = useMemo(() => statusOptions.map((item) => ({
    status: item,
    count: projects.filter((project) => project.currentStatus === item).length,
  })), [projects]);

  const filteredProjects = useMemo(() => (
    activeStatusFilter
      ? projects.filter((project) => project.currentStatus === activeStatusFilter)
      : projects
  ), [activeStatusFilter, projects]);

  const calculatedOfferPrice = useMemo(() => calculateOfferTotal(offers), [offers]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setOffers([emptyOffer()]);
    setLocation('');
    setPersonName('');
    setPhoneNumber('');
    setSystemType(1);
    setInquiryReceivedAt('');
    setResponseExpectedAt('');
    setCurrentStatus(statusOptions[0]);
    setSmallNote('');
    setDescription('');
    setAttachments([]);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (project: TrackedProject) => {
    setEditingId(project.id);
    setName(project.name);
    setOffers(project.offers.length > 0 ? project.offers : [emptyOffer()]);
    setLocation(project.location || '');
    setPersonName(project.personName || '');
    setPhoneNumber(project.phoneNumber || '');
    setSystemType(project.systemType || 1);
    setInquiryReceivedAt(project.inquiryReceivedAt || '');
    setResponseExpectedAt(project.responseExpectedAt || '');
    setCurrentStatus(project.currentStatus || statusOptions[0]);
    setSmallNote(project.smallNote || '');
    setDescription(project.description || '');
    setAttachments(project.attachments || []);
    setIsModalOpen(true);
  };

  const updateOffer = (index: number, patch: Partial<ProjectOffer>) => {
    setOffers((current) => current.map((offer, offerIndex) => {
      if (offerIndex !== index) return offer;
      const nextOffer = { ...offer, ...patch };
      if (patch.mountType && !patch.areaType) {
        nextOffer.areaType = getDefaultAreaType(patch.mountType);
      }
      return nextOffer;
    }));
  };

  const handleAttachmentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    try {
      setIsSaving(true);
      const nextAttachments = await Promise.all(files.map(async (file) => {
        const result = await uploadPDF(file);
        const uploaded = result?.data;
        return {
          name: uploaded?.fileName || file.name,
          filePath: uploaded?.path || '',
          label: '',
          tag: 'Qiymət təklifi' as const,
        };
      }));

      setAttachments((current) => [...current, ...nextAttachments.filter((item) => item.filePath)]);
      event.target.value = '';
    } catch (error: any) {
      showNotification(error?.response?.data?.error?.details || error?.message || t.saveError, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    const normalizedOffers = offers.filter((offer) => offer.power.trim() || offer.areaType.trim()).map((offer) => ({
      power: offer.power.trim(),
      mountType: offer.mountType,
      areaType: offer.areaType.trim() || getDefaultAreaType(offer.mountType),
      extraAmount: String(getOfferAmount(offer)),
      sentAt: offer.sentAt || '',
    }));

    if (normalizedOffers.length === 0) {
      showNotification(`${t.power} / ${t.areaType}`, 'error');
      return;
    }

    const payload = {
      name: name.trim(),
      offers: normalizedOffers,
      location: location.trim(),
      personName: personName.trim(),
      phoneNumber: phoneNumber.trim(),
      systemType,
      inquiryReceivedAt,
      offerSentAt: getLatestOfferDate(normalizedOffers),
      responseExpectedAt,
      currentStatus,
      smallNote: smallNote.trim(),
      offerPrice: calculatedOfferPrice,
      isOfferPriceManual: false,
      includesAdv: true,
      description: description.trim(),
      attachments,
    };

    try {
      setIsSaving(true);
      if (editingId) {
        const updated = await updateAdminTrackedProject(editingId, payload);
        setProjects((current) => current.map((project) => project.id === editingId ? updated : project));
        showNotification(t.updated, 'success');
      } else {
        const created = await createAdminTrackedProject(payload);
        setProjects((current) => [created, ...current]);
        showNotification(t.created, 'success');
      }
      closeModal();
    } catch (error: any) {
      showNotification(error?.response?.data?.error?.details || error?.message || t.saveError, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    const approved = await confirm('Bu layihəni silmək istədiyinizə əminsiniz?');
    if (!approved) return;

    try {
      await deleteAdminTrackedProject(projectId);
      setProjects((current) => current.filter((project) => project.id !== projectId));
      showNotification(t.deleted, 'success');
    } catch (error: any) {
      if (error?.response?.data?.error === 'FORBIDDEN') {
        setCanDeleteProjects(false);
        return;
      }
      showNotification(error?.response?.data?.error?.details || error?.message || t.deleteError, 'error');
    }
  };

  const openProjectRevocation = async (project: TrackedProject) => {
    try {
      const response = await axiosInstance.get(`document-verifications/project/${project.id}`);
      const records = (response.data?.data ?? response.data ?? []) as LinkedVerification[];
      const activeRecords = records.filter((record) => !record.revokedAt);
      if (activeRecords.length === 0) { showNotification('Bu aktiv layihəyə bağlı ləğv edilə bilən sənəd yoxdur.', 'error'); return; }
      setProjectForRevocation(project); setLinkedVerifications(activeRecords); setRevocationReason('');
    } catch { showNotification('Layihənin sənədləri yüklənmədi.', 'error'); }
  };

  const revokeProjectDocument = async (documentLogId: number) => {
    if (revocationReason.trim().length < 3) { showNotification('Ləğv səbəbini daxil edin.', 'error'); return; }
    try {
      await axiosInstance.post(`document-verifications/document/${documentLogId}/revoke`, { reason: revocationReason.trim() });
      setProjectForRevocation(null); setLinkedVerifications([]); showNotification('Sənəd ləğv edildi. Layihə aktiv qalır.', 'warning');
    } catch { showNotification('Sənəd ləğv edilmədi.', 'error'); }
  };

  return (
    <div className="admin-project-tracker space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">{t.eyebrow}</div>
          <h3 className="text-2xl font-black text-slate-900 md:text-3xl">{t.title}</h3>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-emerald-600"
        >
          <Plus className="h-4 w-4" />
          {t.addProject}
        </button>
      </div>

      <div className="max-w-sm">
        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400" htmlFor="project-status-filter">
          {t.filter}
        </label>
        <select
          id="project-status-filter"
          value={activeStatusFilter || ''}
          onChange={(event) => setActiveStatusFilter(event.target.value || null)}
          aria-label={t.filter}
          className="mt-2 w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-xs font-black text-slate-700 shadow-sm outline-none focus:border-emerald-500"
        >
          <option value="">{t.all} ({projects.length})</option>
          {statusCounts.map((item) => (
            <option key={item.status} value={item.status}>
              {getStatusLabel(item.status, lang)} ({item.count})
            </option>
          ))}
        </select>
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-3">
        {loadError && (
          <div className="rounded-[2rem] border border-red-100 bg-red-50 p-5 text-sm font-bold text-red-700 xl:col-span-2">
            {loadError}
          </div>
        )}

        {isLoading && (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-16 text-center text-xs font-bold text-slate-400 xl:col-span-2">
            {t.loading}
          </div>
        )}

        {filteredProjects.map((project) => {
          const isExpanded = expandedId === project.id;
          const visibleOffers = project.offers.length > 1 && !isExpanded
            ? project.offers.slice(0, 1)
            : project.offers;

          return (
            <article key={project.id} className="min-w-0 max-w-full overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white p-3 shadow-sm">
              <div className="flex min-w-0 flex-col gap-2">

                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap gap-1.5">
                      {project.currentStatus && (
                        <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-white">
                          {getStatusLabel(project.currentStatus, lang)}
                        </span>
                      )}
                      {approvalBadge(project.stakeholderApprovalStatus) && (
                        <span className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-widest ${approvalBadge(project.stakeholderApprovalStatus)?.className}`}>
                          {approvalBadge(project.stakeholderApprovalStatus)?.label}
                        </span>
                      )}
                      {project.smallNote && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-emerald-700">
                          {project.smallNote}
                        </span>
                      )}
                    </div>
                    <div className="flex min-w-0 items-center gap-2">
                      <h4 className="min-w-0 max-w-[calc(100%-5.5rem)] truncate text-base font-black text-slate-900">{project.name}</h4>
                      {project.systemType && (
                        <span className="shrink-0 rounded-full border border-emerald-300 bg-transparent px-2 py-0.5 text-[7.5px] font-black uppercase tracking-wider text-emerald-700">
                          {getSystemTypeLabel(project.systemType)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    {project.stakeholderApprovalStatus === 'Declined' && (
                      <button type="button" onClick={async () => { try { const updated = await requestStakeholderReview(project.id); setProjects((current) => current.map((item) => item.id === project.id ? updated : item)); showNotification('Stakeholder-lara yenidən baxış sorğusu göndərildi.', 'success'); } catch (error: any) { showNotification(error?.response?.data?.error?.details || 'Sorğu göndərilmədi.', 'error'); } }} className="rounded-lg bg-amber-50 px-2 text-[9px] font-black text-amber-700">Yenidən baxış</button>
                    )}
                    {isFullAdmin && project.stakeholderApprovalStatus === 'DeliveryFailed' && (
                      <button type="button" onClick={async () => { try { const updated = await retryStakeholderApproval(project.id); setProjects((current) => current.map((item) => item.id === project.id ? updated : item)); showNotification('Stakeholder bildirişi yenidən göndərildi.', 'success'); } catch (error: any) { showNotification(error?.response?.data?.error?.details || 'Bildiriş göndərilmədi.', 'error'); } }} className="rounded-lg bg-rose-50 px-2 text-[9px] font-black text-rose-700">Bildirişi təkrarla</button>
                    )}
                    {canEditProjects && (
                      <button
                        type="button"
                        onClick={() => openEditModal(project)}
                        className="rounded-lg bg-slate-50 p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    {canDeleteProjects && (
                      <button
                        type="button"
                        onClick={() => handleDelete(project.id)}
                        className="rounded-lg bg-slate-50 p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Dates - balanced */}
                <div className="grid min-w-0 grid-cols-3 gap-1.5">
                    <div className="min-w-0 rounded-lg border border-slate-100 bg-white px-2 py-1.5">
                      <span className="block truncate text-[8px] font-black uppercase tracking-widest text-slate-400">{t.inquiryReceivedAt}</span>
                      <span className="block truncate text-[10px] font-bold text-slate-700">{formatDate(project.inquiryReceivedAt, lang)}</span>
                    </div>
                    <div className="min-w-0 rounded-lg border border-slate-100 bg-white px-2 py-1.5">
                      <span className="block truncate text-[8px] font-black uppercase tracking-widest text-slate-400">{t.offerSentAt}</span>
                      <span className="block truncate text-[10px] font-bold text-slate-700">{formatDate(project.offerSentAt, lang)}</span>
                    </div>
                    <div className="min-w-0 rounded-lg border border-slate-100 bg-white px-2 py-1.5">
                      <span className="block truncate text-[8px] font-black uppercase tracking-widest text-slate-400">{t.responseExpectedAt}</span>
                      <span className="block truncate text-[10px] font-bold text-slate-700">{formatDate(project.responseExpectedAt, lang)}</span>
                    </div>
                </div>

                {/* Offer details */}
                <div className="min-w-0 space-y-2">
                  {visibleOffers.map((offer, index) => (
                    <div key={offer.id || index} className="min-w-0 rounded-xl border border-slate-100 bg-white p-2.5">
                      {project.offers.length > 1 && (
                        <div className="mb-1.5 text-[8px] font-black uppercase tracking-widest text-emerald-600">
                          {t.offerNumber} #{index + 1}
                        </div>
                      )}
                      <div className="mb-2 flex justify-between gap-3 text-[9px] font-black uppercase tracking-widest text-emerald-700">
                        <span>{t.powerLabel}</span>
                      </div>
                      <div className="flex min-w-0 justify-between gap-3 text-xs font-black text-slate-800">
                        <span className="shrink-0">{offer.power || 0} {t.kw}</span>
                        <span className="truncate text-right">{offer.mountType === 'ground' ? t.groundMount : t.roofMount}</span>
                      </div>
                      <div className="mt-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {getOfferUnitPrice(offer.mountType)} {t.unit}/{t.kw}
                      </div>
                      <div className="mt-2 flex min-w-0 items-center justify-between gap-3 border-t border-slate-100 pt-2">
                        <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-slate-400">{t.offerAmount}</span>
                        <div className="min-w-0 text-right">
                          <div className="truncate text-base font-black text-slate-900">{getOfferTotalWithVat(offer).toLocaleString('az-AZ')} {t.unit}</div>
                          <div className="mt-0.5 text-[8px] font-black uppercase tracking-widest text-emerald-700">{t.vatAmount}: {getOfferVat(offer).toLocaleString('az-AZ')} {t.unit}</div>
                        </div>
                      </div>
                      <div className="mt-1 flex min-w-0 items-center justify-between gap-2 text-[8px] font-black uppercase tracking-widest text-slate-400">
                        <span className="min-w-0 truncate">{t.offerDate}: {formatDate(offer.sentAt, lang)}</span>
                      </div>
                    </div>
                  ))}

                  <div className="-mx-1 flex min-w-0 flex-nowrap gap-1.5 overflow-x-auto px-1 pb-1 text-xs font-bold text-slate-700 [scrollbar-width:thin]">
                    <div className="inline-flex max-w-[13rem] shrink-0 items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-sky-800 shadow-sm sm:max-w-[11rem] xl:max-w-[9.5rem]">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                      <span className="truncate whitespace-nowrap">{project.location || '-'}</span>
                    </div>
                    <div className="inline-flex max-w-[calc(100vw-2rem)] shrink-0 items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-violet-800 shadow-sm sm:max-w-[22rem] xl:max-w-[16rem]">
                      <User className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                      <span className="truncate whitespace-nowrap">{formatContact(project)}</span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="space-y-4 border-t border-slate-100 pt-4">
                    <p className="text-slate-600 leading-relaxed">{project.description || t.noDescription}</p>
                    {project.attachments.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.attachments}</div>
                        {project.attachments.map((attachment, index) => (
                          <a
                            key={`${attachment.filePath}-${index}`}
                            href={attachment.filePath}
                            target="_blank"
                            rel="noreferrer"
                            className="flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 text-xs font-bold text-slate-700 hover:text-emerald-700"
                          >
                            <span className="min-w-0">
                              <span className="block truncate">{attachment.label || attachment.name || `${t.file} ${index + 1}`}</span>
                              <span className="mt-1 block text-[10px] font-medium text-slate-400">{attachment.tag || 'Qiymət təklifi'} · {formatDate(attachment.createdAt, lang)}</span>
                            </span>
                            <FileText className="h-4 w-4 shrink-0" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  {isExpanded && isFullAdmin && (
                    <button type="button" onClick={() => openProjectRevocation(project)} className="rounded-full border border-red-200 bg-red-50 px-5 py-2 text-[9px] font-black uppercase tracking-widest text-red-600 shadow-sm transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white">Sənədi ləğv et</button>
                  )}
                  <button
                    type="button"
                    onClick={() => setExpandedId((current) => current === project.id ? null : project.id)}
                    aria-expanded={isExpanded}
                    className="rounded-full border border-emerald-200 bg-white px-5 py-2 text-[9px] font-black uppercase tracking-widest text-emerald-700 shadow-sm transition-colors hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
                  >
                    {isExpanded ? t.hideAll : `${t.viewAll} (${project.offers.length})`}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!isLoading && projects.length === 0 && (
        <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-16 text-center text-xs font-bold text-slate-400">
          {t.empty}
        </div>
      )}

      {!isLoading && projects.length > 0 && filteredProjects.length === 0 && (
        <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-16 text-center text-xs font-bold text-slate-400">
          {t.filteredEmpty}
        </div>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[1.5rem] bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-4 sm:p-6">
              <h4 className="min-w-0 break-words text-base font-black text-slate-900 sm:text-lg">{editingId ? t.editProject : t.addProject}</h4>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:text-slate-900"
                aria-label={t.cancel}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-5 p-4 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
              <label className="min-w-0 md:col-span-2 xl:col-span-3">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.projectName}</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                  required
                />
              </label>

              <div className="min-w-0 space-y-3 md:col-span-2 xl:col-span-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.power} / {t.areaType}</span>
                  <button
                    type="button"
                    onClick={() => setOffers((current) => [...current, emptyOffer()])}
                    className="rounded-xl bg-emerald-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700"
                  >
                    {t.addOffer}
                  </button>
                </div>
                {offers.map((offer, index) => (
                  <div key={index} className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto]">
                    {offers.length > 1 && (
                      <div className="text-[9px] font-black uppercase tracking-widest text-emerald-600 sm:col-span-2 xl:col-span-5">
                        {t.offerNumber} #{index + 1}
                      </div>
                    )}
                    <label className="min-w-0">
                      <span className="mb-2 block text-[9px] font-black uppercase tracking-widest text-slate-400">{t.power}</span>
                      <div className="flex">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={offer.power}
                          onChange={(event) => updateOffer(index, { power: event.target.value })}
                          className="w-full rounded-l-xl border border-slate-100 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                          required={index === 0}
                        />
                        <span className="rounded-r-xl border border-l-0 border-slate-100 bg-white px-3 py-3 text-xs font-black text-slate-400">{t.kw}</span>
                      </div>
                    </label>
                    <label className="min-w-0">
                      <span className="mb-2 block text-[9px] font-black uppercase tracking-widest text-slate-400">{t.areaType}</span>
                      <select
                        value={offer.mountType}
                        onChange={(event) => updateOffer(index, { mountType: event.target.value as ProjectOffer['mountType'] })}
                        className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                      >
                        <option value="roof">{t.roofMount} - {ROOF_PRICE_PER_KW} {t.unit}/{t.kw}</option>
                        <option value="ground">{t.groundMount} - {GROUND_PRICE_PER_KW} {t.unit}/{t.kw}</option>
                      </select>
                    </label>
                    <label className={`min-w-0 ${offers.length > 1 ? '' : 'md:col-span-1'}`}>
                      <span className="mb-2 block text-[9px] font-black uppercase tracking-widest text-slate-400">{t.offerAmount}</span>
                      <div className="w-full rounded-xl border border-slate-100 bg-slate-100 px-4 py-3 text-sm font-black text-slate-700">
                        {Math.round(getOfferTotalWithVat(offer)).toLocaleString('az-AZ')} {t.unit}
                      </div>
                      <span className="mt-1 block text-[9px] font-bold text-emerald-700">{t.vatAmount}: {Math.round(getOfferVat(offer)).toLocaleString('az-AZ')} {t.unit}</span>
                    </label>
                    <label className="min-w-0">
                      <span className="mb-2 block text-[9px] font-black uppercase tracking-widest text-slate-400">{t.offerDate}</span>
                      <input
                        type="date"
                        value={offer.sentAt || ''}
                        onChange={(event) => updateOffer(index, { sentAt: event.target.value })}
                        className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                      />
                    </label>
                    {offers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setOffers((current) => current.filter((_, offerIndex) => offerIndex !== index))}
                        className="self-end rounded-xl bg-red-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-600 sm:col-span-2 xl:col-span-1"
                      >
                        {t.delete}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <label className="min-w-0 md:col-span-2 xl:col-span-3">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.location}</span>
                <input value={location} onChange={(event) => setLocation(event.target.value)} className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500" />
              </label>

              <label className="min-w-0">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.person}</span>
                <input value={personName} onChange={(event) => setPersonName(event.target.value)} className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500" />
              </label>

              <label className="min-w-0">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.phone}</span>
                <div className="flex min-w-0">
                  <span className="shrink-0 rounded-l-2xl border border-r-0 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-black text-slate-500">+994</span>
                  <input type="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value.replace(/^\+?994\s*/, ''))} className="min-w-0 w-full rounded-r-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500" placeholder="50 000 00 00" />
                </div>
              </label>

              <label>
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.systemType}</span>
                <select
                  value={systemType}
                  onChange={(event) => setSystemType(Number(event.target.value) as ProjectSystemType)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                  required
                >
                  {systemTypeOptions.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.inquiryReceivedAt}</span>
                <input type="date" value={inquiryReceivedAt} onChange={(event) => setInquiryReceivedAt(event.target.value)} className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500" />
              </label>

              <label>
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.responseExpectedAt}</span>
                <input type="date" value={responseExpectedAt} onChange={(event) => setResponseExpectedAt(event.target.value)} className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500" />
              </label>

              <label>
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.currentStatus}</span>
                <select value={currentStatus} onChange={(event) => setCurrentStatus(event.target.value)} className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500">
                  {statusOptions.map((item) => <option key={item} value={item}>{getStatusLabel(item, lang)}</option>)}
                </select>
              </label>

              <label>
                <div className="mb-2 flex justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.smallNote}</span>
                  <span className="text-[10px] font-bold text-slate-400">{smallNote.length}/{NOTE_LIMIT}</span>
                </div>
                <input maxLength={NOTE_LIMIT} value={smallNote} onChange={(event) => setSmallNote(event.target.value)} className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500" />
              </label>

              <label className="min-w-0 md:col-span-2 xl:col-span-3">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.description}</span>
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500" />
              </label>

              <div className="min-w-0 space-y-3 md:col-span-2 xl:col-span-3">
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.attachments}</span>
                <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-500">
                  <Upload className="h-4 w-4" />
                  {t.upload}
                  <input type="file" accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx" multiple onChange={handleAttachmentUpload} disabled={isSaving} className="hidden" />
                </label>
                {attachments.map((attachment, index) => (
                  <div key={`${attachment.filePath}-${index}`} className="grid gap-3 rounded-2xl bg-slate-50 p-3 md:grid-cols-[1fr_auto]">
                    <div>
                      <span className="block truncate text-[10px] font-bold text-slate-500">{attachment.name}</span>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <select
                          value={attachment.tag || 'Qiymət təklifi'}
                          onChange={(event) => setAttachments((current) => current.map((item, attachmentIndex) => attachmentIndex === index ? { ...item, tag: event.target.value as ProjectAttachment['tag'] } : item))}
                          className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-emerald-500"
                        >
                          <option value="Qiymət təklifi">Qiymət təklifi</option>
                          <option value="Banka müraciət sənədi">Banka müraciət sənədi</option>
                        </select>
                        <input
                          value={attachment.label || ''}
                          onChange={(event) => setAttachments((current) => current.map((item, attachmentIndex) => attachmentIndex === index ? { ...item, label: event.target.value } : item))}
                          maxLength={120}
                          className="w-full rounded-xl border border-slate-100 bg-white px-4 py-2 text-xs font-bold outline-none focus:border-emerald-500"
                          placeholder={t.attachmentLabel}
                        />
                      </div>
                    </div>
                    <button type="button" onClick={() => setAttachments((current) => current.filter((_, attachmentIndex) => attachmentIndex !== index))} className="rounded-xl bg-red-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600">
                      {t.delete}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 p-6">
              <button type="button" onClick={closeModal} className="rounded-2xl bg-slate-100 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600">
                {t.cancel}
              </button>
              <button type="submit" disabled={isSaving} className="rounded-2xl bg-slate-900 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-60">
                {t.save}
              </button>
            </div>
          </form>
        </div>
      )}
      {projectForRevocation && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 p-4" onMouseDown={() => setProjectForRevocation(null)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <h4 className="text-lg font-black text-slate-900">Sənədi ləğv et</h4>
            <p className="mt-2 text-sm text-slate-500">{projectForRevocation.name} aktiv qalacaq; yalnız seçilən sənədin doğrulaması ləğv ediləcək.</p>
            <textarea value={revocationReason} onChange={(event) => setRevocationReason(event.target.value)} maxLength={1000} className="mt-4 min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm" placeholder="Daxili ləğv səbəbi" />
            <div className="mt-4 space-y-2">{linkedVerifications.map((record) => <button key={record.documentLogId} onClick={() => revokeProjectDocument(record.documentLogId)} className="w-full rounded-xl bg-red-50 px-4 py-3 text-left text-xs font-black text-red-700 hover:bg-red-100">{record.documentNumber} — ləğv et</button>)}</div>
            <button onClick={() => setProjectForRevocation(null)} className="mt-4 w-full rounded-xl bg-slate-100 px-4 py-3 text-xs font-black text-slate-600">Bağla</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjectTracker;
