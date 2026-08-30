import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import toast from 'react-hot-toast';
import { Plus, Building2, Trash2, CheckCircle } from 'lucide-react';
import Loader from '../../../../components/common/Loader';

export default function AdminBankAccounts() {
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'VIEW' | 'ADD'>('VIEW');

  // Form State
  const [formData, setFormData] = useState({
    bankName: '',
    accountNo: '',
    accountName: '',
    branch: '',
    ifscCode: '',
    upiId: ''
  });

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/finance/bank');
      setBanks(res.data);
    } catch (error) {
      toast.error('Failed to fetch bank accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/finance/bank', formData);
      toast.success('Bank account added successfully!');
      setFormData({ bankName: '', accountNo: '', accountName: '', branch: '', ifscCode: '', upiId: '' });
      setActiveTab('VIEW');
      fetchBanks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add bank account');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this bank account?')) return;
    try {
      await api.delete(`/api/finance/bank/${id}`);
      toast.success('Bank account removed');
      fetchBanks();
    } catch (error: any) {
      toast.error('Failed to remove bank account');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">Bank Accounts</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Manage treasury accounts for incoming agent payments.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('VIEW')}
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'VIEW' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            View Banks
          </button>
          <button 
            onClick={() => setActiveTab('ADD')}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'ADD' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Plus size={16} /> Add New
          </button>
        </div>
      </div>

      {activeTab === 'ADD' ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Building2 className="text-indigo-500" size={20} />
            Add New Bank Details
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Bank Name *</label>
              <input required value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. HDFC Bank" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Account Name *</label>
              <input required value={formData.accountName} onChange={e => setFormData({...formData, accountName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. TrippeChalo Pvt Ltd" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Account Number *</label>
              <input required value={formData.accountNo} onChange={e => setFormData({...formData, accountNo: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. 50200000000" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Branch *</label>
              <input required value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. CP, New Delhi" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">IFSC Code *</label>
              <input required value={formData.ifscCode} onChange={e => setFormData({...formData, ifscCode: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold uppercase focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. HDFC0000001" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">UPI ID (Optional)</label>
              <input value={formData.upiId} onChange={e => setFormData({...formData, upiId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. pay@bank" />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-4">
              <button type="submit" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2">
                <CheckCircle size={18} /> Save Bank Account
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Account Details</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Bank & Branch</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">IFSC / UPI</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {banks.map(bank => (
                  <tr key={bank._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{bank.accountName}</p>
                      <p className="text-xs font-mono font-medium text-slate-500 mt-1">{bank.accountNo}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{bank.bankName}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">{bank.branch}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono font-bold text-slate-800">{bank.ifscCode}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">{bank.upiId || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(bank._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Bank"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {banks.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium text-sm">
                      No active bank accounts found. Click "Add New" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
