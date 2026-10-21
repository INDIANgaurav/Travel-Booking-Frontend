import React, { useState, useEffect } from 'react';
import { X, UserPlus, Eye, EyeOff, Check, Shield } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import Dropdown from '../../ui/Dropdown';
import Loader from '../../common/Loader';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  defaultRole?: string;
}

const DEFAULT_ROLES = [
  { id: 'USER', label: 'Normal User (B2C)' },
  { id: 'B2B_AGENT', label: 'B2B Agent' },
  { id: 'SUB_ADMIN', label: 'TRC Admin / Staff' },
  { id: 'SUPPLIER_AGENT', label: 'Supplier Agent' },
  { id: 'SUPPLIER_STAFF', label: 'Supplier Staff' },
  { id: 'SUPER_ADMIN', label: 'Super Admin' }
];

export default function CreateUserModal({
  isOpen,
  onClose,
  onSuccess,
  title,
  defaultRole = 'B2B_AGENT'
}: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    address: '',
    city: '',
    password: '',
    confirmPassword: '',
    role: defaultRole
  });

  const [availableRoles, setAvailableRoles] = useState(DEFAULT_ROLES);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, role: defaultRole }));
      
      // Fetch dynamic roles from settings if available
      const fetchDynamicRoles = async () => {
        try {
          const res = await api.get('/api/settings/roles');
          if (res.data && res.data.success) {
            const dynamic = res.data.data.map((r: any) => ({
              id: r.roleCode,
              label: r.roleDesc ? `${r.roleCode} (${r.roleDesc})` : r.roleCode
            }));
            setAvailableRoles(prev => {
              const merged = [...prev];
              dynamic.forEach((dr: any) => {
                if (!merged.find(m => m.id === dr.id)) merged.push(dr);
              });
              return merged;
            });
          }
        } catch (err) {
          // Fall back to default roles silently
        }
      };
      fetchDynamicRoles();
    }
  }, [isOpen, defaultRole]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('First and Last names are required');
      return;
    }

    if (!formData.email.trim() || !formData.phone.trim()) {
      toast.error('Email and Mobile number are required');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const payload = {
        name: fullName,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        companyName: formData.companyName.trim(),
        address: formData.address.trim(),
        officeAddress: formData.address.trim(),
        city: formData.city.trim(),
        password: formData.password,
        roles: [formData.role],
        role: formData.role
      };

      const res = await api.post('/api/admin/users', payload);
      if (res.data) {
        toast.success(`${title || 'Account'} created successfully!`);
        onSuccess();
        onClose();
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          companyName: '',
          address: '',
          city: '',
          password: '',
          confirmPassword: '',
          role: defaultRole
        });
      }
    } catch (error: any) {
      console.error('Failed to create user/agent:', error);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle = title || (defaultRole === 'B2B_AGENT' ? 'Add New Agent' : 'Add New User');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 border border-gray-100">
        
        {/* Top Blue Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white backdrop-blur-sm shadow-inner">
              <UserPlus size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide leading-tight">{modalTitle}</h2>
              <p className="text-xs text-blue-100/90 font-medium">Personal Details & Account Credentials</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-colors"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Row 1: First Name, Last Name, Mobile */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
              <input 
                required 
                type="text" 
                placeholder="e.g. Rahul" 
                value={formData.firstName} 
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} 
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white font-medium" 
                disabled={isSubmitting} 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
              <input 
                required 
                type="text" 
                placeholder="e.g. Verma" 
                value={formData.lastName} 
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} 
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white font-medium" 
                disabled={isSubmitting} 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Mobile Number <span className="text-red-500">*</span></label>
              <input 
                required 
                type="tel" 
                placeholder="e.g. 9876543210" 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white font-medium" 
                disabled={isSubmitting} 
              />
            </div>

            {/* Row 2: Email, Role, Company Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
              <input 
                required 
                type="email" 
                placeholder="partner@company.com" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white font-medium" 
                disabled={isSubmitting} 
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Assign Role <span className="text-red-500">*</span></label>
              <Dropdown
                value={formData.role}
                onChange={(val) => setFormData({ ...formData, role: val })}
                options={availableRoles.map(r => ({ value: r.id, label: r.label }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Company Name <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input 
                type="text" 
                placeholder="e.g. Skyline Holidays" 
                value={formData.companyName} 
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} 
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white font-medium" 
                disabled={isSubmitting} 
              />
            </div>

            {/* Row 3: City, Address (span 2) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
              <input 
                required 
                type="text" 
                placeholder="e.g. New Delhi" 
                value={formData.city} 
                onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white font-medium" 
                disabled={isSubmitting} 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Office Address <span className="text-red-500">*</span></label>
              <input 
                required 
                type="text" 
                placeholder="Office suite, street, locality" 
                value={formData.address} 
                onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white font-medium" 
                disabled={isSubmitting} 
              />
            </div>

            {/* Row 4: Password, Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  required 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Minimum 6 characters" 
                  value={formData.password} 
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white font-medium pr-10" 
                  disabled={isSubmitting} 
                  minLength={6} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  required 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Re-enter password" 
                  value={formData.confirmPassword} 
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} 
                  className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none focus:ring-2 transition-all bg-white font-medium pr-10 ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500/20 focus:border-blue-500'
                  }`} 
                  disabled={isSubmitting} 
                  minLength={6} 
                />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                )}
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-[11px] text-red-500 font-semibold mt-1">Passwords do not match</p>
              )}
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-5 border-t border-gray-100 flex justify-end gap-3 items-center">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors" 
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || (formData.password !== formData.confirmPassword)} 
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
