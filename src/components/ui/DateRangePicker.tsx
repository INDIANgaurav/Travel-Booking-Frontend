import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  addYears,
  subYears,
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay, 
  isSameDay, 
  isBefore, 
  isAfter, 
  parseISO,
  subDays,
  startOfDay
} from 'date-fns';

export interface DateRange {
  startDate: string; // 'yyyy-MM-dd'
  endDate: string;   // 'yyyy-MM-dd'
}

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  className?: string;
  align?: 'left' | 'right';
}

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
  placeholder = 'Select Date Range',
  className = '',
  align = 'left'
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Month shown in left calendar
  const initialMonth = (() => {
    if (startDate) {
      try { return parseISO(startDate); } catch {}
    }
    return new Date();
  })();

  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(initialMonth));

  // Sync current month when opening or when startDate changes
  useEffect(() => {
    if (startDate) {
      try {
        setCurrentMonth(startOfMonth(parseISO(startDate)));
      } catch {}
    }
  }, [startDate, isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoverDate(null);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Navigation handlers
  const prevYear = () => setCurrentMonth(subYears(currentMonth, 1));
  const nextYear = () => setCurrentMonth(addYears(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDateClick = (dateStr: string) => {
    // If no start date chosen, or if both start and end are already selected:
    // This click becomes the new start date
    if (!startDate || (startDate && endDate)) {
      onChange({ startDate: dateStr, endDate: '' });
      return;
    }

    // If start date is chosen but no end date:
    if (startDate && !endDate) {
      // If clicked date is same as start date (User wants single-day range!)
      if (dateStr === startDate) {
        onChange({ startDate: dateStr, endDate: dateStr });
        setIsOpen(false);
        setHoverDate(null);
        return;
      }

      // If clicked date is before start date, make this new start date
      if (dateStr < startDate) {
        onChange({ startDate: dateStr, endDate: '' });
        return;
      }

      // If clicked date is after start date, complete the range
      onChange({ startDate, endDate: dateStr });
      setIsOpen(false);
      setHoverDate(null);
    }
  };

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange({ startDate: '', endDate: '' });
    setHoverDate(null);
  };

  // Quick preset shortcuts
  const applyPreset = (type: 'today' | 'yesterday' | 'last7' | 'thisMonth' | 'lastMonth') => {
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');

    if (type === 'today') {
      onChange({ startDate: todayStr, endDate: todayStr });
    } else if (type === 'yesterday') {
      const yStr = format(subDays(now, 1), 'yyyy-MM-dd');
      onChange({ startDate: yStr, endDate: yStr });
    } else if (type === 'last7') {
      const sStr = format(subDays(now, 6), 'yyyy-MM-dd');
      onChange({ startDate: sStr, endDate: todayStr });
    } else if (type === 'thisMonth') {
      const start = format(startOfMonth(now), 'yyyy-MM-dd');
      const end = format(endOfMonth(now), 'yyyy-MM-dd');
      onChange({ startDate: start, endDate: end });
    } else if (type === 'lastMonth') {
      const lastM = subMonths(now, 1);
      const start = format(startOfMonth(lastM), 'yyyy-MM-dd');
      const end = format(endOfMonth(lastM), 'yyyy-MM-dd');
      onChange({ startDate: start, endDate: end });
    }

    setIsOpen(false);
    setHoverDate(null);
  };

  // Format label in trigger
  const formatDisplay = () => {
    if (startDate && endDate) {
      try {
        const s = format(parseISO(startDate), 'dd MMM, yyyy');
        const e = format(parseISO(endDate), 'dd MMM, yyyy');
        return (
          <span className="flex items-center gap-1.5 font-bold text-gray-800">
            <span>{s}</span>
            <span className="text-gray-400 font-normal">→</span>
            <span>{e}</span>
          </span>
        );
      } catch {
        return `${startDate} → ${endDate}`;
      }
    }
    if (startDate && !endDate) {
      try {
        const s = format(parseISO(startDate), 'dd MMM, yyyy');
        return (
          <span className="flex items-center gap-1.5 font-semibold text-gray-700">
            <span className="font-bold text-blue-600">{s}</span>
            <span className="text-gray-400 font-normal">→</span>
            <span className="text-gray-400 italic">Select End</span>
          </span>
        );
      } catch {
        return `${startDate} → Select End`;
      }
    }
    return <span className="text-gray-400 font-medium">{placeholder}</span>;
  };

  const rightMonth = addMonths(currentMonth, 1);

  const renderMonthGrid = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayIndex = getDay(monthStart); // 0 = Sun, 1 = Mon ...
    const blanks = Array.from({ length: startDayIndex });

    const activeEnd = endDate || hoverDate || '';

    return (
      <div className="w-[245px]">
        {/* Month Header */}
        <div className="text-center font-bold text-gray-800 text-xs mb-2">
          {format(monthDate, 'MMM yyyy')}
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="h-7 w-7" />
          ))}

          {days.map((d) => {
            const dateStr = format(d, 'yyyy-MM-dd');
            const isStart = startDate === dateStr;
            const isEnd = endDate === dateStr;
            const isToday = isSameDay(d, new Date());

            // Check if in range
            const isInRange = (() => {
              if (startDate && activeEnd) {
                const s = startDate < activeEnd ? startDate : activeEnd;
                const e = startDate < activeEnd ? activeEnd : startDate;
                return dateStr > s && dateStr < e;
              }
              return false;
            })();

            const isRangeBoundary = isStart || isEnd;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => handleDateClick(dateStr)}
                onMouseEnter={() => {
                  if (startDate && !endDate) {
                    setHoverDate(dateStr);
                  }
                }}
                className={`
                  h-7 w-7 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-all relative
                  ${isRangeBoundary 
                    ? 'bg-blue-600 text-white font-bold shadow-xs z-10' 
                    : isInRange 
                      ? 'bg-blue-50 text-blue-900 rounded-none' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                  }
                  ${isStart && (endDate || hoverDate) && dateStr < (endDate || hoverDate || '') ? 'rounded-r-none' : ''}
                  ${isEnd && startDate && dateStr > startDate ? 'rounded-l-none' : ''}
                  ${!isRangeBoundary && !isInRange && isToday ? 'border border-blue-400 text-blue-600' : ''}
                `}
              >
                {format(d, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full text-xs px-3 py-2 rounded-lg border outline-none h-[38px] bg-white flex items-center justify-between cursor-pointer transition-all
          ${isOpen ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-xs' : 'border-gray-300 hover:border-gray-400'}
        `}
      >
        <div className="truncate pr-2">
          {formatDisplay()}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-gray-400">
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
              title="Clear date range"
            >
              <X size={13} />
            </button>
          )}
          <CalendarIcon size={14} className={isOpen ? 'text-blue-600' : 'text-gray-500'} />
        </div>
      </div>

      {/* Popover */}
      {isOpen && (
        <div 
          className={`
            absolute top-full mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 z-[150] transition-all animate-in fade-in zoom-in-95 duration-100
            ${align === 'right' ? 'right-0' : 'left-0'}
            w-[540px] max-w-[95vw]
          `}
        >
          {/* Top Month Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevYear}
                className="p-1 hover:bg-gray-100 rounded-md text-gray-600 hover:text-gray-900 transition-colors"
                title="Previous Year"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 hover:bg-gray-100 rounded-md text-gray-600 hover:text-gray-900 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
            </div>

            <div className="text-xs font-bold text-gray-700">
              Select Start Date &amp; End Date
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 hover:bg-gray-100 rounded-md text-gray-600 hover:text-gray-900 transition-colors"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                onClick={nextYear}
                className="p-1 hover:bg-gray-100 rounded-md text-gray-600 hover:text-gray-900 transition-colors"
                title="Next Year"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>

          {/* Dual Month Calendar Display */}
          <div className="flex flex-col sm:flex-row gap-6 justify-between">
            {renderMonthGrid(currentMonth)}
            <div className="hidden sm:block w-[1px] bg-gray-100" />
            {renderMonthGrid(rightMonth)}
          </div>

          {/* Presets and Quick Actions */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset('today')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-700 transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => applyPreset('yesterday')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-700 transition-colors"
              >
                Yesterday
              </button>
              <button
                type="button"
                onClick={() => applyPreset('last7')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-700 transition-colors"
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => applyPreset('thisMonth')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-700 transition-colors"
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => applyPreset('lastMonth')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-700 transition-colors"
              >
                Last Month
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-gray-500 hover:text-rose-600 font-semibold transition-colors px-2 py-1"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  if (startDate && !endDate) {
                    // Single day selection: complete with same date
                    onChange({ startDate, endDate: startDate });
                  }
                  setIsOpen(false);
                }}
                className="px-3.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

