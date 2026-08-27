import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, setCredentials } from '../../store/authSlice';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Wallet, CreditCard, Banknote, ShieldCheck, RefreshCw } from 'lucide-react';

// Extend window for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function B2BWalletPage() {
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const [walletBalance, setWalletBalance] = useState(currentUser?.walletBalance || 0);
  const [amount, setAmount] = useState<string>('5000');
  const [paymentMethod, setPaymentMethod] = useState<string>('NB');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'INSTANT' | 'NET_TRANSFER' | 'CASH' | 'CHEQUE' | 'OTHER' | 'WITHDRAW_FUNDS'>('INSTANT');
  const [offlinePaymentMode, setOfflinePaymentMode] = useState('');
  const [remarks, setRemarks] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [depositedBank, setDepositedBank] = useState('');
  const [depositedAccountNo, setDepositedAccountNo] = useState('');
  const [chequeNumber, setChequeNumber] = useState('');
  const [bankDetails, setBankDetails] = useState('');

  const [myOfflineRequests, setMyOfflineRequests] = useState<any[]>([]);
  const [refreshingRequests, setRefreshingRequests] = useState(false);

  const fetchMyRequests = async () => {
    setRefreshingRequests(true);
    try {
      const { data } = await api.get('/api/wallet/offline-topup/my-requests');
      setMyOfflineRequests(data);
    } catch(err) {
      console.error(err);
    } finally {
      setRefreshingRequests(false);
    }
  };

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
      const [walletRes, requestsRes] = await Promise.all([
        api.get('/api/wallet'),
        api.get('/api/wallet/offline-topup/my-requests').catch(() => ({ data: [] }))
      ]);
      const data = walletRes.data;
      setWalletBalance(data.balance);
      setTransactions(data.transactions || []);
      setMyOfflineRequests(requestsRes.data || []);
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

  const fetchMyWithdrawals = async () => {
    try {
      const { data } = await api.get('/api/wallet/withdrawal-requests');
      // Just mapping them into the same list for simplicity in this demo, or we can use a separate state
      // Actually, since we have 'myOfflineRequests', let's fetch both or separate them in UI
    } catch(err) {
      console.error(err);
    }
  };

  const calculateSurcharge = (amt: number) => {
    return paymentMethod === 'UPI' ? 0 : amt * 0.02;
  };

  
  const handleOfflineTopUp = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (activeTab === 'INSTANT') {
      // Use existing Razorpay flow for instant topup
      handleTopUp();
      return;
    }
    
    if (activeTab === 'WITHDRAW_FUNDS') {
      if (!bankDetails) {
        toast.error('Please enter your Bank Details');
        return;
      }
      setLoading(true);
      try {
        await api.post('/api/wallet/withdrawal-request', { amount, bankDetails });
        toast.success('Withdrawal Request submitted successfully. Waiting for admin approval.');
        setAmount('5000');
        setBankDetails('');
        fetchWallet();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to submit withdrawal request');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Offline validations
    if (!offlinePaymentMode) {
      toast.error('Please select a payment mode');
      return;
    }
    if (activeTab !== 'OTHER' && activeTab !== 'CASH' && (!referenceNumber && !chequeNumber)) {
       // Just a loose validation for now
    }
    
    setLoading(true);
    try {
      await api.post('/api/wallet/offline-topup', {
        amount,
        paymentMode: offlinePaymentMode,
        referenceNumber,
        depositedBank,
        depositedAccountNo,
        chequeNumber,
        remarks
      });
      
      toast.success('Top-up request submitted successfully. Waiting for admin approval.');
      setAmount('100');
      setOfflinePaymentMode('');
      setRemarks('');
      setReferenceNumber('');
      setDepositedBank('');
      setDepositedAccountNo('');
      setChequeNumber('');
      fetchWallet();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
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
        name: 'Trippechalo B2B Wallet',
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
          color: '#0c1a40'
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
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0c1a40] flex items-center gap-2">
            <Wallet className="text-blue-600" /> My Wallet & Balance
          </h1>
          <p className="text-sm text-gray-500 font-semibold mt-1">Manage your agency balance and view transaction history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Top Up */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-[#0c1a40] to-blue-900 rounded-2xl p-8 shadow-md border border-gray-100 flex justify-between items-center text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10">
              <Wallet size={120} className="-mr-6 -mt-6" />
            </div>
            <div className="relative z-10">
              <p className="text-blue-100 font-bold text-sm uppercase tracking-wider mb-2">Available Balance</p>
              <div className="text-5xl md:text-6xl font-black text-white flex items-center gap-2">
                {pageLoading ? (
                  <div className="h-14 w-48 bg-white/20 animate-pulse rounded-lg"></div>
                ) : (
                  `₹${walletBalance.toLocaleString('en-IN')}`
                )}
              </div>
            </div>
            <div className="text-right relative z-10 hidden sm:block">
              <ShieldCheck size={48} className="text-emerald-400 opacity-90 mx-auto" />
              <p className="text-xs text-blue-100 font-bold mt-2">100% Secure & Atomic</p>
            </div>
          </div>

          
          {/* Add Money Card */}
          <div className="bg-white rounded-xl p-0 shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between">
              <h2 className="text-[13px] font-black text-[#0b1031] uppercase tracking-wider">TOP-UP REQUEST</h2>
              <div className="text-[11px] font-bold mt-2 md:mt-0 flex flex-wrap gap-4">
                <span className="text-gray-500">Agent Name: <span className="text-[#0b1031]">{(currentUser as any)?.agencyName || currentUser?.name || ''} ({(currentUser as any)?.agencyCode || (currentUser as any)?.agencyId || ''})</span></span>
                <span className="text-gray-500">Agent Balance = <span className="text-[#0b1031]">{walletBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></span>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-gray-200 hide-scrollbar px-2">
              {['INSTANT', 'NET_TRANSFER', 'CASH', 'CHEQUE', 'OTHER', 'WITHDRAW_FUNDS'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab as any); setOfflinePaymentMode(''); }}
                  className={`px-6 py-4 text-[11px] font-black whitespace-nowrap uppercase tracking-wider transition-all border-b-[3px] ${
                    activeTab === tab 
                      ? 'border-[#0b1031] text-[#0b1031]' 
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab === 'INSTANT' ? 'INSTANT TOPUP' : tab === 'WITHDRAW_FUNDS' ? 'WITHDRAW FUNDS' : tab.replace('_', ' ')}
                </button>
              ))}
            </div>             <div className="p-6 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                 <div>
                   <label className="block text-[11px] font-black text-[#0b1031] mb-1.5">Amount (Rs.) *</label>
                   <input 
                     type="number"
                     value={amount}
                     onChange={(e) => setAmount(e.target.value)}
                     className="w-full border border-gray-200 rounded p-2 text-xs font-medium focus:border-[#0b1031] focus:outline-none"
                     placeholder="100"
                   />
                 </div>
                 
                 {activeTab === 'INSTANT' ? (
                   <div>
                     <label className="block text-[11px] font-black text-[#0b1031] mb-1.5">Payment Mode *</label>
                     <div className="relative">
                       <button
                         type="button"
                         onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                         className="w-full flex items-center justify-between border border-gray-200 rounded p-2 text-xs font-medium focus:border-[#0b1031] focus:outline-none bg-white text-left"
                       >
                         <span>{PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label || '-Select-'}</span>
                         <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                         </svg>
                       </button>

                       {isDropdownOpen && (
                         <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg overflow-hidden">
                           {PAYMENT_METHODS.map(mode => (
                             <div 
                               key={mode.id}
                               onClick={() => { if(!mode.disabled) { setPaymentMethod(mode.id); setIsDropdownOpen(false); } }}
                               className={`px-3 py-2 text-xs flex justify-between items-center ${mode.disabled ? 'cursor-not-allowed bg-gray-50 text-gray-400' : 'cursor-pointer ' + (paymentMethod === mode.id ? 'bg-[#1965d6] text-white' : 'text-[#0b1031] hover:bg-[#1965d6] hover:text-white')}`}
                             >
                               <span>{mode.label}</span>
                               {mode.disabled && <span className="text-[9px] text-red-500 font-bold">Temporarily Unavailable</span>}
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                   </div>
                 ) : (
                   <div>
                     <label className="block text-[11px] font-black text-[#0b1031] mb-1.5">Payment Mode *</label>
                     <div className="relative">
                       <button
                         type="button"
                         onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                         className="w-full flex items-center justify-between border border-gray-200 rounded p-2 text-xs font-medium focus:border-[#0b1031] focus:outline-none bg-white text-left"
                       >
                         <span>{offlinePaymentMode === 'CASH_DEPOSIT' ? 'Cash Deposit' : offlinePaymentMode || '-Select-'}</span>
                         <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                         </svg>
                       </button>

                       {isDropdownOpen && (
                         <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg overflow-hidden">
                           <div 
                             onClick={() => { setOfflinePaymentMode(''); setIsDropdownOpen(false); }}
                             className={`px-3 py-2 text-xs cursor-pointer ${offlinePaymentMode === '' ? 'bg-[#1965d6] text-white' : 'text-[#0b1031] hover:bg-[#1965d6] hover:text-white'}`}
                           >
                             -Select-
                           </div>
                           {(activeTab === 'NET_TRANSFER') && (
                             <>
                               {['NEFT', 'RTGS', 'IMPS'].map(mode => (
                                 <div 
                                   key={mode}
                                   onClick={() => { setOfflinePaymentMode(mode); setIsDropdownOpen(false); }}
                                   className={`px-3 py-2 text-xs cursor-pointer ${offlinePaymentMode === mode ? 'bg-[#1965d6] text-white' : 'text-[#0b1031] hover:bg-[#1965d6] hover:text-white'}`}
                                 >
                                   {mode}
                                 </div>
                               ))}
                             </>
                           )}
                           {activeTab === 'CASH' && (
                             <div 
                               onClick={() => { setOfflinePaymentMode('CASH_DEPOSIT'); setIsDropdownOpen(false); }}
                               className={`px-3 py-2 text-xs cursor-pointer ${offlinePaymentMode === 'CASH_DEPOSIT' ? 'bg-[#1965d6] text-white' : 'text-[#0b1031] hover:bg-[#1965d6] hover:text-white'}`}
                             >
                               Cash Deposit
                             </div>
                           )}
                           {activeTab === 'CHEQUE' && (
                             <div 
                               onClick={() => { setOfflinePaymentMode('CHEQUE'); setIsDropdownOpen(false); }}
                               className={`px-3 py-2 text-xs cursor-pointer ${offlinePaymentMode === 'CHEQUE' ? 'bg-[#1965d6] text-white' : 'text-[#0b1031] hover:bg-[#1965d6] hover:text-white'}`}
                             >
                               Cheque
                             </div>
                           )}
                           {activeTab === 'OTHER' && (
                             <div 
                               onClick={() => { setOfflinePaymentMode('OTHER'); setIsDropdownOpen(false); }}
                               className={`px-3 py-2 text-xs cursor-pointer ${offlinePaymentMode === 'OTHER' ? 'bg-[#1965d6] text-white' : 'text-[#0b1031] hover:bg-[#1965d6] hover:text-white'}`}
                             >
                               Other
                             </div>
                           )}
                         </div>
                       )}
                     </div>
                   </div>
                 )}
                 
                 <div>
                   <label className="block text-[11px] font-black text-[#0b1031] mb-1.5">Remarks</label>
                   <input 
                     type="text"
                     value={remarks}
                     onChange={(e) => setRemarks(e.target.value)}
                     className="w-full border border-gray-200 rounded p-2 text-xs font-medium focus:border-[#0b1031] focus:outline-none"
                     placeholder="Optional"
                   />
                 </div>
                  
                  {activeTab === 'WITHDRAW_FUNDS' && (
                    <div className="md:col-span-3">
                      <label className="block text-[11px] font-black text-[#0b1031] mb-1.5">Bank Details (Account No, IFSC, Bank Name) *</label>
                      <textarea 
                        value={bankDetails}
                        onChange={(e) => setBankDetails(e.target.value)}
                        className="w-full border border-gray-200 rounded p-2 text-xs font-medium focus:border-[#0b1031] focus:outline-none min-h-[60px]"
                        placeholder="Please provide your full bank details for the withdrawal..."
                      />
                    </div>
                  )}
                  
                  {activeTab !== 'INSTANT' && activeTab !== 'WITHDRAW_FUNDS' && (
                   <>
                     <div>
                       <label className="block text-[11px] font-black text-[#0b1031] mb-1.5">
                         {activeTab === 'CHEQUE' ? 'Cheque Number *' : activeTab === 'CASH' ? 'Deposit Slip / Reference Number *' : 'Reference / Confirmation Number *'}
                       </label>
                       <input 
                         type="text"
                         value={activeTab === 'CHEQUE' ? chequeNumber : referenceNumber}
                         onChange={(e) => activeTab === 'CHEQUE' ? setChequeNumber(e.target.value) : setReferenceNumber(e.target.value)}
                         className="w-full border border-gray-200 rounded p-2 text-xs font-medium focus:border-[#0b1031] focus:outline-none"
                         placeholder="Alphanumeric, max 20 chars"
                       />
                     </div>
                     <div>
                       <label className="block text-[11px] font-black text-[#0b1031] mb-1.5">Deposited Bank *</label>
                       <input 
                         type="text"
                         value={depositedBank}
                         onChange={(e) => setDepositedBank(e.target.value)}
                         className="w-full border border-gray-200 rounded p-2 text-xs font-medium focus:border-[#0b1031] focus:outline-none"
                         placeholder="Digits only or Bank Name"
                       />
                     </div>
                     <div>
                       <label className="block text-[11px] font-black text-[#0b1031] mb-1.5">Deposited Account No. *</label>
                       <input 
                         type="text"
                         value={depositedAccountNo}
                         onChange={(e) => setDepositedAccountNo(e.target.value)}
                         className="w-full border border-gray-200 rounded p-2 text-xs font-medium focus:border-[#0b1031] focus:outline-none"
                         placeholder="Digits only"
                       />
                     </div>
                   </>
                 )}
               </div>

               <div className="flex justify-center pt-4">
                 <button
                   onClick={handleOfflineTopUp}
                   disabled={loading}
                   className="bg-[#0b1031] text-white font-bold text-xs px-10 py-2.5 rounded-full hover:bg-blue-900 transition-colors disabled:opacity-50"
                 >
                   {loading ? 'Processing...' : 'Submit'}
                 </button>
               </div>
            </div>
          </div>

          {/* My Offline Top-Up Requests Table */}
          {myOfflineRequests.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-[13px] font-black text-[#0b1031] uppercase tracking-wider">MY WALLET REQUESTS (TOP-UPS & WITHDRAWALS)</h2>
                <button 
                  onClick={fetchMyRequests} // Can update this to fetch both if needed later
                  disabled={refreshingRequests}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-[#0b1031] transition-colors disabled:opacity-50"
                  title="Refresh Requests"
                >
                  <RefreshCw size={14} className={refreshingRequests ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white text-gray-500 font-bold uppercase border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Mode</th>
                      <th className="px-6 py-3">Ref/Cheque</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                      <th className="px-6 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {myOfflineRequests.map(req => (
                      <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 font-medium text-gray-600">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3 font-bold text-[#0b1031]">
                          {req.paymentMode}
                        </td>
                        <td className="px-6 py-3 font-mono text-gray-500">
                          {req.referenceNumber || req.chequeNumber || '-'}
                        </td>
                        <td className="px-6 py-3 text-right font-black text-blue-600">
                          ₹{req.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-3 text-center">
                          {req.status === 'PENDING' && <span className="inline-block px-2 py-1 bg-yellow-50 text-yellow-600 rounded text-[10px] font-bold">PENDING</span>}
                          {req.status === 'APPROVED' && <span className="inline-block px-2 py-1 bg-green-50 text-green-600 rounded text-[10px] font-bold">APPROVED</span>}
                          {req.status === 'REJECTED' && <span className="inline-block px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] font-bold">REJECTED</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Transactions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 h-full max-h-[800px] overflow-hidden flex flex-col">
            <h2 className="text-lg font-black text-[#0c1a40] mb-6 flex items-center justify-between">
              Recent Transactions
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {pageLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 md:p-4 hover:bg-gray-50 rounded-xl transition cursor-pointer border border-transparent hover:border-gray-200">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 animate-pulse"></div>
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
                <div className="text-center py-10 md:py-16">
                  <Banknote size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-500 font-bold">No transactions yet</p>
                </div>
              ) : (
                transactions.map((t, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedTransaction(t)}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer border border-transparent hover:border-gray-200"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold ${t.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {t.type === 'CREDIT' ? '+' : '-'}
                      </div>
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="font-bold text-[14px] text-[#0c1a40] leading-tight mb-1" title={t.description}>{t.description}</p>
                        <p className="text-[11px] text-gray-500 font-bold">{new Date(t.date).toLocaleDateString()} • {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-black text-[15px] ${t.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.type === 'CREDIT' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                      </p>
                      {t.paymentMethod && <p className="text-[10px] font-black text-gray-400 uppercase mt-0.5">{t.paymentMethod}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c1a40]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-black text-xl text-[#0c1a40]">Transaction Details</h3>
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
                  <p className={`text-4xl font-black ${selectedTransaction.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {selectedTransaction.type === 'CREDIT' ? '+' : '-'}₹{selectedTransaction.amount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-400 font-bold mt-2">
                    {new Date(selectedTransaction.date).toLocaleDateString()} at {new Date(selectedTransaction.date).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
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
                className="px-6 py-2 bg-[#0c1a40] text-white font-bold rounded-lg hover:bg-blue-900 transition"
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
