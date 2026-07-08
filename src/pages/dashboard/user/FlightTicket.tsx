import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

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
        toast.error('Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-blue-600 bg-gray-50">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 font-sans print:bg-white print:py-0 print:px-0">
      
      {/* Non-Printable Header/Controls */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200"
        >
          <ArrowLeft size={18} />
          Back to Bookings
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow-sm"
        >
          <Printer size={18} />
          Print / Save PDF
        </button>
      </div>

      {/* Printable Invoice Container */}
      <div className="max-w-4xl mx-auto bg-white p-10 shadow-lg border border-gray-200 print:shadow-none print:border-none print:p-0">
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8 border-b-2 border-red-500 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Tax Invoice</h1>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Invoice No. : INV-{booking.bookingId}</p>
              <p>Invoice Date : {new Date(booking.createdAt).toLocaleDateString()}</p>
              <p>PAN No. : AADCM5146R</p>
              <p>GSTIN No. : 06AADCM5146R1ZZ</p>
              <p>Service Category : Reservation services for air transportation.</p>
              <p>SAC Code : 998551</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter flex items-center justify-end gap-1">
              travel<span className="text-red-500">app</span>
            </h2>
            <div className="text-xs text-gray-600 mt-4 text-right">
              <p className="font-bold text-gray-800">Customer Details</p>
              <p>Place of Supply: Haryana</p>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-orange-100 border border-orange-200 text-orange-800 text-sm font-semibold p-3 text-center mb-6">
          This is not a valid E-Ticket for Travel. Please refer to attached E-Ticket for PNR, departure time, terminal information etc
        </div>

        {/* Booking Meta */}
        <div className="border border-gray-300 grid grid-cols-3 mb-6 text-xs">
          <div className="p-3 border-r border-gray-300">
            <p className="font-bold text-gray-800 mb-1">Booked by</p>
            <p className="uppercase">{booking.user?.name}</p>
            <p className="text-gray-500">({booking.details?.contactDetails?.email || booking.user?.email})</p>
            <p className="text-gray-500">({booking.details?.contactDetails?.phone || booking.user?.phone})</p>
          </div>
          <div className="p-3 border-r border-gray-300">
            <p className="font-bold text-gray-800 mb-1">Booking ID</p>
            <p>{booking.bookingId}</p>
          </div>
          <div className="p-3">
            <p className="font-bold text-gray-800 mb-1">Booked Date</p>
            <p>{new Date(booking.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Flight Details */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-red-600 mb-2">Flight Details</h3>
          <div className="border border-gray-300 p-3 grid grid-cols-3 items-center text-sm">
            <div>
              <p className="font-bold text-gray-800">{booking.details?.airline || 'Airline'}</p>
              <p className="text-gray-500 text-xs">FL-{Math.floor(Math.random() * 900) + 100}</p>
            </div>
            <div className="text-center font-bold text-lg text-gray-800">
              {booking.details?.from}
              <span className="block text-xs text-gray-500 font-normal">Origin</span>
            </div>
            <div className="text-center font-bold text-lg text-gray-800">
              {booking.details?.to}
              <span className="block text-xs text-gray-500 font-normal">Destination</span>
            </div>
          </div>
        </div>

        {/* Passengers */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-red-600 mb-2">Passengers:</h3>
          <div className="border border-gray-300">
            {booking.details?.passengers?.map((p: any, idx: number) => (
              <div key={idx} className={`p-2 text-xs flex justify-between ${idx > 0 ? 'border-t border-gray-300' : ''}`}>
                <span className="uppercase">0{idx + 1}. {p.name} ({p.passengerType})</span>
                <span className="font-bold text-gray-600">Seat: {booking.details?.seats?.[idx] || 'Auto'}</span>
              </div>
            )) || <div className="p-2 text-xs uppercase">01. {booking.user?.name}</div>}
          </div>
        </div>

        {/* Fare Details */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-red-600 mb-2">Fare Details</h3>
          <table className="w-full text-left text-xs border border-gray-300 border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 w-1/2">Fare/Charges</th>
                <th className="border border-gray-300 p-2 text-center">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 font-bold text-gray-800">Base Fare</td>
                <td className="border border-gray-300 p-2 text-right">{(booking.totalAmount * 0.7).toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-bold text-gray-800" colSpan={2}>Tax and Other Charges:</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 pl-6">Other Surcharge / Taxes</td>
                <td className="border border-gray-300 p-2 text-right">{(booking.totalAmount * 0.3).toFixed(2)}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-2 font-bold text-gray-900">Grand Total:</td>
                <td className="border border-gray-300 p-2 text-right font-bold text-gray-900 text-sm">
                  {booking.totalAmount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="text-[10px] text-gray-500 mt-8 pt-4 border-t border-gray-300 text-center">
          <p>The instant discount is jointly extended by TravelApp and your bank. The service fees charged by TravelApp has been reversed to the extent of instant discount extended by TravelApp.</p>
          <p className="mt-1">This is a computer generated invoice and does not require signature.</p>
        </div>

      </div>
    </div>
  );
}
