import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Search, Info, X, AlertCircle } from 'lucide-react';
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
  const [supplierFilter, setSupplierFilter] = useState('ALL');
  const [cancellationTooltip, setCancellationTooltip] = useState<{
    booking: any;
    top: number;
    left: number;
    placement: 'top' | 'bottom';
  } | null>(null);
  const [selectedCancellationModal, setSelectedCancellationModal] = useState<any | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (cancellationTooltip) setCancellationTooltip(null);
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [cancellationTooltip]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const supp = params.get('supplier');
    if (supp) {
      setSupplierFilter(supp);
    }
  }, []);

  const getSupplierInfo = (booking: any) => {
    const d = booking.details || {};
    if (d.supplierName) {
      const name = d.supplierName;
      if (name.toLowerCase().includes('air iq') || name.toLowerCase().includes('airiq')) {
        return { name: 'AirIQ', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' };
      }
      if (name.toLowerCase().includes('nexus')) {
        return { name: 'Nexus DMC', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' };
      }
      if (name.toLowerCase().includes('gapi')) {
        return { name: 'GAPI', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      }
      return { name, badgeClass: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
    if (d.isAirIqFare || d.airIq_booking_id || d.airIq_ticket_id) {
      return { name: 'AirIQ', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
    if (d.isGapiFare) {
      return { name: 'GAPI', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (d.nexus_response || d.flight_keys) {
      return { name: 'Nexus DMC', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' };
    }
    if (d.isSeriesFare || d.seriesFareId) {
      return { name: 'Series Fare', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return { name: 'Direct Airline', badgeClass: 'bg-gray-50 text-gray-600 border-gray-200' };
  };

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
    const term = searchTerm.toLowerCase();
    const matchesSearch = (booking.bookingId || booking._id || '').toLowerCase().includes(term) ||
      (booking.user?.name || '').toLowerCase().includes(term) ||
      (booking.user?.email || '').toLowerCase().includes(term) ||
      (booking.details?.pnr || '').toLowerCase().includes(term);

    const isTest = Boolean(booking.isTestBooking || booking.details?.isTestBooking || (booking.bookingId && booking.bookingId.includes('B2B')));

    let matchesFilter = true;
    if (filterType === 'TEST') {
      matchesFilter = isTest;
    } else if (filterType === 'FLIGHT') {
      matchesFilter = booking.type === 'FLIGHT' && !isTest;
    } else if (filterType === 'HOTEL') {
      matchesFilter = booking.type === 'HOTEL' && !isTest;
    } else {
      matchesFilter = true;
    }

    const suppInfo = getSupplierInfo(booking);
    let matchesSupplier = true;
    if (supplierFilter !== 'ALL') {
      const sf = supplierFilter.toLowerCase();
      const sn = suppInfo.name.toLowerCase();
      if (sf.includes('air')) {
        matchesSupplier = sn.includes('air');
      } else if (sf.includes('nexus')) {
        matchesSupplier = sn.includes('nexus');
      } else if (sf.includes('gapi')) {
        matchesSupplier = sn.includes('gapi');
      } else if (sf.includes('series')) {
        matchesSupplier = sn.includes('series');
      } else if (sf.includes('direct')) {
        matchesSupplier = sn.includes('direct');
      } else {
        matchesSupplier = sn.includes(sf);
      }
    }

    const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;
    return matchesSearch && matchesFilter && matchesStatus && matchesSupplier;
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
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'FLIGHT', label: 'Flights' },
              { id: 'HOTEL', label: 'Hotels' },
              { id: 'TEST', label: 'Test Bookings' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${
                  filterType === tab.id 
                    ? tab.id === 'TEST' 
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
                {tab.id === 'TEST' && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded font-black">
                    B2B
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-600">Supplier:</span>
              <div className="w-36">
                <Dropdown
                  value={supplierFilter}
                  onChange={setSupplierFilter}
                  options={[
                    { value: 'ALL', label: 'All Suppliers' },
                    { value: 'AirIQ', label: 'AirIQ' },
                    { value: 'Nexus DMC', label: 'Nexus DMC' },
                    { value: 'GAPI', label: 'GAPI' },
                    { value: 'Series Fare', label: 'Series Fare' },
                    { value: 'Direct Airline', label: 'Direct Airline' }
                  ]}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-600">Status:</span>
              <div className="w-36">
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
                <th className="px-6 py-4 whitespace-nowrap">Supplier</th>
                <th className="px-6 py-4 whitespace-nowrap">Amount</th>
                <th className="px-6 py-4 whitespace-nowrap">Promo</th>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 whitespace-nowrap">Date</th>
                <th className="px-6 py-4 rounded-tr-2xl whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">No bookings found matching your criteria.</td>
                </tr>
              ) : (
                filteredBookings.map((booking: any) => {
                  const isTest = Boolean(booking.isTestBooking || booking.details?.isTestBooking || (booking.bookingId && booking.bookingId.includes('B2B')));
                  return (
                  <tr key={booking._id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-6 py-4 align-middle whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1.5 rounded border border-blue-100 uppercase inline-block">
                          {booking.bookingId || booking._id.slice(-8)}
                        </span>
                        {isTest && (
                          <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                            TEST
                          </span>
                        )}
                      </div>
                      {booking.details?.pnr && (
                        <span className="text-[11px] font-mono text-gray-500">PNR: {booking.details.pnr}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap">
                    <div className="flex flex-col justify-center">
                      <span className="font-semibold text-gray-900">{booking.user?.name || 'Unknown User'}</span>
                      <span className="text-xs text-gray-500">{booking.user?.email || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap">
                    <span className="font-medium text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded inline-block">
                      {booking.details?.from && booking.details?.to 
                        ? `${booking.details.from} → ${booking.details.to}` 
                        : (booking.details?.destination || 'N/A')}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap">
                    {(() => {
                      const supp = getSupplierInfo(booking);
                      return (
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border inline-flex items-center gap-1.5 ${supp.badgeClass}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                          {supp.name}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {booking.discountAmount > 0 ? (
                        <>
                          <span className="text-xs text-gray-400 line-through">₹{(booking.totalAmount + booking.discountAmount)?.toLocaleString()}</span>
                          <span className="font-bold text-emerald-600 text-base">₹{booking.totalAmount?.toLocaleString() || '0'}</span>
                        </>
                      ) : (
                        <span className="font-bold text-gray-900 text-base">₹{booking.totalAmount?.toLocaleString() || '0'}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap">
                    {booking.promoCodeApplied ? (
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full tracking-wide uppercase">{booking.promoCodeApplied}</span>
                        <span className="text-[10px] text-emerald-600 font-bold">(-₹{booking.discountAmount?.toLocaleString()})</span>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap">
                    {booking.status === 'CANCELLED' ? (
                      <div className="inline-flex flex-col items-start gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedCancellationModal(booking)}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const placeBelow = rect.top < 180;
                            setCancellationTooltip({
                              booking,
                              top: placeBelow ? rect.bottom + 8 : rect.top - 8,
                              left: Math.max(16, Math.min(window.innerWidth - 280, rect.left - 20)),
                              placement: placeBelow ? 'bottom' : 'top'
                            });
                          }}
                          onMouseLeave={() => setCancellationTooltip(null)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 shadow-sm hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                          CANCELLED
                          <Info className="w-3.5 h-3.5 text-rose-400" />
                        </button>
                        {booking.cancellationReason && (
                          <span className="text-[11px] text-gray-500 font-medium max-w-[150px] truncate pl-1" title={booking.cancellationReason}>
                            {booking.cancellationReason}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center ${
                        booking.status === 'CONFIRMED' || booking.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        booking.status === 'PENDING' || booking.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-50 text-slate-700 border border-slate-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          booking.status === 'CONFIRMED' || booking.status === 'Confirmed' ? 'bg-emerald-500' :
                          booking.status === 'PENDING' || booking.status === 'Pending' ? 'bg-amber-500' :
                          'bg-slate-400'
                        }`}></span>
                        {booking.status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 align-middle font-medium text-gray-600 whitespace-nowrap">
                    {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap">
                    {booking.status === 'CANCELLED' ? (
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
                      </div>
                    ) : booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? (
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
                      <span className="text-xs text-gray-400 font-medium">{booking.status || 'Pending'}</span>
                    )}
                  </td>
                </tr>
                  );
                })
              )}
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

      {/* Fixed Hover Tooltip - Escapes table and overflow clipping */}
      {cancellationTooltip && (
        <div
          style={{
            position: 'fixed',
            top: cancellationTooltip.placement === 'top' ? 'auto' : `${cancellationTooltip.top}px`,
            bottom: cancellationTooltip.placement === 'top' ? `${window.innerHeight - cancellationTooltip.top}px` : 'auto',
            left: `${cancellationTooltip.left}px`,
            zIndex: 99999,
          }}
          className="flex flex-col bg-slate-900 text-white text-xs rounded-xl p-3.5 shadow-2xl min-w-[240px] max-w-[290px] border border-slate-700 pointer-events-none transition-all duration-150 animate-in fade-in"
        >
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              Cancellation Summary
            </div>
            <span className="text-[10px] text-slate-400">Click to view</span>
          </div>

          <div className="space-y-1.5">
            <p className="text-slate-200 text-xs">
              <span className="text-slate-400 font-normal">Reason: </span>
              <strong className="text-white">{cancellationTooltip.booking.cancellationReason || 'Requested by User'}</strong>
            </p>
            {cancellationTooltip.booking.refundAmount !== undefined && (
              <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-slate-800">
                <span className="text-slate-400">Refund Amount:</span>
                <span className="font-bold text-emerald-400">₹{cancellationTooltip.booking.refundAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            {cancellationTooltip.booking.refundStatus && (
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">Refund Status:</span>
                <span className="font-bold text-blue-400 uppercase">{cancellationTooltip.booking.refundStatus}</span>
              </div>
            )}
            {cancellationTooltip.booking.cancelledAt && (
              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
                <span>Cancelled On:</span>
                <span className="text-slate-300">
                  {new Date(cancellationTooltip.booking.cancelledAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancellation Details Modal */}
      {selectedCancellationModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-rose-50 to-orange-50 border-b border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Cancellation Details</h3>
                  <p className="text-xs text-gray-500 font-mono">
                    {selectedCancellationModal.bookingId || selectedCancellationModal._id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCancellationModal(null)}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-gray-600 flex items-center justify-center transition border border-gray-200/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-xl space-y-2 border border-gray-100">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Passenger / User</span>
                  <span className="font-semibold text-gray-800">{selectedCancellationModal.user?.name || 'Customer'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Route / Item</span>
                  <span className="font-semibold text-gray-800">
                    {selectedCancellationModal.details?.from && selectedCancellationModal.details?.to
                      ? `${selectedCancellationModal.details.from} → ${selectedCancellationModal.details.to}`
                      : (selectedCancellationModal.details?.destination || 'N/A')}
                  </span>
                </div>
                {selectedCancellationModal.details?.pnr && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">PNR</span>
                    <span className="font-mono font-bold text-blue-600">{selectedCancellationModal.details.pnr}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Original Amount</span>
                  <span className="font-bold text-gray-900">₹{selectedCancellationModal.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="border border-rose-100 bg-rose-50/50 rounded-xl p-4 space-y-3">
                <div>
                  <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wide">Cancellation Reason</span>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    {selectedCancellationModal.cancellationReason || 'Requested by User / Admin'}
                  </p>
                </div>

                <div className="pt-2 border-t border-rose-100 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-gray-500">Refund Amount</span>
                    <div className="text-lg font-black text-emerald-600">
                      ₹{selectedCancellationModal.refundAmount !== undefined ? selectedCancellationModal.refundAmount.toLocaleString('en-IN') : '0'}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Refund Status</span>
                    <div>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {selectedCancellationModal.refundStatus || 'COMPLETED'}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedCancellationModal.refundReference && (
                  <div className="pt-2 border-t border-rose-100/60 text-xs">
                    <span className="text-gray-500">Refund Reference / UTR: </span>
                    <span className="font-mono font-medium text-gray-800">{selectedCancellationModal.refundReference}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCancellationModal(null)}
                className="px-5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





