import React, { useState, useEffect } from 'react';
import { Search, Download, FileText } from 'lucide-react';
import api from '../../../../services/api';
import toast from 'react-hot-toast';
import Loader from '../../../../components/common/Loader';
import DateRangeFilter from '../../../../components/ui/DateRangeFilter';
import { exportToCSV } from '../../../../utils/exportToCSV';

export default function AdminInvoiceCenter() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      // Re-using bookings API to generate the invoice report as they map to transactions
      const res = await api.get('/api/admin/bookings?limit=50');
      // Set only CONFIRMED bookings as invoices
      const confirmedBookings = (res.data.data || res.data).filter((b: any) => b.status === 'CONFIRMED');
      setInvoices(confirmedBookings);
    } catch (error) {
      toast.error('Failed to fetch invoice report data');
    } finally {
      setLoading(false);
    }
  };

  const getPassengerNames = (passengers: any[]) => {
    if (!passengers || !passengers.length) return 'N/A';
    return passengers.map(p => p.name).join(', ');
  };

  const filteredInvoices = invoices.filter(inv => {
    const searchMatch = inv.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        inv.user?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const invDate = new Date(inv.createdAt);
    const fromMatch = fromDate ? invDate >= new Date(fromDate) : true;
    const toMatch = toDate ? invDate <= new Date(toDate) : true;
    
    return searchMatch && fromMatch && toMatch;
  });

  const handleDownload = () => {
    if (!filteredInvoices || filteredInvoices.length === 0) {
      toast.error('No data to export');
      return;
    }
    const data = filteredInvoices.map((inv, idx) => ({
      'Transaction No': inv.bookingId,
      'Invoice Id': 1000 + idx,
      'Nett': Math.round(inv.totalAmount),
      'Booking Date': new Date(inv.createdAt).toLocaleDateString('en-GB'),
      'Journey Date': inv.details?.date || inv.date ? new Date(inv.details?.date || inv.date).toLocaleDateString('en-GB') : 'N/A',
      'Passenger Name': getPassengerNames(inv.details?.passengers),
      'Company Name': inv.user?.companyName || inv.user?.name || 'N/A',
      'Staff Id': inv.user?._id?.slice(-6).toUpperCase() || 'N/A'
    }));
    exportToCSV(data, 'Invoice_Report');
    toast.success('Report exported successfully');
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">Invoice Report</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">View and download GST invoices for completed transactions.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center w-full">
        <div className="flex-1 w-full">
          <DateRangeFilter
            fromDate={fromDate}
            toDate={toDate}
            onFromChange={setFromDate}
            onToChange={setToDate}
            searchQuery={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>
        <button 
          onClick={handleDownload}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 mb-6"
        >
          <Download size={18} />
          Export Report
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table matching the screenshot structure */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="h-64 flex items-center justify-center"><Loader /></div>
          ) : (
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-blue-500 text-white border-b border-slate-200">
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Transaction No</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Invoice Id</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-right">Nett</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Booking Date</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Journey Date</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Passenger Name</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Company Name</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Staff Id</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv, idx) => (
                  <tr key={inv._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-bold text-blue-600">{inv.bookingId}</td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-700">{1000 + idx}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-800 text-right">{Math.round(inv.totalAmount)}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      {new Date(inv.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      {inv.details?.date || inv.date ? new Date(inv.details?.date || inv.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 max-w-[200px] truncate" title={getPassengerNames(inv.details?.passengers)}>
                      {getPassengerNames(inv.details?.passengers)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">{inv.user?.companyName || inv.user?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">{inv.user?._id?.slice(-6).toUpperCase() || 'N/A'}</td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400 font-medium text-sm">
                      No invoices found for the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
