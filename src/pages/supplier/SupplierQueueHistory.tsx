import React, { useState } from 'react';
import { Search, Download, FileText, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import Dropdown from '../../components/ui/Dropdown';

const SupplierQueueHistory: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const supplierName = (user as any)?.companyName || user?.name || (user as any)?.firstName || 'Supplier';

  const [fromDate, setFromDate] = useState('2026-07-22');
  const [toDate, setToDate] = useState('2026-07-22');
  const [supplier, setSupplier] = useState(supplierName);
  const [status, setStatus] = useState('All');
  const [searchBy, setSearchBy] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Outer Card with Blue Header Bar */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {/* Blue Header Bar */}
        <div className="bg-[#1d6aa3] text-white px-6 py-3">
          <h2 className="text-sm font-bold tracking-wider uppercase">
            PF QUEUE HISTORY
          </h2>
        </div>

        {/* Filter Form */}
        <form onSubmit={handleSubmit} className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">From Date*</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">To Date*</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Supplier*</label>
              <Dropdown
                value={supplier}
                onChange={setSupplier}
                options={[
                  { value: supplierName, label: supplierName },
                  { value: 'ALL', label: 'ALL SUPPLIERS' }
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Status*</label>
              <Dropdown
                value={status}
                onChange={setStatus}
                options={[
                  { value: 'All', label: 'All' },
                  { value: 'Active', label: 'Active' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Completed', label: 'Completed' }
                ]}
              />
            </div>

            <div>
              <button
                type="submit"
                className="bg-[#242b59] hover:bg-blue-900 text-white text-xs font-bold px-8 py-2.5 rounded transition-colors shadow-md w-full md:w-auto"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Search By row */}
          <div className="mt-4 flex items-center gap-2">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search By"
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value)}
                className="w-full text-xs px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <button type="button" className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors">
              <FileText size={16} />
            </button>
          </div>
        </form>

        {/* Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#e9ecef] text-gray-700 font-bold uppercase tracking-wider border-b border-gray-300">
              <tr>
                <th className="p-2.5 text-[11px]">S.NO</th>
                <th className="p-2.5 text-[11px]">PF REFNO</th>
                <th className="p-2.5 text-[11px]">REFNO</th>
                <th className="p-2.5 text-[11px]">SECTOR</th>
                <th className="p-2.5 text-[11px]">TRAVEL DATE</th>
                <th className="p-2.5 text-[11px]">GROSS</th>
                <th className="p-2.5 text-[11px]">NAME</th>
                <th className="p-2.5 text-[11px]">FLIGHT</th>
                <th className="p-2.5 text-[11px]">AIRLINE PNR</th>
                <th className="p-2.5 text-[11px]">TYPE</th>
                <th className="p-2.5 text-[11px]">CHANNEL</th>
                <th className="p-2.5 text-[11px]">REMARKS</th>
                <th className="p-2.5 text-[11px]">STATUS</th>
                <th className="p-2.5 text-[11px]">DATE</th>
                <th className="p-2.5 text-[11px]">ACTION</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={15} className="p-8 text-center text-xs font-bold text-gray-800 bg-white">
                  No Records Found Yet...!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierQueueHistory;
