import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNotification } from '../contexts/NotificationContext';
import { API_ENDPOINTS } from '../utils/constants';

const statusOptions = [
  { value: 1, label: 'Yeni' },
  { value: 2, label: 'Təsdiqlənir' },
  { value: 3, label: 'Ödəniş gözləyir' },
  { value: 4, label: 'İcra olunur' },
  { value: 5, label: 'Tamamlanıb' },
  { value: 6, label: 'Ləğv edilib' },
];

const paymentStatusOptions = [
  { value: 1, label: 'Pending' },
  { value: 2, label: 'Provider gözləyir' },
  { value: 3, label: 'Ödənilib' },
  { value: 4, label: 'Uğursuz' },
  { value: 5, label: 'Qaytarılıb' },
  { value: 6, label: 'Tələb olunmur' },
];

const paymentMethods: Record<number, string> = {
  1: 'Bank kartı',
  2: 'Bank köçürməsi',
  3: 'Təsdiqdən sonra ödəniş',
  4: 'Satış konsultasiyası',
};

const orderSources: Record<number, string> = {
  1: 'Səbət',
  2: 'Tək məhsul',
};

const orderIntents: Record<number, { label: string; className: string }> = {
  1: { label: 'Sifariş', className: 'bg-emerald-50 text-emerald-700' },
  2: { label: 'Qiymət sorğusu', className: 'bg-amber-50 text-amber-700' },
  3: { label: 'Stok sorğusu', className: 'bg-red-50 text-red-700' },
};

const deliveryMethods: Record<number, string> = {
  1: 'Ünvana çatdırılma',
  2: 'Təhvil məntəqəsi',
  3: 'Telefonla təsdiq',
};

interface AdminOrdersProps {
  unreadCount?: number;
  onOrderViewed?: (orderId: number) => void;
}

