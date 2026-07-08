import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../../../services/api';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

export default function SecurityPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match');
    }

    if (newPassword.length < 6) {
      return setError('New password must be at least 6 characters');
    }

    setIsLoading(true);
    try {
      await api.put('/api/users/change-password', {
        oldPassword,
        newPassword
      });
      setSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Keep your account secure by updating your password regularly.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <div className="bg-orange-50 p-3 rounded-full text-orange-600">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
            <p className="text-sm text-gray-500">You will be logged out of other devices.</p>
          </div>
        </div>

        {error && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}
        {success && <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
          <div className="relative">
            <Input 
              label="Current Password" 
              type={showOldPassword ? 'text' : 'password'} 
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              required
              icon={<Lock size={18} />} 
            />
            <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
              {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <Input 
              label="New Password" 
              type={showNewPassword ? 'text' : 'password'} 
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              icon={<Lock size={18} />} 
            />
            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <Input 
              label="Confirm New Password" 
              type={showNewPassword ? 'text' : 'password'} 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              icon={<Lock size={18} />} 
            />
          </div>

          <div className="pt-2">
            <Button type="submit" isLoading={isLoading}>Update Password</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
