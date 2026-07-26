import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, XCircle, TrendingDown, ChevronDown } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import api from '../../services/api';
import Dropdown from '../../components/ui/Dropdown';

const SupplierDashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const supplierName = (user as any)?.companyName || user?.name || (user as any)?.firstName || 'Supplier';

  const [supplierFilter, setSupplierFilter] = useState(supplierName);
  const [timeFilter, setTimeFilter] = useState('Day');
  const [summary, setSummary] = useState({
    bookingCount: 0,
    bookingValue: 0.00,
    cancellationCount: 0,
    cancellationValue: 0.00
  });

  useEffect(() => {
    fetchSummary();
  }, [timeFilter, supplierFilter]);

  const fetchSummary = async () => {
    try {
      const response = await api.get('/api/series-fare/summary');
      if (response.data && typeof response.data.bookingValue === 'number') {
        setSummary(response.data);
      }
    } catch (e) {
      // Use default reference UI values if endpoint is empty
    }
  };

  return (
    <div className="space-y-6">
      {/* Supplier Selector */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm max-w-sm">
        <label className="block text-xs font-bold text-gray-700 mb-1.5">Supplier *</label>
        <Dropdown 
          value={supplierFilter}
          onChange={setSupplierFilter}
          options={[
            { value: supplierName, label: supplierName },
            { value: 'ALL', label: 'ALL SUPPLIERS' }
          ]}
        />
      </div>

      {/* Overall Summary Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-6">
        <h3 className="text-sm font-bold text-gray-800">Overall Summary</h3>

        {/* Time Period Tabs */}
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 pb-4">
          <button 
            onClick={() => setTimeFilter('Day')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all border ${
              timeFilter === 'Day' 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Day <span className="block text-[9px] font-normal opacity-90">22 Jul</span>
          </button>

          <button 
            onClick={() => setTimeFilter('Week')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all border ${
              timeFilter === 'Week' 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Week <span className="block text-[9px] font-normal opacity-90">22 Jul - 16 Jul</span>
          </button>

          <button 
            onClick={() => setTimeFilter('Month')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all border ${
              timeFilter === 'Month' 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Month <span className="block text-[9px] font-normal opacity-90">July</span>
          </button>

          <button 
            onClick={() => setTimeFilter('Quarter')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all border ${
              timeFilter === 'Quarter' 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Quarter <span className="block text-[9px] font-normal opacity-90">Jul - Mar</span>
          </button>

          <button 
            onClick={() => setTimeFilter('Year')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all border ${
              timeFilter === 'Year' 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Year <span className="block text-[9px] font-normal opacity-90">2026</span>
          </button>

          <button className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-gray-100 transition-all ml-auto">
            <span>More Options</span>
            <ChevronDown size={14} />
          </button>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Booking Count */}
          <div className="bg-white border-l-4 border-l-blue-600 rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-3">
              <FileText size={20} />
            </div>
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Booking count</span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">{summary.bookingCount}</span>
          </div>

          {/* Card 2: Booking Value */}
          <div className="bg-white border-l-4 border-l-emerald-500 rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-3">
              <DollarSign size={20} />
            </div>
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Booking value</span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              ₹{(summary?.bookingValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Card 3: Cancellation Count */}
          <div className="bg-white border-l-4 border-l-amber-500 rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-3">
              <XCircle size={20} />
            </div>
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cancellation count</span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">{summary?.cancellationCount || 0}</span>
          </div>

          {/* Card 4: Cancellation Value */}
          <div className="bg-white border-l-4 border-l-pink-500 rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-lg flex items-center justify-center mb-3">
              <TrendingDown size={20} />
            </div>
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cancellation value</span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              ₹{(summary?.cancellationValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
