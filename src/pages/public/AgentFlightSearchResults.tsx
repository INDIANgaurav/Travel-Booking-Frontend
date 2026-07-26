import React, { useState, useRef, useEffect } from 'react';
import { Plane, Building2, Shield, CreditCard, ChevronDown, Check, ArrowLeft, LogOut, Search, Clock, MoreHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setAgentBookingMode, logout } from '../../store/authSlice';
import CustomCalendar from '../../components/common/CustomCalendar';
import DualMonthCalendar from '../../components/ui/DualMonthCalendar';
import TravellerPicker from '../../components/common/TravellerPicker';
import CabinClassPicker from '../../components/common/CabinClassPicker';
import CityPicker from '../../components/common/CityPicker';
import TripTypePicker from '../../components/common/TripTypePicker';
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
  isSeriesFare?: boolean;
  agentCommission?: number;
}

export default function AgentFlightSearchResults(props: any) {
  const dispatch = useDispatch();
  const {
    from, setFrom, to, setTo, date, setDate, tripType, setTripType, returnDate, setReturnDate,
    adults, setAdults, children, setChildren, infants, setInfants, cabinClass, setCabinClass,
    nonStopFilter, setNonStopFilter, morningFilter, setMorningFilter, sortBy, setSortBy,
    outboundFlights, returnFlights, loading, selectedOutbound, setSelectedOutbound,
    selectedReturn, setSelectedReturn, showFlightDetails, setShowFlightDetails,
    sortedOutboundFlights, cheapestFlight, nonStopFlight, preferFlight,
    handleSearch, getDisplayPrice, navigate, setHasSearched
  } = props;

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTravellerPickerOpen, setIsTravellerPickerOpen] = useState(false);
  const [isCabinPickerOpen, setIsCabinPickerOpen] = useState(false);
  const [isFromPickerOpen, setIsFromPickerOpen] = useState(false);
  const [isToPickerOpen, setIsToPickerOpen] = useState(false);
  const [isTripTypePickerOpen, setIsTripTypePickerOpen] = useState(false);

  const closeAllPickers = () => {
    setIsDatePickerOpen(false);
    setIsTravellerPickerOpen(false);
    setIsCabinPickerOpen(false);
    setIsFromPickerOpen(false);
    setIsToPickerOpen(false);
    setIsTripTypePickerOpen(false);
  };

  const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const formatDuration = (mins: number) => `${Math.floor(mins / 60)}h ${mins % 60}m`;
  
  const loggedInUser = useSelector((state: any) => state.auth?.user) || props.user;
  const agentName = loggedInUser?.companyName || (loggedInUser?.firstName ? `${loggedInUser.firstName} ${loggedInUser.lastName || ''}`.trim() : loggedInUser?.name) || '';
  const agentInitial = (agentName.charAt(0) || '').toUpperCase();
  const agentCode = loggedInUser?.agencyCode || loggedInUser?.agencyId || (loggedInUser?._id ? `UPTF${loggedInUser._id.slice(-6).toUpperCase()}` : '');
  const agentBalance = loggedInUser?.walletBalance ?? loggedInUser?.balance ?? 0;

  const [moreFaresFlight, setMoreFaresFlight] = useState<Flight | null>(null);
  const [selectedFareType, setSelectedFareType] = useState<string>('INSTANT FARE');

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);

  // New UI states
  const [expandedFlightId, setExpandedFlightId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('FLIGHT DETAIL');
  const [showFareRulesForFlight, setShowFareRulesForFlight] = useState<Flight | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    let interval: any;
    if (props.loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 98) {
            clearInterval(interval);
            return 98;
          }
          return prev + 1;
        });
      }, 30); // 30ms * 100 = ~3000ms total
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [props.loading]);

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
    props.navigate('/b2b/login');
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] font-sans pb-20" onClick={closeAllPickers}>
      
      {/* 4-Step Searching Loader Modal (Matching Screenshot 3) */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in duration-300">
            <h3 className="text-xl font-black text-[#0c1a40] mb-1">Please Wait.....</h3>
            <p className="text-xs text-gray-500 font-semibold mb-6">We are looking for all available flights for {tripType.toUpperCase()}</p>

            {/* Route */}
            <div className="flex items-center justify-between max-w-xs mx-auto mb-6 text-sm font-black text-[#0c1a40]">
              <span>{from.toUpperCase().slice(0, 3)}</span>
              <div className="flex-1 flex items-center justify-center px-4 relative">
                <div className="w-full h-0.5 bg-gray-300 relative">
                  <div className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-white px-1 text-blue-600">
                    <Plane size={18} className="transform rotate-90" />
                  </div>
                </div>
              </div>
              <span>{to.toUpperCase().slice(0, 3)}</span>
            </div>

            {/* Step Progress Line */}
            <div className="relative max-w-xs mx-auto mb-4">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between -mt-3.5">
                {[1, 2, 3, 4].map((stepNum) => {
                  const currentStep = progress < 25 ? 1 : progress < 50 ? 2 : progress < 75 ? 3 : 4;
                  const isCompleted = stepNum < currentStep;
                  const isActive = stepNum === currentStep;
                  
                  return (
                    <div 
                      key={stepNum}
                      className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border-2 shadow transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-blue-600 text-white border-white' 
                          : isActive
                            ? 'bg-blue-600 text-white border-white ring-4 ring-blue-100'
                            : 'bg-gray-200 text-gray-500 border-white'
                      }`}
                    >
                      {isCompleted ? '✓' : stepNum}
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] font-bold text-gray-700 mb-6">
              Step {progress < 25 ? 1 : progress < 50 ? 2 : progress < 75 ? 3 : 4} of 4 · {
                progress < 25 ? 'Initializing search...' : 
                progress < 50 ? 'Searching airline inventories...' : 
                progress < 75 ? 'Fetching best B2B deals...' : 
                'Finalizing flight results...'
              } <span className="text-blue-600">{progress}%</span>
            </p>

            {/* Date & Passenger Pill */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex justify-around text-xs font-bold text-gray-700">
              <div>Departure: <span className="text-blue-700">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
              <div className="w-px h-4 bg-gray-300" />
              <div>Passengers: <span className="text-blue-700">{adults} Adult(s)</span></div>
            </div>
          </div>
        </div>
      )}

      {/* + More Fares Modal (Matching Screenshot 5) */}
      {moreFaresFlight && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-[#f8f9fa] rounded-2xl max-w-5xl w-full max-h-[95vh] shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-200 relative flex flex-col">
            {/* Close Button Top Right */}
            <button 
              onClick={() => setMoreFaresFlight(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors z-20 shadow-md"
            >
              <X size={16} strokeWidth={3} />
            </button>

            {/* Header Bar */}
            <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-gray-100 shrink-0">
              
              <div className="flex items-center gap-4 text-[#0c1a40]">
                <div className="flex items-center gap-2">
                  <img src={moreFaresFlight.airlineLogo} alt={moreFaresFlight.airline} className="w-8 h-8 object-contain" />
                  <div>
                    <span className="font-black text-sm block leading-tight">{moreFaresFlight.airline}</span>
                    <span className="text-[10px] text-gray-500 font-bold block">{moreFaresFlight.flightNumber}</span>
                  </div>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="font-black text-base">{from}</span>
                  <span className="text-gray-500 text-xs font-bold">{formatTime(moreFaresFlight.departureTime)}</span>
                </div>
              </div>

              <div className="text-[10px] font-bold text-gray-400">
                --- Non-Stop ---
              </div>

              <div className="flex items-baseline gap-2 pr-10 text-[#0c1a40]">
                <span className="font-black text-base">{to}</span>
                <span className="text-gray-500 text-xs font-bold">{formatTime(moreFaresFlight.arrivalTime)}</span>
              </div>
            </div>

            {/* 4 Fare Option Cards */}
            <div className="p-6 relative flex-1 overflow-y-auto">
              <button onClick={() => scrollCarousel('left')} className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-600 transition shadow-sm z-10 hidden md:flex">
                <ChevronLeft size={20} />
              </button>
              
              <div ref={carouselRef} className="flex overflow-x-auto snap-x gap-4 pb-4 pt-4 px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style>{`.flex::-webkit-scrollbar { display: none; }`}</style>
              {/* Card 1: INSTANT FARE */}
              <div className={`min-w-[280px] bg-white rounded-xl border ${selectedFareType === 'INSTANT FARE' ? 'border-blue-600 ring-4 ring-blue-500/10 shadow-lg scale-[1.02]' : 'border-gray-200'} p-4 flex flex-col justify-between transition-all cursor-pointer`} onClick={() => setSelectedFareType('INSTANT FARE')}>
                <div>
                  <div className="text-center text-[13px] font-black text-[#0c1a40] uppercase mb-1">
                    INSTANT FARE
                  </div>
                  <div className="text-[11px] text-red-500 font-bold text-center mb-3">Non Refundable</div>

                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedFareType === 'INSTANT FARE' ? 'border-blue-600' : 'border-gray-300'}`}>
                        {selectedFareType === 'INSTANT FARE' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                      <span className="text-xl font-black text-red-500">₹ {getDisplayPrice(moreFaresFlight.price).toLocaleString('en-IN')}.00</span>
                    </div>
                    <span className="text-[11px] font-bold text-red-500 underline cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowFareRulesForFlight(moreFaresFlight); }}>Fare Rules</span>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <div className="bg-blue-50/50 text-blue-900 border border-blue-100 px-3 py-1.5 rounded-full text-[10px] font-bold flex-1 text-center">CheckIn: 15 Kg</div>
                    <div className="bg-blue-50/50 text-blue-900 border border-blue-100 px-3 py-1.5 rounded-full text-[10px] font-bold flex-1 text-center">Cabin: 7 Kg</div>
                  </div>

                  <ul className="text-[11px] text-gray-500 space-y-3 mb-3">
                    <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Special fare</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Names will be updated 1 day prior to Departure</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Please reconfirm your flight departure time at least 24 hours prior</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Cancellation is possible subjected to Series terms</li>
                  </ul>
                </div>

                <button 
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${selectedFareType === 'INSTANT FARE' ? 'bg-[#00a651] text-white shadow-md' : 'bg-[#0c1a40] text-white hover:bg-blue-900'}`}
                >
                  {selectedFareType === 'INSTANT FARE' ? 'Selected ✓' : 'Select'}
                </button>
              </div>

              {/* Card 2: Coupon Fares */}
              <div className={`min-w-[280px] bg-white rounded-xl border ${selectedFareType === 'Coupon fares' ? 'border-blue-600 ring-4 ring-blue-500/10 shadow-lg scale-[1.02]' : 'border-gray-200'} p-4 flex flex-col justify-between transition-all cursor-pointer`} onClick={() => setSelectedFareType('Coupon fares')}>
                <div>
                  <div className="text-center text-[13px] font-black text-[#0c1a40] uppercase mb-1">
                    Coupon fares
                  </div>
                  <div className="text-[11px] text-[#8dc63f] font-bold text-center mb-3">Partially Refundable</div>

                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedFareType === 'Coupon fares' ? 'border-blue-600' : 'border-gray-300'}`}>
                        {selectedFareType === 'Coupon fares' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                      <span className="text-xl font-black text-red-500">₹ {(getDisplayPrice(moreFaresFlight.price) + 1035).toLocaleString('en-IN')}.00</span>
                    </div>
                    <span className="text-[11px] font-bold text-red-500 underline cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowFareRulesForFlight(moreFaresFlight); }}>Fare Rules</span>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <div className="bg-blue-50/50 text-blue-900 border border-blue-100 px-3 py-1.5 rounded-full text-[10px] font-bold flex-1 text-center">CheckIn: 15 Kg</div>
                    <div className="bg-blue-50/50 text-blue-900 border border-blue-100 px-3 py-1.5 rounded-full text-[10px] font-bold flex-1 text-center">Cabin: 7 Kg</div>
                  </div>

                  <ul className="text-[11px] text-gray-500 space-y-3 mb-3">
                    <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Cancellation / Re-issue Permitted at higher charges</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Seat & Meals not included in the fare</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Check Fare Rules For Accurate Fees</li>
                  </ul>
                </div>

                <button 
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${selectedFareType === 'Coupon fares' ? 'bg-[#00a651] text-white shadow-md' : 'bg-[#0c1a40] text-white hover:bg-blue-900'}`}
                >
                  {selectedFareType === 'Coupon fares' ? 'Selected ✓' : 'Select'}
                </button>
              </div>

              {/* Card 3: Special Fares */}
              <div className={`min-w-[280px] bg-white rounded-xl border ${selectedFareType === 'Special fares' ? 'border-blue-600 ring-4 ring-blue-500/10 shadow-lg scale-[1.02]' : 'border-gray-200'} p-4 flex flex-col justify-between transition-all cursor-pointer`} onClick={() => setSelectedFareType('Special fares')}>
                <div>
                  <div className="text-center text-[13px] font-black text-[#0c1a40] uppercase mb-1">
                    Special fares
                  </div>
                  <div className="text-[11px] text-[#8dc63f] font-bold text-center mb-3">Partially Refundable</div>

                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedFareType === 'Special fares' ? 'border-blue-600' : 'border-gray-300'}`}>
                        {selectedFareType === 'Special fares' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                      <span className="text-xl font-black text-red-500">₹ {(getDisplayPrice(moreFaresFlight.price) + 1087).toLocaleString('en-IN')}.00</span>
                    </div>
                    <span className="text-[11px] font-bold text-red-500 underline cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowFareRulesForFlight(moreFaresFlight); }}>Fare Rules</span>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <div className="bg-blue-50/50 text-blue-900 border border-blue-100 px-3 py-1.5 rounded-full text-[10px] font-bold flex-1 text-center">CheckIn: 15 Kg</div>
                    <div className="bg-blue-50/50 text-blue-900 border border-blue-100 px-3 py-1.5 rounded-full text-[10px] font-bold flex-1 text-center">Cabin: 7 Kg</div>
                  </div>

                  <ul className="text-[11px] text-gray-500 space-y-3 mb-3">
                    <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Cancellation / Re-issue Permitted</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Seat & Meals available at charge</li>
                  </ul>
                </div>

                <button 
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${selectedFareType === 'Special fares' ? 'bg-[#00a651] text-white shadow-md' : 'bg-[#0c1a40] text-white hover:bg-blue-900'}`}
                >
                  {selectedFareType === 'Special fares' ? 'Selected ✓' : 'Select'}
                </button>
              </div>

              {/* Card 4: Corporate Fares */}
              <div className={`min-w-[280px] bg-white rounded-xl border ${selectedFareType === 'Corporate Fares' ? 'border-blue-600 ring-4 ring-blue-500/10 shadow-lg scale-[1.02]' : 'border-gray-200'} p-4 flex flex-col justify-between transition-all cursor-pointer`} onClick={() => setSelectedFareType('Corporate Fares')}>
                <div>
                  <div className="text-center text-[13px] font-black text-[#0c1a40] uppercase mb-1">
                    Corporate Fares
                  </div>
                  <div className="text-[11px] text-[#8dc63f] font-bold text-center mb-3">Partially Refundable</div>

                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedFareType === 'Corporate Fares' ? 'border-blue-600' : 'border-gray-300'}`}>
                        {selectedFareType === 'Corporate Fares' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                      <span className="text-xl font-black text-red-500">₹ {(getDisplayPrice(moreFaresFlight.price) + 1133).toLocaleString('en-IN')}.00</span>
                    </div>
                    <span className="text-[11px] font-bold text-red-500 underline cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowFareRulesForFlight(moreFaresFlight); }}>Fare Rules</span>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <div className="bg-blue-50/50 text-blue-900 border border-blue-100 px-3 py-1.5 rounded-full text-[10px] font-bold flex-1 text-center">CheckIn: 15 Kg</div>
                    <div className="bg-blue-50/50 text-blue-900 border border-blue-100 px-3 py-1.5 rounded-full text-[10px] font-bold flex-1 text-center">Cabin: 7 Kg</div>
                  </div>

                  <ul className="text-[11px] text-gray-500 space-y-3 mb-3">
                    <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Free standard seats</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Lowest Cancellation & Reissue Fees</li>
                  </ul>
                </div>

                <button 
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${selectedFareType === 'Corporate Fares' ? 'bg-[#00a651] text-white shadow-md' : 'bg-[#0c1a40] text-white hover:bg-blue-900'}`}
                >
                  {selectedFareType === 'Corporate Fares' ? 'Selected ✓' : 'Select'}
                </button>
              </div>
              </div>

              <button onClick={() => scrollCarousel('right')} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-600 transition shadow-sm z-10 hidden md:flex">
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Modal Bottom Bar */}
            <div className="bg-white p-5 border-t border-gray-100 flex justify-between items-center rounded-b-2xl shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
              <div className="text-sm font-black text-[#0c1a40] uppercase">
                {selectedFareType} <span className="text-[#0c1a40] text-lg ml-3">₹ {(getDisplayPrice(moreFaresFlight.price) + (selectedFareType === 'Coupon fares' ? 1035 : selectedFareType === 'Special fares' ? 1087 : selectedFareType === 'Corporate Fares' ? 1133 : 0)).toLocaleString('en-IN')}.00</span>
              </div>

              <button
                onClick={() => {
                  let finalPrice = getDisplayPrice(moreFaresFlight.price);
                  if (selectedFareType === 'Coupon fares') finalPrice += 1035;
                  if (selectedFareType === 'Special fares') finalPrice += 1087;
                  if (selectedFareType === 'Corporate Fares') finalPrice += 1133;
                  
                  const flightToBook = { ...moreFaresFlight, price: finalPrice };
                  setSelectedOutbound(flightToBook);
                  navigate('/b2b/checkout', { state: { flight: flightToBook, fareType: selectedFareType } });
                }}
                className="bg-[#0b1031] hover:bg-blue-900 text-white font-bold text-sm px-10 py-3 rounded-full transition-all shadow-md"
              >
                Book
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom B2B White Header (Matching Reference Screenshot 2 & 4) */}
      <div className="bg-white border-b border-gray-200 py-2.5 px-8 z-50 relative shadow-sm">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="flex items-center justify-center">
                <img src="/tg-favicon.svg" alt="TrippeChalo" className="w-9 h-9" crossOrigin="anonymous" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-[#0c1a40]">TRIPPE<span className="text-blue-600">CHALO</span></span>
                <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-widest -mt-1">B2B Agent Engine</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center cursor-pointer text-blue-600">
              <Plane size={20} />
              <span className="text-[10px] font-bold mt-1">Flights</span>
            </div>
            <div className="flex flex-col items-center cursor-pointer text-gray-500 hover:text-blue-600 transition" onClick={() => navigate('/?tab=Hotels')}>
              <Building2 size={20} />
              <span className="text-[10px] font-bold mt-1">Hotel & Villas</span>
            </div>
            <div className="flex flex-col items-center cursor-pointer text-gray-500 hover:text-blue-600 transition" onClick={() => navigate('/?tab=Villas & Homestays')}>
              <Shield size={20} />
              <span className="text-[10px] font-bold mt-1">Insurance</span>
            </div>
            <div className="flex flex-col items-center cursor-pointer text-gray-500 hover:text-blue-600 transition" onClick={() => navigate('/?tab=Cabs')}>
              <CreditCard size={20} />
              <span className="text-[10px] font-bold mt-1">Visa</span>
            </div>
            
            <div className="relative flex flex-col items-center cursor-pointer text-gray-500 hover:text-blue-600 transition" ref={moreRef}>
              <div 
                className={`flex flex-col items-center justify-center p-1 rounded-md ${showMoreMenu ? 'text-gray-900 border border-gray-900' : 'border border-transparent'}`}
                onClick={() => setShowMoreMenu(!showMoreMenu)}
              >
                <MoreHorizontal size={20} />
                <span className="text-[10px] font-bold mt-1">More</span>
              </div>

              {/* More Dropdown */}
              {showMoreMenu && (
                <div className="absolute top-full mt-3 w-48 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] py-2 border border-gray-100 z-50 left-1/2 -translate-x-1/2">
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
                        if (item.path !== '#') props.navigate(item.path);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#0c1a40] hover:bg-blue-50 transition"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-700">
               <span className="text-xs font-bold text-gray-900">Balance: ₹ {agentBalance.toLocaleString('en-IN')}</span>
             </div>
             
             <div className="relative" ref={profileRef}>
               <div 
                 className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 cursor-pointer hover:bg-blue-100 transition"
                 onClick={() => setShowProfileMenu(!showProfileMenu)}
               >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {agentInitial}
                  </div>
                  <span className="text-xs font-bold text-[#0c1a40]">{agentName} ({agentCode})</span>
               </div>
               
               {/* Profile Dropdown */}
               {showProfileMenu && (
                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100 z-50">
                   <div className="px-4 py-2 border-b border-gray-50 mb-1">
                     <p className="text-xs font-bold text-[#0c1a40] truncate">{agentName}</p>
                     <p className="text-[10px] text-gray-500 truncate">{loggedInUser?.email}</p>
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
        </div>
      </div>
      
      {/* Search Header Bar (Matching Reference Screenshot 4) */}
      <div className="bg-[#0b1031] text-white py-3.5 px-8 sticky top-0 z-40 shadow-md">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between text-xs">
          
          <div className="flex items-center gap-8">
            <div className="relative group/from" onClick={(e) => { e.stopPropagation(); setIsFromPickerOpen(!isFromPickerOpen); }}>
              <p className="text-gray-400 text-[10px] uppercase font-semibold">From</p>
              <p className="font-bold text-sm text-white cursor-pointer hover:text-blue-400 transition">{from}</p>
              {isFromPickerOpen && (
                <div className="absolute top-[120%] left-0 z-[100] shadow-2xl" onClick={e => e.stopPropagation()}>
                  <CityPicker 
                    type="flight" 
                    value={from}
                    onChange={(code: string) => { setFrom(code); setIsFromPickerOpen(false); }} 
                    onClose={() => setIsFromPickerOpen(false)} 
                  />
                </div>
              )}
            </div>
            <span className="text-gray-400 font-bold">➔</span>
            <div className="relative group/to" onClick={(e) => { e.stopPropagation(); setIsToPickerOpen(!isToPickerOpen); }}>
              <p className="text-gray-400 text-[10px] uppercase font-semibold">To</p>
              <p className="font-bold text-sm text-white cursor-pointer hover:text-blue-400 transition">{to}</p>
              {isToPickerOpen && (
                <div className="absolute top-[120%] left-0 z-[100] shadow-2xl" onClick={e => e.stopPropagation()}>
                  <CityPicker 
                    type="flight" 
                    value={to}
                    onChange={(code: string) => { setTo(code); setIsToPickerOpen(false); }} 
                    onClose={() => setIsToPickerOpen(false)} 
                  />
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-white/20" />

            <div className="flex items-center gap-3">
              <div>
                <p className="text-gray-400 text-[10px] uppercase font-semibold text-center mb-1">Departure Date</p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const d = new Date(date);
                      d.setDate(d.getDate() - 1);
                      if (d >= new Date(new Date().setHours(0,0,0,0))) {
                        setDate(d);
                      }
                    }}
                    className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition"
                  >
                    <ChevronLeft size={12} />
                  </button>
                  
                  <div className="relative group/date" onClick={(e) => { e.stopPropagation(); setIsDatePickerOpen(!isDatePickerOpen); }}>
                    <p className="font-bold text-white cursor-pointer hover:text-blue-400 transition">{new Date(date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    
                    {/* Floating DualMonthCalendar */}
                    {isDatePickerOpen && (
                      <div className="absolute top-[120%] left-1/2 -translate-x-1/2 z-[100] shadow-2xl" onClick={e => e.stopPropagation()}>
                        <DualMonthCalendar 
                          checkIn={date} 
                          checkOut={returnDate}
                          onDateChange={(type, d) => {
                            if (type === 'checkIn') {
                              setDate(d);
                              setIsDatePickerOpen(false);
                            } else {
                              setReturnDate(d);
                            }
                          }}
                          onClose={() => setIsDatePickerOpen(false)}
                          origin={from}
                          destination={to}
                        />
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const d = new Date(date);
                      d.setDate(d.getDate() + 1);
                      setDate(d);
                    }}
                    className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition"
                  >
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>

            <div className="h-6 w-px bg-white/20" />

            <div>
              <p className="text-gray-400 text-[10px] uppercase font-semibold">Travellers & Class</p>
              <p className="font-bold text-white">{adults + children + infants} PAX, {cabinClass.split('/')[0]}</p>
            </div>
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); closeAllPickers(); setHasSearched(false); }} 
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-full text-xs transition uppercase shadow-md"
          >
            Search
          </button>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto mt-6 flex gap-6 px-4">
        
        {/* Left Sidebar Filters */}
        <div className="w-[260px] shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <h3 className="font-bold text-gray-900 mb-3 text-xs">Filter Fares</h3>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={nonStopFilter} onChange={(e) => setNonStopFilter(e.target.checked)} className="rounded text-blue-600" />
                <span className="font-medium text-gray-700">Non-Stop Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={morningFilter} onChange={(e) => setMorningFilter(e.target.checked)} className="rounded text-blue-600" />
                <span className="font-medium text-gray-700">Morning Departure</span>
              </label>
            </div>
          </div>
        </div>

        {/* Main Flight Cards Content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-black text-[#0c1a40]">
              Found {sortedOutboundFlights.length} Flights From {from} to {to}
            </h2>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
              {sortedOutboundFlights && sortedOutboundFlights.length > 0 && (
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                  Cheapest ₹ {Math.min(...sortedOutboundFlights.map((f: any) => f.price)).toLocaleString('en-IN')}
                </span>
              )}
              {sortedOutboundFlights && sortedOutboundFlights.filter((f: any) => f.stops === 0).length > 0 && (
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                  Non-Stop ₹ {Math.min(...sortedOutboundFlights.filter((f: any) => f.stops === 0).map((f: any) => f.price)).toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          {/* Flights List */}
          <div className="space-y-4">
            {sortedOutboundFlights.length === 0 ? (
               <div className="p-8 text-center text-gray-500 font-bold bg-white rounded-xl border border-gray-200">No flights available.</div>
            ) : (
               sortedOutboundFlights.map((flight: Flight) => (
                 <div 
                  key={flight._id} 
                  className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all border border-gray-100 overflow-hidden relative"
                  style={{
                    backgroundImage: agentCode ? `url("data:image/svg+xml,%3Csvg width='200' height='150' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext transform='rotate(-20 100 100)' x='50' y='100' font-size='20' font-family='Arial' font-weight='bold' fill='rgba(0,0,0,0.08)'%3E${agentCode}%3C/text%3E%3C/svg%3E")` : 'none',
                    backgroundRepeat: 'repeat',
                    backgroundPosition: 'center center'
                  }}
                >
                  <div className="p-5 flex items-center justify-between relative z-10">
                     <div className="flex items-center gap-3 w-[22%]">
                       <img src={flight.airlineLogo} alt={flight.airline} className="w-8 h-8 object-contain" />
                       <div>
                         <p className="font-black text-gray-900 text-sm">{flight.airline}</p>
                         <p className="text-[11px] text-gray-500 font-bold">{flight.flightNumber}</p>
                       </div>
                     </div>
                     
                     <div className="flex items-center gap-6 w-[42%] text-center">
                       <div className="text-left">
                         <p className="font-black text-lg text-gray-900">{formatTime(flight.departureTime)}</p>
                         <p className="text-[10px] text-gray-500 font-semibold">{flight.departureCity} (DEL)</p>
                       </div>
                       
                       <div className="flex-1 flex flex-col items-center">
                         <p className="text-[10px] font-bold text-gray-500 mb-1">{formatDuration(flight.durationMinutes)}</p>
                         <div className="w-full h-[2px] bg-gray-300 relative flex items-center justify-center">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                         </div>
                         <p className="text-[10px] text-gray-500 mt-1 font-semibold">{flight.stops === 0 ? 'Non-Stop' : `${flight.stops} stop`}</p>
                       </div>

                       <div className="text-right">
                         <p className="font-black text-lg text-gray-900">{formatTime(flight.arrivalTime)}</p>
                         <p className="text-[10px] text-gray-500 font-semibold">{flight.arrivalCity} (BOM)</p>
                       </div>
                     </div>

                     <div className="w-[32%] flex flex-col items-end gap-2">
                       <div className="flex flex-col items-end gap-0.5">
                         <span className="font-black text-2xl text-[#0c1a40]">₹ {getDisplayPrice(flight.price).toLocaleString('en-IN')}</span>
                         {flight.isSeriesFare && flight.agentCommission && flight.agentCommission > 0 && (
                           <span className="text-[9px] font-bold text-gray-500 uppercase">(Includes ₹ {flight.agentCommission} Taxes)</span>
                         )}
                       </div>
                       
                       <div className="flex items-center gap-2">
                         <button 
                           onClick={() => setMoreFaresFlight(flight)}
                           className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold px-4 py-1.5 rounded-full text-xs transition"
                         >
                           + More Fares
                         </button>

                         <button 
                           onClick={() => { setSelectedOutbound(flight); navigate('/b2b/checkout', { state: { flight: flight, fareType: 'INSTANT FARE' } }) }} 
                           className="bg-[#0b1031] hover:bg-blue-900 text-white font-bold px-6 py-1.5 rounded-full text-xs transition shadow-sm"
                         >
                           Book
                         </button>
                       </div>
                     </div>
                   </div>

                   {/* Tags Bar matching Screenshot 4 */}
                   <div className="bg-gray-50/80 px-5 py-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold">
                     <div className="flex items-center gap-2 flex-wrap">
                       <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">7 Seat(s)</span>
                       <span className="bg-pink-100 text-pink-800 px-2 py-0.5 rounded">! Paid Meals</span>
                       <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">ADT: 15 Kg / 7 Kg</span>
                       <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded uppercase">INSTANT FARE</span>
                       <span className="text-blue-700">Class: RI</span>
                     </div>
                     <div className="flex items-center gap-4 text-[#0c1a40]">
                       <span className="cursor-pointer hover:underline" onClick={() => setShowFareRulesForFlight(flight)}>Fare Rules</span>
                       <div 
                         className="cursor-pointer font-black border border-[#0c1a40] px-2 py-0.5 rounded hover:bg-[#0c1a40] hover:text-white transition-colors"
                         onClick={() => setExpandedFlightId(expandedFlightId === flight._id ? null : flight._id)}
                       >
                         Flight Details {expandedFlightId === flight._id ? '▲' : '▼'}
                       </div>
                     </div>
                   </div>

                   {/* Flight Details Accordion (Matching Screenshot 3) */}
                   {expandedFlightId === flight._id && (
                     <div className="border-t border-gray-200 bg-white animate-in slide-in-from-top-2 fade-in duration-200">
                       <div className="flex border-b border-gray-200 px-5">
                         {['FLIGHT DETAIL', 'FARE BREAKUP', 'BAGGAGE'].map(tab => (
                           <button 
                             key={tab}
                             onClick={() => setActiveTab(tab)}
                             className={`px-4 py-3 text-xs font-black transition-colors border-b-2 ${activeTab === tab ? 'border-[#0c1a40] text-[#0c1a40]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                           >
                             {tab}
                           </button>
                         ))}
                       </div>
                       
                       <div className="p-6">
                         {activeTab === 'FLIGHT DETAIL' && (
                           <div>
                             <div className="flex justify-between items-center mb-6">
                               <div>
                                 <h3 className="text-sm font-black text-[#0c1a40]">{flight.departureCity} ({flight.departureAirportCode}) - {flight.arrivalCity} ({flight.arrivalAirportCode})</h3>
                                 <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">ECONOMY - RI (INSTANT FARE)</p>
                               </div>
                               <span className="text-[10px] text-gray-500 font-bold">Partially Refundable</span>
                             </div>

                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-4 w-[25%]">
                                 <img src={flight.airlineLogo} alt={flight.airline} className="w-10 h-10 object-contain" />
                                 <div className="text-center">
                                   <p className="font-black text-sm text-[#0c1a40]">{flight.flightNumber}</p>
                                   <p className="text-[10px] text-gray-500 font-semibold">{flight.airline}</p>
                                 </div>
                               </div>

                               <div className="flex items-center gap-6 w-[50%] justify-center text-[#0c1a40]">
                                 <div className="text-center">
                                   <p className="font-black text-lg">{formatTime(flight.departureTime)}</p>
                                   <p className="text-[10px] font-bold">{flight.departureAirportCode} {new Date(flight.departureTime).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                                 </div>

                                 <div className="flex flex-col items-center flex-1">
                                   <div className="w-full flex items-center gap-2">
                                     <div className="w-1.5 h-1.5 rounded-full border border-gray-400" />
                                     <div className="flex-1 h-px bg-gray-300" />
                                     <div className="w-1.5 h-1.5 rounded-full border border-gray-400" />
                                   </div>
                                 </div>

                                 <div className="text-center">
                                   <p className="font-black text-lg">{formatTime(flight.arrivalTime)}</p>
                                   <p className="text-[10px] font-bold">{flight.arrivalAirportCode} {new Date(flight.arrivalTime).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                                   <p className="text-[9px] text-gray-500 mt-0.5">Terminal: 1</p>
                                 </div>
                               </div>
                               
                               <div className="w-[25%]" />
                             </div>
                           </div>
                         )}
                         {activeTab === 'FARE BREAKUP' && <div className="text-sm font-bold text-gray-500 text-center py-4">Fare breakup details will be displayed here.</div>}
                         {activeTab === 'BAGGAGE' && <div className="text-sm font-bold text-gray-500 text-center py-4">Baggage details will be displayed here.</div>}
                       </div>
                     </div>
                   )}
                 </div>
               ))
            )}
          </div>
        </div>

      </div>

      {/* Fare Rules Modal (Matching Screenshot 4) */}
      {showFareRulesForFlight && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl border border-gray-200 overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
            {/* Dark Blue Header */}
            <div className="bg-[#0b1031] text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-sm font-black tracking-wide uppercase">Fare Rule</h2>
              <button 
                onClick={() => setShowFareRulesForFlight(null)}
                className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>

            {/* Flight Info Sub-header */}
            <div className="bg-pink-50 px-6 py-3 border-b border-pink-100 flex items-center gap-2 text-[#0c1a40] text-sm">
              <span className="font-black">{showFareRulesForFlight.departureCity}-{showFareRulesForFlight.arrivalCity}</span>
              <span className="font-bold text-gray-500 text-xs">- {new Date(showFareRulesForFlight.departureTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cancellation Table */}
                <div>
                  <h3 className="text-xs font-black text-white bg-[#0c1a40] py-2 px-4 rounded-t-lg">CANCELLATION CHARGES PER PAX</h3>
                  <table className="w-full text-left border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] text-gray-500 font-bold uppercase">
                        <th className="border border-gray-200 px-4 py-2">Time Frame</th>
                        <th className="border border-gray-200 px-4 py-2">Air Fee + TPC Fee</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-bold text-gray-700">
                      <tr>
                        <td className="border border-gray-200 px-4 py-3">0 Days - 365 Days</td>
                        <td className="border border-gray-200 px-4 py-3 text-red-500">Non Refundable</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Reschedule Table */}
                <div>
                  <h3 className="text-xs font-black text-white bg-[#0c1a40] py-2 px-4 rounded-t-lg">RESCHEDULE CHARGES PER PAX</h3>
                  <table className="w-full text-left border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] text-gray-500 font-bold uppercase">
                        <th className="border border-gray-200 px-4 py-2">Time Frame</th>
                        <th className="border border-gray-200 px-4 py-2">Air Fee + TPC Fee + Fare Diff</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-bold text-gray-700">
                      <tr>
                        <td className="border border-gray-200 px-4 py-3">0 Days - 365 Days</td>
                        <td className="border border-gray-200 px-4 py-3 text-red-500">Non Changeable</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-8">
                <h3 className="text-sm font-black text-red-500 mb-3 border-b border-red-100 pb-1">Disclaimer</h3>
                <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4 font-medium">
                  <li>Mentioned fees are Per Pax and Per Sector.</li>
                  <li>Apart from airline charges, GST + Agency Fee of Rs 500/Pax/Sector shall be levied.</li>
                  <li>To avoid No-Show charges, please cancel or change your flight at least 4 hours before departure for domestic and 24 hours for international flights.</li>
                  <li>In case of No-Show, no refund will be applicable.</li>
                  <li>The charges mentioned are based on standard airline policies and may vary.</li>
                  <li>For partial cancellation or changes, please contact our support team.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

