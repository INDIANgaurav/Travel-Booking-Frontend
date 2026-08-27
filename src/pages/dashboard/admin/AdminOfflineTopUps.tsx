import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, Search } from 'lucide-react';

export default function AdminOfflineTopUps() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const [confirmAction, setConfirmAction] = useState<{ id: string, action: 'approve' | 'reject' } | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const url = filter === 'ALL' ? '/api/wallet/offline-topup' : `/api/wallet/offline-topup?status=${filter}`;
      const { data } = await api.get(url);
      setRequests(data);
    } catch (error: any) {
      toast.error('Failed to fetch offline topup requests');
    } finally {
      setLoading(false);
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
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0c1a40]">Offline Top-Up Requests</h1>
          <p className="text-gray-500 font-bold text-sm">Verify and approve manual bank transfers</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
            <thead className="bg-gray-50 text-gray-600 font-bold text-xs uppercase">
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
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10">Loading...</td></tr>
              ) : filteredRequests.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-500">No requests found.</td></tr>
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
                      {(req.depositedBank || req.depositedAccountNo) && (
                         <div className="text-xs text-gray-500">Bank: {req.depositedBank} ({req.depositedAccountNo})</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-[15px] text-blue-600">₹{req.amount.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-6 py-4">
                      {req.status === 'PENDING' && <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full"><Clock size={12}/> Pending</span>}
                      {req.status === 'APPROVED' && <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full"><CheckCircle size={12}/> Approved</span>}
                      {req.status === 'REJECTED' && <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded-full"><XCircle size={12}/> Rejected</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === 'PENDING' ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleAction(req._id, 'approve')} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded transition">Approve</button>
                          <button onClick={() => handleAction(req._id, 'reject')} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold rounded transition">Reject</button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Processed by {req.processedBy?.name || 'Admin'}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-[#0c1a40] mb-2">Confirm Action</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to <strong className={confirmAction.action === 'approve' ? 'text-green-600' : 'text-red-600 uppercase'}>{confirmAction.action}</strong> this request? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSubmitAction}
                className={`px-4 py-2 text-white text-sm font-bold rounded-lg transition-colors ${
                  confirmAction.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
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
