import React, { useState } from 'react';
import Dropdown from '../../components/ui/Dropdown';
import DOBCalendar from '../../components/ui/DOBCalendar';

const bookingTypes = [{ value: 'One-Way', label: 'One-Way' }, { value: 'Return', label: 'Return' }];
const travelTypes = [{ value: 'Domestic', label: 'Domestic' }, { value: 'International', label: 'International' }];
const classes = [{ value: 'Economy', label: 'Economy' }, { value: 'Business', label: 'Business' }];

const B2BOfflineBooking: React.FC = () => {
  const [activeTab, setActiveTab] = useState('GROUP BOOKING');
  
  return (
    <div className="flex-1 w-full bg-[#fafbfd] p-6 text-[#0c1a40]">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        
        {/* Header Title Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#0c1a40]">OFFLINE BOOKING</h2>
        </div>

        {/* Tabs and Form Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 text-[11px] font-black uppercase tracking-wider">
            {['GROUP BOOKING', 'LTC OFFLINE BOOKING', 'INTERNATIONAL BOOKING'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-center transition-colors ${activeTab === tab ? 'text-[#0c1a40] border-b-2 border-[#0c1a40] bg-gray-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-8">
            <h3 className="text-sm font-bold text-[#0c1a40] mb-4">Name & Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Name <span className="text-red-500">*</span></label>
                <input type="text" className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Mobile <span className="text-red-500">*</span></label>
                <input type="text" className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Email <span className="text-red-500">*</span></label>
                <input type="email" className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Address</label>
                <input type="text" className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
            </div>

            <h3 className="text-sm font-bold text-[#0c1a40] mb-4">Booking Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Origin <span className="text-red-500">*</span></label>
                <input type="text" className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Destination <span className="text-red-500">*</span></label>
                <input type="text" className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Booking Type <span className="text-red-500">*</span></label>
                <Dropdown value="One-Way" onChange={()=>{}} options={bookingTypes} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Travel Type <span className="text-red-500">*</span></label>
                <Dropdown value="Domestic" onChange={()=>{}} options={travelTypes} />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Onward Date <span className="text-red-500">*</span></label>
                <DOBCalendar value="" onChange={()=>{}} placeholder="dd/mm/yyyy" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Class Onward</label>
                <Dropdown value="Economy" onChange={()=>{}} options={classes} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Airline Code</label>
                <input type="text" className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Flight Code</label>
                <input type="text" className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Adult</label>
                <input type="text" defaultValue="1" className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Child</label>
                <input type="text" defaultValue="0" className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Infant</label>
                <input type="text" defaultValue="0" className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0c1a40] mb-1.5">Remarks <span className="text-red-500">*</span></label>
                <input type="text" className="w-full h-[38px] px-3 border border-gray-200 rounded text-xs outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="flex gap-8 items-center mb-8 text-xs font-semibold text-gray-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0c1a40] focus:ring-[#0c1a40]" />
                Flexibility Price
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0c1a40] focus:ring-[#0c1a40]" />
                Flexibility Date
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0c1a40] focus:ring-[#0c1a40]" />
                Flexibility Flight
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <button className="bg-[#0b1031] text-white px-10 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-blue-900 transition">
                Submit
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default B2BOfflineBooking;
