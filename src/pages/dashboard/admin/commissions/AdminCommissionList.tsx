import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, Copy, Trash2, ChevronRight, Check } from 'lucide-react';
import Dropdown from '../../../../components/ui/Dropdown';
import api from '../../../../services/api';
import toast from 'react-hot-toast';

interface CommissionPlan {
  _id: string;
  name: string;
  category: string;
  airline: string;
  type: string;
  priority: number;
  createdAt: string;
  status: boolean;
}

const AdminCommissionList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [plans, setPlans] = useState<CommissionPlan[]>([]);
  const [records, setRecords] = useState('10');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/commissions');
      setPlans(res.data);
    } catch (error: any) {
      toast.error('Failed to load commission plans');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select a plan to delete');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete the selected plans?')) {
      try {
        // Just delete the first selected for now as batch delete isn't on backend yet
        await api.delete(`/api/commissions/${selectedIds[0]}`);
        toast.success('Plan deleted successfully');
        setSelectedIds([]);
        fetchPlans();
      } catch (error: any) {
        toast.error('Failed to delete plan');
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === plans.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(plans.map(c => c._id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Revenue Configurations</h1>
          <p className="text-slate-500 text-sm mt-1">Setup and manage agency revenue policies and fee structures</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/commissions/groups')}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-200 shadow-sm"
          >
            <Users size={16} />
            Manage Segments
          </button>
          <button 
            onClick={() => navigate('/admin/commissions/add')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            New Revenue Policy
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100/60 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100/60 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-50/30">
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto text-sm text-slate-500 font-semibold z-20">
              <span>Showing 1 to {plans.length} of Results</span>
              <div className="w-24">
                <Dropdown 
                  value={records}
                  onChange={setRecords}
                  options={[
                    { value: '10', label: '10' },
                    { value: '25', label: '25' },
                    { value: '50', label: '50' }
                  ]}
                />
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search By..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-[11px] bg-white border border-slate-200/80 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            </div>

            <div className="w-full sm:w-48 z-10">
              <Dropdown 
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: 'ALL', label: 'Category: --ALL--' },
                  { value: 'FLIGHT', label: 'FLIGHT' },
                  { value: 'HOTEL', label: 'HOTEL' }
                ]}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto mt-4 xl:mt-0 justify-end">
            <button 
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-emerald-100"
            >
              <Copy size={16} />
              Clone Policy
            </button>
            <button 
              onClick={handleDelete}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-red-100"
            >
              <Trash2 size={16} />
              Delete Selected
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-black">
                <th className="px-6 py-4">
                  <div 
                    onClick={toggleSelectAll}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors ${
                      selectedIds.length === plans.length && plans.length > 0
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'border-slate-300 bg-white hover:border-indigo-400'
                    }`}
                  >
                    {selectedIds.length === plans.length && plans.length > 0 && <Check size={14} strokeWidth={3} />}
                  </div>
                </th>
                <th className="px-6 py-4">Ref ID</th>
                <th className="px-6 py-4">Policy Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Scope</th>
                <th className="px-6 py-4">Priority Level</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4">Active</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60 text-sm font-semibold text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-400 font-semibold">
                    Loading...
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-400 font-semibold">
                    No revenue policies configured
                  </td>
                </tr>
              ) : (
                plans.filter(p => (categoryFilter === 'ALL' || p.category === categoryFilter) && (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p._id.includes(searchTerm))).map((comm) => (
                  <tr key={comm._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div 
                        onClick={() => toggleSelect(comm._id)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors ${
                          selectedIds.includes(comm._id)
                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                            : 'border-slate-300 bg-white hover:border-indigo-400'
                        }`}
                      >
                        {selectedIds.includes(comm._id) && <Check size={14} strokeWidth={3} />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-indigo-600">{comm._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4">{comm.name}</td>
                    <td className="px-6 py-4">{comm.category}</td>
                    <td className="px-6 py-4 text-slate-500">{comm.airline}</td>
                    <td className="px-6 py-4">{comm.type === 'Domestic' ? 'D' : 'I'}</td>
                    <td className="px-6 py-4">{comm.priority}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(comm.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${comm.status ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {comm.status ? 'true' : 'false'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="px-4 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-bold text-xs transition-colors border border-blue-100">
                        Select
                      </button>
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

export default AdminCommissionList;
