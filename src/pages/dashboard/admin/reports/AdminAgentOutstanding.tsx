import React, { useState } from 'react';
import ReportHeader from '../../../../components/ui/ReportHeader';
import { Search, Download } from 'lucide-react';

export default function AdminAgentOutstanding() {
  const [year, setYear] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleDownload = () => {};

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full overflow-hidden pb-20">
      <ReportHeader 
        title="Agent Outstanding Report" 
        description="Comprehensive view of agent dues, credits, and total outstanding balances"
        onDownload={handleDownload}
      />

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-white p-4 rounded-2xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100/60 w-full mb-6">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Year</label>
          <input 
            type="text"
            placeholder="YYYY"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-3 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all w-[100px]"
          />
        </div>

        <div className="flex-1 flex items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full max-w-sm">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Agent..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
            <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
          </div>
          <button className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 transition-all flex-shrink-0">
            <Search size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100/60 overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
            <thead>
              <tr>
                <th className="bg-slate-100 border-b border-r border-slate-200 px-6 py-3 text-xs uppercase tracking-wider text-slate-600 font-black" rowSpan={2}>
                  Agent Name
                </th>
                <th className="bg-indigo-50 border-b border-r border-indigo-100 px-6 py-2 text-xs uppercase tracking-wider text-indigo-800 font-black text-center" colSpan={5}>
                  Total Outstanding : ₹ 0
                </th>
              </tr>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-black">
                <th className="px-4 py-3 border-r border-slate-100">Debit Amt</th>
                <th className="px-4 py-3 border-r border-slate-100">Credit Amt</th>
                <th className="px-4 py-3 border-r border-slate-100">Crr Due</th>
                <th className="px-4 py-3 border-r border-slate-100">Prv Due</th>
                <th className="px-4 py-3">Total Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60 text-sm font-medium text-slate-700">
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-semibold">
                  No outstanding records found for this year
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
