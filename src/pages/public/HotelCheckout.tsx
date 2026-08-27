import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopNavbar from '../../components/layout/TopNavbar';
import { ChevronLeft, Info, Check, Shield, Star, Users, MapPin, Coffee, Wifi, Car, Plane, AlertCircle, Heart, CheckCircle, Tag } from 'lucide-react';
import api from '../../services/api';
import Dropdown from '../../components/ui/Dropdown';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/authSlice';

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

export default function HotelCheckout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isAgentDiscount = user?.roles?.includes('B2B_AGENT');

  const [loading, setLoading] = useState(false);
  const [bookingFor, setBookingFor] = useState<'myself' | 'someone_else'>('myself');
  const [tripSecure, setTripSecure] = useState(true);
  
  const [additionalGuests, setAdditionalGuests] = useState<{firstName: string, lastName: string}[]>([]);
  
  const handleBookingForChange = (type: 'myself' | 'someone_else') => {
    setBookingFor(type);
    if (type === 'myself') {
      setGuestDetails({
        title: 'Mr',
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ').slice(1).join(' ') || '',
        email: user?.email || '',
        phone: '',
      });
    } else {
      setGuestDetails({
        title: 'Mr',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      });
    }
  };

  const [guestDetails, setGuestDetails] = useState({
    title: 'Mr',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
  });

  if (!state || !state.hotel || !state.room) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <TopNavbar forceWhite={true} />
        <h1 className="text-2xl font-bold mt-20">Booking Session Expired</h1>
        <button onClick={() => navigate('/hotels/search')} className="mt-4 text-blue-600 font-bold">Go Back to Search</button>
      </div>
    );
  }

  const { hotel, room, checkIn, checkOut, guests } = state;

  // Calculate days
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const nights = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
  
  const basePrice = Math.round(hotel.pricePerNight * room.priceMultiplier);
  const totalBase = basePrice * nights;
  const taxes = Math.round(totalBase * 0.12);
  let totalAmount = totalBase + taxes;
  
  // Trip Secure cost
  const secureCost = 29 * guests * nights;
  if (tripSecure) {
    totalAmount += secureCost;
  }

  const handlePayment = async () => {
    if (!guestDetails.firstName || !guestDetails.lastName || !guestDetails.email || !guestDetails.phone) {
      toast.error('Please fill all mandatory guest details');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const payload = {
        totalAmount,
        date: new Date().toISOString(),
        details: {
          hotelId: hotel._id,
          hotelName: hotel.name,
          image: hotel.images?.[0] || '',
          address: hotel.address,
          checkIn,
          checkOut,
          roomType: room.name,
          guests,
          additionalGuests,
          contactDetails: {
            name: `${guestDetails.title} ${guestDetails.firstName} ${guestDetails.lastName}`,
            email: guestDetails.email,
            phone: guestDetails.phone
          }
        }
      };

      if (user?.roles?.includes('B2B_AGENT')) {
        (payload as any).bookingMode = 'B2B';
      }

      const { data } = await api.post('/api/bookings/hotel', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { orderId, amount, currency, booking } = data;

      const res = await loadRazorpayScript();

      if (!res) {
        toast.error("Razorpay SDK not loaded. Please refresh.");
        setLoading(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TAetNo496ol1Iz',
        amount,
        currency,
        name: "TrippeChalo",
        description: `Hotel Booking - ${hotel.name}`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            await api.post('/api/bookings/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Payment Successful!");
            navigate(`/dashboard/invoice/${booking._id}`);
          } catch (verifyError) {
            console.error("Verification failed", verifyError);
            toast.error("Payment Verification Failed. Contact Support.");
          }
        },
        prefill: {
          name: `${guestDetails.firstName} ${guestDetails.lastName}`,
          email: guestDetails.email,
          contact: guestDetails.phone
        },
        theme: {
          color: "#0a66c2" // Blue
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error('Failed to initiate payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e5eef5] font-sans pb-20">
      <TopNavbar forceWhite={true} />
      
      {/* Header */}
      <div className="bg-white pt-24 pb-4 shadow-sm border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-2xl font-black text-gray-900">Review your Booking</h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 mt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Column - Forms */}
          <div className="flex-1 space-y-6">
            
            {/* Hotel Summary Card */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 flex gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Star size={12} className="fill-gray-800 text-gray-800" />
                    <Star size={12} className="fill-gray-800 text-gray-800" />
                    <Star size={12} className="fill-gray-800 text-gray-800" />
                    <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded uppercase border border-green-200">Couple Friendly</span>
                  </div>
                  <h2 className="text-xl font-black text-gray-900 mb-1">{hotel.name}</h2>
                  <p className="text-xs text-gray-500 font-medium">{hotel.address}</p>
                </div>
                <img src={hotel.images?.[0] || 'https://via.placeholder.com/150'} className="w-24 h-24 object-cover rounded-md" alt="Hotel" />
              </div>
              
              <div className="flex items-center justify-between border-t border-b border-dashed border-gray-200 p-4 bg-[#f9f9f9]">
                <div className="flex-1">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Check In</p>
                  <p className="font-black text-sm text-gray-900">{new Date(checkIn).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-[10px] text-gray-500 mt-1">2 PM</p>
                </div>
                <div className="px-4 text-center">
                  <span className="px-3 py-1 bg-gray-200 rounded-full text-[10px] font-bold text-gray-600">{nights} NIGHT</span>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Check Out</p>
                  <p className="font-black text-sm text-gray-900">{new Date(checkOut).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-[10px] text-gray-500 mt-1">11 AM</p>
                </div>
                <div className="flex-1 text-right border-l border-gray-200 pl-4 ml-4">
                  <p className="text-sm font-black text-gray-900">{nights} Night | {guests} Adults | 1 Room</p>
                </div>
              </div>

              <div className="p-5 flex justify-between items-start">
                <div>
                  <h3 className="font-black text-gray-900">{room.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">{guests} Adults</p>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4 mb-4">
                    <li>Room Only</li>
                    <li>No meals included</li>
                  </ul>
                  <p className="font-bold text-gray-900 text-sm">Non-Refundable</p>
                  <p className="text-[10px] text-gray-500">Refund is not applicable for this booking</p>
                  <button className="text-blue-600 text-xs font-bold mt-2">Cancellation policy details</button>
                </div>
                <button className="text-blue-600 text-xs font-bold">See Inclusions</button>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-5">
              <h3 className="font-black text-gray-900 mb-4">Important information</h3>
              <div className="border border-red-100 bg-red-50/30 rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart size={14} className="text-red-500 fill-red-500" />
                  <span className="text-xs font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded">Couple/Bachelor Rules</span>
                </div>
                <p className="text-sm font-medium text-gray-800 mb-3">Unmarried couples allowed. Local ids are allowed</p>
                <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4">
                  <li>Primary Guest should be atleast 18 years of age.</li>
                  <li>Groups with only male guests are also allowed at the property</li>
                  <li>Passport, Aadhaar and Driving License are accepted as ID proof(s)</li>
                  <li>Pets are not allowed</li>
                </ul>
                <button className="text-blue-600 text-xs font-bold mt-2">View More</button>
              </div>
            </div>

            {/* Guest Details Form */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-5">
              <h3 className="font-black text-gray-900 mb-4">Guest Details</h3>
              
              <div className="flex gap-6 mb-6">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="radio" checked={bookingFor === 'myself'} onChange={() => handleBookingForChange('myself')} className="w-4 h-4 text-blue-600 accent-blue-600" />
                  Myself
                </label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="radio" checked={bookingFor === 'someone_else'} onChange={() => handleBookingForChange('someone_else')} className="w-4 h-4 text-blue-600 accent-blue-600" />
                  Someone Else
                </label>
              </div>
              
              <div className="flex gap-4 mb-4">
                <div className="w-24">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Title <span className="text-red-500">*</span></label>
                  <Dropdown
                    value={guestDetails.title}
                    onChange={(val) => setGuestDetails({...guestDetails, title: val})}
                    options={[
                      { value: 'Mr', label: 'Mr' },
                      { value: 'Mrs', label: 'Mrs' },
                      { value: 'Ms', label: 'Ms' }
                    ]}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Full Name <span className="text-red-500">*</span></label>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={guestDetails.firstName}
                      onChange={(e) => setGuestDetails({...guestDetails, firstName: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none placeholder-gray-400"
                      placeholder="First Name"
                    />
                    <input 
                      type="text" 
                      value={guestDetails.lastName}
                      onChange={(e) => setGuestDetails({...guestDetails, lastName: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none placeholder-gray-400"
                      placeholder="Last Name"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email Address <span className="text-red-500">*</span> <span className="lowercase font-normal text-gray-400">(Booking voucher will be sent to this email ID)</span></label>
                  <input 
                    type="email" 
                    value={guestDetails.email}
                    onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none placeholder-gray-400"
                    placeholder="Email ID"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Mobile Number <span className="text-red-500">*</span></label>
                  <div className="flex">
                    <Dropdown
                      value="+91"
                      onChange={() => {}}
                      options={[
                        { value: '+91', label: '+91' }
                      ]}
                    />
                    <input 
                      type="tel" 
                      value={guestDetails.phone}
                      onChange={(e) => setGuestDetails({...guestDetails, phone: e.target.value})}
                      className="w-full border border-gray-300 rounded-r px-3 py-2 text-sm focus:border-blue-500 outline-none placeholder-gray-400"
                      placeholder="Mobile Number"
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer border-t border-gray-100 pt-4">
                <input type="checkbox" className="w-4 h-4 rounded text-blue-600 accent-blue-600" />
                Enter GST Details <span className="text-xs text-gray-400 font-normal">(Optional)</span>
              </label>

              {additionalGuests.map((guest, idx) => (
                <div key={idx} className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Guest {idx + 2}</label>
                    <button onClick={() => setAdditionalGuests(additionalGuests.filter((_, i) => i !== idx))} className="text-red-500 text-xs font-bold">Remove</button>
                  </div>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={guest.firstName}
                      onChange={(e) => {
                        const newGuests = [...additionalGuests];
                        newGuests[idx].firstName = e.target.value;
                        setAdditionalGuests(newGuests);
                      }}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none placeholder-gray-400"
                      placeholder="First Name"
                    />
                    <input 
                      type="text" 
                      value={guest.lastName}
                      onChange={(e) => {
                        const newGuests = [...additionalGuests];
                        newGuests[idx].lastName = e.target.value;
                        setAdditionalGuests(newGuests);
                      }}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none placeholder-gray-400"
                      placeholder="Last Name"
                    />
                  </div>
                </div>
              ))}

              <button onClick={() => setAdditionalGuests([...additionalGuests, {firstName: '', lastName: ''}])} className="text-blue-600 font-bold text-sm mt-4">+ Add Guest</button>
            </div>

            {/* Trip Secure */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-5 mb-6">
              <div className="flex items-center gap-3 bg-teal-50 border border-teal-100 p-3 rounded-md mb-4">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                  <Shield size={16} className="text-teal-600" />
                </div>
                <p className="text-xs text-teal-800 font-medium">Travel worry-free, while you're away, your home stays protected.</p>
              </div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-black text-gray-900 text-lg">Trip Secure</h3>
                  <p className="text-xs text-teal-600 font-bold">Enjoy a Worry-Free Stay</p>
                </div>
              </div>

              <div className="bg-[#f2f8fc] rounded-md p-4 mb-4">
                <div className="flex justify-between text-xs font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2"><CheckCircle size={12} className="text-green-500"/> Home Burglary</span>
                  <span>INCLUDED</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2"><CheckCircle size={12} className="text-blue-500"/> OPD Expenses</span>
                  <span>Rs 25,000</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2"><CheckCircle size={12} className="text-blue-500"/> Refund on Hotel Cancellation</span>
                  <span>Rs 10,000</span>
                </div>
                <div className="text-right mt-2">
                  <button className="text-blue-600 text-xs font-bold">6 more benefits</button>
                </div>
              </div>

              <div className="mb-4">
                <p className="font-black text-gray-900">₹29 <span className="text-xs font-normal text-gray-500">per person per night</span></p>
                <p className="text-[10px] text-gray-400">18% GST Included | Non-Refundable</p>
              </div>

              <div className="space-y-3">
                <label className={`block border rounded-md p-3 cursor-pointer transition ${tripSecure ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" checked={tripSecure} onChange={() => setTripSecure(true)} className="w-4 h-4 accent-blue-600" />
                    <span className="text-sm font-medium">Yes, secure my trip.</span>
                  </div>
                </label>
                <label className={`block border rounded-md p-3 cursor-pointer transition ${!tripSecure ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" checked={!tripSecure} onChange={() => setTripSecure(false)} className="w-4 h-4 accent-blue-600" />
                    <span className="text-sm font-medium">No, I will book without trip secure.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="py-4">
              <label className="flex items-start gap-2 text-xs text-gray-600">
                <input type="checkbox" defaultChecked className="mt-0.5 accent-blue-600" />
                <span>By proceeding, I agree to MakeMyTrip's <a href="#" className="text-blue-600">User Agreement</a>, <a href="#" className="text-blue-600">Terms of Service</a> and <a href="#" className="text-blue-600">Cancellation & Property Booking Policies</a>.</span>
              </label>
            </div>

            <button 
              onClick={handlePayment}
              disabled={loading}
              className="w-full sm:w-64 bg-[#0a66c2] hover:bg-[#004e9c] text-white font-black py-3.5 rounded shadow-md transition disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide text-sm mb-10"
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>

          {/* Right Column - Price Summary & Coupons */}
          <div className="w-full lg:w-[340px]">
            <div className="sticky top-24 space-y-4">
              
              {/* Rewards */}
              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-4 rounded-full border-2 border-teal-500 flex items-center justify-center">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  </div>
                  <span className="text-xs font-bold text-teal-600">OneCircle Rewards</span>
                </div>
                
                <div className="bg-[#f0faeb] border border-green-200 rounded p-3 text-center">
                  <p className="text-xs text-gray-600 mb-1">Available Balance</p>
                  <p className="font-black text-gray-900">0 <span className="text-xs font-normal">points</span></p>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-black text-gray-900">Price Summary</h3>
                  <button className="text-blue-600 text-xs font-bold flex items-center gap-1">View Price Breakup</button>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                    <span>Price + Taxes & Service Fees</span>
                    <span>₹{totalBase} + ₹{taxes}</span>
                  </div>
                  
                  {tripSecure && (
                    <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                      <span>Trip Secure</span>
                      <span>₹{secureCost}</span>
                    </div>
                  )}
                  
                  <hr className="border-gray-200" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-gray-900">Total Amount to be paid</span>
                    <span className="text-xl font-black text-gray-900">₹{totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Coupon Codes */}
              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
                <h3 className="font-black text-gray-900 mb-3 text-sm">Coupon Codes</h3>
                <div className="flex border border-gray-300 rounded overflow-hidden mb-4 focus-within:border-blue-500">
                  <input type="text" placeholder="Have A Coupon Code?" className="flex-1 px-3 py-2 text-sm outline-none" />
                  <button className="text-blue-600 font-bold text-xs px-4 bg-gray-50 border-l border-gray-300">APPLY</button>
                </div>

                <div className="space-y-3">
                  <div className="border border-blue-200 bg-blue-50/50 rounded-md p-3 relative">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-1">
                        <Tag size={12} className="text-blue-600" />
                        <span className="font-bold text-gray-900 text-xs">MAXDROP</span>
                      </div>
                      <span className="text-teal-600 font-bold text-xs">₹454 off</span>
                    </div>
                    <p className="text-[10px] text-gray-500">Discount of INR 454 Applied</p>
                    <button className="text-blue-600 font-bold text-xs mt-2">Remove</button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-md p-3 opacity-60">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-1">
                        <Tag size={12} className="text-blue-600" />
                        <span className="font-bold text-gray-900 text-xs">UPIPAY</span>
                      </div>
                      <span className="text-gray-900 font-bold text-xs">₹395 off</span>
                    </div>
                    <p className="text-[10px] text-gray-500">Pay via UPI and Get INR 395 Discount</p>
                    <button className="text-blue-600 font-bold text-xs mt-2">Apply</button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
