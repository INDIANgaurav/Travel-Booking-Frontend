import React, { useState, useEffect } from 'react';
import ReportHeader from '../../../../components/ui/ReportHeader';
import ReportTable from '../../../../components/ui/ReportTable';
import DateRangeFilter from '../../../../components/ui/DateRangeFilter';
import Dropdown from '../../../../components/ui/Dropdown';
import { reportsApi } from '../../../../api/reportsApi';
import { exportToCSV } from '../../../../utils/exportToCSV';
import toast from 'react-hot-toast';

export default function AdminFlightSalesReport() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('ALL');
  const [records, setRecords] = useState('10');

  const headers = [
    'Booking Status', 'Basefare', 'Tax', 'Comm', 'GST_Comm', 'TDS_Comm', 
    'MF', 'GST_MF', 'Yq', 'Tfee', 'Markup', 'Additional Markup', 
    'Invoice Total', 'PayMode', 'Channel', 'Journey Type', 'Ticket Number', 
    'Passenger Email', 'Txid', 'SF', 'Fare Type', 'Remarks'
  ];

  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await reportsApi.getFlightSales({
        fromDate,
        toDate,
        searchBy: searchType,
        searchQuery,
        limit: records
      });
      if (res.success) {
        setData(res.data);
        setTotal(res.total);
      }
    } catch (error: any) {
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate, searchType, searchQuery, records]);

  const handleDownload = () => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }
    exportToCSV(data, 'Flight_Sales_Report');
    toast.success('Report exported successfully');
  };

  const renderRow = (row: any) => (
    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4">
        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">{row.status}</span>
      </td>
      <td className="px-6 py-4">{row.basefare}</td>
      <td className="px-6 py-4">{row.tax}</td>
      <td className="px-6 py-4">{row.comm}</td>
      <td className="px-6 py-4">{row.gstComm}</td>
      <td className="px-6 py-4">{row.tdsComm}</td>
      <td className="px-6 py-4">{row.mf}</td>
      <td className="px-6 py-4">{row.gstMf}</td>
      <td className="px-6 py-4">{row.yq}</td>
      <td className="px-6 py-4">{row.tfee}</td>
      <td className="px-6 py-4">{row.markup}</td>
      <td className="px-6 py-4">{row.additionalMarkup}</td>
      <td className="px-6 py-4 text-indigo-700 font-bold">{row.invoiceTotal}</td>
      <td className="px-6 py-4">{row.paymode}</td>
      <td className="px-6 py-4">{row.channel}</td>
      <td className="px-6 py-4">{row.journeyType}</td>
      <td className="px-6 py-4">{row.ticket}</td>
      <td className="px-6 py-4">{row.email}</td>
      <td className="px-6 py-4 text-blue-600 font-bold">{row.txid}</td>
      <td className="px-6 py-4">{row.sf}</td>
      <td className="px-6 py-4">{row.fareType}</td>
      <td className="px-6 py-4">{row.remarks}</td>
    </tr>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full overflow-hidden pb-20">
      <ReportHeader 
        title="Flight Sales Report" 
        description="Comprehensive view of all flight booking sales, commissions, and taxes"
        onDownload={handleDownload}
        metrics={[
          { label: "Total Records", value: total },
          { label: "Total Amount", value: `₹ ${data.reduce((acc, curr) => acc + (curr.invoiceTotal || 0), 0)}` }
        ]}
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
              { value: 'PNR', label: 'PNR' },
              { value: 'TXID', label: 'Transaction ID' },
              { value: 'AGENCY', label: 'Agency Code' }
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
              { value: '50', label: '50' },
              { value: '100', label: '100' }
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
          emptyMessage="No flight sales found for this period"
        />
      )}
    </div>
  );
}
