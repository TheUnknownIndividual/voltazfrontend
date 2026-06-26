
import React, { useState, useMemo, useEffect } from 'react';


interface AdminStatsProps {
  users: any[];
}

const AdminStats: React.FC<AdminStatsProps> = ({ users }) => {
  const [dynamicProducts, setDynamicProducts] = useState<string[]>([]);
  const [warehouseProducts, setWarehouseProducts] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);


  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [masterTypeFilter, setMasterTypeFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [productTypeFilter, setProductTypeFilter] = useState<string>('all');
  const [detailView, setDetailView] = useState<'none' | 'users' | 'masters' | 'customers' | 'products' | 'warehouse' | 'requests'>('none');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [inlineFilters, setInlineFilters] = useState<Record<string, string>>({});

  const toggleDetailView = (view: typeof detailView) => {
    if (detailView === view) {
      setDetailView('none');
    } else {
      setDetailView(view);
      setSortConfig(null);
      setInlineFilters({});
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return <span className="ml-1 opacity-20">↕</span>;
    return <span className="ml-1 text-current">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const applySortAndFilter = (data: any[]) => {
    let result = [...data];

    // Apply inline filters
    Object.keys(inlineFilters).forEach(key => {
      const filterValue = inlineFilters[key];
      if (filterValue && filterValue !== 'all') {
        result = result.filter(item => {
          const val = item[key]?.toString().toLowerCase();
          return val?.includes(filterValue.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = aVal?.toString().toLowerCase() || '';
        const bStr = bVal?.toString().toLowerCase() || '';
        
        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  };

  const cities = ['all', 'Bakı', 'Gəncə', 'Sumqayıt', 'Quba', 'Qusar', 'Lənkəran', 'Şəki', 'Bərdə', 'Mingəçevir', 'Naxçıvan'];
  const masterTypes = ['all', 'Mühəndis', 'Texnik', 'Elektrik', 'Quraşdırıcı', 'Layihəçi'];
  const productTypes = [
    'all', 
    'Günəş paneli', 
    'İnverter', 
    'Enerji saxlama sistemləri', 
    'Quraşdırma və montaj', 
    'Elektrik və bağlantı', 
    'Monitorinq və İdarəetmə'
  ];
  
  const productsList = dynamicProducts.length > 0 ? dynamicProducts : ['all', 'Huawei Inverter 5kW', 'Longi Solar Panel 450W', 'Trina Solar 550W', 'Smart Energy Meter'];

  // Mock sales data with more entries and types
  const mockSales = useMemo(() => [
    { id: 1, product: 'Huawei Inverter 5kW', type: 'İnverter', amount: 1200, date: '2024-05-10', city: 'Bakı' },
    { id: 2, product: 'Longi Solar Panel 450W', type: 'Günəş paneli', amount: 180, date: '2024-05-12', city: 'Gəncə' },
    { id: 3, product: 'Trina Solar 550W', type: 'Günəş paneli', amount: 220, date: '2024-04-15', city: 'Bakı' },
    { id: 4, product: 'Smart Energy Meter', type: 'Monitorinq və İdarəetmə', amount: 85, date: '2024-05-20', city: 'Sumqayıt' },
    { id: 5, product: 'Huawei Inverter 5kW', type: 'İnverter', amount: 1200, date: '2024-05-25', city: 'Quba' },
    { id: 6, product: 'Longi Solar Panel 450W', type: 'Günəş paneli', amount: 180, date: '2024-02-10', city: 'Bakı' },
    { id: 7, product: 'Trina Solar 550W', type: 'Günəş paneli', amount: 220, date: '2024-05-05', city: 'Lənkəran' },
    { id: 8, product: 'Smart Energy Meter', type: 'Monitorinq və İdarəetmə', amount: 85, date: '2024-05-08', city: 'Bakı' },
    { id: 9, product: 'Huawei Inverter 5kW', type: 'İnverter', amount: 1200, date: '2024-05-15', city: 'Sumqayıt' },
    { id: 10, product: 'Longi Solar Panel 450W', type: 'Günəş paneli', amount: 180, date: '2024-05-18', city: 'Gəncə' },
    { id: 11, product: 'Battery Storage 10kWh', type: 'Enerji saxlama sistemləri', amount: 4500, date: '2024-05-22', city: 'Bakı' },
  ], []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const cityMatch = cityFilter === 'all' || u.city === cityFilter;
      const typeMatch = masterTypeFilter === 'all' || u.masterType === masterTypeFilter;
      return cityMatch && typeMatch;
    });
  }, [users, cityFilter, masterTypeFilter]);

  const filteredMasters = useMemo(() => {
    return users.filter(u => u.role === 'master' && (cityFilter === 'all' || u.city === cityFilter) && (masterTypeFilter === 'all' || u.masterType === masterTypeFilter));
  }, [users, cityFilter, masterTypeFilter]);

  const filteredCustomers = useMemo(() => {
    return users.filter(u => u.role === 'user' && (cityFilter === 'all' || u.city === cityFilter));
  }, [users, cityFilter]);

  const salesStats = useMemo(() => {
    const filteredSales = mockSales.filter(s => {
      const saleDate = s.date.substring(0, 7); // YYYY-MM
      const dateMatch = saleDate === selectedMonth;
      const productMatch = productFilter === 'all' || s.product === productFilter;
      const typeMatch = productTypeFilter === 'all' || s.type === productTypeFilter;
      const cityMatch = cityFilter === 'all' || s.city === cityFilter;
      
      return dateMatch && productMatch && typeMatch && cityMatch;
    });

    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.amount, 0);
    const totalSold = filteredSales.length;

    return { totalRevenue, totalSold, filteredSales };
  }, [mockSales, selectedMonth, productFilter, productTypeFilter, cityFilter]);

  const warehouseStats = useMemo(() => {
    const totalItems = warehouseProducts.reduce((sum, p) => sum + p.count, 0);
    const totalValue = warehouseProducts.reduce((sum, p) => sum + (p.count * p.price), 0);
    return { totalItems, totalValue };
  }, [warehouseProducts]);

  const requestStats = useMemo(() => {
    return { total: requests.length };
  }, [requests]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-2xl font-black text-slate-900">Statistika</h3>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Şəhər Filtri</label>
          <select 
            value={cityFilter} 
            onChange={e => setCityFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs outline-none focus:border-emerald-500 transition-all"
          >
            {cities.map(c => <option key={c} value={c}>{c === 'all' ? 'Bütün Şəhərlər' : c}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usta Tipi Filtri</label>
          <select 
            value={masterTypeFilter} 
            onChange={e => setMasterTypeFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs outline-none focus:border-emerald-500 transition-all"
          >
            {masterTypes.map(t => <option key={t} value={t}>{t === 'all' ? 'Bütün Tiplər' : t}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Məhsul Filtri</label>
          <select 
            value={productFilter} 
            onChange={e => setProductFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs outline-none focus:border-emerald-500 transition-all"
          >
            {productsList.map(p => <option key={p} value={p}>{p === 'all' ? 'Bütün Məhsullar' : p}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Məhsul Tipi Filtri</label>
          <select 
            value={productTypeFilter} 
            onChange={e => setProductTypeFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs outline-none focus:border-emerald-500 transition-all"
          >
            {productTypes.map(t => <option key={t} value={t}>{t === 'all' ? 'Bütün Tiplər' : t}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tarix Seçimi</label>
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          onClick={() => toggleDetailView('requests')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer group ${detailView === 'requests' ? 'bg-blue-900 border-blue-900 shadow-xl shadow-blue-900/20' : 'bg-white border-slate-100 shadow-sm hover:border-blue-900'}`}
        >
          <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${detailView === 'requests' ? 'text-blue-100' : 'text-slate-400'}`}>Müraciətlər</div>
          <div className={`text-3xl font-black ${detailView === 'requests' ? 'text-white' : 'text-blue-900'}`}>{requestStats.total}</div>
          <div className={`text-[9px] mt-1 ${detailView === 'requests' ? 'text-blue-200' : 'text-slate-400'}`}>Ümumi müraciət sayı</div>
        </div>

        <div 
          onClick={() => toggleDetailView('warehouse')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer group ${detailView === 'warehouse' ? 'bg-amber-600 border-amber-600 shadow-xl shadow-amber-600/20' : 'bg-white border-slate-100 shadow-sm hover:border-amber-600'}`}
        >
          <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${detailView === 'warehouse' ? 'text-amber-100' : 'text-slate-400'}`}>Məhsullar (Ümumi)</div>
          <div className={`text-3xl font-black ${detailView === 'warehouse' ? 'text-white' : 'text-amber-600'}`}>{warehouseStats.totalItems}</div>
          <div className={`text-[9px] mt-1 ${detailView === 'warehouse' ? 'text-amber-200' : 'text-slate-400'}`}>Məhsulların ümumi sayı</div>
        </div>

        <div 
          onClick={() => toggleDetailView('warehouse')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer group ${detailView === 'warehouse' ? 'bg-emerald-600 border-emerald-600 shadow-xl shadow-emerald-600/20' : 'bg-white border-slate-100 shadow-sm hover:border-emerald-600'}`}
        >
          <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${detailView === 'warehouse' ? 'text-emerald-100' : 'text-slate-400'}`}>Məhsullar (Toplam Dəyər)</div>
          <div className={`text-3xl font-black ${detailView === 'warehouse' ? 'text-white' : 'text-emerald-600'}`}>{warehouseStats.totalValue.toLocaleString()} AZN</div>
          <div className={`text-[9px] mt-1 ${detailView === 'warehouse' ? 'text-emerald-200' : 'text-slate-400'}`}>Məhsulların ümumi dəyəri</div>
        </div>

        <div 
          onClick={() => toggleDetailView('products')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer group ${detailView === 'products' ? 'bg-purple-600 border-purple-600 shadow-xl shadow-purple-600/20' : 'bg-white border-slate-100 shadow-sm hover:border-purple-500'}`}
        >
          <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${detailView === 'products' ? 'text-purple-100' : 'text-slate-400'}`}>Satılan (Ədəd)</div>
          <div className={`text-3xl font-black ${detailView === 'products' ? 'text-white' : 'text-purple-600'}`}>{salesStats.totalSold}</div>
          <div className={`text-[9px] mt-1 ${detailView === 'products' ? 'text-purple-200' : 'text-slate-400'}`}>Filtrə uyğun satış sayı</div>
        </div>

        <div 
          onClick={() => {
            toggleDetailView('products');
            if (detailView !== 'products') {
              setSortConfig({ key: 'amount', direction: 'desc' });
            }
          }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-emerald-500 cursor-pointer transition-all"
        >
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Satış Məbləği</div>
          <div className="text-3xl font-black text-emerald-600">{salesStats.totalRevenue.toLocaleString()} AZN</div>
          <div className="text-[9px] text-slate-400 mt-1">Filtrə uyğun ümumi məbləğ</div>
        </div>

        <div 
          onClick={() => toggleDetailView('users')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer group ${detailView === 'users' ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-900/20' : 'bg-white border-slate-100 shadow-sm hover:border-slate-900'}`}
        >
          <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${detailView === 'users' ? 'text-slate-400' : 'text-slate-400'}`}>Ümumi İstifadəçi</div>
          <div className={`text-3xl font-black ${detailView === 'users' ? 'text-white' : 'text-slate-900'}`}>{users.length}</div>
          <div className={`text-[9px] mt-1 ${detailView === 'users' ? 'text-slate-500' : 'text-slate-400'}`}>Bütün rollar daxil</div>
        </div>

        <div 
          onClick={() => toggleDetailView('masters')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer group ${detailView === 'masters' ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-600/20' : 'bg-white border-slate-100 shadow-sm hover:border-blue-500'}`}
        >
          <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${detailView === 'masters' ? 'text-blue-100' : 'text-slate-400'}`}>Ümumi Ustalar</div>
          <div className={`text-3xl font-black ${detailView === 'masters' ? 'text-white' : 'text-blue-600'}`}>{filteredMasters.length}</div>
          <div className={`text-[9px] mt-1 ${detailView === 'masters' ? 'text-blue-200' : 'text-slate-400'}`}>Filtrə uyğun ustalar</div>
        </div>

        <div 
          onClick={() => toggleDetailView('customers')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer group ${detailView === 'customers' ? 'bg-emerald-600 border-emerald-600 shadow-xl shadow-emerald-600/20' : 'bg-white border-slate-100 shadow-sm hover:border-emerald-500'}`}
        >
          <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${detailView === 'customers' ? 'text-emerald-100' : 'text-slate-400'}`}>İstifadəçilər (Müştəri)</div>
          <div className={`text-3xl font-black ${detailView === 'customers' ? 'text-white' : 'text-emerald-600'}`}>{filteredCustomers.length}</div>
          <div className={`text-[9px] mt-1 ${detailView === 'customers' ? 'text-emerald-200' : 'text-slate-400'}`}>Filtrə uyğun müştərilər</div>
        </div>
      </div>

      {/* Detailed Views */}
      {detailView === 'requests' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-blue-50/30">
            <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest">Müraciət Detalları</h4>
            <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-full uppercase">Cəmi: {requests.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-4 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('name')}>
                    Ad / Email <SortIcon columnKey="name" />
                  </th>
                  <th className="px-8 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="cursor-pointer hover:text-blue-600" onClick={() => handleSort('type')}>
                        Tip <SortIcon columnKey="type" />
                      </span>
                      <select 
                        className="bg-white border border-slate-200 rounded px-1 py-0.5 text-[8px] font-black outline-none"
                        value={inlineFilters['type'] || 'all'}
                        onChange={(e) => setInlineFilters({...inlineFilters, type: e.target.value})}
                      >
                        <option value="all">Hamısı</option>
                        {Array.isArray(requests) && Array.from(new Set(requests.map(r => r?.type).filter(Boolean))).map(t => <option key={t as string} value={t as string}>{t as string}</option>)}
                      </select>
                    </div>
                  </th>
                  <th className="px-8 py-4 cursor-pointer hover:text-blue-600" onClick={() => handleSort('date')}>
                    Tarix <SortIcon columnKey="date" />
                  </th>
                  <th className="px-8 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="cursor-pointer hover:text-blue-600" onClick={() => handleSort('status')}>
                        Status <SortIcon columnKey="status" />
                      </span>
                      <select 
                        className="bg-white border border-slate-200 rounded px-1 py-0.5 text-[8px] font-black outline-none"
                        value={inlineFilters['status'] || 'all'}
                        onChange={(e) => setInlineFilters({...inlineFilters, status: e.target.value})}
                      >
                        <option value="all">Hamısı</option>
                        <option value="new">Yeni</option>
                        <option value="contacted">Əlaqə saxlanılıb</option>
                        <option value="closed">Bağlanıb</option>
                      </select>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {applySortAndFilter(requests).map((req: any) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="text-sm font-bold text-slate-900">{req.name}</div>
                      <div className="text-xs text-slate-400">{req.email}</div>
                    </td>
                    <td className="px-8 py-4 text-xs font-bold text-slate-600 uppercase tracking-tighter">{req.type}</td>
                    <td className="px-8 py-4 text-xs text-slate-500">{new Date(req.date).toLocaleDateString('az-AZ')}</td>
                    <td className="px-8 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${req.status === 'new' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detailView === 'warehouse' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-amber-50/30">
            <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest">Məhsul Siyahısı</h4>
            <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-3 py-1 rounded-full uppercase">Cəmi Dəyər: {warehouseStats.totalValue.toLocaleString()} AZN</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-4 cursor-pointer hover:text-amber-600" onClick={() => handleSort('name')}>
                    Məhsul <SortIcon columnKey="name" />
                  </th>
                  <th className="px-8 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="cursor-pointer hover:text-amber-600" onClick={() => handleSort('type')}>
                        Tip <SortIcon columnKey="type" />
                      </span>
                      <select 
                        className="bg-white border border-slate-200 rounded px-1 py-0.5 text-[8px] font-black outline-none"
                        value={inlineFilters['type'] || 'all'}
                        onChange={(e) => setInlineFilters({...inlineFilters, type: e.target.value})}
                      >
                        <option value="all">Hamısı</option>
                        {productTypes.filter(t => t !== 'all').map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </th>
                  <th className="px-8 py-4 cursor-pointer hover:text-amber-600 text-center" onClick={() => handleSort('count')}>
                    Sayı <SortIcon columnKey="count" />
                  </th>
                  <th className="px-8 py-4 cursor-pointer hover:text-amber-600 text-right" onClick={() => handleSort('price')}>
                    Qiymət <SortIcon columnKey="price" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {applySortAndFilter(warehouseProducts).map((prod: any) => (
                  <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4 text-sm font-bold text-slate-900">{prod.name}</td>
                    <td className="px-8 py-4 text-xs font-bold text-slate-600 uppercase tracking-widest">{prod.type}</td>
                    <td className="px-8 py-4 text-xs text-slate-500 font-black text-center">{prod.count} ədəd</td>
                    <td className="px-8 py-4 text-sm font-black text-emerald-600 text-right">{prod.price} AZN</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detailView === 'customers' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-emerald-50/30">
            <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest">Müştəri Siyahısı</h4>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full uppercase">Filtrlə: {filteredCustomers.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-4 cursor-pointer hover:text-emerald-600" onClick={() => handleSort('name')}>
                    Ad / Email <SortIcon columnKey="name" />
                  </th>
                  <th className="px-8 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="cursor-pointer hover:text-emerald-600" onClick={() => handleSort('city')}>
                        Şəhər <SortIcon columnKey="city" />
                      </span>
                      <select 
                        className="bg-white border border-slate-200 rounded px-1 py-0.5 text-[8px] font-black outline-none"
                        value={inlineFilters['city'] || 'all'}
                        onChange={(e) => setInlineFilters({...inlineFilters, city: e.target.value})}
                      >
                        {cities.map(c => <option key={c} value={c}>{c === 'all' ? 'Hamısı' : c}</option>)}
                      </select>
                    </div>
                  </th>
                  <th className="px-8 py-4 cursor-pointer hover:text-emerald-600 text-right" onClick={() => handleSort('totalSpent')}>
                    Ümumi Alış <SortIcon columnKey="totalSpent" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {applySortAndFilter(filteredCustomers).map((user: any) => (
                  <tr key={user.email} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="text-sm font-bold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </td>
                    <td className="px-8 py-4 text-xs text-slate-500">{user.city || '-'}</td>
                    <td className="px-8 py-4 text-sm font-black text-emerald-600 text-right">{user.totalSpent || 0} AZN</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detailView === 'users' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50">
            <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest">Bütün İstifadəçilər</h4>
            <span className="text-[10px] font-black text-slate-600 bg-slate-200 px-3 py-1 rounded-full uppercase">Cəmi: {users.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('name')}>
                    Ad / Email <SortIcon columnKey="name" />
                  </th>
                  <th className="px-8 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="cursor-pointer hover:text-slate-900" onClick={() => handleSort('role')}>
                        Rol <SortIcon columnKey="role" />
                      </span>
                      <select 
                        className="bg-white border border-slate-200 rounded px-1 py-0.5 text-[8px] font-black outline-none"
                        value={inlineFilters['role'] || 'all'}
                        onChange={(e) => setInlineFilters({...inlineFilters, role: e.target.value})}
                      >
                        <option value="all">Hamısı</option>
                        <option value="admin">Admin</option>
                        <option value="master">Usta</option>
                        <option value="user">Müştəri</option>
                      </select>
                    </div>
                  </th>
                  <th className="px-8 py-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('city')}>
                    Şəhər <SortIcon columnKey="city" />
                  </th>
                  <th className="px-8 py-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('registrationDate')}>
                    Tarix <SortIcon columnKey="registrationDate" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {applySortAndFilter(users).map((user: any) => (
                  <tr key={user.email} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="text-sm font-bold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-red-50 text-red-600' : user.role === 'master' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-xs text-slate-500">{user.city || '-'}</td>
                    <td className="px-8 py-4 text-xs text-slate-500">{user.registrationDate?.split('T')[0] || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detailView === 'masters' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-blue-50/30">
            <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest">Usta Siyahısı</h4>
            <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-full uppercase">Filtrlə: {filteredMasters.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-4 cursor-pointer hover:text-blue-600" onClick={() => handleSort('name')}>
                    Ad / Email <SortIcon columnKey="name" />
                  </th>
                  <th className="px-8 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="cursor-pointer hover:text-blue-600" onClick={() => handleSort('masterType')}>
                        Tip <SortIcon columnKey="masterType" />
                      </span>
                      <select 
                        className="bg-white border border-slate-200 rounded px-1 py-0.5 text-[8px] font-black outline-none"
                        value={inlineFilters['masterType'] || 'all'}
                        onChange={(e) => setInlineFilters({...inlineFilters, masterType: e.target.value})}
                      >
                        {masterTypes.map(t => <option key={t} value={t}>{t === 'all' ? 'Hamısı' : t}</option>)}
                      </select>
                    </div>
                  </th>
                  <th className="px-8 py-4 cursor-pointer hover:text-blue-600" onClick={() => handleSort('city')}>
                    Şəhər <SortIcon columnKey="city" />
                  </th>
                  <th className="px-8 py-4 cursor-pointer hover:text-blue-600" onClick={() => handleSort('isApproved')}>
                    Status <SortIcon columnKey="isApproved" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {applySortAndFilter(filteredMasters).map((user: any) => (
                  <tr key={user.email} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="text-sm font-bold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </td>
                    <td className="px-8 py-4 text-xs font-bold text-slate-600">{user.masterType || '-'}</td>
                    <td className="px-8 py-4 text-xs text-slate-500">{user.city || '-'}</td>
                    <td className="px-8 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${user.isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {user.isApproved ? 'Təsdiqli' : 'Gözləyir'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detailView === 'products' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-purple-50/30">
            <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest">Satılan Məhsullar</h4>
            <span className="text-[10px] font-black text-purple-600 bg-purple-100 px-3 py-1 rounded-full uppercase">{selectedMonth} üzrə: {salesStats.totalSold}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-4 cursor-pointer hover:text-purple-600" onClick={() => handleSort('product')}>
                    Məhsul Adı <SortIcon columnKey="product" />
                  </th>
                  <th className="px-8 py-4 cursor-pointer hover:text-purple-600" onClick={() => handleSort('city')}>
                    Şəhər <SortIcon columnKey="city" />
                  </th>
                  <th className="px-8 py-4 cursor-pointer hover:text-purple-600" onClick={() => handleSort('date')}>
                    Tarix <SortIcon columnKey="date" />
                  </th>
                  <th className="px-8 py-4 cursor-pointer hover:text-purple-600 text-right" onClick={() => handleSort('amount')}>
                    Məbləğ <SortIcon columnKey="amount" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {applySortAndFilter(salesStats.filteredSales).map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4 text-sm font-bold text-slate-900">{sale.product}</td>
                    <td className="px-8 py-4 text-xs text-slate-500">{sale.city}</td>
                    <td className="px-8 py-4 text-xs text-slate-500">{sale.date}</td>
                    <td className="px-8 py-4 text-sm font-black text-emerald-600 text-right">{sale.amount} AZN</td>
                  </tr>
                ))}
                {salesStats.filteredSales.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400 text-xs italic">Seçilmiş tarixdə satış tapılmadı.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Default Table (Always visible or replaced by detail view) */}
      {detailView === 'none' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-slate-50">
            <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest">Son Satışlar</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-4">Məhsul</th>
                  <th className="px-8 py-4">Şəhər</th>
                  <th className="px-8 py-4">Tarix</th>
                  <th className="px-8 py-4 text-right">Məbləğ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {mockSales.slice(0, 5).map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4 text-sm font-bold text-slate-900">{sale.product}</td>
                    <td className="px-8 py-4 text-xs text-slate-500">{sale.city}</td>
                    <td className="px-8 py-4 text-xs text-slate-500">{sale.date}</td>
                    <td className="px-8 py-4 text-sm font-black text-emerald-600 text-right">{sale.amount} AZN</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStats;
