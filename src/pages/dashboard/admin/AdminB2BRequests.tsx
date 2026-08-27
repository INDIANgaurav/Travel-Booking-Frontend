import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import Loader from '../../../components/common/Loader';
import { format } from 'date-fns';
import RefreshButton from '../../../components/ui/RefreshButton';

const TABS = [
  { id: 'offline-bookings', label: 'Offline Bookings' },
  { id: 'tax-invoices', label: 'Tax Invoices' },
  { id: 'gst-invoices', label: 'GST Invoices' },
  { id: 'credit-notes', label: 'Credit Notes' },
  { id: 'debit-notes', label: 'Debit Notes' },
  { id: 'markups', label: 'Markups' },
  { id: 'bank-details', label: 'Bank Details' }
];

export default function AdminB2BRequests() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const promises = TABS.map(tab => api.get(`/api/admin/b2b/${tab.id}`).then(res => res.data.map((item: any) => ({ ...item, requestType: tab.id, requestTypeLabel: tab.label }))));
      const results = await Promise.all(promises);
      
      // Flatten arrays and sort by createdAt descending
      const allRequests = results.flat().sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      
      setData(allRequests);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleStatusUpdate = async (id: string, type: string, status: string) => {
    try {
      await api.put(`/api/admin/b2b/${type}/${id}`, { status });
      toast.success(`Status updated to ${status}`);
      fetchAllData(); // refresh
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">B2B Agent Requests</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Manage all pending requests submitted by agents.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">


        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader /></div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-bold">No pending requests found.</div>
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
                        {/* Dynamic Details based on request type */}
                        {item.requestType === 'offline-bookings' && <span>{item.origin} to {item.destination} ({item.product})</span>}
                        {item.requestType === 'tax-invoices' && <span>{item.fromDate} to {item.toDate} ({item.product})</span>}
                        {item.requestType === 'gst-invoices' && <span>Bill No: {item.billNumber} | {item.companyName}</span>}
                        {item.requestType === 'credit-notes' && <span>{item.fromDate} to {item.toDate} ({item.product})</span>}
                        {item.requestType === 'debit-notes' && <span>{item.fromDate} to {item.toDate} ({item.product})</span>}
                        {item.requestType === 'markups' && <span>{item.product} | {item.airline} | {item.value}%</span>}
                        {item.requestType === 'bank-details' && <span>{item.bankName} | A/c: {item.accountNumber}</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.createdAt ? format(new Date(item.createdAt), 'dd MMM yyyy, HH:mm') : ''}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          item.status === 'COMPLETED' || item.status === 'APPROVED' || item.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700' 
                            : item.status === 'REJECTED' || item.status === 'CANCELLED' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button 
                          onClick={() => setSelectedItem(item)}
                          className="px-3 py-1.5 bg-[#0c1a40] text-white text-xs font-bold rounded-lg hover:bg-blue-900 transition"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(item._id, item.requestType, item.requestType === 'markups' || item.requestType === 'bank-details' ? 'ACTIVE' : 'COMPLETED')}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(item._id, item.requestType, item.requestType === 'markups' || item.requestType === 'bank-details' ? 'INACTIVE' : 'REJECTED')}
                          className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition"
                        >
                          Reject
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
                className="text-white/70 hover:text-white p-2"
              >
                âœ•
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
                  if (['agentId', '_id', '__v', 'createdAt', 'updatedAt', 'status', 'requestType', 'requestTypeLabel'].includes(key)) return null;
                  if (value === null || value === undefined || value === '') return null;
                  
                  // Make total amounts span full width
                  const isTotal = key.toLowerCase().includes('total');
                  
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

