
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';

const AdminOrders: React.FC = () => {
  const { showNotification, confirm } = useNotification();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<number, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem('volt_orders');
    if (saved) {
      const parsed = JSON.parse(saved);
      setOrders(Array.isArray(parsed) ? parsed.reverse() : []); // Show newest first
    }
  }, []);

  const handleDelete = async (id: number) => {
    if (await confirm('Bu sifarişi silmək istədiyinizə əminsiniz?')) {
      const updated = orders.filter(o => o.id !== id);
      setOrders(updated);
      localStorage.setItem('volt_orders', JSON.stringify(updated.reverse()));
      setSelectedOrder(null);
      showNotification('Sifariş silindi', 'info');
    }
  };

  const handlePendingChange = (id: number, status: string) => {
    setPendingChanges(prev => ({ ...prev, [id]: status }));
  };

  const handleConfirmStatus = (id: number) => {
    const newStatus = pendingChanges[id];
    if (!newStatus) return;

    const updated = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    setOrders(updated);
    
    // Save to localStorage (need to reverse back because we displayed it reversed)
    localStorage.setItem('volt_orders', JSON.stringify([...updated].reverse()));
    
    // Clear pending change
    const newPending = { ...pendingChanges };
    delete newPending[id];
    setPendingChanges(newPending);
    
    window.dispatchEvent(new Event('volt_data_updated'));
    showNotification('Sifariş statusu uğurla dəyişdirildi.');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Yeni';
      case 'processing': return 'Hazırlanır';
      case 'shipped': return 'Yoldadır';
      case 'completed': return 'Tamamlanıb';
      case 'cancelled': return 'Ləğv edilib';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-50 text-blue-600';
      case 'processing': return 'bg-amber-50 text-amber-600';
      case 'shipped': return 'bg-purple-50 text-purple-600';
      case 'completed': return 'bg-emerald-50 text-emerald-600';
      case 'cancelled': return 'bg-red-50 text-red-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black text-slate-900">Sifarişlər</h3>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
          Cəmi: {orders.length}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-4">Müştəri / Email</th>
                <th className="px-8 py-4">Məhsul</th>
                <th className="px-8 py-4">Məbləğ</th>
                <th className="px-8 py-4">Tarix</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map((order) => {
                const currentStatus = pendingChanges[order.id] || order.status;
                const isChanged = pendingChanges[order.id] !== undefined && pendingChanges[order.id] !== order.status;

                return (
                  <tr key={order.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="text-sm font-black text-slate-900">{order.customer.firstName} {order.customer.lastName}</div>
                      <div className="text-xs text-slate-400">{order.customer.email}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-xs font-black text-slate-900">{order.productName}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">{order.productBrand} x {order.quantity}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-black text-emerald-600">{order.totalPrice} AZN</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-xs text-slate-500">{new Date(order.date).toLocaleString('az-AZ')}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <select 
                          value={currentStatus} 
                          onChange={(e) => handlePendingChange(order.id, e.target.value)}
                          className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-none outline-none cursor-pointer transition-all ${getStatusColor(currentStatus)}`}
                        >
                          <option value="new">Yeni</option>
                          <option value="processing">Hazırlanır</option>
                          <option value="shipped">Yoldadır</option>
                          <option value="completed">Tamamlanıb</option>
                          <option value="cancelled">Ləğv edilib</option>
                        </select>
                        
                        {isChanged && (
                          <button 
                            onClick={() => handleConfirmStatus(order.id)}
                            className="bg-emerald-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg hover:bg-slate-900 transition-all animate-in fade-in zoom-in-90"
                          >
                            Təsdiq et
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(order.id)}
                          className="p-2 bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 text-xs italic">Hələ ki heç bir sifariş yoxdur.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Sifariş Detalları</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Müştəri</div>
                  <div className="text-sm font-bold text-slate-900">{selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</div>
                  <div className="text-sm font-bold text-slate-900">{selectedOrder.customer.email}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Telefon</div>
                  <div className="text-sm font-bold text-slate-900">{selectedOrder.customer.phone}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Şəhər / Ünvan</div>
                  <div className="text-sm font-bold text-slate-900">{selectedOrder.customer.city}, {selectedOrder.customer.address}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Məhsul Məlumatları</div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-black text-slate-900">{selectedOrder.productName}</div>
                    <div className="text-xs text-slate-500">{selectedOrder.productBrand}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900">{selectedOrder.quantity} ədəd</div>
                    <div className="text-sm font-black text-emerald-600">{selectedOrder.totalPrice} AZN</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ödəniş Üsulu</div>
                  <div className="text-xs font-bold text-slate-700 uppercase">
                    {selectedOrder.paymentMethod === 'cash_delivery' ? 'Çatdırılma zamanı nağd' : 'Onlayn ödəniş'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Çatdırılma</div>
                  <div className="text-xs font-bold text-slate-700 uppercase">
                    {selectedOrder.deliveryMethod === 'pickup' ? `Mağazadan təhvil (${selectedOrder.store})` : 'Ünvana çatdırılma'}
                  </div>
                </div>
              </div>

              {selectedOrder.extraInfo && (
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Əlavə Qeyd</div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-600 italic border border-slate-100">
                    "{selectedOrder.extraInfo}"
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button 
                  onClick={() => setSelectedOrder(null)}
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

export default AdminOrders;
