import React, { useState, useEffect } from 'react';
import ReportHeader from '../../../../components/ui/ReportHeader';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { reportsApi } from '../../../../api/reportsApi';

export default function AdminPassengerCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCalendarData = async (date: Date) => {
    try {
      setLoading(true);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 1-12
      const res = await reportsApi.getPassengerCalendar({ 
        fromDate: `${year}-${month.toString().padStart(2, '0')}-01`,
        toDate: new Date(year, month, 0).toISOString().split('T')[0]
      });
      if (res.success) {
        setBookings(res.data);
      }
    } catch (error) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData(currentDate);
  }, [currentDate]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generate calendar grid
  const renderCalendar = () => {
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Weekday headers
    const headers = weekDays.map(day => (
      <div key={day} className="text-center font-bold text-xs text-slate-500 uppercase tracking-wider py-4 bg-slate-50 border-b border-slate-100">
        {day}
      </div>
    ));

    // Empty cells for first week
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[120px] bg-slate-50/30 border-b border-r border-slate-100 p-2"></div>);
    }

    // Actual bookings for this month
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = new Date().getDate() === i && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
      
      const dayBookings = bookings.filter(b => {
        const d = new Date(b.date);
        return d.getDate() === i;
      });

      days.push(
        <div key={i} className={`min-h-[120px] border-b border-r border-slate-100 p-2 transition-colors hover:bg-slate-50 ${isToday ? 'bg-indigo-50/30' : 'bg-white'}`}>
          <div className="flex justify-between items-start">
            <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700'}`}>
              {i}
            </span>
          </div>
          
          {dayBookings.map((booking, idx) => (
            <div key={idx} className="mt-2 space-y-1">
              <div className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/50 p-1.5 rounded-lg font-medium leading-tight">
                <span className="font-bold">PNR:</span> {booking.pnr} <br/>
                <span className="font-bold">{booking.sector}</span> <br/>
                {booking.pax}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100/60 overflow-hidden mt-6">
        <div className="grid grid-cols-7 border-b border-slate-100">
          {headers}
        </div>
        <div className="grid grid-cols-7 border-l border-slate-100">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full pb-20">
      <ReportHeader 
        title="Passenger Calendar" 
        description="Visual overview of passenger travel dates and bookings"
      />

      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100/60">
        <h2 className="text-xl font-black text-slate-800">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600">
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {renderCalendar()}
    </div>
  );
}
