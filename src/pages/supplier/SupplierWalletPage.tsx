import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, setCredentials } from '../../store/authSlice';
import Dropdown from '../../components/ui/Dropdown';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Wallet, ShieldCheck, RefreshCw, 
  ArrowUpRight, ArrowDownLeft, CheckCircle2, Copy, X,
  Filter, Calendar, RotateCcw, AlertCircle, Building2,
  DollarSign, Download, ArrowRight, CreditCard, ChevronRight,
  TrendingDown, TrendingUp, Layers
} from 'lucide-react';
import { format } from 'date-fns';
import { exportToCSV } from '../../utils/exportToCSV';

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
  { id: 'ALL', label: 'All Transactions' },
  { id: 'DEBIT', label: 'Deductions (Bookings & Charges)' },
  { id: 'CREDIT', label: 'Credits (Top-ups & Inflow)' },
  { id: 'REFUND', label: 'Refunds & Reversals' },
  { id: 'WITHDRAWAL', label: 'Withdrawals & Payouts' },
];

export default function SupplierWalletPage() {
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const [walletBalance, setWalletBalance] = useState<number>(
    currentUser?.walletBalance ?? currentUser?.balance ?? 0
  );
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const now = new Date();
  const currentMonthNum = String(now.getMonth() + 1);
  const currentYearNum = String(now.getFullYear());

  // Filters State: Defaults to current month & year, type 'ALL'
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthNum);
  const [selectedYear, setSelectedYear] = useState<string>(currentYearNum);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Top-Up & Payout Tabs
  const [activeActionTab, setActiveActionTab] = useState<'TOPUP' | 'WITHDRAW' | 'OFFLINE'>('TOPUP');
  const [topUpAmount, setTopUpAmount] = useState('5000');
  const [paymentMethod, setPaymentMethod] = useState('CC');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    confirmAccountNumber: '',
    ifsc: '',
    bankName: '',
    holderName: currentUser?.name || currentUser?.companyName || ''
  });
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

  const isSubmittingRef = useRef(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    setPageLoading(true);
    try {
      const { data } = await api.get('/api/wallet');
      setWalletBalance(data.balance ?? 0);
      setTransactions(data.transactions || []);
      if (currentUser && currentUser.walletBalance !== data.balance) {
        const token = localStorage.getItem('token');
        if (token) {
          dispatch(setCredentials({ user: { ...currentUser, walletBalance: data.balance }, token }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch supplier wallet', error);
      toast.error('Failed to load wallet data');
    } finally {
      setPageLoading(false);
    }
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // 1. Year filter
      if (selectedYear !== 'ALL' && t.date) {
        const d = new Date(t.date);
        if (d.getFullYear().toString() !== selectedYear) return false;
      }

      // 2. Month filter
      if (selectedMonth !== 'ALL' && t.date) {
        const d = new Date(t.date);
        if ((d.getMonth() + 1).toString() !== selectedMonth) return false;
      }

      // 3. Type filter
      const desc = (t.description || '').toLowerCase();
      const isRefund = desc.includes('refund') || desc.includes('reversal');
      const isWithdrawal = desc.includes('withdrawal') || t.paymentMethod === 'BANK_TRANSFER';
      const isCredit = t.type === 'CREDIT';
      const isDebit = t.type === 'DEBIT';

      if (selectedType === 'REFUND') {
        if (!isRefund) return false;
      } else if (selectedType === 'WITHDRAWAL') {
        if (!isWithdrawal) return false;
      } else if (selectedType === 'CREDIT') {
        if (!isCredit || isRefund) return false;
      } else if (selectedType === 'DEBIT') {
        if (!isDebit) return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchDesc = desc.includes(q);
        const matchRef = (t.referenceNo || '').toLowerCase().includes(q);
        const matchPnr = (t.pnr || '').toLowerCase().includes(q);
        const matchAmt = (t.amount || '').toString().includes(q);
        if (!matchDesc && !matchRef && !matchPnr && !matchAmt) return false;
      }

      return true;
    });
  }, [transactions, selectedMonth, selectedYear, selectedType, searchQuery]);

  // Financial KPI Metrics - Dynamically calculated from filtered transactions
  const metrics = useMemo(() => {
    let totalInflow = 0;
    let totalDeductions = 0;

    filteredTransactions.forEach(t => {
      if (t.type === 'CREDIT') {
        totalInflow += (t.amount || 0);
      } else if (t.type === 'DEBIT') {
        totalDeductions += (t.amount || 0);
      }
    });

    return { totalInflow, totalDeductions };
  }, [filteredTransactions]);

  // Online Razorpay Topup Handler
  const handleTopUp = async () => {
    if (isSubmittingRef.current || loading) return;
    const amt = Number(topUpAmount);
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid top-up amount');
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const { data: orderData } = await api.post('/api/wallet/create-order', {
        amount: amt,
        paymentMethod
      });

      const rzpKey = orderData?.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || '';
      if (!rzpKey) {
        toast.error('Payment gateway configuration is missing.');
        setLoading(false);
        isSubmittingRef.current = false;
        return;
      }

      const options = {
        key: rzpKey,
        amount: orderData.amount * 100,
        currency: orderData.currency || 'INR',
        name: 'TrippeChalo Supplier Wallet',
        description: 'Supplier Account Top-up',
        image: '/tg-favicon.svg',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            toast.loading('Verifying deposit...', { id: 'verify' });
            await api.post('/api/wallet/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              baseAmount: orderData.baseAmount,
              surcharge: orderData.surcharge,
              paymentMethod
            });

            toast.success('Wallet topped up successfully!', { id: 'verify' });
            fetchWallet();
          } catch (err: any) {
            toast.error(err.response?.data?.message || 'Verification failed', { id: 'verify' });
          } finally {
            isSubmittingRef.current = false;
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            isSubmittingRef.current = false;
            setLoading(false);
          }
        },
        prefill: {
          name: currentUser?.name || currentUser?.companyName || '',
          email: currentUser?.email || '',
          contact: currentUser?.phone || ''
        },
        theme: {
          color: '#0b1031'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (res: any) {
        isSubmittingRef.current = false;
        setLoading(false);
        toast.error(res.error?.description || 'Payment failed');
      });
      rzp.open();
    } catch (err: any) {
      isSubmittingRef.current = false;
      setLoading(false);
      toast.error(err.response?.data?.message || 'Failed to initiate top-up');
    }
  };

  // Withdrawal Request Handler
  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }
    if (amt > walletBalance) {
      toast.error(`Insufficient balance. Maximum available is ₹${walletBalance.toLocaleString('en-IN')}`);
      return;
    }
    if (!bankDetails.accountNumber || !bankDetails.ifsc || !bankDetails.bankName) {
      toast.error('Please fill all mandatory bank account fields');
      return;
    }
    if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
      toast.error('Bank account numbers do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/wallet/withdrawal-request', {
        amount: amt,
        bankDetails: {
          accountNumber: bankDetails.accountNumber,
          ifsc: bankDetails.ifsc.toUpperCase(),
          bankName: bankDetails.bankName,
          holderName: bankDetails.holderName
        }
      });
      toast.success('Withdrawal request submitted for Admin approval!');
      setWithdrawAmount('');
      fetchWallet();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!filteredTransactions.length) {
      toast.error('No transactions available to export');
      return;
    }
    const exportData = filteredTransactions.map(t => ({
      'Date': t.date ? format(new Date(t.date), 'yyyy-MM-dd HH:mm:ss') : '',
      'Type': t.type,
      'Amount': t.amount,
      'Description': t.description,
      'Payment Method': t.paymentMethod || 'WALLET',
      'Reference No': t.referenceNo || '',
      'PNR': t.pnr || ''
    }));
    exportToCSV(exportData, `Supplier_Ledger_${format(new Date(), 'yyyyMMdd_HHmm')}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb & Quick Sync */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b1031] text-white p-5 rounded-2xl shadow-xl border border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-400/30 text-blue-400 shrink-0">
            <Wallet size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase">Supplier Financial Ledger</h1>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Live Wallet
              </span>
            </div>
            <p className="text-xs text-blue-200/70 font-medium mt-0.5">
              {currentUser?.companyName || currentUser?.name || 'Verified Supplier'} • Real-time Account Deductions & Inflow
            </p>
          </div>
        </div>

        <button 
          onClick={fetchWallet}
          disabled={pageLoading}
          className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-bold text-white px-4 py-2.5 rounded-xl border border-white/10 transition shadow-sm shrink-0"
        >
          <RefreshCw size={14} className={pageLoading ? 'animate-spin text-blue-400' : ''} />
          <span>Sync Balance</span>
        </button>
      </div>

      {/* 4 Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Available Balance Card */}
        <div className="bg-[#161c3f] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Available Balance</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
            ₹{walletBalance.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-400 font-medium mt-2 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            100% Real-time Available
          </p>
        </div>

        {/* Total Deductions (Debits) */}
        <div className="bg-[#161c3f] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Deductions</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight">
            -₹{metrics.totalDeductions.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-400 font-medium mt-2">
            {selectedMonth !== 'ALL' || selectedYear !== 'ALL' ? 'For filtered period' : 'Bookings, Charter blocks & Charges'}
          </p>
        </div>

        {/* Total Inflow (Credits) */}
        <div className="bg-[#161c3f] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Inflow</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 tracking-tight">
            +₹{metrics.totalInflow.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-400 font-medium mt-2">
            {selectedMonth !== 'ALL' || selectedYear !== 'ALL' ? 'For filtered period' : 'Deposits, Top-ups & Settlements'}
          </p>
        </div>

        {/* Ledger Records Count */}
        <div className="bg-[#161c3f] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Operations</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Layers size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {filteredTransactions.length} Records
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-medium">
              {filteredTransactions.length === transactions.length ? 'All records' : `Filtered from ${transactions.length} total`}
            </span>
            <button 
              onClick={handleExportCSV}
              className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
            >
              <Download size={12} /> Export CSV
            </button>
          </div>
        </div>

      </div>

      {/* Main Grid: Left Column Actions (Add Funds / Payout) & Right Column Detailed Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Top-Up & Payout Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-[#161c3f] border border-white/10 rounded-2xl p-6 shadow-xl text-white">
            
            {/* Action Tabs Header */}
            <div className="flex rounded-xl bg-[#0b1031] p-1 border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => setActiveActionTab('TOPUP')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeActionTab === 'TOPUP' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Top-Up Wallet
              </button>
              <button
                type="button"
                onClick={() => setActiveActionTab('WITHDRAW')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeActionTab === 'WITHDRAW' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Request Payout
              </button>
              <button
                type="button"
                onClick={() => setActiveActionTab('OFFLINE')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeActionTab === 'OFFLINE' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Bank Details
              </button>
            </div>

            {/* TAB 1: Instant Top-Up */}
            {activeActionTab === 'TOPUP' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">Deposit Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₹</span>
                    <input 
                      type="number"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full bg-[#0b1031] border border-white/15 rounded-xl py-3 pl-10 pr-4 text-xl font-black text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Quick Pre-select chips */}
                <div className="flex flex-wrap gap-2">
                  {['2000', '5000', '10000', '25000', '50000'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTopUpAmount(val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                        topUpAmount === val 
                          ? 'bg-blue-500/20 border-blue-400 text-blue-300' 
                          : 'bg-[#0b1031] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      +₹{Number(val).toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                {/* Payment Channel */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CC')}
                      className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                        paymentMethod === 'CC' 
                          ? 'border-blue-500 bg-blue-500/10 text-white' 
                          : 'border-white/10 bg-[#0b1031] text-gray-400 hover:text-white'
                      }`}
                    >
                      <CreditCard size={18} className="text-blue-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold leading-tight">Card / NetBanking</p>
                        <p className="text-[10px] text-gray-400">Instant Gateway</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                        paymentMethod === 'UPI' 
                          ? 'border-blue-500 bg-blue-500/10 text-white' 
                          : 'border-white/10 bg-[#0b1031] text-gray-400 hover:text-white'
                      }`}
                    >
                      <Building2 size={18} className="text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold leading-tight">UPI / QR Code</p>
                        <p className="text-[10px] text-gray-400">Zero surcharge</p>
                      </div>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTopUp}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 text-sm mt-4 cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <>
                      <span>Deposit ₹{Number(topUpAmount || 0).toLocaleString('en-IN')} to Wallet</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB 2: Request Payout / Withdrawal */}
            {activeActionTab === 'WITHDRAW' && (
              <form onSubmit={handleWithdrawalRequest} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-gray-300">Withdrawal Amount</label>
                    <span className="text-[10px] text-emerald-400 font-bold">Max: ₹{walletBalance.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₹</span>
                    <input 
                      type="number"
                      required
                      max={walletBalance}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Enter amount to withdraw"
                      className="w-full bg-[#0b1031] border border-white/15 rounded-xl py-3 pl-10 pr-4 text-lg font-black text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Account Holder Name *</label>
                  <input 
                    type="text"
                    required
                    value={bankDetails.holderName}
                    onChange={(e) => setBankDetails({ ...bankDetails, holderName: e.target.value })}
                    className="w-full bg-[#0b1031] border border-white/15 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Account Number *</label>
                    <input 
                      type="password"
                      required
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                      className="w-full bg-[#0b1031] border border-white/15 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Confirm Account *</label>
                    <input 
                      type="text"
                      required
                      value={bankDetails.confirmAccountNumber}
                      onChange={(e) => setBankDetails({ ...bankDetails, confirmAccountNumber: e.target.value })}
                      className="w-full bg-[#0b1031] border border-white/15 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">IFSC Code *</label>
                    <input 
                      type="text"
                      required
                      value={bankDetails.ifsc}
                      onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value.toUpperCase() })}
                      placeholder="e.g. HDFC0001234"
                      className="w-full bg-[#0b1031] border border-white/15 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500 uppercase font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Bank Name *</label>
                    <input 
                      type="text"
                      required
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                      placeholder="e.g. HDFC Bank"
                      className="w-full bg-[#0b1031] border border-white/15 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm mt-3"
                >
                  {loading ? <RefreshCw size={16} className="animate-spin" /> : 'Submit Payout Request'}
                </button>
              </form>
            )}

            {/* TAB 3: Offline Deposit Bank Details */}
            {activeActionTab === 'OFFLINE' && (
              <div className="space-y-4">
                <p className="text-xs text-gray-300">
                  Transfer funds directly to TrippeChalo India's official nodal account via NEFT / RTGS / IMPS:
                </p>

                <div className="bg-[#0b1031] p-4 rounded-xl border border-white/10 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Account Name:</span>
                    <span className="font-bold text-white">TRIPPECHALO INDIA PVT LTD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Account Number:</span>
                    <span className="font-mono font-bold text-emerald-400">50200088921443</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bank Name:</span>
                    <span className="font-bold text-white">HDFC Bank Ltd</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">IFSC Code:</span>
                    <span className="font-mono font-bold text-blue-400">HDFC0000043</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Branch:</span>
                    <span className="font-bold text-white">Connaught Place, New Delhi</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-200 flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-400" />
                  <span>After depositing, please submit UTR in the Top-up queue or WhatsApp support with payment slip.</span>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Ledger Feed & Interactive Filters (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200">
            
            {/* Header with Search and Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                  Transaction & Deduction History
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Showing {filteredTransactions.length} of {transactions.length} records
                </p>
              </div>

              {/* Instant Search input */}
              <div className="w-full sm:w-60">
                <input 
                  type="text"
                  placeholder="Search PNR, Reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Custom Dropdown Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              
              {/* Month Dropdown */}
              <div>
                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Month</span>
                <Dropdown 
                  value={selectedMonth}
                  onChange={setSelectedMonth}
                  options={[
                    { value: 'ALL', label: 'All Months' },
                    ...MONTHS.map(m => ({ value: m.value, label: m.label }))
                  ]}
                />
              </div>

              {/* Year Dropdown */}
              <div>
                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Year</span>
                <Dropdown 
                  value={selectedYear}
                  onChange={setSelectedYear}
                  options={[
                    { value: 'ALL', label: 'All Years' },
                    ...YEARS.map(y => ({ value: y, label: y }))
                  ]}
                />
              </div>

              {/* Type Dropdown */}
              <div>
                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Transaction Type</span>
                <Dropdown 
                  value={selectedType}
                  onChange={setSelectedType}
                  options={TRANSACTION_TYPES.map(t => ({ value: t.id, label: t.label }))}
                />
              </div>

            </div>

            {/* Transaction Items List */}
            {pageLoading ? (
              <div className="space-y-3 py-8">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-16 bg-gray-100 animate-pulse rounded-xl"></div>
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-3">
                  <Filter size={24} />
                </div>
                <h3 className="text-sm font-bold text-gray-700">No transactions match your filter</h3>
                <p className="text-xs text-gray-400 mt-1">Try switching Month, Year, or Type to 'All'</p>
                <button 
                  onClick={() => { setSelectedMonth('ALL'); setSelectedYear('ALL'); setSelectedType('ALL'); setSearchQuery(''); }}
                  className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredTransactions.map((tx: any) => {
                  const isCredit = tx.type === 'CREDIT';
                  const isDebit = tx.type === 'DEBIT';
                  const desc = (tx.description || '').toLowerCase();
                  const isRefund = desc.includes('refund') || desc.includes('reversal');

                  return (
                    <div 
                      key={tx._id}
                      onClick={() => setSelectedTransaction(tx)}
                      className="p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-sm bg-white cursor-pointer transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Status Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isRefund 
                            ? 'bg-blue-50 text-blue-600'
                            : isCredit 
                              ? 'bg-emerald-50 text-emerald-600' 
                              : 'bg-rose-50 text-rose-600'
                        }`}>
                          {isRefund ? (
                            <RotateCcw size={18} />
                          ) : isCredit ? (
                            <ArrowUpRight size={18} />
                          ) : (
                            <ArrowDownLeft size={18} />
                          )}
                        </div>

                        {/* Details */}
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {tx.description || (isCredit ? 'Credit Received' : 'Account Deduction')}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-400 font-medium">
                              {tx.date ? format(new Date(tx.date), 'dd MMM yyyy • hh:mm a') : 'Recent'}
                            </span>
                            {tx.pnr && (
                              <span className="text-[9px] font-mono font-bold bg-gray-100 text-gray-700 px-1.5 py-0.2 rounded border border-gray-200">
                                PNR: {tx.pnr}
                              </span>
                            )}
                            {tx.paymentMethod && (
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                                {tx.paymentMethod}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right shrink-0">
                        <div className={`text-sm sm:text-base font-black ${
                          isCredit ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isCredit ? '+' : '-'}₹{Math.abs(tx.amount || 0).toLocaleString('en-IN')}
                        </div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-end gap-1">
                          View details <ChevronRight size={10} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Transaction Inspection Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-[#0b1031]/80 z-[120] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-fade-in-up border border-gray-100">
            <button 
              onClick={() => setSelectedTransaction(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                selectedTransaction.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {selectedTransaction.type === 'CREDIT' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  {selectedTransaction.type === 'CREDIT' ? 'Credit Inflow' : 'Account Deduction'}
                </span>
                <div className={`text-2xl font-black ${
                  selectedTransaction.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {selectedTransaction.type === 'CREDIT' ? '+' : '-'}₹{Math.abs(selectedTransaction.amount || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-xl text-xs mb-6 border border-gray-100">
              <div className="flex justify-between items-start gap-2">
                <span className="text-gray-500 font-medium">Description:</span>
                <span className="font-bold text-gray-900 text-right">{selectedTransaction.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Date & Time:</span>
                <span className="font-bold text-gray-800">
                  {selectedTransaction.date ? format(new Date(selectedTransaction.date), 'dd MMMM yyyy, hh:mm:ss a') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Payment Channel:</span>
                <span className="font-bold text-gray-800 uppercase">{selectedTransaction.paymentMethod || 'WALLET'}</span>
              </div>
              {selectedTransaction.pnr && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Flight PNR:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-blue-600">
                    <span>{selectedTransaction.pnr}</span>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(selectedTransaction.pnr); toast.success('PNR copied'); }}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
              )}
              {selectedTransaction.referenceNo && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Reference No:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-gray-700">
                    <span>{selectedTransaction.referenceNo}</span>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(selectedTransaction.referenceNo); toast.success('Reference copied'); }}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Transaction ID:</span>
                <span className="font-mono text-[10px] text-gray-400">{selectedTransaction._id}</span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedTransaction(null)}
              className="w-full bg-[#0b1031] hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
