import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { ChevronDown, Check, Plane, Building2, User, ArrowLeft } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '../../store/authSlice';
import CustomCalendar from '../../components/common/CustomCalendar';
import TravellerPicker from '../../components/common/TravellerPicker';
import CabinClassPicker from '../../components/common/CabinClassPicker';
import CityPicker from '../../components/common/CityPicker';
import TripTypePicker from '../../components/common/TripTypePicker';
import LoginModal from '../../components/auth/LoginModal';
import toast from 'react-hot-toast';
import { useFlightSearch } from '../../hooks/useFlightSearch';
import AgentFlightSearchResults from './AgentFlightSearchResults';

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

  // Calendar Prices State
  const [calendarPrices, setCalendarPrices] = useState<Record<string, number>>({});
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
    <div className="min-h-screen bg-[#f2f2f2] font-sans pb-32" onClick={closeAllPickers}>
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
              <span className="text-xl font-black tracking-tight text-gray-900">
                Trippe<span className="text-blue-600">Chalo</span>
              </span>
            </Link>

          </div>
          
          <div className="flex items-center gap-8 mr-12">
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
              <button className="flex items-center gap-2 cursor-pointer bg-blue-50/50 px-3 py-1.5 rounded-full border border-blue-100 hover:bg-blue-50 transition">
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
                <span className="text-xs font-bold text-gray-800">Hi, {user.name?.split(' ')[0] || 'User'}</span>
                <ChevronDown size={14} className="text-blue-600" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 hidden group-hover:block z-50">
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
                  <button onClick={() => { navigate('/'); dispatch(logout()); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1">Logout</button>
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

        {/* Search Bar Row */}
        <div className="max-w-[1200px] mx-auto py-2 relative">
          <div className="flex items-center gap-2">
            
            <div 
              className="flex flex-col bg-gray-50 border border-gray-300 rounded px-3 py-1 cursor-pointer hover:bg-gray-100 w-32"
              onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsTripTypePickerOpen(true); }}
            >
              <span className="text-[10px] text-gray-500 font-bold uppercase">Trip Type</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">{tripType}</span>
                <ChevronDown size={14} className="text-gray-500" />
              </div>
            </div>

            <div 
              className="flex flex-col bg-gray-50 border border-gray-300 rounded px-3 py-1 cursor-pointer hover:bg-gray-100 flex-1"
              onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsFromPickerOpen(true); }}
            >
              <span className="text-[10px] text-gray-500 font-bold uppercase">From</span>
              <span className="text-sm font-bold text-gray-900 truncate">{getCityName(from)}</span>
            </div>

            <div 
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm z-10 -mx-4 cursor-pointer text-blue-500 hover:shadow-md transition"
              onClick={(e) => { e.stopPropagation(); const temp = from; setFrom(to); setTo(temp); }}
            >
              <span className="text-xs font-bold">⇄</span>
            </div>

            <div 
              className="flex flex-col bg-gray-50 border border-gray-300 rounded px-3 py-1 cursor-pointer hover:bg-gray-100 flex-1 pl-6"
              onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsToPickerOpen(true); }}
            >
              <span className="text-[10px] text-gray-500 font-bold uppercase">To</span>
              <span className="text-sm font-bold text-gray-900 truncate">{getCityName(to)}</span>
            </div>

            <div 
              className="flex flex-col bg-gray-50 border border-gray-300 rounded px-3 py-1 cursor-pointer hover:bg-gray-100 w-32"
              onClick={(e) => { e.stopPropagation(); closeAllPickers(); setActiveDatePicker('depart'); }}
            >
              <span className="text-[10px] text-gray-500 font-bold uppercase">Depart</span>
              <span className="text-sm font-bold text-gray-900 truncate">{formatDate(date)}</span>
            </div>

            <div 
              className={`flex flex-col bg-gray-50 border border-gray-300 rounded px-3 py-1 cursor-pointer hover:bg-gray-100 w-32 relative ${tripType === 'One Way' ? 'opacity-50' : ''}`}
              onClick={(e) => { e.stopPropagation(); if (tripType !== 'Round Trip') setTripType('Round Trip'); closeAllPickers(); setActiveDatePicker('return'); }}
            >
              <span className="text-[10px] text-gray-500 font-bold uppercase">Return</span>
              <span className="text-sm font-bold text-gray-900 truncate">{tripType === 'Round Trip' ? formatDate(returnDate) : 'Tap to add'}</span>
              {tripType === 'Round Trip' && (
                <span className="absolute top-1 right-2 text-gray-400 text-xs hover:text-gray-900" onClick={(e) => { e.stopPropagation(); setTripType('One Way'); }}>×</span>
              )}
            </div>

            <div 
              className="flex flex-col bg-gray-50 border border-gray-300 rounded px-3 py-1 cursor-pointer hover:bg-gray-100 w-28"
              onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsTravellerPickerOpen(true); }}
            >
              <span className="text-[10px] text-gray-500 font-bold uppercase">Travellers</span>
              <span className="text-sm font-bold text-gray-900 truncate">{adults + children + infants} Traveller</span>
            </div>

            <div 
              className="flex flex-col bg-gray-50 border border-gray-300 rounded px-3 py-1 cursor-pointer hover:bg-gray-100 w-32"
              onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsCabinPickerOpen(true); }}
            >
              <span className="text-[10px] text-gray-500 font-bold uppercase">Cabin Class</span>
              <span className="text-sm font-bold text-gray-900 truncate">{cabinClass.split('/')[0]}</span>
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); handleSearch(); }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-full cursor-pointer transition-colors"
            >
              SEARCH
            </button>
          </div>

          {/* Absolute Positioned Pickers */}
          {isTripTypePickerOpen && (
            <div className="absolute top-[60px] left-0 z-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 rounded-xl overflow-hidden bg-white">
              <TripTypePicker value={tripType} onChange={setTripType} onClose={() => setIsTripTypePickerOpen(false)} />
            </div>
          )}

          {isFromPickerOpen && (
            <div className="absolute top-[60px] left-[15%] z-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 rounded-xl overflow-hidden bg-white">
              <CityPicker value={from} onChange={setFrom} onClose={() => setIsFromPickerOpen(false)} title="FROM" />
            </div>
          )}

          {isToPickerOpen && (
            <div className="absolute top-[60px] left-[35%] z-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 rounded-xl overflow-hidden bg-white">
              <CityPicker value={to} onChange={setTo} onClose={() => setIsToPickerOpen(false)} title="TO" />
            </div>
          )}

          {activeDatePicker === 'depart' && (
            <div className="absolute top-[60px] left-[30%] z-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 rounded-xl overflow-hidden bg-white" onClick={e => e.stopPropagation()}>
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
            <div className="absolute top-[60px] left-[40%] z-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 rounded-xl overflow-hidden bg-white" onClick={e => e.stopPropagation()}>
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
            <div className="absolute top-[60px] right-[10%] z-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 rounded-xl overflow-hidden bg-white">
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
            <div className="absolute top-[60px] right-[5%] z-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 rounded-xl overflow-hidden bg-white">
              <CabinClassPicker 
                cabinClass={cabinClass}
                onChange={(c) => { setCabinClass(c); setIsCabinPickerOpen(false); }}
              />
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="w-full flex flex-col items-center justify-center py-32 bg-[#f2f2f2] min-h-[600px]">
          <div className="relative mb-6 flex items-center">
            <div className="flex gap-2 mr-2">
               <div className="w-4 h-[3px] bg-gray-300 rounded animate-pulse" style={{ animationDelay: '0ms' }}></div>
               <div className="w-8 h-[3px] bg-gray-300 rounded animate-pulse" style={{ animationDelay: '150ms' }}></div>
               <div className="w-6 h-[3px] bg-gray-300 rounded animate-pulse" style={{ animationDelay: '300ms' }}></div>
            </div>
            <Plane size={64} className="text-gray-700" strokeWidth={1.5} fill="white" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mt-2">Hold on, we're fetching flights for you</h2>
        </div>
      ) : (
        <div className="max-w-[1000px] mx-auto py-6 w-full">
          {/* Main Content - Flight Results */}
          <div className="w-full">
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              Flights from {getCityName(from)} to {getCityName(to)}{tripType === 'Round Trip' ? ', and back' : ''}
            </h2>
            {(nonStopFilter || morningFilter) && (
              <div className="bg-white p-3 rounded shadow-sm border border-gray-200 mb-4 flex items-center gap-4">
                <h3 className="font-bold text-gray-900 text-sm">Applied Filters:</h3>
                <div className="flex flex-wrap gap-2 flex-1">
                  {nonStopFilter && (
                    <div className="bg-gray-100 px-2 py-1 rounded text-xs flex items-center gap-1 text-gray-700">
                      Non Stop <span className="text-gray-400 cursor-pointer hover:text-red-500" onClick={() => setNonStopFilter(false)}>�</span>
                    </div>
                  )}
                  {morningFilter && (
                    <div className="bg-gray-100 px-2 py-1 rounded text-xs flex items-center gap-1 text-gray-700">
                      Morning Dep. <span className="text-gray-400 cursor-pointer hover:text-red-500" onClick={() => setMorningFilter(false)}>�</span>
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
                <div className="flex bg-white shadow-sm border border-gray-200 rounded mb-4 overflow-hidden h-[60px]">
                  <div onClick={() => setSliderOffset(prev => prev - 1)} className="w-10 flex items-center justify-center border-r border-gray-100 text-blue-500 font-black text-xl cursor-pointer hover:bg-gray-50 bg-white">{'<'}</div>
                  <div className="flex flex-1 divide-x divide-gray-100 text-center text-sm overflow-hidden">
                    {[...Array(7)].map((_, i) => {
                      const d = new Date(date);
                      d.setDate(d.getDate() - 3 + i + sliderOffset);
                      const isSelected = d.toDateString() === new Date(date).toDateString();

                      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                      const priceForDate = calendarPrices[dStr];
                      
                      let displayPriceStr = '--';
                      if (isSelected && cheapestFlight) {
                         displayPriceStr = `₹ ${getDisplayPrice(cheapestFlight.price).toLocaleString('en-IN')}`;
                      } else if (priceForDate > 0) {
                         displayPriceStr = `₹ ${getDisplayPrice(priceForDate).toLocaleString('en-IN')}`;
                      } else if (priceForDate === -1) {
                         displayPriceStr = 'Available';
                      }

                      return (
                        <div 
                           key={i} 
                           onClick={() => {
                             setDate(d);
                             setSliderOffset(0);
                           }}
                           className={`flex-1 py-2 cursor-pointer ${isSelected ? 'border-b-[3px] border-blue-500 bg-blue-50/50' : 'bg-white hover:bg-gray-50'}`}
                        >
                          <p className={`font-bold text-[13px] ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                            {d.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                          <p className={`text-[11px] ${isSelected ? 'text-blue-600' : (priceForDate ? 'text-green-600' : 'text-gray-500')}`}>
                            {displayPriceStr}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <div onClick={() => setSliderOffset(prev => prev + 1)} className="w-10 flex items-center justify-center border-l border-gray-100 text-blue-500 font-black text-xl cursor-pointer hover:bg-gray-50 bg-white">{'>'}</div>
                </div>

                {/* Sorting Tabs */}
                <div className="flex gap-2 mb-4">
                  <div onClick={() => setSortBy('CHEAPEST')} className={`flex-1 bg-white border-x border-t ${sortBy === 'CHEAPEST' ? 'border-b-4 border-blue-500 shadow-md' : 'border-b border-gray-200 shadow-sm opacity-80'} rounded p-2 cursor-pointer flex items-center gap-3 transition`}>
                    <div className={`${sortBy === 'CHEAPEST' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'} w-8 h-8 rounded-full flex items-center justify-center font-black`}><span className={sortBy === 'CHEAPEST' ? '' : ''}>₹</span></div>
                    <div>
                      <p className="font-bold text-gray-900 text-[13px]">CHEAPEST</p>
                      <p className="text-gray-500 text-[11px]">{cheapestFlight ? `₹ ${getDisplayPrice(cheapestFlight.price).toLocaleString('en-IN')} | ${formatDuration(cheapestFlight.durationMinutes)}` : '--'}</p>
                    </div>
                  </div>
                  <div onClick={() => setSortBy('NON STOP FIRST')} className={`flex-1 bg-white border-x border-t ${sortBy === 'NON STOP FIRST' ? 'border-b-4 border-blue-500 shadow-md opacity-100' : 'border-b border-gray-200 shadow-sm opacity-80 bg-gray-50'} rounded p-2 cursor-pointer flex items-center gap-3 transition`}>
                    <div className={`${sortBy === 'NON STOP FIRST' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'} w-8 h-8 rounded flex items-center justify-center`}><Plane size={16} /></div>
                    <div>
                      <p className="font-bold text-gray-900 text-[13px]">NON STOP FIRST</p>
                      <p className="text-gray-500 text-[11px]">{nonStopFlight ? `₹ ${getDisplayPrice(nonStopFlight.price).toLocaleString('en-IN')} | ${formatDuration(nonStopFlight.durationMinutes)}` : '--'}</p>
                    </div>
                  </div>
                  </div>
                {/* Text showing sorted by */}
                <p className="text-sm font-bold text-gray-900 mb-2">Flights sorted by {sortBy === 'CHEAPEST' ? 'Lowest fares' : (sortBy === 'NON STOP FIRST' ? 'Fewest stops' : 'Best matches')} on this route</p>
              </>
            )}

            <div className={`grid gap-4 ${tripType === 'Round Trip' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              
              {/* Outbound Flights Column */}
              <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-3 border-b border-gray-200 bg-white">
                  <h3 className="font-bold text-gray-900 text-[15px]">{getCityName(from)} → {getCityName(to)} <span className="text-gray-500 font-normal text-sm ml-1">{new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span></h3>
                </div>
                <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr] items-center w-full px-4 py-2 bg-gray-50 border-b border-gray-200 text-[12px] text-gray-500 capitalize font-medium">
                  <div className="text-left">Departure</div>
                  <div className="text-center px-4">Duration</div>
                  <div className="text-left pl-2">Arrival</div>
                  <div className="text-right flex justify-end">
                    <span className="flex items-center gap-1 cursor-pointer text-gray-900">Price ↑</span>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {sortedOutboundFlights.length > 0 ? (
                    sortedOutboundFlights.map((flight, index) => (
                      <FlightCard 
                        key={`${flight._id}-${index}`} 
                        flight={flight} 
                        isSelected={selectedOutbound?._id === flight._id}
                        onSelect={() => setSelectedOutbound(flight)}
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
                <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900 text-[15px]">{getCityName(to)} → {getCityName(from)} <span className="text-gray-500 font-normal text-sm">{new Date(returnDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span></h3>
                  </div>
                  <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr] items-center w-full px-4 py-2 bg-gray-50 border-b border-gray-200 text-[12px] text-gray-500 capitalize font-medium">
                    <div className="text-left">Departure</div>
                    <div className="text-center px-4">Duration</div>
                    <div className="text-left pl-2">Arrival</div>
                    <div className="text-right flex justify-end">
                      <span className="flex items-center gap-1 cursor-pointer text-gray-900">Price ↑</span>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
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
              (tripType === 'Round Trip' && selectedOutbound && selectedReturn) ||
              (tripType === 'One Way' && selectedOutbound)
            ) ? createPortal(
              <div className="fixed bottom-0 left-0 w-full z-[30] pointer-events-none pb-0">
                <div className="max-w-[1000px] mx-auto flex w-full">
                  <div className="flex-1 bg-[#001736] text-white p-3 shadow-[0_-10px_30px_rgba(0,0,0,0.4)] rounded-t-lg flex items-center justify-between pointer-events-auto border-t border-blue-900">
                    
                    <div className="flex gap-4 flex-1 pl-2">
                  
                  <div className={`flex-1 flex gap-4 ${tripType === 'Round Trip' ? 'pr-6 border-r border-gray-700' : ''}`}>
                    <div>
                      <p className="text-[11px] text-gray-400 mb-2">Departure • {selectedOutbound.airline}</p>
                      <div className="flex items-center gap-3">
                        <img src={selectedOutbound.airlineLogo} alt="" className="w-6 h-6 object-contain bg-white rounded-sm p-0.5" />
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base">{new Date(selectedOutbound.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                          <span className="text-gray-500 text-xs">→</span>
                          <span className="font-bold text-base">{new Date(selectedOutbound.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-blue-400 mt-1 cursor-pointer hover:underline pl-9" onClick={() => setShowFlightDetails(selectedOutbound)}>Flight Details</p>
                    </div>
                    <div className="ml-auto flex items-center">
                      <span className="font-bold text-lg">₹ {getDisplayPrice(selectedOutbound.price).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {tripType === 'Round Trip' && selectedReturn && (
                    <div className="flex-1 flex gap-4 pr-6 border-r border-gray-700">
                      <div>
                        <p className="text-[11px] text-gray-400 mb-2">Return • {selectedReturn.airline}</p>
                        <div className="flex items-center gap-3">
                          <img src={selectedReturn.airlineLogo} alt="" className="w-6 h-6 object-contain bg-white rounded-sm p-0.5" />
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base">{new Date(selectedReturn.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                            <span className="text-gray-500 text-xs">→</span>
                            <span className="font-bold text-base">{new Date(selectedReturn.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-blue-400 mt-1 cursor-pointer hover:underline pl-9" onClick={() => setShowFlightDetails(selectedReturn)}>Flight Details</p>
                      </div>
                      <div className="ml-auto flex items-center">
                        <span className="font-bold text-lg">₹ {getDisplayPrice(selectedReturn.price).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}

                </div>
                
                <div className="flex items-center gap-6 pl-6">
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                      <p className="font-black text-[22px]">₹ {((selectedOutbound ? getDisplayPrice(selectedOutbound.price) : 0) + (tripType === 'Round Trip' && selectedReturn ? getDisplayPrice(selectedReturn.price) : 0)).toLocaleString('en-IN')}</p>
                    </div>
                    <p className="text-[10px] text-gray-400">/adult</p>
                    <p className="text-[10px] text-gray-300 mt-1 leading-tight">Flat 12% OFF using FLYMON<br/>code | Flat Rs. 585 OFF using<br/>BREAKFREE code<br/><span className="text-blue-400 cursor-pointer hover:underline" onClick={() => setShowFareSummaryModal(true)}>Fare Details</span></p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => {
                        if (!user) {
                          toast.error('Please login or signup first to book flights.');
                          setIsLoginModalOpen(true);
                        } else {
                          navigate('/flights/booking', { state: { selectedOutbound, selectedReturn, tripType, adults, children, infants } });
                        }
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-6 rounded text-sm transition"
                    >
                      BOOK NOW
                    </button>
                  </div>
                </div>
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
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {selectedOutbound?.adultPrice ? (
                      <>
                        <tr className="py-2">
                          <td className="py-3 font-bold text-gray-600">Adult Fare ({adults} x {Math.round(selectedOutbound.adultPrice * (getDisplayPrice(selectedOutbound.price) / selectedOutbound.price)).toLocaleString('en-IN')})</td>
                          <td className="py-3 text-right font-black text-gray-900">₹ {Math.round(selectedOutbound.adultPrice * adults * (getDisplayPrice(selectedOutbound.price) / selectedOutbound.price)).toLocaleString('en-IN')}</td>
                        </tr>
                        {children > 0 && selectedOutbound.childPrice ? (
                          <tr className="py-2">
                            <td className="py-3 font-bold text-gray-600">Child Fare ({children} x {Math.round(selectedOutbound.childPrice * (getDisplayPrice(selectedOutbound.price) / selectedOutbound.price)).toLocaleString('en-IN')})</td>
                            <td className="py-3 text-right font-black text-gray-900">₹ {Math.round(selectedOutbound.childPrice * children * (getDisplayPrice(selectedOutbound.price) / selectedOutbound.price)).toLocaleString('en-IN')}</td>
                          </tr>
                        ) : null}
                        {infants > 0 && selectedOutbound.infantPrice ? (
                          <tr className="py-2">
                            <td className="py-3 font-bold text-gray-600">Infant Fare ({infants} x {Math.round(selectedOutbound.infantPrice * (getDisplayPrice(selectedOutbound.price) / selectedOutbound.price)).toLocaleString('en-IN')})</td>
                            <td className="py-3 text-right font-black text-gray-900">₹ {Math.round(selectedOutbound.infantPrice * infants * (getDisplayPrice(selectedOutbound.price) / selectedOutbound.price)).toLocaleString('en-IN')}</td>
                          </tr>
                        ) : null}
                      </>
                    ) : (
                      <tr className="py-2">
                        <td className="py-3 font-bold text-gray-600">Total Pax Fare</td>
                        <td className="py-3 text-right font-black text-gray-900">₹ {getDisplayPrice(selectedOutbound?.price || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                    <tr className="bg-gray-50">
                      <td className="py-4 font-black text-gray-900 text-base">Total Amount</td>
                      <td className="py-4 text-right font-black text-blue-600 text-lg">
                        ₹ {((selectedOutbound ? getDisplayPrice(selectedOutbound.price) : 0) + (tripType === 'Round Trip' && selectedReturn ? getDisplayPrice(selectedReturn.price) : 0)).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
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
            className="bg-white rounded-xl shadow-2xl w-[600px] overflow-hidden transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-gradient-to-r from-blue-900 to-blue-800 text-white flex justify-between items-center">
              <h2 className="text-xl font-black tracking-wide">Flight Details</h2>
              <button onClick={() => setShowFlightDetails(null)} className="text-blue-200 hover:text-white transition cursor-pointer flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10">
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
            
            <div className="p-8">
              <div className="flex items-center gap-5 border-b border-gray-100 pb-6 mb-6">
                <img src={showFlightDetails.airlineLogo} alt="" className="w-12 h-12 object-contain" />
                <div>
                  <p className="font-black text-gray-900 text-xl">{showFlightDetails.airline}</p>
                  <p className="text-sm font-medium text-gray-500">{showFlightDetails.flightNumber} • {(showFlightDetails as any).cabinClass || cabinClass.split('/')[0]}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-center w-1/3">
                  <p className="text-3xl font-black text-gray-900">{new Date(showFlightDetails.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                  <p className="text-base font-bold mt-2 text-gray-800">{showFlightDetails.departureCity || 'City'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(showFlightDetails.departureTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-[10px] bg-gray-100 px-2 py-1 rounded inline-block mt-2 text-gray-600 font-bold">Terminal 1</p>
                </div>
                
                <div className="flex flex-col items-center px-4 w-1/3">
                  <p className="text-xs font-bold text-gray-500 mb-2">{Math.floor(showFlightDetails.durationMinutes / 60)}h {showFlightDetails.durationMinutes % 60}m</p>
                  <div className="w-full h-[2px] bg-gray-200 relative flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 mt-2">{showFlightDetails.stops === 0 ? 'NON STOP' : `${showFlightDetails.stops} STOP`}</p>
                </div>
                
                <div className="text-center w-1/3">
                  <p className="text-3xl font-black text-gray-900">{new Date(showFlightDetails.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                  <p className="text-base font-bold mt-2 text-gray-800">{showFlightDetails.arrivalCity || 'City'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(showFlightDetails.arrivalTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-[10px] bg-gray-100 px-2 py-1 rounded inline-block mt-2 text-gray-600 font-bold">Terminal 2</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-gray-100 text-center text-xs text-gray-500">
              Baggage: 15 Kgs Check-in, 7 Kgs Cabin
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent for Flight Card
function FlightCard({ flight, isSelected, onSelect, isRoundTrip, displayPrice }: { flight: Flight, isSelected?: boolean, onSelect?: () => void, isRoundTrip?: boolean, displayPrice?: number }) {
  const navigate = useNavigate();
  const depTime = new Date(flight.departureTime);
  const arrTime = new Date(flight.arrivalTime);
  
  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const formatDuration = (mins: number) => `${Math.floor(mins / 60)}h ${mins % 60}m`;

  return (
    <div 
      onClick={onSelect}
      className={`p-4 transition flex flex-col justify-between border ${isSelected ? 'border-[#008cff] bg-[#f4f8fe] z-10 relative' : 'border-transparent border-b-gray-200 bg-white hover:bg-gray-50'} cursor-pointer`}
    >
      <div className="flex items-center gap-2 mb-3">
        <img src={flight.airlineLogo} alt={flight.airline} className="w-5 h-5 object-contain" />
        <p className="font-bold text-gray-900 text-[13px]">{flight.airline}</p>
      </div>
      
      <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr] items-center w-full">
        {/* Departure */}
        <div className="text-left">
          <p className="font-black text-[17px] text-gray-900">{formatTime(depTime)}</p>
          <p className="text-xs text-gray-500 mt-1">{flight.departureCity}</p>
        </div>
        
        {/* Duration */}
        <div className="flex flex-col items-center px-4">
          <p className="text-[11px] text-gray-500 mb-1">{String(Math.floor(flight.durationMinutes / 60)).padStart(2, '0')} h {String(flight.durationMinutes % 60).padStart(2, '0')} m</p>
          <div className="w-full h-[2px] bg-[#249995] relative flex items-center justify-center">
            {flight.stops > 0 && <div className="w-2 h-2 rounded-full bg-[#249995]"></div>}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">{flight.stops === 0 ? 'Non stop' : `${flight.stops} stop`}</p>
        </div>

        {/* Arrival */}
        <div className="text-left pl-2">
          <p className="font-black text-[17px] text-gray-900">{formatTime(arrTime)}</p>
          <p className="text-xs text-gray-500 mt-1">{flight.arrivalCity}</p>
        </div>

        {/* Price & Action */}
        <div className="text-right flex flex-col items-end">
          <p className="font-black text-[17px] text-gray-900">₹ {(displayPrice || flight.price).toLocaleString('en-IN')}</p>
          {flight.price !== (displayPrice || flight.price) && <p className="text-[10px] text-red-500 line-through mb-1">₹ {flight.price.toLocaleString('en-IN')}</p>}
          <p className="text-[10px] text-gray-500 mb-2">/adult</p>
          <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center mt-1 ${isSelected ? 'border-[#008cff]' : 'border-gray-300 bg-white'}`}>
            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#008cff]"></div>}
          </div>
        </div>
      </div>
    </div>
  );
}



