import React, { useState, useEffect } from 'react';
import { settingsApi } from '../../../../api/settingsApi';
import toast from 'react-hot-toast';
import { Loader2, CreditCard } from 'lucide-react';
import Dropdown from '../../../../components/ui/Dropdown';

export default function AdminPGMapping() {
  const [activeTab, setActiveTab] = useState<'MAPPED_USER' | 'USER_MAPPING'>('MAPPED_USER');
  const [mappings, setMappings] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    user: '',
    gatewayName: '',
    mode: '',
    chargeType: 'PERCENTAGE',
    chargeValue: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mapsRes, agentsRes] = await Promise.all([
        settingsApi.getPGMappings(),
        settingsApi.getAgents()
      ]);
      setMappings(mapsRes.data);
      setAgents(agentsRes.data);
    } catch (err: any) {
      toast.error('Failed to fetch PG data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.user) {
      toast.error('Please select a User');
      return;
    }
    if (!formData.gatewayName) {
      toast.error('Please select a Gateway');
      return;
    }
    if (!formData.mode) {
      toast.error('Please select a Mode');
      return;
    }
    if (!formData.chargeValue) {
      toast.error('Please enter a Charge Value');
      return;
    }

    try {
      await settingsApi.createPGMapping({
        ...formData,
        chargeValue: Number(formData.chargeValue)
      });
      toast.success('Mapping added successfully');
      setFormData({ user: '', gatewayName: '', mode: '', chargeType: 'PERCENTAGE', chargeValue: '' });
      fetchData();
      setActiveTab('MAPPED_USER'); // switch back to list
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add mapping');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-[#1e3a8a]" size={32} /></div>;

  const agentOptions = agents.map(a => ({ value: a._id, label: `${a.name} (${a.email})` }));
  const gatewayOptions = [
    { value: 'Razorpay', label: 'Razorpay' },
    { value: 'Stripe', label: 'Stripe' },
    { value: 'PayU', label: 'PayU' }
  ];
  const modeOptions = [
    { value: 'Credit Card', label: 'Credit Card' },
    { value: 'Debit Card', label: 'Debit Card' },
    { value: 'Net Banking', label: 'Net Banking' },
    { value: 'UPI', label: 'UPI' }
  ];
  const chargeTypeOptions = [
    { value: 'PERCENTAGE', label: 'Percentage (%)' },
    { value: 'FLAT', label: 'Flat Fee (₹)' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#1e3a8a] rounded-lg">
            <CreditCard size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Payment Gateway Mapping</h1>
            <p className="text-slate-500 text-sm mt-1">Configure PG charges and rules for users</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('MAPPED_USER')}
            className={`px-6 py-4 text-sm font-semibold transition-colors ${activeTab === 'MAPPED_USER' ? 'text-[#1e3a8a] border-b-2 border-[#1e3a8a]' : 'text-slate-500 hover:text-slate-700'}`}>
            PG MAPPED USER
          </button>
          <button 
            onClick={() => setActiveTab('USER_MAPPING')}
            className={`px-6 py-4 text-sm font-semibold transition-colors ${activeTab === 'USER_MAPPING' ? 'text-[#1e3a8a] border-b-2 border-[#1e3a8a]' : 'text-slate-500 hover:text-slate-700'}`}>
            PG USER MAPPING
          </button>
        </div>

        {activeTab === 'USER_MAPPING' ? (
          <div className="p-6">
            <h3 className="text-lg font-bold text-[#1e3a8a] mb-4">PG User Mapping</h3>
            <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex-1 min-w-[200px]">
                <Dropdown 
                  value={formData.user}
                  onChange={(val) => setFormData({...formData, user: val})}
                  options={agentOptions}
                  placeholder="--Select ReportingTO--"
                  searchable={true}
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <Dropdown 
                  value={formData.gatewayName}
                  onChange={(val) => setFormData({...formData, gatewayName: val})}
                  options={gatewayOptions}
                  placeholder="--Select PaymentGateway--"
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <Dropdown 
                  value={formData.mode}
                  onChange={(val) => setFormData({...formData, mode: val})}
                  options={modeOptions}
                  placeholder="--Select PaymentMode--"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <Dropdown 
                  value={formData.chargeType}
                  onChange={(val) => setFormData({...formData, chargeType: val})}
                  options={chargeTypeOptions}
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <input 
                  type="number"
                  placeholder="Enter Charge"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-xs font-bold text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1e3a8a] transition-all h-[36px]"
                  value={formData.chargeValue}
                  onChange={(e) => setFormData({...formData, chargeValue: e.target.value})}
                />
              </div>
              <button 
                onClick={handleAdd}
                className="bg-[#1e3a8a] hover:bg-[#172554] text-white px-6 py-2 rounded-lg font-bold transition-colors text-sm shadow-sm h-[36px]"
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto p-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200">
                  <th className="py-4 px-4 text-xs font-bold text-slate-700 uppercase tracking-wider">User</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Gateway</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Mode</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Charge</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map(map => (
                  <tr key={map._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-semibold text-slate-800">{map.user?.name || 'Unknown'}</td>
                    <td className="py-3 px-4 text-sm font-bold text-[#1e3a8a]">{map.gatewayName}</td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-600">{map.mode}</td>
                    <td className="py-3 px-4 text-sm font-bold text-slate-800 bg-slate-100/50">
                      {map.chargeType === 'PERCENTAGE' ? `${map.chargeValue}%` : `₹${map.chargeValue}`}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <button 
                        onClick={async () => {
                          if(confirm('Delete mapping?')) {
                            await settingsApi.deletePGMapping(map._id);
                            fetchData();
                          }
                        }}
                        className="text-red-500 hover:text-red-700 font-bold px-3 py-1 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {mappings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">No PG mappings found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
