import React, { useEffect, useState, useMemo } from 'react';
import { 
  Plane, Calendar, Building2, ChevronRight, FileText, ChevronDown, ChevronUp, 
  MapPin, Users, Briefcase, XCircle, CheckCircle2, AlertCircle, Ticket, 
  Clock, ExternalLink, ArrowRight, ShieldCheck, Copy, Check, Sparkles, Navigation
} from 'lucide-react';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../store/authSlice';
import toast from 'react-hot-toast';
import CancellationModal from '../../../components/bookings/CancellationModal';
import Loader from '../../../components/common/Loader';
import ETicketModal from '../../../components/bookings/ETicketModal';

const CITY_NAMES: Record<string, string> = {
  DEL: 'New Delhi',
  BOM: 'Mumbai',
  BLR: 'Bengaluru',
  MAA: 'Chennai',
  CCU: 'Kolkata',
  HYD: 'Hyderabad',
  GOI: 'Goa',
  PNQ: 'Pune',
  AMD: 'Ahmedabad',
  COK: 'Kochi',
  JAI: 'Jaipur',
  LKO: 'Lucknow',
  IXC: 'Chandigarh',
  GAU: 'Guwahati',
  PAT: 'Patna',
  DXB: 'Dubai',
  BKK: 'Bangkok',
  SIN: 'Singapore',
  LHR: 'London'
};

const getAirlineInfo = (airlineName = '') => {
  const name = (airlineName || '').toLowerCase();
  if (name.includes('indigo') || name.includes('6e')) {
    return { name: 'IndiGo', logo: '/indigo-logo.svg', code: '6E', color: '#001b94' };
  }
  if (name.includes('spice') || name.includes('sg')) {
    return { name: 'SpiceJet', logo: '/spicejet-logo.svg', code: 'SG', color: '#ed1b24' };
  }
  if (name.includes('akasa') || name.includes('qp')) {
    return { name: 'Akasa Air', logo: '/akasa-logo.svg', code: 'QP', color: '#ff6600' };
  }
  if (name.includes('air india') || name.includes('ai') || name.includes('express')) {
    return { name: 'Air India Express', logo: '/airindia-express-logo.svg', code: 'IX', color: '#e31837' };
  }
  if (name.includes('emirates') || name.includes('ek')) {
    return { name: 'Emirates', logo: '/emirates-logo.svg', code: 'EK', color: '#d71921' };
  }
  return { name: airlineName || 'Airlines', logo: null, code: 'FL', color: '#2563eb' };
};

