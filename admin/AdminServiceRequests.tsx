
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useService } from "../contexts/ServiceContext";

const AdminServiceRequests: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { showNotification, confirm } = useNotification();
  const {
    services,
    getServices,
    serviceRequests,
    getServiceRequests,
    getServiceRequestById,
    createServiceRequest,
    updateServiceRequestStatus
  } = useService();
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    getServices();
  }, []);

  useEffect(() => {
    getServiceRequests(statusFilter);
  }, [statusFilter]);


  const handlePendingChange = (id: string, status: string) => {
    setPendingChanges(prev => ({ ...prev, [id]: status }));
  };

  const handleConfirmStatus = async (id: string) => {
    const newStatus = pendingChanges[id];

    if (!newStatus) return;

    try {
      await updateServiceRequestStatus(
        id,
        Number(newStatus)
      );

      await getServiceRequests();

      const newPending = { ...pendingChanges };
      delete newPending[id];

      setPendingChanges(newPending);

      showNotification("Status uğurla dəyişdirildi.");
    } catch (error) {
      showNotification("Status dəyişdirilmədi.", "error");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        {!embedded && <div className="flex flex-col gap-1">
          <h3 className="text-2xl font-black text-slate-900">Xidmət Müraciətləri</h3>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Yalnız xidmətlər bölməsindən gələn müraciətlər</p>
        </div>}
        <div className="flex items-center gap-3">
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

          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
            Cəmi: {serviceRequests?.length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-4">Ad / Email</th>
                <th className="px-8 py-4">Xidmət Tipi</th>
                <th className="px-8 py-4">Tarix</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-center">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {serviceRequests?.map((req) => {
                const serviceTitle =
                  services
                    .find((s) => Number(s.id) === Number(req.serviceManagementId))
                    ?.languages?.find((l) => l.languageCode === 1)?.title || "-";
                const currentStatus = pendingChanges[req.id] || req.status || 'new';
                const isChanged = pendingChanges[req.id] !== undefined && pendingChanges[req.id] !== (req.status || 'new');

                return (
                  <tr key={req.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-3">
                      <div className="text-sm font-black text-slate-900">{req.name}</div>
                      <div className="text-xs text-slate-400">{req.email}</div>
                    </td>
                    <td className="py-3">
                      <span className="text-xs font-bold text-slate-700">
                        {serviceTitle}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-xs text-slate-500">{new Date(req.createdAt).toLocaleString('az-AZ')}</div>
                    </td>
                    <td className="px-8 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={currentStatus}
                          onChange={(e) => handlePendingChange(req.id, e.target.value)}
                          className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border outline-none cursor-pointer transition-all
    ${currentStatus === 1
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : currentStatus === 2
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
                            onClick={() => handleConfirmStatus(req.id)}
                            className="bg-emerald-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg hover:bg-slate-900 transition-all animate-in fade-in zoom-in-90"
                          >
                            Təsdiq et
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-center gap-2 opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        >
                          <svg className="w-3 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {serviceRequests?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 text-xs italic">Hələ ki heç bir xidmət müraciəti yoxdur.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Xidmət Müraciəti Detalları</h3>
              <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ad Soyad</div>
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
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Xidmət Tipi</div>
                  <div className="text-sm font-bold text-slate-900">{
                    services
                      .find((s) => Number(s.id) === Number(selectedRequest.serviceManagementId))
                      ?.languages?.find((l) => l.languageCode === 1)?.title || "-"
                  }</div>
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

export default AdminServiceRequests;
