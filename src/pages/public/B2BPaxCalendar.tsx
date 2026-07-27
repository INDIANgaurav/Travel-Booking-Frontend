import React, { useState, useEffect } from 'react';
import Dropdown from '../../components/ui/Dropdown';
import api from '../../services/api';
import { format, getDaysInMonth, startOfMonth, getDay } from 'date-fns';

const months = [
  { value: '0', label: 'January' },
  { value: '1', label: 'February' },
  { value: '2', label: 'March' },
  { value: '3', label: 'April' },
  { value: '4', label: 'May' },
  { value: '5', label: 'June' },
  { value: '6', label: 'July' },
  { value: '7', label: 'August' },
  { value: '8', label: 'September' },
  { value: '9', label: 'October' },
  { value: '10', label: 'November' },
  { value: '11', label: 'December' },
];

const years = [
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' },
];

interface PaxRecord {
  passengerName: string;
  route: string;
  pnr: string;
  bookingId: string;
}

const B2BPaxCalendar: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [bookingsByDay, setBookingsByDay] = useState<Record<number, PaxRecord[]>>({});
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchPaxData = async () => {
    setLoading(true);
    try {
      // Calculate start and end of selected month
      const month = parseInt(selectedMonth);
      const year = parseInt(selectedYear);
      
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0); // last day of month

      const res = await api.get('/api/manage-bookings', {
        params: {
          product: 'Flight',
          fromDate: format(startDate, 'yyyy-MM-dd'),
          toDate: format(endDate, 'yyyy-MM-dd')
        }
      });

      const records = res.data?.data || [];
      
      const grouped: Record<number, PaxRecord[]> = {};
      let total = 0;

      records.forEach((booking: any) => {
        // Find the travel date from details
        // The booking.date is often the travel date in 'YYYY-MM-DD' format
        if (booking.date && booking.status !== 'CANCELLED') {
          const travelDate = new Date(booking.date);
          
          // Only process if it matches selected month/year
          if (travelDate.getMonth() === month && travelDate.getFullYear() === year) {
            const day = travelDate.getDate();
            if (!grouped[day]) grouped[day] = [];

            const passengers = booking.details?.passengers || [];
            
            passengers.forEach((pax: any) => {
              grouped[day].push({
                passengerName: `${pax.name}`,
                route: `${booking.details?.from || ''} - ${booking.details?.to || ''}`,
                pnr: booking.details?.pnr || 'PENDING',
                bookingId: booking.bookingId
              });
              total++;
            });
          }
        }
      });

      setBookingsByDay(grouped);
      setTotalRecords(total);
    } catch (error) {
      console.error('Error fetching pax data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaxData();
  }, []); // Initial load

  const handlePrevMonth = () => {
    let m = parseInt(selectedMonth);
    let y = parseInt(selectedYear);
    if (m === 0) {
      m = 11;
      y -= 1;
    } else {
      m -= 1;
    }
    setSelectedMonth(m.toString());
    setSelectedYear(y.toString());
    // Note: User needs to click fetch or we can auto-fetch
  };

  const handleNextMonth = () => {
    let m = parseInt(selectedMonth);
    let y = parseInt(selectedYear);
    if (m === 11) {
      m = 0;
      y += 1;
    } else {
      m += 1;
    }
    setSelectedMonth(m.toString());
    setSelectedYear(y.toString());
  };

  const month = parseInt(selectedMonth);
  const year = parseInt(selectedYear);
  const daysInMonth = getDaysInMonth(new Date(year, month));
  
  // getDay returns 0 for Sun, 1 for Mon, etc.
  // We want MON=0, TUE=1, WED=2... SUN=6
  let startingDay = getDay(startOfMonth(new Date(year, month))) - 1;
  if (startingDay === -1) startingDay = 6; // Sunday

  const totalCells = Math.ceil((daysInMonth + startingDay) / 7) * 7;
  const calendarCells = Array.from({ length: totalCells }, (_, i) => {
    const day = i - startingDay + 1;
    if (day > 0 && day <= daysInMonth) return day;
    return null;
  });

  return (
    <div className="flex-1 w-full bg-[#fafbfd] p-6 text-[#0c1a40]">
      <div className="max-w-[1400px] mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#0c1a40]">PAX CALENDAR</h2>
          <div className="flex items-center gap-4 text-xs font-bold">
            <button onClick={handlePrevMonth} className="text-gray-500 hover:text-blue-600 transition">&lt;&lt; Prev Month</button>
            <span className="text-gray-300">|</span>
            <button onClick={handleNextMonth} className="text-gray-500 hover:text-blue-600 transition">Next Month &gt;&gt;</button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-8">
          <div className="flex items-end gap-4 w-full md:w-auto">
            <div className="w-[200px]">
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Month</label>
              <Dropdown 
                value={selectedMonth}
                onChange={setSelectedMonth}
                options={months}
                className="w-full"
              />
            </div>
            <div className="w-[200px]">
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Year</label>
              <Dropdown 
                value={selectedYear}
                onChange={setSelectedYear}
                options={years}
                className="w-full"
              />
            </div>
            <button 
              onClick={fetchPaxData}
              disabled={loading}
              className="bg-[#0b1031] text-white px-6 py-2 rounded-full text-sm font-bold shadow-md hover:bg-blue-900 transition h-[38px] disabled:opacity-50"
            >
              {loading ? 'Fetching...' : 'Fetch'}
            </button>
          </div>
          
          <div className="text-[11px] text-gray-500 font-bold mt-4 md:mt-0">
            {totalRecords} records in {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Days Header */}
            <div className="grid grid-cols-7 gap-4 mb-4">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                <div key={day} className="bg-[#f8f9fc] py-3 text-center rounded-lg text-xs font-black text-[#0c1a40]">
                  {day}
                </div>
              ))}
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-7 gap-4">
              {calendarCells.map((day, index) => {
                const dayBookings = day ? bookingsByDay[day] : undefined;
                const hasBookings = dayBookings && dayBookings.length > 0;

                return (
                  <div 
                    key={index} 
                    className={`min-h-[140px] border border-gray-100 rounded-lg p-2 transition-colors flex flex-col ${
                      day ? 'hover:border-blue-200 hover:shadow-sm bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    {day && (
                      <>
                        <div className="flex justify-center mb-2">
                          <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-black ${
                            hasBookings ? 'bg-[#0b1031] text-white shadow-md' : 'text-gray-400 border border-gray-200'
                          }`}>
                            {day}
                          </span>
                        </div>
                        
                        {hasBookings && (
                          <div className="flex flex-col gap-1.5">
                            {dayBookings.slice(0, 2).map((pax, i) => (
                              <div key={i} className="bg-[#f4f6fb] rounded p-2 text-center text-[#0b1031]">
                                <div className="text-[9px] font-black uppercase truncate">{pax.passengerName}</div>
                                <div className="text-[9px] font-medium text-gray-600 mt-0.5">{pax.route}</div>
                                <div className="text-[10px] font-bold mt-0.5">{pax.pnr}</div>
                              </div>
                            ))}
                            
                            {dayBookings.length > 2 && (
                              <button className="text-[10px] font-bold text-[#0b1031] underline mt-1 text-center hover:text-blue-600">
                                More ({dayBookings.length - 2})
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default B2BPaxCalendar;
