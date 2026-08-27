import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Plane, Building2, Map, Search, Globe, Shield, CreditCard, ChevronRight, User, Briefcase, Calendar, ChevronDown, Bus, Car, Navigation, Ticket, Users, Gift, History, ArrowRightLeft, Baby, Smile, Heart, Share2, ThumbsUp } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../../store/authSlice';
import api from '../../services/api';
import LoginModal from '../../components/auth/LoginModal';
import TopNavbar from '../../components/layout/TopNavbar';
import ChatBot from '../../components/common/ChatBot';
import ScrollAirplane from '../../components/common/ScrollAirplane';


import CustomCalendar from '../../components/common/CustomCalendar';
import DualMonthCalendar from '../../components/ui/DualMonthCalendar';
import TravellerPicker from '../../components/common/TravellerPicker';
import CabinClassPicker from '../../components/common/CabinClassPicker';
import CityPicker from '../../components/common/CityPicker';
import TripTypePicker from '../../components/common/TripTypePicker';
import { format } from 'date-fns';

interface Destination {
  name: string;
  price: number;
  imgUrl: string;
}

const CITIES: Record<string, string> = {
  'DEL': 'New Delhi',
  'BOM': 'Mumbai',
  'BLR': 'Bengaluru',
  'GOI': 'Goa',
  'CCU': 'Kolkata',
  'HYD': 'Hyderabad',
  'MAA': 'Chennai',
  'DXB': 'Dubai',
  'BKK': 'Bangkok',
  'LHR': 'London'
};

