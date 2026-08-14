import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { Plane, Building2, Shield, ShieldCheck, CreditCard, Compass, ChevronDown, Check, ArrowLeft, LogOut, Search, Clock, MoreHorizontal, ChevronLeft, ChevronRight, X, User, Users, Smile, Baby, ArrowRightLeft } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setAgentBookingMode, logout } from '../../store/authSlice';
import CustomCalendar from '../../components/common/CustomCalendar';
import DualMonthCalendar from '../../components/ui/DualMonthCalendar';
import TravellerPicker from '../../components/common/TravellerPicker';
import CabinClassPicker from '../../components/common/CabinClassPicker';
import CityPicker from '../../components/common/CityPicker';
import TripTypePicker from '../../components/common/TripTypePicker';
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
  durationMinutes: number;
  price: number;
  stops: number;
  isSeriesFare?: boolean;
  agentCommission?: number;
  seatsAvailable?: number;
  adultPrice?: number;
  childPrice?: number;
  infantPrice?: number;
  checkinBaggage?: string;
  cabinBaggage?: string;
  cabinClass?: string;
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

  const [activeDatePicker, setActiveDatePicker] = useState<'depart' | 'return' | null>(null);
  const [isTravellerPickerOpen, setIsTravellerPickerOpen] = useState(false);
  const [isCabinPickerOpen, setIsCabinPickerOpen] = useState(false);
  const [isFromPickerOpen, setIsFromPickerOpen] = useState(false);
  const [isToPickerOpen, setIsToPickerOpen] = useState(false);
  const [isTripTypePickerOpen, setIsTripTypePickerOpen] = useState(false);

  const closeAllPickers = () => {
    setActiveDatePicker(null);
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
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

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

  const renderFlightCard = (flight: Flight, isReturn = false) => {
    const isSelected = isReturn ? selectedReturn?._id === flight._id : selectedOutbound?._id === flight._id;
    return (
      <div 
        key={flight._id} 
        className={`bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all border ${isSelected ? 'border-blue-600 ring-2 ring-blue-600' : 'border-gray-100'} overflow-hidden relative ${tripType === 'Round Trip' ? 'cursor-pointer' : ''}`}
        onClick={() => {
           if (tripType === 'Round Trip') {
             if (isReturn) setSelectedReturn(flight);
             else setSelectedOutbound(flight);
           }
        }}
        style={{
          backgroundImage: agentCode ? `url("data:image/svg+xml,%3Csvg width='200' height='150' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext transform='rotate(-20 100 100)' x='50' y='100' font-size='20' font-family='Arial' font-weight='bold' fill='rgba(0,0,0,0.08)'%3E${agentCode}%3C/text%3E%3C/svg%3E")` : 'none',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center center'
        }}
      >
        <div className={`p-5 flex ${tripType === 'Round Trip' ? 'flex-col gap-4' : 'items-center justify-between'} relative z-10`}>
           <div className={`flex items-center gap-3 ${tripType === 'Round Trip' ? 'w-full' : 'w-[22%]'}`}>
             <img src={flight.airlineLogo} alt={flight.airline} className="w-8 h-8 object-contain" />
             <div>
               <p className="font-black text-gray-900 text-sm">{flight.airline}</p>
               <p className="text-[11px] text-gray-500 font-bold">{flight.flightNumber}</p>
             </div>
           </div>
           
           <div className={`flex items-center justify-between ${tripType === 'Round Trip' ? 'w-full' : 'gap-6 w-[42%] text-center'}`}>
             <div className="text-left">
               <p className="font-black text-lg text-gray-900">{formatTime(flight.departureTime)}</p>
               <p className="text-[10px] text-gray-500 font-semibold">{flight.departureCity} ({flight.departureAirportCode})</p>
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
               <p className="text-[10px] text-gray-500 font-semibold">{flight.arrivalCity} ({flight.arrivalAirportCode})</p>
             </div>
           </div>

           <div className={`flex ${tripType === 'Round Trip' ? 'w-full items-center justify-between border-t border-gray-100 pt-3 mt-1' : 'w-[32%] flex-col items-end gap-2'}`}>
             <div className={`flex flex-col ${tripType === 'Round Trip' ? 'items-start gap-0.5' : 'items-end gap-0.5'}`}>
               <span className="font-black text-2xl text-[#0c1a40]">₹ {getDisplayPrice(flight.price).toLocaleString('en-IN')}</span>
               {flight.isSeriesFare && flight.agentCommission && flight.agentCommission > 0 && (
                 <span className="text-[9px] font-bold text-gray-500 uppercase">(Includes ₹ {flight.agentCommission} Taxes)</span>
               )}
             </div>
             
             <div className="flex items-center gap-2">
               <button 
                 onClick={(e) => { e.stopPropagation(); setMoreFaresFlight(flight); }}
                 className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold px-4 py-1.5 rounded-full text-xs transition"
               >
                 + More Fares
               </button>

               {tripType !== 'Round Trip' && (
                 <button 
                   onClick={(e) => { e.stopPropagation(); setSelectedOutbound(flight); navigate('/b2b/checkout', { state: { flight: flight, fareType: 'INSTANT FARE', adults, children, infants } }) }} 
                   className="bg-[#0b1031] hover:bg-blue-900 text-white font-bold px-6 py-1.5 rounded-full text-xs transition shadow-sm"
                 >
                   Book
                 </button>
               )}
             </div>
           </div>
        </div>

        {/* Tags Bar */}
        <div className="bg-gray-50/80 px-5 py-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold">
          <div className="flex items-center gap-2 flex-wrap">
            {flight.seatsAvailable !== undefined ? (
              <span className={`px-2 py-0.5 rounded ${flight.seatsAvailable < 10 ? 'bg-red-600 text-white font-black shadow-sm animate-pulse' : 'bg-emerald-100 text-emerald-800'}`}>
                {flight.seatsAvailable} Seat(s) Left
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Available</span>
            )}
            <span className="bg-pink-100 text-pink-800 px-2 py-0.5 rounded">! Paid Meals</span>
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">ADT: 15 Kg / 7 Kg</span>
            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded uppercase">INSTANT FARE</span>
            <span className="text-blue-700 font-bold uppercase">Class: {flight.cabinClass || 'Economy'}</span>
          </div>
          <div className="flex items-center gap-4 text-[#0c1a40]">
            <span 
              className="cursor-pointer text-[11px] font-bold hover:text-blue-600 hover:underline transition-colors" 
              onClick={(e) => { e.stopPropagation(); setShowFareRulesForFlight(flight); }}
            >
              Fare Rules
            </span>
            <button 
              className="cursor-pointer text-[11px] font-black border border-gray-300 px-4 py-1.5 rounded flex items-center gap-1 hover:bg-gray-50 transition-colors"
              onClick={(e) => { e.stopPropagation(); setExpandedFlightId(expandedFlightId === flight._id ? null : flight._id); }}
            >
              Flight Details
              <span className={`transition-transform duration-200 ${expandedFlightId === flight._id ? 'rotate-180' : ''}`}>▼</span>
            </button>
          </div>
        </div>

        {/* Flight Details Accordion */}
        {expandedFlightId === flight._id && (
          <div 
            className="border-t border-gray-300 bg-white animate-in slide-in-from-top-2 fade-in duration-200"
            style={{ 
              backgroundImage: agentCode ? `url("data:image/svg+xml,%3Csvg width='200' height='150' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext transform='rotate(-20 100 100)' x='50' y='100' font-size='20' font-family='Arial' font-weight='bold' fill='rgba(0,0,0,0.08)'%3E${agentCode}%3C/text%3E%3C/svg%3E")` : 'none',
              backgroundRepeat: 'repeat' 
            }}
          >
            <div className="flex border-b border-gray-200 px-5">
              {['FLIGHT DETAIL', 'FARE BREAKUP', 'BAGGAGE'].map(tab => (
                <button 
                  key={tab}
                  onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }}
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
                      <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">ECONOMY - {flight.cabinClass || 'RI'} (INSTANT FARE)</p>
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold">Partially Refundable</span>
                  </div>

                  <div className="flex items-center justify-between mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-white p-2 rounded shadow-sm border border-gray-100">
                        <img src={flight.airlineLogo} alt={flight.airline} className="w-10 h-10 object-contain" />
                      </div>
                      <div>
                        <p className="font-black text-sm text-[#0c1a40]">{flight.airline}</p>
                        <p className="text-[11px] text-gray-500 font-semibold">{flight.flightNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 flex-[2] justify-center text-[#0c1a40]">
                      <div className="text-right">
                        <p className="font-black text-xl">{formatTime(flight.departureTime)}</p>
                        <p className="text-xs font-bold mt-0.5">{flight.departureAirportCode}</p>
                        <p className="text-[10px] text-gray-500">{new Date(flight.departureTime).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}</p>
                      </div>

                      <div className="flex flex-col items-center min-w-[120px]">
                        <p className="text-[10px] text-gray-400 font-bold mb-1">{formatDuration(flight.durationMinutes)}</p>
                        <div className="w-full flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full border-2 border-blue-200 bg-white" />
                          <div className="flex-1 h-px bg-gray-300" />
                          <div className="w-2 h-2 rounded-full border-2 border-blue-200 bg-white" />
                        </div>
                      </div>

                      <div className="text-left">
                        <p className="font-black text-xl">{formatTime(flight.arrivalTime)}</p>
                        <p className="text-xs font-bold mt-0.5">{flight.arrivalAirportCode}</p>
                        <p className="text-[10px] text-gray-500">{new Date(flight.arrivalTime).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}</p>
                        <p className="text-[9px] text-gray-400 mt-1">Terminal: 1</p>
                      </div>
                    </div>
                    
                    <div className="flex-1" />
                  </div>
                </div>
              )}
              {activeTab === 'FARE BREAKUP' && (
                <div className="p-4">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-300">
                      {flight.adultPrice ? (
                        <>
                          <tr className="py-2">
                            <td className="py-3 font-bold text-gray-500">Adult Fare ({adults} x {Math.round(flight.adultPrice * (getDisplayPrice(flight.price) / flight.price)).toLocaleString('en-IN')})</td>
                            <td className="py-3 text-right font-black text-[#0c1a40]">₹ {Math.round(flight.adultPrice * adults * (getDisplayPrice(flight.price) / flight.price)).toLocaleString('en-IN')}</td>
                          </tr>
                          {children > 0 && flight.childPrice ? (
                            <tr className="py-2">
                              <td className="py-3 font-bold text-gray-500">Child Fare ({children} x {Math.round(flight.childPrice * (getDisplayPrice(flight.price) / flight.price)).toLocaleString('en-IN')})</td>
                              <td className="py-3 text-right font-black text-[#0c1a40]">₹ {Math.round(flight.childPrice * children * (getDisplayPrice(flight.price) / flight.price)).toLocaleString('en-IN')}</td>
                            </tr>
                          ) : null}
                          {infants > 0 && flight.infantPrice ? (
                            <tr className="py-2">
                              <td className="py-3 font-bold text-gray-500">Infant Fare ({infants} x {Math.round(flight.infantPrice * (getDisplayPrice(flight.price) / flight.price)).toLocaleString('en-IN')})</td>
                              <td className="py-3 text-right font-black text-[#0c1a40]">₹ {Math.round(flight.infantPrice * infants * (getDisplayPrice(flight.price) / flight.price)).toLocaleString('en-IN')}</td>
                            </tr>
                          ) : null}
                        </>
                      ) : (
                        <tr className="py-2">
                          <td className="py-3 font-bold text-gray-500">Total Pax Fare</td>
                          <td className="py-3 text-right font-black text-[#0c1a40]">₹ {getDisplayPrice(flight.price).toLocaleString('en-IN')}</td>
                        </tr>
                      )}
                      <tr className="bg-gray-50">
                        <td className="py-3 px-1 font-black text-[#0c1a40]">Total Fare</td>
                        <td className="py-3 px-1 text-right font-black text-blue-600 text-lg">₹ {getDisplayPrice(flight.price).toLocaleString('en-IN')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {activeTab === 'BAGGAGE' && (
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <span className="font-bold text-gray-500 text-sm">Check-in Baggage</span>
                    <span className="font-black text-[#0c1a40] bg-blue-50 px-3 py-1 rounded-full text-xs">{flight.checkinBaggage || '15 KG'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span className="font-bold text-gray-500 text-sm">Cabin Baggage</span>
                    <span className="font-black text-[#0c1a40] bg-blue-50 px-3 py-1 rounded-full text-xs">{flight.cabinBaggage || '7 KG'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
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
                  navigate('/b2b/checkout', { state: { flight: flightToBook, fareType: selectedFareType, adults, children, infants } });
                }}
                className="bg-[#0b1031] hover:bg-blue-900 text-white font-bold text-sm px-10 py-3 rounded-full transition-all shadow-md"
              >
                Book
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* B2B Header Bar (Matching Reference Screenshot 2) */}
      <header className="bg-white border-b border-gray-200 px-8 py-2.5 flex justify-between items-center shadow-sm sticky top-0 z-50">
        {/* Logo & Category Navigation */}
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setHasSearched(false); navigate('/b2b/home'); }}>
            <button onClick={(e) => { e.stopPropagation(); setHasSearched(false); }} className="mr-2 p-2 rounded-full hover:bg-gray-100 text-gray-700 transition hidden md:block">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center justify-center">
              <img src="/tg-favicon.svg" alt="TrippeChalo" className="w-10 h-10" crossOrigin="anonymous" />
            </div>
            <div>
              <span className="text-xl font-black text-[#0c1a40] tracking-tight uppercase">TRIPPE<span className="text-blue-600">CHALO</span></span>
              <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-widest -mt-1">B2B AGENT ENGINE</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold text-gray-700">
            <div className="flex flex-col items-center gap-1 cursor-pointer text-blue-600 border-b-2 border-blue-600 pb-1">
              <div className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                <Plane size={16} />
              </div>
              <span>Flight</span>
            </div>

            <div onClick={() => navigate('/b2b/coming-soon')} className="flex flex-col items-center gap-1 cursor-pointer text-gray-600 hover:text-blue-600 transition">
              <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building2 size={16} />
              </div>
              <span>Hotel & Villas</span>
            </div>

            <div onClick={() => navigate('/b2b/coming-soon')} className="flex flex-col items-center gap-1 cursor-pointer text-gray-600 hover:text-blue-600 transition">
              <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
              <span>Insurance</span>
            </div>

            <div onClick={() => navigate('/b2b/coming-soon')} className="flex flex-col items-center gap-1 cursor-pointer text-gray-600 hover:text-blue-600 transition">
              <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                <CreditCard size={16} />
              </div>
              <span>Visa</span>
            </div>

            <div onClick={() => navigate('/b2b/coming-soon')} className="flex flex-col items-center gap-1 cursor-pointer text-gray-600 hover:text-blue-600 transition">
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
                          // Ignore for now in this view or add toast
                          toast.error('Certificate can be downloaded from Home Page.');
                        } else {
                          setShowMoreMenu(false);
                          if (item.path !== '#') navigate(item.path);
                        }
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

          <button 
            onClick={() => navigate('/b2b/dashboard/wallet')}
            className="bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer text-xs font-black px-4 py-2 rounded-full border border-gray-200"
          >
            Balance: ₹ {agentBalance.toLocaleString('en-IN')}
          </button>

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
                  <p className="text-[10px] text-gray-500 truncate">{loggedInUser?.email}</p>
                </div>
                <button 
                  onClick={() => navigate('/b2b/profile')}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-[#0c1a40] hover:bg-blue-50 flex items-center gap-2 transition"
                >
                  <Users size={14} />
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
      
      {/* Search Header Bar (Summary View) */}
      <div className="bg-[#0b1031] text-white py-3 px-8 sticky top-0 z-40 shadow-md">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between text-xs">
          
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">From</span>
              <span className="font-bold text-[15px] leading-tight">{from}</span>
            </div>
            <span className="text-gray-400 font-bold text-lg">➔</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">To</span>
              <span className="font-bold text-[15px] leading-tight">{to}</span>
            </div>

            <div className="h-8 w-px bg-white/20" />

            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Departure Date</span>
              <span className="font-bold text-[15px] leading-tight">
                {new Date(date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {tripType === 'Round Trip' && returnDate && (
              <>
                <div className="h-8 w-px bg-white/20" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Return Date</span>
                  <span className="font-bold text-[15px] leading-tight">
                    {new Date(returnDate).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </>
            )}

            <div className="h-8 w-px bg-white/20" />

            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Travellers & Class</span>
              <span className="font-bold text-[15px] leading-tight">
                {adults + children + infants} PAX, {cabinClass.split('/')[0]}
              </span>
            </div>
          </div>

          <button 
            onClick={() => setIsSearchModalOpen(true)} 
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-8 rounded-full text-xs transition uppercase shadow-md border border-blue-500"
          >
            Modify
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
          {tripType === 'Round Trip' ? (
            <div className="flex flex-col md:flex-row gap-4">
              {/* Outbound List */}
              <div className="flex-1 space-y-4">
                <h3 className="text-sm font-black text-[#0c1a40] uppercase mb-2 border-b border-gray-200 pb-2 flex items-center justify-between">
                  <span>Departure Flights</span>
                  <span className="text-xs text-gray-500 font-medium">{from} → {to}</span>
                </h3>
                {sortedOutboundFlights && sortedOutboundFlights.length > 0 ? (
                  sortedOutboundFlights.map((flight: any, idx: number) => (
                    <React.Fragment key={flight._id || idx}>
                      {renderFlightCard(flight, false)}
                    </React.Fragment>
                  ))
                ) : !loading ? (
                   <div className="bg-white p-6 text-center border border-gray-100 rounded-lg"><p className="text-gray-500 font-bold text-sm text-center py-8">No outbound flights found.</p></div>
                ) : null}
              </div>
              
              {/* Return List */}
              <div className="flex-1 space-y-4">
                <h3 className="text-sm font-black text-[#0c1a40] uppercase mb-2 border-b border-gray-200 pb-2 flex items-center justify-between">
                  <span>Return Flights</span>
                  <span className="text-xs text-gray-500 font-medium">{to} → {from}</span>
                </h3>
                {returnFlights && returnFlights.length > 0 ? (
                  returnFlights.map((flight: any, idx: number) => (
                    <React.Fragment key={flight._id || idx}>
                      {renderFlightCard(flight, true)}
                    </React.Fragment>
                  ))
                ) : !loading ? (
                   <div className="bg-white p-6 text-center border border-gray-100 rounded-lg"><p className="text-gray-500 font-bold text-sm text-center py-8">No return flights found.</p></div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedOutboundFlights && sortedOutboundFlights.length > 0 ? (
                sortedOutboundFlights.map((flight: any, idx: number) => (
                  <React.Fragment key={flight._id || idx}>
                    {renderFlightCard(flight, false)}
                  </React.Fragment>
                ))
              ) : !loading ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">No flights found</h3>
                  <p className="text-gray-500">Try adjusting your dates or filters to find more options.</p>
                </div>
              ) : null}
            </div>
          )}
          
          {loading && (
             <div className="text-center py-12">
               <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
               <p className="text-[#0c1a40] font-black mt-4 uppercase tracking-widest text-xs">Searching best deals...</p>
             </div>
          )}
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
      {/* Search Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-[10vh] overflow-y-auto" onClick={() => setIsSearchModalOpen(false)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-[1050px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-200" 
            onClick={(e) => { e.stopPropagation(); closeAllPickers(); }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
              <h2 className="text-lg font-black text-[#0c1a40]">Modify Search</h2>
              <button 
                onClick={() => setIsSearchModalOpen(false)}
                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 transition-colors"
              >
                <X size={16} strokeWidth={3} />
              </button>
            </div>

            <div className="p-8">
              {/* Flight Types */}
              <div className="flex flex-wrap items-center gap-6 mb-6">
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
                  <div className="w-full text-[32px] leading-none font-black text-gray-900 truncate bg-transparent flex flex-col mt-1">
                    {from}
                  </div>
                  
                  {isFromPickerOpen && (
                    <div className="absolute top-[100%] left-0 z-[110]" onClick={e => e.stopPropagation()}>
                      <CityPicker value={from} onChange={(c) => { setFrom(c); setIsFromPickerOpen(false); }} onClose={() => setIsFromPickerOpen(false)} title="FROM" />
                    </div>
                  )}
                  
                  {/* Swap Button */}
                  <div 
                    className="absolute right-8 lg:-right-4 top-[100%] lg:top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-[0_2px_5px_rgba(0,0,0,0.1)] flex items-center justify-center cursor-pointer hover:shadow-md transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      const temp = from;
                      setFrom(to);
                      setTo(temp);
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
                  <div className="w-full text-[32px] leading-none font-black text-gray-900 truncate bg-transparent flex flex-col mt-1">
                    {to}
                  </div>

                  {isToPickerOpen && (
                    <div className="absolute top-[100%] left-0 z-[110]" onClick={e => e.stopPropagation()}>
                      <CityPicker value={to} onChange={(c) => { setTo(c); setIsToPickerOpen(false); }} onClose={() => setIsToPickerOpen(false)} title="TO" />
                    </div>
                  )}
                </div>

                {/* Departure Date */}
                <div className="relative flex flex-col sm:flex-row w-full lg:w-auto">
                  <div 
                    className="w-full sm:flex-1 lg:w-[150px] p-3 px-5 border-b sm:border-b-0 sm:border-r border-gray-200 cursor-pointer hover:bg-blue-50/30 transition-colors group"
                    onClick={(e) => { e.stopPropagation(); closeAllPickers(); setActiveDatePicker('depart'); }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Departure</span>
                      <ChevronDown size={16} className="text-blue-600" />
                    </div>
                    {date ? (
                      <>
                        <div className="flex items-baseline gap-1 mt-1">
                          <h3 className="text-[40px] leading-none font-black text-gray-900">{format(new Date(date), 'd')}</h3>
                          <span className="text-xl font-bold text-gray-900">{format(new Date(date), "MMM''yy")}</span>
                        </div>
                        <p className="text-[12px] text-gray-500 font-medium mt-1">{format(new Date(date), 'EEEE')}</p>
                      </>
                    ) : (
                      <p className="text-sm font-bold text-gray-400 mt-3">Select Date</p>
                    )}
                    {activeDatePicker === 'depart' && (
                      <div className="absolute top-[100%] left-0 z-[110]" onClick={e => e.stopPropagation()}>
                        <DualMonthCalendar 
                          checkIn={date ? new Date(date) : null} 
                          checkOut={null}
                          onDateChange={(type, d) => {
                            if (type === 'checkIn' && d) {
                              setDate(format(d, 'yyyy-MM-dd'));
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

                  <div 
                    className="w-full sm:flex-1 lg:w-[150px] p-3 px-5 border-b lg:border-b-0 lg:border-r border-gray-200 cursor-pointer hover:bg-blue-50/30 transition-colors group relative"
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
                          <h3 className="text-[40px] leading-none font-black text-gray-900">{format(new Date(returnDate), 'd')}</h3>
                          <span className="text-xl font-bold text-gray-900">{format(new Date(returnDate), "MMM''yy")}</span>
                        </div>
                        <p className="text-[12px] text-gray-500 font-medium mt-1">{format(new Date(returnDate), 'EEEE')}</p>
                      </>
                    ) : (
                      <p className="text-[10px] text-gray-500 mt-2 leading-tight font-medium">Tap to add a return date for bigger discounts</p>
                    )}

                    {activeDatePicker === 'return' && (
                      <div className="absolute top-[100%] left-0 z-[110]" onClick={e => e.stopPropagation()}>
                        <DualMonthCalendar 
                          checkIn={returnDate ? new Date(returnDate) : null} 
                          checkOut={null}
                          onDateChange={(type, d) => {
                            if (type === 'checkIn' && d) {
                              setReturnDate(format(d, 'yyyy-MM-dd'));
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
                </div>

                {/* Travellers */}
                <div className="relative flex flex-col sm:flex-row w-full lg:w-auto">
                  <div 
                    className="w-full sm:flex-1 lg:w-[120px] p-3 px-5 border-b sm:border-b-0 sm:border-r border-gray-200 cursor-pointer hover:bg-blue-50/30 transition-colors group"
                    onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsTravellerPickerOpen(!isTravellerPickerOpen); }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Travellers</span>
                      <ChevronDown size={16} className="text-blue-600" />
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <h3 className="text-[40px] leading-none font-black text-gray-900">{adults + children + infants}</h3>
                    </div>
                    <p className="text-[12px] text-gray-700 font-bold mt-1 flex items-center gap-2.5">
                      <span className="flex items-center gap-0.5" title="Adults"><User size={14} className="text-gray-900" /> {adults}</span>
                      <span className="flex items-center gap-0.5" title="Children"><Smile size={14} className="text-gray-900" /> {children}</span>
                      <span className="flex items-center gap-0.5" title="Infants"><Baby size={14} className="text-gray-900" /> {infants}</span>
                    </p>
                  </div>

                  {isTravellerPickerOpen && (
                    <div className="absolute top-[100%] right-0 z-[110]" onClick={e => e.stopPropagation()}>
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

                {/* Cabin Class */}
                <div className="relative flex flex-col sm:flex-row w-full lg:w-auto">
                  <div 
                    className="w-full sm:flex-1 lg:w-[150px] p-3 px-5 cursor-pointer hover:bg-blue-50/30 transition-colors group"
                    onClick={(e) => { e.stopPropagation(); closeAllPickers(); setIsCabinPickerOpen(!isCabinPickerOpen); }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Cabin Class</span>
                      <ChevronDown size={16} className="text-blue-600" />
                    </div>
                    <p className="text-[15px] font-black text-gray-900 mt-2 leading-tight">
                      {cabinClass}
                    </p>
                  </div>
                  {isCabinPickerOpen && (
                    <div className="absolute top-[100%] right-0 z-[110]" onClick={e => e.stopPropagation()}>
                      <CabinClassPicker cabinClass={cabinClass} onChange={(c) => { setCabinClass(c); setIsCabinPickerOpen(false); }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end mt-8">
                <button 
                  onClick={() => {
                    setIsSearchModalOpen(false);
                    handleSearch();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black text-base py-3 px-12 rounded-xl transition shadow-lg flex items-center gap-2"
                >
                  <Search size={20} />
                  UPDATE SEARCH
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>

      {/* Sticky Footer for Selection */}
      {tripType === 'Round Trip' && selectedOutbound && selectedReturn && createPortal(
        <div className="fixed bottom-0 left-0 w-full z-[30] pointer-events-none pb-0">
          <div className="max-w-[1240px] mx-auto flex gap-6 px-4">
            <div className="w-[260px] shrink-0 hidden md:block"></div>
            <div className="flex-1 bg-[#0b1031] text-white p-3 shadow-[0_-10px_30px_rgba(0,0,0,0.4)] rounded-t-lg flex items-center justify-between pointer-events-auto border-t border-blue-900">
              
              <div className="flex gap-4 flex-1 pl-2">
                <div className="flex-1 flex items-center gap-4 pr-6 border-r border-gray-700">
                  <img src={selectedOutbound.airlineLogo} alt="" className="w-8 h-8 object-contain bg-white rounded-md p-1 shrink-0" />
                  <div className="flex flex-col justify-center flex-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Departure • {selectedOutbound.airline}</p>
                    <div className="flex items-center gap-2 text-white">
                      <span className="font-black text-[15px]">{new Date(selectedOutbound.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                      <span className="text-gray-500 text-xs">→</span>
                      <span className="font-black text-[15px]">{new Date(selectedOutbound.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-lg text-white">₹ {getDisplayPrice(selectedOutbound.price).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {selectedReturn && (
                  <div className="flex-1 flex items-center gap-4 pr-6 border-r border-gray-700">
                    <img src={selectedReturn.airlineLogo} alt="" className="w-8 h-8 object-contain bg-white rounded-md p-1 shrink-0" />
                    <div className="flex flex-col justify-center flex-1">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Return • {selectedReturn.airline}</p>
                      <div className="flex items-center gap-2 text-white">
                        <span className="font-black text-[15px]">{new Date(selectedReturn.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                        <span className="text-gray-500 text-xs">→</span>
                        <span className="font-black text-[15px]">{new Date(selectedReturn.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-lg text-white">₹ {getDisplayPrice(selectedReturn.price).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 pr-2">
                <div className="text-right flex flex-col justify-center">
                  <p className="font-black text-[22px] text-white leading-none">₹ {((selectedOutbound ? getDisplayPrice(selectedOutbound.price) : 0) + (selectedReturn ? getDisplayPrice(selectedReturn.price) : 0)).toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">Total Fare</p>
                </div>
                <button 
                  onClick={() => {
                    navigate('/b2b/checkout', { state: { selectedOutbound, selectedReturn, tripType, adults, children, infants } });
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-black py-2.5 px-8 rounded-lg text-sm transition uppercase shadow-[0_4px_14px_rgba(37,99,235,0.4)]"
                >
                  BOOK NOW
                </button>
              </div>
              
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
}

