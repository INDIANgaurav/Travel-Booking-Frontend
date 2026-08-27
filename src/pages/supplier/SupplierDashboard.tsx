import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, XCircle, TrendingDown, ChevronDown } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import api from '../../services/api';
import Dropdown from '../../components/ui/Dropdown';
import DOBCalendar from '../../components/ui/DOBCalendar';
import { format, startOfWeek, endOfWeek, startOfQuarter, endOfQuarter, startOfMonth, endOfMonth } from 'date-fns';

const SupplierDashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const supplierName = (user as any)?.companyName || user?.name || (user as any)?.firstName || 'Supplier';
  const supplierId = user?._id;

  const [supplierFilter, setSupplierFilter] = useState(supplierName);
  const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  
  const [summary, setSummary] = useState({
    bookingCount: 0,
    bookingValue: 0.00,
    cancellationCount: 0,
    cancellationValue: 0.00
  });

  useEffect(() => {
    fetchSummary();
  }, [supplierFilter]);

  const fetchSummary = async () => {
    try {
      const filterValue = supplierFilter === 'ALL' || supplierFilter === 'ALL SUPPLIERS' ? 'ALL' : (supplierFilter === supplierName ? supplierId : supplierFilter);
      const url = `/api/series-fare/summary?timeFilter=Custom&supplierId=${filterValue}&fromDate=${fromDate}&toDate=${toDate}`;
      const response = await api.get(url);
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
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        <h3 className="text-sm font-bold text-gray-800">Overall Summary</h3>

        {/* Time Period Selection */}
        <div className="flex flex-wrap items-end gap-4 border-b border-gray-100 pb-5 relative z-50">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold tracking-wide text-gray-600">From Date</span>
            <div className="w-[160px] h-[38px] border border-gray-200 rounded-lg relative bg-white flex items-center px-3 shadow-sm focus-within:border-emerald-500 transition-colors z-50">
              <div className="absolute inset-0 [&>div]:h-full [&>div>div:first-child]:h-full [&>div>div:first-child]:border-none [&>div>div:first-child]:bg-transparent">
                <DOBCalendar 
                  value={fromDate} 
                  onChange={setFromDate} 
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold tracking-wide text-gray-600">To Date</span>
            <div className="w-[160px] h-[38px] border border-gray-200 rounded-lg relative bg-white flex items-center px-3 shadow-sm focus-within:border-emerald-500 transition-colors z-50">
              <div className="absolute inset-0 [&>div]:h-full [&>div>div:first-child]:h-full [&>div>div:first-child]:border-none [&>div>div:first-child]:bg-transparent">
                <DOBCalendar 
                  value={toDate} 
                  onChange={setToDate} 
                />
              </div>
            </div>
          </div>

          <button 
            onClick={() => fetchSummary()}
            className="bg-emerald-600 text-white px-6 h-[38px] rounded-lg text-xs font-bold hover:bg-emerald-700 transition shadow-sm ml-2"
          >
            Get Statement
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
          {!user?.roles?.includes('SUPPLIER_STAFF') && (
            <div className="bg-white border-l-4 border-l-emerald-500 rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-3">
                <DollarSign size={20} />
              </div>
              <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Booking value</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block">
                ₹{(summary?.bookingValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {/* Card 3: Cancellation Count */}
          <div className="bg-white border-l-4 border-l-amber-500 rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-3">
              <XCircle size={20} />
            </div>
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cancellation count</span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">{summary?.cancellationCount || 0}</span>
          </div>

          {/* Card 4: Cancellation Value */}
          {!user?.roles?.includes('SUPPLIER_STAFF') && (
            <div className="bg-white border-l-4 border-l-pink-500 rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-lg flex items-center justify-center mb-3">
                <TrendingDown size={20} />
              </div>
              <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cancellation value</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block">
                ₹{(summary?.cancellationValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
