import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import api from '../../services/api';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';

const SupplierLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { email, password });
      const user = response.data;

      // Ensure only suppliers can log in here
      if (user.role !== 'SUPPLIER_AGENT' && user.role !== 'SUPER_ADMIN' && user.role !== 'SUB_ADMIN') {
        throw new Error('This portal is restricted to Suppliers and Admins only.');
      }

      // Dispatch credentials and redirect to the Seller / Supplier Portal
      dispatch(setCredentials({ user, token: user.token }));
      navigate('/supplier-portal/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0284c7] via-[#0284c7] to-[#1e3a8a] flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
      {/* Decorative Ray Background Overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.4) 0%, transparent 60%)`
        }}
      />

      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 md:p-10 z-10 text-center relative">
        {/* Top Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-black text-xl shadow-md mb-2">
            TC
          </div>
          <span className="text-xl font-black text-[#0c1a40] tracking-tight uppercase">TRIPPE<span className="text-blue-600">CHALO</span></span>
          <span className="text-[10px] text-gray-400 font-semibold italic tracking-wider">Let us check in for you</span>
        </div>

        {/* Title with Underline */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#1e295b]">Supplier Login</h2>
          <div className="h-0.5 bg-[#1e295b] w-28 mx-auto mt-2 rounded-full" />
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 font-medium text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <input 
              type="text" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Mobile Number / Email"
              className="w-full px-4 py-3 text-xs rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none font-medium placeholder:text-gray-400"
            />
          </div>

          <div className="relative flex items-center">
            <input 
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full px-4 py-3 text-xs rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none font-medium placeholder:text-gray-400 pr-10"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#283262] hover:bg-blue-900 text-white font-bold text-xs py-3 rounded-md transition-all shadow-md mt-2 tracking-wider"
          >
            {loading ? 'LOGGING IN...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-left">
          <Link to="/forgot-password" className="text-[11px] font-bold text-[#1e295b] hover:underline">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SupplierLoginPage;
