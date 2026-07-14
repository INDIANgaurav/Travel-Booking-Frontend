import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { Loader2, Printer, ArrowLeft, Plane } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../../../components/common/Loader';
import TopNavbar from '../../../components/layout/TopNavbar';

export default function FlightTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data } = await api.get(`/api/bookings/${id}`);
        setBooking(data);
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error('Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBooking();
  }, [id]);

  if (loading) {
    return <Loader fullScreen={true} />;
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
    
  const flightNo = `FL-${Math.floor(Math.random() * 900) + 100}`;
  const gate = `D${Math.floor(Math.random() * 40) + 1}`;
  
  // Create a 3-letter code from city name (mock logic)
  const getAirportCode = (city: string) => city ? city.substring(0, 3).toUpperCase() : 'XXX';
  const originCode = booking.type === 'FLIGHT' ? getAirportCode(booking.details?.from) : '';
  const destCode = booking.type === 'FLIGHT' ? getAirportCode(booking.details?.to) : '';
  const dateStr = new Date(booking.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '').toUpperCase();
  const boardingTime = "19:30"; // Mock time

  return (
    <>
      <div className="print:hidden">
        <TopNavbar forceWhite={true} />
      </div>
      <div className="min-h-[calc(100vh-80px)] bg-[#f3f4f6] pt-28 pb-8 px-4 font-sans print:bg-white print:py-0 print:px-0 flex flex-col items-center justify-start">
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
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200"
        >
          <ArrowLeft size={18} />
          Back to Bookings
        </button>
        <button 
          onClick={handlePrint}
          className={`flex items-center gap-2 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-colors ${booking.type === 'HOTEL' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
        >
          <Printer size={18} />
          Print {booking.type === 'HOTEL' ? 'Voucher' : 'Boarding Pass'}
        </button>
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
                travel<span className="text-blue-500">app</span>
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
        <div className="flex flex-col gap-8 w-full items-center">
          {passengers.map((passenger: any, index: number) => {
            const pName = passenger.name || passenger.firstName + ' ' + passenger.lastName || 'PASSENGER';
            const pSeat = booking.details?.seats?.[index] || '18A';
            return (
              <div key={index} className="w-full max-w-5xl flex drop-shadow-2xl print:drop-shadow-none print:w-full relative overflow-hidden bg-white rounded-3xl">
                
                {/* Left Section: Red Sidebar */}
                <div className="w-16 md:w-24 bg-[#c8102e] flex flex-col items-center py-6 shrink-0 z-10 relative">
                  <Plane className="text-white w-8 h-8 md:w-10 md:h-10 transform rotate-45 mb-4" />
          <div className="flex-1 w-full flex items-center justify-center">
             <p className="text-white font-bold tracking-[0.3em] uppercase text-xs md:text-sm -rotate-90 whitespace-nowrap">Boarding Pass</p>
          </div>
          {/* Bottom left curve fix */}
          <div className="absolute bottom-0 left-0 w-full h-8 bg-[#c8102e] rounded-bl-3xl"></div>
        </div>

        {/* Main Section */}
        <div className="flex-1 flex flex-col md:flex-row relative z-0">
          
          {/* Middle part (Flight Details) */}
          <div className="flex-1 p-6 md:p-8 md:pl-20 flex flex-col justify-between relative bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
             
             {/* Header */}
             <div className="flex justify-between items-center border-b-2 border-red-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                   <h2 className="text-xl md:text-2xl font-black italic text-gray-900 tracking-tighter">
                     {booking.details?.airline || 'Air Lines'}
                   </h2>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Booking Ref</p>
                  <p className="text-sm font-bold text-gray-800">{booking.bookingId}</p>
                </div>
             </div>

             {/* Big Destination Codes */}
             <div className="flex items-center justify-center gap-4 md:gap-8 my-6">
                <div className="text-center">
                  <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter">{originCode}</h1>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">{booking.details?.from}</p>
                </div>
                
                <div className="flex flex-col items-center justify-center">
                  <Plane className="text-red-600 w-8 h-8 md:w-12 md:h-12" />
                  <span className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">TO</span>
                </div>

                <div className="text-center">
                  <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter">{destCode}</h1>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">{booking.details?.to}</p>
                </div>
             </div>

             {/* Details Grid */}
             <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-4 mb-6">
               <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Passenger</p>
                 <p className="text-sm md:text-base font-bold text-gray-800 uppercase whitespace-nowrap">{pName}</p>
               </div>
               <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Boarding Time</p>
                 <p className="text-sm md:text-base font-bold text-red-600">{boardingTime}</p>
               </div>
               <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Gate</p>
                 <p className="text-sm md:text-base font-bold text-gray-800">{gate}</p>
               </div>
               <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Seat</p>
                 <p className="text-sm md:text-base font-bold text-gray-800">{pSeat}</p>
               </div>
               <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Date</p>
                 <p className="text-sm md:text-base font-bold text-gray-800">{dateStr}</p>
               </div>
               <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Flight</p>
                 <p className="text-sm md:text-base font-bold text-gray-800">{flightNo}</p>
               </div>
             </div>
             
             {/* Footer note */}
             <div className="text-center border-t border-gray-100 pt-4 mt-auto">
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Gate closed 40 minutes before departure</p>
             </div>
             
             {/* Fake Barcode on the left side of middle section */}
             <div className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 w-12 h-48 bg-gradient-to-b from-gray-900 to-gray-900 opacity-90" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px, transparent 4px, transparent 8px, #000 8px, #000 12px, transparent 12px, transparent 14px, #000 14px, #000 15px)' }}></div>
          </div>

          {/* Perforated Line Separator (Hidden on mobile for better stacking) */}
          <div className="hidden md:flex flex-col justify-center items-center relative z-10 w-4 bg-white">
            <div className="h-full w-0 border-l-2 border-dashed border-gray-300"></div>
            {/* Top Cutout */}
            <div className="absolute top-0 -translate-y-1/2 w-8 h-8 bg-[#f3f4f6] print:bg-white rounded-full"></div>
            {/* Bottom Cutout */}
            <div className="absolute bottom-0 translate-y-1/2 w-8 h-8 bg-[#f3f4f6] print:bg-white rounded-full"></div>
          </div>

          {/* Right Section (Tear-off) */}
          <div className="md:w-64 p-6 md:p-8 flex flex-col bg-white shrink-0 border-t-2 border-dashed border-gray-300 md:border-t-0 relative">
             <div className="space-y-4 flex-1">
               <div className="flex justify-between items-center">
                 <p className="text-[10px] font-bold text-gray-400 uppercase">From</p>
                 <p className="text-sm font-bold text-gray-800">{booking.details?.from} / {originCode}</p>
               </div>
               <div className="flex justify-between items-center">
                 <p className="text-[10px] font-bold text-gray-400 uppercase">To</p>
                 <p className="text-sm font-bold text-gray-800">{booking.details?.to} / {destCode}</p>
               </div>
               
               <div className="pt-4 border-t border-gray-100">
                 <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Passenger</p>
                 <p className="text-sm font-bold text-gray-800 uppercase whitespace-nowrap">{pName}</p>
               </div>
               
               <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Date</p>
                 <p className="text-sm font-bold text-gray-800">{dateStr}</p>
               </div>
               
               <div className="flex justify-between items-center">
                 <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Flight</p>
                   <p className="text-sm font-bold text-gray-800">{flightNo}</p>
                 </div>
                 <div className="bg-[#c8102e] text-white p-3 rounded-xl text-center shadow-lg -mr-4 md:-mr-8 relative z-20">
                   <p className="text-[10px] font-bold uppercase opacity-80 mb-1">Seat</p>
                   <p className="text-xl font-black">{pSeat}</p>
                 </div>
               </div>
             </div>
             
             {/* Small barcode for right side */}
             <div className="w-full h-8 mt-6 opacity-70" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 1px, #000 1px, #000 3px, transparent 3px, transparent 5px, #000 5px, #000 6px, transparent 6px, transparent 10px, #000 10px, #000 12px)' }}></div>
          </div>
        </div>
      </div>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}
