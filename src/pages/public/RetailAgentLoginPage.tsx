import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Phone, ArrowRight, Eye, EyeOff, Plane, Building2, ShieldCheck, 
  CreditCard, Compass, ExternalLink, Globe, CheckCircle2, HeadphonesIcon, MousePointerClick, 
  Mail, MessageSquare
} from 'lucide-react';
import api from '../../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import type { RootState } from '../../store/store';

const RetailAgentLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, user: currentUser } = useSelector((state: RootState) => state.auth);

  // If already logged in, redirect to home
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      navigate('/b2b/home', { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

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
      if (!user.roles?.includes('B2B_AGENT') && !user.roles?.includes('SUPPLIER_AGENT') && !user.roles?.includes('SELLER')) {
        throw new Error('This portal is strictly for B2B Agents. Regular users cannot log in here.');
      }

      dispatch(setCredentials({ user, token: user.token }));

      // Redirect to the B2B Agent Search Engine Portal
      navigate('/b2b/home');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-800 flex flex-col">
      {/* Top Header Bar (Sticky) */}
      <header className="bg-white border-b border-gray-100 px-3 md:px-12 py-3 flex flex-wrap justify-between items-center shadow-sm sticky top-0 z-50 transition-all gap-y-2">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center">
            <img src="/tg-favicon.svg" alt="TrippeChalo" className="w-8 h-8 md:w-10 md:h-10" crossOrigin="anonymous" />
          </div>
          <div>
            <span className="text-lg md:text-xl font-black text-[#0c1a40] tracking-tight uppercase">TRIPPE<span className="text-blue-600">CHALO</span></span>
            <span className="block text-[8px] md:text-[9px] text-gray-400 font-bold tracking-widest uppercase -mt-1">B2B AGENT ENGINE</span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-gray-700">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <Link to="#" className="hover:text-blue-600 transition-colors">About Us</Link>
          <Link to="#" className="hover:text-blue-600 transition-colors">Contact Us</Link>
        </nav>

        {/* Right Contacts & Actions */}
        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-end">
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
            className="bg-[#0b1031] hover:bg-blue-900 text-white font-bold text-[10px] md:text-xs px-4 py-2 md:px-5 md:py-2.5 rounded-full transition-all shadow-md flex items-center gap-1.5"
          >
            <span>Register</span>
            <ArrowRight size={12} className="md:w-3.5 md:h-3.5" />
          </Link>

          <Link
            to="/supplier/login"
            className="border border-gray-300 hover:border-gray-400 text-gray-800 font-bold text-[10px] md:text-xs px-3 py-2 md:px-4 md:py-2.5 rounded-full transition-all flex items-center gap-1 bg-white shadow-sm"
          >
            <span className="hidden sm:inline">Supplier Login</span>
            <span className="sm:hidden">Supplier</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </header>

      {/* Service Category Icons Row */}
      <div className="bg-[#f8fafc] py-3 border-b border-gray-100 z-40 relative">
        <div className="max-w-4xl mx-auto flex items-center justify-start md:justify-around px-4 overflow-x-auto hidden-scrollbar gap-6 md:gap-0 pb-1">
          <div className="flex flex-col items-center gap-2 group cursor-pointer shrink-0">
            <div className="w-14 h-14 bg-white text-[#0c1a40] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm border border-gray-100">
              <Plane size={24} />
            </div>
            <span className="text-[11px] font-black text-[#0c1a40]">Flight</span>
          </div>

          <div className="flex flex-col items-center gap-2 group cursor-pointer shrink-0">
            <div className="w-14 h-14 bg-white text-[#0c1a40] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm border border-gray-100">
              <Building2 size={24} />
            </div>
            <span className="text-[11px] font-black text-[#0c1a40]">Hotel & Villas</span>
          </div>


        </div>
      </div>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-3 md:px-6 py-4">
        {/* Main Hero Card with Login Bar */}
        <div 
          className="relative rounded-[2rem] overflow-hidden shadow-2xl p-6 md:p-10 text-white flex flex-col items-center bg-cover bg-center min-h-[380px] mb-2"
          style={{
            backgroundImage: `linear-gradient(rgba(11, 16, 49, 0.4), rgba(11, 16, 49, 0.7)), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80')`
          }}
        >
          {/* Inline Login Form (Stacked on mobile, pill on desktop) */}
          <form onSubmit={handleLogin} className="w-full max-w-2xl md:bg-white md:rounded-full md:p-1.5 md:shadow-2xl mb-1.5 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2 text-gray-800 mt-2">
            
            <div className="w-full md:flex-1 bg-white rounded-full flex items-center shadow-md md:shadow-none relative">
              <input
                type="text"
                placeholder="Enter Mobile Number or Email"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                required
                className="w-full text-xs px-6 py-3 md:py-2.5 outline-none font-bold bg-transparent placeholder:text-gray-400 placeholder:font-normal rounded-full"
              />
            </div>
            
            <div className="hidden md:block w-px h-8 bg-gray-200" />

            <div className="w-full md:flex-1 relative flex items-center bg-white rounded-full shadow-md md:shadow-none">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-xs px-6 py-3 md:py-2.5 outline-none font-bold bg-transparent placeholder:text-gray-400 placeholder:font-normal pr-10 rounded-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#0b1031] hover:bg-blue-900 text-white text-sm font-bold px-8 py-3 md:py-2.5 rounded-full transition-all shadow-md flex justify-center items-center gap-2 shrink-0 md:mr-0.5 mt-2 md:mt-0"
            >
              <span>{loading ? 'Wait...' : 'Login'}</span>
            </button>
          </form>
          
          <div className="text-xs text-white/90 font-medium mb-6">
            Forgot your password? <button type="button" onClick={() => navigate('/forgot-password')} className="font-bold underline text-amber-300 hover:text-amber-200">Reset Here</button>
          </div>

          {error && (
            <div className="bg-red-500/90 text-white text-xs px-4 py-1.5 rounded-full mb-3 font-semibold shadow">
              {error}
            </div>
          )}

          {/* Hero Main Titles */}
          <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-3 drop-shadow-md text-center">
            Your Gateway to Smarter Travel Business
          </h1>
          <p className="text-xs md:text-sm text-gray-100 max-w-2xl leading-relaxed drop-shadow text-center">
            Power your agency with TrippeChalo's B2B engine — access real-time inventory, instant PNR generation, and exclusive agent fares across 100+ airlines. Book faster, earn more.
          </p>
        </div>

        {/* Latest Deals Headings */}
        <div className="text-center mt-12 space-y-3">
          <h2 className="text-3xl font-black text-[#0c1a40] tracking-tight">
            Latest Deals & Offer's
          </h2>
          <div className="pb-12 border-b border-gray-200">
            <p className="text-xs text-gray-500 font-medium">
              Your travel dreams, our expert execution
            </p>
          </div>
        </div>

        {/* Features & Benefits Heading */}
        <div className="text-center mt-16 mb-16 space-y-3">
          <h2 className="text-3xl font-black text-[#0c1a40] tracking-tight">
            Unmatched Features & Benefits
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Your travel dreams, our expert execution
          </p>
        </div>

        {/* 3 Columns Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24 px-8 max-w-5xl mx-auto">
          {/* Col 1 - Instant Booking & PNR (Laptop + Clock style) */}
          <div className="flex flex-col items-center text-center gap-6">
            <div className="w-24 h-24 relative flex items-center justify-center">
              {/* Laptop body */}
              <svg width="80" height="70" viewBox="0 0 80 70" fill="none">
                <rect x="10" y="5" width="55" height="40" rx="4" stroke="#1e3a8a" strokeWidth="2.5" fill="#f0f4ff"/>
                <rect x="16" y="11" width="43" height="28" rx="2" fill="#dbeafe"/>
                {/* Clock icon inside screen */}
                <circle cx="37" cy="25" r="10" stroke="#1e3a8a" strokeWidth="2" fill="white"/>
                <line x1="37" y1="25" x2="37" y2="18" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round"/>
                <line x1="37" y1="25" x2="43" y2="25" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round"/>
                {/* Keyboard base */}
                <path d="M5 45 L10 45 L10 48 C10 50 12 52 14 52 L61 52 C63 52 65 50 65 48 L65 45 L70 45 C72 45 74 47 74 49 L74 50 C74 52 72 54 70 54 L5 54 C3 54 1 52 1 50 L1 49 C1 47 3 45 5 45Z" fill="#1e3a8a"/>
                {/* Dotted lines decoration */}
                <circle cx="6" cy="8" r="1.5" fill="#1e3a8a" opacity="0.3"/>
                <circle cx="6" cy="14" r="1.5" fill="#1e3a8a" opacity="0.3"/>
                <circle cx="6" cy="20" r="1.5" fill="#1e3a8a" opacity="0.3"/>
              </svg>
            </div>
            <div>
              <h3 className="font-black text-[#0c1a40] mb-3 text-lg">Instant Booking & PNR</h3>
              <p className="text-xs text-gray-500 leading-relaxed px-4">Real-time ticketing and PNR generation made easy.</p>
            </div>
          </div>
          {/* Col 2 - Real-Time Flight Availability (Phone + Checkmark) */}
          <div className="flex flex-col items-center text-center gap-6">
            <div className="w-24 h-24 relative flex items-center justify-center">
              <svg width="60" height="80" viewBox="0 0 60 80" fill="none">
                {/* Phone body */}
                <rect x="10" y="2" width="40" height="70" rx="8" stroke="#1e3a8a" strokeWidth="2.5" fill="#f0f4ff"/>
                <rect x="15" y="12" width="30" height="45" rx="2" fill="#dbeafe"/>
                {/* Home button */}
                <circle cx="30" cy="65" r="3" stroke="#1e3a8a" strokeWidth="1.5" fill="white"/>
                {/* Camera notch */}
                <circle cx="30" cy="7" r="2" fill="#1e3a8a" opacity="0.3"/>
                {/* Green checkmark circle */}
                <circle cx="44" cy="16" r="10" fill="#22c55e"/>
                <path d="M39 16 L43 20 L50 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Signal bars on screen */}
                <rect x="20" y="25" width="3" height="8" rx="1" fill="#1e3a8a" opacity="0.4"/>
                <rect x="25" y="22" width="3" height="11" rx="1" fill="#1e3a8a" opacity="0.5"/>
                <rect x="30" y="19" width="3" height="14" rx="1" fill="#1e3a8a" opacity="0.7"/>
                <rect x="35" y="16" width="3" height="17" rx="1" fill="#1e3a8a"/>
              </svg>
            </div>
            <div>
              <h3 className="font-black text-[#0c1a40] mb-3 text-lg">Real - Time Flight Availability</h3>
              <p className="text-xs text-gray-500 leading-relaxed px-4">Accurate, up-to-the-minute flight availability info.</p>
            </div>
          </div>
          {/* Col 3 - API/White Label (Code brackets) */}
          <div className="flex flex-col items-center text-center gap-6">
            <div className="w-24 h-24 relative flex items-center justify-center">
              <svg width="80" height="70" viewBox="0 0 80 70" fill="none">
                {/* Browser window */}
                <rect x="5" y="5" width="70" height="55" rx="6" stroke="#1e3a8a" strokeWidth="2.5" fill="#f0f4ff"/>
                {/* Title bar dots */}
                <circle cx="14" cy="14" r="2.5" fill="#ef4444"/>
                <circle cx="22" cy="14" r="2.5" fill="#eab308"/>
                <circle cx="30" cy="14" r="2.5" fill="#22c55e"/>
                {/* Title bar line */}
                <line x1="5" y1="21" x2="75" y2="21" stroke="#1e3a8a" strokeWidth="1" opacity="0.2"/>
                {/* Code brackets */}
                <text x="23" y="42" fontFamily="monospace" fontSize="22" fontWeight="900" fill="#1e3a8a" opacity="0.8">&lt;/&gt;</text>
                {/* Decorative code lines */}
                <rect x="15" y="50" width="20" height="2" rx="1" fill="#60a5fa"/>
                <rect x="40" y="50" width="12" height="2" rx="1" fill="#a78bfa"/>
              </svg>
            </div>
            <div>
              <h3 className="font-black text-[#0c1a40] mb-3 text-lg">API/White Label</h3>
              <p className="text-xs text-gray-500 leading-relaxed px-4">Seamless API and white label integration for travel services.</p>
            </div>
          </div>
        </div>

        {/* Partner Airline */}
        <div className="text-center mb-10">
           <h2 className="text-3xl font-black text-[#0c1a40] tracking-tight">Partner Airline</h2>
        </div>
        <div className="flex items-center justify-center gap-10 md:gap-16 flex-wrap mb-24">
           <img src="/indigo-logo.svg" alt="IndiGo" className="h-8 object-contain" />
           <img src="https://web.archive.org/web/20251123094738/https://dmlib.airindia.com/adobe/assets/urn:aaid:aem:3c6a707f-2e38-48d0-ac12-4751c4f554ba/as/AI_Logo_Red_New.svg" alt="Air India" className="h-8 object-contain" />
           <img src="/airindia-express-logo.svg" alt="Air India Express" className="h-10 object-contain" />
           <img src="/akasa-logo.svg" alt="Akasa Air" className="h-8 object-contain" />
           <img src="/spicejet-logo.svg" alt="SpiceJet" className="h-8 object-contain" />
           <img src="/emirates-logo.svg" alt="Emirates" className="h-8 object-contain" />
        </div>

        {/* We Make Travel Easy Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-16">
          {/* Left Side */}
          <div>
             <span className="bg-[#f0f4ff] text-blue-700 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">About Us</span>
             <h2 className="text-4xl md:text-5xl font-black text-[#0c1a40] mt-6 mb-6 leading-tight tracking-tight">We Make Travel<br/>Easy & Memorable</h2>
             <p className="text-sm text-gray-500 mb-8 leading-relaxed">We plan stress-free journeys with personalized touches, turning your travel dreams into unforgettable memories, effortlessly.</p>
             <div className="space-y-4 mb-8">
               <div className="flex items-center gap-3">
                 <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                   <CheckCircle2 size={12} className="text-white" />
                 </div>
                 <span className="text-xs font-semibold text-gray-800">Customized Solutions for Every Business</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                   <CheckCircle2 size={12} className="text-white" />
                 </div>
                 <span className="text-xs font-semibold text-gray-800">Streamlined Corporate Travel Management</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                   <CheckCircle2 size={12} className="text-white" />
                 </div>
                 <span className="text-xs font-semibold text-gray-800">Enhanced Travel Experiences That Impress</span>
               </div>
             </div>
             
             {/* Simple Image representation */}
             <div className="h-64 rounded-3xl bg-cover bg-center shadow-lg relative overflow-hidden" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80')" }}>
                <div className="absolute bottom-4 right-4 bg-[#0c1a40] text-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-2xl">
                   <ShieldCheck size={20} className="mb-1" />
                   <div className="text-[9px] font-bold uppercase tracking-wider text-center leading-tight">Award Winning<br/>Agency</div>
                </div>
             </div>
          </div>

          {/* Right Side Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
             <div className="bg-[#f0f4ff] p-8 rounded-3xl flex flex-col justify-start">
               <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm mb-5 text-[#0c1a40]">
                 <Globe size={20} />
               </div>
               <h4 className="font-black text-[#0c1a40] mb-3 text-lg tracking-tight">B2B Portal</h4>
               <p className="text-xs text-gray-500 leading-relaxed">Booking with travel agents is often cheaper than booking online as they have access to awesome money-saving deals.</p>
             </div>

             <div className="bg-[#f0f4ff] p-8 rounded-3xl flex flex-col justify-start">
               <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm mb-5 text-[#0c1a40]">
                 <ShieldCheck size={20} />
               </div>
               <h4 className="font-black text-[#0c1a40] mb-3 text-lg tracking-tight">Easy to use</h4>
               <p className="text-xs text-gray-500 leading-relaxed">User-friendly booking system, we are always able to inform you about the current status of your trip.</p>
             </div>

             <div className="bg-[#f0f4ff] p-8 rounded-3xl flex flex-col justify-start">
               <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm mb-5 text-[#0c1a40]">
                 <HeadphonesIcon size={20} />
               </div>
               <h4 className="font-black text-[#0c1a40] mb-3 text-lg tracking-tight">Quick Support</h4>
               <p className="text-xs text-gray-500 leading-relaxed">TrippeChalo is 24/7 available. Whenever you need us you will speak and will help you to find the perfect flight solution.</p>
             </div>

             <div className="bg-[#f0f4ff] p-8 rounded-3xl flex flex-col justify-start">
               <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm mb-5 text-[#0c1a40]">
                 <Compass size={20} />
               </div>
               <h4 className="font-black text-[#0c1a40] mb-3 text-lg tracking-tight">Get Best Deals</h4>
               <p className="text-xs text-gray-500 leading-relaxed">A domestic airlines offer pocket-friendly cheap flight tickets promotional deal or last minute ticket sale at unbelievably low prices.</p>
             </div>
          </div>
        </div>
      </main>

      {/* Comprehensive Footer */}
      <footer className="bg-[#f4f7fb] border-t border-gray-200 py-16 text-gray-600 font-medium mt-auto px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Col 1 */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <img src="/tg-favicon.svg" alt="TrippeChalo" className="w-10 h-10" crossOrigin="anonymous" />
              <span className="text-2xl font-black text-[#0c1a40] tracking-tight uppercase">TRIPPE<span className="text-blue-600">CHALO</span></span>
            </div>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed font-bold">
              TrippeChalo Head Office<br/>
              Delhi, India<br/>
            </p>
            <button className="flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-sm hover:bg-[#20bd5a] transition">
              <MessageSquare size={16} /> Chat with Whatsapp
            </button>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-gray-500 font-bold uppercase text-[11px] tracking-wider mb-6">Contact Us</h4>
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                 <Phone size={16} className="text-[#0c1a40] mt-1" />
                 <div>
                   <div className="text-xs text-gray-500 mb-0.5">Need help? Call us</div>
                   <div className="text-sm font-black text-[#0c1a40]">+91 9555934205</div>
                 </div>
              </div>
              <div className="flex items-start gap-3">
                 <Mail size={16} className="text-[#0c1a40] mt-1" />
                 <div>
                   <div className="text-xs text-gray-500 mb-0.5">Need live support?</div>
                   <div className="text-sm font-black text-[#0c1a40]">support@trippechalo.com</div>
                 </div>
              </div>
            </div>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-gray-500 font-bold uppercase text-[11px] tracking-wider mb-6">Company</h4>
            <div className="space-y-4 text-xs font-bold text-[#0c1a40]">
               <div><Link to="/" className="hover:text-blue-600">Home</Link></div>
               <div><Link to="/" className="hover:text-blue-600">About Us</Link></div>
               <div><Link to="/" className="hover:text-blue-600">Contact Us</Link></div>
            </div>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-gray-500 font-bold uppercase text-[11px] tracking-wider mb-6">Product</h4>
            <div className="space-y-4 text-xs font-bold text-[#0c1a40]">
               <div><Link to="/" className="hover:text-blue-600">Flight</Link></div>
               <div><Link to="/" className="hover:text-blue-600">Hotel</Link></div>

            </div>
          </div>
        </div>
        
        {/* Payment & Copyright row */}
        <div className="max-w-7xl mx-auto border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-[11px] font-bold text-gray-500">
            Copyright 2026 TrippeChalo. All rights reserved
          </div>
          
          <div className="flex flex-col items-center">
            <Globe size={24} className="text-blue-600 mb-1" />
            <div className="text-xs font-black text-blue-800 tracking-widest italic">
              IATA
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-[11px] font-bold text-[#0c1a40]">
            <Link to="/" className="hover:text-blue-600">Privacy Policy</Link>
            <Link to="/" className="hover:text-blue-600">Refund & Cancellation Policy</Link>
            <Link to="/" className="hover:text-blue-600">Terms & Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RetailAgentLoginPage;
