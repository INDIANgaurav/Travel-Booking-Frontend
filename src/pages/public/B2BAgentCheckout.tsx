import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plane, ChevronUp, Clock, Info, X } from 'lucide-react';

const B2BAgentCheckout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(16 * 60 + 3); // 16m 3s
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showBaseFareDetails, setShowBaseFareDetails] = useState(false);
  const [showTaxesDetails, setShowTaxesDetails] = useState(false);

  const handleContinue = () => {
    if (!firstName || !lastName || mobile.length !== 10 || !email.includes('@')) {
      setShowErrors(true);
      return;
    }
    setCurrentStep(3);
  };

  // Extract flight and fare details from router state
  const flight = location.state?.flight;
  const fareType = location.state?.fareType || 'Coupon fares';

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

  // Pricing calculations
  const totalFare = flight.price;
  const taxesAndFees = Math.round(totalFare * 0.15); // 15% estimated taxes
  const totalBaseFare = totalFare - taxesAndFees;

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
                <h4 className="text-xs font-black text-[#0c1a40] mb-4">ADULT 1: (12 + YRS) ▾</h4>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#0c1a40] mb-1">Title</label>
                    <select className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-semibold outline-none text-[#0c1a40]">
                      <option>Mr</option>
                      <option>Ms</option>
                      <option>Mrs</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#0c1a40] mb-1">First Name</label>
                    <input type="text" placeholder="FIRST NAME" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={`w-full border ${showErrors && !firstName ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-xs font-semibold outline-none placeholder-gray-300 text-[#0c1a40]`} />
                    {showErrors && !firstName && <div className="text-[9px] text-red-500 mt-1">Required</div>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#0c1a40] mb-1">Last Name</label>
                    <input type="text" placeholder="LAST NAME" value={lastName} onChange={(e) => setLastName(e.target.value)} className={`w-full border ${showErrors && !lastName ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-xs font-semibold outline-none placeholder-gray-300 text-[#0c1a40]`} />
                    {showErrors && !lastName && <div className="text-[9px] text-red-500 mt-1">Required</div>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#0c1a40] mb-1">Nationality</label>
                    <select className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-semibold outline-none text-[#0c1a40]">
                      <option>INDIA</option>
                    </select>
                  </div>
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
                   {['Credit Card', 'Net Banking', 'UPI', 'Debit Card'].map(method => (
                     <div key={method} className="border border-gray-200 rounded-full px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-gray-50">
                       <input type="radio" name="paymentMethod" disabled className="w-3 h-3" />
                       <span className="text-xs font-bold text-[#0c1a40]">{method}</span>
                     </div>
                   ))}
                   <div className="border border-blue-300 bg-[#e0effe] rounded-full px-4 py-2 flex items-center gap-3 cursor-pointer">
                     <input type="radio" name="paymentMethod" checked readOnly className="w-3 h-3 text-blue-600" />
                     <span className="text-xs font-bold text-[#0c1a40]">Agency Account</span>
                   </div>
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
                    <div className="flex justify-between">
                      <span>Adult(s) (1 X ₹{(totalBaseFare).toLocaleString('en-IN')})</span>
                      <span>₹{(totalBaseFare).toLocaleString('en-IN')}.00</span>
                    </div>
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
                        <tr className="border-t border-gray-100">
                          <td className="px-4 py-4 text-xs font-bold text-[#0c1a40] uppercase">
                            MR {firstName || 'GAURAV'} {lastName || 'PARASAR'}
                          </td>
                          <td className="px-4 py-4 text-xs font-semibold text-[#0c1a40] text-center">Male</td>
                          <td className="px-4 py-4 text-xs font-semibold text-[#0c1a40] text-center">ADULT</td>
                          <td className="px-4 py-4 text-xs text-center text-emerald-500 font-bold">✓</td>
                        </tr>
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
              <button className="bg-[#6c74a0] hover:bg-[#5b638a] text-white font-bold text-sm px-8 py-3 rounded-full shadow transition">
                Book Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default B2BAgentCheckout;
