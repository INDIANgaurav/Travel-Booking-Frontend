import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Search, CheckCircle, Trash2, Plus, X } from 'lucide-react';
import Loader from '../../../components/common/Loader';

export default function AdminAgents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', companyName: '', password: '' });
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', phone: '', companyName: '' });
  const [selectedDocsAgent, setSelectedDocsAgent] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAgents = async () => {
    try {
      const { data } = await api.get(`/api/admin/users?role=B2B_AGENT&page=${page}&limit=10`);
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
    setEditingId(agent._id);
    setEditData({ name: agent.name, phone: agent.phone || '', companyName: agent.companyName || '' });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      await api.put(`/api/admin/users/${editingId}`, editData);
      toast.success('Agent updated successfully');
      setIsEditModalOpen(false);
      setEditingId(null);
      fetchAgents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update agent');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await api.post('/api/admin/agents', formData);
      toast.success('Agent created successfully');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', companyName: '', password: '' });
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
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">Agents Management</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Manage partner agents, approvals, and commissions.</p>
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
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={18} /> Add Agent
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-gray-700 uppercase font-bold text-xs border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 rounded-tr-2xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No agents found.</td>
                </tr>
              ) : (
                filteredAgents.map((agent: any) => (
                  <tr key={agent._id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold shadow-inner group-hover:scale-105 transition-transform">
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{agent.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{agent.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{agent.phone || 'No phone'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {agent.companyName ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800">{agent.companyName}</span>
                          {agent.companyRole && <span className="text-xs text-gray-500">{agent.companyRole}</span>}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Not specified</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center ${
                        agent.agentStatus === 'APPROVED' ? 'bg-green-100 text-green-700 border border-green-200' : 
                        agent.agentStatus === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' :
                        'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          agent.agentStatus === 'APPROVED' ? 'bg-green-500' : 
                          agent.agentStatus === 'REJECTED' ? 'bg-red-500' :
                          'bg-amber-500'
                        }`}></span>
                        {agent.agentStatus || 'PENDING_APPROVAL'}
                      </span>
                      {agent.isActive === false && (
                        <span className="ml-2 px-2 py-1 rounded bg-gray-100 text-gray-600 border border-gray-200 text-xs font-bold">
                          INACTIVE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600">
                      {new Date(agent.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        {(agent.panCardImage || agent.idProofImage || agent.gstImage || agent.officeAddress) && (
                          <button 
                            onClick={() => setSelectedDocsAgent(agent)}
                            className="flex items-center gap-1 bg-purple-50 text-purple-700 hover:bg-purple-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-purple-200"
                            title="View Verification Documents"
                          >
                            Docs
                          </button>
                        )}
                        {(agent.agentStatus !== 'APPROVED') && (
                          <>
                            <button 
                              onClick={() => handleApprove(agent._id, 'APPROVED')}
                              className="flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-green-200"
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button 
                              onClick={() => handleApprove(agent._id, 'REJECTED')}
                              className="flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-red-200"
                            >
                              <X size={14} /> Reject
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleToggleActive(agent._id, agent.isActive !== false)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${agent.isActive !== false ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200' : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'}`}
                        >
                          {agent.isActive !== false ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => startEdit(agent)}
                          className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-blue-200"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(agent._id)}
                          className="flex items-center gap-1 bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-gray-200"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">Add New Agent</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isCreating}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Full Name <span className="text-red-500">*</span></label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white" disabled={isCreating} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Company Name <span className="text-red-500">*</span></label>
                  <input required type="text" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white" disabled={isCreating} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Email Address <span className="text-red-500">*</span></label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white" disabled={isCreating} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Phone Number <span className="text-red-500">*</span></label>
                  <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white" disabled={isCreating} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Password <span className="text-red-500">*</span></label>
                  <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white" disabled={isCreating} minLength={6} />
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors" disabled={isCreating}>
                  Cancel
                </button>
                <button type="submit" disabled={isCreating} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center gap-2">
                  {isCreating ? <Loader /> : 'Create Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">Edit Agent</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Full Name</label>
                <input required type="text" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Company Name</label>
                <input required type="text" value={editData.companyName} onChange={(e) => setEditData({...editData, companyName: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Phone Number</label>
                <input required type="tel" value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white" />
              </div>

              <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg">
                  Save Changes
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
                  <span className="font-bold text-gray-800">{selectedDocsAgent.city || ''}, {selectedDocsAgent.state || ''} - {selectedDocsAgent.pincode || ''}</span>
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

              {/* PAN Card Copy */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2">PAN Card Copy ({selectedDocsAgent.panNumber || 'N/A'})</h4>
                {selectedDocsAgent.panCardImage ? (
                  selectedDocsAgent.panCardImage.startsWith('data:image') || selectedDocsAgent.panCardImage.startsWith('http') ? (
                    <img src={selectedDocsAgent.panCardImage} alt="PAN Card" className="max-h-56 rounded-xl border border-gray-200 shadow-sm object-contain" />
                  ) : (
                    <div className="p-4 bg-gray-100 rounded-xl font-mono text-gray-600 truncate">{selectedDocsAgent.panCardImage}</div>
                  )
                ) : (
                  <p className="text-gray-400 italic">No PAN Image Uploaded</p>
                )}
              </div>

              {/* ID / Address Proof Copy */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Address / Identity Proof ({selectedDocsAgent.idProofType || 'Identity Proof'})</h4>
                {selectedDocsAgent.idProofImage ? (
                  selectedDocsAgent.idProofImage.startsWith('data:image') || selectedDocsAgent.idProofImage.startsWith('http') ? (
                    <img src={selectedDocsAgent.idProofImage} alt="Identity Proof" className="max-h-56 rounded-xl border border-gray-200 shadow-sm object-contain" />
                  ) : (
                    <div className="p-4 bg-gray-100 rounded-xl font-mono text-gray-600 truncate">{selectedDocsAgent.idProofImage}</div>
                  )
                ) : (
                  <p className="text-gray-400 italic">No Identity Proof Image Uploaded</p>
                )}
              </div>

              {/* GST Copy */}
              {selectedDocsAgent.gstImage && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">GST Copy ({selectedDocsAgent.gstn})</h4>
                  {selectedDocsAgent.gstImage.startsWith('data:image') || selectedDocsAgent.gstImage.startsWith('http') ? (
                    <img src={selectedDocsAgent.gstImage} alt="GST Copy" className="max-h-56 rounded-xl border border-gray-200 shadow-sm object-contain" />
                  ) : (
                    <div className="p-4 bg-gray-100 rounded-xl font-mono text-gray-600 truncate">{selectedDocsAgent.gstImage}</div>
                  )}
                </div>
              )}
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

