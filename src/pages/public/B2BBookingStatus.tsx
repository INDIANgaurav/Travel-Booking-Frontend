import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import api from '../../services/api';
import Dropdown from '../../components/ui/Dropdown';
import DOBCalendar from '../../components/ui/DOBCalendar';
import ETicketModal from '../../components/bookings/ETicketModal';
import { Download, ChevronDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const B2BBookingStatus: React.FC = () => {

  const [productType, setProductType] = useState('Flight');
  const [flightType, setFlightType] = useState('ONLINE');
  const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [downloadingState, setDownloadingState] = useState<{ booking: any, type: 'ticket' | 'invoice' | 'both' } | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleGetHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/manage-bookings', {
        params: {
          product: productType,
          status: flightType,
          fromDate,
          toDate,
          searchType: 'SEARCH BY DATE'
        }
      });
      setRecords(res.data?.data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load history on component mount
  React.useEffect(() => {
    handleGetHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 w-full bg-[#fafbfd] p-4 md:p-6 text-[#0c1a40] min-h-screen">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-4 md:gap-6">
        
        {/* Top Product Filter Bar */}
        <div className="bg-white p-3 md:px-6 md:py-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4 md:gap-6">
          {['Flight', 'Hotel', 'Top-Up', 'OD Details'].map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0c1a40]">
              <input 
                type="radio" 
                name="productType" 
                checked={productType === type}
                onChange={() => setProductType(type)}
                className="w-4 h-4 text-[#0b1031] focus:ring-[#0b1031] border-gray-300" 
              />
              {type}
            </label>
          ))}
        </div>

        {/* Second Filter Bar */}
        <div className="bg-white p-4 md:px-6 md:py-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {productType === 'Flight' && (
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-xs font-bold text-[#0c1a40]">Flight Types</label>
                <div className="h-[42px]">
                  <Dropdown 
                    options={[
                      { value: 'ONLINE', label: 'ONLINE' },
                      { value: 'OFFLINE', label: 'OFFLINE' },
                      { value: 'TO RESCHEDULE', label: 'TO RESCHEDULE' },
                      { value: 'TO CANCEL', label: 'TO CANCEL' }
                    ]}
                    value={flightType}
                    onChange={setFlightType}
                    placeholder="Select Status"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 flex-1">
              <label className="text-xs font-bold text-[#0c1a40]">From Date</label>
              <div className="h-[42px]">
                <DOBCalendar 
                  value={fromDate}
                  onChange={setFromDate}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <label className="text-xs font-bold text-[#0c1a40]">To Date</label>
              <div className="h-[42px]">
                <DOBCalendar 
                  value={toDate}
                  onChange={setToDate}
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleGetHistory}
            disabled={loading}
            className="bg-[#0b1031] text-white px-8 py-2.5 rounded-xl md:rounded-full text-xs font-bold shadow-md hover:bg-blue-900 transition h-[42px] w-full md:w-auto"
          >
            {loading ? 'Loading...' : 'Get History'}
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-4 min-h-[400px] flex flex-col">
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto flex-1 rounded-xl">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#f1f5f9] text-gray-600 font-bold tracking-wider uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">S.NO</th>
                  <th className="px-6 py-4">REFERENCE NO.</th>
                  <th className="px-6 py-4">DATE</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4">AMOUNT</th>
                  <th className="px-6 py-4">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[#0c1a40] font-semibold">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading data...</td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-orange-500 font-bold text-sm">No Records Found</span>
                        <span className="text-gray-400 font-normal">Try adjusting your date range filters</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map((r: any, i: number) => (
                    <tr key={r._id || i} className="hover:bg-blue-50/50 transition">
                      <td className="px-6 py-4">{i + 1}</td>
                      <td className="px-6 py-4 text-blue-600 font-bold">{r.bookingId}</td>
                      <td className="px-6 py-4">{new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                          r.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                          r.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black">₹ {r.totalAmount?.toLocaleString('en-IN') || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => setSelectedBooking(r)}
                            className="text-blue-600 hover:text-blue-800 font-bold underline transition"
                          >
                            View
                          </button>
                          
                          <div className="relative">
                            <button 
                              onClick={() => setActiveDropdown(activeDropdown === r._id ? null : r._id)}
                              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-semibold transition"
                            >
                              <Download size={14} />
                              Download
                              <ChevronDown size={14} />
                            </button>
                            
                            {activeDropdown === r._id && (
                              <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 text-xs font-semibold flex flex-col">
                                <button 
                                  onClick={() => { setDownloadingState({ booking: r, type: 'ticket' }); setActiveDropdown(null); }}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                                >
                                  E-Ticket
                                </button>
                                <button 
                                  onClick={() => { setDownloadingState({ booking: r, type: 'invoice' }); setActiveDropdown(null); }}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                                >
                                  Invoice
                                </button>
                                <button 
                                  onClick={() => { setDownloadingState({ booking: r, type: 'both' }); setActiveDropdown(null); }}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                                >
                                  Both
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col p-4 gap-4">
            {loading ? (
              <div className="text-center text-gray-400 py-8">Loading data...</div>
            ) : records.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center gap-2">
                <span className="text-orange-500 font-bold text-sm">No Records Found</span>
                <span className="text-gray-400 font-normal">Try adjusting your date range filters</span>
              </div>
            ) : (
              records.map((r: any, i: number) => (
                <div key={r._id || i} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Reference No</span>
                      <span className="text-blue-600 font-black text-sm">{r.bookingId}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-[9px] uppercase font-bold tracking-wider ${
                      r.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                      r.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-y border-gray-50">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Date</span>
                      <span className="text-gray-700 font-bold text-xs">{new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Amount</span>
                      <span className="text-[#0c1a40] font-black">₹ {r.totalAmount?.toLocaleString('en-IN') || 0}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <button 
                      onClick={() => setSelectedBooking(r)}
                      className="text-blue-600 hover:text-blue-800 font-bold underline transition text-xs"
                    >
                      View Details
                    </button>
                    
                    <div className="relative">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === r._id ? null : r._id)}
                        className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-gray-700 font-bold text-xs hover:bg-gray-100 transition"
                      >
                        <Download size={14} />
                        Download
                        <ChevronDown size={14} />
                      </button>
                      
                      {activeDropdown === r._id && (
                        <div className="absolute right-0 bottom-full mb-2 w-36 bg-white rounded-xl shadow-[0_5px_20px_rgba(0,0,0,0.15)] border border-gray-100 py-1 z-50 text-xs font-semibold flex flex-col">
                          <button 
                            onClick={() => { setDownloadingState({ booking: r, type: 'ticket' }); setActiveDropdown(null); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                          >
                            E-Ticket
                          </button>
                          <button 
                            onClick={() => { setDownloadingState({ booking: r, type: 'invoice' }); setActiveDropdown(null); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                          >
                            Invoice
                          </button>
                          <button 
                            onClick={() => { setDownloadingState({ booking: r, type: 'both' }); setActiveDropdown(null); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                          >
                            Both
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Visible Modal for Viewing */}
      {selectedBooking && (
        <ETicketModal 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)} 
        />
      )}

      {/* Hidden Modal for Auto Downloading */}
      {downloadingState && (
        <div style={{ position: 'fixed', top: '-10000px', left: '-10000px', opacity: 0, pointerEvents: 'none' }}>
          <ETicketModal 
            booking={downloadingState.booking} 
            onClose={() => setDownloadingState(null)} 
            autoDownload={downloadingState.type}
            onAutoDownloadComplete={() => setDownloadingState(null)}
          />
        </div>
      )}
    </div>
  );
};

export default B2BBookingStatus;
