import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Search, Filter } from 'lucide-react';
import api from '../../../services/api';

interface UserLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function UserLedgerModal({ isOpen, onClose, user }: UserLedgerModalProps) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [category, setCategory] = useState('ALL');
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isOpen && user?._id) {
      fetchData();
    }
  }, [isOpen, user?._id, page]);

  const fetchData = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      let url = `/api/account-statement?page=${page}&limit=50&userId=${user._id}`;
      if (fromDate && toDate) {
        url += `&fromDate=${fromDate}&toDate=${toDate}`;
      }
      const res = await api.get(url);
      if (res.data && res.data.data) {
        setData(res.data.data);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching ledger statement:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-900 to-gray-800 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide">Ledger Account</h2>
              <p className="text-xs text-gray-300 font-bold uppercase">{user.name} • {user.email || 'N/A'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors bg-white/5">
            <X size={20} />
          </button>
        </div>

        {/* Details & Filters */}
        <div className="bg-gray-50 border-b border-gray-200 shrink-0">
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-black text-gray-800 uppercase tracking-widest">{user.companyName || user.name}</h3>
              <p className="text-xs font-bold text-gray-500 mt-1">Phone: {user.phone}</p>
              <p className="text-xs font-bold text-gray-500">Address: {user.address || 'Not Provided'}</p>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-white border-t border-gray-100 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">From Date</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">To Date</label>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700">
                <option value="ALL">-- ALL --</option>
                <option value="FLIGHT">Flight</option>
                <option value="HOTEL">Hotel</option>
                <option value="TOPUP">Wallet Topup</option>
              </select>
            </div>
            <button onClick={() => { setPage(1); fetchData(); }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-sm">
              <Search size={16} /> {loading ? 'Fetching...' : 'Fetch'}
            </button>
            
            <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg transition-all shadow-sm ml-auto">
              <Download size={16} /> Download
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#4285F4] text-white sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider border-r border-blue-400/30">Txn Date</th>
                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider border-r border-blue-400/30">ID</th>
                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider border-r border-blue-400/30">TxnId // Remarks</th>
                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider border-r border-blue-400/30">Narration</th>
                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider border-r border-blue-400/30 text-right">DR</th>
                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider border-r border-blue-400/30 text-right">CR</th>
                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider border-r border-blue-400/30 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {loading && data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500 font-bold bg-gray-50">
                    Loading ledger data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400 font-bold bg-gray-50">
                    <div className="flex flex-col items-center justify-center">
                      <Filter size={32} className="mb-3 opacity-20" />
                      No transactions found for the selected period.
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 text-xs font-semibold text-gray-700 border-r border-gray-100/50">
                      {new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      <br/>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(row.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-800 border-r border-gray-100/50">
                      {row._id?.substring(row._id.length - 6).toUpperCase() || '-'}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-600 border-r border-gray-100/50">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded mr-2 font-mono text-[10px]">
                        {row.referenceNumber || row.transactionId || '-'}
                      </span>
                      {row.description || '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-medium border-r border-gray-100/50">
                      -
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-red-500 text-right border-r border-gray-100/50">
                      {row.debit > 0 ? row.debit.toLocaleString() : '0'}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-emerald-500 text-right border-r border-gray-100/50">
                      {row.credit > 0 ? row.credit.toLocaleString() : '0'}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-blue-600 text-right">
                      {row.balance?.toLocaleString() || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-gray-100 font-black text-gray-800 sticky bottom-0">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right uppercase border-t border-gray-200">Total Cash Balance</td>
                <td className="px-4 py-3 text-right text-red-600 border-t border-gray-200">₹0</td>
                <td className="px-4 py-3 text-right text-emerald-600 border-t border-gray-200">₹0</td>
                <td className="px-4 py-3 text-right text-blue-600 border-t border-gray-200">₹{user.walletBalance || 0}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        {/* Pagination Controls */}
        {data.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
