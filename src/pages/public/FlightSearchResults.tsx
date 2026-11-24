import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { ChevronDown, Check, Plane, Building2, User, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import {  selectCurrentUser, logout, logoutUserThunk } from '../../store/authSlice';
import CustomCalendar from '../../components/common/CustomCalendar';
import TravellerPicker from '../../components/common/TravellerPicker';
import CabinClassPicker from '../../components/common/CabinClassPicker';
import CityPicker from '../../components/common/CityPicker';
import TripTypePicker from '../../components/common/TripTypePicker';
import LoginModal from '../../components/auth/LoginModal';
import toast from 'react-hot-toast';
import { useFlightSearch } from '../../hooks/useFlightSearch';
import AgentFlightSearchResults from './AgentFlightSearchResults';
import InteractiveGridBackground from '../../components/ui/InteractiveGridBackground';
import { format } from 'date-fns';

interface Flight {
  _id: string;
  airline: string;
  airlineLogo: string;
  flightNumber: string;
  departureCity: string;
  departureAirportCode: string;
  arrivalCity: string;
  arrivalAirportCode: string;
  departureTime: string;
  arrivalTime: string;
  departureTerminal?: string;
  arrivalTerminal?: string;
  durationMinutes: number;
  price: number;
  stops: number;
  adultPrice?: number;
  childPrice?: number;
  infantPrice?: number;
  nexus_total_price?: number;
  nexus_query?: any;
  isSeriesFare?: boolean;
  agentCommission?: number;
  returnFlight?: any;
  isRoundTripCombo?: boolean;
  isRoundTripComboReturn?: boolean;
  segments?: {
    origin: string;
    destination: string;
    airline: string;
    flightNo: string;
    departureTime: string;
    arrivalTime: string;
    departureTerminal?: string;
    arrivalTerminal?: string;
  }[];
}

const CITIES: Record<string, string> = {
  DEL: 'New Delhi',
  BOM: 'Mumbai',
  BLR: 'Bengaluru',
  GOI: 'Goa',
  CCU: 'Kolkata',
  HYD: 'Hyderabad',
  MAA: 'Chennai',
  DXB: 'Dubai',
  BKK: 'Bangkok',
  LHR: 'London',
  SYD: 'Sydney',
  BNE: 'Brisbane',
  AKL: 'Auckland',
  DPS: 'Bali',
  SIN: 'Singapore'
};

export default function FlightSearchResults() {
  const dispatch = useDispatch();
  const flightSearchState = useFlightSearch();
  const {
    from, setFrom,
    to, setTo,
    date, setDate,
    tripType, setTripType,
    returnDate, setReturnDate,
    adults, setAdults,
    children, setChildren,
    infants, setInfants,
    cabinClass, setCabinClass,
    nonStopFilter, setNonStopFilter,
    morningFilter, setMorningFilter,
    sortBy, setSortBy,
    outboundFlights,
    returnFlights,
    loading,
    selectedOutbound, setSelectedOutbound,
    selectedReturn, setSelectedReturn,
    showFlightDetails, setShowFlightDetails,
    suggestedFlights,
    sortedOutboundFlights,
    cheapestFlight,
    nonStopFlight,
    preferFlight,
    handleSearch,
    getDisplayPrice,
    user,

    // Multi-City State
    multiCityLegs,
    setMultiCityLegs,
    activeLegIndex,
    setActiveLegIndex,
    selectedLegFlights,
    setSelectedLegFlights,

    isAgentDiscount,
    navigate
  } = flightSearchState;

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showFareSummaryModal, setShowFareSummaryModal] = useState(false);

  // Picker States
  const [activeDatePicker, setActiveDatePicker] = useState<'depart' | 'return' | null>(null);
  const [isTravellerPickerOpen, setIsTravellerPickerOpen] = useState(false);
  const [isCabinPickerOpen, setIsCabinPickerOpen] = useState(false);
  const [isFromPickerOpen, setIsFromPickerOpen] = useState(false);
  const [isToPickerOpen, setIsToPickerOpen] = useState(false);
  const [isTripTypePickerOpen, setIsTripTypePickerOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Calendar Prices State
  const [calendarPrices, setCalendarPrices] = useState<Record<string, any>>({});
  const [sliderOffset, setSliderOffset] = useState(0);

  useEffect(() => {
    const fetchCalendarPrices = async () => {
      if (!from || !to) return;
      try {
        const { data } = await api.get(`/api/searches/calendar-prices?origin=${from}&destination=${to}`);
        if (data) {
          setCalendarPrices(data);
        }
      } catch (err) {
        console.error('Error fetching calendar prices:', err);
      }
    };
    fetchCalendarPrices();
  }, [from, to]);

  // Redirect removed, all users get normal UI

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' }).replace(',', '');
  };

  const closeAllPickers = () => {
    setActiveDatePicker(null);
    setIsTravellerPickerOpen(false);
    setIsCabinPickerOpen(false);
    setIsFromPickerOpen(false);
    setIsToPickerOpen(false);
    setIsTripTypePickerOpen(false);
    setIsProfileMenuOpen(false);
  };

  const handleSearchClick = () => {
    closeAllPickers();
    handleSearch();
  };

  const getCityName = (code: string) => CITIES[code] || code;

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`;
  };

  return (
    <div className="min-h-screen font-sans pb-32 relative z-0 overflow-hidden" onClick={closeAllPickers}>
      <InteractiveGridBackground theme="light" />
      
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      {/* Integrated Header */ }
      <div className="bg-white sticky top-0 z-40 shadow-sm border-b border-gray-200">
        
        {/* Compact Logo & Nav Row */}
        <div className="max-w-[1200px] mx-auto py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <Plane size={24} className="text-blue-600" />
              <span className="text-xl font-black tracking-tight text-gray-900 flex items-center gap-1.5">
                Trippe<span className="text-blue-600">Chalo</span>
                <span className="text-[10px] bg-orange-500 text-white font-black px-1.5 py-0.5 rounded tracking-wide">INDIA</span>
              </span>
            </Link>

          </div>
          
          <div className="hidden md:flex items-center gap-8 mr-12">
            <div className="flex flex-col items-center cursor-pointer text-blue-600">
              <Plane size={20} />
              <span className="text-[10px] font-bold mt-1">Flights</span>
            </div>
            <div 
              className="flex flex-col items-center cursor-pointer text-gray-500 hover:text-blue-600 transition"
              onClick={() => navigate('/?tab=Hotels')}
            >
              <Building2 size={20} />
              <span className="text-[10px] font-bold mt-1">Hotels</span>
            </div>
          </div>

          {user ? (
            <div className="group relative py-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsProfileMenuOpen(!isProfileMenuOpen); }}
                className="flex items-center gap-2 cursor-pointer bg-blue-50/50 px-3 py-1.5 rounded-full border border-blue-100 hover:bg-blue-50 transition"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center overflow-hidden font-bold text-xs uppercase">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0D8ABC&color=fff`;
                      }}
                    />
                  ) : (
                    user.name?.charAt(0) || <User size={14} />
                  )}
                </div>
                <span className="hidden md:inline text-xs font-bold text-gray-800">Hi, {user.name?.split(' ')[0] || 'User'}</span>
                <ChevronDown size={14} className="text-blue-600 hidden md:block" />
              </button>
              <div className={`absolute right-0 top-full mt-1 w-48 z-50 ${isProfileMenuOpen ? 'block' : 'hidden md:group-hover:block'}`}>
                <div className="bg-white rounded-lg shadow-xl py-2 border border-gray-100">
                  {user?.roles?.includes('USER') && (
                    <>
                      <Link to="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Profile</Link>
                      <Link to="/dashboard/bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Bookings</Link>
                    </>
                  )}
                  {(user?.roles?.includes('SUPPLIER_AGENT')) && (
                    <Link to="/b2b/home" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">B2B Dashboard</Link>
                  )}
                  {(user?.roles?.includes('SUPER_ADMIN') || user?.roles?.includes('SUB_ADMIN')) && (
                    <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Admin Panel</Link>
                  )}
                  <button onClick={() => { navigate('/'); dispatch(logoutUserThunk() as any); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1">Logout</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer bg-blue-50/50 px-3 py-1.5 rounded-full border border-blue-100" onClick={() => navigate('/')}>
              <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white">
                <User size={14} />
              </div>
              <span className="text-xs font-bold text-gray-800">Login</span>
            </div>
          )}
        </div>

        {/* Search Bar Row (Premium Dark) */}
        <div className="bg-gradient-to-r from-[#0c1a40] to-blue-900 py-3 shadow-lg relative z-30">
          <div className="max-w-[1200px] mx-auto relative px-3 md:px-0">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-2 justify-between md:justify-start w-full">
              
              <div 
                className="flex flex-col bg-white/10 hover:bg-white/20 border border-white/20 rounded px-3 py-1 cursor-pointer w-full md:w-32 backdrop-blur-sm transition text-white"
                onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsTripTypePickerOpen(true); }}
              >
                <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Trip Type</span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{tripType}</span>
                  <ChevronDown size={14} className="text-blue-200" />
                </div>
              </div>

              <div className="flex items-center w-full md:flex-1">
                <div 
                  className="flex flex-col bg-white/10 hover:bg-white/20 border border-white/20 rounded px-3 py-1 cursor-pointer flex-1 backdrop-blur-sm transition text-white"
                  onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsFromPickerOpen(true); }}
                >
                  <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">From</span>
                  <span className="text-sm font-bold text-white truncate">{getCityName(from)}</span>
                </div>

                <div 
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 border border-blue-400 shadow-md z-10 -mx-3 md:-mx-4 cursor-pointer text-white hover:bg-blue-400 hover:shadow-lg transition transform hover:scale-105 shrink-0"
                  onClick={(e) => { e.stopPropagation(); const temp = from; setFrom(to); setTo(temp); }}
                >
                  <span className="text-xs font-black">⇄</span>
                </div>

                <div 
                  className="flex flex-col bg-white/10 hover:bg-white/20 border border-white/20 rounded px-3 py-1 cursor-pointer flex-1 pl-5 md:pl-6 backdrop-blur-sm transition text-white text-right md:text-left"
                  onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsToPickerOpen(true); }}
                >
                  <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">To</span>
                  <span className="text-sm font-bold text-white truncate">{getCityName(to)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <div 
                  className="flex flex-col bg-white/10 hover:bg-white/20 border border-white/20 rounded px-3 py-1 cursor-pointer flex-1 md:w-32 backdrop-blur-sm transition text-white"
                  onClick={(e) => { e.stopPropagation(); closeAllPickers(); setActiveDatePicker('depart'); }}
                >
                  <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Depart</span>
                  <span className="text-sm font-bold text-white truncate">{formatDate(date)}</span>
                </div>

                <div 
                  className={`flex flex-col bg-white/10 hover:bg-white/20 border border-white/20 rounded px-3 py-1 cursor-pointer flex-1 md:w-32 relative backdrop-blur-sm transition text-white ${tripType === 'One Way' ? 'opacity-50' : ''}`}
                  onClick={(e) => { e.stopPropagation(); if (tripType !== 'Round Trip') setTripType('Round Trip'); closeAllPickers(); setActiveDatePicker('return'); }}
                >
                  <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Return</span>
                  <span className="text-sm font-bold text-white truncate">{tripType === 'Round Trip' ? formatDate(returnDate) : 'Tap to add'}</span>
                  {tripType === 'Round Trip' && (
                    <span className="absolute top-1 right-2 text-white/50 text-xs hover:text-white" onClick={(e) => { e.stopPropagation(); setTripType('One Way'); }}>×</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <div 
                  className="flex flex-col bg-white/10 hover:bg-white/20 border border-white/20 rounded px-3 py-1 cursor-pointer flex-1 md:w-28 backdrop-blur-sm transition text-white"
                  onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsTravellerPickerOpen(true); }}
                >
                  <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Travellers</span>
                  <span className="text-sm font-bold text-white truncate">{adults + children + infants} Traveller</span>
                </div>

                <div 
                  className="flex flex-col bg-white/10 hover:bg-white/20 border border-white/20 rounded px-3 py-1 cursor-pointer flex-1 md:w-32 backdrop-blur-sm transition text-white"
                  onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsCabinPickerOpen(true); }}
                >
                  <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Cabin Class</span>
                  <span className="text-sm font-bold text-white truncate">{cabinClass.split('/')[0]}</span>
                </div>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); handleSearch(); }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-black tracking-wide text-sm px-8 py-3 rounded-full cursor-pointer transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5 w-full md:w-auto mt-2 md:mt-0"
              >
                SEARCH
              </button>
            </div>
          </div>

          {/* Absolute Positioned Pickers */}
          {isTripTypePickerOpen && (
            <div className="absolute top-[60px] left-0 md:left-0 z-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 rounded-xl overflow-hidden bg-white">
              <TripTypePicker value={tripType} onChange={setTripType} onClose={() => setIsTripTypePickerOpen(false)} />
            </div>
          )}

          {isFromPickerOpen && (
            <div className="absolute top-[60px] left-0 md:left-[15%] z-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 rounded-xl overflow-hidden bg-white">
              <CityPicker value={from} onChange={setFrom} onClose={() => setIsFromPickerOpen(false)} title="FROM" />
            </div>
          )}

          {isToPickerOpen && (
            <div className="absolute top-[60px] left-0 md:left-[35%] z-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 rounded-xl overflow-hidden bg-white">
              <CityPicker value={to} onChange={setTo} onClose={() => setIsToPickerOpen(false)} title="TO" />
            </div>
          )}

          {activeDatePicker === 'depart' && (
            <div className="absolute top-[60px] left-0 md:left-[30%] z-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 rounded-xl overflow-hidden bg-white" onClick={e => e.stopPropagation()}>
              <CustomCalendar 
                startDate={date}
                endDate={null}
                isOneWay={true}
                onChange={(start) => {
                  if (start) setDate(start);
                  setActiveDatePicker(tripType === 'Round Trip' ? 'return' : null);
                }} 
                onClose={() => setActiveDatePicker(null)}
                origin={from}
                destination={to}
              />
            </div>
          )}
          {activeDatePicker === 'return' && (
            <div className="absolute top-[60px] left-0 md:left-[40%] z-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 rounded-xl overflow-hidden bg-white" onClick={e => e.stopPropagation()}>
              <CustomCalendar 
                startDate={returnDate}
                endDate={null}
                minDate={date}
                isOneWay={true}
                onChange={(start) => {
                  if (start) setReturnDate(start);
                  setActiveDatePicker(null);
                }} 
                onClose={() => setActiveDatePicker(null)}
                origin={to}
                destination={from}
              />
            </div>
          )}

          {isTravellerPickerOpen && (
            <div className="absolute top-[60px] left-0 md:left-auto md:right-[10%] z-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 rounded-xl overflow-hidden bg-white">
              <TravellerPicker 
                adults={adults}
                children={children}
                infants={infants}
                cabinClass={cabinClass}
                onChange={(a, c, i, cabin) => {
                  setAdults(a);
                  setChildren(c);
                  setInfants(i);
                  setCabinClass(cabin);
                }}
                onClose={() => setIsTravellerPickerOpen(false)}
              />
            </div>
          )}

          {isCabinPickerOpen && (
            <div className="absolute top-[60px] left-0 md:left-auto md:right-[5%] z-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 rounded-xl overflow-hidden bg-white">
              <CabinClassPicker 
                cabinClass={cabinClass}
                onChange={(c) => { setCabinClass(c); setIsCabinPickerOpen(false); }}
              />
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="w-full flex flex-col items-center justify-center py-32 bg-[#f8fafc] min-h-[600px] relative z-10 overflow-hidden">
          <div className="absolute inset-0 opacity-40 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-64 bg-blue-200 rounded-full blur-[100px] animate-pulse"></div>
          </div>
          
          <div className="relative mb-8 z-10 flex flex-col items-center">
            <div className="mb-8 flex items-center justify-center h-16 w-48 relative">
               {/* Animated Wind Lines */}
               <div className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-8 overflow-hidden pointer-events-none">
                 <div className="w-full h-full relative animate-[wind_1s_linear_infinite]">
                    <div className="absolute top-[20%] left-[20%] w-3 h-[2px] bg-blue-300 rounded-full"></div>
                    <div className="absolute top-[50%] left-[50%] w-8 h-[2px] bg-blue-400 rounded-full"></div>
                    <div className="absolute top-[80%] left-[10%] w-5 h-[2px] bg-blue-300 rounded-full"></div>
                 </div>
                 <div className="w-full h-full relative animate-[wind_1.5s_linear_infinite] delay-75">
                    <div className="absolute top-[30%] left-[70%] w-6 h-[2px] bg-blue-500 rounded-full"></div>
                    <div className="absolute top-[70%] left-[40%] w-4 h-[2px] bg-blue-400 rounded-full"></div>
                 </div>
               </div>
               
               {/* Smooth floating Plane */}
               <div className="absolute right-0 animate-[float_3s_ease-in-out_infinite]">
                 <Plane size={56} className="text-blue-600 transform rotate-12 drop-shadow-md" strokeWidth={2} fill="white" />
               </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black text-[#0c1a40] tracking-tight mb-2">
              Searching for the best fares
            </h2>
            <p className="text-sm text-blue-600 font-black uppercase tracking-wider mb-2">
              {from} <span className="mx-2">✈</span> {to}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
              <span className="bg-gray-200/50 px-3 py-1 rounded-full">{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span className="bg-gray-200/50 px-3 py-1 rounded-full">{tripType}</span>
              <span className="bg-gray-200/50 px-3 py-1 rounded-full">
                {parseInt(adults as any) + parseInt(children as any) + parseInt(infants as any)} Traveller{(parseInt(adults as any) + parseInt(children as any) + parseInt(infants as any)) > 1 ? 's' : ''}
              </span>
              <span className="bg-gray-200/50 px-3 py-1 rounded-full">{cabinClass}</span>
            </div>
            
            <div className="w-48 h-1 bg-gray-200 rounded-full mt-8 overflow-hidden relative">
               <div className="absolute top-0 left-0 h-full bg-blue-600 rounded-full w-full origin-left animate-[shimmer_1.5s_infinite]"></div>
            </div>
            <style>{`
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
              @keyframes float {
                0%, 100% { transform: translateY(0) rotate(12deg); }
                50% { transform: translateY(-6px) rotate(14deg); }
              }
              @keyframes wind {
                0% { transform: translateX(100%); opacity: 0; }
                20% { opacity: 1; }
                80% { opacity: 1; }
                100% { transform: translateX(-100%); opacity: 0; }
              }
            `}</style>
          </div>
        </div>
      ) : (
        <div className="max-w-[1000px] mx-auto px-4 xl:px-0 pt-2 pb-6 md:py-6 w-full">
          {/* Main Content - Flight Results */}
          <div className="w-full">
            <h2 className="hidden md:block text-2xl font-black text-gray-900 mb-4">
              Flights from {getCityName(from)} to {getCityName(to)}{tripType === 'Round Trip' ? ', and back' : ''}
            </h2>
            {(nonStopFilter || morningFilter) && (
              <div className="bg-white p-3 rounded shadow-sm border border-gray-200 mb-2 md:mb-4 flex items-center gap-4 relative z-10">
                <h3 className="font-bold text-gray-900 text-sm">Applied Filters:</h3>
                <div className="flex flex-wrap gap-2 flex-1">
                  {nonStopFilter && (
                    <div className="bg-gray-100 px-2 py-1 rounded text-xs flex items-center gap-1 text-gray-700">
                      Non Stop <span className="text-gray-400 cursor-pointer hover:text-red-500" onClick={() => setNonStopFilter(false)}>×</span>
                    </div>
                  )}
                  {morningFilter && (
                    <div className="bg-gray-100 px-2 py-1 rounded text-xs flex items-center gap-1 text-gray-700">
                      Morning Dep. <span className="text-gray-400 cursor-pointer hover:text-red-500" onClick={() => setMorningFilter(false)}>×</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-blue-500 font-bold cursor-pointer hover:underline" onClick={() => { setNonStopFilter(false); setMorningFilter(false); }}>Clear All</span>
              </div>
            )}


            {/* One Way Advanced Filtering UI */}
            {tripType === 'One Way' && (
              <>
                {/* Date Carousel */}
                <div className="flex bg-white shadow-sm border border-gray-200 rounded mb-2 md:mb-4 overflow-hidden h-[60px] relative z-10">
                  <div onClick={() => setSliderOffset(prev => prev - 1)} className="w-10 flex items-center justify-center border-r border-gray-100 text-blue-500 font-black text-xl cursor-pointer hover:bg-gray-50 bg-white">{'<'}</div>
                  <div className="flex flex-1 divide-x divide-gray-100 text-center text-sm overflow-x-auto hidden-scrollbar">
                    {[...Array(7)].map((_, i) => {
                      const d = new Date(date);
                      d.setDate(d.getDate() - 3 + i + sliderOffset);
                      const isSelected = d.toDateString() === new Date(date).toDateString();

                      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                      const rawPrice = calendarPrices[dStr];
                      const priceForDate = typeof rawPrice === 'object' && rawPrice !== null ? rawPrice.price : rawPrice;
                      const isFDDate = typeof rawPrice === 'object' && rawPrice !== null ? rawPrice.isFD : false;
                      const seatsForDate = typeof rawPrice === 'object' && rawPrice !== null ? rawPrice.seats : null;
                      
                      let displayPriceStr = '--';
                      if (isSelected && cheapestFlight && cheapestFlight.price != null && Number(cheapestFlight.price) > 0) {
                         const val = getDisplayPrice(cheapestFlight.price);
                         displayPriceStr = val > 0 ? `₹ ${val.toLocaleString('en-IN')}` : '--';
                      } else if (isSelected && !loading && (!cheapestFlight || !cheapestFlight.price)) {
                         displayPriceStr = '--';
                      } else if (typeof priceForDate === 'number' && priceForDate > 0) {
                         const val = getDisplayPrice(priceForDate);
                         displayPriceStr = val > 0 ? `₹ ${val.toLocaleString('en-IN')}` : '--';
                      } else if (priceForDate === -1 || isFDDate) {
                         displayPriceStr = 'Available';
                      }

                      return (
                        <div 
                           key={i} 
                           onClick={() => {
                             setDate(d);
                             setSliderOffset(0);
                           }}
                           className={`flex-none w-1/3 md:flex-1 py-2 cursor-pointer ${isSelected ? 'border-b-[3px] border-blue-500 bg-blue-50/50' : 'bg-white hover:bg-gray-50'} ${(i < 2 || i > 4) ? 'hidden md:block' : ''}`}
                        >
                          <p className={`font-bold text-[13px] ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                            {d.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                          <p className={`text-[11px] ${isSelected ? 'text-blue-600' : (priceForDate ? 'text-green-600 font-bold' : 'text-gray-500')}`}>
                            {displayPriceStr}
                            {!(isSelected && !loading && !cheapestFlight) && seatsForDate ? (
                              <span className="block text-[9px] text-emerald-600 font-extrabold">{seatsForDate} Seats Left</span>
                            ) : null}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <div onClick={() => setSliderOffset(prev => prev + 1)} className="w-10 flex items-center justify-center border-l border-gray-100 text-blue-500 font-black text-xl cursor-pointer hover:bg-gray-50 bg-white">{'>'}</div>
                </div>

                {/* Sorting Tabs */}
                <div className="flex gap-2 mb-0 md:mb-4 relative z-10">
                  <div onClick={() => setSortBy('CHEAPEST')} className={`flex-1 bg-white border-x border-t ${sortBy === 'CHEAPEST' ? 'border-b-4 border-blue-500 shadow-md' : 'border-b border-gray-200 shadow-sm opacity-80'} rounded p-2 cursor-pointer flex items-center gap-3 transition`}>
                    <div className={`${sortBy === 'CHEAPEST' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'} w-8 h-8 rounded-full flex items-center justify-center font-black`}><span className={sortBy === 'CHEAPEST' ? '' : ''}>₹</span></div>
                    <div>
                      <p className="font-bold text-gray-900 text-[13px]">CHEAPEST</p>
                      <p className="text-gray-500 text-[11px]">{cheapestFlight && cheapestFlight.price != null && Number(cheapestFlight.price) > 0 ? `₹ ${getDisplayPrice(cheapestFlight.price).toLocaleString('en-IN')} | ${formatDuration(cheapestFlight.durationMinutes)}` : '--'}</p>
                    </div>
                  </div>
                  <div onClick={() => setSortBy('NON STOP FIRST')} className={`flex-1 bg-white border-x border-t ${sortBy === 'NON STOP FIRST' ? 'border-b-4 border-blue-500 shadow-md opacity-100' : 'border-b border-gray-200 shadow-sm opacity-80 bg-gray-50'} rounded p-2 cursor-pointer flex items-center gap-3 transition`}>
                    <div className={`${sortBy === 'NON STOP FIRST' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'} w-8 h-8 rounded flex items-center justify-center`}><Plane size={16} /></div>
                    <div>
                      <p className="font-bold text-gray-900 text-[13px]">NON STOP FIRST</p>
                      <p className="text-gray-500 text-[11px]">{nonStopFlight && nonStopFlight.price != null && Number(nonStopFlight.price) > 0 ? `₹ ${getDisplayPrice(nonStopFlight.price).toLocaleString('en-IN')} | ${formatDuration(nonStopFlight.durationMinutes)}` : '--'}</p>
                    </div>
                  </div>
                  </div>
                {/* Text showing sorted by */}
                <p className="hidden md:block text-[11px] text-gray-500 font-bold mb-2">Flights sorted by {sortBy === 'CHEAPEST' ? 'Lowest fares' : (sortBy === 'NON STOP FIRST' ? 'Fewest stops' : 'Best matches')} on this route</p>
              </>
            )}

            {/* Multi-City Itinerary Progress Bar */}
            {tripType === 'Multi City' && multiCityLegs && multiCityLegs.length > 0 && (
              <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Plane size={14} className="text-blue-600" />
                    Multi-City Sectors ({multiCityLegs.length} Flights)
                  </span>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {Object.keys(selectedLegFlights).length} of {multiCityLegs.length} Selected
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {multiCityLegs.map((leg, idx) => {
                    const isSelected = activeLegIndex === idx;
                    const flightChosen = selectedLegFlights[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveLegIndex(idx)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black uppercase text-slate-500">
                            Flight #{idx + 1}
                          </span>
                          {flightChosen ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded-full">
                              ✓ Selected
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-full">
                              Pending
                            </span>
                          )}
                        </div>
                        <div className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                          <span>{leg.from}</span>
                          <span className="text-blue-500 text-xs">➔</span>
                          <span>{leg.to}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                          {format(new Date(leg.date), "dd MMM, yyyy")}
                        </p>
                        {flightChosen && (
                          <p className="text-[11px] font-bold text-blue-700 mt-1 truncate">
                            {flightChosen.airline} • ₹{getDisplayPrice(flightChosen.price).toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={`grid gap-4 ${tripType === 'Round Trip' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              
              {/* Outbound Flights Column */}
              <div className="bg-transparent overflow-hidden relative z-10">
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs mb-3 flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-base">
                    {tripType === 'Multi City' && multiCityLegs[activeLegIndex]
                      ? `Flight #${activeLegIndex + 1}: ${getCityName(multiCityLegs[activeLegIndex].from)} → ${getCityName(multiCityLegs[activeLegIndex].to)}`
                      : `${getCityName(from)} → ${getCityName(to)}`}
                    <span className="text-slate-500 font-semibold text-xs sm:text-sm ml-2">
                      {tripType === 'Multi City' && multiCityLegs[activeLegIndex]
                        ? new Date(multiCityLegs[activeLegIndex].date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
                        : new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                  </h3>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {sortedOutboundFlights.length} Flights Available
                  </span>
                </div>
                
                <div className="space-y-3">
                  {sortedOutboundFlights.length > 0 ? (
                    sortedOutboundFlights.map((flight, index) => (
                      <FlightCard 
                        key={`${flight._id}-${index}`} 
                        flight={flight} 
                        isSelected={
                          tripType === 'Multi City'
                            ? selectedLegFlights[activeLegIndex]?._id === flight._id
                            : selectedOutbound?._id === flight._id
                        }
                        onSelect={() => {
                          if (tripType === 'Multi City') {
                            setSelectedLegFlights(prev => ({ ...prev, [activeLegIndex]: flight }));
                            setSelectedOutbound(flight);
                            if (activeLegIndex < multiCityLegs.length - 1) {
                              toast.success(`Flight #${activeLegIndex + 1} chosen! Now select Flight #${activeLegIndex + 2}`);
                              setActiveLegIndex(activeLegIndex + 1);
                            } else {
                              toast.success(`Flight #${activeLegIndex + 1} chosen! All sectors confirmed.`);
                            }
                          } else {
                            setSelectedOutbound(flight);
                          }
                        }}
                        isRoundTrip={tripType === 'Round Trip'}
                        displayPrice={getDisplayPrice(flight.price)}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gray-50/50">
                      <div className="w-20 h-20 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Plane className="text-blue-200 w-10 h-10" />
                      </div>
                      <h3 className="text-[16px] font-black text-gray-900 mb-2">No flights found</h3>
                      <p className="text-[13px] text-gray-500 max-w-[250px] mb-6">We couldn't find any flights for this route. Try changing your date or removing some filters.</p>
                      
                      <button 
                        onClick={() => {
                          setNonStopFilter(false);
                          setMorningFilter(false);
                          setCabinClass('Economy/ Premium Economy');
                          setAdults(1);
                          setChildren(0);
                          setInfants(0);
                        }}
                        className="text-sm font-bold text-blue-600 border border-blue-600 rounded-full px-6 py-2 hover:bg-blue-50 transition"
                      >
                        Clear All Filters
                      </button>

                      {suggestedFlights.length > 0 && (
                        <div className="mt-12 w-full text-left">
                          <h4 className="font-bold text-gray-900 mb-4 px-4">Suggested Cheap Flights</h4>
                          <div className="divide-y divide-gray-200 border-t border-gray-200 bg-white shadow-sm rounded-lg overflow-hidden text-left">
                            {suggestedFlights.map(flight => (
                              <FlightCard 
                                key={`sugg-${flight._id}`} 
                                flight={flight} 
                                isSelected={selectedOutbound?._id === flight._id}
                                onSelect={() => setSelectedOutbound(flight)}
                                isRoundTrip={false}
                                displayPrice={getDisplayPrice(flight.price)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Return Flights Column */}
              {tripType === 'Round Trip' && (
                <div className="bg-transparent overflow-hidden relative z-10">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs mb-3 flex items-center justify-between">
                    <h3 className="font-black text-slate-900 text-base">
                      {getCityName(to)} → {getCityName(from)}{' '}
                      <span className="text-slate-500 font-semibold text-xs sm:text-sm ml-2">
                        {new Date(returnDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                    </h3>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {returnFlights.length} Flights Available
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {returnFlights.length > 0 ? (
                      returnFlights.map(flight => (
                        <FlightCard 
                          key={flight._id} 
                          flight={flight} 
                          isSelected={selectedReturn?._id === flight._id}
                          onSelect={() => setSelectedReturn(flight)}
                          isRoundTrip={true}
                          displayPrice={getDisplayPrice(flight.price)}
                        />
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gray-50/50">
                        <div className="w-20 h-20 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Plane className="text-blue-200 w-10 h-10" />
                        </div>
                        <h3 className="text-[16px] font-black text-gray-900 mb-2">No return flights found</h3>
                        <p className="text-[13px] text-gray-500 max-w-[250px]">We couldn't find any return flights for this date. Try selecting another date.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Footer for Selection */}
            {(
              (tripType === 'Multi City' && multiCityLegs && multiCityLegs.length > 0 && Object.keys(selectedLegFlights).length > 0) ||
              (tripType === 'Round Trip' && selectedOutbound && selectedReturn) ||
              (tripType === 'One Way' && selectedOutbound)
            ) ? createPortal(
              <div className="fixed bottom-16 lg:bottom-6 left-0 w-full z-[30] pointer-events-none flex justify-center animate-in slide-in-from-bottom-10 fade-in duration-500 ease-out px-4">
                <div className="bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_15px_40px_rgba(0,0,0,0.15)] rounded-xl md:rounded-full pointer-events-auto w-full max-w-[1000px] p-1.5 md:p-2.5 flex flex-row items-center justify-between gap-2 md:gap-4">
                   
                  <div className="hidden md:flex w-auto items-center gap-4 flex-1 overflow-hidden px-2">
                    {tripType === 'Multi City' ? (
                      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-1">
                        {multiCityLegs.map((leg, idx) => {
                          const flight = selectedLegFlights[idx];
                          return (
                            <div key={idx} className="flex items-center gap-2 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-lg border border-slate-200/80">
                              <span className="text-[10px] font-black text-blue-600">#{idx + 1}</span>
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-800">{leg.from} ➔ {leg.to}</span>
                                {flight ? (
                                  <span className="text-[10px] font-bold text-slate-500">{flight.airline} • ₹{getDisplayPrice(flight.price).toLocaleString('en-IN')}</span>
                                ) : (
                                  <span className="text-[10px] font-bold text-amber-600">Pending</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <>
                        {/* Outbound */}
                        <div className="flex-1 flex items-center gap-3 md:gap-4">
                           <div className="relative">
                             <div className="absolute inset-0 bg-blue-500 blur opacity-20 rounded-full"></div>
                             <img src={selectedOutbound?.airlineLogo} alt="" className="w-8 h-8 md:w-10 md:h-10 object-contain bg-white rounded-full shadow-sm p-1.5 relative border border-gray-100" />
                           </div>
                           <div className="flex flex-col">
                             <div className="flex items-center gap-2 mb-0.5">
                               <span className="font-black text-sm md:text-[15px] text-[#0c1a40]">{selectedOutbound ? formatTime(parseDate(selectedOutbound.departureTime)) : ''}</span>
                               <span className="text-blue-500 text-[10px] md:text-xs">➔</span>
                               <span className="font-black text-sm md:text-[15px] text-[#0c1a40]">{selectedOutbound ? formatTime(parseDate(selectedOutbound.arrivalTime)) : ''}</span>
                              {selectedOutbound && ((selectedOutbound as any).dayChange > 0 || parseDate(selectedOutbound.arrivalTime) < parseDate(selectedOutbound.departureTime)) && (
                                <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-1 py-0.2 rounded leading-none">+{(selectedOutbound as any).dayChange || 1}D</span>
                              )}
                             </div>
                             <div className="flex gap-2 md:gap-3 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                               <span>{selectedOutbound?.airline} {selectedOutbound?.flightNumber ? `(${selectedOutbound.flightNumber})` : ''}</span>
                               <span className="text-blue-400 hover:text-blue-600 cursor-pointer" onClick={() => setShowFlightDetails(selectedOutbound)}>Details</span>
                             </div>
                           </div>
                        </div>

                        {/* Return if roundtrip */}
                        {tripType === 'Round Trip' && selectedReturn && (
                          <>
                            <div className="w-[1px] h-8 md:h-10 bg-gray-200/80 mx-1 md:mx-2"></div>
                            <div className="flex-1 flex items-center gap-3 md:gap-4">
                               <div className="relative">
                                 <div className="absolute inset-0 bg-emerald-500 blur opacity-20 rounded-full"></div>
                                 <img src={selectedReturn.airlineLogo} alt="" className="w-8 h-8 md:w-10 md:h-10 object-contain bg-white rounded-full shadow-sm p-1.5 relative border border-gray-100" />
                               </div>
                               <div className="flex flex-col">
                                 <div className="flex items-center gap-2 mb-0.5">
                                   <span className="font-black text-sm md:text-[15px] text-[#0c1a40]">{formatTime(parseDate(selectedReturn.departureTime))}</span>
                                   <span className="text-emerald-500 text-[10px] md:text-xs">➔</span>
                                   <span className="font-black text-sm md:text-[15px] text-[#0c1a40]">{formatTime(parseDate(selectedReturn.arrivalTime))}</span>
                                  {((selectedReturn as any).dayChange > 0 || parseDate(selectedReturn.arrivalTime) < parseDate(selectedReturn.departureTime)) && (
                                    <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-1 py-0.2 rounded leading-none">+{(selectedReturn as any).dayChange || 1}D</span>
                                  )}
                                 </div>
                                 <div className="flex gap-2 md:gap-3 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                   <span>{selectedReturn.airline} {selectedReturn.flightNumber ? `(${selectedReturn.flightNumber})` : ''}</span>
                                   <span className="text-emerald-500 hover:text-emerald-600 cursor-pointer" onClick={() => setShowFlightDetails(selectedReturn)}>Details</span>
                                 </div>
                               </div>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Action Area */}
                  <div className="flex items-center justify-between md:justify-end gap-2 md:gap-6 px-4 md:px-6 py-1.5 md:py-2 rounded-xl md:rounded-full w-full md:w-auto shadow-none md:shadow-sm bg-transparent md:bg-white/60 border-none md:border md:border-white/60">
                    <div className="flex flex-col items-start md:items-end justify-center">
                      <p className="font-black text-lg md:text-[22px] text-[#0c1a40] leading-none mb-1">
                        ₹ {(tripType === 'Multi City'
                          ? Object.values(selectedLegFlights).reduce((sum, f) => sum + getDisplayPrice(f.price), 0)
                          : ((selectedOutbound ? getDisplayPrice(selectedOutbound.price) : 0) + (tripType === 'Round Trip' && selectedReturn ? getDisplayPrice(selectedReturn.price) : 0))).toLocaleString('en-IN')}
                      </p>
                      <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase cursor-pointer hover:text-blue-600 transition flex items-center gap-1" onClick={() => setShowFareSummaryModal(true)}>
                        Fare Summary
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => {
                        if (!user) {
                          toast.error('Please login or signup first to book flights.', { id: 'login-required-toast' });
                          setIsLoginModalOpen(true);
                        } else {
                          if (tripType === 'Multi City') {
                            const unselectedIdx = multiCityLegs.findIndex((_, idx) => !selectedLegFlights[idx]);
                            if (unselectedIdx !== -1) {
                              setActiveLegIndex(unselectedIdx);
                              toast(`Please select a flight for Sector #${unselectedIdx + 1}`);
                              return;
                            }
                            const legsArray = multiCityLegs.map((_, idx) => selectedLegFlights[idx]);
                            navigate('/flights/booking', {
                              state: {
                                selectedOutbound: legsArray[0],
                                selectedReturn: legsArray[1] || null,
                                selectedLegs: legsArray,
                                tripType: 'Multi City',
                                adults,
                                children,
                                infants
                              }
                            });
                          } else {
                            navigate('/flights/booking', { state: { selectedOutbound, selectedReturn, tripType, adults, children, infants } });
                          }
                        }
                      }}
                      className="group bg-[#0c1a40] hover:bg-blue-600 text-white font-black py-2 md:py-3 px-6 md:px-8 rounded-full text-xs md:text-sm shadow-[0_5px_15px_rgba(12,26,64,0.3)] hover:shadow-[0_8px_25px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all uppercase tracking-wider flex items-center gap-1 md:gap-2 whitespace-nowrap"
                    >
                      {tripType === 'Multi City'
                        ? (multiCityLegs && Object.keys(selectedLegFlights).length === multiCityLegs.length
                            ? `Book All (${multiCityLegs.length} Flights)`
                            : `Sector #${activeLegIndex + 1} (${Object.keys(selectedLegFlights).length}/${multiCityLegs.length})`)
                        : 'Book Ticket'}
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform md:w-4 md:h-4 w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>,
              document.body
            ) : null}

        {/* Fare Summary Modal */}
        {showFareSummaryModal && (selectedOutbound || selectedReturn) && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowFareSummaryModal(false)}>
            <div 
              className="bg-white rounded-lg w-full max-w-sm overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-black text-gray-900 text-lg">Fare Summary</h3>
                <button onClick={() => setShowFareSummaryModal(false)} className="text-gray-500 hover:text-gray-700 font-bold text-xl">✕</button>
              </div>
              <div className="p-4">
                {(() => {
                  const outPrice = selectedOutbound ? getDisplayPrice(selectedOutbound.price) : 0;
                  const adultTotal = Math.round(selectedOutbound?.adultPrice ? selectedOutbound.adultPrice * (outPrice / (selectedOutbound.price || 1)) : outPrice);
                  const adultBase = (selectedOutbound as any)?.baseFarePerPax || Math.round(adultTotal * 0.72);
                  const adultTaxes = adultTotal - adultBase;
                  const totalBase = (adultBase * adults) + (children > 0 && selectedOutbound?.childPrice ? Math.round(selectedOutbound.childPrice * 0.72) * children : 0);
                  const totalTaxes = (adultTaxes * adults) + (children > 0 && selectedOutbound?.childPrice ? (selectedOutbound.childPrice - Math.round(selectedOutbound.childPrice * 0.72)) * children : 0);
                  const fuelSurcharge = Math.round(totalTaxes * 0.58);
                  const airportFee = Math.round(totalTaxes * 0.24);
                  const govtTaxes = totalTaxes - fuelSurcharge - airportFee;

                  return (
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-gray-100">
                        <tr className="py-2">
                          <td className="py-2.5 font-bold text-gray-700">
                            Base Fare <span className="text-xs text-gray-400 font-normal">({adults} Adult{adults > 1 ? 's' : ''}{children > 0 ? `, ${children} Child` : ''})</span>
                          </td>
                          <td className="py-2.5 text-right font-black text-gray-900">₹ {totalBase.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr className="py-2">
                          <td className="py-2.5 font-bold text-gray-700">Taxes & Surcharges</td>
                          <td className="py-2.5 text-right font-black text-gray-900">₹ {totalTaxes.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr className="bg-slate-50/80">
                          <td colSpan={2} className="py-2 px-3 space-y-1 text-xs text-gray-500 border-l-2 border-blue-500 rounded-r">
                            <div className="flex justify-between">
                              <span>• Airline Fuel Surcharge (YQ)</span>
                              <span className="font-semibold text-gray-700">₹ {fuelSurcharge.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>• Airport Dev & User Fee (UDF/PSF)</span>
                              <span className="font-semibold text-gray-700">₹ {airportFee.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>• Aviation Security Fee & GST</span>
                              <span className="font-semibold text-gray-700">₹ {govtTaxes.toLocaleString('en-IN')}</span>
                            </div>
                          </td>
                        </tr>
                        {infants > 0 && selectedOutbound?.infantPrice ? (
                          <tr className="py-2">
                            <td className="py-2.5 font-bold text-gray-600">Infant Fare ({infants} x ₹{Math.round(selectedOutbound.infantPrice).toLocaleString('en-IN')})</td>
                            <td className="py-2.5 text-right font-black text-gray-900">₹ {Math.round(selectedOutbound.infantPrice * infants).toLocaleString('en-IN')}</td>
                          </tr>
                        ) : null}
                        <tr className="bg-gray-50 font-black">
                          <td className="py-3 text-gray-900 text-base">Total Amount</td>
                          <td className="py-3 text-right text-blue-600 text-lg">
                            ₹ {((selectedOutbound ? getDisplayPrice(selectedOutbound.price) : 0) + (tripType === 'Round Trip' && selectedReturn ? getDisplayPrice(selectedReturn.price) : 0)).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

          </div>
        </div>
      )}

      {/* Flight Details Modal */}
      {showFlightDetails && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowFlightDetails(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-[620px] max-w-[95vw] overflow-hidden transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-gradient-to-r from-blue-900 to-blue-800 text-white flex justify-between items-center">
              <h2 className="text-xl font-black tracking-wide">Flight Details</h2>
              <button onClick={() => setShowFlightDetails(null)} className="text-blue-200 hover:text-white transition cursor-pointer flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10">
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
            
            <div className="p-6 md:p-8 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-5 mb-6">
                <img src={showFlightDetails.airlineLogo} alt="" className="w-12 h-12 object-contain" />
                <div>
                  <p className="font-black text-gray-900 text-xl">{showFlightDetails.airline}</p>
                  <p className="text-sm font-medium text-gray-500">{showFlightDetails.flightNumber} • {(showFlightDetails as any).cabinClass || cabinClass.split('/')[0]}</p>
                </div>
              </div>
              
              {showFlightDetails.segments && showFlightDetails.segments.length > 1 ? (
                <div className="space-y-4">
                  {showFlightDetails.segments.map((seg, sIdx) => {
                    const segDep = parseDate(seg.departureTime);
                    const segArr = parseDate(seg.arrivalTime);
                    return (
                      <React.Fragment key={sIdx}>
                        {sIdx > 0 && (
                          <div className="flex justify-center py-2">
                            <div className="bg-amber-50 text-amber-700 px-3.5 py-1 rounded-full text-[10px] font-bold border border-amber-200 shadow-xs">
                              Change Plane at {showFlightDetails.segments![sIdx - 1].destination}
                            </div>
                          </div>
                        )}
                        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/60">
                          <div className="flex items-center justify-between text-xs font-bold text-gray-600 mb-3 pb-2 border-b border-gray-200">
                            <span>Leg {sIdx + 1}: {seg.airline} {seg.flightNo}</span>
                            <span>{formatDate(segDep)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-center w-1/3">
                              <p className="text-2xl font-black text-gray-900">{formatTime(segDep)}</p>
                              <p className="text-sm font-bold mt-1 text-gray-800">{seg.origin}</p>
                              {seg.departureTerminal ? (
                                <p className="text-[10px] bg-white border border-gray-300 px-2 py-0.5 rounded inline-block mt-1.5 text-gray-700 font-bold">
                                  {seg.departureTerminal.toUpperCase().startsWith('T') || seg.departureTerminal.toLowerCase().startsWith('terminal') ? seg.departureTerminal.toUpperCase() : `Terminal ${seg.departureTerminal}`}
                                </p>
                              ) : null}
                            </div>
                            <div className="flex flex-col items-center px-2 w-1/3">
                              <div className="w-full h-[2px] bg-gray-300 relative flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              </div>
                            </div>
                            <div className="text-center w-1/3">
                              <p className="text-2xl font-black text-gray-900">{formatTime(segArr)}</p>
                              <p className="text-sm font-bold mt-1 text-gray-800">{seg.destination}</p>
                              {seg.arrivalTerminal ? (
                                <p className="text-[10px] bg-white border border-gray-300 px-2 py-0.5 rounded inline-block mt-1.5 text-gray-700 font-bold">
                                  {seg.arrivalTerminal.toUpperCase().startsWith('T') || seg.arrivalTerminal.toLowerCase().startsWith('terminal') ? seg.arrivalTerminal.toUpperCase() : `Terminal ${seg.arrivalTerminal}`}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="text-center w-1/3">
                    <p className="text-3xl font-black text-gray-900">{new Date(showFlightDetails.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                    <p className="text-base font-bold mt-2 text-gray-800">{showFlightDetails.departureCity || 'City'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(showFlightDetails.departureTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    {showFlightDetails.departureTerminal ? (
                      <p className="text-[10px] bg-gray-100 px-2 py-1 rounded inline-block mt-2 text-gray-700 font-bold border border-gray-200">
                        {showFlightDetails.departureTerminal.toUpperCase().startsWith('T') || showFlightDetails.departureTerminal.toLowerCase().startsWith('terminal')
                          ? showFlightDetails.departureTerminal.toUpperCase()
                          : `Terminal ${showFlightDetails.departureTerminal}`}
                      </p>
                    ) : null}
                  </div>
                  
                  <div className="flex flex-col items-center px-4 w-1/3">
                    <p className="text-xs font-bold text-gray-500 mb-2">{Math.floor(showFlightDetails.durationMinutes / 60)}h {showFlightDetails.durationMinutes % 60}m</p>
                    <div className="w-full h-[2px] bg-gray-200 relative flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 mt-2">{showFlightDetails.stops === 0 ? 'NON STOP' : `${showFlightDetails.stops} STOP`}</p>
                  </div>
                  
                  <div className="text-center w-1/3">
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-3xl font-black text-gray-900">{new Date(showFlightDetails.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                      {((showFlightDetails as any).dayChange > 0 || new Date(showFlightDetails.arrivalTime) < new Date(showFlightDetails.departureTime)) && (
                        <span className="text-[11px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          +{(showFlightDetails as any).dayChange || 1} Day
                        </span>
                      )}
                    </div>
                    <p className="text-base font-bold mt-2 text-gray-800">{showFlightDetails.arrivalCity || 'City'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(showFlightDetails.arrivalTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    {showFlightDetails.arrivalTerminal ? (
                      <p className="text-[10px] bg-gray-100 px-2 py-1 rounded inline-block mt-2 text-gray-700 font-bold border border-gray-200">
                        {showFlightDetails.arrivalTerminal.toUpperCase().startsWith('T') || showFlightDetails.arrivalTerminal.toLowerCase().startsWith('terminal')
                          ? showFlightDetails.arrivalTerminal.toUpperCase()
                          : `Terminal ${showFlightDetails.arrivalTerminal}`}
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-gray-100 text-center text-xs text-gray-500">
              Baggage: {(showFlightDetails as any).checkinBaggage || 'Included'} Check-in, {(showFlightDetails as any).cabinBaggage || 'Included'} Cabin
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


const parseDate = (val: any) => {
  if (!val) return new Date();
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
};

const formatTime = (d: any) => {
  const dt = parseDate(d);
  return dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatDate = (d: any) => {
  const dt = parseDate(d);
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

// Subcomponent for Flight Card
function FlightCard({ flight, isSelected, onSelect, isRoundTrip, displayPrice }: { flight: Flight, isSelected?: boolean, onSelect?: () => void, isRoundTrip?: boolean, displayPrice?: number }) {
  const navigate = useNavigate();
  
  const parseDate = (val: any) => {
    if (!val) return new Date();
    if (typeof val === 'string' && /^\d{2}:\d{2}/.test(val) && !val.includes('T')) {
      const base = flight.departureTime ? new Date(flight.departureTime) : new Date();
      const [hh, mm] = val.split(':').map(Number);
      const d = new Date(base);
      d.setHours(hh || 0, mm || 0, 0, 0);
      return d;
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const depTime = parseDate(flight.departureTime);
  const arrTime = parseDate(flight.arrivalTime);
  
  const formatTime = (d: any) => {
    const dt = parseDate(d);
    return dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };
  const formatDate = (d: any) => {
    const dt = parseDate(d);
    return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };
  const formatDuration = (mins: number) => {
    const m = Number(mins) || 120;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
  };

  const finalPrice = Number(displayPrice) > 0 ? Number(displayPrice) : Number(flight.price) || 0;
  const originalPrice = Number(flight.price) || 0;

  const calculateLayover = (arrTime: string, depTime: string) => {
    const arr = parseDate(arrTime).getTime();
    const dep = parseDate(depTime).getTime();
    let diff = dep - arr;
    if (diff < 0) {
      diff += 24 * 60 * 60 * 1000;
    }
    const mins = Math.floor(diff / (1000 * 60));
    if (isNaN(mins)) return '0h 0m';
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const getDuration = (arrTime: string, depTime: string) => {
    const arr = parseDate(arrTime).getTime();
    const dep = parseDate(depTime).getTime();
    let diff = arr - dep;
    if (diff < 0) {
      diff += 24 * 60 * 60 * 1000;
    }
    const mins = Math.floor(diff / (1000 * 60));
    return mins > 0 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : '--';
  };

  return (
    <div 
      onClick={onSelect}
      className={`p-4 sm:p-5 rounded-2xl transition-all duration-200 flex flex-col justify-between border cursor-pointer mb-3.5 bg-white ${
        isSelected 
          ? 'border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-500/20 z-10 relative' 
          : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Top Strip: Airline Logo, Name, Badges */}
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center p-1 shrink-0">
            {flight.airlineLogo ? (
              <img src={flight.airlineLogo} alt={flight.airline} className="w-full h-full object-contain" />
            ) : (
              <Plane size={16} className="text-blue-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-black text-slate-900 text-sm leading-tight">{flight.airline}</p>
              {flight.flightNumber && (
                <span className="text-[10px] text-slate-600 font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {flight.flightNumber}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Economy Class</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {flight.isSeriesFare && (
            <span 
              className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-200/90 uppercase tracking-wider shadow-2xs"
              title="Fixed Departure (FD) Series Fare - Direct Guaranteed Inventory"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Series Fare
            </span>
          )}
          {flight.segments && flight.segments.length > 1 && (
            <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase border border-purple-200">
              {flight.segments.length - 1} Stop{flight.segments.length > 2 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      
      {flight.segments && flight.segments.length > 1 ? (
        <div className="flex flex-col gap-0 w-full relative">
          {flight.segments.map((segment, idx) => {
            const segDep = parseDate(segment.departureTime);
            const segArr = parseDate(segment.arrivalTime);
            return (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <div className="flex justify-center py-2.5">
                    <div className="bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-[10px] font-bold border border-amber-200 shadow-2xs relative z-10">
                      Layover at {segment.origin}: {calculateLayover(flight.segments![idx-1].arrivalTime, segment.departureTime)}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-3 md:grid-cols-[1fr_1.5fr_1fr_1.2fr] items-center w-full gap-y-3 md:gap-y-0 relative py-1">
                  {/* Departure */}
                  <div className="text-left">
                    <p className="font-black text-lg md:text-xl text-slate-900 leading-tight">{formatTime(segDep)}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-xs font-bold text-slate-700">{segment.origin}</p>
                      {segment.departureTerminal ? (
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold border border-slate-200">
                          {segment.departureTerminal.toUpperCase().startsWith('T') ? segment.departureTerminal.toUpperCase() : `T${segment.departureTerminal}`}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">{formatDate(segDep)}</p>
                  </div>
                  
                  {/* Duration */}
                  <div className="flex flex-col items-center px-1 md:px-4">
                    <p className="text-[10px] md:text-[11px] font-bold text-slate-500 mb-1">{getDuration(segment.arrivalTime, segment.departureTime)}</p>
                    <div className="w-full relative flex items-center justify-center my-1">
                      <div className="w-full border-t border-slate-300"></div>
                      <div className="absolute w-5 h-5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
                        <Plane size={10} className="rotate-90 transform" />
                      </div>
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="text-right md:text-left md:pl-2">
                    <div className="flex items-center gap-1.5 justify-end md:justify-start">
                      <p className="font-black text-lg md:text-xl text-slate-900 leading-tight">{formatTime(segArr)}</p>
                      {((segment as any).dayChange > 0 || segArr < segDep) && (
                        <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded leading-none">
                          +{(segment as any).dayChange || 1} Day
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 md:justify-start justify-end">
                      <p className="text-xs font-bold text-slate-700">{segment.destination}</p>
                      {segment.arrivalTerminal ? (
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold border border-slate-200">
                          {segment.arrivalTerminal.toUpperCase().startsWith('T') ? segment.arrivalTerminal.toUpperCase() : `T${segment.arrivalTerminal}`}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">{formatDate(segArr)}</p>
                  </div>

                  {/* Price & Action */}
                  {idx === 0 ? (
                    <div className="col-span-3 md:col-span-1 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start">
                      {Boolean(flight.isRoundTripComboReturn) ? (
                        <div className="flex flex-col items-start md:items-end">
                          <span className="font-black text-xs md:text-sm text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Included</span>
                          <p className="text-[10px] text-slate-400 mt-0.5">Combo Return</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-start md:items-end">
                          <p className="font-black text-xl md:text-2xl text-slate-900 tracking-tight">₹{finalPrice > 0 ? finalPrice.toLocaleString('en-IN') : '--'}</p>
                          {originalPrice > 0 && finalPrice !== originalPrice && <p className="text-[10px] text-rose-500 line-through">₹{originalPrice.toLocaleString('en-IN')}</p>}
                          <p className="text-[10px] text-slate-400 font-medium mb-2">per adult</p>
                        </div>
                      )}
                      <div className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}>
                        {isSelected ? '✓ Selected' : 'Select Flight'}
                      </div>
                    </div>
                  ) : <div className="hidden md:block"></div>}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-[1fr_1.5fr_1fr_1.2fr] items-center w-full gap-y-3 md:gap-y-0 relative py-1">
          {/* Departure */}
          <div className="text-left">
            <p className="font-black text-xl md:text-2xl text-slate-900 leading-tight">{formatTime(depTime)}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-xs font-bold text-slate-700">{flight.departureAirportCode || flight.departureCity}</p>
              {flight.departureTerminal ? (
                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold border border-slate-200">
                  {flight.departureTerminal.toUpperCase().startsWith('T') ? flight.departureTerminal.toUpperCase() : `T${flight.departureTerminal}`}
                </span>
              ) : null}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">{formatDate(depTime)}</p>
          </div>
          
          {/* Duration */}
          <div className="flex flex-col items-center px-1 md:px-4">
            <p className="text-[10px] md:text-[11px] font-bold text-slate-500 mb-1">{formatDuration(flight.durationMinutes)}</p>
            <div className="w-full relative flex items-center justify-center my-1">
              <div className="w-full border-t border-slate-300"></div>
              <div className="absolute w-5 h-5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
                <Plane size={10} className="rotate-90 transform" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-1">{flight.stops === 0 ? 'Non Stop' : `${flight.stops} Stop`}</p>
          </div>

          {/* Arrival */}
          <div className="text-right md:text-left md:pl-2">
            <div className="flex items-center gap-1.5 justify-end md:justify-start">
              <p className="font-black text-xl md:text-2xl text-slate-900 leading-tight">{formatTime(arrTime)}</p>
              {((flight as any).dayChange > 0 || arrTime < depTime) && (
                <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded leading-none">
                  +{(flight as any).dayChange || 1} Day
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 md:justify-start justify-end">
              <p className="text-xs font-bold text-slate-700">{flight.arrivalAirportCode || flight.arrivalCity}</p>
              {flight.arrivalTerminal ? (
                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold border border-slate-200">
                  {flight.arrivalTerminal.toUpperCase().startsWith('T') ? flight.arrivalTerminal.toUpperCase() : `T${flight.arrivalTerminal}`}
                </span>
              ) : null}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">{formatDate(arrTime)}</p>
          </div>

          {/* Price & Action */}
          <div className="col-span-3 md:col-span-1 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start">
            {Boolean(flight.isRoundTripComboReturn) ? (
              <div className="flex flex-col items-start md:items-end">
                <span className="font-black text-xs md:text-sm text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Included</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Combo Return</p>
              </div>
            ) : (
              <div className="flex flex-col items-start md:items-end">
                <p className="font-black text-xl md:text-2xl text-slate-900 tracking-tight">₹{finalPrice > 0 ? finalPrice.toLocaleString('en-IN') : '--'}</p>
                {originalPrice > 0 && finalPrice !== originalPrice && <p className="text-[10px] text-rose-500 line-through">₹{originalPrice.toLocaleString('en-IN')}</p>}
                <p className="text-[10px] text-slate-400 font-medium mb-2">per adult</p>
              </div>
            )}
            <div className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isSelected 
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/30' 
                : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600'
            }`}>
              {isSelected ? '✓ Selected' : 'Select Flight'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



