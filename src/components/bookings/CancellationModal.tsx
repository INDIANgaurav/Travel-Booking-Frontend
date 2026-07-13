import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import api from '../../services/api';

interface CancellationModalProps {
  bookingId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CancellationModal({ bookingId, onClose, onSuccess }: CancellationModalProps) {
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const cancellationReasons = [
    'Plan Changed',
    'Booked Wrong Date',
    'Found Better Price',
    'Medical Emergency',
    'Other'
  ];

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const { data } = await api.get(`/api/bookings/${bookingId}/cancellation-preview`);
        setPreview(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch cancellation details');
      } finally {
        setLoading(false);
      }
    };
    fetchPreview();
  }, [bookingId]);

  const handleCancelClick = () => {
    if (!reason) {
      setError('Please select a cancellation reason');
      return;
    }
    setShowConfirm(true);
  };

  const executeCancel = async () => {
    try {
      setShowConfirm(false);
      setCancelling(true);
      setError('');
      await api.post(`/api/bookings/${bookingId}/cancel`, { reason });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Cancel Booking</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : error && !preview ? (
            <div className="text-center py-8">
              <AlertCircle size={40} className="mx-auto text-red-500 mb-2" />
              <p className="text-red-500 font-medium">{error}</p>
            </div>
          ) : (
            <div className="space-y-5">
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
                <span className="font-bold block mb-1">Cancellation Policy:</span>
                {preview.policy}
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex justify-between p-3 border-b border-gray-100">
                  <span className="text-gray-600">Booking Amount</span>
                  <span className="font-bold text-gray-900">₹{preview.originalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 border-b border-gray-100 bg-red-50 text-red-700">
                  <span>Cancellation Charges</span>
                  <span className="font-bold">- ₹{preview.deductionAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-4 bg-gray-50">
                  <span className="font-black text-gray-900">Total Refund</span>
                  <span className="font-black text-green-600 text-lg">₹{preview.refundAmount.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Reason for cancellation <span className="text-red-500">*</span></label>
                <select 
                  value={reason} 
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="" disabled>Select a reason</option>
                  {cancellationReasons.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && preview && (
          <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
            <button 
              onClick={onClose}
              disabled={cancelling}
              className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
            >
              No, Keep It
            </button>
            <button 
              onClick={handleCancelClick}
              disabled={cancelling}
              className="px-5 py-2.5 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-70"
            >
              {cancelling ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Cancelling...</>
              ) : 'Confirm Cancel'}
            </button>
          </div>
        )}

        {/* Custom Confirmation Overlay */}
        {showConfirm && (
          <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Are you absolutely sure?</h3>
            <p className="text-gray-600 text-sm mb-6">This action cannot be undone. Your booking will be cancelled immediately and refunds will be processed based on the policy.</p>
            <div className="flex gap-3 w-full max-w-xs">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-sm transition"
              >
                Go Back
              </button>
              <button 
                onClick={executeCancel}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition shadow-md shadow-red-200"
              >
                Yes, Cancel It
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
