import React, { useEffect, useState } from 'react';
import { Plane, Calendar, Building2, ChevronRight, FileText, ChevronDown, ChevronUp, MapPin, Users, Briefcase, XCircle, CheckCircle2, AlertCircle, Ticket } from 'lucide-react';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../../../components/layout/TopNavbar';
import CancellationModal from '../../../components/bookings/CancellationModal';
import Loader from '../../../components/common/Loader';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('UPCOMING');
  const [cancellationBookingId, setCancellationBookingId] = useState<string | null>(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchBookings();
  }, []);

  const toggleExpand = (id: string) => {
    if (expandedBookingId === id) {
      setExpandedBookingId(null);
    } else {
      setExpandedBookingId(id);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const filteredBookings = bookings.filter((b: any) => {
    const status = b.status?.toUpperCase() || 'PENDING';
    const isHotel = b.type?.toUpperCase() === 'HOTEL';
    // Use checkOut for hotels, or flight date for flights to determine if past
    const travelDate = isHotel ? new Date(b.details?.checkOut || b.createdAt) : new Date(b.date || b.createdAt);
    const isPast = travelDate.getTime() < new Date().getTime();

    if (activeTab === 'UPCOMING') return (status === 'CONFIRMED' || status === 'PENDING') && !isPast;
    if (activeTab === 'CANCELLED') return status === 'CANCELLED';
    if (activeTab === 'COMPLETED') return status === 'COMPLETED' || (status === 'CONFIRMED' && isPast);
    if (activeTab === 'UNSUCCESSFUL') return status === 'FAILED' || (status === 'PENDING' && isPast);
    return true;
  });

  const tabs = [
    { id: 'UPCOMING', label: 'UPCOMING', icon: <Calendar size={18} /> },
    { id: 'CANCELLED', label: 'CANCELLED', icon: <XCircle size={18} /> },
    { id: 'COMPLETED', label: 'COMPLETED', icon: <CheckCircle2 size={18} /> },
    { id: 'UNSUCCESSFUL', label: 'UNSUCCESSFUL', icon: <AlertCircle size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 pb-20 relative font-sans">
      <TopNavbar forceWhite={true} />
      
      {/* Background Gradient Header */}
      <div className="absolute top-0 left-0 w-full h-[280px] bg-gradient-to-r from-[#00b4cc] to-[#0074d9] z-0"></div>

      <div className="pt-24 max-w-[1100px] mx-auto px-4 md:px-8 space-y-6 relative z-10">
        <h1 className="text-xl font-bold text-white mb-6">My Account &gt; My Trips</h1>

        <div className="bg-white rounded-t-xl rounded-b-md shadow-lg border-b-4 border-blue-600 min-h-[500px]">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-6 pt-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-bold text-sm tracking-wide border-b-4 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-blue-500'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8 bg-[#f4f4f4] min-h-[420px] rounded-b-md">
            {filteredBookings.length === 0 ? (
              <div className="bg-white p-10 md:p-20 rounded-lg text-center flex flex-col items-center justify-center min-h-[350px]">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <Briefcase size={40} className="text-gray-400" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-300 rounded-full"></div>
                  <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gray-300 rounded-full"></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Looks empty, you've no {activeTab.toLowerCase()} bookings.</h2>
                <p className="text-gray-500 mb-8 font-medium">When you book a trip, you will see your itinerary here.</p>
                <button 
                  onClick={() => navigate('/')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-full transition shadow-md"
                >
                  PLAN A TRIP
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredBookings.map((booking: any) => {
              const isHotel = booking.type?.toUpperCase() === 'HOTEL';
              const isExpanded = expandedBookingId === booking._id;

              return (
                <div key={booking._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${
                        booking.status?.toUpperCase() === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                        booking.status?.toUpperCase() === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {booking.status?.toUpperCase()}
                      </span>
                      <span className="text-gray-500 text-xs font-medium">
                        Booking ID: <span className="font-bold text-gray-700 uppercase">{booking.bookingId || booking._id.slice(-8)}</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-gray-900">₹ {booking.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Main Summary */}
                  <div className="p-5 flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-full ${isHotel ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                          {isHotel ? <Building2 size={20} /> : <Plane size={20} />}
                        </div>
                        <span className="font-black text-lg text-gray-900">
                          {isHotel ? booking.details?.hotelName : (
                            <>{booking.details?.from} <span className="text-gray-400 mx-1 font-normal">→</span> {booking.details?.to}</>
                          )}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        {isHotel ? (
                          <>
                            <div>
                              <span className="block text-gray-400 text-[10px] font-bold uppercase mb-1">Check In</span>
                              <span className="font-bold text-gray-900">
                                {booking.details?.checkIn ? new Date(booking.details.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-[10px] font-bold uppercase mb-1">Check Out</span>
                              <span className="font-bold text-gray-900">
                                {booking.details?.checkOut ? new Date(booking.details.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-[10px] font-bold uppercase mb-1">Room</span>
                              <span className="font-bold text-gray-900">{booking.details?.roomType || 'Standard'}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-[10px] font-bold uppercase mb-1">Guests</span>
                              <span className="font-bold text-gray-900">{booking.details?.guests || 1} Guests</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <span className="block text-gray-400 text-[10px] font-bold uppercase mb-1">Date</span>
                              <span className="font-bold text-gray-900">
                                {new Date(booking.date || booking.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-[10px] font-bold uppercase mb-1">Airline</span>
                              <span className="font-bold text-gray-900">{booking.details?.airline || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-[10px] font-bold uppercase mb-1">Passengers</span>
                              <span className="font-bold text-gray-900">{booking.details?.passengers?.length || 1}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col sm:flex-row justify-end gap-3 mt-4 md:mt-0">
                      {activeTab === 'UPCOMING' && (
                        <button 
                          onClick={() => setCancellationBookingId(booking._id)}
                          className="flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                      <button 
                        onClick={() => toggleExpand(booking._id)}
                        className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                      >
                        View Details {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button 
                        onClick={() => navigate(`/dashboard/invoice/${booking._id}`)}
                        className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                      >
                        <Ticket size={16} /> View E-Ticket
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-5 bg-[#fafafa]">
                      {isHotel ? (
                        <div className="flex gap-6 flex-col sm:flex-row">
                          <img 
                            src={booking.details?.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80'} 
                            alt={booking.details?.hotelName} 
                            className="w-full sm:w-48 h-auto object-cover rounded-md shadow-sm border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80';
                            }}
                          />
                          <div className="flex-1 space-y-4">
                            <div>
                              <h4 className="font-black text-gray-900 text-lg">{booking.details?.hotelName}</h4>
                              <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                                <MapPin size={12} /> {booking.details?.address || 'Address not provided'}
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="border border-gray-200 rounded-md p-3 bg-white">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Stay Details</p>
                                <div className="space-y-1.5 text-sm text-gray-800">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Check In:</span>
                                    <span className="font-bold">{booking.details?.checkIn ? new Date(booking.details.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'} (2:00 PM)</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Check Out:</span>
                                    <span className="font-bold">{booking.details?.checkOut ? new Date(booking.details.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'} (11:00 AM)</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Duration:</span>
                                    <span className="font-bold">
                                      {booking.details?.checkIn && booking.details?.checkOut ? 
                                        Math.max(1, Math.ceil((new Date(booking.details.checkOut).getTime() - new Date(booking.details.checkIn).getTime()) / (1000 * 60 * 60 * 24))) + ' Night(s)'
                                      : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Room:</span>
                                    <span className="font-bold">{booking.details?.roomType || 'Standard Room'}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border border-gray-200 rounded-md p-3 bg-white">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Guest Information</p>
                                <div className="space-y-1.5 text-sm text-gray-800">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Users size={14} className="text-gray-400" />
                                    <span className="font-bold">{booking.details?.contactDetails?.name || booking.details?.contactDetails?.email?.split('@')[0] || 'N/A'}</span>
                                  </div>
                                  <p className="text-xs text-gray-500 pl-6">{booking.details?.contactDetails?.email}</p>
                                  {booking.details?.contactDetails?.phone && (
                                    <p className="text-xs text-gray-500 pl-6">{booking.details?.contactDetails?.phone}</p>
                                  )}
                                  
                                  <div className="mt-2 pl-6 pt-2 border-t border-gray-100">
                                    <span className="font-medium text-gray-700">Total Guests:</span> <span className="font-bold">{booking.details?.guests || 1} Person(s)</span>
                                  </div>
                                  {booking.details?.additionalGuests && booking.details?.additionalGuests.length > 0 && (
                                    <div className="text-xs text-gray-500 pl-6 mt-1">
                                      + {booking.details.additionalGuests.map((ag:any) => ag.firstName).join(', ')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-gray-200 rounded-md p-4">
                           <div className="flex justify-between items-center mb-4">
                             <div className="flex gap-3 items-center">
                               <img src={`https://picsum.photos/seed/${booking.details?.airline}/50/50`} alt={booking.details?.airline} className="w-8 h-8 rounded-full" />
                               <div>
                                 <p className="font-black text-gray-900 text-sm">{booking.details?.airline || 'Airline'}</p>
                                 <p className="text-[10px] text-gray-500 font-bold uppercase">{booking.details?.flightNumber || 'FL-1234'}</p>
                               </div>
                             </div>
                             <div className="text-right">
                               <p className="text-xs font-bold text-green-600">Economy</p>
                             </div>
                           </div>

                           <div className="flex items-center justify-between mt-4 bg-gray-50 p-3 rounded border border-gray-100">
                             <div className="text-center">
                               <p className="font-black text-gray-900">{booking.details?.from}</p>
                               <p className="text-[10px] text-gray-500 font-bold uppercase">Terminal 1</p>
                             </div>
                             <div className="flex-1 px-4 text-center">
                               <div className="border-t-2 border-dashed border-gray-300 relative">
                                 <Plane size={16} className="text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-50 px-1" />
                               </div>
                               <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase">2h 45m</p>
                             </div>
                             <div className="text-center">
                               <p className="font-black text-gray-900">{booking.details?.to}</p>
                               <p className="text-[10px] text-gray-500 font-bold uppercase">Terminal 2</p>
                             </div>
                           </div>
                           
                           <div className="mt-4 border-t border-gray-100 pt-3">
                             <p className="text-xs font-bold text-gray-900 mb-2">Passengers</p>
                             {booking.details?.passengers?.map((p: any, i: number) => {
                               const seat = booking.details?.seats?.[i] || p.seat;
                               const seatStr = seat ? `Seat ${seat}` : 'Seat Unassigned';
                               const fullName = p.name || `${p.title || ''} ${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Passenger';
                               return (
                                 <p key={i} className="text-xs text-gray-600">
                                   {i+1}. {fullName} <span className="text-gray-400">({seatStr})</span>
                                 </p>
                               );
                             })}
                           </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
          </div>
        </div>
      </div>
      
      {cancellationBookingId && (
        <CancellationModal 
          bookingId={cancellationBookingId} 
          onClose={() => setCancellationBookingId(null)}
          onSuccess={() => {
            setCancellationBookingId(null);
            fetchBookings();
          }}
        />
      )}
    </div>
  );
}
