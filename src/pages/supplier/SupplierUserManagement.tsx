import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Shield, UserCheck } from 'lucide-react';
import api from '../../services/api';

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/users/agents');
      if (Array.isArray(response.data)) {
        const mapped: SupplierUser[] = response.data.map((u: any) => ({
          id: u._id || u.id,
          userName: u.companyName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name || 'Agent',
          emailId: u.email,
          mobileNumber: u.phone || u.mobileNumber || 'N/A',
          status: (u.agentStatus === 'APPROVED' ? 'Active' : 'InActive') as "Active" | "InActive",
          role: 'Supplier'
        }));
        setUsers(mapped);
      }
    } catch (err) {
      setUsers([]);
    } finally {
      setLoading(false);
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

          <button className="w-8 h-8 bg-[#0d2259] text-white rounded-full flex items-center justify-center hover:bg-blue-900 transition-colors shadow-sm" title="Add User">
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
                    <button className="w-7 h-7 bg-amber-500 text-white rounded-full inline-flex items-center justify-center hover:bg-amber-600 transition-colors shadow-sm">
                      <Edit2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierUserManagement;
