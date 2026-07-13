import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopNavbar from '../../components/layout/TopNavbar';
import { CheckCircle, MapPin, Calendar, Clock, Download, Home, Printer, Users } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

export default function HotelBookingSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const componentRef = useRef(null);
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  if (!state || !state.booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <TopNavbar />
        <h1 className="text-2xl font-bold mt-20 text-gray-900">No Booking Data Found</h1>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 font-bold">Return Home</button>
      </div>
    );
  }

  const { booking, hotel, room, paymentId, totalAmount, taxes, nights } = state;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <TopNavbar />
      
      <div className="bg-[#0a1a3a] pt-28 pb-32">
        <div className="max-w-[800px] mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
            <CheckCircle size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Booking Confirmed!</h1>
          <p className="text-blue-100 font-medium">Your hotel reservation is successful. Booking ID: {booking.bookingId}</p>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 -mt-24">
        
        {/* Printable Ticket Area */}
        <div ref={componentRef} className="bg-white rounded-xl shadow-xl overflow-hidden print:shadow-none print:border-none">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 flex justify-between items-center">
            <div className="text-white font-black text-2xl tracking-tighter">
              Travel<span className="text-[#ff9e00]">Go</span>
            </div>
            <div className="text-right text-white">
              <p className="text-xs font-bold uppercase tracking-wider opacity-80">Booking Status</p>
              <p className="font-black text-lg text-green-400">CONFIRMED</p>
            </div>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900">{hotel.name}</h2>
                <p className="text-gray-500 flex items-center gap-1 mt-1 text-sm font-medium"><MapPin size={14}/> {hotel.address}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Booking ID</p>
                <p className="text-lg font-black text-gray-900">{booking.bookingId}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-blue-50/50 p-6 rounded-xl border border-blue-100 mb-8">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar size={12}/> Check In</p>
                <p className="font-black text-gray-900">{new Date(booking.details.checkIn).toLocaleDateString('en-GB')}</p>
                <p className="text-xs text-gray-500 mt-1">12:00 PM</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar size={12}/> Check Out</p>
                <p className="font-black text-gray-900">{new Date(booking.details.checkOut).toLocaleDateString('en-GB')}</p>
                <p className="text-xs text-gray-500 mt-1">11:00 AM</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Clock size={12}/> Duration</p>
                <p className="font-black text-gray-900">{nights} Night(s)</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Users size={12}/> Guests</p>
                <p className="font-black text-gray-900">{booking.details.guests} Guest(s)</p>
                <p className="text-xs text-blue-600 font-bold mt-1">{booking.details.roomType}</p>
              </div>
            </div>

            <div className="border-t border-b border-gray-100 py-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">Guest Details</h3>
              <p className="text-gray-700 font-medium">{booking.details.contactDetails.name}</p>
              <p className="text-gray-500 text-sm mt-1">{booking.details.contactDetails.email} • {booking.details.contactDetails.phone}</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">Payment Summary</h3>
              <div className="flex justify-between items-center text-sm mb-2 text-gray-600">
                <span>Room Charges</span>
                <span className="font-medium">₹{totalAmount - taxes}</span>
              </div>
              <div className="flex justify-between items-center text-sm mb-4 text-gray-600">
                <span>Taxes & Fees</span>
                <span className="font-medium">₹{taxes}</span>
              </div>
              <hr className="border-gray-200 mb-4" />
              <div className="flex justify-between items-center">
                <span className="font-black text-gray-900 text-lg">Amount Paid</span>
                <span className="font-black text-blue-600 text-2xl">₹{totalAmount}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
                <span>Payment Method: Online</span>
                <span>Transaction ID: {paymentId}</span>
              </div>
            </div>
            
            <div className="mt-8 text-center text-xs text-gray-400">
              <p>Please present this booking confirmation along with a valid ID at the time of check-in.</p>
              <p>Generated on {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons (Don't Print These) */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 print:hidden">
          <button 
            onClick={() => handlePrint()}
            className="flex-1 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Printer size={20} /> Print / Save Invoice
          </button>
          <button 
            onClick={() => navigate('/dashboard/bookings')}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition"
          >
            <Home size={20} /> Go to My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}
