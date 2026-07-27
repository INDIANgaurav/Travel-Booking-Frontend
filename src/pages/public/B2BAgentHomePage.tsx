import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { logout } from '../../store/authSlice';
import { ChevronDown, Check, Plane, Users, ArrowRightLeft, Calendar, FileText, Download, Briefcase, RefreshCw, X, Shield, Clock, TrendingUp, Building2, ShieldCheck, CreditCard, Compass, ArrowLeftRight, Search, LogOut, MoreHorizontal } from 'lucide-react';
import Dropdown from '../../components/ui/Dropdown';
import DualMonthCalendar from '../../components/ui/DualMonthCalendar';
import AgentFlightSearchResults from './AgentFlightSearchResults';
import api from '../../services/api';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const FALLBACK_CITIES = [
  { code: 'DEL', name: 'DELHI', airport: 'Indira Gandhi International Airport', country: 'India' },
  { code: 'BOM', name: 'MUMBAI', airport: 'Chhatrapati Shivaji Airport', country: 'India' },
  { code: 'GOI', name: 'GOA', airport: 'Dabolim Airport', country: 'India' },
  { code: 'HYD', name: 'HYDERABAD', airport: 'Begumpet Airport', country: 'India' },
  { code: 'BLR', name: 'BENGALURU', airport: 'Kempegowda International Airport', country: 'India' },
  { code: 'CCU', name: 'KOLKATA', airport: 'Netaji Subhash Chandra Bose', country: 'India' },
  { code: 'MAA', name: 'CHENNAI', airport: 'Chennai International Airport', country: 'India' }
];

