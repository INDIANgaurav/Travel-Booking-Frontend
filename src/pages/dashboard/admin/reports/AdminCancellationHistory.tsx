import React, { useState, useEffect } from 'react';
import ReportHeader from '../../../../components/ui/ReportHeader';
import ReportTable from '../../../../components/ui/ReportTable';
import DateRangeFilter from '../../../../components/ui/DateRangeFilter';
import { reportsApi } from '../../../../api/reportsApi';
import { exportToCSV } from '../../../../utils/exportToCSV';
import toast from 'react-hot-toast';

export default function AdminCancellationHistory() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('ALL');

  const headers = [
    'TxId', 'Action', 'TxDate', 'Agency', 'Passenger Name', 'Sector', 
    'JDate', 'TotalAmt', 'Refund Amount', 'Journey', 'Refund Status', 
    'Booking Status', 'CanceledOn', 'TXN By', 'ADMR', 'AGR', 'Supplier'
  ];

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await reportsApi.getCancellations({
        fromDate,
        toDate,
        searchBy: searchType,
        searchQuery
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
  }, [fromDate, toDate, searchType, searchQuery]);

  const handleDownload = () => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }
    exportToCSV(data, 'Flight_Cancellations');
    toast.success('Report exported successfully');
  };

  const renderRow = (row: any) => (
    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4">{row.txid}</td>
      <td className="px-6 py-4">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
          Select
        </button>
      </td>
      <td className="px-6 py-4">{row.txdate}</td>
      <td className="px-6 py-4">{row.agency}</td>
      <td className="px-6 py-4">{row.pax}</td>
      <td className="px-6 py-4">{row.sector}</td>
      <td className="px-6 py-4">{row.jdate}</td>
      <td className="px-6 py-4 font-bold">{row.totalAmt}</td>
      <td className="px-6 py-4 font-bold text-emerald-600">{row.refundAmt}</td>
      <td className="px-6 py-4">{row.journey}</td>
      <td className="px-6 py-4">{row.refundStatus}</td>
      <td className="px-6 py-4">{row.bookingStatus}</td>
      <td className="px-6 py-4">{row.canceledOn}</td>
      <td className="px-6 py-4">{row.txnBy}</td>
      <td className="px-6 py-4">{row.admr}</td>
      <td className="px-6 py-4">{row.agr}</td>
      <td className="px-6 py-4">{row.supplier}</td>
    </tr>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full overflow-hidden pb-20">
      <ReportHeader 
        title="Cancellation History" 
        description="Track all cancelled flight bookings and refund statuses"
        onDownload={handleDownload}
      />

      <div className="flex-1 mb-6">
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
            { value: 'PNR', label: 'PNR' }
          ]}
        />
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
          emptyMessage="No cancellations found for this period"
        />
      )}
    </div>
  );
}
