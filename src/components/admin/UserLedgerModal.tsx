import React, { useState, useEffect } from 'react';
import { X, Calendar, Download, RefreshCw, FileText } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface LedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export default function UserLedgerModal({ isOpen, onClose, userId, userName }: LedgerModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Date filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    if (isOpen && userId) {
      fetchData();
    }
  }, [isOpen, userId, page, fromDate, toDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = `/api/account-statement?page=${page}&limit=10&userId=${userId}`;
      
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
      toast.error('Failed to fetch ledger details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    toast.success('Downloading Ledger...');
    // Real export functionality would go here (or call an API to generate excel)
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Ledger History</h2>
              <p className="text-xs text-gray-500 font-medium">{userName || 'Agent'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
              <Calendar size={14} className="text-gray-400" />
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                className="bg-transparent text-xs text-gray-700 font-medium focus:outline-none"
              />
            </div>
            <span className="text-xs text-gray-400 font-medium">to</span>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
              <Calendar size={14} className="text-gray-400" />
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                className="bg-transparent text-xs text-gray-700 font-medium focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => fetchData()}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button 
              onClick={handleDownload}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download size={14} />
              Export
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto bg-gray-50/30">
          {loading && data.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FileText size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">No ledger records found.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="sticky top-0 bg-white border-b border-gray-100 shadow-sm z-10">
                <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4 whitespace-nowrap">Date</th>
                  <th className="px-6 py-4 whitespace-nowrap">Txn ID / Ref</th>
                  <th className="px-6 py-4">Remarks</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap text-red-500">Debit (DR)</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap text-emerald-500">Credit (CR)</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="text-xs font-semibold text-gray-900">
                        {new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium">
                        {new Date(row.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className="text-xs font-mono font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        {row.referenceNumber || row.transactionId || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-xs text-gray-600 font-medium line-clamp-2" title={row.description}>
                        {row.description || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right">
                      <span className="text-xs font-bold text-red-600">
                        {row.debit > 0 ? `₹${row.debit.toLocaleString()}` : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right">
                      <span className="text-xs font-bold text-emerald-600">
                        {row.credit > 0 ? `₹${row.credit.toLocaleString()}` : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right">
                      <span className="text-xs font-bold text-gray-900">
                        ₹{row.balance?.toLocaleString() || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <span className="text-xs font-semibold text-gray-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button 
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
