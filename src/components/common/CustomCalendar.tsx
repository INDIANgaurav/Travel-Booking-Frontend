import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, isBefore, startOfDay, getDay } from 'date-fns';

interface CustomCalendarProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
  onClose: () => void;
}

const DUMMY_PRICES: Record<number, { price: number, color: string }> = {
  1: { price: 12428, color: 'text-blue-500' },
  2: { price: 12638, color: 'text-red-500' },
  3: { price: 12638, color: 'text-red-500' },
  4: { price: 12870, color: 'text-red-500' },
  5: { price: 12141, color: 'text-green-500' },
  12: { price: 12603, color: 'text-yellow-500' },
  13: { price: 12971, color: 'text-red-500' },
  14: { price: 12287, color: 'text-green-500' },
  15: { price: 12636, color: 'text-red-500' },
  16: { price: 12555, color: 'text-yellow-500' },
  31: { price: 12551, color: 'text-yellow-500' }
};

export default function CustomCalendar({ startDate, endDate, onChange, onClose }: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const onDateClick = (day: Date) => {
    if (isBefore(startOfDay(day), startOfDay(new Date()))) return; // Prevent past dates

    if (startDate && endDate) {
      if (isBefore(day, startDate)) {
        // Clicked before start date, so update start date and clear end date
        onChange(day, null);
      } else {
        // Clicked after start date, so update end date
        onChange(startDate, day);
      }
    } else if (startDate && !endDate) {
      if (isBefore(day, startDate)) {
        onChange(day, null);
      } else {
        onChange(startDate, day);
      }
    } else {
      onChange(day, null);
    }
  };

  const renderMonth = (monthToRender: Date) => {
    const monthStart = startOfMonth(monthToRender);
    const monthEnd = endOfMonth(monthStart);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Add empty slots for days before the 1st of the month
    const startDayOfWeek = getDay(monthStart);
    const blanks = Array.from({ length: startDayOfWeek }).map((_, i) => <div key={`blank-${i}`} className="h-14"></div>);

    return (
      <div className="flex-1 w-full sm:w-1/2 p-4">
        <h3 className="text-center font-bold text-gray-800 text-lg mb-6">
          {format(monthToRender, 'MMMM yyyy')}
        </h3>
        <div className="grid grid-cols-7 gap-y-2 text-center text-xs font-semibold text-gray-400 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-y-1 gap-x-1">
          {blanks}
          {days.map((day, idx) => {
            const dateNum = day.getDate();
            const dummyPrice = DUMMY_PRICES[dateNum % 31];
            const isPast = isBefore(startOfDay(day), startOfDay(new Date()));
            
            const isSelectedStart = startDate && isSameDay(day, startDate);
            const isSelectedEnd = endDate && isSameDay(day, endDate);
            const isSelected = isSelectedStart || isSelectedEnd;
            const isBetween = startDate && endDate && isWithinInterval(day, { start: startDate, end: endDate }) && !isSelected;

            let bgClass = "bg-white hover:bg-gray-100";
            let textClass = "text-gray-900";
            let priceClass = dummyPrice?.color || "text-gray-400";
            let roundingClass = "rounded-md";

            if (isPast) {
              bgClass = "bg-white";
              textClass = "text-gray-300";
              priceClass = "hidden";
            } else if (isSelected) {
              bgClass = "bg-blue-500";
              textClass = "text-white font-bold";
              priceClass = "text-blue-100";
              roundingClass = isSelectedStart && endDate ? "rounded-l-md rounded-r-none" : isSelectedEnd && startDate ? "rounded-r-md rounded-l-none" : "rounded-md";
            } else if (isBetween) {
              bgClass = "bg-blue-50";
              textClass = "text-gray-900";
              roundingClass = "rounded-none";
            }

            return (
              <div 
                key={day.toString()} 
                onClick={() => !isPast && onDateClick(day)}
                className={`flex flex-col items-center justify-center h-14 cursor-pointer transition-colors ${bgClass} ${roundingClass} ${isPast ? 'cursor-not-allowed' : ''}`}
              >
                <span className={`text-sm ${textClass}`}>{dateNum}</span>
                {!isPast && dummyPrice && (
                  <span className={`text-[9px] font-bold mt-1 ${priceClass}`}>
                    {dummyPrice.price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl w-[700px] z-50 overflow-hidden" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-6 py-4 bg-white">
        <div className="flex gap-4">
          <div className="font-bold text-gray-900 text-[18px]">
            {startDate ? format(startDate, 'd MMM yy') : 'Select Departure'} 
            <span className="mx-2 font-normal">-</span>
            {endDate ? format(endDate, 'd MMM yy') : 'Select Return'}
          </div>
        </div>
        <button onClick={onClose} className="text-blue-600 font-bold hover:bg-blue-50 px-3 py-1 rounded-md transition text-sm">
          DONE
        </button>
      </div>
      
      <div className="relative flex flex-col sm:flex-row p-4 pt-0 gap-4">
        {/* Nav Arrows */}
        <button 
          onClick={handlePrevMonth}
          className="absolute left-6 top-2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition z-10"
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={handleNextMonth}
          className="absolute right-6 top-2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition z-10"
        >
          <ChevronRight size={20} />
        </button>

        {renderMonth(currentMonth)}
        {renderMonth(addMonths(currentMonth, 1))}
      </div>

      <div className="px-6 py-3 bg-white border-t border-gray-100 text-[11px] text-gray-500 flex justify-between items-center">
        <span>Showing our lowest prices in ₹</span>
      </div>
    </div>
  );
}
