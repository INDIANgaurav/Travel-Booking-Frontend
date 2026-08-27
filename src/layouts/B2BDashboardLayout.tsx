import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Plane, Building2, ShieldCheck, CreditCard, Compass, MoreHorizontal, LogOut, Phone, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { RootState } from '../store/store';
import { logout } from '../store/authSlice';

const B2BDashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  
  const loggedInUser = useSelector((state: RootState) => state.auth.user);
  const agentName = loggedInUser?.companyName || (loggedInUser?.firstName ? `${loggedInUser.firstName} ${loggedInUser.lastName || ''}`.trim() : loggedInUser?.name) || '';
  const agentCode = loggedInUser?.agencyCode || loggedInUser?.agencyId || (loggedInUser?._id ? `UPTF${loggedInUser._id.slice(-6).toUpperCase()}` : '');
  const agentInitial = (agentName.charAt(0) || '').toUpperCase();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  
  const [generatingCert, setGeneratingCert] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/b2b/login');
  };

  const isMoreActive = location.pathname.startsWith('/b2b/dashboard') || 
                       location.pathname === '/b2b/bank-details' ||
                       location.pathname === '/b2b/pax-calendar' ||
                       location.pathname === '/b2b/invoice' ||
                       location.pathname === '/b2b/credit-note';

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    setGeneratingCert(true);
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution canvas
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // Use standard A4 size so PDF viewers fit it to screen automatically
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Draw image to fill the A4 page exactly
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${agentCode}_Certificate.pdf`);
    } catch (error) {
      console.error('Error generating certificate:', error);
    } finally {
      setGeneratingCert(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#0c1a40] flex flex-col">
      {/* B2B Premium Header */}
      <header className="bg-[#0b1031] px-6 lg:px-10 py-3 flex justify-between items-center sticky top-0 z-50 shadow-xl border-b border-white/10 relative">
        {/* Subtle background glow effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        </div>
        
        {/* Logo & Category Navigation */}
        <div className="flex items-center gap-10 relative z-10">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/b2b/home')}>
            <div className="flex items-center justify-center bg-white p-1.5 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform">
              <img src="/tg-favicon.svg" alt="TrippeChalo" className="w-8 h-8" crossOrigin="anonymous" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight uppercase">TRIPPE<span className="text-blue-400">CHALO</span></span>
              <span className="block text-[9px] text-blue-200/80 font-bold uppercase tracking-[0.2em] -mt-1">B2B AGENT ENGINE</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-gray-300">
            <div onClick={() => navigate('/b2b/home')} className="flex flex-col items-center gap-1.5 cursor-pointer text-white border-b-2 border-blue-500 pb-1">
              <div className="w-8 h-8 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                <Plane size={16} />
              </div>
              <span className="tracking-wide">Flights</span>
            </div>

            <div onClick={() => navigate('/b2b/coming-soon')} className="flex flex-col items-center gap-1.5 cursor-pointer hover:text-white transition-colors group">
              <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <Building2 size={16} />
              </div>
              <span className="tracking-wide">Hotels</span>
            </div>

            <div className={`relative flex flex-col items-center gap-1.5 cursor-pointer transition-colors group ${isMoreActive ? 'text-white' : 'hover:text-white'}`} ref={moreRef}>
              <div 
                className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-colors ${showMoreMenu || isMoreActive ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/10 group-hover:bg-white/10'}`}
                onClick={() => setShowMoreMenu(!showMoreMenu)}
              >
                <MoreHorizontal size={16} />
              </div>
              <span onClick={() => setShowMoreMenu(!showMoreMenu)} className="tracking-wide">More</span>

              {/* More Dropdown */}
              {showMoreMenu && (
                <div className="absolute top-full mt-4 w-56 bg-[#161c3f] rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] py-2 border border-white/10 z-50 -ml-20 overflow-hidden backdrop-blur-xl">
                  {[
                    { label: 'Dashboard', path: '/b2b/dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg> },
                    { label: 'Account Statement', path: '/b2b/account-statement', icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg> },
                    { label: 'Booking Status', path: '/b2b/booking-status', icon: <Check size={14}/> },
                    { label: 'Manage Booking', path: '/b2b/manage-booking', icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> },
                    { label: 'Agent Certificate', path: '#', icon: <ShieldCheck size={14}/> }
                  ].map((item, index) => (
                    <button 
                      key={index}
                      onClick={() => {
                        if (item.label === 'Agent Certificate') {
                          downloadCertificate();
                        } else {
                          setShowMoreMenu(false);
                          if (item.path !== '#') navigate(item.path);
                        }
                      }}
                      disabled={item.label === 'Agent Certificate' && generatingCert}
                      className="w-full text-left px-5 py-3 text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors border-b border-white/5 last:border-0"
                    >
                      <span className="text-blue-400">{item.icon}</span>
                      {item.label === 'Agent Certificate' && generatingCert ? 'Generating...' : item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Contacts & Agent Profile */}
        <div className="flex items-center gap-5 relative z-10">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase mb-0.5">Support</span>
            <div className="flex items-center gap-1.5 text-blue-400 font-black text-xs bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
              <Phone size={12} />
              <span>+91 9555934205</span>
            </div>
          </div>

          <div 
            onClick={() => navigate('/b2b/dashboard/wallet')}
            className="flex flex-col items-end cursor-pointer group"
          >
            <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase mb-0.5 group-hover:text-gray-300 transition-colors">Balance</span>
            <div className="flex items-center gap-1.5 text-green-400 font-black text-sm bg-green-500/10 px-4 py-1 rounded-lg border border-green-500/20 shadow-[0_0_15px_rgba(74,222,128,0.1)]">
              <span>Wallet</span>
            </div>
          </div>

          <div className="h-8 w-px bg-white/10 mx-1"></div>

          <div className="relative" ref={profileRef}>
            <div 
              className="flex items-center gap-3 bg-white/5 px-2 py-1.5 pr-4 rounded-full border border-white/10 cursor-pointer hover:bg-white/10 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-inner border border-white/20">
                {agentInitial}
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <span className="block text-xs font-black text-white">{agentName}</span>
                <span className="block text-[9px] text-blue-300 font-bold uppercase tracking-widest">{agentCode}</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={`text-gray-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-[#161c3f] rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] py-2 border border-white/10 z-50 overflow-hidden backdrop-blur-xl">
                <div className="px-5 py-4 border-b border-white/10 mb-1 bg-white/5">
                  <p className="text-sm font-black text-white truncate">{agentName}</p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{loggedInUser?.email}</p>
                </div>
                <button 
                  onClick={() => navigate('/b2b/profile')}
                  className="w-full text-left px-5 py-3 text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-blue-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span>My Profile</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-5 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <Outlet />
      
      {/* Hidden Certificate Template for PDF Generation */}
      <div className="absolute left-[-9999px] top-[-9999px]">
        <div 
          ref={certificateRef} 
          className="w-[1123px] h-[794px] bg-white relative p-12 flex flex-col items-center text-center overflow-hidden border-[16px]"
          style={{ 
            backgroundColor: '#ffffff', 
            borderColor: '#ffffff', // Outer border white
            fontFamily: 'Arial, sans-serif'
          }}
        >
          {/* Watermark Logo (Left side) */}
          <div 
            className="absolute top-1/2 left-[50px] -translate-y-1/2 select-none pointer-events-none font-black leading-none whitespace-nowrap -rotate-90 flex items-center"
            style={{ color: '#0b1031', opacity: 0.04, fontSize: '100px', letterSpacing: '8px' }}
          >
            TRIPPECHALO
          </div>
          
          <div 
            className="flex w-full h-full p-8 flex-col items-center justify-between relative z-10"
            style={{ boxSizing: 'border-box', backgroundColor: '#ffffff', border: '12px solid #0f172a', outline: '4px solid #cbd5e1', outlineOffset: '-24px' }}
          >
            {/* Elegant Top Section */}
            <div className="flex flex-col items-center w-full" style={{ paddingTop: '10px' }}>
              <h1 style={{ color: '#0f172a', fontFamily: "'Georgia', serif", fontSize: '48px', marginBottom: '10px', letterSpacing: '4px', textTransform: 'uppercase' }}>
                Certificate of Recognition
              </h1>
              
              <div style={{ width: '100px', height: '2px', backgroundColor: '#eab308', margin: '15px 0' }}></div>

              <h2 style={{ color: '#eab308', fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '6px', marginBottom: '30px' }}>
                Active Partner
              </h2>

              <p style={{ color: '#64748b', fontSize: '18px', fontStyle: 'italic', marginBottom: '15px', fontFamily: "'Georgia', serif" }}>
                This is to proudly certify that
              </p>
              
              <h3 style={{ color: '#0f172a', fontSize: '42px', fontWeight: 'bold', margin: '0 0 10px 0', textTransform: 'uppercase', fontFamily: "'Georgia', serif" }}>
                {agentName}
              </h3>

              {(loggedInUser?.address || loggedInUser?.city) ? (
                <p style={{ color: '#475569', fontSize: '16px', margin: '0 0 10px 0' }}>
                  Located at: {[loggedInUser?.address, loggedInUser?.city, loggedInUser?.state].filter(Boolean).join(', ')}
                </p>
              ) : (
                <div style={{ height: '24px', marginBottom: '10px' }}></div>
              )}
              
              <p style={{ color: '#475569', fontSize: '16px', margin: '0 0 20px 0' }}>
                Agent ID: <span style={{ color: '#0f172a', fontWeight: 'bold' }}>{agentCode}</span>
              </p>

              <p style={{ color: '#64748b', fontSize: '18px', fontStyle: 'italic', marginBottom: '10px', fontFamily: "'Georgia', serif", maxWidth: '700px', lineHeight: '1.6' }}>
                has been officially registered and verified as an Authorised Channel Partner with TrippeChalo Pvt. Ltd. , committed to delivering excellence in travel services.
              </p>
            </div>

            {/* Elegant Bottom Row */}
            <div className="w-full flex justify-between items-end px-24 pb-4">
              <div className="flex flex-col items-center" style={{ width: '200px' }}>
                <div style={{ borderBottom: '1px solid #94a3b8', paddingBottom: '10px', marginBottom: '10px', width: '100%', textAlign: 'center' }}>
                   <div style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive", color: '#0f172a', fontSize: '32px' }}>Director Signature</div>
                </div>
                <p style={{ color: '#0f172a', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Director</p>
                <p style={{ color: '#64748b', fontSize: '12px' }}>TrippeChalo Pvt. Ltd. </p>
              </div>

              {/* Minimalist Seal */}
              <div className="flex items-center gap-4">
                 <div style={{
                   width: '80px', height: '80px',
                   borderRadius: '50%',
                   border: '2px solid #eab308',
                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                   backgroundColor: '#fffbeb'
                 }}>
                   <span style={{ color: '#eab308', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '2px' }}>
                     Official<br/>Partner
                   </span>
                 </div>
              </div>

              <div className="flex flex-col items-center" style={{ width: '220px' }}>
                <div style={{ borderBottom: '1px solid #94a3b8', paddingBottom: '10px', marginBottom: '10px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  <img src="/tg-favicon.svg" alt="TrippeChalo" style={{ width: '32px', height: '32px' }} crossOrigin="anonymous" />
                  <span style={{ color: '#0f172a', fontSize: '24px', fontWeight: '900', letterSpacing: '1px' }}>TRIPPE<span style={{ color: '#2563eb' }}>CHALO</span></span>
                </div>
                <p style={{ color: '#0f172a', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Date Issued</p>
                <p style={{ color: '#64748b', fontSize: '12px' }}>{new Date().toLocaleDateString('en-GB')}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default B2BDashboardLayout;
