import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import Dropdown from '../../../components/ui/Dropdown';
import { CheckCircle, XCircle, Clock, Search, Wallet, RefreshCw } from 'lucide-react';

export default function AdminOfflineTopUps() {
  const [activeTab, setActiveTab] = useState<'RECHARGE' | 'REQUESTS'>('RECHARGE');
  const [agencies, setAgencies] = useState<any[]>([]);

  // Recharge State
  const [rechargeData, setRechargeData] = useState({
    agencyId: '',
    amount: '',
    paymentMode: '',
    processingFee: '',
    remarks: ''
  });
  const [isRecharging, setIsRecharging] = useState(false);

  // Requests Queue State
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ id: string, action: 'approve' | 'reject' } | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'REQUESTS') {
      fetchRequests();
    }
  }, [activeTab, filter]);

  const fetchInitialData = async () => {
    try {
      const res = await api.get('/api/admin/users?role=B2B_AGENT,SUPPLIER_AGENT');
      setAgencies(res.data.data || res.data);
    } catch (error) {
      console.error('Failed to fetch agencies');
    }
  };

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const url = filter === 'ALL' ? '/api/wallet/offline-topup' : `/api/wallet/offline-topup?status=${filter}`;
      const { data } = await api.get(url);
      setRequests(data);
    } catch (error: any) {
      toast.error('Failed to fetch offline topup requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleRechargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rechargeData.agencyId || !rechargeData.amount || !rechargeData.paymentMode) {
      return toast.error('Please fill required fields');
    }

    setIsRecharging(true);
    try {
      await api.post(`/api/wallet/admin/recharge`, rechargeData);
      toast.success('Wallet recharged successfully!');
      setRechargeData({ agencyId: '', amount: '', paymentMode: '', processingFee: '', remarks: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to recharge wallet');
    } finally {
      setIsRecharging(false);
    }
  };

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    setConfirmAction({ id, action });
  };

  const confirmSubmitAction = async () => {
    if (!confirmAction) return;
    const { id, action } = confirmAction;
    
    try {
      await api.put(`/api/wallet/offline-topup/${id}/${action}`);
      toast.success(`Request ${action}d successfully`);
      setConfirmAction(null);
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} request`);
    }
  };

  const filteredRequests = requests.filter(req => 
    req.agentId?.agencyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.agentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.chequeNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">Wallet Recharge</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Manual wallet top-up and offline request approvals.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('RECHARGE')}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'RECHARGE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Recharge Wallet
          </button>
          <button 
            onClick={() => setActiveTab('REQUESTS')}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'REQUESTS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Requests Queue
          </button>
        </div>
      </div>

      {activeTab === 'RECHARGE' ? (
        <div className="bg-white rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100/60 overflow-hidden animate-in fade-in duration-300">
          <div className="px-8 py-6 border-b border-slate-100/60 bg-gradient-to-r from-slate-50/50 to-white">
            <h2 className="text-slate-800 font-black text-xl flex items-center gap-3">
              <div className="p-2 bg-indigo-100/50 rounded-xl text-indigo-600">
                <Wallet size={20} />
              </div>
              Wallet Recharge
            </h2>
            <p className="text-slate-500 text-sm mt-1 ml-[44px]">Credit an agency's wallet directly via secure transfer.</p>
          </div>
          
          <form onSubmit={handleRechargeSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
              
              <div className="lg:col-span-3 z-30">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Agency <span className="text-red-500">*</span></label>
                <Dropdown 
                  value={rechargeData.agencyId}
                  onChange={val => setRechargeData({ ...rechargeData, agencyId: val })}
                  options={agencies.map(a => ({ value: a._id, label: `${a.agencyName || a.name} (${a.email})` }))}
                  placeholder="Search and select agency..."
                  searchable={true}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recharge Amount <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input 
                    type="number"
                    required
                    value={rechargeData.amount}
                    onChange={e => setRechargeData({ ...rechargeData, amount: e.target.value })}
                    className="w-full pl-9 pr-5 py-3.5 bg-slate-50/50 border border-slate-200/80 rounded-2xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all hover:bg-white hover:border-slate-300"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="z-20">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payment Mode</label>
                <Dropdown 
                  value={rechargeData.paymentMode}
                  onChange={val => setRechargeData({ ...rechargeData, paymentMode: val })}
                  options={[
                    { value: 'UPI', label: 'UPI' },
                    { value: 'IMPS', label: 'IMPS' },
                    { value: 'NEFT', label: 'NEFT' },
                    { value: 'RTGS', label: 'RTGS' },
                    { value: 'CASH', label: 'CASH' },
                    { value: 'CHEQUE', label: 'CHEQUE' }
                  ]}
                  placeholder="Select Mode"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Processing Fee</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input 
                    type="number"
                    value={rechargeData.processingFee}
                    onChange={e => setRechargeData({ ...rechargeData, processingFee: e.target.value })}
                    className="w-full pl-9 pr-5 py-3.5 bg-slate-50/50 border border-slate-200/80 rounded-2xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all hover:bg-white hover:border-slate-300"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Remarks / Notes</label>
                  <textarea 
                    rows={2}
                    value={rechargeData.remarks}
                    onChange={e => setRechargeData({ ...rechargeData, remarks: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200/80 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all hover:bg-white hover:border-slate-300 resize-none"
                    placeholder="Add reference ID or short note..."
                  />
                </div>
                
                <div className="flex flex-col justify-center bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100/50">
                  <label className="block text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Total Amount Credited</label>
                  <div className="text-3xl font-black text-indigo-700 tracking-tight">
                    ₹{Number(rechargeData.amount || 0) + Number(rechargeData.processingFee || 0)}
                  </div>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end gap-4 mt-10 pt-6 border-t border-slate-100/60">
              <button 
                type="button"
                onClick={() => setRechargeData({ agencyId: '', amount: '', paymentMode: '', processingFee: '', remarks: '' })}
                className="px-6 py-3 text-slate-500 hover:text-slate-800 text-sm font-bold rounded-2xl transition-colors"
              >
                Clear Form
              </button>
              <button 
                type="submit"
                disabled={isRecharging}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-bold rounded-2xl shadow-[0_4px_15px_-3px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_20px_-6px_rgba(79,70,229,0.4)] transition-all flex items-center gap-2 disabled:opacity-70 disabled:pointer-events-none hover:-translate-y-0.5"
              >
                {isRecharging && <RefreshCw size={16} className="animate-spin" />}
                Confirm Recharge
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-300">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50">
            <div className="flex gap-2">
              {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${filter === f ? 'bg-[#0c1a40] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text"
                placeholder="Search agent or ref no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-bold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Agent</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingRequests ? (
                  <tr><td colSpan={6} className="text-center py-10 font-medium text-slate-500">Loading requests...</td></tr>
                ) : filteredRequests.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-500 font-medium text-sm">No requests found.</td></tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 font-medium">
                        {new Date(req.createdAt).toLocaleDateString()}<br/>
                        <span className="text-xs">{new Date(req.createdAt).toLocaleTimeString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#0c1a40]">{req.agentId?.agencyName || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{req.agentId?.agencyCode || req.agentId?.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-700">{req.paymentMode}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Ref/Cheque: <span className="font-mono font-bold">{req.referenceNumber || req.chequeNumber || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800">
                        ₹{req.amount}
                      </td>
                      <td className="px-6 py-4">
                        {req.status === 'PENDING' ? (
                          <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center w-fit gap-1"><Clock size={12}/> {req.status}</span>
                        ) : req.status === 'APPROVED' ? (
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center w-fit gap-1"><CheckCircle size={12}/> {req.status}</span>
                        ) : (
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center w-fit gap-1"><XCircle size={12}/> {req.status}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {req.status === 'PENDING' ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleAction(req._id, 'approve')} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded transition shadow-sm">Approve</button>
                            <button onClick={() => handleAction(req._id, 'reject')} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded transition">Reject</button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-slate-800 mb-2">Confirm Action</h3>
            <p className="text-slate-600 text-sm mb-6">
              Are you sure you want to <strong className={confirmAction.action === 'approve' ? 'text-emerald-600' : 'text-red-600 uppercase'}>{confirmAction.action}</strong> this request? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSubmitAction}
                className={`px-4 py-2 text-white text-sm font-bold rounded-xl transition-colors shadow-md ${
                  confirmAction.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Yes, {confirmAction.action} it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
