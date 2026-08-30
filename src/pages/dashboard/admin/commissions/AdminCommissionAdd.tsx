import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Dropdown from '../../../../components/ui/Dropdown';
import api from '../../../../services/api';
import toast from 'react-hot-toast';

const feeTypes = [
  { id: 'commission', label: 'Commission' },
  { id: 'gstCommission', label: 'GST (On Commission)' },
  { id: 'tdsCommission', label: 'TDS (On Commission)' },
  { id: 'managementFee', label: 'Management Fee' },
  { id: 'gstManagementFee', label: 'GST (On Management Fee)' },
  { id: 'hiddenMarkup', label: 'Hidden Markup add to basic', hasCheckbox: true },
  { id: 'seatWiseIncrement', label: 'Seat Wise Increment' },
  { id: 'rescheduleCharges', label: 'ReSchedule Charges' },
  { id: 'instantDiscount', label: 'Instant Discount' },
];

const AdminCommissionAdd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    priority: '1',
    type: 'Domestic',
    category: 'FLIGHT',
    status: false,
    airline: '',
  });

  // State to hold the matrix values
  // Matrix key format: `${feeTypeId}_${columnId}`
  const [matrix, setMatrix] = useState<Record<string, string | boolean>>({});
  const [loading, setLoading] = useState(false);

  const handleMatrixChange = (feeId: string, colId: string, value: string | boolean) => {
    setMatrix(prev => ({
      ...prev,
      [`${feeId}_${colId}`]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }

    try {
      setLoading(true);
      await api.post('/api/commissions', {
        ...formData,
        fees: matrix
      });
      toast.success('Commission plan saved successfully!');
      navigate('/admin/commissions');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save commission plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/commissions')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-slate-500" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Add Revenue Policy</h1>
          <p className="text-slate-500 text-sm mt-1">Define base revenue, margins, and taxes for the policy</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100/60 overflow-hidden">
        
        {/* Top Header Fields */}
        <div className="p-8 border-b border-slate-100/60 bg-gradient-to-r from-slate-50/50 to-white">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-end">
            <div className="xl:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Policy Name *</label>
              <input 
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                placeholder="e.g. Premium B2B Route"
              />
            </div>

            <div className="z-20">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Scope *</label>
              <input 
                type="number"
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              />
            </div>

            <div className="z-20">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Market Type *</label>
              <Dropdown 
                value={formData.type}
                onChange={val => setFormData({ ...formData, type: val })}
                options={[
                  { value: 'Domestic', label: 'Domestic' },
                  { value: 'International', label: 'International' }
                ]}
              />
            </div>

            <div className="z-20">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Services *</label>
              <Dropdown 
                value={formData.category}
                onChange={val => setFormData({ ...formData, category: val })}
                options={[
                  { value: 'FLIGHT', label: 'FLIGHT' },
                  { value: 'HOTEL', label: 'HOTEL' }
                ]}
              />
            </div>

            <div className="xl:col-span-3 z-10">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Carrier</label>
              <Dropdown 
                value={formData.airline}
                onChange={val => setFormData({ ...formData, airline: val })}
                options={[
                  { value: '', label: 'Select Carrier' },
                  { value: 'ALL', label: 'All Carriers' },
                  { value: '6E', label: 'IndiGo (6E)' },
                  { value: 'AI', label: 'Air India (AI)' }
                ]}
              />
            </div>
            
            <div className="flex items-center h-[50px]">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox"
                    checked={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.checked })}
                    className="w-6 h-6 rounded-lg border-2 border-slate-300 appearance-none checked:bg-indigo-600 checked:border-indigo-600 transition-colors cursor-pointer"
                  />
                  {formData.status && <div className="absolute inset-0 flex items-center justify-center text-white pointer-events-none"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>}
                </div>
                <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Active Policy</span>
              </label>
            </div>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-black">
                <th className="px-6 py-4 w-[250px]">Component</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Mode</th>
                <th className="px-6 py-4">Cap</th>
                <th className="px-6 py-4">Calculation</th>
                <th className="px-6 py-4">Interval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {feeTypes.map((fee) => (
                <tr key={fee.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {fee.hasCheckbox && (
                         <div className="relative flex items-center">
                          <input 
                            type="checkbox"
                            checked={(matrix[`${fee.id}_checkbox`] as boolean) || false}
                            onChange={e => handleMatrixChange(fee.id, 'checkbox', e.target.checked)}
                            className="w-5 h-5 rounded-md border-2 border-slate-300 appearance-none checked:bg-indigo-600 checked:border-indigo-600 transition-colors cursor-pointer"
                          />
                          {(matrix[`${fee.id}_checkbox`] as boolean) && <div className="absolute inset-0 flex items-center justify-center text-white pointer-events-none"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>}
                        </div>
                      )}
                      <span className="text-sm font-bold text-slate-700">{fee.label}</span>
                    </div>
                  </td>
                  
                  {/* Base Fare */}
                  <td className="px-4 py-3">
                    <input 
                      type="number"
                      placeholder="0.0"
                      value={(matrix[`${fee.id}_base`] as string) || ''}
                      onChange={e => handleMatrixChange(fee.id, 'base', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200/80 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all focus:bg-white"
                    />
                  </td>

                  {/* PF (Mode) */}
                  <td className="px-4 py-3">
                    <select
                      value={(matrix[`${fee.id}_pf`] as string) || '%'}
                      onChange={e => handleMatrixChange(fee.id, 'pf', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200/80 rounded-xl text-sm font-semibold appearance-none focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all focus:bg-white"
                    >
                      <option value="%">% (Percent)</option>
                      <option value="F">Flat Rate</option>
                    </select>
                  </td>

                  {/* Gross */}
                  <td className="px-4 py-3">
                    <div className="relative">
                      <input 
                        type="number"
                        placeholder="0.0"
                        value={(matrix[`${fee.id}_gross`] as string) || ''}
                        onChange={e => handleMatrixChange(fee.id, 'gross', e.target.value)}
                        className="w-full pl-4 pr-8 py-2 bg-slate-50/50 border border-slate-200/80 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all focus:bg-white"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                    </div>
                  </td>

                  {/* Flat */}
                  <td className="px-4 py-3">
                    <div className="relative">
                      <input 
                        type="number"
                        placeholder="0.0"
                        value={(matrix[`${fee.id}_flat`] as string) || ''}
                        onChange={e => handleMatrixChange(fee.id, 'flat', e.target.value)}
                        className="w-full pl-8 pr-4 py-2 bg-slate-50/50 border border-slate-200/80 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all focus:bg-white"
                      />
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                    </div>
                  </td>

                  {/* Frequency */}
                  <td className="px-4 py-3 min-w-[200px]">
                    <Dropdown 
                      value={(matrix[`${fee.id}_frequency`] as string) || ''}
                      onChange={val => handleMatrixChange(fee.id, 'frequency', val)}
                      options={[
                        { value: '', label: 'Select Frequency' },
                        { value: 'PPP Sector', label: 'PPP Sector' },
                        { value: 'Per Pax', label: 'Per Pax' },
                        { value: 'Per Booking', label: 'Per Booking' }
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/80 backdrop-blur-md border-t border-slate-200/60 p-4 px-8 flex justify-end z-40">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
        >
          <Save size={18} />
          {loading ? 'Saving...' : 'Save Policy'}
        </button>
      </div>
    </div>
  );
};

export default AdminCommissionAdd;
