import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Users, Trash2, Edit2, Loader2, Save, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../store/authSlice';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import Loader from '../../../components/common/Loader';
import Dropdown from '../../../components/ui/Dropdown';

export default function AdminSubAdmins() {
  const user = useSelector(selectCurrentUser);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [subAdmins, setSubAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', phone: '', department: '' });

  const fetchSubAdmins = async () => {
    try {
      const { data } = await api.get('/api/admin/users?role=SUB_ADMIN');
      setSubAdmins(data);
    } catch (error) {
      toast.error('Failed to fetch sub-admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await api.post('/api/admin/subadmins', formData);
      toast.success('Sub-admin created successfully');
      setShowCreateForm(false);
      setFormData({ name: '', email: '', password: '', phone: '', department: '' });
      fetchSubAdmins();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create sub-admin');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this sub-admin?')) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      toast.success('Sub-admin removed');
      fetchSubAdmins();
    } catch (error) {
      toast.error('Failed to delete sub-admin');
    }
  };

  const startEdit = (sub: any) => {
    setEditingId(sub._id);
    setEditData({ name: sub.name, phone: sub.phone || '', department: sub.department || '' });
    setIsEditModalOpen(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/api/admin/users/${id}`, { isActive: !currentStatus });
      toast.success(`Sub-admin ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      setSubAdmins(subAdmins.map((a: any) => a._id === id ? { ...a, isActive: !currentStatus } : a));
    } catch (error) {
      toast.error('Failed to update sub-admin status');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      await api.put(`/api/admin/users/${editingId}`, editData);
      toast.success('Sub-admin updated');
      setIsEditModalOpen(false);
      setEditingId(null);
      fetchSubAdmins();
    } catch (error) {
      toast.error('Failed to update sub-admin');
    }
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="text-blue-600" /> Sub-Admins
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage role-based sub-admins for your organization.</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 font-medium text-sm"
        >
          <Plus size={18} />
          {showCreateForm ? 'Cancel' : 'Create Sub-Admin'}
        </button>
      </div>

      {showCreateForm && (
        <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4 overflow-hidden">
          {isCreating && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <Loader />
              <p className="mt-4 text-sm font-medium text-blue-600">Creating Sub-Admin...</p>
            </div>
          )}
          <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Sub-Admin</h2>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="John Doe" disabled={isCreating} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="john@company.com" disabled={isCreating} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="••••••••" disabled={isCreating} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="+1234567890" disabled={isCreating} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Role / Department</label>
                <Dropdown
                  value={formData.department}
                  onChange={(val) => setFormData({...formData, department: val})}
                  placeholder="Select a role..."
                  options={[
                    { value: 'Sales', label: 'Sales Manager' },
                    { value: 'Operations', label: 'Operations Manager' },
                    { value: 'Customer Support', label: 'Customer Support Manager' },
                    { value: 'Accounts', label: 'Accounts Team' },
                  ]}
                />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isCreating}
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md shadow-blue-600/20 disabled:opacity-50"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sub-Admins List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
           <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : subAdmins.length === 0 ? (
           <div className="p-8 text-center text-gray-500">No sub-admins found.</div>
        ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subAdmins.map((sub) => (
              <tr key={sub._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {sub.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{sub.name}</div>
                      <div className="text-sm text-gray-500">{sub.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                    {sub.department || 'Not Assigned'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${sub.isActive !== false ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {sub.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleToggleActive(sub._id, sub.isActive !== false)} className={`p-2 rounded-lg transition-colors ${sub.isActive !== false ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`} title={sub.isActive !== false ? "Deactivate" : "Activate"}>
                      <ShieldCheck size={16} />
                    </button>
                    <button onClick={() => startEdit(sub)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(sub._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {/* Edit SubAdmin Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">Edit Sub-Admin</h2>
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
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Phone Number</label>
                <input required type="tel" value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Department</label>
                <Dropdown 
                  value={editData.department} 
                  onChange={(val) => setEditData({...editData, department: val})}
                  options={[
                    { value: 'Sales', label: 'Sales' },
                    { value: 'Operations', label: 'Operations' },
                    { value: 'Customer Support', label: 'Customer Support' },
                    { value: 'Accounts', label: 'Accounts' }
                  ]}
                />
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
    </div>
  );
}
