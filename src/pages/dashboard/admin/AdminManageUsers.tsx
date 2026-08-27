import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Search, CheckCircle, Trash2, Plus, X, Edit, ChevronDown, Lock, Settings, CreditCard, FileText, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loader from '../../../components/common/Loader';
import ManageRolesModal from '../../../components/admin/modals/ManageRolesModal';
import AssignCreditModal from '../../../components/admin/modals/AssignCreditModal';
import UserLedgerModal from '../../../components/admin/modals/UserLedgerModal';
import RefreshButton from '../../../components/ui/RefreshButton';


export default function AdminManageUsers() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', name: '', email: '', phone: '', companyName: '', password: '', confirmPassword: '', address: '', city: '' });
  
  const navigate = useNavigate();
  
  const getPrimaryRole = (roles: string[] = []) => {
    if (roles.includes('SUPER_ADMIN')) return { label: 'TRC Admin', color: 'bg-red-100 text-red-700' };
    if (roles.includes('SUB_ADMIN')) return { label: 'ADMIN_STAFF', color: 'bg-purple-100 text-purple-700' };
    if (roles.includes('SUPPLIER_AGENT')) return { label: 'Supplier', color: 'bg-indigo-100 text-indigo-700' };
    if (roles.includes('SUPPLIER_STAFF')) return { label: 'Supplier Staff', color: 'bg-blue-100 text-blue-700' };
    if (roles.includes('B2B_AGENT')) return { label: 'TRC B2B', color: 'bg-emerald-100 text-emerald-700' };
    return { label: 'USER', color: 'bg-gray-100 text-gray-700' };
  };
  
  const [selectedDocsAgent, setSelectedDocsAgent] = useState<any | null>(null);
  const [selectedRolesAgent, setSelectedRolesAgent] = useState<any | null>(null);
  const [selectedCreditAgent, setSelectedCreditAgent] = useState<any | null>(null);
  const [selectedLedgerAgent, setSelectedLedgerAgent] = useState<any | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAgents = async () => {
    try {
      const { data } = await api.get(`/api/admin/users?role=B2B_AGENT,SUPPLIER_AGENT,SUPPLIER_STAFF&page=${page}&limit=10`);
      setAgents(data.data || (Array.isArray(data) ? data : []));
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [page]);

  const handleApprove = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.put(`/api/admin/agents/${id}/approve`, { status });
      toast.success(`Agent ${status.toLowerCase()} successfully`);
      setAgents(agents.map((a: any) => a._id === id ? { ...a, agentStatus: status, isApproved: status === 'APPROVED' } : a));
    } catch (error) {
      console.error(`Error updating agent status:`, error);
      toast.error(`Failed to update agent status`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      try {
        await api.delete(`/api/admin/users/${id}`);
        toast.success('Agent deleted successfully');
        setAgents(agents.filter((a: any) => a._id !== id));
      } catch (error) {
        console.error('Error deleting agent:', error);
        toast.error('Failed to delete agent');
      }
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/api/admin/users/${id}`, { isActive: !currentStatus });
      toast.success(`Agent ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      setAgents(agents.map((a: any) => a._id === id ? { ...a, isActive: !currentStatus } : a));
    } catch (error) {
      toast.error('Failed to update agent status');
    }
  };

  const startEdit = (agent: any) => {
    navigate(`/admin/user-profile/${agent._id}`);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const submissionData = { ...formData, name: formData.name || `${formData.firstName} ${formData.lastName}`.trim() };
      await api.post('/api/admin/agents', submissionData);
      toast.success('Agent created successfully');
      setIsModalOpen(false);
      setFormData({ firstName: '', lastName: '', name: '', email: '', phone: '', companyName: '', password: '', confirmPassword: '', address: '', city: '' });
      fetchAgents();
    } catch (error: any) {
      console.error('Error creating agent:', error);
      toast.error(error.response?.data?.message || 'Failed to create agent');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredAgents = agents.filter((agent: any) => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Manage B2B Agents and Supplier accounts.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search agents..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <RefreshButton onClick={fetchAgents} loading={loading} count={agents.length} />
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={18} /> Add Agent
          </button>
        </div>
      </div>
      
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto min-h-[450px]">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-gray-100/80 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 rounded-tl-2xl">Agent Info</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Business Name</th>
                <th className="px-4 py-3">Contact No.</th>
                <th className="px-4 py-3 text-center">Allow Credit</th>
                <th className="px-4 py-3 text-right">Wallet Bal.</th>
                <th className="px-4 py-3 text-right">Max Credit</th>
                <th className="px-4 py-3">Valid Until</th>
                <th className="px-4 py-3 text-right">RBL Score</th>
                <th className="px-4 py-3">Account State</th>
                <th className="px-4 py-3">Registered On</th>
                <th className="px-4 py-3">Approved On</th>
                <th className="px-4 py-3">Reports To</th>
                <th className="px-4 py-3">Access Level</th>
                <th className="px-4 py-3">City/Town</th>
                <th className="px-4 py-3">Region/State</th>
                <th className="px-4 py-3">KYC Verification</th>
                <th className="px-4 py-3 rounded-tr-2xl text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 text-gray-600">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={18} className="px-6 py-12 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                filteredAgents.map((agent: any) => {
                  const primaryRole = getPrimaryRole(agent.roles);
                  const bal = agent.walletBalance || 0;
                  
                  return (
                  <tr key={agent._id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-blue-900">{agent.name}</span>
                        <span className="text-[10px] text-gray-500 font-mono">({agent._id.slice(-6).toUpperCase()})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{agent.email}</td>
                    <td className="px-4 py-3 font-semibold text-gray-700">{agent.companyName || '-'}</td>
                    <td className="px-4 py-3">{agent.phone || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <input type="checkbox" className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" defaultChecked={agent.creditBalance > 0} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">
                      <span className={bal < 0 ? 'text-red-600' : bal > 0 ? 'text-green-600' : 'text-gray-500'}>
                        ₹{bal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-gray-500">
                      ₹{(agent.creditBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {agent.creditBalanceExpiry ? new Date(agent.creditBalanceExpiry).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-gray-500">0</td>
                    <td className="px-4 py-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={agent.isActive !== false} 
                          onChange={() => handleToggleActive(agent._id, agent.isActive !== false)} 
                        />
                        <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-1.5 text-[10px] font-bold text-gray-700">{agent.isActive !== false ? 'Active' : 'Inactive'}</span>
                      </label>
                    </td>
                    <td className="px-4 py-3 font-medium text-[10px]">
                      {new Date(agent.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}
                    </td>
                    <td className="px-4 py-3 font-medium text-[10px]">
                      {agent.isApproved ? new Date(agent.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : '-'}
                    </td>
                    <td className="px-4 py-3 font-medium">{agent.reportingTo || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${primaryRole.color}`}>
                        {primaryRole.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{agent.city || '-'}</td>
                    <td className="px-4 py-3 font-medium">{agent.state || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        agent.agentStatus === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' : 
                        agent.agentStatus === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {agent.agentStatus || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center relative">
                      <div className="group/dropdown inline-block">
                        <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded shadow-sm transition-colors">
                          Select <ChevronDown size={12} className="group-hover/dropdown:rotate-180 transition-transform duration-200" />
                        </button>
                        
                        <div className="absolute right-6 top-full pt-1 w-48 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-200 z-[60] origin-top-right">
                          <div className="bg-white border border-gray-100 rounded-xl shadow-xl flex flex-col py-1 text-left transform group-hover/dropdown:scale-100 scale-95 origin-top-right">
                          <button className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 text-[10px] font-bold text-gray-700 hover:text-blue-700 w-full transition-colors">
                            <Save size={12} className="text-gray-400" /> Save Details
                          </button>
                          <button onClick={() => startEdit(agent)} className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 text-[10px] font-bold text-gray-700 hover:text-blue-700 w-full transition-colors">
                            <Edit size={12} className="text-gray-400" /> Edit Profile
                          </button>
                          
                          {(agent.panCardImage || agent.idProofImage || agent.gstImage || agent.officeAddress) && (
                             <button onClick={() => setSelectedDocsAgent(agent)} className="flex items-center gap-2 px-4 py-2 hover:bg-purple-50 text-[10px] font-bold text-gray-700 hover:text-purple-700 w-full transition-colors">
                              <CheckCircle size={12} className="text-gray-400" /> Verify Docs
                            </button>
                          )}
                          
                          <button className="flex items-center gap-2 px-4 py-2 hover:bg-orange-50 text-[10px] font-bold text-gray-700 hover:text-orange-700 w-full transition-colors border-t border-gray-100">
                            <Lock size={12} className="text-gray-400" /> Reset Password
                          </button>
                          <button onClick={() => setSelectedRolesAgent(agent)} className="flex items-center gap-2 px-4 py-2 hover:bg-indigo-50 text-[10px] font-bold text-gray-700 hover:text-indigo-700 w-full transition-colors">
                            <Settings size={12} className="text-gray-400" /> Manage Roles
                          </button>
                          <button onClick={() => setSelectedCreditAgent(agent)} className="flex items-center gap-2 px-4 py-2 hover:bg-emerald-50 text-[10px] font-bold text-gray-700 hover:text-emerald-700 w-full transition-colors border-t border-gray-100">
                            <CreditCard size={12} className="text-gray-400" /> Assign Credit Limit
                          </button>
                          <button onClick={() => setSelectedLedgerAgent(agent)} className="flex items-center gap-2 px-4 py-2 hover:bg-cyan-50 text-[10px] font-bold text-gray-700 hover:text-cyan-700 w-full transition-colors">
                            <FileText size={12} className="text-gray-400" /> View Ledger Account
                          </button>
                          
                          <button onClick={() => handleDelete(agent._id)} className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-[10px] font-bold text-red-600 w-full transition-colors border-t border-gray-100">
                            <Trash2 size={12} className="text-red-400" /> Delete Agent
                          </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Previous
          </button>
          <span className="text-xs font-semibold text-gray-500">Page {page} of {totalPages}</span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      </div>

      {/* Create Agent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900 mx-auto w-full text-center tracking-wide">Add Customer</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isCreating}
              >
                <X size={20} />
              </button>
            </div>
            
                        <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-t-xl -mt-6 -mx-6 mb-4 font-bold">
                Personal Details
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">First Name*</label>
                  <input required type="text" placeholder="First Name" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value, name: e.target.value + ' ' + formData.lastName})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all bg-white" disabled={isCreating} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">Last Name*</label>
                  <input required type="text" placeholder="Last Name" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value, name: formData.firstName + ' ' + e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all bg-white" disabled={isCreating} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">Mobile*</label>
                  <input required type="tel" placeholder="Mobile" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all bg-white" disabled={isCreating} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">Email Address*</label>
                  <input required type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all bg-white" disabled={isCreating} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">Address*</label>
                  <input required type="text" placeholder="Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all bg-white" disabled={isCreating} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">City*</label>
                  <input required type="text" placeholder="City" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all bg-white" disabled={isCreating} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">Company Name</label>
                  <input type="text" placeholder="Company/Agency (Optional)" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all bg-white" disabled={isCreating} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">Password*</label>
                  <input required type="password" placeholder="Enter Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all bg-white" disabled={isCreating} minLength={6} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">Confirm Password*</label>
                  <input required type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all bg-white" disabled={isCreating} minLength={6} />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" disabled={isCreating}>
                  Cancel
                </button>
                <button type="submit" disabled={isCreating || (formData.password !== formData.confirmPassword)} className="px-8 py-2 bg-[#ff5722] hover:bg-[#f4511e] text-white text-sm font-bold rounded-lg transition-all shadow-md disabled:opacity-50">
                  {isCreating ? <Loader /> : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

            {/* View Verification Documents Modal */}
      {selectedDocsAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <div>
                <h2 className="text-xl font-black text-gray-900">Agent Documents & Verification</h2>
                <p className="text-xs text-gray-500 font-semibold">{selectedDocsAgent.companyName} ({selectedDocsAgent.name})</p>
              </div>
              <button 
                onClick={() => setSelectedDocsAgent(null)}
                className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <div>
                  <span className="block text-gray-400 font-bold uppercase text-[10px]">Office Address</span>
                  <span className="font-bold text-gray-800">{selectedDocsAgent.officeAddress || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-gray-400 font-bold uppercase text-[10px]">Location</span>
                  <span className="font-bold text-gray-800">{selectedDocsAgent.city || ''}, {selectedDocsAgent.state || ''}</span>
                </div>
                <div>
                  <span className="block text-gray-400 font-bold uppercase text-[10px]">PAN Number</span>
                  <span className="font-bold text-gray-800 uppercase">{selectedDocsAgent.panNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-gray-400 font-bold uppercase text-[10px]">GST Number</span>
                  <span className="font-bold text-gray-800 uppercase">{selectedDocsAgent.gstn || 'N/A'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* PAN Card Copy */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
                    <span>PAN Card</span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">{selectedDocsAgent.panNumber || 'N/A'}</span>
                  </h4>
                  <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center p-2 h-48">
                    {selectedDocsAgent.panCardImage ? (
                      selectedDocsAgent.panCardImage.startsWith('data:image') || selectedDocsAgent.panCardImage.startsWith('http') ? (
                        <a href={selectedDocsAgent.panCardImage} target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center">
                          <img src={selectedDocsAgent.panCardImage} alt="PAN Card" className="max-w-full max-h-full object-contain hover:scale-105 transition-transform cursor-pointer" />
                        </a>
                      ) : (
                        <div className="font-mono text-gray-500 break-all text-[10px] text-center">{selectedDocsAgent.panCardImage}</div>
                      )
                    ) : (
                      <p className="text-gray-400 italic text-center w-full">No Image</p>
                    )}
                  </div>
                </div>

                {/* ID / Address Proof Copy */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
                    <span>ID Proof</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">{selectedDocsAgent.idProofType || 'N/A'}</span>
                  </h4>
                  <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center p-2 h-48">
                    {selectedDocsAgent.idProofImage ? (
                      selectedDocsAgent.idProofImage.startsWith('data:image') || selectedDocsAgent.idProofImage.startsWith('http') ? (
                         <a href={selectedDocsAgent.idProofImage} target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center">
                          <img src={selectedDocsAgent.idProofImage} alt="Identity Proof" className="max-w-full max-h-full object-contain hover:scale-105 transition-transform cursor-pointer" />
                         </a>
                      ) : (
                        <div className="font-mono text-gray-500 break-all text-[10px] text-center">{selectedDocsAgent.idProofImage}</div>
                      )
                    ) : (
                      <p className="text-gray-400 italic text-center w-full">No Image</p>
                    )}
                  </div>
                </div>

                {/* GST Copy */}
                {selectedDocsAgent.gstImage && (
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col md:col-span-2">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
                      <span>GST Certificate</span>
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase">{selectedDocsAgent.gstn || 'N/A'}</span>
                    </h4>
                    <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center p-2 h-48 md:h-64">
                      {selectedDocsAgent.gstImage.startsWith('data:image') || selectedDocsAgent.gstImage.startsWith('http') ? (
                         <a href={selectedDocsAgent.gstImage} target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center">
                          <img src={selectedDocsAgent.gstImage} alt="GST Copy" className="max-w-full max-h-full object-contain hover:scale-105 transition-transform cursor-pointer" />
                         </a>
                      ) : (
                        <div className="font-mono text-gray-500 break-all text-[10px] text-center">{selectedDocsAgent.gstImage}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <button 
                onClick={() => setSelectedDocsAgent(null)}
                className="px-5 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Close
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={() => { handleApprove(selectedDocsAgent._id, 'REJECTED'); setSelectedDocsAgent(null); }}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                >
                  Reject Agent
                </button>
                <button 
                  onClick={() => { handleApprove(selectedDocsAgent._id, 'APPROVED'); setSelectedDocsAgent(null); }}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                >
                  Approve Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
