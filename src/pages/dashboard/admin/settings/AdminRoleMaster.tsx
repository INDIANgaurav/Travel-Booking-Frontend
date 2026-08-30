import React, { useState, useEffect } from 'react';
import { settingsApi } from '../../../../api/settingsApi';
import toast from 'react-hot-toast';
import { Loader2, Shield, Trash2 } from 'lucide-react';

export default function AdminRoleMaster() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    roleCode: '',
    roleDesc: '',
    isDefault: false
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await settingsApi.getRoles();
      setRoles(res.data);
    } catch (err: any) {
      toast.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.roleCode || !formData.roleDesc) {
      toast.error('Please fill code and description');
      return;
    }
    try {
      await settingsApi.createRole(formData);
      toast.success('Role created successfully');
      setFormData({ roleCode: '', roleDesc: '', isDefault: false });
      fetchRoles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create role');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-[#1e3a8a]" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#1e3a8a] rounded-lg">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Role Master</h1>
            <p className="text-slate-500 text-sm mt-1">Manage system roles and descriptions</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-700 mb-1">Role Code</label>
            <input 
              type="text" 
              placeholder="E.G. SUPER_ADMIN"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1e3a8a]"
              value={formData.roleCode}
              onChange={(e) => setFormData({...formData, roleCode: e.target.value})}
            />
          </div>
          <div className="flex-1 min-w-[300px]">
            <label className="block text-xs font-bold text-slate-700 mb-1">Role Description</label>
            <input 
              type="text" 
              placeholder="e.g. TRC Admin"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1e3a8a]"
              value={formData.roleDesc}
              onChange={(e) => setFormData({...formData, roleDesc: e.target.value})}
            />
          </div>
          <div className="flex items-center gap-2 mt-5">
            <input 
              type="checkbox" 
              id="isDefault" 
              className="w-4 h-4 text-[#1e3a8a] rounded border-slate-300 focus:ring-[#1e3a8a]"
              checked={formData.isDefault}
              onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
            />
            <label htmlFor="isDefault" className="text-sm font-bold text-slate-700 cursor-pointer">Default</label>
          </div>
          <div className="flex gap-2 mt-5">
            <button 
              onClick={handleSave}
              className="bg-[#1e3a8a] hover:bg-[#172554] text-white px-6 py-2 rounded-lg font-bold transition-colors text-sm shadow-sm"
            >
              Save
            </button>
            <button 
              onClick={() => setFormData({ roleCode: '', roleDesc: '', isDefault: false })}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-2 rounded-lg font-bold transition-colors text-sm"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1e3a8a] text-white">
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">#</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Role Id</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Created By</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Role Code</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Role Description</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Manage</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role, idx) => (
                <tr key={role._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-sm font-semibold text-slate-700">{idx + 1}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 font-mono text-xs">{role._id}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-slate-700">{role.createdBy?.name || 'System'}</td>
                  <td className="py-3 px-4 text-sm font-bold text-[#1e3a8a]">{role.roleCode}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{role.roleDesc}</td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={async () => {
                        if(confirm('Delete role?')) {
                          await settingsApi.deleteRole(role._id);
                          fetchRoles();
                        }
                      }}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {roles.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">No roles found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
