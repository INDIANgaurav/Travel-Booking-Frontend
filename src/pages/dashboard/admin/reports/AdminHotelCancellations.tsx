import React, { useState } from 'react';
import { Search, Download, Filter } from 'lucide-react';
import { reportsApi } from '../../../../api/reportsApi';
import ReportHeader from '../../../../components/ui/ReportHeader';
import ReportTable from '../../../../components/ui/ReportTable';
import DateRangeFilter from '../../../../components/ui/DateRangeFilter';
import Dropdown from '../../../../components/ui/Dropdown';

export default function AdminHotelCancellations() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('ALL');
  const [records, setRecords] = useState('10');

  const headers = [
    'TxId', 'Booking Date', 'Caxn Date', 'CheckIn Date', 'CheckOut Date', 
    'Hotel Name', 'State', 'TotalAmount', 'Refund Amount', 'RefundStatus', 
    'BookingStatus', 'Remarks', 'Hotel Code', 'Action'
  ];

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await reportsApi.getHotelCancellations({ fromDate, toDate, searchBy: searchType, searchQuery });
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
      return;
    }
    import('../../../../utils/exportToCSV').then(({ exportToCSV }) => {
      exportToCSV(data, 'Hotel_Cancellations_Report');
    });
  };

  const renderRow = (row: any) => (
    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4">{row.txid}</td>
      <td className="px-6 py-4">{row.bookingDate}</td>
      <td className="px-6 py-4">{row.caxnDate}</td>
      <td className="px-6 py-4">{row.checkIn}</td>
      <td className="px-6 py-4">{row.checkOut}</td>
      <td className="px-6 py-4">{row.hotelName}</td>
      <td className="px-6 py-4">{row.state}</td>
      <td className="px-6 py-4 font-bold">{row.totalAmt}</td>
      <td className="px-6 py-4 font-bold text-emerald-600">{row.refundAmt}</td>
      <td className="px-6 py-4">{row.refundStatus}</td>
      <td className="px-6 py-4">{row.bookingStatus}</td>
      <td className="px-6 py-4">{row.remarks}</td>
      <td className="px-6 py-4">{row.hotelCode}</td>
      <td className="px-6 py-4">
        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-bold">View</button>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full overflow-hidden pb-20">
      <ReportHeader 
        title="Hotel Cancellation Transactions" 
        description="Track all cancelled hotel bookings and refund statuses"
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
              { value: 'PNR', label: 'PNR' }
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
          emptyMessage="No hotel cancellations found for this period"
        />
      )}
    </div>
  );
}
