import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  isBefore, 
  isAfter, 
  startOfDay 
} from 'date-fns';
import api from '../../services/api';

interface DualMonthCalendarProps {
  checkIn: Date | null;
  checkOut: Date | null;
  onDateChange: (type: 'checkIn' | 'checkOut', date: Date) => void;
  onClose?: () => void;
  origin?: string;
  destination?: string;
}

const HOLIDAYS: Record<string, { name: string; color: string }> = {
  '15-08': { name: 'Independence Day', color: '#008cff' },
  '02-10': { name: 'Gandhi Jayanti', color: '#46c491' },
  '25-12': { name: 'Christmas', color: '#ff4f4f' },
};

export default function DualMonthCalendar({ checkIn, checkOut, onDateChange, onClose, origin, destination }: DualMonthCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loadingPrices, setLoadingPrices] = useState(false);
  const today = startOfDay(new Date());

  useEffect(() => {
    if (origin && destination) {
      setLoadingPrices(true);
      api.get(`/api/searches/calendar-prices?origin=${origin}&destination=${destination}`)
        .then(res => {
          setPrices(res.data);
        })
        .catch(err => console.error("Error fetching calendar prices:", err))
        .finally(() => setLoadingPrices(false));
    }
  }, [origin, destination]);

  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const onDateClick = (day: Date) => {
    if (isBefore(day, today)) return; // Disable past dates

    if (!checkIn) {
      onDateChange('checkIn', day);
    } else if (checkIn && !checkOut) {
      if (isBefore(day, checkIn)) {
        onDateChange('checkIn', day);
      } else {
        onDateChange('checkOut', day);
        if (onClose) setTimeout(onClose, 300); // Auto close after range selected
      }
    } else if (checkIn && checkOut) {
      onDateChange('checkIn', day);
      onDateChange('checkOut', null as any);
    }
  };

  const renderMonth = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        
        const isPast = isBefore(day, today);
        const isSelectedCheckIn = checkIn && isSameDay(day, checkIn);
        const isSelectedCheckOut = checkOut && isSameDay(day, checkOut);
        const isSelectedRange = checkIn && checkOut && isAfter(day, checkIn) && isBefore(day, checkOut);
        
        const holidayKey = format(day, 'dd-MM');
        const holiday = HOLIDAYS[holidayKey];

        days.push(
          <div
            key={day.toString()}
            className={`
              relative flex flex-col items-center justify-center w-10 h-10 md:w-12 md:h-12 cursor-pointer transition-colors group/day
              ${!isSameMonth(day, monthStart) ? 'invisible' : ''}
              ${isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 font-bold hover:bg-gray-100'}
              ${isSelectedCheckIn || isSelectedCheckOut ? '!bg-blue-600 !text-white rounded-md' : ''}
              ${isSelectedRange ? '!bg-blue-50' : ''}
              ${isSelectedCheckIn && checkOut ? 'rounded-r-none' : ''}
              ${isSelectedCheckOut && checkIn ? 'rounded-l-none' : ''}
            `}
            onClick={() => !isPast && onDateClick(cloneDay)}
          >
            <span className="z-10">{formattedDate}</span>
            {/* Holiday Tooltip */}
            {holiday && !isPast && (
              <div className="opacity-0 invisible group-hover/day:opacity-100 group-hover/day:visible transition-all duration-300 ease-in-out absolute -top-10 left-1/2 transform -translate-x-1/2 bg-[#005252] text-white text-[10px] whitespace-nowrap px-2 py-1 rounded z-20 shadow-lg pointer-events-none">
                {format(day, 'dd MMM')} <br/>
                <span className="font-bold text-yellow-300">{holiday.name}</span>
              </div>
            )}
            
            {/* Holiday Text or Price */}
            {!isPast && isSameMonth(day, monthStart) && !isSelectedCheckIn && !isSelectedCheckOut && (
              holiday ? (
                <span className="text-[7px] font-bold absolute bottom-0.5 truncate w-[90%] text-center leading-none" style={{ color: holiday.color }}>
                  {holiday.name.substring(0, 5)}...
                </span>
              ) : (
                <span className="text-[8px] text-gray-500 font-medium absolute bottom-0.5 leading-none">
                  {prices[format(day, 'yyyy-MM-dd')] 
                    ? `₹${Math.round(prices[format(day, 'yyyy-MM-dd')])}` 
                    : (loadingPrices ? '...' : '')}
                </span>
              )
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="flex justify-between w-full" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="flex-1 w-full max-w-[320px]">
        <div className="text-center font-black text-gray-900 mb-4 text-lg">
          {format(monthDate, 'MMMM yyyy')}
        </div>
        <div className="flex justify-between mb-2">
          {weekDays.map((wd, i) => (
            <div key={i} className="w-10 md:w-12 text-center text-xs font-bold text-gray-400">{wd}</div>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {rows}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-6 absolute top-full mt-2 left-0 z-50 w-[700px] hidden md:flex gap-8">
      
      <button 
        onClick={handlePrevMonth} 
        disabled={isBefore(currentMonth, startOfMonth(today))}
        className={`absolute left-4 top-6 p-1 rounded-full ${isBefore(currentMonth, startOfMonth(today)) ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-50'}`}
      >
        <ChevronLeft size={24} />
      </button>

      {renderMonth(currentMonth)}
      {renderMonth(addMonths(currentMonth, 1))}

      <button 
        onClick={handleNextMonth} 
        className="absolute right-4 top-6 p-1 rounded-full text-blue-600 hover:bg-blue-50"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
