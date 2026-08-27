import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Trash2, ArchiveRestore, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import RefreshButton from '../../../components/ui/RefreshButton';

interface IFareArchive {
  _id: string;
  sfId: string;
  supplierName: string;
  origin: string;
  destination: string;
  travelDate: string;
  totalSeats: number;
  blockedSeat: number;
  availableSeats: number;
  airlinePnr: string;
  adtFare: number;
  flightNo: string;
  airline: string;
  status: string;
}

export default function AdminFDArchive() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [archives, setArchives] = useState<IFareArchive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchArchives = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/api/series-fare/archive');
      setArchives(data);
    } catch (error) {
      console.error('Failed to fetch archives', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  const handleRestore = async () => {
    if (!selectedIds.length) return;
    const loadingToast = toast.loading('Restoring...');
    try {
      setIsProcessing(true);
      await api.put('/api/series-fare/bulk-archive', { ids: selectedIds, isArchived: false });
      setSelectedIds([]);
      fetchArchives();
      toast.success('Restored successfully', { id: loadingToast });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to restore archives', { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm('Are you sure you want to permanently delete these items? This cannot be undone.')) return;
    
    const loadingToast = toast.loading('Deleting permanently...');
    try {
      setIsProcessing(true);
      await api.delete('/api/series-fare/bulk-delete', { data: { ids: selectedIds } });
      setSelectedIds([]);
      fetchArchives();
      toast.success('Deleted permanently', { id: loadingToast });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete items', { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === archives.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(archives.map(a => a._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <ArchiveRestore className="text-blue-600" />
          Series Fare Archive
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Manage completed or deleted fixed departures</p>
      </div>

      <div className="bg-white flex-1 rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        {/* Top Controls */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-full max-w-md">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by ID, Owner, Sector or PNR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors">
              <Search size={16} />
            </button>
          </div>
          <RefreshButton onClick={fetchArchives} loading={isLoading} count={archives.length} />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-[#f8fafc] text-gray-900 font-black border-b border-gray-200 sticky top-0 z-10 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input type="checkbox" className="rounded border-gray-300" checked={selectedIds.length === archives.length && archives.length > 0} onChange={toggleSelectAll} />
                </th>
                <th className="p-3 text-center">ID</th>
                <th className="p-3">OWNER</th>
                <th className="p-3">SECTOR</th>
                <th className="p-3">ONWARD DATE</th>
                <th className="p-3 text-center">RETURN DATE</th>
                <th className="p-3 text-center" title="Total Seats">TTL</th>
                <th className="p-3 text-center" title="Blocked Seats">BLK</th>
                <th className="p-3 text-center" title="Available Seats">AVL</th>
                <th className="p-3 text-center">PNR</th>
                <th className="p-3 text-right">BUY PRICE</th>
                <th className="p-3 text-right">TOTAL FARE</th>
                <th className="p-3 text-center">FLIGHT</th>
                <th className="p-3 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={14} className="p-8 text-center text-gray-500 font-bold">
                    <Loader2 className="animate-spin mx-auto mb-2" />
                    Loading Archives...
                  </td>
                </tr>
              ) : archives.length === 0 ? (
                <tr>
                  <td colSpan={14} className="p-8 text-center text-gray-500 font-bold">No archived fares found.</td>
                </tr>
              ) : archives.map((item) => (
                <tr key={item._id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-3 text-center">
                    <input type="checkbox" className="rounded border-gray-300" checked={selectedIds.includes(item._id)} onChange={() => toggleSelect(item._id)} />
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-blue-600">{item.sfId}</td>
                  <td className="p-3 text-gray-700 font-bold">{item.supplierName}</td>
                  <td className="p-3 text-gray-900 font-bold">{item.origin}-{item.destination}</td>
                  <td className="p-3 text-gray-600">{new Date(item.travelDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="p-3 text-center text-gray-400">-</td>
                  <td className="p-3 text-center font-bold text-gray-800">{item.totalSeats}</td>
                  <td className="p-3 text-center font-bold text-gray-500">{0}</td>
                  <td className="p-3 text-center font-bold text-blue-600">{item.availableSeats}</td>
                  <td className="p-3 text-center font-mono text-gray-600 uppercase">{item.airlinePnr}</td>
                  <td className="p-3 text-right font-bold text-gray-700">₹{item.adtFare}</td>
                  <td className="p-3 text-right font-bold text-gray-900">₹{item.adtFare}</td>
                  <td className="p-3 text-center font-mono text-gray-500">{item.airline}({item.flightNo})</td>
                  <td className="p-3 text-center">
                    <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold border border-red-200">
                      Archived
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-md">
              <span className="text-blue-600 mr-1">{selectedIds.length}</span> items selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleRestore}
              disabled={selectedIds.length === 0 || isProcessing}
              className="bg-white border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 hover:text-slate-900 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm"
            >
              {isProcessing ? <Loader2 size={14} className="animate-spin text-blue-600" /> : <RotateCcw size={14} className="text-blue-600" />}
              Restore Selected
            </button>
            <button 
              onClick={handlePermanentDelete}
              disabled={selectedIds.length === 0 || isProcessing}
              className="bg-rose-50 border border-rose-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-100 text-rose-700 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm"
            >
              <Trash2 size={14} />
              Permanently Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
