import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import Loader from '../../../components/common/Loader';
import Dropdown from '../../../components/ui/Dropdown';
import RefreshButton from '../../../components/ui/RefreshButton';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/admin/bookings?page=${page}&limit=10`);
      setBookings(data.data || (Array.isArray(data) ? data : []));
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader />
      </div>
    );
  }

  const filteredBookings = bookings.filter((booking: any) => {
    const matchesSearch = (booking.bookingId || booking._id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'ALL' || booking.type === filterType;
    const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;
    return matchesSearch && matchesFilter && matchesStatus;
  });

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">All Bookings</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Manage and track all platform bookings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search booking ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-2">
            {['ALL', 'FLIGHT', 'HOTEL'].map(type => (
              <button 
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filterType === type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {type === 'ALL' ? 'All' : type === 'FLIGHT' ? 'Flights' : 'Hotels'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-600">Status:</span>
              <div className="w-40">
                <Dropdown
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: 'ALL', label: 'All Status' },
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'CONFIRMED', label: 'Confirmed' },
                    { value: 'CANCELLED', label: 'Cancelled' }
                  ]}
                />
              </div>
            </div>
            <RefreshButton onClick={fetchBookings} loading={loading} count={filteredBookings.length} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="border-b border-gray-100">
              <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                <th className="px-6 py-4 rounded-tl-2xl whitespace-nowrap">Booking ID</th>
                <th className="px-6 py-4 whitespace-nowrap">User</th>
                <th className="px-6 py-4 whitespace-nowrap">Route / Item</th>
                <th className="px-6 py-4 whitespace-nowrap">Amount</th>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 whitespace-nowrap">Date</th>
                <th className="px-6 py-4 rounded-tr-2xl whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No bookings found matching your criteria.</td>
                </tr>
              ) : (
                filteredBookings.map((booking: any) => (
                  <tr key={booking._id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1.5 rounded border border-blue-100 uppercase inline-block">
                      {booking.bookingId || booking._id.slice(-8)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{booking.user?.name || 'Unknown User'}</span>
                      <span className="text-xs text-gray-500">{booking.user?.email || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded inline-block">
                      {booking.details?.from && booking.details?.to 
                        ? `${booking.details.from} → ${booking.details.to}` 
                        : (booking.details?.destination || 'N/A')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-gray-900 text-base inline-block">
                      ₹ {booking.totalAmount?.toLocaleString() || '0'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center ${
                      booking.status === 'CONFIRMED' || booking.status === 'Confirmed' ? 'bg-slate-50 text-slate-700 border border-slate-200' :
                      booking.status === 'PENDING' || booking.status === 'Pending' ? 'bg-slate-50 text-slate-700 border border-slate-200' :
                      'bg-slate-50 text-slate-700 border border-slate-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        booking.status === 'CONFIRMED' || booking.status === 'Confirmed' ? 'bg-emerald-500' :
                        booking.status === 'PENDING' || booking.status === 'Pending' ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`}></span>
                      {booking.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600 whitespace-nowrap">
                    {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? (
                      <div className="flex items-center gap-2">
                        <a 
                          href={`/admin/ticket/${booking._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          Ticket
                        </a>
                        <a 
                          href={`/admin/invoice/${booking._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          Invoice
                        </a>
                        {booking.type === 'FLIGHT' && booking.status === 'CONFIRMED' && (
                          <button 
                            onClick={() => {
                              window.open('https://www.google.com/search?q=web+check+in+' + booking.details?.airline, '_blank');
                            }}
                            className="inline-flex items-center gap-1 bg-white border border-green-200 hover:border-green-300 hover:bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                          >
                            Web Check-in
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">Pending</span>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table></div>{/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Previous
          </button>
          <span className="text-xs font-semibold text-gray-500">Page {page} of {totalPages}</span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}





