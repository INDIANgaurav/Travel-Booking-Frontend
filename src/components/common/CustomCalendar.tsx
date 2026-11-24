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
    const blanks = Array.from({ length: startDayOfWeek }).map((_, i) => <div key={`blank-${i}`} className="w-full h-9 sm:h-10"></div>);
    const totalCells = startDayOfWeek + days.length;
    const rowsNeeded = Math.ceil(totalCells / 7);
    const cellsNeeded = rowsNeeded * 7;
    const trailingBlanks = Array.from({ length: cellsNeeded - totalCells }).map((_, i) => <div key={`trailing-blank-${i}`} className="w-full h-9 sm:h-10"></div>);
    
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
        const airlineInfo = typeof dayData === 'object' && dayData !== null ? `${dayData.airline || ''} ${dayData.flightNo || ''}`.trim() : '';

        const minD = minDate ? startOfDay(minDate) : startOfDay(new Date());
        const isPast = isBefore(startOfDay(day), minD);
        const dayOfWeek = getDay(day);
        const isRightEdge = dayOfWeek >= 5; // Friday (5) & Saturday (6)
        const isLeftEdge = dayOfWeek <= 1;  // Sunday (0) & Monday (1)
        
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
        } else if (hasKnownPrice) {
          bgClass = "bg-white hover:bg-emerald-50/50";
          textClass = "text-gray-900 font-bold";
          priceClass = "text-emerald-600 font-semibold";
        } else if (isAvailableUnknownPrice) {
          bgClass = "bg-white hover:bg-gray-100";
          textClass = "text-gray-800";
          priceClass = "text-gray-400";
        }

        return (
          <div 
            key={day.toString()} 
            onClick={() => !isPast && onDateClick(day)}
            className={`flex flex-col items-center justify-center min-h-[36px] sm:min-h-[40px] py-1 w-full cursor-pointer transition-colors group/day relative ${bgClass} ${roundingClass} ${isPast ? 'cursor-not-allowed' : ''}`}
          >
            {/* Unified Smart Tooltip on Hover: Edge-aware collision prevention (avoids clipping on right/left edges) */}
            {!isPast && (holiday || (availableSeats != null && availableSeats > 0 && !isSelected)) && (
              <div className={`opacity-0 invisible group-hover/day:opacity-100 group-hover/day:visible transition-all duration-150 ease-out absolute -top-12 sm:-top-13 ${
                isRightEdge 
                  ? 'right-0 translate-x-0' 
                  : isLeftEdge 
                    ? 'left-0 translate-x-0' 
                    : 'left-1/2 -translate-x-1/2'
              } bg-slate-900 text-white rounded-lg px-2.5 py-1.5 shadow-2xl z-50 pointer-events-none flex flex-col items-center gap-1 border border-slate-700/80 min-w-max`}>
                {holiday && (
                  <div className="flex items-center gap-1.5 text-[10px] leading-tight font-bold text-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                    <span>{holiday.name}</span>
                    <span className="text-[9px] font-normal text-slate-400">({format(day, 'dd MMM')})</span>
                  </div>
                )}
                {availableSeats != null && availableSeats > 0 && !isSelected && (
                  <div className="flex items-center gap-1.5 text-[9.5px] leading-tight text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                    {airlineInfo ? <span className="font-medium text-slate-300">{airlineInfo} •</span> : null}
                    <span className="font-bold text-emerald-300">{availableSeats} Seats Left</span>
                  </div>
                )}
                {/* Pointer Arrow - Aligned to day cell center */}
                <div className={`w-2 h-2 bg-slate-900 border-r border-b border-slate-700/80 rotate-45 absolute -bottom-1 ${
                  isRightEdge 
                    ? 'right-3' 
                    : isLeftEdge 
                      ? 'left-3' 
                      : 'left-1/2 -translate-x-1/2'
                }`}></div>
              </div>
            )}

            {/* Holiday indicator dot in cell corner (eliminates text cramming while keeping it prominent) */}
            {holiday && !isPast && (
              <span 
                className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full ring-1 ring-white" 
                style={{ backgroundColor: holiday.color || '#ef4444' }}
                title={holiday.name}
              />
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

                {availableSeats != null && availableSeats > 0 ? (
                  <span className="text-[6.5px] font-black uppercase tracking-tight text-emerald-800 bg-emerald-100/90 px-1 py-0.2 rounded mt-0.5 whitespace-nowrap">
                    {availableSeats} left
                  </span>
                ) : holiday ? (
                  <span className="text-[6.5px] font-bold truncate text-center max-w-[38px] mt-0.5" style={{ color: holiday.color }}>
                    {holiday.name}
                  </span>
                ) : null}
              </div>
            )}
          </div>
        );
      }),
      ...trailingBlanks.map((b, i) => <div key={`tb-${i}`} className="w-full h-9 sm:h-10"></div>)
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
    <div className={`bg-white rounded-xl w-[calc(100vw-32px)] sm:w-[580px] shadow-2xl border border-gray-200 z-50 overflow-visible`} onClick={e => e.stopPropagation()}>
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
