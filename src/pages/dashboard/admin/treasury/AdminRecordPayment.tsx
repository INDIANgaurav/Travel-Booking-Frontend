import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import toast from 'react-hot-toast';
import { Send, Banknote, RefreshCw } from 'lucide-react';

export default function AdminRecordPayment() {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    agency: '',
    paymentMode: '',
    adminBank: '',
    depositAmount: '',
    transactionNo: '',
    depositDate: '',
    depositAccount: '',
    depositBranch: '',
    remarks: '',
    type: 'INCOMING'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [agentsRes, banksRes, paymentsRes] = await Promise.all([
        api.get('/api/admin/users?role=B2B_AGENT,SUPPLIER_AGENT'),
        api.get('/api/finance/bank'),
        api.get('/api/finance/payment')
      ]);
      // Use just B2B agents or all users depending on requirements.
      // Assuming B2B agents are the main target for payments.
      setAgencies(agentsRes.data.data || agentsRes.data);
      setBanks(banksRes.data);
      setPayments(paymentsRes.data.data || paymentsRes.data || []);
    } catch (error) {
      toast.error('Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agency || !formData.paymentMode || !formData.adminBank) {
      return toast.error('Please fill all required fields');
    }

    setSubmitting(true);
    try {
      await api.post('/api/finance/payment', formData);
      toast.success('Payment recorded successfully! It is now pending approval.');
      setFormData({
        agency: '',
        paymentMode: '',
        adminBank: '',
        depositAmount: '',
        transactionNo: '',
        depositDate: '',
        depositAccount: '',
        depositBranch: '',
        remarks: '',
        type: formData.type
      });
      fetchInitialData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">Record Payment</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Log an incoming or outgoing payment manually.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
          <div className="flex gap-4 p-1.5 bg-slate-100 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'INCOMING' })}
              className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === 'INCOMING' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Add to Wallet (Agent Pays Us)
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'OUTGOING' })}
              className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === 'OUTGOING' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Deduct Wallet (We Pay Agent)
            </button>
          </div>
          <Banknote className={formData.type === 'INCOMING' ? 'text-emerald-500' : 'text-red-500'} size={32} opacity={0.2} />
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Agency / User *</label>
            <select
              value={formData.agency}
              onChange={e => setFormData({ ...formData, agency: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            >
              <option value="">-- Choose Agency --</option>
              {agencies.map((ag: any) => (
                <option key={ag._id} value={ag._id}>
                  {ag.companyName || ag.name} ({ag.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Payment Mode *</label>
            <select
              value={formData.paymentMode}
              onChange={e => setFormData({ ...formData, paymentMode: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            >
              <option value="">-- Select Mode --</option>
              <option value="IMPS">IMPS</option>
              <option value="NEFT">NEFT</option>
              <option value="RTGS">RTGS</option>
              <option value="UPI">UPI</option>
              <option value="CASH">CASH</option>
              <option value="CHEQUE">CHEQUE</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Our Bank Account *</label>
            <select
              value={formData.adminBank}
              onChange={e => setFormData({ ...formData, adminBank: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            >
              <option value="">-- Select Bank --</option>
              {banks.map((b: any) => (
                <option key={b._id} value={b._id}>{b.bankName} - {b.accountNo}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Amount (₹) *</label>
            <input
              type="number"
              required
              min="1"
              value={formData.depositAmount}
              onChange={e => setFormData({ ...formData, depositAmount: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              placeholder="e.g. 50000"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Transaction ID / Ref No *</label>
            <input
              required
              value={formData.transactionNo}
              onChange={e => setFormData({ ...formData, transactionNo: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              placeholder="e.g. UTR123456789"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Deposit Date *</label>
            <input
              type="date"
              required
              value={formData.depositDate}
              onChange={e => setFormData({ ...formData, depositDate: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Depositor Account No.</label>
            <input
              value={formData.depositAccount}
              onChange={e => setFormData({ ...formData, depositAccount: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              placeholder="Optional"
            />
          </div>

          <div className="lg:col-span-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Remarks</label>
            <input
              value={formData.remarks}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              placeholder="Add any notes here..."
            />
          </div>

          <div className="lg:col-span-3 flex justify-end mt-4 pt-6 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting || loading}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
              Submit Payment Record
            </button>
          </div>
        </form>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-gray-900">Payment History</h2>
          <p className="text-xs text-gray-500 mt-1">Recent incoming and outgoing payment records</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Agency / User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Mode</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Ref No</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length > 0 ? (
                payments.map((p: any) => (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                      {new Date(p.depositDate || p.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-800">{p.agency?.companyName || p.agency?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{p.agency?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-[10px] font-black tracking-wider uppercase rounded-lg ${p.type === 'INCOMING' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {p.type || 'INCOMING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">
                      ₹ {p.depositAmount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-semibold">{p.paymentMode}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{p.transactionNo}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-[10px] font-black tracking-wider uppercase rounded-lg ${
                        p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 
                        p.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {p.status || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">
                    {loading ? 'Loading history...' : 'No payment records found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
