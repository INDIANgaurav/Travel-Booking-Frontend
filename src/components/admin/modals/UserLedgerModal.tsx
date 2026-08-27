import React, { useState } from 'react';
import { X, FileText, Download, Search, Filter } from 'lucide-react';

interface UserLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function UserLedgerModal({ isOpen, onClose, user }: UserLedgerModalProps) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [category, setCategory] = useState('ALL');

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
            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-sm">
              <Search size={16} /> Fetch
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
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400 font-bold bg-gray-50">
                  <div className="flex flex-col items-center justify-center">
                    <Filter size={32} className="mb-3 opacity-20" />
                    No transactions found for the selected period.
                  </div>
                </td>
              </tr>
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
      </div>
    </div>
  );
}
