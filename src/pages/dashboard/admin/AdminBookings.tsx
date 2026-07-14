import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import Loader from '../../../components/common/Loader';
import Dropdown from '../../../components/ui/Dropdown';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/api/admin/bookings');
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

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
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track all platform bookings</p>
        </div>
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
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
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
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-gray-700 uppercase font-bold text-xs border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl">Booking ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Route / Item</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 rounded-tr-2xl">Action</th>
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
                  <td className="px-6 py-4">
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 uppercase">
                      {booking.bookingId || booking._id.slice(-8)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{booking.user?.name || 'Unknown User'}</span>
                      <span className="text-xs text-gray-500">{booking.user?.email || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded">
                      {booking.details?.from && booking.details?.to 
                        ? `${booking.details.from} → ${booking.details.to}` 
                        : (booking.details?.destination || 'N/A')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900 text-base">
                      ₹ {booking.totalAmount?.toLocaleString() || '0'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center ${
                      booking.status === 'CONFIRMED' || booking.status === 'Confirmed' ? 'bg-green-100 text-green-700 border border-green-200' :
                      booking.status === 'PENDING' || booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                      'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        booking.status === 'CONFIRMED' || booking.status === 'Confirmed' ? 'bg-green-500' :
                        booking.status === 'PENDING' || booking.status === 'Pending' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></span>
                      {booking.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600">
                    {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <a 
                      href={`/admin/invoice/${booking._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      Ticket
                    </a>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
