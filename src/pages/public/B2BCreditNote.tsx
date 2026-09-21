import React, { useState, useEffect } from 'react';
import Dropdown from '../../components/ui/Dropdown';
import DOBCalendar from '../../components/ui/DOBCalendar';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

const products = [
  { value: 'airline', label: 'Airline' },
  { value: 'hotel', label: 'Hotel' }
];

const B2BCreditNote: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState('airline');
  const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/credit-notes');
      setNotes(res.data);
    } catch (error) {
      console.error('Error fetching credit notes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await api.post('/api/credit-notes', {
        product: selectedProduct,
        fromDate,
        toDate
      });
      toast.success('Credit note requested successfully!');
      fetchNotes();
    } catch (error) {
      console.error('Error submitting credit note:', error);
      toast.error('Failed to request credit note.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-[#fafbfd] p-4 md:p-6 text-[#0c1a40]">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-4 md:gap-6">
        
        {/* Header Title Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 md:px-6 py-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#0c1a40]">CREDIT NOTES</h2>
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
            disabled={submitting}
            className="bg-[#0b1031] text-white px-8 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-blue-900 transition h-[42px] w-full md:w-auto md:min-w-[120px] disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        {/* Results Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[300px]">
          <div className="border-b border-gray-100 px-4 md:px-6 py-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#0c1a40]">CREDIT NOTES RECORD</h2>
          </div>
          
          {loading ? (
             <div className="flex-1 flex items-center justify-center p-8 text-gray-500 font-bold">Loading...</div>
          ) : notes.length === 0 ? (
             <div className="flex-1 flex items-center justify-center p-8">
               <p className="text-amber-600 font-bold text-sm">No Records Found Yet...!</p>
             </div>
          ) : (
             <>
               {/* Desktop Table */}
               <div className="hidden md:block overflow-x-auto">
                 <table className="w-full text-left text-xs whitespace-nowrap">
                   <thead className="bg-[#f8f9fc] text-[#0c1a40] font-bold uppercase tracking-wider">
                     <tr>
                       <th className="px-6 py-4">Product</th>
                       <th className="px-6 py-4">From Date</th>
                       <th className="px-6 py-4">To Date</th>
                       <th className="px-6 py-4">Requested At</th>
                       <th className="px-6 py-4">Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100 font-semibold text-gray-600">
                     {notes.map((note: any, i) => (
                       <tr key={i} className="hover:bg-blue-50/50 transition">
                         <td className="px-6 py-4 uppercase">{note.product}</td>
                         <td className="px-6 py-4">{note.fromDate}</td>
                         <td className="px-6 py-4">{note.toDate}</td>
                         <td className="px-6 py-4">{note.createdAt ? format(new Date(note.createdAt), 'dd MMM yyyy, HH:mm') : ''}</td>
                         <td className="px-6 py-4">
                           <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${note.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                             {note.status || 'PENDING'}
                           </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>

               {/* Mobile Cards */}
               <div className="md:hidden flex flex-col divide-y divide-gray-200 border-t border-gray-200">
                 {notes.map((note: any, i) => (
                   <div key={i} className="p-4 flex flex-col gap-3">
                     <div className="flex justify-between items-start">
                       <div>
                         <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Product</p>
                         <p className="font-black text-[#0c1a40] text-base uppercase">{note.product}</p>
                       </div>
                       <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${note.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                         {note.status || 'PENDING'}
                       </span>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">From Date</p>
                         <p className="text-sm font-bold text-gray-800">{note.fromDate}</p>
                       </div>
                       <div>
                         <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">To Date</p>
                         <p className="text-sm font-bold text-gray-800">{note.toDate}</p>
                       </div>
                       <div className="col-span-2">
                         <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Requested At</p>
                         <p className="text-xs font-bold text-gray-800">{note.createdAt ? format(new Date(note.createdAt), 'dd MMM yyyy, HH:mm') : '-'}</p>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </>
          )}
        </div>

      </div>
    </div>
  );
};

export default B2BCreditNote;
