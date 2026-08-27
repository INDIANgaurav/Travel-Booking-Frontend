import React, { useState } from 'react';
import { X, CreditCard, Banknote, Calendar, MessageSquare, History } from 'lucide-react';

interface AssignCreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSave: (data: any) => Promise<void>;
}

export default function AssignCreditModal({ isOpen, onClose, user, onSave }: AssignCreditModalProps) {
  const [amount, setAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    if (!amount) return;
    setIsSaving(true);
    try {
      await onSave({
        creditBalance: (user.creditBalance || 0) + Number(amount),
        // If the backend supports it, we send these:
        // remarks,
        // expiryDate
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-gray-50 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col md:flex-row">
        
        {/* Left side: Form */}
        <div className="flex-1 bg-white p-0 flex flex-col">
          <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-800 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                <CreditCard size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-wide">Credit Setup</h2>
                <p className="text-xs text-blue-100 font-bold uppercase">{user.name} • {user.agentStatus || 'AGENT'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors md:hidden">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 md:p-8 flex-1">
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs font-bold text-blue-500 uppercase mb-1">Current Balance</p>
                <p className="text-2xl font-black text-blue-900">₹{user.walletBalance || 0}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Total Credit Limit</p>
                <p className="text-2xl font-black text-emerald-900">₹{user.creditBalance || 0}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="flex text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 gap-2"><Banknote size={14}/> Add/Revoke Limit</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Enter amount (use -ve for reversal)" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-black text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="flex text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 gap-2"><Calendar size={14}/> Expiry Date</label>
                  <input 
                    type="date" 
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <p className="text-[10px] text-gray-400 font-semibold mt-2">* Available balance will be locked automatically on expiry.</p>
                </div>
              </div>
              <div>
                <label className="flex text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 gap-2"><MessageSquare size={14}/> Remarks</label>
                <input 
                  type="text" 
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Add a note..." 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving || !amount}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              {isSaving ? 'Processing...' : 'Save Limit'}
            </button>
          </div>
        </div>

        {/* Right side: History (Demo UI) */}
        <div className="w-full md:w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between hidden md:flex">
             <h3 className="font-bold text-gray-700 flex items-center gap-2"><History size={16}/> Recent Statements</h3>
             <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
              <X size={20} />
            </button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden text-center p-8">
               <History size={32} className="mx-auto text-gray-300 mb-3" />
               <p className="text-sm font-bold text-gray-400">No recent credit statements found for this user.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
