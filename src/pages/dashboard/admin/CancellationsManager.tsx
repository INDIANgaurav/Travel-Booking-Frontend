import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { CheckCircle, XCircle } from 'lucide-react';

const CancellationsManager: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Form State
  const [penalty, setPenalty] = useState<number | ''>('');
  const [platformFee, setPlatformFee] = useState<number | ''>('');
  const [refundAmount, setRefundAmount] = useState<number | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/cancellations/pending');
      setRequests(res.data || []);
    } catch (error) {
      console.error('Failed to fetch cancellations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Auto-calculate refund amount based on base fare (mocked as totalAmount for now) minus penalty/fees
  useEffect(() => {
    if (selectedRequest && penalty !== '' && platformFee !== '') {
      const base = selectedRequest.totalAmount || 0; // In reality, calculate this based on selected pax proportionate fare
      const calculated = base - (Number(penalty) + Number(platformFee));
      setRefundAmount(calculated > 0 ? calculated : 0);
    }
  }, [penalty, platformFee, selectedRequest]);

  const handleApprove = async () => {
    if (!selectedRequest) return;
    if (penalty === '' || platformFee === '' || refundAmount === '') {
      return alert('Please fill in all penalty and refund fields.');
    }

    const paxIds = selectedRequest.details.passengers
      .filter((p: any) => p.status === 'CANCEL_PENDING')
      .map((p: any) => p._id);

    try {
      setIsProcessing(true);
      await api.post(`/api/cancellations/process/${selectedRequest._id}`, {
        passengerIds: paxIds,
        cancellationPenalty: Number(penalty),
        platformFee: Number(platformFee),
        refundAmount: Number(refundAmount)
      });
      alert('Cancellation processed successfully!');
      setSelectedRequest(null);
      fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error processing cancellation');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-screen">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-xl font-bold text-[#171b3e]">Cancellation Requests</h2>
          <p className="text-sm text-gray-500 mt-1">Manage pending agent cancellations and process refunds.</p>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center p-10"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>
        ) : requests.length === 0 ? (
          <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <h3 className="text-lg font-bold text-gray-600">No Pending Requests</h3>
            <p className="text-gray-400">All caught up!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#f8fafc] text-gray-600 font-bold uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Booking Ref</th>
                  <th className="px-6 py-4">Agent</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[#0c1a40] font-medium">
                {requests.map((req, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-orange-500">{req.bookingId}</p>
                      <p className="text-xs text-gray-500">PNR: {req.details?.pnr}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold">{req.user?.companyName}</p>
                      <p className="text-xs text-gray-500">{req.user?.email}</p>
                    </td>
                    <td className="px-6 py-4">{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 truncate max-w-[200px]">{req.cancellationReason}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => {
                          setSelectedRequest(req);
                          setPenalty('');
                          setPlatformFee('');
                          setRefundAmount('');
                        }}
                        className="px-4 py-2 bg-[#0c1a40] text-white text-xs font-bold rounded-lg hover:bg-blue-900 transition"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="bg-[#171b3e] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">Process Cancellation</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-gray-300 hover:text-white transition">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Booking Ref</p>
                  <p className="font-bold text-[#171b3e] text-lg">{selectedRequest.bookingId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Total Booking Fare</p>
                  <p className="font-bold text-orange-600 text-lg">₹ {selectedRequest.totalAmount}</p>
                </div>
              </div>

              <h4 className="font-bold text-[#171b3e] mb-3">Passengers Pending Cancellation</h4>
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-6 space-y-2">
                {selectedRequest.details.passengers?.filter((p: any) => p.status === 'CANCEL_PENDING').map((pax: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-red-500" />
                    <span className="font-bold text-red-900 text-sm">{pax.name}</span>
                    <span className="text-xs text-red-700">({pax.type})</span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-bold text-[#171b3e] mb-4">Refund Calculation</h4>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Supplier Penalty (₹)</label>
                    <input 
                      type="number" 
                      value={penalty}
                      onChange={(e) => setPenalty(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Platform Fee (₹)</label>
                    <input 
                      type="number" 
                      value={platformFee}
                      onChange={(e) => setPlatformFee(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-2">
                  <label className="block text-xs font-bold text-green-700 mb-1">Final Refund Amount to Agent Wallet (₹)</label>
                  <input 
                    type="number" 
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-green-300 rounded bg-green-50 text-green-900 font-black text-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">* Verify penalty on supplier portal. Submitting will auto-credit this amount to the agent's wallet.</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="px-6 py-2 rounded-lg font-bold border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button 
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="px-6 py-2 rounded-lg font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? 'Processing...' : 'Approve & Refund'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancellationsManager;