const AdminOrders: React.FC<AdminOrdersProps> = ({ unreadCount: externalUnreadCount, onOrderViewed }) => {
  const { showNotification } = useNotification();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [pendingChanges, setPendingChanges] = useState<Record<number, { status: number; paymentStatus: number }>>({});

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ORDER.GET_ORDERS(statusFilter || undefined));
      const apiResponse = response.data;
      setOrders(apiResponse?.success && Array.isArray(apiResponse.data) ? apiResponse.data : []);
    } catch {
      showNotification('Sifarişlər yüklənmədi', 'error');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const getPending = (order: any) => pendingChanges[order.id] || {
    status: order.status,
    paymentStatus: order.paymentStatus,
  };

  const hasPendingChange = (order: any) => {
    const pending = getPending(order);
    return pending.status !== order.status || pending.paymentStatus !== order.paymentStatus;
  };

  const updatePending = (id: number, key: 'status' | 'paymentStatus', value: number, order: any) => {
    setPendingChanges((current) => ({
      ...current,
      [id]: {
        status: current[id]?.status ?? order.status,
        paymentStatus: current[id]?.paymentStatus ?? order.paymentStatus,
        [key]: value,
      },
    }));
  };

  const handleConfirmStatus = async (order: any) => {
    const pending = getPending(order);
    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.ORDER.UPDATE_ORDER_STATUS(order.id), {
        status: pending.status,
        paymentStatus: pending.paymentStatus,
      });
      const apiResponse = response.data;
      if (!apiResponse?.success) throw new Error(apiResponse?.error?.details || 'Update failed');

      setOrders((current) => current.map((item) => item.id === order.id ? apiResponse.data : item));
      if (selectedOrder?.id === order.id) setSelectedOrder(apiResponse.data);
      setPendingChanges((current) => {
        const next = { ...current };
        delete next[order.id];
        return next;
      });
      showNotification('Sifariş statusu yeniləndi.');
    } catch (error: any) {
      showNotification(error?.response?.data?.error?.details || 'Status yenilənmədi', 'error');
    }
  };

  const handleViewOrder = async (order: any) => {
    setSelectedOrder(order);
    if (order.isViewedByAdmin) return;

    const viewedOrder = { ...order, isViewedByAdmin: true, adminViewedAt: new Date().toISOString() };
    setOrders((current) => current.map((item) => item.id === order.id ? viewedOrder : item));
    setSelectedOrder(viewedOrder);
    onOrderViewed?.(order.id);

    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.ORDER.MARK_ORDER_VIEWED(order.id));
      const apiResponse = response.data;
      if (apiResponse?.success && apiResponse.data) {
        setOrders((current) => current.map((item) => item.id === order.id ? apiResponse.data : item));
        setSelectedOrder(apiResponse.data);
      }
    } catch {
      setOrders((current) => current.map((item) => item.id === order.id ? order : item));
      setSelectedOrder(order);
      showNotification('Oxunma statusu yenilənmədi', 'error');
    }
  };

  const totalValue = useMemo(() => orders.reduce((sum, order) => sum + Number(order.finalTotal || 0), 0), [orders]);
  const unreadOrders = orders.filter((order) => !order.isViewedByAdmin);
  const unreadCount = externalUnreadCount ?? unreadOrders.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900">Sifarişlər</h3>
          <div className="mt-1 text-xs font-bold text-slate-400">{orders.length} sifariş / {totalValue.toFixed(2)} AZN</div>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-600 outline-none">
          <option value="">Bütün statuslar</option>
          {statusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
        </select>
      </div>

      {unreadCount > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-800">
          {unreadCount} yeni sifariş hələ detallardan açılıb baxılmayıb.
        </div>
      )}

      <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-6 py-4">Müştəri / Kontakt</th>
                <th className="px-6 py-4">Məhsullar</th>
                <th className="px-6 py-4">Məbləğ</th>
                <th className="px-6 py-4">Tarix</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Ödəniş</th>
                <th className="px-6 py-4 text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={7} className="px-8 py-20 text-center text-xs font-bold text-slate-400">Yüklənir...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="px-8 py-20 text-center text-xs font-bold text-slate-400">Sifariş yoxdur.</td></tr>
              ) : orders.map((order) => {
                const pending = getPending(order);
                const isChanged = hasPendingChange(order);
                const itemSummary = order.items?.length
                  ? `${order.items[0].productName}${order.items.length > 1 ? ` +${order.items.length - 1}` : ''}`
                  : 'Məhsul yoxdur';

                return (
                  <tr key={order.id} className={`group hover:bg-slate-50 ${!order.isViewedByAdmin ? 'bg-amber-50/35' : ''}`}>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-black text-slate-900">{order.fullName}</div>
                        {!order.isViewedByAdmin && (
                          <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white">Yeni</span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-400">{order.phone} / {order.email}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{order.orderNumber}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-500">{orderSources[order.source] || '-'}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${orderIntents[order.intent]?.className || 'bg-slate-100 text-slate-500'}`}>{orderIntents[order.intent]?.label || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="max-w-xs truncate text-xs font-black text-slate-900">{itemSummary}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0} ədəd</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-black text-emerald-600">{Number(order.finalTotal).toFixed(2)} AZN</div>
                      {order.requiresManualConfirmation && <div className="mt-1 text-[9px] font-black uppercase tracking-widest text-amber-600">Manual təsdiq</div>}
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-500">{new Date(order.createdAt).toLocaleString('az-AZ')}</td>
                    <td className="px-6 py-5">
                      <select value={pending.status} onChange={(e) => updatePending(order.id, 'status', Number(e.target.value), order)} className="rounded-full bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 outline-none">
                        {statusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-5">
                      <select value={pending.paymentStatus} onChange={(e) => updatePending(order.id, 'paymentStatus', Number(e.target.value), order)} className="rounded-full bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 outline-none">
                        {paymentStatusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        {isChanged && (
                          <button onClick={() => handleConfirmStatus(order)} className="rounded-lg bg-emerald-600 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-white">
                            Təsdiq et
                          </button>
                        )}
                        <button onClick={() => handleViewOrder(order)} className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sifariş detalları</div>
                <h3 className="text-xl font-black text-slate-900">{selectedOrder.orderNumber}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="rounded-full p-2 hover:bg-slate-100">
                <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="max-h-[72vh] overflow-y-auto p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Detail title="Müştəri" value={selectedOrder.fullName} sub={`${selectedOrder.phone} / ${selectedOrder.email}`} />
                <Detail title="Çatdırılma" value={deliveryMethods[selectedOrder.deliveryMethod] || '-'} sub={[selectedOrder.cityOrRegion, selectedOrder.district, selectedOrder.streetAndBuilding, selectedOrder.apartmentOrOffice, selectedOrder.pickupLocation].filter(Boolean).join(', ') || 'Təsdiqlənəcək'} />
                <Detail title="Ödəniş" value={paymentMethods[selectedOrder.paymentMethod] || '-'} sub={paymentStatusOptions.find((item) => item.value === selectedOrder.paymentStatus)?.label || '-'} />
                <Detail title="Mənbə / Niyyət" value={`${orderSources[selectedOrder.source] || '-'} / ${orderIntents[selectedOrder.intent]?.label || '-'}`} sub={selectedOrder.acceptedTerms ? `Şərtlər qəbul edilib: ${selectedOrder.termsAcceptedAt ? new Date(selectedOrder.termsAcceptedAt).toLocaleString('az-AZ') : '-'}` : 'Şərtlər qəbul edilməyib'} />
              </div>

              {selectedOrder.deliveryNotes && (
                <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">{selectedOrder.deliveryNotes}</div>
              )}

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Məhsul</th>
                      <th className="px-4 py-3">Variant</th>
                      <th className="px-4 py-3">Say / Rezerv</th>
                      <th className="px-4 py-3 text-right">Cəm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedOrder.items?.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-4 py-4 text-sm font-black text-slate-900">{item.productName}</td>
                        <td className="px-4 py-4 text-xs font-bold text-slate-500">{item.selectedPower || '-'}</td>
                        <td className="px-4 py-4 text-xs font-bold text-slate-500">
                          {item.quantity}
                          {item.reservedQuantity > 0 && (
                            <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                              Rezerv: {item.reservedQuantity}{item.inventoryReleased ? ' / qaytarılıb' : ''}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-black text-emerald-600">{Number(item.lineTotal).toFixed(2)} AZN</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 ml-auto max-w-sm space-y-3 rounded-2xl bg-slate-50 p-5 text-sm">
                <div className="flex justify-between"><span>Məhsullar</span><strong>{Number(selectedOrder.productsSubtotal).toFixed(2)} AZN</strong></div>
                <div className="flex justify-between"><span>Çatdırılma</span><strong>{selectedOrder.deliveryFee === null ? 'Təsdiqlənəcək' : `${Number(selectedOrder.deliveryFee).toFixed(2)} AZN`}</strong></div>
                <div className="flex justify-between border-t border-white pt-3 text-lg font-black"><span>Yekun</span><span>{Number(selectedOrder.finalTotal).toFixed(2)} AZN</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Detail = ({ title, value, sub }: { title: string; value: string; sub?: string }) => (
  <div className="rounded-2xl bg-slate-50 p-4">
    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</div>
    <div className="mt-1 text-sm font-black text-slate-900">{value}</div>
    {sub && <div className="mt-1 text-xs font-bold leading-relaxed text-slate-500">{sub}</div>}
  </div>
);

export default AdminOrders;
