import React, { useState } from 'react';
import { Search, Download, FileText, ChevronDown, RefreshCw, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import Dropdown from '../../components/ui/Dropdown';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ETicketModal from '../../components/bookings/ETicketModal';

interface BookingRecord {
  _id: string;
  bookingId: string;
  status: string;
  totalAmount: number;
  date: string;
  createdAt: string;
  details: {
    airline?: string;
    from?: string;
    to?: string;
    pnr?: string;
    passengers?: Array<{ name: string; gender: string; type: string }>;
    contactDetails?: { email: string; phone: string };
    seats?: string[];
  };
  user?: { name: string; email: string; phone?: string };
  seriesFareInfo?: {
    sfId: string;
    airline: string;
    origin: string;
    destination: string;
    flightNo: string;
    travelDate: string;
    departureTime: string;
    arrivalTime: string;
    adtFare: number;
    totalSeats: number;
    availableSeats: number;
  };
}

const SupplierBookingHistory: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const supplierName = (user as any)?.companyName || user?.name || (user as any)?.firstName || 'Supplier';

  const [refNo, setRefNo] = useState('');
  const [pnrNo, setPnrNo] = useState('');
  const [airline, setAirline] = useState('Select Airline');
  const [status, setStatus] = useState('Select Status');
  const [dateType, setDateType] = useState<'booking' | 'travel'>('booking');
  const [fromDate, setFromDate] = useState('2026-07-01');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplier, setSupplier] = useState(supplierName);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [ticketModalBooking, setTicketModalBooking] = useState<any | null>(null);

  const [availableAirlines, setAvailableAirlines] = useState<{value: string, label: string}[]>([
    { value: 'Select Airline', label: 'Select Airline' }
  ]);

  React.useEffect(() => {
    // Fetch series fares to extract unique airlines for the filter
    api.get('/api/series-fare').then(res => {
      if (Array.isArray(res.data)) {
        const uniqueAirlines = Array.from(new Set(res.data.map(f => f.airline))).filter(Boolean) as string[];
        const options = uniqueAirlines.map(a => ({ value: a, label: a }));
        setAvailableAirlines([{ value: 'Select Airline', label: 'Select Airline' }, ...options]);
      }
    }).catch(err => console.error("Error fetching airlines for filter", err));
  }, []);

  const handleSubmit = async (e?: React.FormEvent, pageNum = 1) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (refNo) params.append('refNo', refNo);
      if (pnrNo) params.append('pnr', pnrNo);
      if (airline !== 'Select Airline') params.append('airline', airline);
      if (status !== 'Select Status') params.append('status', status);
      params.append('dateType', dateType);
      params.append('fromDate', fromDate);
      params.append('toDate', toDate);
      params.append('page', pageNum.toString());
      params.append('limit', limit.toString());

      const response = await api.get(`/api/series-fare/booking-history?${params.toString()}`);
      
      const records = response.data.data || (Array.isArray(response.data) ? response.data : []);
      setBookings(records);
      setTotalPages(response.data.totalPages || 1);
      setTotalRecords(response.data.totalRecords || records.length);
      setPage(pageNum);

      if (records.length === 0) {
        toast('No bookings found for the selected filters.', { icon: 'ℹ️' });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch booking history');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    setPage(1);
  }, [refNo, pnrNo, airline, status, dateType, fromDate, toDate, supplier]);

  const getStatusStyle = (s: string) => {
    switch (s?.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Outer Card with Blue Header Bar */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {/* Blue Header Bar */}
        <div className="bg-[#1d6aa3] text-white px-6 py-3">
          <h2 className="text-sm font-bold tracking-wider uppercase">
            OFFLINE FARE BOOKING HISTORY
          </h2>
        </div>

        {/* Filter Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Reference No</label>
              <input
                type="text"
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                placeholder="e.g. BKG-FL-123456"
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Airline PNR No</label>
              <input
                type="text"
                value={pnrNo}
                onChange={(e) => setPnrNo(e.target.value)}
                placeholder="e.g. ABC123"
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Airline</label>
              <Dropdown
                value={airline}
                onChange={setAirline}
                options={availableAirlines}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
              <Dropdown
                value={status}
                onChange={setStatus}
                options={[
                  { value: 'Select Status', label: 'Select Status' },
                  { value: 'Confirmed', label: 'Confirmed' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Cancelled', label: 'Cancelled' }
                ]}
              />
            </div>
          </div>

          {/* Date Type Radios & Range */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end pt-2">
            <div className="md:col-span-2 border border-gray-200 rounded-lg p-3 bg-gray-50/50">
              <div className="flex items-center gap-6 mb-2 text-xs font-bold text-gray-700">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="dateType"
                    checked={dateType === 'booking'}
                    onChange={() => setDateType('booking')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Booking date</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="dateType"
                    checked={dateType === 'travel'}
                    onChange={() => setDateType('travel')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Travel date</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-600 mb-1">From {dateType === 'booking' ? 'Booking' : 'Travel'} Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 border border-gray-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-600 mb-1">To {dateType === 'booking' ? 'Booking' : 'Travel'} Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 border border-gray-300 rounded bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Supplier*</label>
              <Dropdown
                value={supplier}
                onChange={setSupplier}
                options={[
                  { value: supplierName, label: supplierName },
                  { value: 'ALL', label: 'ALL SUPPLIERS' }
                ]}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#242b59] hover:bg-blue-900 text-white text-xs font-bold px-8 py-2.5 rounded transition-colors shadow-md disabled:opacity-60 flex items-center gap-2"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Table */}
      {searched && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-[#f8fafc] border-b border-gray-200 px-6 py-3 flex justify-between items-center">
            <h3 className="text-xs font-bold text-[#0b1031] uppercase tracking-wider">
              Booking Records — {totalRecords} Result{totalRecords !== 1 ? 's' : ''}
            </h3>
            <button 
              onClick={(e) => handleSubmit(e, page)}
              className={`p-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition-all cursor-pointer ${loading ? 'animate-spin text-blue-600' : ''}`}
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-blue-500" />
              <span className="ml-3 text-sm text-gray-500">Fetching booking history...</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FileText size={40} className="mb-3 opacity-40" />
              <p className="text-sm font-semibold">No bookings found</p>
              <p className="text-xs mt-1">Try adjusting your filters or date range.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#f8fafc] text-[#0b1031] font-black border-b border-gray-200">
                  <tr>
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3">BOOKING ID</th>
                    <th className="p-3">SF ID</th>
                    <th className="p-3">PASSENGER</th>
                    <th className="p-3">CONTACT</th>
                    <th className="p-3">AIRLINE</th>
                    <th className="p-3">ROUTE</th>
                    <th className="p-3">FLIGHT</th>
                    <th className="p-3">PNR</th>
                    <th className="p-3">TRAVEL DATE</th>
                    <th className="p-3">BOOKING DATE</th>
                    <th className="p-3 text-right">AMOUNT</th>
                    <th className="p-3 text-center">SEAT</th>
                    <th className="p-3 text-center">STATUS</th>
                    <th className="p-3 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((b, i) => {
                    const pax = b.details?.passengers?.[0];
                    const sf = b.seriesFareInfo;
                    return (
                      <tr key={b._id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="p-3 text-center text-gray-400 font-mono">{i + 1}</td>
                        <td className="p-3 font-bold text-blue-600">{b.bookingId}</td>
                        <td className="p-3 font-semibold text-gray-700">{sf?.sfId || '—'}</td>
                        <td className="p-3">
                          <div className="font-bold text-gray-800">{pax?.name || b.user?.name || '—'}</div>
                          <div className="text-[10px] text-gray-400">{pax?.type || 'Adult'} • {pax?.gender || ''}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-gray-700">{b.details?.contactDetails?.email || b.user?.email || '—'}</div>
                          <div className="text-[10px] text-gray-400">{b.details?.contactDetails?.phone || ''}</div>
                        </td>
                        <td className="p-3 font-bold text-gray-800">{b.details?.airline || sf?.airline || '—'}</td>
                        <td className="p-3 font-bold">
                          {b.details?.from || sf?.origin || '—'} → {b.details?.to || sf?.destination || '—'}
                        </td>
                        <td className="p-3 font-mono text-gray-600">{sf?.flightNo || '—'}</td>
                        <td className="p-3 font-bold text-gray-900 uppercase">{b.details?.pnr || '—'}</td>
                        <td className="p-3 text-gray-700">
                          {b.date ? new Date(b.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="p-3 text-gray-500">
                          {new Date(b.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="p-3 text-right font-bold text-gray-900">₹{b.totalAmount?.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-center font-semibold">{b.details?.seats?.join(', ') || '—'}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border ${getStatusStyle(b.status)}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setTicketModalBooking(b)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold px-3 py-1.5 rounded text-xs border border-blue-200 transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {bookings.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-[#f8fafc]">
              <div className="text-xs font-semibold text-gray-500 flex gap-4">
                <span>
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalRecords)} of <span className="text-[#0b1031] font-bold">{totalRecords}</span> entries
                </span>
                <span className="text-gray-300">|</span>
                <span>
                  Page Total Revenue: <span className="text-[#0b1031] font-bold">₹{bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0).toLocaleString('en-IN')}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => handleSubmit(e, page - 1)}
                  disabled={page === 1 || loading}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, idx) => {
                    const p = idx + 1;
                    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                      return (
                        <button
                          key={p}
                          onClick={(e) => handleSubmit(e, p)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${page === p ? 'bg-[#0b1031] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          {p}
                        </button>
                      );
                    }
                    if (p === page - 2 || p === page + 2) {
                      return <span key={p} className="text-gray-400 text-xs">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button 
                  onClick={(e) => handleSubmit(e, page + 1)}
                  disabled={page === totalPages || loading}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ticket Modal */}
      {ticketModalBooking && (
        <ETicketModal 
          booking={ticketModalBooking} 
          onClose={() => setTicketModalBooking(null)} 
        />
      )}
    </div>
  );
};

export default SupplierBookingHistory;
