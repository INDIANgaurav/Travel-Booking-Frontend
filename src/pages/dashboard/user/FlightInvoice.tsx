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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!actualId) return;
      try {
        const { data } = await api.get(`/api/bookings/${actualId}`);
        setBooking(data);
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error('Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };
    if (actualId) fetchBooking();
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
  
  const flightNo = leg ? `${leg.airline} ${leg.flight_number}` : `FL-${Math.floor(Math.random() * 900) + 100}`;
  const airlineName = booking.details?.airline || leg?.airline || 'JAPCGH';
  
  // Create a 3-letter code from city name (mock logic)
  const getAirportCode = (city: string) => city ? city.substring(0, 3).toUpperCase() : 'XXX';
  const originCode = booking.type === 'FLIGHT' ? (leg?.origin || getAirportCode(booking.details?.from)) : '';
  const destCode = booking.type === 'FLIGHT' ? (leg?.destination || getAirportCode(booking.details?.to)) : '';
  const dateStr = new Date(booking.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const travelDateStr = nexusData?.travel_date ? new Date(nexusData.travel_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : dateStr;
  
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
        <button 
          onClick={() => {
            if (user?.role === 'SUPER_ADMIN') navigate('/admin/bookings');
            else if (user?.role === 'SUB_ADMIN') navigate('/sub-admin/bookings');
            else if (user?.role === 'TRAVEL_AGENT') navigate('/agent-portal/bookings');
            else navigate('/dashboard/bookings');
          }} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200"
        >
          <ArrowLeft size={18} />
          Back to Bookings
        </button>
        <div className="flex items-center gap-4">
          <button 
            onClick={handlePrint}
            className={`flex items-center gap-2 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-colors ${booking.type === 'HOTEL' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'}`}
          >
            <Printer size={18} />
            Print Invoice
          </button>
          
          {booking.type === 'FLIGHT' && booking.status === 'CONFIRMED' && (
            <button 
              onClick={handleWebCheckIn}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-colors"
            >
              <Plane size={18} />
              Web Check-in
            </button>
          )}
        </div>
      </div>

      {booking.type === 'HOTEL' ? (
        <div className="w-full max-w-4xl bg-white p-10 shadow-lg border border-gray-200 print:shadow-none print:border-none print:p-0 rounded-2xl">
          <div className="flex justify-between items-start mb-8 border-b-2 border-blue-500 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-600 mb-4">Hotel Booking Voucher</h1>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Booking Ref: <span className="font-bold text-gray-900">{booking.bookingId}</span></p>
                <p>Booking Date: {new Date(booking.createdAt).toLocaleDateString()}</p>
                <p>Status: <span className="font-bold text-green-600">{booking.status}</span></p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter flex items-center justify-end gap-1">
                Trippe<span className="text-blue-500">Chalo</span>
              </h2>
            </div>
          </div>

          <div className="mb-6 border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">{booking.details?.hotelName || 'Hotel Name'}</h3>
              <p className="text-sm text-gray-500 mt-1">{booking.details?.address || 'Hotel Address'}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200 text-sm">
              <div className="p-4">
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
          
          <div className="text-[10px] text-gray-500 mt-8 pt-4 border-t border-gray-200 text-center">
            <p>Please present this voucher along with a valid photo ID at the time of check-in.</p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl bg-white p-8 shadow-lg print:shadow-none print:p-0 rounded-sm text-black">
          <div className="grid grid-cols-2 gap-4 mb-4 text-[13px]">
            <div>
              <p className="font-bold text-lg mb-6 tracking-widest">{airlineName}</p>
              
              <p className="text-gray-500 mb-0.5">Agency Booking ID</p>
              <p className="font-bold">{agentRef}</p>

              <p className="text-gray-500 mt-4 mb-0.5">Booking Reference</p>
              <p className="font-bold">{displayPnr}</p>
              
              <p className="text-gray-500 mt-4 mb-0.5">Issue Date</p>
              <p className="font-bold">{dateStr}</p>
            </div>
            <div className="flex justify-end items-start pr-4">
              <div className="w-32 h-32 border border-gray-200 rounded p-1">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(displayPnr)}`} alt="QR" className="w-full h-full mix-blend-multiply" />
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 my-6"></div>

          {/* Customer & Booked By */}
          <div className="flex justify-between text-[11px] mb-6 pr-16">
            <div>
              <p className="text-gray-500 mb-0.5">Customer Name</p>
              <p className="font-bold text-[13px]">{passengers[0]?.name || booking.user?.name}</p>
              <p className="text-gray-500 mt-2 mb-0.5">Booked By</p>
              <p className="font-bold text-[13px]">{booking.user?.name || 'Agent'}</p>
            </div>
            <div className="text-right text-[11px] text-gray-700">
              <p className="font-bold text-gray-900 mb-1 uppercase">TRIPPECHALO INDIA PRIVATE LIMITED</p>
              <p>First Floor, D 42, Greater Noida Expressway</p>
              <p>Sector 108, Noida, Uttar Pradesh - 201304</p>
              <p className="font-bold mt-1">GSTIN: 09AAMCT8505A1ZB</p>
              <p>Phone: +91 95559 34205</p>
              <p>Email: trippechaloindia@gmail.com</p>
            </div>
          </div>

          {/* Flight Table */}
          <div className="border border-black rounded-[4px] overflow-hidden mb-8">
            <div className="flex justify-between items-center p-3 border-b border-black bg-white">
              <p className="font-bold text-[13px] uppercase">{originCode}-{destCode} ({travelDateStr.toUpperCase()})</p>
              <p className="text-[12px] text-gray-700">{flightNo}</p>
            </div>
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr>
                  <th className="px-3 py-2 font-normal text-gray-600 w-1/3">Passenger Name(s)</th>
                  <th className="px-3 py-2 font-normal text-gray-600 w-1/4">PNR</th>
                  <th className="px-3 py-2 font-normal text-gray-600 w-1/6">Seat No.</th>
                </tr>
              </thead>
              <tbody>
                {passengers.map((pax: any, i: number) => {
                  const paxConfirmation = nexusData?.booking_items?.[0]?.confirmations?.find((c: any) => c.pax_id === pax.id || c.pax_id === i);
                  const tktNo = paxConfirmation?.pnr || `${displayPnr}${i}`;
                  return (
                    <tr key={i}>
                      <td className="px-3 py-3 font-bold text-[13px]">{pax.name || pax.firstName + ' ' + pax.lastName}</td>
                      <td className="px-3 py-3 text-gray-600">{tktNo}</td>
                      <td className="px-3 py-3 text-gray-600 font-bold">{booking.details?.seats?.[i] || pax.seat || 'Unassigned'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="text-[10px] text-gray-500 mt-12 text-center space-y-1">
            <p className="font-bold text-[11px] mb-2">IMPORTANT INFORMATION</p>
            <p>1. This is an E-Ticket. A boarding pass will be issued after Web Check-in on the airline's website.</p>
            <p>2. Passengers must carry a valid photo ID and this E-Ticket to enter the airport.</p>
            <p>3. Web Check-in usually opens 48 hours prior to the scheduled departure time.</p>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
