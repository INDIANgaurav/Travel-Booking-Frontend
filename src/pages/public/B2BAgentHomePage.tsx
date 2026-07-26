import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { logout } from '../../store/authSlice';
import { ChevronDown, Check, Plane, Users, ArrowRightLeft, Calendar, FileText, Download, Briefcase, RefreshCw, X, Shield, Clock, TrendingUp, Building2, ShieldCheck, CreditCard, Compass, ArrowLeftRight, Search, LogOut, MoreHorizontal } from 'lucide-react';
import Dropdown from '../../components/ui/Dropdown';
import DOBCalendar from '../../components/ui/DOBCalendar';
import AgentFlightSearchResults from './AgentFlightSearchResults';
import api from '../../services/api';
import { format } from 'date-fns';

const POPULAR_CITIES = [
  { code: 'DEL', name: 'DELHI', airport: 'Indira Gandhi International Airport' },
  { code: 'BOM', name: 'MUMBAI', airport: 'Chhatrapati Shivaji Airport' },
  { code: 'GOI', name: 'GOA', airport: 'Dabolim Airport' },
  { code: 'HYD', name: 'HYDERABAD', airport: 'Begumpet Airport' },
  { code: 'BLR', name: 'BENGALURU', airport: 'Kempegowda International Airport' },
  { code: 'CCU', name: 'KOLKATA', airport: 'Netaji Subhash Chandra Bose' },
  { code: 'MAA', name: 'CHENNAI', airport: 'Chennai International Airport' }
];

const CitySelect = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder?: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCity = POPULAR_CITIES.find(c => c.code === value);
  const displayValue = selectedCity ? `${selectedCity.name.charAt(0) + selectedCity.name.slice(1).toLowerCase()} (${selectedCity.code})` : value;

  return (
    <div className="relative w-full h-full flex items-center" ref={dropdownRef}>
      <input
        type="text"
        value={displayValue}
        onChange={(e) => {
          onChange(e.target.value.toUpperCase());
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full text-sm font-bold text-[#0c1a40] bg-transparent outline-none placeholder:text-gray-400 placeholder:font-normal h-full"
      />
      {isOpen && (
        <div className="absolute top-[calc(100%+10px)] left-0 z-[60] bg-white border border-gray-200 rounded-xl shadow-2xl w-[320px] max-h-[300px] overflow-y-auto animate-in fade-in zoom-in duration-200">
          <div className="text-[10px] text-gray-500 font-bold px-3 py-2 uppercase tracking-wider bg-gray-50/80 sticky top-0 border-b border-gray-100 backdrop-blur-sm">Popular Cities</div>
          <div className="py-1">
            {POPULAR_CITIES.map(city => (
              <div 
                key={city.code}
                onClick={() => { onChange(city.code); setIsOpen(false); }}
                className="flex justify-between items-center px-4 py-2.5 hover:bg-[#1d2757] cursor-pointer group transition-colors border-b border-gray-50 last:border-0"
              >
                <div>
                  <div className="font-bold text-[13px] text-gray-900 group-hover:text-white leading-tight capitalize">{city.name.toLowerCase()}</div>
                  <div className="text-[10px] text-gray-500 group-hover:text-gray-300 flex items-center gap-1 mt-0.5"><Plane size={10} className="transform rotate-45"/> {city.airport}</div>
                </div>
                <div className="bg-gray-100 text-gray-600 group-hover:bg-white/20 group-hover:text-white text-[10px] px-2 py-0.5 rounded font-bold">{city.code}</div>
              </div>
            ))}
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
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
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
                    { label: 'Account Statement', path: '#' },
                    { label: 'Booking Status', path: '#' },
                    { label: 'Manage Booking', path: '#' },
                    { label: 'Agent Certificate', path: '#' }
                  ].map((item, index) => (
                    <button 
                      key={index}
                      onClick={() => {
                        setShowMoreMenu(false);
                        if (item.path !== '#') navigate(item.path);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#0c1a40] hover:bg-blue-50 transition"
                    >
                      {item.label}
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
            <div className="flex-1 h-full border-r border-gray-100 relative [&>div]:h-full [&>div>div:first-child]:h-full [&>div>div:first-child]:border-none [&>div>div:first-child]:bg-transparent">
              <DOBCalendar
                value={date}
                onChange={setDate}
                placeholder="Departure Date"
              />
            </div>

            {/* Return Date */}
            <div className={`flex-1 h-full border-r border-gray-100 relative [&>div]:h-full [&>div>div:first-child]:h-full [&>div>div:first-child]:border-none [&>div>div:first-child]:bg-transparent ${tripType !== 'Return' ? 'opacity-50 cursor-not-allowed bg-gray-50 pointer-events-none' : 'bg-transparent'}`}>
              <DOBCalendar
                value={returnDate}
                onChange={setReturnDate}
                placeholder="Return Date"
              />
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
    </div>
  );
};

export default B2BAgentHomePage;
