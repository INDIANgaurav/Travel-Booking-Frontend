import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { logout } from '../../store/authSlice';
import { ChevronDown, Check, Plane, Users, ArrowRightLeft, Calendar, FileText, Download, Briefcase, RefreshCw, X, Shield, Clock, TrendingUp, Building2, ShieldCheck, CreditCard, Compass, ArrowLeftRight, Search, LogOut, MoreHorizontal } from 'lucide-react';
import Dropdown from '../../components/ui/Dropdown';
import DualMonthCalendar from '../../components/ui/DualMonthCalendar';
import AgentFlightSearchResults from './AgentFlightSearchResults';
import TravellerPicker from '../../components/common/TravellerPicker';
import InteractiveGridBackground from '../../components/ui/InteractiveGridBackground';
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
  const searchBoxRef = useRef<HTMLDivElement>(null);
  
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
      // Added searchBoxRef to close pickers if click is outside the entire search widget
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setActiveDatePicker(null);
        setIsTravellerPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    sessionStorage.removeItem('b2bSearchState');
    navigate('/b2b/login');
  };
  
  // Search Form State
interface RecentSearch {
  from: string;
  to: string;
  date: string;
  returnDate: string;
  tripType: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: string;
  timestamp: number;
}

  const getSavedState = () => {
    try {
      const saved = sessionStorage.getItem('b2bSearchState');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  };
  const savedState = getSavedState();
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  
  useEffect(() => {
    try {
      const saved = localStorage.getItem('b2bRecentSearches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch (e) {}
  }, []);
  const [tripType, setTripType] = useState('OneWay');
  const [from, setFrom] = useState(savedState.from || 'DEL');
  const [to, setTo] = useState(savedState.to || 'HYD');
  const [date, setDate] = useState(savedState.date || format(new Date(), 'yyyy-MM-dd'));
  const [returnDate, setReturnDate] = useState(savedState.returnDate || '');
  const [adults, setAdults] = useState(savedState.adults !== undefined ? savedState.adults : 1);
  const [children, setChildren] = useState(savedState.children || 0);
  const [infants, setInfants] = useState(savedState.infants || 0);
  const [cabinClass, setCabinClass] = useState(savedState.cabinClass || 'Economy');
  const [activeDatePicker, setActiveDatePicker] = useState<'depart' | 'return' | null>(null);
  const [isTravellerPickerOpen, setIsTravellerPickerOpen] = useState(false);
  
  // Special Fares
  const [specialFare, setSpecialFare] = useState(savedState.specialFare || 'EXTRA SAVINGS');
  const [preferredAirline, setPreferredAirline] = useState(savedState.preferredAirline || 'All');

  // Search state
  const [hasSearched, setHasSearched] = useState(savedState.hasSearched || false);
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<any[]>([]);
  const [returnFlightsData, setReturnFlightsData] = useState<any[]>([]);
  const [selectedOutbound, setSelectedOutbound] = useState<any>(null);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [nonStopFilter, setNonStopFilter] = useState(false);
  const [morningFilter, setMorningFilter] = useState(false);
  const [sortBy, setSortBy] = useState('CHEAPEST');

  useEffect(() => {
    sessionStorage.setItem('b2bSearchState', JSON.stringify({
      tripType, from, to, date, returnDate, adults, children, infants, cabinClass, specialFare, preferredAirline, hasSearched
    }));
  }, [tripType, from, to, date, returnDate, adults, children, infants, cabinClass, specialFare, preferredAirline, hasSearched]);

  const handleSearch = async (paramsObj?: RecentSearch) => {
    const searchFrom = paramsObj?.from || from;
    const searchTo = paramsObj?.to || to;
    const searchDate = paramsObj?.date || date;
    const searchReturnDate = paramsObj?.returnDate !== undefined ? paramsObj.returnDate : returnDate;
    const searchAdults = paramsObj?.adults !== undefined ? paramsObj.adults : adults;
    const searchChildren = paramsObj?.children !== undefined ? paramsObj.children : children;
    const searchInfants = paramsObj?.infants !== undefined ? paramsObj.infants : infants;
    const searchCabinClass = paramsObj?.cabinClass || cabinClass;
    const searchTripType = paramsObj?.tripType || tripType;

    // Save to Recent Searches
    const newSearch: RecentSearch = { from: searchFrom, to: searchTo, date: searchDate, returnDate: searchReturnDate, tripType: searchTripType, adults: searchAdults, children: searchChildren, infants: searchInfants, cabinClass: searchCabinClass, timestamp: Date.now() };
    const saved = [...recentSearches];
    const filtered = saved.filter(s => !(s.from === searchFrom && s.to === searchTo && s.date === searchDate && s.tripType === searchTripType));
    const updated = [newSearch, ...filtered].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('b2bRecentSearches', JSON.stringify(updated));

    setHasSearched(true);
    setLoading(true);
    setSelectedOutbound(null);
    setSelectedReturn(null);

    try {
      // Outbound flights
      const response = await api.get('/api/searches/flights', {
        params: {
          from: searchFrom,
          to: searchTo,
          date: searchDate,
          adults: searchAdults,
          children: searchChildren,
          infants: searchInfants,
          cabinClass: searchCabinClass,
          tripType: searchTripType,
          passengers: searchAdults + searchChildren + searchInfants
        }
      });
      const flightsData = response.data || [];
      setFlights(flightsData);
      
      if (tripType === 'Round Trip' && flightsData.length > 0) {
        setSelectedOutbound(flightsData[0]);
      }

      // Return flights (swap from/to, use returnDate)
      if (searchTripType === 'Round Trip' && searchReturnDate) {
        try {
          const returnResponse = await api.get('/api/searches/flights', {
            params: {
              from: searchTo,
              to: searchFrom,
              date: searchReturnDate,
              adults: searchAdults,
              children: searchChildren,
              infants: searchInfants,
              cabinClass: searchCabinClass,
              tripType: searchTripType,
              passengers: searchAdults + searchChildren + searchInfants
            }
          });
          const retFlightsData = returnResponse.data || [];
          setReturnFlightsData(retFlightsData);
          if (retFlightsData.length > 0) {
            setSelectedReturn(retFlightsData[0]);
          }
        } catch (e) {
          console.error("Error fetching return flights:", e);
          setReturnFlightsData([]);
        }
      } else {
        setReturnFlightsData([]);
      }
    } catch (e) {
      console.error("Error fetching flights:", e);
      setFlights([]);
      setReturnFlightsData([]);
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
        nonStopFilter={nonStopFilter}
        setNonStopFilter={setNonStopFilter}
        morningFilter={morningFilter}
        setMorningFilter={setMorningFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        outboundFlights={flights}
        returnFlights={returnFlightsData}
        loading={loading}
        selectedOutbound={selectedOutbound}
        setSelectedOutbound={setSelectedOutbound}
        selectedReturn={selectedReturn}
        setSelectedReturn={setSelectedReturn}
        showFlightDetails={false}
        setShowFlightDetails={() => {}}
        sortedOutboundFlights={flights}
        setHasSearched={setHasSearched}
        cheapestFlight={flights[0]}
        nonStopFlight={flights.find((f: any) => f.stops === 0) || flights[0]}
        preferFlight={null}
        handleSearch={handleSearch}
        getDisplayPrice={(p: number) => p}
        navigate={navigate}
      />
    );
  }

  return (
    <div className="min-h-screen font-sans text-gray-800 flex flex-col relative z-0">
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
            <div className="flex flex-col items-center gap-1.5 cursor-pointer text-white border-b-2 border-blue-500 pb-1">
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

            <div className="relative flex flex-col items-center gap-1.5 cursor-pointer hover:text-white transition-colors group" ref={moreRef}>
              <div 
                className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-colors ${showMoreMenu ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/10 group-hover:bg-white/10'}`}
                onClick={() => setShowMoreMenu(!showMoreMenu)}
              >
                <MoreHorizontal size={16} />
              </div>
              <span onClick={() => setShowMoreMenu(!showMoreMenu)} className="tracking-wide">More</span>

              {/* More Dropdown */}
              {showMoreMenu && (
                <div className="absolute top-full mt-4 w-56 bg-[#161c3f] rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] py-2 border border-white/10 z-50 -ml-20 overflow-hidden backdrop-blur-xl">
                  {[
                    { label: 'Dashboard', path: '/b2b/dashboard', icon: <TrendingUp size={14}/> },
                    { label: 'Account Statement', path: '/b2b/account-statement', icon: <FileText size={14}/> },
                    { label: 'Booking Status', path: '/b2b/booking-status', icon: <Check size={14}/> },
                    { label: 'Manage Booking', path: '/b2b/manage-booking', icon: <Briefcase size={14}/> },
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
              <span>+91 9555934205</span>
            </div>
          </div>

          <div 
            onClick={() => navigate('/b2b/dashboard/wallet')}
            className="flex flex-col items-end cursor-pointer group"
          >
            <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase mb-0.5 group-hover:text-gray-300 transition-colors">Balance</span>
            <div className="flex items-center gap-1.5 text-green-400 font-black text-sm bg-green-500/10 px-4 py-1 rounded-lg border border-green-500/20 shadow-[0_0_15px_rgba(74,222,128,0.1)]">
              <span>₹ {agentBalance.toLocaleString('en-IN')}</span>
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
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
            </div>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-[#161c3f] rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] py-2 border border-white/10 z-50 overflow-hidden backdrop-blur-xl">
                <div className="px-5 py-4 border-b border-white/10 mb-1 bg-white/5">
                  <p className="text-sm font-black text-white truncate">{agentName}</p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{user?.email}</p>
                </div>
                <button 
                  onClick={() => navigate('/b2b/profile')}
                  className="w-full text-left px-5 py-3 text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors"
                >
                  <Users size={14} className="text-blue-400" />
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

      {/* Main Search Engine Box (Matching Reference Screenshot 2) */}
      <main className="w-full px-4 md:px-8 lg:px-12 xl:px-16 pt-10 pb-16 relative overflow-hidden flex-1 flex flex-col justify-start">
        <InteractiveGridBackground theme="dark" />
        <div ref={searchBoxRef} className="bg-white rounded-xl border border-gray-300 p-6 pt-5 space-y-5 shadow-lg mx-auto max-w-[1400px] relative z-10 w-full hover:shadow-xl transition-shadow duration-300">
          
          {/* Trip Type Tabs */}
          <div className="flex items-center gap-5 text-[13px] font-bold text-gray-500 mb-2 border-b border-gray-100 pb-3">
            {['OneWay', 'Round Trip', 'Multi City'].map(t => (
              <label 
                key={t} 
                onClick={() => setTripType(t)}
                className={`flex items-center gap-2 cursor-pointer transition-colors ${tripType === t ? 'text-blue-700' : 'hover:text-gray-900'}`}
              >
                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${tripType === t ? 'border-blue-600' : 'border-gray-400'}`}>
                  {tripType === t && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </div>
                {t}
              </label>
            ))}
          </div>

          {/* Input Fields High-Density Row */}
          <div className="flex items-center bg-gray-50 rounded-lg border border-gray-300 h-[64px] w-full relative group focus-within:border-blue-500 transition-colors">
            
            {/* Origin */}
            <div className="flex-1 flex items-center gap-3 px-5 h-full border-r border-gray-300 relative bg-white rounded-l-lg hover:bg-gray-50 transition-colors">
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 text-blue-600">
                <Plane size={16} />
              </div>
              <div className="flex-1 w-full h-full relative">
                <CitySelect
                  value={from}
                  onChange={setFrom}
                  placeholder="Origin"
                />
              </div>
              
              {/* Swap Button (Absolute to the right edge of Origin container) */}
              <button 
                type="button" 
                onClick={() => { const temp = from; setFrom(to); setTo(temp); }}
                className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition shadow-sm z-10 z-[70]"
              >
                <ArrowLeftRight size={14} />
              </button>
            </div>

            {/* Destination */}
            <div className="flex-1 flex items-center gap-3 pl-8 pr-5 h-full border-r border-gray-300 bg-white hover:bg-gray-50 transition-colors">
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 text-blue-600">
                <Plane size={16} className="transform rotate-90" />
              </div>
              <div className="flex-1 w-full h-full relative">
                <CitySelect
                  value={to}
                  onChange={setTo}
                  placeholder="Destination"
                />
              </div>
            </div>

            {/* Departure Date */}
            <div 
              className="flex-1 h-full border-r border-gray-300 relative flex items-center gap-3 px-5 cursor-pointer bg-white hover:bg-blue-50 transition-colors"
              onClick={() => { setActiveDatePicker('depart'); setIsTravellerPickerOpen(false); }}
            >
              <Calendar size={16} className="text-gray-400" />
              <div className="flex-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Depart</span>
                <span className="text-[14px] font-bold text-[#0c1a40] block leading-tight">
                  {date ? format(new Date(date), 'dd MMM, yyyy') : 'Select Date'}
                </span>
              </div>
              
              {/* Calendar Popover (Depart) */}
              {activeDatePicker === 'depart' && (
                <div className="absolute top-[100%] left-0 z-50">
                  <DualMonthCalendar 
                    checkIn={date ? new Date(date) : null} 
                    checkOut={null}
                    onDateChange={(type, selectedDate) => {
                      if (type === 'checkIn' && selectedDate) {
                        setDate(format(selectedDate, 'yyyy-MM-dd'));
                        setActiveDatePicker(tripType === 'Round Trip' ? 'return' : null);
                      }
                    }}
                    onClose={() => setActiveDatePicker(null)}
                    origin={from}
                    destination={to}
                    isOneWay={true}
                  />
                </div>
              )}
            </div>

            {/* Return Date */}
            <div 
              className={`flex-1 h-full border-r border-gray-300 relative flex items-center gap-3 px-5 cursor-pointer transition-colors ${tripType !== 'Round Trip' ? 'opacity-50 cursor-not-allowed bg-gray-100 pointer-events-none' : 'bg-white hover:bg-blue-50'}`}
              onClick={() => {
                if (tripType === 'Round Trip') { setActiveDatePicker('return'); setIsTravellerPickerOpen(false); }
              }}
            >
              <Calendar size={16} className="text-gray-400" />
              <div className="flex-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Return</span>
                <span className="text-[14px] font-bold text-[#0c1a40] block leading-tight">
                  {returnDate && tripType === 'Round Trip' ? format(new Date(returnDate), 'dd MMM, yyyy') : 'Tap to add'}
                </span>
              </div>

              {/* Calendar Popover (Return) */}
              {activeDatePicker === 'return' && (
                <div className="absolute top-[100%] left-0 z-50">
                  <DualMonthCalendar 
                    checkIn={returnDate && tripType === 'Round Trip' ? new Date(returnDate) : null}
                    checkOut={null}
                    onDateChange={(type, selectedDate) => {
                      if (type === 'checkIn' && selectedDate) {
                        setReturnDate(format(selectedDate, 'yyyy-MM-dd'));
                        setActiveDatePicker(null);
                      }
                    }}
                    onClose={() => setActiveDatePicker(null)}
                    origin={to}
                    destination={from}
                    isOneWay={true}
                  />
                </div>
              )}
            </div>

            {/* Travellers & Class */}
            <div className="flex-1 h-full relative">
              <div 
                className="w-full h-full flex items-center gap-3 px-5 cursor-pointer bg-white hover:bg-blue-50 transition-colors rounded-r-lg"
                onClick={() => { setIsTravellerPickerOpen(true); setActiveDatePicker(null); }}
              >
                <Users size={16} className="text-gray-400" />
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Passengers & Class</span>
                    <span className="text-[14px] font-bold text-[#0c1a40] block leading-tight">
                      {adults + children + infants} PAX, {cabinClass}
                    </span>
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </div>
              </div>

              {/* Traveller Popover */}
              {isTravellerPickerOpen && (
                <div className="absolute top-[100%] right-0 mt-2 z-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <TravellerPicker 
                    adults={adults} 
                    children={children} 
                    infants={infants} 
                    cabinClass={cabinClass}
                    onChange={(a, c, i, cb) => {
                      setAdults(a); setChildren(c); setInfants(i); setCabinClass(cb);
                    }}
                    onClose={() => setIsTravellerPickerOpen(false)} 
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-6">
              {/* Special Fares */}
              {/* Keep generic filters or add B2B specific ones */}
            </div>
            {/* Search Button */}
            <button 
              onClick={() => handleSearch()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
            >
              <Search size={18} />
              <span>Search Flights</span>
            </button>
          </div>

              {/* Recent Searches Row */}
              {recentSearches.length > 0 && (
                <div className="flex items-center gap-3 pt-4 pb-2 overflow-x-auto hidden-scrollbar">
                  <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap uppercase tracking-wider">Recent:</span>
                  {recentSearches.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setFrom(s.from);
                        setTo(s.to);
                        setDate(s.date);
                        setReturnDate(s.returnDate);
                        setTripType(s.tripType);
                        setAdults(s.adults);
                        setChildren(s.children);
                        setInfants(s.infants);
                        setCabinClass(s.cabinClass);
                        handleSearch(s);
                      }}
                      className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-[10px] font-bold text-[#0c1a40] hover:border-blue-300 hover:bg-blue-50 whitespace-nowrap transition-colors shadow-sm group"
                    >
                      <span className="text-blue-700">{s.from.split('(')[1]?.replace(')', '') || s.from.substring(0,3)}</span>
                      {s.tripType === 'Round Trip' ? (
                        <ArrowLeftRight size={10} className="text-gray-400 group-hover:text-blue-500" />
                      ) : (
                        <span className="text-gray-400 group-hover:text-blue-500">→</span>
                      )}
                      <span className="text-blue-700">{s.to.split('(')[1]?.replace(')', '') || s.to.substring(0,3)}</span>
                      <span className="text-gray-300 ml-1">|</span>
                      <span className="text-gray-600">{s.date ? format(new Date(s.date), 'dd MMM') : ''}</span>
                      <span className="text-gray-300 ml-1">|</span>
                      <span className="text-gray-600">{s.adults + s.children + s.infants} PAX</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
      </main>

      {/* Premium TrippeChalo Marquee */}
      <section className="relative z-10 bg-gradient-to-r from-[#0b1031] via-blue-900 to-[#0b1031] py-3 text-[11px] font-black tracking-widest text-blue-200 uppercase overflow-hidden whitespace-nowrap cursor-pointer border-t border-b border-blue-500/20 shadow-inner">
        <div className="animate-marquee inline-block w-max">
          {[...Array(12)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="mx-12 hover:text-white transition-colors">Exclusive B2B Fares Available</span>
              <span className="mx-12 text-blue-500/50">✦</span>
              <span className="mx-12 hover:text-white transition-colors">Premium Supplier Network</span>
              <span className="mx-12 text-blue-500/50">✦</span>
              <span className="mx-12 hover:text-white transition-colors">Instant Ticketing & Support</span>
              <span className="mx-12 text-blue-500/50">✦</span>
            </React.Fragment>
          ))}
        </div>
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

