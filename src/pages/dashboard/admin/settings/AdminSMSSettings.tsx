import React, { useState, useEffect } from 'react';
import { settingsApi } from '../../../../api/settingsApi';
import toast from 'react-hot-toast';
import { Plus, Edit2, Loader2, Mail, MessageSquare, X, Check } from 'lucide-react';

export default function AdminSMSSettings() {
  const [activeTab, setActiveTab] = useState<'SMS' | 'EMAIL'>('SMS');
  const [providers, setProviders] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<any>(null);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    apiKey: '',
    isActive: true,
    smtpHost: '',
    smtpPort: '',
    smtpUsername: '',
    smtpPassword: ''
  });

  useEffect(() => {
    fetchProvidersAndAgents();
  }, []);

  const fetchProvidersAndAgents = async () => {
    try {
      const [providersRes, agentsRes] = await Promise.all([
        settingsApi.getServiceProviders(),
        settingsApi.getAgents()
      ]);
      setProviders(providersRes.data);
      setAgents(agentsRes.data);
    } catch (err) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProvider = async () => {
    if (!formData.name || !formData.url) {
      toast.error('Name and URL are required');
      return;
    }
    
    setSaving(true);
    try {
      const payload: any = {
        name: formData.name,
        url: formData.url,
        apiKey: formData.apiKey,
        isActive: formData.isActive,
        type: activeTab
      };

      if (activeTab === 'EMAIL') {
        payload.smtpHost = formData.smtpHost;
        payload.smtpPort = Number(formData.smtpPort);
        payload.smtpUsername = formData.smtpUsername;
        payload.smtpPassword = formData.smtpPassword;
      }

      await settingsApi.createServiceProvider(payload);
      toast.success('Provider added successfully');
      setIsAddModalOpen(false);
      resetForm();
      fetchProvidersAndAgents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add provider');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', url: '', apiKey: '', isActive: true,
      smtpHost: '', smtpPort: '', smtpUsername: '', smtpPassword: ''
    });
  };

  const openAssignModal = (provider: any) => {
    setCurrentProvider(provider);
    const assignedIds = provider.assignedUsers?.map((u: any) => u._id) || [];
    setSelectedAgents(assignedIds);
    setIsAssignModalOpen(true);
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) ? prev.filter(id => id !== agentId) : [...prev, agentId]
    );
  };

  const handleSaveAssignments = async () => {
    if (!currentProvider) return;
    setSaving(true);
    try {
      await settingsApi.updateServiceProvider(currentProvider._id, {
        assignedUsers: selectedAgents
      });
      toast.success('Users assigned successfully');
      setIsAssignModalOpen(false);
      fetchProvidersAndAgents();
    } catch (err: any) {
      toast.error('Failed to assign users');
    } finally {
      setSaving(false);
    }
  };

  const filteredProviders = providers.filter(p => p.type === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#1e3a8a] rounded-lg">
            {activeTab === 'SMS' ? <MessageSquare size={24} /> : <Mail size={24} />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Service Provider Settings</h1>
            <p className="text-slate-500 text-sm mt-1">Manage API integrations for SMS and Email gateways</p>
          </div>
        </div>
        <button 
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#172554] text-white px-6 py-2.5 rounded-lg font-bold transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Provider
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="flex border-b border-slate-200">
          <button 
            className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'SMS' ? 'text-[#1e3a8a] border-b-2 border-[#1e3a8a]' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('SMS')}
          >
            <MessageSquare size={18} /> SMS Service Details
          </button>
          <button 
            className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'EMAIL' ? 'text-[#1e3a8a] border-b-2 border-[#1e3a8a]' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('EMAIL')}
          >
            <Mail size={18} /> Mail Service Details
          </button>
        </div>

        <div className="overflow-x-auto p-4">
          {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#1e3a8a]" /></div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#1e3a8a] text-white">
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Serial No</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Service Provider description</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">URL</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-right">Manage</th>
                </tr>
              </thead>
              <tbody>
                {filteredProviders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                      No {activeTab} providers found
                    </td>
                  </tr>
                ) : (
                  filteredProviders.map((provider, idx) => (
                    <tr key={provider._id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 text-sm text-slate-800 font-medium">{idx + 1}</td>
                      <td className="py-4 px-6 text-sm text-slate-800 font-bold uppercase">{provider.name}</td>
                      <td className="py-4 px-6 text-sm text-slate-600 break-all">{provider.url}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          provider.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {provider.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => openAssignModal(provider)}
                          className="inline-flex items-center gap-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                        >
                          <Edit2 size={14} /> Assign to user
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Provider Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                Add {activeTab} Provider
              </h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Provider Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Twilio, ZeptoMail"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">API URL</label>
                <input 
                  type="url" 
                  placeholder="https://api.provider.com/v1/..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] outline-none transition-all text-sm"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">API Key (Optional)</label>
                <input 
                  type="password" 
                  placeholder="Enter API key or Token"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] outline-none transition-all text-sm"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                />
              </div>

              {activeTab === 'EMAIL' && (
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="text-sm font-bold text-[#1e3a8a] uppercase tracking-wider">SMTP Configuration</h3>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1">SMTP Host</label>
                      <input 
                        type="text" 
                        placeholder="smtp.example.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] outline-none transition-all text-xs"
                        value={formData.smtpHost}
                        onChange={(e) => setFormData({...formData, smtpHost: e.target.value})}
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Port</label>
                      <input 
                        type="number" 
                        placeholder="587"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] outline-none transition-all text-xs"
                        value={formData.smtpPort}
                        onChange={(e) => setFormData({...formData, smtpPort: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">SMTP Username / Email</label>
                    <input 
                      type="text" 
                      placeholder="info@yourdomain.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] outline-none transition-all text-xs"
                      value={formData.smtpUsername}
                      onChange={(e) => setFormData({...formData, smtpUsername: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">SMTP Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter App Password"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] outline-none transition-all text-xs"
                      value={formData.smtpPassword}
                      onChange={(e) => setFormData({...formData, smtpPassword: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-4">
                <input 
                  type="checkbox" 
                  id="isActive"
                  className="w-4 h-4 text-[#1e3a8a] rounded border-slate-300 focus:ring-[#1e3a8a]"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer">
                  Active immediately
                </label>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 mt-auto">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProvider}
                disabled={saving}
                className="flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#172554] text-white px-6 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? 'Saving...' : 'Save Provider'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign to User Modal */}
      {isAssignModalOpen && currentProvider && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex justify-between items-center bg-[#4285F4] p-4 text-white">
              <h2 className="text-lg font-bold uppercase tracking-wider">
                {currentProvider.name}
              </h2>
              <button 
                onClick={() => setIsAssignModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <div className="overflow-y-auto bg-slate-50 p-6 flex-1">
              <div className="bg-white border border-slate-300 rounded overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#4285F4] text-white border-b border-slate-300">
                      <th className="py-3 px-4 w-20 text-sm font-medium">Select</th>
                      <th className="py-3 px-4 text-sm font-medium border-l border-white/20">Username</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent, index) => (
                      <tr 
                        key={agent._id} 
                        className={`border-b border-slate-200 hover:bg-blue-50/50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                        onClick={() => toggleAgent(agent._id)}
                      >
                        <td className="py-3 px-4 text-center">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                            selectedAgents.includes(agent._id)
                              ? 'bg-[#4285F4] border-[#4285F4]'
                              : 'bg-white border-slate-400'
                          }`}>
                            {selectedAgents.includes(agent._id) && <Check size={14} className="text-white" />}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-700 border-l border-slate-200">
                          {agent.name} ({agent.email})
                        </td>
                      </tr>
                    ))}
                    {agents.length === 0 && (
                      <tr>
                        <td colSpan={2} className="py-12 text-center text-slate-500 font-medium">
                          No B2B agents found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex gap-3">
              <button 
                onClick={() => setIsAssignModalOpen(false)}
                className="px-6 py-2 bg-[#d9534f] hover:bg-[#c9302c] text-white rounded font-bold shadow-sm transition-colors"
              >
                Close
              </button>
              <button 
                onClick={handleSaveAssignments}
                disabled={saving}
                className="px-6 py-2 bg-[#5cb85c] hover:bg-[#449d44] text-white rounded font-bold shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
