import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldAlert, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, selectCurrentUser, selectIsAuthenticated } from '../../store/authSlice';
import toast from 'react-hot-toast';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in as admin, redirect to admin dashboard
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.roles?.includes('SUPER_ADMIN')) {
        navigate('/admin', { replace: true });
      } else if (currentUser.roles?.includes('SUB_ADMIN')) {
        navigate('/sub-admin', { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { 
        email: email.trim(), 
        password 
      });
      const data = response.data;
      const { token, ...user } = data;

      // Validate administrative roles
      if (!user.roles?.includes('SUPER_ADMIN') && !user.roles?.includes('SUB_ADMIN')) {
        throw new Error('Access denied. This portal is strictly reserved for TrippeChalo Administrators.');
      }

      dispatch(setCredentials({ user, token: token || data.token }));
      toast.success(`Welcome back, ${user.name || 'Admin'}!`, { id: 'admin-login-success' });

      if (user.roles?.includes('SUPER_ADMIN')) {
        navigate('/admin');
      } else {
        navigate('/sub-admin');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Invalid credentials. Please try again.';
      setError(msg);
      toast.error(msg, { id: 'admin-login-err' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1a40] via-[#112255] to-[#1e3a8a] flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div 
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 30%, rgba(59, 130, 246, 0.4) 0%, transparent 70%)`
        }}
      />
      
      {/* Top return link */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between z-10 px-1">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-200/80 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to Website
        </Link>
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300/60 bg-blue-900/40 px-2.5 py-1 rounded-full border border-blue-400/20">
          Admin Portal
        </span>
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 md:p-10 z-10 text-center relative border border-gray-100/10 backdrop-blur-sm">
        {/* Top Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 mb-3 border border-white/20">
            TC
          </div>
          <span className="text-xl font-black text-[#0c1a40] tracking-tight uppercase">
            TRIPPE<span className="text-blue-600">CHALO</span>
          </span>
          <span className="text-xs text-gray-500 font-semibold tracking-wide mt-0.5">
            Administration & Operations Control Panel
          </span>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">Administrator Sign In</h2>
          <p className="text-xs text-gray-400 mt-1">Authorized personnel only</p>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 text-red-700 text-xs p-3.5 rounded-xl border border-red-200/80 font-medium text-left flex items-start gap-2.5">
            <ShieldAlert size={16} className="text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Admin Email / Username
            </label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3.5 text-gray-400 pointer-events-none" />
              <input 
                type="text" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="admin@trippechalo.com"
                className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium placeholder:text-gray-400 transition-all bg-gray-50/50 hover:bg-white focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-gray-400 pointer-events-none" />
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter your admin password"
                className="w-full pl-10 pr-10 py-3 text-xs rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium placeholder:text-gray-400 transition-all bg-gray-50/50 hover:bg-white focus:bg-white"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link 
              to="/forgot-password?portal=admin" 
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0c1a40] hover:bg-blue-950 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-blue-950/20 mt-2 tracking-wider uppercase cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              'Access Admin Panel'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-6 text-[11px] text-gray-400">
          <span>Protected by 256-Bit SSL</span>
          <span>•</span>
          <span>Role-Based Access</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
