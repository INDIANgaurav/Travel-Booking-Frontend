import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import Loader from '../../../components/common/Loader';
import { format } from 'date-fns';
import { Users, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AgentGroupBookings() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/api/group-bookings/my-requests');
      setRequests(data);
    } catch (error) {
      console.error('Error fetching group bookings:', error);
      toast.error('Failed to load group bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAcceptQuote = async (id: string) => {
    if (!window.confirm('Are you sure you want to accept this quote? Payment will be deducted from your wallet.')) return;
    
    try {
      setLoading(true);
      await api.post(`/api/group-bookings/${id}/accept`);
      toast.success('Quote accepted and paid successfully!');
      fetchRequests();
    } catch (error: any) {
      console.error('Error accepting quote:', error);
      toast.error(error.response?.data?.message || 'Failed to accept quote');
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Group Booking Requests (RFQ)</h1>
        <p className="mt-2 text-sm text-gray-600">Track your bulk booking requests and accept admin quotes.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-bold">No group booking requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-4 font-bold">Route & Date</th>
                  <th className="px-6 py-4 font-bold">Seats Requested</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Quote (â‚¹)</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{req.flightDetails?.origin} â†’ {req.flightDetails?.destination}</div>
                      <div className="text-xs text-gray-500 mt-1">{req.flightDetails?.onwardDate} | {req.flightDetails?.classOnward}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700">
                      {req.requestedSeats?.total} ({req.requestedSeats?.adults}A, {req.requestedSeats?.child}C, {req.requestedSeats?.infants}I)
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        req.status === 'QUOTED' ? 'bg-blue-100 text-blue-700' :
                        req.status === 'PAID' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {req.adminQuotePrice ? (
                        <span className="font-bold text-lg text-emerald-600">â‚¹{req.adminQuotePrice.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-400 italic">Awaiting Quote</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === 'QUOTED' && (
                        <button 
                          onClick={() => handleAcceptQuote(req._id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition"
                        >
                          Accept & Pay
                        </button>
                      )}
                      {(req.status === 'PAID' || req.status === 'COMPLETED') && (
                        <button 
                          onClick={() => navigate(`/b2b/group-bookings/${req._id}`)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-2 ml-auto"
                        >
                          <Users size={14} /> Add Passengers
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
