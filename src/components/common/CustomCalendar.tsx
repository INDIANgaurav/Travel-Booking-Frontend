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
  const [prices, setPrices] = useState<Record<string, any>>(priceCache[cacheKey] || {});
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
          setPrices(res.data || {});
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

  const renderMonth = (monthToRender: Date, isSecondMonth: boolean = false) => {
    const monthStart = startOfMonth(monthToRender);
    const monthEnd = endOfMonth(monthStart);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const startDayOfWeek = getDay(monthStart);
    const blanks = Array.from({ length: startDayOfWeek }).map((_, i) => <div key={`blank-${i}`} className="w-full h-8 sm:h-9"></div>);
    const totalCells = startDayOfWeek + days.length;
    const rowsNeeded = Math.ceil(totalCells / 7);
    const cellsNeeded = rowsNeeded * 7;
    const trailingBlanks = Array.from({ length: cellsNeeded - totalCells }).map((_, i) => <div key={`trailing-blank-${i}`} className="w-full h-8 sm:h-9"></div>);
    
    const allCells = [
      ...blanks,
      ...days.map((day) => {
        const dateNum = day.getDate();
        const dateStr = format(day, 'yyyy-MM-dd');
        const holidayKey = format(day, 'dd-MM');
        const holiday = HOLIDAYS[holidayKey];
        
        const dayData = prices[dateStr];
        const dynamicPrice = typeof dayData === 'object' && dayData !== null ? dayData.price : dayData;
        const availableSeats = typeof dayData === 'object' && dayData !== null ? dayData.seats : null;
        const isFD = typeof dayData === 'object' && dayData !== null ? dayData.isFD : false;
        const airlineInfo = typeof dayData === 'object' && dayData !== null ? `${dayData.airline || ''} ${dayData.flightNo || ''}`.trim() : '';

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
        const hasKnownPrice = dynamicPrice !== undefined && Number(dynamicPrice) > 0;
        const isAvailable = isAvailableUnknownPrice || hasKnownPrice || isFD;

        if (isPast) {
          bgClass = "bg-white";
          textClass = "text-gray-300";
          priceClass = "hidden";
        } else if (isSelected) {
          bgClass = "bg-blue-600 text-white font-bold shadow-xs";
          textClass = "text-white font-bold";
          priceClass = "text-blue-100";
          roundingClass = isSelectedStart && endDate ? "rounded-l-md rounded-r-none" : isSelectedEnd && startDate ? "rounded-r-md rounded-l-none" : "rounded-md";
        } else if (isBetween) {
          bgClass = "bg-blue-50";
          textClass = "text-gray-900";
          roundingClass = "rounded-none";
        } else if (isFD) {
          bgClass = "bg-emerald-50/90 hover:bg-emerald-100/90 border border-emerald-300/80";
          textClass = "text-emerald-900 font-extrabold";
          priceClass = "text-emerald-700 font-bold";
        } else if (isAvailable) {
          bgClass = "bg-green-50 hover:bg-green-100 border border-green-200";
          textClass = "text-green-700 font-semibold";
          priceClass = "text-green-700";
        }

        return (
          <div 
            key={day.toString()} 
            onClick={() => !isPast && onDateClick(day)}
            className={`flex flex-col items-center justify-center min-h-[34px] sm:min-h-[38px] py-0.5 w-full cursor-pointer transition-colors group/day relative ${bgClass} ${roundingClass} ${isPast ? 'cursor-not-allowed' : ''}`}
          >
            {holiday && !isPast && (
              <div className="opacity-0 invisible group-hover/day:opacity-100 group-hover/day:visible transition-all duration-300 ease-in-out absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#005252] text-white text-[10px] whitespace-nowrap px-2 py-1 rounded z-20 shadow-lg pointer-events-none">
                {format(day, 'dd MMM')} <br/>
                <span className="font-bold text-yellow-300">{holiday.name}</span>
              </div>
            )}

            {isFD && !isPast && !isSelected && (
              <div className="opacity-0 invisible group-hover/day:opacity-100 group-hover/day:visible transition-all duration-200 ease-in-out absolute -top-9 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[10px] whitespace-nowrap px-2.5 py-1 rounded shadow-xl z-30 pointer-events-none flex items-center gap-1.5 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="font-bold text-emerald-300">Fixed Departure (FD)</span>
                {airlineInfo ? <span>• {airlineInfo}</span> : null}
                <span>•</span>
                <span className="font-bold text-yellow-300">{availableSeats != null ? `${availableSeats} Seats Left` : 'Available'}</span>
              </div>
            )}
            
            <span className={`text-[11px] sm:text-xs font-bold leading-none ${textClass}`}>{dateNum}</span>
            {!isPast && (
              <div className="flex flex-col items-center leading-none mt-0.5">
                {hasKnownPrice ? (
                  <span className={`text-[7.5px] sm:text-[8px] font-bold ${priceClass}`}>
                    ₹{Math.round(Number(dynamicPrice)).toLocaleString('en-IN')}
                  </span>
                ) : loadingPrices ? (
                  <span className={`text-[7px] font-bold ${priceClass}`}>...</span>
                ) : null}
                
                {isFD && (
                  <span className="text-[6.5px] font-black uppercase tracking-tighter text-emerald-800 bg-emerald-200/80 px-1 py-0.2 rounded mt-0.5 whitespace-nowrap">
                    {availableSeats != null ? `${availableSeats}s` : 'FD'}
                  </span>
                )}

                {holiday && (
                  <span className="text-[6px] font-bold truncate text-center w-[90%] mt-0.5" style={{ color: holiday.color }}>
                    {holiday.name.substring(0, 5)}...
                  </span>
                )}
              </div>
            )}
          </div>
        );
      }),
      ...trailingBlanks.map((b, i) => <div key={`tb-${i}`} className="w-full h-8 sm:h-9"></div>)
    ];

    const mappedRows = (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', width: '100%' }}>
        {allCells}
      </div>
    );

    return (
      <div className={`flex-1 w-full sm:w-1/2 p-1.5 sm:p-2.5 ${isSecondMonth ? 'hidden sm:block' : ''}`}>
        <h3 className="text-center font-bold text-gray-800 text-xs sm:text-sm mb-1">
          {format(monthToRender, 'MMMM yyyy')}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', width: '100%' }} className="text-center text-[10px] font-semibold text-gray-400 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} style={{ width: '100%' }}>{d}</div>)}
        </div>
        {mappedRows}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-xl w-[calc(100vw-32px)] sm:w-[580px] shadow-2xl border border-gray-200 z-50 overflow-hidden`} onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-3 py-1.5 bg-white border-b border-gray-100">
        <div className="flex gap-4">
          <div className="font-bold text-gray-900 text-xs sm:text-sm">
            {startDate ? format(startDate, 'd MMM yy') : 'Select Departure'} 
            {!isOneWay && (
              <>
                <span className="mx-2 font-normal text-gray-400">-</span>
                {endDate ? format(endDate, 'd MMM yy') : 'Select Return'}
              </>
            )}
          </div>
        </div>
        <button onClick={onClose} className="text-blue-600 font-bold hover:bg-blue-50 px-2 py-0.5 rounded transition text-xs">
          DONE
        </button>
      </div>
      
      <div className="relative flex flex-col sm:flex-row p-1 sm:p-2 pt-0 gap-1 sm:gap-2">
        {/* Nav Arrows */}
        <button 
          onClick={handlePrevMonth}
          className="absolute left-3 top-1.5 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition z-10"
        >
          <ChevronLeft size={16} />
        </button>
        <button 
          onClick={handleNextMonth}
          className="absolute right-3 top-1.5 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition z-10"
        >
          <ChevronRight size={16} />
        </button>

        {renderMonth(currentMonth, false)}
        {(!isOneWay || window.innerWidth >= 640) && renderMonth(addMonths(currentMonth, 1), true)}
      </div>
    </div>
  );
}
