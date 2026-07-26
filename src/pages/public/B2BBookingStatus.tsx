import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import api from '../../services/api';
import Dropdown from '../../components/ui/Dropdown';
import DOBCalendar from '../../components/ui/DOBCalendar';

const B2BBookingStatus: React.FC = () => {
  const [productType, setProductType] = useState('Flight');
  const [flightType, setFlightType] = useState('ONLINE');
  const [fromDate, setFromDate] = useState('2026-07-02');
  const [toDate, setToDate] = useState('2026-07-24');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGetHistory = async () => {
    try {
      setLoading(true);
      // Currently mocking the API call. You can connect this to a real endpoint later.
      // const res = await api.get(`/api/bookings/status?type=${productType}&from=${fromDate}&to=${toDate}`);
      // setRecords(res.data);
      setTimeout(() => {
        setRecords([]); // Mock empty response
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching history:', error);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-[#f8f9fc] p-6 text-[#0c1a40] min-h-screen">
      <div className="max-w-[1500px] mx-auto flex flex-col gap-4">
        
        {/* Top Product Filter Bar */}
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-6">
          {['Flight', 'Hotel', 'Travel Insurance', 'Top-Up', 'OD Details'].map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0c1a40]">
              <input 
                type="radio" 
                name="productType" 
                checked={productType === type}
                onChange={() => setProductType(type)}
                className="w-4 h-4 text-[#0b1031] focus:ring-[#0b1031] border-gray-300" 
              />
              {type}
            </label>
          ))}
        </div>

        {/* Second Filter Bar */}
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100 flex items-end gap-6">
          {productType === 'Flight' && (
            <div className="flex flex-col gap-2 w-48">
              <label className="text-xs font-bold text-[#0c1a40]">Flight Types</label>
              <Dropdown 
                options={[
                  { value: 'ONLINE', label: 'ONLINE' },
                  { value: 'OFFLINE', label: 'OFFLINE' },
                  { value: 'TO RESCHEDULE', label: 'TO RESCHEDULE' },
                  { value: 'TO CANCEL', label: 'TO CANCEL' }
                ]}
                value={flightType}
                onChange={setFlightType}
                placeholder="Select Status"
              />
            </div>
          )}

          <div className="flex flex-col gap-2 w-48">
            <label className="text-xs font-bold text-[#0c1a40]">From Date</label>
            <div className="h-[42px]">
              <DOBCalendar 
                value={fromDate}
                onChange={setFromDate}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 w-48">
            <label className="text-xs font-bold text-[#0c1a40]">To Date</label>
            <div className="h-[42px]">
              <DOBCalendar 
                value={toDate}
                onChange={setToDate}
              />
            </div>
          </div>

          <button 
            onClick={handleGetHistory}
            disabled={loading}
            className="bg-[#0b1031] text-white px-8 py-2.5 rounded-full text-xs font-bold shadow-md hover:bg-blue-900 transition h-[42px]"
          >
            {loading ? 'Loading...' : 'Get History'}
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-4 overflow-hidden min-h-[400px] flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#f1f5f9] text-gray-600 font-bold tracking-wider uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">S.NO</th>
                  <th className="px-6 py-4">REFERENCE NO.</th>
                  <th className="px-6 py-4">DATE</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4">AMOUNT</th>
                  <th className="px-6 py-4">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[#0c1a40] font-semibold">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading data...</td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-orange-500 font-bold text-sm">No Records Found</span>
                        <span className="text-gray-400 font-normal">Try adjusting your date range filters</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map((r, i) => (
                    <tr key={i} className="hover:bg-blue-50/50 transition">
                      {/* Mapping logic here once backend is connected */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default B2BBookingStatus;
