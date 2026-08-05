
import React, { useEffect, useMemo, useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useContact } from '../contexts/ContactContext';
import { useEmail } from '../contexts/EmailContext';
import { useService } from '../contexts/ServiceContext';
import { usePartnership } from '@/contexts/PartnershipContext';

type RequestSource = 'contact' | 'service' | 'partnership';

interface UnifiedRequest {
  source: RequestSource;
  id: number | string;
  name: string;
  email: string;
  phone: string;
  message: string;
  typeName: string;
  status: number;
  createdAt: string;
  isViewedByAdmin: boolean;
}

const sourceLabel: Record<RequestSource, string> = {
  contact: 'Ümumi',
  service: 'Xidmət',
  partnership: 'Tərəfdaşlıq'
};

const sourceBadgeClass: Record<RequestSource, string> = {
  contact: 'bg-slate-100 text-slate-600',
  service: 'bg-sky-50 text-sky-600',
  partnership: 'bg-violet-50 text-violet-600'
};

export interface AdminUnifiedRequestsProps {
  embedded?: boolean;
  onUnreadCountChange?: (count: number) => void;
}

const AdminUnifiedRequests: React.FC<AdminUnifiedRequestsProps> = ({ embedded = false, onUnreadCountChange }) => {
  const { showNotification } = useNotification();
  const { applicationTypes, getApplicationTypes } = useEmail();
  const {
    getContactRequests,
    updateContactRequestStatus,
    markContactRequestViewed
  } = useContact();
  const {
    services,
    getServices,
    getServiceRequests,
    serviceRequests,
    updateServiceRequestStatus,
    markServiceRequestViewed
  } = useService();
  const {
    partnershipTypes,
    getPartnershipTypes,
    getPartnershipRequests,
    updatePartnershipRequestStatus,
    markPartnershipRequestViewed
  } = usePartnership();

  const [contactRequests, setContactRequests] = useState<any[]>([]);
  const [partnershipRequests, setPartnershipRequests] = useState<any[]>([]);
  const [sourceFilter, setSourceFilter] = useState<'' | RequestSource>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<UnifiedRequest | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, number>>({});

  useEffect(() => {
    getApplicationTypes();
    getServices();
    getPartnershipTypes();
  }, []);

  const loadAll = async () => {
    try {
      const [contactData, partnershipData] = await Promise.all([
        getContactRequests(statusFilter),
        getPartnershipRequests(statusFilter)
      ]);
      setContactRequests(Array.isArray(contactData) ? contactData : []);
      setPartnershipRequests(Array.isArray(partnershipData) ? partnershipData : []);
      await getServiceRequests(statusFilter);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const getApplicationTypeName = (typeId: number) =>
    applicationTypes.find((t) => t.id === typeId)?.languages?.[0]?.name || 'Qeyd edilməyib';

  const getServiceTypeName = (serviceManagementId: number) =>
    services.find((s) => Number(s.id) === Number(serviceManagementId))?.languages?.find((l) => l.languageCode === 1)?.title || '-';

  const getPartnershipTypeName = (id: number) =>
    partnershipTypes.find((t) => t.id === id)?.languages?.[0]?.name || 'Qeyd edilməyib';

  const unifiedRequests = useMemo<UnifiedRequest[]>(() => {
    const fromContact: UnifiedRequest[] = contactRequests.map((r) => ({
      source: 'contact',
      id: r.id,
      name: `${r.name || ''} ${r.surname || ''}`.trim(),
      email: r.email,
      phone: r.phone,
      message: r.message,
      typeName: getApplicationTypeName(r.applicationTypeId),
      status: r.status,
      createdAt: r.createdAt,
      isViewedByAdmin: Boolean(r.isViewedByAdmin)
    }));

    const fromService: UnifiedRequest[] = (serviceRequests || []).map((r: any) => ({
      source: 'service',
      id: r.id,
      name: `${r.name || ''} ${r.surname || ''}`.trim(),
      email: r.email,
      phone: r.phone,
      message: r.message,
      typeName: getServiceTypeName(r.serviceManagementId),
      status: r.status,
      createdAt: r.createdAt,
      isViewedByAdmin: Boolean(r.isViewedByAdmin)
    }));

    const fromPartnership: UnifiedRequest[] = partnershipRequests.map((r) => ({
      source: 'partnership',
      id: r.id,
      name: `${r.companyName || ''} ${r.companyPerson ? `(${r.companyPerson})` : ''}`.trim(),
      email: r.email,
      phone: r.phoneNumber,
      message: r.message,
      typeName: getPartnershipTypeName(r.partnershipTypeId),
      status: r.status,
      createdAt: r.createdAt,
      isViewedByAdmin: Boolean(r.isViewedByAdmin)
    }));

    return [...fromContact, ...fromService, ...fromPartnership]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactRequests, serviceRequests, partnershipRequests, applicationTypes, services, partnershipTypes]);

  const filteredRequests = useMemo(
    () => (sourceFilter ? unifiedRequests.filter((r) => r.source === sourceFilter) : unifiedRequests),
    [unifiedRequests, sourceFilter]
  );

  const unreadCount = useMemo(
    () => unifiedRequests.filter((r) => !r.isViewedByAdmin).length,
    [unifiedRequests]
  );

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

  const rowKey = (request: { source: RequestSource; id: number | string }) => `${request.source}:${request.id}`;

  const handlePendingChange = (request: UnifiedRequest, statusId: number) => {
    setPendingChanges((prev) => ({ ...prev, [rowKey(request)]: statusId }));
  };

  const handleConfirmStatus = async (request: UnifiedRequest) => {
    const statusId = pendingChanges[rowKey(request)];
    if (!statusId) return;

    try {
      if (request.source === 'contact') {
        await updateContactRequestStatus(request.id, { status: statusId });
        setContactRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, status: statusId } : r)));
      } else if (request.source === 'service') {
        await updateServiceRequestStatus(String(request.id), statusId);
      } else {
        await updatePartnershipRequestStatus(request.id, { status: statusId });
        setPartnershipRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, status: statusId } : r)));
      }

      setPendingChanges((prev) => {
        const next = { ...prev };
        delete next[rowKey(request)];
        return next;
      });

      showNotification('Status uğurla dəyişdirildi.');
    } catch (error) {
      console.error(error);
      showNotification('Status dəyişdirilmədi', 'error');
    }
  };

  const markAsViewedLocally = (request: UnifiedRequest) => {
    if (request.source === 'contact') {
      setContactRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, isViewedByAdmin: true } : r)));
    } else if (request.source === 'partnership') {
      setPartnershipRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, isViewedByAdmin: true } : r)));
    }
    // Service requests refresh through getServiceRequests(); the optimistic
    // in-memory update happens in the ServiceContext state directly below.
  };

  const handleViewRequest = async (request: UnifiedRequest) => {
    setSelectedRequest(request);
    if (request.isViewedByAdmin) return;

    markAsViewedLocally(request);

    try {
      if (request.source === 'contact') {
        await markContactRequestViewed(request.id);
      } else if (request.source === 'service') {
        await markServiceRequestViewed(request.id);
        await getServiceRequests(statusFilter);
      } else {
        await markPartnershipRequestViewed(request.id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {!embedded && (
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-black text-slate-900">Ümumi Müraciətlər</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Bütün mənbələrdən gələn müraciətlər</p>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as '' | RequestSource)}
            className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-slate-100 bg-slate-50 text-slate-600 outline-none cursor-pointer transition-all shadow-sm"
          >
            <option value="">Bütün mənbələr</option>
            <option value="contact">Ümumi</option>
            <option value="service">Xidmət</option>
            <option value="partnership">Tərəfdaşlıq</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border outline-none cursor-pointer transition-all shadow-sm
    ${statusFilter === "1"
                ? "bg-blue-50 text-blue-600 border-blue-100"
                : statusFilter === "2"
                  ? "bg-amber-50 text-amber-600 border-amber-100"
                  : statusFilter === "3"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-slate-50 text-slate-600 border-slate-100"
              }`}
          >
            <option value="">Bütün statuslar</option>
            <option value="1">Yeni</option>
            <option value="2">Əlaqə saxlanılıb</option>
            <option value="3">Bağlanıb</option>
          </select>

          {unreadCount > 0 && (
            <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 shadow-sm">
              Yeni: {unreadCount}
            </div>
          )}

          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
            Cəmi: {filteredRequests.length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-4">Ad / Email</th>
                <th className="px-2 py-4">Mənbə</th>
                <th className="px-2 py-4">Müraciət Tipi</th>
                <th className="px-8 py-4">Tarix</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-center">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRequests.map((req) => {
                const key = rowKey(req);
                const currentStatusId = pendingChanges[key] || req.status;
                const isChanged = pendingChanges[key] !== undefined && pendingChanges[key] !== req.status;

                return (
                  <tr key={key} className={`group hover:bg-slate-50 transition-colors ${!req.isViewedByAdmin ? 'bg-amber-50/40' : ''}`}>
                    <td className="px-8 py-3">
                      <div className="flex items-center gap-2">
                        {!req.isViewedByAdmin && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" aria-label="Yeni" />
                        )}
                        <div>
                          <div className="text-sm font-black text-slate-900">{req.name}</div>
                          <div className="text-xs text-slate-400">{req.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${sourceBadgeClass[req.source]}`}>
                        {sourceLabel[req.source]}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{req.typeName}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-xs text-slate-500">{new Date(req.createdAt).toLocaleString('az-AZ')}</div>
                    </td>
                    <td className="px-8 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={currentStatusId}
                          onChange={(e) => handlePendingChange(req, Number(e.target.value))}
                          className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border outline-none cursor-pointer transition-all
    ${currentStatusId === 1
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : currentStatusId === 2
                                ? "bg-amber-50 text-amber-600 border-amber-100"
                                : "bg-emerald-50 text-emerald-600 border-emerald-100"
                            }`
                          }
                        >
                          <option value={1}>Yeni</option>
                          <option value={2}>Əlaqə saxlanılıb</option>
                          <option value={3}>Bağlanıb</option>
                        </select>

                        {isChanged && (
                          <button
                            onClick={() => handleConfirmStatus(req)}
                            className="bg-emerald-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg hover:bg-slate-900 transition-all animate-in fade-in zoom-in-90"
                          >
                            Təsdiq et
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewRequest(req)}
                          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        >
                          <svg className="w-3 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 text-xs italic">Hələ ki heç bir müraciət yoxdur.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Müraciət Detalları</h3>
              <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ad / Şirkət</div>
                  <div className="text-sm font-bold text-slate-900">{selectedRequest.name}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</div>
                  <div className="text-sm font-bold text-slate-900">{selectedRequest.email}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Telefon</div>
                  <div className="text-sm font-bold text-slate-900">{selectedRequest.phone}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mənbə / Tip</div>
                  <div className="text-sm font-bold text-slate-900 uppercase tracking-tighter">
                    {sourceLabel[selectedRequest.source]} · {selectedRequest.typeName}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mesaj</div>
                <div className="bg-slate-50 p-5 rounded-2xl text-sm text-slate-700 leading-relaxed border border-slate-100 italic">
                  "{selectedRequest.message}"
                </div>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all"
                >
                  Bağla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUnifiedRequests;
