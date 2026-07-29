import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated, selectAgentBookingMode } from '../../store/authSlice';
import { Calendar, User, Search, MapPin, CheckCircle, ChevronDown, Check, Briefcase, Plus, ArrowRight, Plane, Coffee, Shield, Armchair, ArrowLeft } from 'lucide-react';
import Dropdown from '../../components/ui/Dropdown';
import DOBCalendar from '../../components/ui/DOBCalendar';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function FlightBookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const agentBookingMode = useSelector(selectAgentBookingMode);

  const { selectedOutbound, selectedReturn, tripType, adults: initialAdults = 1, children: initialChildren = 0, infants: initialInfants = 0 } = location.state || {};

  const [bookingStep, setBookingStep] = useState(1); 
  const [maxStepReached, setMaxStepReached] = useState(1); 
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  const initialPassengers = [];
  for (let i = 0; i < initialAdults; i++) initialPassengers.push({ title: '', firstName: '', lastName: '', type: 'Adult', nationality: 'IN' });
  for (let i = 0; i < initialChildren; i++) initialPassengers.push({ title: '', firstName: '', lastName: '', type: 'Child', nationality: 'IN' });
  for (let i = 0; i < initialInfants; i++) initialPassengers.push({ title: '', firstName: '', lastName: '', type: 'Infant', nationality: 'IN' });
  const [passengers, setPassengers] = useState<any[]>(initialPassengers);

  const requireDob = selectedOutbound?.inputRequirements?.dob?.required;
  const requirePassport = selectedOutbound?.inputRequirements?.passport?.required || requireDob;
  const [showErrors, setShowErrors] = useState(false);

  const adultsCount = passengers.filter(p => p.type === 'Adult').length;
  const childrenCount = passengers.filter(p => p.type === 'Child').length;
  const infantsCount = passengers.filter(p => p.type === 'Infant').length;
  const infantsWithSeatCount = passengers.filter(p => p.type === 'Infant' && p.requiresSeat).length;
  const infantsWithoutSeatCount = passengers.filter(p => p.type === 'Infant' && !p.requiresSeat).length;
  const totalSeatFareCount = adultsCount + childrenCount + infantsWithSeatCount;

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // List of major Indian airport codes to determine domestic vs international
  const indianAirports = new Set(['DEL','BOM','NMI','BLR','MAA','CCU','HYD','AMD','PNQ','GOI','GOX','COK','TRV','CCJ','JAI','ATQ','LKO','BBI','PAT','GAU','IXB','IXZ','IXC','SXR','VNS','BHO','IDR','NAG','RPR','BDQ','STV']);
  const isInternational = selectedOutbound && (!indianAirports.has(selectedOutbound.departureAirportCode) || !indianAirports.has(selectedOutbound.arrivalAirportCode));

  // Fare summary states
  const [showBaseFare, setShowBaseFare] = useState(false);
  const [showTaxes, setShowTaxes] = useState(false);
  
  useEffect(() => {
    if (!selectedOutbound) {
      toast.error('No flight selected!');
      navigate('/flights/search');
    }
  }, [selectedOutbound, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setContactEmail(user.email || '');
      setContactPhone('9876543210');
    }
  }, [isAuthenticated, user]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const validateAndContinueToStep3 = () => {
    setShowErrors(true);
    // Basic fields validation
    const isValid = passengers.every((p: any) => {
      const hasName = p.title !== '' && p.firstName && p.lastName;
      const dobValid = (p.type === 'Child' || p.type === 'Infant' || requireDob) ? !!p.dob : true;
      const passportValid = requirePassport ? (!!p.passportNumber && !!p.passportExpiry) : true;
      return hasName && dobValid && passportValid;
    });

    if (!isValid) {
      toast.error('Please fill in all required passenger details.');
      return;
    }

    if (!contactPhone || !contactEmail) {
      toast.error('Please provide contact details (Phone & Email).');
      return;
    }

    setBookingStep(3);
    if (maxStepReached < 3) setMaxStepReached(3);
  };

  const handlePassengerChange = (index: number, field: string, value: any) => {
    const newPaxList = [...passengers];
    newPaxList[index] = { ...newPaxList[index], [field]: value };
    setPassengers(newPaxList);
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      const res = await loadRazorpayScript();
      
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(false);
        return;
      }

        const totalAmount = selectedOutbound.price + (tripType === 'Round Trip' && selectedReturn ? selectedReturn.price : 0);
      
      // Check availability before payment (Only for Nexus flights)
      if (!selectedOutbound.isSeriesFare) {
        try {
          await api.post('/api/searches/flights/check', {
            query: selectedOutbound.nexus_query,
            flight_keys: [selectedOutbound._id],
            total_price: selectedOutbound.price,
            currency: 'INR'
          });
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Flight is no longer available. Please search again.');
          setIsProcessing(false);
          return;
        }
      }

      const generatedPnr = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data } = await api.post('/api/bookings/flight', {
        bookingMode: agentBookingMode,
        totalAmount,
        date: selectedOutbound.departureTime,
        details: {
          airline: selectedOutbound.airline,
          flightNo: selectedOutbound.flightNumber,
          from: selectedOutbound.departureAirportCode,
          to: selectedOutbound.arrivalAirportCode,
          arrivalTime: selectedOutbound.arrivalTime,
          duration: selectedOutbound.durationMinutes,
          stops: selectedOutbound.stops,
          passengers: passengers.map((p: any) => ({
            name: `${p.firstName} ${p.lastName}`,
            type: p.type,
            title: p.title,
            gender: p.title === 'Mr' || p.title === 'Mstr' ? 'Male' : 'Female',
            dob: p.dob,
            passportNum: p.passportNumber,
            passportExpiry: p.passportExpiry,
            nationality: p.nationality
          })),
          contactDetails: { email: contactEmail, phone: contactPhone, countryCode: '91' },
          seats: selectedSeats,
          pnr: generatedPnr,
          nexus_query: selectedOutbound.nexus_query,
          flight_keys: [selectedOutbound._id],
          currency: 'INR',
          total_price: selectedOutbound.nexus_total_price || selectedOutbound.price
        }
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TAetNo496ol1Iz',
        amount: data.amount,
        currency: data.currency,
        name: 'Travel Booking App',
        description: 'Flight Booking Transaction',
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            await api.post('/api/bookings/payment/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });
            
            toast.success('Payment successful! Booking confirmed.');
            navigate(`/dashboard/invoice/${data.booking._id}`);
          } catch (error) {
            toast.error('Payment verification failed.');
          }
        },
        prefill: {
          name: passengers[0]?.name || 'Test User',
          email: contactEmail || 'test@example.com',
          contact: contactPhone || '9999999999'
        },
        theme: {
          color: '#2563eb'
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error(error);
      toast.error('Could not initiate payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedOutbound) return null;

  return (
    <div className="min-h-screen bg-[#e5eef5] pb-20">
      <div className="bg-[#0a1930] text-white py-4 px-6 md:px-20 flex items-center justify-between shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-full transition hover:bg-white/10 text-white"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black hidden sm:block">Complete your booking</h1>
        </div>
        <div className="hidden md:flex items-center space-x-6 text-[13px] text-gray-400">
          <span 
            className={`font-medium transition-colors ${bookingStep >= 1 ? 'text-white font-bold' : ''} ${maxStepReached >= 1 ? 'cursor-pointer hover:text-white' : 'cursor-not-allowed opacity-50'}`} 
            onClick={() => { if (maxStepReached >= 1) setBookingStep(1); }}
          >Trip Summary</span>
          <span>•</span>
          <span 
            className={`transition-colors ${bookingStep >= 2 ? 'text-white font-bold' : ''} ${maxStepReached >= 2 ? 'cursor-pointer hover:text-white' : 'cursor-not-allowed opacity-50'}`} 
            onClick={() => { if (maxStepReached >= 2) setBookingStep(2); }}
          >Traveller Details</span>
          <span>•</span>
          <span 
            className={`transition-colors ${bookingStep >= 3 ? 'text-white font-bold' : ''} ${maxStepReached >= 3 ? 'cursor-pointer hover:text-white' : 'cursor-not-allowed opacity-50'}`} 
            onClick={() => { if (maxStepReached >= 3) setBookingStep(3); }}
          >Seats & Meals</span>
          <span>•</span>
          <span 
            className={`transition-colors ${bookingStep >= 4 ? 'text-white font-bold' : ''} ${maxStepReached >= 4 ? 'cursor-pointer hover:text-white' : 'cursor-not-allowed opacity-50'}`} 
            onClick={() => { if (maxStepReached >= 4) setBookingStep(4); }}
          >Add-ons</span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* STEP 1: REVIEW ITINERARY */}
          {bookingStep === 1 && (
            <div className="bg-white shadow-sm rounded border border-gray-200 overflow-hidden">
               <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                 <h2 className="text-[20px] font-bold text-gray-900">{selectedOutbound.departureCity} → {selectedOutbound.arrivalCity}</h2>
                 <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">CANCELLATION FEES APPLY</span>
               </div>
               
               <div className="p-4">
                 <div className="flex justify-between items-center mb-4">
                   <div className="flex items-center gap-2 text-[12px] text-gray-800 font-bold">
                     <span className="text-gray-900 font-bold">{new Date(selectedOutbound.departureTime).toLocaleDateString('en-GB', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                     <span className="text-gray-500 font-normal ml-2">Non Stop · {Math.floor(selectedOutbound.durationMinutes / 60)}h {selectedOutbound.durationMinutes % 60}m</span>
                   </div>
                   <span className="text-blue-500 text-[12px] font-bold cursor-pointer hover:underline">View Fare Rules</span>
                 </div>

                 <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                   <div className="flex items-center gap-3">
                     <img src={selectedOutbound.airlineLogo} alt="Airline" className="w-6 h-6 object-contain" />
                     <span className="font-bold text-gray-800 text-[14px]">{selectedOutbound.airline}</span>
                     <span className="text-gray-500 text-[12px]">{selectedOutbound.flightNumber}</span>
                   </div>
                   <div className="text-[12px] text-gray-500 font-bold">
                     <span className="text-green-700 uppercase">{selectedOutbound.cabinClass || 'Economy'}</span>
                   </div>
                 </div>

                 <div className="bg-[#f4f4f4] rounded p-4 mb-4 flex text-[14px] text-gray-800 font-medium relative">
                   <div className="w-16 text-right font-bold text-[16px] leading-tight">
                     {new Date(selectedOutbound.departureTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                     <br/><br/><br/>
                     {new Date(selectedOutbound.arrivalTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                   </div>
                   <div className="mx-4 flex flex-col items-center mt-1">
                     <div className="w-2.5 h-2.5 rounded-full border-2 border-gray-400 bg-[#f4f4f4]"></div>
                     <div className="w-px h-10 border-l border-dashed border-gray-400 my-1"></div>
                     <div className="w-2.5 h-2.5 rounded-full border-2 border-gray-400 bg-[#f4f4f4]"></div>
                   </div>
                   <div className="flex-1">
                     <div className="font-bold text-[14px] mb-6 uppercase">{selectedOutbound.departureCity} <span className="text-[11px] font-normal text-gray-500 block mt-0.5">{selectedOutbound.departureAirportCode} Airport, Terminal {selectedOutbound.departureTerminal || (selectedOutbound.departureAirportCode === 'DEL' ? 'T1D' : selectedOutbound.departureAirportCode === 'BOM' ? 'T2' : 'T1')}</span></div>
                     <div className="font-bold text-[14px] uppercase">{selectedOutbound.arrivalCity} <span className="text-[11px] font-normal text-gray-500 block mt-0.5">{selectedOutbound.arrivalAirportCode} Airport, Terminal {selectedOutbound.arrivalTerminal || (selectedOutbound.arrivalAirportCode === 'DEL' ? 'T1D' : selectedOutbound.arrivalAirportCode === 'BOM' ? 'T2' : 'T1')}</span></div>
                   </div>
                   
                   <div className="absolute top-4 right-4 flex items-center gap-1 opacity-50">
                     <span className="text-[16px]">🍽️</span>
                     <span className="text-[16px]">🔌</span>
                   </div>
                 </div>
                 
                 <div className="flex items-center gap-6 text-[12px] text-gray-800 font-bold border-t border-gray-100 pt-4 mb-2">
                    <div className="flex items-center gap-2"><span className="text-yellow-600 text-[14px]">🎒</span> Cabin Baggage: <span className="font-normal text-gray-600 ml-1">7 Kgs / Adult</span></div>
                    <div className="flex items-center gap-2"><span className="text-yellow-600 text-[14px]">🧳</span> Check-In Baggage: <span className="font-normal text-gray-600 ml-1">15 Kgs / Adult</span></div>
                 </div>
               </div>

               <div className="px-4 py-3 bg-[#eaf5fe] text-[12px] flex items-center justify-between font-bold text-gray-800 border-t border-[#d6eaff]">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500 text-[16px]">🧳</span> Got excess baggage? Don't stress, buy extra check-in baggage allowance for {selectedOutbound.departureAirportCode}-{selectedOutbound.arrivalAirportCode} at fab rates!
                  </div>
                  <span className="text-blue-500 cursor-pointer uppercase">ADD BAGGAGE</span>
               </div>

               <div className="p-4 border-t border-gray-200 bg-white flex justify-end shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                  <button onClick={() => { setBookingStep(2); if (maxStepReached < 2) setMaxStepReached(2); }} className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-bold shadow-md hover:bg-blue-700 uppercase text-sm">CONTINUE</button>
               </div>
            </div>
          )}

          {/* STEP 2: TRAVELLER DETAILS */}
          {bookingStep === 2 && (
            <div className="bg-white shadow-sm rounded border border-gray-200 overflow-visible">
               <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                 <h2 className="text-[20px] font-bold text-gray-900">Traveller Details</h2>
               </div>
               
               <div className="p-4 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-[#eaf5fe] text-blue-600 flex items-center justify-center"><User size={18} /></div>
                   <span className="font-bold text-gray-800 text-[15px]">PASSENGER DETAILS</span>
                 </div>
                 <span className="text-[13px] text-gray-500 font-bold">{passengers.length} <span className="font-normal">added</span></span>
               </div>
               
               <div className="mx-4 bg-[#fef5e6] text-[12px] text-gray-800 p-3 rounded mb-4 font-medium border border-[#fae2b8]">
                 <span className="font-bold">Important:</span> Enter name as mentioned on your passport or Government approved IDs.
               </div>

                  {passengers.map((p, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-100 relative">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-black text-[#0c1a40] uppercase">{p.type} {idx + 1} ▾</h4>
                        {passengers.length > 1 && (
                          <button 
                            onClick={() => setPassengers(passengers.filter((_, i) => i !== idx))} 
                            className="text-red-500 hover:text-red-700 font-bold text-[10px] uppercase border border-red-200 px-2 py-1 rounded bg-red-50"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-[#0c1a40] mb-1">Title</label>
                          <div className={showErrors && !p.title ? "rounded-lg ring-1 ring-red-500" : ""}>
                            <Dropdown
                              value={p.title}
                              onChange={(val) => handlePassengerChange(idx, 'title', val)}
                              options={
                                p.type.toUpperCase() === 'ADULT' 
                                  ? [
                                      { value: '', label: 'Select' },
                                      { value: 'Mr', label: 'Mr' },
                                      { value: 'Ms', label: 'Ms' },
                                      { value: 'Mrs', label: 'Mrs' }
                                    ]
                                  : [
                                      { value: '', label: 'Select' },
                                      { value: 'Mstr', label: 'Mstr' },
                                      { value: 'Miss', label: 'Miss' }
                                    ]
                              }
                              placeholder="Select"
                            />
                          </div>
                          {showErrors && !p.title && <div className="text-[9px] text-red-500 mt-1">Required</div>}
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#0c1a40] mb-1">First Name</label>
                          <input type="text" placeholder="FIRST NAME" value={p.firstName} onChange={(e) => handlePassengerChange(idx, 'firstName', e.target.value)} className={`w-full border ${showErrors && !p.firstName ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-xs font-semibold outline-none placeholder-gray-300 text-[#0c1a40]`} />
                          {showErrors && !p.firstName && <div className="text-[9px] text-red-500 mt-1">Required</div>}
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#0c1a40] mb-1">Last Name</label>
                          <input type="text" placeholder="LAST NAME" value={p.lastName} onChange={(e) => handlePassengerChange(idx, 'lastName', e.target.value)} className={`w-full border ${showErrors && !p.lastName ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-xs font-semibold outline-none placeholder-gray-300 text-[#0c1a40]`} />
                          {showErrors && !p.lastName && <div className="text-[9px] text-red-500 mt-1">Required</div>}
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#0c1a40] mb-1">Nationality</label>
                          <Dropdown
                            value={p.nationality}
                            onChange={(val) => handlePassengerChange(idx, 'nationality', val)}
                            options={[
                              { value: 'IN', label: 'India' },
                              { value: 'US', label: 'United States' },
                              { value: 'GB', label: 'United Kingdom' },
                              { value: 'AE', label: 'UAE' },
                              { value: 'AU', label: 'Australia' },
                              { value: 'OTHER', label: 'Other' }
                            ]}
                            placeholder="Select"
                          />
                        </div>

                        {(p.type.toUpperCase() === 'CHILD' || p.type.toUpperCase() === 'INFANT' || selectedOutbound?.inputRequirements?.dob?.required) && (
                          <div className="relative">
                            <label className="block text-[10px] font-bold text-[#0c1a40] mb-1">Date of Birth</label>
                            {(() => {
                              let ageErrorMsg = '';
                              if (p.dob) {
                                const selectedOutboundDate = new Date(selectedOutbound.departureTime);
                                const dobDate = new Date(p.dob);
                                let age = selectedOutboundDate.getFullYear() - dobDate.getFullYear();
                                const m = selectedOutboundDate.getMonth() - dobDate.getMonth();
                                if (m < 0 || (m === 0 && selectedOutboundDate.getDate() < dobDate.getDate())) {
                                  age--;
                                }
                                if (p.type.toUpperCase() === 'CHILD') {
                                  if (age < 2) ageErrorMsg = 'Must be at least 2 yrs (Book as Infant)';
                                  else if (age >= 12) ageErrorMsg = 'Must be under 12 yrs (Book as Adult)';
                                }
                                if (p.type.toUpperCase() === 'INFANT' && age >= 2) {
                                  ageErrorMsg = 'Must be under 2 yrs (Book as Child)';
                                }
                              }
                              
                              const isError = (showErrors && !p.dob) || ageErrorMsg;

                              return (
                                <>
                                  <div className={`h-[34px] w-full border ${isError ? 'border-red-500' : 'border-gray-300'} rounded bg-white relative [&>div]:h-full [&>div>div:first-child]:h-full [&>div>div:first-child]:border-none [&>div>div:first-child]:bg-transparent [&>div>div:first-child]:py-0 [&>div>div:first-child]:px-3`}>
                                    <DOBCalendar 
                                      value={p.dob || ''} 
                                      onChange={(val) => handlePassengerChange(idx, 'dob', val)} 
                                      placeholder="Select DOB"
                                    />
                                  </div>
                                  {isError && (
                                    <div className="text-[9px] text-red-500 mt-1 font-bold">
                                      {ageErrorMsg || 'Required'}
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        )}
                        
                        {requirePassport && (
                          <>
                            <div className="relative">
                              <label className="block text-[10px] font-bold text-[#0c1a40] mb-1">Passport Number</label>
                              <input 
                                type="text" 
                                value={p.passportNumber || ''} 
                                onChange={(e) => handlePassengerChange(idx, 'passportNumber', e.target.value.toUpperCase())}
                                className={`w-full border ${showErrors && !p.passportNumber ? 'border-red-500' : 'border-gray-300'} rounded px-3 h-[34px] text-[11px] font-bold outline-none uppercase placeholder:normal-case`}
                                placeholder="Enter Passport No"
                              />
                              {showErrors && !p.passportNumber && <div className="text-[9px] text-red-500 mt-1 font-bold">Required</div>}
                            </div>
                            <div className="relative">
                              <label className="block text-[10px] font-bold text-[#0c1a40] mb-1">Passport Expiry</label>
                              <div className={`h-[34px] w-full border ${showErrors && !p.passportExpiry ? 'border-red-500' : 'border-gray-300'} rounded bg-white relative [&>div]:h-full [&>div>div:first-child]:h-full [&>div>div:first-child]:border-none [&>div>div:first-child]:bg-transparent [&>div>div:first-child]:py-0 [&>div>div:first-child]:px-3`}>
                                <DOBCalendar 
                                  value={p.passportExpiry || ''} 
                                  onChange={(val) => handlePassengerChange(idx, 'passportExpiry', val)} 
                                  placeholder="Expiry Date"
                                  initialDate={new Date(new Date().setFullYear(new Date().getFullYear() + 10))}
                                />
                              </div>
                              {showErrors && !p.passportExpiry && <div className="text-[9px] text-red-500 mt-1 font-bold">Required</div>}
                            </div>
                          </>
                        )}
                        
                        {p.type.toUpperCase() === 'INFANT' && (
                          <div className={`${requirePassport ? 'col-span-3' : 'col-span-2'} flex items-center mt-6`}>
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0c1a40]">
                              <input type="checkbox" checked={!!p.requiresSeat} onChange={(e) => handlePassengerChange(idx, 'requiresSeat', e.target.checked)} className="rounded" />
                              Need a separate seat? (Full Fare Applicable)
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

               <div className="px-6 py-4 flex flex-wrap gap-3">
                  <button 
                    onClick={() => setPassengers([...passengers, { title: '', firstName: '', lastName: '', type: 'Adult', nationality: 'IN' }])}
                    className="flex items-center gap-1 border border-blue-600 text-blue-600 px-4 py-1.5 rounded text-sm font-bold hover:bg-blue-50"
                  >
                    + ADD NEW ADULT
                  </button>
                  <button 
                    onClick={() => setPassengers([...passengers, { title: '', firstName: '', lastName: '', type: 'Child', nationality: 'IN' }])}
                    className="flex items-center gap-1 border border-blue-600 text-blue-600 px-4 py-1.5 rounded text-sm font-bold hover:bg-blue-50"
                  >
                    + ADD NEW CHILD
                  </button>
                  <button 
                    onClick={() => {
                      if (infantsCount >= adultsCount) {
                        toast.error("Infants cannot exceed the number of Adults.");
                        return;
                      }
                      setPassengers([...passengers, { title: '', firstName: '', lastName: '', type: 'Infant', nationality: 'IN' }]);
                    }}
                    className="flex items-center gap-1 border border-blue-600 text-blue-600 px-4 py-1.5 rounded text-sm font-bold hover:bg-blue-50"
                  >
                    + ADD NEW INFANT
                  </button>
               </div>

               <div className="px-6 py-2 border-t border-gray-100 bg-[#f4f4f4]">
                 <h3 className="font-bold text-[14px] text-gray-800 mb-4 mt-2">Booking details will be sent to</h3>
                 <div className="flex gap-4">
                   <div className="w-1/3">
                     <label className="text-[12px] text-gray-500 mb-1 block">Country Code <span className="text-red-500">*</span></label>
                     <Dropdown
                       value="India(91)"
                       onChange={() => {}}
                       options={[
                         { value: 'India(91)', label: 'India(91)' }
                       ]}
                     />
                   </div>
                   <div className="w-1/3">
                     <label className="text-[12px] text-gray-500 mb-1 block">Mobile No <span className="text-red-500">*</span></label>
                     <input type="text" className="w-full border border-gray-300 bg-white rounded p-2 text-[13px]" defaultValue={user?.phone || '9876543210'} onChange={(e) => setContactPhone(e.target.value)} />
                   </div>
                   <div className="w-1/3">
                     <label className="text-[12px] text-gray-500 mb-1 block">Email <span className="text-red-500">*</span></label>
                     <input type="email" className="w-full border border-gray-300 bg-white rounded p-2 text-[13px]" defaultValue={user?.email || ''} onChange={(e) => setContactEmail(e.target.value)} />
                   </div>
                 </div>
                 
                 <div className="mt-6 flex items-center gap-2 mb-6">
                   <input type="checkbox" className="w-4 h-4 text-blue-500 rounded border-gray-300" />
                   <span className="text-[13px] font-bold text-gray-800">I have a GST number <span className="font-normal text-gray-500">(Optional)</span></span>
                 </div>
               </div>

               <div className="p-4 border-t border-gray-200 bg-white flex justify-end shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                  <button onClick={validateAndContinueToStep3} className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-bold shadow-md hover:bg-blue-700 uppercase text-sm">CONTINUE</button>
               </div>
            </div>
          )}

          {/* STEP 3: SEATS */}
          {bookingStep === 3 && (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
               <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                 <Plane className="text-gray-500 w-5 h-5 transform rotate-45" />
                 <h2 className="text-xl font-bold text-gray-900">Seats</h2>
               </div>
               
               <div className="p-4 bg-gray-50">
                 <div className="flex justify-between items-center bg-white p-3 border border-gray-200 rounded">
                   <div className="flex items-center gap-2">
                     <span className="font-bold text-gray-800 text-[14px]">New Delhi → Navi Mumbai</span>
                     <span className="text-[12px] text-gray-500">{selectedSeats.length} of {totalSeatFareCount} Seat(s) Selected</span>
                     {selectedSeats.length > 0 && (
                       <span className="text-[12px] font-bold text-white bg-green-500 px-2 py-0.5 rounded ml-2">
                         Seat(s): {selectedSeats.join(', ')}
                       </span>
                     )}
                   </div>
                   <div className="text-right">
                     <span className="font-bold text-gray-800 text-[14px]">₹ 301</span>
                     <p className="text-[10px] text-gray-500">Added to fare</p>
                   </div>
                 </div>
               </div>

               {/* Airplane Visual - Simplified Rectangular Layout */}
               <div className="bg-gray-50 w-full py-8 flex justify-center relative">
                 
                 {/* Legend */}
                 <div className="absolute top-6 left-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-[11px] text-gray-700 flex flex-col gap-2 z-10 w-[180px]">
                   <h4 className="font-bold border-b border-gray-100 pb-2 mb-1">Seat Legend</h4>
                   <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded-[4px] shadow-inner border border-green-600"></div> Selected</div>
                   <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#93c5fd] rounded-[4px]"></div> Available</div>
                   <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#c4b5fd] rounded-[4px]"></div> Extra Legroom</div>
                   <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border border-gray-300 rounded-[4px] text-gray-300 flex items-center justify-center font-bold text-[10px]">✕</div> Occupied</div>
                 </div>

                 {/* Simplified Rectangular Body */}
                 <div className="relative w-[340px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden py-8">
                   <div className="flex flex-col items-center w-full">
                     
                     <div className="text-sm font-bold text-gray-400 mb-6 tracking-widest uppercase">Front</div>

                     {/* Column Headers */}
                     <div className="flex gap-8 mb-4 text-[12px] font-bold text-gray-700 w-full justify-center pl-2">
                       <div className="flex gap-2 w-[90px] justify-between">
                         <span className="w-6 text-center">A</span>
                         <span className="w-6 text-center">B</span>
                         <span className="w-6 text-center">C</span>
                       </div>
                       <div className="flex gap-2 w-[90px] justify-between">
                         <span className="w-6 text-center">D</span>
                         <span className="w-6 text-center">E</span>
                         <span className="w-6 text-center">F</span>
                       </div>
                     </div>

                     {/* Rows */}
                     {Array.from({ length: 30 }, (_, i) => i + 1).map((row) => (
                       <div key={row} className="flex gap-8 mb-2 items-center text-[10px] w-full justify-center">
                         <span className="w-4 text-right font-bold text-gray-500 absolute left-6">{row}</span>
                         
                         {/* ABC Seats */}
                         <div className="flex gap-2 w-[90px]">
                           {['A', 'B', 'C'].map(col => {
                             const seatId = `${row}${col}`;
                             // Deterministic unavailability
                             const isUnavailable = (row * 7 + col.charCodeAt(0)) % 5 === 0;
                             const isXL = row <= 3;
                             const isSelected = selectedSeats.includes(seatId);
                             
                             let bg = '';
                             if (isUnavailable) bg = 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed';
                             else if (isSelected) bg = 'bg-green-500 text-white shadow-inner border border-green-600 hover:bg-green-600 cursor-pointer scale-110 transition-transform';
                             else if (isXL) bg = 'bg-[#c4b5fd] text-white hover:bg-indigo-400 cursor-pointer shadow-sm border border-[#a78bfa]';
                             else bg = 'bg-[#93c5fd] text-white hover:bg-blue-400 cursor-pointer shadow-sm border border-[#60a5fa]';
                             
                             return (
                               <div 
                                 key={col} 
                                 onClick={() => {
                                   if (isUnavailable) return;
                                   if (isSelected) {
                                     setSelectedSeats(prev => prev.filter(s => s !== seatId));
                                   } else {
                                     if (selectedSeats.length >= totalSeatFareCount) {
                                       toast.error(`You can only select ${totalSeatFareCount} seats.`);
                                       return;
                                     }
                                     setSelectedSeats(prev => [...prev, seatId]);
                                   }
                                 }}
                                 className={`w-7 h-7 rounded-[6px] flex items-center justify-center font-bold text-[9px] transition-colors ${bg}`}
                               >
                                 {isUnavailable ? '✕' : (isXL && !isSelected ? 'XL' : (isSelected ? '✓' : ''))}
                               </div>
                             );
                           })}
                         </div>

                         {/* DEF Seats */}
                         <div className="flex gap-2 w-[90px]">
                           {['D', 'E', 'F'].map(col => {
                             const seatId = `${row}${col}`;
                             const isUnavailable = (row * 11 + col.charCodeAt(0)) % 7 === 0;
                             const isXL = row <= 3;
                             const isSelected = selectedSeats.includes(seatId);
                             
                             let bg = '';
                             if (isUnavailable) bg = 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed';
                             else if (isSelected) bg = 'bg-green-500 text-white shadow-inner border border-green-600 hover:bg-green-600 cursor-pointer scale-110 transition-transform';
                             else if (isXL) bg = 'bg-[#c4b5fd] text-white hover:bg-indigo-400 cursor-pointer shadow-sm border border-[#a78bfa]';
                             else bg = 'bg-[#93c5fd] text-white hover:bg-blue-400 cursor-pointer shadow-sm border border-[#60a5fa]';
                             
                             return (
                               <div 
                                 key={col} 
                                 onClick={() => {
                                   if (isUnavailable) return;
                                   if (isSelected) {
                                     setSelectedSeats(prev => prev.filter(s => s !== seatId));
                                   } else {
                                     if (selectedSeats.length >= totalSeatFareCount) {
                                       toast.error(`You can only select ${totalSeatFareCount} seats.`);
                                       return;
                                     }
                                     setSelectedSeats(prev => [...prev, seatId]);
                                   }
                                 }}
                                 className={`w-7 h-7 rounded-[6px] flex items-center justify-center font-bold text-[9px] transition-colors ${bg}`}
                               >
                                 {isUnavailable ? '✕' : (isXL && !isSelected ? 'XL' : (isSelected ? '✓' : ''))}
                               </div>
                             );
                           })}
                         </div>

                         <span className="w-4 text-left font-bold text-gray-500 absolute right-6">{row}</span>
                       </div>
                     ))}
                     <div className="text-sm font-bold text-gray-400 mt-6 tracking-widest uppercase">Rear</div>
                   </div>
                 </div>
               </div>

               <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end relative z-20">
                  <button onClick={() => { setBookingStep(4); if (maxStepReached < 4) setMaxStepReached(4); }} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-md hover:bg-blue-700">CONTINUE</button>
               </div>
            </div>
          )}

          {/* STEP 4: ADD-ONS (Inactive) */}
          {bookingStep < 4 && (
             <div className="bg-white p-4 rounded-lg border border-gray-200 text-gray-500 font-bold flex justify-between cursor-pointer shadow-sm hover:bg-gray-50" onClick={() => bookingStep >= 3 && setBookingStep(4)}>
               <span>Add-ons</span>
             </div>
          )}
          {bookingStep === 4 && (
             <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
               <h2 className="text-xl font-bold text-gray-900 mb-4">Add-ons</h2>
               <p className="text-sm text-gray-500 mb-6">No add-ons selected.</p>
               <button 
                  disabled={isProcessing}
                  onClick={handlePayment}
                  className={`bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-md w-full md:w-auto ${isProcessing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
               >
                  {isProcessing ? 'PROCESSING...' : 'PROCEED TO PAY'}
               </button>
             </div>
          )}
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-4">
          {/* Fare Summary */}
          <div className="bg-white shadow-sm rounded-t-lg border-x border-t border-gray-200">
             <div className="p-4 border-b border-gray-200">
               <h3 className="font-bold text-[18px] text-gray-900">Fare Summary</h3>
             </div>
             <div className="p-4">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-300">
                    {selectedOutbound.adultPrice ? (
                      <>
                        <tr className="py-2">
                          <td className="py-3 font-bold text-gray-500">Adult Fare ({adultsCount} x {Math.round(selectedOutbound.adultPrice).toLocaleString('en-IN')})</td>
                          <td className="py-3 px-1 text-right font-black text-[#0c1a40]">₹ {Math.round(selectedOutbound.adultPrice * adultsCount).toLocaleString('en-IN')}</td>
                        </tr>
                        {childrenCount > 0 && selectedOutbound.childPrice ? (
                          <tr className="py-2">
                            <td className="py-3 font-bold text-gray-500">Child Fare ({childrenCount} x {Math.round(selectedOutbound.childPrice).toLocaleString('en-IN')})</td>
                            <td className="py-3 px-1 text-right font-black text-[#0c1a40]">₹ {Math.round(selectedOutbound.childPrice * childrenCount).toLocaleString('en-IN')}</td>
                          </tr>
                        ) : null}
                        {infantsCount > 0 && selectedOutbound.infantPrice ? (
                          <tr className="py-2">
                            <td className="py-3 font-bold text-gray-500">Infant Fare ({infantsCount} x {Math.round(selectedOutbound.infantPrice).toLocaleString('en-IN')})</td>
                            <td className="py-3 px-1 text-right font-black text-[#0c1a40]">₹ {Math.round(selectedOutbound.infantPrice * infantsCount).toLocaleString('en-IN')}</td>
                          </tr>
                        ) : null}
                      </>
                    ) : (
                      <tr className="py-2">
                        <td className="py-3 font-bold text-gray-500">Total Pax Fare</td>
                        <td className="py-3 px-1 text-right font-black text-[#0c1a40]">₹ {selectedOutbound.price.toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
             
             {/* Total Amount */}
             <div className="bg-gray-50 p-4 border-t border-gray-200 rounded-b-lg flex justify-between items-center">
                <span className="font-black text-gray-900 text-[18px]">Total Amount</span>
                <span className="text-[22px] font-black text-blue-600">₹ {selectedOutbound.price.toLocaleString('en-IN')}</span>
             </div>
          </div>

          {/* Coupons */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-b-lg">
             <div className="p-4 bg-[#fdf2e9] border-b border-[#f7e0ce] flex justify-between items-center">
               <h3 className="font-bold text-[16px] text-gray-900">Coupons and Offers</h3>
               <div className="text-orange-500">🎁</div>
             </div>
             <div className="p-4">
               <input type="text" placeholder="Enter coupon code" className="w-full border border-gray-300 rounded p-2 text-[13px] mb-4" />
               <div className="flex border border-blue-400 rounded overflow-hidden text-[13px] mb-4">
                 <button className="flex-1 bg-[#f4f8fe] text-blue-600 font-bold py-2 border-r border-gray-200">All</button>
                 <button className="flex-1 bg-white text-gray-600 py-2 border-r border-gray-200 hover:bg-gray-50">Bank</button>
                 <button className="flex-1 bg-white text-gray-600 py-2 hover:bg-gray-50">Add-ons</button>
               </div>
               <div className="border border-gray-200 rounded p-3 mb-3 bg-[#fdfdfd]">
                 <div className="flex justify-between mb-1">
                   <div className="flex items-center gap-2 font-bold text-[14px]">
                     <span className="bg-[#249995] text-white w-5 h-5 rounded flex items-center justify-center text-[12px]">%</span>
                     FLYPROMO
                   </div>
                   <span className="font-bold text-[#249995] text-[13px]">₹ 410 off</span>
                 </div>
                 <p className="text-[11px] text-gray-500 mb-2">Get ₹ 410 instant discount on your flight booking</p>
                 <div className="text-right">
                   <button className="text-blue-600 font-bold text-[12px] hover:underline">Apply</button>
                 </div>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
