import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, setCredentials } from '../../../store/authSlice';
import TopNavbar from '../../../components/layout/TopNavbar';
import Dropdown from '../../../components/ui/Dropdown';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { 
  Wallet, CreditCard, Banknote, ShieldCheck, RefreshCw, 
  ArrowUpRight, ArrowDownLeft, CheckCircle2, Copy, X,
  Filter, Calendar, RotateCcw, AlertCircle
} from 'lucide-react';

const MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const YEARS = ['2026', '2025', '2024'];

const TRANSACTION_TYPES = [
  { id: 'ALL', label: 'All Types' },
  { id: 'REFUND', label: 'Refunds' },
  { id: 'CREDIT', label: 'Credits (Top-up)' },
  { id: 'DEBIT', label: 'Debits (Bookings)' },
  { id: 'FAILED', label: 'Failed' },
];

// Extend window for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function WalletPage() {
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const now = new Date();
  const currentMonthNum = String(now.getMonth() + 1);
  const currentYearNum = String(now.getFullYear());

  const [walletBalance, setWalletBalance] = useState(currentUser?.walletBalance || 0);
  const [amount, setAmount] = useState<string>('500');
  const [paymentMethod, setPaymentMethod] = useState<string>('CC');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

  // Filters State: Month & Year (Default to current) and Type (Default to 'ALL')
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthNum);
  const [selectedYear, setSelectedYear] = useState<string>(currentYearNum);
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const isSubmittingRef = useRef(false);

  const PAYMENT_METHODS = [
    { id: 'UPI', label: 'UPI', fee: 0, disabled: true },
    { id: 'CC', label: 'Credit / Debit Card', fee: 2 },
    { id: 'NB', label: 'Netbanking', fee: 2 }
  ];

  useEffect(() => {
    fetchWallet();
  }, []);

  const monthOptions = useMemo(() => [
    { value: 'ALL', label: 'All Months' },
    ...MONTHS.map(m => ({ value: m.value, label: m.label }))
  ], []);

  const yearOptions = useMemo(() => [
    { value: 'ALL', label: 'All' },
    ...YEARS.map(y => ({ value: y, label: y }))
  ], []);

  const typeOptions = useMemo(() => 
    TRANSACTION_TYPES.map(t => ({ value: t.id, label: t.label })),
  []);

  // Instant reactive filtering on transactions list
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // 1. Month & Year filter
      if (t.date) {
        const d = new Date(t.date);
        if (selectedYear !== 'ALL' && d.getFullYear().toString() !== selectedYear) {
          return false;
        }
        if (selectedMonth !== 'ALL' && (d.getMonth() + 1).toString() !== selectedMonth) {
          return false;
        }
      }

      // 2. Type filter
      const desc = (t.description || '').toLowerCase();
      const isRefund = desc.includes('refund');
      const isFailed = desc.includes('fail') || t.status === 'FAILED';
      const isCredit = t.type === 'CREDIT';
      const isDebit = t.type === 'DEBIT';

      if (selectedType === 'REFUND') {
        if (!isRefund) return false;
      } else if (selectedType === 'CREDIT') {
        if (!isCredit || isRefund) return false;
      } else if (selectedType === 'DEBIT') {
        if (!isDebit) return false;
      } else if (selectedType === 'FAILED') {
        if (!isFailed) return false;
      }

      return true;
    });
  }, [transactions, selectedMonth, selectedYear, selectedType]);

  const fetchWallet = async () => {
    setPageLoading(true);
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
      toast.error('Failed to load transactions');
    } finally {
      setPageLoading(false);
    }
  };

  const calculateSurcharge = (amt: number) => {
    return paymentMethod === 'UPI' ? 0 : amt * 0.02;
  };

  const handleTopUp = async () => {
    if (isSubmittingRef.current || loading) return;
    isSubmittingRef.current = true;

    const topUpAmount = Number(amount);
    if (!topUpAmount || topUpAmount <= 0) {
      toast.error('Please enter a valid amount');
      isSubmittingRef.current = false;
      return;
    }

    setLoading(true);
    try {
      // 1. Create Order
      const { data: orderData } = await api.post('/api/wallet/create-order', {
        amount: topUpAmount,
        paymentMethod
      });

      const rzpKey = orderData?.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || '';
      if (!rzpKey) {
        toast.error('Payment gateway configuration is missing.');
        setLoading(false);
        return;
      }

      // 2. Initialize Razorpay
      const options = {
        key: rzpKey,
        amount: orderData.amount * 100, // in paise
        currency: orderData.currency,
        name: 'TrippeChalo India Wallet',
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
          } finally {
            isSubmittingRef.current = false;
          }
        },
        modal: {
          ondismiss: function () {
            isSubmittingRef.current = false;
            setLoading(false);
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
        isSubmittingRef.current = false;
        toast.error(response.error.description || 'Payment failed');
      });
      rzp.open();

    } catch (err: any) {
      isSubmittingRef.current = false;
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
      
      <div className="relative z-10 w-full pt-32 max-w-7xl mx-auto px-6">
        
        <div className="text-white mb-8 flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-400/30">
            <Wallet size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black">My Wallet</h1>
            <p className="text-blue-100 font-medium">Manage your balance & transactions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Top Up */}
          <div className="lg:col-span-7 space-y-6">
            
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
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 h-[550px] lg:h-full lg:max-h-[800px] flex flex-col relative">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-black text-gray-900">Recent Transactions</h2>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">Click any transaction to view full details</p>
                </div>
                <button 
                  onClick={() => fetchWallet()}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                  title="Refresh Transactions"
                >
                  <RefreshCw size={15} className={pageLoading ? 'animate-spin text-blue-600' : ''} />
                </button>
              </div>

              {/* Filter Controls: Date (Month & Year) + Type */}
              <div className="bg-gray-50/90 rounded-xl p-3 border border-gray-200/70 mb-3 space-y-2 shrink-0 relative z-30">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  {/* Month */}
                  <div className="sm:col-span-5 relative z-30">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar size={11} className="text-gray-400" />
                      <span>Month</span>
                    </label>
                    <Dropdown
                      value={selectedMonth}
                      onChange={setSelectedMonth}
                      options={monthOptions}
                      placeholder="Select Month"
                    />
                  </div>

                  {/* Year */}
                  <div className="sm:col-span-3 relative z-30">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Year
                    </label>
                    <Dropdown
                      value={selectedYear}
                      onChange={setSelectedYear}
                      options={yearOptions}
                      placeholder="Year"
                    />
                  </div>

                  {/* Type */}
                  <div className="sm:col-span-4 relative z-30">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Filter size={11} className="text-gray-400" />
                      <span>Type</span>
                    </label>
                    <Dropdown
                      value={selectedType}
                      onChange={setSelectedType}
                      options={typeOptions}
                      placeholder="All Types"
                    />
                  </div>
                </div>

                {/* Filter info & Reset */}
                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1.5 border-t border-gray-200/50">
                  <span className="font-medium">
                    Found <strong className="text-gray-900 font-bold">{filteredTransactions.length}</strong> record{filteredTransactions.length === 1 ? '' : 's'}
                  </span>
                  {(selectedMonth !== 'ALL' || selectedYear !== 'ALL' || selectedType !== 'ALL') && (
                    <button
                      onClick={() => {
                        setSelectedMonth('ALL');
                        setSelectedYear('ALL');
                        setSelectedType('ALL');
                      }}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold hover:underline transition cursor-pointer"
                    >
                      <RotateCcw size={10} />
                      <span>Reset Filters</span>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 relative z-10 custom-scrollbar">
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
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-10">
                    <Banknote size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-800 font-bold">No transactions found</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                      No records match for {selectedMonth !== 'ALL' ? `${MONTHS.find(m => m.value === selectedMonth)?.label} ` : ''}{selectedYear !== 'ALL' ? selectedYear : ''}{selectedType !== 'ALL' ? ` (${TRANSACTION_TYPES.find(t => t.id === selectedType)?.label})` : ''}.
                    </p>
                    {(selectedMonth !== 'ALL' || selectedYear !== 'ALL' || selectedType !== 'ALL') && (
                      <button
                        onClick={() => {
                          setSelectedMonth('ALL');
                          setSelectedYear('ALL');
                          setSelectedType('ALL');
                        }}
                        className="mt-3 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5"
                      >
                        <RotateCcw size={12} />
                        <span>View All Transactions</span>
                      </button>
                    )}
                  </div>
                ) : (
                  filteredTransactions.map((t, idx) => {
                    const isRefund = t.description?.toLowerCase().includes('refund');
                    const isFailed = t.description?.toLowerCase().includes('fail') || t.status === 'FAILED';
                    const isCredit = t.type === 'CREDIT';

                    return (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedTransaction(t)}
                        className="group p-3.5 bg-gray-50/80 hover:bg-blue-50/50 rounded-xl transition-all duration-200 cursor-pointer border border-gray-100 hover:border-blue-200 hover:shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-sm mt-0.5 ${
                              isFailed
                                ? 'bg-amber-100 text-amber-700'
                                : isRefund
                                  ? 'bg-blue-100 text-blue-700'
                                  : isCredit 
                                    ? 'bg-emerald-100 text-emerald-700' 
                                    : 'bg-rose-100 text-rose-700'
                            }`}>
                              {isFailed ? (
                                <AlertCircle size={18} />
                              ) : isRefund ? (
                                <RotateCcw size={16} />
                              ) : isCredit ? (
                                <ArrowDownLeft size={18} />
                              ) : (
                                <ArrowUpRight size={18} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-gray-900 leading-snug group-hover:text-blue-600 transition-colors break-words">
                                {t.description || (isCredit ? 'Wallet Top-up' : 'Wallet Debit')}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className="text-[11px] text-gray-500 font-medium">
                                  {new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {t.pnr && (
                                  <span className="text-[10px] font-bold bg-white text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 uppercase">
                                    PNR: {t.pnr}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0 pl-2">
                            <p className={`font-black text-base whitespace-nowrap ${
                              isFailed
                                ? 'text-amber-600'
                                : isCredit
                                  ? 'text-emerald-600'
                                  : 'text-rose-600'
                            }`}>
                              {isCredit ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                            </p>
                            <span className={`inline-block text-[10px] font-extrabold px-1.5 py-0.5 rounded mt-1 uppercase ${
                              isRefund 
                                ? 'bg-blue-100 text-blue-700' 
                                : isFailed
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-gray-200/60 text-gray-600'
                            }`}>
                              {isRefund ? 'REFUND' : isFailed ? 'FAILED' : (t.paymentMethod || 'WALLET')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modern Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedTransaction.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {selectedTransaction.type === 'CREDIT' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <h3 className="font-black text-lg text-gray-900">Transaction Details</h3>
              </div>
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Highlight Amount Banner */}
              <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100 text-center">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 ${
                  selectedTransaction.type === 'CREDIT' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {selectedTransaction.type === 'CREDIT' ? 'Funds Credited' : 'Funds Debited'}
                </span>
                <p className={`text-4xl font-black ${selectedTransaction.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedTransaction.type === 'CREDIT' ? '+' : '-'}₹{selectedTransaction.amount.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-500 font-semibold mt-2">
                  {new Date(selectedTransaction.date).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} at {new Date(selectedTransaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>

              {/* Detail Rows */}
              <div className="divide-y divide-gray-100 text-sm">
                <div className="py-3 flex justify-between items-start gap-4">
                  <span className="text-gray-500 font-medium shrink-0">Description</span>
                  <span className="font-bold text-gray-900 text-right break-words">{selectedTransaction.description}</span>
                </div>
                
                <div className="py-3 flex justify-between items-center gap-4">
                  <span className="text-gray-500 font-medium shrink-0">Payment Mode</span>
                  <span className="font-bold text-gray-900 uppercase bg-gray-100 px-2 py-0.5 rounded text-xs">
                    {selectedTransaction.paymentMethod || 'WALLET'}
                  </span>
                </div>

                {selectedTransaction.pnr && (
                  <div className="py-3 flex justify-between items-center gap-4">
                    <span className="text-gray-500 font-medium shrink-0">Flight PNR</span>
                    <span className="font-black text-blue-600 uppercase tracking-wider font-mono bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                      {selectedTransaction.pnr}
                    </span>
                  </div>
                )}

                {selectedTransaction.referenceNo && (
                  <div className="py-3 flex justify-between items-center gap-4">
                    <span className="text-gray-500 font-medium shrink-0">Booking Reference</span>
                    <span className="font-mono text-xs font-bold text-gray-800 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                      {selectedTransaction.referenceNo}
                    </span>
                  </div>
                )}

                {selectedTransaction.surcharge > 0 && (
                  <div className="py-3 flex justify-between items-center gap-4">
                    <span className="text-gray-500 font-medium shrink-0">Convenience Fee</span>
                    <span className="font-bold text-gray-900">₹{selectedTransaction.surcharge}</span>
                  </div>
                )}
                
                {selectedTransaction.razorpayPaymentId && (
                  <div className="py-3 flex justify-between items-center gap-4">
                    <span className="text-gray-500 font-medium shrink-0">Payment ID</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">
                        {selectedTransaction.razorpayPaymentId}
                      </span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(selectedTransaction.razorpayPaymentId);
                          toast.success('Copied Payment ID');
                        }}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 transition"
                        title="Copy Payment ID"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="py-3 flex justify-between items-center gap-4">
                  <span className="text-gray-500 font-medium shrink-0">Status</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 size={13} /> Successful
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="px-6 py-2.5 bg-[#0b1031] hover:bg-blue-900 text-white font-bold text-sm rounded-xl transition shadow-sm"
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