const CitySelect = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder?: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [cities, setCities] = React.useState<any[]>(FALLBACK_CITIES);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    api.get('/api/searches/cities').then(res => {
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setCities(res.data);
      }
    }).catch(() => {});
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCity = cities.find(c => c.code === value);
  const displayValue = selectedCity ? `${selectedCity.name.charAt(0) + selectedCity.name.slice(1).toLowerCase()} (${selectedCity.code})` : value;

  const filteredCities = searchQuery
    ? cities.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.airport && c.airport.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.country && c.country.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : cities;

  return (
    <div className="relative w-full h-full flex items-center" ref={dropdownRef}>
      <input
        type="text"
        value={isOpen ? searchQuery : displayValue}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onFocus={() => { setIsOpen(true); setSearchQuery(''); }}
        placeholder={placeholder}
        className="w-full text-sm font-bold text-[#0c1a40] bg-transparent outline-none placeholder:text-gray-400 placeholder:font-normal h-full"
      />
      {isOpen && (
        <div className="absolute top-[calc(100%+10px)] left-0 z-[60] bg-white border border-gray-200 rounded-xl shadow-2xl w-[320px] max-h-[300px] overflow-y-auto animate-in fade-in zoom-in duration-200">
          <div className="text-[10px] text-gray-500 font-bold px-3 py-2 uppercase tracking-wider bg-gray-50/80 sticky top-0 border-b border-gray-100 backdrop-blur-sm">{searchQuery ? 'Search Results' : 'Popular Cities'}</div>
          <div className="py-1">
            {filteredCities.length === 0 ? (
              <div className="px-4 py-3 text-xs text-gray-500 text-center">No cities found</div>
            ) : (
              filteredCities.map(city => (
                <div 
                  key={city.code}
                  onClick={() => { onChange(city.code); setIsOpen(false); setSearchQuery(''); }}
                  className="flex justify-between items-center px-4 py-2.5 hover:bg-[#1d2757] cursor-pointer group transition-colors border-b border-gray-50 last:border-0"
                >
                  <div>
                    <div className="font-bold text-[13px] text-gray-900 group-hover:text-white leading-tight capitalize">{city.name.toLowerCase()}</div>
                    <div className="text-[10px] text-gray-500 group-hover:text-gray-300 flex items-center gap-1 mt-0.5"><Plane size={10} className="transform rotate-45"/> {city.airport}</div>
                  </div>
                  <div className="bg-gray-100 text-gray-600 group-hover:bg-white/20 group-hover:text-white text-[10px] px-2 py-0.5 rounded font-bold">{city.code}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const B2BAgentHomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const agentName = user?.companyName || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.name) || '';
  const agentInitial = (agentName.charAt(0) || '').toUpperCase();
  const agentCode = user?.agencyCode || user?.agencyId || (user?._id ? `UPTF${user._id.slice(-6).toUpperCase()}` : '');
  const agentBalance = user?.walletBalance ?? user?.balance ?? 0;
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  
  const [generatingCert, setGeneratingCert] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

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
      
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${agentCode}_Certificate.pdf`);
    } catch (error) {
      console.error('Error generating certificate:', error);
    } finally {
      setGeneratingCert(false);
    }
  };

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
  
  // Search Form State
  const [tripType, setTripType] = useState('OneWay');
  const [from, setFrom] = useState('DEL');
  const [to, setTo] = useState('HYD');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState('Economy');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // Special Fares
  const [specialFare, setSpecialFare] = useState('EXTRA SAVINGS');
  const [preferredAirline, setPreferredAirline] = useState('All');

  // Search state
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<any[]>([]);

  const handleSearch = async () => {
    setHasSearched(true);
    setLoading(true);

    try {
      const response = await api.get('/api/searches/flights', {
        params: {
          from,
          to,
          date,
          adults,
          children,
          infants,
          cabinClass,
          tripType,
          passengers: adults + children + infants
        }
      });
      
      setFlights(response.data || []);
    } catch (e) {
      console.error("Error fetching flights:", e);
      setFlights([]);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  useEffect(() => {
    if (hasSearched) {
      handleSearch();
    }
  }, [date, from, to]);

  if (hasSearched) {
    return (
      <AgentFlightSearchResults
        from={from}
        setFrom={setFrom}
        to={to}
        setTo={setTo}
        date={date}
        setDate={setDate}
        tripType={tripType}
        setTripType={setTripType}
        returnDate={returnDate}
        setReturnDate={setReturnDate}
        adults={adults}
        setAdults={setAdults}
        children={children}
        setChildren={setChildren}
        infants={infants}
        setInfants={setInfants}
        cabinClass={cabinClass}
        setCabinClass={setCabinClass}
        nonStopFilter={false}
        setNonStopFilter={() => {}}
        morningFilter={false}
        setMorningFilter={() => {}}
        sortBy="CHEAPEST"
        setSortBy={() => {}}
        outboundFlights={flights}
        returnFlights={[]}
        loading={loading}
        selectedOutbound={null}
        setSelectedOutbound={() => {}}
        selectedReturn={null}
        setSelectedReturn={() => {}}
        showFlightDetails={false}
        setShowFlightDetails={() => {}}
        sortedOutboundFlights={flights}
        setHasSearched={setHasSearched}
        cheapestFlight={flights[0]}
        nonStopFlight={flights[0]}
        preferFlight={null}
        handleSearch={handleSearch}
        getDisplayPrice={(p: number) => p}
        navigate={navigate}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans text-gray-800 flex flex-col">
      {/* B2B Header Bar (Matching Reference Screenshot 2) */}
      <header className="bg-white border-b border-gray-200 px-8 py-2.5 flex justify-between items-center shadow-sm sticky top-0 z-40">
        {/* Logo & Category Navigation */}
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/b2b/home')}>
            <div className="flex items-center justify-center">
              <img src="/tg-favicon.svg" alt="TrippeChalo" className="w-10 h-10" crossOrigin="anonymous" />
            </div>
            <div>
              <span className="text-xl font-black text-[#0c1a40] tracking-tight uppercase">TRIPPE<span className="text-blue-600">CHALO</span></span>
              <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-widest -mt-1">B2B AGENT ENGINE</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-gray-700">
            <div className="flex flex-col items-center gap-1 cursor-pointer text-blue-600 border-b-2 border-blue-600 pb-1">
              <div className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center">
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

            <div className="relative flex flex-col items-center gap-1 cursor-pointer text-gray-600 hover:text-blue-600 transition" ref={moreRef}>
              <div 
                className={`w-7 h-7 rounded-lg flex items-center justify-center border ${showMoreMenu ? 'border-gray-900 border-2' : 'border-transparent'}`}
                onClick={() => setShowMoreMenu(!showMoreMenu)}
              >
                <MoreHorizontal size={16} />
              </div>
              <span onClick={() => setShowMoreMenu(!showMoreMenu)}>More</span>

              {/* More Dropdown */}
              {showMoreMenu && (
                <div className="absolute top-full mt-3 w-48 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] py-2 border border-gray-100 z-50 -ml-16">
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

        {/* Right Contacts & Agent Balance Profile */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-bold text-amber-900">
            <span>Call Us: +91 9555934205</span>
          </div>

          <div className="bg-gray-100 text-gray-800 text-xs font-black px-4 py-2 rounded-full border border-gray-200">
            Balance: ₹ {agentBalance.toLocaleString('en-IN')}
          </div>

          <div className="relative" ref={profileRef}>
            <div 
              className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 cursor-pointer hover:bg-blue-100 transition"
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

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100 z-50">
                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                  <p className="text-xs font-bold text-[#0c1a40] truncate">{agentName}</p>
                  <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                </div>
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

      {/* Main Search Engine Box (Matching Reference Screenshot 2) */}
      <main className="w-full px-4 md:px-8 lg:px-12 xl:px-16 py-8">
        <div className="bg-[#f8f9fb] rounded-[32px] border border-gray-200 p-8 pt-6 space-y-6 shadow-sm mx-auto max-w-[1400px]">
          
          {/* Trip Type Tabs */}
          <div className="flex items-center gap-2 text-sm font-bold">
            {['OneWay', 'Return', 'Multi City'].map(t => (
              <label 
                key={t} 
                onClick={() => setTripType(t)}
                className={`flex items-center gap-2 cursor-pointer px-6 py-2.5 rounded-full transition-all ${tripType === t ? 'bg-[#0b1031] text-white shadow-md' : 'bg-transparent text-[#0c1a40] hover:bg-gray-100'}`}
              >
                <div className={`w-[18px] h-[18px] rounded-full border-[2px] flex items-center justify-center ${tripType === t ? 'border-white' : 'border-[#0c1a40]'}`}>
                  {tripType === t && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                {t}
              </label>
            ))}
          </div>

          {/* Input Fields Horizontal Pill Row */}
          <div className="flex items-center bg-white rounded-full border border-gray-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] h-[70px] w-full relative pr-2">
            
            {/* Origin */}
            <div className="flex-1 flex items-center gap-3 px-6 h-full border-r border-gray-100 relative">
              <div className="w-4 h-4 rounded-full border-2 border-[#0b1031] flex items-center justify-center flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0b1031]" />
              </div>
              <div className="flex-1 w-full h-full relative">
                <CitySelect
                  value={from}
                  onChange={setFrom}
                  placeholder="Select Origin City"
                />
              </div>
              
              {/* Swap Button (Absolute to the right edge of Origin container) */}
              <button 
                type="button" 
                onClick={() => { const temp = from; setFrom(to); setTo(temp); }}
                className="absolute -right-4.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#f1f5f9] border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition shadow-sm z-10 z-[70]"
              >
                <ArrowLeftRight size={14} />
              </button>
            </div>

            {/* Destination */}
            <div className="flex-1 flex items-center gap-3 pl-8 pr-6 h-full border-r border-gray-100">
              <div className="w-4 h-4 rounded-full border-2 border-[#0b1031] flex items-center justify-center flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0b1031]" />
              </div>
              <div className="flex-1 w-full h-full relative">
                <CitySelect
                  value={to}
                  onChange={setTo}
                  placeholder="Select Destination City"
                />
              </div>
            </div>

            {/* Departure Date */}
            <div 
              className="flex-1 h-full border-r border-gray-100 relative flex items-center gap-3 px-6 cursor-pointer hover:bg-gray-50"
              onClick={() => setIsDatePickerOpen(true)}
            >
              <Calendar size={18} className="text-gray-400" />
              <div className="flex-1">
                <span className="text-[13px] text-gray-700 block mt-1">
                  {date ? format(new Date(date), 'dd MMM, yyyy') : 'Select Date'}
                </span>
              </div>
            </div>

            {/* Return Date */}
            <div 
              className={`flex-1 h-full border-r border-gray-100 flex items-center gap-3 px-6 cursor-pointer hover:bg-gray-50 ${tripType !== 'Return' ? 'opacity-50 cursor-not-allowed bg-gray-50 pointer-events-none' : ''}`}
              onClick={() => {
                if (tripType === 'Return') setIsDatePickerOpen(true);
              }}
            >
              <Calendar size={18} className="text-gray-400" />
              <div className="flex-1">
                <span className="text-[13px] text-gray-300 block mt-1">
                  {returnDate && tripType === 'Return' ? format(new Date(returnDate), 'dd MMM, yyyy') : 'Return Date'}
                </span>
              </div>
            </div>

            {/* Travellers & Class */}
            <div className="flex-[1.2] flex items-center gap-3 px-6 h-full">
              <Users size={18} className="text-[#0b1031]" />
              <Dropdown
                value={cabinClass}
                onChange={setCabinClass}
                options={[
                  { value: 'Economy', label: '1 PAX, ECONOMY' },
                  { value: 'Premium Economy', label: '2 PAX, PREMIUM' },
                  { value: 'Business', label: '1 PAX, BUSINESS' }
                ]}
              />
            </div>

            {/* Search Button */}
            <button
              type="button"
              onClick={handleSearch}
              className="bg-[#0b1031] hover:bg-blue-900 text-white font-bold text-sm px-8 h-[54px] rounded-full transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Search size={16} />
              <span>Search</span>
            </button>

            {/* Calendar Popover */}
            {isDatePickerOpen && (
              <div className="absolute top-[100%] left-[30%] z-50">
                <DualMonthCalendar 
                  checkIn={date ? new Date(date) : null} 
                  checkOut={returnDate && tripType === 'Return' ? new Date(returnDate) : null}
                  onDateChange={(type, selectedDate) => {
                    if (type === 'checkIn') {
                      setDate(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '');
                    } else {
                      setReturnDate(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '');
                    }
                  }}
                  onClose={() => setIsDatePickerOpen(false)}
                  origin={from}
                  destination={to}
                  isOneWay={tripType !== 'Return'}
                />
              </div>
            )}
          </div>

          {/* Special Fares Row */}
          <div className="flex items-center gap-4 text-xs font-bold pt-2">
            <span className="text-[#0c1a40]">Select a special fare</span>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSpecialFare('EXTRA SAVINGS')}
                className={`px-4 py-1.5 rounded-full uppercase text-[10px] tracking-wide font-black transition-colors ${specialFare === 'EXTRA SAVINGS' ? 'bg-[#10b981] text-white hover:bg-[#059669]' : 'bg-white text-gray-700 border border-gray-200'}`}
              >
                EXTRA SAVINGS
              </button>
              {['Direct Flight', 'Defence', 'Student', 'Senior Citizen', 'Host Search'].map(f => (
                <label key={f} className="flex items-center gap-2 cursor-pointer text-[#0c1a40] hover:text-blue-600 transition-colors">
                  <div className={`w-3.5 h-3.5 rounded-full border-[1.5px] flex items-center justify-center ${specialFare === f ? 'border-blue-600' : 'border-gray-300'}`}>
                    {specialFare === f && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                  </div>
                  <input type="radio" className="hidden" checked={specialFare === f} onChange={() => setSpecialFare(f)} />
                  <span>{f}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </main>


      {/* Latest Deals & Offers */}
      <section className="bg-amber-400 py-2 text-center text-xs font-bold text-gray-900">
        Get Best Deals on Flights... Book Your Tickets... Get Best Rates
      </section>

      {/* Hidden Certificate Template for PDF Generation */}
      <div className="absolute left-[-9999px] top-[-9999px]">
        <div 
          ref={certificateRef} 
          className="w-[1123px] h-[794px] bg-white relative p-12 flex flex-col items-center text-center overflow-hidden border-[16px]"
          style={{ 
            backgroundColor: '#ffffff', 
            borderColor: '#ffffff', 
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

              {(user?.address || user?.city) ? (
                <p style={{ color: '#475569', fontSize: '16px', margin: '0 0 10px 0' }}>
                  Located at: {[user?.address, user?.city, user?.state].filter(Boolean).join(', ')}
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

export default B2BAgentHomePage;
