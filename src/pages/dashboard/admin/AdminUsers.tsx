import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Search, Trash2 } from 'lucide-react';
import Loader from '../../../components/common/Loader';
import RefreshButton from '../../../components/ui/RefreshButton';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/admin/users?role=USER&page=${page}&limit=10`);
      setUsers(data.data || (Array.isArray(data) ? data : []));
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
      try {
        await api.delete(`/api/admin/users/${id}`);
        toast.success('User deleted successfully');
        setUsers(users.filter((u: any) => u._id !== id));
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

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
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">View and manage platform users</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full md:w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <RefreshButton onClick={fetchUsers} loading={loading} count={users.length} />
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-gray-700 uppercase font-bold text-xs border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 rounded-tr-2xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80">
              {users.map((user: any) => (
                <tr key={user._id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold shadow-inner group-hover:scale-105 transition-transform">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">{user.email}</span>
                      <span className="text-xs text-gray-500 mt-0.5">{user.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center ${
                      user.roles?.includes('SUPER_ADMIN') ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                      user.roles?.includes('B2B_AGENT') ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                      'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        user.roles?.includes('SUPER_ADMIN') ? 'bg-purple-500' :
                        user.roles?.includes('B2B_AGENT') ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`}></span>
                      {user.roles?.[0] || 'USER'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!user.roles?.includes('SUPER_ADMIN') && (
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="inline-flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-red-200"
                        title="Delete User"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>{/* Pagination Controls */}
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
    </div>
  );
}





