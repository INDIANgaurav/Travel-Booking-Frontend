import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import Loader from '../../../components/common/Loader';
import { format } from 'date-fns';
import { Users, FileText, CheckCircle2, CreditCard, Wallet, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AgentGroupBookings() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentModalData, setPaymentModalData] = useState<any>(null);
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

  const openPaymentModal = (req: any) => {
    setPaymentModalData(req);
  };

  const handleAcceptQuote = async (paymentMethod: string) => {
    if (!paymentModalData) return;
    const id = paymentModalData._id;
    
    try {
      setLoading(true);
      setPaymentModalData(null);
      await api.post(`/api/group-bookings/${id}/accept`, { paymentMethod });
      toast.success(`Quote accepted and paid successfully via ${paymentMethod}!`);
      fetchRequests();
    } catch (error: any) {
      console.error('Error accepting quote:', error);
      toast.error(error.response?.data?.message || 'Failed to accept quote');
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="flex-1 w-full bg-[#fafbfd] p-6 text-[#0c1a40]">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6 space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Group Booking Requests (RFQ)</h1>
            <p className="mt-1 text-sm text-gray-500">Track your bulk booking requests and accept admin quotes.</p>
          </div>
          <button
            onClick={() => navigate('/b2b/dashboard/offline-booking')}
            className="px-6 py-2.5 bg-[#0c1a40] hover:bg-[#0c1a40]/90 text-white font-bold rounded-xl text-sm transition-colors shadow-md flex items-center gap-2"
          >
            + Request New Bulk Booking
          </button>
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
                    <th className="px-6 py-4 font-bold">Quote (INR)</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((req) => (
                    <tr key={req._id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{req.flightDetails?.origin} → {req.flightDetails?.destination}</div>
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
                          <span className="font-bold text-lg text-emerald-600">INR {req.adminQuotePrice.toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-400 italic">Awaiting Quote</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {req.status === 'QUOTED' && (
                          <button 
                            onClick={() => openPaymentModal(req)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition shadow-md"
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

        {/* Payment Selection Modal */}
        {paymentModalData && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-gray-100 bg-[#0c1a40] flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-white">Complete Payment</h3>
                  <p className="text-xs text-blue-200 mt-1 uppercase tracking-wider">Group Booking Quote</p>
                </div>
                <button onClick={() => setPaymentModalData(null)} className="text-white/70 hover:text-white p-2">
                  X
                </button>
              </div>
              
              <div className="p-6 bg-gray-50 border-b border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-600">Total Quote Amount:</span>
                  <span className="text-2xl font-black text-emerald-600">INR {paymentModalData.adminQuotePrice?.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500">For {paymentModalData.flightDetails?.origin} → {paymentModalData.flightDetails?.destination} ({paymentModalData.requestedSeats?.total} Seats)</p>
              </div>

              <div className="p-6 space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Payment Method</p>
                
                <button 
                  onClick={() => handleAcceptQuote('Wallet')}
                  className="w-full bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl p-4 flex items-center gap-4 transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">B2B Wallet</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">Instant deduction from your B2B wallet balance</div>
                  </div>
                </button>

                <button 
                  onClick={() => handleAcceptQuote('Razorpay')}
                  className="w-full bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl p-4 flex items-center gap-4 transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Credit / Debit / UPI</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">Pay instantly via secure payment gateway</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => handleAcceptQuote('Bank Transfer')}
                  className="w-full bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl p-4 flex items-center gap-4 transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Offline Bank Transfer</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">Upload receipt after NEFT/IMPS transfer</div>
                  </div>
                </button>
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setPaymentModalData(null)}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg text-sm transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
