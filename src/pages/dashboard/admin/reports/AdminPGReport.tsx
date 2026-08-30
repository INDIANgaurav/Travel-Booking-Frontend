import React, { useState } from 'react';
import { Search, Download, Filter } from 'lucide-react';
import { reportsApi } from '../../../../api/reportsApi';
import ReportHeader from '../../../../components/ui/ReportHeader';
import ReportTable from '../../../../components/ui/ReportTable';
import DateRangeFilter from '../../../../components/ui/DateRangeFilter';
import Dropdown from '../../../../components/ui/Dropdown';

export default function AdminPGReport() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('ALL');
  const [records, setRecords] = useState('10');

  const headers = [
    'Sr No', 'Txid', 'PNR', 'TxDate', 'AgentId', 'PG Name', 
    'AgencyDetails', 'Amount', 'TrackingId', 'Bank Refno', 
    'Payment Mode', 'Card Name', 'Currency', 'Status', 
    'Failure Message', 'PG Type'
  ];

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await reportsApi.getPgReports({ fromDate, toDate, searchBy: searchType, searchQuery });
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [fromDate, toDate, searchType, searchQuery]);

  const handleDownload = () => {
    if (!data || data.length === 0) {
      // toast might not be imported, let's see if we should just alert or use toast.
      // better yet, just return
      return;
    }
    // data is mapped exactly to the export CSV
    import('../../../../utils/exportToCSV').then(({ exportToCSV }) => {
      exportToCSV(data, 'PG_Report');
    });
  };

  const renderRow = (row: any) => (
    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4">{row.srNo}</td>
      <td className="px-6 py-4 text-indigo-600 font-bold">{row.txid}</td>
      <td className="px-6 py-4 font-mono">{row.pnr}</td>
      <td className="px-6 py-4">{row.txDate}</td>
      <td className="px-6 py-4">{row.agentId}</td>
      <td className="px-6 py-4 font-bold text-slate-700">{row.pgName}</td>
      <td className="px-6 py-4">{row.agencyDetails}</td>
      <td className="px-6 py-4 font-bold">₹ {row.amount}</td>
      <td className="px-6 py-4">{row.trackingId}</td>
      <td className="px-6 py-4">{row.bankRefNo}</td>
      <td className="px-6 py-4">{row.paymentMode}</td>
      <td className="px-6 py-4">{row.cardName}</td>
      <td className="px-6 py-4">{row.currency}</td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {row.status}
        </span>
      </td>
      <td className="px-6 py-4 text-red-500">{row.failureMessage}</td>
      <td className="px-6 py-4">{row.pgType}</td>
    </tr>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full overflow-hidden pb-20">
      <ReportHeader 
        title="Payment Gateway Reports" 
        description="Monitor all PG transactions, successes, and failures"
        onDownload={handleDownload}
      />

      <div className="flex flex-col xl:flex-row xl:items-start gap-4">
        <div className="flex-1">
          <DateRangeFilter
            fromDate={fromDate}
            toDate={toDate}
            onFromChange={setFromDate}
            onToChange={setToDate}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedSearchType={searchType}
            onSearchTypeChange={setSearchType}
            searchOptions={[
              { value: 'ALL', label: '- Search By -' },
              { value: 'TXN', label: 'Transaction ID' },
              { value: 'AGENCY', label: 'Agency ID' }
            ]}
          />
        </div>
        <div className="flex items-center gap-2 w-full xl:w-48 bg-white p-4 rounded-2xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100/60">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex-shrink-0">Records</label>
          <Dropdown 
            value={records}
            onChange={setRecords}
            options={[
              { value: '10', label: '10' },
              { value: '25', label: '25' },
              { value: '50', label: '50' }
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <ReportTable 
          headers={headers}
          data={data}
          renderRow={renderRow}
          emptyMessage="No PG transactions found for this period"
        />
      )}
    </div>
  );
}