export default function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  // Redirect B2B agents away from consumer landing page
  useEffect(() => {
    if (isAuthenticated && user && (user.roles?.includes('SUPPLIER_AGENT'))) {
      navigate('/b2b/home', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const formattedTab = tabParam ? tabParam.charAt(0).toUpperCase() + tabParam.slice(1).toLowerCase() : 'Flights';
  const [activeTab, setActiveTab] = useState(formattedTab);
  const [tripType, setTripType] = useState('One Way');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);



  const [searchFrom, setSearchFrom] = useState('DEL');
  const [searchTo, setSearchTo] = useState('BOM');
  const [departureDate, setDepartureDate] = useState<Date | null>(new Date());
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  
  // Pickers state
  const [activeDatePicker, setActiveDatePicker] = useState<'depart' | 'return' | null>(null);
  const [isTravellerPickerOpen, setIsTravellerPickerOpen] = useState(false);
  const [isCabinPickerOpen, setIsCabinPickerOpen] = useState(false);
  const [isBookingForOpen, setIsBookingForOpen] = useState(false);
  const [bookingFor, setBookingFor] = useState('MYSELF');
  const [isFromPickerOpen, setIsFromPickerOpen] = useState(false);
  const [isToPickerOpen, setIsToPickerOpen] = useState(false);
  const [isTripTypePickerOpen, setIsTripTypePickerOpen] = useState(false);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState('Economy/ Premium Economy');

  const [show30DaysWarning, setShow30DaysWarning] = useState(false);

  useEffect(() => {
    if (departureDate && returnDate) {
      const diffTime = returnDate.getTime() - departureDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 30) {
        setShow30DaysWarning(true);
        const timer = setTimeout(() => setShow30DaysWarning(false), 4000);
        return () => clearTimeout(timer);
      } else {
        setShow30DaysWarning(false);
      }
    }
  }, [returnDate, departureDate]);

  const closeAllPickers = () => {
    setActiveDatePicker(null);
    setIsTravellerPickerOpen(false);
    setIsCabinPickerOpen(false);
    setIsBookingForOpen(false);
    setIsFromPickerOpen(false);
    setIsToPickerOpen(false);
    setIsTripTypePickerOpen(false);
  };

  // Handle scroll for sticky nav
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Public Destinations
  useEffect(() => {
    api.get('/api/cms/destinations')
      .then((res) => setDestinations(res.data))
      .catch((err) => console.error("Error fetching destinations:", err));
  }, []);

  const getLocalISO = (d: Date | null) => {
    if (!d) return '';
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
  };

  const handleSearch = () => {
    if (activeTab === 'Hotels') {
      const query = new URLSearchParams({
        city: searchTo, // We can use 'searchTo' state as the destination city
        checkIn: getLocalISO(departureDate),
        checkOut: getLocalISO(returnDate)
      }).toString();
      navigate(`/hotels/search?${query}`);
      return;
    }

    const query = new URLSearchParams({
      tab: activeTab,
      from: searchFrom,
      to: searchTo,
      date: getLocalISO(departureDate),
      returnDate: getLocalISO(returnDate),
      tripType: tripType,
      adults: adults.toString(),
      children: children.toString(),
      infants: infants.toString(),
      cabinClass: cabinClass
    }).toString();

    navigate(`/flights/search?${query}`);
  };

  const isNavWhite = isScrolled || isHovered;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans relative">
      
      {/* Scroll Background Airplane */}
      <ScrollAirplane />

      {/* Public Navbar */}
      <TopNavbar />

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      {/* Massive Hero Section */}
      <div className={`relative pt-16 pb-20 lg:pt-20 lg:pb-24 bg-[#00224f]`}>
        
        {/* Dynamic Background Elements */}
          <div className="absolute inset-0 z-0 overflow-hidden bg-[#001f3f]">
            {/* Main Image with slow zoom effect */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-80" style={{ animation: 'zoomInOut 30s infinite alternate ease-in-out' }}></div>
            
            {/* Rich Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 via-transparent to-gray-50"></div>
            
            {/* Decorative Floating Glowing Orbs */}
            <div className="absolute top-[15%] left-[10%] w-64 h-64 bg-blue-400/20 rounded-full blur-[80px]"></div>
            <div className="absolute top-[30%] right-[10%] w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]"></div>
            
            {/* Extra inline style for the subtle zoom animation */}
            <style>{`
              @keyframes zoomInOut {
                0% { transform: scale(1); }
                100% { transform: scale(1.1); }
              }
              @keyframes fadeInUp {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </div>        {/* Search Widget Container */}
        <div className={`mx-auto w-full px-4 relative z-10 transition-all duration-300 max-w-[1250px]`} onClick={closeAllPickers}>
          
          {/* Welcome Headline */}
            <div className="text-center mb-6 lg:mb-8 animate-[fadeInUp_1s_ease-out]">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 tracking-tight drop-shadow-2xl">
                Let's Book Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Dream Vacation</span>
              </h1>
            </div>
          {/* Top Tabs Pill */}
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] flex items-center justify-start lg:justify-between px-4 lg:px-6 py-3 mx-auto relative z-20 w-[95%] lg:w-[90%] max-w-[1000px] mb-[-15px] lg:mb-[-30px] overflow-x-auto gap-6 lg:gap-2 custom-scrollbar">
            {[
              {name: 'Flights', icon: Plane}, {name: 'Hotels', icon: Building2}, {name: 'Villas & Homestays', icon: Map},
              {name: 'Holiday Packages', icon: Map}, {name: 'Trains', icon: Plane}, {name: 'Buses', icon: Bus},
              {name: 'Cabs', icon: Car}, {name: 'Forex Card', icon: CreditCard}, {name: 'Travel Insurance', icon: Shield}
            ].map(tab => (
              <button
                key={tab.name}
                className={`flex flex-col items-center gap-1 relative min-w-[70px] ${activeTab === tab.name ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                onClick={() => setActiveTab(tab.name)}
              >
                <tab.icon size={22} className={activeTab === tab.name ? 'text-blue-600' : 'text-gray-400'} />
                <span className="text-[11px] font-bold text-center leading-tight">{tab.name}</span>
                {activeTab === tab.name && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-blue-600 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.5)]"></div>
                )}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-xl pt-8 lg:pt-14 pb-12 lg:pb-8 px-4 lg:px-8 relative">
            
            {activeTab === 'Flights' ? (
              <div className="relative pb-10 md:pb-0">
                {/* Flight Types */}
                <div className="flex flex-wrap items-center gap-4 lg:gap-6 mb-4 lg:mb-6 relative">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="tripType" checked={tripType === 'One Way'} onChange={() => setTripType('One Way')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                    <span className={`text-[13px] font-bold transition-colors ${tripType === 'One Way' ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>One Way</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="tripType" checked={tripType === 'Round Trip'} onChange={() => setTripType('Round Trip')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                    <span className={`text-[13px] font-bold transition-colors ${tripType === 'Round Trip' ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>Round Trip</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="tripType" checked={tripType === 'Multi City'} onChange={() => setTripType('Multi City')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                    <span className={`text-[13px] font-bold transition-colors ${tripType === 'Multi City' ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>Multi City</span>
                  </label>
                  
                  <div className="ml-auto text-[13px] font-bold text-gray-700 hidden lg:block">
                    Book International and Domestic Flights
                  </div>
                </div>

                {/* Main Inputs Box */}
                <div className="flex flex-col lg:flex-row border border-gray-300 rounded-lg overflow-visible lg:h-[110px] relative hover:border-gray-400 transition-colors">
                  
                  {/* FROM */}
                  <div 
                    className="w-full lg:flex-1 min-w-0 p-3 px-5 border-b lg:border-b-0 lg:border-r border-gray-200 cursor-pointer hover:bg-blue-50/30 transition-colors group relative"
                    onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsFromPickerOpen(true); }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">From</span>
                    </div>
                    <div className="w-full text-2xl lg:text-[32px] leading-none font-black text-gray-900 truncate bg-transparent flex flex-col mt-1">
                      {CITIES[searchFrom] || searchFrom}
                    </div>
                    <p className="text-[12px] text-gray-500 truncate mt-1">{searchFrom}, Airport</p>
                    
                    {isFromPickerOpen && (
                      <div className="absolute top-[100%] left-0 z-50" onClick={e => e.stopPropagation()}>
                        <CityPicker value={searchFrom} onChange={(c) => { setSearchFrom(c); setIsFromPickerOpen(false); }} onClose={() => setIsFromPickerOpen(false)} title="FROM" />
                      </div>
                    )}
                    
                    {/* Swap Button */}
                    <div 
                      className="absolute right-4 lg:-right-4 top-[100%] lg:top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-[0_2px_5px_rgba(0,0,0,0.1)] flex items-center justify-center cursor-pointer hover:shadow-md transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        const temp = searchFrom;
                        setSearchFrom(searchTo);
                        setSearchTo(temp);
                      }}
                    >
                      <ArrowRightLeft size={14} className="text-blue-600 transform lg:rotate-0 rotate-90" />
                    </div>
                  </div>

                  {/* TO */}
                  <div 
                    className="w-full lg:flex-1 min-w-0 p-3 px-5 border-b lg:border-b-0 lg:border-r border-gray-200 cursor-pointer hover:bg-blue-50/30 transition-colors group relative"
                    onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsToPickerOpen(true); }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">To</span>
                    </div>
                    <div className="w-full text-2xl lg:text-[32px] leading-none font-black text-gray-900 truncate bg-transparent flex flex-col mt-1">
                      {CITIES[searchTo] || searchTo}
                    </div>
                    <p className="text-[12px] text-gray-500 truncate mt-1">{searchTo}, Airport</p>

                    {isToPickerOpen && (
                      <div className="absolute top-[100%] left-0 z-50" onClick={e => e.stopPropagation()}>
                        <CityPicker value={searchTo} onChange={(c) => { setSearchTo(c); setIsToPickerOpen(false); }} onClose={() => setIsToPickerOpen(false)} title="TO" />
                      </div>
                    )}
                  </div>

                <div className="relative flex flex-row w-full lg:w-auto">
                  <div 
                    className="flex-1 lg:w-[150px] p-3 px-3 lg:px-5 border-b lg:border-b-0 border-r border-gray-200 cursor-pointer hover:bg-blue-50/30 transition-colors group"
                    onClick={(e) => { e.stopPropagation(); closeAllPickers(); setActiveDatePicker('depart'); }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Departure</span>
                      <ChevronDown size={16} className="text-blue-600" />
                    </div>
                    {departureDate ? (
                      <>
                        <div className="flex items-baseline gap-1 mt-1">
                          <h3 className="text-3xl lg:text-[40px] leading-none font-black text-gray-900">{format(departureDate, 'd')}</h3>
                          <span className="text-xl font-bold text-gray-900">{format(departureDate, "MMM''yy")}</span>
                        </div>
                        <p className="text-[12px] text-gray-500 font-medium mt-1">{format(departureDate, 'EEEE')}</p>
                      </>
                    ) : (
                      <p className="text-sm font-bold text-gray-400 mt-3">Select Date</p>
                    )}
                  </div>

                  <div 
                    className={`flex-1 lg:w-[150px] p-3 px-3 lg:px-5 border-b lg:border-b-0 lg:border-r border-gray-200 cursor-pointer hover:bg-blue-50/30 transition-colors group relative ${tripType === 'One Way' ? 'opacity-70 hover:bg-transparent' : ''}`}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      closeAllPickers(); 
                      if (tripType === 'One Way') {
                        setTripType('Round Trip');
                      }
                      setActiveDatePicker('return'); 
                    }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Return</span>
                      <ChevronDown size={16} className="text-blue-600" />
                    </div>
                    {returnDate ? (
                      <>
                        <div className="flex items-baseline gap-1 mt-1">
                          <h3 className="text-3xl lg:text-[40px] leading-none font-black text-gray-900">{format(returnDate, 'd')}</h3>
                          <span className="text-xl font-bold text-gray-900">{format(returnDate, "MMM''yy")}</span>
                        </div>
                        <p className="text-[12px] text-gray-500 font-medium mt-1">{format(returnDate, 'EEEE')}</p>
                      </>
                    ) : (
                      <p className="text-[10px] text-gray-500 mt-2 leading-tight font-medium">Tap to add a return date for bigger discounts</p>
                    )}

                    {show30DaysWarning && (
                      <div className="absolute top-[85%] left-4 bg-[#cc7700] text-white text-[12px] px-3 py-1.5 rounded shadow-lg z-50 whitespace-nowrap animate-fade-in-up">
                        <div className="absolute -top-1 left-4 w-3 h-3 bg-[#cc7700] transform rotate-45"></div>
                        You are booking for more than 30 days
                      </div>
                    )}
                  </div>

                  {activeDatePicker === 'depart' && (
                    <div className="absolute top-[100%] left-[-100px] z-50" onClick={e => e.stopPropagation()}>
                      <CustomCalendar 
                        startDate={departureDate} 
                        endDate={null}
                        isOneWay={true}
                        onChange={(start) => { 
                          if (start) setDepartureDate(start); 
                          setActiveDatePicker(tripType === 'Round Trip' ? 'return' : null);
                        }}
                        onClose={() => setActiveDatePicker(null)}
                        origin={searchFrom}
                        destination={searchTo}
                      />
                    </div>
                  )}

                  {activeDatePicker === 'return' && (
                    <div className="absolute top-[100%] left-[-100px] z-50" onClick={e => e.stopPropagation()}>
                      <CustomCalendar 
                        startDate={returnDate} 
                        endDate={null}
                        minDate={departureDate}
                        isOneWay={true}
                        onChange={(start) => { 
                          if (start) setReturnDate(start); 
                          setActiveDatePicker(null);
                        }}
                        onClose={() => setActiveDatePicker(null)}
                        origin={searchTo}
                        destination={searchFrom}
                      />
                    </div>
                  )}
                </div>

                <div className="relative flex flex-col sm:flex-row w-full lg:w-auto">
                  {/* Travellers */}
                  <div 
                    className="w-full sm:flex-1 lg:w-[120px] p-3 px-3 lg:px-5 border-b lg:border-b-0 border-gray-200 lg:border-r cursor-pointer hover:bg-blue-50/30 transition-colors group"
                    onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsTravellerPickerOpen(!isTravellerPickerOpen); }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Travellers</span>
                      <ChevronDown size={16} className="text-blue-600" />
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <h3 className="text-3xl lg:text-[40px] leading-none font-black text-gray-900">{adults + children + infants}</h3>
                    </div>
                    <p className="text-[12px] text-gray-700 font-bold mt-1 flex items-center gap-2.5">
                      <span className="flex items-center gap-0.5" title="Adults"><User size={14} className="text-gray-900" /> {adults}</span>
                      <span className="flex items-center gap-0.5" title="Children"><Smile size={14} className="text-gray-900" /> {children}</span>
                      <span className="flex items-center gap-0.5" title="Infants"><Baby size={14} className="text-gray-900" /> {infants}</span>
                    </p>
                  </div>

                  {isTravellerPickerOpen && (
                    <div className="absolute top-[100%] right-0 z-50" onClick={e => e.stopPropagation()}>
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
                  
                  {/* Cabin Class */}
                  <div 
                    className="w-full sm:flex-1 lg:w-[170px] p-3 px-3 lg:px-5 border-b lg:border-b-0 cursor-pointer hover:bg-blue-50/30 transition-colors group"
                    onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsCabinPickerOpen(!isCabinPickerOpen); }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Cabin Class</span>
                      <ChevronDown size={16} className="text-blue-600" />
                    </div>
                    <p className="text-[15px] font-black text-gray-900 mt-2 leading-tight truncate" title={cabinClass}>
                      {cabinClass}
                    </p>
                  </div>
                  {isCabinPickerOpen && (
                    <div className="absolute top-[100%] right-0 z-50" onClick={e => e.stopPropagation()}>
                      <CabinClassPicker cabinClass={cabinClass} onChange={(c) => { setCabinClass(c); setIsCabinPickerOpen(false); }} />
                    </div>
                  )}
                </div>

                {user?.roles?.includes('B2B_AGENT') && (
                  <div className="relative flex flex-col sm:flex-row w-full lg:w-[150px] border-t md:border-t-0 md:border-l border-gray-200">
                    <div 
                      className="w-full sm:flex-1 p-3 px-5 cursor-pointer hover:bg-orange-50/30 transition-colors group"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeAllPickers();
                        setIsBookingForOpen(!isBookingForOpen);
                      }}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-sm font-bold text-gray-500 group-hover:text-orange-500 transition-colors">Booking For</span>
                        <ChevronDown size={16} className="text-orange-500" />
                      </div>
                      <p className="text-[13px] font-black text-gray-900 mt-2 leading-tight truncate">
                        {bookingFor === 'MYSELF' ? user.name : bookingFor === 'Others' ? 'Others' : bookingFor}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">
                        {bookingFor === 'MYSELF' ? user.email : bookingFor === 'Others' ? 'Guests, Interviewee, etc' : 'prerna.jha@mbp.in'}
                      </p>
                    </div>

                    {isBookingForOpen && (
                      <div className="absolute top-[100%] right-0 z-50 w-[300px] bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden py-2 mt-2 animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="px-4 py-3 bg-blue-50/50 border-b border-gray-100">
                          <input type="text" placeholder="Primary Traveller's Email ID" className="w-full bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs outline-none focus:border-blue-400" />
                          <p className="text-[10px] text-gray-500 mt-2">Enter Primary Traveller Email ID for whom you are making the booking.</p>
                        </div>
                        
                        <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                          {/* MYSELF */}
                          <div 
                            className={`px-4 py-3 cursor-pointer transition-colors ${bookingFor === 'MYSELF' ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                            onClick={() => { setBookingFor('MYSELF'); setIsBookingForOpen(false); }}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                              <span className="font-bold text-sm text-gray-900">{user.name}</span>
                              <span className="text-[9px] font-bold text-orange-500 bg-orange-100 px-1.5 py-0.5 rounded">MYSELF</span>
                            </div>
                            <p className="text-xs text-gray-500 ml-3">{user.email}</p>
                          </div>

                          {/* Others */}
                          <div 
                            className={`px-4 py-3 cursor-pointer transition-colors ${bookingFor === 'Others' ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                            onClick={() => { setBookingFor('Others'); setIsBookingForOpen(false); }}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                              <span className="font-bold text-sm text-gray-900">Others</span>
                            </div>
                            <p className="text-xs text-gray-500 ml-3">Guests, Interviewee, etc</p>
                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                )}

                </div>



                {/* Flight Tracker Button - Hidden on mobile to save space for Search button */}
                <div className="mt-5 hidden md:block">
                   <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition">
                     <Ticket size={16} className="text-blue-600" />
                     <span className="text-[13px] font-bold text-gray-800">Flight Tracker</span>
                   </button>
                </div>

                {/* Massive Search Button Overlapping Bottom for Flights */}
                <div className="absolute -bottom-5 md:-bottom-6 left-1/2 -translate-x-1/2 z-20 w-[90%] sm:w-auto">
                  <button onClick={handleSearch} className={`w-full sm:w-auto px-6 md:px-12 py-2.5 md:py-3 rounded-full text-white font-black text-base md:text-xl shadow-[0_8px_20px_rgba(37,99,235,0.4)] transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-[0_10px_25px_rgba(37,99,235,0.5)]`}>
                    SEARCH FLIGHTS
                  </button>
                </div>

              </div>
            ) : activeTab === 'Hotels' ? (
              <div className="relative pb-10 md:pb-0">
                {/* Hotel Search Inputs */}
                <div className="flex flex-col md:flex-row border border-gray-300 rounded-lg overflow-visible md:h-[110px] relative hover:border-gray-400 transition-colors">
                  
                  {/* Destination */}
                  <div 
                    className="w-full md:flex-[2] p-3 px-5 border-b md:border-b-0 md:border-r border-gray-200 cursor-pointer hover:bg-blue-50/30 transition-colors group relative"
                    onClick={() => { closeAllPickers(); setIsToPickerOpen(true); }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">City, Property name or Location</span>
                    </div>
                    <div className="w-full text-3xl font-black text-gray-900 truncate bg-transparent flex flex-col mt-2">
                      {searchTo}
                    </div>
                    
                    {isToPickerOpen && (
                      <div className="absolute top-[100%] left-0 z-50">
                        <CityPicker value={searchTo} onChange={(c) => { setSearchTo(c); setIsToPickerOpen(false); }} onClose={() => setIsToPickerOpen(false)} title="DESTINATION" type="hotel" />
                      </div>
                    )}
                  </div>

                  {/* Check-In */}
                  <div 
                    className="w-full md:flex-1 p-3 px-5 border-b md:border-b-0 md:border-r border-gray-200 cursor-pointer hover:bg-blue-50/30 transition-colors group"
                    onClick={() => { setActiveDatePicker('depart'); }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Check-In</span>
                      <ChevronDown size={16} className="text-blue-600" />
                    </div>
                    {departureDate ? (
                      <>
                        <div className="flex items-baseline gap-1 mt-1">
                          <h3 className="text-3xl font-black text-gray-900">{format(departureDate, 'd')}</h3>
                          <span className="text-xl font-bold text-gray-900">{format(departureDate, "MMM''yy")}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium mt-1">{format(departureDate, 'EEEE')}</p>
                      </>
                    ) : (
                      <p className="text-sm font-bold text-gray-400 mt-3">Select Date</p>
                    )}
                  </div>

                  {/* Check-Out */}
                  <div 
                    className="w-full md:flex-1 p-3 px-5 border-b md:border-b-0 md:border-r border-gray-200 cursor-pointer hover:bg-blue-50/30 transition-colors group relative"
                    onClick={() => { setActiveDatePicker('return'); }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Check-Out</span>
                      <ChevronDown size={16} className="text-blue-600" />
                    </div>
                    {returnDate ? (
                      <>
                        <div className="flex items-baseline gap-1 mt-1">
                          <h3 className="text-3xl font-black text-gray-900">{format(returnDate, 'd')}</h3>
                          <span className="text-xl font-bold text-gray-900">{format(returnDate, "MMM''yy")}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium mt-1">{format(returnDate, 'EEEE')}</p>
                      </>
                    ) : (
                      <p className="text-[10px] text-gray-500 mt-2 leading-tight font-medium">Select checkout date</p>
                    )}

                    {(activeDatePicker === 'depart' || activeDatePicker === 'return') && (
                      <div className="absolute top-[100%] left-[-200px] z-50">
                        <DualMonthCalendar 
                          checkIn={departureDate} 
                          checkOut={returnDate}
                          onDateChange={(type, date) => {
                            if (type === 'checkIn') {
                              setDepartureDate(date);
                              setActiveDatePicker('return');
                            } else {
                              setReturnDate(date);
                              setActiveDatePicker(null);
                            }
                          }}
                          onClose={() => setActiveDatePicker(null)}
                          origin={searchFrom}
                          destination={searchTo}
                        />
                      </div>
                    )}
                  </div>

                  {/* Rooms & Guests */}
                  <div 
                    className="w-full md:flex-1 p-3 px-5 cursor-pointer hover:bg-blue-50/30 transition-colors group"
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Rooms & Guests</span>
                      <ChevronDown size={16} className="text-blue-600" />
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <h3 className="text-2xl font-black text-gray-900">1</h3>
                      <span className="text-lg font-bold text-gray-900">Room, </span>
                      <h3 className="text-2xl font-black text-gray-900">2</h3>
                      <span className="text-lg font-bold text-gray-900">Adults</span>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
                 <div className="w-24 h-24 mb-6 bg-blue-50 rounded-full flex items-center justify-center">
                    <Building2 className="text-blue-300" size={48} />
                 </div>
                 <h2 className="text-3xl font-black text-gray-900 mb-2">{activeTab} is Coming Soon!</h2>
                 <p className="text-lg text-gray-500 font-medium max-w-md mx-auto">We are currently building this module. It will be available in the next phase of TrippeChalo.</p>
              </div>
            )}

            {/* Massive Search Button Overlapping Bottom for Hotels */}
            {activeTab === 'Hotels' && (
                <div className="absolute -bottom-5 md:-bottom-6 left-1/2 -translate-x-1/2 z-20 w-[90%] sm:w-auto">
                  <button onClick={handleSearch} className={`w-full sm:w-auto px-6 md:px-12 py-2.5 md:py-3 rounded-full text-white font-black text-base md:text-xl shadow-[0_8px_20px_rgba(37,99,235,0.4)] transition-all duration-300 hover:scale-105 ${(user?.roles?.includes('B2B_AGENT')) ? 'bg-gradient-to-r from-[#ff6d38] to-[#ff501a] hover:shadow-[0_8px_25px_rgba(255,109,56,0.5)]' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-[0_10px_25px_rgba(37,99,235,0.5)]'}`}>
                    SEARCH HOTELS
                  </button>
                </div>
            )}
          </div>
          
          {/* Explore More Strip */}
          <div className="text-center mt-12 mb-6">
            <button 
              onClick={() => {
                document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1 mx-auto text-white font-bold hover:text-blue-200 transition"
            >
              <ChevronDown size={16} /> Explore More <ChevronDown size={16} />
            </button>
          </div>

          {/* Bottom Pill Banners */}
          <div className="bg-white rounded-xl lg:rounded-full shadow-lg flex items-center justify-start lg:justify-between px-4 lg:px-8 py-3 mx-auto w-[95%] lg:max-w-[1100px] gap-6 text-sm overflow-x-auto hidden-scrollbar">
            <div className="flex items-center gap-2 border-r border-gray-200 pr-6 shrink-0 cursor-pointer hover:bg-gray-50 py-1 rounded-l-full">
              <Globe size={20} className="text-blue-600" />
              <span className="font-bold text-gray-700">Where2Go</span>
            </div>
            <div className="flex items-center gap-2 border-r border-gray-200 pr-6 shrink-0 cursor-pointer hover:bg-gray-50 py-1">
              <Shield size={20} className="text-blue-600" />
              <div>
                <span className="font-bold text-gray-700">Insurance</span>
                <p className="text-[10px] text-gray-500">For International Trips</p>
              </div>
            </div>
            <div className="flex items-center gap-2 border-r border-gray-200 pr-6 shrink-0 cursor-pointer hover:bg-gray-50 py-1">
              <Plane size={20} className="text-blue-600" />
              <div>
                <span className="font-bold text-gray-700">Explore International Flights</span>
                <p className="text-[10px] text-gray-500">Cheapest Flights to Paris, Bali, Tokyo & more</p>
              </div>
            </div>
            <div className="flex items-center gap-2 border-r border-gray-200 pr-6 shrink-0 cursor-pointer hover:bg-gray-50 py-1">
              <Users size={20} className="text-blue-600" />
              <div>
                <span className="font-bold text-gray-700">MICE</span>
                <p className="text-[10px] text-gray-500">Offsites, Events & Meetings</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 cursor-pointer hover:bg-gray-50 py-1 rounded-r-full pr-2">
              <Gift size={20} className="text-blue-600" />
              <span className="font-bold text-gray-700">Gift Cards</span>
            </div>
          </div>

        </div>
      </div>

      {/* Popular Destinations Section with Enhanced Background */}
      <div id="destinations" className="relative bg-[#f9f8ff] py-24 w-full overflow-hidden border-y border-gray-100">
        
        {/* Decorative Dotted Path SVG in Background */}
        <svg className="absolute inset-0 w-full h-full text-[#e2d5f8] pointer-events-none z-0" preserveAspectRatio="none" viewBox="0 0 1000 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-100,150 Q 200,300 500,150 T 1100,150" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
        </svg>

        {/* Floating Decorative Badges in BG */}
        <div className="absolute top-[10%] right-[10%] z-0 flex flex-col items-center gap-1 opacity-60" style={{ animation: 'bounce 4s infinite ease-in-out' }}>
          <div className="bg-white rounded-full p-2.5 shadow-lg">
            <Heart size={20} className="text-[#ff5c5c] fill-[#ff5c5c]" />
          </div>
        </div>
        <div className="absolute top-[40%] left-[5%] z-0 flex flex-col items-center gap-1 opacity-60" style={{ animation: 'bounce 5s infinite ease-in-out', animationDelay: '1s' }}>
           <div className="bg-white rounded-full p-2 shadow-lg flex items-center justify-center">
             <Share2 size={16} className="text-[#4f80ff]" />
           </div>
        </div>
        <div className="absolute bottom-[20%] right-[5%] z-0 flex flex-col items-center gap-1 opacity-60" style={{ animation: 'bounce 4.5s infinite ease-in-out', animationDelay: '2s' }}>
           <div className="bg-white rounded-full p-2 shadow-lg flex items-center justify-center">
             <ThumbsUp size={16} className="text-[#10b981]" />
           </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-2">Popular Destinations</h2>
              <p className="text-gray-500 font-medium">Explore our highly rated tour packages and places.</p>
            </div>
            <button onClick={() => setIsLoginModalOpen(true)} className="hidden md:flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 transition">
              See all <ChevronRight size={18} />
            </button>
          </div>

          {destinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {destinations.map((dest, index) => {
                const rotation = index % 2 === 0 ? 'hover:rotate-2' : 'hover:-rotate-2';
                return (
                  <div 
                    key={dest.name} 
                    onClick={() => setIsLoginModalOpen(true)}
                    className={`relative z-20 group cursor-pointer rounded-xl bg-white p-3 pb-8 shadow-[0_10px_40px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-500 transform hover:-translate-y-2 ${rotation} flex flex-col`}
                  >
                    <div className="h-48 overflow-hidden relative rounded-lg">
                      <img 
                        src={dest.imgUrl} 
                        alt={dest.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                      <h3 className="absolute bottom-4 left-4 text-white text-xl font-black tracking-wide">{dest.name}</h3>
                    </div>
                    <div className="pt-4 px-1 flex justify-between items-center">
                      <p className="text-gray-500 text-sm font-medium">Starting from</p>
                      <p className="text-lg font-black text-blue-600">₹{dest.price.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex gap-6 overflow-hidden opacity-50">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-64 w-full bg-white animate-pulse rounded-2xl p-3 pb-8"></div>)}
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Why Book With TrippeChalo?</h2>
            <p className="text-gray-500">We provide the best booking experience for travelers and agents globally.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center relative z-20">
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-20 h-20 bg-blue-50/50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:bg-blue-100 transition-colors group-hover:scale-110 duration-300">
                <Globe size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Global Coverage</h3>
              <p className="text-gray-500 leading-relaxed">Access to millions of flights and hotels worldwide at your fingertips.</p>
            </div>
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-20 h-20 bg-green-50/50 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:bg-green-100 transition-colors group-hover:scale-110 duration-300">
                <CreditCard size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Best Price Guarantee</h3>
              <p className="text-gray-500 leading-relaxed">We match prices. Find a lower price online and we will refund the difference.</p>
            </div>
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-20 h-20 bg-purple-50/50 text-purple-600 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:bg-purple-100 transition-colors group-hover:scale-110 duration-300">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Secure Booking</h3>
              <p className="text-gray-500 leading-relaxed">Your data and payments are protected with enterprise-grade security.</p>
            </div>
          </div>
        </div>
      </div>


      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 pt-16 pb-12 text-sm relative">
        {/* Sleek Runway Strip */}
        <div id="runway-strip" className="absolute top-0 left-0 w-full h-8 bg-[#111827] border-y border-gray-800/50 flex items-center overflow-hidden">
          <div className="w-[150%] h-1 border-t-[3px] border-dashed border-gray-600/40 -ml-10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 mt-2 relative z-10">

          <div className="order-last md:order-first mt-8 md:mt-0">
            <div className="flex items-center gap-2 mb-6">
              <Plane id="footer-plane-icon" size={24} className="text-blue-500 opacity-0" />
              <span className="text-xl font-black tracking-tight">TrippeChalo</span>
            </div>
            <p className="mb-4 text-gray-500">The world's leading travel booking platform for users and agents.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              <li><span className="text-gray-400 font-medium">TrippeChalo India Pvt Ltd</span></li>
              <li><a href="mailto:trippechaloindia@gmail.com" className="hover:text-white transition">trippechaloindia@gmail.com</a></li>
              <li><a href="tel:9555934205" className="hover:text-white transition">+91 9555934205</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition">Book Flights</button></li>
              {isAuthenticated && !user?.roles?.includes('B2B_AGENT') && (
                <>
                  <li><Link to="/dashboard/profile" className="hover:text-white transition">My Profile</Link></li>
                  <li><Link to="/dashboard/wallet" className="hover:text-white transition">My Wallet</Link></li>
                </>
              )}
              {isAuthenticated && user?.roles?.includes('B2B_AGENT') && (
                <>
                  <li><Link to="/b2b/home" className="hover:text-white transition">Agent Portal</Link></li>
                  <li><Link to="/b2b/profile" className="hover:text-white transition">Agent Profile</Link></li>
                  <li><Link to="/b2b/dashboard/wallet" className="hover:text-white transition">Agent Wallet</Link></li>
                </>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2">
              <li><span className="text-gray-400 leading-relaxed block mb-2">For refunds, cancellations or queries, reach out to our 24/7 support or chat with TrippeChalo AI.</span></li>
              <li><a href="mailto:trippechaloindia@gmail.com" className="text-blue-500 hover:text-blue-400 transition">Email Support</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} TrippeChalo India Pvt Ltd. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* AI Chat Bot */}
      <ChatBot />
    </div>
  );
}
