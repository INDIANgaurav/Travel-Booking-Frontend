import React, { useState, useEffect } from 'react';
import Dropdown from '../../components/ui/Dropdown';
import DOBCalendar from '../../components/ui/DOBCalendar';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const products = [
  { value: 'airline', label: 'Airline' },
  { value: 'hotel', label: 'Hotel' }
];

const B2BDebitNote: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState('airline');
  const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDebitNotes();
  }, []);

  const fetchDebitNotes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/debit-notes');
      setRecords(data);
    } catch (error) {
      console.error('Error fetching debit notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await api.post('/api/debit-notes', {
        product: selectedProduct,
        fromDate,
        toDate,
      });
      fetchDebitNotes(); // Refresh
    } catch (error) {
      toast.error('Failed to request debit note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-[#fafbfd] p-4 md:p-6 text-[#0c1a40]">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-4 md:gap-6">
        
        {/* Header Title Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 md:px-6 py-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#0c1a40]">DEBIT NOTE</h2>
        </div>

        {/* Filter Form Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col md:flex-row items-stretch md:items-end gap-4 md:gap-6">
          <div className="w-full md:w-[250px]">
            <label className="block text-[11px] font-bold text-[#0c1a40] mb-2 uppercase tracking-wide">Product</label>
            <Dropdown 
              value={selectedProduct}
              onChange={setSelectedProduct}
              options={products}
              className="w-full"
            />
          </div>
          
          <div className="w-full md:w-[200px]">
            <label className="block text-[11px] font-bold text-[#0c1a40] mb-2 uppercase tracking-wide">From Date</label>
            <DOBCalendar 
              value={fromDate}
              onChange={setFromDate}
              placeholder="dd-mm-yyyy"
            />
          </div>

          <div className="w-full md:w-[200px]">
            <label className="block text-[11px] font-bold text-[#0c1a40] mb-2 uppercase tracking-wide">To Date</label>
            <DOBCalendar 
              value={toDate}
              onChange={setToDate}
              placeholder="dd-mm-yyyy"
            />
          </div>

          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#0b1031] text-white px-8 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-blue-900 transition h-[42px] w-full md:w-auto md:min-w-[120px]"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        {/* Results Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[300px]">
          <div className="border-b border-gray-100 px-4 md:px-6 py-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#0c1a40]">DEBIT NOTE</h2>
          </div>
          
          <div className="flex-1 flex flex-col p-4 md:p-8">
            {records.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm text-[#0c1a40] whitespace-nowrap">
                    <thead className="bg-[#0b1031] text-white text-[10px] uppercase font-black tracking-widest">
                      <tr>
                        <th className="px-6 py-4 rounded-tl-lg">DATE</th>
                        <th className="px-6 py-4">PRODUCT</th>
                        <th className="px-6 py-4">FROM</th>
                        <th className="px-6 py-4">TO</th>
                        <th className="px-6 py-4 rounded-tr-lg">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100 font-semibold text-xs text-gray-700 border border-gray-100">
                      {records.map((r, i) => (
                        <tr key={i} className="hover:bg-blue-50/50 transition">
                          <td className="px-6 py-5">{new Date(r.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-5 uppercase">{r.product}</td>
                          <td className="px-6 py-5">{r.fromDate}</td>
                          <td className="px-6 py-5">{r.toDate}</td>
                          <td className="px-6 py-5 text-amber-600">{r.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col divide-y divide-gray-200 border-t border-gray-200">
                  {records.map((r, i) => (
                    <div key={i} className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Product</p>
                          <p className="font-black text-[#0c1a40] text-base uppercase">{r.product}</p>
                        </div>
                        <span className="text-amber-600 font-black uppercase tracking-widest text-[10px] bg-amber-50 px-2 py-1 rounded-full">
                          {r.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-1">
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Date</p>
                          <p className="text-xs font-bold text-gray-800">{new Date(r.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">From</p>
                          <p className="text-xs font-bold text-gray-800">{r.fromDate}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">To</p>
                          <p className="text-xs font-bold text-gray-800">{r.toDate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center py-8">
                <p className="text-amber-500 font-bold text-sm">No Records Found Yet...!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default B2BDebitNote;
