import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import api from '../../services/api';
import DOBCalendar from '../../components/ui/DOBCalendar';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const ALL_COLUMNS = [
  'User Name', 'Reference No.', 'PNR', 'Product Name', 'Description', 'Passenger Name', 'Mobile Number',
  'Date Time', 'Gross Amount', 'Markup', 'Commission', 'TDS', 'SGST', 'CGST',
  'IGST', 'Penalty', 'Credit', 'Net Amount Debited', 'Promo Amount', 'Amount', 'User Remarks',
  'Balance'
];

// Default selected columns matching the screenshot
const DEFAULT_SELECTED = [
  'Reference No.', 'PNR', 'Product Name', 'Description', 'Passenger Name',
  'Date Time', 'Gross Amount', 'Markup', 'Commission', 'TDS', 'SGST', 'CGST',
  'IGST', 'Penalty', 'Credit', 'Amount', 'Balance'
];

const B2BAccountStatement: React.FC = () => {
  const loggedInUser = useSelector((state: RootState) => state.auth.user);
  const agentBalance = loggedInUser?.walletBalance ?? loggedInUser?.balance ?? 0;
  
  const [statementType, setStatementType] = useState('Date Range Statement');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(DEFAULT_SELECTED);
  const [search, setSearch] = useState('');
  
  const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [month, setMonth] = useState('July');
  const [year, setYear] = useState('2026');

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const fetchData = async (overrideSearch?: string) => {
    try {
      setLoading(true);
      const querySearch = overrideSearch !== undefined ? overrideSearch : search;
      let url = `/api/account-statement?page=${page}&limit=${limit}&search=${querySearch}`;
      
      if (statementType === 'Date Range Statement') {
        url += `&fromDate=${fromDate}&toDate=${toDate}`;
      } else if (statementType === 'Month Wise Statement') {
        // Just for example, though backend might handle month differently
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

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchData();
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
    <div className="flex-1 w-full bg-[#f8f9fc] p-6 text-[#0c1a40] min-h-screen">
      <div className="max-w-[1500px] mx-auto flex flex-col gap-6">
        
        {/* Header Bar */}
        <div className="bg-white px-8 py-5 rounded-t-xl rounded-b-md shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center justify-between">
          <h2 className="text-[13px] font-black uppercase tracking-wide text-[#0c1a40]">ACCOUNT STATEMENT</h2>
          <div className="text-[11px] font-bold text-gray-500">
            Available Balance = <span className="text-[#0c1a40] font-black">{agentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Dynamic Settings Container */}
        <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
          
          {/* Statement Types Row */}
          <div className="px-8 py-5 border-b border-gray-50">
            <div className="flex items-center gap-10">
              {['Mini Statement', 'Month Wise Statement', 'Date Range Statement'].map(type => (
                <label key={type} className="flex items-center gap-3 cursor-pointer text-xs font-bold text-[#0c1a40]">
                  <div className={`w-[18px] h-[18px] rounded-full border-[2px] flex items-center justify-center ${statementType === type ? 'border-[#0c1a40]' : 'border-gray-300'}`}>
                    {statementType === type && <div className="w-2 h-2 rounded-full bg-[#0c1a40]" />}
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
          <div className="px-8 py-6 bg-white min-h-[110px] flex items-end gap-6">
            {statementType === 'Date Range Statement' && (
              <>
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-black tracking-wide text-[#0c1a40]">From Date</span>
                  <div className="w-[200px] h-[42px] border border-gray-200 rounded-lg relative bg-white flex items-center px-4">
                    <div className="absolute inset-0 [&>div]:h-full [&>div>div]:h-full [&>div>div]:border-none [&>div>div]:bg-transparent">
                      <DOBCalendar value={fromDate} onChange={setFromDate} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-black tracking-wide text-[#0c1a40]">To Date</span>
                  <div className="w-[200px] h-[42px] border border-gray-200 rounded-lg relative bg-white flex items-center px-4">
                    <div className="absolute inset-0 [&>div]:h-full [&>div>div]:h-full [&>div>div]:border-none [&>div>div]:bg-transparent">
                      <DOBCalendar value={toDate} onChange={setToDate} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {statementType === 'Month Wise Statement' && (
              <>
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-black tracking-wide text-[#0c1a40]">Month</span>
                  <select 
                    className="w-[180px] h-[42px] border border-gray-200 rounded-lg px-3 text-xs font-bold text-[#0c1a40] outline-none"
                    value={month} onChange={(e) => setMonth(e.target.value)}
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-black tracking-wide text-[#0c1a40]">Year</span>
                  <select 
                    className="w-[160px] h-[42px] border border-gray-200 rounded-lg px-3 text-xs font-bold text-[#0c1a40] outline-none"
                    value={year} onChange={(e) => setYear(e.target.value)}
                  >
                    {['2024', '2025', '2026', '2027'].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <button 
              onClick={() => fetchData()}
              className="bg-[#0b1031] text-white px-8 h-[42px] rounded-full text-xs font-bold hover:bg-blue-900 transition shadow-md"
            >
              Get Statement
            </button>
          </div>
        </div>

        {/* Columns Selector */}
        <div className="bg-white px-8 py-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-y-6 gap-x-4">
            {ALL_COLUMNS.map(col => (
              <label key={col} className="flex items-center gap-3 cursor-pointer text-[11px] font-bold text-[#0c1a40] hover:text-blue-600 transition group">
                <input 
                  type="checkbox" 
                  checked={selectedColumns.includes(col)}
                  onChange={() => toggleColumn(col)}
                  className="w-[14px] h-[14px] rounded-sm text-[#0b1031] focus:ring-[#0b1031] border-gray-300 cursor-pointer"
                />
                <span className="truncate">{col}</span>
              </label>
            ))}
            <label className="flex items-center gap-3 cursor-pointer text-[11px] font-bold text-[#0c1a40] hover:text-blue-600 transition">
              <input 
                type="checkbox" 
                checked={selectedColumns.length === ALL_COLUMNS.length}
                onChange={() => toggleColumn('ALL')}
                className="w-[14px] h-[14px] rounded-sm text-[#0b1031] focus:ring-[#0b1031] border-gray-300 cursor-pointer"
              />
              <span className="truncate">ALL</span>
            </label>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 w-full md:w-[450px]">
          <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap">Search By</span>
          <input 
            type="text" 
            placeholder="Type to filter rows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchSubmit}
            className="w-full px-4 h-[38px] text-[11px] font-semibold border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 transition"
          />
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden flex flex-col mb-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px] whitespace-nowrap">
              <thead className="bg-[#0b1031] text-white font-semibold uppercase">
                <tr>
                  <th className="px-5 py-3.5 tracking-wider">S.NO</th>
                  {ALL_COLUMNS.filter(c => selectedColumns.includes(c)).map(col => (
                    <th key={col} className="px-5 py-3.5 tracking-wider">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[#0c1a40] font-semibold">
                {loading ? (
                  <tr>
                    <td colSpan={selectedColumns.length + 1} className="px-5 py-10 text-center text-gray-400">Loading data...</td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={selectedColumns.length + 1} className="px-5 py-12 text-center text-gray-500 font-medium">No Records Found.</td>
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
                      <tr key={row.sNo} className="hover:bg-blue-50/50 transition">
                        <td className="px-5 py-3">{sNo}</td>
                        {ALL_COLUMNS.filter(c => selectedColumns.includes(c)).map(col => {
                          const keyMap: Record<string, keyof typeof row> = {
                            'User Name': 'passengerName', 
                            'Reference No.': 'referenceNo',
                            'PNR': 'pnr',
                            'Product Name': 'productName',
                            'Description': 'description',
                            'Passenger Name': 'passengerName',
                            'Mobile Number': 'userRemarks', 
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
                            <td key={col} className={`px-5 py-3 ${col === 'Reference No.' ? 'text-blue-600 font-bold' : ''}`}>
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
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-[#f8fafc]">
              <div className="text-xs font-semibold text-gray-500">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalRecords)} of <span className="text-[#0b1031] font-bold">{totalRecords}</span> entries
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${page === p ? 'bg-[#0b1031] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
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
                  className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
};

export default B2BAccountStatement;
