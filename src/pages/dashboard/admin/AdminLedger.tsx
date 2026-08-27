import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../../services/api';
import DOBCalendar from '../../../components/ui/DOBCalendar';
import Dropdown from '../../../components/ui/Dropdown';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { RefreshCw, X } from 'lucide-react';
import RefreshButton from '../../../components/ui/RefreshButton';

const ALL_COLUMNS = [
  'Agency Name', 'Reference No.', 'Booking ID', 'Airline PNR', 'Product Name', 'Description', 'Passenger Name', 'Mobile Number',
  'Date Time', 'Gross Amount', 'Markup', 'Commission', 'TDS', 'SGST', 'CGST',
  'IGST', 'Penalty', 'Credit', 'Net Amount Debited', 'Promo Amount', 'Amount', 'User Remarks',
  'Balance'
];

const DEFAULT_SELECTED = [
  'Agency Name', 'Reference No.', 'Booking ID', 'Airline PNR', 'Product Name', 'Description',
  'Date Time', 'Gross Amount', 'Markup', 'Commission', 'TDS', 'SGST', 'CGST',
  'IGST', 'Penalty', 'Credit', 'Amount', 'Balance'
];

export default function AdminLedger() {
  const location = useLocation();
  const [statementType, setStatementType] = useState('Date Range Statement');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(DEFAULT_SELECTED);
  const [search, setSearch] = useState('');
  
  const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [month, setMonth] = useState(format(new Date(), 'MMMM'));
  const [year, setYear] = useState(format(new Date(), 'yyyy'));

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUserBalance, setSelectedUserBalance] = useState<number>(0);

  // Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/api/admin/users?limit=1000');
        const userList = Array.isArray(data) ? data : data.data || [];
        setUsers(userList);
        
        if (location.state && location.state.userId) {
          setSelectedUserId(location.state.userId);
        } else {
          setSelectedUserId('ALL');
        }
        setSelectedUserBalance(0);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchData();
      
      if (selectedUserId === 'ALL') {
        setSelectedUserBalance(0);
        setSelectedColumns(prev => prev.includes('Agency Name') ? prev : ['Agency Name', ...prev]);
      } else {
        const user = users.find(u => u._id === selectedUserId);
        if(user) {
           setSelectedUserBalance(user.walletBalance || user.balance || 0);
        }
      }
    }
  }, [page, limit, selectedUserId, statementType]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (selectedUserId) {
        
        setPage(1);
        fetchData(search);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const fetchData = async (overrideSearch?: string) => {
    if (!selectedUserId) return;
    try {
      setLoading(true);
      const querySearch = overrideSearch !== undefined ? overrideSearch : search;
      let url = `/api/account-statement?page=${page}&limit=${limit}&search=${querySearch}&userId=${selectedUserId}`;
      
      if (statementType === 'Date Range Statement') {
        url += `&fromDate=${fromDate}&toDate=${toDate}`;
      } else if (statementType === 'Month Wise Statement') {
        url += `&month=${month}&year=${year}`;
      } else if (statementType === 'Mini Statement') {
        url += `&type=mini`;
      }

      const res = await api.get(url);
      setData(res.data.data);
      setTotalRecords(res.data.totalRecords);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error fetching statement:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleColumn = (col: string) => {
    if (col === 'ALL') {
      setSelectedColumns(selectedColumns.length === ALL_COLUMNS.length ? [] : [...ALL_COLUMNS]);
      return;
    }
    
    if (selectedColumns.includes(col)) {
      setSelectedColumns(selectedColumns.filter(c => c !== col));
    } else {
      setSelectedColumns([...selectedColumns, col]);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">Global Ledger</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">View account statements for any user, agent, or supplier.</p>
        </div>
        
        {/* User Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-bold text-gray-700">Select User:</span>
          <div className="w-[300px]">
            <Dropdown
              value={selectedUserId}
              onChange={(val) => {
                setSelectedUserId(val);
                setPage(1);
              }}
              searchable={true}
              options={[
                { value: 'ALL', label: 'ALL USERS (Global Ledger)' },
                ...users.map(u => ({
                  value: u._id,
                  label: `${u.companyName ? u.companyName + ' - ' : ''}${u.name} (${u.role}) - ${u.email}`
                }))
              ]}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Header Bar */}
        <div className="bg-white pb-5 border-b border-gray-100 mb-6 flex items-center justify-between">
          <h2 className="text-[14px] font-black uppercase tracking-wide text-gray-900">ACCOUNT STATEMENT</h2>
          <div className="flex items-center gap-4">
            {selectedUserId !== 'ALL' && (
              <div className="text-[12px] font-bold text-gray-500">
                Available Balance = <span className="text-blue-600 font-black">₹ {selectedUserBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <RefreshButton onClick={() => fetchData()} loading={loading} count={totalRecords} />
          </div>
        </div>

        {/* Dynamic Settings Container */}
        <div className="mb-6 border border-gray-100 rounded-xl">
          {/* Statement Types Row */}
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
            <div className="flex items-center gap-8">
              {['Mini Statement', 'Month Wise Statement', 'Date Range Statement'].map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 hover:text-blue-600 transition-colors">
                  <div className={`w-[16px] h-[16px] rounded-full border-[2px] flex items-center justify-center ${statementType === type ? 'border-blue-600' : 'border-gray-300'}`}>
                    {statementType === type && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                  </div>
                  <input 
                    type="radio" 
                    name="stmtType" 
                    className="hidden"
                    checked={statementType === type}
                    onChange={() => {
                      setStatementType(type);
                      setPage(1);
                    }}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          {/* Dynamic Inputs Row */}
          <div className="px-6 py-5 bg-white flex flex-wrap items-end gap-6">
            {statementType === 'Date Range Statement' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wide text-gray-600">From Date</span>
                  <div className="w-[180px] h-[38px] border border-gray-200 rounded-lg relative z-10 bg-gray-50 flex items-center px-3">
                    <div className="absolute inset-0 [&>div]:h-full [&>div>div:first-child]:h-full [&>div>div:first-child]:border-none [&>div>div:first-child]:bg-transparent">
                      <DOBCalendar value={fromDate} onChange={setFromDate} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wide text-gray-600">To Date</span>
                  <div className="w-[180px] h-[38px] border border-gray-200 rounded-lg relative z-10 bg-gray-50 flex items-center px-3">
                    <div className="absolute inset-0 [&>div]:h-full [&>div>div:first-child]:h-full [&>div>div:first-child]:border-none [&>div>div:first-child]:bg-transparent">
                      <DOBCalendar value={toDate} onChange={setToDate} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {statementType === 'Month Wise Statement' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wide text-gray-600">Month</span>
                  <div className="w-[160px] h-[38px]">
                    <Dropdown 
                      value={month} 
                      onChange={(val) => { setMonth(val); setPage(1); }}
                      options={['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => ({ label: m, value: m }))}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wide text-gray-600">Year</span>
                  <div className="w-[140px] h-[38px]">
                    <Dropdown 
                      value={year} 
                      onChange={(val) => { setYear(val); setPage(1); }}
                      options={[ '2026', '2027'].map(y => ({ label: y, value: y }))}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center gap-3">
              <button 
                onClick={() => fetchData()}
                className="bg-blue-600 text-white px-6 h-[38px] rounded-lg text-xs font-bold hover:bg-blue-700 transition shadow-sm"
              >
                Get Statement
              </button>
              <button 
                onClick={() => fetchData()}
                className="bg-gray-100 text-gray-700 w-[38px] h-[38px] flex items-center justify-center rounded-lg hover:bg-gray-200 transition shadow-sm border border-gray-200"
                title="Refresh Data"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin text-blue-600' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Columns Selector */}
        <div className="mb-6 p-5 border border-gray-100 rounded-xl bg-gray-50/50">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-y-4 gap-x-3">
            {ALL_COLUMNS.map(col => (
              <label key={col} className="flex items-center gap-2 cursor-pointer text-[11px] font-semibold text-gray-600 hover:text-blue-600 transition group">
                <input 
                  type="checkbox" 
                  checked={selectedColumns.includes(col)}
                  onChange={() => toggleColumn(col)}
                  className="w-[13px] h-[13px] rounded-sm text-blue-600 focus:ring-blue-600 border-gray-300 cursor-pointer"
                />
                <span className="truncate">{col}</span>
              </label>
            ))}
            <label className="flex items-center gap-2 cursor-pointer text-[11px] font-bold text-gray-800 hover:text-blue-600 transition">
              <input 
                type="checkbox" 
                checked={selectedColumns.length === ALL_COLUMNS.length}
                onChange={() => toggleColumn('ALL')}
                className="w-[13px] h-[13px] rounded-sm text-blue-600 focus:ring-blue-600 border-gray-300 cursor-pointer"
              />
              <span className="truncate">ALL</span>
            </label>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 w-full md:w-[350px] mb-4 relative">
          <input 
            type="text" 
            placeholder="Search Reference No, Booking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 pr-10 h-[38px] text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition bg-gray-50 focus:bg-white"
          />
          {search && (
            <button 
              onClick={() => { setSearch(''); setPage(1); }}
              className="absolute right-3 text-gray-400 hover:text-gray-600 transition"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Data Table */}
        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-700 font-bold uppercase border-b border-gray-100 text-[12px]">
                <tr>
                  <th className="px-5 py-4 tracking-wider">S.NO</th>
                  {ALL_COLUMNS.filter(c => selectedColumns.includes(c)).map(col => (
                    <th key={col} className="px-5 py-4 tracking-wider">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={selectedColumns.length + 1} className="px-5 py-12 text-center text-gray-400">Loading data...</td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={selectedColumns.length + 1} className="px-5 py-12 text-center text-gray-500">No Records Found for this User.</td>
                  </tr>
                ) : (
                  data.map((row, index) => {
                    const formatVal = (val: any) => {
                      if (val instanceof Date || (typeof val === 'string' && val.includes('T') && val.includes('Z'))) {
                        return new Date(val).toLocaleString('en-IN');
                      }
                      if (typeof val === 'number') {
                        return val.toFixed(2);
                      }
                      return val;
                    };

                    const sNo = (page - 1) * limit + index + 1;

                    return (
                      <tr key={row.sNo} className="hover:bg-blue-50/30 transition">
                        <td className="px-5 py-3 font-semibold">{sNo}</td>
                        {ALL_COLUMNS.filter(c => selectedColumns.includes(c)).map(col => {
                          const keyMap: Record<string, keyof typeof row> = {
                            'Agency Name': 'userName', 
                            'Reference No.': 'referenceNo',
                            'Booking ID': 'bookingId',
                            'Airline PNR': 'airlinePnr',
                            'Product Name': 'productName',
                            'Description': 'description',
                            'Passenger Name': 'passengerName',
                            'Mobile Number': 'mobileNumber',
                            'Date Time': 'dateTime',
                            'Gross Amount': 'grossAmount',
                            'Markup': 'markup',
                            'Commission': 'commission',
                            'TDS': 'tds',
                            'SGST': 'sgst',
                            'CGST': 'cgst',
                            'IGST': 'igst',
                            'Penalty': 'penalty',
                            'Credit': 'credit',
                            'Net Amount Debited': 'netAmountDebited',
                            'Promo Amount': 'promoAmount',
                            'Amount': 'amount',
                            'User Remarks': 'userRemarks',
                            'Balance': 'balance'
                          };
                          
                          const key = keyMap[col];
                          const val = row[key];
                          
                          return (
                            <td key={col} className={`px-5 py-3 ${col === 'Reference No.' ? 'text-blue-600 font-bold' : ''} ${col === 'Credit' && val > 0 ? 'text-green-600 font-bold' : ''} ${col === 'Net Amount Debited' && val > 0 ? 'text-red-600 font-bold' : ''}`}>
                              {formatVal(val)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {data.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="text-xs font-semibold text-gray-500">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalRecords)} of <span className="text-gray-900 font-bold">{totalRecords}</span> entries
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, idx) => {
                    const p = idx + 1;
                    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${page === p ? 'bg-blue-600 text-white' : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'}`}
                        >
                          {p}
                        </button>
                      );
                    }
                    if (p === page - 2 || p === page + 2) {
                      return <span key={p} className="text-gray-400 text-xs">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
