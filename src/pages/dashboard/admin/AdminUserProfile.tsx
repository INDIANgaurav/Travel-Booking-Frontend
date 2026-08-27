import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import UserProfileForm from '../../../components/admin/UserProfileForm';

export default function AdminUserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const { data } = await api.get(`/api/admin/users/${id}`);
      setUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Failed to load user profile');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (formData: any) => {
    setSaving(true);
    try {
      await api.put(`/api/admin/users/${id}`, formData);
      toast.success('User profile updated successfully');
      fetchUser(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase">
            {user.name} ({user.irctcAgentId || user._id.slice(-6).toUpperCase()}) 
            <span className="ml-2 text-sm bg-green-500 text-white px-2 py-1 rounded-md">{user.roles?.[0]}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage user profile, roles, and ledger settings</p>
        </div>
      </div>

      <UserProfileForm 
        initialData={user} 
        onSave={handleUpdate} 
        isSaving={saving} 
        isAdminViewingSelf={false} 
      />
    </div>
  );
}
