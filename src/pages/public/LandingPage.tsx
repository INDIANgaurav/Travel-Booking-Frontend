import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Plane, Building2, Map, Search, Globe, Shield, CreditCard, ChevronRight, User, Briefcase, Calendar, ChevronDown, Bus, Car, Navigation, Ticket, Users, Gift } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../../store/authSlice';
import api from '../../services/api';
import LoginModal from '../../components/auth/LoginModal';
import TopNavbar from '../../components/layout/TopNavbar';

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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTravellerPickerOpen, setIsTravellerPickerOpen] = useState(false);
  const [isCabinPickerOpen, setIsCabinPickerOpen] = useState(false);
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
    setIsDatePickerOpen(false);
    setIsTravellerPickerOpen(false);
    setIsCabinPickerOpen(false);
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

  const handleSearch = () => {
    if (activeTab === 'Hotels') {
      const query = new URLSearchParams({
        city: searchTo, // We can use 'searchTo' state as the destination city
        checkIn: departureDate ? departureDate.toISOString() : '',
        checkOut: returnDate ? returnDate.toISOString() : ''
      }).toString();
      navigate(`/hotels/search?${query}`);
      return;
    }

    const query = new URLSearchParams({
      tab: activeTab,
      from: searchFrom,
      to: searchTo,
      date: departureDate ? departureDate.toISOString() : '',
      returnDate: returnDate ? returnDate.toISOString() : '',
      tripType: tripType
    }).toString();

    navigate(`/flights/search?${query}`);
  };

  const isNavWhite = isScrolled || isHovered;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Public Navbar (MMT Style) */}
      <TopNavbar />

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      {/* Massive Hero Section */}
      <div className="relative min-h-[650px] w-full flex flex-col items-center pt-40 pb-16">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=2000&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent"></div>
        </div>

        {/* Search Widget Container */}
        <div className="max-w-[1200px] w-full px-4 relative z-10 -mt-20" onClick={closeAllPickers}>
          
          {/* Top Tabs Pill */}
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] flex items-center justify-start lg:justify-between px-4 lg:px-6 py-3 mx-auto relative z-20 w-[95%] lg:w-[90%] max-w-[1000px] mb-[-30px] overflow-x-auto gap-6 lg:gap-2 custom-scrollbar">
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

          <div className="bg-white rounded-2xl shadow-xl pt-14 pb-8 px-8 relative" onClick={e => e.stopPropagation()}>
            
            {activeTab === 'Flights' ? (
              <div className="relative">
                {/* Flight Types */}
                <div className="flex flex-wrap items-center gap-4 lg:gap-6 mb-4 relative">
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
                    className="w-full lg:flex-1 p-3 px-5 border-b lg:border-b-0 lg:border-r border-gray-200 cursor-pointer hover:bg-blue-50/30 transition-colors group relative"
                    onClick={() => { closeAllPickers(); setIsFromPickerOpen(true); }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">From</span>
                    </div>
                    <div className="w-full text-3xl font-black text-gray-900 truncate bg-transparent flex flex-col">
                      {CITIES[searchFrom] || searchFrom}
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mt-1">{searchFrom}, Airport</p>
                    
                    {isFromPickerOpen && (
                      <div className="absolute top-[100%] left-0 z-50">
                        <CityPicker value={searchFrom} onChange={(c) => { setSearchFrom(c); setIsFromPickerOpen(false); }} onClose={() => setIsFromPickerOpen(false)} title="FROM" />
                      </div>
                    )}
                    
                    {/* Swap Button */}
                    <div className="absolute right-8 lg:-right-4 top-[100%] lg:top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-[0_2px_5px_rgba(0,0,0,0.1)] flex items-center justify-center cursor-pointer hover:shadow-md transition">
                      <Navigation size={14} className="text-blue-600 transform rotate-180 lg:rotate-90" />
                    </div>
                  </div>

                  {/* TO */}
                  <div 
                    className="w-full lg:flex-1 p-3 px-5 border-b lg:border-b-0 lg:border-r border-gray-200 cursor-pointer hover:bg-blue-50/30 transition-colors group relative"
                    onClick={() => { closeAllPickers(); setIsToPickerOpen(true); }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">To</span>
                    </div>
                    <div className="w-full text-3xl font-black text-gray-900 truncate bg-transparent flex flex-col">
                      {CITIES[searchTo] || searchTo}
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mt-1">{searchTo}, Airport</p>

                    {isToPickerOpen && (
                      <div className="absolute top-[100%] left-0 z-50">
                        <CityPicker value={searchTo} onChange={(c) => { setSearchTo(c); setIsToPickerOpen(false); }} onClose={() => setIsToPickerOpen(false)} title="TO" />
                      </div>
                    )}
                  </div>

                <div className="relative flex flex-col sm:flex-row w-full lg:w-auto">
                  <div 
                    className="w-full sm:flex-1 lg:w-[150px] p-3 px-5 border-b sm:border-b-0 sm:border-r border-gray-200 cursor-pointer hover:bg-blue-50/30 transition-colors group"
                    onClick={() => { setIsDatePickerOpen(true); setIsTravellerPickerOpen(false); setIsCabinPickerOpen(false); }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Departure</span>
                      <ChevronDown size={16} className="text-blue-600" />
                    </div>
                    {departureDate ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <h3 className="text-3xl font-black text-gray-900">{format(departureDate, 'd')}</h3>
                          <span className="text-xl font-bold text-gray-900">{format(departureDate, "MMM''yy")}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium mt-1">{format(departureDate, 'EEEE')}</p>
                      </>
                    ) : (
                      <p className="text-sm font-bold text-gray-400 mt-3">Select Date</p>
                    )}
                  </div>

                  <div 
                    className="w-full sm:flex-1 lg:w-[150px] p-3 px-5 border-b lg:border-b-0 lg:border-r border-gray-200 cursor-pointer hover:bg-blue-50/30 transition-colors group relative"
                    onClick={() => { setIsDatePickerOpen(true); setIsTravellerPickerOpen(false); setIsCabinPickerOpen(false); }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Return</span>
                      <ChevronDown size={16} className="text-blue-600" />
                    </div>
                    {returnDate ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <h3 className="text-3xl font-black text-gray-900">{format(returnDate, 'd')}</h3>
                          <span className="text-xl font-bold text-gray-900">{format(returnDate, "MMM''yy")}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium mt-1">{format(returnDate, 'EEEE')}</p>
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

                  {isDatePickerOpen && (
                    <div className="absolute top-[100%] left-[-100px] z-50">
                      <CustomCalendar 
                        startDate={departureDate} 
                        endDate={returnDate}
                        isOneWay={tripType === 'One Way'}
                        onChange={(start, end) => { setDepartureDate(start); setReturnDate(end); }}
                        onClose={() => setIsDatePickerOpen(false)}
                      />
                    </div>
                  )}
                </div>

                <div className="relative flex flex-col sm:flex-row w-full lg:w-auto">
                  <div 
                    className="w-full sm:flex-1 lg:w-[120px] p-3 px-5 border-b sm:border-b-0 sm:border-r border-gray-200 cursor-pointer hover:bg-blue-50/30 transition-colors group"
                    onClick={() => { setIsTravellerPickerOpen(!isTravellerPickerOpen); setIsDatePickerOpen(false); setIsCabinPickerOpen(false); }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Travellers</span>
                      <ChevronDown size={16} className="text-blue-600" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <h3 className="text-3xl font-black text-gray-900">{adults + children + infants}</h3>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium mt-1 flex gap-1">
                      👤 {adults} 👶 {children} 🍼 {infants}
                    </p>
                  </div>

                  {isTravellerPickerOpen && (
                    <div className="absolute top-[100%] right-0 z-50">
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
                </div>

                <div className="relative flex flex-col sm:flex-row w-full lg:w-auto">
                  <div 
                    className="w-full sm:flex-1 lg:w-[150px] p-3 px-5 cursor-pointer hover:bg-blue-50/30 transition-colors group"
                    onClick={() => { setIsCabinPickerOpen(!isCabinPickerOpen); setIsDatePickerOpen(false); setIsTravellerPickerOpen(false); }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Cabin Class</span>
                      <ChevronDown size={16} className="text-blue-600" />
                    </div>
                    <p className="text-[13px] font-black text-gray-900 mt-2 leading-tight">
                      {cabinClass}
                    </p>
                  </div>
                  {isCabinPickerOpen && (
                    <div className="absolute top-[100%] right-0 z-50">
                      <CabinClassPicker cabinClass={cabinClass} onChange={(c) => { setCabinClass(c); setIsCabinPickerOpen(false); }} />
                    </div>
                  )}
                </div>

                </div>

                {/* Special Fares Section */}
                <div className="mt-5 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-2">
                  <span className="text-[11px] font-black text-gray-900 tracking-wide md:w-[80px]">SPECIAL<br className="hidden md:block"/>FARES</span>
                  <div className="flex items-center gap-2 flex-1 overflow-x-auto pb-2 custom-scrollbar w-full">
                    
                    <button className="flex flex-col items-center justify-center border border-blue-200 bg-blue-50 text-blue-600 rounded-lg px-3 py-1 min-w-[90px]">
                      <span className="text-[13px] font-bold">Regular</span>
                      <span className="text-[10px] text-blue-500">Regular fares</span>
                    </button>
                    <button className="flex flex-col items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg px-3 py-1 min-w-[90px]">
                      <span className="text-[13px] font-bold">Student</span>
                      <span className="text-[10px] text-gray-500">Extra discounts</span>
                    </button>
                    <button className="flex flex-col items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg px-3 py-1 min-w-[90px]">
                      <span className="text-[13px] font-bold">Armed Forces</span>
                      <span className="text-[10px] text-gray-500">Up to ₹600 off</span>
                    </button>
                    <button className="flex flex-col items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg px-3 py-1 min-w-[100px]">
                      <div className="flex items-center gap-1">
                        <span className="text-[13px] font-bold">Have a GST number?</span>
                        <span className="text-[9px] font-black bg-pink-600 text-white px-1 rounded uppercase">New</span>
                      </div>
                      <span className="text-[10px] text-gray-500">Upto 10% Extra Savings!</span>
                    </button>
                    <button className="flex flex-col items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg px-3 py-1 min-w-[90px]">
                      <span className="text-[13px] font-bold">Senior Citizen</span>
                      <span className="text-[10px] text-gray-500">Up to ₹600 off</span>
                    </button>
                    <button className="flex flex-col items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg px-3 py-1 min-w-[90px]">
                      <span className="text-[13px] font-bold">Doctor and Nurses</span>
                      <span className="text-[10px] text-gray-500">Up to ₹600 off</span>
                    </button>

                  </div>
                </div>

                {/* Flight Tracker Button */}
                <div className="mt-5">
                   <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition">
                     <span className="text-blue-600">🎫</span>
                     <span className="text-[13px] font-bold text-gray-800">Flight Tracker</span>
                   </button>
                </div>

              </div>
            ) : activeTab === 'Hotels' ? (
              <div className="relative">
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
                    onClick={() => { setIsDatePickerOpen(true); }}
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
                    onClick={() => { setIsDatePickerOpen(true); }}
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

                    {isDatePickerOpen && (
                      <div className="absolute top-[100%] left-[-200px] z-50">
                        <DualMonthCalendar 
                          checkIn={departureDate} 
                          checkOut={returnDate}
                          onDateChange={(type, date) => {
                            if (type === 'checkIn') setDepartureDate(date);
                            else setReturnDate(date);
                          }}
                          onClose={() => setIsDatePickerOpen(false)}
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
                 <p className="text-lg text-gray-500 font-medium max-w-md mx-auto">We are currently building this module. It will be available in the next phase of TravelGo.</p>
              </div>
            )}

            {/* Massive Search Button Overlapping Bottom */}
            {(activeTab === 'Flights' || activeTab === 'Hotels') && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20 w-[90%] md:w-auto">
                  <button onClick={handleSearch} className="w-full md:w-auto px-12 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black text-xl hover:shadow-[0_8px_25px_rgba(37,99,235,0.4)] hover:scale-105 transition-all duration-300">
                    SEARCH
                  </button>
                </div>
            )}
          </div>
          
          {/* Explore More Strip */}
          <div className="text-center mt-12 mb-6">
            <button className="flex items-center gap-1 mx-auto text-white font-bold hover:text-blue-200 transition">
              <ChevronDown size={16} /> Explore More <ChevronDown size={16} />
            </button>
          </div>

          {/* Bottom Pill Banners */}
          <div className="bg-white rounded-xl lg:rounded-full shadow-lg flex items-center justify-start lg:justify-between px-4 lg:px-8 py-3 mx-auto w-[95%] lg:max-w-[1100px] gap-6 text-sm hidden-scrollbar">
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

      {/* Popular Destinations Section */}
      <div id="destinations" className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Popular Destinations</h2>
            <p className="text-gray-500 font-medium">Explore our highly rated tour packages and places.</p>
          </div>
          <button onClick={() => setIsLoginModalOpen(true)} className="hidden md:flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 transition">
            See all <ChevronRight size={18} />
          </button>
        </div>

        {destinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest) => (
              <div 
                key={dest.name} 
                onClick={() => setIsLoginModalOpen(true)}
                className="group cursor-pointer rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 bg-white flex flex-col"
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={dest.imgUrl} 
                    alt={dest.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                  <h3 className="absolute bottom-4 left-4 text-white text-xl font-bold">{dest.name}</h3>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <p className="text-gray-500 text-sm font-medium">Starting from</p>
                  <p className="text-lg font-bold text-blue-600">₹{dest.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-6 overflow-hidden opacity-50">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-64 w-full bg-gray-200 animate-pulse rounded-2xl"></div>)}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-20 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Why Book With TravelGo?</h2>
            <p className="text-gray-500">We provide the best booking experience for travelers and agents globally.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Globe size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Global Coverage</h3>
              <p className="text-gray-500 leading-relaxed">Access to millions of flights and hotels worldwide at your fingertips.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <CreditCard size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Best Price Guarantee</h3>
              <p className="text-gray-500 leading-relaxed">We match prices. Find a lower price online and we will refund the difference.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Booking</h3>
              <p className="text-gray-500 leading-relaxed">Your data and payments are protected with enterprise-grade security.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 text-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4 text-white">
              <Plane size={24} className="text-blue-500" />
              <span className="text-xl font-black tracking-tight">TravelGo</span>
            </div>
            <p className="mb-4 text-gray-500">The world's leading travel booking platform for users and agents.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition">Cancellation Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Partner With Us</h4>
            <ul className="space-y-2">
              <li><button onClick={() => setIsLoginModalOpen(true)} className="hover:text-white transition text-blue-400 font-semibold">Join as Travel Agent</button></li>
              <li><a href="#" className="hover:text-white transition">List your Hotel</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} TravelGo Inc. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
