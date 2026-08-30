import React from 'react';
import { Search } from 'lucide-react';
import Dropdown from './Dropdown';

interface DateRangeFilterProps {
  fromDate: string;
  toDate: string;
  onFromChange: (date: string) => void;
  onToChange: (date: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchOptions?: { value: string; label: string }[];
  selectedSearchType?: string;
  onSearchTypeChange?: (type: string) => void;
  onSearchSubmit?: () => void;
}
import DOBCalendar from './DOBCalendar';

export default function DateRangeFilter({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
  searchQuery,
  onSearchChange,
  searchOptions,
  selectedSearchType,
  onSearchTypeChange,
  onSearchSubmit
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-white p-4 rounded-2xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100/60 w-full mb-6">
      <div className="flex items-center gap-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">From</label>
        <div className="w-[150px]">
          <DOBCalendar
            value={fromDate}
            onChange={onFromChange}
            placeholder="From Date"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">To</label>
        <div className="w-[150px]">
          <DOBCalendar
            value={toDate}
            onChange={onToChange}
            placeholder="To Date"
          />
        </div>
      </div>

      {(onSearchChange !== undefined) && (
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {searchOptions && onSearchTypeChange && (
            <div className="w-full sm:w-48">
              <Dropdown 
                value={selectedSearchType || ''}
                onChange={onSearchTypeChange}
                options={searchOptions}
              />
            </div>
          )}
          <div className="relative w-full">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
            <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
          </div>
          {onSearchSubmit && (
            <button 
              onClick={onSearchSubmit}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 transition-all flex-shrink-0"
            >
              <Search size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
