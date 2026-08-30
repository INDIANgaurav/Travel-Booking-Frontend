import React, { useState, useEffect } from 'react';
import ReportHeader from '../../../../components/ui/ReportHeader';
import ReportTable from '../../../../components/ui/ReportTable';
import DateRangeFilter from '../../../../components/ui/DateRangeFilter';
import Dropdown from '../../../../components/ui/Dropdown';
import { reportsApi } from '../../../../api/reportsApi';
import { exportToCSV } from '../../../../utils/exportToCSV';
import toast from 'react-hot-toast';

export default function AdminCreditNoteReport() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState('10');

  const headers = [
    'Txn Date', 'Txn Id', 'Reference Id', 'PNR', 'Txn Type', 
    'Credit By', 'Credit To', 'Credit Amount', 'Remarks', 'Company Name', 'Action'
  ];

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await reportsApi.getCreditNotes({
        fromDate,
        toDate,
        limit: records
      });
      if (res.success) {
        setData(res.data);
      }
    } catch (error: any) {
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate, records]);

  const handleDownload = () => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }
    exportToCSV(data, 'Credit_Notes_Report');
    toast.success('Report exported successfully');
  };

  const renderRow = (row: any) => (
    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4">{row.date}</td>
      <td className="px-6 py-4 text-indigo-600 font-bold">{row.txid}</td>
      <td className="px-6 py-4">{row.refId}</td>
      <td className="px-6 py-4 font-mono">{row.pnr}</td>
      <td className="px-6 py-4">{row.type}</td>
      <td className="px-6 py-4">{row.creditBy}</td>
      <td className="px-6 py-4">{row.creditTo}</td>
      <td className="px-6 py-4 font-bold text-emerald-600">₹ {row.amount}</td>
      <td className="px-6 py-4">{row.remarks}</td>
      <td className="px-6 py-4">{row.company}</td>
      <td className="px-6 py-4">
        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-bold">View</button>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full overflow-hidden pb-20">
      <ReportHeader 
        title="Credit Note Report" 
        description="Track all credit transactions and refunds across agencies"
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
          />
        </div>
        <div className="flex items-center gap-2 w-full xl:w-48 bg-white p-4 rounded-2xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100/60">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex-shrink-0">Records</label>
          <Dropdown 
            value={records}
            onChange={setRecords}
            options={[
              { value: '10', label: '10' },
              { value: '25', label: '25' }
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
          emptyMessage="No credit notes found for this period"
        />
      )}
    </div>
  );
}