export default function BookingsPage() {
  const user = useSelector(selectCurrentUser);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('UPCOMING');
  const [cancellationBookingId, setCancellationBookingId] = useState<string | null>(null);
  const [ticketModalBooking, setTicketModalBooking] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/api/bookings/my-bookings');
      setBookings(data.bookings || data || []);
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
    setExpandedBookingId(prev => prev === id ? null : id);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!', { id: 'copy-toast' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tabCounts = useMemo(() => {
    const counts = { UPCOMING: 0, CANCELLED: 0, COMPLETED: 0, UNSUCCESSFUL: 0 };
    bookings.forEach((b: any) => {
      const status = b.status?.toUpperCase() || 'PENDING';
      const isHotel = b.type?.toUpperCase() === 'HOTEL';
      const travelDate = isHotel ? new Date(b.details?.checkOut || b.createdAt) : new Date(b.date || b.createdAt);
      const isPast = travelDate.getTime() < new Date().getTime();

      if ((status === 'CONFIRMED' || status === 'PENDING') && !isPast) counts.UPCOMING++;
      else if (status === 'CANCELLED') counts.CANCELLED++;
      else if (status === 'COMPLETED' || (status === 'CONFIRMED' && isPast)) counts.COMPLETED++;
      else if (status === 'FAILED' || (status === 'PENDING' && isPast)) counts.UNSUCCESSFUL++;
    });
    return counts;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b: any) => {
      const status = b.status?.toUpperCase() || 'PENDING';
      const isHotel = b.type?.toUpperCase() === 'HOTEL';
      const travelDate = isHotel ? new Date(b.details?.checkOut || b.createdAt) : new Date(b.date || b.createdAt);
      const isPast = travelDate.getTime() < new Date().getTime();

      if (activeTab === 'UPCOMING') return (status === 'CONFIRMED' || status === 'PENDING') && !isPast;
      if (activeTab === 'CANCELLED') return status === 'CANCELLED';
      if (activeTab === 'COMPLETED') return status === 'COMPLETED' || (status === 'CONFIRMED' && isPast);
      if (activeTab === 'UNSUCCESSFUL') return status === 'FAILED' || (status === 'PENDING' && isPast);
      return true;
    });
  }, [bookings, activeTab]);

  const tabs = [
    { id: 'UPCOMING', label: 'Upcoming', icon: <Calendar size={16} />, count: tabCounts.UPCOMING },
    { id: 'COMPLETED', label: 'Completed', icon: <CheckCircle2 size={16} />, count: tabCounts.COMPLETED },
    { id: 'CANCELLED', label: 'Cancelled', icon: <XCircle size={16} />, count: tabCounts.CANCELLED },
    { id: 'UNSUCCESSFUL', label: 'Failed / Expired', icon: <AlertCircle size={16} />, count: tabCounts.UNSUCCESSFUL },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] pb-24 font-sans relative">
      
      {/* Premium Navy Hero Header Banner */}
      <div className="relative bg-gradient-to-br from-[#070b24] via-[#0b1031] to-[#040717] text-white pt-8 pb-20 px-6 sm:px-10 border-b border-white/10 shadow-lg overflow-hidden">
        {/* Ambient Glow & Grid Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-10 left-1/4 w-[400px] h-[200px] bg-indigo-500/10 blur-[90px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-200/70 mb-3">
            <span className="cursor-pointer hover:text-white transition" onClick={() => navigate('/')}>Home</span>
            <span>/</span>
            <span className="text-blue-300">My Account</span>
            <span>/</span>
            <span className="text-white font-bold">My Trips</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/20">
                  <Plane size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">My Trips & Bookings</h1>
                  <p className="text-xs sm:text-sm text-blue-100/80 font-medium mt-0.5">
                    Manage your flight & hotel itineraries, download verified e-tickets and board with ease.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 text-xs sm:text-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Sparkles size={16} />
                <span>Book New Trip</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
        
        {/* Navigation Tabs Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-2 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-200/70 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200/80 p-12 sm:p-20 text-center shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-5 text-blue-600 shadow-inner">
              <Briefcase size={36} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
              No {activeTab.toLowerCase()} trips found
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-8 font-medium">
              You don't have any bookings under the <strong className="text-gray-700">{activeTab.toLowerCase()}</strong> status. Start exploring domestic and international flights with exclusive series fares!
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <Navigation size={16} />
              <span>Explore Flights & Hotels</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking: any) => {
              const isHotel = booking.type?.toUpperCase() === 'HOTEL';
              const isExpanded = expandedBookingId === booking._id;
              const status = booking.status?.toUpperCase() || 'PENDING';
              const bookingIdStr = booking.bookingId || booking._id;
              
              // Airline & Route details
              const airline = getAirlineInfo(booking.details?.airline);
              const pnr = booking.details?.pnr || booking.pnr || booking.airlinePnr;
              const fromCode = (booking.details?.from || 'DEL').toUpperCase();
              const toCode = (booking.details?.to || 'BOM').toUpperCase();
              const fromCity = CITY_NAMES[fromCode] || booking.details?.fromCity || fromCode;
              const toCity = CITY_NAMES[toCode] || booking.details?.toCity || toCode;
              const travelDate = new Date(booking.date || booking.createdAt);
              const formattedDate = travelDate.toLocaleDateString('en-GB', { 
                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' 
              });
              const passengerCount = booking.details?.passengers?.length || 1;
              const primaryPassenger = booking.details?.passengers?.[0]?.name || 
                `${booking.details?.passengers?.[0]?.firstName || ''} ${booking.details?.passengers?.[0]?.lastName || ''}`.trim() || 
                user?.name || 'Passenger';

              return (
                <div 
                  key={booking._id} 
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_10px_30px_-4px_rgba(15,23,42,0.1)] transition-all duration-300 overflow-hidden"
                >
                  {/* Top Bar: Status, Booking ID, PNR, Total Fare */}
                  <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Status Pill */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase border ${
                        status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          status === 'CONFIRMED' ? 'bg-emerald-500 animate-pulse' :
                          status === 'PENDING' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        {status}
                      </span>

                      {/* Booking ID Pill */}
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-lg px-2.5 py-1 text-xs text-slate-600 font-semibold shadow-2xs">
                        <span className="text-slate-400 font-medium">Booking ID:</span>
                        <span className="font-mono font-bold text-slate-800">{bookingIdStr}</span>
                        <button
                          onClick={() => handleCopy(bookingIdStr, booking._id + '-bid')}
                          className="text-slate-400 hover:text-blue-600 transition ml-1"
                          title="Copy Booking ID"
                        >
                          {copiedId === booking._id + '-bid' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        </button>
                      </div>

                      {/* Airline PNR Badge */}
                      {pnr && (
                        <div className="flex items-center gap-1.5 bg-blue-50/80 border border-blue-200/70 rounded-lg px-2.5 py-1 text-xs text-blue-900 font-bold">
                          <span className="text-blue-600/80 font-medium uppercase text-[10px] tracking-wider">PNR:</span>
                          <span className="font-mono font-black">{pnr}</span>
                          <button
                            onClick={() => handleCopy(pnr, booking._id + '-pnr')}
                            className="text-blue-400 hover:text-blue-800 transition ml-1"
                            title="Copy PNR"
                          >
                            {copiedId === booking._id + '-pnr' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Total Price */}
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Fare</span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        ₹{booking.totalAmount?.toLocaleString('en-IN') || '0'}
                      </span>
                    </div>
                  </div>

                  {/* Main Journey Row */}
                  <div className="p-5 sm:p-7">
                    {isHotel ? (
                      /* Hotel Summary */
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                          <Building2 size={28} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="text-xl font-black text-slate-900">{booking.details?.hotelName || 'Luxury Hotel Stay'}</h3>
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <MapPin size={13} className="text-slate-400" />
                            <span>{booking.details?.address || 'Prime City Location'}</span>
                          </p>
                          <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-slate-700">
                            <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5">
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Check-in</span>
                              <span>{booking.details?.checkIn ? new Date(booking.details.checkIn).toLocaleDateString('en-GB') : 'N/A'}</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5">
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Check-out</span>
                              <span>{booking.details?.checkOut ? new Date(booking.details?.checkOut).toLocaleDateString('en-GB') : 'N/A'}</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5">
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Room & Guests</span>
                              <span>{booking.details?.roomType || 'Standard'} · {booking.details?.guests || 1} Guest(s)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Flight Summary Ticket Card */
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        
                        {/* Airline Logo & Name */}
                        <div className="lg:col-span-3 flex items-center gap-3.5">
                          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center p-2 shrink-0">
                            {airline.logo ? (
                              <img src={airline.logo} alt={airline.name} className="w-full h-full object-contain" />
                            ) : (
                              <Plane size={24} className="text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-black text-base text-slate-900 leading-snug">{airline.name}</h4>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                              {booking.details?.flightNumber || `${airline.code}-841`}
                            </p>
                            <span className="inline-block mt-1 text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                              Economy Class
                            </span>
                          </div>
                        </div>

                        {/* Origin -> Route Duration -> Destination */}
                        <div className="lg:col-span-6 bg-slate-50/60 border border-slate-100 rounded-2xl p-4 sm:p-5">
                          <div className="flex items-center justify-between gap-4">
                            
                            {/* Origin */}
                            <div className="text-left min-w-[80px]">
                              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight block">
                                {fromCode}
                              </span>
                              <span className="text-xs font-bold text-slate-600 truncate block max-w-[110px]" title={fromCity}>
                                {fromCity}
                              </span>
                              <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                                Terminal 1D
                              </span>
                            </div>

                            {/* Dotted Flight Path Graphic */}
                            <div className="flex-1 px-2 sm:px-4 text-center">
                              <span className="text-[11px] font-bold text-slate-500 block mb-1">
                                {formattedDate}
                              </span>
                              <div className="relative flex items-center justify-center">
                                <div className="w-full border-t-2 border-dashed border-slate-300"></div>
                                <div className="absolute w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
                                  <Plane size={14} className="rotate-90 transform" />
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mt-1.5">
                                Non-Stop Flight
                              </span>
                            </div>

                            {/* Destination */}
                            <div className="text-right min-w-[80px]">
                              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight block">
                                {toCode}
                              </span>
                              <span className="text-xs font-bold text-slate-600 truncate block max-w-[110px]" title={toCity}>
                                {toCity}
                              </span>
                              <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                                Terminal 2
                              </span>
                            </div>

                          </div>
                        </div>

                        {/* Passenger & Baggage Chip Details */}
                        <div className="lg:col-span-3 border-l-0 lg:border-l border-slate-100 lg:pl-6 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Users size={14} className="text-blue-600 shrink-0" />
                            <span className="truncate font-semibold text-slate-800">{primaryPassenger}</span>
                            {passengerCount > 1 && (
                              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full shrink-0">
                                +{passengerCount - 1} more
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                            <span>15kg Check-in · 7kg Cabin</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            Booked on: {new Date(booking.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                  {/* Actions Footer Bar */}
                  <div className="px-5 sm:px-7 py-3.5 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    
                    {/* View Details Accordion Trigger */}
                    <button
                      onClick={() => toggleExpand(booking._id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition cursor-pointer py-1.5"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Flight Details'}</span>
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Cancel Booking (Only for upcoming active bookings) */}
                      {activeTab === 'UPCOMING' && status === 'CONFIRMED' && (
                        <button
                          onClick={() => setCancellationBookingId(booking._id)}
                          className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100/80 text-rose-700 border border-rose-200/80 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          <XCircle size={14} />
                          <span>Cancel Booking</span>
                        </button>
                      )}

                      {/* Web Check-in */}
                      {!isHotel && status === 'CONFIRMED' && (
                        <button
                          onClick={() => {
                            toast.success(`Redirecting to ${airline.name} Web Check-in...`);
                            setTimeout(() => {
                              window.open('https://www.google.com/search?q=web+check+in+' + encodeURIComponent(airline.name), '_blank');
                            }, 1000);
                          }}
                          className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                        >
                          <Plane size={14} />
                          <span>Web Check-in</span>
                        </button>
                      )}

                      {/* Invoice */}
                      {status !== 'PENDING' && (
                        <button
                          onClick={() => {
                            const basePath = user?.roles?.includes('B2B_AGENT') ? '/agent-portal' : user?.roles?.includes('SUPER_ADMIN') ? '/admin' : user?.roles?.includes('SUB_ADMIN') ? '/sub-admin' : '/dashboard';
                            navigate(`${basePath}/invoice/${booking._id}`);
                          }}
                          className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                        >
                          <FileText size={14} className="text-slate-500" />
                          <span>Invoice</span>
                        </button>
                      )}

                      {/* E-Ticket (Primary CTA) */}
                      {status !== 'PENDING' && (
                        <button
                          onClick={() => setTicketModalBooking(booking)}
                          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm shadow-blue-600/20 cursor-pointer"
                        >
                          <Ticket size={14} />
                          <span>E-Ticket</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Flight / Hotel Details Sheet */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-6 bg-slate-50/50 space-y-5 animate-in fade-in duration-200">
                      {isHotel ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                            <h5 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Guest Information</h5>
                            <p className="text-sm font-bold text-slate-800">{booking.details?.contactDetails?.name || user?.name}</p>
                            <p className="text-xs text-slate-500 mt-1">{booking.details?.contactDetails?.email || user?.email}</p>
                            <p className="text-xs text-slate-500">{booking.details?.contactDetails?.phone || user?.phone}</p>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                            <h5 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Hotel Policy & Timing</h5>
                            <p className="text-xs text-slate-600">Standard Check-in: <strong>02:00 PM</strong></p>
                            <p className="text-xs text-slate-600 mt-1">Standard Check-out: <strong>11:00 AM</strong></p>
                            <p className="text-xs text-slate-500 mt-2">Government approved photo ID required during check-in.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Passenger List Cards */}
                          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
                            <h5 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-3 flex items-center justify-between">
                              <span>Passenger Itinerary & Assigned Seats</span>
                              <span className="text-[11px] font-bold text-blue-600">
                                {booking.details?.passengers?.length || 1} Total
                              </span>
                            </h5>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {(booking.details?.passengers || [{ name: user?.name || 'Passenger' }]).map((p: any, idx: number) => {
                                const seat = booking.details?.seats?.[idx] || p.seat || 'Assigned at Check-in';
                                const fullName = p.name || `${p.title || ''} ${p.firstName || ''} ${p.lastName || ''}`.trim() || `Passenger ${idx + 1}`;
                                return (
                                  <div key={idx} className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-slate-800 truncate">{idx + 1}. {fullName}</p>
                                      <p className="text-[10px] text-slate-400 uppercase font-semibold">{p.type || 'Adult'}</p>
                                    </div>
                                    <span className="text-xs font-mono font-bold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded shadow-2xs shrink-0">
                                      {seat}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Important Airport Guidelines */}
                          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900">
                            <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold">Important Travel Guidelines:</p>
                              <p className="text-blue-800/80 mt-0.5">
                                Please reach the airport at least 2 hours before domestic flight departure. Web check-in opens 48 hours prior to flight departure. Carry a valid government photo ID card.
                              </p>
                            </div>
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

      {/* Cancellation Modal */}
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

      {/* E-Ticket Preview Modal */}
      {ticketModalBooking && (
        <ETicketModal 
          booking={ticketModalBooking} 
          onClose={() => setTicketModalBooking(null)} 
        />
      )}

    </div>
  );
}
