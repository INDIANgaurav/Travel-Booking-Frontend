import React, { useEffect, useState } from 'react';
import { Plane, Calendar, CreditCard, ChevronRight, FileText } from 'lucide-react';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/api/bookings/my-bookings');
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Trips</h1>

      {bookings.length === 0 ? (
        <div className="bg-white p-10 md:p-16 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plane size={40} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No trips booked yet</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't booked any flights yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any) => (
            <div key={booking._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded text-xs font-bold ${
                    booking.status?.toUpperCase() === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                    booking.status?.toUpperCase() === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {booking.status?.toUpperCase()}
                  </span>
                  <span className="text-gray-500 text-xs">Booking ID: <span className="font-bold text-gray-700">{booking.bookingId || booking._id.slice(-8)}</span></span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">₹ {booking.totalAmount?.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-5 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      {booking.type === 'FLIGHT' || booking.type === 'Flight' ? <Plane className="text-blue-500 w-5 h-5" /> : <Plane className="text-blue-500 w-5 h-5" />}
                      <span className="font-bold text-lg text-gray-800">
                        {booking.details?.from} <span className="text-gray-400 mx-1">→</span> {booking.details?.to}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="block text-gray-400 text-xs mb-1">Date</span>
                      <span className="font-medium text-gray-800">
                        {new Date(booking.date || booking.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-400 text-xs mb-1">Airline</span>
                      <span className="font-medium text-gray-800">{booking.details?.airline || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400 text-xs mb-1">Passengers</span>
                      <span className="font-medium text-gray-800">{booking.details?.passengers?.length || 1}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row justify-end gap-3 mt-4 md:mt-0">
                  <button 
                    onClick={() => navigate(`/dashboard/invoice/${booking._id}`)}
                    className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                  >
                    <FileText size={16} /> Download Ticket
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
