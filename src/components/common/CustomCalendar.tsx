import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, isBefore, startOfDay, getDay } from 'date-fns';
import api from '../../services/api';

interface CustomCalendarProps {
  startDate: Date | null;
  endDate: Date | null;
  minDate?: Date | null;
  isOneWay?: boolean;
  onChange: (start: Date | null, end: Date | null) => void;
  onClose: () => void;
  origin?: string;
  destination?: string;
}

const priceCache: Record<string, Record<string, number>> = {};

const HOLIDAYS: Record<string, { name: string; color: string }> = {
  '15-08': { name: 'Independence Day', color: '#008cff' },
  '02-10': { name: 'Gandhi Jayanti', color: '#46c491' },
  '25-12': { name: 'Christmas', color: '#ff4f4f' },
};

export default function CustomCalendar({ startDate, endDate, minDate, isOneWay, onChange, onClose, origin, destination }: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const cacheKey = `${origin}-${destination}`;
  const [prices, setPrices] = useState<Record<string, number>>(priceCache[cacheKey] || {});
  const [loadingPrices, setLoadingPrices] = useState(!priceCache[cacheKey]);

  useEffect(() => {
    if (origin && destination) {
      const key = `${origin}-${destination}`;
      if (!priceCache[key]) {
        setLoadingPrices(true);
      }
      
      api.get(`/api/searches/calendar-prices?origin=${origin}&destination=${destination}`)
        .then(res => {
          priceCache[key] = res.data;
          setPrices(res.data);
        })
        .catch(err => console.error("[CustomCalendar] Error fetching calendar prices:", err))
        .finally(() => setLoadingPrices(false));
    }
  }, [origin, destination]);


  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const onDateClick = (day: Date) => {
    const minD = minDate ? startOfDay(minDate) : startOfDay(new Date());
    if (isBefore(startOfDay(day), minD)) return; // Prevent past dates

    if (isOneWay) {
      onChange(day, null);
      return;
    }

    if (startDate && endDate) {
      // 3rd click: Reset to new start date
      onChange(day, null);
    } else if (startDate && !endDate) {
      if (isBefore(day, startDate)) {
        // Clicked before start date, so update start date and clear end date
        onChange(day, null);
      } else {
        // Clicked after start date, so update end date
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
            const dateStr = format(day, 'yyyy-MM-dd');
            const holidayKey = format(day, 'dd-MM');
            const holiday = HOLIDAYS[holidayKey];
            const dynamicPrice = prices[dateStr];
            
            const minD = minDate ? startOfDay(minDate) : startOfDay(new Date());
            const isPast = isBefore(startOfDay(day), minD);
            
            const isSelectedStart = startDate && isSameDay(day, startDate);
            const isSelectedEnd = endDate && isSameDay(day, endDate);
            const isSelected = isSelectedStart || isSelectedEnd;
            const isBetween = startDate && endDate && isWithinInterval(day, { start: startDate, end: endDate }) && !isSelected;

            let bgClass = "bg-white hover:bg-gray-100";
            let textClass = "text-gray-900";
            let priceClass = "text-gray-500";
            let roundingClass = "rounded-md";

            const isAvailableUnknownPrice = dynamicPrice !== undefined && Number(dynamicPrice) === -1;
            const hasKnownPrice = dynamicPrice !== undefined && Number(dynamicPrice) !== -1;
            const isAvailable = isAvailableUnknownPrice || hasKnownPrice;

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
            } else if (isAvailable) {
              bgClass = "bg-green-50 hover:bg-green-100 border border-green-200";
              textClass = "text-green-700";
              priceClass = "text-green-700";
            }

            return (
              <div 
                key={day.toString()} 
                onClick={() => !isPast && onDateClick(day)}
                className={`flex flex-col items-center justify-center h-14 cursor-pointer transition-colors group/day relative ${bgClass} ${roundingClass} ${isPast ? 'cursor-not-allowed' : ''}`}
              >
                {holiday && !isPast && (
                  <div className="opacity-0 invisible group-hover/day:opacity-100 group-hover/day:visible transition-all duration-300 ease-in-out absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#005252] text-white text-[10px] whitespace-nowrap px-2 py-1 rounded z-20 shadow-lg pointer-events-none">
                    {format(day, 'dd MMM')} <br/>
                    <span className="font-bold text-yellow-300">{holiday.name}</span>
                  </div>
                )}
                
                <span className={`text-sm ${textClass}`}>{dateNum}</span>
                {!isPast && (
                  <div className="flex flex-col items-center mt-1 leading-none">
                    {hasKnownPrice ? (
                      <span className={`text-[9px] font-bold ${priceClass}`}>
                        {Math.round(Number(dynamicPrice)).toLocaleString('en-IN')}
                      </span>
                    ) : loadingPrices ? (
                      <span className={`text-[9px] font-bold ${priceClass}`}>...</span>
                    ) : null}
                    
                    {holiday && (
                      <span className="text-[7px] font-bold truncate text-center w-[90%] mt-[1px]" style={{ color: holiday.color }}>
                        {holiday.name.substring(0, 5)}...
                      </span>
                    )}
                  </div>
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
