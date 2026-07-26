import React, { useState } from 'react';
import Dropdown from '../../components/ui/Dropdown';

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
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' },
];

const B2BPaxCalendar: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('6'); // July
  const [selectedYear, setSelectedYear] = useState('2026');

  // Generate calendar grid for July 2026 (Starts on Wed)
  const daysInMonth = 31;
  const startingDay = 2; // 0=Mon, 1=Tue, 2=Wed
  const totalCells = 35; // 5 rows
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
            <button className="text-gray-500 hover:text-blue-600 transition">&lt;&lt; Prev Month</button>
            <span className="text-gray-300">|</span>
            <button className="text-gray-500 hover:text-blue-600 transition">Next Month &gt;&gt;</button>
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
            <button className="bg-[#0b1031] text-white px-6 py-2 rounded-full text-sm font-bold shadow-md hover:bg-blue-900 transition h-[38px]">
              Fetch
            </button>
          </div>
          
          <div className="text-[11px] text-gray-500 font-bold mt-4 md:mt-0">
            5 records in July 2026
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="w-full">
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
            {calendarCells.map((day, index) => (
              <div 
                key={index} 
                className={`min-h-[100px] border border-gray-100 rounded-lg p-3 transition-colors ${
                  day ? 'hover:border-blue-200 hover:shadow-sm cursor-pointer' : 'bg-gray-50/50'
                }`}
              >
                {day && (
                  <div className="flex flex-col items-center justify-center h-full opacity-40">
                    <span className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold">
                      {day}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default B2BPaxCalendar;
