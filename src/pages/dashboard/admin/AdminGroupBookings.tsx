import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import Loader from '../../../components/common/Loader';
import { format } from 'date-fns';
import RefreshButton from '../../../components/ui/RefreshButton';

export default function AdminGroupBookings() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quoteAmount, setQuoteAmount] = useState<string>('');

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/group-bookings');
      const formattedData = res.data.map((item: any) => ({ 
        ...item, 
        requestType: 'group-bookings', 
        requestTypeLabel: 'Group Bookings RFQ' 
      }));
      
      const sortedData = formattedData.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      
      setData(sortedData);
    } catch (error) {
      console.error('Error fetching group bookings:', error);
      toast.error('Failed to load group bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleQuoteSubmit = async (id: string) => {
    if (!quoteAmount || isNaN(Number(quoteAmount))) {
      toast.error('Please enter a valid quote amount');
      return;
    }
    try {
      await api.put(`/api/group-bookings/${id}/quote`, { quotePrice: Number(quoteAmount) });
      toast.success('Quote sent to Agent successfully!');
      setSelectedItem(null);
      setQuoteAmount('');
      fetchAllData();
    } catch (error) {
      console.error('Error quoting:', error);
      toast.error('Failed to send quote');
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Group Bookings RFQ</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Manage bulk offline booking requests from agents.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader /></div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-bold">No pending group booking requests found.</div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-end">
                <RefreshButton onClick={fetchAllData} loading={loading} count={data.length} />
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-3 font-bold">Request Type</th>
                    <th className="px-6 py-3 font-bold">Agent</th>
                    <th className="px-6 py-3 font-bold">Details</th>
                    <th className="px-6 py-3 font-bold">Date Requested</th>
                    <th className="px-6 py-3 font-bold">Status</th>
                    <th className="px-6 py-3 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-blue-600">
                        {item.requestTypeLabel}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{item.agentId?.companyName || item.agentId?.name || 'Unknown Agent'}</div>
                        <div className="text-xs text-gray-500">{item.agentId?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span>{item.flightDetails?.origin} to {item.flightDetails?.destination} | Seats: {item.requestedSeats?.total}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.createdAt ? format(new Date(item.createdAt), 'dd MMM yyyy, HH:mm') : ''}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          item.status === 'COMPLETED' || item.status === 'APPROVED' || item.status === 'ACTIVE' || item.status === 'PAID'
                            ? 'bg-green-100 text-green-700' 
                            : item.status === 'REJECTED' || item.status === 'CANCELLED' 
                            ? 'bg-red-100 text-red-700' 
                            : item.status === 'QUOTED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button 
                          onClick={() => setSelectedItem(item)}
                          className="px-3 py-1.5 border border-slate-200 bg-white text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition shadow-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#0c1a40]">
              <div>
                <h3 className="text-xl font-bold text-white">Request Details</h3>
                <p className="text-xs text-blue-200 mt-1 uppercase tracking-wider">{selectedItem.requestTypeLabel}</p>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-white/70 hover:text-white p-2 text-xl font-bold"
              >
                X
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-gray-50/50">
              <div className="grid grid-cols-2 gap-4">
                {/* Agent Info Section */}
                <div className="col-span-2 bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl uppercase">
                    {(selectedItem.agentId?.companyName || selectedItem.agentId?.name || 'A').charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0c1a40]">{selectedItem.agentId?.companyName || selectedItem.agentId?.name}</p>
                    <p className="text-xs text-gray-500">{selectedItem.agentId?.email}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      selectedItem.status === 'COMPLETED' || selectedItem.status === 'APPROVED' || selectedItem.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700' 
                        : selectedItem.status === 'REJECTED' || selectedItem.status === 'CANCELLED' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedItem.status || 'PENDING'}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-2 font-bold">{selectedItem.createdAt ? format(new Date(selectedItem.createdAt), 'dd MMM yyyy, HH:mm') : ''}</p>
                  </div>
                </div>

                {/* Dynamic Data Fields */}
                {Object.entries(selectedItem).map(([key, value]) => {
                  if (['agentId', '_id', '__v', 'createdAt', 'updatedAt', 'status', 'requestType', 'requestTypeLabel', 'passengers'].includes(key)) return null;
                  if (value === null || value === undefined || value === '') return null;
                  
                  // Make total amounts span full width
                  const isTotal = key.toLowerCase().includes('total');
                  
                  // Handle nested objects (like flightDetails and requestedSeats)
                  if (typeof value === 'object' && !Array.isArray(value)) {
                    return (
                      <div key={key} className="col-span-2 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-blue-600">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(value).map(([subKey, subValue]) => (
                            <div key={subKey}>
                              <p className="text-[9px] text-gray-500 uppercase font-bold">{subKey}</p>
                              <p className="text-xs font-bold text-gray-900">{String(subValue)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={key} className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm ${isTotal ? 'col-span-2 bg-blue-50/50 border-blue-100' : ''}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isTotal ? 'text-blue-600' : 'text-gray-500'}`}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className={`font-bold truncate ${isTotal ? 'text-xl text-[#0c1a40]' : 'text-sm text-gray-900'}`} title={String(value)}>
                        {String(value)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Quote Engine for Group Bookings */}
            {selectedItem.status === 'PENDING' && (
              <div className="p-6 border-t border-gray-100 bg-blue-50/50 flex flex-col gap-3">
                <p className="text-xs font-bold text-blue-800 uppercase tracking-widest">Admin Action: Provide Quote</p>
                <div className="flex gap-3">
                  <input 
                    type="number" 
                    placeholder="Enter total quote amount (INR)"
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 outline-none font-bold text-blue-900"
                  />
                  <button 
                    onClick={() => handleQuoteSubmit(selectedItem._id)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all whitespace-nowrap"
                  >
                    Send Quote
                  </button>
                </div>
              </div>
            )}
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedItem(null)}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
