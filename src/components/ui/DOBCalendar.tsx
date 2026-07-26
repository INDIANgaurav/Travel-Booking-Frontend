import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isAfter, isBefore, addMonths, subMonths, getYear, getMonth, setYear, setMonth, parseISO } from 'date-fns';

interface DOBCalendarProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
}

export default function DOBCalendar({ value, onChange, minDate, maxDate, placeholder = 'dd-mm-yyyy' }: DOBCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? parseISO(value) : (maxDate || new Date()));
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedDate = value ? parseISO(value) : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsYearOpen(false);
        setIsMonthOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateClick = (date: Date) => {
    if (minDate && isBefore(date, minDate)) return;
    if (maxDate && isAfter(date, maxDate)) return;
    onChange(format(date, 'yyyy-MM-dd'));
    setIsOpen(false);
    setIsYearOpen(false);
    setIsMonthOpen(false);
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const startingDayIndex = getDay(startOfMonth(currentMonth));
  
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= currentYear - 100; i--) {
    years.push(i);
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className="w-full border border-gray-300 rounded p-2 text-[13px] bg-white cursor-pointer flex justify-between items-center hover:border-blue-500 transition-colors"
        onClick={() => { setIsOpen(!isOpen); setIsYearOpen(false); setIsMonthOpen(false); }}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value ? format(parseISO(value), 'dd MMM, yyyy') : placeholder}
        </span>
        <CalendarIcon size={16} className="text-gray-500" />
      </div>

      {isOpen && (
        <div className="absolute top-[110%] left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.1)] w-[290px] p-4 animate-in fade-in zoom-in duration-200 select-none">
          
          <div className="flex justify-between items-center mb-5">
            <button 
              onClick={(e) => { e.preventDefault(); setCurrentMonth(subMonths(currentMonth, 1)) }}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors group"
            >
              <ChevronLeft size={16} className="text-gray-500 group-hover:text-blue-600" />
            </button>
            
            <div className="flex gap-3 font-extrabold text-[13px] text-gray-800 relative">
              {/* Month Selector */}
              <div className="relative">
                <div 
                  className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => { setIsMonthOpen(!isMonthOpen); setIsYearOpen(false); }}
                >
                  {months[getMonth(currentMonth)]}
                  <ChevronDown size={14} className="text-gray-400" />
                </div>
                {isMonthOpen && (
                  <div className="absolute top-6 -left-4 bg-white border border-gray-200 rounded-md shadow-lg w-[110px] max-h-[220px] overflow-y-auto z-50 custom-scrollbar py-1">
                    {months.map((m, idx) => (
                      <div 
                        key={m} 
                        className={`px-3 py-1.5 text-xs cursor-pointer hover:bg-blue-50 hover:text-blue-600 ${getMonth(currentMonth) === idx ? 'bg-blue-50 text-blue-600 font-bold' : 'font-medium'}`}
                        onClick={() => { setCurrentMonth(setMonth(currentMonth, idx)); setIsMonthOpen(false); }}
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Year Selector */}
              <div className="relative">
                <div 
                  className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => { setIsYearOpen(!isYearOpen); setIsMonthOpen(false); }}
                >
                  {getYear(currentMonth)}
                  <ChevronDown size={14} className="text-gray-400" />
                </div>
                {isYearOpen && (
                  <div className="absolute top-6 -left-6 bg-white border border-gray-200 rounded-md shadow-lg w-[80px] max-h-[220px] overflow-y-auto z-50 custom-scrollbar py-1">
                    {years.map(y => (
                      <div 
                        key={y} 
                        className={`px-3 py-1.5 text-xs text-center cursor-pointer hover:bg-blue-50 hover:text-blue-600 ${getYear(currentMonth) === y ? 'bg-blue-50 text-blue-600 font-bold' : 'font-medium'}`}
                        onClick={() => { setCurrentMonth(setYear(currentMonth, y)); setIsYearOpen(false); }}
                      >
                        {y}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={(e) => { e.preventDefault(); setCurrentMonth(addMonths(currentMonth, 1)) }}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors group"
            >
              <ChevronRight size={16} className="text-gray-500 group-hover:text-blue-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-[10px] font-extrabold text-gray-400">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: startingDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-8"></div>
            ))}
            
            {daysInMonth.map((date, idx) => {
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isDisabled = (minDate && isBefore(date, minDate)) || (maxDate && isAfter(date, maxDate));
              const isToday = isSameDay(date, new Date());
              
              return (
                <button
                  key={idx}
                  onClick={(e) => { e.preventDefault(); handleDateClick(date); }}
                  disabled={isDisabled}
                  className={`
                    h-8 w-8 rounded-full text-[12px] flex items-center justify-center transition-colors mx-auto font-medium
                    ${isSelected ? 'bg-blue-600 text-white shadow-md font-bold' : ''}
                    ${!isSelected && !isDisabled ? 'hover:bg-blue-50 text-gray-700' : ''}
                    ${!isSelected && isToday && !isDisabled ? 'border border-blue-500 text-blue-600' : ''}
                    ${isDisabled ? 'text-gray-300 cursor-not-allowed' : ''}
                  `}
                >
                  {format(date, 'd')}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
             <button 
                onClick={(e) => { e.preventDefault(); onChange(''); setIsOpen(false); setIsYearOpen(false); setIsMonthOpen(false); }}
                className="text-xs text-blue-500 font-bold hover:text-blue-700 transition-colors"
             >
               Clear
             </button>
             <button 
                onClick={(e) => { 
                   e.preventDefault(); 
                   if ((!minDate || !isBefore(new Date(), minDate)) && (!maxDate || !isAfter(new Date(), maxDate))) {
                     handleDateClick(new Date()); 
                   }
                }}
                className={`text-xs font-bold transition-colors ${((minDate && isBefore(new Date(), minDate)) || (maxDate && isAfter(new Date(), maxDate))) ? 'text-gray-300 cursor-not-allowed' : 'text-blue-500 hover:text-blue-700'}`}
             >
               Today
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
