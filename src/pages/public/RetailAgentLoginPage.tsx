import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, ArrowRight, Eye, EyeOff, Plane, Building2, ShieldCheck, CreditCard, Compass, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';

const RetailAgentLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { 
        email: phoneOrEmail, 
        password 
      });
      const user = response.data;

      // Check if user is an agent or supplier
      if (user.role !== 'TRAVEL_AGENT' && user.role !== 'SUPPLIER_AGENT' && user.role !== 'SELLER') {
        throw new Error('This portal is strictly for B2B Agents. Regular users cannot log in here.');
      }

      dispatch(setCredentials({ user, token: user.token }));

      // Redirect to the B2B Agent Search Engine Portal
      navigate('/b2b/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-800 flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-gray-100 px-6 md:px-12 py-3 flex justify-between items-center shadow-sm">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-black text-lg shadow-md">
            TC
          </div>
          <div>
            <span className="text-xl font-black text-[#0c1a40] tracking-tight uppercase">TRIPPE<span className="text-blue-600">BIZ</span></span>
            <span className="block text-[9px] text-gray-400 font-bold tracking-widest uppercase -mt-1">B2B AGENT PORTAL</span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-gray-700">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <Link to="#" className="hover:text-blue-600 transition-colors">About Us</Link>
          <Link to="#" className="hover:text-blue-600 transition-colors">Contact Us</Link>
        </nav>

        {/* Right Contacts & Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-400 text-gray-900 rounded-full flex items-center justify-center font-bold">
              <Phone size={16} />
            </div>
            <div>
              <span className="block text-[9px] text-gray-400 font-bold uppercase">Call Us</span>
              <span className="font-extrabold text-xs text-[#0c1a40]">+91 9555934205</span>
            </div>
          </div>

          <Link
            to="/b2b/signup"
            className="bg-[#0b1031] hover:bg-blue-900 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow-md flex items-center gap-1.5"
          >
            <span>Register</span>
            <ArrowRight size={14} />
          </Link>

          <Link
            to="/supplier/login"
            className="border border-gray-300 hover:border-gray-400 text-gray-800 font-bold text-xs px-4 py-2 rounded-full transition-all flex items-center gap-1 bg-white shadow-sm"
          >
            <span>Supplier Login</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </header>

      {/* Service Category Icons Row */}
      <div className="bg-white py-4 border-b border-gray-100 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-around px-4">
          <div className="flex flex-col items-center gap-1.5 group cursor-pointer">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm border border-blue-100">
              <Plane size={22} />
            </div>
            <span className="text-xs font-bold text-gray-700">Flight</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 group cursor-pointer">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm border border-indigo-100">
              <Building2 size={22} />
            </div>
            <span className="text-xs font-bold text-gray-700">Hotel & Villas</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 group cursor-pointer">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm border border-emerald-100">
              <ShieldCheck size={22} />
            </div>
            <span className="text-xs font-bold text-gray-700">Insurance</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 group cursor-pointer">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm border border-purple-100">
              <CreditCard size={22} />
            </div>
            <span className="text-xs font-bold text-gray-700">Visa</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 group cursor-pointer">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm border border-amber-100">
              <Compass size={22} />
            </div>
            <span className="text-xs font-bold text-gray-700">Umrah Packages</span>
          </div>
        </div>
      </div>

      {/* Main Hero Card with Login Bar */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-8">
        <div 
          className="relative rounded-3xl overflow-hidden shadow-2xl p-8 md:p-14 text-white flex flex-col justify-center items-center text-center bg-cover bg-center min-h-[420px]"
          style={{
            backgroundImage: `linear-gradient(rgba(11, 16, 49, 0.55), rgba(11, 16, 49, 0.65)), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')`
          }}
        >
          {/* Top Inline Login Bar */}
          <form onSubmit={handleLogin} className="w-full max-w-xl bg-white rounded-full p-2 shadow-2xl mb-4 flex items-center gap-2 text-gray-800 border border-white/40 backdrop-blur-md">
            <input
              type="text"
              placeholder="Enter Mobile Number / Email"
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              required
              className="flex-1 text-xs px-5 py-2.5 outline-none font-bold bg-transparent placeholder:text-gray-400 placeholder:font-normal"
            />
            
            <div className="w-px h-6 bg-gray-200" />

            <div className="flex-1 relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-xs px-5 py-2.5 outline-none font-bold bg-transparent placeholder:text-gray-400 placeholder:font-normal pr-8"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#0b1031] hover:bg-blue-900 text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all shadow-md flex items-center gap-1.5 shrink-0"
            >
              <span>{loading ? 'Wait...' : 'Login'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {error && (
            <div className="bg-red-500/90 text-white text-xs px-4 py-1.5 rounded-full mb-3 font-semibold shadow">
              {error}
            </div>
          )}

          <div className="text-xs text-white/90 font-medium mb-8">
            Forgot your password? <button type="button" onClick={() => navigate('/forgot-password')} className="font-bold underline text-amber-300 hover:text-amber-200">Reset Here</button>
          </div>

          {/* Hero Main Titles */}
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 drop-shadow-md">
            Maximize your earning with TrippeChalo
          </h1>
          <p className="text-xs md:text-sm text-gray-200 max-w-2xl leading-relaxed drop-shadow">
            Unlock travel profits with TrippeChalo! Promote unbeatable flight, hotel, and tour package deals to attract explorers, boost clicks, and turn wanderlust into revenue fast.
          </p>
        </div>

        {/* Bottom Section: Latest Deals */}
        <div className="text-center mt-12 space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-[#0c1a40] tracking-tight">
            Latest Deals & Offer's
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Your travel dreams, our expert execution
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        © 2026 TrippeChalo. All rights reserved. B2B Agent Portal
      </footer>
    </div>
  );
};

export default RetailAgentLoginPage;
