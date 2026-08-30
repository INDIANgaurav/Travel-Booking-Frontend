import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Save, Edit2, Trash2, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import toast from 'react-hot-toast';

interface CommissionGroup {
  _id: string;
  name: string;
  code: string;
  description: string;
  planName: string;
}

const AdminCommissionGroups = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', description: '', planName: '' });
  const [groups, setGroups] = useState<CommissionGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof CommissionGroup; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/api/commissions/groups');
      setGroups(res.data);
    } catch (error) {
      toast.error('Failed to load groups');
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Group Name is required');
      return;
    }
    
    try {
      setLoading(true);
      await api.post('/api/commissions/groups', formData);
      toast.success('Group created successfully');
      setFormData({ name: '', description: '', planName: '' });
      fetchGroups();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof CommissionGroup) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedGroups = useMemo(() => {
    let sortableItems = [...groups];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [groups, sortConfig]);

  const renderSortIcon = (columnName: keyof CommissionGroup) => {
    if (!sortConfig || sortConfig.key !== columnName) {
      return <ArrowUpDown size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp size={14} className="text-indigo-600" /> : 
      <ChevronDown size={14} className="text-indigo-600" />;
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/commissions')}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Commission Plan Grouping</h1>
          <p className="text-slate-500 text-sm mt-1">Create and manage commission groups</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100/60 overflow-hidden">
        
        {/* Form */}
        <div className="p-8 border-b border-slate-100/60 bg-slate-50/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cluster Name</label>
              <input 
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200/80 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                placeholder="e.g. VIP_AGENTS"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
              <input 
                type="text"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200/80 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                placeholder="Description"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assigned Policy</label>
              <input 
                type="text"
                value={formData.planName}
                onChange={e => setFormData({ ...formData, planName: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200/80 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                placeholder="Plan Name"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Group'}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-black">
                <th className="px-6 py-4 rounded-tl-lg">
                  <button 
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2 hover:text-indigo-600 transition-colors group focus:outline-none"
                  >
                    Cluster Name {renderSortIcon('name')}
                  </button>
                </th>
                <th className="px-6 py-4">
                  <button 
                    onClick={() => handleSort('code')}
                    className="flex items-center gap-2 hover:text-indigo-600 transition-colors group focus:outline-none"
                  >
                    Cluster Code {renderSortIcon('code')}
                  </button>
                </th>
                <th className="px-6 py-4">
                  <button 
                    onClick={() => handleSort('description')}
                    className="flex items-center gap-2 hover:text-indigo-600 transition-colors group focus:outline-none"
                  >
                    Description {renderSortIcon('description')}
                  </button>
                </th>
                <th className="px-6 py-4 rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60 text-sm font-semibold text-slate-700">
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-semibold">
                    No groups found
                  </td>
                </tr>
              ) : (
                sortedGroups.map((group) => (
                  <tr key={group._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">{group.name}</td>
                    <td className="px-6 py-4">{group.code}</td>
                    <td className="px-6 py-4">{group.description}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
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
      </div>
    </div>
  );
};

export default AdminCommissionGroups;
