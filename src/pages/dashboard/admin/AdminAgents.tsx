import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Search, CheckCircle, Trash2 } from 'lucide-react';
import Loader from '../../../components/common/Loader';

export default function AdminAgents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAgents = async () => {
    try {
      const { data } = await api.get('/api/admin/users');
      // Filter only agents
      const agentUsers = data.filter((u: any) => u.role === 'AGENT');
      setAgents(agentUsers);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/api/admin/agents/${id}/approve`);
      toast.success('Agent approved successfully');
      setAgents(agents.map((a: any) => a._id === id ? { ...a, isApproved: true } : a));
    } catch (error) {
      console.error('Error approving agent:', error);
      toast.error('Failed to approve agent');
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
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage partner agents, approvals, and commissions.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search agents..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
          />
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-gray-700 uppercase font-bold text-xs border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 rounded-tr-2xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No agents found.</td>
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
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{agent.email}</span>
                        <span className="text-xs text-gray-500 mt-0.5">{agent.phone || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center ${
                        agent.isApproved ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          agent.isApproved ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></span>
                        {agent.isApproved ? 'APPROVED' : 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600">
                      {new Date(agent.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {!agent.isApproved && (
                          <button 
                            onClick={() => handleApprove(agent._id)}
                            className="flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-green-200"
                          >
                            <CheckCircle size={14} /> Approve
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(agent._id)}
                          className="flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-red-200"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
