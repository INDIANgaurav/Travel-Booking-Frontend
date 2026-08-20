import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, setCredentials } from '../../../store/authSlice';
import TopNavbar from '../../../components/layout/TopNavbar';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Wallet, CreditCard, Banknote, ShieldCheck, RefreshCw } from 'lucide-react';

// Extend window for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function WalletPage() {
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const [walletBalance, setWalletBalance] = useState(currentUser?.walletBalance || 0);
  const [amount, setAmount] = useState<string>('500');
  const [paymentMethod, setPaymentMethod] = useState<string>('CC');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

  const PAYMENT_METHODS = [
    { id: 'UPI', label: 'UPI', fee: 0, disabled: true },
    { id: 'CC', label: 'Credit / Debit Card', fee: 2 },
    { id: 'NB', label: 'Netbanking', fee: 2 }
  ];

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const { data } = await api.get('/api/wallet');
      setWalletBalance(data.balance);
      setTransactions(data.transactions || []);
      if (currentUser && currentUser.walletBalance !== data.balance) {
        const token = localStorage.getItem('token');
        if (token) {
          dispatch(setCredentials({ user: { ...currentUser, walletBalance: data.balance }, token }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch wallet', error);
    } finally {
      setPageLoading(false);
    }
  };

  const calculateSurcharge = (amt: number) => {
    return paymentMethod === 'UPI' ? 0 : amt * 0.02;
  };

  const handleTopUp = async () => {
    const topUpAmount = Number(amount);
    if (!topUpAmount || topUpAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      // 1. Create Order
      const { data: orderData } = await api.post('/api/wallet/create-order', {
        amount: topUpAmount,
        paymentMethod
      });

      // 2. Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_xxxx',
        amount: orderData.amount * 100, // in paise
        currency: orderData.currency,
        name: 'Trippechalo Wallet',
        description: 'Wallet Top-up',
        image: '/tg-favicon.svg',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            toast.loading('Verifying payment...', { id: 'verify' });
            // 3. Verify Payment
            await api.post('/api/wallet/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              baseAmount: orderData.baseAmount,
              surcharge: orderData.surcharge,
              paymentMethod
            });

            toast.success('Wallet recharged successfully!', { id: 'verify' });
            fetchWallet(); // refresh balance
          } catch (err: any) {
            toast.error(err.response?.data?.message || 'Verification failed', { id: 'verify' });
          }
        },
        prefill: {
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          contact: currentUser?.phone || ''
        },
        theme: {
          color: '#0b1031'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(response.error.description || 'Payment failed');
      });
      rzp.open();

    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initiate top-up');
    } finally {
      setLoading(false);
    }
  };

  const currentAmount = Number(amount) || 0;
  const surcharge = calculateSurcharge(currentAmount);
  const totalPayable = currentAmount + surcharge;

  return (
    <div className="min-h-screen bg-[#F2F2F2] font-sans pb-20 relative">
      <TopNavbar forceWhite={true} />

      <div className="fixed top-0 left-0 w-full h-[280px] bg-[#0b1031] z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
      </div>
      
      <div className="relative z-10 w-full pt-32 max-w-[1200px] mx-auto px-6">
        
        <div className="text-white mb-8 flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-400/30">
            <Wallet size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black">My Wallet</h1>
            <p className="text-blue-100 font-medium">Manage your balance & transactions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Top Up */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Balance Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex justify-between items-center bg-[url('/pattern.png')] bg-cover">
              <div>
                <p className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-2">Available Balance</p>
                <div className="text-3xl md:text-5xl font-black text-[#0b1031] flex items-center gap-2">
                  {pageLoading ? (
                    <div className="h-12 w-48 bg-gray-200 animate-pulse rounded-lg"></div>
                  ) : (
                    `₹${walletBalance.toLocaleString('en-IN')}`
                  )}
                </div>
              </div>
              <div className="text-right">
                <ShieldCheck size={48} className="text-green-500 opacity-80" />
                <p className="text-xs text-gray-400 font-bold mt-2">100% Secure</p>
              </div>
            </div>

            {/* Add Money Card */}
            <div className="bg-white rounded-2xl p-5 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-lg md:text-xl font-black text-gray-900 mb-6">Add Money to Wallet</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Enter Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">₹</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-10 pr-4 text-2xl font-black text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {[500, 1000, 2000, 5000].map(val => (
                      <button 
                        key={val}
                        onClick={() => setAmount(val.toString())}
                        className="px-3 py-1.5 md:px-4 rounded-full border border-gray-200 text-xs md:text-sm font-bold text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        +₹{val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Select Payment Method</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full flex items-center justify-between bg-white border-2 border-gray-100 hover:border-blue-500 rounded-xl py-4 px-4 text-left focus:outline-none transition-colors shadow-sm"
                    >
                      <span className="font-bold text-gray-900">
                        {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label} 
                      </span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden">
                        {PAYMENT_METHODS.map(method => (
                          <div 
                            key={method.id}
                            onClick={() => {
                              if (!method.disabled) {
                                setPaymentMethod(method.id);
                                setIsDropdownOpen(false);
                              }
                            }}
                            className={`px-4 py-4 flex items-center justify-between transition-colors ${method.disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'} ${paymentMethod === method.id ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
                          >
                            <span className={`font-bold ${paymentMethod === method.id ? 'text-blue-700' : 'text-gray-700'}`}>
                              {method.label} {method.disabled && <span className="text-xs text-red-500 ml-2 font-medium">(Temporarily Unavailable)</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 font-medium">Recharge Amount</span>
                    <span className="font-bold text-gray-900">₹{currentAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Convenience Fee ({paymentMethod === 'UPI' ? '0%' : '2%'})</span>
                    <span className="font-bold text-gray-900">₹{surcharge.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base md:text-lg font-black text-gray-900">Total Payable</span>
                    <span className="text-xl md:text-2xl font-black text-blue-600">₹{totalPayable.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button 
                  onClick={handleTopUp}
                  disabled={loading || currentAmount <= 0}
                  className="w-full bg-[#0b1031] hover:bg-blue-900 text-white font-black text-lg py-4 rounded-xl shadow-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `PROCEED TO PAY ₹${totalPayable.toLocaleString('en-IN')}`}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Transactions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 h-[500px] lg:h-full lg:max-h-[800px] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg font-black text-gray-900">Recent Transactions</h2>
                <button 
                  onClick={() => fetchWallet()}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                  title="Refresh Transactions"
                >
                  <RefreshCw size={14} className={pageLoading ? 'animate-spin text-blue-600' : ''} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {pageLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse"></div>
                        <div>
                          <div className="h-4 w-32 bg-gray-100 animate-pulse rounded mb-2"></div>
                          <div className="h-3 w-20 bg-gray-100 animate-pulse rounded"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 w-16 bg-gray-100 animate-pulse rounded ml-auto mb-2"></div>
                        <div className="h-3 w-10 bg-gray-100 animate-pulse rounded ml-auto"></div>
                      </div>
                    </div>
                  ))
                ) : transactions.length === 0 ? (
                  <div className="text-center py-10">
                    <Banknote size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-bold">No transactions yet</p>
                  </div>
                ) : (
                  transactions.map((t, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedTransaction(t)}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer border border-transparent hover:border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {t.type === 'CREDIT' ? '+' : '-'}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900 capitalize truncate max-w-[150px]">{t.description}</p>
                          <p className="text-[10px] text-gray-500 font-medium">{new Date(t.date).toLocaleDateString()} • {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-sm ${t.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.type === 'CREDIT' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                        </p>
                        {t.paymentMethod && <p className="text-[9px] font-bold text-gray-400 uppercase">{t.paymentMethod}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-black text-xl text-gray-900">Transaction Details</h3>
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 transition"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="flex justify-center mb-6">
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">{selectedTransaction.type === 'CREDIT' ? 'Amount Added' : 'Amount Deducted'}</p>
                  <p className={`text-4xl font-black ${selectedTransaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedTransaction.type === 'CREDIT' ? '+' : '-'}₹{selectedTransaction.amount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-400 font-bold mt-2">
                    {new Date(selectedTransaction.date).toLocaleDateString()} at {new Date(selectedTransaction.date).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-gray-500">Description</span>
                  <span className="text-sm font-bold text-gray-900 text-right max-w-[200px]">{selectedTransaction.description}</span>
                </div>
                
                {selectedTransaction.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-gray-500">Method</span>
                    <span className="text-sm font-bold text-gray-900 uppercase">{selectedTransaction.paymentMethod}</span>
                  </div>
                )}

                {selectedTransaction.surcharge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-gray-500">Convenience Fee Paid</span>
                    <span className="text-sm font-bold text-gray-900">₹{selectedTransaction.surcharge}</span>
                  </div>
                )}
                
                {selectedTransaction.razorpayPaymentId && (
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="text-sm font-bold text-gray-500">Transaction ID</span>
                    <span className="text-sm font-bold text-gray-900 font-mono text-xs">{selectedTransaction.razorpayPaymentId}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="px-6 py-2 bg-[#0b1031] text-white font-bold rounded-lg hover:bg-blue-900 transition"
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
