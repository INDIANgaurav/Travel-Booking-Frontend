import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Dropdown from '../../components/ui/Dropdown';
import DOBCalendar from '../../components/ui/DOBCalendar';
import { Plane, Building2, ShieldCheck, Compass } from 'lucide-react';
import FlightInvoice from '../dashboard/user/FlightInvoice';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const B2BManageBooking: React.FC = () => {
  const navigate = useNavigate();
  const [productType, setProductType] = useState('Flight');
  const [searchTab, setSearchTab] = useState('SEARCH BY DATE');
  const [statusType, setStatusType] = useState('LIVE BOOKING');
  
  const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  
  const [month, setMonth] = useState('July');
  const [year, setYear] = useState('2026');

  const [searchOption, setSearchOption] = useState('RefNo');
  const [searchValue, setSearchValue] = useState('');

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [modalView, setModalView] = useState<'summary' | 'invoice'>('summary');

  const handleGetHistory = async () => {
    try {
      setLoading(true);
      setHasSearched(true);
      
      const queryParams = new URLSearchParams({
        product: productType,
        searchType: searchTab,
        status: statusType
      });

      if (searchTab === 'SEARCH BY DATE') {
        queryParams.append('fromDate', fromDate);
        queryParams.append('toDate', toDate);
      } else if (searchTab === 'SEARCH BY MONTH') {
        queryParams.append('month', month);
        queryParams.append('year', year);
      } else if (searchTab === 'SEARCH BY OPTIONS') {
        queryParams.append('searchOption', searchOption);
        queryParams.append('searchValue', searchValue);
      }

      const res = await api.get(`/api/manage-bookings?${queryParams.toString()}`);
      setRecords(res.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching manage bookings:', error);
      setRecords([]);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-[#ffffff] p-8 text-[#0c1a40] min-h-screen">
      <div className="max-w-[1500px] mx-auto flex flex-col">
        
        {/* Top Product Selector Box */}
        <div className="bg-white px-3 py-3 rounded-xl border border-gray-200 flex items-center gap-2 w-fit mb-8 shadow-sm">
          {[
            { id: 'Flight', icon: Plane },
            { id: 'Hotel', icon: Building2 },
            { id: 'Travel Insurance', icon: ShieldCheck },
            { id: 'UMRAH Packages', icon: Compass }
          ].map(type => {
            const Icon = type.icon;
            const isActive = productType === type.id;
            return (
              <label key={type.id} className="flex items-center gap-2 cursor-pointer text-sm font-bold border px-4 py-2.5 rounded-lg transition-colors"
                     style={{
                       borderColor: isActive ? '#0b1031' : 'transparent',
                       backgroundColor: isActive ? '#f8f9fc' : 'transparent',
                       color: isActive ? '#0b1031' : '#64748b'
                     }}>
                <input 
                  type="radio" 
                  name="productType" 
                  checked={isActive}
                  onChange={() => setProductType(type.id)}
                  className="hidden" 
                />
                <Icon size={16} className={isActive ? 'text-[#0b1031]' : 'text-gray-400'} strokeWidth={isActive ? 2.5 : 2} />
                {type.id}
              </label>
            );
          })}
        </div>

        {/* Search Tabs */}
        <div className="flex border-b border-gray-100 mb-6">
          {['SEARCH BY DATE', 'SEARCH BY MONTH', 'SEARCH BY OPTIONS'].map(tab => (
            <button
              key={tab}
              onClick={() => setSearchTab(tab)}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-[3px] tracking-wide ${
                searchTab === tab 
                  ? 'border-[#0b1031] text-[#0b1031]' 
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Status Radios */}
        {searchTab !== 'SEARCH BY OPTIONS' && (
          <div className="flex items-center gap-8 mb-6 ml-2">
            {['LIVE BOOKING', 'CANCELLED BOOKING', 'HOLD BOOKING'].map(status => (
              <label key={status} className="flex items-center gap-3 cursor-pointer text-[11px] font-extrabold text-[#0c1a40] uppercase tracking-wide">
                <input 
                  type="radio" 
                  name="statusType" 
                  checked={statusType === status}
                  onChange={() => setStatusType(status)}
                  className="w-4 h-4 text-[#0b1031] focus:ring-[#0b1031] border-gray-400 cursor-pointer" 
                />
                {status}
              </label>
            ))}
          </div>
        )}

        {/* Options Radios */}
        {searchTab === 'SEARCH BY OPTIONS' && (
          <div className="flex items-center gap-6 mb-6 ml-2">
            {['RefNo', 'AirlinePNR', 'Passenger Mobile', 'Passenger Name', 'Ticket Number'].map(opt => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer text-[11px] font-extrabold text-[#0c1a40] uppercase tracking-wide">
                <input 
                  type="radio" 
                  name="searchOption" 
                  checked={searchOption === opt}
                  onChange={() => setSearchOption(opt)}
                  className="w-4 h-4 text-[#0b1031] focus:ring-[#0b1031] border-gray-400 cursor-pointer" 
                />
                {opt}
              </label>
            ))}
          </div>
        )}

        {/* Inputs Form Box */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-end gap-6 w-fit shadow-sm">
          {searchTab === 'SEARCH BY DATE' && (
            <>
              <div className="flex flex-col gap-2 w-56">
                <label className="text-xs font-extrabold text-[#0c1a40]">From Date</label>
                <div className="h-[46px]">
                  <DOBCalendar value={fromDate} onChange={setFromDate} />
                </div>
              </div>
              <div className="flex flex-col gap-2 w-56">
                <label className="text-xs font-extrabold text-[#0c1a40]">To Date</label>
                <div className="h-[46px]">
                  <DOBCalendar value={toDate} onChange={setToDate} />
                </div>
              </div>
            </>
          )}

          {searchTab === 'SEARCH BY MONTH' && (
            <>
              <div className="flex flex-col gap-2 w-56">
                <label className="text-xs font-extrabold text-[#0c1a40]">Month</label>
                <Dropdown 
                  options={['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => ({ label: m, value: m }))}
                  value={month}
                  onChange={setMonth}
                  placeholder="Month"
                />
              </div>
              <div className="flex flex-col gap-2 w-56">
                <label className="text-xs font-extrabold text-[#0c1a40]">Year</label>
                <Dropdown 
                  options={['2024', '2025', '2026', '2027'].map(y => ({ label: y, value: y }))}
                  value={year}
                  onChange={setYear}
                  placeholder="Year"
                />
              </div>
            </>
          )}

          {searchTab === 'SEARCH BY OPTIONS' && (
            <div className="flex flex-col gap-2 w-80">
              <input 
                type="text"
                placeholder={`Enter ${searchOption}`}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b1031]/20 font-semibold text-gray-800 h-[46px]"
              />
            </div>
          )}

          <button 
            onClick={handleGetHistory}
            disabled={loading}
            className="bg-[#0b1031] text-white px-10 py-3 rounded-full text-sm font-bold shadow-md hover:bg-blue-900 transition h-[46px]"
          >
            {searchTab === 'SEARCH BY OPTIONS' ? (loading ? 'Loading...' : 'View Details') : (loading ? 'Loading...' : 'Get History')}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-4 overflow-hidden min-h-[400px] flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#f1f5f9] text-gray-600 font-bold tracking-wider uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">S.NO</th>
                  <th className="px-6 py-4">REFERENCE NO.</th>
                  <th className="px-6 py-4">BOOKING TYPE</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4">TOTAL AMOUNT</th>
                  <th className="px-6 py-4">DATE</th>
                  <th className="px-6 py-4">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[#0c1a40] font-semibold">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">Loading data...</td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-orange-500 font-bold text-sm">No Records Found</span>
                        <span className="text-gray-400 font-normal">
                          {hasSearched ? "Try adjusting your filters" : "Click the button to fetch bookings"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map((r, i) => (
                    <tr key={i} className="hover:bg-blue-50/50 transition">
                      <td className="px-6 py-4">{i + 1}</td>
                      <td className="px-6 py-4 text-orange-500">{r.bookingId}</td>
                      <td className="px-6 py-4">{r.type}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] ${r.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : r.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">₹{r.totalAmount?.toLocaleString() || 0}</td>
                      <td className="px-6 py-4">{new Date(r.date || r.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => {
                            setSelectedBooking(r);
                            setModalView('summary');
                          }}
                          className="text-blue-600 hover:underline font-bold"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* View / Print Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-[#171b3e] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-lg tracking-wide">View / Print</h3>
              <button onClick={() => setSelectedBooking(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                <span className="sr-only">Close</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-8 overflow-y-auto bg-[#fafbfd] flex-1">
              
              {modalView === 'invoice' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
                  <button 
                    onClick={() => setModalView('summary')}
                    className="absolute top-4 left-4 z-10 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2"
                  >
                    ← Back to Summary
                  </button>
                  <div className="pt-16">
                    <FlightInvoice bookingId={selectedBooking._id} isModal={true} />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-center mb-10">
                    <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-8 w-[320px] flex flex-col items-center text-center">
                       <div className="w-24 h-24 rounded-full border border-gray-100 shadow-sm flex items-center justify-center mb-5 bg-white p-2">
                          <img src={`https://pics.avs.io/200/200/${selectedBooking.details?.airlineCode || 'AI'}.png`} alt="Airline" className="w-full h-full object-contain" />
                       </div>
                       <h4 className="text-[#171b3e] font-black text-xl mb-6">{selectedBooking.details?.airline || 'Airline'}</h4>
                       
                       <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Airline PNR</p>
                       <p className="text-[#171b3e] font-black text-2xl mb-6 tracking-wide">{selectedBooking.details?.pnr || '------'}</p>
                       
                       <h5 className="text-[#171b3e] font-extrabold text-sm mb-3 uppercase">
                         {selectedBooking.details?.from || 'ORIGIN'} ({selectedBooking.details?.fromCode || 'DEL'}) <br/>
                         <span className="text-gray-400 font-medium">TO</span> <br/>
                         {selectedBooking.details?.to || 'DESTINATION'} ({selectedBooking.details?.toCode || 'BOM'})
                       </h5>
                       
                       <p className="text-[#171b3e] font-bold text-sm mb-6">{new Date(selectedBooking.date || selectedBooking.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</p>
                       
                       <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Gross Value</p>
                       <p className="text-[#e85b2e] font-black text-2xl mb-8">₹ {selectedBooking.totalAmount?.toLocaleString() || '0.00'}</p>
                       
                       <button className="bg-[#171b3e] text-white w-full py-3.5 rounded-xl text-sm font-bold hover:bg-blue-900 transition shadow-lg shadow-blue-900/20">Select</button>
                    </div>
                  </div>
                  
                  {/* Checkboxes */}
                  <div className="flex justify-center gap-10 mb-10">
                    <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-[#171b3e] uppercase tracking-wider">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#171b3e] focus:ring-[#171b3e]" />
                      HIDE FARE
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-[#171b3e] uppercase tracking-wider">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#171b3e] focus:ring-[#171b3e]" />
                      HIDE AGENT DETAILS
                    </label>
                  </div>
                  
                  {/* Buttons */}
                  <div className="flex justify-center gap-4 flex-wrap max-w-3xl mx-auto">
                    {['Add MarkUp', 'Save', 'Invoice', 'Customer Invoice', 'Print Ticket', 'Mail', 'SMS'].map(btn => (
                      <button 
                        key={btn}
                        onClick={() => {
                          if (['Invoice', 'Customer Invoice', 'Print Ticket'].includes(btn)) {
                            setModalView('invoice');
                          }
                        }}
                        className="bg-[#171b3e] text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow-md hover:bg-blue-900 transition"
                      >
                        {btn}
                      </button>
                    ))}
                    <div className="w-full basis-full h-0" />
                    {['Cancel', 'Reschedule', 'Web Check-in'].map(btn => (
                      <button 
                        key={btn}
                        onClick={() => {
                          if (btn === 'Cancel') setSelectedBooking(null);
                        }}
                        className="bg-[#171b3e] text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow-md hover:bg-blue-900 transition"
                      >
                        {btn}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default B2BManageBooking;
