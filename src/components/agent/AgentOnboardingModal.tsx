import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, setCredentials } from '../../store/authSlice';
import toast from 'react-hot-toast';
import axios from 'axios';

interface AgentOnboardingModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

const AgentOnboardingModal: React.FC<AgentOnboardingModalProps> = ({ isOpen, onClose }) => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    companyRole: '',
    companyName: '',
    employeeSize: '',
    gstn: ''
  });
  const [loading, setLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isOpen || isDismissed) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.companyRole || !formData.companyName || !formData.employeeSize) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put('http://localhost:5000/api/users/agent/onboarding', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Update local storage and redux
      const updatedUser = res.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch(setCredentials({ user: updatedUser, token: localStorage.getItem('token')! }));
      
      toast.success('Details submitted! Pending Admin Approval.');
      if (onClose) onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error submitting details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
      onClick={() => setIsDismissed(true)}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <span className="text-orange-500 font-bold text-xs">BACK</span>
            <h2 className="text-2xl font-black text-gray-900 mt-1">Your Account Details</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <button onClick={() => { if (onClose) onClose(); setIsDismissed(true); }} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Your Name<span className="text-red-500">*</span></label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-orange-200 rounded-md focus:outline-none focus:border-orange-500" 
              placeholder="Full name" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Mobile No.<span className="text-red-500">*</span></label>
            <div className="flex border border-orange-200 rounded-md overflow-hidden focus-within:border-orange-500">
              <div className="bg-gray-50 px-3 py-2 border-r border-orange-200 flex items-center gap-2">
                <span>🇮🇳</span>
                <span className="text-pink-600 font-bold">+91</span>
              </div>
              <input 
                type="text" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 focus:outline-none" 
                placeholder="Enter your mobile number" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Your role in the company ?<span className="text-red-500">*</span></label>
            <div className="flex items-center gap-6">
              {['Founder', 'CXO', 'Admin', 'Employee'].map(role => (
                <label key={role} className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.companyRole === role ? 'border-orange-500' : 'border-gray-300 group-hover:border-orange-300'}`}>
                    {formData.companyRole === role && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>}
                  </div>
                  <input type="radio" name="companyRole" value={role} onChange={handleChange} className="hidden" />
                  <span className="text-sm font-medium text-gray-700">{role}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Company Name<span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-orange-200 rounded-md focus:outline-none focus:border-orange-500" 
                placeholder="Enter Company name" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Number of Your employee size?<span className="text-red-500">*</span></label>
              <select 
                name="employeeSize"
                value={formData.employeeSize}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-orange-200 rounded-md focus:outline-none focus:border-orange-500 bg-white"
              >
                <option value="">Select</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="200+">200+</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Your Company GSTN Nos.</label>
            <input 
              type="text" 
              name="gstn"
              value={formData.gstn}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-orange-200 rounded-md focus:outline-none focus:border-orange-500 uppercase" 
              placeholder="e.g. 27AAAAA0000A1Z5" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 rounded-lg font-black text-sm transition-colors mt-4 disabled:bg-gray-300 bg-gray-300 hover:bg-gray-400 text-white"
            style={formData.name && formData.phone && formData.companyRole && formData.companyName && formData.employeeSize ? { backgroundColor: '#ff6d38' } : {}}
          >
            {loading ? 'SAVING...' : 'SAVE & CONTINUE'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AgentOnboardingModal;
