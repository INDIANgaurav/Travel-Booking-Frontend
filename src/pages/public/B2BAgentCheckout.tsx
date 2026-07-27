import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plane, ChevronUp, Clock, Info, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import DOBCalendar from '../../components/ui/DOBCalendar';
import Dropdown from '../../components/ui/Dropdown';
export interface Passenger {
  type: 'ADULT' | 'CHILD' | 'INFANT';
  title: string;
  firstName: string;
  lastName: string;
  nationality: string;
  dob?: string;
  needSeparateSeat?: boolean;
}

const B2BAgentCheckout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(16 * 60 + 3); // 16m 3s
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showBaseFareDetails, setShowBaseFareDetails] = useState(false);
  const [showTaxesDetails, setShowTaxesDetails] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Agency Account');

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

  // Extract flight and fare details from router state
  const flight = location.state?.flight;
  const fareType = location.state?.fareType || 'Coupon fares';
  const adults = location.state?.adults || 1;
  const childrenCount = location.state?.children || 0;
  const infants = location.state?.infants || 0;

  const [passengers, setPassengers] = useState<Passenger[]>(() => {
    const p: Passenger[] = [];
    for (let i = 0; i < adults; i++) p.push({ type: 'ADULT', title: '', firstName: '', lastName: '', nationality: 'INDIA' });
    for (let i = 0; i < childrenCount; i++) p.push({ type: 'CHILD', title: '', firstName: '', lastName: '', nationality: 'INDIA', dob: '' });
    for (let i = 0; i < infants; i++) p.push({ type: 'INFANT', title: '', firstName: '', lastName: '', nationality: 'INDIA', dob: '', needSeparateSeat: false });
    return p;
  });

  const handlePassengerChange = (index: number, field: keyof Passenger, value: any) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleContinue = () => {
    const hasChildOrInfant = passengers.some(p => p.type === 'CHILD' || p.type === 'INFANT');
    const hasAdult = passengers.some(p => p.type === 'ADULT');

    if (hasChildOrInfant && !hasAdult) {
      toast.error('At least one adult is required when travelling with children or infants');
      return;
    }

    const isValid = passengers.every(p => {
      const hasName = p.title !== '' && p.firstName && p.lastName;
      if (p.type === 'CHILD' || p.type === 'INFANT') {
        return hasName && p.dob;
      }
      return hasName;
    }) && mobile.length === 10 && email.includes('@');

    if (!isValid) {
      setShowErrors(true);
      return;
    }
    setCurrentStep(3);
  };

  const handleConfirmBooking = async () => {
    try {
      setIsBooking(true);

      if (paymentMethod !== 'Agency Account') {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error('Razorpay SDK failed to load. Are you online?');
          setIsBooking(false);
          return;
        }
      }

      const { data } = await api.post('/api/bookings/flight', {
        totalAmount: totalFare,
        date: flight.departureTime,
        bookingMode: paymentMethod === 'Agency Account' ? 'MYBIZ' : 'PERSONAL',
        details: {
          flight_keys: [flight._id],
          passengers: passengers.map(p => ({
            name: `${p.firstName} ${p.lastName}`,
            type: p.type,
            title: p.title,
            gender: p.title === 'Mr' || p.title === 'Mstr' ? 'Male' : 'Female',
            dob: p.dob,
            needsSeat: p.needSeparateSeat
          })),
          contactDetails: { email, phone: mobile },
          ...(flight.nexus_query && {
            nexus_query: flight.nexus_query,
            currency: 'INR',
            total_price: flight.price
          })
        }
      });
      
      if (paymentMethod === 'Agency Account') {
        toast.success('Booking Created successfully!');
        navigate('/b2b/booking-status', { state: { booking: data.booking } });
      } else {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TAetNo496ol1Iz',
          amount: data.amount,
          currency: data.currency,
          name: 'Travel Booking App',
          description: 'B2B Flight Booking',
          order_id: data.orderId,
          handler: async function (response: any) {
            try {
              await api.post('/api/bookings/payment/verify', {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              });
              
              toast.success('Payment successful! Booking confirmed.');
              navigate('/b2b/booking-status', { state: { booking: data.booking } });
            } catch (error) {
              toast.error('Payment verification failed.');
            }
          },
          prefill: {
            name: passengers[0]?.firstName || 'B2B Agent',
            email: email || 'agent@example.com',
            contact: mobile || '9999999999'
          },
          theme: {
            color: '#2563eb'
          }
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.on('payment.failed', function(response: any) {
           toast.error(response.error.description);
        });
        paymentObject.open();
      }
    } catch (e: any) {
      toast.error('Failed to create booking');
    } finally {
      setIsBooking(false);
    }
  };

  // If no flight selected, bounce back to home
  useEffect(() => {
    if (!flight) {
      navigate('/b2b/home');
    }
  }, [flight, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!flight) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Pricing calculations based on dynamically added passengers
  const adultCount = passengers.filter(p => p.type === 'ADULT').length;
  const childCount = passengers.filter(p => p.type === 'CHILD').length;
  const infantWithSeatCount = passengers.filter(p => p.type === 'INFANT' && p.needSeparateSeat).length;
  const infantNoSeatCount = passengers.filter(p => p.type === 'INFANT' && !p.needSeparateSeat).length;

  const basePricePerPax = flight.price;
  const taxPerFullPax = Math.round(basePricePerPax * 0.15); // 15% estimated taxes
  const baseFarePerFullPax = basePricePerPax - taxPerFullPax;

  const infantFlatTotal = 2000;
  const infantTax = 0; // Flat fare, no tax on infant without seat
  const infantBase = infantFlatTotal;

  const totalBaseFare = 
    (adultCount * baseFarePerFullPax) + 
    (childCount * baseFarePerFullPax) + 
    (infantWithSeatCount * baseFarePerFullPax) + 
    (infantNoSeatCount * infantBase);

  const taxesAndFees = 
    (adultCount * taxPerFullPax) + 
    (childCount * taxPerFullPax) + 
    (infantWithSeatCount * taxPerFullPax) + 
    (infantNoSeatCount * infantTax);

  const totalFare = totalBaseFare + taxesAndFees;

  return (
    <div className="min-h-screen bg-[#f4f7fb] font-sans pb-24 text-[#0c1a40]">
      {/* Top Header Navigation */}
      <div className="bg-white border-b border-gray-200 py-3 mb-6 shadow-sm relative">
        <div className="absolute left-8 top-1/2 -translate-y-1/2">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-bold text-[#0c1a40] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            ← Back
          </button>
        </div>
        <div className="max-w-[1200px] mx-auto flex items-center justify-center gap-4">
          
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#0b1031] text-white flex items-center justify-center font-bold text-sm mb-1">
              1
            </div>
            <span className="text-xs font-black text-[#0b1031]">Flight Details</span>
          </div>

          <div className="w-32 h-[1px] bg-gray-300 -mt-5"></div>

          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-white border border-gray-300 text-gray-500 flex items-center justify-center font-bold text-sm mb-1">
              2
            </div>
            <span className="text-xs font-bold text-gray-500">Traveller Details</span>
          </div>

          <div className="w-32 h-[1px] bg-gray-300 -mt-5"></div>

          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-white border border-gray-300 text-gray-500 flex items-center justify-center font-bold text-sm mb-1">
              3
            </div>
            <span className="text-xs font-bold text-gray-500">Payments</span>
          </div>

        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 flex gap-6 items-start">
        
        {/* Left Column - Main Content */}
        <div className="flex-1 space-y-6">
          
          {/* Flight Details Card */}
          {currentStep === 1 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="bg-[#f8f9fc] border-b border-gray-200 px-6 py-3 flex justify-between items-center rounded-t-lg">
                <div className="flex items-center gap-2 font-black text-[#0c1a40] text-sm">
                  <div className="w-6 h-6 rounded-full bg-[#0b1031] flex items-center justify-center text-white">
                    <Plane size={14} />
                  </div>
                  Flight Details
                </div>
                <button className="text-[10px] font-bold flex items-center gap-1 text-[#0c1a40]">
                  Change Flight <ChevronUp size={14} />
                </button>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="text-[10px] font-bold text-[#0c1a40]">
                    {fareType} (HR) | <span className="text-emerald-600">Refundable</span>
                  </div>
                  <div className="bg-[#eef2f9] text-[#0c1a40] text-[10px] font-bold px-4 py-1 rounded-full border border-blue-100">
                    One Way
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 w-[25%]">
                    <img src={flight.airlineLogo} alt="Airline" className="w-10 h-10 object-contain" />
                    <div>
                      <div className="font-black text-[#0c1a40]">{flight.airline.slice(0, 2).toUpperCase()}</div>
                      <div className="text-[10px] text-gray-500 font-bold">{flight.flightNumber}</div>
                    </div>
                  </div>

                  <div className="w-[75%] flex justify-between items-center">
                    <div>
                      <div className="text-lg font-black text-[#0c1a40]">
                        {new Date(flight.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </div>
                      <div className="text-[11px] font-bold text-[#0c1a40] uppercase">
                        {flight.departureCity === flight.departureAirportCode 
                          ? flight.departureCity 
                          : `${flight.departureCity} - ${flight.departureAirportCode}`} (T : {flight.departureTerminal || (flight.departureAirportCode === 'DEL' ? '1D' : flight.departureAirportCode === 'BOM' ? '2' : '1')})
                      </div>
                      <div className="text-[9px] text-gray-400">{new Date(flight.departureTime).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>

                    <div className="flex flex-col items-center flex-1 px-8">
                      <div className="text-[10px] text-gray-400 font-bold mb-1">
                        {Math.floor(flight.durationMinutes / 60)}h {flight.durationMinutes % 60}m
                      </div>
                      <div className="w-full flex items-center relative">
                        <div className="w-full h-px bg-gray-300"></div>
                        <Plane size={14} className="text-gray-400 absolute left-1/2 -ml-2 -mt-1 transform rotate-90" />
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-[#0c1a40]">
                        {new Date(flight.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </div>
                      <div className="text-[11px] font-bold text-[#0c1a40] uppercase">
                        {flight.arrivalCity === flight.arrivalAirportCode 
                          ? flight.arrivalCity 
                          : `${flight.arrivalCity} - ${flight.arrivalAirportCode}`} (T : {flight.arrivalTerminal || (flight.arrivalAirportCode === 'DEL' ? '1D' : flight.arrivalAirportCode === 'BOM' ? '2' : '1')})
                      </div>
                      <div className="text-[9px] text-gray-400">{new Date(flight.arrivalTime).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between items-center">
                  <div className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    ! Paid Meals
                  </div>
                  <button className="text-[10px] font-bold text-gray-600 border border-gray-300 px-4 py-1.5 rounded bg-white hover:bg-gray-50">
                    Fare Rules
                  </button>
                </div>
              </div>
              {/* Red bottom accent line */}
              <div className="h-0.5 w-full bg-red-600 rounded-b-lg"></div>
            </div>
          ) : (
            <div 
              className="bg-white border-b-2 border-red-600 px-6 py-4 flex justify-between items-center rounded shadow-sm cursor-pointer hover:bg-gray-50"
              onClick={() => setCurrentStep(1)}
            >
              <div className="flex items-center gap-2 font-black text-[#0c1a40] text-sm">
                <div className="w-6 h-6 rounded-full bg-[#0b1031] flex items-center justify-center text-white">
                  <Plane size={14} />
                </div>
                Flight Details
              </div>
              <button className="text-[10px] font-bold flex items-center gap-1 text-[#0c1a40]">
                Change Flight <span className="text-xs">▼</span>
              </button>
            </div>
          )}

          {/* Traveller Details Card */}
          {currentStep === 2 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              
              <div className="relative border-b border-gray-100 pb-8">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#f0f4ff] text-blue-800 text-[10px] font-bold px-4 py-1 rounded-full">
                  Enter Traveller Details
                </div>
                
                <p className="text-[10px] text-gray-500 mb-4">(Name must be entered as per government valid ID Proof)</p>
                <div className="space-y-6">
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
                              options={[
                                { value: '', label: 'Select' },
                                { value: 'Mr', label: 'Mr' },
                                { value: 'Ms', label: 'Ms' },
                                { value: 'Mrs', label: 'Mrs' },
                                { value: 'Mstr', label: 'Mstr' },
                                { value: 'Miss', label: 'Miss' }
                              ]}
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
                            options={[{ value: 'INDIA', label: 'INDIA' }]}
                            placeholder="Select"
                          />
                        </div>

                        {(p.type === 'CHILD' || p.type === 'INFANT') && (
                          <div className="relative">
                            <label className="block text-[10px] font-bold text-[#0c1a40] mb-1">Date of Birth</label>
                            <div className={`h-[34px] w-full border ${showErrors && !p.dob ? 'border-red-500' : 'border-gray-300'} rounded bg-white relative [&>div]:h-full [&>div>div:first-child]:h-full [&>div>div:first-child]:border-none [&>div>div:first-child]:bg-transparent [&>div>div:first-child]:py-0 [&>div>div:first-child]:px-3`}>
                              <DOBCalendar 
                                value={p.dob || ''} 
                                onChange={(val) => handlePassengerChange(idx, 'dob', val)} 
                                placeholder="Select DOB"
                              />
                            </div>
                            {showErrors && !p.dob && <div className="text-[9px] text-red-500 mt-1">Required</div>}
                          </div>
                        )}
                        
                        {p.type === 'INFANT' && (
                          <div className="col-span-2 flex items-center mt-6">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0c1a40]">
                              <input type="checkbox" checked={!!p.needSeparateSeat} onChange={(e) => handlePassengerChange(idx, 'needSeparateSeat', e.target.checked)} className="rounded" />
                              Need a separate seat? (Full Fare Applicable)
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dynamic Passenger Add Buttons */}
                <div className="flex gap-4 mt-6 border-t border-gray-100 pt-6">
                  {passengers.length < (flight.availableSeats || 9) ? (
                    <>
                      <button 
                        onClick={() => setPassengers([...passengers, { type: 'ADULT', title: '', firstName: '', lastName: '', nationality: 'INDIA' }])}
                        className="flex-1 border border-[#0b1031] text-[#0b1031] font-bold text-[10px] uppercase py-2.5 rounded hover:bg-gray-50 transition"
                      >
                        + Add Adult
                      </button>
                      <button 
                        onClick={() => setPassengers([...passengers, { type: 'CHILD', title: '', firstName: '', lastName: '', nationality: 'INDIA', dob: '' }])}
                        className="flex-1 border border-[#0b1031] text-[#0b1031] font-bold text-[10px] uppercase py-2.5 rounded hover:bg-gray-50 transition"
                      >
                        + Add Child
                      </button>
                      <button 
                        onClick={() => setPassengers([...passengers, { type: 'INFANT', title: '', firstName: '', lastName: '', nationality: 'INDIA', dob: '', needSeparateSeat: false }])}
                        className="flex-1 border border-[#0b1031] text-[#0b1031] font-bold text-[10px] uppercase py-2.5 rounded hover:bg-gray-50 transition"
                      >
                        + Add Infant
                      </button>
                    </>
                  ) : (
                    <div className="w-full text-center text-xs font-bold text-red-500 py-2">
                      Maximum {flight.availableSeats || 9} passengers allowed for this flight.
                    </div>
                  )}
                </div>

              </div>

              <div className="relative border-b border-gray-100 pb-8 pt-4">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f0f4ff] text-blue-800 text-[10px] font-bold px-4 py-1 rounded-full">
                  Contact Information
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] text-gray-500">(Your ticket and flight info will be sent here)</p>
                  <label className="flex items-center gap-2 text-[10px] text-gray-600 cursor-pointer">
                    <input type="checkbox" className="rounded" /> Fill My Contact
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#0c1a40] mb-1">Mobile Number <span className="text-red-500">*</span></label>
                    <div className="flex">
                      <div className="bg-gray-50 border border-gray-300 border-r-0 rounded-l px-3 py-2 text-xs font-bold text-[#0c1a40]">+91</div>
                      <input type="text" placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} className={`flex-1 border ${showErrors && mobile.length !== 10 ? 'border-red-500' : 'border-gray-300'} rounded-r px-3 py-2 text-xs font-semibold outline-none placeholder-gray-300 text-[#0c1a40]`} />
                    </div>
                    {showErrors && mobile.length !== 10 && <div className="text-[9px] text-red-500 mt-1">Enter a valid 10-digit mobile number</div>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#0c1a40] mb-1">Email ID <span className="text-red-500">*</span></label>
                    <input type="email" placeholder="Email ID" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full border ${showErrors && !email.includes('@') ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-xs font-semibold outline-none placeholder-gray-300 text-[#0c1a40]`} />
                    {showErrors && !email.includes('@') && <div className="text-[9px] text-red-500 mt-1">Enter a valid email</div>}
                  </div>
                </div>
              </div>

              <div className="relative pt-4">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f0f4ff] text-blue-800 text-[10px] font-bold px-4 py-1 rounded-full">
                  Buy Additional Services
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <button className="flex items-center justify-center gap-2 border border-gray-200 rounded py-3 text-[10px] font-bold text-[#0c1a40] hover:bg-gray-50 uppercase">
                    <span className="text-blue-500 text-lg">💼</span> BAGGAGE
                  </button>
                  <button className="flex items-center justify-center gap-2 border border-gray-200 rounded py-3 text-[10px] font-bold text-[#0c1a40] hover:bg-gray-50 uppercase">
                    <span className="text-blue-500 text-lg">⏭</span> FASTFORWARD
                  </button>
                  <button className="flex items-center justify-center gap-2 border border-gray-200 rounded py-3 text-[10px] font-bold text-[#0c1a40] hover:bg-gray-50 uppercase">
                    <span className="text-pink-500 text-lg">👜</span> ADDITIONAL BAGGAGE
                  </button>
                  <button className="flex items-center justify-center gap-2 border border-gray-200 rounded py-3 text-[10px] font-bold text-[#0c1a40] hover:bg-gray-50 uppercase">
                    <span className="text-blue-500 text-lg">♿</span> WHEELCHAIR
                  </button>
                  <button className="flex items-center justify-center gap-2 border border-gray-200 rounded py-3 text-[10px] font-bold text-[#0c1a40] hover:bg-gray-50 uppercase">
                    <span className="text-blue-500 text-lg">💺</span> SEAT
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 text-right">
                <button 
                  onClick={handleContinue}
                  className="bg-[#0b1031] text-white font-bold text-sm px-8 py-3 rounded shadow hover:bg-blue-900 transition"
                >
                  Continue to Payment
                </button>
              </div>

            </div>
          ) : currentStep > 2 ? (
            <div 
              className="bg-white border-b-2 border-red-600 px-6 py-4 flex justify-between items-center rounded shadow-sm cursor-pointer hover:bg-gray-50"
              onClick={() => setCurrentStep(2)}
            >
              <div className="flex items-center gap-2 font-black text-[#0c1a40] text-sm">
                <div className="w-6 h-6 rounded-full bg-[#0b1031] flex items-center justify-center text-white text-xs">
                  👥
                </div>
                Traveller Details
              </div>
              <button className="text-[10px] font-bold flex items-center gap-1 text-[#0c1a40]">
                Frequent Passengers <span className="text-xs">▼</span>
              </button>
            </div>
          ) : (
            <div className="text-center pt-4">
              <button 
                onClick={() => setCurrentStep(2)}
                className="bg-[#0b1031] text-white font-bold text-sm px-8 py-3 rounded-full shadow-lg hover:bg-blue-900 transition"
              >
                Add Passenger Details
              </button>
            </div>
          )}

          {/* Payment Card */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2 font-black text-[#0c1a40] text-sm">
                  <div className="w-6 h-6 rounded-full bg-[#0b1031] flex items-center justify-center text-white text-xs">
                    💳
                  </div>
                  Payment
                </div>
                <div className="text-[10px] font-bold text-gray-500">
                  Available Balance: <span className="text-[#0c1a40] text-xs font-black">₹716.24 ▲</span>
                </div>
              </div>

              <div className="flex gap-6">
                {/* Left Side: Payment Options */}
                <div className="w-[35%] space-y-3">
                   {['Credit Card', 'Net Banking', 'UPI', 'Debit Card', 'Agency Account'].map(method => {
                     const isSelected = paymentMethod === method;
                     return (
                       <div 
                         key={method} 
                         onClick={() => setPaymentMethod(method)}
                         className={`border rounded-full px-4 py-2 flex items-center gap-3 cursor-pointer transition ${isSelected ? 'border-blue-300 bg-[#e0effe]' : 'border-gray-200 hover:bg-gray-50'}`}
                       >
                         <input type="radio" name="paymentMethod" checked={isSelected} readOnly className={`w-3 h-3 ${isSelected ? 'accent-blue-600' : ''}`} />
                         <span className="text-xs font-bold text-[#0c1a40]">{method}</span>
                       </div>
                     );
                   })}
                </div>

                {/* Right Side: Form */}
                <div className="w-[65%] pl-6 border-l border-gray-100">
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">
                    Agency Internal Office Remarks* <br/>
                    <span className="font-normal italic">(DEL-BOM 22-Jul-2026)</span>
                  </label>
                  <input type="text" placeholder="Type any internal note for this booking" className="w-full border border-gray-200 rounded px-3 py-2 text-xs outline-none mb-6 text-[#0c1a40]" />
                  
                  <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-50">
                    <div className="text-xs text-gray-500 font-bold">
                      You are Paying <span className="text-[#0c1a40] text-sm font-black">₹{(totalFare).toLocaleString('en-IN')}.00</span>
                    </div>
                    <button 
                      onClick={() => setShowReviewModal(true)}
                      className="bg-[#0b1031] text-white font-bold text-xs px-8 py-2.5 rounded-full shadow hover:bg-blue-900 transition"
                    >
                      Proceed
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column - Fare Summary Sidebar */}
        <div className="w-[320px] shrink-0 sticky top-24">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
            <div className="bg-[#f8f9fc] px-4 py-4 text-[10px] font-black text-[#0c1a40] uppercase border-b border-gray-100">
              FARE SUMMARY
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <div 
                  className="flex justify-between items-center text-xs font-black text-[#0c1a40] cursor-pointer"
                  onClick={() => setShowBaseFareDetails(!showBaseFareDetails)}
                >
                  <span>Base Fare <span className="text-gray-400 ml-1 text-xs font-normal">{showBaseFareDetails ? '▲' : '▼'}</span></span>
                  <span>₹{(totalBaseFare).toLocaleString('en-IN')}.00</span>
                </div>
                {showBaseFareDetails && (
                  <div className="mt-2 pl-2 space-y-1 text-[10px] text-gray-600">
                    {adultCount > 0 && (
                      <div className="flex justify-between">
                        <span>{adultCount} Adult(s) ({adultCount} X ₹{(baseFarePerFullPax).toLocaleString('en-IN')})</span>
                        <span>₹{(adultCount * baseFarePerFullPax).toLocaleString('en-IN')}.00</span>
                      </div>
                    )}
                    {childCount > 0 && (
                      <div className="flex justify-between mt-1">
                        <span>{childCount} Child(ren) ({childCount} X ₹{(baseFarePerFullPax).toLocaleString('en-IN')})</span>
                        <span>₹{(childCount * baseFarePerFullPax).toLocaleString('en-IN')}.00</span>
                      </div>
                    )}
                    {infantWithSeatCount > 0 && (
                      <div className="flex justify-between mt-1 text-purple-600">
                        <span>{infantWithSeatCount} Infant(s) w/ Seat ({infantWithSeatCount} X ₹{(baseFarePerFullPax).toLocaleString('en-IN')})</span>
                        <span>₹{(infantWithSeatCount * baseFarePerFullPax).toLocaleString('en-IN')}.00</span>
                      </div>
                    )}
                    {infantNoSeatCount > 0 && (
                      <div className="flex justify-between mt-1 text-blue-600">
                        <span>{infantNoSeatCount} Infant(s) ({infantNoSeatCount} X ₹{(infantBase).toLocaleString('en-IN')})</span>
                        <span>₹{(infantNoSeatCount * infantBase).toLocaleString('en-IN')}.00</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <div 
                  className="flex justify-between items-center text-xs font-black text-[#0c1a40] cursor-pointer"
                  onClick={() => setShowTaxesDetails(!showTaxesDetails)}
                >
                  <span>Taxes and Fees <span className="text-gray-400 ml-1 text-xs font-normal">{showTaxesDetails ? '▲' : '▼'}</span></span>
                  <span>₹{(taxesAndFees).toLocaleString('en-IN')}.00</span>
                </div>
                {showTaxesDetails && (
                  <div className="mt-2 pl-2 space-y-1 text-[10px] text-gray-600">
                    <div className="flex justify-between">
                      <span>Airline Taxes & Surcharges</span>
                      <span>₹{(taxesAndFees).toLocaleString('en-IN')}.00</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#f8f9fc] p-4 flex justify-between items-center text-xs font-black text-[#0c1a40] border-t border-gray-100">
              <span>Total Fare</span>
              <span>₹{(totalFare).toLocaleString('en-IN')}.00</span>
            </div>

          </div>
        </div>

      </div>

      {/* Bottom Sticky Timer Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-[#0b1031] text-white py-2 text-center text-[10px] font-bold shadow-2xl z-50 flex items-center justify-center gap-2">
        <Clock size={12} />
        Your Session will Expire in {minutes}m {seconds}s , you must complete the booking within the time .
      </div>

      {/* Review Booking Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[1000px] max-h-[95vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <h2 className="text-xl font-black text-[#0c1a40]">REVIEW YOUR BOOKING</h2>
              <div className="flex items-center gap-4">
                <div className="bg-[#f0f4ff] text-[#0c1a40] text-xs font-black px-4 py-1.5 rounded-full border border-blue-100 uppercase">
                  {flight.departureAirportCode} ➔ {flight.arrivalAirportCode} (ONE_WAY)
                </div>
                <button onClick={() => setShowReviewModal(false)} className="text-[#0c1a40] hover:bg-gray-100 p-1.5 rounded-full">
                  <X size={18} strokeWidth={3} />
                </button>
              </div>
            </div>

            <div className="p-6 flex gap-6 items-start bg-white">
              {/* Left Content */}
              <div className="w-[70%] space-y-6">
                
                {/* Flight Info Box */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="text-center text-[10px] font-bold text-gray-500 mb-6 uppercase">
                    One Way {new Date(flight.departureTime).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  
                  <div className="font-black text-sm text-[#0c1a40] mb-4 uppercase">
                    {flight.departureCity} ({flight.departureAirportCode}) ➔ {flight.arrivalCity} ({flight.arrivalAirportCode})
                  </div>
                  
                  <div className="flex items-center gap-2 text-[9px] font-bold text-gray-600 mb-6">
                    <span className="border border-gray-200 rounded-full px-3 py-1">1 Adult</span>
                    <span className="border border-gray-200 rounded-full px-3 py-1">ONE_WAY</span>
                    <span className="border border-gray-200 rounded-full px-3 py-1 uppercase">{flight.cabinClass || 'ECONOMY'}</span>
                    <span className="border border-gray-200 rounded-full px-3 py-1">{flight.stops === 0 ? 'Non-Stop' : `${flight.stops} Stop(s)`}</span>
                    <span className="border border-gray-200 rounded-full px-3 py-1">
                      {Math.floor(flight.durationMinutes / 60)}h : {flight.durationMinutes % 60}m
                    </span>
                    <span className="border border-gray-200 rounded-full px-3 py-1">HR</span>
                    <span className="text-emerald-600 font-black px-1">Refundable</span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-black text-[#0c1a40]">
                    <div className="flex items-center gap-3 w-1/4">
                      <span className="text-gray-500">{flight.airline.slice(0, 2).toUpperCase()} {flight.flightNumber.replace(/[^0-9]/g, '') || '162'}</span>
                    </div>
                    <div className="w-1/4 text-center">
                      {flight.departureAirportCode} {new Date(flight.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                    <div className="flex flex-col items-center w-1/4">
                      <span className="text-[9px] text-gray-400 font-bold mb-1">
                        {Math.floor(flight.durationMinutes / 60)}h {flight.durationMinutes % 60}m
                      </span>
                      <span className="text-[9px] text-gray-400 font-bold">Non-stop</span>
                    </div>
                    <div className="w-1/4 text-right">
                      {flight.arrivalAirportCode} {new Date(flight.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                  </div>
                  
                  <div className="mt-4 text-right">
                    <button className="border border-[#0c1a40] text-[#0c1a40] text-[10px] font-bold px-4 py-1.5 rounded-lg hover:bg-gray-50">
                      Fare Rules
                    </button>
                  </div>
                </div>

                {/* Passenger Details */}
                <div>
                  <h3 className="text-[#0c1a40] text-sm font-black mb-3">Passenger Details</h3>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-[#f0f4ff]">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider">Passenger Name</th>
                          <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider text-center">Gender</th>
                          <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider text-center">Type</th>
                          <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider text-center">Frequent Passengers</th>
                        </tr>
                      </thead>
                      <tbody>
                        {passengers.map((p, idx) => (
                          <tr key={idx} className="border-t border-gray-100">
                            <td className="px-4 py-4 text-xs font-bold text-[#0c1a40] uppercase">
                              {p.title} {p.firstName} {p.lastName}
                            </td>
                            <td className="px-4 py-4 text-xs font-semibold text-[#0c1a40] text-center">
                              {p.title === 'Mr' || p.title === 'Mstr' ? 'Male' : 'Female'}
                            </td>
                            <td className="px-4 py-4 text-xs font-semibold text-[#0c1a40] text-center">{p.type}</td>
                            <td className="px-4 py-4 text-xs text-center text-emerald-500 font-bold">✓</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Cancellation & Reschedule */}
                <div className="flex gap-4">
                  {/* Cancellation */}
                  <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="bg-[#0b1031] text-white text-[10px] font-bold text-center py-3 uppercase tracking-wide">
                      CANCELLATION CHARGES PER PAX
                    </div>
                    <table className="w-full text-[10px]">
                      <thead className="bg-blue-50/50">
                        <tr className="text-blue-800">
                          <th className="px-4 py-3 text-left font-bold border-b border-gray-100">TIMELINE</th>
                          <th className="px-4 py-3 text-right font-bold border-b border-gray-100">PENALTY</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="px-4 py-3 font-bold text-[#0c1a40]">4 Hour - 96 Hour</td>
                          <td className="px-4 py-3 font-bold text-[#0c1a40] text-right">₹ 4899</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-bold text-[#0c1a40]">96 Hour - 365 Days</td>
                          <td className="px-4 py-3 font-bold text-[#0c1a40] text-right">₹ 3899</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="mt-auto px-4 py-3 text-[9px] text-gray-500 bg-white">
                      <span className="font-bold">Agent Fee:</span> ₹ 50 Per Pax (Applicable even if flight cancelled by Airline)
                    </div>
                  </div>

                  {/* Reschedule */}
                  <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="bg-[#0b1031] text-white text-[10px] font-bold text-center py-3 uppercase tracking-wide">
                      RESCHEDULE CHARGES PER PAX
                    </div>
                    <table className="w-full text-[10px]">
                      <thead className="bg-blue-50/50">
                        <tr className="text-blue-800">
                          <th className="px-4 py-3 text-left font-bold border-b border-gray-100">TIMELINE</th>
                          <th className="px-4 py-3 text-right font-bold border-b border-gray-100">PENALTY</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="px-4 py-3 font-bold text-[#0c1a40]">3 Hour - 365 Days</td>
                          <td className="px-4 py-3 font-bold text-[#0c1a40] text-right">₹ 2999 + Difference In Fare</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="mt-auto px-4 py-3 text-[9px] text-gray-500 bg-white">
                      <span className="font-bold">Agent Fee:</span> ₹ 50 Per Pax (Applicable even if flight Reschedule by Airline)
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start gap-3 py-4 pl-2">
                  <input type="checkbox" className="mt-0.5 w-4 h-4 cursor-pointer" />
                  <p className="text-xs font-bold text-[#0c1a40]">
                    I Confirm that I have read, Understood and agree with the <span className="text-black font-black underline cursor-pointer">Airline Fare Rules</span>, <span className="text-black font-black underline cursor-pointer">Privacy Policy</span> and <span className="text-black font-black underline cursor-pointer">Terms of Use.</span>
                  </p>
                </div>
              </div>

              {/* Right Sidebar - Fare Summary */}
              <div className="w-[30%]">
                <h3 className="text-[#0c1a40] text-sm font-black mb-3">Fare Summary</h3>
                <div className="bg-[#f0f4ff] rounded-xl shadow-sm p-5 space-y-4">
                  <div className="flex justify-between items-center text-xs text-[#0c1a40]">
                    <span>Base Fare</span>
                    <span className="font-normal">₹{(totalBaseFare).toLocaleString('en-IN')}.00</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-[#0c1a40]">
                    <span>Taxes and Fees <span className="text-[9px]">▼</span></span>
                    <span className="font-normal">₹{(taxesAndFees).toLocaleString('en-IN')}.00</span>
                  </div>
                  <div className="h-px bg-blue-100 my-2 w-full"></div>
                  <div className="flex justify-between items-center text-sm font-black text-[#0c1a40]">
                    <span>Total Fare</span>
                    <span>₹{(totalFare).toLocaleString('en-IN')}.00</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Sticky Bottom Action Bar */}
            <div className="sticky bottom-0 bg-[#f9fafc] p-4 px-6 flex justify-between items-center z-10 rounded-b-2xl">
              <div className="text-sm font-black text-[#0c1a40]">
                Total Payable <span className="text-emerald-500 text-lg ml-1">₹{(totalFare).toLocaleString('en-IN')}.00</span>
              </div>
              <button 
                onClick={handleConfirmBooking}
                disabled={isBooking}
                className="bg-[#0b1031] hover:bg-blue-900 text-white font-bold text-sm px-8 py-3 rounded-full shadow transition disabled:opacity-50"
              >
                {isBooking ? 'Processing...' : 'Book Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default B2BAgentCheckout;
