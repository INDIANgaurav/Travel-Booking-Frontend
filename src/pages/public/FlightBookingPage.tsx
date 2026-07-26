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
  for (let i = 0; i < initialAdults; i++) initialPassengers.push({ name: '', gender: 'Male', type: 'Adult', dob: '' });
  for (let i = 0; i < initialChildren; i++) initialPassengers.push({ name: '', gender: 'Male', type: 'Child', dob: '' });
  for (let i = 0; i < initialInfants; i++) initialPassengers.push({ name: '', gender: 'Male', type: 'Infant', dob: '' });
  const [passengers, setPassengers] = useState<any[]>(initialPassengers);

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
    // Basic fields validation
    const hasEmptyNames = passengers.some((p: any) => !p.name || p.name.trim().split(' ').length < 2);
    if (hasEmptyNames) {
      toast.error('Please enter both First and Last Name for all passengers.');
      return;
    }

    if (!contactPhone || !contactEmail) {
      toast.error('Please provide contact details (Phone & Email).');
      return;
    }

    // DOB Validation for Child and Infant
    const today = new Date();
    for (const p of passengers) {
      if (p.type === 'Child' || p.type === 'Infant') {
        if (!p.dob) {
          toast.error(`Date of Birth is required for ${p.type}.`);
          return;
        }
        
        const dobDate = new Date(p.dob);
        let age = today.getFullYear() - dobDate.getFullYear();
        const m = today.getMonth() - dobDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
          age--;
        }

        if (p.type === 'Child' && (age < 2 || age >= 12)) {
          toast.error(`Child passenger must be between 2 and 12 years old.`);
          return;
        }

        if (p.type === 'Infant' && age >= 2) {
          toast.error(`Infant passenger must be under 2 years old.`);
          return;
        }
      }
    }

    if (isInternational) {
      for (const p of passengers) {
        const nat = p.nationality || 'IN';
        if (!p.passportNum || !p.passportExpiry || !nat) {
          toast.error(`Passport Number, Expiry, and Nationality are required for all passengers (International flights).`);
          return;
        }
      }
    }

    setBookingStep(3);
    if (maxStepReached < 3) setMaxStepReached(3);
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

      const baseAmount = selectedOutbound.price * totalSeatFareCount;
      const infantAmount = 2000 * infantsWithoutSeatCount;
      const taxesAmount = selectedOutbound.isSeriesFare 
        ? (selectedOutbound.agentCommission || 0) 
        : (1651 * totalSeatFareCount) + (selectedOutbound.agentCommission || 0);
      const totalAmount = baseAmount + infantAmount + taxesAmount;
      
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
          from: selectedOutbound.departureCity,
          to: selectedOutbound.arrivalCity,
          passengers: passengers,
          contactDetails: { email: contactEmail, phone: contactPhone, countryCode: '91' },
          seats: selectedSeats,
          pnr: generatedPnr,
          nexus_query: selectedOutbound.nexus_query,
          flight_keys: [selectedOutbound._id],
          currency: 'INR',
          total_price: selectedOutbound.price
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

               {passengers.map((pax: any, index: number) => (
                 <div key={index} className="mx-4 border border-gray-200 rounded mb-4 overflow-visible">
                    <div className="p-3 bg-gray-50 flex items-center justify-between border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-500 rounded border-gray-300 cursor-pointer" 
                          checked 
                          onChange={() => {
                            if (pax.type === 'Adult' && passengers.filter((p: any) => p.type === 'Adult').length <= 1) {
                              toast.error("At least 1 Adult is required.");
                              return;
                            }
                            const newPax = [...passengers];
                            newPax.splice(index, 1);
                            
                            const remainingAdults = newPax.filter(p => p.type === 'Adult').length;
                            const remainingChildren = newPax.filter(p => p.type === 'Child').length;
                            const remainingInfants = newPax.filter(p => p.type === 'Infant').length;
                            if (remainingAdults === 0 && (remainingChildren > 0 || remainingInfants > 0)) {
                               toast.error("An adult must accompany children or infants.");
                               return;
                            }
                            setPassengers(newPax);
                          }} 
                        />
                        <span className="font-bold text-[13px] text-gray-900 uppercase">
                           {pax.type === 'Adult' && `Adult ${passengers.slice(0, index + 1).filter(p => p.type === 'Adult').length} (First Name & Last name) (Above 12 Year)`}
                           {pax.type === 'Child' && `Child ${passengers.slice(0, index + 1).filter(p => p.type === 'Child').length} - (First Name & Last name & DOB) (Above 2-12 Year)`}
                           {pax.type === 'Infant' && `Infant ${passengers.slice(0, index + 1).filter(p => p.type === 'Infant').length} (Upto 2 Year) (2000)`}
                        </span>
                      </div>
                    </div>
                   <div className="p-4 bg-white">
                      <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                           <input 
                              type="text" 
                              placeholder="First & Middle Name *" 
                              className="w-full border border-gray-300 rounded p-2 text-[13px] focus:outline-none focus:border-blue-500" 
                              value={pax.name.split(' ')[0] || ''}
                              onChange={(e) => {
                                 const newPaxList = [...passengers];
                                 newPaxList[index] = { ...pax, name: e.target.value + ' ' + (pax.name.split(' ')[1] || '') };
                                 setPassengers(newPaxList);
                              }}
                           />
                        </div>
                        <div className="flex-1">
                           <input 
                              type="text" 
                              placeholder="Last Name *" 
                              className="w-full border border-gray-300 rounded p-2 text-[13px] focus:outline-none focus:border-blue-500" 
                              value={pax.name.split(' ')[1] || ''}
                              onChange={(e) => {
                                 const newPaxList = [...passengers];
                                 newPaxList[index] = { ...pax, name: (pax.name.split(' ')[0] || '') + ' ' + e.target.value };
                                 setPassengers(newPaxList);
                              }}
                           />
                        </div>
                        <div className="flex w-64 border border-gray-300 rounded overflow-hidden">
                          <div 
                            className={`flex-1 text-center py-2 text-[12px] font-bold cursor-pointer ${pax.gender === 'Male' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            onClick={() => {
                               const newPaxList = [...passengers];
                               newPaxList[index] = { ...pax, gender: 'Male' };
                               setPassengers(newPaxList);
                            }}
                          >
                            MALE
                          </div>
                          <div className="w-px bg-gray-300"></div>
                          <div 
                            className={`flex-1 text-center py-2 text-[12px] font-bold cursor-pointer ${pax.gender === 'Female' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            onClick={() => {
                               const newPaxList = [...passengers];
                               newPaxList[index] = { ...pax, gender: 'Female' };
                               setPassengers(newPaxList);
                            }}
                          >
                            FEMALE
                          </div>
                        </div>
                      </div>

                      {(pax.type === 'Child' || pax.type === 'Infant') && (
                        <div className="flex gap-4 mb-4">
                          <div className="w-1/3">
                            <label className="text-[12px] text-gray-600 mb-1 block">Date of Birth *</label>
                            <DOBCalendar 
                              value={pax.dob}
                              onChange={(date) => {
                                const newPaxList = [...passengers];
                                newPaxList[index] = { ...pax, dob: date };
                                setPassengers(newPaxList);
                              }}
                              maxDate={new Date()}
                            />
                            {pax.type === 'Infant' && <span className="text-[10px] text-gray-400">Must be under 2 years old</span>}
                            {pax.type === 'Child' && <span className="text-[10px] text-gray-400">Must be 2-12 years old</span>}
                          </div>
                          {pax.type === 'Infant' && (
                            <div className="w-1/2 flex items-center pt-5">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 text-blue-500 rounded border-gray-300" 
                                  checked={pax.requiresSeat || false}
                                  onChange={(e) => {
                                     const newPaxList = [...passengers];
                                     newPaxList[index] = { ...pax, requiresSeat: e.target.checked };
                                     setPassengers(newPaxList);
                                  }}
                                />
                                <span className="text-[12px] text-gray-700 font-bold">Book a dedicated seat for this infant (Full fare applies)</span>
                              </label>
                            </div>
                          )}
                        </div>
                      )}

                      {isInternational && (
                        <div className="flex items-end gap-4 mt-4 mb-2">
                           <div className="flex-1">
                             <label className="text-[12px] text-gray-600 mb-1 block font-semibold">Passport Number (Intl Flights)</label>
                             <input 
                                type="text" 
                                placeholder="e.g. A1234567" 
                                className="w-full border border-gray-300 rounded p-2 text-[13px] focus:outline-none focus:border-blue-500 uppercase" 
                                value={pax.passportNum || ''}
                                onChange={(e) => {
                                   const newPaxList = [...passengers];
                                   newPaxList[index] = { ...pax, passportNum: e.target.value.toUpperCase() };
                                   setPassengers(newPaxList);
                                }}
                             />
                           </div>
                           <div className="flex-1">
                              <label className="text-[12px] text-gray-600 mb-1 block font-semibold">Passport Expiry</label>
                              <DOBCalendar 
                                value={pax.passportExpiry}
                                onChange={(date) => {
                                  const newPaxList = [...passengers];
                                  newPaxList[index] = { ...pax, passportExpiry: date };
                                  setPassengers(newPaxList);
                                }}
                                maxDate={new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000)} // Allow up to 10 years in future
                              />
                           </div>
                           <div className="flex-1">
                             <label className="text-[12px] text-gray-600 mb-1 block font-semibold">Nationality</label>
                             <input 
                                type="text" 
                                placeholder="e.g. IN" 
                                className="w-full border border-gray-300 rounded p-2 text-[13px] focus:outline-none focus:border-blue-500 uppercase" 
                                value={pax.nationality || 'IN'}
                                onChange={(e) => {
                                   const newPaxList = [...passengers];
                                   newPaxList[index] = { ...pax, nationality: e.target.value.toUpperCase() };
                                   setPassengers(newPaxList);
                                }}
                             />
                           </div>
                         </div>
                      )}
                   </div>
                 </div>
               ))}

               <div className="px-6 py-4 flex flex-wrap gap-3">
                  <button 
                    onClick={() => setPassengers([...passengers, { name: '', gender: 'Male', type: 'Adult', dob: '' }])}
                    className="flex items-center gap-1 border border-blue-600 text-blue-600 px-4 py-1.5 rounded text-sm font-bold hover:bg-blue-50"
                  >
                    + ADD NEW ADULT
                  </button>
                  <button 
                    onClick={() => setPassengers([...passengers, { name: '', gender: 'Male', type: 'Child', dob: '' }])}
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
                      setPassengers([...passengers, { name: '', gender: 'Male', type: 'Infant', dob: '' }]);
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
                   <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border border-gray-300 rounded-[4px] text-gray-300 flex items-center justify-center font-bold text-[10px]">×</div> Occupied</div>
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
                                 {isUnavailable ? '×' : (isXL && !isSelected ? 'XL' : (isSelected ? '✓' : ''))}
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
                                 {isUnavailable ? '×' : (isXL && !isSelected ? 'XL' : (isSelected ? '✓' : ''))}
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
               {/* Base Fare */}
               <div className="border-b border-gray-100 py-2">
                 <div 
                   className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-1 -mx-1 rounded"
                   onClick={() => setShowBaseFare(!showBaseFare)}
                 >
                    <span className="text-gray-600 flex items-center gap-2">
                      <span className="border border-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                        {showBaseFare ? '-' : '+'}
                      </span> 
                      Base Fare
                    </span>
                    <span className="font-medium">₹ {(((selectedOutbound.baseFare || selectedOutbound.price) * totalSeatFareCount) + (2000 * infantsWithoutSeatCount)).toLocaleString('en-IN')}</span>
                 </div>
                 {showBaseFare && (
                   <div className="pl-6 pr-1 py-2 text-sm text-gray-500 space-y-1 bg-gray-50 mt-1 rounded-md">
                     <div className="flex justify-between">
                       <span>Adult(s) ({adultsCount} X ₹ {(selectedOutbound.baseFare || selectedOutbound.price).toLocaleString('en-IN')})</span>
                       <span>₹ {((selectedOutbound.baseFare || selectedOutbound.price) * adultsCount).toLocaleString('en-IN')}</span>
                     </div>
                     {childrenCount > 0 && (
                       <div className="flex justify-between">
                         <span>Child(ren) ({childrenCount} X ₹ {(selectedOutbound.baseFare || selectedOutbound.price).toLocaleString('en-IN')})</span>
                         <span>₹ {((selectedOutbound.baseFare || selectedOutbound.price) * childrenCount).toLocaleString('en-IN')}</span>
                       </div>
                     )}
                     {infantsWithSeatCount > 0 && (
                       <div className="flex justify-between">
                         <span>Infant(s) with Seat ({infantsWithSeatCount} X ₹ {(selectedOutbound.baseFare || selectedOutbound.price).toLocaleString('en-IN')})</span>
                         <span>₹ {((selectedOutbound.baseFare || selectedOutbound.price) * infantsWithSeatCount).toLocaleString('en-IN')}</span>
                       </div>
                     )}
                     {infantsWithoutSeatCount > 0 && (
                       <div className="flex justify-between">
                         <span>Infant(s) on Lap ({infantsWithoutSeatCount} X ₹ 2,000)</span>
                         <span>₹ {(2000 * infantsWithoutSeatCount).toLocaleString('en-IN')}</span>
                       </div>
                     )}
                   </div>
                 )}
               </div>

               {/* Taxes and Surcharges */}
               <div className="border-b border-gray-100 py-2">
                 <div 
                   className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-1 -mx-1 rounded"
                   onClick={() => setShowTaxes(!showTaxes)}
                 >
                    <span className="text-gray-600 flex items-center gap-2">
                      <span className="border border-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                        {showTaxes ? '-' : '+'}
                      </span> 
                      Taxes and Surcharges
                    </span>
                    <span className="font-medium">₹ {((selectedOutbound.isSeriesFare ? 0 : 1651 * totalSeatFareCount) + (selectedOutbound.agentCommission || 0)).toLocaleString('en-IN')}</span>
                 </div>
                 {showTaxes && (
                   <div className="pl-6 pr-1 py-2 text-sm text-gray-500 space-y-1 bg-gray-50 mt-1 rounded-md">
                     {selectedOutbound.isSeriesFare ? (
                        <div className="flex justify-between">
                          <span>Airline Taxes & Fees</span>
                          <span>₹ {(selectedOutbound.agentCommission || 0).toLocaleString('en-IN')}</span>
                        </div>
                     ) : (
                       <>
                         <div className="flex justify-between">
                           <span>Airline Taxes</span>
                           <span>₹ {((850 * totalSeatFareCount) + (selectedOutbound.agentCommission || 0)).toLocaleString('en-IN')}</span>
                         </div>
                         <div className="flex justify-between">
                           <span>Fee & Surcharge</span>
                           <span>₹ {(801 * totalSeatFareCount).toLocaleString('en-IN')}</span>
                         </div>
                       </>
                     )}
                   </div>
                 )}
               </div>

               {/* Total */}
               <div className="flex justify-between items-center py-4 mt-2">
                  <span className="font-bold text-gray-900 text-[18px]">Total Amount</span>
                  <span className="text-xl font-black">₹ {(((selectedOutbound.baseFare || selectedOutbound.price) * totalSeatFareCount) + (2000 * infantsWithoutSeatCount) + (selectedOutbound.isSeriesFare ? 0 : 1651 * totalSeatFareCount) + (selectedOutbound.agentCommission || 0)).toLocaleString('en-IN')}</span>
               </div>
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
