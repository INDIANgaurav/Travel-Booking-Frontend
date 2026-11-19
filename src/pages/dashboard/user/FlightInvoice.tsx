import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { Loader2, Printer, ArrowLeft, Plane } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../../../components/common/Loader';
import TopNavbar from '../../../components/layout/TopNavbar';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../store/authSlice';

export default function FlightInvoice({ bookingId, isModal }: { bookingId?: string, isModal?: boolean }) {
  const { id } = useParams();
  const actualId = bookingId || id;
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [booking, setBooking] = useState<any>(null);
  const [platformInfo, setPlatformInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingAndPlatformInfo = async () => {
      if (!actualId) return;
      try {
        const [bookingRes, platformRes] = await Promise.all([
          api.get(`/api/bookings/${actualId}`),
          api.get('/api/admin/platform-info').catch(() => ({ data: null }))
        ]);
        setBooking(bookingRes.data);
        if (platformRes.data) setPlatformInfo(platformRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };
    if (actualId) fetchBookingAndPlatformInfo();
  }, [actualId]);

  if (loading) {
    return <Loader fullScreen={false} />;
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500">Booking not found.</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  // Helper functions for mock/formatted data
  const passengers = booking.details?.passengers?.length > 0 
    ? booking.details.passengers 
    : [{ name: booking.user?.name || 'PASSENGER' }];
    
  const nexusData = booking.details?.nexus_response?._data;
  const flight = nexusData?.booking_items?.[0]?.flight;
  const leg = flight?.legs?.[0];
  const gapiSector = booking.details?.gapi_booking_details?.FlightBookingSecotorDetails?.[0] || booking.details?.gapi_booking_details;
  
  const flightNo = leg 
    ? `${leg.airline} ${leg.flight_number}` 
    : (booking.details?.flightNo || (gapiSector?.airlines && gapiSector?.flightnumber ? `${gapiSector.airlines}-${gapiSector.flightnumber}` : '6E-333'));
  const airlineName = leg?.airline_name || booking.details?.airline || gapiSector?.airlines || 'IndiGo';
  
  // Create a 3-letter code from city name (mock logic)
  const getAirportCode = (city: string) => city ? city.substring(0, 3).toUpperCase() : 'XXX';
  const originCode = booking.type === 'FLIGHT' ? (leg?.origin || getAirportCode(booking.details?.from)) : '';
  const destCode = booking.type === 'FLIGHT' ? (leg?.destination || getAirportCode(booking.details?.to)) : '';
  const issueDate = new Date(booking.createdAt);
  const dateStr = issueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  const rawDepTime = 
    booking.date ||
    booking.details?.departureTime || 
    booking.details?.date || 
    gapiSector?.departuredate || 
    leg?.departure_time || 
    nexusData?.travel_date;

  const travelDateObj = rawDepTime ? new Date(rawDepTime) : issueDate;
  const travelDateStr = travelDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  const pnr = nexusData?.booking_reference || booking.details?.pnr || booking.bookingId;
  const displayPnr = pnr ? pnr.toUpperCase() : 'N/A';
  const agentRef = nexusData?.agent_reference || booking.bookingId;

  const handleWebCheckIn = () => {
    toast.success('Redirecting to Airline Web Check-in portal...');
    setTimeout(() => {
      window.open('https://www.google.com/search?q=web+check+in+' + booking.details?.airline, '_blank');
    }, 1500);
  };

  return (
    <>
      <div className="min-h-[calc(100vh-80px)] bg-transparent pb-8 font-sans print:bg-white print:py-0 print:px-0 flex flex-col items-center justify-start">
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      
      {/* Controls */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-8 mt-2 print:hidden">
        {!isModal ? (
          <button 
            onClick={() => {
              if (user?.roles?.includes('SUPER_ADMIN')) navigate('/admin/bookings');
              else if (user?.roles?.includes('SUB_ADMIN')) navigate('/sub-admin/bookings');
              else if (user?.roles?.includes('B2B_AGENT')) navigate('/agent-portal/bookings');
              else navigate('/dashboard/bookings');
            }} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200"
          >
            <ArrowLeft size={18} />
            Back to Bookings
          </button>
        ) : (
          <div></div>
        )}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/dashboard/ticket/${booking._id || actualId}`)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow-md transition-colors text-sm"
          >
            <Plane size={17} />
            View E-Ticket
          </button>

          <button 
            onClick={handlePrint}
            className={`flex items-center gap-2 text-white px-5 py-2 rounded-lg font-semibold shadow-md transition-colors text-sm ${booking.type === 'HOTEL' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'}`}
          >
            <Printer size={17} />
            Print Invoice
          </button>
          
          {booking.type === 'FLIGHT' && booking.status === 'CONFIRMED' && (
            <button 
              onClick={handleWebCheckIn}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold shadow-md transition-colors text-sm"
            >
              <Plane size={17} />
              Web Check-in
            </button>
          )}
        </div>
      </div>

      {booking.type === 'HOTEL' ? (
        <div className="w-full max-w-4xl bg-white p-6 md:p-10 shadow-xl border-2 border-slate-300 rounded-2xl print:shadow-none print:border print:border-slate-400 print:p-6 print:rounded-none mx-auto relative overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-700 via-indigo-600 to-orange-500 -mx-6 -mt-6 md:-mx-10 md:-mt-10 mb-6 print:hidden"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 border-b-2 border-blue-500 pb-6 gap-4">
            <div>
              <div className="inline-block bg-blue-50 text-blue-800 text-[11px] font-black uppercase px-2.5 py-1 rounded tracking-wider border border-blue-200 mb-2">HOTEL BOOKING VOUCHER</div>
              <h1 className="text-2xl font-black text-slate-900 mb-2">{booking.details?.hotelName || 'Hotel Booking'}</h1>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Booking Ref: <span className="font-bold text-gray-900">{booking.bookingId}</span></p>
                <p>Booking Date: {new Date(booking.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                <p>Status: <span className="font-bold text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded border border-green-200 text-xs">{booking.status}</span></p>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end text-left md:text-right">
              <img src="/trippechalo-logo.png" alt="TrippeChalo India" className="h-10 md:h-12 object-contain mb-2" />
              <div className="text-[11px] text-gray-600">
                <p className="font-black text-gray-900 uppercase text-[12px]">{platformInfo?.companyName || 'TRIPPECHALO INDIA PRIVATE LIMITED'}</p>
                <p>{platformInfo?.officeAddress || 'First Floor, D 42, Greater Noida Expressway, Sector 108, Noida, UP - 201304'}</p>
                <p className="font-bold text-gray-800 mt-0.5">GSTIN: {platformInfo?.gstn || '09AAMCT8505A1ZB'}</p>
                <p>Phone: +91 {platformInfo?.officePhone || '95559 34205'} | Email: {platformInfo?.email || 'trippechaloindia@gmail.com'}</p>
              </div>
            </div>
          </div>

          <div className="mb-6 border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">{booking.details?.hotelName || 'Hotel Name'}</h3>
              <p className="text-sm text-gray-500 mt-1">{booking.details?.address || 'Hotel Address'}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 text-sm">
              <div className="p-4 border-r md:border-r-0 border-gray-200">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Check In</p>
                <p className="font-bold text-gray-800">{booking.details?.checkIn || 'N/A'}</p>
              </div>
              <div className="p-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Check Out</p>
                <p className="font-bold text-gray-800">{booking.details?.checkOut || 'N/A'}</p>
              </div>
              <div className="p-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Guests</p>
                <p className="font-bold text-gray-800">{booking.details?.guests || 1} Guests</p>
              </div>
              <div className="p-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Room Type</p>
                <p className="font-bold text-gray-800">{booking.details?.roomType || 'Standard Room'}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-blue-600 mb-2">Primary Guest</h3>
            <div className="border border-gray-200 p-4 rounded-xl text-sm">
              <p className="font-bold text-gray-800 uppercase">{booking.user?.name}</p>
              <p className="text-gray-500">{booking.user?.email}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-blue-600 mb-2">Payment Details</h3>
            <div className="border border-gray-200 rounded-xl p-4 flex justify-between items-center bg-gray-50">
              <span className="font-bold text-gray-800">Total Amount Paid</span>
              <span className="text-xl font-black text-gray-900">₹ {booking.totalAmount.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-2">
            <div className="flex items-center gap-2">
              <img src="/trippechalo-logo.png" alt="TrippeChalo India" className="h-6 object-contain" />
              <span>© {new Date().getFullYear()} TrippeChalo India Private Limited. All rights reserved.</span>
            </div>
            <span className="font-semibold text-blue-600">www.trippechalo.com</span>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl bg-white p-6 md:p-10 shadow-xl border-2 border-slate-300 rounded-2xl print:shadow-none print:border print:border-slate-400 print:p-6 print:rounded-none text-black mx-auto relative overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-700 via-indigo-600 to-orange-500 -mx-6 -mt-6 md:-mx-10 md:-mt-10 mb-6 print:hidden"></div>

          {/* Top Header with Logo and Company Info */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-6 text-[13px] gap-6 border-b border-gray-200 pb-6">
            <div className="w-full md:w-1/2">
              <div className="inline-block bg-blue-50 text-blue-800 text-[11px] font-black uppercase px-2.5 py-1 rounded tracking-wider border border-blue-200 mb-2">
                TAX INVOICE / RECEIPT
              </div>
              <p className="font-black text-xl md:text-2xl mb-3 tracking-wide text-slate-900">{airlineName}</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-col gap-2 md:gap-3 text-xs">
                <div>
                  <p className="text-gray-500 mb-0.5 text-[10px] uppercase font-bold tracking-wider">Agency Booking ID</p>
                  <p className="font-mono font-bold text-slate-900 text-[11px] break-all">{agentRef}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-0.5 text-[10px] uppercase font-bold tracking-wider">Booking Reference / PNR</p>
                  <p className="font-mono font-black text-blue-700 text-sm md:text-base tracking-widest">{displayPnr}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-0.5 text-[10px] uppercase font-bold tracking-wider">Invoice Date</p>
                  <p className="font-bold text-slate-800">{dateStr}</p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 flex flex-col items-start md:items-end text-left md:text-right">
              {/* Company Logo */}
              <img 
                src="/trippechalo-logo.png" 
                alt="TrippeChalo India" 
                className="h-10 md:h-12 object-contain mb-2" 
              />
              <div className="text-[11px] text-gray-600 space-y-0.5">
                <p className="font-black text-gray-900 uppercase text-[12px] tracking-tight">
                  {platformInfo?.companyName || 'TRIPPECHALO INDIA PRIVATE LIMITED'}
                </p>
                <p className="max-w-xs">{platformInfo?.officeAddress || 'First Floor, D 42, Greater Noida Expressway, Sector 108, Noida, Uttar Pradesh - 201304'}</p>
                <p className="font-bold text-gray-900 pt-0.5">GSTIN: {platformInfo?.gstn || '09AAMCT8505A1ZB'}</p>
                <p>Phone: +91 {platformInfo?.officePhone || '95559 34205'}</p>
                <p>Email: {platformInfo?.email || 'trippechaloindia@gmail.com'}</p>
              </div>
            </div>
          </div>

          {/* Customer & Booked By Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 flex flex-row justify-between text-xs gap-4">
            <div className="w-1/2">
              <p className="text-gray-500 mb-0.5 text-[10px] uppercase font-bold tracking-wider">Billed To (Customer)</p>
              <p className="font-black text-sm text-slate-900 uppercase">{passengers[0]?.name || booking.user?.name}</p>
              {booking.details?.contactDetails?.email && (
                <p className="text-gray-600 text-[11px] mt-0.5">{booking.details.contactDetails.email}</p>
              )}
              {booking.details?.contactDetails?.phone && (
                <p className="text-gray-600 text-[11px]">+91 {booking.details.contactDetails.phone}</p>
              )}
            </div>
            <div className="w-1/2 text-right">
              <p className="text-gray-500 mb-0.5 text-[10px] uppercase font-bold tracking-wider">Booked By / Channel</p>
              <p className="font-bold text-sm text-slate-900">{booking.user?.name || 'Authorized Agent'}</p>
              <p className="text-[11px] text-gray-600 mt-0.5">Status: <span className={`font-bold px-2 py-0.5 rounded border uppercase text-[10px] ${
                booking.status === 'CANCELLED'
                  ? 'text-rose-700 bg-rose-50 border-rose-200'
                  : booking.status === 'CONFIRMED'
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-amber-700 bg-amber-50 border-amber-200'
              }`}>{booking.status}</span></p>
            </div>
          </div>

          {/* Flight Details Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 py-2.5 bg-slate-800 text-white gap-2">
              <p className="font-black text-xs md:text-sm tracking-wide uppercase">{originCode} ➔ {destCode} ({travelDateStr.toUpperCase()})</p>
              <p className="text-xs text-slate-200 font-mono font-semibold">{flightNo}</p>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <tr>
                    <th className="px-4 py-2.5 w-1/3">Passenger Name(s)</th>
                    <th className="px-4 py-2.5 w-1/4">PNR</th>
                    <th className="px-4 py-2.5 w-1/4">Seat No.</th>
                    <th className="px-4 py-2.5 w-1/6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {passengers.map((pax: any, i: number) => {
                    const paxConfirmation = nexusData?.booking_items?.[0]?.confirmations?.find((c: any) => c.pax_id === pax.id || c.pax_id === i);
                    const tktNo = paxConfirmation?.pnr || pax.airlinepnr || pax.pnr || displayPnr;
                    return (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-bold text-slate-900 uppercase">{pax.name || pax.firstName + ' ' + (pax.lastName || '')}</td>
                        <td className="px-4 py-3 font-mono font-semibold text-blue-700">{tktNo}</td>
                        <td className="px-4 py-3 text-slate-700 font-medium">{booking.details?.seats?.[i] || pax.seat || 'Assigned at Check-in'}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                            booking.status === 'CANCELLED'
                              ? 'text-rose-700 bg-rose-50 border-rose-200'
                              : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          }`}>
                            {booking.status === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment & Fare Breakdown */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Payment & Fare Summary</h3>
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-3 text-slate-700">Flight Base Fare</td>
                  <td className="p-3 text-right font-medium text-slate-900">₹ {(Number(booking.totalAmount) * 0.72).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-700">Airline Taxes, Fuel & Regulatory Fees (UDF / PSF / GST)</td>
                  <td className="p-3 text-right font-medium text-slate-900">₹ {(Number(booking.totalAmount) * 0.28).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                </tr>
                {booking.discountAmount > 0 && (
                  <tr className="text-green-700 bg-green-50/50">
                    <td className="p-3 font-medium">Promo Discount Applied ({booking.promoCodeApplied || 'PROMO'})</td>
                    <td className="p-3 text-right font-bold">- ₹ {Number(booking.discountAmount).toLocaleString('en-IN')}</td>
                  </tr>
                )}
                <tr className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-300">
                  <td className="p-3.5 text-sm uppercase">Total Amount Paid</td>
                  <td className="p-3.5 text-right text-base text-blue-700">₹ {Number(booking.totalAmount).toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
            
            <div className="mt-2.5 flex flex-wrap justify-between items-center text-xs text-gray-500 gap-2 px-1">
              <span>Payment Mode: <strong className="text-slate-800">{booking.paymentMethod || 'Online (Razorpay)'}</strong></span>
              {booking.status === 'CANCELLED' ? (
                <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded text-[11px]">
                  ✕ Payment Status: CANCELLED {booking.refundAmount ? `(REFUND ₹${booking.refundAmount.toLocaleString('en-IN')})` : ''}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded text-[11px]">
                  ✓ Payment Status: {booking.status === 'CONFIRMED' ? 'PAID IN FULL' : booking.status}
                </span>
              )}
            </div>
          </div>

          {/* Important Information & Footer */}
          <div className="text-[10px] text-gray-500 mt-6 pt-4 border-t border-gray-200 space-y-1">
            <p className="font-bold text-[11px] text-slate-800 mb-1.5 uppercase">Important Information</p>
            <p>1. This is an electronic invoice and confirmed booking receipt issued by TrippeChalo India Private Limited.</p>
            <p>2. A boarding pass must be generated during Airline Web Check-in prior to airport arrival.</p>
            <p>3. Please carry a valid government-issued photo ID (Aadhaar / Passport / Driving License) for airport entry.</p>
          </div>

          {/* Brand Footer with Logo */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-2">
            <div className="flex items-center gap-2">
              <img src="/trippechalo-logo.png" alt="TrippeChalo India" className="h-6 object-contain" />
              <span>© {new Date().getFullYear()} TrippeChalo India Private Limited. All rights reserved.</span>
            </div>
            <span className="font-bold text-blue-600">support@trippechalo.com | www.trippechalo.com</span>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
