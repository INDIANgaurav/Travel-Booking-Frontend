import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Shield, UserCheck, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface SupplierUser {
  id: string;
  userName: string;
  emailId: string;
  mobileNumber: string;
  status: 'Active' | 'InActive';
  role: string;
}

const SupplierUserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<SupplierUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SupplierUser | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/users/supplier-staff');
      if (Array.isArray(response.data)) {
        const mapped: SupplierUser[] = response.data.map((u: any) => ({
          id: u._id || u.id,
          userName: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Agent',
          emailId: u.email,
          mobileNumber: u.phone || u.mobileNumber || 'N/A',
          status: (u.isActive === false ? 'InActive' : 'Active') as "Active" | "InActive",
          role: 'Supplier Staff'
        }));
        setUsers(mapped);
      }
    } catch (err: any) {
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', phone: '', password: '', status: 'Active' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: SupplierUser) => {
    setEditingUser(user);
    setFormData({
      name: user.userName,
      email: user.emailId,
      phone: user.mobileNumber === 'N/A' ? '' : user.mobileNumber,
      password: '',
      status: user.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Edit User
        await api.put(`/api/users/supplier-staff/${editingUser.id}`, {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          isActive: formData.status === 'Active'
        });
        toast.success('User updated successfully');
      } else {
        // Add User
        await api.post('/api/users/supplier-staff', {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });
        toast.success('User added successfully');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const filteredUsers = users.filter(u => 
    u.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.emailId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.mobileNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Outer Card with Blue Header Bar */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {/* Blue Header Bar */}
        <div className="bg-[#1d6aa3] text-white px-6 py-3 flex justify-between items-center">
          <h2 className="text-sm font-bold tracking-wider uppercase flex items-center gap-2">
            USER MANAGEMENT
          </h2>
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-white border-b border-gray-100 flex justify-end items-center gap-3">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
            <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
          </div>

          <button 
            onClick={handleOpenAdd}
            className="w-8 h-8 bg-[#0d2259] text-white rounded-full flex items-center justify-center hover:bg-blue-900 transition-colors shadow-sm" title="Add User"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* User Management Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#e9ecef] text-gray-700 font-bold uppercase tracking-wider border-b border-gray-300">
              <tr>
                <th className="p-3">USER NAME</th>
                <th className="p-3">EMAIL ID</th>
                <th className="p-3">MOBILE NUMBER</th>
                <th className="p-3">STATUS</th>
                <th className="p-3">ROLE</th>
                <th className="p-3 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-bold text-gray-900">{user.userName}</td>
                  <td className="p-3 text-gray-700">{user.emailId}</td>
                  <td className="p-3 font-medium text-gray-700">{user.mobileNumber}</td>
                  <td className="p-3">
                    <span className={`font-semibold ${user.status === 'Active' ? 'text-emerald-600' : 'text-gray-600'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="bg-[#60a5fa] text-white px-3 py-1 rounded text-[11px] font-bold shadow-sm inline-block">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button 
                      onClick={() => handleOpenEdit(user)}
                      className="w-7 h-7 bg-amber-500 text-white rounded-full inline-flex items-center justify-center hover:bg-amber-600 transition-colors shadow-sm"
                    >
                      <Edit2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-[#1d6aa3] px-4 py-3 flex justify-between items-center text-white">
              <h3 className="font-bold uppercase text-sm">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-blue-800 p-1 rounded transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email ID *</label>
                <input 
                  type="email" 
                  required
                  disabled={!!editingUser}
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className={`w-full text-sm px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none ${editingUser ? 'bg-gray-100' : ''}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number *</label>
                <input 
                  type="text" 
                  required
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
                  <input 
                    type="password" 
                    required
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {editingUser && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="InActive">InActive</option>
                  </select>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-3 border-t border-gray-100 mt-5">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 text-sm font-bold text-white bg-[#0d2259] hover:bg-blue-900 rounded shadow transition-colors"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierUserManagement;
