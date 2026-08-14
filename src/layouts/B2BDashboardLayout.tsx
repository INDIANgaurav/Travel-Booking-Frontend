import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Plane, Building2, ShieldCheck, CreditCard, Compass, MoreHorizontal, LogOut, Phone } from 'lucide-react';
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
      {/* Header Bar */}
      <header className="bg-white border-b border-gray-100 px-8 py-2.5 flex justify-between items-center shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex items-center justify-center">
              <img src="/tg-favicon.svg" alt="TrippeChalo" className="w-10 h-10" crossOrigin="anonymous" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight uppercase">TRIPPE<span className="text-blue-600">CHALO</span></span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-gray-700">
            <div className="flex flex-col items-center gap-1 cursor-pointer text-gray-600 hover:text-blue-600 transition" onClick={() => navigate('/b2b/home')}>
              <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                <Plane size={16} />
              </div>
              <span>Flight</span>
            </div>

            <div className="flex flex-col items-center gap-1 cursor-pointer text-gray-600 hover:text-blue-600 transition">
              <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building2 size={16} />
              </div>
              <span>Hotel & Villas</span>
            </div>

            <div className="flex flex-col items-center gap-1 cursor-pointer text-gray-600 hover:text-blue-600 transition">
              <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
              <span>Insurance</span>
            </div>

            <div className="flex flex-col items-center gap-1 cursor-pointer text-gray-600 hover:text-blue-600 transition">
              <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                <CreditCard size={16} />
              </div>
              <span>Visa</span>
            </div>

            <div className="flex flex-col items-center gap-1 cursor-pointer text-gray-600 hover:text-blue-600 transition">
              <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                <Compass size={16} />
              </div>
              <span>UMRAH Packages</span>
            </div>

            <div className={`relative flex flex-col items-center gap-1 cursor-pointer transition ${isMoreActive ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-600 hover:text-blue-600'}`} ref={moreRef}>
              <div 
                className={`w-7 h-7 rounded-lg flex items-center justify-center border ${showMoreMenu ? 'border-gray-900 border-2' : 'border-transparent'}`}
                onClick={() => setShowMoreMenu(!showMoreMenu)}
              >
                <MoreHorizontal size={16} />
              </div>
              <span onClick={() => setShowMoreMenu(!showMoreMenu)}>More</span>

              {showMoreMenu && (
                <div className="absolute top-full mt-2 w-48 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] py-2 border border-gray-100 z-50 left-1/2 -translate-x-1/2">
                  {[
                    { label: 'Dashboard', path: '/b2b/dashboard' },
                    { label: 'Account Statement', path: '/b2b/account-statement' },
                    { label: 'Booking Status', path: '/b2b/booking-status' },
                    { label: 'Manage Booking', path: '/b2b/manage-booking' },
                    { label: 'Agent Certificate', path: '#' }
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
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#0c1a40] hover:bg-blue-50 transition"
                    >
                      {item.label === 'Agent Certificate' && generatingCert ? 'Generating...' : item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full text-xs font-bold text-amber-900">
            <Phone size={14} />
            <span>Call Us: +91 9826262121</span>
          </div>

          <button 
            onClick={() => navigate('/b2b/dashboard/wallet')}
            className="bg-white hover:bg-gray-50 transition-colors cursor-pointer text-[#0c1a40] text-xs font-black px-4 py-2 rounded-full border border-gray-200"
          >
            Balance
          </button>

          <div className="relative" ref={profileRef}>
            <div 
              className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="w-7 h-7 rounded-full bg-[#0b1031] text-white flex items-center justify-center font-bold text-xs">
                {agentInitial}
              </div>
              <div className="text-left leading-tight">
                <span className="block text-xs font-black text-[#0c1a40]">{agentName}</span>
                <span className="block text-[9px] text-gray-500 font-bold uppercase">({agentCode})</span>
              </div>
            </div>
            
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100 z-50">
                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                  <p className="text-xs font-bold text-[#0c1a40] truncate">{agentName}</p>
                  <p className="text-[10px] text-gray-500 truncate">{loggedInUser?.email}</p>
                </div>
                <button 
                  onClick={() => navigate('/b2b/profile')}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-[#0c1a40] hover:bg-blue-50 flex items-center gap-2 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span>My Profile</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
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
