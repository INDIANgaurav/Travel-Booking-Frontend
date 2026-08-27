import React, { useState, useEffect, useRef } from 'react';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Plus, CreditCard, FileText, Settings, MoreVertical, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Agent {
  _id: string;
  name: string;
  companyName: string;
  email: string;
}

interface CugMapping {
  _id: string;
  agent: Agent;
  creditLimit: number;
  cashBalance: number;
  runningBalance: number;
  isActive: boolean;
}

interface Supplier {
  _id: string;
  name: string;
  cugEnabled: boolean;
}

const CugSuppliersManager = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [mappings, setMappings] = useState<CugMapping[]>([]);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [isCreditNoteModalOpen, setIsCreditNoteModalOpen] = useState(false);
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<CugMapping | null>(null);
  const [creditAmount, setCreditAmount] = useState<number | ''>('');
  const [creditNoteDesc, setCreditNoteDesc] = useState('');
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [commissionPlans, setCommissionPlans] = useState<any[]>([]);
  const [selectedCommissionPlanId, setSelectedCommissionPlanId] = useState('');
  const [selectedAgentToAdd, setSelectedAgentToAdd] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetchSuppliers();
    fetchAvailableAgents();
  }, []);

  useEffect(() => {
    if (selectedSupplier) {
      fetchMappings(selectedSupplier);
    } else {
      setMappings([]);
    }
  }, [selectedSupplier]);

  const fetchSuppliers = async () => {
    try {
      const { data } = await api.get('/api/suppliers');
      const cugSuppliers = (data.suppliers || data).filter((s: Supplier) => s.cugEnabled);
      setSuppliers(cugSuppliers);
      if (cugSuppliers.length > 0) {
        setSelectedSupplier(cugSuppliers[0]._id);
      }
    } catch (err) {
      toast.error('Failed to load suppliers');
    }
  };

  const fetchAvailableAgents = async () => {
    try {
      const { data } = await api.get('/api/suppliers/agents/available');
      setAvailableAgents(data);
    } catch (err) {
      toast.error('Failed to load agents');
    }
  };

  const fetchMappings = async (supplierId: string) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/suppliers/${supplierId}/cug-mappings`);
      setMappings(data);
    } catch (err) {
      toast.error('Failed to load CUG agents');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCreditNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMapping || Number(creditAmount) <= 0) return;
    try {
      await api.post(`/api/suppliers/cug-mappings/${selectedMapping._id}/credit-note`, {
        amount: Number(creditAmount),
        description: creditNoteDesc
      });
      toast.success('Credit note added successfully!');
      setIsCreditNoteModalOpen(false);
      fetchMappings(selectedSupplier);
    } catch (err) {
      toast.error('Failed to add credit note');
    }
  };

  const handleUpdateCreditLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMapping) return;
    try {
      await api.post(`/api/suppliers/${selectedSupplier}/cug-mappings`, {
        agentId: selectedMapping.agent._id,
        creditLimit: creditAmount
      });
      toast.success('Credit limit updated!');
      setIsCreditModalOpen(false);
      fetchMappings(selectedSupplier);
    } catch (err) {
      toast.error('Failed to update limit');
    }
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentToAdd || !selectedSupplier) return;
    try {
      await api.post(`/api/suppliers/${selectedSupplier}/cug-mappings`, {
        agentId: selectedAgentToAdd,
        creditLimit: Number(creditAmount)
      });
      toast.success('Agent added to CUG!');
      setIsAddAgentModalOpen(false);
      setCreditAmount('');
      setSelectedAgentToAdd('');
      fetchMappings(selectedSupplier);
    } catch (err) {
      toast.error('Failed to add agent');
    }
  };

  const fetchCommissionPlans = async () => {
    try {
      const { data } = await api.get('/api/suppliers/commission-plans');
      setCommissionPlans(data);
      if (data.length > 0) {
        setSelectedCommissionPlanId(data[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch commission plans', err);
    }
  };

  const handleMapCommissionPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMapping || !selectedCommissionPlanId) return;
    try {
      await api.post(`/api/suppliers/cug-mappings/${selectedMapping._id}/commission-plan`, {
        commissionPlanId: selectedCommissionPlanId
      });
      toast.success('Commission Plan mapped successfully!');
      setIsCommissionModalOpen(false);
      fetchMappings(selectedSupplier);
    } catch (err) {
      toast.error('Failed to map commission plan');
    }
  };

  const filteredMappings = mappings.filter(m => 
    m.agent?.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.agent?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalOutstanding = mappings.reduce((acc, curr) => acc + curr.runningBalance, 0);

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight uppercase">My CUG Enabled Suppliers</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Total Outstanding: <span className="text-red-600 font-bold">₹{totalOutstanding.toLocaleString()}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
            >
              <option value="" disabled className="text-slate-400">Select Supplier</option>
              {suppliers.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s._id.slice(-4).toUpperCase()})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100 bg-white">
          <div className="relative w-full sm:w-96">
            <input 
              type="text" 
              placeholder="Search company, name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          
          <button 
            onClick={() => setIsAddAgentModalOpen(true)}
            disabled={!selectedSupplier}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-sm disabled:opacity-50"
          >
            <Plus size={16} /> Add Agent
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="p-4 border-b border-gray-200 w-12"><input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /></th>
                <th className="p-4 border-b border-gray-200">Company Details</th>
                <th className="p-4 border-b border-gray-200 text-right">Credit Limit</th>
                <th className="p-4 border-b border-gray-200 text-right">Cash Balance</th>
                <th className="p-4 border-b border-gray-200 text-right">Running Balance</th>
                <th className="p-4 border-b border-gray-200 text-center w-32">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500 font-medium">Loading CUG Agents...</td></tr>
              ) : !selectedSupplier ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500 font-medium">Please select a CUG Enabled Supplier from the top menu.</td></tr>
              ) : filteredMappings.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500 font-medium">No agents mapped to this supplier.</td></tr>
              ) : (
                filteredMappings.map(mapping => (
                  <tr key={mapping._id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group">
                    <td className="p-4"><input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /></td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-indigo-700">{mapping.agent?.companyName || 'No Company'}</span>
                        <span className="text-xs text-slate-500">{mapping.agent?.name} ({mapping.agent?._id.slice(-4).toUpperCase()})</span>
                      </div>
                    </td>
                    <td className="p-4 text-right font-semibold text-slate-700">{mapping.creditLimit.toLocaleString()}</td>
                    <td className="p-4 text-right font-semibold text-slate-700">{mapping.cashBalance.toLocaleString()}</td>
                    <td className="p-4 text-right font-bold text-slate-900">{mapping.runningBalance.toLocaleString()}</td>
                    <td className="p-4 text-center relative">
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => setActiveDropdown(activeDropdown === mapping._id ? null : mapping._id)}
                          className="inline-flex justify-center items-center gap-1 w-full rounded-md border border-slate-300 shadow-sm px-3 py-1.5 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 focus:outline-none"
                        >
                          Select <ChevronDown size={14} />
                        </button>
                        
                        {activeDropdown === mapping._id && (
                          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
                            <div className="py-1" role="menu">
                              <button
                                onClick={() => {
                                  setSelectedMapping(mapping);
                                  setCreditAmount(mapping.creditLimit);
                                  setIsCreditModalOpen(true);
                                  setActiveDropdown(null);
                                }}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-indigo-600 font-medium"
                              >
                                <CreditCard size={14} className="mr-2" /> Add Credit Limit
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedMapping(mapping);
                                  setCreditAmount('');
                                  setCreditNoteDesc('');
                                  setIsCreditNoteModalOpen(true);
                                  setActiveDropdown(null);
                                }}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-indigo-600 font-medium"
                              >
                                <Plus size={14} className="mr-2" /> Add Credit Note
                              </button>
                              <button 
                                onClick={() => {
                                  navigate('/admin/ledger', { state: { userId: mapping.agent._id } });
                                }}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-indigo-600 font-medium"
                              >
                                <FileText size={14} className="mr-2" /> View Ledger
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedMapping(mapping);
                                  fetchCommissionPlans();
                                  setIsCommissionModalOpen(true);
                                  setActiveDropdown(null);
                                }}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-indigo-600 font-medium"
                              >
                                <Settings size={14} className="mr-2" /> Map Commission Plan
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Agent Modal */}
      {isAddAgentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-slate-50 p-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">Add Agent to CUG</h3>
              <button onClick={() => setIsAddAgentModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddAgent} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Select Agent</label>
                  <select
                    required
                    value={selectedAgentToAdd}
                    onChange={e => setSelectedAgentToAdd(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="" disabled className="text-slate-400">Choose an agent</option>
                    {availableAgents.map(agent => (
                      <option key={agent._id} value={agent._id}>
                        {agent.companyName} ({agent._id.slice(-4).toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Initial Credit Limit</label>
                  <input
                    type="number"
                    value={creditAmount}
                    onChange={e => setCreditAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    min="0"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddAgentModalOpen(false)} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all">Add Agent</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Credit Limit Modal */}
      {isCreditModalOpen && selectedMapping && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-slate-50 p-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">Update Credit Limit</h3>
              <button onClick={() => setIsCreditModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateCreditLimit} className="p-6">
              <div className="mb-6">
                <p className="text-sm text-slate-600 mb-4">
                  Updating credit limit for <span className="font-bold text-slate-900">{selectedMapping.agent.companyName}</span>
                </p>
                <label className="block text-sm font-bold text-slate-700 mb-1">New Credit Limit</label>
                <input
                  type="number"
                  required
                  value={creditAmount}
                  onChange={e => setCreditAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold"
                  min="0"
                />
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsCreditModalOpen(false)} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all">Update Limit</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Credit Note Modal */}
      {isCreditNoteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Plus size={18} className="text-indigo-600" />
                Add Credit Note
              </h3>
              <button onClick={() => setIsCreditNoteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCreditNote} className="p-6 space-y-4">
              <div className="bg-indigo-50 text-indigo-700 p-3 rounded-lg text-sm font-medium mb-4 border border-indigo-100">
                Adding cash to <span className="font-bold">{selectedMapping?.agent?.companyName}</span>'s CUG wallet.
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description / Remarks</label>
                <input
                  type="text"
                  required
                  value={creditNoteDesc}
                  onChange={(e) => setCreditNoteDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Bank Transfer Ref: 123456"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreditNoteModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 rounded-lg text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Add Credit Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Map Commission Plan Modal */}
      {isCommissionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Settings size={18} className="text-indigo-600" />
                Map Commission Plan
              </h3>
              <button onClick={() => setIsCommissionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleMapCommissionPlan} className="p-6 space-y-4">
              <div className="bg-indigo-50 text-indigo-700 p-3 rounded-lg text-sm font-medium mb-4 border border-indigo-100">
                Mapping plan for <span className="font-bold">{selectedMapping?.agent?.companyName}</span>
              </div>
              
              {commissionPlans.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-500 font-medium">
                  Loading plans...
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Commission Plan</label>
                  <select
                    value={selectedCommissionPlanId}
                    onChange={(e) => setSelectedCommissionPlanId(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {commissionPlans.map(plan => (
                      <option key={plan._id} value={plan._id}>
                        {plan.name} ({plan.value}{plan.type === 'PERCENTAGE' ? '%' : ' INR'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCommissionModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={commissionPlans.length === 0}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 rounded-lg text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Map Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CugSuppliersManager;
