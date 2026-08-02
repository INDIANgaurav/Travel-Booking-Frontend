import React, { useState, useEffect } from 'react';
import { Search, Download, FileText, X, Check, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import Dropdown from '../../components/ui/Dropdown';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SupplierQueueHistory: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const supplierName = (user as any)?.companyName || user?.name || (user as any)?.firstName || 'Supplier';

  const [fromDate, setFromDate] = useState('2026-07-22');
  const [toDate, setToDate] = useState('2026-07-22');
  const [supplier, setSupplier] = useState(supplierName);
  const [status, setStatus] = useState('All');
  const [searchBy, setSearchBy] = useState('');
  
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Set default dates on mount
  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    
    setFromDate(lastMonth.toISOString().split('T')[0]);
    setToDate(today.toISOString().split('T')[0]);
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      if (status !== 'All') params.append('status', status);
      if (searchBy) params.append('refNo', searchBy);

      const res = await api.get(`/api/series-fare/queue?${params.toString()}`);
      setQueue(Array.isArray(res.data) ? res.data : []);
      if (res.data.length === 0) toast('No queue records found', { icon: 'ℹ️' });
    } catch (err) {
      toast.error('Failed to load queue history');
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQueue();
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/api/series-fare/queue/${id}/status`, { status: newStatus });
      toast.success(`Request ${newStatus.toLowerCase()} successfully`);
      fetchQueue();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Outer Card with Blue Header Bar */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {/* Blue Header Bar */}
        <div className="bg-[#1d6aa3] text-white px-6 py-3">
          <h2 className="text-sm font-bold tracking-wider uppercase">
            PF QUEUE HISTORY
          </h2>
        </div>

        {/* Filter Form */}
        <form onSubmit={handleSubmit} className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">From Date*</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">To Date*</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Supplier*</label>
              <Dropdown
                value={supplier}
                onChange={setSupplier}
                options={[
                  { value: supplierName, label: supplierName },
                  { value: 'ALL', label: 'ALL SUPPLIERS' }
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Status*</label>
              <Dropdown
                value={status}
                onChange={setStatus}
                options={[
                  { value: 'All', label: 'All' },
                  { value: 'Active', label: 'Active' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Completed', label: 'Completed' }
                ]}
              />
            </div>

            <div>
              <button
                type="submit"
                className="bg-[#242b59] hover:bg-blue-900 text-white text-xs font-bold px-8 py-2.5 rounded transition-colors shadow-md w-full md:w-auto"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Search By row */}
          <div className="mt-4 flex items-center gap-2">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search By"
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value)}
                className="w-full text-xs px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <button type="button" className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors">
              <FileText size={16} />
            </button>
          </div>
        </form>

        {/* Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#e9ecef] text-gray-700 font-bold uppercase tracking-wider border-b border-gray-300">
              <tr>
                <th className="p-2.5 text-[11px]">S.NO</th>
                <th className="p-2.5 text-[11px]">PF REFNO</th>
                <th className="p-2.5 text-[11px]">REFNO</th>
                <th className="p-2.5 text-[11px]">SECTOR</th>
                <th className="p-2.5 text-[11px]">TRAVEL DATE</th>
                <th className="p-2.5 text-[11px]">GROSS</th>
                <th className="p-2.5 text-[11px]">NAME</th>
                <th className="p-2.5 text-[11px]">FLIGHT</th>
                <th className="p-2.5 text-[11px]">AIRLINE PNR</th>
                <th className="p-2.5 text-[11px]">TYPE</th>
                <th className="p-2.5 text-[11px]">CHANNEL</th>
                <th className="p-2.5 text-[11px]">REMARKS</th>
                <th className="p-2.5 text-[11px]">STATUS</th>
                <th className="p-2.5 text-[11px]">DATE</th>
                <th className="p-2.5 text-[11px]">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={15} className="p-8 text-center text-xs font-bold text-gray-500 bg-white">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Loading queue records...
                  </td>
                </tr>
              ) : queue.length === 0 && searched ? (
                <tr>
                  <td colSpan={15} className="p-8 text-center text-xs font-bold text-gray-800 bg-white">
                    No Records Found Yet...!
                  </td>
                </tr>
              ) : queue.length > 0 ? (
                queue.map((item, index) => {
                  const sf = item.seriesFareInfo;
                  const pax = item.details?.passengers?.[0];
                  return (
                    <tr key={item._id} className="hover:bg-blue-50/40 transition-colors border-b border-gray-100">
                      <td className="p-2.5">{index + 1}</td>
                      <td className="p-2.5 font-bold text-blue-600">{sf?.sfId || '—'}</td>
                      <td className="p-2.5 font-semibold text-gray-800">{item.bookingId}</td>
                      <td className="p-2.5 font-bold">{item.details?.from || sf?.origin} - {item.details?.to || sf?.destination}</td>
                      <td className="p-2.5">{item.date ? new Date(item.date).toLocaleDateString('en-GB') : '—'}</td>
                      <td className="p-2.5 font-bold text-gray-900">₹{item.totalAmount?.toLocaleString('en-IN')}</td>
                      <td className="p-2.5">{pax?.name || item.user?.name || '—'}</td>
                      <td className="p-2.5 font-mono text-gray-600">{sf?.flightNo || '—'}</td>
                      <td className="p-2.5 font-bold uppercase">{item.details?.pnr || '—'}</td>
                      <td className="p-2.5">{item.type || 'FLIGHT'}</td>
                      <td className="p-2.5">B2B</td>
                      <td className="p-2.5 truncate max-w-[100px]" title={item.remarks}>{item.remarks || '—'}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                          item.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          item.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-gray-500">{new Date(item.createdAt).toLocaleDateString('en-GB')}</td>
                      <td className="p-2.5">
                        {item.status === 'PENDING' ? (
                          <div className="flex gap-1">
                            <button onClick={() => updateStatus(item._id, 'CONFIRMED')} className="p-1 bg-green-500 text-white rounded hover:bg-green-600" title="Approve">
                              <Check size={14} />
                            </button>
                            <button onClick={() => updateStatus(item._id, 'CANCELLED')} className="p-1 bg-red-500 text-white rounded hover:bg-red-600" title="Reject">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Done</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={15} className="p-8 text-center text-xs font-bold text-gray-400 bg-white">
                    Submit filters to load records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierQueueHistory;
