import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { Plane, Plus } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface BankDetailsData {
  _id?: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  status: string;
}

const B2BBankDetails: React.FC = () => {
  const loggedInUser = useSelector((state: RootState) => state.auth.user);
  const agentName = loggedInUser?.companyName || (loggedInUser?.firstName ? `${loggedInUser.firstName} ${loggedInUser.lastName || ''}`.trim() : loggedInUser?.name) || '';
  const agentEmail = loggedInUser?.email || '';
  const agentPhone = loggedInUser?.phone || '';
  const agentBalance = loggedInUser?.walletBalance ?? loggedInUser?.balance ?? 0;
  const brandName = loggedInUser?.companyName || 'AGENCY';

  const [bankDetails, setBankDetails] = useState<BankDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    accountName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: ''
  });

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      const { data } = await api.get('/api/bank-details');
      setBankDetails(data);
    } catch (error) {
      console.log('No bank details found');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/bank-details', formData);
      setBankDetails(data.bankDetails);
      setShowForm(false);
    } catch (error) {
      toast.error('Failed to save bank details');
    }
  };

  return (
    <div className="flex-1 w-full bg-white p-6">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-6">
        
        {/* Left Sidebar Profile Card */}
        <div className="w-full md:w-[320px] shrink-0 flex flex-col gap-4">
          <div className="bg-gradient-to-br from-[#0b1031] to-blue-900 rounded-t-2xl p-8 text-center shadow-lg relative overflow-hidden border-b border-white/10">
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
            
            <h2 className="text-white font-black text-xl uppercase tracking-widest relative z-10">{agentName}</h2>
            <p className="text-blue-200/80 text-xs font-bold mt-2 relative z-10 flex items-center justify-center gap-1.5"><Plane size={12} className="rotate-45"/> {agentEmail}</p>
            <p className="text-blue-200/80 text-xs font-bold mt-1 relative z-10">{agentPhone}</p>
          </div>
          
          <div className="bg-white rounded-b-2xl p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col items-center relative z-10 -mt-2">
            {/* Brand Logo */}
            <div className="flex flex-col items-center justify-center gap-3 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg border-2 border-white transform rotate-3">
                <div className="-rotate-3">{brandName.charAt(0).toUpperCase()}</div>
              </div>
              <span className="text-lg font-black tracking-tight text-[#0b1031] uppercase truncate max-w-[180px]">{brandName}</span>
            </div>
            
            <div className="text-center w-full">
              <p className="text-gray-600 text-sm font-bold flex items-center justify-center gap-2">
                Balance <span className="text-[#0c1a40] text-xl font-black">₹{agentBalance.toFixed(2)}</span>
              </p>
              
              <button className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-black text-sm hover:from-blue-700 hover:to-blue-800 transition-all shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_12px_25px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 mx-auto">
                Topup
              </button>
            </div>
          </div>
        </div>

        {/* Right Content Table */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
            <div>
              <h2 className="text-[#0b1031] font-black text-lg">Bank Accounts</h2>
              <p className="text-gray-500 text-xs font-semibold">Manage your registered agency bank details.</p>
            </div>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="bg-[#0b1031] text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-md hover:bg-blue-900 flex items-center gap-2 transition-transform hover:-translate-y-0.5"
            >
              <Plus size={14} /> Add Bank Account
            </button>
          </div>

          {showForm ? (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-md font-bold mb-4 text-[#0c1a40]">Bank Information</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Bank Name</label>
                  <input required name="bankName" value={formData.bankName} onChange={handleInputChange} className="w-full border p-2 rounded-lg text-sm" placeholder="e.g. HDFC Bank" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Account Holder Name</label>
                  <input required name="accountName" value={formData.accountName} onChange={handleInputChange} className="w-full border p-2 rounded-lg text-sm" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Account Number</label>
                  <input required name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} className="w-full border p-2 rounded-lg text-sm" placeholder="e.g. 50100..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">IFSC Code</label>
                  <input required name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} className="w-full border p-2 rounded-lg text-sm" placeholder="e.g. HDFC0001" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Branch Name</label>
                  <input required name="branchName" value={formData.branchName} onChange={handleInputChange} className="w-full border p-2 rounded-lg text-sm" placeholder="e.g. Main Branch" />
                </div>
                <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm font-bold hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-[#0b1031] text-white rounded-lg text-sm font-bold hover:bg-blue-900">Save Details</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] self-start w-full">
              <table className="w-full text-left text-sm text-[#0c1a40] whitespace-nowrap">
                <thead className="bg-[#0b1031] text-white text-[10px] uppercase font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">BANK NAME</th>
                    <th className="px-6 py-4">ACCOUNT HOLDER NAME</th>
                    <th className="px-6 py-4">ACCOUNT NUMBER</th>
                    <th className="px-6 py-4">BRANCH NAME</th>
                    <th className="px-6 py-4">IFSC CODE</th>
                    <th className="px-6 py-4">STATUS</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 font-semibold text-xs text-gray-700">
                  {loading ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading details...</td></tr>
                  ) : bankDetails ? (
                    <tr className="hover:bg-blue-50/50 transition">
                      <td className="px-6 py-5">{bankDetails.bankName}</td>
                      <td className="px-6 py-5">{bankDetails.accountName}</td>
                      <td className="px-6 py-5">{bankDetails.accountNumber}</td>
                      <td className="px-6 py-5 uppercase">{bankDetails.branchName}</td>
                      <td className="px-6 py-5">{bankDetails.ifscCode}</td>
                      <td className="px-6 py-5 text-amber-600">{bankDetails.status}</td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        No Bank Details added yet. Please add your bank information.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default B2BBankDetails;
