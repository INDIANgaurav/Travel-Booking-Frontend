import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, Search, ExternalLink } from 'lucide-react';
import Loader from '../../../../components/common/Loader';

export default function AdminSettlementQueue() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'INCOMING' | 'OUTGOING'>('INCOMING');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [tab, statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      let url = `/api/finance/payment?type=${tab}`;
      if (statusFilter !== 'ALL') {
        url += `&status=${statusFilter}`;
      }
      const res = await api.get(url);
      setPayments(res.data);
    } catch (error) {
      toast.error('Failed to fetch settlement queue');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this payment?`)) return;
    try {
      await api.put(`/api/finance/payment/${id}/status`, { status });
      toast.success(`Payment ${status.toLowerCase()} successfully`);
      fetchPayments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update payment status');
    }
  };

  const filteredPayments = payments.filter(p => 
    p.transactionNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.agency?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.agency?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">Settlement Queue</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Manage incoming and outgoing payment approvals.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button 
              onClick={() => setTab('INCOMING')}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${tab === 'INCOMING' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              Incoming Payments
            </button>
            <button 
              onClick={() => setTab('OUTGOING')}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${tab === 'OUTGOING' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              Outgoing Payments
            </button>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search Txn ID, Agency..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-64 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="h-64 flex items-center justify-center"><Loader /></div>
          ) : (
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">Date & Txn ID</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">Agency Details</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">Bank Details</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">
                        {new Date(payment.depositDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-xs font-mono font-medium text-slate-500 mt-1">{payment.transactionNo}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-indigo-700">{payment.agency?.companyName || payment.agency?.name}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">Via: {payment.paymentMode}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-700">{payment.adminBank?.bankName}</p>
                      <p className="text-xs text-slate-500 mt-1">A/c: {payment.adminBank?.accountNo}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={`text-sm font-black ${tab === 'INCOMING' ? 'text-emerald-600' : 'text-red-600'}`}>
                        ₹{payment.depositAmount?.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider
                        ${payment.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : ''}
                        ${payment.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : ''}
                        ${payment.status === 'REJECTED' ? 'bg-red-100 text-red-700' : ''}
                      `}>
                        {payment.status === 'PENDING' && <Clock size={12} className="mr-1" />}
                        {payment.status === 'APPROVED' && <CheckCircle size={12} className="mr-1" />}
                        {payment.status === 'REJECTED' && <XCircle size={12} className="mr-1" />}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {payment.status === 'PENDING' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleStatusUpdate(payment._id, 'APPROVED')}
                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(payment._id, 'REJECTED')}
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded transition-colors"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-xs font-bold text-slate-400">Processed</div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium text-sm">
                      No payments found in this queue.
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
