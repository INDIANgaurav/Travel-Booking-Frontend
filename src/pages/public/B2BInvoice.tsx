import React, { useState } from 'react';
import Dropdown from '../../components/ui/Dropdown';
import DOBCalendar from '../../components/ui/DOBCalendar';

const products = [
  { value: 'airline', label: 'Airline' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'visa', label: 'Visa' },
];

const B2BInvoice: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState('airline');
  const [fromDate, setFromDate] = useState('2026-07-22');
  const [toDate, setToDate] = useState('2026-07-22');

  return (
    <div className="flex-1 w-full bg-[#fafbfd] p-6 text-[#0c1a40]">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        
        {/* Header Title Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#0c1a40]">TAX INVOICE</h2>
        </div>

        {/* Filter Form Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-end gap-6">
          <div className="w-[250px]">
            <label className="block text-[11px] font-bold text-[#0c1a40] mb-2 uppercase tracking-wide">Product</label>
            <Dropdown 
              value={selectedProduct}
              onChange={setSelectedProduct}
              options={products}
              className="w-full"
            />
          </div>
          
          <div className="w-[200px]">
            <label className="block text-[11px] font-bold text-[#0c1a40] mb-2 uppercase tracking-wide">From Date</label>
            <DOBCalendar 
              value={fromDate}
              onChange={setFromDate}
              placeholder="dd-mm-yyyy"
            />
          </div>

          <div className="w-[200px]">
            <label className="block text-[11px] font-bold text-[#0c1a40] mb-2 uppercase tracking-wide">To Date</label>
            <DOBCalendar 
              value={toDate}
              onChange={setToDate}
              placeholder="dd-mm-yyyy"
            />
          </div>

          <button className="bg-[#0b1031] text-white px-8 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-blue-900 transition h-[42px] min-w-[120px]">
            Submit
          </button>
        </div>

        {/* Results Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[300px]">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#0c1a40]">TAX INVOICE</h2>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-8">
            <p className="text-amber-600 font-bold text-sm">No Records Found Yet...!</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default B2BInvoice;
